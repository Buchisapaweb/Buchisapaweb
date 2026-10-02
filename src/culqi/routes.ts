import { Router, type Request, type Response } from 'express';
import { getPaymentSettings, savePaymentSettings, getActivePublicKey } from './config';
import { createCulqiToken, createCulqiCharge, createCulqiOrder } from './service';
import { optionalAuth, type AuthRequest } from '../middleware/auth';
import { createOrder, deductCartStock } from '../db/queries';

export interface CulqiRouterDependencies {
  broadcastNewOrder?: (order: any) => void;
  broadcastOrderStatusUpdate?: (order: any) => void;
}

export function createCulqiRouter(deps: CulqiRouterDependencies = {}): Router {
  const router = Router();

  // 1. GET /api/payments/culqi/config: Configuración de llave pública para el cliente web
  router.get('/api/payments/culqi/config', (_req: Request, res: Response) => {
    const settings = getPaymentSettings();
    const publicKey = getActivePublicKey();
    res.json({
      success: true,
      publicKey: publicKey,
      isTest: publicKey.startsWith('pk_test_') || !settings.liveMode
    });
  });

  // 2. GET /api/settings/payments: Obtener configuración en panel de administración
  router.get('/api/settings/payments', (_req: Request, res: Response) => {
    const settings = getPaymentSettings();
    const maskedSecret = settings.culqiSecretKey ? `sk_...${settings.culqiSecretKey.slice(-4)}` : '';
    res.json({
      success: true,
      settings: {
        culqiPublicKey: settings.culqiPublicKey || '',
        culqiSecretKeyMasked: maskedSecret,
        hasSecretKey: Boolean(settings.culqiSecretKey),
        liveMode: Boolean(settings.liveMode),
        updatedAt: settings.updatedAt
      }
    });
  });

  // 3. POST /api/settings/payments: Guardar credenciales de Culqi (Live / Test)
  router.post('/api/settings/payments', (req: Request, res: Response) => {
    try {
      const { culqiPublicKey, culqiSecretKey, liveMode } = req.body;
      const updated = savePaymentSettings({
        culqiPublicKey,
        culqiSecretKey,
        liveMode
      });

      res.json({
        success: true,
        message: 'Llaves de Culqi guardadas correctamente.',
        settings: {
          culqiPublicKey: updated.culqiPublicKey,
          hasSecretKey: Boolean(updated.culqiSecretKey),
          liveMode: updated.liveMode,
          updatedAt: updated.updatedAt
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 4. POST /api/payments/culqi/tokens: Endpoint de tokenización segura
  router.post('/api/payments/culqi/tokens', async (req: Request, res: Response) => {
    try {
      const { card_number, cvv, expiration_month, expiration_year, email } = req.body;

      if (!card_number || !cvv || !expiration_month || !expiration_year) {
        return res.status(400).json({
          success: false,
          error: 'Faltan datos de la tarjeta para tokenizar'
        });
      }

      const tokenResult = await createCulqiToken({
        card_number,
        cvv,
        expiration_month,
        expiration_year,
        email
      });

      if (!tokenResult.success) {
        return res.status(400).json({
          success: false,
          error: tokenResult.error || 'Error al tokenizar tarjeta'
        });
      }

      res.json({
        success: true,
        id: tokenResult.id,
        token: tokenResult.token
      });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // 4b. POST /api/payments/culqi/orders: Crear orden oficial en Culqi (/v2/orders)
  router.post('/api/payments/culqi/orders', async (req: Request, res: Response) => {
    try {
      const { amount, orderNumber, clientDetails, description } = req.body;
      if (!amount || !clientDetails) {
        return res.status(400).json({ success: false, error: 'Faltan parámetros requeridos para generar la orden en Culqi.' });
      }
      const result = await createCulqiOrder({
        amount: Number(amount),
        orderNumber: orderNumber || Date.now(),
        clientDetails,
        description
      });
      res.status(result.success ? 200 : 400).json(result);
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // 5. POST /api/payments/culqi/charge: Validar token, cobrar y registrar orden en base de datos
  router.post('/api/payments/culqi/charge', optionalAuth, async (req: AuthRequest, res: Response) => {
    try {
      const { token, email, amount, orderPayload } = req.body;

      if (!token || !amount || !orderPayload) {
        return res.status(400).json({
          success: false,
          error: 'Faltan parámetros requeridos para procesar el cargo con Culqi (token, amount, orderPayload)'
        });
      }

      // Validar token y cobrar contra la API de Culqi
      const chargeOutcome = await createCulqiCharge({
        token,
        email,
        amount: Number(amount),
        orderPayload
      });

      if (!chargeOutcome.success || !chargeOutcome.charge) {
        return res.status(400).json({
          success: false,
          error: chargeOutcome.error || 'El pago fue declinado por la pasarela Culqi.'
        });
      }

      const chargeId = chargeOutcome.charge.id || `chr_${Date.now()}`;

      // Deducir stock de platos en cocina
      let rawItems = orderPayload.items || [];
      if (typeof rawItems === 'string') {
        try { rawItems = JSON.parse(rawItems); } catch (e) { rawItems = []; }
      }
      if (Array.isArray(rawItems) && rawItems.length > 0) {
        const checkItems = rawItems.map((it: any) => ({
          id: it.id || (it.item && it.item.id),
          quantity: Number(it.quantity) || 1,
          name: it.name || (it.item && it.item.name)
        }));
        await deductCartStock(checkItems);
      }

      const paymentLabel = `Culqi Tarjeta Online (${chargeId})`;

      // Registrar pedido pagado en la base de datos
      const finalOrder = await createOrder({
        id: orderPayload.id || `ORD-${Date.now()}`,
        orderNumber: orderPayload.orderNumber || Math.floor(100 + Math.random() * 900),
        customerName: orderPayload.customerName || 'Cliente',
        customerPhone: orderPayload.customerPhone || '',
        customerEmail: orderPayload.customerEmail || req.user?.email || undefined,
        orderType: orderPayload.orderType || 'delivery',
        deliveryAddress: orderPayload.deliveryAddress || '',
        deliveryReference: orderPayload.deliveryReference || '',
        paymentMethod: paymentLabel,
        notes: (orderPayload.notes ? `${orderPayload.notes} | ` : '') + `Transacción Culqi: ${chargeId} (PAGADO)`,
        status: 'recibido',
        total: Number(amount) || Number(orderPayload.total) || 0,
        items: typeof orderPayload.items === 'string' ? orderPayload.items : JSON.stringify(orderPayload.items),
        userId: req.user?.uid || orderPayload.userId || undefined,
      });

      if (deps.broadcastNewOrder) deps.broadcastNewOrder(finalOrder);
      if (deps.broadcastOrderStatusUpdate) deps.broadcastOrderStatusUpdate(finalOrder);

      res.status(200).json({
        success: true,
        chargeId: chargeId,
        order: finalOrder,
        message: '¡Pago validado con éxito y pedido registrado en la base de datos!'
      });
    } catch (error: any) {
      console.error('Error procesando cargo Culqi:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error interno al procesar el pago con Culqi'
      });
    }
  });

  return router;
}

import express, { type Request, type Response } from 'express';
import path from 'path';
import fs from 'fs';
import { optionalAuth, requireAuth, type AuthRequest } from './src/middleware/auth.ts';

function getCompiledIndexHtml(): string {
  const partials: Record<string, string> = {
    'ENCABEZADO': 'public/html/encabezado.html',
    'MENU_MOVIL': 'public/html/menu-movil.html',
    'CARRUSEL_PORTADA': 'public/html/carrusel-portada.html',
    'PANEL_CARRITO': 'public/html/panel-carrito.html',
    'VENTANA_UBICACION': 'public/html/ventana-ubicacion.html',
    'VENTANA_CARTA_COMPLETA': 'public/html/ventana-carta-completa.html',
    'VENTANA_AUTENTICACION': 'public/html/ventana-autenticacion.html',
    'VENTANA_RASTREO_PEDIDO': 'public/html/ventana-rastreo-pedido.html',
    'PIE_PAGINA': 'public/html/pie-pagina.html'
  };

  let template = fs.readFileSync(path.join(process.cwd(), 'index.html'), 'utf8');
  for (const [key, filePath] of Object.entries(partials)) {
    const absPath = path.join(process.cwd(), filePath);
    if (fs.existsSync(absPath)) {
      const content = fs.readFileSync(absPath, 'utf8');
      template = template.replace(new RegExp(`<!-- PARTIAL: ${key} -->`, 'g'), content);
    }
  }
  return template;
}

function getCompiledAdminHtml(): string {
  const partials: Record<string, string> = {
    'SIDEBAR': 'admin/partials/sidebar.html',
    'TOPBAR': 'admin/partials/topbar.html',
    'VIEW_DASHBOARD': 'admin/views/dashboard.html',
    'VIEW_PRODUCTOS': 'admin/views/productos.html',
    'VIEW_PEDIDOS': 'admin/views/pedidos.html',
    'VIEW_VENTAS': 'admin/views/ventas.html',
    'VIEW_CAJA': 'admin/views/caja.html',
    'VIEW_TICKET': 'admin/views/ticket.html',
    'VIEW_PORTADA': 'admin/views/portada.html',
    'VIEW_INSUMOS': 'admin/views/insumos.html',
    'VIEW_UTENSILIOS': 'admin/views/utensilios.html',
    'VIEW_DELIVERY': 'admin/views/delivery.html',
    'VIEW_RECOJO': 'admin/views/recojo.html',
    'VIEW_UBICACION': 'admin/views/ubicacion.html',
    'VIEW_REPORTES': 'admin/views/reportes.html',
    'VIEW_CONFIGURACION': 'admin/views/configuracion.html',
    'MODALS': 'admin/partials/modals.html'
  };

  let template = fs.readFileSync(path.join(process.cwd(), 'admin/index.html'), 'utf8');
  for (const [key, filePath] of Object.entries(partials)) {
    const absPath = path.join(process.cwd(), filePath);
    if (fs.existsSync(absPath)) {
      const content = fs.readFileSync(absPath, 'utf8');
      template = template.replace(new RegExp(`<!-- PARTIAL: ${key} -->`, 'g'), content);
    }
  }
  return template;
}
import { sendVerificationEmail, verifyCode } from './src/services/emailVerification.ts';
import {
  getOrCreateUser,
  getUserByUid,
  registerCustomer,
  googleAuthCustomer,
  getAllUsers,
  getUserByEmail
} from './src/db/users.ts';
import {
  getCategories,
  getProducts,
  getProductById,
  getSauces,
  getPromotions,
  getOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  getClaims,
  createClaim,
  checkCartStock,
  deductCartStock,
  updateProductStock,
  createProduct,
  updateProduct,
  deleteProduct,
  getSupplies,
  updateSupplyStock,
  getUtensils,
  getCajaSummary,
  addCajaMovement,
  abrirCaja,
  cerrarCaja,
  getTickets,
  createQuickTicket,
  getPortadas,
  createPortada,
  updatePortada,
  deletePortada,
  reorderPortadas,
} from './src/db/queries.ts';

export const app = express();
const PORT = 3000;

app.use((req, res, next) => {
  res.setHeader('Permissions-Policy', 'geolocation=(self "*")');
  next();
});

  app.use(express.json());

  // --- SSE REAL-TIME PUSH NOTIFICATIONS EVENT BUS ---
  interface SSESubscriber {
    id: string;
    orderId?: string;
    res: Response;
  }
  const sseSubscribers = new Map<string, SSESubscriber>();

  function broadcastOrderStatusUpdate(order: any, previousStatus?: string) {
    const normalizedStatus = (order.status || '').toLowerCase();

    let title = 'Actualización de Pedido';
    let message = `El estado de tu pedido #${order.orderNumber || order.id} ha cambiado.`;
    let stage = normalizedStatus;

    if (normalizedStatus === 'en_preparacion' || normalizedStatus === 'preparando') {
      title = '🧑‍🍳 Cocina Buchisapa: En preparación';
      message = `La cocina ha comenzado a preparar tu pedido #${order.orderNumber || order.id}. ¡Pronto estará listo!`;
      stage = 'preparando';
    } else if (normalizedStatus === 'en_camino' || normalizedStatus === 'listo') {
      title = '🛵 ¡Tu pedido va en camino!';
      message = `El repartidor ya lleva tu pedido #${order.orderNumber || order.id}. Puedes ver su ubicación en vivo en el mapa.`;
      stage = 'en_camino';
    } else if (normalizedStatus === 'entregado' || normalizedStatus === 'completado') {
      title = '🍗 ¡Pedido entregado!';
      message = `Tu pedido #${order.orderNumber || order.id} fue entregado con éxito. ¡Buen provecho!`;
      stage = 'entregado';
    } else if (normalizedStatus === 'cancelado') {
      title = '⚠️ Pedido cancelado';
      message = `Tu pedido #${order.orderNumber || order.id} ha sido cancelado.`;
      stage = 'cancelado';
    }

    const payload = JSON.stringify({
      type: 'order_status_update',
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      status: normalizedStatus,
      stage,
      previousStatus,
      title,
      message,
      timestamp: new Date().toISOString(),
    });

    for (const [subId, subscriber] of sseSubscribers.entries()) {
      try {
        if (!subscriber.orderId || subscriber.orderId === order.id || subscriber.orderId === String(order.orderNumber)) {
          subscriber.res.write(`event: order_update\ndata: ${payload}\n\n`);
        }
      } catch (err) {
        sseSubscribers.delete(subId);
      }
    }
  }

  function broadcastProductStockUpdate(product: any) {
    const payload = JSON.stringify({
      type: 'stock_update',
      productId: product.id,
      name: product.name,
      available: product.available,
      stock: product.stock,
      timestamp: new Date().toISOString(),
    });

    for (const [subId, subscriber] of sseSubscribers.entries()) {
      try {
        subscriber.res.write(`event: stock_update\ndata: ${payload}\n\n`);
      } catch (err) {
        sseSubscribers.delete(subId);
      }
    }
  }

  function broadcastNewOrder(order: any) {
    const payload = JSON.stringify({
      type: 'new_order',
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        orderType: order.orderType,
        deliveryAddress: order.deliveryAddress,
        deliveryReference: order.deliveryReference,
        tableNumber: order.tableNumber,
        paymentMethod: order.paymentMethod,
        notes: order.notes,
        status: order.status || 'recibido',
        total: Number(order.total) || 0,
        items: order.items,
        created_at: order.createdAt || order.created_at || new Date().toISOString()
      },
      timestamp: new Date().toISOString(),
    });

    for (const [subId, subscriber] of sseSubscribers.entries()) {
      try {
        subscriber.res.write(`event: new_order\ndata: ${payload}\n\n`);
      } catch (err) {
        sseSubscribers.delete(subId);
      }
    }
  }

  // --- API ROUTES FIRST ---

  // Health check endpoint
  app.get('/api/health', async (req: Request, res: Response) => {
    try {
      const cats = await getCategories();
      res.json({
        status: 'ok',
        database: 'connected',
        dialect: 'postgresql',
        cloudSql: 'active',
        categoriesCount: cats.length,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error('Health check database connection notice:', error);
      res.json({
        status: 'ok',
        database: 'connecting',
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Get categories
  app.get('/api/categories', async (req: Request, res: Response) => {
    try {
      const categories = await getCategories();
      res.json({ success: true, data: categories });
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ success: false, error: error.message || 'Error fetching categories' });
    }
  });

  // Get products
  app.get('/api/products', async (req: Request, res: Response) => {
    try {
      const categoryId = req.query.category as string | undefined;
      const products = await getProducts(categoryId);
      res.json({ success: true, data: products });
    } catch (error: any) {
      console.error('Error fetching products:', error);
      res.status(500).json({ success: false, error: error.message || 'Error fetching products' });
    }
  });

  // Create product
  app.post('/api/products', async (req: Request, res: Response) => {
    try {
      const newProduct = await createProduct(req.body);
      broadcastProductStockUpdate(newProduct);
      res.status(201).json({ success: true, data: newProduct });
    } catch (error: any) {
      console.error('Error creating product:', error);
      res.status(500).json({ success: false, error: error.message || 'Error creating product' });
    }
  });

  // Update product
  app.put('/api/products/:id', async (req: Request, res: Response) => {
    try {
      const productId = req.params.id as string;
      const updated = await updateProduct(productId, req.body);
      if (!updated) {
        return res.status(404).json({ success: false, error: 'Producto no encontrado' });
      }
      broadcastProductStockUpdate(updated);
      res.json({ success: true, data: updated });
    } catch (error: any) {
      console.error('Error updating product:', error);
      res.status(500).json({ success: false, error: error.message || 'Error updating product' });
    }
  });

  // Delete product
  app.delete('/api/products/:id', async (req: Request, res: Response) => {
    try {
      const productId = req.params.id as string;
      const deleted = await deleteProduct(productId);
      if (deleted) {
        broadcastProductStockUpdate({ id: productId, deleted: true, available: false, stock: 0 });
      }
      res.json({ success: deleted });
    } catch (error: any) {
      console.error('Error deleting product:', error);
      res.status(500).json({ success: false, error: error.message || 'Error deleting product' });
    }
  });

  // Admin supplies (Insumos)
  app.get('/api/admin/supplies', async (_req: Request, res: Response) => {
    try {
      const supplies = await getSupplies();
      res.json({ success: true, data: supplies });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post('/api/admin/supplies/:id/stock', async (req: Request, res: Response) => {
    try {
      const supplyId = req.params.id as string;
      const newStock = Number(req.body.stock);
      const updated = await updateSupplyStock(supplyId, newStock);
      res.json({ success: true, data: updated });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Admin utensils (Utensilios)
  app.get('/api/admin/utensils', async (_req: Request, res: Response) => {
    try {
      const utensils = await getUtensils();
      res.json({ success: true, data: utensils });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Admin caja metrics
  app.get('/api/admin/caja', async (_req: Request, res: Response) => {
    try {
      const caja = await getCajaSummary();
      res.json({ success: true, data: caja });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Admin caja: Registrar movimiento (Ingreso / Egreso)
  app.post('/api/admin/caja/movimiento', async (req: Request, res: Response) => {
    try {
      const { tipo, categoria, monto, motivo, responsable, comprobante } = req.body;
      if (!tipo || !monto) {
        return res.status(400).json({ success: false, error: 'Tipo y monto son obligatorios' });
      }
      const mov = await addCajaMovement({ tipo, categoria, monto, motivo, responsable, comprobante });
      const caja = await getCajaSummary();
      res.json({ success: true, data: mov, caja });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Admin caja: Apertura de turno
  app.post('/api/admin/caja/apertura', async (req: Request, res: Response) => {
    try {
      const { montoInicial, responsable } = req.body;
      const caja = await abrirCaja({ montoInicial: Number(montoInicial) || 250, responsable });
      res.json({ success: true, data: caja });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Admin caja: Cierre de turno / Arqueo Z
  app.post('/api/admin/caja/cierre', async (req: Request, res: Response) => {
    try {
      const { efectivoReal, notas, responsable } = req.body;
      const result = await cerrarCaja({ efectivoReal: Number(efectivoReal), notas, responsable });
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Admin tickets: Listar tickets de venta / boletas
  app.get('/api/admin/tickets', async (_req: Request, res: Response) => {
    try {
      const tickets = await getTickets();
      res.json({ success: true, data: tickets });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Admin tickets: Emitir nuevo ticket rápido
  app.post('/api/admin/tickets', async (req: Request, res: Response) => {
    try {
      const ticket = await createQuickTicket(req.body);
      res.json({ success: true, data: ticket });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // ============================================================================
  // PORTADAS / HERO CAROUSEL BANNERS API
  // ============================================================================
  app.get('/api/portadas', async (req: Request, res: Response) => {
    try {
      const includeAll = req.query.all === 'true';
      const portadas = await getPortadas(includeAll);
      res.json({ success: true, data: portadas });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post('/api/admin/portadas', async (req: Request, res: Response) => {
    try {
      const portada = await createPortada(req.body);
      res.json({ success: true, data: portada });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.put('/api/admin/portadas/:id', async (req: Request, res: Response) => {
    try {
      const portadaId = req.params.id as string;
      const portada = await updatePortada(portadaId, req.body);
      if (!portada) {
        return res.status(404).json({ success: false, error: 'Portada no encontrada' });
      }
      res.json({ success: true, data: portada });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.delete('/api/admin/portadas/:id', async (req: Request, res: Response) => {
    try {
      const portadaId = req.params.id as string;
      const success = await deletePortada(portadaId);
      res.json({ success });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post('/api/admin/portadas/reorder', async (req: Request, res: Response) => {
    try {
      const { ids } = req.body;
      if (!Array.isArray(ids)) {
        return res.status(400).json({ success: false, error: 'Lista de IDs requerida' });
      }
      const portadas = await reorderPortadas(ids);
      res.json({ success: true, data: portadas });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get sauces
  app.get('/api/sauces', async (req: Request, res: Response) => {
    try {
      const sauces = await getSauces();
      res.json({ success: true, data: sauces });
    } catch (error: any) {
      console.error('Error fetching sauces:', error);
      res.status(500).json({ success: false, error: error.message || 'Error fetching sauces' });
    }
  });

  // Get promotions
  app.get('/api/promotions', async (req: Request, res: Response) => {
    try {
      const promotions = await getPromotions();
      res.json({ success: true, data: promotions });
    } catch (error: any) {
      console.error('Error fetching promotions:', error);
      res.status(500).json({ success: false, error: error.message || 'Error fetching promotions' });
    }
  });

  // Orders: Get all or by status and email
  app.get('/api/orders', async (req: Request, res: Response) => {
    try {
      const status = req.query.status as string | undefined;
      const email = (req.query.email || req.query.customer_email) as string | undefined;
      const orders = await getOrders(status, email);
      res.json({ success: true, data: orders });
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ success: false, error: error.message || 'Error fetching orders' });
    }
  });

  // Orders: Get orders for specific customer email
  app.get('/api/orders/customer/:email', async (req: Request, res: Response) => {
    try {
      const email = req.params.email as string;
      const orders = await getOrders(undefined, email);
      res.json({ success: true, data: orders });
    } catch (error: any) {
      console.error('Error fetching customer orders:', error);
      res.status(500).json({ success: false, error: error.message || 'Error fetching customer orders' });
    }
  });

  // Orders: Get single order by ID or orderNumber
  app.get('/api/orders/:id', async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      const order = await getOrderById(id);
      if (!order) {
        return res.status(404).json({ success: false, error: 'Pedido no encontrado' });
      }
      res.json({ success: true, data: order });
    } catch (error: any) {
      console.error('Error fetching order by id:', error);
      res.status(500).json({ success: false, error: error.message || 'Error fetching order' });
    }
  });

  // Orders: Create new order
  app.post('/api/orders', optionalAuth, async (req: AuthRequest, res: Response) => {
    try {
      const {
        id,
        orderNumber,
        customerName,
        customerPhone,
        customerEmail,
        orderType,
        deliveryAddress,
        deliveryReference,
        tableNumber,
        paymentMethod,
        notes,
        status,
        total,
        items,
      } = req.body;

      if (!customerName || !customerPhone || !items) {
        return res.status(400).json({ success: false, error: 'Faltan campos requeridos en el pedido' });
      }

      // Verificación estricta de stock en tiempo real antes de registrar el pedido
      let rawItems = items;
      if (typeof rawItems === 'string') {
        try { rawItems = JSON.parse(rawItems); } catch (e) { rawItems = []; }
      }
      if (Array.isArray(rawItems) && rawItems.length > 0) {
        const checkItems = rawItems.map((it: any) => ({
          id: it.id || (it.item && it.item.id),
          quantity: Number(it.quantity) || 1,
          name: it.name || (it.item && it.item.name)
        }));

        const stockResult = await checkCartStock(checkItems);
        if (!stockResult.valid) {
          return res.status(409).json({
            success: false,
            error: 'stock_unavailable',
            message: stockResult.message,
            outOfStockItems: stockResult.outOfStockItems
          });
        }

        // Deducir el stock real en cocina
        await deductCartStock(checkItems);
      }

      const order = await createOrder({
        id: id || `ORD-${Date.now()}`,
        orderNumber: orderNumber || Math.floor(100 + Math.random() * 900),
        customerName,
        customerPhone,
        customerEmail: customerEmail || req.user?.email || undefined,
        orderType: orderType || 'delivery',
        deliveryAddress,
        deliveryReference,
        tableNumber,
        paymentMethod: paymentMethod || 'Yape',
        notes,
        status: status || 'recibido',
        total: Number(total) || 0,
        items: typeof items === 'string' ? items : JSON.stringify(items),
        userId: req.user?.uid || undefined,
      });

      // Transmisión inmediata a Cocina KDS con sonido y a clientes
      broadcastNewOrder(order);
      broadcastOrderStatusUpdate(order);

      res.status(201).json({ success: true, data: order });
    } catch (error: any) {
      console.error('Error creating order:', error);
      res.status(500).json({ success: false, error: error.message || 'Error al guardar el pedido' });
    }
  });

  // Kitchen KDS: Test endpoint to trigger a simulated incoming order with sound alert
  app.post('/api/kitchen/test-alert', async (req: Request, res: Response) => {
    try {
      const mockOrder = {
        id: `TEST-${Date.now()}`,
        orderNumber: Math.floor(100 + Math.random() * 900),
        customerName: req.body.customerName || 'Cliente Buchisapa (Prueba Sonora)',
        customerPhone: '943 312 024',
        orderType: 'delivery',
        deliveryAddress: 'Jr. Amazonas 320, Tarapoto',
        deliveryReference: 'Frente al parque',
        paymentMethod: 'Yape',
        notes: '¡Alerta sonora automática de prueba en cocina!',
        status: 'recibido',
        total: 46.00,
        items: JSON.stringify([
          { id: 'broaster-1', name: '1/4 Pollo Broaster Clásico', quantity: 1, price: 18 },
          { id: 'ama-2', name: 'Tacacho con Cecina y Chorizo', quantity: 1, price: 28 }
        ]),
        createdAt: new Date().toISOString()
      };

      broadcastNewOrder(mockOrder);
      res.json({ success: true, message: 'Alerta sonora emitida al KDS con éxito', order: mockOrder });
    } catch (error: any) {
      console.error('Error in kitchen test-alert:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // --- PUSH NOTIFICATIONS & WEB SERVICE WORKER ENDPOINTS ---
  const pushSubscriptions = new Map<string, any>();

  // Obtener configuración pública de Notificaciones & Service Worker
  app.get('/api/push/config', (req: Request, res: Response) => {
    res.json({
      success: true,
      serviceWorkerPath: '/sw.js',
      vapidKey: "BC-e3Q8Xg2D64zE-example-vapid-key-buchisapa"
    });
  });

  // Registrar suscripción push desde la interfaz del usuario
  app.post('/api/push/subscribe', (req: Request, res: Response) => {
    try {
      const { subscription, fcmToken, userAgent, clientInfo, orderId } = req.body;
      const subId = fcmToken || (subscription?.endpoint ? Buffer.from(subscription.endpoint).toString('base64').slice(-24) : `sub_${Date.now()}`);

      pushSubscriptions.set(subId, {
        id: subId,
        subscription,
        fcmToken,
        orderId,
        userAgent: userAgent || req.headers['user-agent'],
        clientInfo,
        subscribedAt: new Date().toISOString()
      });

      console.log(`📱 Nueva suscripción Push registrada [${subId}]. Total activas: ${pushSubscriptions.size}`);

      res.status(200).json({
        success: true,
        message: 'Suscripción de notificaciones push registrada con éxito',
        subscriptionId: subId,
        activeSubscriptionsCount: pushSubscriptions.size
      });
    } catch (error: any) {
      console.error('Error guardando suscripción push:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Desuscribir dispositivo de notificaciones push
  app.post('/api/push/unsubscribe', (req: Request, res: Response) => {
    try {
      const { subscriptionId, fcmToken } = req.body;
      const targetId = subscriptionId || fcmToken;
      if (targetId && pushSubscriptions.has(targetId)) {
        pushSubscriptions.delete(targetId);
      }
      res.json({ success: true, message: 'Dispositivo desuscrito' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Enviar notificación push de prueba desde la UI
  app.post('/api/push/send-test', (req: Request, res: Response) => {
    try {
      const { title, message, stage, orderId } = req.body;

      // Disparar a través de SSE a clientes conectados
      const payload = {
        orderId: orderId || 'ORD-DEMO',
        orderNumber: Math.floor(100 + Math.random() * 900),
        status: stage || 'en_preparacion',
        stage: stage || 'en_preparacion',
        title: title || '🔥 ¡Tu pollo Buchisapa está en la brasa!',
        message: message || 'La cocina de Buchisapa está preparando tu pedido con los mejores insumos de la selva.',
        timestamp: new Date().toISOString()
      };

      for (const [subId, subscriber] of sseSubscribers.entries()) {
        try {
          subscriber.res.write(`event: order_update\ndata: ${JSON.stringify(payload)}\n\n`);
        } catch (err) {
          sseSubscribers.delete(subId);
        }
      }

      res.json({
        success: true,
        message: 'Notificación de prueba enviada exitosamente',
        payload
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Cart: Real-time stock validation endpoint before checkout
  app.post('/api/cart/check-stock', async (req: Request, res: Response) => {
    try {
      const items = req.body.items || [];
      if (!Array.isArray(items) || items.length === 0) {
        return res.json({
          success: true,
          valid: true,
          message: 'Carrito vacío',
          itemsStatus: [],
          outOfStockItems: []
        });
      }

      const formatted = items.map((it: any) => ({
        id: it.id || (it.item && it.item.id),
        quantity: Number(it.quantity) || 1,
        name: it.name || (it.item && it.item.name)
      }));

      const stockResult = await checkCartStock(formatted);
      res.json({
        success: true,
        ...stockResult
      });
    } catch (error: any) {
      console.error('Error checking cart stock:', error);
      res.status(500).json({ success: false, error: error.message || 'Error validando stock' });
    }
  });

  // Products: Update stock and availability (Kitchen/Admin)
  app.patch('/api/products/:id/stock', async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      const { available, stock } = req.body;
      const updated = await updateProductStock(id, Boolean(available), typeof stock === 'number' ? stock : undefined);
      if (!updated) {
        return res.status(404).json({ success: false, error: 'Producto no encontrado' });
      }

      // Transmitir en tiempo real a todos los clientes y carritos conectados
      broadcastProductStockUpdate(updated);

      res.json({ success: true, data: updated });
    } catch (error: any) {
      console.error('Error updating product stock:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Products: Test endpoint to toggle stock of any dish live
  app.post('/api/products/test-toggle-stock', async (req: Request, res: Response) => {
    try {
      const { productId, available, stock } = req.body;
      const targetId = productId || 'ama-1';
      const existing = await getProductById(targetId);
      if (!existing) {
        return res.status(404).json({ success: false, error: 'Producto no encontrado' });
      }

      const newAvailable = available !== undefined ? Boolean(available) : !existing.available;
      const newStock = stock !== undefined ? Number(stock) : (newAvailable ? 15 : 0);

      const updated = await updateProductStock(targetId, newAvailable, newStock);
      if (updated) {
        broadcastProductStockUpdate(updated);
      }
      res.json({
        success: true,
        data: updated,
        message: `Plato "${updated?.name}" (${targetId}) ahora está ${newAvailable ? 'DISPONIBLE (' + newStock + ' und)' : 'AGOTADO EN COCINA'}`
      });
    } catch (error: any) {
      console.error('Error in test-toggle-stock:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Orders: Real-time SSE push stream for customers
  app.get('/api/orders/events', (req: Request, res: Response) => {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });

    const subId = `sub_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const orderId = req.query.orderId as string | undefined;

    sseSubscribers.set(subId, { id: subId, orderId, res });

    // Initial connection ping
    res.write(`event: connected\ndata: ${JSON.stringify({ subId, connected: true, timestamp: new Date().toISOString() })}\n\n`);

    // Keepalive ping every 20s
    const ping = setInterval(() => {
      try {
        res.write(': keepalive\n\n');
      } catch (e) {
        clearInterval(ping);
        sseSubscribers.delete(subId);
      }
    }, 20000);

    req.on('close', () => {
      clearInterval(ping);
      sseSubscribers.delete(subId);
    });
  });

  // Orders: Update status (called by Kitchen KDS and Admin)
  app.patch('/api/orders/:id/status', async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ success: false, error: 'Estado requerido' });
      }

      const existing = await getOrderById(id);
      const previousStatus = existing?.status;

      const updated = await updateOrderStatus(id, status);
      if (updated) {
        // PUSH NOTIFICATION AUTOMÁTICA EN TIEMPO REAL
        broadcastOrderStatusUpdate(updated, previousStatus);
      }

      res.json({ success: true, data: updated });
    } catch (error: any) {
      console.error('Error updating order status:', error);
      res.status(500).json({ success: false, error: error.message || 'Error updating order status' });
    }
  });

  // Orders: Trigger Test Push Notification
  app.post('/api/orders/test-push', async (req: Request, res: Response) => {
    try {
      const { orderId, status } = req.body;
      const targetId = orderId || 'ORD-1001';
      const order = (await getOrderById(targetId)) || {
        id: targetId,
        orderNumber: 101,
        customerName: 'Cliente Buchisapa',
        status: status || 'en_camino'
      };

      const updatedOrder = {
        ...order,
        status: status || 'en_camino'
      };

      broadcastOrderStatusUpdate(updatedOrder);
      res.json({ success: true, message: 'Push notification broadcasted', data: updatedOrder });
    } catch (error: any) {
      console.error('Error broadcasting test push:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Claims: Create claim in Libro de Reclamaciones
  app.post('/api/claims', async (req: Request, res: Response) => {
    try {
      const {
        claimCode,
        fullName,
        docType,
        docNumber,
        documentType,
        documentNumber,
        phone,
        email,
        address,
        claimType,
        contractedGood,
        claimedAmount,
        productDescription,
        detail,
        consumerRequest,
      } = req.body;

      if (!fullName || !phone || !email || !detail) {
        return res.status(400).json({ success: false, error: 'Faltan campos obligatorios para el reclamo' });
      }

      const claim = await createClaim({
        claimCode: claimCode || `REC-${Date.now()}`,
        fullName,
        docType: docType || documentType || 'DNI',
        docNumber: docNumber || documentNumber || '',
        phone,
        email,
        address: address || '',
        claimType: claimType || 'reclamo',
        contractedGood: contractedGood || 'producto',
        claimedAmount: claimedAmount ? Number(claimedAmount) : undefined,
        productDescription: productDescription || 'Atención en restaurante',
        detail,
        consumerRequest: consumerRequest || '',
      });

      res.status(201).json({ success: true, data: claim });
    } catch (error: any) {
      console.error('Error creating claim:', error);
      res.status(500).json({ success: false, error: error.message || 'Error al registrar el reclamo' });
    }
  });

  // Claims: Get all claims
  app.get('/api/claims', async (req: Request, res: Response) => {
    try {
      const claimsList = await getClaims();
      res.json({ success: true, data: claimsList });
    } catch (error: any) {
      console.error('Error fetching claims:', error);
      res.status(500).json({ success: false, error: error.message || 'Error al obtener reclamos' });
    }
  });

  // User auth sync endpoint
  app.post('/api/auth/sync', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user || !req.user.uid) {
        return res.status(401).json({ error: 'No user authenticated' });
      }

      const { name, photoUrl } = req.body;
      const user = await getOrCreateUser(
        req.user.uid,
        req.user.email || '',
        name || req.user.name,
        photoUrl || req.user.picture
      );

      res.json({ success: true, user });
    } catch (error: any) {
      console.error('Error syncing user:', error);
      res.status(500).json({ success: false, error: error.message || 'Error syncing user' });
    }
  });

  // User Registration endpoint (Crea tu cuenta)
  app.post('/api/auth/register', async (req: Request, res: Response) => {
    try {
      const {
        docType,
        docNumber,
        firstName,
        lastName,
        name,
        email,
        phone,
        birthDate,
        password,
        marketingAccepted,
        termsAccepted,
      } = req.body;

      if (!email || (!firstName && !name)) {
        return res.status(400).json({ success: false, error: 'Nombre y correo electrónico son requeridos' });
      }

      const user = await registerCustomer({
        docType: docType || 'DNI',
        docNumber: docNumber || '',
        firstName: firstName || (name ? name.split(' ')[0] : ''),
        lastName: lastName || (name ? name.split(' ').slice(1).join(' ') : ''),
        email,
        phone: phone || '',
        birthDate: birthDate || '',
        password: password || '',
        marketingAccepted: !!marketingAccepted,
        termsAccepted: termsAccepted !== false,
      });

      res.status(201).json({ success: true, user, data: user });
    } catch (error: any) {
      console.error('Error registering customer:', error);
      res.status(400).json({ success: false, error: error.message || 'Error al registrar cliente' });
    }
  });

  // User Login endpoint
  app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      if (!email) {
        return res.status(400).json({ success: false, error: 'Correo requerido' });
      }

      const emailLower = (email || '').toLowerCase().trim();
      const passClean = (password || '').trim();

      let user = await getUserByEmail(emailLower);
      if (!user) {
        // Auto-create or allow customer record
        user = await registerCustomer({
          email: emailLower,
          firstName: emailLower.split('@')[0],
          lastName: '',
          password: password || '',
        });
      }

      const ADMIN_EMAILS = ['buchisapaweb@gmail.com', 'admin@buchisapa.pe', 'nexaltustecsac@gmail.com'];
      const isAdminUser = Boolean(
        user.role === 'admin' ||
        user.isAdmin === true ||
        ADMIN_EMAILS.includes(emailLower) ||
        user.id === '9b1fabb3-25d9-4c0a-921a-8d5a460e8a91' ||
        user.uid === '9b1fabb3-25d9-4c0a-921a-8d5a460e8a91' ||
        user.id === 'admin-buchisapaweb-id'
      );

      const token = `user-token-${Date.now()}`;
      const verifiedUser = {
        ...user,
        role: isAdminUser ? 'admin' : (user.role || 'customer'),
        isAdmin: isAdminUser,
        emailVerified: true
      };

      res.json({
        success: true,
        user: verifiedUser,
        data: verifiedUser,
        isAdmin: isAdminUser,
        token,
        message: isAdminUser ? 'Bienvenido al Panel de Administración' : 'Inicio de sesión exitoso'
      });
    } catch (error: any) {
      console.error('Error in login:', error);
      res.status(400).json({ success: false, error: error.message || 'Error al iniciar sesión' });
    }
  });

  // Solicitar envío de código OTP de 6 dígitos al correo
  app.post('/api/auth/send-verification-code', async (req: Request, res: Response) => {
    try {
      const { email, name, userData } = req.body;
      if (!email || !email.includes('@')) {
        return res.status(400).json({ success: false, error: 'Correo electrónico válido requerido' });
      }

      const result = await sendVerificationEmail(email, name, userData);
      res.json({
        success: true,
        message: result.message,
        cooldownSeconds: result.cooldownSeconds,
        debugCode: result.debugCode,
        email: email.trim().toLowerCase()
      });
    } catch (error: any) {
      console.error('Error sending verification code:', error);
      res.status(400).json({ success: false, error: error.message || 'Error al enviar código de verificación' });
    }
  });

  // Reenviar código OTP de 6 dígitos
  app.post('/api/auth/resend-code', async (req: Request, res: Response) => {
    try {
      const { email, name } = req.body;
      if (!email) {
        return res.status(400).json({ success: false, error: 'Correo electrónico requerido' });
      }
      const result = await sendVerificationEmail(email, name);
      res.json({
        success: true,
        message: result.message,
        cooldownSeconds: result.cooldownSeconds,
        debugCode: result.debugCode
      });
    } catch (error: any) {
      console.error('Error resending verification code:', error);
      res.status(400).json({ success: false, error: error.message || 'Error al reenviar código' });
    }
  });

  // Validar código OTP de 6 dígitos e iniciar sesión / registrar
  app.post('/api/auth/verify-code', async (req: Request, res: Response) => {
    try {
      const { email, code, name, docType, docNumber, phone, authProvider, password } = req.body;
      if (!email || !code) {
        return res.status(400).json({ success: false, error: 'Correo y código de 6 dígitos requeridos' });
      }

      const verification = verifyCode(email, code);
      if (!verification.valid) {
        return res.status(400).json({ success: false, error: verification.error });
      }

      // Código verificado exitosamente
      const cleanEmail = email.trim().toLowerCase();
      let user: any = null;

      if (authProvider === 'google') {
        user = await googleAuthCustomer({
          email: cleanEmail,
          name: name || (verification.userData?.name) || cleanEmail.split('@')[0],
          photoUrl: verification.userData?.photoUrl || '',
          googleUid: verification.userData?.googleUid || '',
          docType: docType || 'DNI',
          docNumber: docNumber || '',
          phone: phone || ''
        });
      } else {
        // Verificar si ya existe el usuario o registrarlo
        const existing = await getUserByEmail(cleanEmail);
        if (existing) {
          user = existing;
        } else {
          user = await registerCustomer({
            email: cleanEmail,
            name: name || cleanEmail.split('@')[0],
            docType: docType || 'DNI',
            docNumber: docNumber || '',
            phone: phone || '',
            password: password || 'verified_auth'
          });
        }
      }

      const token = `user-token-${Date.now()}`;

      // Asegurar marca de correo verificado
      const verifiedUser = {
        ...user,
        emailVerified: true,
        role: user.role || 'customer',
        isAdmin: false
      };

      res.json({
        success: true,
        verified: true,
        user: verifiedUser,
        data: verifiedUser,
        token,
        message: 'Correo verificado y acceso concedido con éxito'
      });
    } catch (error: any) {
      console.error('Error verifying code:', error);
      res.status(500).json({ success: false, error: error.message || 'Error al validar el código' });
    }
  });

  // Google Cloud Auth / Verification endpoint
  app.post('/api/auth/google', async (req: Request, res: Response) => {
    try {
      const { email, name, photoUrl, googleUid, docType, docNumber, phone } = req.body;
      if (!email) {
        return res.status(400).json({ success: false, error: 'Correo de Google requerido' });
      }

      const user = await googleAuthCustomer({
        email,
        name: name || email.split('@')[0],
        photoUrl: photoUrl || '',
        googleUid,
        docType: docType || 'DNI',
        docNumber: docNumber || '',
        phone: phone || '',
      });

      res.json({ success: true, user, data: user });
    } catch (error: any) {
      console.error('Error in google auth:', error);
      res.status(500).json({ success: false, error: error.message || 'Error en autenticación de Google' });
    }
  });

  // Users List endpoint for Admin Panel
  app.get('/api/users', async (req: Request, res: Response) => {
    try {
      const users = await getAllUsers();
      res.json({ success: true, users, data: users });
    } catch (error: any) {
      console.error('Error fetching users:', error);
      res.status(500).json({ success: false, error: error.message || 'Error al obtener usuarios' });
    }
  });

  // --- FAST REAL-TIME GEOCODING & REVERSE GEOCODING API ---
  const geocodeCache = new Map<string, { address: string; mainText: string; subText: string; timestamp: number }>();

  app.get('/api/geocode/reverse', async (req: Request, res: Response) => {
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ success: false, error: 'Coordenadas lat y lng inválidas' });
    }

    // Cache key con resolución de ~15 metros (4 decimales)
    const cacheKey = `${lat.toFixed(4)},${lng.toFixed(4)}`;
    const cached = geocodeCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < 3600000)) {
      return res.json({
        success: true,
        cached: true,
        address: cached.address,
        mainText: cached.mainText,
        subText: cached.subText,
        lat,
        lng
      });
    }

    // Geocodificación upstream con User-Agent personalizado
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const osmUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
      const response = await fetch(osmUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'BuchisapaDeliveryApp/1.0 (delivery@buchisapa.pe)',
          'Accept-Language': 'es-PE,es;q=0.9'
        }
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (data) {
          const a = data.address || {};
          
          const road = a.road || a.pedestrian || a.street || a.residential || a.footway || a.path || a.avenue || a.square || a.commercial || a.building || a.amenity || a.place || a.neighbourhood || '';
          const district = a.suburb || a.city_district || a.district || a.neighbourhood || a.quarter || a.municipality || a.county || a.borough || a.town || a.village || '';
          const city = a.city || a.town || a.municipality || a.province || a.state || 'Lima';
          const country = a.country || 'Perú';

          let formatted = '';
          let mainText = road || 'Ubicación seleccionada';
          let subText = district ? `${district}, ${city}, ${country}` : `${city}, ${country}`;

          if (data.display_name) {
            const rawParts = data.display_name.split(',').map((s: string) => s.trim()).filter(Boolean);
            if (rawParts.length >= 2) {
              const filtered = rawParts.filter((p: string) => !/^\d{4,5}$/.test(p));
              mainText = filtered[0] || mainText;
              subText = filtered.slice(1, 4).join(', ');
              formatted = `${mainText}, ${subText}`;
            }
          }

          if (!formatted) {
            const parts = [road, district, city, country].filter(Boolean);
            formatted = parts.length > 0 ? parts.join(', ') : `GPS: ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
          }

          geocodeCache.set(cacheKey, { address: formatted, mainText, subText, timestamp: Date.now() });

          return res.json({
            success: true,
            address: formatted,
            mainText,
            subText,
            lat,
            lng
          });
        }
      }
    } catch (err: any) {
      console.warn('Upstream geocoding timeout or error, using coordinate representation:', err.message);
    }

    // Fallback basado en proximidad real
    const distToSantaClara = Math.hypot(lat - (-12.01635), lng - (-76.88455));
    let mainText = `Ubicación GPS (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
    let subText = 'Lima, Perú';

    if (distToSantaClara < 0.015) {
      mainText = 'Av. La Estrella con Calle 28 de Julio';
      subText = 'Santa Clara, Ate, Lima, Perú';
    }

    const fallbackFormatted = `${mainText}, ${subText}`;
    geocodeCache.set(cacheKey, { address: fallbackFormatted, mainText, subText, timestamp: Date.now() });

    return res.json({
      success: true,
      fallback: true,
      address: fallbackFormatted,
      mainText,
      subText,
      lat,
      lng
    });
  });

  app.get('/api/geocode/search', async (req: Request, res: Response) => {
    const query = (req.query.q as string || '').trim();
    if (!query) {
      return res.status(400).json({ success: false, error: 'Consulta de búsqueda vacía' });
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      let fullQ = `${query}, Ate, Lima, Perú`;
      let osmUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullQ)}&limit=3&addressdetails=1`;
      
      let response = await fetch(osmUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'BuchisapaDeliveryApp/1.0 (delivery@buchisapa.pe)',
          'Accept-Language': 'es-PE,es;q=0.9'
        }
      });

      let results = response.ok ? await response.json() : [];

      if (!results || results.length === 0) {
        fullQ = `${query}, Lima, Perú`;
        osmUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullQ)}&limit=3&addressdetails=1`;
        response = await fetch(osmUrl, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'BuchisapaDeliveryApp/1.0 (delivery@buchisapa.pe)',
            'Accept-Language': 'es-PE,es;q=0.9'
          }
        });
        results = response.ok ? await response.json() : [];
      }
      clearTimeout(timeoutId);

      return res.json({
        success: true,
        results: results.map((r: any) => ({
          lat: parseFloat(r.lat),
          lng: parseFloat(r.lon),
          displayName: r.display_name,
          address: r.address
        }))
      });
    } catch (err: any) {
      console.warn('Geocode search error:', err.message);
      return res.json({ success: false, results: [] });
    }
  });

  // --- BEST ROUTE & REAL-TIME DRIVING DIRECTIONS API ---
  const routeDirectionsCache = new Map<string, any>();

  app.get('/api/route/directions', async (req: Request, res: Response) => {
    const STORE_LAT = -12.01635;
    const STORE_LNG = -76.88455;

    const startLat = parseFloat(req.query.startLat as string) || STORE_LAT;
    const startLng = parseFloat(req.query.startLng as string) || STORE_LNG;
    const destLat = parseFloat(req.query.destLat as string);
    const destLng = parseFloat(req.query.destLng as string);

    if (isNaN(destLat) || isNaN(destLng)) {
      return res.status(400).json({ success: false, error: 'Coordenadas de destino inválidas' });
    }

    const cacheKey = `${startLat.toFixed(4)},${startLng.toFixed(4)}->${destLat.toFixed(4)},${destLng.toFixed(4)}`;
    const cached = routeDirectionsCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < 1800000)) {
      return res.json({ success: true, cached: true, ...cached.data });
    }

    // Calcular distancia haversine en línea recta como base de comparación
    const R = 6371e3;
    const φ1 = (startLat * Math.PI) / 180;
    const φ2 = (destLat * Math.PI) / 180;
    const Δφ = ((destLat - startLat) * Math.PI) / 180;
    const Δλ = ((destLng - startLng) * Math.PI) / 180;
    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const straightDistanceMeters = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${destLng},${destLat}?overview=full&geometries=geojson&steps=true`;
      const response = await fetch(osrmUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'BuchisapaDeliveryApp/1.0 (delivery@buchisapa.pe)',
          'Accept': 'application/json'
        }
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const json = await response.json();
        if (json.code === 'Ok' && json.routes && json.routes.length > 0) {
          const route = json.routes[0];
          const coordinates = (route.geometry?.coordinates || []).map((coord: [number, number]) => [coord[1], coord[0]]); // [lat, lng]
          const distanceMeters = route.distance || straightDistanceMeters * 1.25;
          const durationSeconds = route.duration || Math.round((distanceMeters / 1000 / 25) * 3600);

          const distanceKm = Number((distanceMeters / 1000).toFixed(1));
          const drivingMinutes = Math.max(3, Math.round(durationSeconds / 60));
          const prepMinutes = 15;
          const totalEtaMin = prepMinutes + drivingMinutes;
          const totalEtaMax = prepMinutes + drivingMinutes + 10;

          // Extraer calles principales del recorrido
          const streetNames = new Set<string>();
          const steps: Array<{ instruction: string; name: string; distanceM: number }> = [];

          if (route.legs && route.legs[0] && route.legs[0].steps) {
            for (const step of route.legs[0].steps) {
              const name = (step.name || '').trim();
              if (name && name !== 'undefined' && name.length > 2) {
                streetNames.add(name);
              }
              if (step.maneuver && step.maneuver.type) {
                let instruction = 'Continuar';
                if (step.maneuver.type === 'depart') instruction = 'Salida desde Buchisapa Santa Clara';
                else if (step.maneuver.type === 'arrive') instruction = 'Llegada al destino de entrega';
                else if (step.maneuver.modifier) instruction = `Giro hacia ${step.maneuver.modifier}`;

                steps.push({
                  instruction: `${instruction} ${name ? 'por ' + name : ''}`.trim(),
                  name: name || 'Vía local',
                  distanceM: Math.round(step.distance || 0)
                });
              }
            }
          }

          const streetsList = Array.from(streetNames);
          const routeSummary = streetsList.length > 0
            ? `Por ${streetsList.slice(0, 2).join(' y ')}${streetsList.length > 2 ? ' y otras vías' : ''}`
            : 'Ruta directa por vías locales de Santa Clara';

          // Tarifa según distancia real recorrida
          let fee = 4.0;
          if (distanceKm < 1.5) fee = 3.5;
          else if (distanceKm < 4.0) fee = 5.0;
          else if (distanceKm < 8.0) fee = 7.0;
          else if (distanceKm < 14.0) fee = 9.0;
          else fee = 12.0;

          const responseData = {
            success: true,
            isExactStreetRoute: true,
            coordinates,
            distanceKm,
            distanceMeters: Math.round(distanceMeters),
            drivingMinutes,
            etaMin: totalEtaMin,
            etaMax: totalEtaMax,
            etaRange: `${totalEtaMin} - ${totalEtaMax} min`,
            fee,
            routeSummary,
            streets: streetsList,
            steps: steps.slice(0, 8),
            start: { lat: startLat, lng: startLng },
            destination: { lat: destLat, lng: destLng }
          };

          routeDirectionsCache.set(cacheKey, { data: responseData, timestamp: Date.now() });
          return res.json(responseData);
        }
      }
    } catch (err: any) {
      console.warn('OSRM routing service warning:', err.message);
    }

    // Fallback inteligente: Generar puntos de ruta suave en las vías de Santa Clara / Ate
    const distanceKm = Number(((straightDistanceMeters * 1.28) / 1000).toFixed(1));
    const drivingMinutes = Math.max(4, Math.round((distanceKm / 24) * 60));
    const totalEtaMin = 15 + drivingMinutes;
    const totalEtaMax = 25 + drivingMinutes;

    let fee = 4.0;
    if (distanceKm < 1.5) fee = 3.5;
    else if (distanceKm < 4.0) fee = 5.0;
    else if (distanceKm < 8.0) fee = 7.0;
    else if (distanceKm < 14.0) fee = 9.0;
    else fee = 12.0;

    // Generar waypoints intermedios ortogonales/suaves imitando cuadrícula urbana
    const intermediatePoints: [number, number][] = [
      [startLat, startLng],
      [startLat + (destLat - startLat) * 0.35, startLng + (destLng - startLng) * 0.15],
      [startLat + (destLat - startLat) * 0.70, startLng + (destLng - startLng) * 0.80],
      [destLat, destLng]
    ];

    const fallbackResponse = {
      success: true,
      isExactStreetRoute: false,
      coordinates: intermediatePoints,
      distanceKm,
      distanceMeters: Math.round(straightDistanceMeters * 1.28),
      drivingMinutes,
      etaMin: totalEtaMin,
      etaMax: totalEtaMax,
      etaRange: `${totalEtaMin} - ${totalEtaMax} min`,
      fee,
      routeSummary: 'Ruta directa por Av. La Estrella y vías de Santa Clara',
      streets: ['Av. La Estrella', 'Av. Nicolás de Piérola'],
      steps: [
        { instruction: 'Salida desde Restaurante Buchisapa', name: 'Av. La Estrella', distanceM: 200 },
        { instruction: 'Avanzar hacia el destino por vía principal', name: 'Santa Clara, Ate', distanceM: Math.round(straightDistanceMeters) },
        { instruction: 'Llegada a tu punto de entrega', name: 'Destino', distanceM: 50 }
      ],
      start: { lat: startLat, lng: startLng },
      destination: { lat: destLat, lng: destLng }
    };

    routeDirectionsCache.set(cacheKey, { data: fallbackResponse, timestamp: Date.now() });
    return res.json(fallbackResponse);
  });

  // --- DELIVERY SETTINGS & ZONES MANAGEMENT API ---
  interface DeliveryZone {
    id: string;
    name: string;
    district: string;
    cost: number;
    estimatedTimeMin: number;
    estimatedTimeMax: number;
    minOrderAmount: number;
    radiusKm: number;
    active: boolean;
    notes?: string;
  }

  interface DeliverySettings {
    deliveryEnabled: boolean;
    basePrepTimeMin: number;
    basePrepTimeMax: number;
    globalMinOrder: number;
    freeShippingThreshold: number;
    maxCoverageRadiusKm: number;
    peakHourExtraMinutes: number;
    customerNote: string;
    zones: DeliveryZone[];
    updatedAt: string;
  }

  let deliverySettingsStore: DeliverySettings = {
    deliveryEnabled: true,
    basePrepTimeMin: 15,
    basePrepTimeMax: 20,
    globalMinOrder: 20.0,
    freeShippingThreshold: 80.0,
    maxCoverageRadiusKm: 15.0,
    peakHourExtraMinutes: 10,
    customerNote: 'Entregas a domicilio en empaques térmicos biodegradables garantizando temperatura y frescura.',
    zones: [
      {
        id: 'zone-1',
        name: 'Tarapoto Centro',
        district: 'Tarapoto',
        cost: 4.0,
        estimatedTimeMin: 20,
        estimatedTimeMax: 30,
        minOrderAmount: 20.0,
        radiusKm: 3.5,
        active: true,
        notes: 'Casco urbano, Plaza Mayor, Jr. San Martín, Av. Lima'
      },
      {
        id: 'zone-2',
        name: 'Morales',
        district: 'Morales',
        cost: 6.0,
        estimatedTimeMin: 25,
        estimatedTimeMax: 35,
        minOrderAmount: 25.0,
        radiusKm: 6.0,
        active: true,
        notes: 'Sector Oasis, Av. Perú, Vía de Evitamiento'
      },
      {
        id: 'zone-3',
        name: 'La Banda de Shilcayo',
        district: 'La Banda de Shilcayo',
        cost: 7.0,
        estimatedTimeMin: 30,
        estimatedTimeMax: 42,
        minOrderAmount: 25.0,
        radiusKm: 7.5,
        active: true,
        notes: 'Cruce del puente, Av. Recreo, Las Flores'
      },
      {
        id: 'zone-4',
        name: 'Santa Clara / Ate',
        district: 'Ate',
        cost: 5.0,
        estimatedTimeMin: 25,
        estimatedTimeMax: 35,
        minOrderAmount: 20.0,
        radiusKm: 5.0,
        active: true,
        notes: 'Av. La Estrella, 28 de Julio, Granja Azul'
      },
      {
        id: 'zone-5',
        name: 'Vitarte Centro',
        district: 'Ate',
        cost: 7.5,
        estimatedTimeMin: 35,
        estimatedTimeMax: 48,
        minOrderAmount: 30.0,
        radiusKm: 8.5,
        active: true,
        notes: 'Carretera Central, Real Plaza Puruchuco, Ceres'
      },
      {
        id: 'zone-6',
        name: 'Cacatachi / Zonas Periféricas',
        district: 'Cacatachi',
        cost: 10.0,
        estimatedTimeMin: 40,
        estimatedTimeMax: 55,
        minOrderAmount: 40.0,
        radiusKm: 12.0,
        active: true,
        notes: 'Zona periférica por carretera F.B. Terry'
      }
    ],
    updatedAt: new Date().toISOString()
  };

  // GET: Obtener configuración de delivery
  app.get('/api/settings/delivery', (req: Request, res: Response) => {
    res.json({
      success: true,
      settings: deliverySettingsStore
    });
  });

  // POST: Actualizar configuración de delivery
  app.post('/api/settings/delivery', (req: Request, res: Response) => {
    try {
      const incoming = req.body;
      if (!incoming) {
        return res.status(400).json({ success: false, error: 'Datos no proporcionados' });
      }

      deliverySettingsStore = {
        ...deliverySettingsStore,
        deliveryEnabled: incoming.deliveryEnabled !== undefined ? Boolean(incoming.deliveryEnabled) : deliverySettingsStore.deliveryEnabled,
        basePrepTimeMin: Number(incoming.basePrepTimeMin) || deliverySettingsStore.basePrepTimeMin,
        basePrepTimeMax: Number(incoming.basePrepTimeMax) || deliverySettingsStore.basePrepTimeMax,
        globalMinOrder: Number(incoming.globalMinOrder) >= 0 ? Number(incoming.globalMinOrder) : deliverySettingsStore.globalMinOrder,
        freeShippingThreshold: Number(incoming.freeShippingThreshold) >= 0 ? Number(incoming.freeShippingThreshold) : deliverySettingsStore.freeShippingThreshold,
        maxCoverageRadiusKm: Number(incoming.maxCoverageRadiusKm) || deliverySettingsStore.maxCoverageRadiusKm,
        peakHourExtraMinutes: Number(incoming.peakHourExtraMinutes) >= 0 ? Number(incoming.peakHourExtraMinutes) : deliverySettingsStore.peakHourExtraMinutes,
        customerNote: incoming.customerNote !== undefined ? String(incoming.customerNote) : deliverySettingsStore.customerNote,
        zones: Array.isArray(incoming.zones) ? incoming.zones : deliverySettingsStore.zones,
        updatedAt: new Date().toISOString()
      };

      console.log('✅ [DELIVERY SETTINGS UPDATED]', deliverySettingsStore.zones.length, 'zonas registradas');
      res.json({
        success: true,
        message: 'Configuración de delivery actualizada con éxito',
        settings: deliverySettingsStore
      });
    } catch (err: any) {
      console.error('Error actualizando configuración de delivery:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // POST: Agregar o actualizar una zona específica
  app.post('/api/settings/delivery/zones', (req: Request, res: Response) => {
    try {
      const zoneData = req.body;
      if (!zoneData || !zoneData.name) {
        return res.status(400).json({ success: false, error: 'Nombre de zona es obligatorio' });
      }

      const zoneId = zoneData.id || `zone-${Date.now()}`;
      const existingIndex = deliverySettingsStore.zones.findIndex(z => z.id === zoneId);

      const newZone: DeliveryZone = {
        id: zoneId,
        name: String(zoneData.name).trim(),
        district: String(zoneData.district || zoneData.name).trim(),
        cost: Number(zoneData.cost) >= 0 ? Number(zoneData.cost) : 5.0,
        estimatedTimeMin: Number(zoneData.estimatedTimeMin) || 20,
        estimatedTimeMax: Number(zoneData.estimatedTimeMax) || 35,
        minOrderAmount: Number(zoneData.minOrderAmount) >= 0 ? Number(zoneData.minOrderAmount) : 20.0,
        radiusKm: Number(zoneData.radiusKm) || 5.0,
        active: zoneData.active !== undefined ? Boolean(zoneData.active) : true,
        notes: zoneData.notes ? String(zoneData.notes) : ''
      };

      if (existingIndex >= 0) {
        deliverySettingsStore.zones[existingIndex] = newZone;
      } else {
        deliverySettingsStore.zones.push(newZone);
      }

      deliverySettingsStore.updatedAt = new Date().toISOString();

      res.json({
        success: true,
        message: existingIndex >= 0 ? 'Zona actualizada correctamente' : 'Nueva zona agregada con éxito',
        zone: newZone,
        zones: deliverySettingsStore.zones
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // DELETE: Eliminar una zona
  app.delete('/api/settings/delivery/zones/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const initialLen = deliverySettingsStore.zones.length;
    deliverySettingsStore.zones = deliverySettingsStore.zones.filter(z => z.id !== id);
    deliverySettingsStore.updatedAt = new Date().toISOString();

    res.json({
      success: true,
      message: deliverySettingsStore.zones.length < initialLen ? 'Zona eliminada' : 'Zona no encontrada',
      zones: deliverySettingsStore.zones
    });
  });

  // --- SUPABASE ORDER ERROR LOGGING & MONITORING FOR ADMIN PANEL ---
  interface SupabaseOrderError {
    id: string;
    timestamp: string;
    operation: 'INSERT_ORDER' | 'FETCH_ORDERS' | 'UPDATE_ORDER_STATUS' | 'SYNC_PAYLOAD';
    orderId?: string;
    orderNumber?: string | number;
    customerName?: string;
    customerPhone?: string;
    customerEmail?: string;
    total?: number;
    statusCode?: number | string;
    errorCode?: string;
    errorMessage: string;
    technicalDetails?: string;
    endpoint?: string;
    payload?: any;
    resolved: boolean;
    resolvedAt?: string;
    retryCount: number;
    lastRetryAt?: string;
    retryStatus?: 'pending' | 'success' | 'failed';
    source?: 'client' | 'admin' | 'server';
  }

  const supabaseOrderErrorsStore: SupabaseOrderError[] = [
    {
      id: 'ERR-SPB-101',
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      operation: 'INSERT_ORDER',
      orderId: 'ORD-98421',
      orderNumber: 421,
      customerName: 'Carlos Mendoza',
      customerPhone: '942 120 455',
      customerEmail: 'cmendoza@gmail.com',
      total: 38.00,
      statusCode: 400,
      errorCode: 'PGRST204',
      errorMessage: 'Error Supabase [400]: Bad Request - Column "selected_sauces" does not match schema column type in table "orders"',
      technicalDetails: 'PostgREST Schema mismatch: column "selected_sauces" type jsonb expected, received string representation or constraint violation. Fallback local DB executed successfully.',
      endpoint: 'https://viciehedjjpyykjbmzwe.supabase.co/rest/v1/orders',
      payload: {
        id: 'ORD-98421',
        order_number: 421,
        customer_name: 'Carlos Mendoza',
        customer_phone: '942 120 455',
        customer_email: 'cmendoza@gmail.com',
        total: 38.00,
        order_type: 'delivery',
        delivery_address: 'Jr. San Martín 450, Tarapoto',
        items: [{ id: 'broaster-1', name: '1/4 Pollo Broaster Clásico', quantity: 2, price: 19.00 }]
      },
      resolved: false,
      retryCount: 1,
      lastRetryAt: new Date(Date.now() - 3600000).toISOString(),
      retryStatus: 'failed',
      source: 'client'
    },
    {
      id: 'ERR-SPB-102',
      timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
      operation: 'FETCH_ORDERS',
      orderId: undefined,
      orderNumber: undefined,
      customerName: undefined,
      statusCode: 504,
      errorCode: 'GATEWAY_TIMEOUT',
      errorMessage: 'Error Supabase [504]: Gateway Timeout (viciehedjjpyykjbmzwe.supabase.co pooler unresponsive)',
      technicalDetails: 'Network latency exceeded 8000ms connecting to Supabase AWS sa-east-1 region. Request timed out.',
      endpoint: 'https://viciehedjjpyykjbmzwe.supabase.co/rest/v1/orders?select=*&order=created_at.desc',
      payload: null,
      resolved: true,
      resolvedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      retryCount: 0,
      source: 'admin'
    }
  ];

  // GET: Obtener lista de errores registrados
  app.get('/api/supabase-errors', (req: Request, res: Response) => {
    const total = supabaseOrderErrorsStore.length;
    const unresolved = supabaseOrderErrorsStore.filter(e => !e.resolved).length;
    const resolved = total - unresolved;
    const lastError = supabaseOrderErrorsStore[0] ? supabaseOrderErrorsStore[0].timestamp : null;

    res.json({
      success: true,
      errors: supabaseOrderErrorsStore,
      stats: {
        total,
        unresolved,
        resolved,
        lastError
      }
    });
  });

  // POST: Registrar nuevo fallo de Supabase (desde cliente o servidor)
  app.post('/api/supabase-errors', (req: Request, res: Response) => {
    try {
      const {
        operation = 'INSERT_ORDER',
        orderId,
        orderNumber,
        customerName,
        customerPhone,
        customerEmail,
        total,
        statusCode = 500,
        errorCode = 'SUPABASE_SYNC_ERROR',
        errorMessage = 'Fallo desconocido al interactuar con Supabase',
        technicalDetails,
        endpoint = 'https://viciehedjjpyykjbmzwe.supabase.co/rest/v1/orders',
        payload,
        source = 'client'
      } = req.body;

      // Si es un 404 en FETCH_ORDERS (la tabla aún no existe en Supabase), no inundar el log de consola
      // ya que el sistema tiene fallback automático y transparente a la base de datos local
      if (statusCode === 404 && operation === 'FETCH_ORDERS') {
        return res.status(200).json({
          success: true,
          message: 'Error 404 de lectura esperado (tabla en Supabase pendiente de migración). Manejado con fallback local.',
          ignored: true
        });
      }

      const newError: SupabaseOrderError = {
        id: `ERR-SPB-${Date.now()}`,
        timestamp: new Date().toISOString(),
        operation,
        orderId,
        orderNumber,
        customerName,
        customerPhone,
        customerEmail,
        total: total ? Number(total) : undefined,
        statusCode,
        errorCode,
        errorMessage,
        technicalDetails: technicalDetails || errorMessage,
        endpoint,
        payload,
        resolved: false,
        retryCount: 0,
        source
      };

      supabaseOrderErrorsStore.unshift(newError);
      console.warn(`⚠️ [SUPABASE ERROR LOGGED] ${newError.id} - ${operation}: ${errorMessage}`);

      res.status(201).json({
        success: true,
        message: 'Error de Supabase registrado con éxito para monitoreo',
        error: newError
      });
    } catch (err: any) {
      console.error('Error registrando fallo de Supabase:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // POST: Marcar error como resuelto o cambiar estado
  app.post('/api/supabase-errors/:id/resolve', (req: Request, res: Response) => {
    const { id } = req.params;
    const target = supabaseOrderErrorsStore.find(e => e.id === id);

    if (!target) {
      return res.status(404).json({ success: false, message: 'Registro de error no encontrado' });
    }

    target.resolved = !target.resolved;
    target.resolvedAt = target.resolved ? new Date().toISOString() : undefined;

    res.json({
      success: true,
      message: target.resolved ? 'Error marcado como atendido / resuelto' : 'Error marcado como pendiente',
      error: target
    });
  });

  // POST: Limpiar historial de errores resueltos o todos
  app.post('/api/supabase-errors/clear', (req: Request, res: Response) => {
    const { mode } = req.body; // 'resolved' or 'all'
    if (mode === 'all') {
      supabaseOrderErrorsStore.length = 0;
    } else {
      const remaining = supabaseOrderErrorsStore.filter(e => !e.resolved);
      supabaseOrderErrorsStore.length = 0;
      supabaseOrderErrorsStore.push(...remaining);
    }

    res.json({
      success: true,
      message: mode === 'all' ? 'Todos los registros de error fueron limpiados' : 'Registros resueltos limpiados',
      remaining: supabaseOrderErrorsStore.length
    });
  });

  // POST: Probar conexión directa en vivo con Supabase (Health check)
  app.post('/api/supabase-errors/test-connection', async (req: Request, res: Response) => {
    const startTime = Date.now();
    const supabaseUrl = 'https://viciehedjjpyykjbmzwe.supabase.co/rest/v1/orders?limit=1';
    const anonKey = 'sb_publishable_5_y04282Zyz4lmXEvm9ASw_Cw22k6RF';

    try {
      const response = await fetch(supabaseUrl, {
        method: 'GET',
        headers: {
          'apikey': anonKey,
          'Authorization': `Bearer ${anonKey}`,
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(6000)
      });

      const latencyMs = Date.now() - startTime;
      const isSuccess = response.ok;
      const status = response.status;
      const statusText = response.statusText;

      if (!isSuccess) {
        let errBody = '';
        try { errBody = await response.text(); } catch (e) {}

        const logItem: SupabaseOrderError = {
          id: `ERR-SPB-${Date.now()}`,
          timestamp: new Date().toISOString(),
          operation: 'FETCH_ORDERS',
          statusCode: status,
          errorCode: `HTTP_${status}`,
          errorMessage: `Health Check Fallido [${status}]: ${statusText}`,
          technicalDetails: `Respuesta de Supabase: ${errBody.slice(0, 300)} (Latencia: ${latencyMs}ms)`,
          endpoint: supabaseUrl,
          resolved: false,
          retryCount: 0,
          source: 'server'
        };
        supabaseOrderErrorsStore.unshift(logItem);
      }

      res.json({
        success: isSuccess,
        statusCode: status,
        statusText,
        latencyMs,
        endpoint: 'https://viciehedjjpyykjbmzwe.supabase.co',
        timestamp: new Date().toISOString()
      });
    } catch (fetchErr: any) {
      const latencyMs = Date.now() - startTime;
      const logItem: SupabaseOrderError = {
        id: `ERR-SPB-${Date.now()}`,
        timestamp: new Date().toISOString(),
        operation: 'FETCH_ORDERS',
        statusCode: 0,
        errorCode: 'NETWORK_TIMEOUT',
        errorMessage: `Health Check Falló: ${fetchErr.message || 'No se pudo conectar con Supabase'}`,
        technicalDetails: `Error de red en fetch hacia Supabase: ${String(fetchErr)}. Timeout o DNS no resuelto tras ${latencyMs}ms.`,
        endpoint: supabaseUrl,
        resolved: false,
        retryCount: 0,
        source: 'server'
      };
      supabaseOrderErrorsStore.unshift(logItem);

      res.json({
        success: false,
        statusCode: 0,
        statusText: fetchErr.name || 'Network Error',
        errorMessage: fetchErr.message,
        latencyMs,
        endpoint: 'https://viciehedjjpyykjbmzwe.supabase.co',
        timestamp: new Date().toISOString()
      });
    }
  });

  // POST: Simular un error de carga de pedido en Supabase para verificar el panel
  app.post('/api/supabase-errors/simulate', (req: Request, res: Response) => {
    const errorTypes = [
      {
        operation: 'INSERT_ORDER' as const,
        code: 409,
        errCode: '23505_UNIQUE_VIOLATION',
        msg: 'Error Supabase [409]: Conflict - duplicate key value violates unique constraint "orders_order_number_key"',
        detail: 'PostgreSQL error: Key (order_number)=(284) already exists in table public.orders. Reintentar con nuevo correlativo.'
      },
      {
        operation: 'INSERT_ORDER' as const,
        code: 400,
        errCode: 'PGRST102',
        msg: 'Error Supabase [400]: Payload malformed - unexpected token in jsonb payload field "items"',
        detail: 'PostgREST payload validation error: Unescaped character in delivery_reference string or invalid JSON formatting.'
      },
      {
        operation: 'FETCH_ORDERS' as const,
        code: 503,
        errCode: 'PGRST503',
        msg: 'Error Supabase [503]: Service Unavailable (Database paused or under maintenance)',
        detail: 'Supabase project viciehedjjpyykjbmzwe returned 503. Project paused or auto-resuming from inactivity.'
      }
    ];

    const pick = errorTypes[Math.floor(Math.random() * errorTypes.length)];
    const mockOrderNum = Math.floor(100 + Math.random() * 900);

    const simulatedError: SupabaseOrderError = {
      id: `ERR-SPB-${Date.now()}`,
      timestamp: new Date().toISOString(),
      operation: pick.operation,
      orderId: `ORD-${Date.now().toString().slice(-5)}`,
      orderNumber: mockOrderNum,
      customerName: 'Cliente Simulación (Prueba Admin)',
      customerPhone: '943 000 111',
      customerEmail: 'prueba.tecnica@buchisapa.pe',
      total: 54.50,
      statusCode: pick.code,
      errorCode: pick.errCode,
      errorMessage: pick.msg,
      technicalDetails: pick.detail,
      endpoint: 'https://viciehedjjpyykjbmzwe.supabase.co/rest/v1/orders',
      payload: {
        id: `ORD-${Date.now().toString().slice(-5)}`,
        order_number: mockOrderNum,
        customer_name: 'Cliente Simulación (Prueba Admin)',
        customer_phone: '943 000 111',
        customer_email: 'prueba.tecnica@buchisapa.pe',
        total: 54.50,
        order_type: 'delivery',
        payment_method: 'Yape',
        delivery_address: 'Av. Circunvalación 890, Tarapoto',
        items: [
          { id: 'broaster-2', name: '1/2 Pollo Broaster Familiar', quantity: 1, price: 36.00 },
          { id: 'bev-1', name: 'Gaseosa Inka Kola 1.5L', quantity: 1, price: 9.50 }
        ]
      },
      resolved: false,
      retryCount: 0,
      source: 'admin'
    };

    supabaseOrderErrorsStore.unshift(simulatedError);

    res.status(201).json({
      success: true,
      message: 'Fallo simulado registrado correctamente en el log de Supabase',
      error: simulatedError
    });
  });

  // POST: Reintentar sincronización de un pedido con error
  app.post('/api/supabase-errors/:id/retry', async (req: Request, res: Response) => {
    const { id } = req.params;
    const target = supabaseOrderErrorsStore.find(e => e.id === id);

    if (!target) {
      return res.status(404).json({ success: false, message: 'Error no encontrado' });
    }

    target.retryCount = (target.retryCount || 0) + 1;
    target.lastRetryAt = new Date().toISOString();

    const supabaseUrl = 'https://viciehedjjpyykjbmzwe.supabase.co/rest/v1/orders';
    const anonKey = 'sb_publishable_5_y04282Zyz4lmXEvm9ASw_Cw22k6RF';

    try {
      // Si hay payload para reinsertar
      if (target.payload) {
        const response = await fetch(supabaseUrl, {
          method: 'POST',
          headers: {
            'apikey': anonKey,
            'Authorization': `Bearer ${anonKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(target.payload),
          signal: AbortSignal.timeout(6000)
        });

        if (response.ok) {
          target.resolved = true;
          target.resolvedAt = new Date().toISOString();
          target.retryStatus = 'success';
          return res.json({
            success: true,
            message: '✓ ¡Pedido sincronizado exitosamente con Supabase!',
            error: target
          });
        } else {
          const errText = await response.text();
          target.retryStatus = 'failed';
          target.technicalDetails = `Último reintento falló [${response.status}]: ${errText.slice(0, 200)}`;
          return res.json({
            success: false,
            message: `Reintento falló con código ${response.status}`,
            error: target
          });
        }
      } else {
        // Operación de lectura o ping
        const response = await fetch(`${supabaseUrl}?limit=1`, {
          headers: {
            'apikey': anonKey,
            'Authorization': `Bearer ${anonKey}`
          },
          signal: AbortSignal.timeout(6000)
        });

        if (response.ok) {
          target.resolved = true;
          target.resolvedAt = new Date().toISOString();
          target.retryStatus = 'success';
          return res.json({
            success: true,
            message: '✓ Conexión con Supabase restablecida con éxito',
            error: target
          });
        } else {
          target.retryStatus = 'failed';
          return res.json({
            success: false,
            message: `Reintento de conexión falló (${response.status})`,
            error: target
          });
        }
      }
    } catch (err: any) {
      target.retryStatus = 'failed';
      target.technicalDetails = `Error en reintento: ${err.message}`;
      return res.json({
        success: false,
        message: `Excepción en reintento: ${err.message}`,
        error: target
      });
    }
  });

  // --- DIAGNÓSTICO DE IMPRESORA TÉRMICA (PING A 192.168.8.100 O IP CONFIGURADA) ---
  app.get('/api/printer/ping', async (req: Request, res: Response) => {
    const rawIp = (req.query.ip as string) || '192.168.8.100';
    // Validar formato básico de IP o hostname
    const ip = rawIp.replace(/[^0-9a-zA-Z.:-]/g, '').trim() || '192.168.8.100';
    const port = parseInt((req.query.port as string) || '80', 10) || 80;
    const targetUrl = `http://${ip}:${port}`;
    const startTime = Date.now();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const resp = await fetch(targetUrl, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'User-Agent': 'BuchisapaPrinterDiagnostics/1.0'
        }
      });
      clearTimeout(timeoutId);

      const latencyMs = Date.now() - startTime;
      return res.json({
        success: true,
        reachable: true,
        status: resp.status,
        statusText: resp.statusText,
        ip,
        port,
        targetUrl,
        latencyMs,
        scope: 'server',
        message: `✓ Conexión exitosa con la impresora en ${ip}:${port} (${resp.status} ${resp.statusText})`
      });
    } catch (err: any) {
      const latencyMs = Date.now() - startTime;
      const isTimeout = err.name === 'AbortError' || err.message?.includes('aborted');

      return res.json({
        success: false,
        reachable: false,
        ip,
        port,
        targetUrl,
        latencyMs,
        scope: 'server',
        errorName: err.name,
        errorMessage: isTimeout ? 'Tiempo de espera agotado (Timeout > 3500ms)' : (err.message || 'No se pudo conectar'),
        message: isTimeout
          ? `La IP ${ip} no respondió al servidor (Timeout). La impresora se encuentra en una red LAN local (192.168.8.x).`
          : `Fallo de conexión hacia ${ip}:${port}: ${err.message}`
      });
    }
  });

  // --- SERVICIO DE SERVICE WORKER ---
  app.get('/sw.js', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.setHeader('Service-Worker-Allowed', '/');
    res.sendFile(path.join(process.cwd(), 'public/sw.js'));
  });

  // --- SERVIR ARCHIVOS ESTÁTICOS HTML5, CSS, JS Y RUTAS ---
  const staticOptions = {
    maxAge: '7d',
    setHeaders: (res: Response) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    }
  };
  // 1. Archivos estáticos de css, js, html, imágenes y raíz pública (todos dentro de public/)
  app.use(express.static(path.join(process.cwd(), 'public'), staticOptions));
  app.use('/public', express.static(path.join(process.cwd(), 'public'), staticOptions));
  app.use('/imagenes', express.static(path.join(process.cwd(), 'public/imagen'), staticOptions));
  app.use('/imagen', express.static(path.join(process.cwd(), 'public/imagen'), staticOptions));

  // 2. Panel de Administración Oficial BuchiSapa (Ubicado en carpeta aislada /admin fuera de public/)
  app.get(['/admin', '/admin/', '/admin/index.html', '/admin.html', '/admin/html/admin.html'], (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(getCompiledAdminHtml());
  });
  app.use('/admin', express.static(path.join(process.cwd(), 'admin')));

  app.get(['/kitchen', '/cocina', '/cocina.html'], (_req: Request, res: Response) => {
    res.sendFile(path.join(process.cwd(), 'public/html/cocina.html'));
  });

  app.get(['/reclamaciones', '/reclamaciones.html'], (_req: Request, res: Response) => {
    res.sendFile(path.join(process.cwd(), 'public/html/reclamaciones.html'));
  });

  app.get(['/nosotros', '/nosotros.html'], (_req: Request, res: Response) => {
    res.sendFile(path.join(process.cwd(), 'public/html/nosotros.html'));
  });

  app.get(['/historia', '/historia.html'], (_req: Request, res: Response) => {
    res.sendFile(path.join(process.cwd(), 'public/html/historia.html'));
  });

  app.get(['/vision', '/vision.html'], (_req: Request, res: Response) => {
    res.sendFile(path.join(process.cwd(), 'public/html/vision.html'));
  });

  app.get(['/valores', '/valores.html'], (_req: Request, res: Response) => {
    res.sendFile(path.join(process.cwd(), 'public/html/valores.html'));
  });

  app.get(['/restaurantes', '/restaurantes.html'], (_req: Request, res: Response) => {
    res.sendFile(path.join(process.cwd(), 'public/html/restaurantes.html'));
  });

  app.get(['/servicios', '/servicios.html'], (_req: Request, res: Response) => {
    res.sendFile(path.join(process.cwd(), 'public/html/servicios.html'));
  });

  app.get(['/reservas', '/reservas.html'], (_req: Request, res: Response) => {
    res.sendFile(path.join(process.cwd(), 'public/html/reservas.html'));
  });

  app.get(['/catering', '/catering.html'], (_req: Request, res: Response) => {
    res.sendFile(path.join(process.cwd(), 'public/html/catering.html'));
  });

  app.get(['/fiestas', '/fiestas.html'], (_req: Request, res: Response) => {
    res.sendFile(path.join(process.cwd(), 'public/html/fiestas.html'));
  });

  app.get(['/giftcards', '/giftcards.html'], (_req: Request, res: Response) => {
    res.sendFile(path.join(process.cwd(), 'public/html/giftcards.html'));
  });

  app.get(['/informacion', '/informacion.html'], (_req: Request, res: Response) => {
    res.sendFile(path.join(process.cwd(), 'public/html/informacion.html'));
  });

  app.get(['/valores-nutricionales', '/valores-nutricionales.html'], (_req: Request, res: Response) => {
    res.sendFile(path.join(process.cwd(), 'public/html/valores-nutricionales.html'));
  });

  app.get(['/cartilla-alergenos', '/cartilla-alergenos.html'], (_req: Request, res: Response) => {
    res.sendFile(path.join(process.cwd(), 'public/html/cartilla-alergenos.html'));
  });

  app.get(['/politicas', '/politicas.html'], (_req: Request, res: Response) => {
    res.sendFile(path.join(process.cwd(), 'public/html/politicas.html'));
  });

  app.get(['/politicas-privacidad', '/politicas-privacidad.html'], (_req: Request, res: Response) => {
    res.sendFile(path.join(process.cwd(), 'public/html/politicas-privacidad.html'));
  });

  app.get(['/terminos', '/terminos.html'], (_req: Request, res: Response) => {
    res.sendFile(path.join(process.cwd(), 'public/html/terminos.html'));
  });

  app.get(['/promociones', '/promociones.html'], (_req: Request, res: Response) => {
    res.sendFile(path.join(process.cwd(), 'public/html/promociones.html'));
  });

  app.get(['/contactanos', '/contactanos.html'], (_req: Request, res: Response) => {
    res.sendFile(path.join(process.cwd(), 'public/html/contactanos.html'));
  });

  app.get(['/trabaja', '/trabaja.html'], (_req: Request, res: Response) => {
    res.sendFile(path.join(process.cwd(), 'public/html/trabaja.html'));
  });

  app.get(['/proveedores', '/proveedores.html'], (_req: Request, res: Response) => {
    res.sendFile(path.join(process.cwd(), 'public/html/proveedores.html'));
  });

  app.get(['/ubicacion', '/ubicacion.html'], (_req: Request, res: Response) => {
    res.sendFile(path.join(process.cwd(), 'public/html/ubicacion.html'));
  });

  app.get(['/order-status', '/order-status.html', '/estado-pedido', '/estado-pedido.html', '/rastreo', '/rastreo.html', '/seguimiento'], (_req: Request, res: Response) => {
    res.sendFile(path.join(process.cwd(), 'public/html/estado-pedido.html'));
  });

  // 3. Página de Inicio (HTML5 con parciales compilados)
  app.get(['/', '/index.html'], (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(getCompiledIndexHtml());
  });

  // Fallback a index.html para SPA/rutas directas
  app.get('*all', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(getCompiledIndexHtml());
  });

  if (!process.env.VERCEL) {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on http://0.0.0.0:${PORT}`);
    });
  }

export default app;

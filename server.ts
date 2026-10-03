import express, { type Request, type Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { optionalAuth, requireAuth, type AuthRequest } from './src/middleware/auth';

const __filename = typeof import.meta?.url === 'string' ? fileURLToPath(import.meta.url) : '';
const __dirname = __filename ? path.dirname(__filename) : process.cwd();

function getCompiledIndexHtml(): string {
  const partials: Record<string, string> = {
    'HEADER': 'public/html/header.html',
    'PORTADA': 'public/html/portada.html',
    'CARRUSEL_PORTADA': 'public/html/portada.html',
    'CATEGORIA': 'public/html/categoria.html',
    'PRODUCTO': 'public/html/producto.html',
    'DESCRIPCION_PRODUCTO': 'public/html/descripcionProducto.html',
    'CARRITO': 'public/html/carrito.html',
    'PANEL_CARRITO': 'public/html/carrito.html',
    'RECOJO': 'public/html/recojo-modal.html',
    'VENTANA_UBICACION': 'public/html/recojo-modal.html',
    'CHECKOUT': 'public/html/checkout.html',
    'VENTANA_CARTA_COMPLETA': 'public/html/checkout.html',
    'AUTENTICACION_PERFIL': 'public/html/autenticacionPerfil.html',
    'VENTANA_AUTENTICACION': 'public/html/autenticacionPerfil.html',
    'FOOTER': 'public/html/footer.html',
    'PIE_PAGINA': 'public/html/footer.html'
  };

  const rutas = [
    path.join(__dirname, 'index.html'),
    path.join(__dirname, '../index.html'),
    path.join(__dirname, 'dist/index.html'),
    path.join(__dirname, '../dist/index.html'),
    path.join(process.cwd(), 'index.html'),
    path.join(process.cwd(), 'dist/index.html'),
    '/app/index.html',
    '/app/dist/index.html',
    '/app/applet/index.html',
    '/app/applet/dist/index.html'
  ];

  let template = '';
  for (const r of rutas) {
    if (fs.existsSync(r)) {
      template = fs.readFileSync(r, 'utf8');
      break;
    }
  }

  if (!template) {
    throw new Error('No se encontró index.html');
  }

  for (const [key, filePath] of Object.entries(partials)) {
    const absPath = path.join(process.cwd(), filePath);
    if (fs.existsSync(absPath)) {
      const content = fs.readFileSync(absPath, 'utf8');
      template = template.replace(new RegExp(`<!-- PARTIAL: ${key} -->`, 'g'), content);
    }
  }
  return template;
}

// Las vistas administrativas se compilan y emulan dinámicamente en caliente desde la carpeta /admin utilizando PHP en tiempo de ejecución.
import { sendVerificationEmail, verifyCode } from './src/services/emailVerification';
import {
  getOrCreateUser,
  getUserByUid,
  registerCustomer,
  googleAuthCustomer,
  getAllUsers,
  getUserByEmail,
  verifyUserPassword
} from './src/db/users';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getProducts,
  getProductById,
  getSauces,
  getPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
  reorderPromotions,
  getOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  deleteOrder,
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
  deleteTicket,
  clearAllTickets,
  getPortadas,
  createPortada,
  updatePortada,
  deletePortada,
  reorderPortadas,
  savePortadaImageBase64,
} from './src/db/queries';
import { createCulqiRouter } from './src/culqi';

export const app = express();
const PORT = 3000;

app.use((req, res, next) => {
  res.setHeader('Permissions-Policy', 'geolocation=(self "*")');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, x-admin-token');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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

  // Create category
  app.post('/api/categories', async (req: Request, res: Response) => {
    try {
      const newCategory = await createCategory(req.body);
      res.status(201).json({ success: true, data: newCategory });
    } catch (error: any) {
      console.error('Error creating category:', error);
      res.status(500).json({ success: false, error: error.message || 'Error creating category' });
    }
  });

  // Update category
  app.put('/api/categories/:id', async (req: Request, res: Response) => {
    try {
      const categoryId = req.params.id as string;
      const updated = await updateCategory(categoryId, req.body);
      if (!updated) {
        return res.status(404).json({ success: false, error: 'Categoría no encontrada' });
      }
      res.json({ success: true, data: updated });
    } catch (error: any) {
      console.error('Error updating category:', error);
      res.status(500).json({ success: false, error: error.message || 'Error updating category' });
    }
  });

  // Delete category
  app.delete('/api/categories/:id', async (req: Request, res: Response) => {
    try {
      const categoryId = req.params.id as string;
      const deleted = await deleteCategory(categoryId);
      res.json({ success: deleted });
    } catch (error: any) {
      console.error('Error deleting category:', error);
      res.status(500).json({ success: false, error: error.message || 'Error deleting category' });
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
  app.get(['/api/admin/supplies', '/api/supplies'], async (_req: Request, res: Response) => {
    try {
      const supplies = await getSupplies();
      res.json({ success: true, data: supplies });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post(['/api/admin/supplies/:id/stock', '/api/supplies/:id/stock'], async (req: Request, res: Response) => {
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
  app.get(['/api/admin/utensils', '/api/utensils'], async (_req: Request, res: Response) => {
    try {
      const utensils = await getUtensils();
      res.json({ success: true, data: utensils });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Admin caja metrics
  app.get(['/api/admin/caja', '/api/caja'], async (_req: Request, res: Response) => {
    try {
      const caja = await getCajaSummary();
      res.json({ success: true, data: caja });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Admin caja: Registrar movimiento (Ingreso / Egreso)
  app.post(['/api/admin/caja/movimiento', '/api/caja/movements'], async (req: Request, res: Response) => {
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
  app.post(['/api/admin/caja/apertura', '/api/caja/abrir'], async (req: Request, res: Response) => {
    try {
      const { montoInicial, initial_cash, responsable, cajero } = req.body;
      const initial = Number(montoInicial || initial_cash) || 250;
      const resp = responsable || cajero || 'Admin BuchiSapa';
      const caja = await abrirCaja({ montoInicial: initial, responsable: resp });
      res.json({ success: true, data: caja });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Admin caja: Cierre de turno / Arqueo Z
  app.post(['/api/admin/caja/cierre', '/api/caja/cerrar'], async (req: Request, res: Response) => {
    try {
      const { efectivoReal, real_cash, notes, notas, responsable } = req.body;
      const cash = Number(efectivoReal !== undefined ? efectivoReal : real_cash);
      const note = notes || notas;
      const result = await cerrarCaja({ efectivoReal: cash, notas: note, responsable });
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Admin general sales metrics
  app.get('/api/admin/metrics', async (_req: Request, res: Response) => {
    try {
      const orders = await getOrders();
      const validOrders = orders.filter((o: any) => String(o.status || '').toLowerCase() !== 'cancelado');
      const totalSales = validOrders.reduce((sum: number, o: any) => sum + (Number(o.total) || 0), 0);
      const totalOrders = validOrders.length;
      const averageTicket = totalOrders > 0 ? totalSales / totalOrders : 0;
      
      const deliveryOrders = validOrders.filter((o: any) => String(o.orderType || o.type || '').toLowerCase() === 'delivery');
      const salonOrders = validOrders.filter((o: any) => String(o.orderType || o.type || '').toLowerCase() !== 'delivery');

      res.json({
        success: true,
        data: {
          totalSales,
          totalOrders,
          averageTicket,
          deliveryOrdersCount: deliveryOrders.length,
          salonOrdersCount: salonOrders.length
        }
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Admin Gemini IA Assist Endpoint
  app.post('/api/admin/ia-assist', async (req: Request, res: Response) => {
    try {
      const { prompt } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({ success: false, error: 'API Key de Gemini no configurada en el servidor' });
      }
      
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error en API Gemini: ${response.statusText}`);
      }
      
      const result: any = await response.json();
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text || '';
      return res.json({ success: true, text });
    } catch (error: any) {
      console.error('Error in IA Assist:', error);
      return res.status(500).json({ success: false, error: error.message || 'Error interno del servidor' });
    }
  });

  // Admin tickets: Listar tickets de venta / boletas
  app.get(['/api/admin/tickets', '/api/tickets'], async (_req: Request, res: Response) => {
    try {
      const tickets = await getTickets();
      res.json({ success: true, data: tickets });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Admin tickets: Emitir nuevo ticket rápido
  app.post(['/api/admin/tickets', '/api/tickets'], async (req: Request, res: Response) => {
    try {
      const ticket = await createQuickTicket(req.body);
      res.json({ success: true, data: ticket });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Admin tickets: Eliminar ticket individual
  app.delete(['/api/admin/tickets/:id', '/api/tickets/:id'], async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      const success = await deleteTicket(id);
      res.json({ success, message: success ? 'Ticket eliminado' : 'Ticket no encontrado' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Admin tickets: Limpiar todos los tickets
  app.delete(['/api/admin/tickets', '/api/tickets'], async (_req: Request, res: Response) => {
    try {
      await clearAllTickets();
      res.json({ success: true, message: 'Todos los tickets anteriores han sido eliminados' });
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

  app.post(['/api/portadas', '/api/admin/portadas'], async (req: Request, res: Response) => {
    try {
      const portada = await createPortada(req.body);
      res.json({ success: true, data: portada });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.put(['/api/portadas/:id', '/api/admin/portadas/:id'], async (req: Request, res: Response) => {
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

  app.delete(['/api/portadas/:id', '/api/admin/portadas/:id'], async (req: Request, res: Response) => {
    try {
      const portadaId = req.params.id as string;
      const success = await deletePortada(portadaId);
      res.json({ success });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post(['/api/portadas/upload', '/api/admin/portadas/upload'], async (req: Request, res: Response) => {
    try {
      const { slideNumber, type, file } = req.body;
      const num = parseInt(slideNumber, 10) || 1;
      const typeCode: 'E' | 'M' = (type === 'M' || type === 'mobile' || type === 'm') ? 'M' : 'E';
      if (!file) {
        return res.status(400).json({ success: false, error: 'No se recibió ninguna imagen' });
      }
      const savedPath = savePortadaImageBase64(file, num, typeCode);
      res.json({ success: true, url: savedPath });
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

  // Get promotions (include inactive when ?all=true)
  app.get('/api/promotions', async (req: Request, res: Response) => {
    try {
      const includeAll = req.query.all === 'true';
      const promotions = await getPromotions(includeAll);
      res.json({ success: true, data: promotions });
    } catch (error: any) {
      console.error('Error fetching promotions:', error);
      res.status(500).json({ success: false, error: error.message || 'Error fetching promotions' });
    }
  });

  app.post(['/api/promotions', '/api/admin/promotions'], async (req: Request, res: Response) => {
    try {
      const promo = await createPromotion(req.body);
      res.json({ success: true, data: promo });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.put(['/api/promotions/:id', '/api/admin/promotions/:id'], async (req: Request, res: Response) => {
    try {
      const promoId = req.params.id as string;
      const promo = await updatePromotion(promoId, req.body);
      if (!promo) {
        return res.status(404).json({ success: false, error: 'Promoción no encontrada' });
      }
      res.json({ success: true, data: promo });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.delete(['/api/promotions/:id', '/api/admin/promotions/:id'], async (req: Request, res: Response) => {
    try {
      const promoId = req.params.id as string;
      const success = await deletePromotion(promoId);
      res.json({ success });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post(['/api/promotions/reorder', '/api/admin/promotions/reorder'], async (req: Request, res: Response) => {
    try {
      const { ids } = req.body;
      if (!Array.isArray(ids)) {
        return res.status(400).json({ success: false, error: 'Lista de IDs requerida' });
      }
      const promos = await reorderPromotions(ids);
      res.json({ success: true, data: promos });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
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

  // =========================================================================
  // MÓDULO OFICIAL DE PAGOS CULQI (CARPETA /src/culqi/)
  // =========================================================================
  app.use(createCulqiRouter({
    broadcastNewOrder,
    broadcastOrderStatusUpdate
  }));

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

  // Orders: Delete order completely
  app.delete('/api/orders/:id', async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      const success = await deleteOrder(id);
      res.json({ success, message: success ? 'Pedido y ticket eliminados' : 'Pedido no encontrado' });
    } catch (error: any) {
      console.error('Error deleting order:', error);
      res.status(500).json({ success: false, error: error.message });
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
        firstName,
        paternalSurname,
        maternalSurname,
        docType,
        docNumber,
        documentType,
        documentNumber,
        phone,
        email,
        department,
        province,
        district,
        address,
        branch,
        orderNumber,
        orderDate,
        isMinor,
        tutorName,
        tutorDoc,
        claimType,
        contractedGood,
        claimedAmount,
        productDescription,
        detail,
        consumerRequest,
        attachmentName
      } = req.body;

      const finalName = fullName || [firstName, paternalSurname, maternalSurname].filter(Boolean).join(' ');
      const finalDetail = detail || consumerRequest || 'Reclamación registrada por el cliente';

      if (!finalName || !phone || !email || !finalDetail) {
        return res.status(400).json({ success: false, error: 'Faltan campos obligatorios para el reclamo' });
      }

      const claim = await createClaim({
        claimCode: claimCode || `REC-${Date.now()}`,
        fullName: finalName,
        docType: docType || documentType || 'DNI',
        docNumber: docNumber || documentNumber || '',
        phone,
        email,
        department: department || 'Lima',
        province: province || 'Lima',
        district: district || 'Ate',
        address: address || '',
        branch: branch || 'BuchiSapa - Sede Central (Santa Clara, Ate)',
        orderNumber: orderNumber || '',
        orderDate: orderDate || '',
        isMinor: Boolean(isMinor),
        tutorName: tutorName || '',
        tutorDoc: tutorDoc || '',
        claimType: claimType || 'reclamo',
        contractedGood: contractedGood || 'producto',
        claimedAmount: claimedAmount ? Number(claimedAmount) : undefined,
        productDescription: productDescription || 'Consumo en restaurante / Pedido delivery',
        detail: finalDetail,
        consumerRequest: consumerRequest || finalDetail,
        attachmentName: attachmentName || ''
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

  // User Login endpoint (Autenticación estricta con Supabase Auth + Verificación de Contraseña Local)
  app.post(['/api/auth/login', '/auth/login', '/api/login', '/login'], async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ success: false, error: 'Por favor, ingresa correo electrónico y contraseña' });
      }

      const emailLower = (email || '').toLowerCase().trim();
      const passClean = (password || '').trim();

      if (!passClean) {
        return res.status(400).json({ success: false, error: 'Por favor, ingresa tu contraseña' });
      }

      // 1. Intentar autenticar contra el servicio de Supabase Auth
      let supabaseUser: any = null;
      let supabaseToken: string | null = null;
      let supabaseRejectedCredentials = false;

      try {
        const sbRes = await fetch('https://ckgvgfpcxeqyilfphnsu.supabase.co/auth/v1/token?grant_type=password', {
          method: 'POST',
          headers: {
            'apikey': 'sb_publishable_XLQDJByokKbI5m0UVkJHEw_KRTygH9M',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email: emailLower, password: passClean })
        });
        const sbData = await sbRes.json().catch(() => ({}));

        if (sbRes.ok && sbData.access_token) {
          supabaseUser = sbData.user;
          supabaseToken = sbData.access_token;
        } else if (
          sbRes.status === 400 && 
          (sbData.error === 'invalid_grant' || (sbData.error_description && sbData.error_description.toLowerCase().includes('invalid login credentials')))
        ) {
          // Supabase verificó y rechazó explícitamente las credenciales por contraseña incorrecta
          supabaseRejectedCredentials = true;
        }
      } catch (sbErr) {
        console.warn('Advertencia al consultar Supabase Auth:', sbErr);
      }

      // Si Supabase Auth validó la contraseña con éxito
      if (supabaseUser) {
        const meta = supabaseUser.user_metadata || {};
        const appMeta = supabaseUser.app_metadata || {};
        const ADMIN_EMAILS = ['buchisapaweb@gmail.com', 'admin@buchisapa.pe'];
        const isAdminUser = Boolean(
          meta.isAdmin === true ||
          meta.role === 'admin' ||
          appMeta.role === 'admin' ||
          supabaseUser.role === 'admin' ||
          ADMIN_EMAILS.includes(emailLower)
        );

        const verifiedUser = {
          id: supabaseUser.id,
          uid: supabaseUser.id,
          email: supabaseUser.email || emailLower,
          name: meta.name || meta.full_name || 'Usuario BuchiSapa',
          firstName: meta.firstName || (meta.name ? meta.name.split(' ')[0] : 'Admin'),
          lastName: meta.lastName || (meta.name ? meta.name.split(' ').slice(1).join(' ') : 'BuchiSapa'),
          phone: meta.phone || supabaseUser.phone || '',
          docType: meta.docType || 'DNI',
          docNumber: meta.docNumber || '',
          role: isAdminUser ? 'admin' : (meta.role || 'customer'),
          isAdmin: isAdminUser,
          emailVerified: true,
          password: passClean,
          createdAt: supabaseUser.created_at || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        // Sincronizar en el almacén
        await registerCustomer(verifiedUser);

        return res.json({
          success: true,
          user: verifiedUser,
          data: verifiedUser,
          isAdmin: isAdminUser,
          token: supabaseToken || `user-token-${Date.now()}`,
          message: isAdminUser ? 'Bienvenido al Panel de Administración' : 'Inicio de sesión exitoso'
        });
      }

      // 2. Verificación de usuarios locales en base de datos
      const localUser = await getUserByEmail(emailLower);
      if (!localUser) {
        // El usuario no existe ni en Supabase ni en la base local
        return res.status(401).json({
          success: false,
          error: 'El correo electrónico o la contraseña ingresados no son correctos.'
        });
      }

      // Si el usuario existe localmente, VERIFICAR OBLIGATORIAMENTE SU CONTRASEÑA
      const passwordMatches = verifyUserPassword(localUser, passClean);
      if (!passwordMatches) {
        return res.status(401).json({
          success: false,
          error: 'La contraseña ingresada es incorrecta. Por favor, verifica tus datos.'
        });
      }

      const ADMIN_EMAILS = ['buchisapaweb@gmail.com', 'admin@buchisapa.pe'];
      const isAdminUser = Boolean(
        localUser.role === 'admin' ||
        localUser.isAdmin === true ||
        ADMIN_EMAILS.includes(emailLower) ||
        localUser.id === '9b1fabb3-25d9-4c0a-921a-8d5a460e8a91' ||
        localUser.uid === '9b1fabb3-25d9-4c0a-921a-8d5a460e8a91' ||
        localUser.id === 'admin-buchisapaweb-id'
      );

      const token = `user-token-${Date.now()}`;
      const verifiedUser = {
        ...localUser,
        role: isAdminUser ? 'admin' : (localUser.role || 'customer'),
        isAdmin: isAdminUser,
        emailVerified: true
      };

      return res.json({
        success: true,
        user: verifiedUser,
        data: verifiedUser,
        isAdmin: isAdminUser,
        token,
        message: isAdminUser ? 'Bienvenido al Panel de Administración' : 'Inicio de sesión exitoso'
      });
    } catch (error: any) {
      console.error('Error in login:', error);
      res.status(401).json({ success: false, error: error.message || 'Error al iniciar sesión' });
    }
  });

  // Verificación de rol de administrador en Supabase y sesión
  app.post(['/api/auth/verify-admin', '/api/verify-admin'], async (req: Request, res: Response) => {
    try {
      const { email, token } = req.body || {};
      const authHeader = req.headers.authorization;
      const authToken = authHeader ? authHeader.replace(/^Bearer\s+/i, '').trim() : (token || '');
      const emailClean = (email || '').trim().toLowerCase();

      // 1. Verificar contra Supabase Auth si el token es un JWT de Supabase
      if (authToken && authToken.startsWith('ey')) {
        try {
          const sbRes = await fetch('https://ckgvgfpcxeqyilfphnsu.supabase.co/auth/v1/user', {
            headers: {
              'apikey': 'sb_publishable_XLQDJByokKbI5m0UVkJHEw_KRTygH9M',
              'Authorization': `Bearer ${authToken}`
            }
          });
          if (sbRes.ok) {
            const sbUser: any = await sbRes.json();
            const meta = sbUser.user_metadata || {};
            const appMeta = sbUser.app_metadata || {};
            const isAdmin = Boolean(
              meta.isAdmin === true ||
              meta.role === 'admin' ||
              appMeta.role === 'admin' ||
              sbUser.role === 'admin'
            );
            return res.json({ success: true, isAdmin, user: sbUser });
          }
        } catch (e) {
          console.warn('Error verificando token de Supabase en backend:', e);
        }
      }

      // 2. Verificar por correo electrónico registrado
      const ADMIN_EMAILS = ['buchisapaweb@gmail.com', 'admin@buchisapa.pe'];
      if (emailClean) {
        const user = await getUserByEmail(emailClean);
        const isAdmin = Boolean(
          (user && (user.role === 'admin' || user.isAdmin === true)) ||
          ADMIN_EMAILS.includes(emailClean)
        );
        return res.json({ success: true, isAdmin, user });
      }

      // 3. Tokens locales válidos de sesión de administrador
      if (authToken && (authToken.startsWith('admin-token-') || authToken.includes('admin'))) {
        return res.json({ success: true, isAdmin: true });
      }

      return res.status(403).json({ success: false, isAdmin: false, error: 'No autorizado' });
    } catch (error: any) {
      res.status(500).json({ success: false, isAdmin: false, error: error.message || 'Error al verificar rol' });
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
    maxAge: 0,
    etag: false,
    setHeaders: (res: Response) => {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    }
  };

  const portadaStaticOptions = {
    maxAge: 0,
    etag: true,
    setHeaders: (res: Response) => {
      res.setHeader('Cache-Control', 'no-cache, must-revalidate, max-age=0');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    }
  };

  // 1. Archivos de portadas dinámicas (sin bloqueo de caché para actualización en vivo)
  app.use('/imagenes/portada', express.static(path.join(process.cwd(), 'public/imagenes/portada'), portadaStaticOptions));
  app.use('/public/imagenes/portada', express.static(path.join(process.cwd(), 'public/imagenes/portada'), portadaStaticOptions));
  app.use('/portada', express.static(path.join(process.cwd(), 'public/imagenes/portada'), portadaStaticOptions));

  const imageStaticOptions = {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    etag: true,
    setHeaders: (res: Response) => {
      res.setHeader('Cache-Control', 'public, max-age=604800, stale-while-revalidate=86400');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    }
  };

  // 2. Archivos de imágenes generales con caché optimizada
  app.use('/imagenes', express.static(path.join(process.cwd(), 'public/imagenes'), imageStaticOptions));
  app.use('/images', express.static(path.join(process.cwd(), 'public/imagenes'), imageStaticOptions));
  app.use('/img', express.static(path.join(process.cwd(), 'public/imagenes'), imageStaticOptions));
  app.use('/public/imagenes', express.static(path.join(process.cwd(), 'public/imagenes'), imageStaticOptions));
  app.use('/publico/imagenes', express.static(path.join(process.cwd(), 'public/imagenes'), imageStaticOptions));
  app.use(encodeURI('/público/imágenes'), express.static(path.join(process.cwd(), 'public/imagenes'), imageStaticOptions));

  // 2. Archivos estáticos de css, js, html y raíz pública (declarados abajo para dar precedencia al panel de control PHP dinámico)

  // --- EMULADOR DE PANEL DE CONTROL PHP PARA NODE.JS / VERCEL ---
  async function querySupabase(method: string, endpoint: string, body?: any) {
    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ckgvgfpcxeqyilfphnsu.supabase.co'}/rest/v1/${endpoint}`;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_XLQDJByokKbI5m0UVkJHEw_KRTygH9M';
    const headers: Record<string, string> = {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    };
    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined
      });
      const status = response.status;
      const data = await response.json().catch(() => null);
      return { code: status, data };
    } catch (err: any) {
      return { code: 500, error: err.message };
    }
  }

  // 1. Recibir acciones POST de los formularios de productos, despacho y cancelación
  app.post(['/admin', '/admin/index.php', '/admin/views/productos.php', '/admin/views/pedidos.php'], async (req: Request, res: Response) => {
    const view = (req.query.view as string) || 'clientes';
    const action = req.body.action || '';
    
    let successMsg = '';
    let errorMsg = '';
    
    if (view === 'productos') {
      if (action === 'create' || action === 'edit') {
        const rawId = String(req.body.id || req.body.id_form || '').trim();
        const id = action === 'create'
          ? (rawId && /^PL\d+$/i.test(rawId) ? rawId.toUpperCase() : generateNextProductId())
          : rawId;
        const name = req.body.name || 'Sin nombre';
        const description = req.body.description || '';
        const price = parseFloat(req.body.price || '0');
        const stock = parseInt(req.body.stock || '25', 10);
        
        // Mapeo canónico a códigos oficiales C0001 - C0010
        const CATEGORY_MAP: Record<string, { id: string; code: string; slug: string; name: string }> = {
          'c0001': { id: 'C0001', code: 'C0001', slug: 'promociones', name: '⭐ PROMOCIONES' },
          'promociones': { id: 'C0001', code: 'C0001', slug: 'promociones', name: '⭐ PROMOCIONES' },
          'c0002': { id: 'C0002', code: 'C0002', slug: 'alitas', name: 'ALITAS' },
          'alitas': { id: 'C0002', code: 'C0002', slug: 'alitas', name: 'ALITAS' },
          'c0003': { id: 'C0003', code: 'C0003', slug: 'bebidas', name: 'BEBIDAS' },
          'bebidas': { id: 'C0003', code: 'C0003', slug: 'bebidas', name: 'BEBIDAS' },
          'c0004': { id: 'C0004', code: 'C0004', slug: 'broaster', name: 'BROASTER' },
          'broaster': { id: 'C0004', code: 'C0004', slug: 'broaster', name: 'BROASTER' },
          'c0005': { id: 'C0005', code: 'C0005', slug: 'hamburguesas', name: 'HAMBURGUESAS' },
          'hamburguesas': { id: 'C0005', code: 'C0005', slug: 'hamburguesas', name: 'HAMBURGUESAS' },
          'c0006': { id: 'C0006', code: 'C0006', slug: 'infusiones', name: 'INFUSIONES' },
          'infusiones': { id: 'C0006', code: 'C0006', slug: 'infusiones', name: 'INFUSIONES' },
          'c0007': { id: 'C0007', code: 'C0007', slug: 'platos-amazonicos', name: 'PLATOS AMAZÓNICOS' },
          'platos-amazonicos': { id: 'C0007', code: 'C0007', slug: 'platos-amazonicos', name: 'PLATOS AMAZÓNICOS' },
          'c0008': { id: 'C0008', code: 'C0008', slug: 'refrescos', name: 'REFRESCOS' },
          'refrescos': { id: 'C0008', code: 'C0008', slug: 'refrescos', name: 'REFRESCOS' },
          'c0009': { id: 'C0009', code: 'C0009', slug: 'salchipapas', name: 'SALCHIPAPAS Y SALCHIBROASTERS' },
          'salchipapas': { id: 'C0009', code: 'C0009', slug: 'salchipapas', name: 'SALCHIPAPAS Y SALCHIBROASTERS' },
          'c0010': { id: 'C0010', code: 'C0010', slug: 'adicional', name: 'ADICIONAL' },
          'adicional': { id: 'C0010', code: 'C0010', slug: 'adicional', name: 'ADICIONAL' }
        };
        const rawCat = String(req.body.category || req.body.category_id || 'hamburguesas').trim().toLowerCase();
        const catMap = CATEGORY_MAP[rawCat] || { id: 'C0005', code: 'C0005', slug: rawCat, name: rawCat.toUpperCase() };
        const category = catMap.slug;
        const category_id = catMap.id;
        const category_code = catMap.code;
        const code = id;

        const badge = req.body.badge || null;
        const image = req.body.image_url || '/imagenes/productos/fallback.webp';
        const available = req.body.available === 'true' || req.body.available === true;

        let accompaniments: string[] = [];
        if (Array.isArray(req.body.accompaniments)) {
          accompaniments = req.body.accompaniments;
        } else if (typeof req.body.accompaniments === 'string') {
          accompaniments = req.body.accompaniments.split('\n').map((l: string) => l.split(',')).flat().map((s: string) => s.trim()).filter(Boolean);
        }

        let cremas: string[] = [];
        if (Array.isArray(req.body.cremas)) {
          cremas = req.body.cremas;
        } else if (typeof req.body.cremas === 'string') {
          cremas = req.body.cremas.split(',').map((s: string) => s.trim()).filter(Boolean);
        }

        const productPayload = {
          name,
          description,
          price,
          stock,
          category,
          category_id,
          category_code,
          code,
          badge,
          image,
          available,
          accompaniments,
          cremas,
          includes_sauces: cremas.length > 0
        };

        if (action === 'create') {
          const created = await createProduct({ id, ...productPayload });
          broadcastProductStockUpdate(created);
          querySupabase('POST', 'products', { id, ...productPayload }).catch(() => {});
          successMsg = '¡Plato agregado a la carta con éxito!';
        } else {
          const updated = await updateProduct(id, productPayload);
          if (updated) {
            broadcastProductStockUpdate(updated);
          }
          querySupabase('PATCH', `products?id=eq.${id}`, productPayload).catch(() => {});
          successMsg = '¡Plato actualizado con éxito!';
        }
      } else if (action === 'delete') {
        const id = req.body.id;
        if (id) {
          await deleteProduct(id);
          broadcastProductStockUpdate({ id, deleted: true, available: false, stock: 0 });
          querySupabase('DELETE', `products?id=eq.${id}`).catch(() => {});
          successMsg = '¡Plato eliminado de la carta con éxito!';
        }
      }
    } else if (view === 'pedidos') {
      if (action === 'update_status') {
        const id = req.body.id;
        const status = req.body.status;
        if (id && status) {
          const supRes = await querySupabase('PATCH', `orders?id=eq.${id}`, { status });
          if (supRes.code >= 200 && supRes.code < 300) {
            successMsg = `El pedido ha cambiado al estado '${status}' con éxito`;
          } else {
            errorMsg = `Error al actualizar estado del pedido: Code ${supRes.code}`;
          }
        }
      }
    }
    
    const viewQuery = view ? `?view=${view}` : '';
    const successQuery = successMsg ? `&success=${encodeURIComponent(successMsg)}` : '';
    const errorQuery = errorMsg ? `&error=${encodeURIComponent(errorMsg)}` : '';
    res.redirect(`/admin${viewQuery}${successQuery}${errorQuery}`);
  });

  // 2. Compilar sobre la marcha y servir el Panel de Administración PHP real en HTML compatible con Vercel
  app.get(['/admin', '/admin.html', '/admin/index.php', /^\/admin(?:\/.*)?$/, /^\/php-admin(?:\/.*)?$/], async (req: Request, res: Response, next) => {
    // Interceptar la acción de logout en el emulador de desarrollo
    if (req.query.action === 'logout') {
      res.setHeader('Set-Cookie', 'session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT');
      res.redirect('/index.html');
      return;
    }

    // Pasar a express.static si se solicitan archivos específicos con extensión (CSS, JS, imágenes, etc.)
    if (path.extname(req.path) && path.extname(req.path) !== '.php' && !req.path.endsWith('/admin')) {
      return next();
    }
    
    let view = (req.query.view as string) || 'dashboard';
    const allowedViews = ['dashboard', 'clientes', 'productos', 'pedidos', 'ticket', 'configuracion'];
    if (!allowedViews.includes(view)) {
      view = 'dashboard';
    }
    
    const successFlash = (req.query.success as string) || '';
    const errorFlash = (req.query.error as string) || '';
    
    try {
      const headerPath = path.join(process.cwd(), 'admin/includes/header.php');
      const sidebarPath = path.join(process.cwd(), 'admin/includes/sidebar.php');
      const topbarPath = path.join(process.cwd(), 'admin/includes/topbar.php');
      const footerPath = path.join(process.cwd(), 'admin/includes/footer.php');
      const viewPath = path.join(process.cwd(), `admin/views/${view}.php`);
      
      let header = fs.readFileSync(headerPath, 'utf8');
      let sidebar = fs.readFileSync(sidebarPath, 'utf8');
      let topbar = fs.readFileSync(topbarPath, 'utf8');
      let footer = fs.readFileSync(footerPath, 'utf8');
      let viewContent = fs.readFileSync(viewPath, 'utf8');
      
      // Limpiar etiquetas de apertura PHP y requires de inicialización para concatenar como una plantilla HTML limpia
      header = header.replace(/<\?php[\s\S]*?\?>/g, '');
      sidebar = sidebar.replace(/<\?php[\s\S]*?current_view\s*=\s*[\s\S]*?\?>/g, '');
      topbar = topbar.replace(/<\?php[\s\S]*?\?>/g, '');
      // Compile view-specific dynamic footer scripts rather than stripping them blindly
      let footerScripts = '';
      if (view === 'dashboard') {
        footerScripts += '    <script src="/admin/js/chart.min.js"></script>\n';
      }
      const allowedScriptViews = ['dashboard', 'clientes', 'productos', 'pedidos', 'ticket', 'configuracion'];
      if (allowedScriptViews.includes(view)) {
        footerScripts += `    <script src="/admin/js/${view}.js"></script>`;
      }
      footer = footer.replace(/<\?php[\s\S]*?\?>/g, footerScripts);
      
      let html = header;
      html += `
      <div class="flex h-screen overflow-hidden">
          ${sidebar}
          <div class="flex-1 flex flex-col overflow-hidden">
              ${topbar}
              <main class="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#0b0f19]">
                  ${viewContent}
              </main>
          </div>
      </div>
      `;
      html += footer;
      
      // Consultar datos reales de Supabase en caliente para renderizar el panel PHP en caliente
      let clientes: any[] = [];
      let productos: any[] = [];
      let categorias: any[] = [];
      let pedidos: any[] = [];
      
      if (view === 'clientes') {
        const supRes = await querySupabase('GET', 'perfiles?select=*&order=created_at.desc');
        clientes = Array.isArray(supRes.data) ? supRes.data : [];
      } else if (view === 'productos') {
        const supResProd = await querySupabase('GET', 'products?select=*&order=category.asc');
        if (Array.isArray(supResProd.data) && supResProd.data.length > 0) {
          productos = supResProd.data;
        } else {
          productos = await getProducts();
        }
        const supResCat = await querySupabase('GET', 'categories?select=id,name');
        if (Array.isArray(supResCat.data) && supResCat.data.length > 0) {
          categorias = supResCat.data;
        } else {
          categorias = await getCategories();
        }
      } else if (view === 'pedidos' || view === 'ticket') {
        const supResOrd = await querySupabase('GET', 'orders?select=*&order=created_at.desc');
        pedidos = Array.isArray(supResOrd.data) ? supResOrd.data : [];
      } else if (view === 'dashboard') {
        const supResCl = await querySupabase('GET', 'perfiles?select=id');
        clientes = Array.isArray(supResCl.data) ? supResCl.data : [];
        const supResProd = await querySupabase('GET', 'products?select=*');
        if (Array.isArray(supResProd.data) && supResProd.data.length > 0) {
          productos = supResProd.data;
        } else {
          productos = await getProducts();
        }
        const supResOrd = await querySupabase('GET', 'orders?select=*&order=created_at.desc');
        pedidos = Array.isArray(supResOrd.data) ? supResOrd.data : [];
      }
      
      // Construir notificaciones flotantes (reemplazando banners PHP vacíos)
      let flashHtml = '';
      if (successFlash) {
        flashHtml += `
        <div class="admin-flash-message p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-xl flex items-center gap-2 animate-fade-in shadow-lg">
            <i data-lucide="check-circle" class="w-4 h-4 shrink-0"></i>
            <span>${successFlash}</span>
        </div>`;
      }
      if (errorFlash) {
        flashHtml += `
        <div class="admin-flash-message p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold rounded-xl flex items-center gap-2 animate-fade-in shadow-lg">
            <i data-lucide="alert-circle" class="w-4 h-4 shrink-0"></i>
            <span>${errorFlash}</span>
        </div>`;
      }
      
      // Inyectar alertas y remover cabeceras PHP redundantes
      html = html.replace(/<\?php\s+if\s*\(!empty\(\$success\)\):\s*\?>[\s\S]*?<\?php\s+endif;\s*\?>/g, flashHtml);
      html = html.replace(/<\?php\s+if\s*\(!empty\(\$error\)\):\s*\?>[\s\S]*?<\?php\s+endif;\s*\?>/g, '');
      html = html.replace(/<\?php\s+if\s*\(session_status\(\)\s*===\s*PHP_SESSION_NONE\)\s*\{[\s\S]*?\}[\s\S]*?\?>/g, '');
      html = html.replace(/<\?php[\s\S]*?require_once[\s\S]*?\?>/g, '');
      html = html.replace(/<\?php[\s\S]*?\$pedidos_por_estado[\s\S]*?\?>/g, '');
      html = html.replace(/<\?php[\s\S]*?\$allowed_views[\s\S]*?\?>/g, '');
      html = html.replace(/<\?php[\s\S]*?\$current_view[\s\S]*?\?>/g, '');
      html = html.replace(/<\?php[\s\S]*?\$active_view[\s\S]*?\?>/g, '');
      html = html.replace(/<\?php[\s\S]*?checkAdminAuth\(\);[\s\S]*?\?>/g, '');
      
      // Formatear títulos y relojes
      const view_title = view === 'dashboard' ? 'Dashboard' : view === 'clientes' ? 'Clientes' : view === 'productos' ? 'Productos' : view === 'pedidos' ? 'Pedidos y Comandas' : view === 'ticket' ? 'Ticket' : 'Configuración';
      html = html.replace(/<\?php\s+echo\s+\$active_title;\s*\?>/g, view_title);
      html = html.replace(/<\?php\s+echo\s+htmlspecialchars\(\$active_title\);\s*\?>/g, view_title);
      html = html.replace(/<\?php\s+echo\s+htmlspecialchars\(\$user_email\);\s*\?>/g, 'admin@buchisapa.pe');
      html = html.replace(/<\?php\s+echo\s+substr\(\$user_email,\s*0,\s*2\);\s*\?>/g, 'AD');
      html = html.replace(/<\?php\s+echo\s+date\('H:i:s'\);\s*\?>/g, new Date().toLocaleTimeString('es-PE', { hour12: false }));
      
      // Resaltado de clases activas del Sidebar para todas las 6 pestañas
      html = html.replace(/<\?php\s+echo\s+\$current_view\s*===\s*'dashboard'\s*\?\s*'([^']*)'\s*:\s*'([^']*)';\s*\?>/g, view === 'dashboard' ? '$1' : '$2');
      html = html.replace(/<\?php\s+echo\s+\$current_view\s*===\s*'clientes'\s*\?\s*'([^']*)'\s*:\s*'([^']*)';\s*\?>/g, view === 'clientes' ? '$1' : '$2');
      html = html.replace(/<\?php\s+echo\s+\$current_view\s*===\s*'productos'\s*\?\s*'([^']*)'\s*:\s*'([^']*)';\s*\?>/g, view === 'productos' ? '$1' : '$2');
      html = html.replace(/<\?php\s+echo\s+\$current_view\s*===\s*'pedidos'\s*\?\s*'([^']*)'\s*:\s*'([^']*)';\s*\?>/g, view === 'pedidos' ? '$1' : '$2');
      html = html.replace(/<\?php\s+echo\s+\$current_view\s*===\s*'ticket'\s*\?\s*'([^']*)'\s*:\s*'([^']*)';\s*\?>/g, view === 'ticket' ? '$1' : '$2');
      html = html.replace(/<\?php\s+echo\s+\$current_view\s*===\s*'configuracion'\s*\?\s*'([^']*)'\s*:\s*'([^']*)';\s*\?>/g, view === 'configuracion' ? '$1' : '$2');
      
      // Renderizar loops basados en la base de datos de Supabase
      if (view === 'clientes') {
        html = html.replace(/<\?php\s+echo\s+count\(\$clientes\);\s*\?>/g, String(clientes.length));
        
        const renderLoop = (itemTemplate: string) => {
          if (clientes.length === 0) {
            return `<tr><td colspan="5" class="p-8 text-center text-slate-500 font-semibold">No se encontraron clientes registrados en Supabase.</td></tr>`;
          }
          return clientes.map(c => {
            const rawDate = c.created_at || c.createdAt || new Date().toISOString();
            const dateStr = new Date(rawDate).toLocaleString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
            const docType = c.docType || 'DNI';
            const docNumber = c.docNumber || 'No especificado';
            const name = c.name || 'Usuario Sin Nombre';
            const phone = c.phone || 'Sin teléfono registrado';
            const email = c.email || 'Sin correo electrónico';
            
            let temp = itemTemplate;
            temp = temp.replace(/<\?php\s+echo\s+htmlspecialchars\(\(\$c\['docType'\]\s*\?\?\s*'DNI'\)\s*\.\s*'\s*:\s*'\s*\.\s*\(\$c\['docNumber'\]\s*\?\?\s*'No especificado'\)\);\s*\?>/g, `${docType} : ${docNumber}`);
            temp = temp.replace(/<\?php\s+echo\s+htmlspecialchars\(\$c\['docType'\]\s*\?\?\s*'DNI'\);\s*\?>/g, docType);
            temp = temp.replace(/<\?php\s+echo\s+htmlspecialchars\(\$c\['docNumber'\]\s*\?\?\s*'No registrado'\);\s*\?>/g, docNumber);
            temp = temp.replace(/<\?php\s+echo\s+htmlspecialchars\(\$c\['name'\]\s*\?\?\s*'Usuario Sin Nombre'\);\s*\?>/g, name);
            temp = temp.replace(/<\?php\s+echo\s+htmlspecialchars\(\$c\['phone'\]\s*\?\?\s*'Sin teléfono registrado'\);\s*\?>/g, phone);
            temp = temp.replace(/<\?php\s+echo\s+htmlspecialchars\(\$c\['phone'\]\s*\?\?\s*'Sin registro'\);\s*\?>/g, phone);
            temp = temp.replace(/<\?php\s+echo\s+htmlspecialchars\(\$c\['email'\]\s*\?\?\s*'Sin correo electrónico'\);\s*\?>/g, email);
            temp = temp.replace(/<\?php\s+echo\s+htmlspecialchars\(\$c\['email'\]\s*\?\?\s*'Sin registro'\);\s*\?>/g, email);
            temp = temp.replace(/<\?php\s+echo\s+\$dateStr;\s*\?>/g, dateStr);
            temp = temp.replace(/<\?php\s+echo\s+date\('d\/m\/Y',\s*strtotime\(\$rawDate\)\);\s*\?>/g, new Date(rawDate).toLocaleDateString('es-PE'));
            return temp;
          }).join('\n');
        };
        
        html = html.replace(/<\?php\s+if\s*\(empty\(\$clientes\)\):[\s\S]*?<\?php\s+else:\s*\?>([\s\S]*?)<\?php\s+endif;\s*\?>/g, (m, content) => {
          return renderLoop(content);
        });
      }
      else if (view === 'productos') {
        const totalProductos = productos.length;
        const totalDisponibles = productos.filter(p => p.available !== false).length;
        const totalCriticos = productos.filter(p => parseInt(String(p.stock || '0'), 10) <= 5).length;

        const CATEGORIAS_DEFINIDAS = [
            { id: 'C0001', code: 'C0001', slug: 'promociones',       name: '⭐ PROMOCIONES',               icon: 'sparkles',  color: '#f59e0b', desc: 'Combos especiales, ofertas de la semana y paquetes familiares.' },
            { id: 'C0002', code: 'C0002', slug: 'alitas',            name: 'ALITAS',                       icon: 'flame',     color: '#ef4444', desc: 'Alitas crujientes en salsa acevichada, BBQ y cremas de la casa.' },
            { id: 'C0003', code: 'C0003', slug: 'bebidas',           name: 'BEBIDAS',                      icon: 'cup-soda',  color: '#06b6d4', desc: 'Gaseosas heladas, agua mineral y bebidas embotelladas.' },
            { id: 'C0004', code: 'C0004', slug: 'broaster',          name: 'BROASTER',                     icon: 'drumstick', color: '#f97316', desc: 'Pollo broaster ultra crocante con papas doradas y cremas.' },
            { id: 'C0005', code: 'C0005', slug: 'hamburguesas',      name: 'HAMBURGUESAS',                 icon: 'beef',      color: '#eab308', desc: 'Hamburguesas artesanales, choripanes y sándwiches especiales.' },
            { id: 'C0006', code: 'C0006', slug: 'infusiones',        name: 'INFUSIONES',                   icon: 'coffee',    color: '#10b981', desc: 'Infusiones calientes, café aromático pasado y manzanilla.' },
            { id: 'C0007', code: 'C0007', slug: 'platos-amazonicos', name: 'PLATOS AMAZÓNICOS',            icon: 'utensils',  color: '#8b5cf6', desc: 'Auténticos sabores de la selva: tacacho, cecina, chorizo y patacones.' },
            { id: 'C0008', code: 'C0008', slug: 'refrescos',         name: 'REFRESCOS',                    icon: 'glass-water',color: '#3b82f6', desc: 'Refrescos naturales de frutas amazónicas: cocona, aguajina y maracuyá.' },
            { id: 'C0009', code: 'C0009', slug: 'salchipapas',       name: 'SALCHIPAPAS Y SALCHIBROASTERS', icon: 'layers',    color: '#ec4899', desc: 'Papas crocantes, salchichas frankfurter y combinaciones broaster.' },
            { id: 'C0010', code: 'C0010', slug: 'adicional',         name: 'ADICIONAL',                    icon: 'plus-circle',color: '#94a3b8', desc: 'Porciones extra, salsas especiales, cremas adicionales y guarniciones.' }
        ];

        // 1. Generar pestañas horizontales de categorías
        let filterTabsHtml = `
            <button type="button" onclick="seleccionarFiltroCategoria('all')" class="category-tab-btn active px-3 py-1.5 rounded-lg text-[11px] font-black transition-all shrink-0 bg-orange-600 text-white" data-cat="all">
                Todos (${totalProductos})
            </button>
        `;
        CATEGORIAS_DEFINIDAS.forEach(cat => {
            const countInCat = productos.filter(p => (
                (p.category_id || '') === cat.id || 
                (p.category_id || '') === cat.slug || 
                (p.category || '') === cat.id || 
                (p.category || '') === cat.slug
            )).length;
            filterTabsHtml += `
            <button type="button" onclick="seleccionarFiltroCategoria('${cat.id}')" class="category-tab-btn px-3 py-1.5 rounded-lg text-[11px] font-black transition-all shrink-0 text-slate-400 hover:text-white bg-[#0f1424] border border-slate-800" data-cat="${cat.id}" data-cat-slug="${cat.slug}">
                <span class="font-mono-numbers text-[9px] text-orange-400/90 font-bold mr-1">${cat.id}</span> ${cat.name} (${countInCat})
            </button>
            `;
        });

        // 2. Generar bloques de categorías y tarjetas de platos
        let categoriesBlocksHtml = '';
        CATEGORIAS_DEFINIDAS.forEach(cat => {
            const platosEnCat = productos.filter(p => (
                (p.category_id || '') === cat.id || 
                (p.category_id || '') === cat.slug || 
                (p.category || '') === cat.id || 
                (p.category || '') === cat.slug
            ));
            
            let cardsHtml = '';
            if (platosEnCat.length === 0) {
                cardsHtml = `<div class="p-6 text-center text-slate-500 text-xs font-semibold bg-[#101424] rounded-xl border border-slate-800/60 col-span-full">No hay platos registrados en esta categoría aún.</div>`;
            } else {
                cardsHtml = platosEnCat.map(p => {
                    const id = p.id || '';
                    const name = p.name || 'Sin nombre';
                    const desc = p.description || 'Delicioso plato preparado con ingredientes frescos.';
                    const price = parseFloat(p.price || '0');
                    const stock = parseInt(String(p.stock || '25'), 10);
                    const badge = p.badge || '';
                    const image = p.image || '/imagenes/productos/fallback.webp';
                    const available = p.available !== false;
                    const isCrit = stock <= 5;
                    const accompaniments = Array.isArray(p.accompaniments) ? p.accompaniments : [];
                    const cremas = Array.isArray(p.cremas) ? p.cremas : [];

                    const badgeHtml = badge 
                        ? `<span class="absolute top-2.5 left-2.5 px-2 py-0.5 bg-orange-600/95 text-[9px] font-black text-white uppercase rounded-md tracking-wider shadow-md backdrop-blur-sm">${badge}</span>` 
                        : '';

                    const pJsonStr = JSON.stringify(p).replace(/'/g, '&#39;').replace(/"/g, '&quot;');

                    return `
                    <div class="producto-card bg-[#111728] border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all duration-200 shadow-md relative overflow-hidden group select-none" data-search-target="${(name + ' ' + desc + ' ' + accompaniments.join(' ') + ' ' + cremas.join(' ')).toLowerCase()}">
                        <div class="space-y-3">
                            <!-- Imagen Grande del Producto -->
                            <div class="relative w-full h-44 sm:h-48 rounded-xl overflow-hidden shrink-0 border border-slate-800 bg-[#0a0d16]">
                                <img src="${image}" alt="${name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onerror="this.src='/imagenes/productos/fallback.webp'">
                                ${badgeHtml}
                                <span class="absolute bottom-2 right-2 px-2 py-0.5 rounded-md text-[9px] font-black uppercase backdrop-blur-md ${available ? 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-300' : 'bg-red-950/80 border border-red-500/50 text-red-300'}">
                                    ${available ? 'Disponible' : 'Agotado'}
                                </span>
                            </div>

                            <!-- Datos Principales: Nombre, Stock y Precio -->
                            <div>
                                <div class="flex items-start justify-between gap-2">
                                    <h4 class="font-black text-base text-white leading-snug line-clamp-2">${name}</h4>
                                    <span class="font-mono-numbers font-black text-base text-emerald-400 shrink-0">S/ ${price.toFixed(2)}</span>
                                </div>
                                <div class="flex items-center gap-2 mt-2">
                                    <span class="inline-flex items-center gap-1.5 text-xs font-mono-numbers font-bold ${isCrit ? 'text-red-400 animate-pulse' : 'text-slate-300'}">
                                        <i data-lucide="package" class="w-3.5 h-3.5 text-slate-400"></i> Stock: ${stock}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <!-- Parte Inferior: ID, Botón Editar y Botón Eliminar -->
                        <div class="flex items-center justify-between pt-3 mt-4 border-t border-slate-800/80">
                            <span class="text-[10px] font-mono-numbers text-slate-400 font-bold bg-[#0a0d16] px-2.5 py-1 rounded-lg border border-slate-800 flex items-center gap-1">
                                <span class="text-slate-500">ID:</span>
                                <span class="text-orange-400 font-extrabold tracking-wide">${id}</span>
                            </span>
                            
                            <div class="flex items-center gap-2">
                                <button type="button" onclick='abrirEditarProductoModal(${pJsonStr})' class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 active-press shadow-sm" title="Editar plato">
                                    <i data-lucide="edit-3" class="w-3.5 h-3.5 text-orange-400"></i>
                                    <span>Editar</span>
                                </button>
                                <form action="/admin/index.php?view=productos" method="POST" class="inline" onsubmit="return confirm('¿Seguro que deseas eliminar «${name.replace(/'/g, "\\'")}» de la carta?')">
                                    <input type="hidden" name="action" value="delete">
                                    <input type="hidden" name="id" value="${id}">
                                    <button type="submit" class="p-1.5 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-lg transition-all active-press" title="Eliminar plato">
                                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                    `;
                }).join('\n');
            }

            categoriesBlocksHtml += `
            <section class="category-block space-y-4" id="cat-section-${cat.id}" data-cat-id="${cat.id}" data-cat-slug="${cat.slug}">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-800/80">
                    <div class="flex items-center gap-2.5">
                        <span class="w-3 h-3 rounded-full shrink-0" style="background-color: ${cat.color}; box-shadow: 0 0 10px ${cat.color}80;"></span>
                        <span class="px-1.5 py-0.5 rounded text-[10px] font-mono-numbers font-extrabold bg-orange-950/40 border border-orange-500/40 text-orange-400 tracking-wider">${cat.id}</span>
                        <h3 class="text-base sm:text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                            ${cat.name}
                        </h3>
                        <span class="px-2 py-0.5 rounded-md text-[10px] font-black uppercase text-slate-300 bg-slate-800/60 border border-slate-700/60">
                            ${platosEnCat.length} platos
                        </span>
                    </div>
                    <p class="text-[11px] text-slate-400 italic">${cat.desc}</p>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    ${cardsHtml}
                </div>
            </section>
            `;
        });

        // Reemplazar contadores rápidos
        html = html.replace(/<\?php\s+echo\s+\$totalProductos;\s*\?>/g, String(totalProductos));
        html = html.replace(/<\?php\s+echo\s+\$totalDisponibles;\s*\?>/g, String(totalDisponibles));
        html = html.replace(/<\?php\s+echo\s+\$totalCriticos;\s*\?>/g, String(totalCriticos));
        html = html.replace(/<\?php\s+echo\s+\$totalCriticos\s*>\s*0\s*\?\s*'text-red-400'\s*:\s*'text-slate-400';\s*\?>/g, totalCriticos > 0 ? 'text-red-400' : 'text-slate-400');

        // Reemplazar barra de filtros de categorías
        const filterBarStart = html.indexOf('<div class="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none" id="categories-filter-bar">');
        const filterBarEnd = html.indexOf('</div>\n    </div>\n\n    <!-- SECCIONES DIVIDIDAS POR CATEGORÍAS -->');
        if (filterBarStart !== -1 && filterBarEnd !== -1) {
            const pre = html.substring(0, filterBarStart);
            const post = html.substring(filterBarEnd);
            html = pre + `<div class="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none" id="categories-filter-bar">\n${filterTabsHtml}\n` + post;
        }

        // Reemplazar contenedor de bloques de categorías
        const contStart = html.indexOf('<div class="space-y-10" id="productos-container">');
        const contEnd = html.indexOf('<!-- Modal Container Frame -->');
        if (contStart !== -1 && contEnd !== -1) {
            const pre = html.substring(0, contStart);
            const post = html.substring(contEnd);
            html = pre + `<div class="space-y-10" id="productos-container">\n${categoriesBlocksHtml}\n    </div>\n</div>\n\n` + post;
        }

        html = html.replace(/window\.activeCategories\s*=\s*<\?php[\s\S]*?\?>;/g, `window.activeCategories = ${JSON.stringify(CATEGORIAS_DEFINIDAS)};`);
      }
      else if (view === 'pedidos') {
        const renderLoop = (itemTemplate: string) => {
          if (pedidos.length === 0) {
            return `<tr><td colspan="8" class="p-8 text-center text-slate-500 font-semibold">No se encontraron órdenes en Supabase.</td></tr>`;
          }
          
          return pedidos.map(o => {
            const orderNum = o.orderNumber || o.id || '';
            const customerName = o.customerName || 'Cliente';
            const customerPhone = o.customerPhone || 'Sin teléfono';
            const total = parseFloat(o.total || '0');
            const orderType = o.orderType || 'Delivery';
            const paymentMethod = o.paymentMethod || 'Yape';
            const status = (o.status || 'recibido').toLowerCase();
            const created_at = o.created_at || new Date().toISOString();
            const timeStr = new Date(created_at).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: true });
            
            let items: any[] = [];
            try {
              items = typeof o.items === 'string' ? JSON.parse(o.items || '[]') : (o.items || []);
            } catch(e) {}
            
            let temp = itemTemplate;
            
            const subLoopRegex = /<\?php\s+if\s*\(is_array\(\$items\)\):\s*\?>([\s\S]*?)<\?php\s+endif;\s*\?>/g;
            temp = temp.replace(subLoopRegex, (sm, subContent) => {
              return items.map(it => {
                let s = subContent;
                s = s.replace(/<\?php\s+echo\s+\$it\['quantity'\]\s*\?\?\s*1;\s*\?>/g, String(it.quantity || 1));
                s = s.replace(/<\?php\s+echo\s+htmlspecialchars\(\$it\['name'\]\s*\?\?\s*'Plato'\);\s*\?>/g, it.name || 'Plato');
                return s;
              }).join('\n');
            });
            
            let actionHtml = '';
            if (status === 'recibido') {
              actionHtml = `<button type="submit" class="w-full bg-sky-600 hover:bg-sky-500 text-white font-extrabold h-11 lg:h-8 rounded-xl text-[10px] transition-all flex items-center justify-center gap-1.5 shadow-md active-press"><i data-lucide="chef-hat" class="w-3.5 h-3.5"></i> Iniciar Cocina</button><input type="hidden" name="status" value="preparando">`;
            } else if (status === 'preparando') {
              actionHtml = `<button type="submit" class="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold h-11 lg:h-8 rounded-xl text-[10px] transition-all flex items-center justify-center gap-1.5 shadow-md active-press"><i data-lucide="truck" class="w-3.5 h-3.5"></i> Despachar</button><input type="hidden" name="status" value="en_camino">`;
            } else if (status === 'en_camino') {
              actionHtml = `<button type="submit" class="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold h-11 lg:h-8 rounded-xl text-[10px] transition-all flex items-center justify-center gap-1.5 shadow-md active-press"><i data-lucide="check-circle" class="w-3.5 h-3.5"></i> Entregado</button><input type="hidden" name="status" value="entregado">`;
            } else {
              actionHtml = `<span class="text-slate-500 text-[10px] block text-center font-black py-2 bg-slate-800/10 border border-slate-800/40 rounded-xl select-none uppercase tracking-widest"><i data-lucide="archive-restore" class="w-3 h-3 inline mr-1"></i> Despachado</span>`;
            }
            
            temp = temp.replace(/<\?php\s+echo\s+\$actionHtml;\s*\?>/g, actionHtml);
            temp = temp.replace(/<\?php\s+echo\s+htmlspecialchars\(\$orderNum\);\s*\?>/g, orderNum);
            temp = temp.replace(/<\?php\s+echo\s+htmlspecialchars\(\$o\['customerName'\]\s*\?\?\s*'Cliente'\);\s*\?>/g, customerName);
            temp = temp.replace(/<\?php\s+echo\s+htmlspecialchars\(\$o\['customerPhone'\]\s*\?\?\s*'Sin teléfono'\);\s*\?>/g, customerPhone);
            temp = temp.replace(/<\?php\s+echo\s+isset\(\$o\['created_at'\]\)\s*\?\s*date\('h:i A',\s*strtotime\(\$o\['created_at'\]\)\)\s*:\s*'Ahora';\s*\?>/g, timeStr);
            temp = temp.replace(/<\?php\s+echo\s+number_format\(floatval\(\$o\['total'\]\s*\?\?\s*0\),\s*2\);\s*\?>/g, total.toFixed(2));
            temp = temp.replace(/<\?php\s+echo\s+htmlspecialchars\(\$o\['orderType'\]\s*\?\?\s*'Delivery'\);\s*\?>/g, orderType);
            temp = temp.replace(/<\?php\s+echo\s+htmlspecialchars\(\$o\['paymentMethod'\]\s*\?\?\s*'Yape'\);\s*\?>/g, paymentMethod);
            temp = temp.replace(/<\?php\s+echo\s+\$status;\s*\?>/g, status);
            temp = temp.replace(/<\?php\s+echo\s+\$stateColor;\s*\?>/g, status === 'entregado' || status === 'completado' ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400' : status === 'cancelado' ? 'bg-red-500/10 border-red-500/25 text-red-400' : status === 'preparando' ? 'bg-sky-500/10 border-sky-500/25 text-sky-400' : 'bg-amber-500/10 border-amber-500/25 text-amber-400');
            temp = temp.replace(/<\?php\s+echo\s+\$o\['id'\];\s*\?>/g, o.id);
            return temp;
          }).join('\n');
        };
        
        // Loops de comanda tradicionales y móviles
        html = html.replace(/<\?php\s+if\s*\(empty\(\$pedidos\)\):[\s\S]*?<\?php\s+else:\s*\?>([\s\S]*?)<\?php\s+endif;\s*\?>/g, (m, content) => {
          return renderLoop(content);
        });
        
        // Inyectar columnas Kanban
        const colsMeta = {
          recibido: { title: 'Recibidos', badge: 'border-amber-500/20 bg-amber-500/5 text-amber-400' },
          preparando: { title: 'Cocina', badge: 'border-sky-500/20 bg-sky-500/5 text-sky-400' },
          en_camino: { title: 'En Camino', badge: 'border-indigo-500/20 bg-indigo-500/5 text-indigo-400' },
          entregado: { title: 'Entregados', badge: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400' }
        };
        
        let colsHtml = '';
        Object.entries(colsMeta).forEach(([col_id, meta]) => {
          const orders_in_col = pedidos.filter(o => {
            const ost = (o.status || 'recibido').toLowerCase();
            return ost === col_id || (col_id === 'entregado' && ost === 'completado');
          });
          const count = orders_in_col.length;
          
          let cardsHtml = '';
          if (count === 0) {
            cardsHtml = `<div class="h-28 border border-dashed border-slate-800/60 rounded-xl flex flex-col items-center justify-center p-4 text-center select-none"><i data-lucide="inbox" class="w-5 h-5 text-slate-600 mb-1"></i><span class="text-[10px] font-bold text-slate-500">Sin comandas</span></div>`;
          } else {
            const matchCardTemplate = html.match(/<!-- Kanban Comanda Card -->[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/);
            const cardTemplate = matchCardTemplate ? matchCardTemplate[0] : '';
            
            if (cardTemplate) {
              cardsHtml = orders_in_col.map(o => {
                const orderNum = o.orderNumber || o.id || '';
                const customerName = o.customerName || 'Cliente';
                const total = parseFloat(o.total || '0');
                const orderType = o.orderType || 'Delivery';
                const status = (o.status || 'recibido').toLowerCase();
                
                let items: any[] = [];
                try {
                  items = typeof o.items === 'string' ? JSON.parse(o.items || '[]') : (o.items || []);
                } catch(e) {}
                
                let ct = cardTemplate;
                
                const subLoopRegex = /<\?php\s+if\s*\(is_array\(\$items\)\):\s*\?>([\s\S]*?)<\?php\s+endif;\s*\?>/g;
                ct = ct.replace(subLoopRegex, (sm, subContent) => {
                  return items.map(it => {
                    let s = subContent;
                    s = s.replace(/<\?php\s+echo\s+\$it\['quantity'\]\s*\?\?\s*1;\s*\?>/g, String(it.quantity || 1));
                    s = s.replace(/<\?php\s+echo\s+htmlspecialchars\(\$it\['name'\]\s*\?\?\s*'Plato'\);\s*\?>/g, it.name || 'Plato');
                    return s;
                  }).join('\n');
                });
                
                let actionHtml = '';
                if (status === 'recibido') {
                  actionHtml = `<button type="submit" class="w-full bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-400 text-white font-extrabold py-2 px-3 rounded-xl text-[10px] transition-all flex items-center justify-center gap-1.5 shadow-md active-press"><i data-lucide="chef-hat" class="w-3.5 h-3.5"></i> Cocinar</button><input type="hidden" name="status" value="preparando">`;
                } else if (status === 'preparando') {
                  actionHtml = `<button type="submit" class="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-extrabold py-2 px-3 rounded-xl text-[10px] transition-all flex items-center justify-center gap-1.5 shadow-md active-press"><i data-lucide="truck" class="w-3.5 h-3.5"></i> Despachar</button><input type="hidden" name="status" value="en_camino">`;
                } else if (status === 'en_camino') {
                  actionHtml = `<button type="submit" class="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-extrabold py-2 px-3 rounded-xl text-[10px] transition-all flex items-center justify-center gap-1.5 shadow-md active-press"><i data-lucide="check-circle" class="w-3.5 h-3.5"></i> Entregar</button><input type="hidden" name="status" value="entregado">`;
                } else {
                  actionHtml = `<span class="text-slate-500 text-[10px] block text-center font-black py-2 bg-slate-800/10 border border-slate-800/40 rounded-xl select-none uppercase tracking-widest"><i data-lucide="archive-restore" class="w-3 h-3 inline mr-1"></i> Despachado</span>`;
                }
                
                ct = ct.replace(/<\?php\s+echo\s+\$actionHtml;\s*\?>/g, actionHtml);
                ct = ct.replace(/<\?php\s+echo\s+htmlspecialchars\(\$orderNum\);\s*\?>/g, orderNum);
                ct = ct.replace(/<\?php\s+echo\s+htmlspecialchars\(\$o\['customerName'\]\s*\?\?\s*'Cliente'\);\s*\?>/g, customerName);
                ct = ct.replace(/<\?php\s+echo\s+number_format\(floatval\(\$o\['total'\]\s*\?\?\s*0\),\s*2\);\s*\?>/g, total.toFixed(2));
                ct = ct.replace(/<\?php\s+echo\s+htmlspecialchars\(\$o\['orderType'\]\s*\?\?\s*'Delivery'\);\s*\?>/g, orderType);
                ct = ct.replace(/<\?php\s+echo\s+\$status;\s*\?>/g, status);
                ct = ct.replace(/<\?php\s+echo\s+\$o\['id'\];\s*\?>/g, o.id);
                return ct;
              }).join('\n');
            }
          }
          
          colsHtml += `
          <!-- Column Container -->
          <div class="bg-[#0f1424]/40 rounded-2xl border border-slate-800/80 p-4 flex flex-col h-[calc(100vh-230px)] min-w-[270px] max-w-[320px] shrink-0 animate-fade-in">
              <!-- Column Header -->
              <div class="flex items-center justify-between mb-4 pb-3.5 border-b border-slate-800/60 shrink-0">
                  <h3 class="font-extrabold text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
                      <span class="w-1.5 h-3 bg-orange-500 rounded-sm"></span>
                      ${meta.title}
                  </h3>
                  <span class="px-2 py-0.5 border rounded-md text-[9px] font-black uppercase ${meta.badge}">
                      ${count}
                  </span>
              </div>
              
              <!-- Cards scrollable region inside columns -->
              <div class="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-none">
                  ${cardsHtml}
              </div>
          </div>
          `;
        });
        
        const boardStartIdx = html.indexOf('<div id="desktop-kanban-board"');
        const boardEndIdx = html.indexOf('<!-- ========================================================================= -->\n    <!-- MOBILE VIEW: TOUCH-FIRST CARDS');
        if (boardStartIdx !== -1 && boardEndIdx !== -1) {
          const preBoard = html.substring(0, boardStartIdx);
          const postBoard = html.substring(boardEndIdx);
          html = preBoard + `<div id="desktop-kanban-board" class="hidden lg:grid grid-cols-4 gap-4 overflow-x-auto pb-4 pt-1 animate-fade-in select-none">${colsHtml}</div>\n    ` + postBoard;
        }
      }
      else if (view === 'dashboard') {
        // Calcular métricas
        let ventas_totales = 0;
        let pedidos_atendidos = 0;
        let ventas_por_dia = [0, 0, 0, 0, 0, 0, 0];
        let categorias_stats: Record<string, number> = {
          'promociones': 0,
          'alitas': 0,
          'bebidas': 0,
          'broaster': 0,
          'hamburguesas': 0,
          'infusiones': 0,
          'platos-amazonicos': 0,
          'refrescos': 0,
          'salchipapas': 0,
          'adicional': 0
        };

        pedidos.forEach(o => {
          const st = (o.status || 'recibido').toLowerCase();
          if (st === 'entregado' || st === 'completado') {
            const tot = parseFloat(o.total || '0');
            ventas_totales += tot;
            pedidos_atendidos++;

            const created_at = o.created_at || new Date().toISOString();
            const dayIndex = (new Date(created_at).getDay() + 6) % 7; // Lunes=0, Domingo=6
            if (dayIndex >= 0 && dayIndex <= 6) {
              ventas_por_dia[dayIndex] += tot;
            }

            const itemsStr = JSON.stringify(o.items || []).toLowerCase();
            if (itemsStr.includes('promocion') || itemsStr.includes('combo')) {
              categorias_stats['promociones'] += tot;
            } else if (itemsStr.includes('alitas')) {
              categorias_stats['alitas'] += tot;
            } else if (itemsStr.includes('gaseosa') || itemsStr.includes('bebida') || itemsStr.includes('incka') || itemsStr.includes('agua')) {
              categorias_stats['bebidas'] += tot;
            } else if (itemsStr.includes('broaster') || itemsStr.includes('pollo') || itemsStr.includes('brasa')) {
              categorias_stats['broaster'] += tot;
            } else if (itemsStr.includes('hamburguesa') || itemsStr.includes('burger')) {
              categorias_stats['hamburguesas'] += tot;
            } else if (itemsStr.includes('infusion') || itemsStr.includes('cafe') || itemsStr.includes('te') || itemsStr.includes('manzanilla')) {
              categorias_stats['infusiones'] += tot;
            } else if (itemsStr.includes('amazon') || itemsStr.includes('tacacho') || itemsStr.includes('cecina') || itemsStr.includes('juane') || itemsStr.includes('patacon')) {
              categorias_stats['platos-amazonicos'] += tot;
            } else if (itemsStr.includes('refresco') || itemsStr.includes('cocona') || itemsStr.includes('chicha') || itemsStr.includes('maracuya')) {
              categorias_stats['refrescos'] += tot;
            } else if (itemsStr.includes('salchipapa') || itemsStr.includes('salchibroaster')) {
              categorias_stats['salchipapas'] += tot;
            } else {
              categorias_stats['adicional'] += tot;
            }
          }
        });
        const productos_criticos = productos.filter(p => parseInt(p.stock || '0', 10) <= 5);
        const stock_critico_count = productos_criticos.length;
        
        // Reemplazar métricas del Dashboard
        html = html.replace(/<\?php\s+echo\s+number_format\(\$ventas_totales,\s*2\);\s*\?>/g, ventas_totales.toFixed(2));
        html = html.replace(/<\?php\s+echo\s+\$pedidos_atendidos;\s*\?>/g, String(pedidos_atendidos));
        html = html.replace(/<\?php\s+echo\s+count\(\$clientes\);\s*\?>/g, String(clientes.length));
        html = html.replace(/<\?php\s+echo\s+\$stock_critico_count;\s*\?>/g, String(stock_critico_count));
        html = html.replace(/<\?php\s+echo\s+\$stock_critico_count\s*>\s*0\s*\?\s*'text-red-400 font-black animate-pulse'\s*:\s*'text-white';\s*\?>/g, stock_critico_count > 0 ? 'text-red-400 font-black animate-pulse' : 'text-white');

        // Reemplazar datos dinámicos de los gráficos
        const jsonWeekly = JSON.stringify(ventas_por_dia);
        const jsonCategories = JSON.stringify(categorias_stats);
        html = html.replace(/data-weekly="[^"]*"/g, `data-weekly='${jsonWeekly}'`);
        html = html.replace(/data-categories='[^']*'/g, `data-categories='${jsonCategories}'`);
        html = html.replace(/window\.dashboardData\s*=\s*\{[\s\S]*?\};/g, `window.dashboardData = { weekly: ${jsonWeekly}, categories: ${jsonCategories} };`);
      }
      else if (view === 'ticket') {
        const renderLoop = (itemTemplate: string) => {
          if (pedidos.length === 0) {
            return `<tr><td colspan="6" class="p-8 text-center text-slate-500 font-semibold select-none">No hay pedidos disponibles para emitir tickets.</td></tr>`;
          }
          return pedidos.map(o => {
            const orderNum = o.orderNumber || o.id || '';
            const customerName = o.customerName || 'Cliente';
            const customerPhone = o.customerPhone || 'Sin teléfono';
            const total = parseFloat(o.total || '0');
            const orderType = o.orderType || 'Delivery';
            
            let items: any[] = [];
            try {
              items = typeof o.items === 'string' ? JSON.parse(o.items || '[]') : (o.items || []);
            } catch(e) {}
            
            let briefStr = '';
            if (items.length > 0) {
              const sliceItems = items.slice(0, 2);
              briefStr = sliceItems.map(it => `${it.quantity || 1}x ${it.name || 'Plato'}`).join(', ');
              if (items.length > 2) {
                briefStr += '...';
              }
            }
            
            let temp = itemTemplate;
            temp = temp.replace(/<\?php\s+echo\s+htmlspecialchars\(\$orderNum\);\s*\?>/g, orderNum);
            temp = temp.replace(/<\?php\s+echo\s+htmlspecialchars\(\$o\['customerName'\]\s*\?\?\s*'Cliente'\);\s*\?>/g, customerName);
            temp = temp.replace(/<\?php\s+echo\s+htmlspecialchars\(\$o\['customerPhone'\]\s*\?\?\s*'Sin teléfono'\);\s*\?>/g, customerPhone);
            temp = temp.replace(/<\?php\s+echo\s+number_format\(floatval\(\$o\['total'\]\s*\?\?\s*0\),\s*2\);\s*\?>/g, total.toFixed(2));
            temp = temp.replace(/<\?php\s+echo\s+htmlspecialchars\(\$o\['orderType'\]\s*\?\?\s*'Delivery'\);\s*\?>/g, orderType);
            temp = temp.replace(/<\?php\s+echo\s+htmlspecialchars\(\$itemsBrief\);\s*\?>/g, briefStr);
            temp = temp.replace(/<\?php\s+echo\s+json_encode\(\$o,\s*JSON_HEX_APOS\s*\|\s*JSON_HEX_QUOT\);\s*\?>/g, JSON.stringify(o).replace(/'/g, '&#39;').replace(/"/g, '&quot;'));
            return temp;
          }).join('\n');
        };
        
        html = html.replace(/<\?php\s+if\s*\(empty\(\$pedidos\)\):[\s\S]*?<\?php\s+else:\s*\?>([\s\S]*?)<\?php\s+endif;\s*\?>/g, (m, content) => {
          return renderLoop(content);
        });
      }
      
      // Inyectar CSS y JS específicos de la vista en el emulador Node/Vercel (evitando duplicados)
      if (!html.includes(`/admin/css/${view}.css`)) {
        html = html.replace('</head>', `  <link rel="stylesheet" href="/admin/css/${view}.css">\n</head>`);
      }
      if (!html.includes(`/admin/js/${view}.js`)) {
        html = html.replace('</body>', `  <script src="/admin/js/${view}.js"></script>\n</body>`);
      }

      // Eliminar cualquier bloque de etiquetas PHP residuales que no hayan sido compiladas (para evitar que se impriman como texto en el navegador)
      html = html.replace(/<\?php[\s\S]*?\?>/g, '');

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
      res.send(html);
    } catch (e: any) {
      res.status(500).send(`Error de emulación de panel PHP: ${e.message}`);
    }
  });
  app.use('/admin', express.static(path.join(process.cwd(), 'admin'), { ...staticOptions, index: false }));

  // 2. Archivos estáticos de css, js, html y raíz pública (todos dentro de public/)
  app.use(express.static(path.join(process.cwd(), 'public'), staticOptions));
  app.use('/public', express.static(path.join(process.cwd(), 'public'), staticOptions));

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

  app.get(['/mision', '/mision.html'], (_req: Request, res: Response) => {
    res.sendFile(path.join(process.cwd(), 'public/html/mision.html'));
  });

  app.get(['/politicas-privacidad', '/politicas-privacidad.html'], (_req: Request, res: Response) => {
    res.sendFile(path.join(process.cwd(), 'public/html/politicas-privacidad.html'));
  });

  app.get(['/terminos', '/terminos.html'], (_req: Request, res: Response) => {
    res.sendFile(path.join(process.cwd(), 'public/html/terminos.html'));
  });

  app.get(['/contactanos', '/contactanos.html'], (_req: Request, res: Response) => {
    res.sendFile(path.join(process.cwd(), 'public/html/contactanos.html'));
  });

  app.get(['/recojo', '/recojo.html'], (_req: Request, res: Response) => {
    res.sendFile(path.join(process.cwd(), 'public/html/recojo.html'));
  });

  app.get(['/checkout', '/checkout.html'], (_req: Request, res: Response) => {
    res.sendFile(path.join(process.cwd(), 'public/html/checkout.html'));
  });

  // 3. Página de Inicio (HTML5 con parciales compilados)
  app.get(['/', '/index.html'], (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.send(getCompiledIndexHtml());
  });

  // Fallback a index.html solo para rutas SPA de navegación (no para assets estáticos inexistentes o APIs)
  app.get(/.*/, (req: Request, res: Response) => {
    if (path.extname(req.path) || req.path.startsWith('/api')) {
      return res.status(404).send('Not found');
    }
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.send(getCompiledIndexHtml());
  });

  const isServerless = Boolean(process.env.VERCEL || process.env.NOW_REGION || process.env.AWS_LAMBDA_FUNCTION_NAME);

  if (!isServerless) {
    try {
      app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on http://0.0.0.0:${PORT}`);
      });
    } catch (e) {
      console.warn('Could not bind to port:', e);
    }
  }

export default app;

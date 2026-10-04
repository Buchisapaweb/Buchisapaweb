import fs from 'fs';
import path from 'path';
import { Order, Claim } from './types.js';

export interface Supply {
  id: string;
  name: string;
  category: string;
  stock: number;
  unit: string;
  minStock: number;
  status: 'ok' | 'bajo' | 'critico';
  lastRestocked: string;
}

export interface Utensil {
  id: string;
  name: string;
  area: string;
  quantity: number;
  condition: 'Operativo' | 'Excelente' | 'Mantenimiento';
  lastInspection: string;
}

export interface CajaMovement {
  id: string;
  hora: string;
  tipo: 'ingreso' | 'egreso';
  categoria: string;
  monto: number;
  motivo: string;
  responsable: string;
  comprobante?: string;
  createdAt: string;
}

export interface CajaClosure {
  id: string;
  fecha: string;
  turno: string;
  apertura: number;
  ventasTotal: number;
  efectivoEsperado: number;
  efectivoReal: number;
  diferencia: number;
  responsable: string;
  cerradoAt: string;
  notas?: string;
}

export interface TicketRecord {
  id: string;
  ticketNumber: string;
  orderNumber: number;
  orderId?: string;
  customerName: string;
  customerPhone?: string;
  orderType: 'delivery' | 'pickup' | 'salon';
  paymentMethod: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    notes?: string;
  }>;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  status: 'pagado' | 'pendiente' | 'anulado';
  createdAt: string;
}

function generateInitialOrders(): Order[] {
  const now = new Date();
  const t1 = new Date(now.getTime() - 25 * 60000).toISOString();
  const t2 = new Date(now.getTime() - 50 * 60000).toISOString();
  const t3 = new Date(now.getTime() - 95 * 60000).toISOString();
  const t4 = new Date(now.getTime() - 140 * 60000).toISOString();

  return [
    {
      id: 'ord-101',
      orderNumber: 101,
      customerName: 'Juan Carlos Mendoza',
      customerPhone: '987654321',
      customerEmail: 'juan.mendoza@gmail.com',
      orderType: 'delivery',
      deliveryAddress: 'Av. Gran Chimú 450, Urb. Santa Clara, Ate',
      deliveryFee: 5.00,
      paymentMethod: 'Yape',
      subtotal: 38.00,
      total: 43.00,
      status: 'entregado',
      createdAt: t1,
      items: [
        {
          name: 'Tacacho con Cecina y Chorizo Amazónico',
          quantity: 1,
          price: 28.00,
          customization: {
            accompaniments: ['Patacones crocantes', 'Ají de cocona'],
            cremas: ['Crema de la casa', 'Ají charapita'],
            notes: 'Bien doradito el chorizo, por favor.'
          }
        },
        {
          name: 'Jarra de Refresco de Cocona 1L',
          quantity: 1,
          price: 10.00,
          customization: { notes: 'Bien heladita.' }
        }
      ]
    },
    {
      id: 'ord-102',
      orderNumber: 102,
      customerName: 'María Elena Vargas',
      customerPhone: '912345678',
      orderType: 'salon',
      deliveryAddress: 'Mesa 4 (Salón Principal)',
      deliveryFee: 0.00,
      paymentMethod: 'Plin',
      subtotal: 45.00,
      total: 45.00,
      status: 'preparando',
      createdAt: t2,
      items: [
        {
          name: '1/4 Pollo Broaster BuchiSapa + Papas Doradas',
          quantity: 2,
          price: 18.00,
          customization: {
            accompaniments: ['Papas fritas crocantes', 'Ensalada clásica'],
            cremas: ['Mayonesa casera', 'Tártara especial', 'Ají pollero'],
            notes: 'Parte pierna y pecho.'
          }
        },
        {
          name: 'Gaseosa Inka Cola 1.5L',
          quantity: 1,
          price: 9.00
        }
      ]
    },
    {
      id: 'ord-103',
      orderNumber: 103,
      customerName: 'Roberto Quispe T.',
      customerPhone: '955432198',
      orderType: 'pickup',
      deliveryAddress: 'Recojo en Mostrador',
      deliveryFee: 0.00,
      paymentMethod: 'Efectivo',
      subtotal: 40.00,
      total: 40.00,
      status: 'listo',
      createdAt: t3,
      items: [
        {
          name: 'Alitas Broaster Acevichadas (12 piezas)',
          quantity: 1,
          price: 32.00,
          customization: {
            accompaniments: ['Papas amarillas crocantes'],
            cremas: ['Salsa acevichada de la casa', 'Ají rocoto'],
            notes: 'Salsa acevichada bien bañada.'
          }
        },
        {
          name: 'Porción de Yuca Frita Amazónica',
          quantity: 1,
          price: 8.00
        }
      ]
    },
    {
      id: 'ord-104',
      orderNumber: 104,
      customerName: 'Lucía Morales',
      customerPhone: '944888333',
      orderType: 'delivery',
      deliveryAddress: 'Calle 28 de Julio Mz. B Lte. 12, Santa Clara',
      deliveryFee: 5.00,
      paymentMethod: 'Tarjeta',
      subtotal: 29.00,
      total: 34.00,
      status: 'pendiente',
      createdAt: t4,
      items: [
        {
          name: 'Hamburguesa BuchiSapa Artesanal Doble Carne',
          quantity: 1,
          price: 22.00,
          customization: {
            accompaniments: ['Papas al hilo', 'Queso cheddar fundido'],
            cremas: ['Golf', 'BBQ ahumada', 'Tártara'],
            notes: 'Sin cebolla, carne término 3/4.'
          }
        },
        {
          name: 'Refresco Natural de Aguajina Helada',
          quantity: 1,
          price: 7.00
        }
      ]
    }
  ];
}

function loadOrdersFromDisk(): Order[] {
  return generateInitialOrders();
}

function saveOrdersToDisk(data?: Order[]) {
  // Las órdenes se manejan en memoria
}

let ordersStore: Order[] = loadOrdersFromDisk();
const claimsStore: Claim[] = [];
let customTicketsStore: TicketRecord[] = [];

const initialSupplies: Supply[] = [
  { id: 'ins-1', name: 'Carne Molida Premium (Res)', category: 'Carnes', stock: 45, unit: 'kg', minStock: 20, status: 'ok', lastRestocked: '2026-09-24' },
  { id: 'ins-2', name: 'Pollo Fresco para Broaster', category: 'Carnes', stock: 85, unit: 'kg', minStock: 30, status: 'ok', lastRestocked: '2026-09-24' },
  { id: 'ins-3', name: 'Pan Brioche Artesanal', category: 'Panadería', stock: 120, unit: 'und', minStock: 50, status: 'ok', lastRestocked: '2026-09-24' },
  { id: 'ins-4', name: 'Papa Amarilla Seleccionada', category: 'Verduras', stock: 150, unit: 'kg', minStock: 40, status: 'ok', lastRestocked: '2026-09-23' },
  { id: 'ins-5', name: 'Salchicha Frankfurt Ahumada', category: 'Embutidos', stock: 35, unit: 'kg', minStock: 15, status: 'ok', lastRestocked: '2026-09-24' },
  { id: 'ins-6', name: 'Queso Cheddar en Láminas', category: 'Lácteos', stock: 22, unit: 'paq', minStock: 10, status: 'ok', lastRestocked: '2026-09-23' },
  { id: 'ins-7', name: 'Aceite Vegetal para Freidoras', category: 'Abarrotes', stock: 60, unit: 'L', minStock: 25, status: 'ok', lastRestocked: '2026-09-22' },
  { id: 'ins-8', name: 'Maíz Morado de la Sierra', category: 'Abarrotes', stock: 28, unit: 'kg', minStock: 15, status: 'ok', lastRestocked: '2026-09-21' },
  { id: 'ins-9', name: 'Empaques Biodegradables Delivery', category: 'Empaques', stock: 350, unit: 'und', minStock: 100, status: 'ok', lastRestocked: '2026-09-20' },
  { id: 'ins-10', name: 'Potes de Crema 2oz', category: 'Empaques', stock: 500, unit: 'und', minStock: 150, status: 'ok', lastRestocked: '2026-09-20' }
];

let suppliesStore: Supply[] = [...initialSupplies];

const initialUtensils: Utensil[] = [
  { id: 'ut-1', name: 'Freidora Industrial Doble Canastilla', area: 'Broaster', quantity: 2, condition: 'Excelente', lastInspection: '2026-09-20' },
  { id: 'ut-2', name: 'Plancha Hamburguesera de Cromo Duro', area: 'Parrilla', quantity: 1, condition: 'Operativo', lastInspection: '2026-09-21' },
  { id: 'ut-3', name: 'Cortadora Profesional de Papas Bastón', area: 'Preparación', quantity: 2, condition: 'Excelente', lastInspection: '2026-09-18' },
  { id: 'ut-4', name: 'Campana Extractora de Alto Caudal', area: 'Extracción', quantity: 1, condition: 'Operativo', lastInspection: '2026-09-15' },
  { id: 'ut-5', name: 'Espátulas Grill y Pinzas Térmicas', area: 'Parrilla', quantity: 8, condition: 'Excelente', lastInspection: '2026-09-23' },
  { id: 'ut-6', name: 'Termómetro Digital de Sonda', area: 'Control Calidad', quantity: 3, condition: 'Excelente', lastInspection: '2026-09-24' }
];

let cajaState = {
  isOpen: false,
  openedAt: null as string | null,
  responsable: 'Admin BuchiSapa',
  initialCash: 0.00
};

let cajaMovementsStore: CajaMovement[] = [];
let cajaClosuresStore: CajaClosure[] = [];

export function formatOrderCode(orderNumberOrId: any): string {
  if (!orderNumberOrId) return 'PC00001';
  const str = String(orderNumberOrId).trim();
  if (str.toUpperCase().startsWith('PC')) {
    const numPart = str.substring(2).replace(/\D/g, '');
    if (numPart) {
      return `PC${numPart.padStart(5, '0')}`;
    }
    return str.toUpperCase();
  }
  const digits = str.replace(/\D/g, '');
  if (digits) {
    const num = parseInt(digits, 10);
    if (num < 100000) {
      return `PC${String(num).padStart(5, '0')}`;
    } else {
      const shortNum = num % 100000 || 1;
      return `PC${String(shortNum).padStart(5, '0')}`;
    }
  }
  return `PC00001`;
}

export async function getOrders(status?: string, email?: string): Promise<Order[]> {
  ordersStore = loadOrdersFromDisk().map((o, index) => {
    const code = formatOrderCode(o.orderCode || o.orderNumber || (index + 1));
    return {
      ...o,
      orderCode: code,
      orderNumber: code
    };
  });

  let list = [...ordersStore];
  if (status && status !== 'todos') {
    list = list.filter(o => o.status.toLowerCase() === status.toLowerCase());
  }
  if (email) {
    const cleanEmail = email.toLowerCase().trim();
    list = list.filter(o => (o.customerEmail || '').toLowerCase().trim() === cleanEmail);
  }
  return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getOrderById(id: string): Promise<Order | null> {
  const order = ordersStore.find(o => o.id === id || String(o.orderNumber) === id);
  return order || null;
}

export function getNextOrderCode(): string {
  let maxNumber = 0;
  for (const o of ordersStore) {
    const raw = String(o.orderCode || o.orderNumber || o.id || '');
    const match = raw.match(/PC(\d+)/i);
    if (match) {
      const val = parseInt(match[1], 10);
      if (val > maxNumber) maxNumber = val;
    } else {
      const digits = raw.replace(/\D/g, '');
      if (digits) {
        const val = parseInt(digits, 10);
        if (val < 100000 && val > maxNumber) maxNumber = val;
      }
    }
  }
  const nextNum = maxNumber + 1;
  return `PC${String(nextNum).padStart(5, '0')}`;
}

export async function createOrder(data: any): Promise<Order> {
  let code = data.orderCode;
  if (!code && data.orderNumber && String(data.orderNumber).toUpperCase().startsWith('PC')) {
    code = String(data.orderNumber).toUpperCase();
  }
  if (!code) {
    code = getNextOrderCode();
  }

  const newOrder: Order = {
    id: data.id || `ORD-${Date.now()}`,
    orderNumber: code,
    orderCode: code,
    customerName: data.customerName,
    customerPhone: data.customerPhone,
    customerEmail: data.customerEmail,
    orderType: data.orderType || 'delivery',
    deliveryAddress: data.deliveryAddress,
    deliveryReference: data.deliveryReference,
    tableNumber: data.tableNumber,
    paymentMethod: data.paymentMethod || 'Yape',
    notes: data.notes,
    status: data.status || 'recibido',
    subtotal: Number(data.subtotal || data.total) || 0,
    deliveryFee: Number(data.deliveryFee) || (data.orderType === 'pickup' ? 0 : 4.00),
    total: Number(data.total) || 0,
    items: typeof data.items === 'string' ? data.items : JSON.stringify(data.items),
    userId: data.userId,
    createdAt: new Date().toISOString()
  };

  ordersStore.unshift(newOrder);
  saveOrdersToDisk();
  return newOrder;
}

export async function updateOrderStatus(id: string, status: string): Promise<Order | null> {
  const order = ordersStore.find(o => o.id === id || String(o.orderNumber) === id);
  if (!order) return null;
  order.status = status;
  saveOrdersToDisk();
  return order;
}

export async function deleteOrder(id: string): Promise<boolean> {
  const rawId = id.replace(/^tk-/, '');
  const filtered = ordersStore.filter(o => o.id !== id && o.id !== rawId && String(o.orderNumber) !== id && String(o.orderNumber) !== rawId);
  ordersStore.length = 0;
  ordersStore.push(...filtered);
  customTicketsStore = customTicketsStore.filter(t => t.id !== id && t.id !== `tk-${id}` && t.orderId !== id && String(t.orderNumber) !== id);
  saveOrdersToDisk();
  return true;
}

export async function getClaims(): Promise<Claim[]> {
  return claimsStore;
}

export async function createClaim(data: any): Promise<Claim> {
  const newClaim: Claim = {
    id: claimsStore.length + 1,
    claimCode: data.claimCode || `REC-${Date.now()}`,
    fullName: data.fullName,
    docType: data.docType || 'DNI',
    docNumber: data.docNumber || '',
    phone: data.phone,
    email: data.email,
    address: data.address || '',
    department: data.department || 'Lima',
    province: data.province || 'Lima',
    district: data.district || 'Ate',
    branch: data.branch || 'BuchiSapa - Sede Central (Santa Clara, Ate)',
    orderNumber: data.orderNumber || '',
    orderDate: data.orderDate || '',
    isMinor: Boolean(data.isMinor),
    tutorName: data.tutorName || '',
    tutorDoc: data.tutorDoc || '',
    claimType: (data.claimType || 'reclamo').toLowerCase().includes('queja') ? 'queja' : 'reclamo',
    contractedGood: data.contractedGood || 'producto',
    claimedAmount: data.claimedAmount ? Number(data.claimedAmount) : undefined,
    productDescription: data.productDescription || 'Consumo en restaurante / Pedido delivery',
    detail: data.detail,
    consumerRequest: data.consumerRequest || '',
    attachmentName: data.attachmentName || '',
    status: 'pendiente',
    createdAt: new Date().toISOString()
  };

  claimsStore.unshift(newClaim);
  return newClaim;
}

export async function getSupplies(): Promise<Supply[]> {
  return suppliesStore;
}

export async function updateSupplyStock(id: string, newStock: number): Promise<Supply | null> {
  const item = suppliesStore.find(s => s.id === id);
  if (!item) return null;
  item.stock = newStock;
  item.status = item.stock <= item.minStock * 0.5 ? 'critico' : item.stock <= item.minStock ? 'bajo' : 'ok';
  item.lastRestocked = new Date().toISOString().split('T')[0];
  return item;
}

export async function getUtensils(): Promise<Utensil[]> {
  return initialUtensils;
}

export async function getCajaSummary() {
  const orders = await getOrders();
  
  let totalSales = 0;
  let efectivo = 0;
  let yapePlin = 0;
  let tarjeta = 0;

  orders.forEach(o => {
    const amount = Number(o.total || 0);
    totalSales += amount;
    const method = (o.paymentMethod || '').toLowerCase();
    if (method.includes('yape') || method.includes('plin')) {
      yapePlin += amount;
    } else if (method.includes('tarjeta') || method.includes('card') || method.includes('pos')) {
      tarjeta += amount;
    } else {
      efectivo += amount;
    }
  });

  const egresosTotal = cajaMovementsStore
    .filter(m => m.tipo === 'egreso')
    .reduce((sum, m) => sum + m.monto, 0);

  const ingresosExtra = cajaMovementsStore
    .filter(m => m.tipo === 'ingreso' && m.categoria !== 'Fondo Inicial')
    .reduce((sum, m) => sum + m.monto, 0);

  const efectivoEsperado = (cajaState.initialCash + efectivo + ingresosExtra) - egresosTotal;

  const deliveryOrders = orders.filter(o => o.orderType === 'delivery').length;
  const pickupOrders = orders.filter(o => o.orderType === 'pickup').length;
  const salonOrders = orders.filter(o => o.orderType === 'salon').length;

  return {
    isOpen: cajaState.isOpen,
    openedAt: cajaState.openedAt,
    responsable: cajaState.responsable,
    initialCash: cajaState.initialCash,
    totalSales: Number(totalSales.toFixed(2)),
    efectivo: Number(efectivo.toFixed(2)),
    yapePlin: Number(yapePlin.toFixed(2)),
    tarjeta: Number(tarjeta.toFixed(2)),
    egresosTotal: Number(egresosTotal.toFixed(2)),
    ingresosExtra: Number(ingresosExtra.toFixed(2)),
    efectivoEsperado: Number(efectivoEsperado.toFixed(2)),
    totalOrders: orders.length,
    activeOrders: orders.filter(o => o.status !== 'entregado' && o.status !== 'cancelado').length,
    deliveryOrders,
    pickupOrders,
    salonOrders,
    movimientos: cajaMovementsStore,
    historialCierres: cajaClosuresStore
  };
}

export async function addCajaMovement(data: {
  tipo: 'ingreso' | 'egreso';
  categoria: string;
  monto: number;
  motivo: string;
  responsable?: string;
  comprobante?: string;
}): Promise<CajaMovement> {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  
  const newMov: CajaMovement = {
    id: `mov-${Date.now()}`,
    hora: `${hours}:${minutes}`,
    tipo: data.tipo,
    categoria: data.categoria || 'Gasto General',
    monto: Math.abs(Number(data.monto) || 0),
    motivo: data.motivo || 'Movimiento de caja chica',
    responsable: data.responsable || cajaState.responsable || 'Admin BuchiSapa',
    comprobante: data.comprobante || `REC-${Date.now().toString().slice(-4)}`,
    createdAt: now.toISOString()
  };

  cajaMovementsStore.unshift(newMov);
  return newMov;
}

export async function abrirCaja(data: { montoInicial: number; responsable?: string }) {
  cajaState.isOpen = true;
  cajaState.initialCash = Number(data.montoInicial) || 250.00;
  cajaState.openedAt = new Date().toISOString();
  if (data.responsable) cajaState.responsable = data.responsable;

  await addCajaMovement({
    tipo: 'ingreso',
    categoria: 'Fondo Inicial',
    monto: cajaState.initialCash,
    motivo: 'Apertura de turno con sencillo para cambio en caja',
    responsable: cajaState.responsable,
    comprobante: `AP-${Date.now().toString().slice(-4)}`
  });

  return getCajaSummary();
}

export async function cerrarCaja(data: {
  efectivoReal: number;
  notas?: string;
  responsable?: string;
}) {
  const summary = await getCajaSummary();
  const real = Number(data.efectivoReal) || summary.efectivoEsperado;
  const dif = Number((real - summary.efectivoEsperado).toFixed(2));

  const closure: CajaClosure = {
    id: `cierre-${Date.now()}`,
    fecha: new Date().toISOString().split('T')[0],
    turno: 'Turno Tarde/Noche',
    apertura: summary.initialCash,
    ventasTotal: summary.totalSales,
    efectivoEsperado: summary.efectivoEsperado,
    efectivoReal: real,
    diferencia: dif,
    responsable: data.responsable || summary.responsable,
    cerradoAt: new Date().toISOString(),
    notas: data.notas || (dif === 0 ? 'Cuadre de caja exacto' : `Diferencia de S/ ${dif.toFixed(2)}`)
  };

  cajaClosuresStore.unshift(closure);
  cajaState.isOpen = false;

  return {
    success: true,
    closure,
    cajaSummary: await getCajaSummary()
  };
}

export async function getTickets(): Promise<TicketRecord[]> {
  const orders = await getOrders();
  
  const orderTickets: TicketRecord[] = orders.map((o, idx) => {
    let rawItems: any[] = [];
    if (Array.isArray(o.items)) rawItems = o.items;
    else if (typeof o.items === 'string') {
      try { rawItems = JSON.parse(o.items); } catch (e) { rawItems = []; }
    }

    const items = rawItems.map(it => ({
      name: it.name || it.nombre || 'Plato BuchiSapa',
      quantity: Number(it.quantity || it.cant || 1),
      price: Number(it.price || it.precio || 0),
      notes: it.notes || it.customization?.notes || ''
    }));

    const rawNum = typeof o.orderNumber === 'number' ? o.orderNumber : parseInt(String(o.orderNumber).replace(/\D/g, ''), 10) || (orders.length - idx);
    const formattedNum = String(rawNum).padStart(6, '0');

    return {
      id: `tk-${o.id}`,
      ticketNumber: `TK${formattedNum}`,
      orderNumber: rawNum,
      orderId: o.id,
      customerName: o.customerName || 'Cliente Mostrador',
      customerPhone: o.customerPhone || '',
      orderType: (o.orderType as any) || 'delivery',
      paymentMethod: o.paymentMethod || 'Efectivo',
      items: items.length > 0 ? items : [{ name: 'BuchiBurger Doble Artesanal', quantity: 1, price: Number(o.total || 22) }],
      subtotal: Number(o.subtotal || o.total || 0),
      deliveryFee: Number(o.deliveryFee || 0),
      discount: 0,
      total: Number(o.total || 0),
      status: o.status === 'cancelado' ? 'anulado' : 'pagado',
      createdAt: o.createdAt || new Date().toISOString()
    };
  });

  const combined = [...customTicketsStore, ...orderTickets];
  return combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function createQuickTicket(data: Partial<TicketRecord>): Promise<TicketRecord> {
  const now = new Date();
  const nextNumber = customTicketsStore.length + 1;
  const seq = String(nextNumber).padStart(6, '0');

  const newTicket: TicketRecord = {
    id: `tk-quick-${Date.now()}`,
    ticketNumber: `TK${seq}`,
    orderNumber: nextNumber,
    customerName: data.customerName || 'Cliente Mostrador',
    customerPhone: data.customerPhone || '',
    orderType: data.orderType || 'salon',
    paymentMethod: data.paymentMethod || 'Efectivo',
    items: data.items && data.items.length > 0 ? data.items : [
      { name: 'BuchiSapa Clásica Burger', quantity: 1, price: 16.00 }
    ],
    subtotal: Number(data.subtotal || data.total || 16.00),
    deliveryFee: Number(data.deliveryFee || 0),
    discount: Number(data.discount || 0),
    total: Number(data.total || 16.00),
    status: data.status || 'pagado',
    createdAt: now.toISOString()
  };

  customTicketsStore.unshift(newTicket);
  return newTicket;
}

export async function deleteTicket(id: string): Promise<boolean> {
  const rawId = id.replace(/^tk-/, '');
  customTicketsStore = customTicketsStore.filter(t => t.id !== id && t.id !== `tk-${id}` && t.orderId !== id && String(t.orderNumber) !== id && String(t.orderNumber) !== rawId);
  
  const filteredOrders = ordersStore.filter(o => o.id !== id && o.id !== rawId && String(o.orderNumber) !== id && String(o.orderNumber) !== rawId);
  ordersStore.length = 0;
  ordersStore.push(...filteredOrders);
  
  return true;
}

export async function clearAllTickets(): Promise<boolean> {
  customTicketsStore = [];
  ordersStore.length = 0;
  return true;
}

export function loadProfilesFromDisk(): any[] {
  try {
    const file = path.join(process.cwd(), 'backend', 'data', 'profiles.json');
    if (fs.existsSync(file)) {
      return JSON.parse(fs.readFileSync(file, 'utf-8'));
    }
  } catch(e) {}
  return [
    { id: '1', nombre: 'Juan Pérez', email: 'juan.perez@gmail.com', telefono: '987654321', created_at: '2026-09-20T10:00:00Z' },
    { id: '2', nombre: 'Maria Garcia', email: 'maria.garcia@gmail.com', telefono: '912345678', created_at: '2026-09-22T14:30:00Z' },
    { id: '3', nombre: 'Carlos López', email: 'carlos.lopez@gmail.com', telefono: '955443322', created_at: '2026-09-25T18:15:00Z' }
  ];
}

function simpleHashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export async function getProfiles(): Promise<any[]> {
  const orders = await getOrders();
  const map = new Map<string, any>();

  loadProfilesFromDisk().forEach(p => {
    if (p.email) map.set(p.email.toLowerCase().trim(), p);
    else if (p.id) map.set(p.id, p);
  });

  orders.forEach(o => {
    if (o.customerEmail) {
      const emailKey = o.customerEmail.toLowerCase().trim();
      if (!map.has(emailKey)) {
        map.set(emailKey, {
          id: 'cl-' + simpleHashCode(emailKey),
          nombre: o.customerName || 'Cliente Buchisapa',
          email: o.customerEmail,
          telefono: o.customerPhone || '987654321',
          created_at: o.createdAt || new Date().toISOString()
        });
      }
    }
  });

  return Array.from(map.values());
}

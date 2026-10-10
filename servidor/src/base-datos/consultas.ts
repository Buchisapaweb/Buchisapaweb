import fs from 'fs';
import path from 'path';
import categoriasCatalogo from '../../../datos/categorias.json';
import productosCatalogo from '../../../datos/productos.json';
import acompanamientosCatalogo from '../../../datos/acompanamientos.json';
import cremasCatalogo from '../../../datos/cremas.json';

export interface Category {
  id: string;
  name: string;
  banner_url: string;
  slug?: string;
}

export interface Accompaniment {
  id: string;
  name: string;
}

export interface Cream {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  category_id: string;
  category?: string;
  price: number;
  description: string;
  image_url?: string;
  image?: string;
  has_accompaniment: boolean;
  accompaniment_ids: string[];
  includes_sauces: boolean;
  sauce_ids: string[];
  available: boolean;
  stock: number;
  badge?: string | null;
  popular?: boolean;
  code?: string;
}

export interface Sauce {
  id: string;
  name: string;
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice: number;
  image: string;
  badge: string;
  active?: boolean;
  order?: number;
  features?: string[];
  createdAt?: string;
}

export interface Order {
  id: string;
  orderNumber: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  orderType: 'delivery' | 'pickup' | 'salon';
  deliveryAddress?: string;
  deliveryReference?: string;
  tableNumber?: string;
  paymentMethod: string;
  notes?: string;
  status: string;
  subtotal?: number;
  deliveryFee?: number;
  total: number;
  items: any;
  userId?: string;
  createdAt: string;
}

export interface Claim {
  id: number;
  claimCode: string;
  fullName: string;
  docType: string;
  docNumber: string;
  phone: string;
  email: string;
  address: string;
  department?: string;
  province?: string;
  district?: string;
  branch?: string;
  orderNumber?: string;
  orderDate?: string;
  isMinor?: boolean;
  tutorName?: string;
  tutorDoc?: string;
  claimType: 'queja' | 'reclamo';
  contractedGood?: 'producto' | 'servicio';
  claimedAmount?: number;
  productDescription?: string;
  detail: string;
  consumerRequest: string;
  attachmentName?: string;
  status: string;
  createdAt: string;
}

// CATÁLOGOS OFICIALES DEL NEGOCIO
const initialCategories: Category[] = (categoriasCatalogo as Category[]).map((category) => ({
  ...category,
  slug: category.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}));

const initialAccompaniments: Accompaniment[] = acompanamientosCatalogo as Accompaniment[];
const initialCreams: Cream[] = cremasCatalogo as Cream[];

const CATEGORY_SLUG_TO_ID: Record<string, string> = Object.fromEntries(
  initialCategories.map((category) => [category.slug || '', category.id])
);
CATEGORY_SLUG_TO_ID.salchipapas = 'C0010';
CATEGORY_SLUG_TO_ID.extras = 'C0001';

const normalizeProduct = (raw: any): Product => {
  const image = raw.image || raw.image_url || '';
  return {
    id: String(raw.id),
    code: raw.code || String(raw.id),
    name: String(raw.name || ''),
    category_id: String(raw.category_id || ''),
    category: initialCategories.find((category) => category.id === String(raw.category_id || ''))?.name,
    price: Number(raw.price || 0),
    description: String(raw.description || ''),
    image_url: raw.image_url || image || undefined,
    image: image || undefined,
    has_accompaniment: Boolean(raw.has_accompaniment),
    accompaniment_ids: Array.isArray(raw.accompaniment_ids) ? raw.accompaniment_ids.map(String) : [],
    includes_sauces: Boolean(raw.includes_sauces),
    sauce_ids: Array.isArray(raw.sauce_ids) ? raw.sauce_ids.map(String) : [],
    available: raw.available !== false,
    stock: typeof raw.stock === 'number' ? raw.stock : 25,
    badge: raw.badge ?? null,
    popular: Boolean(raw.popular)
  };
};

const initialProducts: Product[] = (productosCatalogo as any[]).map(normalizeProduct);
let productsStore = initialProducts;
const categoriesStore = [...initialCategories];
const accompanimentsStore = [...initialAccompaniments];
const creamsStore = [...initialCreams];
const saucesStore: Sauce[] = creamsStore.map((cream) => ({ ...cream }));
const ordersStore: Order[] = [];
const claimsStore: Claim[] = [];

const initialPromotions: Promotion[] = [
  { id: 'PL00041', title: 'PROMO BROASTER FAMILIAR', price: 38, originalPrice: 38, image: '/imagenes/categorias/promociones/banner.webp', badge: 'FAMILIAR', description: 'La selección ideal para compartir en familia. Incluye un Broaster Presa Pecho, un Broaster Presa Pierna y un Broaster Presa Ala, con el sabor crujiente que nos caracteriza, más una Gaseosa Personal Inca Kola.', features: ['Papa crocante', 'Ensalada fresca', 'Arroz', 'Gaseosa Personal Inca Kola'], active: true, order: 1 },
  { id: 'PL00042', title: 'PROMO BUCHI DUO', price: 22, originalPrice: 22, image: '/imagenes/categorias/promociones/banner.webp', badge: 'DUO', description: 'Una experiencia pensada para dos. Disfruta de dos Hamburguesas Tipo Clásica elaboradas con nuestra hamburguesa artesanal premium, acompañadas de dos Gaseosas Personales Pepsi.', features: ['Papa crocante', 'Hamburguesa artesanal', 'Ensalada fresca', '2 Gaseosas Personales Pepsi'], active: true, order: 2 },
  { id: 'PL00043', title: 'PROMO SALCHI BURGER', price: 24, originalPrice: 24, image: '/imagenes/categorias/promociones/banner.webp', badge: 'COMBO', description: 'La fusión de nuestros dos clásicos más pedidos. Una Hamburguesa Tipo Cheese Burguer y una Salchipapa Tipo Salchipapa Clásica, acompañadas de una Gaseosa Personal Coca Cola.', features: ['Queso cheddar', 'Papa crocante', 'Ensalada fresca', 'Gaseosa Personal Coca Cola'], active: true, order: 3 },
  { id: 'PL00044', title: 'PROMO SELVA POWER', price: 29, originalPrice: 29, image: '/imagenes/categorias/promociones/banner.webp', badge: 'SELVA', description: 'Un homenaje a la Amazonía. Compuesto por un Plato Amazónico Tipo Tacacho con Cecina y un Salchibroaster Tipo Salchibroaster Pierna Presa Pierna, junto a una Gaseosa Personal Fanta.', features: ['Maduros fritos', 'Salsa criolla', 'Papa crocante', 'Ensalada fresca', 'Gaseosa Personal Fanta'], active: true, order: 4 }
];
let promotionsStore: Promotion[] = [...initialPromotions];

export async function getCategories(): Promise<Category[]> {
  return [...categoriesStore].sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }));
}

export async function getAccompaniments(): Promise<Accompaniment[]> {
  return [...accompanimentsStore];
}

export async function getCreams(): Promise<Cream[]> {
  return [...creamsStore];
}

export async function createCategory(data: Partial<Category>): Promise<Category> {
  const newCatId = data.id || `C${String(categoriesStore.length + 1).padStart(4, '0')}`;
  const newCat: Category = {
    id: newCatId,
    name: (data.name || 'NUEVA CATEGORÍA').toUpperCase().trim(),
    banner_url: data.banner_url || '/imagenes/categorias/platos-amazonicos/banner.webp',
    slug: (data.name || 'nueva-categoria').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  };
  categoriesStore.push(newCat);
  return { ...newCat };
}

export async function updateCategory(id: string, patch: Partial<Category>): Promise<Category | null> {
  const category = categoriesStore.find(c => c.id.toLowerCase() === id.toLowerCase());
  if (!category) return null;
  if (typeof patch.name === 'string' && patch.name.trim()) {
    category.name = patch.name.trim().toUpperCase();
    category.slug = category.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }
  if (typeof patch.banner_url === 'string' && patch.banner_url.trim()) category.banner_url = patch.banner_url.trim();
  return { ...category };
}

export async function deleteCategory(id: string): Promise<boolean> {
  const index = categoriesStore.findIndex(c => c.id.toLowerCase() === id.toLowerCase());
  if (index === -1) return false;
  categoriesStore.splice(index, 1);
  return true;
}

export async function getProducts(categoryId?: string): Promise<Product[]> {
  let list = productsStore;
  if (categoryId) {
    const norm = categoryId.toLowerCase().trim();
    const mapped = CATEGORY_SLUG_TO_ID[norm] || categoryId;
    list = list.filter(p => p.category_id === mapped || p.category_id === categoryId || p.category_id.toLowerCase() === norm);
  }
  return [...list].sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }));
}

export async function getProductById(id: string): Promise<Product | null> {
  const product = productsStore.find(p => p.id === id || p.id.toLowerCase() === id.toLowerCase());
  return product || null;
}

export async function getSauces(): Promise<Sauce[]> {
  return [...saucesStore];
}

export async function getPromotions(includeInactive = false): Promise<Promotion[]> {
  let list = [...promotionsStore];
  if (!includeInactive) {
    list = list.filter(p => p.active !== false);
  }
  return list.sort((a, b) => (a.order || 0) - (b.order || 0));
}

export async function getPromotionById(id: string): Promise<Promotion | null> {
  const p = promotionsStore.find(item => item.id === id);
  return p || null;
}

export async function createPromotion(data: Partial<Promotion>): Promise<Promotion> {
  const newPromo: Promotion = {
    id: data.id || `promo-${Date.now()}`,
    title: data.title || 'NUEVA PROMOCIÓN',
    description: data.description || 'Promoción especial BuchiSapa',
    price: Number(data.price) || 0,
    originalPrice: Number(data.originalPrice) || Number(data.price) || 0,
    image: data.image || '/imagenes/portada/Portada1E.webp',
    badge: data.badge || '🔥 OFERTA',
    active: data.active !== undefined ? data.active : true,
    order: data.order !== undefined ? data.order : promotionsStore.length + 1,
    features: Array.isArray(data.features) ? data.features : (typeof data.features === 'string' ? (data.features as string).split('\n').filter(Boolean) : ['✦ CALIDAD BUCHISAPA', '🔥 PREPARADO AL MOMENTO']),
    createdAt: new Date().toISOString()
  };

  promotionsStore.push(newPromo);
  return newPromo;
}

export async function updatePromotion(id: string, data: Partial<Promotion>): Promise<Promotion | null> {
  const index = promotionsStore.findIndex(item => item.id === id);
  if (index === -1) return null;

  const current = promotionsStore[index];
  promotionsStore[index] = {
    ...current,
    ...data,
    price: data.price !== undefined ? Number(data.price) : current.price,
    originalPrice: data.originalPrice !== undefined ? Number(data.originalPrice) : current.originalPrice,
    id // preserve id
  };
  return promotionsStore[index];
}

export async function deletePromotion(id: string): Promise<boolean> {
  const initialLength = promotionsStore.length;
  promotionsStore = promotionsStore.filter(item => item.id !== id);
  return promotionsStore.length < initialLength;
}

export async function reorderPromotions(orderedIds: string[]): Promise<Promotion[]> {
  orderedIds.forEach((id, index) => {
    const p = promotionsStore.find(item => item.id === id);
    if (p) p.order = index + 1;
  });
  return promotionsStore.sort((a, b) => (a.order || 0) - (b.order || 0));
}

export async function getOrders(status?: string, email?: string): Promise<Order[]> {
  let list = [...ordersStore];
  if (status) {
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

export async function createOrder(data: any): Promise<Order> {
  const newOrder: Order = {
    id: data.id || `ORD-${Date.now()}`,
    orderNumber: data.orderNumber || Math.floor(100 + Math.random() * 900),
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
    total: Number(data.total) || 0,
    items: typeof data.items === 'string' ? data.items : JSON.stringify(data.items),
    userId: data.userId,
    createdAt: new Date().toISOString()
  };

  ordersStore.unshift(newOrder);
  return newOrder;
}

export async function updateOrderStatus(id: string, status: string): Promise<Order | null> {
  const order = ordersStore.find(o => o.id === id || String(o.orderNumber) === id);
  if (!order) return null;
  order.status = status;
  return order;
}

export async function deleteOrder(id: string): Promise<boolean> {
  const rawId = id.replace(/^tk-/, '');
  const filtered = ordersStore.filter(o => o.id !== id && o.id !== rawId && String(o.orderNumber) !== id && String(o.orderNumber) !== rawId);
  ordersStore.length = 0;
  ordersStore.push(...filtered);
  customTicketsStore = customTicketsStore.filter(t => t.id !== id && t.id !== `tk-${id}` && t.orderId !== id && String(t.orderNumber) !== id);
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

export async function checkCartStock(checkItems: { id: string; quantity: number; name?: string }[]) {
  const outOfStockItems: any[] = [];
  const itemsStatus: any[] = [];

  for (const item of checkItems) {
    const product = productsStore.find(p => p.id === item.id);
    if (!product) {
      // If product not found in database by id, allow by default
      itemsStatus.push({ id: item.id, available: true, stock: 10 });
      continue;
    }

    const isAvailable = product.available && product.stock >= item.quantity;
    itemsStatus.push({
      id: product.id,
      name: product.name,
      available: isAvailable,
      stock: product.stock,
      requested: item.quantity
    });

    if (!isAvailable) {
      outOfStockItems.push({
        id: product.id,
        name: product.name,
        available: product.available,
        stock: product.stock,
        requested: item.quantity
      });
    }
  }

  const valid = outOfStockItems.length === 0;
  return {
    valid,
    message: valid ? 'Stock disponible' : 'Algunos productos no tienen stock suficiente',
    outOfStockItems,
    itemsStatus
  };
}

export async function deductCartStock(checkItems: { id: string; quantity: number; name?: string }[]) {
  for (const item of checkItems) {
    const product = productsStore.find(p => p.id === item.id);
    if (product) {
      product.stock = Math.max(0, product.stock - (item.quantity || 1));
      if (product.stock === 0) {
        product.available = false;
      }
    }
  }
}

export async function updateProductStock(id: string, available: boolean, stock?: number): Promise<Product | null> {
  const product = productsStore.find(p => p.id === id || p.id.toLowerCase() === id.toLowerCase());
  if (!product) return null;
  product.available = available;
  if (typeof stock === 'number') {
    product.stock = stock;
    if (product.stock === 0) {
      product.available = false;
    }
  }
  return product;
}

export async function createProduct(data: Partial<Product>): Promise<Product> {
  const newProduct: Product = normalizeProduct({
    ...data,
    id: data.id || `prod-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name: data.name || 'Nuevo Producto',
    category_id: data.category_id || 'C0005',
    price: Number(data.price) || 10,
    description: data.description || '',
    available: data.available !== false,
    stock: typeof data.stock === 'number' ? data.stock : 25,
    image: data.image || data.image_url || '/imagenes/categorias/hamburguesas/banner.webp',
    has_accompaniment: Boolean(data.has_accompaniment),
    accompaniment_ids: Array.isArray(data.accompaniment_ids) ? data.accompaniment_ids : [],
    includes_sauces: Boolean(data.includes_sauces),
    sauce_ids: Array.isArray(data.sauce_ids) ? data.sauce_ids : []
  });
  productsStore.unshift(newProduct);
  return newProduct;
}

export async function updateProduct(id: string, data: Partial<Product>): Promise<Product | null> {
  const index = productsStore.findIndex(p => p.id === id);
  if (index === -1) return null;
  
  productsStore[index] = {
    ...productsStore[index],
    ...data,
    price: data.price !== undefined ? Number(data.price) : productsStore[index].price,
    stock: data.stock !== undefined ? Number(data.stock) : productsStore[index].stock
  };
  return productsStore[index];
}

export async function deleteProduct(id: string): Promise<boolean> {
  const initialLen = productsStore.length;
  productsStore = productsStore.filter(p => p.id !== id);
  return productsStore.length < initialLen;
}

// 5. INSUMOS Y UTENSILIOS (PARA GESTIÓN DEL RESTAURANTE)
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

export interface Utensil {
  id: string;
  name: string;
  area: string;
  quantity: number;
  condition: 'Operativo' | 'Excelente' | 'Mantenimiento';
  lastInspection: string;
}

const initialUtensils: Utensil[] = [
  { id: 'ut-1', name: 'Freidora Industrial Doble Canastilla', area: 'Broaster', quantity: 2, condition: 'Excelente', lastInspection: '2026-09-20' },
  { id: 'ut-2', name: 'Plancha Hamburguesera de Cromo Duro', area: 'Parrilla', quantity: 1, condition: 'Operativo', lastInspection: '2026-09-21' },
  { id: 'ut-3', name: 'Cortadora Profesional de Papas Bastón', area: 'Preparación', quantity: 2, condition: 'Excelente', lastInspection: '2026-09-18' },
  { id: 'ut-4', name: 'Campana Extractora de Alto Caudal', area: 'Extracción', quantity: 1, condition: 'Operativo', lastInspection: '2026-09-15' },
  { id: 'ut-5', name: 'Espátulas Grill y Pinzas Térmicas', area: 'Parrilla', quantity: 8, condition: 'Excelente', lastInspection: '2026-09-23' },
  { id: 'ut-6', name: 'Termómetro Digital de Sonda', area: 'Control Calidad', quantity: 3, condition: 'Excelente', lastInspection: '2026-09-24' }
];

export async function getUtensils(): Promise<Utensil[]> {
  return initialUtensils;
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

// Estado persistente en memoria para caja y turnos
let cajaState = {
  isOpen: true,
  openedAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
  responsable: 'Admin BuchiSapa',
  initialCash: 250.00
};

let cajaMovementsStore: CajaMovement[] = [
  {
    id: 'mov-1',
    hora: '17:00',
    tipo: 'ingreso',
    categoria: 'Fondo Inicial',
    monto: 250.00,
    motivo: 'Apertura de turno tarde/noche con sencillo para cambio',
    responsable: 'Admin BuchiSapa',
    comprobante: 'APERTURA-001',
    createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString()
  },
  {
    id: 'mov-2',
    hora: '18:30',
    tipo: 'egreso',
    categoria: 'Insumos de Cocina',
    monto: 25.00,
    motivo: 'Compra de 2 bolsas de hielo frappé para refrescos de camu camu',
    responsable: 'Admin BuchiSapa',
    comprobante: 'BOL-0921',
    createdAt: new Date(Date.now() - 3.5 * 3600 * 1000).toISOString()
  },
  {
    id: 'mov-3',
    hora: '19:45',
    tipo: 'egreso',
    categoria: 'Empaques y Despacho',
    monto: 20.00,
    motivo: 'Paquete de bolsas térmicas kraft para hamburguesas delivery',
    responsable: 'Admin BuchiSapa',
    comprobante: 'TK-4821',
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
  }
];

let cajaClosuresStore: CajaClosure[] = [
  {
    id: 'cierre-prev-1',
    fecha: new Date(Date.now() - 24 * 3600 * 1000).toISOString().split('T')[0],
    turno: 'Turno Tarde/Noche',
    apertura: 250.00,
    ventasTotal: 2140.00,
    efectivoEsperado: 890.00,
    efectivoReal: 890.00,
    diferencia: 0.00,
    responsable: 'Admin BuchiSapa',
    cerradoAt: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
    notas: 'Cuadre exacto sin novedades. Alta salida de BuchiBurgers.'
  }
];

export async function getCajaSummary() {
  const orders = await getOrders();
  
  // Calcular ventas reales desde los pedidos
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

  // Si no hay pedidos suficientes, usar datos representativos
  if (totalSales === 0) {
    totalSales = 1850.50;
    efectivo = 720.00;
    yapePlin = 880.50;
    tarjeta = 250.00;
  }

  // Egresos e ingresos extraordinarios
  const egresosTotal = cajaMovementsStore
    .filter(m => m.tipo === 'egreso')
    .reduce((sum, m) => sum + m.monto, 0);

  const ingresosExtra = cajaMovementsStore
    .filter(m => m.tipo === 'ingreso' && m.categoria !== 'Fondo Inicial')
    .reduce((sum, m) => sum + m.monto, 0);

  const efectivoEsperado = (cajaState.initialCash + efectivo + ingresosExtra) - egresosTotal;

  const deliveryOrders = orders.filter(o => o.orderType === 'delivery').length || 24;
  const pickupOrders = orders.filter(o => o.orderType === 'pickup').length || 10;
  const salonOrders = orders.filter(o => o.orderType === 'salon').length || 4;

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
    totalOrders: orders.length > 0 ? orders.length : 38,
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

// Tickets de venta y boletas
let customTicketsStore: TicketRecord[] = [];

export async function getTickets(): Promise<TicketRecord[]> {
  const orders = await getOrders();
  
  // Convertir órdenes existentes a tickets formateados
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
    const formattedNum = String(rawNum).padStart(5, '0');

    return {
      id: `tk-${o.id}`,
      ticketNumber: `TK-${formattedNum}`,
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

  // Combinar con tickets rápidos generados manualmente
  const combined = [...customTicketsStore, ...orderTickets];
  return combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function createQuickTicket(data: Partial<TicketRecord>): Promise<TicketRecord> {
  const now = new Date();
  const nextNumber = customTicketsStore.length + 1;
  const seq = String(nextNumber).padStart(5, '0');

  const newTicket: TicketRecord = {
    id: `tk-quick-${Date.now()}`,
    ticketNumber: `TK-${seq}`,
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
  const initialTicketsLen = customTicketsStore.length;
  customTicketsStore = customTicketsStore.filter(t => t.id !== id && t.id !== `tk-${id}` && t.orderId !== id && String(t.orderNumber) !== id && String(t.orderNumber) !== rawId);
  
  // Also delete corresponding order from ordersStore
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

// ============================================================================
// GESTIÓN DE PORTADAS / HERO CAROUSEL BANNERS (FORMATO PT0001)
// ============================================================================
export interface PortadaBanner {
  id: string;
  title: string;
  image: string;
  imageMobile: string;
  active: boolean;
  order: number;
  createdAt: string;
  updatedAt?: string;
}

const initialPortadas: PortadaBanner[] = [
  {
    id: 'PT0001',
    title: 'Portada 1',
    image: '/imagenes/portada/Portada1E.webp',
    imageMobile: '/imagenes/portada/Portada1M.webp',
    active: true,
    order: 1,
    createdAt: new Date().toISOString()
  },
  {
    id: 'PT0002',
    title: 'Portada 2',
    image: '/imagenes/portada/Portada2E.webp',
    imageMobile: '/imagenes/portada/Portada2M.webp',
    active: true,
    order: 2,
    createdAt: new Date().toISOString()
  },
  {
    id: 'PT0003',
    title: 'Portada 3',
    image: '/imagenes/portada/Portada3E.webp',
    imageMobile: '/imagenes/portada/Portada3M.webp',
    active: true,
    order: 3,
    createdAt: new Date().toISOString()
  },
  {
    id: 'PT0004',
    title: 'Portada 4',
    image: '/imagenes/portada/Portada4E.webp',
    imageMobile: '/imagenes/portada/Portada4M.webp',
    active: true,
    order: 4,
    createdAt: new Date().toISOString()
  }
];

let portadasStore: PortadaBanner[] = [...initialPortadas];

export async function getPortadas(includeInactive = false): Promise<PortadaBanner[]> {
  let list = [...portadasStore];
  if (!includeInactive) {
    list = list.filter(p => p.active !== false);
  }
  return list.sort((a, b) => a.order - b.order);
}

export async function getPortadaById(id: string): Promise<PortadaBanner | null> {
  const p = portadasStore.find(item => item.id === id);
  return p || null;
}

export function generateNextPortadaId(): string {
  const existingNums = portadasStore
    .map(p => {
      const match = p.id.match(/^PT(\d+)$/i);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter(n => !isNaN(n));
  const maxNum = existingNums.length > 0 ? Math.max(...existingNums) : 0;
  const nextNum = maxNum + 1;
  return `PT${String(nextNum).padStart(4, '0')}`;
}

export function savePortadaImageBase64(base64Str: string, id: string, type: 'E' | 'M'): string {
  if (!base64Str || typeof base64Str !== 'string' || !base64Str.startsWith('data:image')) {
    return base64Str;
  }
  try {
    const base64Data = base64Str.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const targetDir = path.join(process.cwd(), 'publico', 'imagenes', 'portada');
    const distDir = path.join(process.cwd(), 'dist', 'imagenes', 'portada');
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
    if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });

    const cleanId = id.replace(/[^a-zA-Z0-9]/g, '');
    const fileName = `Portada_${cleanId}_${type}.webp`;
    const filePath = path.join(targetDir, fileName);
    fs.writeFileSync(filePath, buffer);

    try {
      fs.copyFileSync(filePath, path.join(distDir, fileName));
    } catch (e) {}

    return `/imagenes/portada/${fileName}`;
  } catch (e) {
    console.error('Error saving portada image:', e);
    return base64Str;
  }
}

export async function createPortada(data: Partial<PortadaBanner>): Promise<PortadaBanner> {
  const newId = data.id && data.id.startsWith('PT') ? data.id : generateNextPortadaId();
  const nextOrder = data.order !== undefined ? data.order : portadasStore.length + 1;

  let finalImage = data.image || `/imagenes/portada/Portada1E.webp`;
  let finalImageMobile = data.imageMobile || data.image || `/imagenes/portada/Portada1M.webp`;

  if (finalImage && finalImage.startsWith('data:image')) {
    finalImage = savePortadaImageBase64(finalImage, newId, 'E');
  }
  if (finalImageMobile && finalImageMobile.startsWith('data:image')) {
    finalImageMobile = savePortadaImageBase64(finalImageMobile, newId, 'M');
  }

  const newPortada: PortadaBanner = {
    id: newId,
    title: data.title || `Portada ${nextOrder}`,
    image: finalImage,
    imageMobile: finalImageMobile,
    active: data.active !== undefined ? Boolean(data.active) : true,
    order: nextOrder,
    createdAt: new Date().toISOString()
  };

  portadasStore.push(newPortada);
  return newPortada;
}

export async function updatePortada(id: string, data: Partial<PortadaBanner>): Promise<PortadaBanner | null> {
  const index = portadasStore.findIndex(item => item.id === id);
  if (index === -1) return null;

  const current = portadasStore[index];
  let finalImage = data.image !== undefined ? data.image : current.image;
  let finalImageMobile = data.imageMobile !== undefined ? data.imageMobile : current.imageMobile;

  if (finalImage && finalImage.startsWith('data:image')) {
    finalImage = savePortadaImageBase64(finalImage, id, 'E');
  }
  if (finalImageMobile && finalImageMobile.startsWith('data:image')) {
    finalImageMobile = savePortadaImageBase64(finalImageMobile, id, 'M');
  }

  portadasStore[index] = {
    ...current,
    ...data,
    image: finalImage,
    imageMobile: finalImageMobile,
    active: data.active !== undefined ? Boolean(data.active) : current.active,
    order: data.order !== undefined ? Number(data.order) : current.order,
    updatedAt: new Date().toISOString(),
    id // preserve id
  };
  return portadasStore[index];
}

export async function deletePortada(id: string): Promise<boolean> {
  const initialLength = portadasStore.length;
  portadasStore = portadasStore.filter(item => item.id !== id);
  portadasStore.forEach((p, idx) => {
    p.order = idx + 1;
  });
  return portadasStore.length < initialLength;
}

export async function reorderPortadas(orderedIds: string[]): Promise<PortadaBanner[]> {
  orderedIds.forEach((id, index) => {
    const p = portadasStore.find(item => item.id === id);
    if (p) p.order = index + 1;
  });
  return portadasStore.sort((a, b) => a.order - b.order);
}



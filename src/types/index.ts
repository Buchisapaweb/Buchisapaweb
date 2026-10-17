export interface Category {
  id: string;
  name: string;
  banner_url?: string;
  order?: number;
  active?: boolean;
}

export interface Accompaniment {
  id: string;
  name: string;
  price?: number;
}

export interface Cream {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  category_id: string;
  price: number;
  description: string;
  image_url: string;
  has_accompaniment?: boolean;
  accompaniment_ids?: string[];
  includes_sauces?: boolean;
  sauce_ids?: string[];
  stock?: number;
  available?: boolean;
  is_promotion?: boolean;
}

export interface CartItem {
  cartItemId: string; // unique identifier in cart
  product: Product;
  quantity: number;
  selectedAccompaniment?: string;
  selectedSauces: string[];
  notes?: string;
  unitPrice: number;
  totalPrice: number;
}

export type OrderType = 'delivery' | 'pickup';

export type OrderStatus = 'pendiente' | 'en_preparacion' | 'en_camino' | 'entregado' | 'cancelado';

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  accompaniment?: string;
  sauces?: string[];
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: OrderStatus;
  orderType: OrderType;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryAddress?: string;
  deliveryReference?: string;
  deliveryFee: number;
  paymentMethod: 'yape' | 'plin' | 'efectivo' | 'tarjeta';
  cashAmount?: number;
  changeAmount?: number;
  notes?: string;
  needCutlery?: boolean;
  items: OrderItem[];
  subtotal: number;
  total: number;
}

export interface DeliveryLocation {
  type: OrderType;
  tag: string;
  phone: string;
  address: string;
  reference: string;
  lat?: number;
  lng?: number;
  fee: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'customer' | 'admin';
  avatarUrl?: string;
}

export interface CajaSummary {
  estado: 'abierta' | 'cerrada';
  montoInicial: number;
  totalVentas: number;
  totalIngresos: number;
  totalEgresos: number;
  saldoActual: number;
  horaApertura?: string;
}

export interface CajaMovement {
  id: string;
  tipo: 'ingreso' | 'egreso';
  concepto: string;
  monto: number;
  fecha: string;
  usuario: string;
}

export interface SupplyItem {
  id: string;
  nombre: string;
  unidad: string;
  stockActual: number;
  stockMinimo: number;
  estado: 'ok' | 'bajo' | 'critico';
}

export interface UtensilItem {
  id: string;
  nombre: string;
  unidad: string;
  stockActual: number;
  stockMinimo: number;
  estado: 'ok' | 'bajo' | 'critico';
}

export interface Claim {
  id: string;
  code: string;
  date: string;
  fullName: string;
  documentType: string;
  documentNumber: string;
  phone: string;
  email: string;
  address: string;
  type: 'queja' | 'reclamo';
  amountClaimed?: number;
  description: string;
  consumerDetail: string;
  status: 'pendiente' | 'en_revision' | 'atendido';
}

export interface CoverBanner {
  id: string;
  title: string;
  subtitle: string;
  desktopImage: string;
  mobileImage: string;
  linkText?: string;
  linkAction?: string;
  active: boolean;
  order: number;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  image?: string;
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  categorySlug: string;
  price: number;
  description: string;
  available: boolean;
  stock: number;
  image: string;
  includesSauces: boolean;
  accompaniments: string[];
  cremas: string[];
}

export interface ExtraOption {
  id: string;
  name: string;
  price: number;
  selected?: boolean;
}

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productPrice: number;
  productImage: string;
  quantity: number;
  selectedAccompaniments: string[];
  selectedCremas: string[];
  selectedExtras: ExtraOption[];
  instructions: string;
  itemTotal: number;
}

export type OrderType = 'DELIVERY' | 'PICKUP' | 'DINE_IN';
export type PaymentMethod = 'EFECTIVO' | 'YAPE_PLIN' | 'TARJETA';
export type OrderStatus = 'PENDIENTE' | 'PREPARANDO' | 'LISTO' | 'ENTREGADO' | 'CANCELADO';

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  orderType: OrderType;
  deliveryAddress?: string;
  deliveryReference?: string;
  tableNumber?: string;
  paymentMethod: PaymentMethod;
  paymentAmountCash?: number;
  notes?: string;
  status: OrderStatus;
  deliveryFee: number;
  subtotal: number;
  total: number;
  items: CartItem[];
  createdAt: number;
}

export interface Claim {
  id: string;
  code: string;
  fullName: string;
  docType: string;
  docNumber: string;
  email: string;
  phone: string;
  address?: string;
  claimType: 'Reclamo' | 'Queja';
  amount?: number;
  description: string;
  consumerClaim: string;
  status: string;
  createdAt: number;
}

export interface BusinessConfig {
  id: string;
  businessName: string;
  ruc: string;
  address: string;
  phone: string;
  email: string;
  deliveryFee: number;
  printerIp: string;
  printerPort: number;
  openingHours: string;
  isOpen: boolean;
}

export interface HeroBanner {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  imageUrl: string;
}

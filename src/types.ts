export interface Product {
  id: string;
  code: string;
  name: string;
  category: string;
  category_id: string;
  price: number;
  description: string;
  badge?: string;
  popular: boolean;
  available: boolean;
  stock: number;
  image: string;
  includes_sauces: boolean;
  categoria_slug: string;
}

export interface Category {
  id: string;
  code: string;
  slug: string;
  name: string;
  icon: string;
  description: string;
  banner: string;
  order: number;
}

export interface SelectedExtra {
  id: string;
  name: string;
  price: number;
}

export interface CartItem {
  cartId: string;
  product: Product;
  quantity: number;
  selectedSauces: string[];
  selectedExtras: SelectedExtra[];
  notes: string;
  unitPriceWithExtras: number;
  totalPrice: number;
}

export type OrderStatus = 'pending' | 'preparing' | 'delivery' | 'completed' | 'cancelled';

export interface Order {
  id: string;
  code: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  orderType: 'delivery' | 'pickup';
  address: string;
  reference: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: 'yape' | 'plin' | 'efectivo' | 'tarjeta';
  cashChangeFor?: number;
  status: OrderStatus;
  notes?: string;
}

export interface StoreConfig {
  isOpen: boolean;
  name: string;
  address: string;
  district: string;
  city: string;
  schedule: string;
  phone: string;
  whatsapp: string;
  deliveryFee: number;
  minOrder: number;
}

export interface SupplyItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minStock: number;
  status: 'ok' | 'low' | 'critical';
}

export interface UtensilItem {
  id: string;
  name: string;
  location: string;
  status: 'operativo' | 'mantenimiento' | 'revision';
  lastChecked: string;
}

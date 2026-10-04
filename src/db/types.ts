export interface Category {
  id: string;
  code?: string;
  slug?: string;
  name: string;
  icon?: string;
  image?: string;
  phrase?: string;
  description?: string;
}

export interface Product {
  id: string;
  code?: string;
  name: string;
  category_id: string;
  price: number;
  originalPrice?: number;
  original_price?: number;
  description: string;
  badge?: string | null;
  popular?: boolean;
  available: boolean;
  stock: number;
  image: string;
  options?: any;
  includes_sauces?: boolean;
  category?: string;
  accompaniments?: string[];
  cremas?: string[];
}

export interface Sauce {
  id: number;
  name: string;
  is_signature: boolean;
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
  orderNumber: number | string;
  orderCode?: string;
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

export interface PortadaBanner {
  id: string;
  title: string;
  highlight?: string;
  subtitle?: string;
  badge?: string;
  badgeType?: string;
  image: string;
  imageMobile?: string;
  secretPillIcon?: string;
  secretPillText?: string;
  buttonText?: string;
  buttonCategory?: string;
  features?: string[];
  active: boolean;
  order: number;
  createdAt: string;
  updatedAt?: string;
}

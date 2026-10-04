import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Category,
  Product,
  CartItem,
  Order,
  Claim,
  BusinessConfig,
  ExtraOption,
  OrderType,
  PaymentMethod,
  OrderStatus
} from '../types';
import { initialCategories, initialProducts, initialBusinessConfig } from '../data/initialData';

interface BuchisapaContextType {
  categories: Category[];
  products: Product[];
  cartItems: CartItem[];
  orders: Order[];
  claims: Claim[];
  businessConfig: BusinessConfig;
  selectedCategory: string;
  setSelectedCategory: (slug: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  customizingProduct: Product | null;
  setCustomizingProduct: (product: Product | null) => void;
  viewingTicketOrder: Order | null;
  setViewingTicketOrder: (order: Order | null) => void;
  
  // Cart actions
  addToCart: (
    product: Product,
    quantity: number,
    accompaniments: string[],
    cremas: string[],
    extras: ExtraOption[],
    instructions: string
  ) => void;
  quickAddToCart: (product: Product) => void;
  removeCartItem: (id: string) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;

  // Order actions
  placeOrder: (params: {
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
  }) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;

  // Claim actions
  submitClaim: (claimData: Omit<Claim, 'id' | 'code' | 'status' | 'createdAt'>) => Claim;

  // Admin actions
  toggleProductAvailability: (productId: string) => void;
  updateProductPrice: (productId: string, price: number) => void;
  updateProductStock: (productId: string, stock: number) => void;
  updateBusinessConfig: (config: BusinessConfig) => void;
}

const BuchisapaContext = createContext<BuchisapaContextType | undefined>(undefined);

export const BuchisapaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories] = useState<Category[]>(initialCategories);
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('buchisapa_products');
    return saved ? JSON.parse(saved) : initialProducts;
  });

  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('buchisapa_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('buchisapa_orders');
    if (saved) return JSON.parse(saved);
    // Initial seeded sample order for live tracking demo
    return [
      {
        id: 'ORD-1001',
        orderNumber: 'BS-8492',
        customerName: 'Carlos Mendoza',
        customerPhone: '987654321',
        customerEmail: 'carlos.mendoza@gmail.com',
        orderType: 'DELIVERY',
        deliveryAddress: 'Av. Los Pinos 142, Santa Clara, Ate',
        deliveryReference: 'Frente al parque principal',
        paymentMethod: 'YAPE_PLIN',
        notes: 'Enviar servilletas y salsas extra',
        status: 'PREPARANDO',
        deliveryFee: 4.0,
        subtotal: 22.0,
        total: 26.0,
        items: [
          {
            id: 'item-demo-1',
            productId: 'PL0001',
            productName: 'PROMO BUCHI DUO',
            productPrice: 22.0,
            productImage: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
            quantity: 1,
            selectedAccompaniments: ['Papa crocante', 'Hamburguesa artesanal'],
            selectedCremas: ['Mayonesa', 'Ají de Rocoto', 'Tártara'],
            selectedExtras: [],
            instructions: 'Bien tostado el pan',
            itemTotal: 22.0
          }
        ],
        createdAt: Date.now() - 15 * 60 * 1000
      }
    ];
  });

  const [claims, setClaims] = useState<Claim[]>(() => {
    const saved = localStorage.getItem('buchisapa_claims');
    return saved ? JSON.parse(saved) : [];
  });

  const [businessConfig, setBusinessConfig] = useState<BusinessConfig>(() => {
    const saved = localStorage.getItem('buchisapa_config');
    return saved ? JSON.parse(saved) : initialBusinessConfig;
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [customizingProduct, setCustomizingProduct] = useState<Product | null>(null);
  const [viewingTicketOrder, setViewingTicketOrder] = useState<Order | null>(null);

  useEffect(() => {
    localStorage.setItem('buchisapa_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('buchisapa_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem('buchisapa_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('buchisapa_claims', JSON.stringify(claims));
  }, [claims]);

  useEffect(() => {
    localStorage.setItem('buchisapa_config', JSON.stringify(businessConfig));
  }, [businessConfig]);

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cartItems.reduce((acc, item) => acc + item.itemTotal, 0);

  const addToCart = (
    product: Product,
    quantity: number,
    accompaniments: string[],
    cremas: string[],
    extras: ExtraOption[],
    instructions: string
  ) => {
    const extrasTotal = extras.reduce((sum, e) => sum + e.price, 0);
    const unitPrice = product.price + extrasTotal;
    const itemTotal = unitPrice * quantity;

    const newItem: CartItem = {
      id: 'item-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      productId: product.id,
      productName: product.name,
      productPrice: product.price,
      productImage: product.image,
      quantity,
      selectedAccompaniments: accompaniments,
      selectedCremas: cremas,
      selectedExtras: extras,
      instructions,
      itemTotal
    };

    setCartItems(prev => [...prev, newItem]);
    setCustomizingProduct(null);
  };

  const quickAddToCart = (product: Product) => {
    addToCart(
      product,
      1,
      product.accompaniments.slice(0, 2),
      product.cremas.slice(0, 3),
      [],
      ''
    );
  };

  const removeCartItem = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const placeOrder = ({
    customerName,
    customerPhone,
    customerEmail,
    orderType,
    deliveryAddress,
    deliveryReference,
    tableNumber,
    paymentMethod,
    paymentAmountCash,
    notes
  }: {
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
  }): Order => {
    const fee = orderType === 'DELIVERY' ? businessConfig.deliveryFee : 0;
    const total = cartSubtotal + fee;
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const newOrder: Order = {
      id: 'ORD-' + Date.now(),
      orderNumber: `BS-${randomDigits}`,
      customerName,
      customerPhone,
      customerEmail,
      orderType,
      deliveryAddress,
      deliveryReference,
      tableNumber,
      paymentMethod,
      paymentAmountCash,
      notes,
      status: 'PENDIENTE',
      deliveryFee: fee,
      subtotal: cartSubtotal,
      total,
      items: [...cartItems],
      createdAt: Date.now()
    };

    setOrders(prev => [newOrder, ...prev]);
    clearCart();
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(prev =>
      prev.map(ord => (ord.id === orderId ? { ...ord, status } : ord))
    );
  };

  const submitClaim = (claimData: Omit<Claim, 'id' | 'code' | 'status' | 'createdAt'>): Claim => {
    const randomCode = 'REC-' + Math.floor(1000 + Math.random() * 9000);
    const newClaim: Claim = {
      ...claimData,
      id: 'CLM-' + Date.now(),
      code: randomCode,
      status: 'Pendiente',
      createdAt: Date.now()
    };
    setClaims(prev => [newClaim, ...prev]);
    return newClaim;
  };

  const toggleProductAvailability = (productId: string) => {
    setProducts(prev =>
      prev.map(p => (p.id === productId ? { ...p, available: !p.available } : p))
    );
  };

  const updateProductPrice = (productId: string, price: number) => {
    setProducts(prev =>
      prev.map(p => (p.id === productId ? { ...p, price } : p))
    );
  };

  const updateProductStock = (productId: string, stock: number) => {
    setProducts(prev =>
      prev.map(p => (p.id === productId ? { ...p, stock } : p))
    );
  };

  const updateBusinessConfig = (config: BusinessConfig) => {
    setBusinessConfig(config);
  };

  return (
    <BuchisapaContext.Provider
      value={{
        categories,
        products,
        cartItems,
        orders,
        claims,
        businessConfig,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        customizingProduct,
        setCustomizingProduct,
        viewingTicketOrder,
        setViewingTicketOrder,
        addToCart,
        quickAddToCart,
        removeCartItem,
        clearCart,
        cartCount,
        cartSubtotal,
        placeOrder,
        updateOrderStatus,
        submitClaim,
        toggleProductAvailability,
        updateProductPrice,
        updateProductStock,
        updateBusinessConfig
      }}
    >
      {children}
    </BuchisapaContext.Provider>
  );
};

export const useBuchisapa = () => {
  const context = useContext(BuchisapaContext);
  if (!context) throw new Error('useBuchisapa must be used within a BuchisapaProvider');
  return context;
};

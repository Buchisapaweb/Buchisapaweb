import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product, OrderType, DeliveryLocation } from '../types';

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity: number, accompaniment?: string, sauces?: string[], notes?: string) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, delta: number) => void;
  clearCart: () => void;
  orderType: OrderType;
  setOrderType: (type: OrderType) => void;
  deliveryLocation: DeliveryLocation;
  setDeliveryLocation: (location: DeliveryLocation) => void;
  needCutlery: boolean;
  setNeedCutlery: (needed: boolean) => void;
  subtotal: number;
  total: number;
  totalItems: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isLocationModalOpen: boolean;
  setIsLocationModalOpen: (open: boolean) => void;
}

const DEFAULT_LOCATION: DeliveryLocation = {
  type: 'delivery',
  tag: 'Mi casa',
  phone: '924955869',
  address: 'Av. La Estrella con Calle 28 de Julio, Santa Clara, Ate',
  reference: 'Frente al Real Plaza Santa Clara',
  fee: 4.0,
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('buchisapa_cart_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [orderType, setOrderTypeState] = useState<OrderType>(() => {
    try {
      const saved = localStorage.getItem('buchisapa_order_type');
      return (saved === 'pickup' ? 'pickup' : 'delivery') as OrderType;
    } catch {
      return 'delivery';
    }
  });

  const [deliveryLocation, setDeliveryLocationState] = useState<DeliveryLocation>(() => {
    try {
      const saved = localStorage.getItem('buchisapa_location');
      return saved ? JSON.parse(saved) : DEFAULT_LOCATION;
    } catch {
      return DEFAULT_LOCATION;
    }
  });

  const [needCutlery, setNeedCutlery] = useState<boolean>(true);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem('buchisapa_cart_v1', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('buchisapa_order_type', orderType);
  }, [orderType]);

  useEffect(() => {
    localStorage.setItem('buchisapa_location', JSON.stringify(deliveryLocation));
  }, [deliveryLocation]);

  const setOrderType = (type: OrderType) => {
    setOrderTypeState(type);
    setDeliveryLocationState((prev) => ({
      ...prev,
      type,
      fee: type === 'pickup' ? 0 : 4.0,
    }));
  };

  const setDeliveryLocation = (location: DeliveryLocation) => {
    setDeliveryLocationState(location);
    if (location.type !== orderType) {
      setOrderTypeState(location.type);
    }
  };

  const addItem = (
    product: Product,
    quantity: number,
    accompaniment?: string,
    sauces: string[] = [],
    notes?: string
  ) => {
    const sortedSauces = [...sauces].sort();
    const cartItemId = `${product.id}_${accompaniment || 'none'}_${sortedSauces.join('-')}_${notes || ''}`;

    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.cartItemId === cartItemId);
      if (existingIndex > -1) {
        const updated = [...prevItems];
        const newQty = updated[existingIndex].quantity + quantity;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
          totalPrice: newQty * product.price,
        };
        return updated;
      }

      const newItem: CartItem = {
        cartItemId,
        product,
        quantity,
        selectedAccompaniment: accompaniment,
        selectedSauces: sortedSauces,
        notes,
        unitPrice: product.price,
        totalPrice: product.price * quantity,
      };

      return [...prevItems, newItem];
    });

    setIsCartOpen(true);
  };

  const removeItem = (cartItemId: string) => {
    setItems((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((item) => {
          if (item.cartItemId === cartItemId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            return {
              ...item,
              quantity: newQty,
              totalPrice: newQty * item.unitPrice,
            };
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const deliveryFee = orderType === 'delivery' ? deliveryLocation.fee : 0;
  const total = subtotal + deliveryFee;
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        orderType,
        setOrderType,
        deliveryLocation,
        setDeliveryLocation,
        needCutlery,
        setNeedCutlery,
        subtotal,
        total,
        totalItems,
        isCartOpen,
        setIsCartOpen,
        isLocationModalOpen,
        setIsLocationModalOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

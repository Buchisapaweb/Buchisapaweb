import { Order } from './types';

export const ordersStore: Order[] = [];

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

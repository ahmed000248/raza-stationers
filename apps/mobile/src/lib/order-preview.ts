import { Order } from '../types';

export async function createPreviewOrder(orderPayload: Partial<Order>): Promise<Order> {
  return {
    id: 'MOCK-ORD-' + Math.floor(1000 + Math.random() * 9000),
    date: new Date().toISOString().split('T')[0],
    stageIndex: 0,
    city: orderPayload.city || 'Karachi',
    address: orderPayload.address || 'Local Mobile Order',
    recipientName: orderPayload.recipientName || 'Ahmed Raza',
    phone: orderPayload.phone || '03001234567',
    items: orderPayload.items || [],
    subtotal: orderPayload.subtotal || 0,
    deliveryFee: orderPayload.deliveryFee || 0,
    totalAmount: orderPayload.totalAmount || 0,
    paymentMethod: orderPayload.paymentMethod || 'cod',
    transferRef: orderPayload.transferRef,
    receiptUploaded: orderPayload.receiptUploaded,
  };
}

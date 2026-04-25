import api from './api';
import type { PaymentCreateRequest } from '../types';

export async function createPayment(
  orderId: string,
  currency: string = 'UYU',
): Promise<{ redirect_url?: string; id?: string }> {
  const res = await api.post('/api/v1/payments/create', {
    order_id: orderId,
    currency,
  });
  return res.data.data;
}

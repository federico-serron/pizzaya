import api from './api';
import type { OrderResponse, OrderCreate, Pagination } from '../types';

export interface OrdersResponse {
  data: OrderResponse[];
  pagination: Pagination;
}

export async function getOrders(page = 1, limit = 20): Promise<OrdersResponse> {
  const res = await api.get('/api/v1/orders', { params: { page, limit } });
  return { data: res.data.data, pagination: res.data.pagination };
}

export async function getOrder(orderId: string): Promise<OrderResponse> {
  const res = await api.get(`/api/v1/orders/${orderId}`);
  return res.data.data;
}

export async function createOrder(data: OrderCreate): Promise<OrderResponse> {
  const res = await api.post('/api/v1/orders', data);
  return res.data.data;
}

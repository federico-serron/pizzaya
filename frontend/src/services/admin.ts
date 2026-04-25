import api from './api';
import type {
  DashboardStats,
  ProductResponse,
  ProductCreate,
  ProductUpdate,
  CategoryResponse,
  CategoryCreate,
  CategoryUpdate,
  OrderResponse,
  Pagination,
} from '../types';

// --- Dashboard ---
export async function getDashboardStats(): Promise<DashboardStats> {
  const res = await api.get('/api/v1/admin/dashboard');
  return res.data.data;
}

// --- Products ---
export async function adminCreateProduct(data: ProductCreate): Promise<ProductResponse> {
  const res = await api.post('/api/v1/admin/products', data);
  return res.data.data;
}

export async function adminUpdateProduct(
  productId: string,
  data: ProductUpdate,
): Promise<ProductResponse> {
  const res = await api.put(`/api/v1/admin/products/${productId}`, data);
  return res.data.data;
}

export async function adminDeleteProduct(productId: string): Promise<void> {
  await api.delete(`/api/v1/admin/products/${productId}`);
}

export async function adminToggleAvailability(productId: string): Promise<ProductResponse> {
  const res = await api.patch(`/api/v1/admin/products/${productId}/availability`);
  return res.data.data;
}

// --- Categories ---
export async function adminCreateCategory(data: CategoryCreate): Promise<CategoryResponse> {
  const res = await api.post('/api/v1/admin/categories', data);
  return res.data.data;
}

export async function adminUpdateCategory(
  categoryId: string,
  data: CategoryUpdate,
): Promise<CategoryResponse> {
  const res = await api.put(`/api/v1/admin/categories/${categoryId}`, data);
  return res.data.data;
}

export async function adminDeleteCategory(categoryId: string): Promise<void> {
  await api.delete(`/api/v1/admin/categories/${categoryId}`);
}

// --- Orders ---
export interface AdminOrdersResponse {
  data: OrderResponse[];
  pagination: Pagination;
}

export async function adminGetOrders(
  status?: string,
  page = 1,
  limit = 20,
): Promise<AdminOrdersResponse> {
  const res = await api.get('/api/v1/admin/orders', {
    params: { status, page, limit },
  });
  return { data: res.data.data, pagination: res.data.pagination };
}

export async function adminGetOrder(orderId: string): Promise<OrderResponse> {
  const res = await api.get(`/api/v1/admin/orders/${orderId}`);
  return res.data.data;
}

export async function adminUpdateOrderStatus(
  orderId: string,
  newStatus: string,
): Promise<OrderResponse> {
  const res = await api.patch(
    `/api/v1/admin/orders/${orderId}/status`,
    null,
    { params: { new_status: newStatus } },
  );
  return res.data.data;
}

import api from './api';
import type { ProductResponse, Pagination } from '../types';

export interface ProductsResponse {
  data: ProductResponse[];
  pagination: Pagination;
}

export async function getProducts(params?: {
  category_slug?: string;
  search?: string;
  is_featured?: boolean;
  page?: number;
  limit?: number;
}): Promise<ProductsResponse> {
  const res = await api.get('/api/v1/products', { params });
  return { data: res.data.data, pagination: res.data.pagination };
}

export async function getFeaturedProducts(limit = 8): Promise<ProductResponse[]> {
  const res = await api.get('/api/v1/products/featured', { params: { limit } });
  return res.data.data;
}

export async function getProductBySlug(slug: string): Promise<ProductResponse> {
  const res = await api.get(`/api/v1/products/${slug}`);
  // This endpoint returns the product directly, not wrapped
  return res.data;
}

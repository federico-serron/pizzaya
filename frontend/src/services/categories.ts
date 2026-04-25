import api from './api';
import type { CategoryResponse } from '../types';

export async function getCategories(): Promise<CategoryResponse[]> {
  const res = await api.get('/api/v1/categories');
  return res.data.data;
}

export async function getCategoryBySlug(slug: string): Promise<CategoryResponse> {
  const res = await api.get(`/api/v1/categories/${slug}`);
  return res.data.data;
}

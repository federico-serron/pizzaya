import api from './api';
import type { CartItem, CartData } from '../types';

export async function getCart(): Promise<CartData> {
  const res = await api.get('/api/v1/cart');
  return res.data.data;
}

export async function addToCart(
  product_id: string,
  name: string,
  price: number,
  quantity: number = 1,
): Promise<CartItem[]> {
  const res = await api.put('/api/v1/cart/items', {
    product_id,
    name,
    price,
    quantity,
  });
  return res.data.data.items;
}

export async function updateCartItem(
  product_id: string,
  quantity: number,
): Promise<CartItem[]> {
  const res = await api.patch(`/api/v1/cart/items/${product_id}`, null, {
    params: { quantity },
  });
  return res.data.data.items;
}

export async function removeCartItem(product_id: string): Promise<CartItem[]> {
  const res = await api.delete(`/api/v1/cart/items/${product_id}`);
  return res.data.data.items;
}

export async function clearCart(): Promise<void> {
  await api.delete('/api/v1/cart');
}

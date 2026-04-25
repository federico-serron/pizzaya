import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import type { CartItem } from '../types';
import { useAuth } from './AuthContext';
import { getCart, addToCart, updateCartItem, removeCartItem, clearCart } from '../services/cart';

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  isLoading: boolean;
  addItem: (product_id: string, name: string, price: number, quantity?: number) => Promise<void>;
  updateItem: (product_id: string, quantity: number) => Promise<void>;
  removeItem: (product_id: string) => Promise<void>;
  emptyCart: () => Promise<void>;
  refetchCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setItems([]);
      return;
    }
    setIsLoading(true);
    try {
      const data = await getCart();
      setItems(data.items);
    } catch {
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addItem = useCallback(
    async (product_id: string, name: string, price: number, quantity = 1) => {
      try {
        const updated = await addToCart(product_id, name, price, quantity);
        setItems(updated);
        toast.success('Agregado al carrito');
        queryClient.invalidateQueries({ queryKey: ['cart'] });
      } catch (err: any) {
        toast.error(err.message || 'Error al agregar al carrito');
      }
    },
    [queryClient],
  );

  const updateItem = useCallback(
    async (product_id: string, quantity: number) => {
      try {
        const updated = await updateCartItem(product_id, quantity);
        setItems(updated);
        queryClient.invalidateQueries({ queryKey: ['cart'] });
      } catch (err: any) {
        toast.error(err.message || 'Error al actualizar');
      }
    },
    [queryClient],
  );

  const removeItem = useCallback(
    async (product_id: string) => {
      try {
        const updated = await removeCartItem(product_id);
        setItems(updated);
        toast.success('Eliminado del carrito');
        queryClient.invalidateQueries({ queryKey: ['cart'] });
      } catch (err: any) {
        toast.error(err.message || 'Error al eliminar');
      }
    },
    [queryClient],
  );

  const emptyCart = useCallback(async () => {
    try {
      await clearCart();
      setItems([]);
      toast.success('Carrito vaciado');
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    } catch (err: any) {
      toast.error(err.message || 'Error al vaciar el carrito');
    }
  }, [queryClient]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const value: CartContextType = {
    items,
    totalItems,
    totalPrice,
    isLoading,
    addItem,
    updateItem,
    removeItem,
    emptyCart,
    refetchCart: fetchCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

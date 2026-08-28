import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CartService } from '../feature/cart/services/cartService';
import type { CartItem, ID } from '../api/types';
import { useAuth } from './AuthContext';

interface CartContextType {
  itemCount: number;
  items: CartItem[];
  loading: boolean;
  refreshCart: () => Promise<void>;
  addItem: (variantId: ID, quantity?: number, unitPrice?: number) => Promise<void>;
  updateQuantity: (cartItemId: ID, quantity: number) => Promise<void>;
  removeItem: (cartItemId: ID) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    try {
      setLoading(true);
      const cart = await CartService.getCart();
      setItems(cart?.items || []);
    } catch (e) {
      console.error('Failed to load cart:', e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Tự động load giỏ hàng khi user thay đổi
  useEffect(() => {
    refreshCart();
  }, [user, refreshCart]);

  const addItem = async (variantId: ID, quantity = 1, unitPrice = 0) => {
    await CartService.addItem(variantId, quantity, unitPrice);
    await refreshCart();
  };

  const updateQuantity = async (cartItemId: ID, quantity: number) => {
    await CartService.updateQuantity(cartItemId, quantity);
    await refreshCart();
  };

  const removeItem = async (cartItemId: ID) => {
    await CartService.removeItem(cartItemId);
    await refreshCart();
  };

  const clearCart = async () => {
    await CartService.clearCart();
    setItems([]);
  };

  const itemCount = items.reduce((total, item) => total + (item.quantity || 0), 0);

  return (
    <CartContext.Provider
      value={{
        itemCount,
        items,
        loading,
        refreshCart,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

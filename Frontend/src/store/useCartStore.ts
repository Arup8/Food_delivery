import { create } from 'zustand';
import { cart } from '../lib/api';
import { CartItem } from '../types';
import { useAuthStore } from './useAuthStore';

interface CartState {
  cartItems: CartItem[];
  isLoading: boolean;
  error: string | null;
  fetchCartItems: () => Promise<void>;
  addToCart: (foodItemId: string) => Promise<void>;
  removeFromCart: (foodItemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
 checkout: (userId: string, payload: { cartItems: CartItem[]; totalAmount: number }) => Promise<string | null>; // returns orderId on success
}

export const useCartStore = create<CartState>((set) => ({
  cartItems: [],
  isLoading: false,
  error: null,
  
  fetchCartItems: async () => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) {
      set({ error: 'User not authenticated' });
      return;
    }
    
    try {
      set({ isLoading: true, error: null });
      const cartItems = await cart.get(userId);
      console.log('Fetched cart items:', cartItems[0]);
      set({ cartItems, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch cart items:', error);
      set({ error: 'Failed to fetch cart items', isLoading: false });
    }
  },
  
  addToCart: async (foodItemId: string) => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) {
      set({ error: 'User not authenticated' });
      return;
    }
    
    try {
      set({ isLoading: true, error: null });
      await cart.add(userId, foodItemId);
      // Refresh cart items
      const cartItems = await cart.get(userId);
      set({ cartItems, isLoading: false });
    } catch (error) {
      console.error('Failed to add item to cart:', error);
      set({ error: 'Failed to add item to cart', isLoading: false });
    }
  },
  
  removeFromCart: async (foodItemId: string) => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) {
      set({ error: 'User not authenticated' });
      return;
    }
    
    try {
      set({ isLoading: true, error: null });
      await cart.remove(userId, foodItemId);
      // Refresh cart items
      const cartItems = await cart.get(userId);
      set({ cartItems, isLoading: false });
    } catch (error) {
      console.error('Failed to remove item from cart:', error);
      set({ error: 'Failed to remove item from cart', isLoading: false });
    }
  },
  
  clearCart: async () => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) {
      set({ error: 'User not authenticated' });
      return;
    }
    
    try {
      set({ isLoading: true, error: null });
      await cart.clear(userId);
      set({ cartItems: [], isLoading: false });
    } catch (error) {
      console.error('Failed to clear cart:', error);
      set({ error: 'Failed to clear cart', isLoading: false });
    }
  },
  
  checkout: async (userId, payload) => {
  try {
    set({ isLoading: true, error: null });
    const order = await cart.checkout(userId, payload); // Send payload to backend
    set({ cartItems: [], isLoading: false });
    return order;
  } catch (error) {
    console.error('Checkout failed:', error);
    set({ error: 'Checkout failed', isLoading: false });
    return null;
  }
},

})); 
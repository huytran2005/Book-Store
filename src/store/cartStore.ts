import { create } from 'zustand';
import { CartItem, Book } from '@/types';

interface CartState {
  items: CartItem[];
  addItem: (book: Book, quantity?: number) => void;
  removeItem: (bookId: string) => void;
  updateQuantity: (bookId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

// Helper to load/save cart from localStorage safely in Next.js (SSR safe)
const loadCartFromStorage = (): CartItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem('bookstore_cart');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load cart from storage', error);
    return [];
  }
};

const saveCartToStorage = (items: CartItem[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('bookstore_cart', JSON.stringify(items));
  } catch (error) {
    console.error('Failed to save cart to storage', error);
  }
};

export const useCartStore = create<CartState>((set, get) => ({
  items: loadCartFromStorage(),

  addItem: (book: Book, quantity = 1) => {
    set((state) => {
      const existingItemIndex = state.items.findIndex(item => item.book.id === book.id);
      let newItems: CartItem[];

      if (existingItemIndex > -1) {
        newItems = [...state.items];
        newItems[existingItemIndex].quantity += quantity;
      } else {
        newItems = [...state.items, { book, quantity }];
      }

      saveCartToStorage(newItems);
      return { items: newItems };
    });
  },

  removeItem: (bookId: string) => {
    set((state) => {
      const newItems = state.items.filter(item => item.book.id !== bookId);
      saveCartToStorage(newItems);
      return { items: newItems };
    });
  },

  updateQuantity: (bookId: string, quantity: number) => {
    set((state) => {
      if (quantity <= 0) {
        const newItems = state.items.filter(item => item.book.id !== bookId);
        saveCartToStorage(newItems);
        return { items: newItems };
      }
      
      const newItems = state.items.map(item => 
        item.book.id === bookId ? { ...item, quantity } : item
      );
      saveCartToStorage(newItems);
      return { items: newItems };
    });
  },

  clearCart: () => {
    set(() => {
      saveCartToStorage([]);
      return { items: [] };
    });
  },

  getTotalItems: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },

  getTotalPrice: () => {
    return get().items.reduce((sum, item) => sum + (item.book.price * item.quantity), 0);
  }
}));

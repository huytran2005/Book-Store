import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useCartStore } from '../store/cartStore';
import { Book } from '../types';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
});

const mockBook1: Book = {
  id: 'book-1',
  title: 'Test Book 1',
  author: 'Author 1',
  category: 'programming',
  price: 150000,
  quantity: 10,
  sold: 0,
  description: 'Test description 1',
  imageUrl: 'test1.jpg',
  createdAt: new Date().toISOString(),
};

const mockBook2: Book = {
  id: 'book-2',
  title: 'Test Book 2',
  author: 'Author 2',
  category: 'business',
  price: 200000,
  quantity: 5,
  sold: 2,
  description: 'Test description 2',
  imageUrl: 'test2.jpg',
  createdAt: new Date().toISOString(),
};

describe('useCartStore Unit Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    useCartStore.getState().clearCart();
  });

  it('should start with an empty cart', () => {
    const state = useCartStore.getState();
    expect(state.items).toEqual([]);
    expect(state.getTotalItems()).toBe(0);
    expect(state.getTotalPrice()).toBe(0);
  });

  it('should add a book to the cart', () => {
    const store = useCartStore.getState();
    store.addItem(mockBook1, 2);

    const updatedState = useCartStore.getState();
    expect(updatedState.items.length).toBe(1);
    expect(updatedState.items[0].book.id).toBe('book-1');
    expect(updatedState.items[0].quantity).toBe(2);
    expect(updatedState.getTotalItems()).toBe(2);
    expect(updatedState.getTotalPrice()).toBe(300000);
  });

  it('should increment quantity when adding an existing book', () => {
    const store = useCartStore.getState();
    store.addItem(mockBook1, 2);
    store.addItem(mockBook1, 3);

    const updatedState = useCartStore.getState();
    expect(updatedState.items.length).toBe(1);
    expect(updatedState.items[0].quantity).toBe(5);
    expect(updatedState.getTotalItems()).toBe(5);
  });

  it('should remove a book from the cart', () => {
    const store = useCartStore.getState();
    store.addItem(mockBook1, 2);
    store.addItem(mockBook2, 1);
    
    store.removeItem('book-1');

    const updatedState = useCartStore.getState();
    expect(updatedState.items.length).toBe(1);
    expect(updatedState.items[0].book.id).toBe('book-2');
  });

  it('should update the quantity of a book', () => {
    const store = useCartStore.getState();
    store.addItem(mockBook1, 2);
    store.updateQuantity('book-1', 5);

    const updatedState = useCartStore.getState();
    expect(updatedState.items[0].quantity).toBe(5);
  });

  it('should remove the book if quantity is updated to 0 or negative', () => {
    const store = useCartStore.getState();
    store.addItem(mockBook1, 2);
    store.updateQuantity('book-1', 0);

    const updatedState = useCartStore.getState();
    expect(updatedState.items.length).toBe(0);
  });

  it('should clear the cart', () => {
    const store = useCartStore.getState();
    store.addItem(mockBook1, 2);
    store.addItem(mockBook2, 3);
    store.clearCart();

    const updatedState = useCartStore.getState();
    expect(updatedState.items).toEqual([]);
    expect(updatedState.getTotalItems()).toBe(0);
  });
});

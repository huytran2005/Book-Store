import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mocks for browser globals
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

if (typeof window === 'undefined') {
  global.window = {
    dispatchEvent: () => {},
  } as any;
}

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
});

// Mock firebase config to enforce mock mode
vi.mock('../lib/firebase', () => ({
  auth: null,
  db: null,
  isFirebaseConfigured: false,
}));

// Import services after mocks
import { bookService } from '../services/bookService';
import { orderService } from '../services/orderService';
import { Book } from '../types';

describe('orderService Integration Tests (Mock Mode)', () => {
  let testBook: Book;

  beforeEach(async () => {
    localStorage.clear();
    
    // Seed and create a test book to place order on
    testBook = await bookService.createBook({
      title: 'Target Book',
      author: 'Author Test',
      category: 'science',
      price: 100000,
      description: 'Book for order test',
      imageUrl: 'target.jpg',
      quantity: 50,
    });
  });

  it('should create an order and update book stock/sold counts', async () => {
    const orderPayload = {
      userId: 'customer-1',
      items: [
        {
          book: testBook,
          quantity: 3,
        },
      ],
      totalPrice: 300000,
      customerInfo: {
        name: 'Nguyen Van A',
        phone: '0901234567',
        address: '123 Nguyen Trai, Q1',
        paymentMethod: 'COD' as const,
      },
    };

    const order = await orderService.createOrder(orderPayload);
    
    expect(order.id).toBeDefined();
    expect(order.status).toBe('Pending');
    expect(order.userId).toBe('customer-1');
    expect(order.totalPrice).toBe(300000);

    // Verify book stock is updated: quantity 50 -> 47, sold 0 -> 3
    const updatedBook = await bookService.getBookById(testBook.id);
    expect(updatedBook?.quantity).toBe(47);
    expect(updatedBook?.sold).toBe(3);
  });

  it('should fetch orders by user id', async () => {
    const orderPayload = {
      userId: 'user-xyz',
      items: [{ book: testBook, quantity: 1 }],
      totalPrice: 100000,
      customerInfo: {
        name: 'Nguyen Van A',
        phone: '0901234567',
        address: '123 Nguyen Trai, Q1',
        paymentMethod: 'COD' as const,
      },
    };

    await orderService.createOrder(orderPayload);
    
    const userOrders = await orderService.getOrdersByUser('user-xyz');
    expect(userOrders.length).toBe(1);
    expect(userOrders[0].userId).toBe('user-xyz');
  });

  it('should update order status', async () => {
    const orderPayload = {
      userId: 'customer-1',
      items: [{ book: testBook, quantity: 1 }],
      totalPrice: 100000,
      customerInfo: {
        name: 'Nguyen Van A',
        phone: '0901234567',
        address: '123 Nguyen Trai, Q1',
        paymentMethod: 'COD' as const,
      },
    };

    const order = await orderService.createOrder(orderPayload);
    
    await orderService.updateOrderStatus(order.id, 'Shipping');
    
    const updatedOrder = await orderService.getOrderById(order.id);
    expect(updatedOrder?.status).toBe('Shipping');
  });

  it('should delete an order', async () => {
    const orderPayload = {
      userId: 'customer-1',
      items: [{ book: testBook, quantity: 1 }],
      totalPrice: 100000,
      customerInfo: {
        name: 'Nguyen Van A',
        phone: '0901234567',
        address: '123 Nguyen Trai, Q1',
        paymentMethod: 'COD' as const,
      },
    };

    const order = await orderService.createOrder(orderPayload);
    
    await orderService.deleteOrder(order.id);
    const afterDelete = await orderService.getOrderById(order.id);
    expect(afterDelete).toBeNull();
  });
});

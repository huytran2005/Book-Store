import { firestoreService } from '@/lib/firestore';
import { bookService } from './bookService';
import { Order } from '@/types';

const ORDERS_COLLECTION = 'orders';

export const orderService = {
  async getAllOrders(): Promise<Order[]> {
    return (await firestoreService.getAll(ORDERS_COLLECTION)) as Order[];
  },

  async getOrderById(id: string): Promise<Order | null> {
    return (await firestoreService.getById(ORDERS_COLLECTION, id)) as Order | null;
  },

  async getOrdersByUser(userId: string): Promise<Order[]> {
    return (await firestoreService.queryByField(ORDERS_COLLECTION, 'userId', '==', userId)) as Order[];
  },

  async createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'status'>): Promise<Order> {
    const newOrder = {
      ...orderData,
      status: 'Pending' as const,
    };

    const savedOrder = await firestoreService.add(ORDERS_COLLECTION, newOrder);

    // Update quantities and sold count for each book in the order
    for (const item of orderData.items) {
      try {
        const book = await bookService.getBookById(item.book.id);
        if (book) {
          const newQty = Math.max(0, book.quantity - item.quantity);
          const newSold = book.sold + item.quantity;
          await bookService.updateBook(book.id, {
            quantity: newQty,
            sold: newSold,
          });
        }
      } catch (err) {
        console.error(`Error updating book stock for ${item.book.id}:`, err);
      }
    }

    return savedOrder as Order;
  },

  async updateOrderStatus(id: string, status: Order['status']): Promise<void> {
    await firestoreService.update(ORDERS_COLLECTION, id, { status });
  },

  async deleteOrder(id: string): Promise<void> {
    await firestoreService.delete(ORDERS_COLLECTION, id);
  }
};

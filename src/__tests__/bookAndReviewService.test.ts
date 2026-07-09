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
import { reviewService } from '../services/reviewService';

describe('bookService & reviewService Integration Tests (Mock Mode)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('bookService Tests', () => {
    it('should seed default books and categories if database is empty', async () => {
      const books = await bookService.getAllBooks();
      const categories = await bookService.getAllCategories();
      
      expect(books.length).toBeGreaterThan(0);
      expect(categories.length).toBeGreaterThan(0);
      
      // Specifically checks if "Đắc Nhân Tâm" exists in the seed
      const dacNhanTam = books.find(b => b.title === 'Đắc Nhân Tâm');
      expect(dacNhanTam).toBeDefined();
      expect(dacNhanTam?.category).toBe('ky-nang-song');
    });

    it('should add, fetch, and delete a custom book', async () => {
      const customBookPayload = {
        title: 'Clean Code',
        author: 'Robert C. Martin',
        category: 'programming',
        price: 350000,
        description: 'A handbook of agile software craftsmanship.',
        imageUrl: 'cleancode.jpg',
        quantity: 50,
      };

      const createdBook = await bookService.createBook(customBookPayload);
      expect(createdBook.id).toBeDefined();
      expect(createdBook.title).toBe('Clean Code');
      expect(createdBook.sold).toBe(0);

      const fetchedBook = await bookService.getBookById(createdBook.id);
      expect(fetchedBook).not.toBeNull();
      expect(fetchedBook?.author).toBe('Robert C. Martin');

      // Fetch by category
      const progBooks = await bookService.getBooksByCategory('programming');
      expect(progBooks.some(b => b.id === createdBook.id)).toBe(true);

      // Delete the book
      await bookService.deleteBook(createdBook.id);
      const afterDelete = await bookService.getBookById(createdBook.id);
      expect(afterDelete).toBeNull();
    });

    it('should update an existing book detail', async () => {
      // First let seed run
      const books = await bookService.getAllBooks();
      const firstBook = books[0];

      await bookService.updateBook(firstBook.id, { price: 999999, quantity: 2 });
      const updated = await bookService.getBookById(firstBook.id);
      
      expect(updated?.price).toBe(999999);
      expect(updated?.quantity).toBe(2);
    });
  });

  describe('reviewService Tests', () => {
    it('should auto-seed default reviews for a book if it has no reviews', async () => {
      const bookId = 'book-without-reviews-id';
      const reviews = await reviewService.getReviewsByBook(bookId);
      
      expect(reviews.length).toBe(2);
      expect(reviews[0].bookId).toBe(bookId);
      expect(reviews[0].rating).toBe(5);
    });

    it('should add and fetch user reviews correctly', async () => {
      const bookId = 'target-book-id';
      
      const newReview = await reviewService.addReview({
        bookId,
        userId: 'user-abc',
        userName: 'John Doe',
        rating: 4,
        comment: 'Quite insightful!',
      });

      expect(newReview.id).toBeDefined();
      
      const reviews = await reviewService.getReviewsByBook(bookId);
      // It will not seed default reviews because reviews.length was initially 1 (non-zero)
      expect(reviews.length).toBe(1);
      expect(reviews[0].comment).toBe('Quite insightful!');
      expect(reviews[0].userName).toBe('John Doe');
    });
  });
});

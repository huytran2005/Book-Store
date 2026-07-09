import { firestoreService } from '@/lib/firestore';
import { Review } from '@/types';

const REVIEWS_COLLECTION = 'reviews';

const defaultReviews: Omit<Review, 'id' | 'createdAt'>[] = [
  {
    bookId: 'seed_book_1', // We will resolve this to matching seeded books if needed
    userId: 'mock_user_1',
    userName: 'Nguyễn Văn Nam',
    rating: 5,
    comment: 'Cuốn sách tuyệt vời, thay đổi hoàn toàn cách tôi giao tiếp và ứng xử hàng ngày. Giao hàng nhanh và bọc sách cẩn thận.',
  },
  {
    bookId: 'seed_book_1',
    userId: 'mock_user_2',
    userName: 'Trần Thị Mai',
    rating: 4,
    comment: 'Sách in đẹp, nội dung sâu sắc. Rất đáng đọc đối với mọi lứa tuổi.',
  }
];

export const reviewService = {
  async getReviewsByBook(bookId: string): Promise<Review[]> {
    const reviews = (await firestoreService.queryByField(REVIEWS_COLLECTION, 'bookId', '==', bookId)) as Review[];
    
    // If no reviews exist for this book, seed 2 default reviews for visual completeness
    if (reviews.length === 0) {
      const seeded: Review[] = [];
      for (const rev of defaultReviews) {
        const newRev = await firestoreService.add(REVIEWS_COLLECTION, {
          ...rev,
          bookId
        });
        seeded.push(newRev as Review);
      }
      return seeded;
    }
    return reviews;
  },

  async addReview(review: Omit<Review, 'id' | 'createdAt'>): Promise<Review> {
    return (await firestoreService.add(REVIEWS_COLLECTION, review)) as Review;
  },

  async deleteReview(id: string): Promise<void> {
    await firestoreService.delete(REVIEWS_COLLECTION, id);
  }
};

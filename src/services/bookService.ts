import { firestoreService } from '@/lib/firestore';
import { Book, Category } from '@/types';

const BOOKS_COLLECTION = 'books';
const CATEGORIES_COLLECTION = 'categories';

const defaultCategories: Omit<Category, 'id'>[] = [
  { name: 'Văn học - Tiểu thuyết', slug: 'van-hoc-tieu-thuyet' },
  { name: 'Kinh doanh - Đầu tư', slug: 'kinh-doanh-dau-tu' },
  { name: 'Kỹ năng sống - Phát triển bản thân', slug: 'ky-nang-song' },
  { name: 'Thiếu nhi - Truyện tranh', slug: 'thieu-nhi' },
  { name: 'Khoa học - Công nghệ', slug: 'khoa-hoc-cong-nghe' },
];

const defaultBooks: Omit<Book, 'id'>[] = [
  {
    title: 'Đắc Nhân Tâm',
    author: 'Dale Carnegie',
    category: 'ky-nang-song',
    price: 86000,
    oldPrice: 110000,
    description: 'Cuốn sách bán chạy nhất mọi thời đại đưa ra những lời khuyên bổ ích về cách ứng xử và giao tiếp hiệu quả trong cuộc sống.',
    imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600',
    quantity: 100,
    sold: 45,
    createdAt: new Date().toISOString()
  },
  {
    title: 'Nhà Giả Kim',
    author: 'Paulo Coelho',
    category: 'van-hoc-tieu-thuyet',
    price: 79000,
    oldPrice: 99000,
    description: 'Một câu chuyện triết lý sâu sắc kể về hành trình tìm kiếm kho tàng của chàng chăn cừu Santiago, qua đó truyền tải thông điệp về việc theo đuổi ước mơ.',
    imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=600',
    quantity: 150,
    sold: 120,
    createdAt: new Date().toISOString()
  },
  {
    title: 'Nghĩ Giàu Và Làm Giàu',
    author: 'Napoleon Hill',
    category: 'kinh-doanh-dau-tu',
    price: 95000,
    oldPrice: 135000,
    description: 'Một trong những cuốn sách truyền cảm hứng làm giàu và thành công kinh điển nhất lịch sử, tổng hợp từ nghiên cứu hàng trăm triệu phú.',
    imageUrl: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=600',
    quantity: 80,
    sold: 30,
    createdAt: new Date().toISOString()
  },
  {
    title: 'Doraemon - Tập 1',
    author: 'Fujiko F. Fujio',
    category: 'thieu-nhi',
    price: 25000,
    oldPrice: 30000,
    description: 'Tập mở đầu của bộ truyện tranh huyền thoại về chú mèo máy thông minh đến từ tương lai Doraemon và cậu bạn hậu đậu Nobita.',
    imageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&q=80&w=600',
    quantity: 200,
    sold: 180,
    createdAt: new Date().toISOString()
  },
  {
    title: 'Lược Sử Thời Gian',
    author: 'Stephen Hawking',
    category: 'khoa-hoc-cong-nghe',
    price: 115000,
    oldPrice: 150000,
    description: 'Tác phẩm khoa học đại chúng kinh điển giải thích những lý thuyết vật lý hiện đại phức tạp về vũ trụ, hố đen, thời gian một cách dễ hiểu.',
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=600',
    quantity: 50,
    sold: 15,
    createdAt: new Date().toISOString()
  },
  {
    title: 'Cha Giàu Cha Nghèo',
    author: 'Robert T. Kiyosaki',
    category: 'kinh-doanh-dau-tu',
    price: 105000,
    oldPrice: 140000,
    description: 'Cuốn sách thay đổi tư duy tài chính của hàng triệu người, chia sẻ sự khác biệt trong tư duy dạy con làm giàu giữa người giàu và người nghèo.',
    imageUrl: 'https://images.unsplash.com/photo-1592496431122-2349e0fbc666?auto=format&fit=crop&q=80&w=600',
    quantity: 120,
    sold: 95,
    createdAt: new Date().toISOString()
  }
];

export const bookService = {
  // Seed initial data if DB is empty
  async seedInitialData(): Promise<void> {
    const existingCats = await firestoreService.getAll(CATEGORIES_COLLECTION);
    if (existingCats.length === 0) {
      for (const cat of defaultCategories) {
        await firestoreService.set(CATEGORIES_COLLECTION, cat.slug, cat);
      }
    }

    const existingBooks = await firestoreService.getAll(BOOKS_COLLECTION);
    if (existingBooks.length === 0) {
      for (const book of defaultBooks) {
        const bookId = book.title.toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-');
        await firestoreService.set(BOOKS_COLLECTION, bookId, book);
      }
    }
  },

  async getAllBooks(): Promise<Book[]> {
    await this.seedInitialData();
    return (await firestoreService.getAll(BOOKS_COLLECTION)) as Book[];
  },

  async getBookById(id: string): Promise<Book | null> {
    return (await firestoreService.getById(BOOKS_COLLECTION, id)) as Book | null;
  },

  async getBooksByCategory(categorySlug: string): Promise<Book[]> {
    return (await firestoreService.queryByField(BOOKS_COLLECTION, 'category', '==', categorySlug)) as Book[];
  },

  async createBook(book: Omit<Book, 'id' | 'createdAt' | 'sold'>): Promise<Book> {
    const newBook = {
      ...book,
      sold: 0,
    };
    return (await firestoreService.add(BOOKS_COLLECTION, newBook)) as Book;
  },

  async updateBook(id: string, data: Partial<Book>): Promise<void> {
    await firestoreService.update(BOOKS_COLLECTION, id, data);
  },

  async deleteBook(id: string): Promise<void> {
    await firestoreService.delete(BOOKS_COLLECTION, id);
  },

  async getAllCategories(): Promise<Category[]> {
    await this.seedInitialData();
    return (await firestoreService.getAll(CATEGORIES_COLLECTION)) as Category[];
  },

  async createCategory(category: Omit<Category, 'id'>): Promise<Category> {
    return (await firestoreService.add(CATEGORIES_COLLECTION, category)) as Category;
  },

  async deleteCategory(id: string): Promise<void> {
    await firestoreService.delete(CATEGORIES_COLLECTION, id);
  }
};

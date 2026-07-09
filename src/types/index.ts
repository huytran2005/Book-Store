export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  avatar?: string;
  createdAt: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  category: string; // matches Category slug or name
  price: number;
  oldPrice?: number;
  description: string;
  imageUrl: string;
  quantity: number;
  sold: number;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface CartItem {
  book: Book;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  totalPrice: number;
  status: 'Pending' | 'Confirmed' | 'Shipping' | 'Completed' | 'Cancelled';
  customerInfo: {
    name: string;
    phone: string;
    address: string;
    notes?: string;
    paymentMethod: 'COD' | 'Online';
  };
  createdAt: string;
}

export interface Review {
  id: string;
  bookId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

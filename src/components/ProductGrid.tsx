import React from 'react';
import { Book } from '@/types';
import BookCard from './BookCard';

interface ProductGridProps {
  books: Book[];
}

export const ProductGrid: React.FC<ProductGridProps> = ({ books }) => {
  if (books.length === 0) {
    return (
      <div className="text-center py-16 bg-slate-50 border border-slate-100 rounded-2xl w-full">
        <p className="text-slate-500 font-medium">Không tìm thấy cuốn sách nào khớp với bộ lọc.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 w-full">
      {books.map((book) => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  );
};

export default ProductGrid;

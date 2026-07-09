'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart } from 'lucide-react';
import { Book } from '@/types';
import { useCartStore } from '@/store/cartStore';
import { useToast } from './Toast';
import Rating from './Rating';

interface BookCardProps {
  book: Book;
}

export const BookCard: React.FC<BookCardProps> = ({ book }) => {
  const addItem = useCartStore((state) => state.addItem);
  const { showToast } = useToast();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevents clicking the card links when pressing add to cart
    addItem(book);
    showToast(`Đã thêm "${book.title}" vào giỏ hàng!`, 'success');
  };

  const discountPercentage = book.oldPrice
    ? Math.round(((book.oldPrice - book.price) / book.oldPrice) * 100)
    : 0;

  return (
    <Link 
      href={`/books/${book.id}`}
      className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-slate-100 overflow-hidden flex flex-col h-full hover:-translate-y-1"
    >
      {/* Book Image */}
      <div className="relative aspect-[3/4] bg-slate-50 w-full overflow-hidden">
        {discountPercentage > 0 && (
          <span className="absolute top-2 left-2 z-10 bg-rose-500 text-white font-bold text-xs px-2.5 py-1 rounded-full shadow-sm animate-pulse">
            -{discountPercentage}%
          </span>
        )}
        {book.quantity === 0 && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
            <span className="bg-slate-800 text-white font-semibold text-sm px-4 py-1.5 rounded-full border border-slate-600">
              Hết hàng
            </span>
          </div>
        )}
        <img
          src={book.imageUrl || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=600'}
          alt={book.title}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>

      {/* Book Info */}
      <div className="p-4 flex flex-col flex-1 gap-2 bg-white">
        <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
          {book.category.replace('-', ' ')}
        </span>
        <h3 className="font-bold text-slate-800 text-sm md:text-base line-clamp-2 min-h-[2.5rem] group-hover:text-amber-600 transition-colors">
          {book.title}
        </h3>
        <p className="text-xs md:text-sm text-slate-500 line-clamp-1">
          Tác giả: <span className="font-medium text-slate-700">{book.author}</span>
        </p>
        
        {/* Rating Placeholder (we can assume 4.5 average for seeded books for visual beauty) */}
        <div className="flex items-center gap-1.5 mt-auto pt-1">
          <Rating value={4} readOnly size={13} />
          <span className="text-xs text-slate-400">(4.0)</span>
        </div>

        {/* Pricing & Add to Cart */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50">
          <div className="flex flex-col">
            <span className="text-amber-600 font-bold text-base md:text-lg">
              {book.price.toLocaleString('vi-VN')} đ
            </span>
            {book.oldPrice && (
              <span className="text-slate-400 line-through text-xs">
                {book.oldPrice.toLocaleString('vi-VN')} đ
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={book.quantity === 0}
            className="p-2.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 transition-colors disabled:opacity-50 disabled:bg-slate-50 disabled:border-slate-200 disabled:text-slate-400 focus:outline-none"
            title="Thêm vào giỏ hàng"
          >
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>
    </Link>
  );
};

export default BookCard;

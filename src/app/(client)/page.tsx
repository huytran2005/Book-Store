'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Flame, Star, Sparkles, ArrowRight, BookMarked } from 'lucide-react';
import { bookService } from '@/services/bookService';
import { Book, Category } from '@/types';
import Loading from '@/components/Loading';
import BookCard from '@/components/BookCard';

export default function HomePage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [fetchedBooks, fetchedCats] = await Promise.all([
          bookService.getAllBooks(),
          bookService.getAllCategories(),
        ]);
        setBooks(fetchedBooks);
        setCategories(fetchedCats);
      } catch (error) {
        console.error('Error loading homepage data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return <Loading fullScreen />;
  }

  // Derived book groups
  const bestSellers = [...books].sort((a, b) => b.sold - a.sold).slice(0, 5);
  const newBooks = [...books].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
  const featuredBooks = books.slice(0, 5);

  return (
    <div className="flex flex-col gap-12 md:gap-20 pb-16">
      
      {/* Hero Banner */}
      <section className="relative bg-gradient-to-br from-amber-700 via-amber-800 to-slate-900 text-white py-16 md:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden rounded-b-[2rem] md:rounded-b-[3.5rem] shadow-xl">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          <div className="lg:col-span-7 flex flex-col gap-6 text-center lg:text-left">
            <span className="inline-flex items-center gap-1.5 self-center lg:self-start bg-amber-500/20 text-amber-300 text-xs font-bold px-3 py-1.5 rounded-full border border-amber-500/30 uppercase tracking-wider">
              <Sparkles size={14} /> Chào mừng đến với BookStore
            </span>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
              Khám phá Kho tàng <br />
              <span className="text-amber-400">Tri thức vô tận</span>
            </h1>
            <p className="text-slate-350 text-base md:text-lg max-w-xl leading-relaxed">
              Hàng ngàn cuốn sách thuộc mọi lĩnh vực: Kinh doanh, Kỹ năng sống, Văn học, Thiếu nhi đang chờ đón bạn. Nhận ngay ngàn ưu đãi hôm nay!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mt-2">
              <Link
                href="/books"
                className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-extrabold px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-amber-500/20 text-center"
              >
                Mua sách ngay
              </Link>
              <Link
                href="#categories"
                className="bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold px-8 py-3.5 rounded-xl transition-all text-center"
              >
                Xem danh mục
              </Link>
            </div>
          </div>

          {/* Book Stack Illustration on right (desktop only) */}
          <div className="hidden lg:grid lg:col-span-5 grid-cols-2 gap-4 select-none">
            <div className="space-y-4 pt-12">
              <img
                src="https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400"
                alt="Book 1"
                className="rounded-2xl shadow-xl hover:rotate-2 transition-transform duration-300 border border-white/10"
              />
              <img
                src="https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=400"
                alt="Book 2"
                className="rounded-2xl shadow-xl hover:-rotate-2 transition-transform duration-300 border border-white/10"
              />
            </div>
            <div className="space-y-4">
              <img
                src="https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=400"
                alt="Book 3"
                className="rounded-2xl shadow-xl hover:-rotate-2 transition-transform duration-300 border border-white/10"
              />
              <img
                src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=400"
                alt="Book 4"
                className="rounded-2xl shadow-xl hover:rotate-2 transition-transform duration-300 border border-white/10"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Book Categories Section */}
      <section id="categories" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-xl md:text-2xl font-black text-slate-800 flex items-center gap-2">
              <BookMarked className="text-amber-600" size={24} /> Danh mục nổi bật
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm text-center hover:bg-amber-50/50 hover:border-amber-250 transition-all font-semibold text-slate-700 hover:text-amber-800 text-sm md:text-base flex flex-col items-center justify-center min-h-[5.5rem] hover:-translate-y-0.5"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Best Sellers (Sách bán chạy) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-xl md:text-2xl font-black text-slate-800 flex items-center gap-2">
              <Flame className="text-rose-500 fill-rose-500" size={24} /> Sách bán chạy nhất
            </h2>
            <Link href="/books" className="text-xs md:text-sm font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1">
              Xem tất cả <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {bestSellers.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals (Sách mới) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-xl md:text-2xl font-black text-slate-800 flex items-center gap-2">
              <Sparkles className="text-amber-500 fill-amber-500" size={24} /> Sách mới nhập kho
            </h2>
            <Link href="/books" className="text-xs md:text-sm font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1">
              Xem tất cả <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {newBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured / Recommended (Sách nổi bật) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-xl md:text-2xl font-black text-slate-800 flex items-center gap-2">
              <Star className="text-amber-400 fill-amber-400" size={24} /> Sách được đề xuất
            </h2>
            <Link href="/books" className="text-xs md:text-sm font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1">
              Xem tất cả <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {featuredBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}

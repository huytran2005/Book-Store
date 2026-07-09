'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Flame, Star, Sparkles, ArrowRight, BookMarked, Layers, Award } from 'lucide-react';
import { bookService } from '@/services/bookService';
import { Book, Category } from '@/types';
import Loading from '@/components/Loading';
import BookCard from '@/components/BookCard';
import Book3DCard from '@/components/Book3DCard';
import Hero3DBook from '@/components/Hero3DBook';

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
  const bestSellers = [...books].sort((a, b) => b.sold - a.sold);
  const topBestSeller = bestSellers[0];
  const otherBestSellers = bestSellers.slice(1, 4);

  const newBooks = [...books]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  const recommendedBooks = books.slice(0, 4);

  return (
    <div className="flex flex-col gap-16 md:gap-24 pb-20 bg-[#fafaf9]">
      
      {/* Asymmetric Hero Banner */}
      <section className="relative bg-gradient-to-br from-stone-900 via-stone-850 to-slate-900 text-stone-100 py-20 md:py-28 px-4 sm:px-6 lg:px-8 overflow-hidden rounded-b-[2.5rem] md:rounded-b-[4.5rem] shadow-2xl">
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]"></div>
        
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          {/* Left Column: Satoshi/Outfit Display Typography */}
          <div className="lg:col-span-7 flex flex-col gap-6 text-left">
            <span className="inline-flex items-center gap-1.5 self-start bg-amber-500/10 text-amber-400 text-xs font-black px-4 py-1.5 rounded-full border border-amber-500/20 uppercase tracking-widest">
              <Sparkles size={13} className="animate-pulse" /> Không gian tri thức nghệ thuật
            </span>
            
            <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.05] text-white">
              Cá nhân hóa <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">
                Thị hiếu đọc sách
              </span>
            </h1>
            
            <p className="text-stone-300 text-base md:text-lg max-w-[45ch] leading-relaxed">
              Khám phá kho sách tinh tuyển được may đo riêng cho gu đọc của độc giả cao cấp.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-2">
              <Link
                href="/onboarding"
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-black px-8 py-4 rounded-xl transition-all shadow-lg shadow-amber-500/10 text-center scale-100 active:scale-95"
              >
                Trải nghiệm Gu Sách
              </Link>
              <Link
                href="/books"
                className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold px-8 py-4 rounded-xl transition-all text-center"
              >
                Khám phá tủ sách
              </Link>
            </div>
          </div>

          {/* Right Column: Interactive Standalone 3D Book Showcase */}
          {topBestSeller && (
            <div className="lg:col-span-5 flex justify-center items-center select-none pt-6 lg:pt-0">
              <div className="flex flex-col items-center gap-4 bg-white/5 backdrop-blur-xl border border-white/10 p-12 rounded-[2.5rem] shadow-2xl relative group min-w-[280px]">
                <div className="absolute -top-3 -right-3 bg-amber-500 text-stone-950 text-[10px] font-black uppercase tracking-widest px-3.5 py-1 rounded-full shadow-lg">
                  Tác phẩm nổi bật
                </div>
                <Hero3DBook book={topBestSeller} />
              </div>
            </div>
          )}

        </div>
      </section>

      {/* Premium Bento Grid Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col gap-8">
        
        <div className="flex flex-col gap-2 border-l-4 border-amber-600 pl-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">Khám phá đa chiều</span>
          <h2 className="text-2xl md:text-3xl font-black text-stone-850 tracking-tight">Thị Hiếu Đọc Sách Tinh Tuyển</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-stretch">
          
          {/* Card 1: Best Sellers (col-span-8) */}
          <div className="md:col-span-8 bg-white p-6 md:p-8 rounded-3xl border border-stone-100 shadow-sm flex flex-col gap-6 justify-between min-h-[320px]">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <h3 className="font-extrabold text-lg text-stone-800 flex items-center gap-2">
                <Flame className="text-rose-500 fill-rose-500" size={20} /> Sách bán chạy nhất
              </h3>
              <Link href="/books" className="text-xs font-black text-amber-600 hover:text-amber-700 flex items-center gap-0.5">
                Xem thêm <ArrowRight size={12} />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {otherBestSellers.map((book) => (
                <div key={book.id} className="flex flex-col gap-3 group">
                  <div className="relative aspect-[3/4] rounded-xl overflow-hidden border border-stone-100 shadow-sm">
                    <img src={book.imageUrl} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <h4 className="font-bold text-xs text-stone-850 line-clamp-1">{book.title}</h4>
                    <span className="text-[10px] text-stone-400 font-bold">{book.author}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: Featured Categories (col-span-4) */}
          <div className="md:col-span-4 bg-gradient-to-br from-stone-900 to-slate-900 p-6 md:p-8 rounded-3xl text-stone-100 flex flex-col justify-between min-h-[320px] shadow-lg border border-stone-850">
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">Phân loại sách</span>
              <h3 className="font-extrabold text-xl leading-tight">Thể loại phổ biến</h3>
              <p className="text-xs text-stone-400 leading-relaxed mt-2 max-w-[25ch]">
                Bộ lọc danh mục giúp huynh tìm kiếm sách theo sở thích và chuyên môn một cách trực quan.
              </p>
            </div>

            <div className="flex flex-col gap-2 mt-4">
              {categories.slice(0, 3).map((cat) => (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-xs font-bold text-stone-200"
                >
                  {cat.name} <ArrowRight size={12} className="text-amber-500" />
                </Link>
              ))}
            </div>
          </div>

          {/* Card 3: Platform Stats (col-span-4) */}
          <div className="md:col-span-4 bg-gradient-to-br from-amber-500 to-amber-600 text-stone-950 p-6 md:p-8 rounded-3xl flex flex-col justify-between min-h-[280px] shadow-md">
            <Award className="stroke-[2.5]" size={36} />
            <div className="flex flex-col gap-1 mt-6">
              <span className="text-4xl font-black tracking-tight">{books.length}+</span>
              <span className="text-xs font-black uppercase tracking-widest text-stone-900">Tác phẩm tinh tuyển</span>
              <p className="text-[10px] text-stone-900/80 leading-relaxed mt-1">
                Tuyển chọn khắt khe từ các nhà xuất bản hàng đầu để đảm bảo chất lượng tri thức tốt nhất.
              </p>
            </div>
          </div>

          {/* Card 4: New arrivals (col-span-8) */}
          <div className="md:col-span-8 bg-white p-6 md:p-8 rounded-3xl border border-stone-100 shadow-sm flex flex-col gap-6 justify-between min-h-[280px]">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <h3 className="font-extrabold text-lg text-stone-800 flex items-center gap-2">
                <Sparkles className="text-amber-500 fill-amber-500 animate-pulse" size={20} /> Sách mới nhập kho
              </h3>
              <Link href="/books" className="text-xs font-black text-amber-600 hover:text-amber-700 flex items-center gap-0.5">
                Xem thêm <ArrowRight size={12} />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {newBooks.map((book) => (
                <Link key={book.id} href={`/books/${book.id}`} className="flex flex-col gap-2 group">
                  <div className="relative aspect-[3/4] rounded-lg overflow-hidden border border-stone-100 shadow-sm">
                    <img src={book.imageUrl} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <h4 className="font-bold text-[11px] text-stone-850 line-clamp-1">{book.title}</h4>
                </Link>
              ))}
            </div>
          </div>

        </div>

      </section>

      {/* Recommended Grid Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col gap-8 mb-6">
        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
          <h2 className="text-xl md:text-2xl font-black text-stone-850 flex items-center gap-2">
            <Star className="text-amber-500 fill-amber-500" size={22} /> Sách được đề xuất
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {recommendedBooks.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </section>

    </div>
  );
}

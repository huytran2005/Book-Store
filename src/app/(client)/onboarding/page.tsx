'use client';

import React, { useEffect, useState } from 'react';
import { Sparkles, BookOpen, ArrowRight, RotateCcw } from 'lucide-react';
import { bookService } from '@/services/bookService';
import { Book } from '@/types';
import Loading from '@/components/Loading';
import BubbleGenreSelector from '@/components/BubbleGenreSelector';
import Book3DCard from '@/components/Book3DCard';

export default function OnboardingPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Selection Flow States
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [isAnalyzed, setIsAnalyzed] = useState(false);
  const [analyzingText, setAnalyzingText] = useState('Đang phân tích thị hiếu...');

  useEffect(() => {
    async function loadBooks() {
      try {
        const allBooks = await bookService.getAllBooks();
        setBooks(allBooks);
      } catch (err) {
        console.error('Error fetching onboarding books:', err);
      } finally {
        setLoading(false);
      }
    }
    loadBooks();
  }, []);

  const handleStartAnalysis = () => {
    if (selectedGenres.length === 0) return;
    
    setIsAnalyzed(true);
    setAnalyzingText('Đang phân tích thị hiếu của bạn...');
    
    // Simulate AI taste analysis steps with changing text labels
    setTimeout(() => {
      setAnalyzingText('Đang tìm kiếm sách tương ứng trong kho dữ liệu...');
    }, 1000);

    setTimeout(() => {
      setAnalyzingText('Đang sắp xếp danh sách may đo riêng...');
    }, 2200);

    setTimeout(() => {
      setAnalyzingText('');
    }, 3200);
  };

  const handleReset = () => {
    setIsAnalyzed(false);
    setSelectedGenres([]);
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  // Filter recommendations based on selected genres
  const recommendedBooks = books.filter(book => 
    selectedGenres.includes(book.category)
  ).slice(0, 6);

  return (
    <div className="min-h-[85vh] py-12 px-4 sm:px-6 lg:px-8 w-full max-w-7xl mx-auto flex flex-col items-center justify-center gap-10">
      
      {/* Step 1: Selection Phase */}
      {!isAnalyzed ? (
        <div className="flex flex-col items-center w-full gap-8 max-w-3xl text-center">
          
          <div className="flex flex-col items-center gap-3">
            <span className="inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-700 text-xs font-black px-3.5 py-1.5 rounded-full border border-amber-500/20 uppercase tracking-widest animate-pulse">
              <Sparkles size={14} /> Trải nghiệm Taste Profile
            </span>
            <h1 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tight leading-tight">
              Chọn Gu Đọc Sách <br />
              <span className="text-amber-600 font-medium">Bản sắc riêng của bạn</span>
            </h1>
            <p className="text-sm text-slate-450 max-w-md leading-relaxed mt-1">
              Chạm hoặc kéo quăng quật các bong bóng vật lý đại diện cho các thể loại sách để thiết lập hồ sơ độc giả của riêng huynh.
            </p>
          </div>

          {/* Interactive Physics Bubble Canvas */}
          <BubbleGenreSelector onSelectionChange={setSelectedGenres} />

          {/* Action Trigger Button */}
          <button
            onClick={handleStartAnalysis}
            disabled={selectedGenres.length === 0}
            className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-extrabold px-10 py-4 rounded-2xl shadow-lg transition-all hover:scale-105 active:scale-95 disabled:scale-100 mt-2"
          >
            Nhận Đề Xuất Sách <ArrowRight size={16} />
          </button>
        </div>
      ) : (
        /* Step 2: Recommendation / Results Phase */
        <div className="flex flex-col items-center w-full gap-10">
          
          {analyzingText ? (
            /* Loading/Analyzing Micro-Interactions stage */
            <div className="flex flex-col items-center gap-4 py-20 text-center animate-fade-in">
              <div className="w-12 h-12 rounded-full border-4 border-amber-600 border-t-transparent animate-spin" />
              <span className="text-sm font-bold text-slate-600 uppercase tracking-wider animate-pulse">
                {analyzingText}
              </span>
            </div>
          ) : (
            /* Recommended Books Deck */
            <div className="flex flex-col items-center w-full gap-8 animate-fade-in">
              
              <div className="flex flex-col items-center gap-3 text-center max-w-md">
                <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-700 text-xs font-black px-3.5 py-1.5 rounded-full border border-emerald-500/20 uppercase tracking-widest">
                  <BookOpen size={14} /> Phân Tích Hoàn Tất
                </span>
                <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">
                  Tủ Sách "May Đo" Cho Bạn
                </h2>
                <p className="text-xs text-slate-450 leading-relaxed">
                  Dựa trên Taste Profile của huynh, chúng tôi đề xuất các tựa sách tinh tuyển dưới định dạng 3D chân thực dưới đây.
                </p>
              </div>

              {/* Grid 3D Cards */}
              {recommendedBooks.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-sm text-slate-400">Không tìm thấy sách phù hợp cho thể loại này trong hệ thống.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-5xl justify-items-center mt-4">
                  {recommendedBooks.map((book) => (
                    <Book3DCard key={book.id} book={book} />
                  ))}
                </div>
              )}

              {/* Reset Control */}
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 px-5 py-2.5 rounded-xl transition-all mt-6"
              >
                <RotateCcw size={14} /> Chọn lại thể loại
              </button>

            </div>
          )}

        </div>
      )}

    </div>
  );
}

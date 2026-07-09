'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, ShieldCheck, Truck, RefreshCcw, Send } from 'lucide-react';
import { bookService } from '@/services/bookService';
import { reviewService } from '@/services/reviewService';
import { Book, Review } from '@/types';
import { useCartStore } from '@/store/cartStore';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/Toast';
import Loading from '@/components/Loading';
import Rating from '@/components/Rating';

interface BookDetailPageClientProps {
  bookId: string;
}

export default function BookDetailPageClient({ bookId }: BookDetailPageClientProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();
  const addItem = useCartStore((state) => state.addItem);

  const [book, setBook] = useState<Book | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Detail Form state
  const [quantity, setQuantity] = useState(1);

  // Review Form state
  const [newRating, setNewRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    async function loadBookData() {
      try {
        const fetchedBook = await bookService.getBookById(bookId);
        if (fetchedBook) {
          setBook(fetchedBook);
          const fetchedReviews = await reviewService.getReviewsByBook(bookId);
          setReviews(fetchedReviews);
        } else {
          showToast('Không tìm thấy cuốn sách yêu cầu!', 'error');
          router.push('/books');
        }
      } catch (error) {
        console.error('Error fetching book detail:', error);
      } finally {
        setLoading(false);
      }
    }
    if (bookId) {
      loadBookData();
    }
  }, [bookId]);

  const handleAddToCart = () => {
    if (!book) return;
    addItem(book, quantity);
    showToast(`Đã thêm ${quantity} cuốn "${book.title}" vào giỏ hàng!`, 'success');
  };

  const handleBuyNow = () => {
    if (!book) return;
    addItem(book, quantity);
    router.push('/checkout');
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast('Bạn cần đăng nhập để viết bình luận!', 'error');
      router.push(`/login?redirect=/books/${bookId}`);
      return;
    }

    if (!comment.trim()) {
      showToast('Vui lòng điền nội dung bình luận!', 'error');
      return;
    }

    setSubmittingReview(true);
    try {
      const newReview = await reviewService.addReview({
        bookId,
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar,
        rating: newRating,
        comment,
      });

      setReviews((prev) => [newReview, ...prev]);
      setComment('');
      setNewRating(5);
      showToast('Bình luận của bạn đã được đăng thành công!', 'success');
    } catch (error) {
      console.error('Error submitting review:', error);
      showToast('Có lỗi xảy ra khi gửi bình luận.', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  if (!book) return null;

  const discountPercentage = book.oldPrice
    ? Math.round(((book.oldPrice - book.price) / book.oldPrice) * 100)
    : 0;

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '4.0';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex flex-col gap-12 flex-1">
      
      {/* Product Detail Top */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-start bg-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-sm">
        
        {/* Book Image */}
        <div className="md:col-span-5 flex flex-col gap-4">
          <div className="relative aspect-[3/4] rounded-xl overflow-hidden border border-slate-100 bg-slate-50 shadow-sm max-w-sm mx-auto w-full">
            {discountPercentage > 0 && (
              <span className="absolute top-3 left-3 z-10 bg-rose-500 text-white font-bold text-sm px-3 py-1 rounded-full shadow-md">
                -{discountPercentage}%
              </span>
            )}
            <img
              src={book.imageUrl || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=800'}
              alt={book.title}
              className="object-cover w-full h-full"
            />
          </div>
        </div>

        {/* Book Details */}
        <div className="md:col-span-7 flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-amber-600 bg-amber-50 self-start px-3 py-1 rounded-full uppercase tracking-wider">
              {book.category.replace('-', ' ')}
            </span>
            <h1 className="text-2xl md:text-3xl font-black text-slate-800 leading-tight">
              {book.title}
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-1">
              <p className="text-sm text-slate-500">
                Tác giả: <span className="font-semibold text-slate-700">{book.author}</span>
              </p>
              <span className="hidden sm:inline text-slate-300">|</span>
              <div className="flex items-center gap-1.5">
                <Rating value={Math.round(Number(averageRating))} readOnly size={15} />
                <span className="text-sm font-bold text-slate-700">{averageRating}</span>
                <span className="text-xs text-slate-400">({reviews.length} đánh giá)</span>
              </div>
              <span className="hidden sm:inline text-slate-300">|</span>
              <p className="text-sm text-slate-500">
                Đã bán: <span className="font-semibold text-slate-700">{book.sold}</span>
              </p>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-slate-50 p-4 rounded-xl flex items-baseline gap-4 border border-slate-100">
            <span className="text-2xl md:text-3xl font-black text-amber-600">
              {book.price.toLocaleString('vi-VN')} đ
            </span>
            {book.oldPrice && (
              <span className="text-slate-400 line-through text-sm">
                {book.oldPrice.toLocaleString('vi-VN')} đ
              </span>
            )}
          </div>

          {/* Key Specs */}
          <div className="grid grid-cols-2 gap-y-3.5 gap-x-6 text-sm py-4 border-y border-slate-100">
            <div>
              <span className="text-slate-400">Nhà xuất bản:</span>
              <span className="ml-2 font-semibold text-slate-700">NXB Trẻ</span>
            </div>
            <div>
              <span className="text-slate-400">Tình trạng:</span>
              <span className={`ml-2 font-semibold ${book.quantity > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {book.quantity > 0 ? `Còn hàng (${book.quantity})` : 'Hết hàng'}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-2">
            <h3 className="font-bold text-slate-800">Mô tả sách:</h3>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {book.description}
            </p>
          </div>

          {/* Quantity Selector */}
          {book.quantity > 0 && (
            <div className="flex items-center gap-4 mt-2">
              <span className="text-sm font-semibold text-slate-600">Số lượng:</span>
              <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="px-3.5 py-1.5 hover:bg-slate-100 text-slate-500 font-bold transition-colors"
                >
                  -
                </button>
                <span className="px-5 font-bold text-slate-700 text-sm">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => Math.min(book.quantity, q + 1))}
                  className="px-3.5 py-1.5 hover:bg-slate-100 text-slate-500 font-bold transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <button
              onClick={handleAddToCart}
              disabled={book.quantity === 0}
              className="flex-1 flex items-center justify-center gap-2 border-2 border-amber-600 hover:bg-amber-50 text-amber-700 font-extrabold py-3.5 rounded-xl transition-all disabled:opacity-50 disabled:bg-slate-50 disabled:border-slate-200 disabled:text-slate-400"
            >
              <ShoppingCart size={20} /> Thêm vào giỏ hàng
            </button>
            <button
              onClick={handleBuyNow}
              disabled={book.quantity === 0}
              className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-extrabold py-3.5 rounded-xl transition-all disabled:opacity-50 shadow-md shadow-amber-600/10 text-center"
            >
              Mua ngay
            </button>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-100 text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5 justify-center">
              <ShieldCheck size={16} className="text-emerald-500" />
              <span>Sách chính hãng 100%</span>
            </div>
            <div className="flex items-center gap-1.5 justify-center">
              <Truck size={16} className="text-amber-500" />
              <span>Giao hàng siêu tốc</span>
            </div>
            <div className="flex items-center gap-1.5 justify-center">
              <RefreshCcw size={16} className="text-indigo-500" />
              <span>Đổi trả trong 7 ngày</span>
            </div>
          </div>

        </div>

      </div>

      {/* Review Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-start bg-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-sm">
        
        {/* Left: Review Submission Form */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <h2 className="text-lg md:text-xl font-black text-slate-800">
            Đánh giá sản phẩm
          </h2>
          
          <form onSubmit={handleReviewSubmit} className="flex flex-col gap-4 bg-slate-50 p-5 rounded-xl border border-slate-100">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Chọn số sao:</label>
              <Rating value={newRating} onChange={setNewRating} readOnly={false} size={24} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase" htmlFor="comment-input">Nhận xét của bạn:</label>
              <textarea
                id="comment-input"
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Nhập cảm nhận của bạn về cuốn sách (chất lượng in, nội dung, giao hàng...)..."
                className="w-full p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm bg-white"
              />
            </div>
            <button
              type="submit"
              disabled={submittingReview}
              className="flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 rounded-lg transition-colors text-sm disabled:opacity-50"
            >
              <Send size={15} /> Gửi đánh giá
            </button>
          </form>
        </div>

        {/* Right: Reviews List */}
        <div className="lg:col-span-7 flex flex-col gap-6 w-full">
          <h2 className="text-lg md:text-xl font-black text-slate-800 flex items-center gap-2">
            Ý kiến khách hàng ({reviews.length})
          </h2>
          
          <div className="flex flex-col gap-6 divider-y divide-slate-100">
            {reviews.length === 0 ? (
              <p className="text-slate-400 text-center py-6 text-sm">Chưa có bình luận nào. Hãy là người đầu tiên đánh giá!</p>
            ) : (
              reviews.map((rev) => (
                <div key={rev.id} className="flex gap-4 items-start pt-4 first:pt-0">
                  <img
                    src={rev.userAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100'}
                    alt={rev.userName}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200 mt-1"
                  />
                  <div className="flex flex-col gap-1.5 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-850 text-sm">{rev.userName}</h4>
                      <span className="text-[10px] text-slate-400">
                        {new Date(rev.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    <Rating value={rev.rating} readOnly size={12} />
                    <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{rev.comment}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}

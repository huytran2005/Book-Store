'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Trash2, ArrowLeft, ArrowRight, ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, getTotalPrice } = useCartStore();
  const [mounted, setMounted] = useState(false);

  // Prevent SSR hydration issues by checking mount status
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="min-h-[50vh] flex items-center justify-center text-slate-500">Đang tải giỏ hàng...</div>;
  }

  const subtotal = getTotalPrice();
  const shippingFee = subtotal > 300000 || subtotal === 0 ? 0 : 30000;
  const total = subtotal + shippingFee;

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center flex flex-col items-center gap-6 justify-center flex-1">
        <div className="p-5 bg-amber-50 rounded-full text-amber-600 border border-amber-100">
          <ShoppingCart size={48} />
        </div>
        <h1 className="text-xl md:text-2xl font-black text-slate-800">Giỏ hàng của bạn đang trống!</h1>
        <p className="text-slate-450 text-sm max-w-md">
          Hãy lấp đầy giỏ hàng bằng những cuốn sách hay từ kho tri thức khổng lồ của chúng tôi nhé.
        </p>
        <Link
          href="/books"
          className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-md shadow-amber-600/10 text-sm"
        >
          <ArrowLeft size={16} /> Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex flex-col gap-6 flex-1">
      <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800">
        Giỏ hàng của bạn
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Cart Items List */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-100 font-bold text-xs uppercase text-slate-500 tracking-wider hidden sm:grid grid-cols-12 gap-4">
              <span className="col-span-6">Sản phẩm</span>
              <span className="col-span-2 text-center">Giá</span>
              <span className="col-span-2 text-center">Số lượng</span>
              <span className="col-span-2 text-right">Tổng cộng</span>
            </div>

            <div className="divide-y divide-slate-100">
              {items.map((item) => (
                <div key={item.book.id} className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                  
                  {/* Book Image & Info */}
                  <div className="col-span-1 sm:col-span-6 flex gap-4 items-center">
                    <img
                      src={item.book.imageUrl || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=300'}
                      alt={item.book.title}
                      className="w-14 sm:w-18 aspect-[3/4] object-cover rounded-lg border border-slate-100 shrink-0"
                    />
                    <div className="flex flex-col gap-1">
                      <Link 
                        href={`/books/${item.book.id}`}
                        className="font-bold text-slate-800 text-sm hover:text-amber-600 transition-colors line-clamp-2"
                      >
                        {item.book.title}
                      </Link>
                      <span className="text-xs text-slate-400">Tác giả: {item.book.author}</span>
                      <button
                        onClick={() => removeItem(item.book.id)}
                        className="text-xs text-rose-500 font-semibold hover:text-rose-700 mt-1 self-start flex items-center gap-1.5"
                      >
                        <Trash2 size={12} /> Xóa
                      </button>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="col-span-1 sm:col-span-2 text-left sm:text-center">
                    <span className="sm:hidden text-xs text-slate-400 mr-2">Đơn giá:</span>
                    <span className="text-sm font-semibold text-slate-700">
                      {item.book.price.toLocaleString('vi-VN')} đ
                    </span>
                  </div>

                  {/* Quantity controls */}
                  <div className="col-span-1 sm:col-span-2 flex justify-start sm:justify-center">
                    <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                      <button
                        onClick={() => updateQuantity(item.book.id, item.quantity - 1)}
                        className="px-2.5 py-1 hover:bg-slate-150 text-slate-500 font-bold transition-colors"
                      >
                        -
                      </button>
                      <span className="px-3 text-sm font-bold text-slate-700">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.book.id, item.quantity + 1)}
                        className="px-2.5 py-1 hover:bg-slate-150 text-slate-500 font-bold transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Line Total */}
                  <div className="col-span-1 sm:col-span-2 text-left sm:text-right">
                    <span className="sm:hidden text-xs text-slate-400 mr-2">Thành tiền:</span>
                    <span className="text-sm font-bold text-amber-600">
                      {(item.book.price * item.quantity).toLocaleString('vi-VN')} đ
                    </span>
                  </div>

                </div>
              ))}
            </div>
          </div>

          {/* Cart Actions */}
          <div className="flex justify-between items-center mt-2">
            <Link
              href="/books"
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-800 transition-colors"
            >
              <ArrowLeft size={16} /> Tiếp tục mua thêm sách
            </Link>
            <button
              onClick={() => {
                if (confirm('Bạn chắc chắn muốn xóa toàn bộ giỏ hàng?')) clearCart();
              }}
              className="px-4 py-2 border border-slate-200 hover:bg-rose-50 hover:text-rose-600 rounded-xl text-xs font-bold text-slate-500 transition-colors"
            >
              Xóa sạch giỏ hàng
            </button>
          </div>
        </div>

        {/* Cart Summary */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-5">
          <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3">Tóm tắt đơn hàng</h2>
          
          <div className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between text-slate-500">
              <span>Tạm tính</span>
              <span className="font-semibold text-slate-700">{subtotal.toLocaleString('vi-VN')} đ</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Phí vận chuyển</span>
              <span className="font-semibold text-slate-700">
                {shippingFee === 0 ? 'Miễn phí' : `${shippingFee.toLocaleString('vi-VN')} đ`}
              </span>
            </div>
            {shippingFee > 0 && (
              <p className="text-[10px] text-amber-600 italic bg-amber-50 p-2 rounded-lg border border-amber-100">
                Mẹo: Mua thêm {(300000 - subtotal).toLocaleString('vi-VN')} đ để được miễn phí vận chuyển!
              </p>
            )}
          </div>

          <div className="border-t border-slate-100 pt-4 flex justify-between items-baseline mt-2">
            <span className="font-bold text-slate-800">Tổng cộng</span>
            <span className="text-xl font-black text-amber-600">
              {total.toLocaleString('vi-VN')} đ
            </span>
          </div>

          <Link
            href="/checkout"
            className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-extrabold py-3.5 rounded-xl transition-all shadow-md shadow-amber-600/10 text-center text-sm"
          >
            Tiến hành đặt hàng <ArrowRight size={16} />
          </Link>
        </div>

      </div>
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, CreditCard, Landmark, Truck } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useAuth } from '@/context/AuthContext';
import { orderService } from '@/services/orderService';
import { useToast } from '@/components/Toast';
import Loading from '@/components/Loading';

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { items, clearCart, getTotalPrice } = useCartStore();

  const [mounted, setMounted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'Online'>('COD');

  // Online Mock Bank Select
  const [mockBank, setMockBank] = useState('vietcombank');

  useEffect(() => {
    setMounted(true);
    if (user) {
      setName(user.name);
    }
  }, [user]);

  if (!mounted) {
    return <Loading fullScreen />;
  }

  // If no items in cart, redirect to cart page
  if (items.length === 0 && !submitting) {
    router.push('/cart');
    return null;
  }

  const subtotal = getTotalPrice();
  const shippingFee = subtotal > 300000 ? 0 : 30000;
  const total = subtotal + shippingFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !phone.trim() || !address.trim()) {
      showToast('Vui lòng nhập đầy đủ họ tên, số điện thoại và địa chỉ giao hàng!', 'error');
      return;
    }

    setSubmitting(true);

    try {
      // If payment is Online, show a quick mock payment alert
      if (paymentMethod === 'Online') {
        showToast('Đang kết nối tới cổng thanh toán trực tuyến...', 'info');
        await new Promise((resolve) => setTimeout(resolve, 1500));
        showToast('Thanh toán thành công qua ứng dụng ngân hàng!', 'success');
      }

      await orderService.createOrder({
        userId: user?.id || 'guest_user',
        items,
        totalPrice: total,
        customerInfo: {
          name,
          phone,
          address,
          notes,
          paymentMethod,
        },
      });

      showToast('Đặt hàng thành công! Cảm ơn bạn đã mua sách.', 'success');
      clearCart();
      
      // Redirect to orders history if logged in, else home page
      if (user) {
        router.push('/orders');
      } else {
        router.push('/');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      showToast('Có lỗi xảy ra khi tạo đơn hàng.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex flex-col gap-6 flex-1">
      <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800">Thanh toán đơn hàng</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Form: Delivery details & Payment */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Shipping Form */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-4">
            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Truck className="text-amber-600" size={20} /> Thông tin giao hàng
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase" htmlFor="fullname-input">Họ và tên nhận sách *</label>
                <input
                  id="fullname-input"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nhập đầy đủ họ tên"
                  className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm bg-slate-50/50"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase" htmlFor="phone-input">Số điện thoại liên hệ *</label>
                <input
                  id="phone-input"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Nhập số điện thoại nhận hàng"
                  className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm bg-slate-50/50"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase" htmlFor="address-input">Địa chỉ nhận sách *</label>
              <input
                id="address-input"
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Số nhà, ngõ/ngách, tên đường, phường/xã, quận/huyện, tỉnh/thành..."
                className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm bg-slate-50/50"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase" htmlFor="notes-input">Ghi chú giao hàng (Tùy chọn)</label>
              <textarea
                id="notes-input"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="VD: Giao giờ hành chính, gọi trước khi giao..."
                className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm bg-slate-50/50"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-4">
            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
              <CreditCard className="text-amber-600" size={20} /> Phương thức thanh toán
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* COD Choice */}
              <label
                className={`p-4 rounded-xl border-2 flex items-start gap-3 cursor-pointer transition-all ${
                  paymentMethod === 'COD'
                    ? 'border-amber-600 bg-amber-50/20 text-slate-800'
                    : 'border-slate-150 hover:bg-slate-50/55 text-slate-600'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                  className="mt-1 accent-amber-600"
                />
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-sm">Thanh toán khi nhận hàng (COD)</span>
                  <span className="text-xs text-slate-400">Bạn sẽ thanh toán tiền mặt cho nhân viên giao hàng khi nhận sách.</span>
                </div>
              </label>

              {/* Online Choice */}
              <label
                className={`p-4 rounded-xl border-2 flex items-start gap-3 cursor-pointer transition-all ${
                  paymentMethod === 'Online'
                    ? 'border-amber-600 bg-amber-50/20 text-slate-800'
                    : 'border-slate-150 hover:bg-slate-50/55 text-slate-600'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'Online'}
                  onChange={() => setPaymentMethod('Online')}
                  className="mt-1 accent-amber-600"
                />
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-sm">Thanh toán online (Giả lập)</span>
                  <span className="text-xs text-slate-400">Thanh toán chuyển khoản ngân hàng, ví điện tử qua cổng thanh toán tích hợp.</span>
                </div>
              </label>

            </div>

            {/* Mock bank dropdown when choosing online */}
            {paymentMethod === 'Online' && (
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex flex-col gap-2 mt-2 animate-fade-in">
                <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5">
                  <Landmark size={14} /> Chọn ngân hàng thanh toán:
                </label>
                <select
                  value={mockBank}
                  onChange={(e) => setMockBank(e.target.value)}
                  className="p-2 border border-slate-200 rounded-lg text-sm bg-white"
                >
                  <option value="vietcombank">Vietcombank (VCB)</option>
                  <option value="techcombank">Techcombank (TCB)</option>
                  <option value="mbbank">MB Bank (MB)</option>
                  <option value="momo">Ví điện tử MoMo</option>
                </select>
              </div>
            )}
          </div>

        </div>

        {/* Right Summary: Cart preview */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-4">
            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3">Đơn hàng của bạn</h2>
            
            <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 pr-1">
              {items.map((item) => (
                <div key={item.book.id} className="py-3 flex gap-3 items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.book.imageUrl || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=150'}
                      alt={item.book.title}
                      className="w-10 aspect-[3/4] object-cover rounded border border-slate-100 shrink-0"
                    />
                    <div className="flex flex-col">
                      <span className="font-bold text-xs text-slate-850 line-clamp-1 max-w-[180px]">{item.book.title}</span>
                      <span className="text-[10px] text-slate-400">Số lượng: {item.quantity}</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-700">
                    {(item.book.price * item.quantity).toLocaleString('vi-VN')} đ
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 pt-4 flex flex-col gap-2.5 text-xs text-slate-500">
              <div className="flex justify-between">
                <span>Tạm tính</span>
                <span className="font-semibold text-slate-755">{subtotal.toLocaleString('vi-VN')} đ</span>
              </div>
              <div className="flex justify-between">
                <span>Phí vận chuyển</span>
                <span className="font-semibold text-slate-755">
                  {shippingFee === 0 ? 'Miễn phí' : `${shippingFee.toLocaleString('vi-VN')} đ`}
                </span>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 flex justify-between items-baseline">
              <span className="font-bold text-slate-800 text-sm">Tổng thanh toán</span>
              <span className="text-lg font-black text-amber-600">
                {total.toLocaleString('vi-VN')} đ
              </span>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-extrabold py-3.5 rounded-xl transition-all shadow-md shadow-amber-600/10 text-center text-sm disabled:opacity-50 mt-2"
            >
              {submitting ? 'Đang xử lý đặt hàng...' : `Đặt hàng ngay - ${total.toLocaleString('vi-VN')} đ`}
            </button>

            <div className="flex items-center gap-2 justify-center text-[10px] text-slate-400 mt-2">
              <ShieldCheck size={14} className="text-emerald-500" />
              <span>Giao dịch an toàn và bảo mật</span>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
}

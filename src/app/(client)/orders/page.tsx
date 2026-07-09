'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ClipboardCheck, CreditCard, Calendar, Truck, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { orderService } from '@/services/orderService';
import { Order } from '@/types';
import Loading from '@/components/Loading';

export default function OrdersPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUserOrders() {
      if (user) {
        try {
          const userOrders = await orderService.getOrdersByUser(user.id);
          // Sort orders by newest first
          userOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setOrders(userOrders);
        } catch (error) {
          console.error('Error fetching orders:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    }
    loadUserOrders();
  }, [user]);

  if (loading) {
    return <Loading fullScreen />;
  }

  const getStatusBadgeClass = (status: Order['status']) => {
    return {
      Pending: 'bg-amber-100 text-amber-800 border-amber-200',
      Confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
      Shipping: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      Completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      Cancelled: 'bg-rose-100 text-rose-800 border-rose-200',
    }[status];
  };

  const getStatusLabel = (status: Order['status']) => {
    return {
      Pending: 'Chờ duyệt',
      Confirmed: 'Đã xác nhận',
      Shipping: 'Đang vận chuyển',
      Completed: 'Đã hoàn thành',
      Cancelled: 'Đã hủy',
    }[status];
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 w-full flex flex-col gap-6 flex-1">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/profile')}
          className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="flex flex-col">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Hồ sơ cá nhân</span>
          <h1 className="text-xl md:text-2xl font-black text-slate-800">Lịch sử đặt hàng của bạn</h1>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {orders.length === 0 ? (
          <div className="text-center py-16 bg-white border border-slate-100 rounded-2xl shadow-sm flex flex-col items-center gap-4">
            <div className="p-4 bg-slate-50 rounded-full text-slate-400">
              <ClipboardCheck size={36} />
            </div>
            <p className="text-slate-500 font-medium">Bạn chưa thực hiện đơn đặt hàng nào.</p>
            <button
              onClick={() => router.push('/books')}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-5 py-2 rounded-lg transition-colors text-sm"
            >
              Khám phá sách ngay
            </button>
          </div>
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col"
            >
              {/* Order Header */}
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
                  <span>Mã đơn: <span className="text-slate-700 font-mono">#{order.id}</span></span>
                  <span className="flex items-center gap-1">
                    <Calendar size={13} /> {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider ${getStatusBadgeClass(order.status)}`}>
                  {getStatusLabel(order.status)}
                </span>
              </div>

              {/* Order Items */}
              <div className="px-6 py-4 flex flex-col divider-y divide-slate-50">
                {order.items.map((item) => (
                  <div key={item.book.id} className="py-3 flex items-center justify-between text-sm gap-4 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.book.imageUrl || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=150'}
                        alt={item.book.title}
                        className="w-10 aspect-[3/4] object-cover rounded border border-slate-100 shrink-0"
                      />
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 line-clamp-1 max-w-[200px] sm:max-w-md">{item.book.title}</span>
                        <span className="text-xs text-slate-450">Số lượng: {item.quantity} x {item.book.price.toLocaleString('vi-VN')} đ</span>
                      </div>
                    </div>
                    <span className="font-bold text-slate-700">
                      {(item.book.price * item.quantity).toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                ))}
              </div>

              {/* Order Footer */}
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3 text-slate-500">
                  <span className="flex items-center gap-1">
                    <CreditCard size={13} /> Thanh toán: <span className="font-bold text-slate-700">{order.customerInfo.paymentMethod}</span>
                  </span>
                  <span>|</span>
                  <span className="flex items-center gap-1">
                    <Truck size={13} /> Địa chỉ: <span className="font-medium text-slate-750 truncate max-w-[200px]" title={order.customerInfo.address}>{order.customerInfo.address}</span>
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400">Tổng thanh toán: </span>
                  <span className="text-sm font-black text-amber-600">
                    {order.totalPrice.toLocaleString('vi-VN')} đ
                  </span>
                </div>
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
}

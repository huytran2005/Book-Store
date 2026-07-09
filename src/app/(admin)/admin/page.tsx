'use client';

import React, { useEffect, useState } from 'react';
import { BookOpen, ShoppingBag, Users, DollarSign, Award, ArrowUpRight, TrendingUp } from 'lucide-react';
import { bookService } from '@/services/bookService';
import { orderService } from '@/services/orderService';
import { userService } from '@/services/userService';
import { Book, Order, User } from '@/types';
import Loading from '@/components/Loading';

export default function AdminDashboardPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [fetchedBooks, fetchedOrders, fetchedUsers] = await Promise.all([
          bookService.getAllBooks(),
          orderService.getAllOrders(),
          userService.getAllUsers(),
        ]);
        setBooks(fetchedBooks);
        setOrders(fetchedOrders);
        setUsers(fetchedUsers);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  if (loading) {
    return <Loading />;
  }

  // Stats calculation
  const totalBooks = books.length;
  const totalOrders = orders.length;
  const totalUsers = users.length;
  
  // Total Revenue: sum of completed/confirmed/shipping orders
  const revenue = orders
    .filter(order => order.status !== 'Cancelled')
    .reduce((sum, order) => sum + order.totalPrice, 0);

  // Top selling books (sorted by sold count)
  const topSellingBooks = [...books]
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 5);

  // Monthly Revenue Chart Mock (display using interactive HTML/SVG bars)
  const monthlyRevenueData = [
    { month: 'T2', value: 1200000 },
    { month: 'T3', value: 1850000 },
    { month: 'T4', value: 950000 },
    { month: 'T5', value: 2400000 },
    { month: 'T6', value: 3100000 },
    { month: 'T7', value: revenue > 0 ? revenue : 4500000 }, // Fallback or current month
  ];

  const maxVal = Math.max(...monthlyRevenueData.map(d => d.value));

  return (
    <div className="flex flex-col gap-6 md:gap-8 w-full">
      <div className="flex flex-col gap-2">
        <h1 className="text-xl md:text-2xl font-black text-slate-800">Tổng quan báo cáo</h1>
        <p className="text-xs text-slate-450">Báo cáo cập nhật thời gian thực về hoạt động bán hàng.</p>
      </div>

      {/* Grid Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        
        {/* Books Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold text-slate-400 uppercase">Tổng số sách</span>
            <span className="text-2xl font-black text-slate-800">{totalBooks}</span>
            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
              +12% <span className="text-slate-400 font-normal">tháng này</span>
            </span>
          </div>
          <div className="p-3 bg-amber-50 rounded-xl text-amber-600 border border-amber-100">
            <BookOpen size={24} />
          </div>
        </div>

        {/* Orders Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold text-slate-400 uppercase">Đơn hàng</span>
            <span className="text-2xl font-black text-slate-800">{totalOrders}</span>
            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
              +8% <span className="text-slate-400 font-normal">tuần này</span>
            </span>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 border border-emerald-100">
            <ShoppingBag size={24} />
          </div>
        </div>

        {/* Users Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold text-slate-400 uppercase">Khách hàng</span>
            <span className="text-2xl font-black text-slate-800">{totalUsers}</span>
            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
              +15% <span className="text-slate-400 font-normal">so với trước</span>
            </span>
          </div>
          <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 border border-indigo-100">
            <Users size={24} />
          </div>
        </div>

        {/* Revenue Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold text-slate-400 uppercase">Doanh thu</span>
            <span className="text-2xl font-black text-amber-600">{revenue.toLocaleString('vi-VN')} đ</span>
            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
              +18.5% <span className="text-slate-400 font-normal">so với tháng trước</span>
            </span>
          </div>
          <div className="p-3 bg-rose-50 rounded-xl text-rose-600 border border-rose-100">
            <DollarSign size={24} />
          </div>
        </div>

      </div>

      {/* Charts & Top Selling Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start">
        
        {/* Left: Monthly Revenue Chart */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp className="text-amber-600" size={20} /> Biểu đồ doanh thu theo tháng
            </h2>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-bold">2026 (VNĐ)</span>
          </div>

          {/* SVG/CSS Bar Chart */}
          <div className="flex justify-between items-end h-60 pt-4 px-2 w-full gap-2 sm:gap-4">
            {monthlyRevenueData.map((data, index) => {
              const heightPct = maxVal > 0 ? (data.value / maxVal) * 85 : 0;
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2.5 group">
                  {/* Tooltip value */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-850 text-white font-bold text-[9px] px-2 py-1 rounded shadow-md absolute -translate-y-[260%] z-10 pointer-events-none">
                    {data.value.toLocaleString('vi-VN')}
                  </div>
                  
                  {/* Bar */}
                  <div 
                    className="w-full max-w-[2.25rem] bg-amber-500 hover:bg-amber-600 transition-colors rounded-t-lg shadow-sm flex items-end justify-center"
                    style={{ height: `${heightPct}%` }}
                  />

                  {/* Label */}
                  <span className="text-xs font-semibold text-slate-500">{data.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Top Selling Books */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-6">
          <h2 className="font-bold text-slate-800 flex items-center gap-2">
            <Award className="text-amber-600" size={20} /> Sách bán chạy nhất
          </h2>

          <div className="flex flex-col gap-4">
            {topSellingBooks.map((book, index) => (
              <div key={book.id} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-100 border border-amber-200 text-amber-800 text-xs font-extrabold flex items-center justify-center shrink-0">
                    {index + 1}
                  </div>
                  <img
                    src={book.imageUrl}
                    alt={book.title}
                    className="w-8 aspect-[3/4] object-cover rounded border border-slate-100 shrink-0"
                  />
                  <div className="flex flex-col">
                    <span className="font-bold text-xs text-slate-850 line-clamp-1 max-w-[140px]">{book.title}</span>
                    <span className="text-[10px] text-slate-400">{book.author}</span>
                  </div>
                </div>
                <div className="text-right flex flex-col gap-0.5">
                  <span className="text-xs font-black text-slate-700">{book.sold} cuốn</span>
                  <span className="text-[9px] text-slate-400">Doanh thu: {(book.sold * book.price).toLocaleString('vi-VN')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}

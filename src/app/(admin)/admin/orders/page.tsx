'use client';

import React, { useEffect, useState } from 'react';
import { ShoppingBag, Eye, Calendar, User as UserIcon } from 'lucide-react';
import { orderService } from '@/services/orderService';
import { Order } from '@/types';
import { useToast } from '@/components/Toast';
import Loading from '@/components/Loading';
import Modal from '@/components/Modal';

export default function AdminOrdersPage() {
  const { showToast } = useToast();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected Order for detail modal view
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function loadOrders() {
      try {
        const fetchedOrders = await orderService.getAllOrders();
        // Sort orders by newest first
        fetchedOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setOrders(fetchedOrders);
      } catch (error) {
        console.error('Error fetching admin orders:', error);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      
      setOrders(prev =>
        prev.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );

      // Sync modal if open
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
      }

      showToast(`Cập nhật trạng thái đơn hàng sang "${newStatus}" thành công!`, 'success');
    } catch (error) {
      console.error(error);
      showToast('Lỗi cập nhật trạng thái đơn hàng.', 'error');
    }
  };

  const openDetailModal = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const getStatusBadgeClass = (status: Order['status']) => {
    return {
      Pending: 'bg-amber-100 text-amber-800 border-amber-250',
      Confirmed: 'bg-blue-100 text-blue-800 border-blue-250',
      Shipping: 'bg-indigo-100 text-indigo-800 border-indigo-250',
      Completed: 'bg-emerald-100 text-emerald-800 border-emerald-250',
      Cancelled: 'bg-rose-100 text-rose-800 border-rose-255',
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

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-xl md:text-2xl font-black text-slate-800">Quản lý đơn hàng</h1>
        <p className="text-xs text-slate-450">Xem chi tiết các hóa đơn mua sách, duyệt trạng thái và quản lý giao hàng.</p>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-x-auto w-full">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 font-bold text-xs uppercase text-slate-550 tracking-wider">
              <th className="px-6 py-4">Mã đơn</th>
              <th className="px-6 py-4">Khách hàng</th>
              <th className="px-6 py-4">Ngày đặt</th>
              <th className="px-6 py-4">Tổng tiền</th>
              <th className="px-6 py-4">Thanh toán</th>
              <th className="px-6 py-4">Trạng thái</th>
              <th className="px-6 py-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 text-sm">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-slate-400">
                  Chưa có đơn hàng nào trong hệ thống.
                </td>
              </tr>
            ) : (
              orders.map(order => (
                <tr key={order.id} className="hover:bg-slate-50/40 transition-colors">
                  <td className="px-6 py-3 font-mono text-xs text-slate-500">#{order.id}</td>
                  <td className="px-6 py-3">
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-800">{order.customerInfo.name}</span>
                      <span className="text-[10px] text-slate-400">{order.customerInfo.phone}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-slate-550 text-xs">
                    {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-3 font-bold text-amber-600">
                    {order.totalPrice.toLocaleString('vi-VN')} đ
                  </td>
                  <td className="px-6 py-3 text-xs">
                    <span className={`px-2 py-0.5 rounded font-bold border ${order.customerInfo.paymentMethod === 'Online' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-100 border-slate-200 text-slate-650'}`}>
                      {order.customerInfo.paymentMethod}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <select
                      value={order.status}
                      onChange={e => handleStatusChange(order.id, e.target.value as Order['status'])}
                      className={`text-xs font-bold px-2 py-1 rounded-full border bg-white focus:outline-none cursor-pointer ${getStatusBadgeClass(
                        order.status
                      )}`}
                    >
                      <option value="Pending">Chờ duyệt</option>
                      <option value="Confirmed">Xác nhận</option>
                      <option value="Shipping">Đang giao</option>
                      <option value="Completed">Hoàn thành</option>
                      <option value="Cancelled">Đã hủy</option>
                    </select>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <button
                      onClick={() => openDetailModal(order)}
                      className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors inline-flex items-center gap-1 text-xs font-bold"
                    >
                      <Eye size={14} /> Chi tiết
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Details View Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Chi tiết đơn hàng mua sách"
        size="md"
      >
        {selectedOrder && (
          <div className="flex flex-col gap-5 text-sm text-slate-600">
            {/* Meta */}
            <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
              <span className="font-mono text-xs">Đơn hàng: #{selectedOrder.id}</span>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${getStatusBadgeClass(selectedOrder.status)}`}>
                {getStatusLabel(selectedOrder.status)}
              </span>
            </div>

            {/* Customer Info */}
            <div className="flex flex-col gap-2">
              <h3 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs uppercase text-slate-450 tracking-wider">
                <UserIcon size={14} /> Khách hàng nhận sách
              </h3>
              <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 flex flex-col gap-1.5 text-xs">
                <div><span className="text-slate-400">Họ và tên:</span> <span className="font-semibold text-slate-700">{selectedOrder.customerInfo.name}</span></div>
                <div><span className="text-slate-400">Số điện thoại:</span> <span className="font-semibold text-slate-700">{selectedOrder.customerInfo.phone}</span></div>
                <div><span className="text-slate-400">Địa chỉ giao hàng:</span> <span className="font-semibold text-slate-700 leading-normal">{selectedOrder.customerInfo.address}</span></div>
                {selectedOrder.customerInfo.notes && (
                  <div><span className="text-slate-400">Ghi chú:</span> <span className="italic text-slate-600">"{selectedOrder.customerInfo.notes}"</span></div>
                )}
              </div>
            </div>

            {/* Items Summary */}
            <div className="flex flex-col gap-2">
              <h3 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs uppercase text-slate-450 tracking-wider">
                <ShoppingBag size={14} /> Danh sách sách mua
              </h3>
              <div className="border border-slate-100 rounded-xl divide-y divide-slate-100 overflow-hidden">
                {selectedOrder.items.map(item => (
                  <div key={item.book.id} className="p-3 bg-white flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <img
                        src={item.book.imageUrl}
                        alt={item.book.title}
                        className="w-7 aspect-[3/4] object-cover rounded border border-slate-100 shrink-0"
                      />
                      <div className="flex flex-col">
                        <span className="font-bold text-xs text-slate-850 line-clamp-1 max-w-[200px]">{item.book.title}</span>
                        <span className="text-[10px] text-slate-400">{item.quantity} x {item.book.price.toLocaleString('vi-VN')} đ</span>
                      </div>
                    </div>
                    <span className="font-bold text-xs text-slate-700">
                      {(item.book.price * item.quantity).toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Block */}
            <div className="flex justify-between items-baseline pt-3 border-t border-slate-100">
              <span className="font-bold text-slate-800">Tổng cộng thanh toán:</span>
              <span className="text-lg font-black text-amber-600">
                {selectedOrder.totalPrice.toLocaleString('vi-VN')} đ
              </span>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors text-center"
              >
                Đóng
              </button>
            </div>

          </div>
        )}
      </Modal>

    </div>
  );
}

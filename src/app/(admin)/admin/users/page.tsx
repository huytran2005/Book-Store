'use client';

import React, { useEffect, useState } from 'react';
import { ShieldCheck, Mail, Calendar, UserCheck } from 'lucide-react';
import { userService } from '@/services/userService';
import { User } from '@/types';
import { useToast } from '@/components/Toast';
import Loading from '@/components/Loading';

export default function AdminUsersPage() {
  const { showToast } = useToast();
  
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUsers() {
      try {
        const fetchedUsers = await userService.getAllUsers();
        setUsers(fetchedUsers);
      } catch (error) {
        console.error('Error fetching admin users:', error);
      } finally {
        setLoading(false);
      }
    }
    loadUsers();
  }, []);

  const handleRoleToggle = async (userId: string, currentRole: User['role']) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    if (!confirm(`Bạn chắc chắn muốn chuyển vai trò người dùng này sang "${newRole}"?`)) return;

    try {
      await userService.updateUserProfile(userId, { role: newRole });
      
      setUsers(prev =>
        prev.map(u =>
          u.id === userId ? { ...u, role: newRole } : u
        )
      );

      showToast(`Cập nhật vai trò người dùng thành "${newRole}" thành công!`, 'success');
    } catch (error) {
      console.error(error);
      showToast('Lỗi cập nhật vai trò người dùng.', 'error');
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-xl md:text-2xl font-black text-slate-800">Quản lý người dùng</h1>
        <p className="text-xs text-slate-450">Xem danh sách người dùng trong hệ thống và phân quyền Quản Trị Viên (Admin).</p>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-x-auto w-full">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 font-bold text-xs uppercase text-slate-550 tracking-wider">
              <th className="px-6 py-4">Ảnh</th>
              <th className="px-6 py-4">Tên người dùng</th>
              <th className="px-6 py-4">Địa chỉ Email</th>
              <th className="px-6 py-4">Ngày đăng ký</th>
              <th className="px-6 py-4">Vai trò (Role)</th>
              <th className="px-6 py-4 text-right">Thao tác phân quyền</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 text-sm">
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-slate-400">
                  Chưa có người dùng nào đăng ký trong cơ sở dữ liệu.
                </td>
              </tr>
            ) : (
              users.map(u => (
                <tr key={u.id} className="hover:bg-slate-50/40 transition-colors">
                  <td className="px-6 py-3">
                    <img
                      src={u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100'}
                      alt={u.name}
                      className="w-8 h-8 rounded-full object-cover border border-slate-200"
                    />
                  </td>
                  <td className="px-6 py-3 font-semibold text-slate-800">{u.name}</td>
                  <td className="px-6 py-3 text-slate-655 flex items-center gap-1.5 pt-4">
                    <Mail size={14} className="text-slate-400" /> {u.email}
                  </td>
                  <td className="px-6 py-3 text-slate-500 text-xs">
                    <span className="flex items-center gap-1">
                      <Calendar size={13} className="text-slate-400" />
                      {new Date(u.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider ${
                      u.role === 'admin' 
                        ? 'bg-rose-100 text-rose-800 border-rose-200' 
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <button
                      onClick={() => handleRoleToggle(u.id, u.role)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all inline-flex items-center gap-1 focus:outline-none ${
                        u.role === 'admin'
                          ? 'border-rose-200 text-rose-600 hover:bg-rose-50'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <UserCheck size={14} /> Chuyển thành {u.role === 'admin' ? 'User' : 'Admin'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}

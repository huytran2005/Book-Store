'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { User, ClipboardList, ShieldAlert, LogOut, ArrowRight, BookMarked } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/Toast';
import { userService } from '@/services/userService';
import Loading from '@/components/Loading';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [saving, setSaving] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (user) {
      setName(user.name);
      setAvatar(user.avatar || '');
    }
  }, [user]);

  if (!mounted) {
    return <Loading fullScreen />;
  }

  if (!user) {
    return null; // Will be handled by middleware, but safe fallback
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Tên không được để trống!', 'error');
      return;
    }

    setSaving(true);
    try {
      await userService.updateUserProfile(user.id, {
        name,
        avatar: avatar || undefined
      });
      showToast('Cập nhật thông tin cá nhân thành công!', 'success');
    } catch (error) {
      console.error(error);
      showToast('Lỗi cập nhật hồ sơ cá nhân.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 w-full flex flex-col gap-8 flex-1">
      <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800">Tài khoản của bạn</h1>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Stats & Menu Links */}
        <div className="md:col-span-4 flex flex-col gap-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center gap-4 text-center">
            <img
              src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'}
              alt={user.name}
              className="w-20 h-20 rounded-full object-cover border-4 border-amber-600/10 shadow-sm"
            />
            <div className="flex flex-col">
              <h2 className="font-extrabold text-slate-800 text-lg leading-tight">{user.name}</h2>
              <span className="text-xs text-slate-400 mt-0.5">{user.email}</span>
              <span className="text-[10px] uppercase font-bold text-amber-700 bg-amber-50 self-center px-3 py-1 rounded-full mt-2 border border-amber-100">
                Vai trò: {user.role}
              </span>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-1.5 font-semibold text-sm text-slate-600">
            <Link
              href="/orders"
              className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <ClipboardList size={16} className="text-amber-600" />
                <span>Lịch sử mua hàng</span>
              </div>
              <ArrowRight size={14} className="text-slate-400" />
            </Link>
            
            {user.role === 'admin' && (
              <Link
                href="/admin"
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 text-rose-600 hover:text-rose-700 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldAlert size={16} className="text-rose-500" />
                  <span>Trang quản trị Admin</span>
                </div>
                <ArrowRight size={14} className="text-slate-450" />
              </Link>
            )}

            <button
              onClick={() => logout()}
              className="flex items-center gap-2.5 p-3 rounded-xl hover:bg-rose-50 text-rose-500 hover:text-rose-700 transition-colors font-bold text-left w-full border border-transparent mt-2"
            >
              <LogOut size={16} />
              <span>Đăng xuất tài khoản</span>
            </button>
          </div>
        </div>

        {/* Right Column: Update Info Form */}
        <div className="md:col-span-8 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2 mb-6">
            <BookMarked className="text-amber-600" size={20} /> Cập nhật thông tin cá nhân
          </h2>

          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase" htmlFor="fullname-profile">Họ và tên hiển thị</label>
              <input
                id="fullname-profile"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nhập tên hiển thị"
                className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm bg-slate-50/50"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase" htmlFor="avatar-profile">Đường dẫn ảnh đại diện (URL)</label>
              <input
                id="avatar-profile"
                type="url"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm bg-slate-50/50"
              />
              <p className="text-[10px] text-slate-400">Bạn có thể dán link ảnh từ Unsplash hoặc Facebook làm ảnh đại diện.</p>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 px-6 rounded-xl transition-colors text-sm self-start mt-2 disabled:opacity-50"
            >
              {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}

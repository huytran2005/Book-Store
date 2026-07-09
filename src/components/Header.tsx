'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, User, ShieldAlert, LogOut, BookOpen, Menu, X } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useAuth } from '@/context/AuthContext';

export const Header: React.FC = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const items = useCartStore((state) => state.items);
  const [totalItems, setTotalItems] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Sync state correctly to avoid SSR mismatch
  useEffect(() => {
    const total = items.reduce((sum, item) => sum + item.quantity, 0);
    setTotalItems(total);
  }, [items]);

  const isAdminRoute = pathname?.startsWith('/admin');

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-amber-700 hover:text-amber-800 transition-colors">
            <BookOpen size={28} className="stroke-[2.5]" />
            <span className="font-extrabold text-xl md:text-2xl tracking-tight text-slate-800">
              Book<span className="text-amber-600 font-medium">Store</span>
            </span>
          </Link>

          {/* Navigation Links - Desktop */}
          {!isAdminRoute ? (
            <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
              <Link 
                href="/" 
                className={`hover:text-amber-600 transition-colors ${pathname === '/' ? 'text-amber-600' : ''}`}
              >
                Trang chủ
              </Link>
              <Link 
                href="/onboarding" 
                className={`hover:text-amber-600 transition-colors ${pathname === '/onboarding' ? 'text-amber-600' : ''}`}
              >
                Chọn Gu Sách 🎯
              </Link>
              <Link 
                href="/books" 
                className={`hover:text-amber-600 transition-colors ${pathname === '/books' ? 'text-amber-600' : ''}`}
              >
                Sách
              </Link>
              <Link 
                href="/contact" 
                className={`hover:text-amber-600 transition-colors ${pathname === '/contact' ? 'text-amber-600' : ''}`}
              >
                Liên hệ
              </Link>
            </nav>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full border border-amber-200">
                Admin Panel
              </span>
            </div>
          )}

          {/* Action Icons */}
          <div className="hidden md:flex items-center gap-4">
            {/* Admin Dashboard Entry */}
            {user?.role === 'admin' && !isAdminRoute && (
              <Link
                href="/admin"
                className="flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-100 px-3.5 py-2 rounded-xl transition-all"
              >
                <ShieldAlert size={15} />
                Quản lý
              </Link>
            )}
            
            {/* Client Home Entry (when in admin panel) */}
            {isAdminRoute && (
              <Link
                href="/"
                className="text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl transition-all"
              >
                Về cửa hàng
              </Link>
            )}

            {/* Cart Icon */}
            {!isAdminRoute && (
              <Link
                href="/cart"
                className="relative p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 text-slate-700 hover:text-amber-600 transition-all"
              >
                <ShoppingCart size={20} />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center border border-white animate-bounce">
                    {totalItems}
                  </span>
                )}
              </Link>
            )}

            {/* Auth Controls */}
            {user ? (
              <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'}
                    alt={user.name}
                    className="w-9 h-9 rounded-full object-cover border-2 border-amber-600/20"
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-700 line-clamp-1 max-w-[100px]">{user.name}</span>
                    <span className="text-[10px] text-slate-400 capitalize">{user.role}</span>
                  </div>
                </Link>
                <button
                  onClick={() => logout()}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent transition-all"
                  title="Đăng xuất"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
                <Link
                  href="/login"
                  className="text-sm font-bold text-slate-700 hover:text-amber-600 transition-colors"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 px-4 py-2.5 rounded-xl transition-all shadow-sm shadow-amber-600/10"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>

          {/* Hamburger Menu - Mobile */}
          <div className="flex items-center gap-3 md:hidden">
            {!isAdminRoute && (
              <Link
                href="/cart"
                className="relative p-2 rounded-xl text-slate-700 hover:text-amber-600"
              >
                <ShoppingCart size={22} />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center border border-white">
                    {totalItems}
                  </span>
                )}
              </Link>
            )}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-50 focus:outline-none"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 py-4 px-4 shadow-inner flex flex-col gap-4 animate-fade-in">
          {!isAdminRoute ? (
            <div className="flex flex-col gap-3 font-semibold text-slate-600">
              <Link 
                href="/" 
                onClick={() => setIsMobileMenuOpen(false)}
                className={`py-2 px-3 rounded-lg hover:bg-slate-50 ${pathname === '/' ? 'text-amber-600 bg-amber-50/50' : ''}`}
              >
                Trang chủ
              </Link>
              <Link 
                href="/onboarding" 
                onClick={() => setIsMobileMenuOpen(false)}
                className={`py-2 px-3 rounded-lg hover:bg-slate-50 ${pathname === '/onboarding' ? 'text-amber-600 bg-amber-50/50' : ''}`}
              >
                Chọn Gu Sách 🎯
              </Link>
              <Link 
                href="/books" 
                onClick={() => setIsMobileMenuOpen(false)}
                className={`py-2 px-3 rounded-lg hover:bg-slate-50 ${pathname === '/books' ? 'text-amber-600 bg-amber-50/50' : ''}`}
              >
                Sách
              </Link>
              <Link 
                href="/contact" 
                onClick={() => setIsMobileMenuOpen(false)}
                className={`py-2 px-3 rounded-lg hover:bg-slate-50 ${pathname === '/contact' ? 'text-amber-600 bg-amber-50/50' : ''}`}
              >
                Liên hệ
              </Link>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-center">
              <span className="text-amber-800 text-sm font-bold">Admin Panel</span>
            </div>
          )}

          {/* Mobile Auth and Action Section */}
          <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
            {user?.role === 'admin' && !isAdminRoute && (
              <Link
                href="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full text-center text-sm font-bold text-rose-600 bg-rose-50 border border-rose-100 py-2.5 rounded-xl"
              >
                <ShieldAlert size={16} />
                Vào Trang Quản Lý Admin
              </Link>
            )}

            {isAdminRoute && (
              <Link
                href="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full text-center text-sm font-bold text-slate-600 bg-slate-50 border border-slate-100 py-2.5 rounded-xl"
              >
                Về lại Cửa Hàng
              </Link>
            )}

            {user ? (
              <div className="flex flex-col gap-3">
                <Link
                  href="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl"
                >
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-slate-700">{user.name}</h4>
                    <p className="text-xs text-slate-400">{user.email}</p>
                  </div>
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center gap-2 w-full py-2.5 border border-slate-200 text-rose-600 font-bold rounded-xl hover:bg-rose-50 transition-colors"
                >
                  <LogOut size={16} />
                  Đăng xuất
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-center py-2.5 border border-slate-200 rounded-xl text-slate-700 font-bold text-sm"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-center py-2.5 bg-amber-600 text-white rounded-xl font-bold text-sm"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;

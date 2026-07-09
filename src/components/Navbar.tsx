'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, BookOpen, Layers, ShoppingBag, Users, ChevronRight } from 'lucide-react';

export const Navbar: React.FC = () => {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Quản lý sách', href: '/admin/books', icon: BookOpen },
    { name: 'Quản lý thể loại', href: '/admin/categories', icon: Layers },
    { name: 'Quản lý đơn hàng', href: '/admin/orders', icon: ShoppingBag },
    { name: 'Quản lý người dùng', href: '/admin/users', icon: Users },
  ];

  return (
    <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col md:h-[calc(100vh-80px)] border-r border-slate-800">
      <div className="p-4 md:p-6 border-b border-slate-800">
        <h2 className="text-xs uppercase font-semibold text-slate-500 tracking-wider">Hệ thống quản lý</h2>
        <p className="text-sm font-bold text-white mt-1">Book Store Admin</p>
      </div>

      <nav className="flex-1 py-4 px-3 flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-y-auto whitespace-nowrap md:whitespace-normal no-scrollbar">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all gap-3 text-sm font-medium ${
                isActive
                  ? 'bg-amber-600 text-white font-semibold'
                  : 'hover:bg-slate-850 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400'} />
                <span>{item.name}</span>
              </div>
              <ChevronRight size={14} className={`hidden md:block opacity-60 ${isActive ? 'text-white' : 'text-slate-500'}`} />
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Navbar;

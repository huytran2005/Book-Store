import React from 'react';
import Navbar from '@/components/Navbar';
import Header from '@/components/Header';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Shared Header (displays admin profile & "Về Cửa hàng" option) */}
      <Header />
      
      {/* Body with sidebar layout */}
      <div className="flex-1 flex flex-col md:flex-row">
        <Navbar />
        <main className="flex-1 bg-slate-50 p-4 md:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

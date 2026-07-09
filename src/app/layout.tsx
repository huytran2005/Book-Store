import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/components/Toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'BookStore - Nhà Sách Trực Tuyến Hàng Đầu',
  description: 'Khám phá thế giới tri thức tại BookStore. Mua sách online giá tốt nhất, giao hàng nhanh chóng, đa dạng thể loại.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="h-full">
      <body className={`${inter.className} h-full antialiased bg-slate-50 text-slate-800 flex flex-col`}>
        <AuthProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

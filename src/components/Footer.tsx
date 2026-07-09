import React from 'react';
import Link from 'next/link';
import { BookOpen, Mail, Phone, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          
          {/* Brand Column */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2 text-white">
              <BookOpen size={26} className="text-amber-500 stroke-[2.5]" />
              <span className="font-extrabold text-xl tracking-tight">
                Book<span className="text-amber-500 font-medium">Store</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              Trang web thương mại điện tử mua bán sách trực tuyến hàng đầu Việt Nam, mang tri thức đến mọi nhà.
            </p>
            <div className="flex items-center gap-3 mt-2">
              <a href="#" aria-label="Facebook" className="p-2 rounded-lg bg-slate-800 hover:bg-amber-600 hover:text-white transition-all flex items-center justify-center">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="#" aria-label="Instagram" className="p-2 rounded-lg bg-slate-800 hover:bg-amber-600 hover:text-white transition-all flex items-center justify-center">
                <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              <a href="#" aria-label="Twitter" className="p-2 rounded-lg bg-slate-800 hover:bg-amber-600 hover:text-white transition-all flex items-center justify-center">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Khám phá</h3>
            <ul className="flex flex-col gap-2.5 text-sm">
              <li>
                <Link href="/" className="hover:text-amber-500 transition-colors">Trang chủ</Link>
              </li>
              <li>
                <Link href="/books" className="hover:text-amber-500 transition-colors">Tất cả sách</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-amber-500 transition-colors">Liên hệ</Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-amber-500 transition-colors">Đăng nhập</Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Danh mục hot</h3>
            <ul className="flex flex-col gap-2.5 text-sm">
              <li>
                <Link href="/category/van-hoc-tieu-thuyet" className="hover:text-amber-500 transition-colors">Văn học - Tiểu thuyết</Link>
              </li>
              <li>
                <Link href="/category/kinh-doanh-dau-tu" className="hover:text-amber-500 transition-colors">Kinh doanh - Đầu tư</Link>
              </li>
              <li>
                <Link href="/category/ky-nang-song" className="hover:text-amber-500 transition-colors">Phát triển bản thân</Link>
              </li>
              <li>
                <Link href="/category/thieu-nhi" className="hover:text-amber-500 transition-colors">Truyện thiếu nhi</Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-3">
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Thông tin liên hệ</h3>
            <div className="flex items-start gap-2.5 text-sm">
              <MapPin size={18} className="text-amber-500 shrink-0 mt-0.5" />
              <span>123 Đường Nguyễn Trãi, Quận 1, TP. Hồ Chí Minh</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm">
              <Phone size={18} className="text-amber-500 shrink-0" />
              <span>+84 123 456 789</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm">
              <Mail size={18} className="text-amber-500 shrink-0" />
              <span>support@bookstore.com</span>
            </div>
          </div>

        </div>

        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} BookStore. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-amber-500 transition-colors">Điều khoản dịch vụ</a>
            <a href="#" className="hover:text-amber-500 transition-colors">Chính sách bảo mật</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

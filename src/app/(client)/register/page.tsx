'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, User as UserIcon, UserPlus, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/Toast';
import Loading from '@/components/Loading';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register, user } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const redirectPath = searchParams.get('redirect') || '/';

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push(redirectPath);
      }
    }
  }, [user, router, redirectPath]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      showToast('Vui lòng điền đầy đủ các thông tin!', 'error');
      return;
    }

    setLoading(true);
    try {
      await register(email, password, name);
      showToast('Đăng ký tài khoản thành công và đã tự động đăng nhập!', 'success');
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Lỗi đăng ký tài khoản. Vui lòng thử lại!', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 md:my-20 px-4 w-full flex-1 flex flex-col justify-center">
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-6">
        
        <div className="text-center flex flex-col gap-2">
          <h1 className="text-2xl font-black text-slate-800">Đăng ký tài khoản</h1>
          <p className="text-xs text-slate-400">Tham gia cộng đồng yêu sách của chúng tôi ngay hôm nay</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase" htmlFor="fullname-register-field">Họ và tên của bạn</label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                id="fullname-register-field"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nguyễn Văn A"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm bg-slate-50/50"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase" htmlFor="email-register-field">Địa chỉ Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                id="email-register-field"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm bg-slate-50/50"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase" htmlFor="password-register-field">Mật khẩu</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                id="password-register-field"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tối thiểu 6 ký tự"
                minLength={6}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm bg-slate-50/50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-extrabold py-3 rounded-xl transition-all shadow-md shadow-amber-600/10 text-sm mt-2 disabled:opacity-50"
          >
            <UserPlus size={16} /> Đăng ký ngay
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-2">
          Đã có tài khoản?{' '}
          <Link href={`/login?redirect=${redirectPath}`} className="text-amber-600 font-bold hover:underline flex inline-flex items-center gap-0.5">
            Đăng nhập ngay <ArrowRight size={12} />
          </Link>
        </p>

      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<Loading fullScreen />}>
      <RegisterForm />
    </Suspense>
  );
}

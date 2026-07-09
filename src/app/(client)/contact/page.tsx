'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, HelpCircle } from 'lucide-react';
import { useToast } from '@/components/Toast';

export default function ContactPage() {
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      showToast('Vui lòng nhập đầy đủ họ tên, email và lời nhắn!', 'error');
      return;
    }

    setSending(true);
    setTimeout(() => {
      showToast('Gửi tin nhắn liên hệ thành công! Chúng tôi sẽ phản hồi sớm nhất.', 'success');
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
      setSending(false);
    }, 1000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex flex-col gap-8 flex-1">
      <div className="text-center flex flex-col gap-2 max-w-xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800">Liên hệ với chúng tôi</h1>
        <p className="text-sm text-slate-400">Bạn có câu hỏi, phản hồi hay cần hỗ trợ? Điền thông tin vào form dưới đây hoặc liên hệ trực tiếp qua hotline.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Contact Info Column */}
        <div className="md:col-span-4 flex flex-col gap-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-5">
            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3">Thông tin liên hệ</h2>
            
            <div className="flex gap-3.5 items-start text-sm text-slate-600">
              <MapPin className="text-amber-600 shrink-0 mt-0.5" size={20} />
              <div className="flex flex-col">
                <span className="font-bold text-slate-700">Địa chỉ văn phòng:</span>
                <span>123 Đường Nguyễn Trãi, Quận 1, TP. Hồ Chí Minh</span>
              </div>
            </div>

            <div className="flex gap-3.5 items-start text-sm text-slate-600">
              <Phone className="text-amber-600 shrink-0 mt-0.5" size={20} />
              <div className="flex flex-col">
                <span className="font-bold text-slate-700">Điện thoại liên hệ:</span>
                <span>+84 123 456 789</span>
              </div>
            </div>

            <div className="flex gap-3.5 items-start text-sm text-slate-600">
              <Mail className="text-amber-600 shrink-0 mt-0.5" size={20} />
              <div className="flex flex-col">
                <span className="font-bold text-slate-700">Email hỗ trợ:</span>
                <span>support@bookstore.com</span>
              </div>
            </div>
          </div>

          {/* Faq Card */}
          <div className="bg-amber-50/50 p-6 rounded-2xl border border-amber-100/50 flex flex-col gap-3">
            <h3 className="font-bold text-amber-800 text-sm flex items-center gap-1.5 uppercase tracking-wide">
              <HelpCircle size={16} /> Thời gian hỗ trợ
            </h3>
            <p className="text-xs text-amber-900/80 leading-relaxed">
              Tổng đài CSKH hỗ trợ trực tuyến từ 8:00 đến 21:00 tất cả các ngày trong tuần (kể cả ngày lễ, Tết).
            </p>
          </div>
        </div>

        {/* Contact Form Column */}
        <div className="md:col-span-8 bg-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 mb-6">Gửi tin nhắn phản hồi</h2>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase" htmlFor="name-contact">Họ và tên *</label>
                <input
                  id="name-contact"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm bg-slate-50/50"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase" htmlFor="email-contact">Địa chỉ Email *</label>
                <input
                  id="email-contact"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm bg-slate-50/50"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase" htmlFor="subject-contact">Tiêu đề phản hồi</label>
              <input
                id="subject-contact"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="VD: Cần hỗ trợ về đơn hàng..."
                className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm bg-slate-50/50"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase" htmlFor="message-contact">Lời nhắn hoặc câu hỏi *</label>
              <textarea
                id="message-contact"
                rows={5}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Nhập nội dung tin nhắn hoặc câu hỏi của bạn tại đây..."
                className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm bg-slate-50/50"
              />
            </div>

            <button
              type="submit"
              disabled={sending}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 px-6 rounded-xl transition-colors text-sm self-start flex items-center gap-2 disabled:opacity-50 mt-2"
            >
              <Send size={15} /> Gửi tin nhắn liên hệ
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { Book } from '@/types';
import Link from 'next/link';
import { ArrowRight, ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useToast } from '@/components/Toast';

interface Book3DCardProps {
  book: Book;
}

export default function Book3DCard({ book }: Book3DCardProps) {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const addItem = useCartStore((state) => state.addItem);
  const { showToast } = useToast();

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left - box.width / 2;
    const y = e.clientY - box.top - box.height / 2;
    
    // Normalize rotation values to prevent excessive bending
    const rotateY = (x / (box.width / 2)) * 30; // Max 30 degrees Y rotation
    const rotateX = -(y / (box.height / 2)) * 20; // Max 20 degrees X rotation
    
    setRotate({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(book, 1);
    showToast(`Đã thêm "${book.title}" vào giỏ hàng!`, 'success');
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white/70 backdrop-blur-md rounded-3xl border border-slate-100/50 shadow-xl hover:shadow-2xl transition-all duration-500 max-w-sm w-full gap-6 group">
      
      {/* 3D Book Visual Representation */}
      <div 
        className="relative cursor-pointer transition-transform duration-300 ease-out select-none"
        style={{
          perspective: '1200px',
          width: '160px',
          height: '220px',
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div
          className="relative w-full h-full transition-transform duration-300 ease-out"
          style={{
            transformStyle: 'preserve-3d',
            transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
          }}
        >
          {/* Spine / Gáy sách (3D Depth) */}
          <div 
            className="absolute left-0 top-0 h-full w-[16px] bg-amber-950 origin-left"
            style={{
              transform: 'rotateY(-90deg) translateZ(0px)',
              background: 'linear-gradient(to right, #451a03, #78350f, #451a03)',
              boxShadow: 'inset -2px 0 5px rgba(0,0,0,0.5)',
            }}
          />

          {/* Book Pages Thickness / Mép sách màu trắng */}
          <div 
            className="absolute right-0 top-1 h-[212px] w-[14px] bg-slate-50 origin-right rounded-r-sm border-y border-r border-slate-200"
            style={{
              transform: 'rotateY(90deg) translateZ(-160px)',
              background: 'repeating-linear-gradient(90deg, #f8fafc, #f8fafc 2px, #e2e8f0 2px, #e2e8f0 4px)',
            }}
          />

          {/* Back Cover / Bìa sau */}
          <div 
            className="absolute inset-0 rounded-l shadow-2xl bg-amber-900"
            style={{
              transform: 'translateZ(-14px) rotateY(180deg)',
              background: 'linear-gradient(to left, #78350f, #451a03)',
            }}
          />

          {/* Front Cover / Bìa trước (renders the book image) */}
          <div 
            className="absolute inset-0 rounded-r overflow-hidden shadow-2xl origin-left"
            style={{
              transform: 'translateZ(0px)',
              boxShadow: '5px 5px 15px rgba(0,0,0,0.3), -2px 0 4px rgba(0,0,0,0.1)',
            }}
          >
            <img 
              src={book.imageUrl} 
              alt={book.title} 
              className="w-full h-full object-cover select-none"
            />
            {/* Glossy Reflection Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </div>
        </div>
      </div>

      {/* Book Metadata details */}
      <div className="flex flex-col items-center text-center w-full gap-2.5">
        <span className="text-[10px] font-black tracking-widest text-amber-600 bg-amber-50 px-3 py-1 rounded-full uppercase">
          {book.category.replace('-', ' ')}
        </span>
        <h3 className="font-extrabold text-base text-slate-800 line-clamp-1 w-full px-2 group-hover:text-amber-600 transition-colors">
          {book.title}
        </h3>
        <p className="text-xs text-slate-400 font-bold">{book.author}</p>
        
        <span className="text-sm font-black text-slate-800 mt-1">
          {book.price.toLocaleString('vi-VN')} đ
        </span>
      </div>

      {/* Interaction Row */}
      <div className="flex items-center gap-3 w-full border-t border-slate-100/50 pt-4 mt-1">
        <button
          onClick={handleAddToCart}
          className="p-3 rounded-xl border-2 border-slate-200 text-slate-500 hover:border-amber-600 hover:text-amber-700 hover:bg-amber-50/30 transition-all"
          title="Thêm vào giỏ hàng"
        >
          <ShoppingCart size={16} />
        </button>
        
        <Link
          href={`/books/${book.id}`}
          className="flex-1 flex items-center justify-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs py-3 rounded-xl transition-all shadow-md shadow-amber-600/10"
        >
          Chi tiết <ArrowRight size={14} />
        </Link>
      </div>

    </div>
  );
}

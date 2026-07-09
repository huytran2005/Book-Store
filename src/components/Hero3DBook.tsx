'use client';

import React, { useState } from 'react';
import { Book } from '@/types';

interface Hero3DBookProps {
  book: Book;
}

export default function Hero3DBook({ book }: Hero3DBookProps) {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left - box.width / 2;
    const y = e.clientY - box.top - box.height / 2;
    
    const rotateY = (x / (box.width / 2)) * 35; // Max 35 degrees Y
    const rotateX = -(y / (box.height / 2)) * 25; // Max 25 degrees X
    
    setRotate({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
  };

  return (
    <div 
      className="relative cursor-pointer transition-transform duration-350 ease-out select-none"
      style={{
        perspective: '1200px',
        width: '230px',
        height: '320px',
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
          className="absolute left-0 top-0 h-full w-[22px] bg-stone-900 origin-left"
          style={{
            transform: 'rotateY(-90deg) translateZ(0px)',
            background: 'linear-gradient(to right, #1c1917, #44403c, #1c1917)',
            boxShadow: 'inset -2px 0 5px rgba(0,0,0,0.5)',
          }}
        />

        {/* Book Pages Thickness / Mép sách màu trắng */}
        <div 
          className="absolute right-0 top-1 h-[310px] w-[20px] bg-stone-50 origin-right rounded-r-sm border-y border-r border-stone-200"
          style={{
            transform: 'rotateY(90deg) translateZ(-230px)',
            background: 'repeating-linear-gradient(90deg, #fafaf9, #fafaf9 2px, #e7e5e4 2px, #e7e5e4 4px)',
          }}
        />

        {/* Back Cover / Bìa sau */}
        <div 
          className="absolute inset-0 rounded-l shadow-2xl bg-stone-850"
          style={{
            transform: 'translateZ(-20px) rotateY(180deg)',
            background: 'linear-gradient(to left, #292524, #1c1917)',
          }}
        />

        {/* Front Cover / Bìa trước (renders the book image) */}
        <div 
          className="absolute inset-0 rounded-r overflow-hidden shadow-2xl origin-left"
          style={{
            transform: 'translateZ(0px)',
            boxShadow: '10px 10px 30px rgba(0,0,0,0.45), -2px 0 4px rgba(0,0,0,0.1)',
          }}
        >
          <img 
            src={book.imageUrl} 
            alt={book.title} 
            className="w-full h-full object-cover select-none"
          />
          {/* Glossy Reflection Overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/20 pointer-events-none" />
        </div>
      </div>
    </div>
  );
}

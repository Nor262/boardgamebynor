'use client';

import React, { useRef, useState } from 'react';
import { Sparkles } from 'lucide-react';

export type GoodsType = 'DIAMOND' | 'GOLD' | 'SILVER' | 'CLOTH' | 'SPICE' | 'LEATHER';
export type CardType = GoodsType | 'CAMEL';

interface JaipurCardViewProps {
  card: { id: string; type: CardType };
  isSelected?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  isFacedown?: boolean;
}

interface CardVisual {
  name: string;
  tagline: string;
  gradient: string;
  borderClass: string;
  goldAccent: string;
  icon: string;
  image: string;
}

const CARD_VISUALS: Record<CardType, CardVisual> = {
  DIAMOND: {
    name: 'Kim Cương',
    tagline: 'Hàng Quý Tộc',
    gradient: 'from-[#0b1e36] via-[#102d52] to-[#081528]',
    borderClass: 'border-cyan-400/80',
    goldAccent: '#38bdf8',
    icon: '💎',
    image: '/assets/cards/diamond.png',
  },
  GOLD: {
    name: 'Vàng Ròng',
    tagline: 'Kho Báu Hoàng Gia',
    gradient: 'from-[#2c1d04] via-[#4d3308] to-[#1a1102]',
    borderClass: 'border-amber-400/90',
    goldAccent: '#f59e0b',
    icon: '🪙',
    image: '/assets/cards/gold.png',
  },
  SILVER: {
    name: 'Bạc Trắng',
    tagline: 'Nguyên Chất 999',
    gradient: 'from-[#1e232a] via-[#333a44] to-[#12161b]',
    borderClass: 'border-slate-300/80',
    goldAccent: '#cbd5e1',
    icon: '⚪',
    image: '/assets/cards/silver.png',
  },
  CLOTH: {
    name: 'Tơ Lụa',
    tagline: 'Dệt Chỉ Vàng',
    gradient: 'from-[#280838] via-[#4a0d66] to-[#190424]',
    borderClass: 'border-purple-400/80',
    goldAccent: '#c084fc',
    icon: '🟣',
    image: '/assets/cards/cloth.png',
  },
  SPICE: {
    name: 'Gia Vị',
    tagline: 'Đặc Sản Sa Mạc',
    gradient: 'from-[#331405] via-[#5c2409] to-[#210c03]',
    borderClass: 'border-orange-400/80',
    goldAccent: '#fb923c',
    icon: '🟤',
    image: '/assets/cards/spice.png',
  },
  LEATHER: {
    name: 'Da Thuộc',
    tagline: 'Hảo Hạng Xứ Ấn',
    gradient: 'from-[#2e0909] via-[#521313] to-[#1c0505]',
    borderClass: 'border-rose-400/80',
    goldAccent: '#f87171',
    icon: '🔴',
    image: '/assets/cards/leather.png',
  },
  CAMEL: {
    name: 'Lạc Đà',
    tagline: 'Đoàn Thương Nhân',
    gradient: 'from-[#301c04] via-[#593407] to-[#1e1102]',
    borderClass: 'border-amber-400/90',
    goldAccent: '#fbbf24',
    icon: '🐪',
    image: '/assets/cards/camel.png',
  },
};

export function JaipurCardView({
  card,
  isSelected = false,
  onClick,
  size = 'md',
  isFacedown = false,
}: JaipurCardViewProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });

  const visual = CARD_VISUALS[card.type] || CARD_VISUALS.LEATHER;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;
    setRotate({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
  };

  const sizeStyles = {
    sm: 'w-20 h-28 min-h-[112px]',
    md: 'w-28 sm:w-32 h-40 sm:h-46 min-h-[160px]',
    lg: 'w-36 h-52 min-h-[208px]',
  }[size];

  if (isFacedown) {
    return (
      <div
        className={`${sizeStyles} rounded-2xl border-2 border-amber-500/70 shadow-2xl relative overflow-hidden select-none flex-shrink-0 group`}
      >
        <img
          src="/assets/cards/card_back.png"
          alt="Jaipur Card Back"
          className="w-full h-full object-cover rounded-2xl transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 pointer-events-none rounded-2xl" />
        <div className="absolute inset-1 rounded-xl border border-amber-400/40 pointer-events-none" />
      </div>
    );
  }

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(600px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) ${
          isSelected ? 'translateY(-12px)' : ''
        }`,
        transition: 'transform 0.15s ease-out, box-shadow 0.2s ease',
      }}
      className={`relative ${sizeStyles} rounded-2xl border-2 cursor-pointer flex flex-col justify-between select-none overflow-hidden group shadow-xl ${
        visual.borderClass
      } ${
        isSelected
          ? 'ring-4 ring-amber-400 shadow-amber-500/60 scale-105'
          : 'hover:shadow-2xl hover:shadow-black/80'
      }`}
    >
      {/* Hình minh họa chất lượng cao đã tách nền bo góc */}
      <img
        src={visual.image}
        alt={visual.name}
        className="absolute inset-0 w-full h-full object-cover rounded-2xl transition-transform duration-500 group-hover:scale-110"
      />

      {/* Lớp phủ chuyển màu tăng độ tương phản đọc chữ */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-black/60 pointer-events-none rounded-2xl" />

      {/* Khung viền chỉ vàng hoàng gia bên trong */}
      <div className="absolute inset-1 rounded-xl border border-amber-400/40 pointer-events-none" />

      {/* Tia phản quang Shimmer ánh kim khi di chuột */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />

      {/* Header lá bài */}
      <div className="flex items-center justify-between z-10 p-2">
        <span
          className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border shadow-md backdrop-blur-sm"
          style={{
            borderColor: visual.goldAccent,
            color: visual.goldAccent,
            backgroundColor: 'rgba(0,0,0,0.65)',
          }}
        >
          {visual.name}
        </span>
        {isSelected ? (
          <span className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-500 text-slate-950 font-black text-xs flex items-center justify-center shadow-lg ring-2 ring-white">
            ✓
          </span>
        ) : (
          <span className="text-xs backdrop-blur-sm bg-black/50 px-1.5 py-0.5 rounded-full border border-white/10">
            {visual.icon}
          </span>
        )}
      </div>

      {/* Footer lá bài */}
      <div className="z-10 p-2 text-center backdrop-blur-sm bg-black/60 rounded-b-xl border-t border-white/10">
        <div className="text-[11px] font-black tracking-wide text-white drop-shadow">
          {visual.name}
        </div>
        <div className="text-[9px] font-medium text-amber-300 truncate">
          {visual.tagline}
        </div>
      </div>
    </div>
  );
}

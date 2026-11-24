'use client';

import React from 'react';

export type GoodsType = 'DIAMOND' | 'GOLD' | 'SILVER' | 'CLOTH' | 'SPICE' | 'LEATHER';

interface CoinStackProps {
  type: GoodsType;
  tokens: number[]; // Mảng các giá trị xu còn lại từ trên xuống dưới
}

interface TokenDesign {
  name: string;
  metalBg: string;
  rimColor: string;
  jewelGradient: string;
  icon: string;
  gemColor: string;
}

const TOKEN_DESIGNS: Record<GoodsType, TokenDesign> = {
  DIAMOND: {
    name: 'Kim Cương',
    metalBg: 'from-sky-300 via-blue-100 to-cyan-500',
    rimColor: 'border-cyan-300',
    jewelGradient: 'from-cyan-400 to-blue-600',
    icon: '💎',
    gemColor: '#00e5ff',
  },
  GOLD: {
    name: 'Vàng',
    metalBg: 'from-amber-200 via-yellow-400 to-amber-600',
    rimColor: 'border-yellow-300',
    jewelGradient: 'from-amber-400 to-yellow-600',
    icon: '🟡',
    gemColor: '#ffd700',
  },
  SILVER: {
    name: 'Bạc',
    metalBg: 'from-slate-100 via-slate-300 to-zinc-500',
    rimColor: 'border-slate-200',
    jewelGradient: 'from-slate-200 to-zinc-400',
    icon: '⚪',
    gemColor: '#e0e0e0',
  },
  CLOTH: {
    name: 'Tơ Lụa',
    metalBg: 'from-fuchsia-300 via-purple-400 to-purple-800',
    rimColor: 'border-purple-300',
    jewelGradient: 'from-purple-500 to-fuchsia-700',
    icon: '🟣',
    gemColor: '#d946ef',
  },
  SPICE: {
    name: 'Gia Vị',
    metalBg: 'from-amber-400 via-orange-500 to-amber-800',
    rimColor: 'border-amber-400',
    jewelGradient: 'from-orange-500 to-amber-700',
    icon: '🟤',
    gemColor: '#f97316',
  },
  LEATHER: {
    name: 'Da Thuộc',
    metalBg: 'from-rose-400 via-red-600 to-rose-900',
    rimColor: 'border-rose-400',
    jewelGradient: 'from-rose-600 to-red-800',
    icon: '🔴',
    gemColor: '#ef4444',
  },
};

const GOODS_ART: Record<GoodsType, string> = {
  DIAMOND: '/assets/cards/diamond.png',
  GOLD: '/assets/cards/gold.png',
  SILVER: '/assets/cards/silver.png',
  CLOTH: '/assets/cards/cloth.png',
  SPICE: '/assets/cards/spice.png',
  LEATHER: '/assets/cards/leather.png',
};

export function CoinStack({ type, tokens }: CoinStackProps) {
  const design = TOKEN_DESIGNS[type];
  const count = tokens.length;
  const topValue = count > 0 ? tokens[0] : null;
  const isEmpty = count === 0;

  // Tính chiều cao xếp chồng 3D (mỗi đồng xu dày 3.5px)
  const stackLayers = Math.min(count, 5);

  return (
    <div className="flex flex-col items-center group cursor-pointer select-none">
      {/* Vùng Render 3D Stack */}
      <div className="relative w-14 h-16 sm:w-16 sm:h-20 flex items-center justify-center">
        {isEmpty ? (
          <div className="w-12 h-12 rounded-full border-2 border-dashed border-slate-700/80 bg-slate-900/40 flex items-center justify-center text-[10px] font-black text-slate-500">
            HẾT
          </div>
        ) : (
          <div className="relative w-12 h-12 sm:w-14 sm:h-14">
            {/* Các lớp xu bên dưới tạo độ dày 3D thực tế */}
            {Array.from({ length: stackLayers }).map((_, idx) => {
              const layerOffset = (stackLayers - idx - 1) * 3.5;
              return (
                <div
                  key={idx}
                  className="absolute inset-0 rounded-full bg-slate-900/80 shadow-md border-b-2 border-black/60"
                  style={{
                    transform: `translateY(${layerOffset}px)`,
                    filter: `brightness(${0.7 + idx * 0.06})`,
                  }}
                >
                  <div className={`w-full h-full rounded-full bg-gradient-to-b ${design.metalBg} opacity-85`} />
                </div>
              );
            })}

            {/* Đồng xu trên đỉnh (Top Coin) */}
            <div
              className={`absolute inset-0 rounded-full border-2 ${design.rimColor} shadow-xl flex flex-col items-center justify-center transition-all transform group-hover:-translate-y-1.5 group-hover:scale-105 overflow-hidden`}
              style={{
                boxShadow: `0 8px 18px rgba(0,0,0,0.6), inset 0 2px 4px rgba(255,255,255,0.8)`,
              }}
            >
              {/* Lớp hình nền Art thu nhỏ của món hàng */}
              <img
                src={GOODS_ART[type]}
                alt={design.name}
                className="absolute inset-0 w-full h-full object-cover scale-125 opacity-75"
              />
              <div className="absolute inset-0 bg-black/45 backdrop-blur-[0.5px]" />

              {/* Vòng viền họa tiết bên trong xu */}
              <div className="relative z-10 w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-amber-400/80 flex items-center justify-center bg-black/60 shadow-inner">
                <span className="font-black text-amber-300 text-base sm:text-lg leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                  {topValue}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tên & Số lượng xu còn lại */}
      <div className="text-center mt-1.5 flex flex-col items-center gap-1">
        <div className="text-xs font-black text-slate-200 flex items-center justify-center gap-1 tracking-tight">
          <span>{design.icon}</span>
          <span>{design.name}</span>
        </div>
        <div>
          {isEmpty ? (
            <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-rose-950/90 text-rose-400 border border-rose-500/60 shadow-sm">
              HẾT XU
            </span>
          ) : (
            <span className="inline-block px-3 py-0.5 rounded-full text-xs sm:text-sm font-black uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/50 shadow-md">
              CÒN {count} XU
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

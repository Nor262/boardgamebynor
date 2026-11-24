'use client';

import React from 'react';

const SWISS_THEMES = [
  'bg-black text-white border-2 border-black',
  'bg-[#F2F2F2] text-black border-2 border-black',
  'bg-[#FF3000] text-white border-2 border-black',
  'bg-white text-black border-2 border-black',
  'bg-black text-[#FF3000] border-2 border-black',
  'bg-neutral-800 text-white border-2 border-black',
];

interface AvatarProps {
  seed: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showOnlineDot?: boolean;
  isOnline?: boolean;
}

function getInitials(name: string): string {
  if (!name || !name.trim()) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function Avatar({ seed, name, size = 'md', showOnlineDot = false, isOnline = true }: AvatarProps) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const themeIndex = Math.abs(hash) % SWISS_THEMES.length;
  const initials = getInitials(name);

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs font-mono font-black',
    md: 'w-11 h-11 text-sm font-mono font-black',
    lg: 'w-14 h-14 text-base font-mono font-black',
    xl: 'w-20 h-20 text-xl font-mono font-black',
  }[size];

  return (
    <div className="relative inline-block flex-shrink-0 select-none">
      <div
        className={`${sizeClasses} ${SWISS_THEMES[themeIndex]} flex items-center justify-center tracking-tighter transition-transform duration-150`}
        title={name}
      >
        <span>{initials}</span>
      </div>
      {showOnlineDot && (
        <span
          className={`absolute -bottom-1 -right-1 w-3 h-3 border border-black ${
            isOnline ? 'bg-emerald-500' : 'bg-neutral-400'
          }`}
          title={isOnline ? 'Đang online' : 'Đang mất kết nối'}
        />
      )}
    </div>
  );
}

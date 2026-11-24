'use client';

import React, { useState } from 'react';
import { Copy, Check, QrCode, Users } from 'lucide-react';

interface InviteLinkCardProps {
  roomCode: string;
  maxPlayers: number;
  currentPlayers: number;
}

export function InviteLinkCard({ roomCode, maxPlayers, currentPlayers }: InviteLinkCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    if (typeof window === 'undefined') return;
    const url = `${window.location.origin}/room/${roomCode}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border-4 border-black bg-white p-5 sm:p-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-5 swiss-grid-pattern">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-black text-white flex items-center justify-center flex-shrink-0">
          <QrCode className="w-7 h-7" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-xs font-mono font-black uppercase tracking-widest text-neutral-600">
            <span>MÃ PHÒNG CHƠI</span>
            <span className="bg-black text-white px-2 py-0.5 text-[10px] font-mono font-bold flex items-center gap-1">
              <Users className="w-3 h-3 text-[#FF3000]" />
              {currentPlayers}/{maxPlayers} người
            </span>
          </div>
          <div
            onClick={handleCopyCode}
            className="text-3xl sm:text-4xl font-mono font-black tracking-wider text-black hover:text-[#FF3000] cursor-pointer transition-colors duration-150 flex items-center gap-3 mt-1"
            title="Bấm để sao chép mã phòng"
          >
            <span>{roomCode}</span>
            <span className="text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-widest border border-black px-1.5 py-0.5 hover:bg-black hover:text-white">
              SAO CHÉP
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleCopyLink}
          className="w-full sm:w-auto h-12 px-6 bg-black hover:bg-[#FF3000] text-white font-mono font-black text-xs uppercase tracking-widest transition-colors duration-150 flex items-center justify-center gap-2 border-2 border-black cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-white" />
              <span>ĐÃ SAO CHÉP LIÊN KẾT</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-white" />
              <span>SAO CHÉP LINK MỜI</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { useRoomStore } from '@/stores/room-store';
import { ChatBox } from './ChatBox';
import { MessageSquare, X, ChevronDown } from 'lucide-react';

interface FloatingChatWidgetProps {
  defaultOpen?: boolean;
}

export function FloatingChatWidget({ defaultOpen = false }: FloatingChatWidgetProps) {
  const { room } = useRoomStore();
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (!room) return null;

  const messageCount = room.chat.length;

  return (
    <>
      {/* Floating Button when collapsed */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 z-40 w-11 h-11 bg-black text-white hover:bg-[#FF3000] border-2 border-amber-400/80 rounded-full flex items-center justify-center shadow-2xl cursor-pointer transition-all duration-150 hover:scale-105 active:scale-95"
          title="Mở khung trò chuyện"
          aria-label="Mở khung trò chuyện"
        >
          <MessageSquare className="w-5 h-5 text-amber-400 group-hover:text-white" />
          {messageCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#FF3000] text-white text-[10px] font-mono font-bold w-5 h-5 rounded-full border border-white flex items-center justify-center leading-none">
              {messageCount > 99 ? '99+' : messageCount}
            </span>
          )}
        </button>
      )}

      {/* Floating Chat Modal when opened */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 z-50 w-80 sm:w-96 max-h-[85vh] shadow-2xl border-4 border-black bg-white flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Top Collapse Header */}
          <div className="flex items-center justify-between px-3 py-2 bg-black text-white border-b-2 border-black">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#FF3000]" />
              <span className="font-mono font-black text-xs uppercase tracking-wider">
                TRÒ CHUYỆN PHÒNG [{room.code}]
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-white hover:text-[#FF3000] hover:bg-neutral-800 transition-colors cursor-pointer"
              title="Thu nhỏ khung chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Embedded ChatBox */}
          <div className="flex-1 overflow-hidden">
            <ChatBox />
          </div>
        </div>
      )}
    </>
  );
}

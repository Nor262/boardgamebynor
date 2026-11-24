'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRoomStore } from '@/stores/room-store';
import { Send, MessageSquare, Terminal, Smile } from 'lucide-react';

const QUICK_STICKERS = [
  '🎲', '👑', '🚀', '🛡️', '🔥', '🏆',
  '😱', '😂', '👏', '🍀', '✨', '⚡'
];

export function ChatBox() {
  const { room, me, sendChat } = useRoomStore();
  const [activeTab, setActiveTab] = useState<'CHAT' | 'STICKER'>('CHAT');
  const [text, setText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [room?.chat]);

  if (!room || !me) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    sendChat(text.trim(), 'TEXT');
    setText('');
  };

  const handleSendSticker = (sticker: string) => {
    sendChat(sticker, 'STICKER');
  };

  return (
    <div className="border-4 border-black bg-white flex flex-col h-[400px] rounded-none overflow-hidden">
      {/* Tab Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b-2 border-black bg-white">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[#FF3000]" />
          <span className="font-mono font-black text-xs text-black uppercase tracking-wider">
            TRÒ CHUYỆN
          </span>
        </div>
        <div className="flex items-center border border-black">
          <button
            onClick={() => setActiveTab('CHAT')}
            className={`px-3 py-1 font-mono font-black text-[11px] uppercase tracking-wider transition-colors duration-150 ${
              activeTab === 'CHAT' ? 'bg-black text-white' : 'bg-[#F2F2F2] text-black hover:bg-[#FF3000] hover:text-white'
            }`}
          >
            TIN NHẮN
          </button>
          <button
            onClick={() => setActiveTab('STICKER')}
            className={`px-3 py-1 font-mono font-black text-[11px] uppercase tracking-wider transition-colors duration-150 flex items-center gap-1 border-l border-black ${
              activeTab === 'STICKER' ? 'bg-black text-white' : 'bg-[#F2F2F2] text-black hover:bg-[#FF3000] hover:text-white'
            }`}
          >
            <Smile className="w-3 h-3" />
            <span>BIỂU CẢM</span>
          </button>
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2.5 text-xs bg-white">
        {room.chat.length === 0 ? (
          <div className="h-full flex items-center justify-center font-mono text-neutral-400 text-xs">
            Chưa có tin nhắn nào trong phòng.
          </div>
        ) : (
          room.chat.map((msg) => {
            if (msg.type === 'SYSTEM') {
              return (
                <div key={msg.id} className="text-center my-1">
                  <span className="inline-block px-2.5 py-0.5 border border-black bg-[#F2F2F2] text-[10px] font-mono font-bold text-neutral-700">
                    {msg.content}
                  </span>
                </div>
              );
            }

            const isMe = msg.senderId === me.id;

            if (msg.type === 'STICKER') {
              return (
                <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <span className="text-[10px] font-mono font-bold text-neutral-500 mb-0.5">
                    {isMe ? 'Bạn' : msg.senderName}
                  </span>
                  <div className="text-2xl p-2 border-2 border-black bg-[#F2F2F2]">
                    {msg.content}
                  </div>
                </div>
              );
            }

            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <span className="text-[10px] font-mono font-bold text-neutral-500 mb-0.5">
                  {isMe ? 'Bạn' : msg.senderName}
                </span>
                <div
                  className={`px-3 py-2 max-w-[85%] break-words font-mono text-xs border border-black ${
                    isMe
                      ? 'bg-black text-white'
                      : 'bg-[#F2F2F2] text-black'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input or Sticker Tray */}
      {activeTab === 'CHAT' ? (
        <form onSubmit={handleSend} className="p-3 border-t-2 border-black bg-white flex items-center gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Nhập tin nhắn..."
            maxLength={150}
            className="flex-1 bg-[#F2F2F2] border-2 border-black px-3 py-2 text-xs font-mono font-bold text-black placeholder-neutral-500 focus:outline-none focus:border-[#FF3000] rounded-none"
          />
          <button
            type="submit"
            disabled={!text.trim()}
            className="h-9 px-4 bg-black hover:bg-[#FF3000] disabled:opacity-40 text-white font-mono font-black text-xs uppercase tracking-wider transition-colors duration-150 border-2 border-black rounded-none flex items-center justify-center cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      ) : (
        <div className="p-3 border-t-2 border-black bg-[#F2F2F2] grid grid-cols-6 gap-2">
          {QUICK_STICKERS.map((stk) => (
            <button
              key={stk}
              type="button"
              onClick={() => handleSendSticker(stk)}
              className="w-full h-9 border border-black bg-white hover:bg-[#FF3000] text-base transition-colors duration-150 flex items-center justify-center rounded-none cursor-pointer"
            >
              {stk}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

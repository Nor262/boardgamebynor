'use client';

import React from 'react';
import { useRoomStore } from '@/stores/room-store';
import { Avatar } from '../common/Avatar';
import { Check, Clock, UserX, Eye, ArrowDown, ArrowUp } from 'lucide-react';

export function PlayerSlotList() {
  const { room, me, kickPlayer, switchRole, toggleReady } = useRoomStore();

  if (!room || !me) return null;

  const isHost = me.isHost;
  const filledSlots = room.players;
  const emptySlotsCount = Math.max(0, room.maxPlayers - filledSlots.length);

  return (
    <div className="flex flex-col gap-6">
      {/* Danh sách người chơi tại Bàn chính */}
      <div className="border-4 border-black bg-white p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-black pb-4 mb-5 gap-3">
          <div className="flex items-center gap-2">
            <span className="font-mono font-black text-sm uppercase tracking-wider text-black">
              BÀN CHƠI CHÍNH ({filledSlots.length}/{room.maxPlayers})
            </span>
          </div>

          {/* Nút Sẵn Sàng (dành cho người chơi không phải Host) */}
          {!isHost && me.role === 'PLAYER' && (
            <button
              onClick={toggleReady}
              className={`h-10 px-5 font-mono font-black text-xs uppercase tracking-widest transition-colors duration-150 border-2 border-black rounded-none flex items-center justify-center gap-2 cursor-pointer ${
                me.isReady
                  ? 'bg-black text-white hover:bg-[#FF3000]'
                  : 'bg-[#FF3000] text-white hover:bg-black animate-pulse'
              }`}
            >
              {me.isReady ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>ĐÃ SẴN SÀNG</span>
                </>
              ) : (
                <>
                  <Clock className="w-4 h-4 text-white" />
                  <span>BẤM SẴN SÀNG</span>
                </>
              )}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Các người chơi đã ngồi vào slot */}
          {filledSlots.map((player) => {
            const isMe = player.id === me.id;
            return (
              <div
                key={player.id}
                className={`p-4 border-2 border-black flex items-center justify-between gap-3 rounded-none ${
                  isMe ? 'bg-[#F2F2F2]' : 'bg-white'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar
                    seed={player.avatarSeed}
                    name={player.nickname}
                    size="md"
                    showOnlineDot={true}
                    isOnline={player.connected}
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 font-mono font-black text-sm text-black truncate">
                      <span className="truncate">{player.nickname}</span>
                      {isMe && (
                        <span className="text-[10px] font-mono font-black px-1.5 py-0.5 bg-[#FF3000] text-white">
                          BẠN
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs font-mono font-bold">
                      {player.isHost ? (
                        <span className="text-[#FF3000] uppercase tracking-wider">
                          [ CHỦ PHÒNG ]
                        </span>
                      ) : player.isReady ? (
                        <span className="text-black uppercase tracking-wider">
                          [ SẴN SÀNG ]
                        </span>
                      ) : (
                        <span className="text-neutral-500 uppercase tracking-wider">
                          [ ĐANG CHỜ ]
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Hành động của Chủ phòng */}
                {isHost && !player.isHost && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => switchRole(player.id, 'SPECTATOR')}
                      title="Chuyển sang Khán giả"
                      className="w-8 h-8 border border-black bg-white hover:bg-black hover:text-white flex items-center justify-center transition-colors duration-150 cursor-pointer"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => kickPlayer(player.id)}
                      title="Mời ra khỏi phòng"
                      className="w-8 h-8 border border-black bg-white hover:bg-[#FF3000] hover:text-white text-[#FF3000] flex items-center justify-center transition-colors duration-150 cursor-pointer"
                    >
                      <UserX className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {/* Các Slot còn trống */}
          {Array.from({ length: emptySlotsCount }).map((_, idx) => (
            <div
              key={`empty-${idx}`}
              className="p-4 border-2 border-dashed border-neutral-400 bg-[#F2F2F2] flex items-center justify-between gap-3 text-neutral-500 min-h-[72px]"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 border-2 border-dashed border-neutral-400 flex items-center justify-center font-mono font-bold text-xs text-neutral-500">
                  {String(filledSlots.length + idx + 1).padStart(2, '0')}
                </div>
                <div className="flex flex-col">
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-neutral-600">
                    CHỖ TRỐNG
                  </span>
                  <span className="text-[10px] font-mono text-neutral-400">
                    ĐANG CHỜ BẠN BÈ THAM GIA
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hàng ghế Khán giả (Spectators) */}
      <div className="border-4 border-black bg-white p-5">
        <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-black text-xs font-mono font-black text-black uppercase tracking-wider">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-[#FF3000]" />
            <span>KHÁN GIẢ ({room.spectators.length})</span>
          </div>

          {/* Nếu đang là khán giả và bàn chơi còn slot */}
          {me.role === 'SPECTATOR' && emptySlotsCount > 0 && (
            <button
              onClick={() => switchRole(me.id, 'PLAYER')}
              className="h-8 px-3 bg-black hover:bg-[#FF3000] text-white font-mono font-black text-xs uppercase tracking-wider flex items-center gap-1 border border-black cursor-pointer transition-colors duration-150"
            >
              <ArrowUp className="w-3.5 h-3.5" />
              <span>NGỒI VÀO BÀN CHƠI</span>
            </button>
          )}
        </div>

        {room.spectators.length === 0 ? (
          <p className="text-xs font-mono text-neutral-400">
            Chưa có ai ở hàng ghế khán giả.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {room.spectators.map(spec => (
              <div
                key={spec.id}
                className="flex items-center gap-2 px-3 py-1.5 border border-black bg-[#F2F2F2] text-xs font-mono font-bold text-black"
              >
                <Avatar seed={spec.avatarSeed} name={spec.nickname} size="sm" />
                <span>{spec.nickname}</span>
                {spec.id === me.id && <span className="text-[10px] text-[#FF3000] font-black">(BẠN)</span>}
                {isHost && (
                  <button
                    onClick={() => kickPlayer(spec.id)}
                    title="Mời ra khỏi phòng"
                    className="ml-1 text-neutral-500 hover:text-[#FF3000]"
                  >
                    <UserX className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

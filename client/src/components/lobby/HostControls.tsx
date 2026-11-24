'use client';

import React, { useState } from 'react';
import { useRoomStore } from '@/stores/room-store';
import { Sliders, Play, Users, AlertCircle, ShieldAlert, LayoutGrid } from 'lucide-react';
import { GameSelectMenuModal } from '@/components/game/GameSelectMenuModal';
import { getGameDisplayInfo } from '@/constants/games';

export function HostControls() {
  const { room, me, availableGames, setGame, setMaxPlayers, startGame } = useRoomStore();
  const [isGameMenuOpen, setIsGameMenuOpen] = useState(false);

  if (!room || !me) return null;

  const isHost = me.isHost;
  const currentGame = availableGames.find(g => g.id === room.selectedGameId) || availableGames[0];
  const gameInfo = getGameDisplayInfo(room.selectedGameId, currentGame);
  const minRequired = currentGame?.minPlayers || 2;
  const maxAllowed = currentGame?.maxPlayers || 6;

  const currentActiveCount = room.players.length;
  const unreadyCount = room.players.filter(p => !p.isReady).length;
  const canStart = isHost && currentActiveCount >= minRequired && currentActiveCount <= room.maxPlayers && unreadyCount === 0;

  let startHint = '';
  if (!isHost) {
    startHint = 'Đang chờ Chủ phòng bấm Bắt đầu...';
  } else if (currentActiveCount < minRequired) {
    startHint = `Cần tối thiểu ${minRequired} người chơi để bắt đầu (hiện có ${currentActiveCount})`;
  } else if (unreadyCount > 0) {
    startHint = `Còn ${unreadyCount} bạn chưa bấm Sẵn sàng!`;
  }

  return (
    <div className="border-4 border-black bg-white p-5 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-black pb-3">
        <div className="flex items-center gap-2 font-mono font-black text-sm uppercase tracking-wider text-black">
          <Sliders className="w-4 h-4 text-[#FF3000]" />
          <span>CÀI ĐẶT BÀN CHƠI</span>
        </div>
        {isHost ? (
          <span className="px-2 py-0.5 text-[10px] font-mono font-black uppercase tracking-widest bg-[#FF3000] text-white">
            BẠN LÀ CHỦ PHÒNG
          </span>
        ) : (
          <span className="text-[10px] font-mono font-bold text-neutral-500 uppercase">
            CHỈ CHỦ PHÒNG CÓ THỂ THAY ĐỔI
          </span>
        )}
      </div>

      {/* Chọn Game Với Hình Ảnh & Menu */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-mono font-black uppercase tracking-wider text-black flex items-center gap-1.5">
            <LayoutGrid className="w-3.5 h-3.5 text-[#FF3000]" />
            <span>TRÒ CHƠI BÀN CỜ</span>
          </label>
          {isHost && (
            <button
              type="button"
              onClick={() => setIsGameMenuOpen(true)}
              className="text-xs font-mono font-black uppercase text-[#FF3000] hover:text-black transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>ĐỔI GAME (CÓ HÌNH)</span>
            </button>
          )}
        </div>

        {/* Selected Game Card with Cover Art */}
        <div className="p-3 bg-[#F2F2F2] border-2 border-black flex gap-3 items-center">
          <div className="w-14 h-18 aspect-[3/4] border border-black bg-black flex-shrink-0 overflow-hidden relative">
            <img
              src={gameInfo.image}
              alt={gameInfo.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/assets/games/jaipur.jpg';
              }}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <span className="font-mono font-black text-xs uppercase tracking-tight text-black truncate">
                {gameInfo.name}
              </span>
              <span className="font-mono text-[10px] bg-black text-white px-1.5 py-0.5 uppercase flex-shrink-0">
                {gameInfo.minPlayers === gameInfo.maxPlayers
                  ? `${gameInfo.minPlayers} NGƯỜI`
                  : `${gameInfo.minPlayers} - ${gameInfo.maxPlayers} NGƯỜI`}
              </span>
            </div>
            <p className="font-mono text-[11px] text-[#FF3000] font-bold uppercase truncate mt-0.5">
              {gameInfo.tagline}
            </p>
            <p className="text-[11px] text-neutral-600 line-clamp-2 mt-1 leading-snug">
              {gameInfo.description}
            </p>
          </div>
        </div>

        {isHost && (
          <div className="flex gap-2 items-center mt-1 min-w-0 w-full">
            <select
              value={room.selectedGameId}
              onChange={(e) => setGame(e.target.value)}
              className="flex-1 min-w-0 w-full truncate bg-white border-2 border-black px-3 py-2 text-xs font-mono font-black uppercase text-black focus:outline-none focus:border-[#FF3000] rounded-none cursor-pointer"
            >
              {availableGames.map(game => (
                <option key={game.id} value={game.id}>
                  {game.name.toUpperCase()} ({game.minPlayers} - {game.maxPlayers} NGƯỜI)
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setIsGameMenuOpen(true)}
              className="flex-shrink-0 px-3 py-2 bg-black hover:bg-[#FF3000] text-white font-mono font-black text-xs uppercase tracking-wider border-2 border-black transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>MENU</span>
            </button>
          </div>
        )}
      </div>

      {/* Quản lý số người chơi tối đa */}
      <div className="flex flex-col gap-2 pt-2 border-t-2 border-black">
        <div className="flex items-center justify-between">
          <label className="text-xs font-mono font-black uppercase tracking-wider text-black flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-neutral-700" />
            SỐ NGƯỜI CHƠI TỐI ĐA
          </label>
          <span className="text-xs font-mono font-black bg-black text-white px-2 py-0.5">
            {room.maxPlayers} CHỖ
          </span>
        </div>

        {isHost ? (
          <div className="flex items-center gap-2 mt-1">
            {Array.from({ length: maxAllowed - minRequired + 1 }).map((_, idx) => {
              const count = minRequired + idx;
              const isSelected = room.maxPlayers === count;
              return (
                <button
                  key={count}
                  type="button"
                  onClick={() => setMaxPlayers(count)}
                  className={`flex-1 h-9 font-mono font-black text-xs transition-colors duration-150 border-2 border-black rounded-none ${
                    isSelected
                      ? 'bg-black text-white'
                      : 'bg-[#F2F2F2] text-black hover:bg-[#FF3000] hover:text-white'
                  }`}
                >
                  {count}P
                </button>
              );
            })}
          </div>
        ) : (
          <div className="text-xs font-mono text-neutral-600">
            QUY MÔ BÀN: <strong>{room.maxPlayers} NGƯỜI</strong> (VƯỢT QUÁ SẼ VÀO HÀNG GHẾ KHÁN GIẢ).
          </div>
        )}
      </div>

      {/* Nút Bắt đầu trận đấu */}
      <div className="pt-2 flex flex-col gap-2">
        {isHost ? (
          <button
            onClick={startGame}
            disabled={!canStart}
            className={`w-full h-14 font-mono font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 border-2 border-black rounded-none transition-colors duration-150 ${
              canStart
                ? 'bg-[#FF3000] hover:bg-black text-white cursor-pointer'
                : 'bg-[#F2F2F2] text-neutral-400 border-neutral-300 cursor-not-allowed'
            }`}
          >
            <Play className="w-4 h-4 fill-current" />
            <span>BẮT ĐẦU TRẬN ĐẤU</span>
          </button>
        ) : (
          <div className="w-full h-14 bg-[#F2F2F2] border-2 border-black text-center text-xs font-mono font-black uppercase text-neutral-600 flex items-center justify-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#FF3000] animate-pulse"></span>
            <span>CHỜ CHỦ PHÒNG BẮT ĐẦU</span>
          </div>
        )}

        {startHint && (
          <div className="border border-black bg-[#F2F2F2] p-2 text-xs font-mono font-bold text-neutral-800 flex items-center justify-center gap-1.5 uppercase">
            <AlertCircle className="w-3.5 h-3.5 text-[#FF3000]" />
            <span>{startHint}</span>
          </div>
        )}
      </div>

      {/* Modal Menu Đổi Game Có Hình Ảnh */}
      <GameSelectMenuModal
        isOpen={isGameMenuOpen}
        onClose={() => setIsGameMenuOpen(false)}
        selectedGameId={room.selectedGameId}
        onSelectGame={(newGameId) => {
          setGame(newGameId);
        }}
        availableGames={availableGames}
      />
    </div>
  );
}

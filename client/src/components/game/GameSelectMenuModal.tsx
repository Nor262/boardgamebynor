'use client';

import React, { useState } from 'react';
import { GameMetadata } from '@boardgame/shared';
import { getGameDisplayInfo, GAME_CATALOG } from '@/constants/games';
import { X, Check, Users, Clock, Sparkles, AlertCircle, ArrowRight, LayoutGrid } from 'lucide-react';

interface GameSelectMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedGameId: string;
  onSelectGame: (gameId: string) => void;
  availableGames: GameMetadata[];
}

export function GameSelectMenuModal({
  isOpen,
  onClose,
  selectedGameId,
  onSelectGame,
  availableGames,
}: GameSelectMenuModalProps) {
  const [filter, setFilter] = useState<'all' | 'ready' | 'coming_soon'>('all');

  if (!isOpen) return null;

  // Hợp nhất danh sách từ server và catalog cố định
  const allIds = Array.from(
    new Set([
      ...availableGames.map((g) => g.id),
      ...Object.keys(GAME_CATALOG),
    ])
  );

  const gamesList = allIds.map((id) => {
    const serverMeta = availableGames.find((g) => g.id === id);
    return getGameDisplayInfo(id, serverMeta);
  });

  const filteredGames = gamesList.filter((game) => {
    if (filter === 'ready') return game.status === 'ready';
    if (filter === 'coming_soon') return game.status === 'coming_soon';
    return true;
  });

  const handleSelect = (gameId: string, isComingSoon: boolean) => {
    if (isComingSoon) {
      alert('Trò chơi này đang trong quá trình số hóa và sẽ sớm ra mắt!');
      return;
    }
    onSelectGame(gameId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-5xl max-h-[90vh] bg-white border-4 border-black flex flex-col shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b-4 border-black bg-[#F2F2F2] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-black text-white flex items-center justify-center flex-shrink-0">
              <LayoutGrid className="w-5 h-5 text-[#FF3000]" />
            </div>
            <div>
              <h2 className="font-mono font-black text-base sm:text-xl uppercase tracking-wider text-black">
                DANH MỤC TRÒ CHƠI BOARD GAME
              </h2>
              <p className="font-mono text-xs text-neutral-600 uppercase tracking-widest mt-0.5">
                CHỌN TRÒ CHƠI BẠN MUỐN TẠO PHÒNG HOẶC TRẢI NGHIỆM
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 border-2 border-black bg-white hover:bg-[#FF3000] hover:text-white transition-colors flex items-center justify-center font-mono font-black text-sm cursor-pointer"
            aria-label="Đóng menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="px-4 sm:px-6 py-3 border-b-2 border-black bg-white flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 font-mono font-black text-xs uppercase border-2 border-black transition-colors ${
                filter === 'all'
                  ? 'bg-black text-white'
                  : 'bg-white text-black hover:bg-neutral-100'
              }`}
            >
              TẤT CẢ GAME ({gamesList.length})
            </button>
            <button
              onClick={() => setFilter('ready')}
              className={`px-3 py-1.5 font-mono font-black text-xs uppercase border-2 border-black transition-colors ${
                filter === 'ready'
                  ? 'bg-[#FF3000] text-white'
                  : 'bg-white text-black hover:bg-neutral-100'
              }`}
            >
              SẴN SÀNG CHƠI ({gamesList.filter((g) => g.status === 'ready').length})
            </button>
            <button
              onClick={() => setFilter('coming_soon')}
              className={`px-3 py-1.5 font-mono font-black text-xs uppercase border-2 border-black transition-colors ${
                filter === 'coming_soon'
                  ? 'bg-black text-white'
                  : 'bg-white text-black hover:bg-neutral-100'
              }`}
            >
              SẮP RA MẮT ({gamesList.filter((g) => g.status === 'coming_soon').length})
            </button>
          </div>

          <span className="font-mono text-[11px] text-neutral-500 uppercase">
            BẤM VÀO THẺ GAME ĐỂ CHỌN NGAY
          </span>
        </div>

        {/* Games Grid Container */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-[#FAFAFA]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredGames.map((game) => {
              const isSelected = selectedGameId === game.id;
              const isReady = game.status === 'ready';

              return (
                <div
                  key={game.id}
                  onClick={() => handleSelect(game.id, !isReady)}
                  className={`border-4 bg-white p-4 sm:p-5 flex flex-col justify-between transition-all duration-150 cursor-pointer relative group ${
                    isSelected
                      ? 'border-[#FF3000] shadow-[4px_4px_0px_0px_#FF3000]'
                      : 'border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                  }`}
                >
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`font-mono font-black text-[10px] px-2 py-0.5 uppercase tracking-widest ${
                        isReady
                          ? 'bg-[#FF3000] text-white'
                          : 'bg-neutral-200 text-neutral-700'
                      }`}
                    >
                      {isReady ? 'SẴN SÀNG CHƠI' : 'SẮP RA MẮT'}
                    </span>

                    {isSelected && (
                      <span className="font-mono font-black text-[10px] bg-black text-white px-2 py-0.5 uppercase flex items-center gap-1">
                        <Check className="w-3 h-3 text-[#FF3000]" />
                        ĐANG CHỌN
                      </span>
                    )}
                  </div>

                  {/* Image & Main Info Layout */}
                  <div className="flex gap-4 items-start">
                    {/* Game Cover Art */}
                    <div className="w-28 sm:w-36 aspect-[3/4] border-2 border-black bg-neutral-900 flex-shrink-0 overflow-hidden relative">
                      <img
                        src={game.image}
                        alt={game.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          // Fallback to jaipur cover if image fails
                          (e.target as HTMLImageElement).src = '/assets/games/jaipur.jpg';
                        }}
                      />
                    </div>

                    {/* Meta info */}
                    <div className="flex-1 flex flex-col gap-2">
                      <div>
                        <h3 className="font-mono font-black text-sm sm:text-base uppercase tracking-tight text-black line-clamp-2">
                          {game.name}
                        </h3>
                        <p className="font-mono text-[11px] text-[#FF3000] font-bold uppercase tracking-wider mt-0.5 line-clamp-1">
                          {game.tagline}
                        </p>
                      </div>

                      {/* Specs */}
                      <div className="flex flex-wrap gap-2 text-[11px] font-mono font-black">
                        <span className="bg-[#F2F2F2] border border-black px-1.5 py-0.5 flex items-center gap-1 text-black">
                          <Users className="w-3 h-3 text-neutral-600" />
                          {game.minPlayers === game.maxPlayers
                            ? `${game.minPlayers} NGƯỜI`
                            : `${game.minPlayers} - ${game.maxPlayers} NGƯỜI`}
                        </span>
                        <span className="bg-[#F2F2F2] border border-black px-1.5 py-0.5 flex items-center gap-1 text-black">
                          <Clock className="w-3 h-3 text-neutral-600" />
                          {game.estimatedMinutes} PHÚT
                        </span>
                      </div>

                      {/* Short Description */}
                      <p className="text-xs text-neutral-700 font-sans line-clamp-3 leading-relaxed mt-1">
                        {game.description}
                      </p>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-neutral-200">
                    {game.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="font-mono text-[10px] bg-neutral-100 text-neutral-700 px-2 py-0.5 border border-neutral-300 uppercase"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Action Button */}
                  <div className="mt-4 pt-3 border-t-2 border-black flex items-center justify-between">
                    <span className="font-mono text-[11px] font-bold text-neutral-500 uppercase">
                      {isSelected ? 'ĐÃ ĐƯỢC CHỌN' : isReady ? 'NHẤP ĐỂ CHỌN' : 'CHƯA KHẢ DỤNG'}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelect(game.id, !isReady);
                      }}
                      className={`px-4 py-2 font-mono font-black text-xs uppercase border-2 border-black transition-colors flex items-center gap-2 cursor-pointer ${
                        isSelected
                          ? 'bg-black text-white cursor-default'
                          : isReady
                          ? 'bg-[#FF3000] text-white hover:bg-black'
                          : 'bg-neutral-200 text-neutral-500 cursor-not-allowed'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#FF3000]" />
                          <span>ĐANG CHỌN</span>
                        </>
                      ) : isReady ? (
                        <>
                          <span>CHỌN GAME NÀY</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      ) : (
                        <span>SẮP RA MẮT</span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t-4 border-black bg-white flex items-center justify-between flex-shrink-0">
          <div className="font-mono text-xs text-neutral-600 uppercase">
            HỆ THỐNG BOARD GAME HUB ONLINE
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-black hover:bg-[#FF3000] text-white font-mono font-black text-xs uppercase tracking-wider border-2 border-black transition-colors cursor-pointer"
          >
            ĐÓNG MENU
          </button>
        </div>
      </div>
    </div>
  );
}

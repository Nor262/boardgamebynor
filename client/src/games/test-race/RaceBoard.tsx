'use client';

import React, { useEffect } from 'react';
import { useRoomStore } from '@/stores/room-store';
import { Avatar } from '@/components/common/Avatar';
import confetti from 'canvas-confetti';
import {
  Dice5,
  Trophy,
  RotateCcw,
  Sparkles,
  Zap,
  Shield,
  Rocket,
  ArrowRight,
  Flame,
  AlertTriangle,
  Gift,
} from 'lucide-react';

export function RaceBoard() {
  const { room, me, sendGameAction, returnToLobby } = useRoomStore();

  const gameData = room?.gameData;
  const isHost = me?.isHost;

  useEffect(() => {
    if (gameData?.winnerId) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [gameData?.winnerId]);

  if (!room || !me || !gameData) return null;

  const currentTurnPlayerId = gameData.turnOrder[gameData.currentTurnIndex];
  const isMyTurn = currentTurnPlayerId === me.id;
  const currentTurnPlayer = gameData.players[currentTurnPlayerId];
  const myRaceState = gameData.players[me.id];

  const handleRollDice = () => {
    if (!isMyTurn || gameData.hasRolledThisTurn) return;
    sendGameAction({ type: 'ROLL_DICE' });
  };

  const handleUseCard = (cardId: string) => {
    if (!isMyTurn) return;
    sendGameAction({ type: 'USE_CARD', cardId });
  };

  const handleEndTurn = () => {
    if (!isMyTurn || !gameData.hasRolledThisTurn) return;
    sendGameAction({ type: 'END_TURN' });
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto">
      {/* Top Banner: Lượt đi & Xúc xắc */}
      <div className="glass-card rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 border border-border shadow-xl">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg transition-all ${
              isMyTurn
                ? 'bg-gradient-to-tr from-brand-500 to-pink-500 text-white shadow-brand-500/40 animate-pulse-glow'
                : 'bg-surface-raised border border-border text-slate-300'
            }`}
          >
            {isMyTurn ? '👉' : '⏳'}
          </div>
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              {isMyTurn ? 'Đang tới lượt của bạn!' : 'Đang chờ nước đi...'}
            </div>
            <div className="text-lg sm:text-xl font-extrabold text-white flex items-center gap-2">
              <span>{currentTurnPlayer?.nickname || 'Người chơi'}</span>
              {currentTurnPlayer?.hasShield && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  <Shield className="w-3 h-3" /> Có Khiên
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Hiển thị xúc xắc vừa đổ */}
        <div className="flex items-center gap-3 bg-surface-raised px-4 py-2.5 rounded-2xl border border-border">
          <div className="text-right">
            <div className="text-[10px] text-slate-400 font-semibold">KẾT QUẢ ĐỔ</div>
            <div className="text-xs text-slate-300 font-bold">
              {gameData.lastDiceRoll ? `${gameData.lastDiceRoll.value} nút` : 'Chưa đổ'}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-2xl font-black shadow-md">
            {gameData.lastDiceRoll ? gameData.lastDiceRoll.value : <Dice5 className="w-5 h-5" />}
          </div>
        </div>
      </div>

      {/* Racetrack Bàn Cờ 20 Ô */}
      <div className="glass-card rounded-2xl p-5 shadow-2xl border border-border">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-extrabold text-white flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-400" />
            Đường Đua Thần Tốc (20 Ô)
          </span>
          <span className="text-xs text-slate-400">Cán mốc Ô 19 để chiến thắng</span>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-10 gap-2 sm:gap-2.5">
          {gameData.tiles.map((tile: any) => {
            // Tìm những người chơi đang đứng ở ô này
            const playersOnTile = Object.values(gameData.players).filter(
              (p: any) => p.position === tile.index
            );

            let tileBg = 'bg-surface-raised/70 border-border/70 text-slate-300';
            let tileIcon = null;

            if (tile.type === 'START') {
              tileBg = 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300';
              tileIcon = '🚩';
            } else if (tile.type === 'GOAL') {
              tileBg = 'bg-amber-950/50 border-amber-500/60 text-amber-300 shadow-lg shadow-amber-500/20';
              tileIcon = '🏆';
            } else if (tile.type === 'BOOST') {
              tileBg = 'bg-purple-950/40 border-purple-500/50 text-purple-300';
              tileIcon = <Rocket className="w-3.5 h-3.5 text-purple-400 inline" />;
            } else if (tile.type === 'TRAP') {
              tileBg = 'bg-rose-950/40 border-rose-500/50 text-rose-300';
              tileIcon = <AlertTriangle className="w-3.5 h-3.5 text-rose-400 inline" />;
            } else if (tile.type === 'LUCKY') {
              tileBg = 'bg-sky-950/40 border-sky-500/50 text-sky-300';
              tileIcon = <Gift className="w-3.5 h-3.5 text-sky-400 inline" />;
            }

            return (
              <div
                key={tile.index}
                className={`relative min-h-[85px] sm:min-h-[95px] p-2 rounded-xl border flex flex-col justify-between transition-all ${tileBg}`}
              >
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span>{tile.index}</span>
                  <span>{tileIcon}</span>
                </div>

                <div className="text-[10px] text-center font-medium leading-tight opacity-75">
                  {tile.type === 'NORMAL' ? '' : tile.label}
                </div>

                {/* Danh sách người chơi trên ô */}
                <div className="flex flex-wrap gap-1 items-center justify-center mt-1">
                  {playersOnTile.map((p: any) => (
                    <div
                      key={p.playerId}
                      className="relative group cursor-pointer"
                      title={`${p.nickname} (Ô ${p.position})`}
                    >
                      <Avatar
                        seed={p.playerId}
                        name={p.nickname}
                        size="sm"
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bảng Điều Khiển Nước Đi & Thẻ Bài Bí Mật (Anti-Cheat Hand) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Khối Thao Tác (Đổ Xúc Xắc / Hết Lượt) */}
        <div className="glass-card rounded-2xl p-5 border border-border flex flex-col justify-between gap-4">
          <div className="text-sm font-extrabold text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-brand-400" />
            Hành Động Của Bạn
          </div>

          <div className="flex flex-col gap-2.5">
            <button
              onClick={handleRollDice}
              disabled={!isMyTurn || gameData.hasRolledThisTurn}
              className={`w-full py-3.5 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
                isMyTurn && !gameData.hasRolledThisTurn
                  ? 'bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white shadow-brand-500/30 cursor-pointer active:scale-95'
                  : 'bg-slate-800 text-slate-500 border border-slate-700/50 cursor-not-allowed'
              }`}
            >
              <Dice5 className="w-5 h-5" />
              <span>ĐỔ XÚC XẮC</span>
            </button>

            <button
              onClick={handleEndTurn}
              disabled={!isMyTurn || !gameData.hasRolledThisTurn}
              className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                isMyTurn && gameData.hasRolledThisTurn
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30 cursor-pointer active:scale-95'
                  : 'bg-surface-raised text-slate-600 border border-border cursor-not-allowed'
              }`}
            >
              <span>KẾT THÚC LƯỢT</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="text-[11px] text-slate-400 text-center">
            Vị trí của bạn: <strong className="text-white">Ô {myRaceState?.position || 0}</strong>
          </div>
        </div>

        {/* Khối Thẻ Bài Bí Mật Trên Tay (Chỉ Mình Thấy!) */}
        <div className="md:col-span-2 glass-card rounded-2xl p-5 border border-border flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-extrabold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Thẻ Bài Bí Mật Của Bạn ({myRaceState?.hand ? myRaceState.hand.length : 0})
            </div>
            <span className="text-[11px] text-emerald-400 font-semibold">
              🔒 Được mã hóa riêng (Đối thủ không thấy)
            </span>
          </div>

          {myRaceState?.hand && myRaceState.hand.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {myRaceState.hand.map((card: any) => (
                <div
                  key={card.id}
                  className="p-3 rounded-xl bg-surface-raised border border-border/80 flex items-center justify-between gap-2 shadow-sm"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-100">{card.name}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{card.description}</div>
                  </div>
                  {isMyTurn && (
                    <button
                      onClick={() => handleUseCard(card.id)}
                      className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] flex-shrink-0 transition-all shadow-sm active:scale-95"
                    >
                      Dùng
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="h-24 flex items-center justify-center rounded-xl bg-surface-raised/40 border border-dashed border-border text-slate-500 text-xs italic">
              Bạn chưa có thẻ bài nào. Hãy giẫm vào ô Hộp Bí Mật để nhận thẻ!
            </div>
          )}

          {/* Hiển thị số lượng thẻ ẩn của đối thủ */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-border/40 text-[11px] text-slate-400">
            {Object.values(gameData.players)
              .filter((p: any) => p.playerId !== me.id)
              .map((p: any) => (
                <span
                  key={p.playerId}
                  className="px-2 py-0.5 rounded-full bg-surface-raised border border-border"
                >
                  {p.nickname}: <strong>{p.cardCount || 0}</strong> thẻ ẩn
                </span>
              ))}
          </div>
        </div>
      </div>

      {/* Modal Chiến Thắng (Game Over) */}
      {gameData.winnerId && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full rounded-3xl p-6 text-center border border-amber-500/40 shadow-2xl shadow-amber-500/20 flex flex-col items-center gap-4 animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-500 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/40">
              🏆
            </div>

            <div>
              <h2 className="text-2xl font-black text-white">TRẬN ĐẤU KẾT THÚC!</h2>
              <p className="text-sm text-amber-300 font-bold mt-1">
                {gameData.players[gameData.winnerId]?.nickname} đã về đích đầu tiên!
              </p>
            </div>

            <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
              Ván cờ mẫu đã hoàn tất. Bạn có thể quay về sảnh chờ để bắt đầu ván mới hoặc thử nghiệm các tính năng khác.
            </p>

            {isHost ? (
              <button
                onClick={returnToLobby}
                className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-brand-600/40 transition-all active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                <span>QUAY VỀ SẢNH CHỜ (LOBBY)</span>
              </button>
            ) : (
              <div className="text-xs text-slate-400 italic">
                Đang chờ Chủ phòng đưa mọi người về lại Sảnh chờ...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

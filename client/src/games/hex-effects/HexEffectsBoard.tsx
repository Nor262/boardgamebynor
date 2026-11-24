'use client';

import React, { useState } from 'react';
import { useRoomStore } from '@/stores/room-store';
import { HexEffectsGameState, HexCard, PlayerHexState } from './types';
import { HEX_THEMES, getPlayerActiveDebuffs, ActiveGameplayDebuff } from './cardThemes';
import { HexCardView } from './components/HexCardView';
import { ShadowSlotView } from './components/ShadowSlotView';
import { HexEffectOverlayModal } from './components/HexEffectOverlayModal';
import {
  Skull,
  FlaskConical,
  Sparkles,
  Layers,
  ArrowRight,
  RefreshCw,
  Trophy,
  History,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Zap,
} from 'lucide-react';

function ActiveDebuffsList({
  debuffs,
  onInspect,
  tooltipPlacement = 'top',
  align = 'center',
}: {
  debuffs: ActiveGameplayDebuff[];
  onInspect: (debuff: ActiveGameplayDebuff) => void;
  tooltipPlacement?: 'top' | 'bottom';
  align?: 'left' | 'right' | 'center';
}) {
  if (debuffs.length === 0) {
    return (
      <div className="flex items-center gap-1 px-1.5 py-0.5 rounded border border-emerald-500/40 bg-emerald-950/40 text-emerald-300 font-mono text-[7.5px] sm:text-[8px] shadow-xs">
        <span>🛡️</span>
        <span className="font-semibold">Trạng thái: Ổn định (Không dính hiệu ứng)</span>
      </div>
    );
  }

  const alignClass =
    align === 'left'
      ? 'left-0'
      : align === 'right'
      ? 'right-0'
      : 'left-1/2 -translate-x-1/2';

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="font-mono text-[7.5px] sm:text-[8px] font-black text-rose-300 uppercase flex items-center gap-1">
        <AlertTriangle className="w-2.5 h-2.5 text-rose-400 flex-shrink-0" />
        <span>HIỆU ỨNG ĐANG DÍNH:</span>
      </span>
      {debuffs.map((debuff) => (
        <div key={debuff.id} className="relative group inline-block">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onInspect(debuff);
            }}
            className={`font-mono font-black text-[7px] sm:text-[8px] px-1.5 py-0.5 rounded border uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-transform hover:scale-105 ${debuff.badgeStyle}`}
            title="Nhấp chuột để xem chi tiết hiệu ứng"
          >
            <span>{debuff.emoji}</span>
            <span>{debuff.shortTag}</span>
          </button>

          {/* Alchemical Popover Tooltip */}
          <div
            className={`absolute ${
              tooltipPlacement === 'bottom'
                ? 'top-[calc(100%+6px)]'
                : 'bottom-[calc(100%+6px)]'
            } ${alignClass} w-64 p-2.5 rounded-lg border-2 bg-gradient-to-b from-[#1c120c] via-[#120c08] to-[#080503] text-neutral-100 shadow-[0_12px_32px_rgba(0,0,0,0.95)] z-50 pointer-events-none opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-200 backdrop-blur-md flex flex-col gap-1 border-rose-500/80`}
          >
            <div className="flex items-center justify-between border-b border-white/15 pb-1 gap-1">
              <span className="font-mono font-black text-[9.5px] text-amber-200 uppercase flex items-center gap-1 truncate">
                <span>{debuff.emoji}</span>
                <span className="truncate">{debuff.name}</span>
              </span>
              <span className="text-[6.5px] font-mono px-1 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-500/60 font-bold uppercase flex-shrink-0">
                {debuff.shortTag}
              </span>
            </div>
            <div className="bg-black/60 border border-white/10 rounded p-1.5 flex flex-col gap-0.5">
              <span className="text-[7.5px] font-mono font-bold text-rose-300 uppercase">
                QUY TẮC HIỆU LỰC:
              </span>
              <p className="text-[8.5px] font-sans text-neutral-100 leading-snug">
                {debuff.gameplayRule}
              </p>
            </div>
            <div className="flex items-center justify-between text-[7.5px] font-mono text-neutral-400 pt-0.5 border-t border-white/10">
              <span className="truncate max-w-[150px]">{debuff.resolution}</span>
              <span className="text-amber-400 font-bold uppercase">CHI TIẾT ›</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function HexEffectsBoard() {
  const { room, me, sendGameAction } = useRoomStore();
  const gameState = room?.gameData as HexEffectsGameState | undefined;

  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [discardSelection, setDiscardSelection] = useState<string[]>([]);
  const [isDiscardMode, setIsDiscardMode] = useState(false);
  const [spellTargetPlayerId, setSpellTargetPlayerId] = useState<string | null>(null);

  // Overlay state
  const [dismissedEventId, setDismissedEventId] = useState<string | null>(null);
  const [inspectedCard, setInspectedCard] = useState<HexCard | null>(null);
  const [inspectedDebuff, setInspectedDebuff] = useState<ActiveGameplayDebuff | null>(null);

  if (!gameState || !room) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-neutral-400 font-mono text-sm">
        Đang đồng bộ bàn cờ Hex Effects...
      </div>
    );
  }

  const allPlayers = Object.values(gameState.players || {});
  const myState: PlayerHexState =
    gameState.players[me?.id || ''] || allPlayers[0] || {
      playerId: 'spectator',
      nickname: 'Khán giả',
      avatarSeed: 'seed',
      isHost: false,
      isReady: true,
      hand: [],
      shadow: [],
    };

  const isMyTurn = gameState.currentTurnPlayerId === me?.id;
  const isSpectator = !me?.id || !gameState.players[me.id];
  const opponents = allPlayers.filter((p) => p.playerId !== myState.playerId);
  const selectedCard = myState.hand.find((c) => c.id === selectedCardId) || null;

  // Derive active cinematic event to show overlay
  const activeEvent =
    gameState.recentEvent && gameState.recentEvent.id !== dismissedEventId
      ? gameState.recentEvent
      : null;

  // Actions
  const handleTreat = (slotIndex: number) => {
    if (!selectedCard || !isMyTurn) return;
    sendGameAction({
      type: 'TREAT_HEX',
      slotIndex,
      cardId: selectedCard.id,
    });
    setSelectedCardId(null);
  };

  const handleInflict = (targetPlayerId: string, targetSlotIndex: number) => {
    if (!selectedCard || !isMyTurn) return;
    sendGameAction({
      type: 'INFLICT_HEX',
      targetPlayerId,
      targetSlotIndex,
      cardId: selectedCard.id,
    });
    setSelectedCardId(null);
  };

  const handlePlaySpell = (targetPlayerId?: string) => {
    if (!selectedCard || !isMyTurn) return;
    sendGameAction({
      type: 'PLAY_SPELL',
      cardId: selectedCard.id,
      targetPlayerId: targetPlayerId || spellTargetPlayerId || undefined,
    });
    setSelectedCardId(null);
    setSpellTargetPlayerId(null);
  };

  const handlePlayDeusMachina = (targetPlayerId: string, targetSlotIndex: number) => {
    if (!selectedCard || !isMyTurn) return;
    sendGameAction({
      type: 'PLAY_SPELL',
      cardId: selectedCard.id,
      targetPlayerId,
      targetSlotIndex,
    });
    setSelectedCardId(null);
  };

  const handleEndTurn = () => {
    if (!isMyTurn) return;
    sendGameAction({
      type: 'END_TURN',
    });
    setSelectedCardId(null);
    setIsDiscardMode(false);
    setDiscardSelection([]);
  };

  const handleExecuteDiscard = () => {
    if (!isMyTurn || discardSelection.length === 0) return;
    sendGameAction({
      type: 'DISCARD_AND_DRAW',
      cardIds: discardSelection,
    });
    setDiscardSelection([]);
    setIsDiscardMode(false);
  };

  const toggleDiscardCard = (cardId: string) => {
    if (discardSelection.includes(cardId)) {
      setDiscardSelection(discardSelection.filter((id) => id !== cardId));
    } else {
      setDiscardSelection([...discardSelection, cardId]);
    }
  };

  const myTreatedCount = myState.shadow.filter((s) => s.treatedBy !== null).length;

  return (
    <div className="flex-1 w-full h-full flex flex-col justify-between p-2 sm:p-2.5 text-white select-none max-w-7xl mx-auto gap-2 overflow-hidden bg-[radial-gradient(ellipse_at_center,_#1c140e_0%,_#110b07_55%,_#060403_100%)] border border-amber-900/40 rounded-xl relative shadow-2xl">
      {/* Alchemical Transmutation Sigil Watermark Backdrop */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5 overflow-hidden">
        <svg viewBox="0 0 400 400" className="w-[580px] h-[580px] stroke-amber-400 fill-none stroke-[1.5]">
          <circle cx="200" cy="200" r="180" />
          <circle cx="200" cy="200" r="140" strokeDasharray="6 6" />
          <polygon points="200,20 355,290 45,290" />
          <polygon points="200,380 45,110 355,110" />
          <circle cx="200" cy="200" r="70" />
          <circle cx="200" cy="200" r="30" strokeDasharray="3 3" />
        </svg>
      </div>

      {/* Cinematic Card Overlay Modal for recent events or card/debuff inspection */}
      <HexEffectOverlayModal
        event={activeEvent}
        inspectCard={inspectedCard}
        inspectDebuff={inspectedDebuff}
        onClose={() => {
          if (activeEvent) {
            setDismissedEventId(activeEvent.id);
          }
          setInspectedCard(null);
          setInspectedDebuff(null);
        }}
      />

      {/* 1. Header & Status Bar: Antique Brass Alchemical Plaque */}
      <div className="relative z-10 rounded-lg border border-amber-600/50 bg-gradient-to-r from-[#1c130b] via-[#2c1d10] to-[#1c130b] px-3 py-1.5 flex items-center justify-between gap-3 shadow-lg flex-shrink-0">
        {/* Brass Filigree Corners */}
        <div className="absolute top-0.5 left-0.5 w-2 h-2 border-t-2 border-l-2 border-amber-400/60 pointer-events-none" />
        <div className="absolute top-0.5 right-0.5 w-2 h-2 border-t-2 border-r-2 border-amber-400/60 pointer-events-none" />
        <div className="absolute bottom-0.5 left-0.5 w-2 h-2 border-b-2 border-l-2 border-amber-400/60 pointer-events-none" />
        <div className="absolute bottom-0.5 right-0.5 w-2 h-2 border-b-2 border-r-2 border-amber-400/60 pointer-events-none" />

        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-sm bg-gradient-to-b from-[#2a1b0e] to-[#100a05] border border-amber-400/80 flex items-center justify-center flex-shrink-0 shadow-inner">
            <FlaskConical className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif font-black text-xs sm:text-sm text-amber-100 uppercase tracking-widest flex items-center gap-1.5">
              <span>HEX EFFECTS</span>
              <span className="text-[10px] text-amber-500 font-normal hidden md:inline">❖ DƯỢC PHÒNG TRUNG CỔ</span>
            </h2>
            <span className="text-[9px] bg-amber-950/80 text-amber-300 border border-amber-500/50 px-1.5 py-0.2 rounded-xs uppercase font-mono font-bold">
              VÒNG {gameState.turnCount}
            </span>
            <span className="hidden lg:inline text-[9.5px] text-amber-200/70 font-serif italic">
              • Giải 4 lời nguyền để hoàn thành Đại Nghi Thức
            </span>
          </div>
        </div>

        {/* Turn Status & Philosopher Stone Action Gems */}
        <div className="flex items-center gap-2.5">
          {/* Action Crystals Indicator */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/70 border border-amber-600/40">
            <span className="font-mono font-bold text-[9px] text-amber-300 uppercase hidden sm:inline">
              HÀNH ĐỘNG:
            </span>
            <div className="flex items-center gap-1">
              {[1, 2].map((actIndex) => {
                const isAvailable = isMyTurn && actIndex <= gameState.actionsLeft;
                return (
                  <div
                    key={actIndex}
                    title={isAvailable ? 'Hành động khả dụng' : 'Đã sử dụng'}
                    className={`w-3.5 h-3.5 rounded-full flex items-center justify-center font-mono font-black text-[8px] border transition-all duration-300 ${
                      isAvailable
                        ? 'bg-amber-400 text-black border-yellow-200 shadow-[0_0_10px_rgba(251,191,36,0.9)] animate-pulse scale-105'
                        : 'bg-neutral-900 text-neutral-600 border-neutral-800'
                    }`}
                  >
                    {actIndex}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Turn Badge */}
          <div
            className={`px-2.5 py-1 rounded border font-mono font-black text-[10px] uppercase flex items-center gap-1.5 ${
              isMyTurn
                ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.3)] animate-pulse'
                : 'bg-neutral-900/90 text-neutral-400 border-neutral-700'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-current"></span>
            <span>
              {isMyTurn
                ? 'LƯỢT CỦA BẠN'
                : `LƯỢT: ${
                    gameState.players[gameState.currentTurnPlayerId]?.nickname || 'ĐỐI THỦ'
                  }`}
            </span>
          </div>

          {/* Wax Seal End Turn Button */}
          {isMyTurn && (
            <button
              onClick={handleEndTurn}
              className="px-3 py-1 bg-gradient-to-b from-rose-900 to-rose-950 hover:from-rose-800 hover:to-rose-900 text-rose-100 font-mono font-black text-[10px] uppercase rounded border border-rose-500/80 shadow-[0_0_10px_rgba(225,29,72,0.35)] transition-all cursor-pointer hover:scale-102 active:scale-95"
            >
              HẾT LƯỢT
            </button>
          )}
        </div>
      </div>

      {/* Winner Fanfare Banner (If match finished) */}
      {gameState.winnerId && (
        <div className="rounded-lg border-2 border-amber-400 bg-gradient-to-r from-amber-950 via-yellow-950 to-amber-950 p-3 flex items-center justify-center text-center gap-3 shadow-xl animate-in zoom-in-95 flex-shrink-0">
          <Trophy className="w-7 h-7 text-amber-400 flex-shrink-0" />
          <div>
            <h3 className="font-mono font-black text-sm text-amber-300 uppercase tracking-widest">
              CHIẾN THẮNG CHUNG CUỘC!
            </h3>
            <p className="font-mono text-xs text-amber-100">
              {gameState.winnerSummary}
            </p>
          </div>
        </div>
      )}

      {/* 2. Opponents' Realm (Alchemical Opponent Mats) */}
      <div className="flex flex-col gap-1 flex-shrink-0">
        <div className="flex items-center justify-between text-[10px] font-mono font-black text-amber-200/80 uppercase tracking-wider px-1">
          <span className="flex items-center gap-1.5 text-rose-400">
            <Skull className="w-3.5 h-3.5" />
            <span>VÙNG BÓNG TỐI ĐỐI THỦ ({opponents.length} NHÀ GIẢ KIM)</span>
          </span>
          <span className="text-[9px] text-amber-500/70 font-serif italic hidden sm:inline">
            ❖ Nhấp vào ô đối thủ để gieo lời nguyền hoặc phá hủy thuốc giải
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
          {opponents.map((opp) => {
            const oppTreatedCount = opp.shadow.filter((s) => s.treatedBy !== null).length;
            const isOppTurn = gameState.currentTurnPlayerId === opp.playerId;
            const oppDebuffs = getPlayerActiveDebuffs(opp, gameState.recentEvent, opp.nickname);

            return (
              <div
                key={opp.playerId}
                className={`rounded-lg border p-2 flex items-center justify-between gap-3 transition-all ${
                  isOppTurn
                    ? 'border-amber-400 bg-gradient-to-r from-[#2a1a0e] via-[#1a1109] to-[#120b06] shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                    : 'border-amber-900/40 bg-gradient-to-r from-[#17100b] via-[#100b07] to-[#0a0704]'
                }`}
              >
                {/* Opponent Profile & Progress */}
                <div className="flex flex-col gap-1 min-w-[125px] max-w-[145px] flex-shrink-0">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-b from-amber-700 to-amber-950 border border-amber-400/70 flex items-center justify-center font-mono font-black text-[10px] text-amber-100 flex-shrink-0 shadow">
                      {opp.nickname.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="truncate">
                      <div className="font-serif font-black text-xs text-amber-100 uppercase truncate">
                        {opp.nickname}
                      </div>
                      <div className="text-[9px] text-amber-400/70 font-mono">
                        Bài: {opp.hand.length} lá
                      </div>
                    </div>
                  </div>

                  <span className="font-mono font-black text-[9.5px] text-emerald-300 bg-emerald-950/80 border border-emerald-600/70 px-1.5 py-0.5 rounded text-center shadow-xs">
                    ĐÃ CHỮA: {oppTreatedCount} / {opp.shadow.length}
                  </span>

                  {/* Opponent Active Status Debuffs */}
                  <div className="mt-0.5">
                    <ActiveDebuffsList
                      debuffs={oppDebuffs}
                      onInspect={(d) => setInspectedDebuff(d)}
                      tooltipPlacement="bottom"
                      align="left"
                    />
                  </div>

                  {/* Spell Target Actions on Opponent Profile */}
                  {isMyTurn && selectedCard && (
                    <>
                      {selectedCard.spellEffect === 'JINX_SILENCE' && (
                        <button
                          type="button"
                          onClick={() => handlePlaySpell(opp.playerId)}
                          className="mt-0.5 px-1.5 py-1 bg-purple-600 hover:bg-purple-500 text-white font-mono font-black text-[8px] uppercase rounded flex items-center justify-center gap-1 shadow animate-pulse cursor-pointer"
                        >
                          <Skull className="w-2.5 h-2.5 text-purple-200" />
                          <span>YỂM JINX!</span>
                        </button>
                      )}

                      {selectedCard.spellEffect === 'STEAL_CARD' && (
                        <button
                          type="button"
                          onClick={() => handlePlaySpell(opp.playerId)}
                          disabled={opp.hand.length === 0}
                          className="mt-0.5 px-1.5 py-1 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-mono font-black text-[8px] uppercase rounded flex items-center justify-center gap-1 shadow animate-pulse cursor-pointer"
                        >
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>TRỘM BÀI</span>
                        </button>
                      )}

                      {selectedCard.spellEffect === 'SWAP_HEX' && (
                        <button
                          type="button"
                          onClick={() => handlePlaySpell(opp.playerId)}
                          className="mt-0.5 px-1.5 py-1 bg-amber-600 hover:bg-amber-500 text-white font-mono font-black text-[8px] uppercase rounded flex items-center justify-center gap-1 shadow animate-pulse cursor-pointer"
                        >
                          <RefreshCw className="w-2.5 h-2.5" />
                          <span>HOÁN ĐỔI</span>
                        </button>
                      )}

                      {selectedCard.spellEffect === 'CORRUPT_SHADOW' && oppTreatedCount > 0 && (
                        <button
                          type="button"
                          onClick={() => handlePlaySpell(opp.playerId)}
                          className="mt-0.5 px-1.5 py-1 bg-rose-600 hover:bg-rose-500 text-white font-mono font-black text-[8px] uppercase rounded flex items-center justify-center gap-1 shadow animate-pulse cursor-pointer"
                        >
                          <Flame className="w-2.5 h-2.5" />
                          <span>HỦY THUỐC</span>
                        </button>
                      )}
                    </>
                  )}
                </div>

                {/* 4 Shadow Slots in compact row */}
                <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                  {opp.shadow.map((slot, sIdx) => {
                    const isDeusMachina = selectedCard?.spellEffect === 'DEUS_HEX_MACHINA';
                    const isDisasterTarget = selectedCard?.category === 'DISASTER' && slot.treatedBy === null;
                    const oppAlreadyHasHex =
                      selectedCard?.category === 'HEX' &&
                      opp.shadow.some((s) => s.hex.hexType === selectedCard.hexType);
                    const canInflictWithSelected =
                      (selectedCard &&
                        selectedCard.category === 'HEX' &&
                        !oppAlreadyHasHex &&
                        slot.treatedBy &&
                        slot.treatedBy.sideEffects?.includes(selectedCard.hexType!)) ||
                      isDeusMachina ||
                      isDisasterTarget;

                    return (
                      <div key={slot.slotId} className="flex flex-col items-center">
                        <ShadowSlotView
                          slot={slot}
                          slotIndex={sIdx}
                          isMySlot={false}
                          size="sm"
                          canInflictWithCard={canInflictWithSelected ? selectedCard : null}
                          onInflict={() => {
                            if (isDisasterTarget && selectedCard) {
                              sendGameAction({
                                type: 'DISASTER_TARGET',
                                targetPlayerId: opp.playerId,
                                targetSlotIndex: sIdx,
                                cardId: selectedCard.id,
                              });
                              setSelectedCardId(null);
                            } else if (isDeusMachina) {
                              handlePlayDeusMachina(opp.playerId, sIdx);
                            } else {
                              handleInflict(opp.playerId, sIdx);
                            }
                          }}
                          onInspectCard={(card) => setInspectedCard(card)}
                        />
                        {/* Slot condition indicator */}
                        <div className="mt-0.5 flex flex-col items-center">
                          <span
                            className={`text-[6px] font-mono font-bold px-1 py-0.2 rounded border uppercase ${
                              slot.treatedBy
                                ? 'bg-emerald-950 text-emerald-300 border-emerald-600/70'
                                : 'bg-rose-950 text-rose-300 border-rose-600/70'
                            }`}
                          >
                            {slot.treatedBy ? 'GIẢI' : 'NGUYỀN'}
                          </span>
                          {slot.treatedBy && slot.treatedBy.sideEffects && slot.treatedBy.sideEffects.length > 0 && (
                            <span
                              className="text-[5.5px] font-mono text-amber-300/80 truncate max-w-[65px]"
                              title={`Di chứng dược liệu: ${slot.treatedBy.sideEffects.join(', ')}`}
                            >
                              Di chứng: {slot.treatedBy.sideEffects.map((e) => `+${e.substring(0, 3)}`).join(' ')}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Middle Shared Arena: Decks + Real-time Logs (Alchemical Chronicle Table) */}
      <div className="rounded-lg border border-amber-900/50 bg-gradient-to-r from-[#17100b] via-[#120c08] to-[#17100b] p-2 flex items-center justify-between gap-3 flex-shrink-0 shadow-md">
        {/* Decks Area: 3D Stacked Playing Card Decks in strict 2:3 ratio */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          {/* Draw Deck with physical stacked illusion */}
          <div className="flex items-center gap-2">
            <div
              className="w-[76px] min-w-[76px] max-w-[76px] h-[114px] min-h-[114px] max-h-[114px] rounded border-2 border-amber-500/80 bg-gradient-to-b from-[#2d1c0e] via-[#1a1007] to-[#0c0703] flex flex-col items-center justify-center p-1 shadow-[2px_2px_0px_#78350f,4px_4px_0px_#451a03] relative select-none group cursor-help"
              title={`${gameState.deck.length} lá bài còn lại trong Chồng Rút`}
            >
              {/* Corner Inlays */}
              <div className="absolute top-0.5 left-0.5 w-1.5 h-1.5 border-t border-l border-amber-400/50 pointer-events-none" />
              <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 border-t border-r border-amber-400/50 pointer-events-none" />
              <div className="absolute bottom-0.5 left-0.5 w-1.5 h-1.5 border-b border-l border-amber-400/50 pointer-events-none" />
              <div className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 border-b border-r border-amber-400/50 pointer-events-none" />

              <Layers className="w-5 h-5 text-amber-400 mb-1 group-hover:scale-110 transition-transform" />
              <span className="font-mono font-black text-xs text-amber-200">
                {gameState.deck.length} LÁ
              </span>
              <span className="font-mono text-[7px] text-amber-400/90 uppercase tracking-tight mt-0.5">CHỒNG RÚT</span>
            </div>
          </div>

          {/* Discard Pile / Ash Crucible */}
          <div className="flex items-center gap-2">
            <div
              className="w-[76px] min-w-[76px] max-w-[76px] h-[114px] min-h-[114px] max-h-[114px] rounded border border-neutral-700/80 bg-gradient-to-b from-[#18181b] to-[#09090b] flex flex-col items-center justify-center p-1 relative select-none shadow-inner"
              title={`${gameState.discardPile.length} lá trong Mộ Bài`}
            >
              {/* Corner Inlays */}
              <div className="absolute top-0.5 left-0.5 w-1.5 h-1.5 border-t border-l border-neutral-600/50 pointer-events-none" />
              <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 border-t border-r border-neutral-600/50 pointer-events-none" />
              <div className="absolute bottom-0.5 left-0.5 w-1.5 h-1.5 border-b border-l border-neutral-600/50 pointer-events-none" />
              <div className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 border-b border-r border-neutral-600/50 pointer-events-none" />

              {gameState.discardPile.length > 0 ? (
                <>
                  <Skull className="w-5 h-5 text-rose-400 mb-1" />
                  <span className="font-mono font-black text-xs text-neutral-200">
                    {gameState.discardPile.length} LÁ
                  </span>
                  <span className="font-mono text-[7px] text-neutral-400 uppercase tracking-tight mt-0.5">MỘ BÀI</span>
                </>
              ) : (
                <div className="flex flex-col items-center text-center">
                  <Skull className="w-4 h-4 text-neutral-600 mb-1 opacity-50" />
                  <span className="text-[7.5px] font-mono text-neutral-500 uppercase tracking-tighter">Mộ trống</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Real-time Game Log: Grimoire Parchment Chronicle */}
        <div className="flex-1 flex flex-col justify-center min-w-0 border-l border-amber-700/30 pl-3">
          <div className="flex items-center justify-between text-[9px] font-mono text-amber-400/80 uppercase pb-0.5">
            <span className="flex items-center gap-1.5 text-amber-300 font-bold">
              <History className="w-3 h-3 text-amber-400" />
              <span>DƯỢC ĐIỂN HOÀNG GIA</span>
            </span>
            <span className="text-amber-500/60 font-serif italic">Biên Niên Sử Giả Kim</span>
          </div>

          <div className="flex flex-col gap-0.5 max-h-14 overflow-y-auto pr-1 font-serif text-[10.5px] text-amber-100/90 italic">
            {gameState.gameLogs.slice(-2).map((log, idx) => (
              <div key={idx} className="truncate">
                <span className="text-amber-400 mr-1 not-italic font-bold">›</span>
                <span>{log}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Spell Target Chooser Modal (If a spell is selected) */}
        {selectedCard && (selectedCard.category === 'SPELL' || selectedCard.category === 'DISASTER') && (
          <div className="flex items-center gap-1.5 p-1.5 rounded border border-amber-500/80 bg-gradient-to-r from-amber-950 via-yellow-950 to-amber-950 flex-shrink-0 animate-in fade-in shadow-lg">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            <span className="font-mono text-[10px] text-amber-200 hidden sm:inline font-bold">
              MỤC TIÊU:
            </span>
            <div className="flex items-center gap-1">
              {opponents.map((opp) => (
                <button
                  key={opp.playerId}
                  onClick={() => handlePlaySpell(opp.playerId)}
                  className="px-2 py-0.5 bg-amber-600 hover:bg-amber-500 text-white font-mono font-black text-[9px] uppercase rounded cursor-pointer transition-colors shadow"
                >
                  {opp.nickname}
                </button>
              ))}
              {selectedCard.disasterEffect === 'POISON_MIST' && (
                <button
                  onClick={() => handlePlaySpell()}
                  className="px-2 py-0.5 bg-rose-600 hover:bg-rose-500 text-white font-mono font-black text-[9px] uppercase rounded cursor-pointer transition-colors shadow"
                >
                  TOÀN BÀN
                </button>
              )}
              <button
                onClick={() => setSelectedCardId(null)}
                className="px-1.5 py-0.5 text-neutral-400 hover:text-white font-mono text-[9px] uppercase cursor-pointer"
              >
                HỦY
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4. Bottom Zone: Player Realm (Your 4+ Shadow Slots + Hand Felt Tray) */}
      <div className="rounded-lg border border-amber-600/50 bg-gradient-to-b from-[#1b130b] via-[#120c07] to-[#070503] p-2 sm:p-2.5 flex flex-col gap-2 shadow-2xl flex-shrink-0">
        {/* Out-of-turn Jinx Reaction Banner when targeted by a Disaster */}
        {gameState.pendingDisaster && gameState.pendingDisaster.targetId === myState.playerId && (
          <div className="bg-purple-950/90 border-2 border-purple-400 rounded-lg px-3 py-2 text-purple-100 text-xs font-mono flex items-center justify-between gap-3 animate-pulse shadow-[0_0_20px_rgba(168,85,247,0.5)]">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-purple-300 flex-shrink-0" />
              <span>
                BẠN BỊ ĐÁNH THẢM HỌA! Bạn có lá <strong>JINX</strong> — chơi ngoài lượt để phản đòn lại đối thủ?
              </span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={() => sendGameAction({ type: 'RESPOND_JINX', useJinx: true })}
                className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white font-black text-[10px] uppercase rounded border border-purple-300 cursor-pointer"
              >
                🎭 DÙNG JINX PHẢN ĐÒN
              </button>
              <button
                type="button"
                onClick={() => sendGameAction({ type: 'RESPOND_JINX', useJinx: false })}
                className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-[10px] uppercase rounded border border-neutral-600 cursor-pointer"
              >
                CHẤP NHẬN
              </button>
            </div>
          </div>
        )}
        {/* Row 4A: Your 4 Shadow Slots (Alchemical Transmutation Pedestals) */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between px-1 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="font-serif font-black text-xs text-amber-200 uppercase tracking-wider flex items-center gap-1.5">
                <FlaskConical className="w-3.5 h-3.5 text-amber-400" />
                <span>VÙNG BÓNG TỐI CỦA BẠN (4 LỜI NGUYỀN)</span>
              </span>
              <span className="font-mono font-black text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-500/70 px-1.5 py-0.2 rounded shadow-xs">
                TIẾN ĐỘ: {myTreatedCount} / {myState.shadow.length}
              </span>
            </div>

            {/* Active Status Effects Bar (Hiệu ứng đang dính: Cấm dùng thuốc giải, v.v.) */}
            <div className="flex items-center">
              <ActiveDebuffsList
                debuffs={getPlayerActiveDebuffs(myState, gameState.recentEvent, myState.nickname)}
                onInspect={(d) => setInspectedDebuff(d)}
                tooltipPlacement="top"
                align="right"
              />
            </div>

            {selectedCard && (
              selectedCard.category === 'REMEDY' ? (
                myState.isJinxed ? (
                  <span className="text-[10px] font-mono text-purple-400 font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-purple-400" />
                    <span>BẠN BỊ JINX: KHÔNG THỂ DÙNG THUỐC GIẢI TRONG LƯỢT NÀY!</span>
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-amber-300 animate-pulse flex items-center gap-1 font-bold">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>
                      CHỌN Ô CÙNG MÀU [
                      {selectedCard.curesHex && selectedCard.curesHex !== 'ANY'
                        ? (HEX_THEMES[selectedCard.curesHex]?.colorName || selectedCard.curesHex).toUpperCase()
                        : 'BẤT KỲ Ô NÀO (VẠN NĂNG)'}
                      ] ĐỂ CHỮA!
                    </span>
                  </span>
                )
              ) : selectedCard.spellEffect === 'DEUS_HEX_MACHINA' ? (
                <span className="text-[10px] font-mono text-amber-300 animate-pulse flex items-center gap-1 font-bold">
                  <Flame className="w-3 h-3 text-amber-400" />
                  <span>CHỌN 1 Ô BÓNG TỐI CỦA ĐỐI THỦ PHÍA TRÊN ĐỂ CƯỠNG CHẾ GIEO LỜI NGUYỀN (XUYÊN THỦ)!</span>
                </span>
              ) : selectedCard.spellEffect === 'JINX_SILENCE' ? (
                <span className="text-[10px] font-mono text-purple-300 animate-pulse flex items-center gap-1 font-bold">
                  <Zap className="w-3 h-3 text-purple-400" />
                  <span>BẤM NÚT "YỂM JINX!" TRÊN ĐỐI THỦ PHÍA TRÊN ĐỂ CẤM HỌ DÙNG THUỐC GIẢI LƯỢT TỚI!</span>
                </span>
              ) : null
            )}
          </div>

          <div className="flex items-center justify-center gap-3 py-0.5">
            {myState.shadow.map((slot, sIdx) => {
              const canTreat =
                !myState.isJinxed &&
                selectedCard &&
                selectedCard.category === 'REMEDY' &&
                slot.treatedBy === null &&
                (selectedCard.curesHex === 'ANY' || selectedCard.curesHex === slot.hex.hexType);

              return (
                <div key={slot.slotId} className="flex flex-col items-center">
                  <ShadowSlotView
                    slot={slot}
                    slotIndex={sIdx}
                    isMySlot={true}
                    size="md"
                    canTreatWithCard={canTreat ? selectedCard : null}
                    onTreat={() => handleTreat(sIdx)}
                    onInspectCard={(card) => setInspectedCard(card)}
                  />
                  {/* Slot condition indicator */}
                  <div className="mt-1 flex flex-col items-center">
                    <span
                      className={`text-[6.5px] sm:text-[7.5px] font-mono font-black px-1.5 py-0.2 rounded border uppercase tracking-wider shadow-xs ${
                        slot.treatedBy
                          ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/80'
                          : 'bg-rose-950/90 text-rose-300 border-rose-500/80'
                      }`}
                    >
                      {slot.treatedBy ? 'ĐÃ GIẢI' : 'CHƯA GIẢI'}
                    </span>
                    {slot.treatedBy && slot.treatedBy.sideEffects && slot.treatedBy.sideEffects.length > 0 && (
                      <span
                        className="text-[6px] sm:text-[6.5px] font-mono text-amber-300/90 truncate max-w-[85px] mt-0.5"
                        title={`Di chứng dược liệu: ${slot.treatedBy.sideEffects.join(', ')}`}
                      >
                        Di chứng: {slot.treatedBy.sideEffects.map((e) => `+${e.substring(0, 3)}`).join(' ')}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Row 4B: Your Hand Cards */}
        <div className="flex flex-col gap-1 pt-1.5 border-t border-white/10">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="font-mono font-black text-[11px] text-white uppercase tracking-wider">
                BÀI TRÊN TAY ({myState.hand.length} LÁ)
              </span>
              <span className="text-[9px] text-neutral-400 font-mono hidden sm:inline">
                {isMyTurn ? 'Chọn lá bài để thi triển' : 'Chờ tới lượt bạn...'}
              </span>
            </div>

            {/* Utility / Cast Actions */}
            {isMyTurn && (
              <div className="flex items-center gap-1.5">
                {selectedCard && selectedCard.category === 'DISASTER' && (
                  <button
                    type="button"
                    onClick={() => {
                      sendGameAction({
                        type: 'PLAY_SPELL',
                        cardId: selectedCard.id,
                      });
                      setSelectedCardId(null);
                    }}
                    className="px-2.5 py-0.5 bg-red-600 hover:bg-red-500 text-white font-mono font-black text-[9px] uppercase rounded border border-red-400 shadow-md shadow-red-900/50 flex items-center gap-1 animate-pulse cursor-pointer"
                  >
                    <Flame className="w-2.5 h-2.5" />
                    <span>KÍCH HOẠT THẢM HỌA</span>
                  </button>
                )}
                {!isDiscardMode ? (
                  <button
                    type="button"
                    onClick={() => {
                      setIsDiscardMode(true);
                      setSelectedCardId(null);
                    }}
                    className="px-2 py-0.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-600 font-mono font-bold text-[9px] uppercase rounded transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-2.5 h-2.5" />
                    <span>ĐỔI BÀI</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handleExecuteDiscard}
                      disabled={discardSelection.length === 0}
                      className="px-2 py-0.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black border border-amber-600 font-mono font-black text-[9px] uppercase rounded transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <span>BỎ ({discardSelection.length}) LÁ</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsDiscardMode(false);
                        setDiscardSelection([]);
                      }}
                      className="px-1.5 py-0.5 text-neutral-400 hover:text-white font-mono text-[9px] uppercase cursor-pointer"
                    >
                      HỦY
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Cards in Hand */}
          <div className="flex gap-2.5 overflow-x-auto pb-0.5 pt-0.5 items-center justify-start sm:justify-center">
            {myState.hand.map((card) => {
              const isSelected = isDiscardMode
                ? discardSelection.includes(card.id)
                : selectedCardId === card.id;

              return (
                <div key={card.id} className="relative flex-shrink-0">
                  <HexCardView
                    card={card}
                    size="md"
                    isSelected={isSelected}
                    onClick={() => {
                      if (isDiscardMode) {
                        toggleDiscardCard(card.id);
                      } else {
                        setSelectedCardId(selectedCardId === card.id ? null : card.id);
                      }
                    }}
                    disabled={!isMyTurn && !isDiscardMode}
                    onInspectClick={() => setInspectedCard(card)}
                    actionLabel={
                      isDiscardMode
                        ? isSelected
                          ? 'BỎ LÁ'
                          : 'CHỌN'
                        : undefined
                    }
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

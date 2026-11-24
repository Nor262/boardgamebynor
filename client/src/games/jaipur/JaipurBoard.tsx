'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRoomStore } from '@/stores/room-store';
import { Avatar } from '@/components/common/Avatar';
import { sound } from '@/utils/sound';
import { CoinStack, GoodsType } from './components/CoinStack';
import { JaipurCardView, CardType } from './components/JaipurCardView';
import confetti from 'canvas-confetti';
import {
  Coins,
  Sparkles,
  ArrowLeftRight,
  ShoppingBag,
  RotateCcw,
  Volume2,
  VolumeX,
  Layers,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Award,
} from 'lucide-react';

export function JaipurBoard() {
  const { room, me, sendGameAction, returnToLobby } = useRoomStore();
  const gameData = room?.gameData;
  const isHost = me?.isHost;

  // Trạng thái âm thanh & lựa chọn
  const [isMuted, setIsMuted] = useState(sound.getIsMuted());
  const [selectedMarketIds, setSelectedMarketIds] = useState<string[]>([]);
  const [selectedHandIds, setSelectedHandIds] = useState<string[]>([]);
  const [camelsToExchange, setCamelsToExchange] = useState<number>(0);

  // Kích hoạt pháo hoa & âm thanh khi chiến thắng
  useEffect(() => {
    if (gameData?.matchWinnerId) {
      sound.playVictoryFanfare();
      confetti({
        particleCount: 160,
        spread: 85,
        origin: { y: 0.6 },
      });
    } else if (gameData?.isRoundOver) {
      sound.playVictoryFanfare();
    }
  }, [gameData?.matchWinnerId, gameData?.isRoundOver]);

  if (!room || !me || !gameData) return null;

  const currentTurnPlayerId = gameData.turnOrder[gameData.currentTurnIndex];

  // Hỗ trợ chế độ khán giả (Spectator) an toàn, không bị crash nếu me.id không phải 1 trong 2 người chơi
  const isSpectator = !gameData.players[me.id];
  const primaryPlayerId = isSpectator ? gameData.turnOrder[0] : me.id;
  const secondaryPlayerId = gameData.turnOrder.find((id: string) => id !== primaryPlayerId) || gameData.turnOrder[1] || '';
  const opponentId = secondaryPlayerId;

  const myState = gameData.players[primaryPlayerId] || {
    playerId: primaryPlayerId,
    nickname: 'Người chơi 1',
    hand: [],
    camels: 0,
    roundScore: 0,
    sealsOfExcellence: 0,
  };
  const myHand = myState.hand || [];

  const opponentState = gameData.players[secondaryPlayerId] || {
    playerId: secondaryPlayerId,
    nickname: 'Người chơi 2',
    hand: [],
    camels: 0,
    roundScore: 0,
    sealsOfExcellence: 0,
  };

  const isMyTurn = !isSpectator && currentTurnPlayerId === me.id;
  const prevIsMyTurnRef = useRef<boolean>(false);

  // Phát âm thanh báo hiệu mỗi khi chuyển sang lượt của bạn
  useEffect(() => {
    if (isMyTurn && !prevIsMyTurnRef.current && !gameData?.isRoundOver) {
      sound.playTurnNotify();
    }
    prevIsMyTurnRef.current = isMyTurn;
  }, [isMyTurn, gameData?.isRoundOver]);

  const marketCamelsCount = gameData.market.filter((c: any) => c.type === 'CAMEL').length;

  const handleToggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
    if (!muted) sound.playClick();
  };

  const clearSelection = () => {
    sound.playClick();
    setSelectedMarketIds([]);
    setSelectedHandIds([]);
    setCamelsToExchange(0);
  };

  const toggleSelectMarketCard = (cardId: string, type: CardType) => {
    if (!isMyTurn || gameData.isRoundOver) return;

    // Không thể chọn lẻ lạc đà ở chợ
    if (type === 'CAMEL') {
      return;
    }

    sound.playClick();
    if (selectedMarketIds.includes(cardId)) {
      setSelectedMarketIds(selectedMarketIds.filter(id => id !== cardId));
    } else {
      setSelectedMarketIds([...selectedMarketIds, cardId]);
    }
  };

  const toggleSelectHandCard = (cardId: string) => {
    if (!isMyTurn || gameData.isRoundOver) return;

    sound.playClick();
    if (selectedHandIds.includes(cardId)) {
      setSelectedHandIds(selectedHandIds.filter(id => id !== cardId));
    } else {
      setSelectedHandIds([...selectedHandIds, cardId]);
    }
  };

  // Chọn lạc đà bằng cách bấm trực tiếp lên thẻ lạc đà
  const toggleSelectCamelCard = (camelIndex: number) => {
    if (!isMyTurn || gameData.isRoundOver) return;
    sound.playClick();
    if (camelIndex < camelsToExchange) {
      // Nếu bấm vào lạc đà đã chọn: bỏ chọn từ con đó trở đi
      setCamelsToExchange(camelIndex);
    } else {
      // Nếu bấm vào con chưa chọn: chọn thêm tới con đó
      setCamelsToExchange(camelIndex + 1);
    }
  };

  // Hành động 1: Lấy 1 lá từ chợ
  const handleTakeSingle = () => {
    if (selectedMarketIds.length !== 1) return;
    sound.playCardDeal();
    sendGameAction({
      type: 'TAKE_SINGLE',
      marketCardId: selectedMarketIds[0],
    });
    clearSelection();
  };

  // Hành động 2: Lấy toàn bộ lạc đà ở chợ
  const handleTakeAllCamels = () => {
    if (marketCamelsCount === 0) return;
    sound.playCamelCall();
    sendGameAction({ type: 'TAKE_CAMELS' });
    clearSelection();
  };

  // Hành động 3: Đổi hàng với chợ
  const handleExchange = () => {
    sound.playCardDeal();
    sendGameAction({
      type: 'EXCHANGE',
      takeMarketIds: selectedMarketIds,
      giveHandIds: selectedHandIds,
      giveCamelsCount: camelsToExchange,
    });
    clearSelection();
  };

  // Hành động 4: Bán hàng lấy xu điểm
  const handleSell = () => {
    if (selectedHandIds.length === 0) return;
    sound.playCoinClink();
    sendGameAction({
      type: 'SELL',
      cardIds: selectedHandIds,
    });
    clearSelection();
  };

  const handleNextRound = () => {
    sound.playCardDeal();
    sendGameAction({ type: 'NEXT_ROUND' });
    clearSelection();
  };

  // Kiểm tra tính hợp lệ của việc Bán hàng
  const selectedHandCards = myHand.filter((c: any) => selectedHandIds.includes(c.id));
  const isHandSelectionSameType =
    selectedHandCards.length > 0 &&
    selectedHandCards.every((c: any) => c.type === selectedHandCards[0].type);

  const selectedGoodsType: GoodsType | null = isHandSelectionSameType
    ? (selectedHandCards[0].type as GoodsType)
    : null;

  const isExpensiveGoods = false;
  const canSellSelected =
    isMyTurn &&
    isHandSelectionSameType &&
    selectedMarketIds.length === 0 &&
    camelsToExchange === 0;

  // Điều kiện Đổi hàng:
  // - Chọn ít nhất 2 lá chợ
  // - Số lượng lấy bằng số lượng trả (bài trên tay + lạc đà)
  // - Sau khi đổi, số bài trên tay không quá 7
  const totalGiveCount = selectedHandIds.length + camelsToExchange;
  const canExchange =
    isMyTurn &&
    selectedMarketIds.length >= 2 &&
    selectedMarketIds.length === totalGiveCount &&
    myHand.length - selectedHandIds.length + selectedMarketIds.length <= 7;

  // Điều kiện Bốc 1 lá:
  // - Chọn đúng 1 lá chợ
  // - Không chọn bài trên tay hay lạc đà
  // - Số bài trên tay hiện tại < 7
  const canTakeSingle =
    isMyTurn &&
    selectedMarketIds.length === 1 &&
    selectedHandIds.length === 0 &&
    camelsToExchange === 0 &&
    myHand.length < 7;

  // Danh sách lạc đà trực quan của người chơi (tối đa hiển thị trực quan)
  const displayCamelsCount = myState.camels || 0;

  const latestLog =
    Array.isArray(gameData.gameLogs) && gameData.gameLogs.length > 0
      ? gameData.gameLogs[gameData.gameLogs.length - 1]
      : 'Trận đấu Jaipur đã bắt đầu!';

  return (
    <div className="flex-1 w-full h-full flex flex-col p-1.5 sm:p-2 text-white select-none max-w-[1440px] mx-auto gap-1.5 overflow-hidden">
      {/* ========================================================================= */}
      {/* 0. THANH TRẠNG THÁI LƯỢT CHƠI & HÀNH ĐỘNG VỪA DIỄN RA */}
      {/* ========================================================================= */}
      <div
        className={`rounded-xl border px-3 py-1 flex flex-wrap items-center justify-between gap-2 flex-shrink-0 shadow-md transition-all ${
          isMyTurn && !gameData.isRoundOver
            ? 'border-emerald-400/80 bg-gradient-to-r from-emerald-950/90 via-teal-900/80 to-emerald-950/90 shadow-[0_0_15px_rgba(16,185,129,0.25)]'
            : 'border-slate-700/80 bg-slate-900/90'
        }`}
      >
        <div className="flex items-center gap-2">
          {gameData.isRoundOver ? (
            <span className="font-mono font-black text-xs text-amber-300 uppercase">
              🏁 HIỆP {gameData.round} ĐÃ KẾT THÚC
            </span>
          ) : isMyTurn ? (
            <span className="font-mono font-black text-xs sm:text-sm text-emerald-300 uppercase flex items-center gap-1.5 animate-pulse">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>ĐẾN LƯỢT BẠN! (Chọn bài ở Chợ hoặc Bán bài trên tay)</span>
            </span>
          ) : (
            <span className="font-mono font-bold text-xs text-amber-300/90 uppercase flex items-center gap-1.5">
              <span>⏳ ĐANG CHỜ LƯỢT CỦA [{opponentState?.nickname || 'ĐỐI THỦ'}]...</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-[11px] font-mono text-amber-200/95 bg-black/40 px-2.5 py-0.5 rounded-lg border border-amber-500/30 max-w-full sm:max-w-[55%] truncate" title={latestLog}>
          <span className="text-amber-400 font-bold flex-shrink-0">📜 Vừa diễn ra:</span>
          <span className="truncate">{latestLog}</span>
        </div>
      </div>

      {/* BỐ CỤC 2 CỘT: BÊN TRÁI (ĐỐI THỦ + CHỢ + BÀI TRÊN TAY) | BÊN PHẢI (CHỒNG XU ĐIỂM) */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[1fr_310px] gap-2">
        {/* CỘT TRÁI: KHU VỰC CHƠI CHÍNH */}
        <div className="flex flex-col justify-between gap-1.5 min-w-0 min-h-0">

      {/* ========================================================================= */}
      {/* 1. KHU VỰC ĐỐI THỦ (OPPONENT HEADER BAR) */}
      {/* ========================================================================= */}
      <div className="rounded-xl border border-amber-500/30 bg-gradient-to-r from-[#121824] via-[#1a2234] to-[#121824] p-2 sm:p-2.5 shadow-lg flex items-center justify-between gap-3 flex-shrink-0">
        {/* Đối thủ: Avatar, Tên, Trạng thái */}
        <div className="flex items-center gap-3.5">
          <Avatar
            seed={opponentState?.playerId || 'opponent'}
            name={opponentState?.nickname || 'Đối thủ'}
            size="md"
            showOnlineDot={true}
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-black text-sm sm:text-base text-slate-100">
                {opponentState?.nickname || 'Đối thủ'}
              </span>
              {currentTurnPlayerId === opponentId ? (
                <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                  Đang suy nghĩ...
                </span>
              ) : (
                <span className="text-[10px] font-mono text-slate-400">
                  Chờ tới lượt
                </span>
              )}
            </div>

            {/* Huy hiệu & Đàn Lạc Đà Đối thủ */}
            <div className="flex items-center gap-3 mt-1.5 text-xs font-mono">
              <div className="flex items-center gap-1.5 font-black text-amber-300 bg-black/40 px-2 py-0.5 rounded-lg border border-amber-500/30">
                <img
                  src="/assets/tokens/seal_of_excellence.png"
                  alt="Seal"
                  className="w-4 h-4 rounded-full border border-amber-400/80"
                />
                <span>Huy hiệu: {opponentState?.sealsOfExcellence || 0}/2</span>
              </div>

              {/* Lạc đà đối thủ với Art thẻ bài thu nhỏ */}
              <div className="flex items-center gap-1.5 font-black text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/30">
                <img
                  src="/assets/cards/camel.png"
                  alt="Camel"
                  className="w-4 h-4 object-cover rounded-sm border border-amber-400/60"
                />
                <span>Đàn Lạc Đà: {opponentState?.camels || 0} con</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bài úp của đối thủ & Điểm số */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              Bài trên tay ({opponentState?.cardCount || 0}/7)
            </span>
            <div className="flex -space-x-3 overflow-hidden py-1">
              {Array.from({ length: Math.min(opponentState?.cardCount || 0, 7) }).map((_, idx) => (
                <JaipurCardView
                  key={idx}
                  card={{ id: `opp_${idx}`, type: 'DIAMOND' }}
                  isFacedown={true}
                  size="sm"
                />
              ))}
            </div>
          </div>

          <div className="px-4 py-2 rounded-xl bg-black/60 border border-amber-500/40 text-center shadow-inner">
            <div className="text-[10px] font-mono text-slate-400 font-bold uppercase">Điểm Hiệp</div>
            <div className="text-xl font-mono font-black text-amber-400">{opponentState?.roundScore || 0}</div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. KHU VỰC TRUNG TÂM: CHỢ HOÀNG GIA & KHU ĐỒNG XU ĐIỂM */}
      {/* ========================================================================= */}
      <div className="rounded-xl border border-amber-500/30 bg-gradient-to-b from-[#131b29] via-[#0e1420] to-[#0a0f18] p-2 sm:p-2.5 shadow-xl relative flex flex-col gap-1.5 flex-shrink-0">
        {/* Header Khu Chợ & Nút Bốc Lạc Đà Nhanh */}
        <div className="flex flex-wrap items-center justify-between border-b border-amber-500/20 pb-1.5 gap-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-600 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-500/20">
              🕌
            </div>
            <div>
              <span className="font-mono font-black text-sm sm:text-base text-white uppercase tracking-wider">
                CHỢ HOÀNG GIA JAIPUR
              </span>
              <span className="text-xs font-mono text-amber-400 font-bold ml-2">
                [HIỆP {gameData.round}/3]
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <span className="flex items-center gap-1.5 text-slate-300 font-bold bg-black/40 px-3 py-1 rounded-lg border border-slate-700">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              Kho bài: <strong className="text-amber-300">{gameData.deckCount || 0}</strong> lá
            </span>

            <button
              onClick={handleToggleSound}
              className="p-1.5 px-2.5 rounded-lg bg-black/40 hover:bg-black text-slate-300 hover:text-white border border-slate-700 transition-colors flex items-center gap-1 font-bold cursor-pointer"
              title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
            >
              {isMuted ? (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                  <span className="text-[11px] text-rose-400">Tắt âm</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[11px] text-emerald-400">Âm thanh</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 5 Lá Bài Tại Chợ */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 justify-items-center py-1">
          {gameData.market.map((card: any) => {
            const isSelected = selectedMarketIds.includes(card.id);
            const isCamel = card.type === 'CAMEL';
            return (
              <div key={card.id} className="relative group">
                <JaipurCardView
                  card={card}
                  isSelected={isSelected}
                  onClick={() => toggleSelectMarketCard(card.id, card.type)}
                  size="md"
                />
                {isCamel && (
                  <div className="absolute -top-2 -right-2 bg-amber-500 text-slate-950 text-[10px] font-mono font-black px-1.5 py-0.5 rounded shadow border border-black">
                    LẠC ĐÀ
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Nút hành động nhanh: Thu gom hết lạc đà nếu có trên chợ */}
        {isMyTurn && marketCamelsCount > 0 && selectedMarketIds.length === 0 && selectedHandIds.length === 0 && camelsToExchange === 0 && (
          <div className="flex justify-center -mt-1">
            <button
              onClick={handleTakeAllCamels}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-mono font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/30 transition-all active:scale-95 flex items-center gap-2 border border-amber-300 cursor-pointer animate-bounce"
            >
              <span className="text-base">🐪</span>
              <span>THU NHẬN HẾT {marketCamelsCount} LẠC ĐÀ VỀ ĐÀN CỦA BẠN</span>
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 3. THANH HÀNH ĐỘNG THÔNG MINH (ACTION DOCK) */}
      {/* ========================================================================= */}
      <div className="rounded-xl p-2 sm:p-2.5 border border-amber-500/30 bg-gradient-to-r from-[#121824] via-[#1a2234] to-[#121824] shadow-lg flex items-center justify-between gap-2 flex-shrink-0">
        <div className="flex items-center gap-2 font-mono">
          {isMyTurn ? (
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping shadow-sm" />
              <span className="text-sm font-black text-white uppercase">LƯỢT CỦA BẠN:</span>
              <span className="text-xs text-amber-300 font-bold hidden sm:inline">
                {selectedMarketIds.length === 0 && selectedHandIds.length === 0 && camelsToExchange === 0
                  ? 'Bấm chọn bài để thực hiện hành động'
                  : selectedMarketIds.length > 0 && totalGiveCount === 0
                  ? selectedMarketIds.length === 1
                    ? 'Bấm nút bốc 1 lá này, hoặc chọn thêm hàng để đổi'
                    : `Đã chọn ${selectedMarketIds.length} lá chợ. Hãy chọn ${selectedMarketIds.length} lá trên tay hoặc lạc đà để đổi.`
                  : canExchange
                  ? 'Số lượng hợp lệ! Bấm xác nhận đổi bên phải.'
                  : canSellSelected
                  ? `Bấm nút bán ${selectedHandCards.length} lá ${selectedGoodsType}!`
                  : 'Hãy kiểm tra lại điều kiện chọn bài.'}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-slate-400 font-bold uppercase">
              <span>Đang chờ đối thủ ra nước đi...</span>
            </div>
          )}
        </div>

        {/* Các nút kích hoạt hành động */}
        <div className="flex flex-wrap items-center gap-2 font-mono">
          {/* Lấy 1 lá từ chợ */}
          {canTakeSingle && (
            <button
              onClick={handleTakeSingle}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-600/30 transition-all active:scale-95 flex items-center gap-2 border border-cyan-400 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>BỐC 1 LÁ NÀY VÀO TAY</span>
            </button>
          )}

          {/* Bán hàng lấy xu điểm */}
          {canSellSelected && (
            <button
              onClick={handleSell}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs uppercase tracking-wider shadow-xl shadow-emerald-500/30 transition-all active:scale-95 flex items-center gap-2 border border-emerald-400 cursor-pointer animate-pulse"
            >
              <Coins className="w-4 h-4" />
              <span>BÁN {selectedHandCards.length} LÁ {selectedGoodsType}</span>
            </button>
          )}

          {/* Đổi hàng hóa */}
          {canExchange && (
            <button
              onClick={handleExchange}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-black text-xs uppercase tracking-wider shadow-xl shadow-purple-500/30 transition-all active:scale-95 flex items-center gap-2 border border-purple-400 cursor-pointer animate-pulse"
            >
              <ArrowLeftRight className="w-4 h-4" />
              <span>XÁC NHẬN ĐỔI {selectedMarketIds.length} LÁ</span>
            </button>
          )}

          {/* Bỏ chọn */}
          {(selectedMarketIds.length > 0 || selectedHandIds.length > 0 || camelsToExchange > 0) && (
            <button
              onClick={clearSelection}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-black text-xs uppercase tracking-wider transition-colors border border-slate-600 cursor-pointer"
            >
              ✕ HỦY CHỌN
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. KHU VỰC CỦA BẠN (PLAYER HAND & CAMEL HERD CARDS) */}
      {/* ========================================================================= */}
      <div className="rounded-xl border border-amber-500/30 bg-gradient-to-b from-[#141b27] via-[#101622] to-[#0c101a] p-2 sm:p-2.5 shadow-xl flex flex-col gap-1.5 flex-shrink-0">
        {/* Header Người Chơi: Tên, Điểm, Huy hiệu */}
        <div className="flex flex-wrap items-center justify-between border-b border-amber-500/20 pb-1.5 gap-2">
          <div className="flex items-center gap-3">
            <Avatar
              seed={me.id}
              name={me.nickname}
              size="md"
              showOnlineDot={true}
            />
            <div>
              <div className="flex items-center gap-2 font-mono">
                <span className="font-black text-sm sm:text-base text-white">{me.nickname} (Bạn)</span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
                  {myHand.length}/7 LÁ TRÊN TAY
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1.5 text-xs font-mono">
                <span className="font-black text-amber-300 flex items-center gap-1.5 bg-black/40 px-2 py-0.5 rounded-lg border border-amber-500/30">
                  <img
                    src="/assets/tokens/seal_of_excellence.png"
                    alt="Seal"
                    className="w-4 h-4 rounded-full border border-amber-400"
                  />
                  <span>Huy hiệu: {myState.sealsOfExcellence}/2</span>
                </span>
                <span className="font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/30">
                  Điểm hiệp này: {myState.roundScore} đ
                </span>
              </div>
            </div>
          </div>

          {/* Gợi ý luật chơi nếu chọn hàng quý */}
          {isExpensiveGoods && selectedHandCards.length < 2 && (
            <div className="font-mono text-xs font-black text-amber-400 bg-amber-500/10 border border-amber-500/40 px-3 py-1.5 rounded-xl flex items-center gap-1.5 animate-pulse">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <span>Hàng quý (Kim cương/Vàng/Bạc) bắt buộc bán từ 2 lá trở lên!</span>
            </div>
          )}
        </div>

        {/* Khối hiển thị Bài Trên Tay & Đàn Lạc Đà */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* CỘT 1 (8 cols): BÀI HÀNG HÓA TRÊN TAY */}
          <div className="lg:col-span-8 flex flex-col gap-2">
            <div className="flex items-center justify-between font-mono text-xs font-black uppercase tracking-wider text-slate-300">
              <span>BÀI HÀNG HÓA TRÊN TAY ({myHand.length}/7 LÁ)</span>
              <span className="text-[11px] text-slate-400 font-normal">Bấm vào lá bài để Bán hoặc Đổi</span>
            </div>

            {myHand.length === 0 ? (
              <div className="h-32 rounded-2xl bg-black/30 border-2 border-dashed border-slate-700 flex items-center justify-center font-mono text-xs text-slate-400">
                Bạn chưa có lá hàng hóa nào. Hãy bốc từ chợ hoặc thu gom lạc đà!
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5 justify-items-center bg-black/30 p-3 rounded-2xl border border-white/10 min-h-[140px] items-center">
                {myHand.map((card: any) => {
                  const isSelected = selectedHandIds.includes(card.id);
                  return (
                    <JaipurCardView
                      key={card.id}
                      card={card}
                      isSelected={isSelected}
                      onClick={() => toggleSelectHandCard(card.id)}
                      size="md"
                    />
                  );
                })}
              </div>
            )}
          </div>

          {/* CỘT 2 (4 cols): ĐÀN LẠC ĐÀ CỦA BẠN (TRỰC QUAN BẰNG THẺ BÀI) */}
          <div className="lg:col-span-4 flex flex-col gap-2">
            <div className="flex items-center justify-between font-mono text-xs font-black uppercase tracking-wider text-amber-300">
              <span className="flex items-center gap-1.5">
                <span>🐪</span>
                <span>ĐÀN LẠC ĐÀ ({displayCamelsCount} CON)</span>
              </span>
              {camelsToExchange > 0 && (
                <span className="text-amber-400 font-bold bg-amber-500/20 px-2 py-0.5 rounded border border-amber-400/40 text-[10px]">
                  ĐÃ CHỌN: {camelsToExchange} CON
                </span>
              )}
            </div>

            {displayCamelsCount === 0 ? (
              <div className="h-32 rounded-2xl bg-black/30 border-2 border-dashed border-amber-500/30 flex flex-col items-center justify-center font-mono text-xs text-slate-400 text-center p-3">
                <span className="text-2xl mb-1">🏜️</span>
                <span>Chưa có lạc đà trong đàn</span>
                <span className="text-[10px] text-slate-500 mt-1">Thu nhận lạc đà từ chợ khi xuất hiện!</span>
              </div>
            ) : (
              <div className="bg-black/30 p-3 rounded-2xl border border-amber-500/30 min-h-[140px] flex flex-col justify-center">
                <div className="text-[11px] font-mono text-slate-400 mb-2">
                  Bấm trực tiếp lên thẻ lạc đà để chọn đem đi trao đổi hàng:
                </div>

                {/* Danh sách các thẻ lạc đà trực quan, có thể bấm trực tiếp để chọn/bỏ chọn */}
                <div className="flex flex-wrap items-center gap-2 justify-center">
                  {Array.from({ length: Math.min(displayCamelsCount, 6) }).map((_, idx) => {
                    const isSelected = idx < camelsToExchange;
                    const isLastOverflow = idx === 5 && displayCamelsCount > 6;
                    return (
                      <div
                        key={idx}
                        onClick={() => toggleSelectCamelCard(idx)}
                        className={`relative cursor-pointer transition-all duration-200 transform ${
                          isSelected ? '-translate-y-2 scale-105' : 'hover:-translate-y-1 hover:scale-102'
                        }`}
                        title={isSelected ? 'Bấm để bỏ chọn lạc đà này' : 'Bấm để chọn đổi lạc đà này'}
                      >
                        <JaipurCardView
                          card={{ id: `camel_${idx}`, type: 'CAMEL' }}
                          isSelected={isSelected}
                          size="sm"
                        />
                        {isSelected && (
                          <div className="absolute -top-2 -right-1 bg-emerald-500 text-slate-950 rounded-full p-0.5 shadow border border-black z-20">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </div>
                        )}
                        {isLastOverflow && (
                          <div className="absolute inset-0 bg-black/75 rounded-xl flex items-center justify-center font-mono font-black text-amber-300 text-xs z-10 border border-amber-400">
                            +{displayCamelsCount - 5}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

        </div>
        {/* KẾT THÚC CỘT TRÁI */}

        {/* CỘT PHẢI: BÀN ĐỒNG XU ĐIỂM SỐ & XU THƯỞNG COMBO */}
        <div className="rounded-xl border border-amber-500/30 bg-gradient-to-b from-[#131b29] via-[#0e1420] to-[#0a0f18] p-2.5 flex flex-col justify-between gap-2 shadow-xl">
          <div className="flex items-center justify-between text-[11px] font-mono font-black uppercase tracking-wider text-amber-300 border-b border-white/10 pb-1.5">
            <span className="flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-amber-400" />
              <span>CHỒNG XU HOÀNG GIA</span>
            </span>
            <span className="text-[10px] text-slate-400 normal-case font-medium">
              3 chồng cạn = hết hiệp
            </span>
          </div>

          {/* 6 Chồng Xu Hàng Hóa (2x3) */}
          <div className="grid grid-cols-3 lg:grid-cols-2 gap-2">
            {(['DIAMOND', 'GOLD', 'SILVER', 'CLOTH', 'SPICE', 'LEATHER'] as GoodsType[]).map((type) => (
              <CoinStack key={type} type={type} tokens={gameData.goodsTokens[type] || []} />
            ))}
          </div>

          {/* 3 Chồng Xu Thưởng Combo */}
          <div className="flex flex-col gap-1.5 pt-2 border-t border-white/10 text-xs">
            <span className="text-slate-300 font-mono font-bold flex items-center gap-1.5 uppercase text-[10px]">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>XU THƯỞNG BÁN COMBO:</span>
            </span>

            <div className="grid grid-cols-3 lg:grid-cols-1 gap-1.5 font-mono">
              <div className="flex items-center justify-between px-2.5 py-1 rounded-lg bg-purple-950/80 border border-purple-500/50 shadow-sm">
                <div className="flex items-center gap-2">
                  <img src="/assets/tokens/bonus_3.png" alt="Bonus 3" className="w-5 h-5 rounded-full border border-amber-400" />
                  <span className="text-[10px] font-black text-purple-200 uppercase">Combo 3 lá</span>
                </div>
                <span className="text-[10px] font-black text-purple-300">{gameData.bonusTokens.bonus3.length} xu</span>
              </div>

              <div className="flex items-center justify-between px-2.5 py-1 rounded-lg bg-indigo-950/80 border border-indigo-500/50 shadow-sm">
                <div className="flex items-center gap-2">
                  <img src="/assets/tokens/bonus_4.png" alt="Bonus 4" className="w-5 h-5 rounded-full border border-amber-400" />
                  <span className="text-[10px] font-black text-indigo-200 uppercase">Combo 4 lá</span>
                </div>
                <span className="text-[10px] font-black text-indigo-300">{gameData.bonusTokens.bonus4.length} xu</span>
              </div>

              <div className="flex items-center justify-between px-2.5 py-1 rounded-lg bg-amber-950/80 border border-amber-500/50 shadow-sm">
                <div className="flex items-center gap-2">
                  <img src="/assets/tokens/bonus_5.png" alt="Bonus 5" className="w-5 h-5 rounded-full border border-amber-400" />
                  <span className="text-[10px] font-black text-amber-200 uppercase">Combo 5+ lá</span>
                </div>
                <span className="text-[10px] font-black text-amber-300">{gameData.bonusTokens.bonus5.length} xu</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. MODAL KẾT THÚC HIỆP / TRẬN ĐẤU */}
      {/* ========================================================================= */}
      {gameData.isRoundOver && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="max-w-lg w-full rounded-3xl p-6 sm:p-8 text-center border-2 border-amber-500/50 shadow-2xl shadow-amber-500/30 flex flex-col items-center gap-5 animate-in fade-in zoom-in-95 bg-gradient-to-b from-[#1a1725] to-[#0d0a14]">
            <div className="w-24 h-24 rounded-full flex items-center justify-center shadow-2xl">
              {gameData.matchWinnerId ? (
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-500 flex items-center justify-center text-5xl shadow-2xl shadow-amber-500/40">
                  👑
                </div>
              ) : (
                <img
                  src="/assets/tokens/seal_of_excellence.png"
                  alt="Seal of Excellence"
                  className="w-24 h-24 rounded-full border-2 border-amber-400 shadow-2xl shadow-amber-500/50"
                />
              )}
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-mono font-black text-white uppercase">
                {gameData.matchWinnerId
                  ? 'CHIẾN THẮNG CHUNG CUỘC!'
                  : `KẾT THÚC HIỆP ${gameData.round}!`}
              </h2>
              <p className="text-sm font-mono font-bold text-amber-300 mt-1">
                {gameData.players[gameData.roundWinnerId]?.nickname} thắng hiệp này và nhận 1 Huy Hiệu Xuất Sắc!
              </p>
            </div>

            {/* Bảng tổng kết điểm 2 bên */}
            <div className="w-full grid grid-cols-2 gap-3 bg-black/60 p-4 rounded-2xl border border-amber-500/30 font-mono">
              <div className="p-2 text-center border-r border-white/10">
                <div className="text-xs font-bold text-slate-300 truncate">
                  {myState.nickname} {myState.playerId === gameData.roundWinnerId && '🏆'}
                </div>
                <div className="text-3xl font-black text-white mt-1">{myState.roundScore} đ</div>
                <div className="text-xs text-amber-400 font-bold mt-1 flex items-center justify-center gap-1">
                  <img src="/assets/tokens/seal_of_excellence.png" alt="Seal" className="w-4 h-4 rounded-full" />
                  <span>{myState.sealsOfExcellence}/2 Huy hiệu</span>
                </div>
              </div>

              <div className="p-2 text-center">
                <div className="text-xs font-bold text-slate-300 truncate">
                  {opponentState?.nickname} {opponentState?.playerId === gameData.roundWinnerId && '🏆'}
                </div>
                <div className="text-3xl font-black text-white mt-1">
                  {opponentState?.roundScore || 0} đ
                </div>
                <div className="text-xs text-amber-400 font-bold mt-1 flex items-center justify-center gap-1">
                  <img src="/assets/tokens/seal_of_excellence.png" alt="Seal" className="w-4 h-4 rounded-full" />
                  <span>{opponentState?.sealsOfExcellence || 0}/2 Huy hiệu</span>
                </div>
              </div>
            </div>

            {/* Nút hành động */}
            {gameData.matchWinnerId ? (
              isHost ? (
                <button
                  onClick={returnToLobby}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-mono font-black text-sm uppercase tracking-wider shadow-xl shadow-amber-500/30 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>QUAY VỀ SẢNH CHỜ (LOBBY)</span>
                </button>
              ) : (
                <div className="text-xs font-mono text-slate-400 italic">
                  Chờ Chủ phòng đưa về lại Sảnh chờ để bắt đầu ván mới...
                </div>
              )
            ) : (
              <button
                onClick={handleNextRound}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-mono font-black text-sm uppercase tracking-wider shadow-xl shadow-emerald-500/30 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>BẮT ĐẦU HIỆP {gameData.round + 1}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

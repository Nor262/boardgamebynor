'use client';

import React, { useEffect, useState } from 'react';
import { HexCard, HexGameEvent } from '../types';
import { HexCardView } from './HexCardView';
import { Skull, FlaskConical, Flame, Sparkles, X, ShieldAlert, Zap, BookOpen, Swords, HeartPulse } from 'lucide-react';

import { getCardTheme, HEX_THEMES, getCardEffectDetails, HEX_EFFECT_INFO, ActiveGameplayDebuff } from '../cardThemes';

interface HexEffectOverlayModalProps {
  event: HexGameEvent | null;
  inspectCard: HexCard | null;
  inspectDebuff?: ActiveGameplayDebuff | null;
  onClose: () => void;
}

export function HexEffectOverlayModal({
  event,
  inspectCard,
  inspectDebuff,
  onClose,
}: HexEffectOverlayModalProps) {
  const [timeLeft, setTimeLeft] = useState(4.5);
  const card = event ? event.card : inspectCard;

  useEffect(() => {
    if (!event) return;
    setTimeLeft(4.5);
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0.1) {
          clearInterval(interval);
          onClose();
          return 0;
        }
        return Math.max(0, prev - 0.1);
      });
    }, 100);

    return () => clearInterval(interval);
  }, [event?.id, event?.timestamp]);

  // If inspecting a debuff directly from the Shadow Area
  if (inspectDebuff) {
    const isJinx = inspectDebuff.type === 'JINX';
    const isDisaster = inspectDebuff.type === 'DISASTER';
    const accentHex = isJinx ? '#a855f7' : isDisaster ? '#f43f5e' : '#f59e0b';

    return (
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none overflow-y-auto"
      >
        <div
          className="absolute inset-0 pointer-events-none opacity-80"
          style={{
            background: `radial-gradient(circle at center, ${accentHex}40 0%, ${accentHex}10 40%, transparent 70%)`,
          }}
        />

        <div
          onClick={(e) => e.stopPropagation()}
          className="relative max-w-xl w-full flex flex-col gap-3.5 p-5 sm:p-6 rounded-lg border-2 bg-gradient-to-b from-[#1c120c] via-[#120b07] to-[#080503] shadow-2xl animate-in zoom-in-90 duration-300"
          style={{
            borderColor: accentHex,
            boxShadow: `0 0 40px ${accentHex}33`,
          }}
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 text-neutral-400 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header */}
          <div className="flex flex-col items-center text-center gap-1 border-b border-white/15 pb-2.5">
            <div className={`px-3 py-1 rounded border font-mono font-black text-xs uppercase tracking-widest flex items-center gap-2 ${inspectDebuff.badgeStyle}`}>
              <span className="text-sm">{inspectDebuff.emoji}</span>
              <span>HIỆU ỨNG ĐANG DÍNH: {inspectDebuff.shortTag}</span>
            </div>
            <h3 className="font-serif font-black text-base text-amber-100 uppercase tracking-wide mt-1">
              {inspectDebuff.name}
            </h3>
          </div>

          {/* Gameplay Rule Body */}
          <div className="flex flex-col gap-3 bg-black/60 border border-white/10 rounded-lg p-3.5">
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-mono font-black text-rose-300 uppercase flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                <span>QUY TẮC HIỆU LỰC & HÌNH PHẠT:</span>
              </span>
              <p className="font-sans text-xs text-neutral-100 leading-relaxed pl-5 bg-rose-950/20 border border-rose-500/20 rounded p-2">
                {inspectDebuff.gameplayRule}
              </p>
            </div>

            <div className="flex flex-col gap-1 pt-1 border-t border-white/10">
              <span className="text-[11px] font-mono font-black text-emerald-300 uppercase flex items-center gap-1.5">
                <FlaskConical className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>ĐIỀU KIỆN GIẢI TRỪ & HỒI PHỤC:</span>
              </span>
              <p className="font-sans text-xs text-neutral-200 leading-relaxed pl-5">
                {inspectDebuff.resolution}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 bg-gradient-to-r from-neutral-800 to-neutral-700 hover:from-neutral-700 hover:to-neutral-600 text-white font-mono font-bold text-xs uppercase rounded transition-colors cursor-pointer border border-white/15 shadow mt-1"
          >
            ĐÃ HIỂU VÀ ĐÓNG
          </button>
        </div>
      </div>
    );
  }

  if (!card) return null;

  const isHex = card.category === 'HEX';
  const isRemedy = card.category === 'REMEDY';
  const isDisaster = card.category === 'DISASTER';
  const isSpell = card.category === 'SPELL';

  // Lấy theme màu tương ứng (Lời nguyền và Thuốc giải cùng màu)
  const theme = getCardTheme(card);
  const effectDetails = getCardEffectDetails(card);

  let titleIcon = Sparkles;
  let defaultTitle = 'CHI TIẾT LÁ BÀI & HIỆU ỨNG GIẢ KIM';

  if (isHex) {
    titleIcon = Skull;
    defaultTitle = 'CHI TIẾT LỜI NGUYỀN & TÁC ĐỘNG';
  } else if (isRemedy) {
    titleIcon = FlaskConical;
    defaultTitle = 'CÔNG THỨC THUỐC GIẢI & HỆ LỤY';
  } else if (isDisaster) {
    titleIcon = Flame;
    defaultTitle = 'ĐẠI HỌA ĐỘC DƯỢC TOÀN BÀN';
  } else if (isSpell) {
    titleIcon = Zap;
    defaultTitle = 'BÙA CHÚ HUYỀN THUẬT GIẢ KIM';
  }

  const TitleIconComponent = titleIcon;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none overflow-y-auto"
    >
      {/* Radial glow background effect */}
      <div
        className="absolute inset-0 pointer-events-none opacity-80"
        style={{
          background: `radial-gradient(circle at center, ${theme.accentHex}40 0%, ${theme.accentHex}10 40%, transparent 70%)`,
        }}
      />

      {/* Main Overlay Modal Container */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-3xl w-full flex flex-col gap-3 p-4 sm:p-6 rounded-lg border-2 bg-gradient-to-b from-[#18130d] via-[#100c08] to-[#070503] shadow-2xl animate-in zoom-in-90 duration-300 max-h-[92vh] overflow-y-auto"
        style={{
          borderColor: theme.accentHex,
          boxShadow: `0 0 50px ${theme.accentHex}33`,
        }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 text-neutral-400 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Event Notification Banner */}
        <div className="flex flex-col items-center text-center gap-1 w-full border-b border-white/15 pb-2.5">
          <div
            className={`px-3 py-1 rounded-xs border font-mono font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-sm ${theme.badgeBg}`}
          >
            <TitleIconComponent className="w-3.5 h-3.5" />
            <span>{event ? event.title : defaultTitle}</span>
          </div>

          {event ? (
            <p className="font-mono text-xs text-amber-200/90 tracking-wide mt-0.5">
              Tác nhân: <span className="text-white font-bold">{event.actorNickname}</span>
              {event.targetNickname ? (
                <>
                  {' '}› Nhắm vào:{' '}
                  <span className="text-rose-400 font-bold">{event.targetNickname}</span>
                </>
              ) : (
                ' › Tác động toàn bàn cờ'
              )}
            </p>
          ) : (
            <p className="font-mono text-[10px] text-amber-500/80 uppercase tracking-wider">
              {theme.colorName} • {card.subtitle}
            </p>
          )}
        </div>

        {/* Side-by-Side: Authentic 2:3 Large Card on Left, Detailed Effect Parchment on Right */}
        <div className="flex flex-col md:flex-row items-center md:items-stretch gap-4 md:gap-5 w-full">
          {/* Left: Centered Large Authentic Card View in strict 2:3 ratio (240x360) */}
          <div className="flex-shrink-0 flex items-center justify-center">
            <HexCardView card={card} size="lg" isPlayable={false} />
          </div>

          {/* Right: Alchemical Grimoire Information Parchment */}
          <div className="flex-1 w-full rounded border border-white/15 bg-black/60 p-3.5 sm:p-4 flex flex-col justify-between gap-2.5">
            {/* Title & Category Tag */}
            <div className="flex items-center justify-between border-b border-white/15 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">{effectDetails.emoji}</span>
                <div>
                  <h3
                    className="font-mono font-black text-sm uppercase tracking-wider leading-none"
                    style={{ color: theme.accentHex }}
                  >
                    {card.name}
                  </h3>
                  <span className="font-mono text-[10px] text-neutral-400 italic">
                    {card.subtitle}
                  </span>
                </div>
              </div>
              <span className={`text-[8px] font-mono px-2 py-0.5 rounded font-black uppercase ${theme.badgeBg}`}>
                {theme.categoryLabel}
              </span>
            </div>

            {/* Panel 1: "MÌNH ĐANG BỊ DÍNH HIỆU ỨNG GÌ" */}
            <div className="p-2.5 rounded border border-rose-500/30 bg-gradient-to-r from-rose-950/40 via-black/40 to-black/40 flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-rose-300 font-mono font-bold text-xs uppercase">
                <HeartPulse className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                <span>NẾU BẠN BỊ DÍNH HIỆU ỨNG NÀY:</span>
              </div>
              <p className="font-sans text-xs text-neutral-200 leading-relaxed pl-5">
                {effectDetails.afflictedInfo}
              </p>
            </div>

            {/* Panel 2: "LÁ BÀI NÀY GÂY CHO ĐỐI THỦ HIỆU ỨNG GÌ" */}
            <div className="p-2.5 rounded border border-amber-500/30 bg-gradient-to-r from-amber-950/40 via-black/40 to-black/40 flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-amber-300 font-mono font-bold text-xs uppercase">
                <Swords className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <span>KHI DÙNG GÂY CHO ĐỐI THỦ HIỆU ỨNG GÌ:</span>
              </div>
              <p className="font-sans text-xs text-neutral-200 leading-relaxed pl-5">
                {effectDetails.inflictedInfo}
              </p>
            </div>

            {/* Panel 3: "CÁCH HÓA GIẢI & TÁC DỤNG PHỤ LIÊN ĐỚI" */}
            <div className="p-2.5 rounded border border-white/10 bg-black/40 flex flex-col gap-1.5 text-xs font-mono">
              <div className="flex items-start gap-2">
                <FlaskConical className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-emerald-300 font-bold uppercase">Cách hóa giải: </span>
                  <span className="text-neutral-200 font-sans">{effectDetails.cureInfo}</span>
                </div>
              </div>

              {effectDetails.sideEffectInfo.length > 0 && (
                <div className="flex items-start gap-2 pt-1 border-t border-white/10">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-amber-300 font-bold uppercase">Hệ lụy / Rủi ro: </span>
                    <span className="text-amber-100 font-sans">{effectDetails.sideEffectInfo[0]}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Auto Dismiss Progress Bar (for live events) */}
        {event ? (
          <div className="w-full flex items-center justify-between gap-3 text-[11px] font-mono text-neutral-400 pt-1">
            <div className="flex-1 h-1 bg-neutral-800 rounded-full overflow-hidden">
              <div
                className="h-full transition-all duration-100 ease-linear"
                style={{
                  backgroundColor: theme.accentHex,
                  width: `${(timeLeft / 4.5) * 100}%`,
                }}
              />
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-amber-300 hover:text-white underline cursor-pointer text-[10px] uppercase font-bold"
            >
              ĐÓNG NGAY
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 bg-gradient-to-r from-neutral-800 to-neutral-700 hover:from-neutral-700 hover:to-neutral-600 text-white font-mono font-bold text-xs uppercase rounded transition-colors cursor-pointer mt-1 border border-white/10 shadow"
          >
            ĐÃ HIỂU VÀ ĐÓNG
          </button>
        )}
      </div>
    </div>
  );
}


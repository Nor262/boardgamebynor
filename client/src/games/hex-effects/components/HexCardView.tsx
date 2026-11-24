'use client';

import React from 'react';
import { HexCard } from '../types';
import {
  FlaskConical,
  Skull,
  Sparkles,
  Flame,
  ShieldAlert,
  Check,
  ArrowRight,
  Eye,
  CheckCircle2,
} from 'lucide-react';

import { getCardTheme, HEX_THEMES, getCardEffectDetails, HEX_EFFECT_INFO } from '../cardThemes';

export interface HexCardViewProps {
  card: HexCard;
  isSelected?: boolean;
  onClick?: () => void;
  isPlayable?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  actionLabel?: string;
  onActionClick?: (e: React.MouseEvent) => void;
  onInspectClick?: (e: React.MouseEvent) => void;
  // Slot & Unified Tabletop Display Props
  slotNumber?: number;
  isTreated?: boolean;
  treatedBy?: HexCard | null;
  highlightAction?: 'treat' | 'inflict' | null;
  tooltipPlacement?: 'top' | 'bottom';
  isMySlot?: boolean;
}

export function HexCardView({
  card,
  isSelected = false,
  onClick,
  isPlayable = true,
  disabled = false,
  size = 'md',
  actionLabel,
  onActionClick,
  onInspectClick,
  slotNumber,
  isTreated = false,
  treatedBy,
  highlightAction,
  tooltipPlacement = 'top',
  isMySlot = true,
}: HexCardViewProps) {
  const isRemedy = card.category === 'REMEDY';
  const isHex = card.category === 'HEX';
  const isSpell = card.category === 'SPELL';
  const isDisaster = card.category === 'DISASTER';

  // Lấy theme màu tương ứng (Lời nguyền và Thuốc giải cùng màu)
  const theme = getCardTheme(card);

  // Lấy chi tiết thông tin hiệu ứng (mình đang dính gì, gây cho người khác gì)
  const effectDetails = getCardEffectDetails(card, {
    isAfflicted: slotNumber !== undefined && !isTreated,
    slotTreated: isTreated,
  });

  const CategoryIcon = isRemedy
    ? FlaskConical
    : isHex
    ? Skull
    : isDisaster
    ? Flame
    : Sparkles;

  // Strict uniform 2:3 aspect ratio sizing classes (2 width : 3 height)
  const sizeClasses = {
    sm: 'w-[76px] min-w-[76px] max-w-[76px] h-[114px] min-h-[114px] max-h-[114px] p-1 text-[7.5px]',
    md: 'w-[104px] min-w-[104px] max-w-[104px] h-[156px] min-h-[156px] max-h-[156px] p-1.5 text-[8.5px]',
    lg: 'w-[240px] min-w-[240px] max-w-[240px] h-[360px] min-h-[360px] max-h-[360px] p-3 text-xs',
  };

  // Comprehensive fallback image mapping for all 8 Hexes, 9 Remedies, Spells & Disasters
  const getCardImage = () => {
    if (card.image) return card.image;
    if (card.spellEffect === 'DEUS_HEX_MACHINA') return '/assets/games/hex-effects/deus_hex_machina.jpg';
    if (card.spellEffect === 'JINX_SILENCE') return '/assets/games/hex-effects/jinx.jpg';
    if (card.category === 'DISASTER') return '/assets/games/hex-effects/disaster.jpg';

    if (isRemedy) {
      switch (card.curesHex) {
        case 'hanahaki': return '/assets/games/hex-effects/phoenix_tears.jpg';
        case 'polymelia': return '/assets/games/hex-effects/wolfsbane.jpg';
        case 'whisper_war': return '/assets/games/hex-effects/wiggenweld.jpg';
        case 'toad_skin': return '/assets/games/hex-effects/bezoar.jpg';
        case 'stone_hands': return '/assets/games/hex-effects/mandrake.jpg';
        case 'bleeding_eyes': return '/assets/games/hex-effects/dittany.jpg';
        case 'rat_plague': return '/assets/games/hex-effects/pepperup.jpg';
        case 'rotting_breath': return '/assets/games/hex-effects/mortal_miasma.jpg';
        case 'ANY':
        default: return '/assets/games/hex-effects/snake_oil.jpg';
      }
    }

    if (isHex) {
      switch (card.hexType) {
        case 'hanahaki': return '/assets/games/hex-effects/hanahaki.jpg';
        case 'polymelia': return '/assets/games/hex-effects/polymelia.jpg';
        case 'whisper_war': return '/assets/games/hex-effects/whisper_war.jpg';
        case 'toad_skin': return '/assets/games/hex-effects/toad_skin.jpg';
        case 'stone_hands': return '/assets/games/hex-effects/petrificus.jpg';
        case 'bleeding_eyes': return '/assets/games/hex-effects/blood_tears.jpg';
        case 'rat_plague': return '/assets/games/hex-effects/black_death.jpg';
        case 'rotting_breath': return '/assets/games/hex-effects/mortal_miasma.jpg';
        default: return '/assets/games/hex-effects/hanahaki.jpg';
      }
    }

    return '/assets/games/hex-effects/jinx.jpg';
  };

  const imageUrl = getCardImage();

  return (
    <div
      onClick={!disabled ? onClick : undefined}
      className={`group relative rounded border-2 bg-gradient-to-b ${theme.bgGradient} flex flex-col justify-between select-none transition-all duration-200 ${
        sizeClasses[size]
      } ${
        highlightAction === 'treat'
          ? 'border-amber-400 ring-2 ring-amber-400/90 shadow-[0_0_20px_rgba(250,204,21,0.5)] animate-pulse -translate-y-1 z-10'
          : highlightAction === 'inflict'
          ? 'border-rose-500 ring-2 ring-rose-500/90 shadow-[0_0_20px_rgba(244,63,94,0.5)] animate-pulse -translate-y-1 z-10'
          : isSelected
          ? `${theme.selectedBorderColor} ring-2 ${theme.ringColor} -translate-y-2 z-20 ${theme.glowColor}`
          : isTreated
          ? 'border-emerald-500/80 shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:-translate-y-0.5'
          : `${theme.borderColor} hover:-translate-y-0.5 hover:shadow-xl`
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      style={{
        boxShadow: isSelected ? undefined : '0 4px 15px rgba(0,0,0,0.6)',
      }}
    >
      {/* 1. Full 2:3 Portrait Artwork Background (100% Uncompressed 2:3 Aspect Ratio) */}
      <div className="absolute inset-0 z-0 overflow-hidden rounded-[2px] bg-black">
        <img
          src={imageUrl}
          alt={card.name}
          className="w-full h-full object-cover object-center filter contrast-110 sepia-[0.10] group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Vintage Vignette & Parchment Tint: ensures text legibility at top & bottom */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/25 to-black/95 pointer-events-none" />

        {/* Stamped Wax Seal Overlay Badge when treated */}
        {isTreated && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <div className="bg-emerald-950/95 border-2 border-emerald-400 text-emerald-200 font-mono font-black text-[7px] sm:text-[8px] px-1.5 py-0.5 rounded shadow-xl uppercase tracking-wider flex items-center gap-1 backdrop-blur-xs transform -rotate-12">
              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-300" />
              <span>ĐÃ GIẢI</span>
            </div>
          </div>
        )}
      </div>

      {/* Antique Brass Corner Inlays */}
      <div className="absolute top-0.5 left-0.5 w-1.5 h-1.5 border-t border-l border-amber-400/60 pointer-events-none z-20" />
      <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 border-t border-r border-amber-400/60 pointer-events-none z-20" />
      <div className="absolute bottom-0.5 left-0.5 w-1.5 h-1.5 border-b border-l border-amber-400/60 pointer-events-none z-20" />
      <div className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 border-b border-r border-amber-400/60 pointer-events-none z-20" />

      {/* 2. Top Header Ribbon (Title, Slot Tag & Symbol) */}
      <div className="relative z-10 flex-shrink-0 bg-black/75 backdrop-blur-xs p-1 rounded-t border-b border-white/15">
        <div className="flex items-center justify-between gap-0.5 mb-0.5">
          <div className="flex items-center gap-1 min-w-0">
            {slotNumber !== undefined ? (
              /* Shadow Slot Tag: Clean slot number & status */
              <div className="flex items-center gap-0.5 truncate">
                <span className="font-mono font-black text-[6.5px] sm:text-[7.5px] px-1 py-0.2 rounded-xs bg-amber-400 text-black uppercase tracking-tight flex-shrink-0 shadow-xs">
                  Ô {slotNumber}
                </span>
                <span
                  className={`font-mono font-bold text-[6.5px] sm:text-[7px] px-1 py-0.2 rounded-xs flex items-center gap-0.5 truncate border ${
                    isTreated
                      ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/80'
                      : 'bg-rose-950/90 text-rose-300 border-rose-500/80'
                  }`}
                >
                  {isTreated ? 'ĐÃ GIẢI' : 'NGUYỀN'}
                </span>
              </div>
            ) : (
              /* Standard Card Category Badge with Icon */
              <span
                className={`font-mono font-black text-[6.5px] sm:text-[7.5px] px-1 py-0.2 uppercase tracking-wider flex items-center gap-0.5 rounded-xs truncate ${
                  theme.badgeBg
                }`}
              >
                <CategoryIcon className="w-2.5 h-2.5 flex-shrink-0" />
                <span className="truncate max-w-[48px] sm:max-w-[62px]">
                  {isRemedy
                    ? card.curesHex === 'ANY'
                      ? 'VẠN NĂNG'
                      : 'THUỐC'
                    : isHex
                    ? 'NGUYỀN'
                    : isSpell
                    ? 'BÙA'
                    : 'THẢM HỌA'}
                </span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-0.5 flex-shrink-0">
            {onInspectClick && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onInspectClick(e);
                }}
                title="Bấm vào để xem chi tiết toàn màn hình"
                className="w-3.5 h-3.5 rounded text-neutral-400 hover:text-white hover:bg-white/20 flex items-center justify-center cursor-pointer transition-colors"
              >
                <Eye className="w-2 h-2" />
              </button>
            )}

            {isSelected && (
              <div className="w-3.5 h-3.5 bg-amber-400 text-black flex items-center justify-center font-bold text-[8px] rounded-full">
                <Check className="w-2 h-2 stroke-[3]" />
              </div>
            )}
          </div>
        </div>

        {/* Card Title Ribbon */}
        <h4 className={`font-mono font-black uppercase tracking-tight leading-none truncate ${theme.titleColor} text-[7.5px] sm:text-[9px]`}>
          {card.name.split(' (')[0]}
        </h4>
      </div>

      {/* 3. Center Art Spacer: Unobstructed view of the 2:3 illustration */}
      <div className="flex-1 w-full min-h-[30px] flex items-center justify-center relative pointer-events-none" />

      {/* 4. Bottom Info Plaque / Action Button */}
      <div className="relative z-10 flex-shrink-0 flex flex-col gap-0.5 bg-black/80 backdrop-blur-xs p-1 rounded-b border-t border-white/15">
        {/* If treated, show who cured it */}
        {isTreated && treatedBy ? (
          <div className="text-[6.5px] sm:text-[7.5px] font-mono text-emerald-300 truncate font-semibold bg-black/60 px-1 py-0.2 rounded border border-emerald-500/40">
            Giải: <span className="text-white">{treatedBy.name.split(' (')[0]}</span>
          </div>
        ) : isRemedy && card.sideEffects && card.sideEffects.length > 0 && size !== 'sm' ? (
          /* Side Effects Tags if Remedy */
          <div className="flex items-center gap-0.5 text-[7px] bg-black/70 border border-white/10 px-1 py-0.2 rounded overflow-hidden">
            <ShieldAlert className="w-2 h-2 text-amber-400 flex-shrink-0" />
            <span className="text-amber-200 font-mono font-bold text-[6px]">HỆ LỤY:</span>
            <div className="flex gap-0.5 overflow-hidden truncate">
              {card.sideEffects.map((eff, idx) => {
                const effTheme = HEX_THEMES[eff];
                const effInfo = HEX_EFFECT_INFO[eff];
                return (
                  <span
                    key={idx}
                    className={`font-mono text-[6px] px-0.5 rounded border uppercase truncate ${
                      effTheme ? effTheme.tagBg : 'bg-neutral-800 text-neutral-300'
                    }`}
                  >
                    +{effInfo ? `${effInfo.emoji}${effInfo.tagShort.substring(0, 4)}` : eff}
                  </span>
                );
              })}
            </div>
          </div>
        ) : (
          /* Short Lore / Description for medium and large sizes */
          size !== 'sm' && !actionLabel && (
            <p className={`text-neutral-300 font-sans leading-tight ${
              size === 'md' ? 'text-[7px] line-clamp-1' : 'text-xs line-clamp-3'
            }`}>
              {card.description}
            </p>
          )
        )}

        {/* Action Button (if provided) */}
        {actionLabel && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onActionClick) onActionClick(e);
            }}
            disabled={disabled}
            className={`w-full py-0.5 sm:py-0.8 font-mono font-black text-[7.5px] sm:text-[8.5px] uppercase border tracking-wider transition-all flex items-center justify-center gap-0.5 rounded-xs cursor-pointer shadow text-white hover:brightness-110 active:scale-95 ${
              highlightAction === 'treat'
                ? 'bg-amber-500 border-yellow-300 text-black shadow-[0_0_10px_rgba(251,191,36,0.8)]'
                : highlightAction === 'inflict'
                ? 'bg-rose-600 border-rose-400 text-white shadow-[0_0_10px_rgba(244,63,94,0.8)]'
                : ''
            }`}
            style={{
              backgroundColor: !highlightAction ? theme.accentHex : undefined,
              borderColor: !highlightAction ? theme.accentHex : undefined,
            }}
          >
            <span>{actionLabel}</span>
            <ArrowRight className="w-2 h-2" />
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* ALCHEMICAL HOVER POPOVER (HIỆN MÔ TẢ HIỆU ỨNG CHI TIẾT KHI HOVER) */}
      {/* ========================================================================= */}
      <div
        className={`absolute ${
          tooltipPlacement === 'bottom'
            ? 'top-[calc(100%+6px)]'
            : 'bottom-[calc(100%+6px)]'
        } left-1/2 -translate-x-1/2 w-64 max-w-[85vw] p-2.5 rounded-lg border-2 bg-gradient-to-b from-[#1a120c] via-[#120c08] to-[#080503] text-neutral-100 shadow-[0_12px_32px_rgba(0,0,0,0.95)] z-50 pointer-events-none opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-200 backdrop-blur-md flex flex-col gap-1.5`}
        style={{
          borderColor: theme.accentHex,
          boxShadow: `0 8px 30px rgba(0,0,0,0.9), 0 0 15px ${theme.accentHex}40`,
        }}
      >
        {/* Tooltip Header */}
        <div className="flex items-center justify-between border-b border-white/15 pb-1 gap-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-base flex-shrink-0">{effectDetails.emoji}</span>
            <span className="font-mono font-black text-[11px] uppercase truncate" style={{ color: theme.accentHex }}>
              {card.name.split(' (')[0]}
            </span>
          </div>
          <span className={`text-[7.5px] font-mono px-1.5 py-0.2 rounded font-bold uppercase flex-shrink-0 ${theme.badgeBg}`}>
            {theme.categoryLabel}
          </span>
        </div>

        {/* Section 1: Affliction info (Đang bị dính gì) or Infliction info (Gây cho đối thủ gì) */}
        {slotNumber !== undefined ? (
          <div className="bg-black/60 border border-white/10 rounded p-1.5 flex flex-col gap-0.5">
            <span className={`text-[8.5px] font-mono font-bold uppercase flex items-center gap-1 ${
              isTreated ? 'text-emerald-300' : 'text-rose-300 animate-pulse'
            }`}>
              {isTreated
                ? '✅ TRẠNG THÁI HIỆN TẠI: ĐÃ HÓA GIẢI'
                : isMySlot
                ? '⚠️ BẠN ĐANG MẮC PHẢI HIỆU ỨNG:'
                : '⚠️ ĐỐI THỦ ĐANG DÍNH HIỆU ỨNG:'}
            </span>
            <p className="text-[9.5px] font-sans text-neutral-200 leading-snug">
              {isTreated && treatedBy
                ? `Đã được chữa bằng lá [${treatedBy.name.split(' (')[0]}]. Không còn tác động trực tiếp, nhưng để lại di chứng dược liệu (tác dụng phụ) trên ô này!`
                : effectDetails.afflictedInfo}
            </p>
          </div>
        ) : (
          <div className="bg-black/60 border border-white/10 rounded p-1.5 flex flex-col gap-0.5">
            <span className="text-[8.5px] font-mono font-bold text-amber-300 uppercase flex items-center gap-1">
              {isHex ? '⚔️ GÂY CHO ĐỐI THỦ HIỆU ỨNG GÌ:' : isRemedy ? '🛡️ TÁC DỤNG LÊN BẢN THÂN:' : '✨ TÁC ĐỘNG LÊN ĐỐI THỦ:'}
            </span>
            <p className="text-[9.5px] font-sans text-neutral-200 leading-snug">
              {effectDetails.inflictedInfo}
            </p>
          </div>
        )}

        {/* Section 2: Cure Requirements or Counter Strategy */}
        <div className="text-[9px] font-mono text-neutral-300 flex flex-col gap-0.5 pt-0.5">
          <div className="flex items-start gap-1 text-amber-200">
            <span className="font-bold flex-shrink-0">❖ Cách giải:</span>
            <span className="text-neutral-300 font-sans text-[8.5px]">{effectDetails.cureInfo}</span>
          </div>
          {effectDetails.sideEffectInfo.length > 0 && (
            <div className="flex items-start gap-1 text-amber-400">
              <span className="font-bold flex-shrink-0">⚠️ Hệ lụy:</span>
              <span className="text-amber-200/90 font-sans text-[8.5px]">{effectDetails.sideEffectInfo[0]}</span>
            </div>
          )}
        </div>

        {/* Tooltip Footer / Click Hint */}
        <div className="mt-0.5 pt-1 border-t border-white/10 flex items-center justify-between text-[8px] font-mono text-neutral-400">
          <span>💡 Nhấp chuột để xem chi tiết</span>
          <span className="text-amber-400 font-bold uppercase">XEM TOÀN BỘ ›</span>
        </div>
      </div>
    </div>
  );
}


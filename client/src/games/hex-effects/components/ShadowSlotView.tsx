'use client';

import React from 'react';
import { ShadowSlot, HexCard } from '../types';
import { HexCardView } from './HexCardView';

interface ShadowSlotViewProps {
  slot: ShadowSlot;
  slotIndex: number;
  isMySlot: boolean;
  size?: 'sm' | 'md' | 'lg';
  canTreatWithCard?: HexCard | null;
  canInflictWithCard?: HexCard | null;
  onTreat?: () => void;
  onInflict?: () => void;
  onInspectCard?: (card: HexCard) => void;
}

export function ShadowSlotView({
  slot,
  slotIndex,
  isMySlot,
  size = 'md',
  canTreatWithCard,
  canInflictWithCard,
  onTreat,
  onInflict,
  onInspectCard,
}: ShadowSlotViewProps) {
  const isTreated = slot.treatedBy !== null;
  // Always use the hex as the identity of the shadow slot, with treatedBy indicating cure
  const baseCard = slot.hex;

  const isDeusMachina = canInflictWithCard?.spellEffect === 'DEUS_HEX_MACHINA';

  const actionLabel =
    isMySlot && !isTreated && canTreatWithCard
      ? 'CHỮA'
      : !isMySlot && canInflictWithCard
      ? isDeusMachina
        ? 'CƯỠNG GIEO'
        : 'PHÁ THUỐC'
      : undefined;

  const handleAction = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (isMySlot && canTreatWithCard && onTreat) {
      onTreat();
    } else if (!isMySlot && canInflictWithCard && onInflict) {
      onInflict();
    }
  };

  return (
    <HexCardView
      card={baseCard}
      size={size}
      slotNumber={slotIndex + 1}
      isTreated={isTreated}
      treatedBy={slot.treatedBy}
      isMySlot={isMySlot}
      tooltipPlacement={isMySlot ? 'top' : 'bottom'}
      highlightAction={canTreatWithCard ? 'treat' : canInflictWithCard ? 'inflict' : null}
      actionLabel={actionLabel}
      onActionClick={handleAction}
      onClick={() => {
        if (canTreatWithCard || canInflictWithCard) {
          handleAction();
        } else if (onInspectCard) {
          onInspectCard(isTreated && slot.treatedBy ? slot.treatedBy : baseCard);
        }
      }}
      onInspectClick={
        onInspectCard
          ? () => onInspectCard(isTreated && slot.treatedBy ? slot.treatedBy : baseCard)
          : undefined
      }
    />
  );
}


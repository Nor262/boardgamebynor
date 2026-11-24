export type HexType =
  | 'hanahaki'
  | 'polymelia'
  | 'whisper_war'
  | 'toad_skin'
  | 'stone_hands'
  | 'bleeding_eyes'
  | 'rat_plague'
  | 'rotting_breath';

export type CardCategory = 'HEX' | 'REMEDY' | 'SPELL' | 'DISASTER';

export interface HexCard {
  id: string;
  category: CardCategory;
  name: string;
  subtitle: string;
  description: string;
  image?: string;
  hexType?: HexType;
  curesHex?: HexType | 'ANY';
  sideEffects?: HexType[];
  spellEffect?: 'STEAL_CARD' | 'PURIFY_REMEDY' | 'SWAP_HEX' | 'CORRUPT_SHADOW' | 'JINX_SILENCE' | 'DEUS_HEX_MACHINA';
  disasterEffect?: 'OUTBREAK' | 'POISON_MIST' | 'PANIC_DISCARD';
  rarity?: 'common' | 'rare' | 'mythic';
}

export interface ShadowSlot {
  slotId: string;
  hex: HexCard;
  treatedBy: HexCard | null;
}

export interface PlayerHexState {
  playerId: string;
  nickname: string;
  avatarSeed: string;
  isHost: boolean;
  isReady: boolean;
  hand: HexCard[];
  shadow: ShadowSlot[];
  isJinxed?: boolean;
}

export interface HexGameEvent {
  id: string;
  card: HexCard;
  actionType: 'TREAT' | 'INFLICT' | 'SPELL' | 'DISASTER' | 'DISCARD';
  actorNickname: string;
  targetNickname?: string;
  title: string;
  description: string;
  timestamp: number;
}

export interface HexEffectsGameState {
  turnOrder: string[];
  currentTurnPlayerId: string;
  actionsLeft: number;
  turnCount: number;
  deck: HexCard[];
  discardPile: HexCard[];
  players: Record<string, PlayerHexState>;
  winnerId: string | null;
  winnerSummary: string | null;
  gameLogs: string[];
  recentEvent?: HexGameEvent;
}

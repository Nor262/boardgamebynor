import { Player } from '@boardgame/shared';

export type HexType =
  | 'hanahaki'        // Lời nguyền hoa nở trong phổi (Authentic Hex Effects)
  | 'polymelia'       // Lời nguyền mọc thêm tay (Authentic Hex Effects)
  | 'whisper_war'     // Tiếng thì thầm tà thuật (Authentic Hex Effects)
  | 'toad_skin'       // Da cóc xù xì
  | 'stone_hands'     // Bàn tay hóa đá
  | 'bleeding_eyes'   // Mắt rỉ máu
  | 'rat_plague'      // Dịch chuột gặm nhấm
  | 'rotting_breath'; // Hơi thở tử khí

export type CardCategory = 'HEX' | 'REMEDY' | 'SPELL' | 'DISASTER';

export interface HexCard {
  id: string;
  category: CardCategory;
  name: string;
  subtitle: string;
  description: string;
  image?: string;
  hexType?: HexType;              // Nếu là HEX: loại lời nguyền
  curesHex?: HexType | 'ANY';     // Nếu là REMEDY: chữa loại lời nguyền nào (SNAKE OIL chữa ANY)
  sideEffects?: HexType[];        // Nếu là REMEDY: tác dụng phụ để lại (đối thủ có thể gieo lời nguyền này lên bạn)
  spellEffect?: 'STEAL_CARD' | 'PURIFY_REMEDY' | 'SWAP_HEX' | 'CORRUPT_SHADOW' | 'JINX_SILENCE' | 'DEUS_HEX_MACHINA';
  disasterEffect?: 'OUTBREAK' | 'POISON_MIST' | 'PANIC_DISCARD';
  disasterPunishment?: 'DISCARD_1' | 'STEAL_1' | 'SKIP_DRAW' | 'DISCARD_TO_1' | 'LOSE_ACTION' | 'DISCARD_2' | 'CASTER_DRAW_2' | 'DESTROY_REMEDY';
  rarity?: 'common' | 'rare' | 'mythic';
}

export interface ShadowSlot {
  slotId: string;
  hex: HexCard;                   // Lá bài Lời nguyền trong ô
  treatedBy: HexCard | null;      // Lá bài Thuốc giải đã đặt lên (nếu null = chưa chữa)
}

export interface PlayerHexState {
  playerId: string;
  nickname: string;
  avatarSeed: string;
  isHost: boolean;
  isReady: boolean;
  hand: HexCard[];                // Bài trên tay (được giấu đối thủ trong getPlayerView)
  shadow: ShadowSlot[];           // Vùng Bóng Tối: khởi đầu 4 ô Lời nguyền (có thể tăng thêm khi bị ném Hex)
  isJinxed?: boolean;             // True nếu bị trúng bùa JINX: cấm dùng Thuốc Giải trong lượt này
  skipNextDraw?: boolean;         // True nếu dính trừng phạt: không thể rút bài ở đầu lượt kế tiếp
  loseNextAction?: boolean;       // True nếu dính trừng phạt: mất 1 hành động ở lượt kế tiếp
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
  actionsLeft: number;            // Mặc định 2 hành động mỗi lượt
  turnCount: number;
  deck: HexCard[];
  discardPile: HexCard[];
  players: Record<string, PlayerHexState>;
  winnerId: string | null;
  winnerSummary: string | null;
  gameLogs: string[];
  recentEvent?: HexGameEvent;
  pendingDisaster?: {
    casterId: string;
    targetId: string;
    targetSlotIndex: number;
    card: HexCard;
    timestamp: number;
  } | null;
}

export type HexEffectsAction =
  | { type: 'TREAT_HEX'; slotIndex: number; cardId: string }
  | { type: 'INFLICT_HEX'; targetPlayerId: string; targetSlotIndex?: number; cardId: string }
  | { type: 'DISASTER_TARGET'; targetPlayerId: string; targetSlotIndex: number; cardId: string }
  | { type: 'RESPOND_JINX'; useJinx: boolean; jinxCardId?: string }
  | { type: 'ALCHEMY_DRAW'; cardIds: string[] }
  | { type: 'ALCHEMY_STEAL_REMEDY'; cardIds: string[]; targetPlayerId: string; targetSlotIndex: number }
  | { type: 'PLAY_SPELL'; cardId: string; targetPlayerId?: string; targetSlotIndex?: number; chosenHexCardId?: string }
  | { type: 'DISCARD_AND_DRAW'; cardIds: string[] }
  | { type: 'DISCARD_EXCESS'; cardIds: string[] }
  | { type: 'END_TURN' };


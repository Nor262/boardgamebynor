export type TileType = 'START' | 'NORMAL' | 'BOOST' | 'TRAP' | 'LUCKY' | 'GOAL';

export interface BoardTile {
  index: number;
  type: TileType;
  label: string;
}

export type SkillCardType = 'BOOST_3' | 'SHIELD' | 'SWAP';

export interface SkillCard {
  id: string;
  type: SkillCardType;
  name: string;
  description: string;
}

export interface PlayerRaceState {
  playerId: string;
  nickname: string;
  position: number;           // Vị trí từ 0 đến 19
  hasShield: boolean;         // Có khiên chắn bẫy không
  hand: SkillCard[];          // Thẻ bài bí mật trên tay (chỉ bản thân thấy)
  isWinner: boolean;
}

export interface RaceGameState {
  tiles: BoardTile[];
  players: Record<string, PlayerRaceState>;
  turnOrder: string[];        // Danh sách playerId theo thứ tự lượt đi
  currentTurnIndex: number;   // Chỉ số người chơi đang tới lượt
  lastDiceRoll?: {
    playerId: string;
    value: number;
  };
  hasRolledThisTurn: boolean;
  winnerId?: string;
  gameLogs: string[];
}

export type RaceAction =
  | { type: 'ROLL_DICE' }
  | { type: 'USE_CARD'; cardId: string }
  | { type: 'END_TURN' };

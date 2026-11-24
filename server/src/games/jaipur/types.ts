export type GoodsType = 'DIAMOND' | 'GOLD' | 'SILVER' | 'CLOTH' | 'SPICE' | 'LEATHER';
export type CardType = GoodsType | 'CAMEL';

export interface JaipurCard {
  id: string;
  type: CardType;
}

export interface PlayerJaipurState {
  playerId: string;
  nickname: string;
  hand: JaipurCard[];          // Các lá hàng hóa trên tay (tối đa 7 lá) - BẢO MẬT
  camels: number;              // Số lượng lạc đà trong đàn (công khai)
  tokens: {
    goods: { type: GoodsType; value: number }[];
    bonus3: number[];
    bonus4: number[];
    bonus5: number[];
    camelBonus?: number;
  };
  roundScore: number;          // Điểm số vòng hiện tại
  sealsOfExcellence: number;   // Số huy hiệu xuất sắc (thắng 2 huy hiệu là thắng cả trận)
}

export interface JaipurGameState {
  deck: JaipurCard[];
  market: JaipurCard[];        // Luôn có 5 lá ở chợ
  goodsTokens: Record<GoodsType, number[]>; // Chồng xu điểm còn lại theo thứ tự từ trên xuống
  bonusTokens: {
    bonus3: number[];
    bonus4: number[];
    bonus5: number[];
  };
  players: Record<string, PlayerJaipurState>;
  turnOrder: [string, string]; // Đúng 2 người chơi
  currentTurnIndex: number;
  round: number;               // Vòng đấu hiện tại (Hiệp 1, 2, 3)
  roundWinnerId?: string;
  matchWinnerId?: string;
  isRoundOver: boolean;
  gameLogs: string[];
}

export type JaipurAction =
  | { type: 'TAKE_SINGLE'; marketCardId: string }
  | { type: 'TAKE_CAMELS' }
  | {
      type: 'EXCHANGE';
      takeMarketIds: string[];  // Các lá muốn lấy từ chợ
      giveHandIds: string[];    // Các lá từ tay muốn bỏ lại chợ
      giveCamelsCount: number;  // Số lạc đà muốn bỏ lại chợ
    }
  | {
      type: 'SELL';
      cardIds: string[];        // Các lá muốn bán (phải cùng loại)
    }
  | { type: 'NEXT_ROUND' };

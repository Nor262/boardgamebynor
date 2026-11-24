import { Player } from './room';

export interface GameMetadata {
  id: string;
  name: string;
  description: string;
  minPlayers: number;
  maxPlayers: number;
  estimatedMinutes: number;
  icon: string;               // Tên biểu tượng (lucide-react)
  tags: string[];
  image?: string;
  tagline?: string;
  status?: 'ready' | 'beta' | 'coming_soon';
}

export interface GameActionResult<TState> {
  nextState: TState;
  gameLog: string;
  broadcastAction?: any;
}

export interface GameOverResult {
  isOver: boolean;
  winners?: string[];         // Mảng ID các người chơi chiến thắng
  summary?: string;           // Tóm tắt kết quả
}

export interface BoardGamePlugin<TState = any, TAction = any> {
  metadata: GameMetadata;

  /**
   * Khởi tạo bàn cờ ban đầu từ danh sách người chơi
   */
  initGame(players: Player[]): TState;

  /**
   * Kiểm tra nước đi có hợp lệ hay không (đúng lượt, đúng bài, v.v.)
   */
  validateAction(state: TState, playerId: string, action: TAction): boolean;

  /**
   * Áp dụng nước đi, tính toán state mới và log sự kiện
   */
  applyAction(state: TState, playerId: string, action: TAction): GameActionResult<TState>;

  /**
   * Bộ lọc dữ liệu mật theo góc nhìn của từng người chơi
   * Giấu bài trên tay đối thủ, chỉ gửi thông tin công khai + bài của chính mình
   */
  getPlayerView(state: TState, playerId: string): any;

  /**
   * Kiểm tra điều kiện kết thúc trận đấu
   */
  checkGameOver(state: TState): GameOverResult;
}

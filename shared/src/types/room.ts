export type PlayerRole = 'PLAYER' | 'SPECTATOR';

export interface Player {
  id: string;                 // Socket ID hoặc UUID
  sessionToken: string;       // Token dùng để reconnect khi F5/rớt mạng
  nickname: string;           // Tên hiển thị của người chơi
  isHost: boolean;            // Quyền chủ phòng
  isReady: boolean;           // Trạng thái đã sẵn sàng chưa (Host luôn là true)
  avatarSeed: string;         // Seed để render avatar vui nhộn
  connected: boolean;         // Đang online hay tạm thời ngắt kết nối
  role: PlayerRole;           // Đang ngồi vào bàn chơi (PLAYER) hay đang xem (SPECTATOR)
}

export type ChatMessageType = 'TEXT' | 'STICKER' | 'SYSTEM';

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  type: ChatMessageType;
  content: string;            // Nội dung tin nhắn hoặc mã sticker/emoji
  timestamp: number;
}

export type RoomStatus = 'LOBBY' | 'IN_GAME' | 'FINISHED';

export interface RoomState {
  code: string;               // Mã phòng 6 ký tự (VD: "BG-9281")
  hostId: string;             // ID của chủ phòng
  status: RoomStatus;
  selectedGameId: string;     // ID trò chơi đang chọn
  maxPlayers: number;         // Giới hạn số người chơi do Host thiết lập
  players: Player[];          // Danh sách người chơi trực tiếp
  spectators: Player[];       // Khán giả ngồi ngoài xem
  chat: ChatMessage[];        // Lịch sử chat và hoạt động phòng
  gameData?: any;             // Trạng thái bàn cờ đã được bảo mật qua getPlayerView
}

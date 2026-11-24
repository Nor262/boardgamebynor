import {
  ChatMessage,
  Player,
  PlayerRole,
  RoomState,
} from '@boardgame/shared';
import { GameRegistry } from '../engine/game-registry';
import { SessionManager } from './session-manager';

export interface InternalRoomState extends RoomState {
  rawGameState?: any;         // Dữ liệu bàn cờ đầy đủ gốc (chưa lọc)
  lastActivity: number;
}

export class RoomManager {
  private rooms = new Map<string, InternalRoomState>();

  constructor(
    private gameRegistry: GameRegistry,
    private sessionManager: SessionManager
  ) {}

  generateRoomCode(): string {
    const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const digits = '23456789';
    let code = 'BG-';
    for (let i = 0; i < 2; i++) {
      code += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    for (let i = 0; i < 2; i++) {
      code += digits.charAt(Math.floor(Math.random() * digits.length));
    }
    return code;
  }

  createRoom(
    socketId: string,
    nickname: string,
    avatarSeed: string,
    preferredGameId: string = 'test-race'
  ): { room: RoomState; sessionToken: string; player: Player } {
    let code = this.generateRoomCode();
    while (this.rooms.has(code)) {
      code = this.generateRoomCode();
    }

    const session = this.sessionManager.createSession(socketId, nickname, code, avatarSeed);
    const hostPlayer: Player = {
      id: session.playerId,
      sessionToken: session.sessionToken,
      nickname,
      isHost: true,
      isReady: true,
      avatarSeed,
      connected: true,
      role: 'PLAYER',
    };

    const gameMeta = this.gameRegistry.getMetadata(preferredGameId) || this.gameRegistry.getAllMetadatas()[0];
    const initialMaxPlayers = gameMeta.maxPlayers;

    const initialRoom: InternalRoomState = {
      code,
      hostId: hostPlayer.id,
      status: 'LOBBY',
      selectedGameId: gameMeta.id,
      maxPlayers: initialMaxPlayers,
      players: [hostPlayer],
      spectators: [],
      chat: [
        {
          id: 'sys_' + Date.now(),
          senderId: 'system',
          senderName: 'Hệ thống',
          type: 'SYSTEM',
          content: `Phòng ${code} đã được tạo bởi ${nickname}. Chúc các bạn chơi vui vẻ!`,
          timestamp: Date.now(),
        },
      ],
      lastActivity: Date.now(),
    };

    this.rooms.set(code, initialRoom);
    return {
      room: this.getRoomForPlayer(initialRoom, hostPlayer.id),
      sessionToken: session.sessionToken,
      player: hostPlayer,
    };
  }

  joinRoom(
    socketId: string,
    code: string,
    nickname: string,
    avatarSeed: string
  ): { success: boolean; room?: RoomState; sessionToken?: string; player?: Player; error?: string } {
    const room = this.rooms.get(code.toUpperCase().trim());
    if (!room) {
      return { success: false, error: 'Mã phòng không tồn tại hoặc đã đóng.' };
    }

    const session = this.sessionManager.createSession(socketId, nickname, room.code, avatarSeed);
    let role: PlayerRole = 'PLAYER';

    // Nếu đang trong trận đấu hoặc phòng đã đủ số người chơi tối đa -> vào ghế Khán giả
    if (room.status !== 'LOBBY' || room.players.length >= room.maxPlayers) {
      role = 'SPECTATOR';
    }

    const newPlayer: Player = {
      id: session.playerId,
      sessionToken: session.sessionToken,
      nickname,
      isHost: false,
      isReady: false,
      avatarSeed,
      connected: true,
      role,
    };

    if (role === 'PLAYER') {
      room.players.push(newPlayer);
    } else {
      room.spectators.push(newPlayer);
    }

    room.chat.push({
      id: 'sys_' + Date.now(),
      senderId: 'system',
      senderName: 'Hệ thống',
      type: 'SYSTEM',
      content: `${nickname} đã tham gia phòng ${role === 'SPECTATOR' ? '(hàng ghế Khán giả)' : ''}.`,
      timestamp: Date.now(),
    });

    room.lastActivity = Date.now();

    return {
      success: true,
      room: this.getRoomForPlayer(room, newPlayer.id),
      sessionToken: session.sessionToken,
      player: newPlayer,
    };
  }

  reconnect(sessionToken: string, newSocketId: string): { success: boolean; room?: RoomState; player?: Player } {
    const session = this.sessionManager.updateSocket(sessionToken, newSocketId);
    if (!session) {
      return { success: false };
    }

    const room = this.rooms.get(session.roomCode);
    if (!room) {
      return { success: false };
    }

    let foundPlayer = room.players.find(p => p.id === session.playerId);
    if (!foundPlayer) {
      foundPlayer = room.spectators.find(p => p.id === session.playerId);
    }

    if (!foundPlayer) {
      return { success: false };
    }

    foundPlayer.connected = true;
    room.lastActivity = Date.now();

    return {
      success: true,
      room: this.getRoomForPlayer(room, foundPlayer.id),
      player: foundPlayer,
    };
  }

  handleDisconnect(socketId: string): { roomCode?: string; player?: Player } {
    const session = this.sessionManager.getBySocketId(socketId);
    if (!session) return {};

    const room = this.rooms.get(session.roomCode);
    if (!room) return {};

    let player = room.players.find(p => p.id === session.playerId);
    if (!player) {
      player = room.spectators.find(p => p.id === session.playerId);
    }

    if (player) {
      player.connected = false;
    }

    // Nếu Chủ phòng ngắt kết nối trong lúc ở LOBBY, tự động chuyển Host cho người kế tiếp đang online
    if (player && player.isHost && room.status === 'LOBBY') {
      const nextHost = room.players.find(p => p.connected && p.id !== player!.id);
      if (nextHost) {
        player.isHost = false;
        nextHost.isHost = true;
        nextHost.isReady = true;
        room.hostId = nextHost.id;
        room.chat.push({
          id: 'sys_' + Date.now(),
          senderId: 'system',
          senderName: 'Hệ thống',
          type: 'SYSTEM',
          content: `${nextHost.nickname} được chuyển quyền làm Chủ phòng mới.`,
          timestamp: Date.now(),
        });
      }
    }

    this.sessionManager.removeSocket(socketId);
    return { roomCode: room.code, player };
  }

  leaveRoom(code: string, playerId: string): { success: boolean; roomDeleted?: boolean } {
    const room = this.rooms.get(code);
    if (!room) return { success: false };

    let removedPlayer: Player | undefined;
    const playerIdx = room.players.findIndex(p => p.id === playerId);
    if (playerIdx !== -1) {
      removedPlayer = room.players.splice(playerIdx, 1)[0];
    } else {
      const specIdx = room.spectators.findIndex(p => p.id === playerId);
      if (specIdx !== -1) {
        removedPlayer = room.spectators.splice(specIdx, 1)[0];
      }
    }

    if (!removedPlayer) return { success: false };

    // Xóa session của player
    this.sessionManager.removeSession(removedPlayer.sessionToken);

    // Nếu không còn ai trong phòng, hủy phòng
    if (room.players.length === 0 && room.spectators.length === 0) {
      this.rooms.delete(code);
      return { success: true, roomDeleted: true };
    }

    // Nếu người rời là Host, chuyển quyền cho người chơi kế tiếp
    if (removedPlayer.isHost && room.players.length > 0) {
      const nextHost = room.players.find(p => p.connected) || room.players[0];
      nextHost.isHost = true;
      nextHost.isReady = true;
      room.hostId = nextHost.id;
      room.chat.push({
        id: 'sys_' + Date.now(),
        senderId: 'system',
        senderName: 'Hệ thống',
        type: 'SYSTEM',
        content: `${nextHost.nickname} được chuyển quyền làm Chủ phòng mới.`,
        timestamp: Date.now(),
      });
    }

    room.chat.push({
      id: 'sys_' + Date.now(),
      senderId: 'system',
      senderName: 'Hệ thống',
      type: 'SYSTEM',
      content: `${removedPlayer.nickname} đã rời khỏi phòng.`,
      timestamp: Date.now(),
    });

    room.lastActivity = Date.now();
    return { success: true, roomDeleted: false };
  }

  // --- Host Controls ---

  setGame(code: string, hostId: string, gameId: string): { success: boolean; error?: string } {
    const room = this.rooms.get(code);
    if (!room || room.hostId !== hostId || room.status !== 'LOBBY') {
      return { success: false, error: 'Không có quyền hoặc phòng đang trong trận đấu.' };
    }

    const gameMeta = this.gameRegistry.getMetadata(gameId);
    if (!gameMeta) {
      return { success: false, error: 'Không tìm thấy trò chơi.' };
    }

    room.selectedGameId = gameId;

    // Tự động điều chỉnh maxPlayers theo giới hạn của trò chơi mới
    if (room.maxPlayers > gameMeta.maxPlayers) {
      room.maxPlayers = gameMeta.maxPlayers;
    } else if (room.maxPlayers < gameMeta.minPlayers) {
      room.maxPlayers = gameMeta.minPlayers;
    }

    // Nếu số người chơi vượt quá sức chứa mới, chuyển người thừa xuống Khán giả
    while (room.players.length > room.maxPlayers) {
      const overflowPlayer = room.players.pop()!;
      overflowPlayer.role = 'SPECTATOR';
      overflowPlayer.isReady = false;
      room.spectators.push(overflowPlayer);
    }

    room.chat.push({
      id: 'sys_' + Date.now(),
      senderId: 'system',
      senderName: 'Hệ thống',
      type: 'SYSTEM',
      content: `Chủ phòng đã đổi game sang: [${gameMeta.name}]. Sức chứa: ${room.maxPlayers} người.`,
      timestamp: Date.now(),
    });

    return { success: true };
  }

  setMaxPlayers(code: string, hostId: string, count: number): { success: boolean; error?: string } {
    const room = this.rooms.get(code);
    if (!room || room.hostId !== hostId || room.status !== 'LOBBY') {
      return { success: false, error: 'Không có quyền hoặc phòng đang trong trận đấu.' };
    }

    const gameMeta = this.gameRegistry.getMetadata(room.selectedGameId);
    if (!gameMeta) return { success: false, error: 'Lỗi metadata game.' };

    if (count < gameMeta.minPlayers || count > gameMeta.maxPlayers) {
      return {
        success: false,
        error: `Số người chơi phải từ ${gameMeta.minPlayers} đến ${gameMeta.maxPlayers} đối với game ${gameMeta.name}.`,
      };
    }

    room.maxPlayers = count;

    // Chuyển người chơi thừa sang khán giả nếu giảm số lượng slot
    while (room.players.length > room.maxPlayers) {
      const overflowPlayer = room.players.pop()!;
      overflowPlayer.role = 'SPECTATOR';
      overflowPlayer.isReady = false;
      room.spectators.push(overflowPlayer);
    }

    room.chat.push({
      id: 'sys_' + Date.now(),
      senderId: 'system',
      senderName: 'Hệ thống',
      type: 'SYSTEM',
      content: `Chủ phòng đã chỉnh số người chơi tối đa thành ${count} người.`,
      timestamp: Date.now(),
    });

    return { success: true };
  }

  kickPlayer(code: string, hostId: string, targetPlayerId: string): { success: boolean; kickedNickname?: string; error?: string } {
    const room = this.rooms.get(code);
    if (!room || room.hostId !== hostId) {
      return { success: false, error: 'Bạn không phải chủ phòng.' };
    }
    if (hostId === targetPlayerId) {
      return { success: false, error: 'Chủ phòng không thể tự kick chính mình.' };
    }

    let kickedNickname: string | undefined;
    const playerIndex = room.players.findIndex(p => p.id === targetPlayerId);
    if (playerIndex !== -1) {
      kickedNickname = room.players[playerIndex].nickname;
      room.players.splice(playerIndex, 1);
    } else {
      const specIndex = room.spectators.findIndex(p => p.id === targetPlayerId);
      if (specIndex !== -1) {
        kickedNickname = room.spectators[specIndex].nickname;
        room.spectators.splice(specIndex, 1);
      }
    }

    if (!kickedNickname) {
      return { success: false, error: 'Không tìm thấy người chơi.' };
    }

    room.chat.push({
      id: 'sys_' + Date.now(),
      senderId: 'system',
      senderName: 'Hệ thống',
      type: 'SYSTEM',
      content: `${kickedNickname} đã bị chủ phòng mời ra khỏi phòng.`,
      timestamp: Date.now(),
    });

    return { success: true, kickedNickname };
  }

  switchRole(code: string, requesterId: string, targetId: string, targetRole: PlayerRole): { success: boolean; error?: string } {
    const room = this.rooms.get(code);
    if (!room || room.status !== 'LOBBY') {
      return { success: false, error: 'Không thể đổi ghế trong lúc đang chơi.' };
    }

    // Chỉ chủ phòng hoặc chính người chơi đó mới được đổi ghế
    if (room.hostId !== requesterId && requesterId !== targetId) {
      return { success: false, error: 'Không có quyền thao tác.' };
    }

    if (targetRole === 'PLAYER') {
      if (room.players.length >= room.maxPlayers) {
        return { success: false, error: 'Bàn chơi đã đầy đủ số người.' };
      }
      const specIndex = room.spectators.findIndex(p => p.id === targetId);
      if (specIndex !== -1) {
        const p = room.spectators.splice(specIndex, 1)[0];
        p.role = 'PLAYER';
        p.isReady = false;
        room.players.push(p);
      }
    } else {
      const playerIndex = room.players.findIndex(p => p.id === targetId);
      if (playerIndex !== -1) {
        if (room.players[playerIndex].isHost) {
          return { success: false, error: 'Chủ phòng không thể chuyển sang làm Khán giả.' };
        }
        const p = room.players.splice(playerIndex, 1)[0];
        p.role = 'SPECTATOR';
        p.isReady = false;
        room.spectators.push(p);
      }
    }

    return { success: true };
  }

  toggleReady(code: string, playerId: string): { success: boolean; error?: string } {
    const room = this.rooms.get(code);
    if (!room || room.status !== 'LOBBY') return { success: false, error: 'Phòng không khả dụng.' };

    const player = room.players.find(p => p.id === playerId);
    if (!player) return { success: false, error: 'Không tìm thấy người chơi.' };

    if (player.isHost) {
      player.isReady = true; // Host luôn ready
    } else {
      player.isReady = !player.isReady;
    }

    return { success: true };
  }

  addChat(code: string, senderId: string, content: string, type: 'TEXT' | 'STICKER' = 'TEXT'): ChatMessage | undefined {
    const room = this.rooms.get(code);
    if (!room) return undefined;

    let senderName = 'Khách';
    const player = room.players.find(p => p.id === senderId) || room.spectators.find(p => p.id === senderId);
    if (player) {
      senderName = player.nickname;
    }

    const msg: ChatMessage = {
      id: 'chat_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      senderId,
      senderName,
      type,
      content,
      timestamp: Date.now(),
    };

    room.chat.push(msg);
    if (room.chat.length > 80) room.chat.shift();
    return msg;
  }

  // --- Game Lifecycle ---

  startGame(code: string, hostId: string): { success: boolean; error?: string } {
    const room = this.rooms.get(code);
    if (!room || room.hostId !== hostId || room.status !== 'LOBBY') {
      return { success: false, error: 'Chỉ chủ phòng mới có thể bắt đầu trận đấu.' };
    }

    const plugin = this.gameRegistry.getPlugin(room.selectedGameId);
    if (!plugin) {
      return {
        success: false,
        error: `Trò chơi này đang trong lộ trình phát triển. Vui lòng chọn "${TestRaceGamePlugin.metadata.name}" để chơi thử nghiệm!`,
      };
    }

    const { minPlayers, maxPlayers } = plugin.metadata;
    if (room.players.length < minPlayers || room.players.length > maxPlayers) {
      return {
        success: false,
        error: `Số lượng người chơi phải từ ${minPlayers} đến ${maxPlayers} người.`,
      };
    }

    const unreadyPlayers = room.players.filter(p => !p.isReady);
    if (unreadyPlayers.length > 0) {
      return {
        success: false,
        error: `Còn người chơi chưa bấm Sẵn sàng: ${unreadyPlayers.map(p => p.nickname).join(', ')}.`,
      };
    }

    // Khởi tạo Game State từ plugin
    room.rawGameState = plugin.initGame(room.players);
    room.status = 'IN_GAME';

    room.chat.push({
      id: 'sys_' + Date.now(),
      senderId: 'system',
      senderName: 'Hệ thống',
      type: 'SYSTEM',
      content: `Trận đấu [${plugin.metadata.name}] ĐÃ BẮT ĐẦU!`,
      timestamp: Date.now(),
    });

    return { success: true };
  }

  processGameAction(code: string, playerId: string, action: any): { success: boolean; error?: string; log?: string } {
    const room = this.rooms.get(code);
    if (!room || room.status !== 'IN_GAME' || !room.rawGameState) {
      return { success: false, error: 'Trận đấu chưa bắt đầu hoặc đã kết thúc.' };
    }

    const plugin = this.gameRegistry.getPlugin(room.selectedGameId);
    if (!plugin) {
      return { success: false, error: 'Không tìm thấy plugin game.' };
    }

    const isValid = plugin.validateAction(room.rawGameState, playerId, action);
    if (!isValid) {
      return { success: false, error: 'Nước đi không hợp lệ hoặc chưa tới lượt của bạn.' };
    }

    const result = plugin.applyAction(room.rawGameState, playerId, action);
    room.rawGameState = result.nextState;

    const gameOver = plugin.checkGameOver(room.rawGameState);
    if (gameOver.isOver) {
      room.status = 'FINISHED';
      room.chat.push({
        id: 'sys_' + Date.now(),
        senderId: 'system',
        senderName: 'Hệ thống',
        type: 'SYSTEM',
        content: `🏆 Trận đấu kết thúc! ${gameOver.summary || ''}`,
        timestamp: Date.now(),
      });
    }

    return { success: true, log: result.gameLog };
  }

  returnToLobby(code: string, hostId: string): { success: boolean; error?: string } {
    const room = this.rooms.get(code);
    if (!room || room.hostId !== hostId) {
      return { success: false, error: 'Chỉ chủ phòng mới có thể thiết lập lại bàn chơi.' };
    }

    room.status = 'LOBBY';
    room.rawGameState = undefined;
    room.players.forEach(p => {
      p.isReady = p.isHost;
    });

    room.chat.push({
      id: 'sys_' + Date.now(),
      senderId: 'system',
      senderName: 'Hệ thống',
      type: 'SYSTEM',
      content: `Chủ phòng đã đưa mọi người về lại Sảnh Chờ.`,
      timestamp: Date.now(),
    });

    return { success: true };
  }

  getRoomRaw(code: string): InternalRoomState | undefined {
    return this.rooms.get(code);
  }

  /**
   * Bộ lọc gửi RoomState an toàn cho từng Player
   * Áp dụng getPlayerView của plugin game để giấu các thông tin mật của người khác!
   */
  getRoomForPlayer(room: InternalRoomState, playerId: string): RoomState {
    let gameData: any = undefined;

    if (room.rawGameState && room.selectedGameId) {
      const plugin = this.gameRegistry.getPlugin(room.selectedGameId);
      if (plugin) {
        gameData = plugin.getPlayerView(room.rawGameState, playerId);
      } else {
        gameData = room.rawGameState;
      }
    }

    return {
      code: room.code,
      hostId: room.hostId,
      status: room.status,
      selectedGameId: room.selectedGameId,
      maxPlayers: room.maxPlayers,
      players: room.players,
      spectators: room.spectators,
      chat: room.chat,
      gameData,
    };
  }
}

import { TestRaceGamePlugin } from '../games/test-race/logic';

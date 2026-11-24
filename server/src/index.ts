import express from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import { SOCKET_EVENTS } from '@boardgame/shared';
import { SessionManager } from './lobby/session-manager';
import { GameRegistry } from './engine/game-registry';
import { RoomManager } from './lobby/room-manager';

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const sessionManager = new SessionManager();
const gameRegistry = new GameRegistry();
const roomManager = new RoomManager(gameRegistry, sessionManager);

// HTTP Endpoint lấy danh sách game
app.get('/api/games', (req, res) => {
  res.json(gameRegistry.getAllMetadatas());
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

/**
 * Hàm gửi cập nhật RoomState an toàn cho từng người chơi trong phòng
 * Đảm bảo mỗi người chỉ nhận góc nhìn (getPlayerView) riêng của họ
 */
function broadcastRoomUpdate(roomCode: string) {
  const room = roomManager.getRoomRaw(roomCode);
  if (!room) return;

  const allMembers = [...room.players, ...room.spectators];
  allMembers.forEach(member => {
    const session = sessionManager.getSession(member.sessionToken);
    if (session && session.socketId) {
      const playerRoomState = roomManager.getRoomForPlayer(room, member.id);
      io.to(session.socketId).emit(SOCKET_EVENTS.ROOM_UPDATED, playerRoomState);
    }
  });
}

io.on('connection', (socket: Socket) => {
  console.log(`[Socket Connected] ID: ${socket.id}`);

  // 1. Tạo phòng mới
  socket.on(SOCKET_EVENTS.ROOM_CREATE, ({ nickname, avatarSeed, preferredGameId }) => {
    try {
      const { room, sessionToken, player } = roomManager.createRoom(
        socket.id,
        nickname || 'Người chơi',
        avatarSeed || 'seed_' + Math.random(),
        preferredGameId
      );

      socket.join(`room_${room.code}`);
      socket.emit(SOCKET_EVENTS.ROOM_JOIN_SUCCESS, { room, sessionToken, player });
      broadcastRoomUpdate(room.code);
    } catch (err: any) {
      socket.emit(SOCKET_EVENTS.ROOM_ERROR, err.message || 'Lỗi khi tạo phòng');
    }
  });

  // 2. Gia nhập phòng qua mã
  socket.on(SOCKET_EVENTS.ROOM_JOIN, ({ code, nickname, avatarSeed }) => {
    try {
      const result = roomManager.joinRoom(
        socket.id,
        code,
        nickname || 'Người chơi',
        avatarSeed || 'seed_' + Math.random()
      );

      if (!result.success || !result.room) {
        socket.emit(SOCKET_EVENTS.ROOM_ERROR, result.error || 'Không thể vào phòng.');
        return;
      }

      socket.join(`room_${result.room.code}`);
      socket.emit(SOCKET_EVENTS.ROOM_JOIN_SUCCESS, {
        room: result.room,
        sessionToken: result.sessionToken,
        player: result.player,
      });

      broadcastRoomUpdate(result.room.code);
    } catch (err: any) {
      socket.emit(SOCKET_EVENTS.ROOM_ERROR, err.message || 'Lỗi khi vào phòng');
    }
  });

  // 2b. Người chơi chủ động rời phòng
  socket.on(SOCKET_EVENTS.ROOM_LEAVE, ({ code, playerId }: { code: string; playerId: string }) => {
    try {
      socket.leave(`room_${code}`);
      const res = roomManager.leaveRoom(code, playerId);
      if (res.success && !res.roomDeleted) {
        broadcastRoomUpdate(code);
      }
    } catch (err) {
      console.error('Error on ROOM_LEAVE:', err);
    }
  });

  // 3. Reconnect khi F5 hoặc rớt mạng
  socket.on(SOCKET_EVENTS.ROOM_RECONNECT, ({ sessionToken }) => {
    try {
      const result = roomManager.reconnect(sessionToken, socket.id);
      if (result.success && result.room && result.player) {
        socket.join(`room_${result.room.code}`);
        socket.emit(SOCKET_EVENTS.ROOM_JOIN_SUCCESS, {
          room: result.room,
          sessionToken,
          player: result.player,
        });
        broadcastRoomUpdate(result.room.code);
      } else {
        socket.emit(SOCKET_EVENTS.ROOM_ERROR, 'Phiên chơi đã hết hạn.');
      }
    } catch (err: any) {
      socket.emit(SOCKET_EVENTS.ROOM_ERROR, 'Không thể khôi phục phiên.');
    }
  });

  // 4. Host đổi game
  socket.on(SOCKET_EVENTS.HOST_SET_GAME, ({ code, hostId, gameId }) => {
    const res = roomManager.setGame(code, hostId, gameId);
    if (!res.success) {
      socket.emit(SOCKET_EVENTS.ROOM_ERROR, res.error);
    } else {
      broadcastRoomUpdate(code);
    }
  });

  // 5. Host chỉnh số lượng người chơi tối đa
  socket.on(SOCKET_EVENTS.HOST_SET_MAX_PLAYERS, ({ code, hostId, count }) => {
    const res = roomManager.setMaxPlayers(code, hostId, Number(count));
    if (!res.success) {
      socket.emit(SOCKET_EVENTS.ROOM_ERROR, res.error);
    } else {
      broadcastRoomUpdate(code);
    }
  });

  // 6. Host kick người chơi
  socket.on(SOCKET_EVENTS.HOST_KICK_PLAYER, ({ code, hostId, targetPlayerId }) => {
    const res = roomManager.kickPlayer(code, hostId, targetPlayerId);
    if (!res.success) {
      socket.emit(SOCKET_EVENTS.ROOM_ERROR, res.error);
    } else {
      // Thông báo riêng cho người bị kick
      const session = sessionManager.getSession(targetPlayerId); // hoặc tìm theo playerId
      const room = roomManager.getRoomRaw(code);
      // Gửi event kicked tới toàn bộ socket hoặc riêng socket đó
      io.to(`room_${code}`).emit(SOCKET_EVENTS.ROOM_KICKED, { targetPlayerId });
      broadcastRoomUpdate(code);
    }
  });

  // 7. Chuyển đổi ghế (Player <-> Spectator)
  socket.on(SOCKET_EVENTS.HOST_SWITCH_ROLE, ({ code, requesterId, targetId, targetRole }) => {
    const res = roomManager.switchRole(code, requesterId, targetId, targetRole);
    if (!res.success) {
      socket.emit(SOCKET_EVENTS.ROOM_ERROR, res.error);
    } else {
      broadcastRoomUpdate(code);
    }
  });

  // 8. Bật/tắt Sẵn sàng (Ready)
  socket.on(SOCKET_EVENTS.PLAYER_TOGGLE_READY, ({ code, playerId }) => {
    const res = roomManager.toggleReady(code, playerId);
    if (!res.success) {
      socket.emit(SOCKET_EVENTS.ROOM_ERROR, res.error);
    } else {
      broadcastRoomUpdate(code);
    }
  });

  // 9. Host bắt đầu game
  socket.on(SOCKET_EVENTS.HOST_START_GAME, ({ code, hostId }) => {
    const res = roomManager.startGame(code, hostId);
    if (!res.success) {
      socket.emit(SOCKET_EVENTS.ROOM_ERROR, res.error);
    } else {
      broadcastRoomUpdate(code);
    }
  });

  // 10. Nước đi trong game (Game Action)
  socket.on(SOCKET_EVENTS.GAME_ACTION, ({ code, playerId, action }) => {
    const res = roomManager.processGameAction(code, playerId, action);
    if (!res.success) {
      socket.emit(SOCKET_EVENTS.ROOM_ERROR, res.error);
    } else {
      broadcastRoomUpdate(code);
    }
  });

  // 11. Gửi tin nhắn chat & sticker
  socket.on(SOCKET_EVENTS.ROOM_SEND_CHAT, ({ code, senderId, content, type }) => {
    const msg = roomManager.addChat(code, senderId, content, type || 'TEXT');
    if (msg) {
      broadcastRoomUpdate(code);
    }
  });

  // 12. Host đưa phòng trở lại Sảnh chờ
  socket.on(SOCKET_EVENTS.HOST_RETURN_TO_LOBBY, ({ code, hostId }) => {
    const res = roomManager.returnToLobby(code, hostId);
    if (!res.success) {
      socket.emit(SOCKET_EVENTS.ROOM_ERROR, res.error);
    } else {
      broadcastRoomUpdate(code);
    }
  });

  // 13. Ngắt kết nối
  socket.on('disconnect', () => {
    console.log(`[Socket Disconnected] ID: ${socket.id}`);
    const { roomCode } = roomManager.handleDisconnect(socket.id);
    if (roomCode) {
      broadcastRoomUpdate(roomCode);
    }
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 Board Game Server is running on http://localhost:${PORT}`);
});

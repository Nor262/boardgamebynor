import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { GameMetadata, Player, PlayerRole, RoomState, SOCKET_EVENTS } from '@boardgame/shared';

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:4000';

interface RoomStoreState {
  socket: Socket | null;
  isConnected: boolean;
  sessionToken: string | null;
  room: RoomState | null;
  me: Player | null;
  availableGames: GameMetadata[];
  error: string | null;
  isKicked: boolean;

  // Actions
  initSocket: () => void;
  setError: (msg: string | null) => void;
  fetchAvailableGames: () => Promise<void>;
  createRoom: (nickname: string, avatarSeed: string, preferredGameId?: string) => void;
  joinRoom: (code: string, nickname: string, avatarSeed: string) => void;
  reconnect: (sessionToken: string) => void;
  leaveRoom: () => void;

  // Host Controls
  setGame: (gameId: string) => void;
  setMaxPlayers: (count: number) => void;
  kickPlayer: (targetPlayerId: string) => void;
  switchRole: (targetId: string, role: PlayerRole) => void;
  toggleReady: () => void;
  startGame: () => void;
  returnToLobby: () => void;

  // Interactions
  sendChat: (content: string, type?: 'TEXT' | 'STICKER') => void;
  sendGameAction: (action: any) => void;
}

export const useRoomStore = create<RoomStoreState>((set, get) => ({
  socket: null,
  isConnected: false,
  sessionToken: null,
  room: null,
  me: null,
  availableGames: [],
  error: null,
  isKicked: false,

  setError: (msg: string | null) => set({ error: msg }),

  initSocket: () => {
    if (get().socket) return;

    const socket = io(SERVER_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('✅ Connected to socket server:', socket.id);
      set({ isConnected: true });

      // Kiểm tra có token cũ không để thử reconnect
      const savedToken = typeof window !== 'undefined' ? localStorage.getItem('bg_session_token') : null;
      if (savedToken && !get().room) {
        socket.emit(SOCKET_EVENTS.ROOM_RECONNECT, { sessionToken: savedToken });
      }
    });

    socket.on('disconnect', () => {
      console.log('❌ Disconnected from socket server');
      set({ isConnected: false });
    });

    socket.on(SOCKET_EVENTS.ROOM_JOIN_SUCCESS, ({ room, sessionToken, player }: { room: RoomState; sessionToken: string; player: Player }) => {
      console.log('🎉 Joined room successfully:', room.code);
      if (typeof window !== 'undefined') {
        localStorage.setItem('bg_session_token', sessionToken);
      }
      set({
        room,
        sessionToken,
        me: player,
        error: null,
        isKicked: false,
      });
    });

    socket.on(SOCKET_EVENTS.ROOM_UPDATED, (room: RoomState) => {
      const currentMe = get().me;
      let updatedMe: Player | null = null;
      if (currentMe) {
        updatedMe = room.players.find(p => p.id === currentMe.id) ||
                    room.spectators.find(p => p.id === currentMe.id) ||
                    currentMe;
      }
      const prevStatus = get().room?.status;
      set({
        room,
        me: updatedMe,
        ...(prevStatus === 'IN_GAME' && room.status === 'WAITING' ? { error: null } : {}),
      });
    });

    socket.on(SOCKET_EVENTS.ROOM_KICKED, ({ targetPlayerId }: { targetPlayerId: string }) => {
      const me = get().me;
      if (me && me.id === targetPlayerId) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('bg_session_token');
        }
        set({
          room: null,
          me: null,
          isKicked: true,
          error: 'Bạn đã bị chủ phòng mời ra khỏi phòng.',
        });
      }
    });

    socket.on(SOCKET_EVENTS.ROOM_ERROR, (errorMsg: string) => {
      console.warn('⚠️ Room Error:', errorMsg);
      if (typeof window !== 'undefined') {
        const lower = (errorMsg || '').toLowerCase();
        if (lower.includes('phiên') || lower.includes('hết hạn') || lower.includes('không tồn tại') || lower.includes('đã đóng')) {
          localStorage.removeItem('bg_session_token');
        }
      }
      set({ error: errorMsg });
    });

    set({ socket });
    get().fetchAvailableGames();
  },

  fetchAvailableGames: async () => {
    try {
      const res = await fetch(`${SERVER_URL}/api/games`);
      if (res.ok) {
        const games: GameMetadata[] = await res.json();
        set({ availableGames: games });
      }
    } catch (e) {
      console.error('Failed to fetch available games:', e);
    }
  },

  createRoom: (nickname: string, avatarSeed: string, preferredGameId?: string) => {
    const { socket } = get();
    if (!socket) return;
    set({ error: null, isKicked: false });
    socket.emit(SOCKET_EVENTS.ROOM_CREATE, { nickname, avatarSeed, preferredGameId });
  },

  joinRoom: (code: string, nickname: string, avatarSeed: string) => {
    const { socket } = get();
    if (!socket) return;
    set({ error: null, isKicked: false });
    socket.emit(SOCKET_EVENTS.ROOM_JOIN, { code: code.toUpperCase().trim(), nickname, avatarSeed });
  },

  reconnect: (sessionToken: string) => {
    const { socket } = get();
    if (!socket) return;
    if (socket.connected) {
      socket.emit(SOCKET_EVENTS.ROOM_RECONNECT, { sessionToken });
    } else {
      socket.once('connect', () => {
        socket.emit(SOCKET_EVENTS.ROOM_RECONNECT, { sessionToken });
      });
    }
  },

  leaveRoom: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('bg_session_token');
    }
    const { socket, room, me } = get();
    if (socket && room && me) {
      socket.emit(SOCKET_EVENTS.ROOM_LEAVE, { code: room.code, playerId: me.id });
    }
    set({ room: null, me: null, sessionToken: null, error: null, isKicked: false });
  },

  setGame: (gameId: string) => {
    const { socket, room, me } = get();
    if (!socket || !room || !me) return;
    socket.emit(SOCKET_EVENTS.HOST_SET_GAME, { code: room.code, hostId: me.id, gameId });
  },

  setMaxPlayers: (count: number) => {
    const { socket, room, me } = get();
    if (!socket || !room || !me) return;
    socket.emit(SOCKET_EVENTS.HOST_SET_MAX_PLAYERS, { code: room.code, hostId: me.id, count });
  },

  kickPlayer: (targetPlayerId: string) => {
    const { socket, room, me } = get();
    if (!socket || !room || !me) return;
    socket.emit(SOCKET_EVENTS.HOST_KICK_PLAYER, { code: room.code, hostId: me.id, targetPlayerId });
  },

  switchRole: (targetId: string, role: PlayerRole) => {
    const { socket, room, me } = get();
    if (!socket || !room || !me) return;
    socket.emit(SOCKET_EVENTS.HOST_SWITCH_ROLE, { code: room.code, requesterId: me.id, targetId, targetRole: role });
  },

  toggleReady: () => {
    const { socket, room, me } = get();
    if (!socket || !room || !me) return;
    socket.emit(SOCKET_EVENTS.PLAYER_TOGGLE_READY, { code: room.code, playerId: me.id });
  },

  startGame: () => {
    const { socket, room, me } = get();
    if (!socket || !room || !me) return;
    socket.emit(SOCKET_EVENTS.HOST_START_GAME, { code: room.code, hostId: me.id });
  },

  returnToLobby: () => {
    const { socket, room, me } = get();
    if (!socket || !room || !me) return;
    socket.emit(SOCKET_EVENTS.HOST_RETURN_TO_LOBBY, { code: room.code, hostId: me.id });
  },

  sendChat: (content: string, type: 'TEXT' | 'STICKER' = 'TEXT') => {
    const { socket, room, me } = get();
    if (!socket || !room || !me || !content.trim()) return;
    socket.emit(SOCKET_EVENTS.ROOM_SEND_CHAT, { code: room.code, senderId: me.id, content, type });
  },

  sendGameAction: (action: any) => {
    const { socket, room, me } = get();
    if (!socket || !room || !me) return;
    socket.emit(SOCKET_EVENTS.GAME_ACTION, { code: room.code, playerId: me.id, action });
  },
}));

if (typeof window !== 'undefined') {
  (window as any).__useRoomStore = useRoomStore;
}


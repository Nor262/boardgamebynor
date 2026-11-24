export const SOCKET_EVENTS = {
  // Client -> Server
  ROOM_CREATE: 'room:create',
  ROOM_JOIN: 'room:join',
  ROOM_RECONNECT: 'room:reconnect',
  ROOM_LEAVE: 'room:leave',
  HOST_SET_GAME: 'host:set-game',
  HOST_SET_MAX_PLAYERS: 'host:set-max-players',
  HOST_KICK_PLAYER: 'host:kick-player',
  HOST_SWITCH_ROLE: 'host:switch-role',
  PLAYER_TOGGLE_READY: 'player:toggle-ready',
  HOST_START_GAME: 'host:start-game',
  GAME_ACTION: 'game:action',
  ROOM_SEND_CHAT: 'room:send-chat',
  HOST_RETURN_TO_LOBBY: 'host:return-to-lobby',

  // Server -> Client
  ROOM_UPDATED: 'room:updated',
  ROOM_JOIN_SUCCESS: 'room:join-success',
  ROOM_ERROR: 'room:error',
  ROOM_KICKED: 'room:kicked',
  CHAT_MESSAGE_ADDED: 'chat:message-added',
  GAME_STARTED: 'game:started',
  GAME_UPDATED: 'game:updated',
  GAME_OVER: 'game:over',
} as const;

export type SocketEventType = typeof SOCKET_EVENTS[keyof typeof SOCKET_EVENTS];

import { io } from 'socket.io-client';
import { SOCKET_EVENTS } from '@boardgame/shared';

async function main() {
  const socket1 = io('http://localhost:4000');
  const socket2 = io('http://localhost:4000');

  let roomCode = '';
  let token1 = '';
  let token2 = '';
  let hostPlayerId = '';

  await new Promise<void>((resolve) => {
    socket1.on('connect', () => {
      console.log('Socket 1 connected');
      socket1.emit(SOCKET_EVENTS.ROOM_CREATE, {
        nickname: 'Bác Sĩ Dịch Bệnh',
        avatarSeed: 'seed_plague',
        preferredGameId: 'hex-effect',
      });
    });

    socket1.on(SOCKET_EVENTS.ROOM_JOIN_SUCCESS, (data) => {
      console.log('Room created:', data.room.code);
      roomCode = data.room.code;
      token1 = data.sessionToken;
      hostPlayerId = data.player.id;

      // Guest joins
      socket2.emit(SOCKET_EVENTS.ROOM_JOIN, {
        code: roomCode,
        nickname: 'Nhà Giả Kim',
        avatarSeed: 'seed_alchemist',
      });
    });

    socket2.on(SOCKET_EVENTS.ROOM_JOIN_SUCCESS, (data) => {
      console.log('Guest joined:', data.player.nickname);
      token2 = data.sessionToken;

      // Guest toggles ready
      socket2.emit(SOCKET_EVENTS.PLAYER_TOGGLE_READY, {
        code: roomCode,
        playerId: data.player.id,
      });

      // Host starts game
      setTimeout(() => {
        console.log('Host starting game...');
        socket1.emit(SOCKET_EVENTS.HOST_START_GAME, {
          code: roomCode,
          hostId: hostPlayerId,
        });
      }, 500);
    });

    socket1.on(SOCKET_EVENTS.ROOM_UPDATED, (room) => {
      if (room.status === 'IN_GAME') {
        console.log('=== HEX EFFECTS MATCH STARTED ===');
        console.log('Room Code:', room.code);
        console.log('Host sessionToken:', token1);
        console.log('Guest sessionToken:', token2);
        console.log(`URL: http://localhost:3000/room/${room.code}?token=${token1}`);
        resolve();
      }
    });
  });

  process.exit(0);
}

main().catch(console.error);

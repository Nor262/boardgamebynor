import { io } from 'socket.io-client';
import assert from 'assert';
import { SOCKET_EVENTS, RoomState } from '@boardgame/shared';

const SERVER_URL = 'http://localhost:4000';

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runE2ESimulation() {
  console.log('🚀 Starting End-to-End Multi-Player Simulation...');

  // 1. Client 1 (Alice - Host)
  const socketAlice = io(SERVER_URL);
  let aliceRoom: RoomState | null = null;
  let aliceSessionToken = '';
  let alicePlayerId = '';

  await new Promise<void>((resolve, reject) => {
    socketAlice.on('connect', () => {
      socketAlice.emit(SOCKET_EVENTS.ROOM_CREATE, {
        nickname: 'AliceHost',
        avatarSeed: 'seed_alice',
        preferredGameId: 'test-race',
      });
    });

    socketAlice.on(SOCKET_EVENTS.ROOM_JOIN_SUCCESS, (data) => {
      aliceRoom = data.room;
      aliceSessionToken = data.sessionToken;
      alicePlayerId = data.player.id;
      console.log(`✅ [Alice] Created room ${aliceRoom.code} as Host.`);
      resolve();
    });

    socketAlice.on(SOCKET_EVENTS.ROOM_ERROR, (err) => reject(new Error(err)));
  });

  assert.ok(aliceRoom, 'Alice should have room');
  const roomCode = (aliceRoom as RoomState).code;

  // 2. Client 2 (Bob - Guest) joins Alice's room
  const socketBob = io(SERVER_URL);
  let bobRoom: RoomState | null = null;
  let bobSessionToken = '';
  let bobPlayerId = '';

  await new Promise<void>((resolve, reject) => {
    socketBob.on('connect', () => {
      socketBob.emit(SOCKET_EVENTS.ROOM_JOIN, {
        code: roomCode,
        nickname: 'BobFriend',
        avatarSeed: 'seed_bob',
      });
    });

    socketBob.on(SOCKET_EVENTS.ROOM_JOIN_SUCCESS, (data) => {
      bobRoom = data.room;
      bobSessionToken = data.sessionToken;
      bobPlayerId = data.player.id;
      console.log(`✅ [Bob] Joined room ${roomCode} successfully.`);
      resolve();
    });

    socketBob.on(SOCKET_EVENTS.ROOM_ERROR, (err) => reject(new Error(err)));
  });

  await sleep(100);

  // 3. Listen for updates on both sockets
  socketAlice.on(SOCKET_EVENTS.ROOM_UPDATED, (room) => {
    aliceRoom = room;
  });
  socketBob.on(SOCKET_EVENTS.ROOM_UPDATED, (room) => {
    bobRoom = room;
  });

  // 4. Test Host Control: Alice changes game to Jaipur (max 2 players)
  console.log('🔄 [Alice] Testing Host Control: Change game to Jaipur...');
  socketAlice.emit(SOCKET_EVENTS.HOST_SET_GAME, {
    code: roomCode,
    hostId: alicePlayerId,
    gameId: 'jaipur',
  });
  await sleep(150);
  assert.strictEqual(aliceRoom?.selectedGameId, 'jaipur');
  assert.strictEqual(aliceRoom?.maxPlayers, 2);
  assert.strictEqual(bobRoom?.selectedGameId, 'jaipur');
  console.log('✅ Host changed game and updated max players dynamically for all clients.');

  // 5. Alice changes back to test-race
  socketAlice.emit(SOCKET_EVENTS.HOST_SET_GAME, {
    code: roomCode,
    hostId: alicePlayerId,
    gameId: 'test-race',
  });
  await sleep(150);

  // 6. Test Chat & Sticker
  console.log('💬 [Bob] Sending Chat message and Sticker...');
  socketBob.emit(SOCKET_EVENTS.ROOM_SEND_CHAT, {
    code: roomCode,
    senderId: bobPlayerId,
    content: 'Chào Alice!',
    type: 'TEXT',
  });
  await sleep(100);
  socketBob.emit(SOCKET_EVENTS.ROOM_SEND_CHAT, {
    code: roomCode,
    senderId: bobPlayerId,
    content: '🎲',
    type: 'STICKER',
  });
  await sleep(150);
  const lastChat = aliceRoom?.chat[aliceRoom.chat.length - 1];
  assert.strictEqual(lastChat?.content, '🎲');
  console.log('✅ Chat & Sticker broadcast verified.');

  // 7. Bob toggles Ready
  console.log('⏳ [Bob] Clicking Ready...');
  socketBob.emit(SOCKET_EVENTS.PLAYER_TOGGLE_READY, {
    code: roomCode,
    playerId: bobPlayerId,
  });
  await sleep(150);
  const bobInRoom = aliceRoom?.players.find((p) => p.id === bobPlayerId);
  assert.strictEqual(bobInRoom?.isReady, true);
  console.log('✅ Bob is Ready.');

  // 8. Alice starts game
  console.log('▶️ [Alice] Starting Game...');
  socketAlice.emit(SOCKET_EVENTS.HOST_START_GAME, {
    code: roomCode,
    hostId: alicePlayerId,
  });
  await sleep(200);
  assert.strictEqual(aliceRoom?.status, 'IN_GAME');
  assert.strictEqual(bobRoom?.status, 'IN_GAME');
  console.log('✅ Game started for both players.');

  // 9. Verify Anti-cheat Secret State filtering
  assert.ok(aliceRoom?.gameData.players[alicePlayerId].hand, 'Alice sees her secret hand');
  assert.strictEqual(aliceRoom?.gameData.players[bobPlayerId].hand, undefined, 'Alice CANNOT see Bob secret hand');
  assert.strictEqual(aliceRoom?.gameData.players[bobPlayerId].cardCount, 1, 'Alice sees Bob has 1 card count');

  assert.ok(bobRoom?.gameData.players[bobPlayerId].hand, 'Bob sees his secret hand');
  assert.strictEqual(bobRoom?.gameData.players[alicePlayerId].hand, undefined, 'Bob CANNOT see Alice secret hand');
  console.log('✅ Anti-cheat secret state isolation verified in realtime.');

  // 10. Alice plays her turn
  console.log('🎲 [Alice] Rolling dice...');
  socketAlice.emit(SOCKET_EVENTS.GAME_ACTION, {
    code: roomCode,
    playerId: alicePlayerId,
    action: { type: 'ROLL_DICE' },
  });
  await sleep(200);
  assert.strictEqual(aliceRoom?.gameData.hasRolledThisTurn, true);
  console.log(`✅ Alice rolled dice: ${aliceRoom?.gameData.lastDiceRoll.value}, position: ${aliceRoom?.gameData.players[alicePlayerId].position}`);

  console.log('➡️ [Alice] Ending turn...');
  socketAlice.emit(SOCKET_EVENTS.GAME_ACTION, {
    code: roomCode,
    playerId: alicePlayerId,
    action: { type: 'END_TURN' },
  });
  await sleep(200);
  assert.strictEqual(aliceRoom?.gameData.turnOrder[aliceRoom.gameData.currentTurnIndex], bobPlayerId);
  console.log("✅ Turn successfully switched to Bob.");

  // 11. Test Host Return to Lobby
  console.log('🔄 [Alice] Returning to Lobby...');
  socketAlice.emit(SOCKET_EVENTS.HOST_RETURN_TO_LOBBY, {
    code: roomCode,
    hostId: alicePlayerId,
  });
  await sleep(200);
  assert.strictEqual(aliceRoom?.status, 'LOBBY');
  assert.strictEqual(bobRoom?.status, 'LOBBY');
  console.log('✅ Room successfully reset to LOBBY state.');

  // 12. Test Reconnection via sessionToken
  console.log('🔌 [Bob] Simulating browser refresh / disconnect...');
  socketBob.disconnect();
  await sleep(200);

  const socketBobReconnected = io(SERVER_URL);
  await new Promise<void>((resolve) => {
    socketBobReconnected.on('connect', () => {
      socketBobReconnected.emit(SOCKET_EVENTS.ROOM_RECONNECT, {
        sessionToken: bobSessionToken,
      });
    });

    socketBobReconnected.on(SOCKET_EVENTS.ROOM_JOIN_SUCCESS, (data) => {
      console.log(`✅ [Bob] Reconnected to room ${data.room.code} with original player ID: ${data.player.id}`);
      resolve();
    });
  });

  socketAlice.disconnect();
  socketBobReconnected.disconnect();

  console.log('🎉 ALL MULTI-PLAYER E2E SIMULATION TESTS PASSED WITH 100% SUCCESS!');
  process.exit(0);
}

runE2ESimulation().catch((err) => {
  console.error('❌ E2E Test Failed:', err);
  process.exit(1);
});

import { io } from 'socket.io-client';
import assert from 'assert';
import { SOCKET_EVENTS, RoomState } from '@boardgame/shared';

const SERVER_URL = 'http://localhost:4000';

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runJaipurE2E() {
  console.log('🐪 Starting Jaipur 2-Player E2E Online Match Simulation...');

  // 1. Alice tạo phòng chọn game Jaipur
  const socketAlice = io(SERVER_URL);
  let aliceRoom: any = null;
  let aliceId = '';

  await new Promise<void>((resolve, reject) => {
    socketAlice.on('connect', () => {
      socketAlice.emit(SOCKET_EVENTS.ROOM_CREATE, {
        nickname: 'AliceMerchant',
        avatarSeed: 'seed_alice',
        preferredGameId: 'jaipur',
      });
    });

    socketAlice.on(SOCKET_EVENTS.ROOM_JOIN_SUCCESS, (data) => {
      aliceRoom = data.room;
      aliceId = data.player.id;
      console.log(`✅ [Alice] Đã tạo phòng Jaipur thành công: ${aliceRoom.code}`);
      resolve();
    });

    socketAlice.on(SOCKET_EVENTS.ROOM_ERROR, reject);
  });

  const roomCode = aliceRoom.code;
  assert.strictEqual(aliceRoom.selectedGameId, 'jaipur');
  assert.strictEqual(aliceRoom.maxPlayers, 2, 'Jaipur tự động khóa phòng ở 2 người chơi');

  // 2. Bob vào phòng
  const socketBob = io(SERVER_URL);
  let bobRoom: any = null;
  let bobId = '';

  await new Promise<void>((resolve, reject) => {
    socketBob.on('connect', () => {
      socketBob.emit(SOCKET_EVENTS.ROOM_JOIN, {
        code: roomCode,
        nickname: 'BobTrader',
        avatarSeed: 'seed_bob',
      });
    });

    socketBob.on(SOCKET_EVENTS.ROOM_JOIN_SUCCESS, (data) => {
      bobRoom = data.room;
      bobId = data.player.id;
      console.log(`✅ [Bob] Đã vào phòng ${roomCode}`);
      resolve();
    });

    socketBob.on(SOCKET_EVENTS.ROOM_ERROR, reject);
  });

  socketAlice.on(SOCKET_EVENTS.ROOM_UPDATED, (r) => (aliceRoom = r));
  socketBob.on(SOCKET_EVENTS.ROOM_UPDATED, (r) => (bobRoom = r));

  await sleep(150);

  // 3. Bob bấm Sẵn sàng
  console.log('⏳ [Bob] Bấm Sẵn sàng...');
  socketBob.emit(SOCKET_EVENTS.PLAYER_TOGGLE_READY, {
    code: roomCode,
    playerId: bobId,
  });
  await sleep(150);

  // 4. Alice bắt đầu trận đấu Jaipur
  console.log('▶️ [Alice] Bắt đầu trận đấu Jaipur...');
  socketAlice.emit(SOCKET_EVENTS.HOST_START_GAME, {
    code: roomCode,
    hostId: aliceId,
  });
  await sleep(250);

  assert.strictEqual(aliceRoom.status, 'IN_GAME');
  assert.strictEqual(bobRoom.status, 'IN_GAME');
  assert.strictEqual(aliceRoom.gameData.market.length, 5, 'Chợ Jaipur có đúng 5 lá');
  console.log('✅ Trận đấu Jaipur đã bắt đầu! Chợ có 5 lá.');

  // 5. Kiểm tra bảo mật bài úp (Anti-Cheat)
  assert.ok(aliceRoom.gameData.players[aliceId].hand, 'Alice thấy bài trên tay mình');
  assert.strictEqual(aliceRoom.gameData.players[bobId].hand, undefined, 'Alice hoàn toàn KHÔNG THỂ nhìn thấy bài của Bob');
  assert.ok(aliceRoom.gameData.players[bobId].cardCount >= 0, 'Alice thấy số lượng lá bài của Bob');

  assert.ok(bobRoom.gameData.players[bobId].hand, 'Bob thấy bài trên tay mình');
  assert.strictEqual(bobRoom.gameData.players[aliceId].hand, undefined, 'Bob hoàn toàn KHÔNG THỂ nhìn thấy bài của Alice');
  console.log('✅ Bảo mật góc nhìn người chơi (Anti-cheat) trên Socket realtime đã được chứng thực!');

  // 6. Lượt đi của Alice: Bốc 1 lá hoặc Lạc đà
  const market = aliceRoom.gameData.market;
  const camelsInMarket = market.filter((c: any) => c.type === 'CAMEL');

  if (camelsInMarket.length > 0) {
    console.log(`🐪 [Alice] Thu gom toàn bộ ${camelsInMarket.length} Lạc đà về đàn...`);
    socketAlice.emit(SOCKET_EVENTS.GAME_ACTION, {
      code: roomCode,
      playerId: aliceId,
      action: { type: 'TAKE_CAMELS' },
    });
  } else {
    const singleCard = market[0];
    console.log(`🛍️ [Alice] Bốc 1 lá ${singleCard.type} từ chợ...`);
    socketAlice.emit(SOCKET_EVENTS.GAME_ACTION, {
      code: roomCode,
      playerId: aliceId,
      action: { type: 'TAKE_SINGLE', marketCardId: singleCard.id },
    });
  }

  await sleep(250);

  // 7. Xác nhận lượt đã chuyển sang Bob
  const currentTurnPlayer = aliceRoom.gameData.turnOrder[aliceRoom.gameData.currentTurnIndex];
  assert.strictEqual(currentTurnPlayer, bobId, 'Lượt đã chuyển sang cho Bob thành công');
  console.log('✅ Chuyển lượt sang Bob thành công.');

  // 8. Bob thực hiện lượt đi
  const bobMarket = bobRoom.gameData.market;
  const bobSingleCard = bobMarket.find((c: any) => c.type !== 'CAMEL') || bobMarket[0];
  if (bobSingleCard.type === 'CAMEL') {
    socketBob.emit(SOCKET_EVENTS.GAME_ACTION, {
      code: roomCode,
      playerId: bobId,
      action: { type: 'TAKE_CAMELS' },
    });
  } else {
    socketBob.emit(SOCKET_EVENTS.GAME_ACTION, {
      code: roomCode,
      playerId: bobId,
      action: { type: 'TAKE_SINGLE', marketCardId: bobSingleCard.id },
    });
  }

  await sleep(250);
  console.log('✅ Bob thực hiện lượt đi thành công!');

  socketAlice.disconnect();
  socketBob.disconnect();

  console.log('🎉 TOÀN BỘ E2E TEST MULTI-PLAYER CHO GAME JAIPUR ĐÃ THÀNH CÔNG RỰC RỠ!');
  process.exit(0);
}

runJaipurE2E().catch(err => {
  console.error('❌ E2E Failed:', err);
  process.exit(1);
});

import assert from 'assert';
import { SessionManager } from '../src/lobby/session-manager';
import { GameRegistry } from '../src/engine/game-registry';
import { RoomManager } from '../src/lobby/room-manager';

function runTests() {
  console.log('🧪 Starting RoomManager & Game Plugin Automated Tests...');

  const sessionManager = new SessionManager();
  const gameRegistry = new GameRegistry();
  const roomManager = new RoomManager(gameRegistry, sessionManager);

  // Test 1: Tạo phòng
  const { room, sessionToken, player: hostPlayer } = roomManager.createRoom('socket_1', 'HostAlice', 'avatar_1', 'test-race');
  assert.strictEqual(room.players.length, 1, 'Host should be in room');
  assert.strictEqual(room.players[0].isHost, true, 'First player is host');
  assert.strictEqual(room.players[0].isReady, true, 'Host is ready by default');
  assert.strictEqual(room.maxPlayers, 6, 'test-race default max players is 6');
  console.log('✅ Test 1: Create room passed.');

  // Test 2: Người thứ 2 vào phòng
  const joinRes = roomManager.joinRoom('socket_2', room.code, 'BobFriend', 'avatar_2');
  assert.strictEqual(joinRes.success, true, 'Join room should succeed');
  assert.strictEqual(joinRes.player?.isHost, false, 'Guest is not host');
  assert.strictEqual(joinRes.player?.isReady, false, 'Guest is not ready initially');
  console.log('✅ Test 2: Join room passed.');

  // Test 3: Host tùy chỉnh maxPlayers
  const setMaxRes = roomManager.setMaxPlayers(room.code, hostPlayer.id, 4);
  assert.strictEqual(setMaxRes.success, true, 'Host should be able to set max players');
  const updatedRoom = roomManager.getRoomRaw(room.code);
  assert.strictEqual(updatedRoom?.maxPlayers, 4, 'maxPlayers should be updated to 4');
  console.log('✅ Test 3: Set maxPlayers passed.');

  // Test 4: Host đổi game sang Jaipur (max 2 người)
  const setGameRes = roomManager.setGame(room.code, hostPlayer.id, 'jaipur');
  assert.strictEqual(setGameRes.success, true, 'Host should be able to set game to jaipur');
  assert.strictEqual(updatedRoom?.selectedGameId, 'jaipur');
  assert.strictEqual(updatedRoom?.maxPlayers, 2, 'Jaipur maxPlayers should adjust to 2');
  console.log('✅ Test 4: Dynamic game change & slot adjustment passed.');

  // Test 5: Reconnect qua sessionToken
  const recRes = roomManager.reconnect(sessionToken, 'socket_1_new');
  assert.strictEqual(recRes.success, true, 'Reconnect should succeed');
  assert.strictEqual(recRes.player?.nickname, 'HostAlice');
  console.log('✅ Test 5: Session reconnect passed.');

  // Test 6: Bắt đầu game
  // Đổi lại game test-race
  roomManager.setGame(room.code, hostPlayer.id, 'test-race');
  // Bob bấm Sẵn sàng
  roomManager.toggleReady(room.code, joinRes.player!.id);
  const startRes = roomManager.startGame(room.code, hostPlayer.id);
  assert.strictEqual(startRes.success, true, 'Game start should succeed when all are ready');
  assert.strictEqual(updatedRoom?.status, 'IN_GAME', 'Room should be IN_GAME');
  console.log('✅ Test 6: Game start lifecycle passed.');

  // Test 7: Secret State Filter (Anti-cheat)
  const aliceView = roomManager.getRoomForPlayer(updatedRoom!, hostPlayer.id);
  const bobView = roomManager.getRoomForPlayer(updatedRoom!, joinRes.player!.id);

  assert.ok(aliceView.gameData.players[hostPlayer.id].hand, 'Alice sees her own hand');
  assert.strictEqual(aliceView.gameData.players[joinRes.player!.id].hand, undefined, 'Alice CANNOT see Bob hand');
  assert.ok(aliceView.gameData.players[joinRes.player!.id].cardCount !== undefined, 'Alice only sees Bob card count');

  assert.ok(bobView.gameData.players[joinRes.player!.id].hand, 'Bob sees his own hand');
  assert.strictEqual(bobView.gameData.players[hostPlayer.id].hand, undefined, 'Bob CANNOT see Alice hand');
  console.log('✅ Test 7: Secret state filtering (Anti-cheat) verified.');

  console.log('🎉 ALL BACKEND UNIT TESTS PASSED SUCCESSFULLY!');
}

runTests();

import assert from 'assert';
import { Player } from '@boardgame/shared';
import { JaipurGamePlugin } from './games/jaipur/logic';

console.log('🧪 Starting Jaipur Game Plugin Automated Unit Tests...');

const p1: Player = {
  id: 'p_alice',
  sessionToken: 'tok_alice',
  nickname: 'Alice',
  isHost: true,
  isReady: true,
  avatarSeed: 'seed_alice',
  connected: true,
  role: 'PLAYER',
};

const p2: Player = {
  id: 'p_bob',
  sessionToken: 'tok_bob',
  nickname: 'Bob',
  isHost: false,
  isReady: true,
  avatarSeed: 'seed_bob',
  connected: true,
  role: 'PLAYER',
};

// 1. Khởi tạo ván đấu
const state = JaipurGamePlugin.initGame([p1, p2]);
assert.strictEqual(state.market.length, 5, 'Chợ phải có đúng 5 lá');
assert.strictEqual(state.round, 1, 'Hiệp đầu tiên là Hiệp 1');
assert.strictEqual(state.players[p1.id].sealsOfExcellence, 0);
assert.strictEqual(state.players[p2.id].sealsOfExcellence, 0);
console.log('✅ 1. Khởi tạo Jaipur thành công (Chợ 5 lá, chia bài cho 2 người chơi).');

// 2. Kiểm tra quy tắc Lấy 1 lá từ chợ
const goodsInMarket = state.market.find(c => c.type !== 'CAMEL');
assert.ok(goodsInMarket, 'Chợ phải có ít nhất 1 lá hàng hóa');

const takeSingleValid = JaipurGamePlugin.validateAction(state, p1.id, {
  type: 'TAKE_SINGLE',
  marketCardId: goodsInMarket.id,
});
assert.strictEqual(takeSingleValid, true, 'Alice được phép bốc 1 lá hàng hóa từ chợ');

const { nextState: stateAfterTake } = JaipurGamePlugin.applyAction(state, p1.id, {
  type: 'TAKE_SINGLE',
  marketCardId: goodsInMarket.id,
});
assert.strictEqual(stateAfterTake.market.length, 5, 'Chợ được tự động bổ sung từ kho bài để luôn đủ 5 lá');
assert.strictEqual(stateAfterTake.players[p1.id].hand.length, state.players[p1.id].hand.length + 1);
assert.strictEqual(stateAfterTake.currentTurnIndex, 1, 'Lượt chuyển sang cho Bob');
console.log('✅ 2. Hành động bốc 1 lá hàng hóa và nạp chợ hoạt động chuẩn xác.');

// 3. Kiểm tra quy tắc Bán hàng quý (Kim cương/Vàng/Bạc không được bán 1 lá lẻ)
// Gán thử 1 lá kim cương vào tay Bob
stateAfterTake.players[p2.id].hand = [
  { id: 'dia_test_1', type: 'DIAMOND' }
];
const sellSingleDiamondValid = JaipurGamePlugin.validateAction(stateAfterTake, p2.id, {
  type: 'SELL',
  cardIds: ['dia_test_1'],
});
assert.strictEqual(sellSingleDiamondValid, false, 'Không được phép bán 1 lá Kim Cương lẻ (phải từ 2 lá trở lên)');

// Cho Bob thêm 1 lá kim cương (thành 2 lá)
stateAfterTake.players[p2.id].hand.push({ id: 'dia_test_2', type: 'DIAMOND' });
const sellTwoDiamondsValid = JaipurGamePlugin.validateAction(stateAfterTake, p2.id, {
  type: 'SELL',
  cardIds: ['dia_test_1', 'dia_test_2'],
});
assert.strictEqual(sellTwoDiamondsValid, true, 'Được phép bán từ 2 lá Kim Cương trở lên');

const { nextState: stateAfterSell } = JaipurGamePlugin.applyAction(stateAfterTake, p2.id, {
  type: 'SELL',
  cardIds: ['dia_test_1', 'dia_test_2'],
});
assert.strictEqual(stateAfterSell.players[p2.id].tokens.goods.length, 2, 'Bob nhận được 2 xu kim cương');
assert.strictEqual(stateAfterSell.players[p2.id].tokens.goods[0].value, 7, 'Xu kim cương đầu tiên có giá trị cao nhất (7 điểm)');
assert.strictEqual(stateAfterSell.players[p2.id].tokens.goods[1].value, 7, 'Xu kim cương thứ hai có giá trị 7 điểm');
assert.strictEqual(stateAfterSell.players[p2.id].roundScore, 14, 'Điểm số Bob cập nhật thành 14 điểm');
console.log('✅ 3. Luật bán hàng quý (Kim cương >= 2 lá) và rút xu điểm giảm dần hoạt động chuẩn xác.');

// 4. Kiểm tra Anti-cheat getPlayerView
const aliceView = JaipurGamePlugin.getPlayerView(stateAfterSell, p1.id);
const bobView = JaipurGamePlugin.getPlayerView(stateAfterSell, p2.id);

assert.ok(aliceView.players[p1.id].hand, 'Alice thấy bài trên tay của mình');
assert.strictEqual(aliceView.players[p2.id].hand, undefined, 'Alice KHÔNG THỂ nhìn thấy bài trên tay Bob');
assert.strictEqual(aliceView.players[p2.id].cardCount, stateAfterSell.players[p2.id].hand.length, 'Alice chỉ thấy số lượng lá bài của Bob');

assert.ok(bobView.players[p2.id].hand, 'Bob thấy bài trên tay của mình');
assert.strictEqual(bobView.players[p1.id].hand, undefined, 'Bob KHÔNG THỂ nhìn thấy bài trên tay Alice');
console.log('✅ 4. Bảo mật góc nhìn người chơi (Anti-cheat secret state) được bảo vệ 100%.');

console.log('🎉 TOÀN BỘ UNIT TEST JAIPUR ĐÃ ĐẠT 100% THÀNH CÔNG!');

import { BoardGamePlugin, GameOverResult, GameActionResult, Player } from '@boardgame/shared';
import { CardType, GoodsType, JaipurAction, JaipurCard, JaipurGameState, PlayerJaipurState } from './types';
import { createBonusTokens, createInitialGoodsTokens, createJaipurDeck } from './tokens';

const GOODS_TRANSLATION: Record<GoodsType, string> = {
  DIAMOND: 'Kim Cương 💎',
  GOLD: 'Vàng Hoàng Gia 🟡',
  SILVER: 'Bạc Nguyên Chất ⚪',
  CLOTH: 'Tơ Lụa Thượng Hạng 🟣',
  SPICE: 'Gia Vị Quý 🟤',
  LEATHER: 'Da Thuộc Cao Cấp 🔴',
};

function setupRound(
  players: [Player, Player],
  existingSeals: Record<string, number> = {},
  roundNumber: number = 1
): JaipurGameState {
  const fullDeck = createJaipurDeck();

  // 1. Chợ khởi đầu luôn có 3 Lạc đà theo luật
  const initialMarket: JaipurCard[] = [];
  let camelCount = 0;
  const remainingDeck: JaipurCard[] = [];

  for (const card of fullDeck) {
    if (card.type === 'CAMEL' && camelCount < 3) {
      initialMarket.push(card);
      camelCount++;
    } else {
      remainingDeck.push(card);
    }
  }

  // Thêm 2 lá ngẫu nhiên từ bài rút vào chợ để đủ 5 lá
  initialMarket.push(remainingDeck.shift()!);
  initialMarket.push(remainingDeck.shift()!);

  // 2. Chia cho mỗi người chơi 5 lá
  const playerStates: Record<string, PlayerJaipurState> = {};
  players.forEach(p => {
    const hand: JaipurCard[] = [];
    let camels = 0;

    for (let i = 0; i < 5; i++) {
      const card = remainingDeck.shift()!;
      if (card.type === 'CAMEL') {
        camels++;
      } else {
        hand.push(card);
      }
    }

    playerStates[p.id] = {
      playerId: p.id,
      nickname: p.nickname,
      hand,
      camels,
      tokens: {
        goods: [],
        bonus3: [],
        bonus4: [],
        bonus5: [],
      },
      roundScore: 0,
      sealsOfExcellence: existingSeals[p.id] || 0,
    };
  });

  return {
    deck: remainingDeck,
    market: initialMarket,
    goodsTokens: createInitialGoodsTokens(),
    bonusTokens: createBonusTokens(),
    players: playerStates,
    turnOrder: [players[0].id, players[1].id],
    currentTurnIndex: 0,
    round: roundNumber,
    isRoundOver: false,
    gameLogs: [`--- Bắt đầu Hiệp ${roundNumber} của trận đấu Jaipur! ---`],
  };
}

function calculateScore(player: PlayerJaipurState): number {
  let score = 0;
  player.tokens.goods.forEach(t => (score += t.value));
  player.tokens.bonus3.forEach(val => (score += val));
  player.tokens.bonus4.forEach(val => (score += val));
  player.tokens.bonus5.forEach(val => (score += val));
  if (player.tokens.camelBonus) score += player.tokens.camelBonus;
  return score;
}

export const JaipurGamePlugin: BoardGamePlugin<JaipurGameState, JaipurAction> = {
  metadata: {
    id: 'jaipur',
    name: 'Jaipur (Đấu Giao Thương)',
    description: 'Game đối kháng 2 người kinh điển: Quản lý đàn lạc đà, trao đổi tơ lụa, gia vị và trang sức tại khu chợ hoàng gia.',
    tagline: 'Chiến thuật quản trị nguồn hàng & đàn lạc đà sa mạc',
    image: '/assets/games/jaipur.jpg',
    status: 'ready',
    minPlayers: 2,
    maxPlayers: 2,
    estimatedMinutes: 15,
    icon: 'Coins',
    tags: ['2 Người', 'Thẻ bài', 'Chiến thuật kinh tế', 'Huy hiệu hoàng gia'],
  },

  initGame(players: Player[]): JaipurGameState {
    if (players.length !== 2) {
      throw new Error('Jaipur bắt buộc phải có đúng 2 người chơi.');
    }
    return setupRound([players[0], players[1]]);
  },

  validateAction(state: JaipurGameState, playerId: string, action: JaipurAction): boolean {
    if (state.matchWinnerId) return false;

    // Khi hiệp đấu kết thúc, cho phép chuyển sang hiệp tiếp theo
    if (state.isRoundOver) {
      return action.type === 'NEXT_ROUND';
    }

    const currentTurnPlayerId = state.turnOrder[state.currentTurnIndex];
    if (currentTurnPlayerId !== playerId) {
      return false; // Chưa tới lượt
    }

    const player = state.players[playerId];
    if (!player) return false;

    // 1. Lấy 1 lá từ chợ
    if (action.type === 'TAKE_SINGLE') {
      const card = state.market.find(c => c.id === action.marketCardId);
      if (!card) return false;
      if (card.type === 'CAMEL') return false; // Không được lấy lẻ lạc đà theo cách này
      return player.hand.length + 1 <= 7; // Giới hạn bài trên tay tối đa 7 lá
    }

    // 2. Thu gom toàn bộ lạc đà ở chợ
    if (action.type === 'TAKE_CAMELS') {
      const camelCount = state.market.filter(c => c.type === 'CAMEL').length;
      return camelCount > 0;
    }

    // 3. Đổi hàng hóa với chợ
    if (action.type === 'EXCHANGE') {
      const { takeMarketIds, giveHandIds, giveCamelsCount } = action;
      if (!takeMarketIds || takeMarketIds.length < 2) return false; // Phải đổi từ 2 lá trở lên
      if (takeMarketIds.length !== (giveHandIds?.length || 0) + (giveCamelsCount || 0)) {
        return false; // Số lượng lấy phải đúng bằng số lượng bỏ lại chợ
      }

      // Không được lấy Lạc đà từ chợ trong lệnh đổi hàng
      const containsCamelInTake = takeMarketIds.some(id => {
        const c = state.market.find(m => m.id === id);
        return !c || c.type === 'CAMEL';
      });
      if (containsCamelInTake) return false;

      // Kiểm tra người chơi có đủ lạc đà không
      if (giveCamelsCount > player.camels) return false;

      // Kiểm tra người chơi có sở hữu tất cả các lá bài muốn bỏ ra không
      const playerCardIds = new Set(player.hand.map(c => c.id));
      for (const id of giveHandIds) {
        if (!playerCardIds.has(id)) return false;
      }

      // Kiểm tra số bài trên tay sau khi đổi không vượt quá 7
      const resultingHandSize = player.hand.length - giveHandIds.length + takeMarketIds.length;
      return resultingHandSize <= 7;
    }

    // 4. Bán hàng lấy xu điểm
    if (action.type === 'SELL') {
      const { cardIds } = action;
      if (!cardIds || cardIds.length === 0) return false;

      const playerCardMap = new Map(player.hand.map(c => [c.id, c]));
      const selectedCards: JaipurCard[] = [];

      for (const id of cardIds) {
        const card = playerCardMap.get(id);
        if (!card) return false;
        selectedCards.push(card);
      }

      // Tất cả lá bán phải cùng loại
      const firstType = selectedCards[0].type;
      if (firstType === 'CAMEL') return false; // Không được bán lạc đà
      if (selectedCards.some(c => c.type !== firstType)) return false;

      // Hàng quý (Kim cương, Vàng, Bạc) phải bán từ 2 lá trở lên
      if (['DIAMOND', 'GOLD', 'SILVER'].includes(firstType) && selectedCards.length < 2) {
        return false;
      }

      return true;
    }

    return false;
  },

  applyAction(state: JaipurGameState, playerId: string, action: JaipurAction): GameActionResult<JaipurGameState> {
    const nextState: JaipurGameState = JSON.parse(JSON.stringify(state));
    const player = nextState.players[playerId];
    let log = '';

    // Hành động sang vòng đấu tiếp theo
    if (action.type === 'NEXT_ROUND') {
      const p1 = nextState.players[nextState.turnOrder[0]];
      const p2 = nextState.players[nextState.turnOrder[1]];
      const newRound = setupRound(
        [
          { id: p1.playerId, nickname: p1.nickname } as Player,
          { id: p2.playerId, nickname: p2.nickname } as Player,
        ],
        {
          [p1.playerId]: p1.sealsOfExcellence,
          [p2.playerId]: p2.sealsOfExcellence,
        },
        nextState.round + 1
      );
      return {
        nextState: newRound,
        gameLog: `Đã bắt đầu Hiệp ${newRound.round}!`,
      };
    }

    // 1. LẤY 1 LÁ TỪ CHỢ
    if (action.type === 'TAKE_SINGLE') {
      const cardIndex = nextState.market.findIndex(c => c.id === action.marketCardId);
      const card = nextState.market.splice(cardIndex, 1)[0];
      player.hand.push(card);
      log = `${player.nickname} đã bốc 1 lá ${GOODS_TRANSLATION[card.type as GoodsType] || card.type} từ chợ vào tay.`;

      // Bổ sung lá mới từ kho bài vào chợ
      if (nextState.deck.length > 0) {
        nextState.market.push(nextState.deck.shift()!);
      }
    }

    // 2. THU GOM TOÀN BỘ LẠC ĐÀ
    else if (action.type === 'TAKE_CAMELS') {
      const camelsAtMarket = nextState.market.filter(c => c.type === 'CAMEL');
      nextState.market = nextState.market.filter(c => c.type !== 'CAMEL');
      player.camels += camelsAtMarket.length;
      log = `${player.nickname} đã thu nhận toàn bộ ${camelsAtMarket.length} Lạc đà về đàn (hiện có ${player.camels} con).`;

      // Bổ sung lá mới vào chợ cho đủ 5 lá
      while (nextState.market.length < 5 && nextState.deck.length > 0) {
        nextState.market.push(nextState.deck.shift()!);
      }
    }

    // 3. ĐỔI HÀNG HÓA
    else if (action.type === 'EXCHANGE') {
      const { takeMarketIds, giveHandIds, giveCamelsCount } = action;

      // Lấy các lá từ chợ
      const takenCards: JaipurCard[] = [];
      nextState.market = nextState.market.filter(c => {
        if (takeMarketIds.includes(c.id)) {
          takenCards.push(c);
          return false;
        }
        return true;
      });

      // Lấy các lá từ tay người chơi bỏ ra chợ
      const givenCards: JaipurCard[] = [];
      player.hand = player.hand.filter(c => {
        if (giveHandIds.includes(c.id)) {
          givenCards.push(c);
          return false;
        }
        return true;
      });

      // Trừ lạc đà của người chơi và tạo lạc đà mới bỏ vào chợ
      if (giveCamelsCount > 0) {
        player.camels -= giveCamelsCount;
        for (let i = 0; i < giveCamelsCount; i++) {
          givenCards.push({
            id: `camel_exchange_${Date.now()}_${i}`,
            type: 'CAMEL',
          });
        }
      }

      // Đưa các lá trả về chợ
      nextState.market.push(...givenCards);
      // Đưa các lá lấy về tay người chơi
      player.hand.push(...takenCards);

      log = `${player.nickname} đã đổi ${takeMarketIds.length} món hàng với chợ (sử dụng ${giveHandIds.length} lá trên tay và ${giveCamelsCount} lạc đà).`;
    }

    // 4. BÁN HÀNG LẤY XU ĐIỂM
    else if (action.type === 'SELL') {
      const { cardIds } = action;
      const cardsToSell = player.hand.filter(c => cardIds.includes(c.id));
      player.hand = player.hand.filter(c => !cardIds.includes(c.id));

      const goodsType = cardsToSell[0].type as GoodsType;
      const count = cardsToSell.length;

      // Rút xu điểm hàng hóa từ đỉnh chồng xu
      const tokensStack = nextState.goodsTokens[goodsType];
      let earnedPoints = 0;
      for (let i = 0; i < count; i++) {
        if (tokensStack.length > 0) {
          const val = tokensStack.shift()!;
          player.tokens.goods.push({ type: goodsType, value: val });
          earnedPoints += val;
        }
      }

      // Rút xu thưởng combo (3, 4, 5+ lá)
      let bonusText = '';
      if (count === 3 && nextState.bonusTokens.bonus3.length > 0) {
        const bonusVal = nextState.bonusTokens.bonus3.shift()!;
        player.tokens.bonus3.push(bonusVal);
        earnedPoints += bonusVal;
        bonusText = ` + ${bonusVal} điểm thưởng combo 3 lá`;
      } else if (count === 4 && nextState.bonusTokens.bonus4.length > 0) {
        const bonusVal = nextState.bonusTokens.bonus4.shift()!;
        player.tokens.bonus4.push(bonusVal);
        earnedPoints += bonusVal;
        bonusText = ` + ${bonusVal} điểm thưởng combo 4 lá`;
      } else if (count >= 5 && nextState.bonusTokens.bonus5.length > 0) {
        const bonusVal = nextState.bonusTokens.bonus5.shift()!;
        player.tokens.bonus5.push(bonusVal);
        earnedPoints += bonusVal;
        bonusText = ` + ${bonusVal} điểm thưởng combo 5+ lá`;
      }

      log = `${player.nickname} đã bán ${count} lá ${GOODS_TRANSLATION[goodsType]}, thu được ${earnedPoints} điểm${bonusText}!`;
    }

    // Cập nhật điểm số hiện tại
    player.roundScore = calculateScore(player);

    // Chuyển lượt sang đối thủ
    nextState.currentTurnIndex = (nextState.currentTurnIndex + 1) % 2;

    // KIỂM TRA KẾT THÚC HIỆP ĐẤU:
    // 1. Có từ 3 chồng xu điểm hàng hóa bị cạn hết
    const emptyStacksCount = Object.values(nextState.goodsTokens).filter(stack => stack.length === 0).length;
    // 2. Chợ không đủ 5 lá và không còn bài rút trong kho
    const cannotRefillMarket = nextState.market.length < 5 && nextState.deck.length === 0;

    if (emptyStacksCount >= 3 || cannotRefillMarket) {
      nextState.isRoundOver = true;

      // Tính thưởng Lạc đà (+5 điểm cho người có nhiều lạc đà nhất)
      const p1 = nextState.players[nextState.turnOrder[0]];
      const p2 = nextState.players[nextState.turnOrder[1]];

      let camelSummary = '';
      if (p1.camels > p2.camels) {
        p1.tokens.camelBonus = 5;
        p1.roundScore = calculateScore(p1);
        camelSummary = `${p1.nickname} sở hữu đàn lạc đà lớn hơn (${p1.camels} vs ${p2.camels}) nhận 5 điểm thưởng!`;
      } else if (p2.camels > p1.camels) {
        p2.tokens.camelBonus = 5;
        p2.roundScore = calculateScore(p2);
        camelSummary = `${p2.nickname} sở hữu đàn lạc đà lớn hơn (${p2.camels} vs ${p1.camels}) nhận 5 điểm thưởng!`;
      } else {
        camelSummary = `Hai bên hòa lạc đà (${p1.camels} con), không ai nhận điểm thưởng lạc đà.`;
      }

      // Xác định người thắng hiệp
      let roundWinner: PlayerJaipurState;
      if (p1.roundScore > p2.roundScore) {
        roundWinner = p1;
      } else if (p2.roundScore > p1.roundScore) {
        roundWinner = p2;
      } else {
        // Nếu hòa điểm, người có nhiều xu thưởng hơn thắng, nếu vẫn hòa ai nhiều hàng hơn thắng
        roundWinner = p1.tokens.goods.length >= p2.tokens.goods.length ? p1 : p2;
      }

      nextState.roundWinnerId = roundWinner.playerId;
      roundWinner.sealsOfExcellence += 1;

      log += `\n🏁 KẾT THÚC HIỆP ${nextState.round}! ${camelSummary} Tỉ số: ${p1.nickname} (${p1.roundScore} đ) - ${p2.nickname} (${p2.roundScore} đ).`;
      log += ` 🏅 ${roundWinner.nickname} giành được 1 Huy hiệu xuất sắc!`;

      // Kiểm tra có ai đạt 2 Huy hiệu chưa -> Thắng chung cuộc
      if (roundWinner.sealsOfExcellence >= 2) {
        nextState.matchWinnerId = roundWinner.playerId;
        log += `\n👑 CHÚC MỪNG ${roundWinner.nickname} ĐÃ CHIẾN THẮNG CHUNG CUỘC VỚI 2 HUY HIỆU XUẤT SẮC!`;
      }
    }

    nextState.gameLogs.push(log);
    if (nextState.gameLogs.length > 50) {
      nextState.gameLogs.shift();
    }

    return {
      nextState,
      gameLog: log,
    };
  },

  getPlayerView(state: JaipurGameState, playerId: string): any {
    const view: JaipurGameState = JSON.parse(JSON.stringify(state));

    // Bảo mật: Giấu bài trên tay của đối thủ!
    // Đối thủ chỉ được thấy số lượng lá bài đối phương đang cầm (cardCount)
    Object.keys(view.players).forEach(pid => {
      const p: any = view.players[pid];
      if (pid !== playerId) {
        p.cardCount = p.hand.length;
        delete p.hand; // Xóa toàn bộ chi tiết các lá bài của đối phương
      }
    });

    // Giấu thứ tự bài trong chồng bài rút (deck)
    (view as any).deckCount = view.deck.length;
    delete (view as any).deck;

    return view;
  },

  checkGameOver(state: JaipurGameState): GameOverResult {
    if (state.matchWinnerId) {
      const winner = state.players[state.matchWinnerId];
      return {
        isOver: true,
        winners: [state.matchWinnerId],
        summary: `Chúc mừng ${winner.nickname} đã giành chiến thắng chung cuộc tại vương quốc Jaipur!`,
      };
    }
    return { isOver: false };
  },
};

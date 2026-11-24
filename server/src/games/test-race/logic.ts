import { BoardGamePlugin, Player, GameOverResult, GameActionResult } from '@boardgame/shared';
import { BoardTile, RaceAction, RaceGameState, SkillCard, SkillCardType } from './types';

const TOTAL_TILES = 20;

function createTiles(): BoardTile[] {
  const tiles: BoardTile[] = [];
  for (let i = 0; i < TOTAL_TILES; i++) {
    if (i === 0) {
      tiles.push({ index: i, type: 'START', label: 'Xuất phát' });
    } else if (i === TOTAL_TILES - 1) {
      tiles.push({ index: i, type: 'GOAL', label: 'Về Đích 🏆' });
    } else if (i === 3 || i === 11) {
      tiles.push({ index: i, type: 'BOOST', label: 'Tăng tốc (+2)' });
    } else if (i === 7 || i === 15) {
      tiles.push({ index: i, type: 'TRAP', label: 'Hố bẫy (-2)' });
    } else if (i === 9 || i === 13) {
      tiles.push({ index: i, type: 'LUCKY', label: 'Hộp bí mật 🎁' });
    } else {
      tiles.push({ index: i, type: 'NORMAL', label: `Ô ${i}` });
    }
  }
  return tiles;
}

const AVAILABLE_CARDS: { type: SkillCardType; name: string; description: string }[] = [
  { type: 'BOOST_3', name: 'Tên Lửa 🚀', description: 'Tiến ngay thêm 3 ô' },
  { type: 'SHIELD', name: 'Khiên Bảo Hộ 🛡️', description: 'Miễn nhiễm 1 lần hố bẫy' },
  { type: 'SWAP', name: 'Hoán Đổi 🌀', description: 'Đổi vị trí với người dẫn đầu' },
];

function getRandomCard(): SkillCard {
  const chosen = AVAILABLE_CARDS[Math.floor(Math.random() * AVAILABLE_CARDS.length)];
  return {
    id: 'c_' + Math.random().toString(36).substring(2, 8),
    ...chosen,
  };
}

export const TestRaceGamePlugin: BoardGamePlugin<RaceGameState, RaceAction> = {
  metadata: {
    id: 'test-race',
    name: 'Đua Thú Xúc Xắc (Race & Dice)',
    description: 'Game xúc xắc vui nhộn: Đổ xúc xắc di chuyển trên 20 ô bản đồ, né hố bẫy, tích điểm và sử dụng thẻ bài bí mật để về đích!',
    tagline: 'Đua thú cuồng nhiệt & đổ xúc xắc tốc độ',
    image: '/assets/games/test-race.jpg',
    status: 'ready',
    minPlayers: 2,
    maxPlayers: 6,
    estimatedMinutes: 10,
    icon: 'Dice5',
    tags: ['2 - 6 Người', 'Xúc xắc', 'Đua vui nhộn', 'Thẻ bài'],
  },

  initGame(players: Player[]): RaceGameState {
    const tiles = createTiles();
    const playerStates: Record<string, any> = {};
    const turnOrder = players.map(p => p.id);

    players.forEach(p => {
      playerStates[p.id] = {
        playerId: p.id,
        nickname: p.nickname,
        position: 0,
        hasShield: false,
        hand: [getRandomCard()], // Mỗi người khởi đầu với 1 thẻ bài bí mật
        isWinner: false,
      };
    });

    return {
      tiles,
      players: playerStates,
      turnOrder,
      currentTurnIndex: 0,
      hasRolledThisTurn: false,
      gameLogs: ['Trận đấu bắt đầu! Chúc các bạn may mắn.'],
    };
  },

  validateAction(state: RaceGameState, playerId: string, action: RaceAction): boolean {
    if (state.winnerId) return false;

    const currentTurnPlayerId = state.turnOrder[state.currentTurnIndex];
    if (currentTurnPlayerId !== playerId) {
      return false; // Chưa tới lượt
    }

    if (action.type === 'ROLL_DICE') {
      return !state.hasRolledThisTurn; // Chỉ được đổ xúc xắc 1 lần mỗi lượt
    }

    if (action.type === 'USE_CARD') {
      const p = state.players[playerId];
      if (!p) return false;
      return p.hand.some((c: SkillCard) => c.id === action.cardId);
    }

    if (action.type === 'END_TURN') {
      return state.hasRolledThisTurn; // Phải đổ xúc xắc rồi mới được kết thúc lượt
    }

    return false;
  },

  applyAction(state: RaceGameState, playerId: string, action: RaceAction): GameActionResult<RaceGameState> {
    const nextState: RaceGameState = JSON.parse(JSON.stringify(state));
    const player = nextState.players[playerId];
    let log = '';

    if (action.type === 'ROLL_DICE') {
      const dice = Math.floor(Math.random() * 6) + 1;
      nextState.lastDiceRoll = { playerId, value: dice };
      nextState.hasRolledThisTurn = true;

      let newPos = Math.min(player.position + dice, TOTAL_TILES - 1);
      log = `${player.nickname} đổ được ${dice} nút, tiến đến ô ${newPos}.`;

      // Kiểm tra ô đặc biệt
      const tile = nextState.tiles[newPos];
      if (tile.type === 'BOOST') {
        newPos = Math.min(newPos + 2, TOTAL_TILES - 1);
        log += ` Đạp trúng Tăng Tốc! Tiến thêm 2 ô lên ô ${newPos}.`;
      } else if (tile.type === 'TRAP') {
        if (player.hasShield) {
          player.hasShield = false;
          log += ` Rơi vào hố bẫy nhưng đã dùng Khiên bảo hộ để đỡ!`;
        } else {
          newPos = Math.max(newPos - 2, 0);
          log += ` Dính Hố Bẫy! Bị lùi 2 ô về ô ${newPos}.`;
        }
      } else if (tile.type === 'LUCKY') {
        const newCard = getRandomCard();
        player.hand.push(newCard);
        log += ` Nhặt được Hộp Bí Mật: nhận thêm 1 thẻ bài!`;
      }

      player.position = newPos;

      // Kiểm tra về đích
      if (newPos === TOTAL_TILES - 1) {
        nextState.winnerId = playerId;
        player.isWinner = true;
        log += ` 🏆 ${player.nickname} ĐÃ CÁN ĐÍCH VÀ CHIẾN THẮNG!`;
      }
    } else if (action.type === 'USE_CARD') {
      const cardIndex = player.hand.findIndex((c: SkillCard) => c.id === action.cardId);
      if (cardIndex !== -1) {
        const card = player.hand.splice(cardIndex, 1)[0];
        log = `${player.nickname} kích hoạt thẻ [${card.name}]!`;

        if (card.type === 'BOOST_3') {
          player.position = Math.min(player.position + 3, TOTAL_TILES - 1);
          log += ` Tiến thêm 3 ô đến ô ${player.position}.`;
          if (player.position === TOTAL_TILES - 1) {
            nextState.winnerId = playerId;
            player.isWinner = true;
            log += ` 🏆 ${player.nickname} ĐÃ CÁN ĐÍCH CHIẾN THẮNG!`;
          }
        } else if (card.type === 'SHIELD') {
          player.hasShield = true;
          log += ` Nhận hiệu ứng Khiên bảo hộ chống bẫy.`;
        } else if (card.type === 'SWAP') {
          // Tìm người có vị trí cao nhất (khác mình)
          let highestPlayer = Object.values(nextState.players).filter(p => p.playerId !== playerId);
          highestPlayer.sort((a, b) => b.position - a.position);

          if (highestPlayer.length > 0 && highestPlayer[0].position > player.position) {
            const target = highestPlayer[0];
            const oldMyPos = player.position;
            player.position = target.position;
            target.position = oldMyPos;
            log += ` Đã tráo đổi vị trí với ${target.nickname}! (Hiện ở ô ${player.position})`;
          } else {
            log += ` Bạn đang dẫn đầu hoặc bằng điểm, không thể tráo đổi.`;
          }
        }
      }
    } else if (action.type === 'END_TURN') {
      // Chuyển lượt sang người chơi tiếp theo
      nextState.currentTurnIndex = (nextState.currentTurnIndex + 1) % nextState.turnOrder.length;
      nextState.hasRolledThisTurn = false;
      const nextPlayerId = nextState.turnOrder[nextState.currentTurnIndex];
      const nextPlayer = nextState.players[nextPlayerId];
      log = `Đã hết lượt. Tới lượt của ${nextPlayer.nickname}.`;
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

  getPlayerView(state: RaceGameState, playerId: string): any {
    // Clone state để không ảnh hưởng đến state gốc
    const view = JSON.parse(JSON.stringify(state));

    // Lọc dữ liệu mật: Giấu các lá bài của đối thủ!
    Object.keys(view.players).forEach(pid => {
      const p = view.players[pid];
      if (pid !== playerId) {
        // Đối thủ: chỉ biết họ có bao nhiêu lá bài
        p.cardCount = p.hand.length;
        delete p.hand;
      }
    });

    return view;
  },

  checkGameOver(state: RaceGameState): GameOverResult {
    if (state.winnerId) {
      const winner = state.players[state.winnerId];
      return {
        isOver: true,
        winners: [state.winnerId],
        summary: `Chúc mừng ${winner ? winner.nickname : 'người chơi'} đã về đích đầu tiên!`,
      };
    }
    return { isOver: false };
  },
};

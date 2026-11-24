import { BoardGamePlugin, GameActionResult, GameOverResult, Player } from '@boardgame/shared';
import {
  HexCard,
  HexEffectsAction,
  HexEffectsGameState,
  HexType,
  PlayerHexState,
  ShadowSlot,
} from './types';
import { buildHexEffectsDeck, generateHexCard } from './deck';

function drawFromDeck(state: HexEffectsGameState, count: number): HexCard[] {
  const drawn: HexCard[] = [];
  for (let i = 0; i < count; i++) {
    if (state.deck.length === 0) {
      if (state.discardPile.length === 0) break;
      // Trộn lại bài bỏ thành chồng bài rút
      state.deck = [...state.discardPile];
      state.discardPile = [];
      for (let j = state.deck.length - 1; j > 0; j--) {
        const k = Math.floor(Math.random() * (j + 1));
        [state.deck[j], state.deck[k]] = [state.deck[k], state.deck[j]];
      }
    }
    const card = state.deck.pop();
    if (card) drawn.push(card);
  }
  return drawn;
}

export const HexEffectsGamePlugin: BoardGamePlugin<HexEffectsGameState, HexEffectsAction> = {
  metadata: {
    id: 'hex-effect',
    name: 'Hex Effects (Lời Nguyền & Thuốc Giải)',
    description: 'Game thẻ bài hãm hại (Take-that) kinh điển từ Pillbox Games: Vào vai các nhà giả kim thời Trung Cổ, trừ khử 4 lời nguyền trong vùng Bóng Tối của mình trước đối thủ!',
    tagline: 'Trừ khử lời nguyền, gieo rắc tác dụng phụ & hãm hại đối thủ',
    image: '/assets/games/hex-effect.jpg',
    status: 'ready',
    minPlayers: 2,
    maxPlayers: 8,
    estimatedMinutes: 20,
    icon: 'Skull',
    tags: ['2 - 8 Người', 'Thẻ bài', 'Giả kim thuật', 'Take-that', 'Pillbox Games'],
  },

  initGame(players: Player[]): HexEffectsGameState {
    if (players.length < 2 || players.length > 8) {
      throw new Error('Hex Effects yêu cầu từ 2 đến 8 người chơi.');
    }

    const deck = buildHexEffectsDeck();
    const discardPile: HexCard[] = [];
    const playerStates: Record<string, PlayerHexState> = {};
    const turnOrder = players.map((p) => p.id);

    const availableHexTypes: HexType[] = [
      'hanahaki', 'polymelia', 'whisper_war', 'toad_skin',
      'stone_hands', 'bleeding_eyes', 'rat_plague', 'rotting_breath'
    ];

    // Khởi tạo trạng thái cho từng người chơi
    players.forEach((p, pIdx) => {
      // Mỗi người chơi được chia ngẫu nhiên 4 Lời nguyền vào Vùng Bóng Tối (Shadow)
      const shuffledHexes = [...availableHexTypes].sort(() => Math.random() - 0.5);
      const shadow: ShadowSlot[] = shuffledHexes.slice(0, 4).map((type, sIdx) => ({
        slotId: `slot_${p.id}_${sIdx}`,
        hex: generateHexCard(type, `init_${pIdx}_${sIdx}`),
        treatedBy: null,
      }));

      // Mỗi người chơi được chia 4 lá bài khởi đầu vào tay
      const initialHand: HexCard[] = [];
      for (let i = 0; i < 4; i++) {
        const c = deck.pop();
        if (c) initialHand.push(c);
      }

      playerStates[p.id] = {
        playerId: p.id,
        nickname: p.nickname,
        avatarSeed: p.avatarSeed,
        isHost: p.isHost,
        isReady: p.isReady,
        hand: initialHand,
        shadow,
      };
    });

    const firstPlayerId = turnOrder[0];

    const state: HexEffectsGameState = {
      turnOrder,
      currentTurnPlayerId: firstPlayerId,
      actionsLeft: 2,
      turnCount: 1,
      deck,
      discardPile,
      players: playerStates,
      winnerId: null,
      winnerSummary: null,
      gameLogs: [
        `Trận đấu Hex Effects bắt đầu! Mỗi người chơi nhận 4 Lời nguyền trong Vùng Bóng Tối.`,
        `Lượt đầu tiên thuộc về [${playerStates[firstPlayerId].nickname}].`,
      ],
    };

    // Rút 2 lá bài cho người đi đầu tiên khi vào lượt
    const firstDraw = drawFromDeck(state, 2);
    state.players[firstPlayerId].hand.push(...firstDraw);
    state.gameLogs.push(`[${state.players[firstPlayerId].nickname}] đã rút 2 lá bài khởi đầu lượt.`);

    return state;
  },

  validateAction(state: HexEffectsGameState, playerId: string, action: HexEffectsAction): boolean {
    if (state.winnerId) return false;
    if (state.currentTurnPlayerId !== playerId) return false;
    if (state.actionsLeft <= 0 && action.type !== 'END_TURN') return false;

    const player = state.players[playerId];
    if (!player) return false;

    switch (action.type) {
      case 'TREAT_HEX': {
        // Nếu người chơi đang bị yểm bùa JINX thì không thể dùng bất kỳ Thuốc Giải nào
        if (player.isJinxed) return false;

        const card = player.hand.find((c) => c.id === action.cardId);
        if (!card || card.category !== 'REMEDY') return false;
        if (action.slotIndex < 0 || action.slotIndex >= player.shadow.length) return false;

        const slot = player.shadow[action.slotIndex];
        // Ô này chưa được chữa và thuốc giải phải khớp với loại lời nguyền hoặc là SNAKE OIL (ANY)
        if (slot.treatedBy !== null) return false;
        return card.curesHex === 'ANY' || slot.hex.hexType === card.curesHex;
      }

      case 'INFLICT_HEX': {
        const card = player.hand.find((c) => c.id === action.cardId);
        if (!card || card.category !== 'HEX' || !card.hexType) return false;
        if (action.targetPlayerId === playerId) return false;

        const target = state.players[action.targetPlayerId];
        if (!target) return false;

        // Kiểm tra đối thủ có bị ảnh hưởng bởi tác dụng phụ của lời nguyền này không:
        // Đối thủ có ít nhất 1 bài thuốc giải đang chữa mà có tác dụng phụ này
        const hasVulnerableSideEffect = target.shadow.some(
          (s) => s.treatedBy && s.treatedBy.sideEffects?.includes(card.hexType!)
        );

        return hasVulnerableSideEffect;
      }

      case 'PLAY_SPELL': {
        const card = player.hand.find((c) => c.id === action.cardId);
        if (!card || (card.category !== 'SPELL' && card.category !== 'DISASTER')) return false;

        if (card.spellEffect === 'JINX_SILENCE') {
          if (!action.targetPlayerId || action.targetPlayerId === playerId) return false;
          const target = state.players[action.targetPlayerId];
          return !!target;
        }

        if (card.spellEffect === 'DEUS_HEX_MACHINA') {
          if (!action.targetPlayerId || action.targetPlayerId === playerId) return false;
          const target = state.players[action.targetPlayerId];
          if (!target) return false;
          if (action.targetSlotIndex !== undefined) {
            return action.targetSlotIndex >= 0 && action.targetSlotIndex < target.shadow.length;
          }
          return target.shadow.length > 0;
        }

        if (card.spellEffect === 'STEAL_CARD') {
          if (!action.targetPlayerId || action.targetPlayerId === playerId) return false;
          const target = state.players[action.targetPlayerId];
          return !!(target && target.hand.length > 0);
        }

        if (card.spellEffect === 'SWAP_HEX') {
          if (!action.targetPlayerId || action.targetPlayerId === playerId) return false;
          const target = state.players[action.targetPlayerId];
          if (!target) return false;
          const myUntreated = player.shadow.some((s) => s.treatedBy === null);
          const oppUntreated = target.shadow.some((s) => s.treatedBy === null);
          return myUntreated && oppUntreated;
        }

        if (card.spellEffect === 'CORRUPT_SHADOW') {
          if (!action.targetPlayerId || action.targetPlayerId === playerId) return false;
          const target = state.players[action.targetPlayerId];
          if (!target) return false;
          return target.shadow.some((s) => s.treatedBy !== null);
        }

        return true;
      }

      case 'DISCARD_AND_DRAW': {
        if (!action.cardIds || action.cardIds.length === 0) return false;
        return action.cardIds.every((id) => player.hand.some((c) => c.id === id));
      }

      case 'END_TURN':
        return true;

      default:
        return false;
    }
  },

  applyAction(
    state: HexEffectsGameState,
    playerId: string,
    action: HexEffectsAction
  ): GameActionResult<HexEffectsGameState> {
    const nextState: HexEffectsGameState = JSON.parse(JSON.stringify(state));
    const player = nextState.players[playerId];
    let logMsg = '';

    switch (action.type) {
      case 'TREAT_HEX': {
        const cardIdx = player.hand.findIndex((c) => c.id === action.cardId);
        const remedyCard = player.hand.splice(cardIdx, 1)[0];
        const slot = player.shadow[action.slotIndex];

        slot.treatedBy = remedyCard;
        nextState.actionsLeft -= 1;

        const sideEffectsNames = (remedyCard.sideEffects || []).join(', ');
        logMsg = `[${player.nickname}] đã dùng [${remedyCard.name}] chữa khỏi lời nguyền [${slot.hex.name}]! (Tác dụng phụ để lại: ${sideEffectsNames || 'Không'})`;
        nextState.recentEvent = {
          id: `evt_${Date.now()}_${Math.random()}`,
          card: remedyCard,
          actionType: 'TREAT',
          actorNickname: player.nickname,
          title: `${player.nickname.toUpperCase()} ĐÃ DÙNG THUỐC GIẢI!`,
          description: `Đã dùng [${remedyCard.name}] chữa lành thành công lời nguyền [${slot.hex.name}]. Tác dụng phụ: ${sideEffectsNames || 'Không có'}.`,
          timestamp: Date.now(),
        };
        break;
      }

      case 'INFLICT_HEX': {
        const cardIdx = player.hand.findIndex((c) => c.id === action.cardId);
        const hexCard = player.hand.splice(cardIdx, 1)[0];
        const target = nextState.players[action.targetPlayerId];

        // Tìm thuốc giải của đối thủ gây ra tác dụng phụ này và phá hủy nó
        const vulnerableSlot = target.shadow.find(
          (s) => s.treatedBy && s.treatedBy.sideEffects?.includes(hexCard.hexType!)
        );

        if (vulnerableSlot && vulnerableSlot.treatedBy) {
          const removedRemedy = vulnerableSlot.treatedBy;
          vulnerableSlot.treatedBy = null;
          nextState.discardPile.push(removedRemedy);
          nextState.discardPile.push(hexCard);

          logMsg = `[${player.nickname}] lợi dụng tác dụng phụ của [${target.nickname}], gieo [${hexCard.name}] phá hủy thuốc giải [${removedRemedy.name}]!`;
        } else {
          // Thêm lời nguyền vào slot mới
          target.shadow.push({
            slotId: `slot_${target.playerId}_${Date.now()}`,
            hex: hexCard,
            treatedBy: null,
          });
          logMsg = `[${player.nickname}] đã gieo thêm lời nguyền [${hexCard.name}] vào Vùng Bóng Tối của [${target.nickname}]!`;
        }

        nextState.actionsLeft -= 1;
        nextState.recentEvent = {
          id: `evt_${Date.now()}_${Math.random()}`,
          card: hexCard,
          actionType: 'INFLICT',
          actorNickname: player.nickname,
          targetNickname: target.nickname,
          title: `LỜI NGUYỀN GIEO RẮC LÊN ${target.nickname.toUpperCase()}!`,
          description: logMsg,
          timestamp: Date.now(),
        };
        break;
      }

      case 'PLAY_SPELL': {
        const cardIdx = player.hand.findIndex((c) => c.id === action.cardId);
        const actionCard = player.hand.splice(cardIdx, 1)[0];
        nextState.discardPile.push(actionCard);

        if (actionCard.spellEffect === 'JINX_SILENCE' && action.targetPlayerId) {
          const target = nextState.players[action.targetPlayerId];
          if (target) {
            target.isJinxed = true;
            logMsg = `[${player.nickname}] đã yểm bùa [${actionCard.name}] lên [${target.nickname}]! Vạc thuốc bị phong ấn, [${target.nickname}] KHÔNG THỂ dùng Thuốc Giải trong lượt kế tiếp!`;
          }
        } else if (actionCard.spellEffect === 'DEUS_HEX_MACHINA' && action.targetPlayerId) {
          const target = nextState.players[action.targetPlayerId];
          if (target && target.shadow.length > 0) {
            const sIdx = action.targetSlotIndex !== undefined && action.targetSlotIndex >= 0 && action.targetSlotIndex < target.shadow.length
              ? action.targetSlotIndex
              : 0;
            const targetSlot = target.shadow[sIdx];

            let inflictedHex: HexCard;
            if (action.chosenHexCardId) {
              const hIdx = player.hand.findIndex((c) => c.id === action.chosenHexCardId && c.category === 'HEX');
              if (hIdx !== -1) {
                inflictedHex = player.hand.splice(hIdx, 1)[0];
              } else {
                inflictedHex = generateHexCard('hanahaki', `deus_${Date.now()}`);
              }
            } else {
              const hexInHandIdx = player.hand.findIndex((c) => c.category === 'HEX');
              if (hexInHandIdx !== -1) {
                inflictedHex = player.hand.splice(hexInHandIdx, 1)[0];
              } else {
                const availableHexTypes: HexType[] = [
                  'hanahaki', 'polymelia', 'whisper_war', 'toad_skin',
                  'stone_hands', 'bleeding_eyes', 'rat_plague', 'rotting_breath'
                ];
                const randomType = availableHexTypes[Math.floor(Math.random() * availableHexTypes.length)];
                inflictedHex = generateHexCard(randomType, `deus_${Date.now()}`);
              }
            }

            if (targetSlot.treatedBy) {
              nextState.discardPile.push(targetSlot.treatedBy);
            }
            targetSlot.treatedBy = null;
            targetSlot.hex = inflictedHex;

            logMsg = `[${player.nickname}] kích hoạt [${actionCard.name}]! Thần Cơ cổ đại cưỡng chế gieo lời nguyền [${inflictedHex.name}] vào Ô ${sIdx + 1} của [${target.nickname}] (phá hủy mọi phòng ngự)!`;
          }
        } else if (actionCard.spellEffect === 'STEAL_CARD' && action.targetPlayerId) {
          const target = nextState.players[action.targetPlayerId];
          if (target && target.hand.length > 0) {
            const stealIdx = Math.floor(Math.random() * target.hand.length);
            const stolen = target.hand.splice(stealIdx, 1)[0];
            player.hand.push(stolen);
            logMsg = `[${player.nickname}] dùng [${actionCard.name}], trộm 1 lá bài trên tay [${target.nickname}]!`;
          }
        } else if (actionCard.spellEffect === 'SWAP_HEX' && action.targetPlayerId) {
          const target = nextState.players[action.targetPlayerId];
          const mySlot = player.shadow.find((s) => s.treatedBy === null);
          const oppSlot = target?.shadow.find((s) => s.treatedBy === null);

          if (mySlot && oppSlot) {
            const tempHex = mySlot.hex;
            mySlot.hex = oppSlot.hex;
            oppSlot.hex = tempHex;
            logMsg = `[${player.nickname}] dùng [${actionCard.name}], hoán đổi lời nguyền với [${target.nickname}]!`;
          }
        } else if (actionCard.spellEffect === 'CORRUPT_SHADOW' && action.targetPlayerId) {
          const target = nextState.players[action.targetPlayerId];
          const treatedSlot = target?.shadow.find((s) => s.treatedBy !== null);
          if (treatedSlot && treatedSlot.treatedBy) {
            const purged = treatedSlot.treatedBy;
            treatedSlot.treatedBy = null;
            nextState.discardPile.push(purged);
            logMsg = `[${player.nickname}] dùng [${actionCard.name}], hủy bỏ thuốc giải [${purged.name}] của [${target.nickname}]!`;
          }
        } else if (actionCard.disasterEffect === 'POISON_MIST') {
          // Mọi đối thủ phải bỏ 1 lá bài ngẫu nhiên
          Object.values(nextState.players).forEach((p) => {
            if (p.playerId !== playerId && p.hand.length > 0) {
              const rIdx = Math.floor(Math.random() * p.hand.length);
              const discarded = p.hand.splice(rIdx, 1)[0];
              nextState.discardPile.push(discarded);
            }
          });
          logMsg = `[${player.nickname}] kích hoạt [${actionCard.name}]! Tất cả đối thủ phải bỏ 1 lá bài trên tay.`;
        }

        nextState.actionsLeft -= 1;
        nextState.recentEvent = {
          id: `evt_${Date.now()}_${Math.random()}`,
          card: actionCard,
          actionType: actionCard.category === 'DISASTER' ? 'DISASTER' : 'SPELL',
          actorNickname: player.nickname,
          targetNickname: action.targetPlayerId ? nextState.players[action.targetPlayerId]?.nickname : undefined,
          title: actionCard.category === 'DISASTER' ? 'ĐẠI HỌA ĐỘC DƯỢC BÙNG NỔ!' : `${player.nickname.toUpperCase()} THI TRIỂN BÙA CHÚ!`,
          description: logMsg,
          timestamp: Date.now(),
        };
        break;
      }

      case 'DISCARD_AND_DRAW': {
        const discardedCards: HexCard[] = [];
        action.cardIds.forEach((id) => {
          const idx = player.hand.findIndex((c) => c.id === id);
          if (idx !== -1) {
            discardedCards.push(player.hand.splice(idx, 1)[0]);
          }
        });

        nextState.discardPile.push(...discardedCards);
        const drawn = drawFromDeck(nextState, discardedCards.length);
        player.hand.push(...drawn);

        nextState.actionsLeft -= 1;
        logMsg = `[${player.nickname}] đã bỏ ${discardedCards.length} lá bài và rút lại bấy nhiêu lá bài mới.`;
        nextState.recentEvent = {
          id: `evt_${Date.now()}_${Math.random()}`,
          card: discardedCards[0] || {
            id: 'discard',
            category: 'SPELL',
            name: 'Đổi Bài Giả Kim',
            subtitle: 'Thanh lọc dược phòng',
            description: `Đã bỏ ${discardedCards.length} lá bài và rút lại bài mới.`,
            image: '/assets/games/hex-effects/snake_oil.jpg',
          },
          actionType: 'DISCARD',
          actorNickname: player.nickname,
          title: `${player.nickname.toUpperCase()} ĐÃ ĐỔI BÀI!`,
          description: logMsg,
          timestamp: Date.now(),
        };
        break;
      }

      case 'END_TURN': {
        logMsg = `[${player.nickname}] đã kết thúc lượt của mình.`;
        nextState.actionsLeft = 0;
        break;
      }
    }

    if (logMsg) nextState.gameLogs.push(logMsg);

    // Kiểm tra điều kiện thắng: Người đầu tiên chữa khỏi TẤT CẢ lời nguyền trong Shadow
    for (const p of Object.values(nextState.players)) {
      const allTreated = p.shadow.length > 0 && p.shadow.every((s) => s.treatedBy !== null);
      if (allTreated) {
        nextState.winnerId = p.playerId;
        nextState.winnerSummary = `[${p.nickname}] đã xuất sắc chữa khỏi toàn bộ Lời Nguyền trong Vùng Bóng Tối và giành chiến thắng chung cuộc!`;
        nextState.gameLogs.push(nextState.winnerSummary);
        return {
          nextState,
          gameLog: logMsg,
        };
      }
    }

    // Nếu hết hành động, tự động chuyển lượt cho người chơi tiếp theo
    if (nextState.actionsLeft <= 0) {
      // Hóa giải bùa JINX cho người chơi vừa hoàn thành lượt của họ
      player.isJinxed = false;

      const currentIndex = nextState.turnOrder.indexOf(nextState.currentTurnPlayerId);
      const nextIndex = (currentIndex + 1) % nextState.turnOrder.length;
      const nextPlayerId = nextState.turnOrder[nextIndex];

      nextState.currentTurnPlayerId = nextPlayerId;
      nextState.actionsLeft = 2;
      nextState.turnCount += 1;

      // Người tiếp theo rút 2 lá bài vào đầu lượt
      const drawn = drawFromDeck(nextState, 2);
      nextState.players[nextPlayerId].hand.push(...drawn);

      const nextPlayer = nextState.players[nextPlayerId];
      const jinxNotice = nextPlayer.isJinxed ? ' [ĐANG BỊ YỂM BÙA JINX: CẤM DÙNG THUỐC GIẢI TRONG LƯỢT NÀY!]' : '';
      const turnStartMsg = `Đến lượt [${nextPlayer.nickname}]. Đã rút 2 lá bài (Còn 2 hành động)${jinxNotice}.`;
      nextState.gameLogs.push(turnStartMsg);
    }

    return {
      nextState,
      gameLog: logMsg,
    };
  },

  getPlayerView(state: HexEffectsGameState, playerId: string): any {
    const view: HexEffectsGameState = JSON.parse(JSON.stringify(state));

    const isPlayer = Object.keys(view.players).includes(playerId);
    const visiblePlayerId = isPlayer ? playerId : view.turnOrder[0];

    // Ẩn nội dung bài trên tay của đối thủ, chỉ hiển thị số lượng bài
    Object.keys(view.players).forEach((pId) => {
      if (pId !== visiblePlayerId) {
        const actualHand = view.players[pId].hand || [];
        view.players[pId].hand = actualHand.map((_, idx) => ({
          id: `hidden_${idx}`,
          category: 'HEX',
          name: 'Lá bài úp',
          subtitle: 'Bí mật của đối thủ',
          description: 'Bài trên tay của đối thủ được giấu kín.',
        }));
      }
    });

    // Ẩn thứ tự bài trong chồng bài rút (chỉ giữ số lượng lá bài)
    view.deck = view.deck.map((_, idx) => ({
      id: `deck_${idx}`,
      category: 'HEX',
      name: 'Chồng bài rút',
      subtitle: '',
      description: '',
    }));

    return view;
  },

  checkGameOver(state: HexEffectsGameState): GameOverResult {
    if (state.winnerId) {
      return {
        isOver: true,
        winners: [state.winnerId],
        summary: state.winnerSummary || `Người chơi ${state.winnerId} đã chiến thắng!`,
      };
    }
    return { isOver: false };
  },
};

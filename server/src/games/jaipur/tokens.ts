import { CardType, GoodsType, JaipurCard } from './types';

export function createJaipurDeck(): JaipurCard[] {
  const cards: JaipurCard[] = [];
  let idCounter = 1;

  const addCards = (type: CardType, count: number) => {
    for (let i = 0; i < count; i++) {
      cards.push({ id: `j_${type.toLowerCase()}_${idCounter++}`, type });
    }
  };

  // 6 Kim cương, 6 Vàng, 6 Bạc
  addCards('DIAMOND', 6);
  addCards('GOLD', 6);
  addCards('SILVER', 6);

  // 8 Tơ lụa, 8 Gia vị
  addCards('CLOTH', 8);
  addCards('SPICE', 8);

  // 10 Da thuộc
  addCards('LEATHER', 10);

  // 11 Lạc đà
  addCards('CAMEL', 11);

  // Xáo bài (Fisher-Yates shuffle)
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }

  return cards;
}

export function createInitialGoodsTokens(): Record<GoodsType, number[]> {
  return {
    DIAMOND: [7, 7, 5, 5, 5],
    GOLD: [6, 6, 5, 5, 5],
    SILVER: [5, 5, 5, 5, 5],
    CLOTH: [5, 3, 3, 2, 2, 1, 1],
    SPICE: [5, 3, 3, 2, 2, 1, 1],
    LEATHER: [4, 3, 2, 1, 1, 1, 1, 1, 1],
  };
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function createBonusTokens() {
  return {
    bonus3: shuffle([3, 3, 2, 2, 2, 1, 1]),
    bonus4: shuffle([6, 6, 5, 5, 4, 4]),
    bonus5: shuffle([10, 10, 9, 8, 8]),
  };
}

import { HexCard, HexType } from './types';

export const HEX_DEFINITIONS: Record<HexType, { name: string; subtitle: string; description: string; image: string }> = {
  hanahaki: {
    name: 'HANAHAKI (Hoa Độc Thấu Tâm)',
    subtitle: 'Lời nguyền buồng phổi nở hoa hồng',
    description: 'Dây leo hoa hồng trồi lên từ khí quản bóp nghẹt lồng ngực. Mọi thao tác bào chế thuốc giải đều bị đau đớn cản trở.',
    image: '/assets/games/hex-effects/hanahaki.jpg',
  },
  polymelia: {
    name: 'POLYMELIA (Dị Tật Đa Chi)',
    subtitle: 'Lời nguyền quái thai mọc thêm tay',
    description: 'Cơ thể đột biến mọc thêm 6 cánh tay gớm ghiếc mất kiểm soát. Kẻ gieo bùa được tước đoạt dược liệu từ tay nạn nhân!',
    image: '/assets/games/hex-effects/polymelia.jpg',
  },
  whisper_war: {
    name: 'WHISPER WAR (Tiếng Thì Thầm Tà Thuật)',
    subtitle: 'Oán linh xì xào trong tâm trí',
    description: 'Những giọng nói ma quái từ cõi âm xúi giục tâm can, làm đảo lộn suy nghĩ và cản trở việc bào chế.',
    image: '/assets/games/hex-effects/whisper_war.jpg',
  },
  toad_skin: {
    name: 'TOAD SKIN (Mụn Cóc Đầm Lầy)',
    subtitle: 'Độc dịch cóc tía sần sùi phỏng rộp',
    description: 'Làn da sần sùi mủ nhớt độc địa như da cóc tía ngâm trong vạc độc, cản trở việc cầm nắm dụng cụ độc dược.',
    image: '/assets/games/hex-effects/toad_skin.jpg',
  },
  stone_hands: {
    name: 'PETRIFICUS (Hóa Đá Cốt Tủy)',
    subtitle: 'Hóa thạch tứ chi như tượng đá',
    description: 'Khớp ngón tay dần đặc quánh và đông cứng thành đá tảng lạnh lẽo, vô phương cử động bình thường.',
    image: '/assets/games/hex-effects/petrificus.jpg',
  },
  bleeding_eyes: {
    name: 'BLOOD TEARS (Lệ Huyết U Ám)',
    subtitle: 'Huyết nhãn che phủ tầm nhìn',
    description: 'Mắt nhỏ từng giọt lệ huyết đỏ thẫm rỉ rả, làm mờ đi mọi công thức giả kim và dược điển.',
    image: '/assets/games/hex-effects/blood_tears.jpg',
  },
  rat_plague: {
    name: 'BLACK DEATH (Dịch Hạch Chuột Đen)',
    subtitle: 'Mầm bệnh hoại tử gặm nhấm',
    description: 'Bầy chuột đen mang mầm bệnh hoại tử gặm nhấm mọi dược thảo quý giá trong kho trữ.',
    image: '/assets/games/hex-effects/black_death.jpg',
  },
  rotting_breath: {
    name: 'MORTAL MIASMA (Tử Khí Hầm Mộ)',
    subtitle: 'Hơi thở nồng nặc mùi xác chết',
    description: 'Khí độc từ nấm mồ bốc lên u ám, làm hư thối mọi bình thí nghiệm và khiến đối thủ kinh sợ.',
    image: '/assets/games/hex-effects/mortal_miasma.jpg',
  },
};

// Định nghĩa từng bài Thuốc Giải tương ứng với từng Lời Nguyền kèm Tác Dụng Phụ
export const REMEDY_DEFINITIONS: Array<{
  name: string;
  subtitle: string;
  description: string;
  curesHex: HexType | 'ANY';
  sideEffects: HexType[];
  image: string;
}> = [
  {
    name: 'SNAKE OIL (Dầu Rắn Vạn Năng)',
    subtitle: 'Thần dược Breslin từ nọc độc xà vương',
    description: 'Chữa lành BẤT KỲ Lời Nguyền nào lập tức! Nhưng nếu xảy ra Thảm Họa (Disaster), Dầu Rắn sẽ bị thiêu rụi.',
    curesHex: 'ANY',
    sideEffects: ['polymelia', 'whisper_war'],
    image: '/assets/games/hex-effects/snake_oil.jpg',
  },
  {
    name: 'NƯỚC MẮT PHƯỢNG HOÀNG (Tears of Phoenix)',
    subtitle: 'Thánh dược tái sinh từ tro tàn',
    description: 'Chữa lành lời nguyền buồng phổi nở hoa HANAHAKI, bảo vệ sinh mạng tuyệt đối.',
    curesHex: 'hanahaki',
    sideEffects: ['stone_hands', 'rat_plague'],
    image: '/assets/games/hex-effects/phoenix_tears.jpg',
  },
  {
    name: 'BẢ CHÓ SÓI (Wolfsbane Potion)',
    subtitle: 'Độc dược kiểm soát dã thú & đột biến',
    description: 'Kìm hãm sự phát triển của mầm bệnh dị biến, hóa giải Dị Tật Đa Chi mọc thêm tay.',
    curesHex: 'polymelia',
    sideEffects: ['hanahaki', 'bleeding_eyes'],
    image: '/assets/games/hex-effects/wolfsbane.jpg',
  },
  {
    name: 'ĐỘC DƯỢC WIGGENWELD (Thần Dược Tỉnh Giác)',
    subtitle: 'Thuốc hồi sinh và giải trừ mê sảng',
    description: 'Xua tan cơn ác mộng và Tiếng Thì Thầm Tà Thuật trong tâm trí chốc lát.',
    curesHex: 'whisper_war',
    sideEffects: ['rotting_breath', 'toad_skin'],
    image: '/assets/games/hex-effects/wiggenweld.jpg',
  },
  {
    name: 'BEZOAR (Ngọc Độc Giải Thạch)',
    subtitle: 'Sỏi trong dạ dày dê giải bách độc',
    description: 'Viên ngọc giải độc huyền thoại của giáo sư Snape, thanh lọc hoàn toàn độc tố Mụn Cóc Đầm Lầy.',
    curesHex: 'toad_skin',
    sideEffects: ['whisper_war', 'stone_hands'],
    image: '/assets/games/hex-effects/bezoar.jpg',
  },
  {
    name: 'RỄ MANDRAKE (Nhân Thảo Khóc La)',
    subtitle: 'Củ nhân thảo giải trừ hóa đá',
    description: 'Tinh chất củ Mandrake trưởng thành, hóa giải hoàn toàn trạng thái Hóa Đá Cốt Tủy.',
    curesHex: 'stone_hands',
    sideEffects: ['rat_plague', 'bleeding_eyes'],
    image: '/assets/games/hex-effects/mandrake.jpg',
  },
  {
    name: 'TINH CHẤT BẠCH DIỆP (Essence of Dittany)',
    subtitle: 'Thuốc bôi tái tạo vết thương tức thì',
    description: 'Một giọt tinh chất Bạch Diệp khép miệng vết thương rỉ máu, phục hồi thị lực hoàn toàn.',
    curesHex: 'bleeding_eyes',
    sideEffects: ['toad_skin', 'rotting_breath'],
    image: '/assets/games/hex-effects/dittany.jpg',
  },
  {
    name: 'THUỐC CẢM TIÊU PHÙ (Pepperup Potion)',
    subtitle: 'Khói xì ra lỗ tai làm ấm toàn thân',
    description: 'Làm khô bọt mép và tiêu diệt hoàn toàn mầm bệnh Dịch Hạch Chuột Đen.',
    curesHex: 'rat_plague',
    sideEffects: ['rotting_breath', 'polymelia'],
    image: '/assets/games/hex-effects/pepperup.jpg',
  },
  {
    name: 'HUYẾT DƯỢC BỔ TÚC (Blood-Replenishing)',
    subtitle: 'Phục hồi sinh khí và hơi thở',
    description: 'Lọc sạch khí độc tử thi, giải thoát khỏi Tử Khí Hầm Mộ.',
    curesHex: 'rotting_breath',
    sideEffects: ['hanahaki', 'stone_hands'],
    image: '/assets/games/hex-effects/mortal_miasma.jpg',
  },
];

// Định nghĩa các thẻ bài Hành động Giả Kim (Spell / Disaster) chuẩn luật Hex Effects
export const ACTION_CARDS_DEFINITIONS = [
  {
    category: 'SPELL' as const,
    name: 'JINX! (Bùa Yểm Cấm Dược)',
    subtitle: 'Khóa chặt vạc thuốc đối phương',
    description: 'Yểm bùa quái kiệt lên 1 đối thủ! Nạn nhân hoàn toàn KHÔNG THỂ dùng bất kỳ thẻ Thuốc Giải (Remedies) nào trong lượt tiếp theo của họ.',
    spellEffect: 'JINX_SILENCE' as const,
    image: '/assets/games/hex-effects/jinx.jpg',
  },
  {
    category: 'SPELL' as const,
    name: 'DEUS HEX MACHINA (Thần Cơ Cưỡng Chế)',
    subtitle: 'Bỏ qua điều kiện tác dụng phụ',
    description: 'Cỗ máy cổ đại cưỡng chế gieo thẳng 1 Lời Nguyền lên đối thủ bất kỳ mà KHÔNG CẦN đối thủ phải có Tác Dụng Phụ tương ứng! Đồng thời xé nát thuốc giải tại ô đó nếu có.',
    spellEffect: 'DEUS_HEX_MACHINA' as const,
    image: '/assets/games/hex-effects/deus_hex_machina.jpg',
  },
  {
    category: 'SPELL' as const,
    name: 'EXPELLIARMUS (Tước Khí Dược Bào)',
    subtitle: 'Tước đoạt bài trên tay đối phương',
    description: 'Đột nhập phòng bào chế đối thủ, tước đoạt ngẫu nhiên 1 lá bài trên tay họ về tay bạn.',
    spellEffect: 'STEAL_CARD' as const,
    image: '/assets/games/hex-effects/jinx.jpg',
  },
  {
    category: 'SPELL' as const,
    name: 'OBLIVIATE (Xóa Bỏ Ký Ức)',
    subtitle: 'Hoán đổi vị trí lời nguyền',
    description: 'Hoán đổi 1 ô Lời Nguyền chưa giải của bạn với 1 ô Lời Nguyền của đối thủ.',
    spellEffect: 'SWAP_HEX' as const,
    image: '/assets/games/hex-effects/polymelia.jpg',
  },
  {
    category: 'SPELL' as const,
    name: 'DIFFINDO (Cắt Đứt Phong Ấn)',
    subtitle: 'Phá hủy thuốc giải của đối thủ',
    description: 'Hủy 1 lá Thuốc Giải đã đặt của đối thủ, đưa Lời Nguyền trở lại trạng thái gặm nhấm!',
    spellEffect: 'CORRUPT_SHADOW' as const,
    image: '/assets/games/hex-effects/disaster.jpg',
  },
  {
    category: 'DISASTER' as const,
    name: 'DISASTER (Đại Họa Độc Dược)',
    subtitle: 'Vụ nổ vạc thuốc tại hầm ngục',
    description: 'Khói độc bùng nổ! Tất cả đối thủ phải bỏ 1 lá bài ngẫu nhiên trên tay vào chồng bài bỏ.',
    disasterEffect: 'POISON_MIST' as const,
    image: '/assets/games/hex-effects/disaster.jpg',
  },
];

export function generateHexCard(hexType: HexType, idSuffix: string): HexCard {
  const def = HEX_DEFINITIONS[hexType];
  return {
    id: `hex_${hexType}_${idSuffix}`,
    category: 'HEX',
    hexType,
    name: def.name,
    subtitle: def.subtitle,
    description: def.description,
    image: def.image,
  };
}

export function generateRemedyCard(index: number, idSuffix: string): HexCard {
  const def = REMEDY_DEFINITIONS[index % REMEDY_DEFINITIONS.length];
  return {
    id: `rem_${def.curesHex}_${idSuffix}`,
    category: 'REMEDY',
    name: def.name,
    subtitle: def.subtitle,
    description: def.description,
    curesHex: def.curesHex,
    sideEffects: def.sideEffects,
    image: def.image,
  };
}

export function buildHexEffectsDeck(): HexCard[] {
  const deck: HexCard[] = [];
  const hexTypes: HexType[] = [
    'hanahaki', 'polymelia', 'whisper_war', 'toad_skin',
    'stone_hands', 'bleeding_eyes', 'rat_plague', 'rotting_breath'
  ];

  // 1. Thêm các lá HEX vào bộ bài rút (mỗi loại 2 lá = 16 lá)
  hexTypes.forEach((type, idx) => {
    deck.push(generateHexCard(type, `d1_${idx}`));
    deck.push(generateHexCard(type, `d2_${idx}`));
  });

  // 2. Thêm các lá REMEDY vào bộ bài rút (mỗi bài thuốc 3 lá = 27 lá)
  REMEDY_DEFINITIONS.forEach((_, idx) => {
    deck.push(generateRemedyCard(idx, `r1_${idx}`));
    deck.push(generateRemedyCard(idx, `r2_${idx}`));
    deck.push(generateRemedyCard(idx, `r3_${idx}`));
  });

  // 3. Thêm các lá HÀNH ĐỘNG / PHÉP THUẬT / THẢM HỌA (10 lá)
  ACTION_CARDS_DEFINITIONS.forEach((act, idx) => {
    deck.push({
      id: `act_${act.spellEffect || act.disasterEffect}_${idx}_1`,
      category: act.category,
      name: act.name,
      subtitle: act.subtitle,
      description: act.description,
      spellEffect: act.spellEffect,
      disasterEffect: act.disasterEffect,
      image: act.image,
    });
    deck.push({
      id: `act_${act.spellEffect || act.disasterEffect}_${idx}_2`,
      category: act.category,
      name: act.name,
      subtitle: act.subtitle,
      description: act.description,
      spellEffect: act.spellEffect,
      disasterEffect: act.disasterEffect,
      image: act.image,
    });
  });

  // Trộn bài (Fisher-Yates Shuffle)
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  return deck;
}

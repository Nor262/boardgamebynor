import { HexCard, HexType } from './types';

export interface CardColorTheme {
  colorName: string;
  borderColor: string;
  selectedBorderColor: string;
  bgGradient: string;
  badgeBg: string;
  titleColor: string;
  tagBg: string;
  glowColor: string;
  ringColor: string;
  accentHex: string;
  categoryLabel: string;
}

export const HEX_THEMES: Record<HexType, CardColorTheme> = {
  hanahaki: {
    colorName: 'Đỏ Hồng Tử Thần',
    borderColor: 'border-rose-600/90',
    selectedBorderColor: 'border-rose-400',
    bgGradient: 'from-[#2e0e16] via-[#1a0a0f] to-[#0e0407]',
    badgeBg: 'bg-rose-950/90 text-rose-300 border border-rose-500/80',
    titleColor: 'text-rose-200',
    tagBg: 'bg-rose-950/90 text-rose-300 border-rose-500/70',
    glowColor: 'shadow-[0_0_20px_rgba(244,63,94,0.35)]',
    ringColor: 'ring-rose-400',
    accentHex: '#f43f5e',
    categoryLabel: 'LỜI NGUYỀN ĐỎ',
  },
  polymelia: {
    colorName: 'Lục Bảo Đột Biến',
    borderColor: 'border-emerald-600/90',
    selectedBorderColor: 'border-emerald-400',
    bgGradient: 'from-[#0c281c] via-[#081b13] to-[#040e0a]',
    badgeBg: 'bg-emerald-950/90 text-emerald-300 border border-emerald-500/80',
    titleColor: 'text-emerald-200',
    tagBg: 'bg-emerald-950/90 text-emerald-300 border-emerald-500/70',
    glowColor: 'shadow-[0_0_20px_rgba(16,185,129,0.35)]',
    ringColor: 'ring-emerald-400',
    accentHex: '#10b981',
    categoryLabel: 'LỜI NGUYỀN LỤC',
  },
  whisper_war: {
    colorName: 'Xanh Lơ Tà Thuật',
    borderColor: 'border-cyan-600/90',
    selectedBorderColor: 'border-cyan-400',
    bgGradient: 'from-[#0a262d] via-[#06181d] to-[#030d10]',
    badgeBg: 'bg-cyan-950/90 text-cyan-300 border border-cyan-500/80',
    titleColor: 'text-cyan-200',
    tagBg: 'bg-cyan-950/90 text-cyan-300 border-cyan-500/70',
    glowColor: 'shadow-[0_0_20px_rgba(6,182,212,0.35)]',
    ringColor: 'ring-cyan-400',
    accentHex: '#06b6d4',
    categoryLabel: 'LỜI NGUYỀN LƠ',
  },
  toad_skin: {
    colorName: 'Xanh Rêu Đầm Lầy',
    borderColor: 'border-lime-600/90',
    selectedBorderColor: 'border-lime-400',
    bgGradient: 'from-[#202a0b] via-[#141b07] to-[#0a0e04]',
    badgeBg: 'bg-lime-950/90 text-lime-300 border border-lime-500/80',
    titleColor: 'text-lime-200',
    tagBg: 'bg-lime-950/90 text-lime-300 border-lime-500/70',
    glowColor: 'shadow-[0_0_20px_rgba(132,204,22,0.35)]',
    ringColor: 'ring-lime-400',
    accentHex: '#84cc16',
    categoryLabel: 'LỜI NGUYỀN RÊU',
  },
  stone_hands: {
    colorName: 'Vàng Đất Nham Thạch',
    borderColor: 'border-amber-600/90',
    selectedBorderColor: 'border-amber-400',
    bgGradient: 'from-[#2d1e0a] via-[#1b1206] to-[#0e0903]',
    badgeBg: 'bg-amber-950/90 text-amber-300 border border-amber-500/80',
    titleColor: 'text-amber-200',
    tagBg: 'bg-amber-950/90 text-amber-300 border-amber-500/70',
    glowColor: 'shadow-[0_0_20px_rgba(245,158,11,0.35)]',
    ringColor: 'ring-amber-400',
    accentHex: '#f59e0b',
    categoryLabel: 'LỜI NGUYỀN ĐÁ',
  },
  bleeding_eyes: {
    colorName: 'Tím Phong Lan',
    borderColor: 'border-purple-600/90',
    selectedBorderColor: 'border-purple-400',
    bgGradient: 'from-[#260e32] via-[#180820] to-[#0c0410]',
    badgeBg: 'bg-purple-950/90 text-purple-300 border border-purple-500/80',
    titleColor: 'text-purple-200',
    tagBg: 'bg-purple-950/90 text-purple-300 border-purple-500/70',
    glowColor: 'shadow-[0_0_20px_rgba(168,85,247,0.35)]',
    ringColor: 'ring-purple-400',
    accentHex: '#a855f7',
    categoryLabel: 'LỜI NGUYỀN TÍM',
  },
  rat_plague: {
    colorName: 'Cam Cháy Dịch Hạch',
    borderColor: 'border-orange-600/90',
    selectedBorderColor: 'border-orange-400',
    bgGradient: 'from-[#2d1408] via-[#1c0c05] to-[#0e0602]',
    badgeBg: 'bg-orange-950/90 text-orange-300 border border-orange-500/80',
    titleColor: 'text-orange-200',
    tagBg: 'bg-orange-950/90 text-orange-300 border-orange-500/70',
    glowColor: 'shadow-[0_0_20px_rgba(249,115,22,0.35)]',
    ringColor: 'ring-orange-400',
    accentHex: '#f97316',
    categoryLabel: 'LỜI NGUYỀN CAM',
  },
  rotting_breath: {
    colorName: 'Chàm U Linh Hầm Mộ',
    borderColor: 'border-indigo-600/90',
    selectedBorderColor: 'border-indigo-400',
    bgGradient: 'from-[#17183a] via-[#0f0f26] to-[#070713]',
    badgeBg: 'bg-indigo-950/90 text-indigo-300 border border-indigo-500/80',
    titleColor: 'text-indigo-200',
    tagBg: 'bg-indigo-950/90 text-indigo-300 border-indigo-500/70',
    glowColor: 'shadow-[0_0_20px_rgba(99,102,241,0.35)]',
    ringColor: 'ring-indigo-400',
    accentHex: '#6366f1',
    categoryLabel: 'LỜI NGUYỀN CHÀM',
  },
};

export const UNIVERSAL_REMEDY_THEME: CardColorTheme = {
  colorName: 'Hoàng Kim Vạn Năng',
  borderColor: 'border-yellow-400',
  selectedBorderColor: 'border-yellow-300',
  bgGradient: 'from-[#332508] via-[#1f1705] to-[#100c03]',
  badgeBg: 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black font-black border border-yellow-300',
  titleColor: 'text-yellow-200',
  tagBg: 'bg-yellow-950/90 text-yellow-300 border-yellow-500/80',
  glowColor: 'shadow-[0_0_25px_rgba(250,204,21,0.45)]',
  ringColor: 'ring-yellow-300',
  accentHex: '#eab308',
  categoryLabel: 'THUỐC VẠN NĂNG',
};

export const SPELL_THEME: CardColorTheme = {
  colorName: 'Bùa Chú Huyền Bí',
  borderColor: 'border-amber-500/90',
  selectedBorderColor: 'border-amber-300',
  bgGradient: 'from-[#22180a] via-[#161007] to-[#0d0a04]',
  badgeBg: 'bg-amber-950/90 text-amber-300 border border-amber-500/80',
  titleColor: 'text-amber-200',
  tagBg: 'bg-amber-950/90 text-amber-300 border-amber-500/70',
  glowColor: 'shadow-[0_0_20px_rgba(245,158,11,0.35)]',
  ringColor: 'ring-amber-400',
  accentHex: '#f59e0b',
  categoryLabel: 'BÙA PHÉP',
};

export const DISASTER_THEME: CardColorTheme = {
  colorName: 'Đại Họa Diệt Vong',
  borderColor: 'border-fuchsia-600/90',
  selectedBorderColor: 'border-fuchsia-400',
  bgGradient: 'from-[#26082c] via-[#17051b] to-[#0a020c]',
  badgeBg: 'bg-fuchsia-950/90 text-fuchsia-300 border border-fuchsia-500/80',
  titleColor: 'text-fuchsia-200',
  tagBg: 'bg-fuchsia-950/90 text-fuchsia-300 border-fuchsia-500/70',
  glowColor: 'shadow-[0_0_25px_rgba(217,70,239,0.35)]',
  ringColor: 'ring-fuchsia-400',
  accentHex: '#d946ef',
  categoryLabel: 'THẢM HỌA',
};

export const JINX_THEME: CardColorTheme = {
  colorName: 'Bùa Yểm Jinx Hề Ma',
  borderColor: 'border-purple-500/90',
  selectedBorderColor: 'border-purple-300',
  bgGradient: 'from-[#280d38] via-[#190924] to-[#0d0413]',
  badgeBg: 'bg-purple-950/90 text-purple-300 border border-purple-500/80',
  titleColor: 'text-purple-200',
  tagBg: 'bg-purple-950/90 text-purple-300 border-purple-500/70',
  glowColor: 'shadow-[0_0_25px_rgba(168,85,247,0.4)]',
  ringColor: 'ring-purple-400',
  accentHex: '#a855f7',
  categoryLabel: 'BÙA YỂM JINX',
};

export const DEUS_MACHINA_THEME: CardColorTheme = {
  colorName: 'Thần Cơ Deus Hex Machina',
  borderColor: 'border-amber-400',
  selectedBorderColor: 'border-yellow-200',
  bgGradient: 'from-[#38260b] via-[#211606] to-[#0f0a02]',
  badgeBg: 'bg-amber-950/90 text-amber-300 border border-amber-400',
  titleColor: 'text-amber-200',
  tagBg: 'bg-amber-950/90 text-amber-300 border-amber-500/70',
  glowColor: 'shadow-[0_0_30px_rgba(245,158,11,0.5)]',
  ringColor: 'ring-amber-300',
  accentHex: '#f59e0b',
  categoryLabel: 'THẦN CƠ CỔ ĐẠI',
};

// =========================================================================
// THÔNG TIN CHI TIẾT CÁC LỜI NGUYỀN & THUỐC GIẢI
// =========================================================================

export interface HexEffectInfo {
  hexType: HexType;
  emoji: string;
  tagShort: string;
  formalName: string;
  colorLabel: string;
  afflictedTitle: string;
  afflictedDesc: string;
  inflictedTitle: string;
  inflictedDesc: string;
  cureRequirement: string;
  counterStrategy: string;
}

export const HEX_EFFECT_INFO: Record<HexType, HexEffectInfo> = {
  hanahaki: {
    hexType: 'hanahaki',
    emoji: '🌹',
    tagShort: 'Phổi Nở Hoa',
    formalName: 'Hanahaki (Hoa Độc Thấu Tâm)',
    colorLabel: 'Hệ Đỏ',
    afflictedTitle: 'LỜI NGUYỀN: PHỔI NỞ HOA (HANAHAKI)',
    afflictedDesc:
      'Dây gai hoa hồng nở nghẹt buồng phổi khiến bạn ho ra cánh hoa tẩm máu. Cần Thuốc [ĐỎ] (Nước Mắt Phượng Hoàng) hoặc Thuốc Vạn Năng để khai thông hơi thở.',
    inflictedTitle: 'TÁC ĐỘNG KHI GIEO: NGHẸT THỞ BUỒNG PHỔI',
    inflictedDesc:
      'Trói buộc 1 ô bóng tối của đối thủ bằng mầm hoa độc đỏ thẫm. Ép đối thủ phải tìm đúng Nước Mắt Phượng Hoàng để giải, nếu không sẽ bị giam cầm vĩnh viễn.',
    cureRequirement: 'Nước Mắt Phượng Hoàng (Hệ Đỏ) hoặc Dầu Rắn Vạn Năng',
    counterStrategy: 'Sau khi giải phát sinh Di chứng dược liệu: Hóa Đá (Vàng) & Dịch Hạch (Cam) - mở điều kiện cho đối thủ gieo tiếp.',
  },
  polymelia: {
    hexType: 'polymelia',
    emoji: '🖐️',
    tagShort: 'Dị Tật Đa Chi',
    formalName: 'Polymelia (Quái Thai Mọc Tay)',
    colorLabel: 'Hệ Lục',
    afflictedTitle: 'LỜI NGUYỀN: DỊ TẬT ĐA CHI (MỌC NHIỀU TAY)',
    afflictedDesc:
      'Cơ thể dị biến mọc thêm nhiều cánh tay quái dị mất kiểm soát. Cần Thuốc [LỤC] (Bả Chó Sói) hoặc Thuốc Vạn Năng để kìm hãm đột biến gen.',
    inflictedTitle: 'TÁC ĐỘNG KHI GIEO: ĐỘT BIẾN ĐA CHI QUÁI THAI',
    inflictedDesc:
      'Gieo mầm bệnh biến đổi cơ thể lên đối thủ, khiến đối thủ mọc thêm 6 chi hỗn loạn và bị tước đoạt lợi thế dược liệu.',
    cureRequirement: 'Bả Chó Sói (Hệ Lục) hoặc Dầu Rắn Vạn Năng',
    counterStrategy: 'Sau khi giải phát sinh Di chứng dược liệu: Hanahaki (Đỏ) & Lệ Huyết (Tím) - mở điều kiện cho đối thủ gieo tiếp.',
  },
  whisper_war: {
    hexType: 'whisper_war',
    emoji: '👻',
    tagShort: 'Oán Linh Thầm Thì',
    formalName: 'Whisper War (Tiếng Thì Thầm Tà Thuật)',
    colorLabel: 'Hệ Lơ',
    afflictedTitle: 'LỜI NGUYỀN: OÁN LINH THẦM THÌ (WHISPER WAR)',
    afflictedDesc:
      'Những giọng nói âm ti ma quái xì xào bên tai làm đảo lộn tâm trí và cản trở việc bào chế dược phẩm. Cần Thuốc [LƠ] (Độc Dược Wiggenweld) để xua tan ác mộng.',
    inflictedTitle: 'TÁC ĐỘNG KHI GIEO: RỐI LOẠN TÂM TRÍ ÂM TI',
    inflictedDesc:
      'Ám ảnh tâm can đối thủ bằng tiếng thì thầm cõi chết, phá vỡ sự tập trung của nhà giả kim đối phương.',
    cureRequirement: 'Độc Dược Wiggenweld (Hệ Lơ) hoặc Dầu Rắn Vạn Năng',
    counterStrategy: 'Sau khi chữa phát sinh Di chứng dược liệu: Tử Khí (Chàm) & Da Cóc (Rêu) - mở điều kiện cho đối thủ gieo tiếp.',
  },
  toad_skin: {
    hexType: 'toad_skin',
    emoji: '🐸',
    tagShort: 'Da Cóc Ghẻ Lở',
    formalName: 'Toad Skin (Mụn Cóc Đầm Lầy)',
    colorLabel: 'Hệ Rêu',
    afflictedTitle: 'LỜI NGUYỀN: DA CÓC GHẺ LỞ (TOAD SKIN)',
    afflictedDesc:
      'Làn da phồng rộp mụn cóc độc tía tiết dịch nhầy nhụa, cản trở việc cầm nắm dụng cụ và bình thuốc. Cần Thuốc [RÊU] (Ngọc Bezoar) để thanh tẩy độc tố.',
    inflictedTitle: 'TÁC ĐỘNG KHI GIEO: MỤN CÓC ĐỘC TIẾT NHẦY',
    inflictedDesc:
      'Làm ô uế cơ thể đối thủ bằng độc dịch đầm lầy hôi thối, giam cầm ô bóng tối của họ.',
    cureRequirement: 'Ngọc Bezoar (Hệ Rêu) hoặc Dầu Rắn Vạn Năng',
    counterStrategy: 'Sau khi giải phát sinh Di chứng dược liệu: Oán Linh (Lơ) & Hóa Đá (Vàng) - mở điều kiện cho đối thủ gieo tiếp.',
  },
  stone_hands: {
    hexType: 'stone_hands',
    emoji: '🗿',
    tagShort: 'Hóa Đá Cốt Tủy',
    formalName: 'Petrificus (Bàn Tay Hóa Đá)',
    colorLabel: 'Hệ Vàng Đất',
    afflictedTitle: 'LỜI NGUYỀN: HÓA ĐÁ CỐT TỦY (PETRIFICUS)',
    afflictedDesc:
      'Khớp ngón tay và tứ chi đông cứng thành đá tảng nặng nề, vô phương cử động linh hoạt. Cần Thuốc [VÀNG ĐẤT] (Rễ Mandrake Khóc La) để giải phong ấn.',
    inflictedTitle: 'TÁC ĐỘNG KHI GIEO: BẤT ĐỘNG KHỚP CỐT TỦY',
    inflictedDesc:
      'Hóa thạch tứ chi của đối thủ thành tượng đá xám xịt, trói chặt ô bóng tối của họ.',
    cureRequirement: 'Rễ Mandrake Khóc La (Hệ Vàng Đất) hoặc Dầu Rắn Vạn Năng',
    counterStrategy: 'Sau khi giải phát sinh Di chứng dược liệu: Dịch Hạch (Cam) & Lệ Huyết (Tím) - mở điều kiện cho đối thủ gieo tiếp.',
  },
  bleeding_eyes: {
    hexType: 'bleeding_eyes',
    emoji: '👁️',
    tagShort: 'Lệ Huyết U Ám',
    formalName: 'Blood Tears (Huyết Nhãn Che Tầm Nhìn)',
    colorLabel: 'Hệ Tím',
    afflictedTitle: 'LỜI NGUYỀN: LỆ HUYẾT U ÁM (BLOOD TEARS)',
    afflictedDesc:
      'Mắt rỉ máu ràn rụa che mờ thị giác, làm nhòe mọi công thức và dược điển cổ xưa. Cần Thuốc [TÍM] (Tinh Chất Bạch Diệp) để khép miệng vết thương.',
    inflictedTitle: 'TÁC ĐỘNG KHI GIEO: HUYẾT NHÃN MÙ LÒA',
    inflictedDesc:
      'Bóp nghẹt tầm nhìn của đối thủ trong bể máu đỏ thẫm, giam cầm bóng tối của họ.',
    cureRequirement: 'Tinh Chất Bạch Diệp Dittany (Hệ Tím) hoặc Dầu Rắn Vạn Năng',
    counterStrategy: 'Sau khi giải phát sinh Di chứng dược liệu: Da Cóc (Rêu) & Tử Khí (Chàm) - mở điều kiện cho đối thủ gieo tiếp.',
  },
  rat_plague: {
    hexType: 'rat_plague',
    emoji: '🐀',
    tagShort: 'Chuột Rút Dịch Hạch',
    formalName: 'Black Death (Dịch Hạch Chuột Đen)',
    colorLabel: 'Hệ Cam',
    afflictedTitle: 'LỜI NGUYỀN: DỊCH HẠCH CHUỘT ĐEN (BLACK DEATH)',
    afflictedDesc:
      'Mầm mống dịch hạch hoại tử gặm nhấm sinh lực và tàn phá kho dự trữ dược liệu. Cần Thuốc [CAM] (Thuốc Cảm Tiêu Phù Pepperup) xì khói lỗ tai để trục xuất vi khuẩn.',
    inflictedTitle: 'TÁC ĐỘNG KHI GIEO: DỊCH HẠCH HOẠI TỬ BẦY CHUỘT',
    inflictedDesc:
      'Thả bầy chuột đen mang mầm tử thần gặm nhấm bóng tối của đối phương.',
    cureRequirement: 'Thuốc Cảm Tiêu Phù Pepperup (Hệ Cam) hoặc Dầu Rắn Vạn Năng',
    counterStrategy: 'Sau khi giải phát sinh Di chứng dược liệu: Tử Khí (Chàm) & Dị Tật Đa Chi (Lục) - mở điều kiện cho đối thủ gieo tiếp.',
  },
  rotting_breath: {
    hexType: 'rotting_breath',
    emoji: '💨',
    tagShort: 'Tử Khí Hầm Mộ',
    formalName: 'Mortal Miasma (Hơi Thở Mục Rữa)',
    colorLabel: 'Hệ Chàm',
    afflictedTitle: 'LỜI NGUYỀN: TỬ KHÍ HẦM MỘ (MORTAL MIASMA)',
    afflictedDesc:
      'Khí độc nồng nặc mùi tử thi bốc lên làm rệu rã lục phủ ngũ tạng và bình độc dược. Cần Thuốc [CHÀM] (Huyết Dược Bổ Túc) để tái tạo dòng máu trong sạch.',
    inflictedTitle: 'TÁC ĐỘNG KHI GIEO: TỬ KHÍ ĂN MÒN NẤM MỒ',
    inflictedDesc:
      'Phun luồng chướng khí hôi thối vào buồng bào chế của đối phương, phong tỏa bóng tối.',
    cureRequirement: 'Huyết Dược Bổ Túc (Hệ Chàm) hoặc Dầu Rắn Vạn Năng',
    counterStrategy: 'Sau khi giải phát sinh Di chứng dược liệu: Hanahaki (Đỏ) & Hóa Đá (Vàng) - mở điều kiện cho đối thủ gieo tiếp.',
  },
};

export interface CardEffectDetail {
  emoji: string;
  tag: string;
  afflictedInfo: string;
  inflictedInfo: string;
  cureInfo: string;
  sideEffectInfo: string[];
}

export function getCardEffectDetails(
  card: HexCard,
  context?: { isAfflicted?: boolean; slotTreated?: boolean }
): CardEffectDetail {
  if (card.category === 'HEX' && card.hexType) {
    const hex = HEX_EFFECT_INFO[card.hexType];
    return {
      emoji: hex.emoji,
      tag: hex.tagShort,
      afflictedInfo: hex.afflictedDesc,
      inflictedInfo: hex.inflictedDesc,
      cureInfo: hex.cureRequirement,
      sideEffectInfo: [hex.counterStrategy],
    };
  }

  if (card.category === 'REMEDY') {
    const curesTarget =
      card.curesHex === 'ANY'
        ? 'BẤT KỲ LỜI NGUYỀN NÀO (VẠN NĂNG)'
        : card.curesHex
        ? HEX_EFFECT_INFO[card.curesHex]?.tagShort || card.curesHex
        : 'Không rõ';

    const sideEffects = (card.sideEffects || []).map((eff) => {
      const h = HEX_EFFECT_INFO[eff];
      return h ? `[+${h.emoji} ${h.tagShort}]` : eff;
    });

    return {
      emoji: card.curesHex === 'ANY' ? '⭐' : '🧪',
      tag: card.curesHex === 'ANY' ? 'Thuốc Vạn Năng' : `Thuốc Trị ${curesTarget}`,
      afflictedInfo: `UỐNG VÀO: Hóa giải tức thì lời nguyền [${curesTarget}] trên ô bóng tối của bạn.`,
      inflictedInfo:
        card.curesHex === 'ANY'
          ? 'Cứu cánh vạn năng có thể giải cứu bạn khỏi bất kỳ lời nguyền nào trong lúc ngặt nghèo.'
          : `Đặc trị lời nguyền [${curesTarget}]. Không thể dùng để hại đối thủ trực tiếp.`,
      cureInfo: `Dùng để chữa ô lời nguyền ${curesTarget}.`,
      sideEffectInfo:
        sideEffects.length > 0
          ? [
              `⚠️ DI CHỨNG DƯỢC LIỆU NGUY HIỂM: Sau khi uống, cơ thể mang Di chứng ${sideEffects.join(
                ' '
              )} - đối thủ có thể dựa vào dấu vết này để gieo lời nguyền tiếp theo!`,
            ]
          : ['Không có tác dụng phụ.'],
    };
  }

  if (card.spellEffect === 'JINX_SILENCE') {
    return {
      emoji: '🎭',
      tag: 'Bùa Yểm Jinx',
      afflictedInfo:
        'KHI BỊ DÍNH: Vạc thuốc bị phong ấn! Bạn bị cấm tiệt dùng bất kỳ thẻ Thuốc Giải nào trong lượt tới.',
      inflictedInfo:
        'GÂY CHO ĐỐI THỦ: Khóa chặt vạc thuốc của 1 đối thủ, khiến họ không thể chữa bất kỳ lời nguyền nào trong lượt tới!',
      cureInfo: 'Hết lượt sẽ tự giải phóng phong ấn.',
      sideEffectInfo: ['Khiến đối thủ bị lỡ nhịp tiến độ chiến thắng.'],
    };
  }

  if (card.spellEffect === 'DEUS_HEX_MACHINA') {
    return {
      emoji: '⚙️',
      tag: 'Thần Cơ Cổ Đại',
      afflictedInfo:
        'KHI BỊ DÍNH: Lời nguyền bị ép thẳng vào ô bóng tối của bạn, xé tan mọi thuốc giải đang có!',
      inflictedInfo:
        'GÂY CHO ĐỐI THỦ: Cưỡng chế gieo lời nguyền trực tiếp vào bất kỳ ô bóng tối nào của đối thủ, bỏ qua mọi điều kiện tác dụng phụ!',
      cureInfo: 'Đối thủ phải tìm đúng thuốc giải mới để chữa lại từ đầu.',
      sideEffectInfo: ['Vũ khí lật kèo tối thượng của Đại Giả Kim.'],
    };
  }

  if (card.spellEffect === 'STEAL_CARD') {
    return {
      emoji: '🪄',
      tag: 'Tước Khí Dược Bào',
      afflictedInfo: 'KHI BỊ DÍNH: Bị đối phương cướp mất 1 lá bài quý giá trên tay.',
      inflictedInfo: 'GÂY CHO ĐỐI THỦ: Cướp ngẫu nhiên 1 lá bài trên tay đối thủ về kho đồ của bạn.',
      cureInfo: 'Không thể hóa giải.',
      sideEffectInfo: ['Làm giảm số lượng bài phòng thủ của đối thủ.'],
    };
  }

  if (card.spellEffect === 'SWAP_HEX') {
    return {
      emoji: '🔄',
      tag: 'Hoán Đổi Ký Ức',
      afflictedInfo: 'KHI BỊ DÍNH: Bị đối phương tráo đổi 1 ô bóng tối bất lợi sang cho bạn.',
      inflictedInfo: 'GÂY CHO ĐỐI THỦ: Đổi 1 ô bóng tối của bạn sang cho đối thủ.',
      cureInfo: 'Dùng thuốc giải bình thường sau khi bị tráo.',
      sideEffectInfo: ['Chuyển lời nguyền khó chữa sang đối phương.'],
    };
  }

  if (card.spellEffect === 'CORRUPT_SHADOW') {
    return {
      emoji: '💥',
      tag: 'Cắt Đứt Phong Ấn',
      afflictedInfo: 'KHI BỊ DÍNH: Thuốc giải trên ô của bạn bị phá hủy, lời nguyền tái phát!',
      inflictedInfo: 'GÂY CHO ĐỐI THỦ: Phá hủy 1 liều thuốc giải đã chữa của đối thủ, kéo lùi tiến độ của họ.',
      cureInfo: 'Phải dùng một liều thuốc giải khác để đắp lại.',
      sideEffectInfo: ['Phá vỡ thế dẫn trước của đối thủ gần chiến thắng.'],
    };
  }

  if (card.category === 'DISASTER') {
    return {
      emoji: '🌋',
      tag: 'Đại Họa Độc Dược',
      afflictedInfo: 'KHI BÙNG PHÁT: Toàn bộ nhà giả kim đều phải bỏ 1 lá bài ngẫu nhiên vào Mộ bài!',
      inflictedInfo: 'GÂY CHO TOÀN BÀN: Kích nổ vạc khói độc làm mọi đối thủ rơi rụng dược liệu trên tay.',
      cureInfo: 'Không thể né tránh.',
      sideEffectInfo: ['Đốt cháy hoàn toàn Dầu Rắn Vạn Năng nếu có.'],
    };
  }

  return {
    emoji: '✨',
    tag: 'Bùa Phép',
    afflictedInfo: 'Hiệu ứng huyền thuật cổ xưa.',
    inflictedInfo: card.description,
    cureInfo: 'Tùy loại bùa phép.',
    sideEffectInfo: [],
  };
}

// =========================================================================
// HIỆU ỨNG ĐANG DÍNH TRONG GAME (GAMEPLAY ACTIVE DEBUFFS & CONDITIONS)
// Tag hiệu ứng đang dính: Jinx, Disaster, Phạt bỏ bài, Cấm rút bài,...
// =========================================================================

export interface ActiveGameplayDebuff {
  id: string;
  name: string;
  shortTag: string;
  emoji: string;
  badgeStyle: string;
  gameplayRule: string; // Quy tắc cụ thể: Không thể dùng thuốc giải, bỏ hết bài, không thể rút bài...
  resolution: string;   // Cách giải trừ
  type: 'JINX' | 'DISASTER' | 'RESTRICTION' | 'CORRUPTION';
}

export function getPlayerActiveDebuffs(
  player: { isJinxed?: boolean; cannotDrawCards?: boolean; panicDiscarded?: boolean; shadow?: { treatedBy: any }[] },
  recentEvent?: {
    id: string;
    card: HexCard;
    actionType: string;
    targetNickname?: string;
    actorNickname?: string;
    timestamp: number;
  } | null,
  nickname?: string
): ActiveGameplayDebuff[] {
  const debuffs: ActiveGameplayDebuff[] = [];

  // 1. Hiệu ứng Bùa Yểm Jinx (Cấm dược)
  if (player.isJinxed) {
    debuffs.push({
      id: 'jinx_silence',
      name: 'BÙA YỂM JINX (CẤM DƯỢC)',
      shortTag: 'CẤM DÙNG THUỐC GIẢI',
      emoji: '🎭',
      badgeStyle: 'bg-purple-950 text-purple-300 border-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.6)] animate-pulse',
      gameplayRule: 'Phong ấn vạc thuốc! Không thể sử dụng bất kỳ thẻ Thuốc Giải (Remedy) nào trong lượt này.',
      resolution: 'Tự động giải phóng khi kết thúc lượt đi.',
      type: 'JINX',
    });
  }

  // 2. Hiệu ứng cấm rút bài trực tiếp
  if (player.cannotDrawCards) {
    debuffs.push({
      id: 'outbreak_no_draw',
      name: 'PHONG TỎA RÚT BÀI (OUTBREAK)',
      shortTag: 'KHÔNG THỂ RÚT BÀI',
      emoji: '☣️',
      badgeStyle: 'bg-amber-950 text-amber-300 border-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.6)] animate-pulse',
      gameplayRule: 'Dịch bệnh phong tỏa! Người chơi không thể rút thêm bài mới từ chồng bài chung.',
      resolution: 'Giải tỏa sau khi kết thúc lượt đi.',
      type: 'DISASTER',
    });
  }

  // 3. Hiệu ứng từ Thảm Họa (Disaster) hoặc Bùa chú vừa xảy ra gần đây (trong vòng 15 giây)
  if (recentEvent && Date.now() - recentEvent.timestamp < 15000) {
    if (recentEvent.actionType === 'DISASTER') {
      const disasterEff = recentEvent.card.disasterEffect;
      if (disasterEff === 'OUTBREAK') {
        debuffs.push({
          id: `disaster_outbreak_${recentEvent.id}`,
          name: 'DỊCH BỆNH BÙNG PHÁT (OUTBREAK)',
          shortTag: 'KHÔNG THỂ RÚT BÀI',
          emoji: '☣️',
          badgeStyle: 'bg-amber-950 text-amber-300 border-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.6)] animate-pulse',
          gameplayRule: 'Dịch bệnh bùng nổ! Bị phong tỏa hoàn toàn việc rút bài mới trong lượt tiếp theo.',
          resolution: 'Hồi phục sau khi kết thúc lượt.',
          type: 'DISASTER',
        });
      } else if (disasterEff === 'PANIC_DISCARD') {
        debuffs.push({
          id: `disaster_panic_${recentEvent.id}`,
          name: 'CƠN HOẢNG LOẠN ĐỘC TỐ (PANIC DISCARD)',
          shortTag: 'CHỈ GIỮ LẠI 1 LÁ BÀI',
          emoji: '⚠️',
          badgeStyle: 'bg-red-950 text-red-300 border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.6)] animate-pulse',
          gameplayRule: 'Khí độc hoảng loạn! Bị ép bỏ hết bài trên tay, chỉ được phép giữ lại đúng 1 lá duy nhất.',
          resolution: 'Đã thực thi ngay lập tức.',
          type: 'DISASTER',
        });
      } else {
        // Mặc định hoặc POISON_MIST
        debuffs.push({
          id: `disaster_${recentEvent.id}`,
          name: 'ĐẠI HỌA ĐỘC DƯỢC (POISON MIST)',
          shortTag: 'ÉP BỎ 1 LÁ BÀI',
          emoji: '🌋',
          badgeStyle: 'bg-rose-950 text-rose-300 border-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.6)] animate-pulse',
          gameplayRule: 'Khói độc nổ tung! Buộc mọi đối thủ phải bỏ 1 lá bài ngẫu nhiên trên tay vào Mộ bài.',
          resolution: 'Đã phát tác ngay lập tức.',
          type: 'DISASTER',
        });
      }
    } else if (
      recentEvent.targetNickname === nickname &&
      recentEvent.card.spellEffect === 'STEAL_CARD'
    ) {
      debuffs.push({
        id: `steal_${recentEvent.id}`,
        name: 'TƯỚC KHÍ DƯỢC BÀO (EXPELLIARMUS)',
        shortTag: 'BỊ CƯỚP 1 LÁ BÀI',
        emoji: '🪄',
        badgeStyle: 'bg-amber-950 text-amber-300 border-amber-500',
        gameplayRule: 'Bị đối thủ đột nhập kho dược, cướp mất 1 lá bài ngẫu nhiên trên tay.',
        resolution: 'Bài đã chuyển sang tay đối thủ.',
        type: 'RESTRICTION',
      });
    } else if (
      recentEvent.targetNickname === nickname &&
      recentEvent.card.spellEffect === 'CORRUPT_SHADOW'
    ) {
      debuffs.push({
        id: `corrupt_${recentEvent.id}`,
        name: 'CẮT ĐỨT PHONG ẤN (DIFFINDO)',
        shortTag: 'THUỐC GIẢI BỊ PHÁ HỦY',
        emoji: '💥',
        badgeStyle: 'bg-rose-950 text-rose-300 border-rose-500',
        gameplayRule: '1 liều thuốc giải đã bị đối thủ hủy bỏ, lời nguyền tại ô đó tái phát trở lại!',
        resolution: 'Phải dùng thuốc giải mới để chữa lại từ đầu.',
        type: 'CORRUPTION',
      });
    }
  }

  return debuffs;
}

/**
 * Lấy theme màu sắc cho bất kỳ lá bài nào:
 * - Nếu là HEX: lấy theme theo card.hexType
 * - Nếu là REMEDY:
 *    + Nếu curesHex === 'ANY': lấy theme VẠN NĂNG (Prismatic Gold)
 *    + Nếu curesHex === <hexType>: LẤY CHÍNH XÁC THEME CỦA LỜI NGUYỀN ĐÓ!
 * - Nếu là JINX: lấy JINX_THEME
 * - Nếu là DEUS HEX MACHINA: lấy DEUS_MACHINA_THEME
 * - Nếu là SPELL: lấy SPELL_THEME
 * - Nếu là DISASTER: lấy DISASTER_THEME
 */
export function getCardTheme(card: HexCard): CardColorTheme {
  if (card.category === 'HEX') {
    const hexType = card.hexType && HEX_THEMES[card.hexType] ? card.hexType : 'hanahaki';
    const baseTheme = HEX_THEMES[hexType];
    return {
      ...baseTheme,
      categoryLabel: `LỜI NGUYỀN [${baseTheme.colorName.split(' ')[0].toUpperCase()}]`,
    };
  }

  if (card.category === 'REMEDY') {
    if (card.curesHex === 'ANY') {
      return UNIVERSAL_REMEDY_THEME;
    }
    if (card.curesHex && HEX_THEMES[card.curesHex]) {
      const baseTheme = HEX_THEMES[card.curesHex];
      return {
        ...baseTheme,
        categoryLabel: `THUỐC GIẢI [${baseTheme.colorName.split(' ')[0].toUpperCase()}]`,
      };
    }
    return UNIVERSAL_REMEDY_THEME;
  }

  if (card.spellEffect === 'JINX_SILENCE') {
    return JINX_THEME;
  }

  if (card.spellEffect === 'DEUS_HEX_MACHINA') {
    return DEUS_MACHINA_THEME;
  }

  if (card.category === 'DISASTER') {
    return DISASTER_THEME;
  }

  return SPELL_THEME;
}

/**
 * Lấy theme theo HexType
 */
export function getHexTheme(hexType?: HexType): CardColorTheme {
  if (hexType && HEX_THEMES[hexType]) {
    return HEX_THEMES[hexType];
  }
  return HEX_THEMES.hanahaki;
}

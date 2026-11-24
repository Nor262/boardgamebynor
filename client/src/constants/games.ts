export interface GameDisplayInfo {
  id: string;
  name: string;
  tagline: string;
  description: string;
  image: string;
  minPlayers: number;
  maxPlayers: number;
  estimatedMinutes: number;
  status: 'ready' | 'beta' | 'coming_soon';
  tags: string[];
  features: string[];
}

export const GAME_CATALOG: Record<string, GameDisplayInfo> = {
  jaipur: {
    id: 'jaipur',
    name: 'Jaipur (Đấu Giao Thương)',
    tagline: 'Chiến thuật quản trị hàng hóa & đàn lạc đà sa mạc',
    description: 'Hóa thân thành hai thương nhân giàu có nhất thành phố Jaipur. Khai thác hàng hóa quý giá, dẫn dắt đàn lạc đà và giành lấy 2 Huy hiệu xuất sắc từ đức vua.',
    image: '/assets/games/jaipur.jpg',
    minPlayers: 2,
    maxPlayers: 2,
    estimatedMinutes: 15,
    status: 'ready',
    tags: ['2 Người', 'Thẻ bài', 'Chiến thuật kinh tế', 'Huy hiệu hoàng gia'],
    features: [
      'Hàng hóa quý: Kim Cương, Vàng, Bạc, Tơ Lụa, Gia Vị, Da Thuộc',
      'Đàn lạc đà sa mạc: Đổi hàng linh hoạt, thưởng +5 điểm cuối hiệp',
      'Chồng xu điểm giảm dần: Bán sớm được giá cao hơn đối thủ',
      'Hiệu ứng âm thanh và thẻ bài hoàng gia sống động',
    ],
  },
  'test-race': {
    id: 'test-race',
    name: 'Đua Thú Xúc Xắc (Race & Dice)',
    tagline: 'Đua thú cuồng nhiệt & đổ xúc xắc tốc độ',
    description: 'Cuộc đua vui nhộn hỗ trợ tới 6 người chơi. Đổ xúc xắc bứt tốc trên 20 ô bản đồ, né bẫy hiểm hóc và sử dụng các thẻ bài kỹ năng bí mật để cán đích đầu tiên.',
    image: '/assets/games/test-race.jpg',
    minPlayers: 2,
    maxPlayers: 6,
    estimatedMinutes: 10,
    status: 'ready',
    tags: ['2 - 6 Người', 'Xúc xắc', 'Đua vui nhộn', 'Thẻ bài bí mật'],
    features: [
      'Đường đua 20 ô nhiều hiệu ứng tăng tốc và bẫy cản đường',
      'Đổ xúc xắc kiểm tra may mắn và chiến thuật bứt tốc',
      'Bộ thẻ bài kỹ năng: Tăng tốc, chặn đối thủ, hoán đổi vị trí',
      'Phù hợp cho nhóm bạn đông người chơi từ 2 đến 6 người',
    ],
  },
  'lop-hoc-mat-ngu': {
    id: 'lop-hoc-mat-ngu',
    name: 'Lớp Học Mật Ngữ (Cuộc Đua Sao Chổi)',
    tagline: 'Cuộc đua sao chổi kỳ thú của 12 chòm sao hoàng đạo',
    description: 'Chuyển thể từ bộ truyện board game nổi tiếng. Hóa thân vào các nhân vật 12 cung hoàng đạo, vận dụng thẻ trang bị và năng lực đặc biệt để giải cứu thiên hà.',
    image: '/assets/games/lop-hoc-mat-ngu.jpg',
    minPlayers: 2,
    maxPlayers: 6,
    estimatedMinutes: 30,
    status: 'coming_soon',
    tags: ['2 - 6 Người', 'Bản đồ thiên hà', '12 Cung hoàng đạo', 'Sắp ra mắt'],
    features: [
      'Hệ thống nhân vật phong phú dựa trên 12 chòm sao hoàng đạo',
      'Bản đồ sao chổi vũ trụ với nhiều sự kiện bất ngờ',
      'Thẻ trang bị và bảo bối hỗ trợ lật ngược thế cờ',
      'Đang được số hóa và chuẩn bị ra mắt trong giai đoạn tới',
    ],
  },
  'hex-effect': {
    id: 'hex-effect',
    name: 'Hex Effects (Lời Nguyền & Thuốc Giải)',
    tagline: 'Đấu trí giả kim, trừ khử lời nguyền & gieo rắc tác dụng phụ',
    description: 'Game thẻ bài "Take that" đình đám từ Pillbox Games. Vào vai các nhà giả kim thời Trung Cổ dại dột tự chuốc lấy lời nguyền. Người đầu tiên chữa khỏi 4 Lời Nguyền (Hexes) trong vùng Bóng Tối bằng các lá Thuốc Giải (Remedies) sẽ chiến thắng, nhưng cẩn thận: mỗi liều thuốc đều để lại Tác Dụng Phụ cho đối thủ lợi dụng!',
    image: '/assets/games/hex-effect.jpg',
    minPlayers: 2,
    maxPlayers: 8,
    estimatedMinutes: 20,
    status: 'ready',
    tags: ['2 - 8 Người', 'Thẻ bài', 'Giả kim thuật', 'Take-that', 'Pillbox Games'],
    features: [
      'Vùng Bóng Tối (Shadow): Khởi đầu với 4 lá bài Lời Nguyền (Hex)',
      'Thuốc Giải (Remedy): Trừ khử lời nguyền nhưng chịu "Tác dụng phụ"',
      'Lối chơi hãm hại đối kháng (Take That) kịch tính và hài hước',
      'Minh họa phong cách bác sĩ dịch bệnh & giả kim thuật thời Trung Cổ',
    ],
  },
};

export function getGameDisplayInfo(gameId: string, serverData?: any): GameDisplayInfo {
  const fallback = GAME_CATALOG[gameId] || {
    id: gameId,
    name: serverData?.name || gameId.toUpperCase(),
    tagline: serverData?.tagline || 'Trò chơi đối kháng trực tuyến',
    description: serverData?.description || 'Trò chơi bàn cờ hấp dẫn trên Board Game Hub.',
    image: serverData?.image || `/assets/games/${gameId}.jpg`,
    minPlayers: serverData?.minPlayers || 2,
    maxPlayers: serverData?.maxPlayers || 6,
    estimatedMinutes: serverData?.estimatedMinutes || 15,
    status: (serverData?.status as any) || 'ready',
    tags: serverData?.tags || ['Board game', 'Đối kháng'],
    features: ['Chơi trực tiếp trên trình duyệt', 'Đồng bộ thời gian thực'],
  };

  return {
    ...fallback,
    name: serverData?.name || fallback.name,
    description: serverData?.description || fallback.description,
    tagline: serverData?.tagline || fallback.tagline,
    minPlayers: serverData?.minPlayers || fallback.minPlayers,
    maxPlayers: serverData?.maxPlayers || fallback.maxPlayers,
    estimatedMinutes: serverData?.estimatedMinutes || fallback.estimatedMinutes,
    status: serverData?.status || fallback.status,
    tags: serverData?.tags || fallback.tags,
    image: serverData?.image || fallback.image,
  };
}

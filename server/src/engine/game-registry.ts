import { BoardGamePlugin, GameMetadata } from '@boardgame/shared';
import { TestRaceGamePlugin } from '../games/test-race/logic';
import { JaipurGamePlugin } from '../games/jaipur/logic';
import { HexEffectsGamePlugin } from '../games/hex-effects/logic';

export class GameRegistry {
  private plugins = new Map<string, BoardGamePlugin>();
  private allGameMetadatas: GameMetadata[] = [];

  constructor() {
    // 1. Đăng ký các game có thể chơi ngay
    this.registerPlugin(JaipurGamePlugin);
    this.registerPlugin(HexEffectsGamePlugin);
    this.registerPlugin(TestRaceGamePlugin);

    // 2. Danh sách metadata hiển thị trên Sảnh chờ
    this.allGameMetadatas = [
      JaipurGamePlugin.metadata,
      HexEffectsGamePlugin.metadata,
      TestRaceGamePlugin.metadata,
      {
        id: 'lop-hoc-mat-ngu',
        name: 'Lớp Học Mật Ngữ (Cuộc Đua Sao Chổi)',
        description: 'Game bản đồ đổ xúc xắc 12 cung hoàng đạo. Sử dụng thẻ trang bị, năng lực sao chổi và thu thập bảo vật thiên hà.',
        tagline: 'Cuộc đua sao chổi kỳ thú của 12 chòm sao hoàng đạo',
        image: '/assets/games/lop-hoc-mat-ngu.jpg',
        status: 'coming_soon',
        minPlayers: 2,
        maxPlayers: 6,
        estimatedMinutes: 30,
        icon: 'Sparkles',
        tags: ['2 - 6 Người', 'Bản đồ thiên hà', '12 Cung hoàng đạo', 'Sắp ra mắt'],
      },
    ];
  }

  registerPlugin(plugin: BoardGamePlugin) {
    this.plugins.set(plugin.metadata.id, plugin);
  }

  getPlugin(id: string): BoardGamePlugin | undefined {
    return this.plugins.get(id);
  }

  getAllMetadatas(): GameMetadata[] {
    return this.allGameMetadatas;
  }

  getMetadata(id: string): GameMetadata | undefined {
    return this.allGameMetadatas.find(m => m.id === id);
  }
}

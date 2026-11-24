# Tài Liệu Thiết Kế Kỹ Thuật: Nền Tảng Board Game Trực Tuyến (Board Game Hub)

## 1. Tổng Quan & Bối Cảnh (Understanding Summary)
* **Sản phẩm:** Nền tảng Web Board Game trực tuyến nhiều người chơi (Online Multiplayer Board Game Hub).
* **Mục tiêu:** Tạo không gian chơi game mượt mà, tiện lợi cho nhóm bạn bè, dễ dàng tạo phòng và chia sẻ link chơi ngay trên trình duyệt máy tính hoặc điện thoại mà không cần cài đặt.
* **Kiến trúc cốt lõi:** Hệ thống Sảnh chờ trung tâm (Lobby & Room Manager) kết hợp cơ chế Game Plug-in (Pluggable Game Engine), cho phép tích hợp các trò chơi khác nhau (Jaipur, Lớp học mật ngữ, Hex Effect,...) mà không cần thay đổi kiến trúc phòng.
* **Người dùng mục tiêu:** Nhóm bạn bè thân thiết, người chơi phổ thông (casual gamers).

---

## 2. Giả Định & Ràng Buộc (Assumptions & Constraints)
1. **Trải nghiệm vào phòng nhanh (Frictionless Entry):**
   * Mặc định hỗ trợ chế độ **Khách (Guest)**: Chỉ cần nhập Nickname là tạo/vào phòng chơi ngay.
   * Tùy chọn **Tài khoản (Account)**: Hỗ trợ đăng nhập cho người muốn lưu hồ sơ, lịch sử thi đấu.
2. **Quy mô & Tài nguyên:**
   * Phục vụ các phòng chơi riêng tư (Private Rooms) từ 2 - 8 người/phòng.
   * Toàn bộ trạng thái ván đấu đang diễn ra được lưu trữ **100% trên bộ nhớ RAM (In-Memory)** của Node.js server để phản hồi tức thì (<10ms).
   * Lưu trữ lâu dài (Tài khoản, lịch sử ván đấu) sử dụng **SQLite (môi trường Local) / PostgreSQL qua Prisma**.
3. **Cơ chế giữ phiên (Session & Reconnect):**
   * Client lưu `sessionToken` tại `localStorage`.
   * Khi mất mạng hoặc F5, client tự động gửi lại token để server khôi phục vị trí ghế và trạng thái bàn cờ.
4. **Giao tiếp:**
   * Tích hợp Text Chat, bảng Sticker biểu cảm nhanh và Game Activity Log.
   * Không tích hợp WebRTC voice call nội bộ nhằm tối ưu hiệu năng và đường truyền (người chơi sử dụng Discord/Zalo ngoài).

---

## 3. Nhật Ký Quyết Định (Decision Log)

| Thời điểm | Vấn đề | Quyết định đã chọn | Các phương án thay thế đã xét | Lý do chọn |
| :--- | :--- | :--- | :--- | :--- |
| Khởi tạo | Nền tảng đích | **Web App Responsive trước, đóng gói Mobile App sau** | Native Mobile App ngay từ đầu | Dễ tiếp cận nhất, chỉ cần click link là chơi ngay trên cả PC và Mobile, không rào cản cài đặt |
| Phạm vi ban đầu | Khởi đầu dự án | **Khung Sảnh chờ (Lobby & Room) đa năng trước** | Code thẳng 1 game cụ thể | Tạo nền tảng mở rộng, hỗ trợ cắm nhiều game khác nhau (Jaipur, Lớp học mật ngữ) |
| Tài khoản | Cơ chế đăng nhập | **Kết hợp: Guest (Nickname) + Tùy chọn Account** | Bắt buộc tạo tài khoản / Hoàn toàn vô danh | Tối ưu trải nghiệm cho bạn bè vào chơi ngay, nhưng vẫn mở đường cho tính năng hồ sơ cá nhân |
| Kiến trúc | Hệ thống Realtime | **Server-Authoritative với Socket.io + Next.js** | Framework `boardgame.io`, Serverless Supabase Realtime | Làm chủ 100% giao diện, tùy biến sảnh chờ dễ dàng, chống hack/nhìn trộm bài bằng bộ lọc Server |
| Database | Lưu trữ dữ liệu | **In-Memory cho trận đấu; SQLite/PostgreSQL qua Prisma cho tài khoản** | MongoDB thuần (MERN), Firebase Firestore | Đạt hiệu năng tối đa cho game realtime, Prisma type-safe dễ quản trị, chuyển đổi linh hoạt |
| Giao tiếp | Tương tác trong phòng | **Text Chat + Sticker cảm xúc + Game Log** | Tích hợp Voice Call WebRTC | Tiết kiệm băng thông server, tận dụng Discord/Zalo bên ngoài mà nhóm bạn thường dùng |
| Quản lý phòng | Số lượng người chơi | **Chủ phòng tùy chỉnh số người chơi theo giới hạn của từng game** | Cố định cứng theo game / Không giới hạn | Chủ phòng chủ động khóa phòng theo số lượng bạn bè có mặt; người đến sau chuyển sang Spectator |

---

## 4. Kiến Trúc Hệ Thống & Cấu Trúc Thư Mục

```text
boardgame/
├── shared/                       # Thư viện dùng chung giữa Client & Server (TypeScript)
│   ├── types/
│   │   ├── room.ts               # Interface RoomState, Player, ChatMessage
│   │   ├── game-plugin.ts        # Interface chuẩn cho mọi trò chơi
│   │   └── socket-events.ts      # Danh sách tên các sự kiện Socket.io
│   └── index.ts
├── server/                       # Backend Realtime Server (Node.js + Socket.io)
│   ├── src/
│   │   ├── lobby/
│   │   │   ├── room-manager.ts   # Quản lý danh sách phòng, tạo mã phòng, timeout
│   │   │   └── session-manager.ts# Quản lý sessionToken & kết nối lại khi rớt mạng
│   │   ├── engine/
│   │   │   └── game-runner.ts    # Bộ điều phối nạp plugin và chuyển tiếp nước đi
│   │   ├── games/                # Module các trò chơi độc lập
│   │   │   └── jaipur/           # Ví dụ game mẫu đầu tiên
│   │   │       ├── logic.ts      # State machine, chia bài, tính điểm
│   │   │       └── types.ts      # State & Action riêng của Jaipur
│   │   └── index.ts              # Khởi tạo Socket.io server & HTTP endpoint
│   └── package.json
├── client/                       # Frontend Web (Next.js 14/15 App Router + Tailwind CSS)
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx          # Trang chủ (Nhập nickname, tạo/vào phòng)
│   │   │   └── room/[code]/      # Trang sảnh chờ & bàn cờ của phòng
│   │   ├── components/
│   │   │   ├── lobby/            # Slot người chơi, nút Ready, chọn Game, link mời
│   │   │   ├── chat/             # Khung chat văn bản, khay sticker cảm xúc
│   │   │   └── common/           # Modal, Button, Avatar, Ping indicator
│   │   ├── games/                # Giao diện hiển thị riêng của từng trò chơi
│   │   │   └── jaipur/           # Giao diện bàn cờ Jaipur (chợ, tay bài, lạc đà)
│   │   └── stores/
│   │       ├── socket-store.ts   # Quản lý kết nối Socket.io
│   │       └── room-store.ts     # Zustand store lưu state phòng & game realtime
│   └── package.json
└── DESIGN.md                     # Tài liệu thiết kế này
```

---

## 5. Quy Chuẩn Kỹ Thuật (Technical Specifications)

### 5.1. Mô Hình Phòng (`RoomState`)
```typescript
export interface Player {
  id: string;               // Socket ID hoặc Player UUID
  nickname: string;         // Tên hiển thị
  isHost: boolean;          // Quyền chủ phòng
  isReady: boolean;         // Đã sẵn sàng bắt đầu chưa
  avatarSeed: string;       // Avatar sinh tự động hoặc chọn
  connected: boolean;       // Trạng thái kết nối (xử lý khi rớt mạng)
  role: 'PLAYER' | 'SPECTATOR'; // Người chơi trực tiếp hoặc khán giả theo dõi
}

export interface RoomState {
  code: string;             // Mã phòng (vd: "BG-9182")
  hostId: string;           // ID của chủ phòng
  status: 'LOBBY' | 'IN_GAME' | 'FINISHED';
  selectedGameId: string;   // ID của game đang được chọn (vd: 'jaipur')
  maxPlayers: number;       // Số người chơi tối đa do Chủ phòng thiết lập (nằm trong khoảng [minPlayers, maxPlayers] của game)
  players: Player[];        // Danh sách người chơi tham gia bàn cờ (tối đa maxPlayers)
  spectators: Player[];     // Danh sách khán giả theo dõi trận đấu (nếu phòng đầy)
  chat: ChatMessage[];      // Lịch sử chat trong phòng
  gameData?: any;           // Dữ liệu bàn cờ (được lọc qua getPlayerView)
}
```

#### Quyền Hạn Của Chủ Phòng (Host Controls):
1. **Thiết lập sức chứa bàn chơi:**
   * Khi đổi game, hệ thống đặt mặc định `maxPlayers` theo giới hạn của game đó (ví dụ: Jaipur cố định 2 người; Lớp học mật ngữ cho phép chỉnh từ 2 đến 6 người).
   * Chủ phòng có quyền tùy chỉnh giảm `maxPlayers` (ví dụ: chỉ muốn phòng 4 người dù game hỗ trợ tới 6 người).
2. **Quản lý thành viên:**
   * Quyền kích (Kick) người chơi không mong muốn ra khỏi phòng.
   * Quyền chuyển người chơi thừa xuống hàng ghế **Khán giả (Spectator)** nếu phòng đã đủ số người tham gia.
3. **Quyết định bắt đầu ván đấu:**
   * Chỉ có thể bấm "Bắt đầu" khi số người tham gia đạt `>= game.minPlayers`, `<= room.maxPlayers` và tất cả người chơi đều đã bấm "Sẵn sàng (Ready)".

### 5.2. Chuẩn Giao Tiếp Cắm Rút Game (`BoardGamePlugin`)
```typescript
export interface BoardGamePlugin<TState, TAction> {
  id: string;
  name: string;
  minPlayers: number;
  maxPlayers: number;

  initGame(players: Player[]): TState;
  validateAction(state: TState, playerId: string, action: TAction): boolean;
  applyAction(state: TState, playerId: string, action: TAction): {
    nextState: TState;
    gameLog: string;
  };
  getPlayerView(state: TState, playerId: string): any; // Giấu bài úp / bí mật
  checkGameOver(state: TState): { isOver: boolean; winners?: string[] };
}
```

### 5.3. Bảo Mật & Chống Gian Lận (Anti-Cheat & Secret State)
* Client **chỉ nhận được dữ liệu được lọc** qua `getPlayerView`.
* Ví dụ trong Jaipur: Người chơi A chỉ nhận được bài của chính mình, các lá bài của đối thủ B được server gửi về dạng `{ count: 5 }` (số lượng bài) chứ không gửi loại hàng hóa. Việc soi `DevTools (F12)` trên trình duyệt sẽ không thể thấy trước bài đối thủ hay bài úp trong kho.

---

## 6. Lộ Trình Triển Khai (Implementation Roadmap)

* **Giai đoạn 1: Khung Sảnh Chờ Hoàn Chỉnh (Lobby & Room System)**
  * Thiết lập Monorepo với `shared`, `server` (Socket.io), `client` (Next.js + Tailwind).
  * Trang Chủ: Nhập Nickname, bấm Tạo phòng (sinh mã 6 số) hoặc Nhập mã vào phòng.
  * Trang Phòng chờ: Hiển thị danh sách người chơi, nút Sao chép link mời, đổi Game, trạng thái Ready, khung Chat realtime + Sticker.
  * Game mẫu tối giản (Mini-game hoặc Jaipur cơ bản) để kiểm tra luồng chuyển từ Sảnh chờ sang Chơi và Kết thúc ván.
* **Giai đoạn 2: Tích hợp Trò chơi Đầu Tiên (Jaipur)**
  * Viết đầy đủ luật Jaipur (bốc bài, đổi hàng hóa, đàn lạc đà, bán hàng lấy xu điểm, 3 hiệp đấu).
  * Giao diện bàn cờ trực quan với hiệu ứng bài mượt mà.
* **Giai đoạn 3: Mở rộng các Board Game tiếp theo**
  * Tích hợp Lớp học mật ngữ (Bản đồ xúc xắc, thẻ bổ trợ, 4-6 người chơi).
  * Tích hợp Hex Effect (Chiến thuật bàn cờ lục giác).
* **Giai đoạn 4: Tính năng nâng cao**
  * Đăng ký/Đăng nhập lưu hồ sơ cá nhân và bảng xếp hạng thành tích nhóm bạn.
  * Đóng gói Progressive Web App (PWA) để cài như ứng dụng trên điện thoại.

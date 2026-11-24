'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRoomStore } from '@/stores/room-store';
import {
  Dices,
  ArrowRight,
  ShieldCheck,
  Users,
  Shuffle,
  Gem,
  Layers,
  Coins,
  Volume2,
  Cpu,
  LayoutGrid,
  Check,
} from 'lucide-react';
import { GameSelectMenuModal } from '@/components/game/GameSelectMenuModal';
import { getGameDisplayInfo, GAME_CATALOG } from '@/constants/games';

const RANDOM_NAMES = [
  'Thợ Săn Kho Báu', 'Thương Nhân Jaipur', 'Nhà Thám Hiểm', 'Thuyền Trưởng',
  'Nhà Chiến Thuật', 'Kỳ Thủ Tài Ba', 'Thương Gia Tinh Ranh', 'Chiến Binh Sa Mạc'
];

export default function HomePage() {
  const router = useRouter();
  const { initSocket, createRoom, joinRoom, room, error, setError, availableGames } = useRoomStore();

  const [nickname, setNickname] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [selectedGameId, setSelectedGameId] = useState('jaipur');
  const [isGameMenuOpen, setIsGameMenuOpen] = useState(false);

  // Tổng hợp danh sách game hiển thị
  const allGameIds = Array.from(
    new Set([
      ...availableGames.map((g) => g.id),
      ...Object.keys(GAME_CATALOG),
    ])
  );

  const displayGames = allGameIds.map((id) => {
    const serverMeta = availableGames.find((g) => g.id === id);
    return getGameDisplayInfo(id, serverMeta);
  });

  const activeGameInfo = getGameDisplayInfo(
    selectedGameId,
    availableGames.find((g) => g.id === selectedGameId)
  );

  useEffect(() => {
    initSocket();
    setError(null);
    const randomDefault = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];
    const savedName = localStorage.getItem('bg_nickname') || randomDefault;
    setNickname(savedName);
  }, [initSocket, setError]);

  useEffect(() => {
    if (room?.code) {
      router.push(`/room/${room.code}`);
    }
  }, [room?.code, router]);

  const handleRandomizeName = () => {
    const random = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];
    setNickname(random);
    localStorage.setItem('bg_nickname', random);
  };

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) {
      setError('Vui lòng nhập tên hiển thị của bạn!');
      return;
    }
    localStorage.setItem('bg_nickname', nickname.trim());
    const seed = 'seed_' + Math.random().toString(36).substring(2, 9);
    createRoom(nickname.trim(), seed, selectedGameId);
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) {
      setError('Vui lòng nhập tên hiển thị của bạn!');
      return;
    }
    if (!roomCode.trim()) {
      setError('Vui lòng nhập mã phòng!');
      return;
    }
    localStorage.setItem('bg_nickname', nickname.trim());
    const seed = 'seed_' + Math.random().toString(36).substring(2, 9);
    joinRoom(roomCode.trim(), nickname.trim(), seed);
  };

  return (
    <div className="flex-1 flex flex-col px-4 sm:px-8 py-8 sm:py-12 max-w-7xl mx-auto w-full">
      {/* Category Label */}
      <div className="flex items-center gap-3 mb-6">
        <span className="w-3 h-3 bg-[#FF3000] inline-block"></span>
        <span className="font-mono font-black text-xs uppercase tracking-widest text-black">
          NỀN TẢNG BOARD GAME TRỰC TUYẾN
        </span>
      </div>

      {/* Massive Responsive Typography Hero */}
      <div className="border-b-4 border-black pb-8 sm:pb-12 mb-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-8">
            <h1 className="text-6xl sm:text-8xl md:text-9xl font-black uppercase tracking-tighter leading-[0.88] text-black">
              BOARD GAME<br />
              <span className="text-[#FF3000]">HUB</span>.ONLINE
            </h1>
          </div>
          <div className="lg:col-span-4 border-l-0 lg:border-l-4 border-black pl-0 lg:pl-6 flex flex-col gap-3 font-mono text-xs uppercase leading-relaxed text-neutral-800">
            <p className="font-bold text-black text-sm">
              MỞ TRÌNH DUYỆT LÀ CHƠI CÙNG NHAU
            </p>
            <p>
              Tạo phòng trong 1 giây, gửi link cho nhóm bạn và chơi ngay trên cả điện thoại, máy tính bảng và máy tính mà không cần cài đặt ứng dụng.
            </p>
          </div>
        </div>
      </div>

      {/* Error Message Alert */}
      {error && (
        <div className="mb-8 p-4 border-2 border-black bg-[#FF3000] text-white font-mono text-xs font-black uppercase tracking-wider flex items-center justify-between">
          <span>THÔNG BÁO: {error}</span>
          <button
            onClick={() => setError(null)}
            className="border border-white px-2 py-0.5 hover:bg-white hover:text-black transition-colors"
          >
            ĐÓNG
          </button>
        </div>
      )}

      {/* Main Asymmetric Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
        {/* Left Column: Form Card */}
        <div className="lg:col-span-7 border-4 border-black bg-white p-6 sm:p-8 flex flex-col gap-6">
          <div className="flex items-center justify-between border-b-2 border-black pb-3">
            <span className="font-mono font-black text-sm uppercase tracking-wider text-black">
              TẠO BÀN CHƠI MỚI
            </span>
            <span className="text-[10px] font-mono font-bold bg-black text-white px-2 py-0.5 uppercase">
              MIỄN PHÍ
            </span>
          </div>

          {/* Nickname Input */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-black uppercase tracking-wider text-black">
                TÊN HIỂN THỊ CỦA BẠN
              </label>
              <button
                type="button"
                onClick={handleRandomizeName}
                className="font-mono text-xs uppercase font-bold text-neutral-600 hover:text-[#FF3000] flex items-center gap-1.5 transition-colors"
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span>ĐỔI TÊN NGẪU NHIÊN</span>
              </button>
            </div>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Nhập tên của bạn..."
              maxLength={25}
              className="w-full bg-[#F2F2F2] border-2 border-black rounded-none px-4 py-3 font-mono font-black text-sm uppercase text-black placeholder-neutral-400 focus:outline-none focus:border-[#FF3000] transition-colors"
            />
          </div>

          {/* Chọn Game Bằng Menu / Thẻ Có Hình Ảnh */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-black uppercase tracking-wider text-black flex items-center gap-1.5">
                <LayoutGrid className="w-3.5 h-3.5 text-[#FF3000]" />
                <span>CHỌN TRÒ CHƠI TẠO PHÒNG</span>
              </label>
              <button
                type="button"
                onClick={() => setIsGameMenuOpen(true)}
                className="font-mono text-xs font-black uppercase text-[#FF3000] hover:text-black flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>MỞ MENU TẤT CẢ GAME</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Interactive Game Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {displayGames.map((game) => {
                const isSelected = selectedGameId === game.id;
                const isReady = game.status === 'ready';

                return (
                  <div
                    key={game.id}
                    onClick={() => {
                      if (isReady) {
                        setSelectedGameId(game.id);
                      } else {
                        setIsGameMenuOpen(true);
                      }
                    }}
                    className={`border-2 p-2.5 flex items-center gap-3 transition-all cursor-pointer select-none ${
                      isSelected
                        ? 'border-[#FF3000] bg-orange-50 shadow-[2px_2px_0px_0px_#FF3000]'
                        : 'border-black bg-[#F8F8F8] hover:bg-white hover:border-black'
                    }`}
                  >
                    {/* Game Cover Art */}
                    <div className="w-14 h-18 aspect-[3/4] border border-black bg-black flex-shrink-0 overflow-hidden relative">
                      <img
                        src={game.image}
                        alt={game.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/assets/games/jaipur.jpg';
                        }}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-mono font-black text-xs uppercase tracking-tight text-black truncate">
                          {game.name}
                        </span>
                        {isSelected && (
                          <div className="w-4 h-4 bg-[#FF3000] flex items-center justify-center flex-shrink-0">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>

                      <div className="font-mono text-[10px] text-neutral-600 mt-1 flex items-center gap-1.5 flex-wrap">
                        <span className="bg-white border border-neutral-300 px-1.5 py-0.5">
                          {game.minPlayers === game.maxPlayers
                            ? `${game.minPlayers} NGƯỜI`
                            : `${game.minPlayers}-${game.maxPlayers} NGƯỜI`}
                        </span>
                        <span
                          className={`font-black ${
                            isReady ? 'text-[#FF3000]' : 'text-neutral-500'
                          }`}
                        >
                          {isReady ? 'SẴN SÀNG' : 'SẮP RA MẮT'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Button: Tạo Phòng */}
          <button
            onClick={handleCreateRoom}
            className="w-full h-16 bg-black hover:bg-[#FF3000] text-white font-mono font-black text-sm uppercase tracking-widest border-2 border-black rounded-none transition-colors duration-150 flex items-center justify-center gap-3 cursor-pointer mt-2"
          >
            <Dices className="w-5 h-5 text-white" />
            <span>TẠO PHÒNG: {activeGameInfo.name.toUpperCase()}</span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 my-2">
            <div className="h-0.5 bg-black flex-1"></div>
            <span className="font-mono text-xs font-black uppercase tracking-widest text-black">
              HOẶC
            </span>
            <div className="h-0.5 bg-black flex-1"></div>
          </div>

          {/* Form: Vào Phòng Có Sẵn */}
          <form onSubmit={handleJoinRoom} className="flex flex-col gap-3">
            <label className="text-xs font-mono font-black uppercase tracking-wider text-black">
              GIA NHẬP BẰNG MÃ PHÒNG
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="VD: BG-8291"
                maxLength={10}
                className="flex-1 bg-[#F2F2F2] border-2 border-black rounded-none px-4 py-3 font-mono font-black text-sm uppercase tracking-widest text-black placeholder-neutral-400 focus:outline-none focus:border-[#FF3000]"
              />
              <button
                type="submit"
                className="px-8 h-12 bg-black hover:bg-[#FF3000] text-white font-mono font-black text-xs uppercase tracking-widest border-2 border-black rounded-none transition-colors duration-150 flex items-center gap-2 cursor-pointer"
              >
                <span>VÀO PHÒNG</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Featured Spotlight Card for Currently Selected Game */}
        <div className="lg:col-span-5 border-4 border-black bg-white p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between border-b-2 border-black pb-3">
            <span className="font-mono font-black text-xs uppercase tracking-widest text-[#FF3000]">
              TRÒ CHƠI ĐANG CHỌN
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-black text-[11px] bg-black text-white px-2 py-0.5 uppercase">
                {activeGameInfo.minPlayers === activeGameInfo.maxPlayers
                  ? `${activeGameInfo.minPlayers} NGƯỜI CHƠI`
                  : `${activeGameInfo.minPlayers} - ${activeGameInfo.maxPlayers} NGƯỜI`}
              </span>
              <button
                type="button"
                onClick={() => setIsGameMenuOpen(true)}
                className="text-[10px] font-mono font-black bg-[#FF3000] text-white px-2 py-0.5 uppercase hover:bg-black transition-colors cursor-pointer"
              >
                ĐỔI GAME
              </button>
            </div>
          </div>

          {/* Showcase Image */}
          <div className="border-2 border-black aspect-[4/3] relative overflow-hidden bg-black group">
            <img
              src={activeGameInfo.image}
              alt={activeGameInfo.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/assets/games/jaipur.jpg';
              }}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black/90 text-white p-3 border-t-2 border-black">
              <div className="font-mono font-black text-sm uppercase tracking-wider">
                {activeGameInfo.name}
              </div>
              <div className="font-mono text-[10px] text-neutral-300 uppercase tracking-widest mt-0.5">
                {activeGameInfo.tagline}
              </div>
            </div>
          </div>

          <p className="text-xs font-sans text-neutral-700 leading-relaxed">
            {activeGameInfo.description}
          </p>

          {/* Key gameplay highlights */}
          <div className="border-2 border-black bg-[#F2F2F2] p-4 flex flex-col gap-2.5 font-mono text-xs">
            <div className="text-[10px] font-black uppercase tracking-widest text-black border-b border-black pb-1.5 flex items-center justify-between">
              <span>ĐẶC ĐIỂM NỔI BẬT</span>
              <span className="text-[#FF3000]">
                {activeGameInfo.status === 'ready' ? 'SẴN SÀNG CHƠI' : 'SẮP RA MẮT'}
              </span>
            </div>

            {activeGameInfo.features.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-2.5 text-neutral-800">
                <span className="w-1.5 h-1.5 bg-[#FF3000] flex-shrink-0"></span>
                <span className="uppercase font-bold text-[11px] leading-tight">{feature}</span>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setIsGameMenuOpen(true)}
            className="w-full py-2.5 bg-[#F2F2F2] hover:bg-black hover:text-white border-2 border-black font-mono font-black text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <LayoutGrid className="w-4 h-4 text-[#FF3000]" />
            <span>MỞ MENU TẤT CẢ GAME CÓ HÌNH ẢNH</span>
          </button>
        </div>
      </div>

      {/* 3-Column Benefits */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 border-t-4 border-black">
        <div className="border-2 border-black p-5 bg-white flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="font-mono font-black text-xs uppercase text-[#FF3000]">
              CHỦ PHÒNG
            </span>
            <Users className="w-5 h-5 text-black" />
          </div>
          <div className="font-mono font-black text-sm uppercase text-black">
            TOÀN QUYỀN ĐIỀU HÀNH
          </div>
          <p className="text-xs text-neutral-600 leading-relaxed font-sans">
            Tùy biến số lượng người chơi, quản lý chỗ ngồi, mời người ra khỏi phòng hoặc luân chuyển giữa người chơi và khán giả dễ dàng.
          </p>
        </div>

        <div className="border-2 border-black p-5 bg-white flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="font-mono font-black text-xs uppercase text-[#FF3000]">
              BẢO MẬT
            </span>
            <ShieldCheck className="w-5 h-5 text-black" />
          </div>
          <div className="font-mono font-black text-sm uppercase text-black">
            CÔNG BẰNG & MINH BẠCH
          </div>
          <p className="text-xs text-neutral-600 leading-relaxed font-sans">
            Tự động quản lý lượt chơi, giấu kín bài trên tay của đối thủ để đảm bảo tính công bằng tuyệt đối.
          </p>
        </div>

        <div className="border-2 border-black p-5 bg-white flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="font-mono font-black text-xs uppercase text-[#FF3000]">
              TIỆN LỢI
            </span>
            <Cpu className="w-5 h-5 text-black" />
          </div>
          <div className="font-mono font-black text-sm uppercase text-black">
            CHƠI MƯỢT TRÊN MỌI THIẾT BỊ
          </div>
          <p className="text-xs text-neutral-600 leading-relaxed font-sans">
            Giao diện tối ưu hóa cho cả điện thoại, máy tính bảng và máy tính. Mở liên kết phòng là bắt đầu tranh tài ngay.
          </p>
        </div>
      </div>

      {/* Modal Menu Danh Sách Toàn Bộ Game Có Hình Ảnh */}
      <GameSelectMenuModal
        isOpen={isGameMenuOpen}
        onClose={() => setIsGameMenuOpen(false)}
        selectedGameId={selectedGameId}
        onSelectGame={(id) => setSelectedGameId(id)}
        availableGames={availableGames}
      />
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useRoomStore } from '@/stores/room-store';
import { InviteLinkCard } from '@/components/lobby/InviteLinkCard';
import { HostControls } from '@/components/lobby/HostControls';
import { PlayerSlotList } from '@/components/lobby/PlayerSlotList';
import { ChatBox } from '@/components/chat/ChatBox';
import { FloatingChatWidget } from '@/components/chat/FloatingChatWidget';
import { RaceBoard } from '@/games/test-race/RaceBoard';
import { JaipurBoard } from '@/games/jaipur/JaipurBoard';
import { HexEffectsBoard } from '@/games/hex-effects/HexEffectsBoard';
import { LogOut, Wifi, WifiOff, ShieldAlert, AlertTriangle, ArrowLeft, Dices } from 'lucide-react';

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomCode = (params?.code as string)?.toUpperCase();

  const {
    initSocket,
    isConnected,
    room,
    me,
    error,
    setError,
    isKicked,
    joinRoom,
    reconnect,
    leaveRoom,
  } = useRoomStore();

  const [promptNickname, setPromptNickname] = useState('');
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const isLeavingRef = React.useRef(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tokenParam = urlParams.get('token') || urlParams.get('session_token');
      if (tokenParam) {
        localStorage.setItem('bg_session_token', tokenParam);
      }
    }
    initSocket();
  }, [initSocket]);

  // Nếu người dùng mở trực tiếp link phòng mà chưa có trong state
  useEffect(() => {
    if (!roomCode || isLeavingRef.current) return;

    if (!room || room.code !== roomCode) {
      const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
      const tokenParam = urlParams?.get('token') || urlParams?.get('session_token') || localStorage.getItem('bg_session_token');
      
      if (tokenParam) {
        reconnect(tokenParam);
      } else {
        const savedNickname = localStorage.getItem('bg_nickname');
        if (savedNickname) {
          const seed = 'seed_' + Math.random().toString(36).substring(2, 9);
          joinRoom(roomCode, savedNickname, seed);
        } else {
          setShowNicknameModal(true);
        }
      }
    }
  }, [roomCode, room, isConnected, joinRoom, reconnect]);

  const handleJoinWithNickname = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptNickname.trim()) return;
    localStorage.setItem('bg_nickname', promptNickname.trim());
    const seed = 'seed_' + Math.random().toString(36).substring(2, 9);
    joinRoom(roomCode, promptNickname.trim(), seed);
    setShowNicknameModal(false);
  };

  const handleLeave = () => {
    isLeavingRef.current = true;
    leaveRoom();
    window.location.href = '/';
  };

  if (isLeavingRef.current) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-8 h-8 border-4 border-black border-t-[#FF3000] animate-spin mb-3"></div>
        <p className="font-mono text-xs font-bold uppercase tracking-wider text-black">
          Đang rời khỏi phòng...
        </p>
      </div>
    );
  }

  // Trường hợp bị kick ra khỏi phòng
  if (isKicked) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="border-4 border-black bg-white max-w-md w-full p-8 text-center flex flex-col items-center gap-4">
          <div className="w-14 h-14 bg-black text-[#FF3000] flex items-center justify-center border-2 border-black">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-mono font-black text-black uppercase tracking-tight">
            BẠN ĐÃ RỜI PHÒNG
          </h2>
          <p className="text-xs text-neutral-600 leading-relaxed">
            Chủ phòng đã mời bạn ra khỏi phòng chơi hoặc phòng chơi đã đóng.
          </p>
          <button
            onClick={() => {
              isLeavingRef.current = true;
              leaveRoom();
              window.location.href = '/';
            }}
            className="w-full h-12 bg-black hover:bg-[#FF3000] text-white font-mono font-black text-xs uppercase tracking-widest border-2 border-black transition-colors cursor-pointer"
          >
            QUAY VỀ TRANG CHỦ
          </button>
        </div>
      </div>
    );
  }

  // Trường hợp hiển thị Modal nhập Nickname nếu chưa có
  if (showNicknameModal && (!room || room.code !== roomCode)) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="border-4 border-black bg-white max-w-md w-full p-8 flex flex-col gap-5">
          <div className="border-b-2 border-black pb-3">
            <h2 className="text-lg font-mono font-black uppercase text-black">
              VÀO PHÒNG CHƠI [{roomCode}]
            </h2>
            <p className="text-xs text-neutral-500 mt-1">
              Nhập tên của bạn để tham gia vào bàn chơi:
            </p>
          </div>

          <form onSubmit={handleJoinWithNickname} className="flex flex-col gap-4">
            <input
              type="text"
              autoFocus
              value={promptNickname}
              onChange={(e) => setPromptNickname(e.target.value)}
              placeholder="VD: Cáo Thông Thái..."
              maxLength={25}
              className="w-full bg-[#F2F2F2] border-2 border-black px-4 py-3 text-sm font-mono font-black uppercase text-black placeholder-neutral-400 focus:outline-none focus:border-[#FF3000] rounded-none"
            />
            <button
              type="submit"
              disabled={!promptNickname.trim()}
              className="w-full h-14 bg-black hover:bg-[#FF3000] disabled:opacity-40 text-white font-mono font-black text-xs uppercase tracking-widest border-2 border-black rounded-none transition-colors cursor-pointer"
            >
              VÀO PHÒNG NGAY
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Khi gặp lỗi và không có phòng (phòng không tồn tại, hết hạn, v.v.)
  if (error && !room) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="border-4 border-black bg-white max-w-md w-full p-8 text-center flex flex-col items-center gap-5">
          <div className="w-14 h-14 bg-black text-[#FF3000] flex items-center justify-center border-2 border-black">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-mono font-black text-black uppercase tracking-tight">
              KHÔNG THỂ VÀO PHÒNG
            </h2>
            <p className="text-xs text-neutral-600 leading-relaxed mt-2 font-mono">
              {error}
            </p>
          </div>
          <button
            onClick={handleLeave}
            className="w-full h-12 bg-black hover:bg-[#FF3000] text-white font-mono font-black text-xs uppercase tracking-widest border-2 border-black transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>QUAY VỀ TRANG CHỦ</span>
          </button>
        </div>
      </div>
    );
  }

  // Đang tải dữ liệu phòng
  if (!room) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-5 text-black p-4">
        <div className="w-10 h-10 border-4 border-black border-t-[#FF3000] animate-spin"></div>
        <p className="text-xs font-mono font-bold uppercase tracking-widest">
          ĐANG VÀO PHÒNG [{roomCode}]...
        </p>
        <button
          onClick={handleLeave}
          className="mt-2 h-10 px-5 border-2 border-black bg-[#F2F2F2] hover:bg-black hover:text-white font-mono font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>HỦY & VỀ TRANG CHỦ</span>
        </button>
      </div>
    );
  }

  const isLobby = room.status === 'LOBBY';

  // 1. VIEW: ĐANG TRONG TRẬN ĐẤU (IN_GAME / FINISHED) - FILL TOÀN MÀN HÌNH
  if (!isLobby) {
    return (
      <div className="fixed inset-0 z-40 flex flex-col bg-[#090d15] overflow-hidden select-none">
        {/* Thanh Header duy nhất trong game */}
        <header className="h-14 border-b-2 border-amber-500/40 bg-[#0e1422] px-4 sm:px-6 flex items-center justify-between flex-shrink-0 z-30 text-white shadow-xl">
          {/* Logo & Thông tin phòng */}
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center gap-2 group cursor-pointer" title="Về trang chủ">
              <div className="w-8 h-8 bg-amber-500 text-slate-950 flex items-center justify-center font-black">
                <Dices className="w-5 h-5 text-slate-950" />
              </div>
              <span className="font-mono font-black text-sm tracking-tight uppercase text-white hidden md:inline">
                BOARD GAME HUB
              </span>
            </a>

            <div className="h-4 w-px bg-white/20 hidden sm:block" />

            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="font-black text-amber-300 border border-amber-500/40 px-2.5 py-1 bg-amber-500/10">
                PHÒNG: {room.code}
              </span>
              <span className="font-bold px-2 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase">
                {room.selectedGameId === 'jaipur' ? `JAIPUR • HIỆP ${room.gameData?.round || 1}/3` : 'ĐANG CHƠI'}
              </span>
            </div>
          </div>

          {/* Cảnh báo mất mạng & Nút Rời Phòng ngay trên Header */}
          <div className="flex items-center gap-3">
            {!isConnected && (
              <div className="flex items-center gap-1.5 font-mono text-xs font-black uppercase px-2.5 py-1 bg-[#FF3000] text-white animate-pulse">
                <WifiOff className="w-3.5 h-3.5" />
                <span>MẤT MẠNG</span>
              </div>
            )}

            <button
              id="btn-leave-room"
              onClick={handleLeave}
              className="flex items-center gap-2 h-9 px-3.5 font-mono font-black text-xs uppercase text-white bg-black hover:bg-[#FF3000] border border-white/40 hover:border-[#FF3000] transition-colors cursor-pointer"
              title="Rời khỏi phòng chơi"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>RỜI PHÒNG</span>
            </button>
          </div>
        </header>

        {/* Khu vực Bàn cờ trò chơi chiếm 100% diện tích còn lại, không cuộn */}
        <main className="flex-1 w-full h-[calc(100vh-3.5rem)] overflow-hidden relative flex flex-col bg-gradient-to-b from-[#0a0e17] via-[#0e1422] to-[#070a10]">
          {room.selectedGameId === 'jaipur' ? (
            <JaipurBoard />
          ) : room.selectedGameId === 'hex-effect' ? (
            <HexEffectsBoard />
          ) : (
            <div className="max-w-5xl mx-auto p-4 w-full">
              <RaceBoard />
            </div>
          )}
        </main>

        {/* Hộp khung chat ở góc có thể collapse/mở rộng */}
        <FloatingChatWidget />
      </div>
    );
  }

  // 2. VIEW: SẢNH CHỜ (LOBBY)
  return (
    <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full p-4 sm:p-8 gap-6">
      {/* Room Navigation & Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b-4 border-black pb-4">
        <div className="flex items-center gap-4">
          <button
            id="btn-leave-room"
            onClick={handleLeave}
            className="flex items-center gap-2 h-10 px-4 font-mono font-black text-xs uppercase text-white bg-black hover:bg-[#FF3000] border-2 border-black transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>RỜI PHÒNG</span>
          </button>

          <div className="flex items-center gap-2 font-mono">
            <span className="text-sm font-black text-black border-2 border-black px-2.5 py-1.5 bg-white">
              PHÒNG: {room.code}
            </span>
            <span className="text-xs font-black px-2.5 py-1.5 border-2 border-black uppercase tracking-wider bg-[#F2F2F2] text-black">
              SẢNH CHỜ
            </span>
          </div>
        </div>

        {/* Chỉ hiển thị cảnh báo khi mất kết nối */}
        {!isConnected && (
          <div className="flex items-center gap-2 font-mono text-xs font-black uppercase border-2 border-black px-3 py-1.5 bg-[#FF3000] text-white animate-pulse">
            <WifiOff className="w-3.5 h-3.5" />
            <span>MẤT KẾT NỐI MẠNG</span>
          </div>
        )}
      </div>

      {/* Error Alert nếu có */}
      {error && (
        <div className="p-3 border-2 border-black bg-[#FF3000] text-white font-mono text-xs font-bold uppercase flex items-center justify-between">
          <span>THÔNG BÁO: {error}</span>
          <button
            onClick={() => setError(null)}
            className="border border-white px-2 py-0.5 text-xs hover:bg-white hover:text-black font-mono transition-colors"
          >
            ĐÓNG
          </button>
        </div>
      )}

      {/* Sảnh chờ 2 cột */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Cột chính (8 cols): Invite Card, Danh sách người chơi */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <InviteLinkCard
            roomCode={room.code}
            maxPlayers={room.maxPlayers}
            currentPlayers={room.players.length}
          />
          <PlayerSlotList />
        </div>

        {/* Cột phụ (4 cols): Bảng điều khiển Chủ phòng & Khung Chat */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <HostControls />
          <ChatBox />
        </div>
      </div>
    </div>
  );
}

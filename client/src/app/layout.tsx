import type { Metadata } from 'next';
import './globals.css';
import { Dices } from 'lucide-react';

export const metadata: Metadata = {
  title: 'BOARD GAME HUB - Chơi Cùng Bạn Bè Trực Tuyến',
  description: 'Nền tảng thi đấu board game trực tuyến đa người chơi. Mở link là chơi ngay!',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="bg-white min-h-screen text-black flex flex-col antialiased selection:bg-[#FF3000] selection:text-white swiss-grid-pattern">
        {/* Header */}
        <header className="border-b-4 border-black bg-white sticky top-0 z-40 px-4 sm:px-8 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <a href="/" className="flex items-center gap-3 group cursor-pointer">
              <div className="w-10 h-10 bg-black text-white flex items-center justify-center group-hover:bg-[#FF3000] transition-colors duration-150">
                <Dices className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-xl tracking-tighter uppercase text-black leading-none">
                  BOARD GAME HUB
                </span>
                <span className="text-[11px] uppercase tracking-wider text-neutral-500 font-bold mt-0.5">
                  Chơi cùng bạn bè trực tuyến
                </span>
              </div>
            </a>

            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-500 hidden sm:inline-block">
                MIỄN PHÍ • KHÔNG CẦN CÀI ĐẶT
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 flex flex-col">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t-4 border-black bg-white px-4 sm:px-8 py-4 mt-auto">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-bold uppercase tracking-wider text-neutral-700">
            <span>BOARD GAME HUB • NỀN TẢNG BOARD GAME TRỰC TUYẾN</span>
            <span className="text-neutral-500 font-medium">MỞ TRÌNH DUYỆT LÀ CHƠI NGAY • KHÔNG CẦN CÀI ĐẶT</span>
          </div>
        </footer>
      </body>
    </html>
  );
}

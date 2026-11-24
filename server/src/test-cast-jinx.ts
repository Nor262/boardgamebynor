import { io } from 'socket.io-client';
import { SOCKET_EVENTS } from '@boardgame/shared';
import { chromium } from 'playwright';

async function main() {
  const socket1 = io('http://localhost:4000');
  const socket2 = io('http://localhost:4000');

  let roomCode = '';
  let token1 = '';
  let token2 = '';
  let p1Id = '';
  let p2Id = '';
  let currentTurnId = '';

  await new Promise<void>((resolve) => {
    socket1.on('connect', () => {
      socket1.emit(SOCKET_EVENTS.ROOM_CREATE, {
        nickname: 'Phù Thủy Trắng',
        avatarSeed: 'host_witch',
        preferredGameId: 'hex-effect',
      });
    });

    socket1.on(SOCKET_EVENTS.ROOM_JOIN_SUCCESS, (data) => {
      roomCode = data.room.code;
      token1 = data.sessionToken;
      p1Id = data.player.id;

      socket2.emit(SOCKET_EVENTS.ROOM_JOIN, {
        code: roomCode,
        nickname: 'Phù Thủy Hắc Ám',
        avatarSeed: 'guest_warlock',
      });
    });

    socket2.on(SOCKET_EVENTS.ROOM_JOIN_SUCCESS, (data) => {
      token2 = data.sessionToken;
      p2Id = data.player.id;

      socket2.emit(SOCKET_EVENTS.PLAYER_TOGGLE_READY, {
        code: roomCode,
        playerId: p2Id,
      });

      setTimeout(() => {
        socket1.emit(SOCKET_EVENTS.HOST_START_GAME, {
          code: roomCode,
          hostId: p1Id,
        });
      }, 300);
    });

    socket1.on(SOCKET_EVENTS.ROOM_UPDATED, (room) => {
      if (room.status === 'IN_GAME') {
        currentTurnId = room.gameData.currentTurnPlayerId;
        resolve();
      }
    });
  });

  console.log(`Match started! Room: ${roomCode}, Current turn: ${currentTurnId === p1Id ? 'P1' : 'P2'}`);

  // Now, the active turn player plays a spell or Jinx
  const activeSocket = currentTurnId === p1Id ? socket1 : socket2;
  const victimPlayerId = currentTurnId === p1Id ? p2Id : p1Id;
  const victimToken = currentTurnId === p1Id ? token2 : token1;

  // Let's make the active turn player play JINX on the victim
  // First check active player's hand or send a custom action / spell
  const activePlayerHand = await new Promise<any>((resolve) => {
    activeSocket.once(SOCKET_EVENTS.ROOM_UPDATED, (r) => {
      resolve(r.gameData.players[currentTurnId].hand);
    });
    // Trigger an update
    activeSocket.emit(SOCKET_EVENTS.GAME_ACTION, { type: 'DISCARD_AND_DRAW', cardIds: [] });
  });

  // Find if active player has a SPELL or JINX or let's create a recent disaster event
  activeSocket.emit(SOCKET_EVENTS.GAME_ACTION, {
    type: 'PLAY_SPELL',
    cardId: activePlayerHand.find((c: any) => c.category === 'SPELL' || c.category === 'DISASTER')?.id || activePlayerHand[0]?.id,
    targetPlayerId: victimPlayerId,
  });

  await new Promise((r) => setTimeout(r, 1000));

  // Now open browser as the victim player!
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  // Set victim session
  await page.addInitScript(
    ({ code, token }) => {
      localStorage.setItem(`boardgame_session_${code}`, token);
    },
    { code: roomCode, token: victimToken }
  );

  await page.goto(`http://localhost:3000/room/${roomCode}`);
  await page.waitForTimeout(2000);

  // Take screenshot 1: Victim view
  const shot1 = '/home/nor/.gemini/antigravity-ide/brain/59050fdd-daec-4352-b3fc-1dac8dc4c0c8/.tempmediaStorage/hex_victim_view.png';
  await page.screenshot({ path: shot1 });
  console.log('Victim screenshot saved:', shot1);

  // Check if active debuff badge is present
  const debuffBtn = await page.$('button:has-text("CẤM DÙNG THUỐC GIẢI"), button:has-text("ÉP BỎ"), button:has-text("BỊ CƯỚP"), button:has-text("THUỐC GIẢI BỊ PHÁ")');
  if (debuffBtn) {
    console.log('Debuff badge found! Hovering...');
    await debuffBtn.hover();
    await page.waitForTimeout(600);
    const shotHover = '/home/nor/.gemini/antigravity-ide/brain/59050fdd-daec-4352-b3fc-1dac8dc4c0c8/.tempmediaStorage/hex_debuff_hover.png';
    await page.screenshot({ path: shotHover });
    console.log('Hover screenshot saved:', shotHover);

    console.log('Clicking debuff badge to open modal...');
    await debuffBtn.click();
    await page.waitForTimeout(600);
    const shotModal = '/home/nor/.gemini/antigravity-ide/brain/59050fdd-daec-4352-b3fc-1dac8dc4c0c8/.tempmediaStorage/hex_debuff_modal.png';
    await page.screenshot({ path: shotModal });
    console.log('Modal screenshot saved:', shotModal);
  } else {
    console.log('No debuff button found, testing hover on status bar...');
    const statusBar = await page.$('text=Trạng thái: Ổn định');
    console.log('Status bar found:', !!statusBar);
  }

  await browser.close();
  socket1.disconnect();
  socket2.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

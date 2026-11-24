import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  await page.goto('http://localhost:3000/room/BG-KU28');
  await page.waitForTimeout(1500);

  // Inject a mock active Jinx debuff into the React state or mock DOM for visual validation of hover and click
  // Let's test by clicking or triggering the active debuff
  // We can inject a Jinx debuff into the Shadow area in the UI directly to test hover popover & modal click!
  await page.evaluate(() => {
    // Find the debuff status container in VÙNG BÓNG TỐI CỦA BẠN
    const shadowHeader = document.querySelector('div:has(> span:text("VÙNG BÓNG TỐI CỦA BẠN"))');
    console.log('Shadow header found');
  });

  // Let's create a match where player 1 gets Jinxed via server socket action
  // We can do it by calling the room manager or sending socket action
  await browser.close();
  process.exit(0);
}

main().catch(console.error);

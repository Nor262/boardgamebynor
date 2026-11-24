import { chromium } from 'playwright';

async function main() {
  const url = process.argv[2];
  if (!url) {
    console.error('Usage: tsx take-screenshot.ts <url>');
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: true });
  // Standard desktop / laptop viewport: 1400x900
  const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const page = await context.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err));
  page.on('response', resp => {
    if (!resp.ok()) console.log('FAILED URL:', resp.status(), resp.url());
  });

  console.log('Navigating to room:', url);
  await page.goto(url, { waitUntil: 'networkidle' });

  try {
    await page.waitForSelector('text=HEX EFFECTS', { timeout: 15000 });
  } catch (e) {
    console.warn('waitForSelector HEX EFFECTS timed out, current page text:', await page.innerText('body').catch(() => ''));
  }
  await page.waitForTimeout(1000);

  const screenshotPath = process.argv[3] || '/home/nor/.gemini/antigravity-ide/brain/59050fdd-daec-4352-b3fc-1dac8dc4c0c8/hex_paired_colors.png';
  await page.screenshot({ path: screenshotPath });
  console.log('Saved screenshot to:', screenshotPath);

  // Check if main container has scroll
  const scrollInfo = await page.evaluate(() => {
    const mainEl = document.querySelector('main');
    return {
      scrollHeight: mainEl?.scrollHeight,
      clientHeight: mainEl?.clientHeight,
      hasScroll: mainEl ? mainEl.scrollHeight > mainEl.clientHeight : false,
    };
  });
  console.log('Main scroll info:', scrollInfo);

  await browser.close();
}

main().catch(console.error);

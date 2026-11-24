import { chromium } from 'playwright';

async function main() {
  const url = process.argv[2];
  if (!url) {
    console.error('Usage: tsx test-inspect-and-hover.ts <url>');
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const page = await context.newPage();

  console.log('Navigating to room:', url);
  await page.goto(url, { waitUntil: 'networkidle' });

  await page.waitForSelector('text=HEX EFFECTS', { timeout: 15000 });
  await page.waitForTimeout(1000);

  const artifactDir = '/home/nor/.gemini/antigravity-ide/brain/59050fdd-daec-4352-b3fc-1dac8dc4c0c8';

  // Find the visible card title for HANAHAKI in the player shadow slots
  const hanahakiTitle = page.locator('h4:has-text("HANAHAKI")').first();
  const hanahakiCard = hanahakiTitle.locator('xpath=ancestor::div[contains(@class, "group")]');

  console.log('Hovering over HANAHAKI card...');
  await hanahakiCard.hover();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${artifactDir}/hex_hover_tooltip.png` });
  console.log('Saved hover screenshot to hex_hover_tooltip.png');

  // Click on the card to open inspection modal
  console.log('Clicking on HANAHAKI card to inspect...');
  await hanahakiCard.click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${artifactDir}/hex_inspect_modal.png` });
  console.log('Saved inspect modal screenshot to hex_inspect_modal.png');

  await browser.close();
}

main().catch(console.error);

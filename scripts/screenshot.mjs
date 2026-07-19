// Скриншоти сторінки в двох в'юпортах через встановлений Edge (playwright-core).
// Використання: node scripts/screenshot.mjs <outDir> [url]
import { chromium } from 'playwright-core';

const outDir = process.argv[2] ?? '.';
const url = process.argv[3] ?? 'http://localhost:4321';

const browser = await chromium.launch({ channel: 'msedge', headless: true });

for (const [name, viewport] of [
  ['desktop', { width: 1440, height: 900 }],
  ['mobile', { width: 390, height: 844 }],
]) {
  const page = await browser.newPage({ viewport });
  const errors = [];
  page.on('console', (msg) => msg.type() === 'error' && errors.push(msg.text()));
  page.on('pageerror', (err) => errors.push(String(err)));
  await page.goto(url, { waitUntil: 'networkidle' });
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
  await page.screenshot({ path: `${outDir}/pw-${name}.png`, fullPage: true });
  console.log(`${name}: h-overflow=${overflow}px, console-errors=${errors.length}`);
  errors.forEach((e) => console.log(`  ERROR: ${e}`));
  await page.close();
}

await browser.close();

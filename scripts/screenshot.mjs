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
  // Прокрутка донизу, щоб підвантажились lazy-зображення перед fullPage-знімком
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) {
      window.scrollTo({ top: y, behavior: 'instant' });
      await new Promise((r) => setTimeout(r, 60));
    }
    // instant, бо scroll-behavior:smooth анімує повернення і sticky-шапка потрапляє в кадр посеред сторінки
    window.scrollTo({ top: 0, behavior: 'instant' });
    await new Promise((r) => setTimeout(r, 200));
  });
  await page.waitForLoadState('networkidle');
  // Дочекатись завантаження й декодування зображень (не довше 5 с) та стабілізації sticky-елементів
  await page.evaluate(async () => {
    const timeout = new Promise((r) => setTimeout(r, 5000));
    const decoded = Promise.all([...document.images].map((img) => img.decode().catch(() => {})));
    await Promise.race([decoded, timeout]);
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  });
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
  await page.screenshot({ path: `${outDir}/pw-${name}.png`, fullPage: true });
  console.log(`${name}: h-overflow=${overflow}px, console-errors=${errors.length}`);
  errors.forEach((e) => console.log(`  ERROR: ${e}`));
  await page.close();
}

await browser.close();

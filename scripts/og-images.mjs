/**
 * Генерує превʼю для соцмереж (Open Graph, 1200×630) з фото котеджів.
 *
 *   node scripts/og-images.mjs
 *
 * Результат: public/og-image.jpg (загальне) і public/og/<id>.jpg (по котеджу).
 * Запускати після заміни фото-обкладинок (`cardPhoto` у src/content/cottages/*.json).
 */
import { mkdir, readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve(import.meta.dirname, '..');
const photosDir = path.join(root, 'src/assets/photos');
const cottagesDir = path.join(root, 'src/content/cottages');
const outDir = path.join(root, 'public/og');

/** Обрізає фото під 1200×630 — розмір, який очікують Facebook, Telegram і Twitter. */
async function render(source, target) {
  await sharp(source)
    .resize(1200, 630, { fit: 'cover', position: 'center' })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(target);
  console.log(`✓ ${path.relative(root, target)}`);
}

await mkdir(outDir, { recursive: true });

const files = (await readdir(cottagesDir)).filter((f) => f.endsWith('.json'));
let general = null;

for (const file of files) {
  const cottage = JSON.parse(await readFile(path.join(cottagesDir, file), 'utf8'));
  const source = path.join(photosDir, cottage.photosDir, cottage.cardPhoto);
  const id = path.basename(file, '.json');
  await render(source, path.join(outDir, `${id}.jpg`));
  // Загальне превʼю сайту — обкладинка другого котеджу (те саме фото, що в hero головної)
  if (cottage.photosDir === 'cottage-2') general = source;
}

if (general) await render(general, path.join(root, 'public/og-image.jpg'));

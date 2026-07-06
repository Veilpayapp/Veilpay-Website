// One-off image optimization for VeilPay.
// Generates small, web-optimized assets from the oversized source PNGs.
// Run: node scripts/optimize-images.mjs  (or: npm run optimize:img)
//
// Visual output is preserved — these are the same pixels at sane resolutions
// and modern formats, replacing a 9.1MB PNG that was being rendered at 40px.
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { statSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pub = resolve(__dirname, '..', 'public');
const p = (name) => resolve(pub, name);

const kb = (file) => {
  try {
    return `${(statSync(file).size / 1024).toFixed(1)}KB`;
  } catch {
    return 'missing';
  }
};

async function run() {
  const logoSrc = p('image.png');

  // Favicon — tiny square used in the browser tab.
  await sharp(logoSrc)
    .resize(48, 48, { fit: 'cover' })
    .png({ compressionLevel: 9, palette: true })
    .toFile(p('favicon.png'));

  // Logo — rendered at 40px (navbar) and 180px (phone screen). 192px is crisp
  // on hi-DPI at both sizes. WebP keeps it a few KB.
  await sharp(logoSrc)
    .resize(192, 192, { fit: 'cover' })
    .webp({ quality: 88 })
    .toFile(p('logo.webp'));

  // OpenGraph / Twitter card image — social crawlers want ~1200x630.
  await sharp(logoSrc)
    .resize(1200, 630, { fit: 'cover' })
    .jpeg({ quality: 80, mozjpeg: true })
    .toFile(p('og.jpg'));

  // Phone mockup image — swap PNG for WebP (visually identical, ~3x smaller).
  await sharp(p('MOCKUP2.png'))
    .webp({ quality: 90 })
    .toFile(p('MOCKUP2.webp'));

  console.log('Generated:');
  console.log('  favicon.png ', kb(p('favicon.png')));
  console.log('  logo.webp   ', kb(p('logo.webp')));
  console.log('  og.jpg      ', kb(p('og.jpg')));
  console.log('  MOCKUP2.webp', kb(p('MOCKUP2.webp')));
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

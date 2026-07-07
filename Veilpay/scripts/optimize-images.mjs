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

  // These phone screenshots render at a CSS width of at most 520px
  // (w-[400px] md:w-[min(520px,50vw)]). The source PNGs are ~2000–3960px wide,
  // so the browser was downloading up to 8× more pixels than it can display —
  // the single biggest LCP cost on mobile. Cap the longest edge at 1080px:
  // that stays perfectly crisp at 520px CSS even on 2× DPR screens while
  // cutting the largest asset (image2) from 416KB to a fraction. Pixels and
  // aspect ratio are otherwise identical — the visual is unchanged.
  const MAX_W = 1080;

  // Phone mockup image (hero LCP candidate) — resize + WebP.
  await sharp(p('MOCKUP2.png'))
    .resize({ width: MAX_W, withoutEnlargement: true })
    .webp({ quality: 90 })
    .toFile(p('MOCKUP2.webp'));

  // Optimize GSAP sequence images
  const sequenceImages = [
    'image2.png',
    'image3.png',
    'image2.white.png',
    'image3.white.png'
  ];

  for (const img of sequenceImages) {
    if (statSync(p(img), { throwIfNoEntry: false })) {
      const webpName = img.replace('.png', '.webp');
      await sharp(p(img))
        .resize({ width: MAX_W, withoutEnlargement: true })
        .webp({ quality: 85 })
        .toFile(p(webpName));
      console.log(`  ${webpName}`, kb(p(webpName)));
    }
  }

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

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

  // ── Phone mockups & sequence screenshots ──
  // Every source PNG contains the SAME phone, but on a differently-sized canvas
  // with different padding (MOCKUP2 is 1980px wide, the whites are 1800px, and
  // image2 is 2x). Matching only the OUTPUT canvas is NOT enough: the phone
  // still ends up a different SIZE/position in each, so the dark/white overlays
  // don't align and the whites look bigger. Instead we normalize the PHONE
  // itself:
  //   1. trim()  — crop the transparent margin down to the phone,
  //   2. resize (fill) the phone to one common size (PHONE_W x PHONE_H),
  //   3. extend  — re-pad to a shared CANVAS with the phone centered.
  // => every variant has the phone at the IDENTICAL size + position, so theme
  //    toggles and GSAP crossfades line up perfectly.
  const PHONE_W = 955;
  const PHONE_H = 1972;
  // Centre the phone on a 1080x2007 canvas: 63+955+62 = 1080, 17+1972+18 = 2007.
  const PAD = { top: 17, bottom: 18, left: 63, right: 62 };
  const TRANSPARENT = { r: 0, g: 0, b: 0, alpha: 0 };

  const phoneImages = [
    'MOCKUP2.png',
    'MOCKUP2.WHITE.png',
    'image2.png',
    'image3.png',
    'image2.white.png',
    'image3.white.png',
  ];

  for (const img of phoneImages) {
    if (statSync(p(img), { throwIfNoEntry: false })) {
      const webpName = img.replace('.png', '.webp');
      await sharp(p(img))
        .trim()
        .resize(PHONE_W, PHONE_H, { fit: 'fill' })
        .extend({ ...PAD, background: TRANSPARENT })
        .webp({ quality: 85 })
        .toFile(p(webpName));
      console.log(`  ${webpName}`, kb(p(webpName)));
    }
  }

  console.log('Generated:');
  console.log('  favicon.png ', kb(p('favicon.png')));
  console.log('  logo.webp   ', kb(p('logo.webp')));
  console.log('  og.jpg      ', kb(p('og.jpg')));
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

/**
 * Generates brand assets from the source files in public/brand/:
 *  - trimmed logo PNGs (light + dark variants)
 *  - simplified square icon set (favicon.ico, icon.png, apple-icon.png, icon-192/512)
 *  - optimised hero image and default Open Graph image
 *
 * Run with: npm run assets
 */
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { generateOgImage } from "./generate-og.mjs";

const root = path.resolve(import.meta.dirname, "..");
const brand = (f) => path.join(root, "public", "brand", f);
const pub = (f) => path.join(root, "public", f);
const app = (f) => path.join(root, "app", f);

const BLACK = "#0B0B0B";
const RED = "#A00000";

// Simplified mark: the geometric ARICT "A" in white with the brand-red base bar, on black.
const iconSvg = (size, { rounded = true, padding = 0 } = {}) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="${rounded ? 112 : 0}" fill="${BLACK}"/>
  <g transform="translate(${256 * padding} ${256 * padding}) scale(${1 - padding})">
    <path fill-rule="evenodd" fill="#FFFFFF"
      d="M100 372 L226 92 L286 92 L412 372 L346 372 L322 318 L190 318 L166 372 Z
         M212 266 L300 266 L256 166 Z"/>
    <rect x="100" y="400" width="312" height="34" rx="6" fill="${RED}"/>
  </g>
</svg>`;

async function trimmedLogo() {
  const src = brand("arict-logo-source.png");
  const full = await sharp(src).trim({ threshold: 10 }).png().toBuffer();
  await sharp(full).toFile(pub("brand/arict-logo.png"));

  // Wordmark only (no tagline): the letters occupy roughly y 466–580 of the 1080 canvas.
  const region = await sharp(src)
    .extract({ left: 230, top: 460, width: 620, height: 125 })
    .png()
    .toBuffer();
  const wordmark = await sharp(region).trim({ threshold: 10 }).png().toBuffer();
  await sharp(wordmark).toFile(pub("brand/arict-wordmark.png"));

  // Dark-background variants: turn the black glyphs white, keep the red.
  for (const [input, out] of [
    [full, "brand/arict-logo-light.png"],
    [wordmark, "brand/arict-wordmark-light.png"],
  ]) {
    const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    for (let i = 0; i < data.length; i += 4) {
      const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
      const isNeutralDark = Math.abs(r - g) < 24 && Math.abs(g - b) < 24 && r < 140;
      if (isNeutralDark) {
        const lift = 255 - r; // keep anti-aliasing by mapping darkness to alpha
        data[i] = data[i + 1] = data[i + 2] = 255;
        data[i + 3] = Math.min(data[i + 3], lift);
      } else if (r > 200 && g > 200 && b > 200) {
        data[i + 3] = 0; // drop white background
      }
    }
    await sharp(data, { raw: info }).png().toFile(pub(out));
  }
}

async function icons() {
  const png = (size, opts) => sharp(Buffer.from(iconSvg(size, opts))).resize(size, size).png().toBuffer();

  await fs.writeFile(pub("icon-192.png"), await png(192));
  await fs.writeFile(pub("icon-512.png"), await png(512));
  await fs.writeFile(pub("icon-maskable-512.png"), await png(512, { rounded: false, padding: 0.18 }));
  await fs.writeFile(app("icon.png"), await png(512));
  await fs.writeFile(app("apple-icon.png"), await png(180, { rounded: false, padding: 0.08 }));
  await fs.writeFile(pub("brand/arict-mark.svg"), iconSvg(512).trim());

  // favicon.ico with PNG-encoded 16/32/48 entries.
  const sizes = [16, 32, 48];
  const images = await Promise.all(sizes.map((s) => png(s)));
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(sizes.length, 4);
  const entries = [];
  let offset = 6 + 16 * sizes.length;
  sizes.forEach((s, i) => {
    const e = Buffer.alloc(16);
    e[0] = s;
    e[1] = s;
    e.writeUInt16LE(1, 4);
    e.writeUInt16LE(32, 6);
    e.writeUInt32LE(images[i].length, 8);
    e.writeUInt32LE(offset, 12);
    offset += images[i].length;
    entries.push(e);
  });
  await fs.writeFile(app("favicon.ico"), Buffer.concat([header, ...entries, ...images]));
}

async function heroAndOg() {
  const campus = brand("campus-source.png");
  await sharp(campus).jpeg({ quality: 84, mozjpeg: true }).toFile(pub("images/hero-campus.jpg"));
  await generateOgImage();
}

await trimmedLogo();
await icons();
await heroAndOg();
console.log("Brand assets generated.");

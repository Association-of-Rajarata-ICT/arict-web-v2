/**
 * Rebuild the default social preview from the existing ARICT brand assets.
 * Run independently with `npm run assets:og` or as part of `npm run assets`.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const pub = (file) => path.join(root, "public", file);

export async function generateOgImage() {
  const [campus, wordmark] = await Promise.all([
    fs.readFile(pub("brand/campus-source.png")),
    fs.readFile(pub("brand/arict-wordmark.png")),
  ]);

  // All essential copy stays inside a generous safe area for small link cards.
  // Embed the original artwork so regeneration requires no network requests.
  const artwork = `
    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
      width="1200" height="630" viewBox="0 0 1200 630">
      <defs>
        <clipPath id="campus-frame">
          <rect x="748" y="32" width="420" height="566" rx="24"/>
        </clipPath>
        <linearGradient id="photo-shade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0.48" stop-color="#0B0B0B" stop-opacity="0"/>
          <stop offset="1" stop-color="#0B0B0B" stop-opacity="0.88"/>
        </linearGradient>
        <pattern id="dots" width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1" fill="#A00000" fill-opacity="0.15"/>
        </pattern>
      </defs>

      <rect width="1200" height="630" fill="#FAF9F6"/>
      <rect x="0" y="0" width="8" height="630" fill="#A00000"/>
      <rect x="652" y="444" width="96" height="154" fill="url(#dots)"/>

      <image x="64" y="56" width="238" height="43"
        xlink:href="data:image/png;base64,${wordmark.toString("base64")}"/>

      <g font-family="Arial, Helvetica, sans-serif">
        <circle cx="69" cy="159" r="4" fill="#A00000"/>
        <text x="84" y="164" fill="#656461" font-size="13" font-weight="700" letter-spacing="1.8">
          A STUDENT-DRIVEN TECH COMMUNITY
        </text>

        <g fill="#0B0B0B" font-weight="700" letter-spacing="-2.8">
          <text x="60" y="255" font-size="72">Empowering</text>
          <text x="60" y="328" font-size="64">innovation through</text>
          <text x="60" y="409" font-size="80" fill="#A00000">technology.</text>
        </g>

        <text x="64" y="460" fill="#656461" font-size="21">
          A place to learn. A community to build with.
        </text>

        <path d="M64 520 H678" stroke="#DDDAD4"/>
        <text x="64" y="555" fill="#0B0B0B" font-size="17" font-weight="700">
          Rajarata University of Sri Lanka
        </text>
        <text x="64" y="580" fill="#77736E" font-size="14">Association of Rajarata Information &amp; Communication Technology</text>

        <g clip-path="url(#campus-frame)">
          <image x="748" y="32" width="420" height="566" preserveAspectRatio="xMidYMid slice"
            xlink:href="data:image/png;base64,${campus.toString("base64")}"/>
          <rect x="748" y="32" width="420" height="566" fill="url(#photo-shade)"/>
          <path d="M780 476 H1136" stroke="#FFFFFF" stroke-opacity="0.35"/>
          <text x="780" y="513" fill="#FFFFFF" font-size="13" font-weight="700" letter-spacing="2.4">
            LEARN. BUILD. LEAD.
          </text>
          <text x="780" y="558" fill="#FFFFFF" font-size="32" font-weight="700" letter-spacing="-0.6">arict.lk</text>
          <circle cx="1115" cy="545" r="22" fill="#A00000"/>
          <path d="M1106 554 L1123 537 M1107 537 H1123 V553"
            fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        </g>
      </g>
    </svg>
  `;

  // Supersample the composition, then export an opaque, sRGB JPEG for crawlers.
  await sharp(Buffer.from(artwork), { density: 144 })
    .resize(1200, 630)
    .flatten({ background: "#FAF9F6" })
    .toColourspace("srgb")
    .jpeg({ quality: 90, mozjpeg: true, chromaSubsampling: "4:4:4" })
    .toFile(pub("og-default.jpg"));
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  await generateOgImage();
  console.log("Default OG image generated: public/og-default.jpg (1200 x 630).");
}

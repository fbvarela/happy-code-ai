// Renders the PWA app icons referenced by public/manifest.json from a single
// SVG source, so they can be regenerated on demand. Run: npm run icons:pwa
//
// The mark matches the browser-tab favicon (src/app/icon.svg): a </> glyph in
// brand colors. Here it's full-bleed on a bark square with generous padding so
// it survives Android adaptive-icon (maskable) cropping.
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "public", "icons");

// 512x512 source. The glyph (32-space, centered at 16,16) is scaled up and
// centered, leaving ~25% margin on each side for the maskable safe zone.
const svg = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="96" fill="#3d2b1f"/>
  <g transform="translate(256 256) scale(12) translate(-16 -16)" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 10.5 7 16l5 5.5" stroke="#7db892" stroke-width="2.4"/>
    <path d="M20 10.5 25 16l-5 5.5" stroke="#7db892" stroke-width="2.4"/>
    <path d="M18.5 10.5 13.5 21.5" stroke="#f4c145" stroke-width="2.4"/>
  </g>
</svg>`;

await mkdir(outDir, { recursive: true });
for (const size of [192, 512]) {
  const out = join(outDir, `icon-${size}.png`);
  await sharp(Buffer.from(svg)).resize(size, size).png().toFile(out);
  console.log(`✓ ${out}`);
}
console.log("PWA icons generated.");

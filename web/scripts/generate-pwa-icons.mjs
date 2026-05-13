/**
 * Generates public/icon-192.png and public/icon-512.png.
 * Uses public/industryprime-logo.png when present; otherwise emerald "IP" placeholders.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "..", "public");
const logoPath = path.join(publicDir, "industryprime-logo.png");

async function fromLogo(size) {
  await sharp(logoPath)
    .resize(size, size, {
      fit: "contain",
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .png()
    .toFile(path.join(publicDir, `icon-${size}.png`));
}

async function placeholder(size) {
  const font = Math.floor(size * 0.32);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="100%" height="100%" fill="#059669" rx="${Math.floor(size * 0.18)}"/>
  <text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle" fill="#ffffff" font-family="system-ui,Segoe UI,sans-serif" font-weight="800" font-size="${font}">IP</text>
</svg>`;
  await sharp(Buffer.from(svg)).png().toFile(path.join(publicDir, `icon-${size}.png`));
}

async function main() {
  fs.mkdirSync(publicDir, { recursive: true });
  if (fs.existsSync(logoPath)) {
    await fromLogo(192);
    await fromLogo(512);
    console.log("PWA icons generated from industryprime-logo.png");
  } else {
    await placeholder(192);
    await placeholder(512);
    console.log(
      "PWA icons: placeholder (add public/industryprime-logo.png and run npm run pwa:icons to regenerate from logo).",
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

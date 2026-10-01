import sharp from "sharp";
import { mkdirSync, writeFileSync } from "node:fs";

// Margins mark: warm dark page, an amber margin line, a serif italic "m"
const DESIGN = `
  <rect x="96" y="132" width="13" height="248" rx="6.5" fill="#8a6d3f"/>
  <text x="150" y="342" font-family="DejaVu Serif, Georgia, 'Times New Roman', serif"
        font-style="italic" font-weight="600" font-size="286" fill="#e8a04c">m</text>`;

const rounded = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="104" fill="#161412"/>${DESIGN}</svg>`;

const flat = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#161412"/>${DESIGN}</svg>`;

mkdirSync("public/icons", { recursive: true });

const jobs = [
  ["public/icons/icon-512.png", rounded, 512],
  ["public/icons/icon-192.png", rounded, 192],
  ["public/icons/maskable-512.png", flat, 512],
  ["app/apple-icon.png", flat, 180],
];

for (const [out, svg, size] of jobs) {
  await sharp(Buffer.from(svg)).resize(size, size).png().toFile(out);
  console.log("wrote", out);
}

// keep the favicon svg in sync with the mark
writeFileSync(
  "app/icon.svg",
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="13" fill="#161412"/>
  <rect x="12" y="16.5" width="1.6" height="31" rx="0.8" fill="#8a6d3f"/>
  <text x="18.5" y="42.5" font-family="DejaVu Serif, Georgia, 'Times New Roman', serif"
        font-style="italic" font-weight="600" font-size="36" fill="#e8a04c">m</text>
</svg>
`
);
console.log("wrote app/icon.svg");

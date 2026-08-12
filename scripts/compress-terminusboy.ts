import fs from "node:fs";
import sharp from "sharp";

const src = "public/arena/posters/terminusboy-14-aout-2026.png";
const out = "public/arena/posters/terminusboy-14-aout-2026.jpg";

async function main() {
  await sharp(src)
    .rotate()
    .resize({ width: 1200, withoutEnlargement: true })
    .jpeg({ quality: 78, mozjpeg: true })
    .toFile(out);
  const a = fs.statSync(src).size;
  const b = fs.statSync(out).size;
  console.log(`${(a / 1024).toFixed(0)}KB -> ${(b / 1024).toFixed(0)}KB`);
}

main();

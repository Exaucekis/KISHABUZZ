import sharp from "sharp";
import fs from "fs";

const dir = "public/arena/albums/gaz-mawete";
const files = ["01-portrait.png", "02-profil-paris.png"];

async function main() {
  for (const f of files) {
    const src = `${dir}/${f}`;
    const out = src.replace(".png", ".jpg");
    await sharp(src)
      .rotate()
      .resize({ width: 1600, withoutEnlargement: true })
      .jpeg({ quality: 85, mozjpeg: true })
      .toFile(out);
    console.log(
      `${f}: ${(fs.statSync(src).size / 1024).toFixed(0)}KB -> ${(fs.statSync(out).size / 1024).toFixed(0)}KB`
    );
  }
}

main();

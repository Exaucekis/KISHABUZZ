/**
 * Compresse les images publiques (artists + arena) pour alléger la navigation.
 * Usage: npx tsx scripts/optimize-images.ts
 */
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.join(process.cwd(), "public");
const TARGETS = [
  path.join(ROOT, "artists"),
  path.join(ROOT, "arena"),
];

async function walk(dir: string): Promise<string[]> {
  const out: string[] = [];
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(full)));
    else if (/\.(jpe?g|png|webp)$/i.test(e.name)) out.push(full);
  }
  return out;
}

async function optimize(file: string) {
  const before = (await fs.stat(file)).size;
  if (before < 40_000) return { file, before, after: before, skipped: true };

  const buf = await fs.readFile(file);
  const img = sharp(buf).rotate();
  const meta = await img.metadata();
  const width = Math.min(meta.width || 1600, 1400);

  let out: Buffer;
  const ext = path.extname(file).toLowerCase();
  if (ext === ".png") {
    out = await img
      .resize({ width, withoutEnlargement: true })
      .png({ compressionLevel: 8, palette: true, quality: 75 })
      .toBuffer();
  } else {
    out = await img
      .resize({ width, withoutEnlargement: true })
      .jpeg({ quality: 72, mozjpeg: true })
      .toBuffer();
  }

  if (out.length < before * 0.95) {
    const target = ext === ".png" && out.length > before * 0.6
      ? file.replace(/\.png$/i, ".jpg")
      : file;
    if (target !== file) {
      await fs.writeFile(target, await sharp(buf).rotate().resize({ width, withoutEnlargement: true }).jpeg({ quality: 72, mozjpeg: true }).toBuffer());
      // keep png if referenced; still overwrite png with smaller png if better
      if (out.length < before) await fs.writeFile(file, out);
    } else {
      await fs.writeFile(file, out);
    }
  }

  const after = (await fs.stat(file)).size;
  return { file, before, after, skipped: false };
}

async function main() {
  const files: string[] = [];
  for (const t of TARGETS) files.push(...(await walk(t)));
  let saved = 0;
  for (const f of files) {
    const r = await optimize(f);
    const delta = r.before - r.after;
    if (delta > 0) saved += delta;
    console.log(
      `${path.relative(ROOT, f)}: ${(r.before / 1024).toFixed(0)}KB → ${(r.after / 1024).toFixed(0)}KB${r.skipped ? " (skip)" : ""}`
    );
  }
  console.log(`Total saved: ${(saved / 1024).toFixed(0)} KB`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

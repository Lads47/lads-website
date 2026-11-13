import { createHash } from 'node:crypto';
import { readFile, writeFile, readdir, mkdir, stat } from 'node:fs/promises';
import sharp from 'sharp';

// Keep the source URLs and full-resolution assets. Only srcset candidates are generated.
const directory = 'public/photo';
const output = 'public/media/responsive';
const manifestPath = 'src/data/responsive-images.json';
await mkdir(output, { recursive: true });
await mkdir('src/data', { recursive: true });
const previous = JSON.parse(await readFile(manifestPath, 'utf8').catch(() => '{}'));
const manifest = {};
for (const name of (await readdir(directory)).sort()) {
  if (!/\.(webp|png|jpe?g)$/i.test(name)) continue;
  const buffer = await readFile(`${directory}/${name}`);
  const digest = createHash('sha256').update(buffer).digest('hex').slice(0, 12);
  const key = `/photo/${name}`;
  const metadata = await sharp(buffer).metadata();
  const candidates = [];
  for (const width of [400, 800, 1200, 1600].filter(width => width < metadata.width)) {
    const src = `/media/responsive/${digest}-${width}.webp`;
    const path = `public${src}`;
    const cached = previous[key]?.candidates?.some(candidate => candidate.src === src);
    if (!cached || !(await stat(path).catch(() => null))) {
      const resized = await sharp(buffer).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();
      if (resized.length >= buffer.length) continue;
      await writeFile(path, resized);
    }
    candidates.push({ src, width });
  }
  manifest[key] = { width: metadata.width, height: metadata.height, candidates };
}
await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
console.log(`Médias responsive : ${Object.keys(manifest).length} originaux, ${Object.values(manifest).reduce((sum, image) => sum + image.candidates.length, 0)} déclinaisons.`);

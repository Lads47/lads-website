import { readdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join } from 'node:path';

const revision = process.env.GITHUB_SHA;
const run = `${process.env.GITHUB_RUN_ID}-${process.env.GITHUB_RUN_ATTEMPT}`;
if (!/^[0-9a-f]{40}$/.test(revision || '') || !/^\d{1,20}-\d{1,4}$/.test(run)) {
  throw new Error('Commit et exécution GitHub requis');
}
const files = {};
async function inventory(directory, prefix = '') {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const relative = prefix + entry.name;
    if (relative === 'release.json') continue;
    if (entry.isDirectory()) await inventory(join(directory, entry.name), relative + '/');
    else if (entry.isFile()) files[relative] = createHash('sha256').update(await readFile(join(directory, entry.name))).digest('hex');
    else throw new Error(`Ressource non régulière : ${relative}`);
  }
}
await inventory('dist');
await writeFile('dist/release.json', JSON.stringify({ revision, run, files }) + '\n');
console.log(`Version ${revision}, exécution ${run} : ${Object.keys(files).length} fichiers inventoriés`);

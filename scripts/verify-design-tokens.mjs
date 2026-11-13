import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import postcss from 'postcss';
import { document, all, attr } from './html-tools.mjs';

async function files(directory) {
  return (await Promise.all((await readdir(directory, { withFileTypes: true })).map((entry) =>
    entry.isDirectory() ? files(`${directory}/${entry.name}`) : [`${directory}/${entry.name}`]
  ))).flat();
}

const media = JSON.parse(await readFile('src/styles/media-tokens.json', 'utf8'));
const failures = [], counts = {};
const definitions = new Set(), references = new Set();
let declarations = 0;
function check(css, path) {
  const root = postcss.parse(css, { from: path });
  root.walkDecls((declaration) => {
    declarations++;
    const name = declaration.prop;
    if (name.startsWith('--') && (
      /(?:^|-)\d+(?:-\d+)*(?:rem|em|px|fr|vh|vw|ms|deg|ch|cqi|s)$/.test(name) ||
      /^--(?:size|number|weight|percentage|opacity|layer|duration|angle)-(?:minus-)?(?:\d|zero$|one$|two$|full$)/.test(name)
    )) failures.push(path + ' : variable nommée par sa valeur ' + name);
    if (name === 'font-size' && path.includes('/content/') && !/^(?:var\(|inherit$)/.test(declaration.value)) {
      failures.push(path + ' : utiliser une taille de texte Lumos');
    }
  });
  root.walkAtRules((rule) => {
    if (!['media', 'container'].includes(rule.name)) return;
    if (!(rule.params.slice(1, -1) in media)) failures.push(`${path}: condition sans token ${rule.params}`);
  });
}

for (const path of await files('src')) {
  if (!/\.(astro|css|ts)$/.test(path)) continue;
  const source = await readFile(path, 'utf8');
  for (const match of source.matchAll(/(--[\w-]+)\s*:/g)) definitions.add(match[1]);
  for (const match of source.matchAll(/var\((--[\w-]+)/g)) references.add(match[1]);
  assert.ok(!source.includes('--at-'), `Ancien préfixe couleur : ${path}`);
  assert.ok(!source.includes('source-reset'), `Ancien reset : ${path}`);
  if (path.endsWith('.css')) check(source, path);
  if (path.endsWith('.astro')) {
    for (const style of source.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)) check(style[1], path);
    if (path.startsWith('src/components/content/')) {
      for (const tag of source.matchAll(/<(Section|Grid|Card|ContentWrapper|Heading|Paragraph|Eyebrow|Img|Video|Button)\b/g)) {
        counts[tag[1]] = (counts[tag[1]] || 0) + 1;
      }
      assert.ok(!/variant="inherit"/.test(source), `Typographie Lumos neutralisée : ${path}`);
    }
  }
}
const routes = JSON.parse(await readFile('tests/fixtures/routes.json', 'utf8'));
for (const reference of references) {
  if (reference.endsWith('-') || ['--font-inter', '--result-progress'].includes(reference)) continue;
  assert.ok(definitions.has(reference), `Token sans définition : ${reference}`);
}
for (const route of routes) {
  const tree = document(await readFile('dist/' + route.file, 'utf8'));
  for (const node of all(tree, (node) => !!attr(node, 'style'))) {
    check(attr(node, 'style'), route.file);
  }
  if (route.kind !== 'redirect') assert.ok(all(tree, (node) =>
    (attr(node, 'class') || '').split(' ').includes('section')).length, `Section Lumos absente : ${route.route}`);
}
assert.deepEqual(failures, [], 'Contrat de styles Lumos');
assert.ok(counts.Section > 80 && counts.Grid > 60 && counts.Card > 50, 'Migration native Lumos incomplète');
console.log(`OK : ${declarations} déclarations contrôlées, rôles Lumos et noms de variables vérifiés ; ${JSON.stringify(counts)}.`);

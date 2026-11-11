import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import postcss from 'postcss';
import { document, all, attr } from './html-tools.mjs';

async function files(directory) {
  return (await Promise.all((await readdir(directory, { withFileTypes: true })).map((entry) =>
    entry.isDirectory() ? files(`${directory}/${entry.name}`) : [`${directory}/${entry.name}`]
  ))).flat();
}

// Ignore references and asset URLs, retaining literals in the actual CSS value.
function withoutReferences(value) {
  let result = '';
  for (let i = 0; i < value.length;) {
    const reference = /^(?:var|url)\(/.exec(value.slice(i));
    if (!reference) { result += value[i++]; continue; }
    let depth = 1;
    i += reference[0].length;
    while (i < value.length && depth) {
      if (value[i] === '(') depth++;
      if (value[i] === ')') depth--;
      i++;
    }
  }
  return result.replace(/(['"])[\s\S]*?\1/g, '');
}

const media = JSON.parse(await readFile('src/styles/media-tokens.json', 'utf8'));
const failures = [], counts = {};
const definitions = new Set(), references = new Set();
let declarations = 0;
function check(css, path, tokenDefinitions = false) {
  const root = postcss.parse(css, { from: path });
  root.walkDecls((declaration) => {
    let parent = declaration.parent;
    while (parent) {
      // Font registration describes the asset's weights, not a visual style.
      if (parent.type === 'atrule' && parent.name === 'font-face') return;
      parent = parent.parent;
    }
    if (declaration.prop.startsWith('--') && tokenDefinitions) return;
    declarations++;
    const literal = withoutReferences(declaration.value);
    if (/(?:#[\da-f]{3,8}\b|\b(?:rgba?|hsla?)\(|\b(?:black|white|transparent)\b|(?<![\w-])[-+]?(?:\d*\.\d+|\d+))/i.test(literal)) {
      failures.push(`${path}: ${declaration.prop}: ${declaration.value}`);
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
  if (path.endsWith('.css')) check(source, path, /^src\/styles\/(base|brand|tokens)\.css$/.test(path));
  if (path.endsWith('.astro')) {
    for (const style of source.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)) check(style[1], path);
    if (path.startsWith('src/components/content/')) {
      for (const tag of source.matchAll(/<(Section|Grid|Card|ContentWrapper|Heading|Paragraph|Eyebrow|Img|Video|Button)\b/g)) {
        counts[tag[1]] = (counts[tag[1]] || 0) + 1;
      }
      assert.ok(!/variant="inherit"/.test(source), `Typographie Lumos neutralisée : ${path}`);
      assert.ok(!/tracks="(?!var\()[^"]*\d/.test(source), `Pistes sans token : ${path}`);
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
    // Props such as column counts and line lengths define local Lumos tokens.
    const css = postcss.parse(attr(node, 'style'));
    css.walkDecls((decl) => { if (!decl.prop.startsWith('--')) check(decl.toString(), route.file); });
  }
  if (route.kind !== 'redirect') assert.ok(all(tree, (node) =>
    (attr(node, 'class') || '').split(' ').includes('section')).length, `Section Lumos absente : ${route.route}`);
}
assert.deepEqual(failures, [], 'Valeurs de design hors tokens');
assert.ok(counts.Section > 80 && counts.Grid > 60 && counts.Card > 50, 'Migration native Lumos incomplète');
console.log(`OK : ${declarations} déclarations contrôlées, aucun littéral de design hors tokens ; ${JSON.stringify(counts)}.`);

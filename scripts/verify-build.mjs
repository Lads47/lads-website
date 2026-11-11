import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { Script } from 'node:vm';
import { document, contentText, hash, metadata, all, attr } from './html-tools.mjs';

const routes = JSON.parse(await readFile('tests/fixtures/routes.json', 'utf8'));
const baseline = JSON.parse(await readFile('tests/fixtures/source.json', 'utf8'));
const backgrounds = JSON.parse(await readFile('tests/fixtures/backgrounds.json', 'utf8'));
let links = 0, scripts = 0;
const idsByPath = new Map();
for (const route of routes) {
  const tree = document(await readFile('dist/'+route.file, 'utf8'));
  idsByPath.set(route.route, new Set(all(tree, (n) => !!attr(n, 'id')).map((n) => attr(n, 'id'))));
}
for (const route of routes) {
  const html = await readFile('dist/'+route.file, 'utf8');
  const tree = document(html);
  assert.ok(!all(tree, (n) => !!attr(n, 'src')).some((n) => /amazonaws\.com/.test(attr(n, 'src'))), `Dépendance S3 : ${route.route}`);
  assert.equal(hash(contentText(tree)), baseline[route.route].textHash, `Texte modifié : ${route.route}`);
  assert.deepEqual(metadata(tree), baseline[route.route].metadata, `Métadonnées modifiées : ${route.route}`);
  const structuredData = all(tree, (n) => n.tagName === 'script' && attr(n, 'type') === 'application/ld+json').map((n) => JSON.parse(n.childNodes.map((c) => c.value || '').join('')));
  assert.deepEqual(structuredData, baseline[route.route].structuredData, `Données structurées modifiées : ${route.route}`);
  const ids = all(tree, (n) => !!attr(n, 'id')).map((n) => attr(n, 'id'));
  assert.equal(new Set(ids).size, ids.length, `ID dupliqué : ${route.route}`);
  for (const node of all(tree, (n) => n.tagName === 'script' && !attr(n, 'src') && !['application/ld+json', 'module'].includes(attr(n, 'type')))) {
    new Script(node.childNodes.map((n) => n.value || '').join(''), { filename: route.file }); scripts++;
  }
  const bodyImages = all(tree, (n) => n.tagName === 'main')[0];
  const images = all(bodyImages, (n) => n.tagName === 'img' && attr(n, 'src')).map((n) => [new URL(attr(n, 'src'), 'https://lesateliersdustream.fr'+route.route).pathname, attr(n, 'alt') || '']);
  for (const background of backgrounds[route.route]) {
    assert.ok(images.some(([src]) => decodeURIComponent(src) === decodeURIComponent(background)), `Photo de fond perdue : ${route.route} ${background}`);
  }
  let expectedImage = 0;
  for (const image of images) {
    const expected = baseline[route.route].images[expectedImage];
    if (expected && image[0] === expected[0] && image[1] === expected[1]) expectedImage++;
    else assert.equal(image[1], '', `Image ou texte alternatif inattendu : ${route.route} ${JSON.stringify(image)}`);
  }
  assert.equal(expectedImage, baseline[route.route].images.length, `Image source absente ou déplacée : ${route.route}`);
  for (const node of all(tree, (n) => ['a', 'img', 'script', 'link', 'source', 'iframe'].includes(n.tagName))) {
    const ref = attr(node, node.tagName === 'a' || node.tagName === 'link' ? 'href' : 'src');
    if (!ref || /^(?:https?:|mailto:|tel:|data:)/.test(ref)) continue;
    const url = new URL(ref, 'https://lesateliersdustream.fr'+route.route);
    const pathname = decodeURIComponent(url.pathname);
    const file = 'dist'+(pathname === '/' ? '/index.html' : /\.[a-z0-9]+$/i.test(pathname) ? pathname : pathname+'.html');
    assert.ok((await stat(resolve(file)).catch(() => null))?.isFile(), `Lien introuvable ${route.route} -> ${ref}`);
    if (url.hash) assert.ok(idsByPath.get(pathname)?.has(decodeURIComponent(url.hash.slice(1))), `Ancre introuvable ${route.route} -> ${ref}`);
    links++;
  }
}
const sitemap = await readFile('dist/sitemap.xml', 'utf8');
for (const route of routes.filter((r) => r.kind === 'content')) assert.ok(sitemap.includes(`<loc>${route.canonical}</loc>`), `URL absente du sitemap : ${route.route}`);
console.log(`OK : ${routes.length} routes, textes et métadonnées identiques, images préservées, ${links} liens locaux, ${scripts} scripts inline valides.`);

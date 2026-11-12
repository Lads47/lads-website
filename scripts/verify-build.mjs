import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { Script } from 'node:vm';
import { document, contentText, hash, metadata, all, attr, normalized } from './html-tools.mjs';

const routes = JSON.parse(await readFile('tests/fixtures/routes.json', 'utf8'));
const baseline = JSON.parse(await readFile('tests/fixtures/source.json', 'utf8'));
const backgrounds = JSON.parse(await readFile('tests/fixtures/backgrounds.json', 'utf8'));
// Explicitly approved UI additions and reordered, otherwise unchanged text fragments.
const refinements = JSON.parse(await readFile('tests/fixtures/approved-local-refinements.json', 'utf8'));
function preservedFragments(node) {
  if (['script', 'style'].includes(node.tagName) || attr(node, 'data-review-addition')) return [];
  if (node.nodeName === '#text') return normalized(node.value) ? [normalized(node.value)] : [];
  return (node.childNodes || []).flatMap(preservedFragments);
}
// These source images now render inline through the Lumos Icon component.
const inlineIcons = new Map();
for (const file of ['noun-email-5456693', 'noun-call-5456677', 'noun-location-4693998']) {
  const source = document(await readFile(`public/images/${file}.svg`, 'utf8'));
  const svg = all(source, (node) => node.tagName === 'svg')[0];
  inlineIcons.set(attr(svg, 'viewBox'), {
    path: `/images/${file}.svg`,
    shapes: all(svg, (node) => node.tagName === 'path').map((node) => attr(node, 'd')),
  });
}
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
  const additions = all(tree, node => !!attr(node, 'data-review-addition'));
  for (const addition of additions) {
    const kind = attr(addition, 'data-review-addition');
    const links = all(addition, node => node.tagName === 'a').map(node => [attr(node, 'href'), normalized(preservedFragments(node).join(' '))]);
    assert.equal(normalized((addition.childNodes || []).flatMap(preservedFragments).join(' ')), links.map(link => link[1]).join(' '), `Texte ajouté non approuvé : ${route.route}`);
    if (route.route === '/' && kind === 'home-actions') {
      assert.deepEqual(links, [['#possibilites', 'Nos solutions'], ['#contact', 'Nous contacter']]);
    } else if (['/formations/ia', '/formations/vmix'].includes(route.route) && kind === 'training-session-access') {
      assert.deepEqual(links, [['#formation-sessions', 'Prochaines sessions']]);
    } else assert.fail(`Ajout non approuvé : ${route.route} ${kind}`);
  }
  if (refinements[route.route]) {
    const main = all(tree, node => node.tagName === 'main')[0];
    assert.equal(hash(preservedFragments(main).sort().join('\n')), refinements[route.route].fragmentHash, `Fragment de texte modifié : ${route.route}`);
  } else assert.equal(hash(contentText(tree)), baseline[route.route].textHash, `Texte modifié : ${route.route}`);
  assert.deepEqual(metadata(tree), baseline[route.route].metadata, `Métadonnées modifiées : ${route.route}`);
  const structuredData = all(tree, (n) => n.tagName === 'script' && attr(n, 'type') === 'application/ld+json').map((n) => JSON.parse(n.childNodes.map((c) => c.value || '').join('')));
  assert.deepEqual(structuredData, baseline[route.route].structuredData, `Données structurées modifiées : ${route.route}`);
  const ids = all(tree, (n) => !!attr(n, 'id')).map((n) => attr(n, 'id'));
  assert.equal(new Set(ids).size, ids.length, `ID dupliqué : ${route.route}`);
  if (route.kind !== 'redirect') {
    const headings = all(tree, node => /^h[1-6]$/.test(node.tagName || ''));
    assert.equal(headings.filter(node => node.tagName === 'h1').length, 1, `Titre principal : ${route.route}`);
    let previousLevel = 0;
    for (const heading of headings) {
      const level = Number(heading.tagName.slice(1));
      assert.ok(level <= previousLevel + 1, `Niveau de titre sauté : ${route.route} h${previousLevel} -> h${level}`);
      previousLevel = level;
    }
  }
  for (const node of all(tree, (n) => n.tagName === 'script' && !attr(n, 'src') && !['application/ld+json', 'module'].includes(attr(n, 'type')))) {
    new Script(node.childNodes.map((n) => n.value || '').join(''), { filename: route.file }); scripts++;
  }
  const bodyImages = all(tree, (n) => n.tagName === 'main')[0];
  const images = all(bodyImages, (n) => n.tagName === 'img' && attr(n, 'src') || n.tagName === 'svg' && attr(n, 'role') === 'img').map((node) => {
    if (node.tagName === 'img') return [new URL(attr(node, 'src'), 'https://lesateliersdustream.fr'+route.route).pathname, attr(node, 'alt') || ''];
    const icon = inlineIcons.get(attr(node, 'viewBox'));
    assert.ok(icon, `Icône inline inconnue : ${route.route}`);
    assert.deepEqual(all(node, (shape) => shape.tagName === 'path').map((shape) => attr(shape, 'd')), icon.shapes, `Tracé de l'icône modifié : ${route.route}`);
    return [icon.path, attr(node, 'aria-label') || ''];
  });
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
  for (const node of all(tree, (n) => ['a', 'img', 'script', 'link', 'source', 'iframe', 'video', 'track'].includes(n.tagName))) {
    const ref = attr(node, node.tagName === 'a' || node.tagName === 'link' ? 'href' : node.tagName === 'video' ? 'poster' : 'src');
    if (!ref || /^(?:https?:|mailto:|tel:|data:)/.test(ref)) continue;
    const url = new URL(ref, 'https://lesateliersdustream.fr'+route.route);
    const pathname = decodeURIComponent(url.pathname);
    const file = 'dist'+(pathname === '/' ? '/index.html' : /\.[a-z0-9]+$/i.test(pathname) ? pathname : pathname+'.html');
    assert.ok((await stat(resolve(file)).catch(() => null))?.isFile(), `Lien introuvable ${route.route} -> ${ref}`);
    if (url.hash) assert.ok(idsByPath.get(pathname)?.has(decodeURIComponent(url.hash.slice(1))), `Ancre introuvable ${route.route} -> ${ref}`);
    links++;
  }
  for (const image of all(tree, node => node.tagName === 'img' && attr(node, 'srcset'))) {
    for (const candidate of attr(image, 'srcset').split(/,\s*/)) {
      const path = candidate.replace(/\s+\d+w$/, '');
      assert.ok((await stat(`dist${decodeURIComponent(path)}`).catch(() => null))?.isFile(), `Image responsive introuvable : ${path}`);
    }
  }
}
const sitemap = await readFile('dist/sitemap.xml', 'utf8');
for (const route of routes.filter((r) => r.kind === 'content')) assert.ok(sitemap.includes(`<loc>${route.canonical}</loc>`), `URL absente du sitemap : ${route.route}`);
console.log(`OK : ${routes.length} routes, textes conservés et métadonnées identiques, images préservées, ${links} liens locaux, ${scripts} scripts inline valides.`);

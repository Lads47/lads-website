import { parse } from 'parse5';
import { createHash } from 'node:crypto';

export const attr = (node, name) => node.attrs?.find((item) => item.name === name)?.value;
export const hasClass = (node, name) => (attr(node, 'class') || '').split(/\s+/).includes(name);
export function all(node, predicate) {
  return [...(predicate(node) ? [node] : []), ...(node.childNodes || []).flatMap((child) => all(child, predicate))];
}
export const document = (html) => parse(html);
export const normalized = (text) => text.replace(/\s+/g, ' ').trim();
export const hash = (text) => createHash('sha256').update(text).digest('hex');

export function contentText(tree) {
  const main = all(tree, (n) => n.tagName === 'main')[0] || all(tree, (n) => n.tagName === 'body')[0];
  const texts = [];
  function visit(node) {
    if (['script', 'style', 'footer'].includes(node.tagName) || ['header', 'footer', 'lightbox', 'photo-lightbox', 'backToTop'].includes(attr(node, 'id')) || hasClass(node, 'skip-link')) return;
    if (node.nodeName === '#text' && normalized(node.value)) texts.push(normalized(node.value));
    for (const child of node.childNodes || []) visit(child);
  }
  visit(main);
  return texts.join(' ');
}
export function metadata(tree) {
  return all(tree, (n) => n.tagName === 'title' || n.tagName === 'meta' && (attr(n, 'name') !== 'viewport' && !attr(n, 'charset')) || n.tagName === 'link' && attr(n, 'rel') === 'canonical')
    .map((n) => n.tagName === 'title' ? ['title', n.childNodes.map((c) => c.value || '').join('')] : [attr(n, 'name') || attr(n, 'property') || attr(n, 'http-equiv') || attr(n, 'rel'), (attr(n, 'content') || attr(n, 'href') || '').replace('url=https://lesateliersdustream.fr/', 'url=/')]);
}

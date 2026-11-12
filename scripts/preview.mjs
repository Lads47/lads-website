import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
const option = (name, fallback) => args.includes(name) ? args[args.indexOf(name) + 1] : fallback;
const project = fileURLToPath(new URL('../', import.meta.url));
const root = resolve(project, option('--root', 'dist'));
const port = Number(option('--port', process.env.PORT || '4321'));
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.xml': 'application/xml', '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.avif': 'image/avif', '.ico': 'image/x-icon', '.pdf': 'application/pdf', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8', '.mp4': 'video/mp4' };
types['.vtt'] = 'text/vtt; charset=utf-8';
const exists = async (file) => { try { return (await stat(file)).isFile(); } catch { return false; } };

const server = createServer(async (req, res) => {
  if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405); res.end(); return; }
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch { res.writeHead(400); res.end(); return; }
  if (pathname.split('/').some((part) => part.startsWith('.') || part.includes('\\')) || pathname.includes('\0')) {
    res.writeHead(404); res.end(); return;
  }
  if (pathname.endsWith('.html')) {
    res.writeHead(301, { Location: pathname.slice(0, -5) + new URL(req.url, 'http://localhost').search }); res.end(); return;
  }
  const requested = resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
  if (!requested.startsWith(root + sep)) { res.writeHead(404); res.end(); return; }
  let file = requested;
  if (!extname(pathname) && pathname !== '/' && !pathname.endsWith('/')) file += '.html';
  let status = 200;
  if (!(await exists(file))) { status = 404; file = resolve(root, '404.html'); }
  if (!(await exists(file))) { res.writeHead(404); res.end(); return; }
  const size = (await stat(file)).size;
  let start = 0, end = size - 1;
  const headers = { 'Content-Type': types[extname(file)] || 'application/octet-stream', 'Content-Length': size, 'Cache-Control': 'no-store' };
  if (extname(file) === '.mp4') {
    headers['Accept-Ranges'] = 'bytes';
    if (req.headers.range) {
      const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
      if (range && (range[1] || range[2])) {
        start = range[1] ? Number(range[1]) : Math.max(0, size - Number(range[2]));
        end = range[1] && range[2] ? Math.min(Number(range[2]), size - 1) : size - 1;
      }
      if (!range || (!range[1] && !range[2]) || start > end || start >= size || (!range[1] && Number(range[2]) === 0)) {
        res.writeHead(416, { 'Content-Range': `bytes */${size}` }); res.end(); return;
      }
      status = 206;
      headers['Content-Range'] = `bytes ${start}-${end}/${size}`;
      headers['Content-Length'] = end - start + 1;
    }
  }
  res.writeHead(status, headers);
  if (req.method === 'HEAD') res.end(); else createReadStream(file, { start, end }).pipe(res);
});
server.listen(port, '127.0.0.1', () => console.log(`Prévisualisation locale : http://127.0.0.1:${port} (${root})`));
process.on('SIGINT', () => server.close());
process.on('SIGTERM', () => server.close());

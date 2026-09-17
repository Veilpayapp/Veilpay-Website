// Dev utility: serve the built dist/ with the production CSP header applied,
// so the Content-Security-Policy from vercel.json can be smoke-tested locally
// before deploying. Mirrors the exact header value used in production.
//
// Usage: node scripts/serve-dist-with-csp.mjs [port]
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, extname, normalize } from 'node:path';

const ROOT = join(import.meta.dirname, '..', 'dist');
const PORT = Number(process.argv[2] || 4174);

const CSP = [
  "default-src 'self'",
  "script-src 'self' https://veilpay.blogspot.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob:",
  "connect-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  'upgrade-insecure-requests',
].join('; ');

const MIME = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.xml': 'application/xml',
  '.txt': 'text/plain',
  '.ico': 'image/x-icon',
};

const server = createServer((req, res) => {
  const url = new URL(req.url ?? '/', `http://${req.headers.host}`);
  let pathname = decodeURIComponent(url.pathname);
  if (pathname.endsWith('/')) pathname += 'index.html';

  const filePath = normalize(join(ROOT, pathname));
  if (!filePath.startsWith(ROOT) || !existsSync(filePath) || statSync(filePath).isDirectory()) {
    // SPA fallback for client-side routes.
    const index = join(ROOT, 'index.html');
    if (existsSync(index)) {
      res.writeHead(200, { 'Content-Type': 'text/html', 'Content-Security-Policy': CSP });
      res.end(readFileSync(index));
      return;
    }
    res.writeHead(404, { 'Content-Security-Policy': CSP });
    res.end('Not found');
    return;
  }

  res.writeHead(200, {
    'Content-Type': MIME[extname(filePath)] ?? 'application/octet-stream',
    'Content-Security-Policy': CSP,
  });
  res.end(readFileSync(filePath));
});

server.listen(PORT, () => {
  console.log(`Serving ${ROOT} with CSP on http://localhost:${PORT}`);
  console.log(`CSP: ${CSP}`);
});

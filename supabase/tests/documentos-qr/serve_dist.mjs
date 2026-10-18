// Netlify emulator for local validation: serves a built `dist` applying the REAL redirect rules
// (netlify.toml, then public/_redirects as fallback) and the REAL headers of netlify.toml, so that
// direct opening and reload of /d/<slug> and the site's CSP are exercised exactly as configured.
// Usage: node serve_dist.mjs <distDir> <port> [extraConnectOrigin]
//   extraConnectOrigin (e.g. http://127.0.0.1:54421) is APPENDED to connect-src and img-src only
//   so the page can talk to the local Supabase stack; production keeps https://*.supabase.co.
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../../..');
const [distArg, portArg, extra] = process.argv.slice(2);
const dist = path.resolve(distArg ?? 'dist');
const port = Number(portArg ?? 4180);

const toml = fs.readFileSync(path.join(root, 'netlify.toml'), 'utf8');
const redirects = toml.split('[[redirects]]').slice(1).map((b) => ({
  from: /from\s*=\s*"([^"]+)"/.exec(b)?.[1], to: /to\s*=\s*"([^"]+)"/.exec(b)?.[1], status: Number(/status\s*=\s*(\d+)/.exec(b)?.[1] ?? 301),
}));
const headerBlocks = toml.split('[[headers]]').slice(1).map((b) => ({
  for: /for\s*=\s*"([^"]+)"/.exec(b)?.[1],
  values: Object.fromEntries([...b.matchAll(/^\s{4}([A-Za-z-]+)\s*=\s*"((?:[^"\\]|\\.)*)"/gm)].map((m) => [m[1], m[2].replace(/\\"/g, '"')])),
}));
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json', '.woff2': 'font/woff2', '.woff': 'font/woff', '.png': 'image/png', '.ico': 'image/x-icon' };
const match = (r, url) => (r.from.endsWith('/*') ? url.startsWith(r.from.slice(0, -1)) || url === r.from.slice(0, -2) : r.from === url);

http.createServer((req, res) => {
  const url = new URL(req.url, 'http://x').pathname;
  let file = path.join(dist, url);
  let status = 200;
  const direct = file.startsWith(dist) && fs.existsSync(file) && fs.statSync(file).isFile();
  if (!direct) {
    const rule = redirects.find((r) => match(r, url));
    file = path.join(dist, rule?.to ?? '/index.html');
    status = rule?.status ?? 200;
    console.log(`[rewrite] ${url} -> ${rule?.to ?? '/index.html'} (${status})`);
  }
  const headers = { 'Content-Type': types[path.extname(file)] ?? 'application/octet-stream' };
  for (const hb of headerBlocks.filter((h) => h.for === '/*' || url.startsWith(h.for.replace('*', '')))) {
    for (const [k, v] of Object.entries(hb.values)) {
      headers[k] = extra && k === 'Content-Security-Policy'
        ? v.replace('connect-src', `connect-src ${extra}`).replace('img-src', `img-src ${extra}`)
        : v;
    }
  }
  if (!fs.existsSync(file)) { res.writeHead(404); res.end('not found'); return; }
  res.writeHead(status, headers);
  fs.createReadStream(file).pipe(res);
}).listen(port, () => console.log(`serving ${dist} on http://127.0.0.1:${port}`));

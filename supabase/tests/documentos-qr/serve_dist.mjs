// Netlify emulator for local validation. Serves a built site applying ITS REAL rules:
//   · ADMIN site  (default)      : redirects + headers of the root netlify.toml
//   · PUBLIC site (--site public): redirects/headers of the `_redirects` / `_headers` files inside dist
//     (copied from apps/public/static), unknown routes -> 404.html with a real 404 status.
// Usage: node serve_dist.mjs <distDir> <port> [extraConnectOrigin] [--site public]
//   extraConnectOrigin (e.g. http://127.0.0.1:54421) is APPENDED to connect-src and img-src only, so the
//   page can talk to the local Supabase stack; production keeps its own origin.
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../../..');
const args = process.argv.slice(2);
const publicSite = args.includes('--site') && args[args.indexOf('--site') + 1] === 'public';
const positional = args.filter((a, i) => a !== '--site' && args[i - 1] !== '--site');
const [distArg, portArg, extra] = positional;
const dist = path.resolve(distArg ?? 'dist');
const port = Number(portArg ?? 4180);

let redirects;
let headerBlocks;
if (publicSite) {
  redirects = fs.readFileSync(path.join(dist, '_redirects'), 'utf8').split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !l.startsWith('#'))
    .map((l) => { const [from, to, status] = l.split(/\s+/); return { from, to, status: Number(status ?? 301) }; });
  headerBlocks = [];
  let cur = null;
  for (const line of fs.readFileSync(path.join(dist, '_headers'), 'utf8').split(/\r?\n/)) {
    if (!line.trim()) continue;
    if (!/^\s/.test(line)) { cur = { for: line.trim(), values: {} }; headerBlocks.push(cur); } else {
      const i = line.indexOf(':');
      cur.values[line.slice(0, i).trim()] = line.slice(i + 1).trim();
    }
  }
} else {
  const toml = fs.readFileSync(path.join(root, 'netlify.toml'), 'utf8');
  redirects = toml.split('[[redirects]]').slice(1).map((b) => ({
    from: /from\s*=\s*"([^"]+)"/.exec(b)?.[1], to: /to\s*=\s*"([^"]+)"/.exec(b)?.[1], status: Number(/status\s*=\s*(\d+)/.exec(b)?.[1] ?? 301),
  }));
  // Netlify procesa primero el archivo _redirects del dist y luego netlify.toml.
  const fileRulesPath = path.join(dist, '_redirects');
  if (fs.existsSync(fileRulesPath)) {
    const fileRules = fs.readFileSync(fileRulesPath, 'utf8').split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !l.startsWith('#'))
      .map((l) => { const [from, to, status] = l.split(/\s+/); return { from, to, status: Number(status ?? 301) }; });
    redirects = [...fileRules, ...redirects];
  }
  headerBlocks = toml.split('[[headers]]').slice(1).map((b) => ({
    for: /for\s*=\s*"([^"]+)"/.exec(b)?.[1],
    values: Object.fromEntries([...b.matchAll(/^\s{4}([A-Za-z-]+)\s*=\s*"((?:[^"\\]|\\.)*)"/gm)].map((m) => [m[1], m[2].replace(/\\"/g, '"')])),
  }));
}
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json', '.woff2': 'font/woff2', '.woff': 'font/woff', '.png': 'image/png', '.ico': 'image/x-icon', '.txt': 'text/plain' };
const match = (r, url) => (r.from.endsWith('/*') ? url.startsWith(r.from.slice(0, -1)) || url === r.from.slice(0, -2) : r.from.replace(/\/$/, '') === url.replace(/\/$/, ''));
const headerMatch = (pattern, url) => pattern === '/*' || (pattern.endsWith('/*') ? url.startsWith(pattern.slice(0, -1)) : pattern === url);

http.createServer((req, res) => {
  const url = new URL(req.url, 'http://x').pathname;
  let file = path.join(dist, url.endsWith('/') ? `${url}index.html` : url); // Netlify sirve index.html en directorios
  let status = 200;
  const direct = file.startsWith(dist) && fs.existsSync(file) && fs.statSync(file).isFile() && !['/_redirects', '/_headers'].includes(url);
  if (!direct) {
    const rule = redirects.find((r) => match(r, url));
    if (rule) { file = path.join(dist, rule.to); status = rule.status; } else if (publicSite) { file = path.join(dist, '404.html'); status = 404; } else { file = path.join(dist, '/index.html'); }
    console.log(`[${rule ? 'rewrite' : publicSite ? '404' : 'fallback'}] ${url} -> ${path.relative(dist, file)} (${status})`);
  }
  const headers = { 'Content-Type': types[path.extname(file)] ?? 'application/octet-stream' };
  for (const hb of headerBlocks.filter((h) => headerMatch(h.for, url))) {
    for (const [k, v] of Object.entries(hb.values)) {
      headers[k] = extra && k === 'Content-Security-Policy'
        ? v.replace('connect-src', `connect-src ${extra}`).replace('img-src', `img-src ${extra}`)
        : v;
    }
  }
  if (!fs.existsSync(file)) { res.writeHead(404); res.end('not found'); return; }
  res.writeHead(status, headers);
  fs.createReadStream(file).pipe(res);
}).listen(port, () => console.log(`serving ${dist} (${publicSite ? 'public' : 'admin'} site rules) on http://127.0.0.1:${port}`));

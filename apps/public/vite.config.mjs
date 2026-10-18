// Vite config of the PUBLIC portal (second Netlify site). Independent artifact: apps/public/dist.
// Root vite.config.js (admin SOI) is untouched. Per-site variables live in apps/public/.env* or in the
// Netlify UI of the public site (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_INSTITUTIONAL_URL).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));

/** Records every source module that ends up in the bundle so scripts/verify-public-bundle.mjs can audit it. */
const recordModules = {
  name: 'record-bundled-modules',
  closeBundle() {},
  generateBundle(_, bundle) {
    const modules = new Set();
    for (const chunk of Object.values(bundle)) {
      if (chunk.type === 'chunk') Object.keys(chunk.modules).forEach((m) => modules.add(m.split('\\').join('/')));
    }
    fs.mkdirSync(path.join(here, 'dist-meta'), { recursive: true });
    fs.writeFileSync(path.join(here, 'dist-meta/bundle-modules.json'), JSON.stringify([...modules].sort(), null, 2));
  },
};

export default {
  root: here,
  envDir: here,
  base: '/',
  publicDir: path.join(here, 'static'),
  plugins: [recordModules],
  server: { host: '127.0.0.1', port: 5180, strictPort: true, fs: { allow: [path.resolve(here, '../..')] } },
  build: {
    outDir: path.join(here, 'dist'),
    emptyOutDir: true,
    sourcemap: false,
    target: 'es2020',
    modulePreload: { polyfill: false },
    rollupOptions: {
      input: {
        index: path.join(here, 'index.html'),
        'qr-code': path.join(here, 'qr-code.html'),
        d: path.join(here, 'd.html'),
        404: path.join(here, '404.html'),
      },
    },
  },
};

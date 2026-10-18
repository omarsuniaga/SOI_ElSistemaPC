// Dev server for the manual browser validation of the admin panel against the LOCAL stack.
// Serves only this folder's harness (no CSP header, no app shell). Local only.
//   VITE_SUPABASE_URL=http://127.0.0.1:54421 VITE_SUPABASE_ANON_KEY=<local anon> \
//   VITE_PUBLIC_BASE_URL=http://127.0.0.1:4180 npx vite --config supabase/tests/documentos-qr/browser/vite.config.mjs
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
export default {
  root: here,
  server: { host: '127.0.0.1', port: 5190, strictPort: true, fs: { allow: [path.resolve(here, '../../../..')] } },
};

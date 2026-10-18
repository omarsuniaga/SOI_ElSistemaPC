// Audita el artefacto del portal público (apps/public/dist): debe contener SOLO lo necesario y nada del
// SOI administrativo. Se ejecuta tras `vite build` (npm run build:public) y falla el build si algo sobra.
//   1. Lista exacta de archivos permitidos (sin sourcemaps, .env, sw.js, portales admin, signage…).
//   2. Módulos de código fuente empaquetados (registrados por el plugin de Vite): solo apps/public/src
//      y las utilidades puras compartidas de documentos-publicos/lib.
//   3. Texto del bundle: sin marcadores administrativos (rutas, RPC de escritura, auth, tablas internas).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.resolve(process.argv[2] ?? path.join(root, 'apps/public/dist'));
const metaFile = path.join(root, 'apps/public/dist-meta/bundle-modules.json');

const ALLOWED_FILES = [/^index\.html$/, /^qr-code\.html$/, /^d\.html$/, /^404\.html$/, /^_redirects$/, /^_headers$/, /^robots\.txt$/, /^assets\/[\w.-]+\.(js|css)$/];
const ALLOWED_MODULE_PREFIXES = [
  'apps/public/src/',
  'apps/public/index.html', 'apps/public/qr-code.html', 'apps/public/d.html', 'apps/public/404.html',
  'src/modules/documentos-publicos/lib/slug.js',
  'src/modules/documentos-publicos/lib/format.js',
  'src/modules/documentos-publicos/lib/categorias.js',
];
// Marcadores que jamás deben aparecer en el sitio público.
const FORBIDDEN_TEXT = [
  'adm.html', 'admin.html', 'acm.html', 'fin.html', 'luteria.html', 'inventario.html', 'simulador.html',
  'sb-soi-auth', 'signInWithPassword', 'gotrue', 'service_role', 'soi_security', 'es_admin',
  'crear_publicacion_documento', 'actualizar_publicacion_documento', 'cambiar_estado_publicacion',
  'registrar_version_documento', 'activar_version_documento', 'puede_gestionar_documentos_publicos',
  'publicaciones_documentos_versiones', 'publicaciones_documentos_eventos', 'profiles',
  'gestion-usuarios', 'admin-dashboard', 'permisos_maestros', 'portal-maestros', 'hermes', 'signage',
  'moduleCatalog', 'accessControl', 'AppModal', 'supabase-js', 'qrcode', 'VITE_DOCS_SERVER_VERIFY',
];

const problems = [];
const walk = (dir, base = '') => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
  e.isDirectory() ? walk(path.join(dir, e.name), `${base}${e.name}/`) : [`${base}${e.name}`]);

if (!fs.existsSync(dist)) { console.error(`✘ No existe ${dist}: ejecute primero vite build`); process.exit(1); }
const files = walk(dist);
for (const f of files) if (!ALLOWED_FILES.some((re) => re.test(f))) problems.push(`archivo no permitido en el artefacto público: ${f}`);
for (const need of ['index.html', 'qr-code.html', 'd.html', '404.html', '_redirects', '_headers']) if (!files.includes(need)) problems.push(`falta ${need}`);

if (fs.existsSync(metaFile)) {
  const modules = JSON.parse(fs.readFileSync(metaFile, 'utf8'));
  for (const m of modules) {
    const rel = m.replace(/^.*?(apps\/public\/|src\/)/, (x, g) => g).replace(/\?.*$/, '');
    if (m.includes('node_modules')) problems.push(`dependencia empaquetada inesperada: ${m.split('node_modules/').pop()}`);
    else if (!ALLOWED_MODULE_PREFIXES.some((p) => rel.startsWith(p)) && !m.startsWith('\u0000')) problems.push(`módulo fuente no permitido: ${rel}`);
  }
  console.log(`  módulos empaquetados: ${modules.length}`);
} else problems.push('falta apps/public/dist-meta/bundle-modules.json (build sin el plugin de registro)');

for (const f of files.filter((x) => /\.(js|css|html)$/.test(x))) {
  const text = fs.readFileSync(path.join(dist, f), 'utf8');
  for (const marker of FORBIDDEN_TEXT) if (text.includes(marker)) problems.push(`${f} contiene «${marker}»`);
}

const total = files.reduce((n, f) => n + fs.statSync(path.join(dist, f)).size, 0);
console.log(`  archivos: ${files.length} · tamaño total: ${(total / 1024).toFixed(1)} KB`);
if (problems.length) {
  console.error('✘ El artefacto público NO está aislado del SOI:');
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}
console.log('✔ Artefacto público aislado: solo páginas públicas, sin rutas, módulos ni código administrativo.');

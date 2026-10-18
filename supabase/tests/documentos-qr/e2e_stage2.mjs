// Stage 2 end-to-end against the LOCAL stack: Edge Function `registrar-version-documento` served by
// `supabase functions serve` + the staged migration applied. Local only (see e2e_storage.mjs).
import { createClient } from '@supabase/supabase-js';
import { randomBytes, randomUUID } from 'node:crypto';

const URL_ = process.env.SUPABASE_URL;
const ANON = process.env.SUPABASE_ANON_KEY;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!/^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(URL_ ?? '')) throw new Error('Refusing to run against a non-local URL');
const BUCKET = 'soi-publico';
let pass = 0;
let fail = 0;
const ok = (c, name, extra = '') => { if (c) pass++; else { fail++; console.log('  FAIL', name, extra); } };
const mk = (k) => createClient(URL_, k, { auth: { persistSession: false, autoRefreshToken: false } });
const svc = mk(SERVICE);
const sha = async (b) => [...new Uint8Array(await crypto.subtle.digest('SHA-256', b))].map((x) => x.toString(16).padStart(2, '0')).join('');

async function userClient(rol) {
  const email = `${rol}-${randomUUID().slice(0, 8)}@docqr.test`;
  const password = randomBytes(18).toString('base64url');
  const { data, error } = await svc.auth.admin.createUser({ email, password, email_confirm: true });
  if (error) throw error;
  await svc.from('profiles').insert({ id: data.user.id, rol, estado: 'activo', activo: true });
  const c = mk(ANON);
  const s = await c.auth.signInWithPassword({ email, password });
  if (s.error) throw s.error;
  return { c, token: s.data.session.access_token, id: data.user.id };
}
const admin = await userClient('admin');
const maestro = await userClient('maestro');

const call = (token, body) => fetch(`${URL_}/functions/v1/registrar-version-documento`, {
  method: 'POST', headers: { 'Content-Type': 'application/json', apikey: ANON, ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(body),
});
const PDF = new Uint8Array([...new TextEncoder().encode('%PDF-1.4\n'), ...randomBytes(400)]);
const EXE = new Uint8Array([0x4d, 0x5a, 0x90, 0, 3, 0, 0, 0, ...randomBytes(400)]);

const pub = (await admin.c.rpc('crear_publicacion_documento', { p_titulo: 'Etapa 2', p_descripcion: null, p_fecha: null, p_categoria: 'general' })).data;
const put = async (bytes, ext, mime) => {
  const path = `${pub.id}/${randomUUID()}.${ext}`;
  const up = await admin.c.storage.from(BUCKET).upload(path, bytes, { contentType: mime, upsert: false });
  if (up.error) throw up.error;
  return path;
};
const exists = async (path) => !(await svc.storage.from(BUCKET).download(path)).error;

console.log('A. direct RPC is closed, function is the only way');
const p0 = await put(PDF, 'pdf', 'application/pdf');
const direct = await admin.c.rpc('registrar_version_documento', { p_publicacion_id: pub.id, p_storage_path: p0, p_mime: 'application/pdf', p_size: PDF.length, p_sha256: await sha(PDF), p_nombre_original: 'x', p_motivo: null });
ok(direct.error?.code === '42501', 'admin cannot register via the direct RPC', direct.error?.message);

console.log('B. function authorisation');
const body = (path) => ({ publicacion_id: pub.id, storage_path: path, nombre_original: 'a.pdf', motivo: 'e2e' });
ok((await call(null, body(p0))).status === 401, 'no token -> 401');
ok((await call(maestro.token, body(p0))).status === 403, 'maestro -> 403');
ok((await call(admin.token, { ...body(p0), publicacion_id: randomUUID() })).status === 400, 'path/publication mismatch -> 400');
ok((await call(admin.token, { ...body(p0), storage_path: '../x.pdf' })).status === 400, 'malformed path -> 400');
ok((await call(admin.token, body(`${pub.id}/${randomUUID()}.pdf`))).status === 404, 'object that does not exist -> 404');

console.log('C. valid PDF is verified and registered');
const r1 = await call(admin.token, body(p0));
const j1 = await r1.json();
ok(r1.status === 200 && j1.version?.numero === 1, 'valid PDF registered', JSON.stringify(j1));
ok(j1.version?.sha256 === (await sha(PDF)), 'server-computed SHA-256 equals the real one');
ok(j1.version?.created_by === admin.id, 'actor recorded is the authenticated admin');
const ev = await admin.c.from('publicaciones_documentos_eventos').select('detalle').eq('publicacion_id', pub.id).eq('accion', 'nueva_version');
ok(ev.data?.[0]?.detalle?.verificada_en_servidor === true, 'audit marks server verification');

console.log('D. fake content is rejected and removed');
const pExe = await put(EXE, 'pdf', 'application/pdf');
ok(await exists(pExe), 'precondition: the fake object was accepted by Storage (the client-only gap)');
const r2 = await call(admin.token, body(pExe));
const j2 = await r2.json();
ok(r2.status === 422 && /no es PDF/.test(j2.error ?? ''), 'executable named .pdf -> 422', JSON.stringify(j2));
ok(!(await exists(pExe)), 'rejected object was deleted from the bucket');
const versions = await admin.c.from('publicaciones_documentos_versiones').select('numero').eq('publicacion_id', pub.id);
ok(versions.data?.length === 1, 'no version row was created for the fake file');
const pMis = await put(new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, ...randomBytes(50)]), 'pdf', 'application/pdf');
ok((await call(admin.token, body(pMis))).status === 422, 'PNG content under a .pdf path -> 422');

console.log('E. published flow still works for anonymous visitors');
await admin.c.rpc('cambiar_estado_publicacion_documento', { p_id: pub.id, p_estado: 'publicado' });
const anon = mk(ANON);
ok(!(await anon.storage.from(BUCKET).createSignedUrl(p0, 60)).error, 'anon signs the verified published object');

console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

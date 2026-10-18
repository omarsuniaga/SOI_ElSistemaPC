// End-to-end validation against a REAL Supabase stack (GoTrue + PostgREST + Storage API) that runs
// LOCALLY in Docker. Refuses to run against anything that is not localhost.
//
// Stack setup (never touches production):  see docs/specs/documentos-publicos-qr/VALIDACION_FUNCIONAL.md
// Usage: SUPABASE_URL=http://127.0.0.1:54421 SUPABASE_ANON_KEY=... SUPABASE_SERVICE_ROLE_KEY=... \
//        node supabase/tests/documentos-qr/e2e_storage.mjs
import { createClient } from '@supabase/supabase-js';
import { randomBytes, randomUUID } from 'node:crypto';

const URL_ = process.env.SUPABASE_URL;
const ANON = process.env.SUPABASE_ANON_KEY;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL_ || !ANON || !SERVICE) throw new Error('Set SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY');
if (!/^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(URL_)) throw new Error(`Refusing to run against non-local URL: ${URL_}`);

const BUCKET = 'soi-publico';
let pass = 0;
let fail = 0;
const ok = (c, name, extra = '') => {
  if (c) pass++;
  else { fail++; console.log('  FAIL', name, extra); }
};
const mk = (key) => createClient(URL_, key, { auth: { persistSession: false, autoRefreshToken: false } });
const svc = mk(SERVICE);
const anon = mk(ANON);

const PDF = (n = 600) => new Uint8Array([...new TextEncoder().encode('%PDF-1.4\n'), ...randomBytes(n)]);
const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, ...randomBytes(300)]);
const EXE = new Uint8Array([0x4d, 0x5a, 0x90, 0, 3, 0, 0, 0, ...randomBytes(300)]);
const sha = async (b) => [...new Uint8Array(await crypto.subtle.digest('SHA-256', b))].map((x) => x.toString(16).padStart(2, '0')).join('');

async function userClient(rol) {
  const email = `${rol}-${randomUUID().slice(0, 8)}@docqr.test`;
  const password = randomBytes(18).toString('base64url');
  const { data, error } = await svc.auth.admin.createUser({ email, password, email_confirm: true });
  if (error) throw error;
  const p = await svc.from('profiles').insert({ id: data.user.id, rol, estado: 'activo', activo: true });
  if (p.error) throw p.error;
  const c = mk(ANON);
  const s = await c.auth.signInWithPassword({ email, password });
  if (s.error) throw s.error;
  return { c, id: data.user.id };
}

const admin = await userClient('admin');
const superadmin = await userClient('superadmin');
const maestro = await userClient('maestro');
const alumno = await userClient('alumno');

const upload = (client, path, bytes, contentType) => client.storage.from(BUCKET).upload(path, bytes, { contentType, upsert: false });
const sign = (client, path, s = 60) => client.storage.from(BUCKET).createSignedUrl(path, s);
const register = (client, id, path, mime, bytes, hash) => client.rpc('registrar_version_documento', {
  p_publicacion_id: id, p_storage_path: path, p_mime: mime, p_size: bytes.length, p_sha256: hash, p_nombre_original: 'doc', p_motivo: null,
});
const state = (client, id, e) => client.rpc('cambiar_estado_publicacion_documento', { p_id: id, p_estado: e });

console.log('1. anonymous cannot administer');
ok((await anon.rpc('crear_publicacion_documento', { p_titulo: 'Intento anon', p_descripcion: null, p_fecha: null, p_categoria: 'general' })).error, 'anon cannot create');
ok((await maestro.c.rpc('crear_publicacion_documento', { p_titulo: 'Intento maestro', p_descripcion: null, p_fecha: null, p_categoria: 'general' })).error, 'maestro cannot create');
ok((await alumno.c.rpc('crear_publicacion_documento', { p_titulo: 'Intento alumno', p_descripcion: null, p_fecha: null, p_categoria: 'general' })).error, 'alumno cannot create');
ok((await anon.from('publicaciones_documentos').select('id')).error, 'anon cannot read tables');

console.log('2. admin creates, uploads, registers (draft)');
const created = await admin.c.rpc('crear_publicacion_documento', { p_titulo: 'Circular de prueba', p_descripcion: 'e2e', p_fecha: null, p_categoria: 'comunicado' });
ok(!created.error && created.data?.slug, 'admin creates publication', created.error?.message);
const pub = created.data;
const pdf1 = PDF();
const path1 = `${pub.id}/${randomUUID()}.pdf`;
ok(!(await upload(admin.c, path1, pdf1, 'application/pdf')).error, 'admin uploads PDF');
ok((await upload(admin.c, path1, pdf1, 'application/pdf')).error, 'same path cannot be overwritten (no upsert)');
ok((await upload(maestro.c, `${pub.id}/${randomUUID()}.pdf`, pdf1, 'application/pdf')).error, 'maestro cannot upload');
ok((await upload(anon, `${pub.id}/${randomUUID()}.pdf`, pdf1, 'application/pdf')).error, 'anon cannot upload');
ok((await upload(admin.c, `${pub.id}/${randomUUID()}.html`, new TextEncoder().encode('<script>1</script>'), 'text/html')).error, 'html rejected (path policy and bucket MIME)');
ok((await upload(admin.c, `${pub.id}/${randomUUID()}.svg`, new TextEncoder().encode('<svg/>'), 'image/svg+xml')).error, 'svg rejected');
ok((await upload(admin.c, `${pub.id}/${randomUUID()}.pdf`, new Uint8Array(10 * 1024 * 1024 + 1), 'application/pdf')).error, 'file over 10 MB rejected by bucket limit');
ok((await upload(admin.c, `${randomUUID()}/${randomUUID()}.pdf`, pdf1, 'application/pdf')).error, 'upload for unknown publication rejected');
const reg1 = await register(admin.c, pub.id, path1, 'application/pdf', pdf1, await sha(pdf1));
ok(!reg1.error && reg1.data?.numero === 1, 'version 1 registered', reg1.error?.message);

console.log('3. draft is not reachable by new requests');
ok((await anon.rpc('obtener_publicacion_publica', { p_slug: pub.slug })).data?.length === 0, 'draft hidden from public RPC');
ok((await sign(anon, path1)).error, 'anon cannot sign a draft object');
ok((await sign(maestro.c, path1)).error, 'maestro cannot sign a draft object');
ok(!(await sign(admin.c, path1)).error, 'admin can preview draft');
const rawAnon = await fetch(`${URL_}/storage/v1/object/authenticated/${BUCKET}/${path1}`, { headers: { apikey: ANON, Authorization: `Bearer ${ANON}` } });
ok(rawAnon.status >= 400, `direct authenticated URL with anon key denied for draft (got ${rawAnon.status})`);
const rawPublic = await fetch(`${URL_}/storage/v1/object/public/${BUCKET}/${path1}`);
ok(rawPublic.status >= 400, `/object/public/ path denied (bucket is private) (got ${rawPublic.status})`);

console.log('4. published: public access without authentication');
ok(!(await state(maestro.c, pub.id, 'publicado')).data, 'maestro cannot publish');
ok(!(await state(admin.c, pub.id, 'publicado')).error, 'admin publishes');
const meta = await anon.rpc('obtener_publicacion_publica', { p_slug: pub.slug });
ok(meta.data?.length === 1 && meta.data[0].storage_path === path1 && !('created_by' in meta.data[0]), 'public RPC returns published metadata only');
const s1 = await sign(anon, path1, 120);
ok(!s1.error && s1.data?.signedUrl, 'anon signs the published object', s1.error?.message);
const dl = await fetch(s1.data.signedUrl);
const body = new Uint8Array(await dl.arrayBuffer());
ok(dl.status === 200 && body.length === pdf1.length && (await sha(body)) === (await sha(pdf1)), 'anon downloads identical bytes');
console.log(`   served headers: content-type=${dl.headers.get('content-type')} x-content-type-options=${dl.headers.get('x-content-type-options')} cache-control=${dl.headers.get('cache-control')}`);
ok(dl.headers.get('content-type') === 'application/pdf', 'served with the stored application/pdf');
const dlName = await sign(anon, path1, 60).then((r) => anon.storage.from(BUCKET).createSignedUrl(path1, 60, { download: 'doc.pdf' }));
ok(!dlName.error, 'anon can request a download-flavoured signed URL');
ok(((await anon.storage.from(BUCKET).list(pub.id)).data ?? []).length <= 1, 'anon list shows at most the published object');
ok((await anon.storage.from(BUCKET).remove([path1])).data?.length === 0, 'anon cannot delete');
ok((await admin.c.storage.from(BUCKET).remove([path1])).data?.length === 0, 'admin cannot delete a registered version');
ok((await superadmin.c.storage.from(BUCKET).remove([path1])).data?.length === 0, 'superadmin cannot delete a registered version');

console.log('5. replacement keeps slug; old version stops being reachable');
const png2 = PNG;
const path2 = `${pub.id}/${randomUUID()}.png`;
ok(!(await upload(admin.c, path2, png2, 'image/png')).error, 'admin uploads replacement');
const reg2 = await register(admin.c, pub.id, path2, 'image/png', png2, await sha(png2));
ok(reg2.data?.numero === 2, 'version 2 registered');
const meta2 = await anon.rpc('obtener_publicacion_publica', { p_slug: pub.slug });
ok(meta2.data?.[0]?.slug === pub.slug && meta2.data[0].storage_path === path2 && meta2.data[0].version_numero === 2, 'same slug serves v2');
ok((await sign(anon, path1)).error, 'anon can no longer sign v1');
ok(!(await sign(anon, path2)).error, 'anon signs v2');
ok((await sign(maestro.c, path1)).error && (await sign(alumno.c, path1)).error, 'non-admin users cannot sign v1');
const hist = await admin.c.from('publicaciones_documentos_versiones').select('numero').eq('publicacion_id', pub.id);
ok(hist.data?.length === 2, 'admin sees the history');
ok((await anon.from('publicaciones_documentos_versiones').select('numero')).error, 'anon cannot read the history');
ok(((await maestro.c.from('publicaciones_documentos_versiones').select('numero')).data ?? []).length === 0, 'maestro sees no history rows');

console.log('6. unpublish / archive close new requests');
ok(!(await state(admin.c, pub.id, 'borrador')).error, 'admin unpublishes');
ok((await sign(anon, path2)).error, 'anon cannot sign after unpublish');
ok((await anon.rpc('obtener_publicacion_publica', { p_slug: pub.slug })).data?.length === 0, 'public RPC empty after unpublish');
ok(!(await state(admin.c, pub.id, 'archivado')).error, 'admin archives');
ok((await sign(anon, path2)).error && (await sign(maestro.c, path2)).error, 'archived is closed to non-admin');
ok(!(await sign(admin.c, path2)).error, 'admin still previews archived');
ok(!(await state(admin.c, pub.id, 'borrador')).error, 'restore to draft');
ok(!(await state(admin.c, pub.id, 'publicado')).error, 'republish');
ok(!(await sign(anon, path2)).error, 'anon reaches it again');

console.log('7. known limit: content is not verified server-side (documented risk)');
const exe = EXE;
const path3 = `${pub.id}/${randomUUID()}.pdf`;
const upExe = await upload(admin.c, path3, exe, 'application/pdf');
ok(!upExe.error, 'EXPECTED GAP: storage accepts executable bytes declared as PDF');
const reg3 = await register(admin.c, pub.id, path3, 'application/pdf', exe, await sha(exe));
console.log(`   register of fake PDF by direct RPC: ${reg3.error ? 'rejected (hardened)' : 'ACCEPTED (gap closed only by etapa 2)'}`);
ok(true, 'gap recorded');

console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

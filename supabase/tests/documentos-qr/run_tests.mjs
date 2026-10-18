// Isolated PostgreSQL security suite for the public documents / QR module.
// Usage: node run_tests.mjs [--mutate N]   env: PGHOST PGPORT (default 127.0.0.1 54331)
// With --mutate N the migration is altered (see MUTATIONS) and the suite is EXPECTED to fail
// (exit 0 = mutation killed, exit 3 = mutation survived).
// TEST HARNESS ONLY. Needs a throw-away PostgreSQL; never point it at a real project.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID as uuid } from 'node:crypto';
import pg from 'pg';

const here = path.dirname(fileURLToPath(import.meta.url));
const MIG = path.resolve(here, '../../migrations/20261018120000_documentos_publicos_qr.sql');
const ROLLBACK = path.resolve(here, '../../rollback/20261018120000_documentos_publicos_qr.rollback.sql');
const STAGED = path.resolve(here, '../../staged/20261018130000_documentos_publicos_verificacion_servidor.sql');
const STAGED_ROLLBACK = path.resolve(here, '../../rollback/20261018130000_documentos_publicos_verificacion_servidor.rollback.sql');
const conn = { host: process.env.PGHOST || '127.0.0.1', port: Number(process.env.PGPORT || 54331), user: 'postgres', password: 'test' };
const mi = process.argv.indexOf('--mutate');
const mutation = mi > -1 ? Number(process.argv[mi + 1]) : 0;

export const MUTATIONS = {
  1: ['insert policy without admin check or publication check', (s) => s.replace('AND public.puede_gestionar_documentos_publicos()\n    AND name ~', 'AND name ~')
    .replace('AND EXISTS (SELECT 1 FROM public.publicaciones_documentos p\n                 WHERE p.id::text = (storage.foldername(name))[1])', 'AND true')],
  2: ['public read policy open to everything', (s) => s.replace('public.storage_objeto_publicado(name));', 'true);')],
  3: ['authorization helper always true', (s) => s.replace("AS $$ SELECT soi_security.has_role(ARRAY['admin', 'superadmin']) $$;", () => 'AS $$ SELECT true $$;')],
  4: ['direct DML granted to authenticated', (s) => s.replace('GRANT SELECT ON public.publicaciones_documentos,', 'GRANT ALL ON public.publicaciones_documentos,')],
  5: ['anon can read tables', (s) => s.replace('TO authenticated;\nGRANT ALL ON public.publicaciones_documentos,', 'TO authenticated, anon;\nGRANT ALL ON public.publicaciones_documentos,')],
  6: ['delete policy allows registered versions', (s) => s.replace('AND NOT EXISTS (SELECT 1 FROM public.publicaciones_documentos_versiones v WHERE v.storage_path = name)', '')],
  7: ['storage_objeto_publicado ignores estado', (s) => s.replace("WHERE p.estado = 'publicado' AND v.storage_path = p_name", 'WHERE v.storage_path = p_name')],
  8: ['public RPC ignores estado', (s) => s.replace("WHERE p.slug = p_slug AND p.estado = 'publicado'", 'WHERE p.slug = p_slug')],
  9: ['signature check of path removed from insert policy', (s) => s.replace(/AND name ~ '\^\[0-9a-f\]\{8\}[^\n]*\n/, '\n')],
};

const admin = new pg.Client({ ...conn, database: 'postgres' });
await admin.connect();
const dbName = `docqr_${mutation}_${process.pid}`;
await admin.query(`DROP DATABASE IF EXISTS ${dbName}`);
await admin.query(`CREATE DATABASE ${dbName}`);
await admin.end();
const db = new pg.Client({ ...conn, database: dbName });
await db.connect();

let pass = 0;
let fail = 0;
const ok = (cond, name) => {
  if (cond) pass++;
  else { fail++; console.log('  FAIL', name); }
};

const U = {};
const ROLES = ['user', 'alumno', 'representante', 'maestro', 'coordinacion_academica', 'direccion', 'admin', 'superadmin', 'inventarista'];
const NON_ADMIN = ROLES.filter((r) => !['admin', 'superadmin'].includes(r));
const sql = (q, p) => db.query(q, p);

/** Runs one statement as an API role (anon | service_role | authenticated user by label). */
async function as(who, q) {
  const apiRole = who === 'anon' ? 'anon' : who === 'service_role' ? 'service_role' : 'authenticated';
  await db.query('BEGIN');
  try {
    if (U[who]) await db.query('SELECT set_config(\'request.jwt.claims\', $1, true)', [JSON.stringify({ sub: U[who], role: apiRole })]);
    await db.query(`SET LOCAL ROLE ${apiRole}`);
    const r = await db.query(q);
    await db.query('COMMIT');
    return { rows: r.rows, rowCount: r.rowCount, err: null };
  } catch (e) {
    await db.query('ROLLBACK');
    return { rows: [], rowCount: 0, err: e };
  }
}
const denied = (r) => !!r.err && (r.err.code === '42501' || /permission denied|row-level security|No autorizado/i.test(r.err.message));
const noEffect = (r) => !!r.err || r.rowCount === 0;

try {
  await sql(fs.readFileSync(path.join(here, '00_supabase_bootstrap.sql'), 'utf8'));
  await sql(fs.readFileSync(path.join(here, '01_fixtures.sql'), 'utf8'));
  for (const rol of [...ROLES, 'admin_pendiente', 'admin_inactivo']) {
    const r = await sql('INSERT INTO auth.users (email) VALUES ($1) RETURNING id', [`${rol}@t.local`]);
    U[rol] = r.rows[0].id;
    await sql('INSERT INTO public.profiles (id, rol, estado, activo) VALUES ($1,$2,$3,$4)',
      [U[rol], rol.startsWith('admin_') ? 'admin' : rol, rol === 'admin_pendiente' ? 'pendiente' : 'activo', rol !== 'admin_inactivo']);
  }
  let mig = fs.readFileSync(MIG, 'utf8');
  if (mutation) {
    const [label, fn] = MUTATIONS[mutation];
    const m = fn(mig);
    if (m === mig) throw new Error(`mutation ${mutation} did not change the migration`);
    mig = m;
    console.log(`MUTATION ${mutation}: ${label}`);
  }
  await sql(mig);

  const snapPolicies = async () => JSON.stringify((await sql("SELECT policyname, qual, with_check FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname NOT LIKE 'docs_publicos_%' ORDER BY 1")).rows);
  const snapBuckets = async () => JSON.stringify((await sql("SELECT id, public FROM storage.buckets WHERE id <> 'soi-publico' ORDER BY 1")).rows);
  const basePolicies = await snapPolicies();
  const baseBuckets = await snapBuckets();

  // ── A. direct table access ──
  console.log('A. direct table access');
  for (const t of ['publicaciones_documentos', 'publicaciones_documentos_versiones', 'publicaciones_documentos_eventos']) {
    ok(denied(await as('anon', `SELECT 1 FROM public.${t}`)), `anon cannot SELECT ${t}`);
    for (const who of ['admin', 'superadmin']) {
      ok((await as(who, `INSERT INTO public.${t} DEFAULT VALUES`)).err !== null, `${who} cannot INSERT ${t} directly`);
      ok(denied(await as(who, `UPDATE public.${t} SET created_at = created_at`)), `${who} cannot UPDATE ${t} directly`);
      ok(denied(await as(who, `DELETE FROM public.${t}`)), `${who} cannot DELETE ${t} directly`);
    }
    for (const who of NON_ADMIN) {
      const r = await as(who, `SELECT 1 FROM public.${t}`);
      ok(!r.err && r.rows.length === 0, `${who} sees 0 rows of ${t}`);
    }
  }

  // ── B. RPC authorization by role ──
  console.log('B. RPC authorization');
  const create = "SELECT * FROM public.crear_publicacion_documento('Titulo prueba','d',current_date,'general')";
  ok(denied(await as('anon', create)), 'anon cannot create');
  ok(denied(await as('service_role', create)), 'service_role without a user identity cannot create');
  for (const who of [...NON_ADMIN, 'admin_pendiente', 'admin_inactivo']) ok(denied(await as(who, create)), `${who} cannot create`);
  const cAdmin = await as('admin', create);
  ok(!cAdmin.err && /^[a-z0-9]{10}$/.test(cAdmin.rows[0]?.slug ?? ''), 'admin creates publication with 10-char slug');
  ok((await as('superadmin', create)).err === null, 'superadmin creates publication');
  const pub = cAdmin.rows[0];
  const { slug, id: pid } = pub;
  ok(pub.created_by === U.admin && pub.estado === 'borrador', 'creator recorded, starts as draft');

  // ── C. storage writes and version registration ──
  console.log('C. storage writes');
  const objPath = (p = pid, ext = 'pdf') => `${p}/${uuid()}.${ext}`;
  const ins = (name, mime = 'application/pdf', size = 1000, bucket = 'soi-publico') =>
    `INSERT INTO storage.objects (bucket_id, name, owner, metadata) VALUES ('${bucket}','${name}',NULL,'{"mimetype":"${mime}","size":${size}}')`;
  const p1 = objPath();
  ok(denied(await as('anon', ins(p1))), 'anon cannot upload');
  for (const who of [...NON_ADMIN, 'admin_pendiente', 'admin_inactivo']) ok(denied(await as(who, ins(objPath()))), `${who} cannot upload`);
  ok(denied(await as('admin', ins(`${pid}/evil.html`, 'text/html'))), 'admin cannot upload html / free-form name');
  ok(denied(await as('admin', ins(`${pid}/${uuid()}.svg`, 'image/svg+xml'))), 'admin cannot upload svg');
  ok(denied(await as('admin', ins(objPath(uuid())))), 'admin cannot upload for a non-existent publication');
  ok(denied(await as('admin', ins(p1, 'application/pdf', 1000, 'documentos'))), 'module policy does not open bucket documentos');
  ok((await as('admin', ins(p1))).err === null, 'admin uploads a valid path');
  const reg = (p, mime = 'application/pdf', size = 1000, sha = 'a'.repeat(64), pubId = pid) =>
    `SELECT * FROM public.registrar_version_documento('${pubId}','${p}','${mime}',${size},'${sha}','orig.pdf','inicial')`;
  ok(denied(await as('maestro', reg(p1))), 'maestro cannot register version');
  ok(denied(await as('anon', reg(p1))), 'anon cannot register version');
  ok((await as('admin', reg(p1, 'application/pdf', 999))).err !== null, 'size mismatch rejected');
  ok((await as('admin', reg(p1, 'image/png'))).err !== null, 'mime/extension mismatch rejected');
  ok((await as('admin', reg(`${pid}/${uuid()}.pdf`))).err !== null, 'non-existent object rejected');
  ok((await as('admin', reg(p1, 'application/pdf', 1000, 'zz'))).err !== null, 'bad sha256 rejected');
  const v1 = await as('admin', reg(p1));
  ok(!v1.err && v1.rows[0].numero === 1, 'version 1 registered');
  ok((await as('admin', reg(p1))).err !== null, 'same object cannot be registered twice');

  // ── D. lifecycle and public read ──
  console.log('D. lifecycle and public read');
  const pubRead = `SELECT * FROM public.obtener_publicacion_publica('${slug}')`;
  const objRead = (name) => `SELECT name FROM storage.objects WHERE bucket_id='soi-publico' AND name='${name}'`;
  const setState = (e, id = pid) => `SELECT * FROM public.cambiar_estado_publicacion_documento('${id}','${e}')`;
  ok((await as('anon', pubRead)).rows.length === 0, 'draft not visible via public RPC');
  ok((await as('anon', objRead(p1))).rows.length === 0, 'draft object not readable by anon');
  ok((await as('admin', objRead(p1))).rows.length === 1, 'admin can read draft object');
  for (const who of NON_ADMIN) ok((await as(who, objRead(p1))).rows.length === 0, `${who} cannot read draft object`);
  ok(denied(await as('maestro', setState('publicado'))), 'maestro cannot publish');
  ok(denied(await as('anon', setState('publicado'))), 'anon cannot publish');
  const second = await as('admin', create);
  ok((await as('admin', setState('publicado', second.rows[0].id))).err !== null, 'cannot publish without a document');
  ok((await as('admin', setState('archivado', second.rows[0].id))).err === null, 'draft can be archived');
  ok((await as('admin', setState('publicado'))).err === null, 'admin publishes');
  const pr = await as('anon', pubRead);
  ok(pr.rows.length === 1 && pr.rows[0].storage_path === p1, 'anon reads published metadata');
  ok(!('created_by' in (pr.rows[0] ?? {})) && !('sha256' in (pr.rows[0] ?? {})), 'public RPC does not leak audit fields');
  ok((await as('anon', objRead(p1))).rows.length === 1, 'anon reads published object');
  ok((await as('anon', "SELECT name FROM storage.objects WHERE bucket_id='soi-publico'")).rows.length === 1, 'anon enumerates only the published object');
  // replacement keeps the URL
  const p2 = objPath(pid, 'png');
  await as('admin', ins(p2, 'image/png', 2000));
  const v2 = await as('admin', reg(p2, 'image/png', 2000, 'c'.repeat(64)));
  ok(!v2.err && v2.rows[0].numero === 2, 'replacement creates version 2');
  const pr2 = await as('anon', pubRead);
  ok(pr2.rows[0]?.slug === slug && pr2.rows[0]?.storage_path === p2 && pr2.rows[0]?.version_numero === 2, 'same slug now serves version 2');
  ok((await as('anon', objRead(p1))).rows.length === 0, 'superseded version no longer public');
  ok((await as('anon', objRead(p2))).rows.length === 1, 'new version public');
  ok((await as('admin', `SELECT numero FROM public.publicaciones_documentos_versiones WHERE publicacion_id='${pid}'`)).rows.length === 2, 'admin sees version history');
  ok((await as('maestro', 'SELECT 1 FROM public.publicaciones_documentos_versiones')).rows.length === 0, 'maestro cannot see history');
  const v1id = v1.rows[0].id;
  ok(denied(await as('maestro', `SELECT * FROM public.activar_version_documento('${pid}','${v1id}')`)), 'maestro cannot activate version');
  ok((await as('admin', `SELECT * FROM public.activar_version_documento('${pid}','${v1id}')`)).err === null, 'admin re-activates version 1');
  ok((await as('anon', objRead(p1))).rows.length === 1 && (await as('anon', objRead(p2))).rows.length === 0, 'version rollback flips the public object');
  ok((await as('admin', `SELECT * FROM public.activar_version_documento('${pid}','${uuid()}')`)).err !== null, 'foreign version rejected');
  ok((await as('admin', setState('borrador'))).err === null, 'admin unpublishes');
  ok((await as('anon', pubRead)).rows.length === 0 && (await as('anon', objRead(p1))).rows.length === 0, 'unpublished: RPC and object closed to anon');
  ok((await as('admin', setState('archivado'))).err === null, 'admin archives');
  ok((await as('admin', setState('publicado'))).err !== null, 'archived cannot jump to published');
  ok((await as('admin', reg(objPath(), 'application/pdf', 1))).err !== null, 'archived rejects new versions');
  ok((await as('admin', setState('borrador'))).err === null, 'admin restores to draft');
  ok((await as('admin', `SELECT * FROM public.actualizar_publicacion_documento('${pid}','Nuevo titulo','x',current_date,'comunicado')`)).rows[0]?.slug === slug, 'update keeps the slug');
  ok(denied(await as('maestro', `SELECT * FROM public.actualizar_publicacion_documento('${pid}','hack','x',current_date,'x')`)), 'maestro cannot update');
  ok((await as('admin', `SELECT * FROM public.actualizar_publicacion_documento('${pid}','ab','x',current_date,'x')`)).err !== null, 'short title rejected');
  await as('admin', setState('publicado'));

  // ── E. storage update / delete ──
  console.log('E. storage update/delete');
  ok(noEffect(await as('admin', "UPDATE storage.objects SET name = name WHERE bucket_id='soi-publico'")), 'admin cannot UPDATE/overwrite objects');
  ok(noEffect(await as('superadmin', "UPDATE storage.objects SET metadata='{}' WHERE bucket_id='soi-publico'")), 'superadmin cannot UPDATE objects');
  ok(noEffect(await as('superadmin', `DELETE FROM storage.objects WHERE bucket_id='soi-publico' AND name='${p1}'`)), 'superadmin cannot delete a registered version');
  ok(noEffect(await as('admin', "DELETE FROM storage.objects WHERE bucket_id='soi-publico'")), 'admin cannot delete');
  const orphan = objPath();
  await as('admin', ins(orphan));
  ok(noEffect(await as('admin', `DELETE FROM storage.objects WHERE name='${orphan}'`)), 'admin cannot delete an orphan');
  ok(noEffect(await as('maestro', `DELETE FROM storage.objects WHERE name='${orphan}'`)), 'maestro cannot delete an orphan');
  ok(noEffect(await as('anon', `DELETE FROM storage.objects WHERE name='${orphan}'`)), 'anon cannot delete an orphan');
  ok((await as('superadmin', `DELETE FROM storage.objects WHERE name='${orphan}'`)).rowCount === 1, 'superadmin deletes an orphan upload');

  // ── F. immutability and audit ──
  console.log('F. immutability and audit');
  ok((await as('service_role', "UPDATE public.publicaciones_documentos_versiones SET motivo='x'")).err !== null, 'versions are immutable even for service_role');
  ok((await as('service_role', 'DELETE FROM public.publicaciones_documentos_eventos')).err !== null, 'audit log is immutable even for service_role');
  const ev = await as('admin', `SELECT accion, actor_id FROM public.publicaciones_documentos_eventos WHERE publicacion_id='${pid}' ORDER BY id`);
  const acciones = ev.rows.map((r) => r.accion);
  ok(['crear', 'publicar', 'nueva_version', 'activar_version', 'despublicar', 'archivar', 'restaurar', 'actualizar'].every((a) => acciones.includes(a)), 'audit has every action type');
  ok(ev.rows.every((r) => r.actor_id === U.admin), 'every event carries the acting admin');
  ok((await as('maestro', 'SELECT 1 FROM public.publicaciones_documentos_eventos')).rows.length === 0, 'maestro cannot read audit');
  const exec = (await sql("SELECT grantee FROM information_schema.routine_privileges WHERE routine_name='crear_publicacion_documento' AND grantee IN ('anon','PUBLIC')")).rows;
  ok(exec.length === 0, 'admin RPC not executable by anon/PUBLIC');

  // ── I. state x role matrix for NEW requests, and superseded versions ──
  console.log('I. state/role access matrix');
  const everyone = ['anon', ...NON_ADMIN, 'admin_pendiente', 'admin_inactivo'];
  for (const estado of ['borrador', 'publicado', 'archivado']) {
    const c = await as('admin', create);
    const id = c.rows[0].id;
    const sl = c.rows[0].slug;
    const pth = objPath(id);
    await as('admin', ins(pth));
    await as('admin', reg(pth, 'application/pdf', 1000, 'd'.repeat(64), id));
    if (estado === 'publicado') await as('admin', setState('publicado', id));
    if (estado === 'archivado') await as('admin', setState('archivado', id));
    const open = estado === 'publicado';
    for (const who of everyone) {
      const rpcRows = (await as(who, `SELECT * FROM public.obtener_publicacion_publica('${sl}')`)).rows.length;
      const objRows = (await as(who, objRead(pth))).rows.length;
      const listRows = (await as(who, `SELECT name FROM storage.objects WHERE bucket_id='soi-publico' AND name LIKE '${id}/%'`)).rows.length;
      const expected = open ? 1 : 0;
      ok(rpcRows === expected && objRows === expected && listRows === expected, `${estado}: ${who} gets ${expected} via RPC/object/list (got ${rpcRows}/${objRows}/${listRows})`);
    }
    ok((await as('admin', objRead(pth))).rows.length === 1, `${estado}: admin can still reach it`);
  }
  {
    // superseded version: unreachable for every non-admin even while the publication is published
    const c = await as('admin', create);
    const id = c.rows[0].id;
    const a = objPath(id);
    const b = objPath(id, 'png');
    await as('admin', ins(a));
    await as('admin', reg(a, 'application/pdf', 1000, 'e'.repeat(64), id));
    await as('admin', ins(b, 'image/png', 2000));
    await as('admin', reg(b, 'image/png', 2000, 'f'.repeat(64), id));
    await as('admin', setState('publicado', id));
    for (const who of everyone) {
      ok((await as(who, objRead(a))).rows.length === 0, `superseded version hidden from ${who}`);
      ok((await as(who, 'SELECT 1 FROM public.publicaciones_documentos_versiones')).rows.length === 0 || (await as(who, 'SELECT 1 FROM public.publicaciones_documentos_versiones')).err !== null, `version history rows hidden from ${who}`);
    }
    ok((await as('anon', `SELECT * FROM public.obtener_publicacion_publica('${c.rows[0].slug}')`)).rows.every((r) => r.storage_path === b), 'public RPC only ever returns the current version');
    ok((await as('admin', objRead(a))).rows.length === 1, 'admin can still reach the superseded version');
  }

  // ── J. stage 2: server-side verified registration (staged migration) ──
  console.log('J. stage 2 (staged migration)');
  {
    await sql(fs.readFileSync(STAGED, 'utf8'));
    const c = await as('admin', create);
    const id = c.rows[0].id;
    const pth = objPath(id);
    await as('admin', ins(pth));
    const direct = reg(pth, 'application/pdf', 1000, '1'.repeat(64), id);
    ok(denied(await as('admin', direct)), 'stage 2: direct registration RPC is closed to admin');
    ok(denied(await as('superadmin', direct)), 'stage 2: direct registration RPC is closed to superadmin');
    const ver = (actor, p = pth) => `SELECT * FROM public.registrar_version_documento_verificada(${actor}, '${id}', '${p}', 'application/pdf', 1000, '${'2'.repeat(64)}', 'x.pdf', 'm')`;
    for (const who of ['anon', ...NON_ADMIN, 'admin', 'superadmin']) {
      ok(denied(await as(who, ver(`'${U.admin}'`))), `stage 2: ${who} cannot call the verified RPC`);
    }
    for (const bad of [U.maestro, U.alumno, U.admin_pendiente, U.admin_inactivo, U.inventarista]) {
      ok(denied(await as('service_role', ver(`'${bad}'`))), 'stage 2: service_role with a non-admin actor is rejected');
    }
    ok(denied(await as('service_role', ver('NULL'))), 'stage 2: null actor rejected');
    ok(denied(await as('service_role', `SELECT * FROM public._registrar_version_documento_core('${U.admin}', '${id}', '${pth}', 'application/pdf', 1000, '${'2'.repeat(64)}', 'x', 'm')`)), 'stage 2: core is not callable');
    const good = await as('service_role', ver(`'${U.admin}'`));
    ok(!good.err && good.rows[0]?.numero === 1 && good.rows[0]?.created_by === U.admin, 'stage 2: service_role registers on behalf of an active admin', good.err?.message);
    const evt = await as('admin', `SELECT detalle FROM public.publicaciones_documentos_eventos WHERE publicacion_id='${id}' AND accion='nueva_version'`);
    ok(evt.rows[0]?.detalle?.verificada_en_servidor === true, 'stage 2: audit marks the version as server-verified');
    ok((await as('service_role', ver(`'${U.admin}'`, `${id}/${uuid()}.pdf`))).err !== null, 'stage 2: verified RPC still requires the object to exist');
    await sql(fs.readFileSync(STAGED_ROLLBACK, 'utf8'));
    ok((await as('admin', reg(objPath(id), 'application/pdf', 1000, '3'.repeat(64), id))).err?.code !== '42501', 'stage 2 rollback: direct RPC callable again (fails only on missing object)');
    const gone = (await sql("SELECT count(*) c FROM pg_proc WHERE proname IN ('registrar_version_documento_verificada','_registrar_version_documento_core')")).rows[0].c;
    ok(Number(gone) === 0, 'stage 2 rollback removes its functions');
  }

  // ── G. collateral ──
  console.log('G. collateral');
  ok((await snapPolicies()) === basePolicies, 'pre-existing storage policies unchanged');
  ok((await snapBuckets()) === baseBuckets, 'other buckets unchanged');
  const b = (await sql("SELECT public, file_size_limit, allowed_mime_types FROM storage.buckets WHERE id='soi-publico'")).rows[0];
  ok(b && b.public === false && Number(b.file_size_limit) === 10485760 && b.allowed_mime_types.length === 4 && !b.allowed_mime_types.includes('image/svg+xml'), 'bucket private, 10MB, 4 safe MIME types');

  // ── H. rollback + re-apply ──
  if (!mutation) {
    console.log('H. rollback');
    await sql("DELETE FROM storage.objects WHERE bucket_id='soi-publico'");
    await sql(fs.readFileSync(ROLLBACK, 'utf8'));
    const left = (await sql(`SELECT (SELECT count(*) FROM pg_tables WHERE tablename LIKE 'publicaciones_documentos%') t,
        (SELECT count(*) FROM pg_policies WHERE policyname LIKE 'docs_publicos_%') p,
        (SELECT count(*) FROM pg_proc WHERE proname IN ('crear_publicacion_documento','obtener_publicacion_publica','storage_objeto_publicado','puede_gestionar_documentos_publicos','publicaciones_documentos_inmutable')) f,
        (SELECT count(*) FROM storage.buckets WHERE id='soi-publico') b`)).rows[0];
    ok(Object.values(left).every((v) => Number(v) === 0), 'rollback removes tables, policies, functions and the empty bucket');
    ok((await snapPolicies()) === basePolicies, 'rollback leaves other policies intact');
    ok((await snapBuckets()) === baseBuckets, 'rollback leaves other buckets intact');
    await sql(mig);
    ok((await as('admin', create)).err === null, 'migration re-applies and works after rollback');
  }
} catch (e) {
  if (!mutation) throw e;
  fail++;
  console.log('  CRASH (mutant killed):', e.message);
} finally {
  await db.end();
  const a = new pg.Client({ ...conn, database: 'postgres' });
  await a.connect();
  await a.query(`DROP DATABASE IF EXISTS ${dbName}`);
  await a.end();
}
console.log(`\nRESULT${mutation ? ` (mutation ${mutation})` : ''}: ${pass} passed, ${fail} failed`);
if (mutation) process.exit(fail > 0 ? 0 : 3);
process.exit(fail ? 1 : 0);

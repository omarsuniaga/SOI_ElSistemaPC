// Role-by-role suite for migration 20261020132000 (fn_email_departamento closed to service_role,
// fn_reportar_instrumento_danado guarded by catalogo:escribir). Throw-away PostgreSQL only.
//
//   BEFORE    anon reads department mailboxes; any signed-in account marks any instrument as damaged
//   AFTER     matrix actor x function, flows (the original body still runs, SECURITY DEFINER callers keep working)
//   ACL       exact function privileges and untouched original body (md5)
//   IDEMPOTENT / PRECONDITION / ROLLBACK exact (ACL + body hash), re-applicable
//
// Usage: node supabase/tests/secdef-email-instrument/run_tests.mjs [--keep]
// env  : PGHOST PGPORT PGUSER PGPASSWORD (default 127.0.0.1 54329 postgres test); MIGRATION_OVERRIDE
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const here = path.dirname(fileURLToPath(import.meta.url));
const MIG_DIR = path.resolve(here, '../../migrations');
const ROLLBACK_DIR = path.resolve(here, '../../rollback');
const find = (dir, v) => fs.readdirSync(dir).find((f) => f.startsWith(`${v}_`));
const migrationSql = fs.readFileSync(process.env.MIGRATION_OVERRIDE || path.join(MIG_DIR, find(MIG_DIR, '20261020132000')), 'utf8');
const rollbackSql = fs.readFileSync(path.join(ROLLBACK_DIR, find(ROLLBACK_DIR, '20261020132000')), 'utf8');
const baseMigrationSql = fs.readFileSync(path.join(MIG_DIR, find(MIG_DIR, '20261017180000')), 'utf8');
const block5SubsetSql = fs.readFileSync(path.resolve(here, '../authenticated-wide-open-block5/prod_schema_subset_block5_2026-10-20.sql'), 'utf8');
const subsetSql = fs.readFileSync(path.join(here, 'prod_functions_subset_2026-10-20.sql'), 'utf8');

const keep = process.argv.includes('--keep');
const conn = {
  host: process.env.PGHOST || '127.0.0.1', port: Number(process.env.PGPORT || 54329),
  user: process.env.PGUSER || 'postgres', password: process.env.PGPASSWORD || 'test',
};

const U = (n) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const ID = { programa: U(9001), alumno: U(9006), inst1: U(9203), inst2: U(9204), dep_acm: U(9201), m_titular: U(7001), m_otro: U(7003), m_sinactivo: U(7005) };
const ACTORS = {
  anon:             { role: 'anon' },
  user:             { role: 'authenticated', uid: U(1001), rol: 'user' },
  alumno:           { role: 'authenticated', uid: U(1002), rol: 'alumno' },
  representante:    { role: 'authenticated', uid: U(1003), rol: 'representante' },
  maestro_titular:  { role: 'authenticated', uid: U(1004), rol: 'maestro', maestro: ID.m_titular },
  maestro_otro:     { role: 'authenticated', uid: U(1006), rol: 'maestro', maestro: ID.m_otro },
  maestro_sinactivo:{ role: 'authenticated', uid: U(1019), rol: 'maestro', maestro: ID.m_sinactivo, activo: false },
  coordinacion:     { role: 'authenticated', uid: U(1007), rol: 'coordinacion_academica' },
  direccion:        { role: 'authenticated', uid: U(1008), rol: 'direccion' },
  admin:            { role: 'authenticated', uid: U(1009), rol: 'admin' },
  admin2:           { role: 'authenticated', uid: U(1013), rol: 'admin' },
  admin3:           { role: 'authenticated', uid: U(1014), rol: 'admin' },
  admin4:           { role: 'authenticated', uid: U(1015), rol: 'admin' },
  admin5:           { role: 'authenticated', uid: U(1016), rol: 'admin' },
  admin6:           { role: 'authenticated', uid: U(1020), rol: 'admin' },
  admin_inactivo:   { role: 'authenticated', uid: U(1017), rol: 'admin', estado: 'inactivo' },
  superadmin:       { role: 'authenticated', uid: U(1010), rol: 'superadmin' },
  finanzas:         { role: 'authenticated', uid: U(1012), rol: 'finanzas' },
  operaciones:      { role: 'authenticated', uid: U(1021), rol: 'operaciones' },
  service_role:     { role: 'service_role' },
};
const ALL = Object.keys(ACTORS);
const ADMINS = ['admin', 'admin2', 'admin3', 'admin4', 'admin5', 'admin6', 'superadmin'];
const REPORTERS = ['coordinacion', ...ADMINS];          // catalogo:escribir through the wrapper (service_role has no EXECUTE)
const SVC = ['service_role'];

const fixtureSql = `
SET session_replication_role = replica;
${Object.entries(ACTORS).filter(([, a]) => a.uid).map(([k, a]) => `
INSERT INTO auth.users (id, email) VALUES ('${a.uid}', '${k}@test.local');
INSERT INTO public.profiles (id, email, rol, estado, activo) VALUES ('${a.uid}', '${k}@test.local', '${a.rol}', '${a.estado ?? 'activo'}', ${a.activo === false ? 'false' : 'true'});`).join('')}
INSERT INTO public.maestros (id, nombre_completo, especialidad, correo, user_id) VALUES
  ('${ID.m_titular}', 'Titular', 'violin', 'titular@test.local', '${ACTORS.maestro_titular.uid}'),
  ('${ID.m_otro}', 'Otro', 'viola', 'otro@test.local', '${ACTORS.maestro_otro.uid}'),
  ('${ID.m_sinactivo}', 'SinActivo', 'viola', 'sinactivo@test.local', '${ACTORS.maestro_sinactivo.uid}');
INSERT INTO public.departamentos (id, nombre, codigo, email, activo) VALUES ('${ID.dep_acm}', 'Academico', 'ACM', 'acm@test.local', true);
INSERT INTO public.instrumentos (id, codigo, nombre, tipo, alumno_nombre) VALUES
  ('${ID.inst1}', 'INS-1', 'Violin 1', 'violin', 'Alumno Prueba'), ('${ID.inst2}', 'INS-2', 'Viola 1', 'viola', NULL);
`;

async function attempt(client, actorKey, sql) {
  const actor = ACTORS[actorKey];
  await client.query('BEGIN');
  try {
    await client.query(`SET LOCAL ROLE ${actor.role}`);
    await client.query(`SELECT set_config('request.jwt.claims', $1, true)`,
      [JSON.stringify(actor.uid ? { sub: actor.uid, role: actor.role } : { role: actor.role })]);
    const r = await client.query(sql);
    if (r.command === 'DO') return { outcome: 'allowed', detail: 'do-block completed' };
    return { outcome: r.rowCount >= 1 ? 'allowed' : 'denied', detail: `rows=${r.rowCount}` };
  } catch (e) {
    if (e.code === '42501') return { outcome: 'denied', detail: e.message };
    return { outcome: 'error', detail: `${e.code} ${e.message}` };
  } finally { await client.query('ROLLBACK'); }
}

const FN = 'public.fn_reportar_instrumento_danado';
const report = (inst = ID.inst1) => `SELECT ${FN}('${inst}', 'cuerda rota', NULL, 'Actor')`;
const fail = (m) => `RAISE EXCEPTION '${m}' USING ERRCODE = '42501'`;

function beforeCases() {
  const c = [];
  const add = (name, actor, expect, sql) => c.push({ name: `${name} as ${actor}`, actor, sql, expect });
  add('fn_email_departamento (anonymous mailbox lookup)', 'anon', 'allowed', `SELECT public.fn_email_departamento('ACM')`);
  for (const a of ['alumno', 'representante', 'user']) {
    add('fn_email_departamento', a, 'allowed', `SELECT public.fn_email_departamento('ACM')`);
    add('fn_reportar_instrumento_danado (any instrument)', a, 'allowed', report());
  }
  add('fn_reportar_instrumento_danado', 'anon', 'denied', report());
  return c;
}

function afterCases() {
  const c = [];
  const matrix = (name, allowed, sql) => { for (const a of ALL) c.push({ name: `${name} as ${a}`, actor: a, sql, expect: allowed.includes(a) ? 'allowed' : 'denied' }); };
  matrix('fn_email_departamento', SVC, `SELECT public.fn_email_departamento('ACM')`);
  matrix('fn_reportar_instrumento_danado', REPORTERS, report());
  matrix('fn_reportar_instrumento_danado_impl (original body, owner only)', [], `SELECT ${FN}_impl('${ID.inst1}', 'x', NULL, 'x')`);
  // flows
  const flow = (name, allowed, sql) => { for (const a of ALL) c.push({ name: `flow: ${name} as ${a}`, actor: a, sql, expect: allowed.includes(a) ? 'allowed' : 'denied' }); };
  flow('report marks the instrument damaged, opens the five tasks under one correlation id and touches nothing else', REPORTERS, `DO $f$ DECLARE k uuid; n int; ok int; BEGIN
    k := ${FN}('${ID.inst1}', 'cuerda rota', NULL, 'Actor');
    IF k IS NULL THEN ${fail('no correlation id returned')}; END IF;
    PERFORM 1 FROM public.instrumentos WHERE id = '${ID.inst1}' AND estado = 'danado'; IF NOT FOUND THEN ${fail('instrument not marked')}; END IF;
    PERFORM 1 FROM public.instrumentos WHERE id = '${ID.inst2}' AND estado = 'disponible'; IF NOT FOUND THEN ${fail('another instrument changed')}; END IF;
    SELECT count(*), count(DISTINCT departamento) INTO n, ok FROM public.tareas_institucionales WHERE correlation_id = k;
    IF n <> 5 OR ok <> 5 THEN ${fail('expected five tasks, one per department')}; END IF;
  END $f$`);
  flow('report of an unknown instrument still raises the original error (not an authorisation error)', REPORTERS, `DO $f$ BEGIN
    BEGIN PERFORM ${FN}('${U(1)}', 'x', NULL, 'x'); ${fail('must fail')};
    EXCEPTION WHEN raise_exception THEN IF SQLERRM NOT LIKE '%no existe%' THEN RAISE EXCEPTION 'unexpected error: %', SQLERRM USING ERRCODE = '42501'; END IF; END;
  END $f$`);
  flow('SECURITY DEFINER callers (Hermes, triggers) still resolve department mailboxes (test_mail_caller is PUBLIC-executable)', ALL, `DO $f$ BEGIN
    IF public.test_mail_caller() IS DISTINCT FROM 'acm@test.local' THEN ${fail('definer caller lost the mailbox')}; END IF;
  END $f$`);
  return c;
}

// ── orchestration ───────────────────────────────────────────────────────────
const results = [];
const rec = (phase, name, expect, got, pass = expect === got, detail = '') => results.push({ phase, name, expect, got, pass, detail });
async function withDb(name, fn) { const c = new pg.Client({ ...conn, database: name }); await c.connect(); try { return await fn(c); } finally { await c.end(); } }
async function admin(sql) { const c = new pg.Client({ ...conn, database: 'postgres' }); await c.connect(); try { await c.query(sql); } finally { await c.end(); } }
async function runCases(db, phase, cases) {
  return withDb(db, async (client) => { for (const c of cases) { const g = await attempt(client, c.actor, c.sql); rec(phase, c.name, c.expect, g.outcome, g.outcome === c.expect, g.detail); } });
}
const snapshot = (client) => client.query(`SELECT p.oid::regprocedure::text AS fn, p.proacl::text AS acl, md5(p.prosrc) AS src FROM pg_proc p
  WHERE p.pronamespace = 'public'::regnamespace AND p.proname IN ('fn_email_departamento', 'fn_reportar_instrumento_danado', 'fn_reportar_instrumento_danado_impl') ORDER BY 1`)
  .then((r) => JSON.stringify(r.rows.map((x) => ({ ...x, acl: x.acl && x.acl.replace(/[{}]/g, '').split(',').sort().join(',') }))));

console.log('Building modelled production baseline (template)…');
const b = spawnSync(process.execPath, [path.resolve(here, '../anon-write-fix/build_baseline.mjs'), 'soi_sd_tpl', '--from-prod-subset'], { stdio: 'inherit', env: process.env });
if (b.status !== 0) throw new Error('baseline build failed');
await withDb('soi_sd_tpl', async (c) => { await c.query(baseMigrationSql); await c.query(block5SubsetSql); await c.query(subsetSql); await c.query(fixtureSql); });
const clone = async (n) => { await admin(`DROP DATABASE IF EXISTS "${n}" WITH (FORCE)`); await admin(`CREATE DATABASE "${n}" TEMPLATE soi_sd_tpl`); };

await clone('soi_sd_before');
await runCases('soi_sd_before', 'before', beforeCases());
const snapBefore = await withDb('soi_sd_before', snapshot);

await clone('soi_sd_after');
await withDb('soi_sd_after', (c) => c.query(migrationSql));
await runCases('soi_sd_after', 'after', afterCases());
const snap1 = await withDb('soi_sd_after', snapshot);
let second = 'applied';
try { await withDb('soi_sd_after', (c) => c.query(migrationSql)); } catch (e) { second = `error: ${e.message}`; }
rec('idempotency', 'the migration can be applied a second time', 'applied', second);
rec('idempotency', 'applying twice yields identical ACLs and bodies', 'same', (await withDb('soi_sd_after', snapshot)) === snap1 ? 'same' : 'different');
await withDb('soi_sd_after', async (c) => {
  const x = await c.query(`SELECT p.proname, has_function_privilege('anon', p.oid, 'EXECUTE') a, has_function_privilege('authenticated', p.oid, 'EXECUTE') u, has_function_privilege('service_role', p.oid, 'EXECUTE') s
    FROM pg_proc p WHERE p.pronamespace = 'public'::regnamespace AND p.proname IN ('fn_email_departamento', 'fn_reportar_instrumento_danado', 'fn_reportar_instrumento_danado_impl') ORDER BY 1`);
  const got = x.rows.map((r) => `${r.proname}:${r.a ? 'A' : '-'}${r.u ? 'U' : '-'}${r.s ? 'S' : '-'}`).join(' ');
  rec('acl', 'EXECUTE matrix (A=anon U=authenticated S=service_role)', 'fn_email_departamento:--S fn_reportar_instrumento_danado:-U- fn_reportar_instrumento_danado_impl:---', got);
  const orig = await c.query(`SELECT md5(prosrc) AS m FROM pg_proc WHERE proname = 'fn_reportar_instrumento_danado_impl'`);
  const beforeHash = JSON.parse(snapBefore).find((r) => r.fn.startsWith('fn_reportar_instrumento_danado('))?.src;
  rec('acl', 'the original function body is kept byte for byte as _impl', beforeHash, orig.rows[0].m);
});

// PRECONDITION
await clone('soi_sd_sc');
{
  const r = await withDb('soi_sd_sc', async (c) => {
    await c.query('DROP FUNCTION public.tiene_capacidad_academica(text) CASCADE');
    const pre = await snapshot(c);
    let failed = null;
    try { await c.query(migrationSql); } catch (e) { failed = e.message; }
    await c.query('ROLLBACK').catch(() => {});
    return { failed, same: pre === (await snapshot(c)) };
  });
  rec('self-check', 'migration refuses to run without tiene_capacidad_academica', 'aborted', r.failed && /tiene_capacidad_academica/.test(r.failed) ? 'aborted' : 'applied');
  rec('self-check', 'refusal is atomic: ACLs and bodies unchanged', 'unchanged', r.same ? 'unchanged' : 'changed');
}

// ROLLBACK
await clone('soi_sd_rb');
await withDb('soi_sd_rb', (c) => c.query(migrationSql));
await withDb('soi_sd_rb', (c) => c.query(rollbackSql));
rec('rollback', 'rollback restores the exact ACLs and the original body', 'same', (await withDb('soi_sd_rb', snapshot)) === snapBefore ? 'same' : 'different');
await withDb('soi_sd_rb', (c) => c.query(rollbackSql));
rec('rollback', 'rollback is idempotent', 'same', (await withDb('soi_sd_rb', snapshot)) === snapBefore ? 'same' : 'different');
await runCases('soi_sd_rb', 'rollback', beforeCases());
await withDb('soi_sd_rb', (c) => c.query(migrationSql));
rec('rollback', 'migration re-applies cleanly after a rollback', 'same', (await withDb('soi_sd_rb', snapshot)) === snap1 ? 'same' : 'different');

if (!keep) for (const d of ['soi_sd_before', 'soi_sd_after', 'soi_sd_sc', 'soi_sd_rb']) await admin(`DROP DATABASE IF EXISTS "${d}" WITH (FORCE)`);

const byPhase = {};
for (const r of results) { byPhase[r.phase] ??= { total: 0, pass: 0 }; byPhase[r.phase].total++; if (r.pass) byPhase[r.phase].pass++; }
console.log('\nPhase        passed/total');
for (const [p, s] of Object.entries(byPhase)) console.log(`${p.padEnd(12)} ${s.pass}/${s.total}`);
const failed = results.filter((r) => !r.pass);
for (const f of failed.slice(0, 60)) console.log(` [${f.phase}] ${f.name}: expected ${f.expect}, got ${f.got} (${String(f.detail).slice(0, 140)})`);
console.log(failed.length ? `\n${failed.length} FAILURES` : '\nALL TESTS PASSED');
process.exit(failed.length ? 1 : 0);

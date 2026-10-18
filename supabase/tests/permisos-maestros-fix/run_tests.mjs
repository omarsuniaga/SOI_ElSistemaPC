// Role-by-role regression suite for migration 20261017190000 (teacher self-edit of permisos_maestros, R9).
//
// Throw-away PostgreSQL only, never production. Baseline = production subset captured 2026-10-17
// (../anon-write-fix) + prod_overlay_permisos_maestros (integrity trigger, tiene_permiso, ...).
//
// Phases:  before | after | flows | known-open | idempotency | policies | acl | collateral |
//          self-check | rollback
// Usage:   node supabase/tests/permisos-maestros-fix/run_tests.mjs [--keep] [--json out.json]
// env:     PGHOST PGPORT PGUSER PGPASSWORD (default 127.0.0.1 54329 postgres test) – see start_pg.sh
//          MIGRATION_OVERRIDE=<file>  run the suite against an alternative migration (mutation check)
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const here = path.dirname(fileURLToPath(import.meta.url));
const base = path.resolve(here, '../anon-write-fix');
const VERSION = '20261017190000';
const migFile = fs.readdirSync(path.resolve(here, '../../migrations')).find((f) => f.startsWith(`${VERSION}_`));
const rbFile = fs.readdirSync(path.resolve(here, '../../rollback')).find((f) => f.startsWith(`${VERSION}_`));
const migrationSql = fs.readFileSync(process.env.MIGRATION_OVERRIDE || path.resolve(here, '../../migrations', migFile), 'utf8');
const rollbackSql = fs.readFileSync(path.resolve(here, '../../rollback', rbFile), 'utf8');
const overlaySql = fs.readFileSync(path.join(here, 'prod_overlay_permisos_maestros_2026-10-17.sql'), 'utf8');

const args = process.argv.slice(2);
const keep = args.includes('--keep');
const jsonOut = args.includes('--json') ? args[args.indexOf('--json') + 1] : null;
const conn = {
  host: process.env.PGHOST || '127.0.0.1', port: Number(process.env.PGPORT || 54329),
  user: process.env.PGUSER || 'postgres', password: process.env.PGPASSWORD || 'test',
};

// ── fixtures ────────────────────────────────────────────────────────────────
const U = (n) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const M = { a: U(7001), b: U(7002), c: U(7003), ret: U(7004), cap: U(7005) };      // maestros
const ACTORS = {
  anon:             { role: 'anon' },
  user:             { role: 'authenticated', uid: U(1001), rol: 'user' },
  alumno:           { role: 'authenticated', uid: U(1002), rol: 'alumno' },
  representante:    { role: 'authenticated', uid: U(1003), rol: 'representante' },
  finanzas:         { role: 'authenticated', uid: U(1004), rol: 'finanzas' },
  direccion:        { role: 'authenticated', uid: U(1005), rol: 'direccion' },
  coordinacion:     { role: 'authenticated', uid: U(1006), rol: 'coordinacion_academica' },
  superadmin:       { role: 'authenticated', uid: U(1007), rol: 'superadmin' },
  admin:            { role: 'authenticated', uid: U(1008), rol: 'admin' },
  admin2:           { role: 'authenticated', uid: U(1009), rol: 'admin' },
  admin3:           { role: 'authenticated', uid: U(1010), rol: 'admin' },
  admin4:           { role: 'authenticated', uid: U(1011), rol: 'admin' },
  admin5:           { role: 'authenticated', uid: U(1012), rol: 'admin' },
  admin_inactivo:   { role: 'authenticated', uid: U(1014), rol: 'admin', estado: 'inactivo' },   // es_admin() ignores estado
  maestro_propio:   { role: 'authenticated', uid: U(1021), rol: 'maestro', m: M.a },
  maestro_ajeno:    { role: 'authenticated', uid: U(1022), rol: 'maestro', m: M.b },
  maestro_sin_fila: { role: 'authenticated', uid: U(1023), rol: 'maestro', m: M.c },
  maestro_retirado: { role: 'authenticated', uid: U(1024), rol: 'maestro', m: M.ret },
  maestro_cap:      { role: 'authenticated', uid: U(1025), rol: 'maestro', m: M.cap },
  service_role:     { role: 'service_role' },
};
const ADMINS = ['admin', 'admin2', 'admin3', 'admin4', 'admin5', 'admin_inactivo'];
const MAESTROS = Object.keys(ACTORS).filter((k) => ACTORS[k].m);
const AUTH = Object.keys(ACTORS).filter((k) => k !== 'anon' && k !== 'service_role');
const OWN_ROW = { maestro_propio: M.a, maestro_ajeno: M.b, maestro_retirado: M.ret, maestro_cap: M.cap };

const fixtureSql = `
-- fixtures are loaded as superuser with triggers/FKs off so the rows hold the exact values below
SET session_replication_role = replica;
${Object.entries(ACTORS).filter(([, a]) => a.uid).map(([k, a]) => `
INSERT INTO auth.users (id, email) VALUES ('${a.uid}', '${k}@test.local');
INSERT INTO public.profiles (id, email, rol, estado) VALUES ('${a.uid}', '${k}@test.local', '${a.rol}', '${a.estado ?? 'activo'}');`).join('')}
INSERT INTO public.maestros (id, nombre_completo, especialidad, correo, user_id) VALUES
  ('${M.a}', 'Propio', 'violin', 'a@test.local', '${ACTORS.maestro_propio.uid}'),
  ('${M.b}', 'Ajeno', 'viola', 'b@test.local', '${ACTORS.maestro_ajeno.uid}'),
  ('${M.c}', 'SinFila', 'chelo', 'c@test.local', '${ACTORS.maestro_sin_fila.uid}'),
  ('${M.ret}', 'Retirado', 'flauta', 'ret@test.local', '${ACTORS.maestro_retirado.uid}'),
  ('${M.cap}', 'ConPermiso', 'oboe', 'cap@test.local', '${ACTORS.maestro_cap.uid}');
INSERT INTO public.permisos_maestros (maestro_id) VALUES ('${M.a}'), ('${M.b}');
INSERT INTO public.permisos_maestros (maestro_id, puede_planificar, puede_asistir, fecha_fin)
  VALUES ('${M.ret}', false, false, '2026-12-31');
INSERT INTO public.permisos_maestros (maestro_id, puede_registrar_alumnos, permisos)
  VALUES ('${M.cap}', true, ARRAY['alumnos:create']);
SET session_replication_role = origin;
`;

// ── execution ───────────────────────────────────────────────────────────────
async function setActor(client, key) {
  const a = ACTORS[key];
  await client.query('RESET ROLE');
  await client.query(`SET LOCAL ROLE ${a.role}`);
  await client.query(`SELECT set_config('request.jwt.claims', $1, true)`,
    [JSON.stringify(a.uid ? { sub: a.uid, role: a.role } : { role: a.role })]);
}
function classify(r) {
  if (r.command === 'TRUNCATE' || r.command === 'DO') return 'allowed';
  if (r.command === 'SELECT' && r.rows.length === 1 && 'ok' in r.rows[0]) return r.rows[0].ok ? 'allowed' : 'denied';
  return r.rowCount >= 1 ? 'allowed' : 'denied';
}
function classifyError(e) {
  if (e.code === '42501') return 'denied';
  if (e.code === 'P0001' && /otro maestro|forbidden/.test(e.message)) return 'denied';   // integrity trigger / RPC gate
  return 'error';
}
/** Runs one statement as an actor in a transaction that is always rolled back. `verify` runs as superuser
 *  inside the same transaction and must return {ok:boolean} to read the EFFECTIVE state. */
async function attempt(client, actorKey, sql, verify) {
  await client.query('BEGIN');
  try {
    await setActor(client, actorKey);
    let outcome, detail;
    try {
      const r = await client.query(sql);
      outcome = classify(r); detail = `rows=${r.rowCount}`;
    } catch (e) { outcome = classifyError(e); detail = `${e.code} ${e.message}`; if (outcome === 'error') return { outcome, detail }; }
    let effect;
    if (verify) { await client.query('RESET ROLE'); effect = (await client.query(verify)).rows[0].ok; }
    return { outcome, detail, effect };
  } finally { await client.query('ROLLBACK'); }
}
/** Multi-step flow in ONE transaction; each step may switch actor. Always rolled back.
 *  A denied step only rolls back to its own savepoint, so earlier steps stay in effect. */
async function runFlow(client, steps) {
  const out = [];
  await client.query('BEGIN');
  try {
    for (const s of steps) {
      await client.query('RESET ROLE');
      await client.query('SAVEPOINT step');
      await setActor(client, s.actor);
      try { const r = await client.query(s.sql); out.push({ outcome: classify(r), detail: `rows=${r.rowCount}` }); }
      catch (e) {
        out.push({ outcome: classifyError(e), detail: `${e.code} ${e.message}` });
        await client.query('ROLLBACK TO SAVEPOINT step');
      }
    }
  } finally { await client.query('ROLLBACK'); }
  return out;
}

const results = [];
const record = (phase, name, expect, got, detail = '') => {
  const pass = String(expect) === String(got);
  results.push({ phase, name, expect: String(expect), got: String(got), pass, detail });
  return pass;
};
async function withDb(name, fn) {
  const c = new pg.Client({ ...conn, database: name });
  await c.connect();
  try { return await fn(c); } finally { await c.end(); }
}
async function admin(sql) {
  const c = new pg.Client({ ...conn, database: 'postgres' });
  await c.connect();
  try { await c.query(sql); } finally { await c.end(); }
}
async function snapshot(client, onlyTable = 'permisos_maestros') {
  const f = onlyTable ? `AND tablename = '${onlyTable}'` : `AND tablename <> 'permisos_maestros'`;
  const pol = await client.query(`SELECT tablename, policyname, cmd, roles::text, permissive, qual, with_check FROM pg_policies WHERE schemaname='public' ${f} ORDER BY 1,2`);
  const g = onlyTable ? `AND c.relname = 'permisos_maestros'` : `AND c.relname <> 'permisos_maestros'`;
  const acl = await client.query(`SELECT c.relname, (SELECT string_agg(a, ',' ORDER BY a) FROM unnest(c.relacl::text[]) a) acl FROM pg_class c WHERE c.relnamespace='public'::regnamespace AND c.relkind='r' ${g} ORDER BY 1`);
  const trg = onlyTable ? (await client.query(`SELECT tgname, pg_get_triggerdef(oid) d FROM pg_trigger WHERE tgrelid='public.permisos_maestros'::regclass AND NOT tgisinternal ORDER BY 1`)).rows : [];
  return JSON.stringify({ pol: pol.rows, acl: acl.rows, trg });
}

// ── case builders ───────────────────────────────────────────────────────────
const ROW = (id) => `FROM public.permisos_maestros WHERE maestro_id = '${id}'`;
/** Columns a teacher must never be able to change. `orig` = literal of the fixture value on the target row. */
const COLUMNS = [
  { col: 'puede_registrar_alumnos', set: 'true',                                  row: M.a,   actor: 'maestro_propio',   orig: 'false',        trig: true },
  { col: 'puede_inscribir_clases',  set: 'true',                                  row: M.a,   actor: 'maestro_propio',   orig: 'false',        trig: true },
  { col: 'puede_crear_clases',      set: 'true',                                  row: M.a,   actor: 'maestro_propio',   orig: 'false',        trig: true },
  { col: 'permisos',                set: `ARRAY['alumnos:create','clases:enroll','catalogo:escribir']`, row: M.a, actor: 'maestro_propio', orig: `'{}'::text[]`, trig: true },
  { col: 'concedido_por',           set: `'${ACTORS.maestro_propio.uid}'`,         row: M.a,   actor: 'maestro_propio',   orig: 'NULL',         trig: true },
  { col: 'puede_planificar',        set: 'true',                                  row: M.ret, actor: 'maestro_retirado', orig: 'false',        trig: false },
  { col: 'puede_asistir',           set: 'true',                                  row: M.ret, actor: 'maestro_retirado', orig: 'false',        trig: false },
  { col: 'fecha_fin',               set: 'NULL',                                  row: M.ret, actor: 'maestro_retirado', orig: `'2026-12-31'::date`, trig: false },
  { col: 'fecha_inicio',            set: `'2000-01-01'`,                          row: M.a,   actor: 'maestro_propio',   orig: 'CURRENT_DATE', trig: false },
  { col: 'solicitudes',             set: `ARRAY['alumnos:create']`,                row: M.a,   actor: 'maestro_propio',   orig: `'{}'::text[]`, trig: false },
];
const columnCases = () => COLUMNS.map((c) => ({
  name: `${c.actor} UPDATE own ${c.col}`, actor: c.actor, kind: 'column', trig: c.trig,
  sql: `UPDATE public.permisos_maestros SET ${c.col} = ${c.set} WHERE maestro_id = '${c.row}'`,
  verify: `SELECT (${c.col} IS DISTINCT FROM ${c.orig}) AS ok ${ROW(c.row)}`,
}));

/** Matrix: expectations per phase come from sets of allowed actors. */
function matrix(phase) {
  const before = phase === 'before' || phase === 'rollback';
  const cases = [];
  const sets = {
    insert: before ? [...ADMINS, 'maestro_sin_fila'] : ADMINS,
    update: before ? [...ADMINS, 'maestro_ajeno'] : ADMINS,       // target: the row of maestro_ajeno
    delete: ['service_role'],                                      // no DELETE policy for anyone; service_role bypasses RLS
    truncate: before ? [...AUTH, 'anon', 'service_role'] : ['service_role'],
    selectOther: before ? [...AUTH, 'service_role'] : [...ADMINS, 'maestro_ajeno', 'service_role'],
  };
  for (const actor of Object.keys(ACTORS)) {
    cases.push({ name: `INSERT row for maestro_sin_fila as ${actor}`, actor, sql: `INSERT INTO public.permisos_maestros (maestro_id) VALUES ('${M.c}')`, expect: sets.insert.includes(actor) ? 'allowed' : 'denied' });
    cases.push({ name: `UPDATE row of maestro_ajeno as ${actor}`, actor, sql: `UPDATE public.permisos_maestros SET puede_planificar = true WHERE maestro_id = '${M.b}'`, expect: sets.update.includes(actor) ? 'allowed' : 'denied' });
    cases.push({ name: `DELETE row of maestro_ajeno as ${actor}`, actor, sql: `DELETE FROM public.permisos_maestros WHERE maestro_id = '${M.b}'`, expect: sets.delete.includes(actor) ? 'allowed' : 'denied' });
    cases.push({ name: `TRUNCATE as ${actor}`, actor, sql: `TRUNCATE public.permisos_maestros`, expect: sets.truncate.includes(actor) ? 'allowed' : 'denied' });
    cases.push({ name: `SELECT row of maestro_ajeno as ${actor}`, actor, sql: `SELECT 1 ${ROW(M.b)}`, expect: sets.selectOther.includes(actor) ? 'allowed' : 'denied' });
  }
  // own row stays readable (tiene_permiso, portal, realtime)
  for (const [actor, id] of Object.entries(OWN_ROW)) {
    cases.push({ name: `SELECT own row as ${actor}`, actor, sql: `SELECT 1 ${ROW(id)}`, expect: 'allowed' });
  }
  cases.push({ name: 'SELECT own row as maestro_sin_fila (no row exists)', actor: 'maestro_sin_fila', sql: `SELECT 1 ${ROW(M.c)}`, expect: 'denied' });
  // teacher inserting a row for ANOTHER teacher
  cases.push({ name: 'INSERT row for another teacher as maestro_ajeno', actor: 'maestro_ajeno', sql: `INSERT INTO public.permisos_maestros (maestro_id) VALUES ('${M.c}')`, expect: 'denied' });
  // tiene_permiso() keeps working
  cases.push({ name: "tiene_permiso('alumnos:create') as maestro_cap", actor: 'maestro_cap', sql: `SELECT public.tiene_permiso('alumnos:create') AS ok`, expect: 'allowed' });
  cases.push({ name: "tiene_permiso('alumnos:create') as maestro_propio (no grant)", actor: 'maestro_propio', sql: `SELECT public.tiene_permiso('alumnos:create') AS ok`, expect: 'denied' });
  cases.push({ name: "tiene_permiso('alumnos:create') as maestro_sin_fila", actor: 'maestro_sin_fila', sql: `SELECT public.tiene_permiso('alumnos:create') AS ok`, expect: 'denied' });
  cases.push({ name: "tiene_permiso('alumnos:create') as alumno", actor: 'alumno', sql: `SELECT public.tiene_permiso('alumnos:create') AS ok`, expect: 'denied' });
  return cases;
}

// ── orchestration ───────────────────────────────────────────────────────────
console.log('Building production-subset baseline…');
const b = spawnSync(process.execPath, [path.join(base, 'build_baseline.mjs'), 'pmf_tpl', '--from-prod-subset'], { stdio: 'inherit', env: process.env });
if (b.status !== 0) throw new Error('baseline build failed');
await withDb('pmf_tpl', async (c) => { await c.query('SET search_path = public, extensions'); await c.query(overlaySql); await c.query(fixtureSql); });
const clone = async (name) => { await admin(`DROP DATABASE IF EXISTS "${name}" WITH (FORCE)`); await admin(`CREATE DATABASE "${name}" TEMPLATE pmf_tpl`); };

async function runMatrix(db, phase) {
  return withDb(db, async (client) => {
    for (const c of matrix(phase)) {
      const r = await attempt(client, c.actor, c.sql);
      record(phase, c.name, c.expect, r.outcome, r.detail);
    }
    for (const c of columnCases()) {
      const r = await attempt(client, c.actor, c.sql, c.verify);
      // BEFORE: unprotected columns change (the hole); trigger-protected ones do not. AFTER: nothing changes.
      const expectChanged = (phase === 'before' || phase === 'rollback') && !c.trig;
      record(phase, `${c.name} -> value changed`, expectChanged, r.effect, r.detail);
    }
  });
}

// BEFORE
await clone('pmf_before');
await runMatrix('pmf_before', 'before');
const snapBefore = await withDb('pmf_before', snapshot);
const snapOthersBefore = await withDb('pmf_before', (c) => snapshot(c, null));

// AFTER + idempotency
await clone('pmf_after');
await withDb('pmf_after', (c) => c.query(migrationSql));
await runMatrix('pmf_after', 'after');
const snap1 = await withDb('pmf_after', snapshot);
await withDb('pmf_after', (c) => c.query(migrationSql));
const snap2 = await withDb('pmf_after', snapshot);
record('idempotency', 'applying the migration twice yields an identical catalog', 'same', snap1 === snap2 ? 'same' : 'different');

// POLICIES whitelist
await withDb('pmf_after', async (c) => {
  const pol = (await c.query(`SELECT policyname, permissive, cmd, roles::text FROM pg_policies WHERE schemaname='public' AND tablename='permisos_maestros' ORDER BY 1`)).rows;
  const want = ['Maestro ve sus propios permisos', 'permisos_maestros_admin_insert', 'permisos_maestros_admin_read', 'permisos_maestros_admin_update'].sort();
  record('policies', 'permisos_maestros: policy set equals the whitelist', want.join(' | '), pol.map((p) => p.policyname).sort().join(' | '));
  record('policies', 'no RESTRICTIVE or non-admin write policy', 0, pol.filter((p) => p.permissive !== 'PERMISSIVE').length);
  const trg = (await c.query(`SELECT count(*)::int n FROM pg_trigger WHERE tgrelid='public.permisos_maestros'::regclass AND NOT tgisinternal`)).rows[0].n;
  record('policies', 'both production triggers are still attached (defence in depth untouched)', 2, trg);
  // ACL
  const acl = (await c.query(`SELECT coalesce(r.rolname,'PUBLIC') g, string_agg(x.privilege_type, ',' ORDER BY x.privilege_type) p
    FROM (SELECT (aclexplode(relacl)).* FROM pg_class WHERE oid='public.permisos_maestros'::regclass) x LEFT JOIN pg_roles r ON r.oid=x.grantee
    WHERE coalesce(r.rolname,'PUBLIC') IN ('PUBLIC','anon','authenticated') GROUP BY 1 ORDER BY 1`)).rows;
  record('acl', 'anon holds no privilege; PUBLIC none; authenticated = INSERT,SELECT,UPDATE', 'authenticated=INSERT,SELECT,UPDATE', acl.map((r) => `${r.g}=${r.p}`).join(';'));
});

// FLOWS (identical before and after: they must keep working)
async function flows(db, phase) {
  return withDb(db, async (client) => {
    const run = async (label, steps) => {
      const out = await runFlow(client, steps);
      steps.forEach((s, i) => record(phase, `${label}: ${s.name}`, s.expect, out[i].outcome, out[i].detail));
    };
    await run('flow grant/revoke', [
      { name: 'admin grants alumnos:create (upsert, persists via integrity trigger bypass)', actor: 'admin', expect: 'allowed',
        sql: `INSERT INTO public.permisos_maestros (maestro_id, puede_registrar_alumnos, permisos, concedido_por) VALUES ('${M.b}', true, ARRAY['alumnos:create'], '${ACTORS.admin.uid}')
              ON CONFLICT (maestro_id) DO UPDATE SET puede_registrar_alumnos = EXCLUDED.puede_registrar_alumnos, permisos = EXCLUDED.permisos, concedido_por = EXCLUDED.concedido_por` },
      { name: 'granted teacher reads own row', actor: 'maestro_ajeno', expect: 'allowed', sql: `SELECT 1 ${ROW(M.b)} AND permisos = ARRAY['alumnos:create']` },
      { name: "tiene_permiso('alumnos:create') true after grant", actor: 'maestro_ajeno', expect: 'allowed', sql: `SELECT public.tiene_permiso('alumnos:create') AS ok` },
      { name: "tiene_permiso('clases:enroll') false (not granted)", actor: 'maestro_ajeno', expect: 'denied', sql: `SELECT public.tiene_permiso('clases:enroll') AS ok` },
      { name: 'admin revokes', actor: 'admin2', expect: 'allowed', sql: `UPDATE public.permisos_maestros SET permisos = '{}', puede_registrar_alumnos = false WHERE maestro_id = '${M.b}'` },
      { name: "tiene_permiso('alumnos:create') false after revoke", actor: 'maestro_ajeno', expect: 'denied', sql: `SELECT public.tiene_permiso('alumnos:create') AS ok` },
    ]);
    await run('flow permission request', [
      { name: 'teacher files a request for themself (solicitudes_permisos)', actor: 'maestro_propio', expect: 'allowed',
        sql: `INSERT INTO public.solicitudes_permisos (maestro_id, solicita_alumnos, tipos) VALUES ('${M.a}', true, ARRAY['alumnos:create'])` },
      { name: 'teacher cannot file a request for another teacher', actor: 'maestro_propio', expect: 'denied',
        sql: `INSERT INTO public.solicitudes_permisos (maestro_id, solicita_alumnos) VALUES ('${M.b}', true)` },
      { name: 'admin approves the request', actor: 'admin', expect: 'allowed',
        sql: `UPDATE public.solicitudes_permisos SET estado = 'aprobado', aprobado_por = '${ACTORS.admin.uid}' WHERE maestro_id = '${M.a}'` },
      { name: 'admin writes the resulting permission (aprobarSolicitud -> actualizarPermiso upsert)', actor: 'admin', expect: 'allowed',
        sql: `INSERT INTO public.permisos_maestros (maestro_id, puede_registrar_alumnos, permisos, concedido_por) VALUES ('${M.a}', true, ARRAY['alumnos:create'], '${ACTORS.admin.uid}')
              ON CONFLICT (maestro_id) DO UPDATE SET puede_registrar_alumnos = true, permisos = ARRAY['alumnos:create'], concedido_por = '${ACTORS.admin.uid}'` },
      { name: "teacher now passes tiene_permiso('alumnos:create')", actor: 'maestro_propio', expect: 'allowed', sql: `SELECT public.tiene_permiso('alumnos:create') AS ok` },
    ]);
    await run('flow SECURITY DEFINER RPCs', [
      { name: 't_approve_maestro as admin creates the default row', actor: 'admin', expect: 'allowed', sql: `SELECT public.t_approve_maestro('${M.c}')` },
      { name: 'created row is readable by its teacher', actor: 'maestro_sin_fila', expect: 'allowed', sql: `SELECT 1 ${ROW(M.c)}` },
      { name: 't_retirar_maestro as admin updates flags', actor: 'admin', expect: 'allowed', sql: `SELECT public.t_retirar_maestro('${M.a}')` },
      { name: 't_approve_maestro as teacher is refused by its own gate', actor: 'maestro_propio', expect: 'denied', sql: `SELECT public.t_approve_maestro('${M.c}')` },
      { name: 't_retirar_maestro as teacher is refused by its own gate', actor: 'maestro_propio', expect: 'denied', sql: `SELECT public.t_retirar_maestro('${M.b}')` },
    ]);
    await run('flow admin screens', [
      { name: 'admin lists every permission row (obtenerPermisos)', actor: 'admin', expect: 'allowed', sql: `SELECT * FROM public.permisos_maestros` },
      { name: 'admin deactivates a teacher (inactivar: planificar/asistir=false)', actor: 'admin3', expect: 'allowed',
        sql: `UPDATE public.permisos_maestros SET puede_planificar = false, puede_asistir = false WHERE maestro_id = '${M.b}'` },
    ]);
  });
}
await clone('pmf_before_flows');
await flows('pmf_before_flows', 'flows-before-baseline');   // documents that the same flows work on the old state
await flows('pmf_after', 'flows');

// KNOWN-OPEN (out of scope, documented): R10 solicitudes_permisos.estado is teacher-writable
for (const [db, ph] of [['pmf_before_flows', 'known-open-before'], ['pmf_after', 'known-open']]) {
  await withDb(db, async (client) => {
    const r = await attempt(client, 'maestro_propio', `INSERT INTO public.solicitudes_permisos (maestro_id, solicita_alumnos, estado) VALUES ('${M.a}', true, 'aprobado')`);
    record(ph, 'R10 (untouched): a teacher can still INSERT a request already marked aprobado', 'allowed', r.outcome, r.detail);
  });
}

// COLLATERAL: nothing outside permisos_maestros changed
{
  const others = await withDb('pmf_after', (c) => snapshot(c, null));
  record('collateral', 'policies and ACLs of every other public table are identical before/after', 'same', others === snapOthersBefore ? 'same' : 'different');
}

// SELF-CHECK: the migration must abort (and change nothing) when something permissive is left over
const rogue = [
  ['residual UPDATE policy USING (true) for authenticated', `CREATE POLICY rogue_update ON public.permisos_maestros FOR UPDATE TO authenticated USING (true)`],
  ['residual teacher-own-row UPDATE policy', `CREATE POLICY rogue_own ON public.permisos_maestros FOR UPDATE TO authenticated USING (maestro_id = maestro_actual())`],
  ['residual FOR ALL policy for public', `CREATE POLICY rogue_all ON public.permisos_maestros FOR ALL TO public USING (es_admin())`],
  ['residual unconditional SELECT policy', `CREATE POLICY rogue_read ON public.permisos_maestros FOR SELECT TO authenticated USING (true)`],
  ['PUBLIC holds TRUNCATE', `GRANT TRUNCATE ON public.permisos_maestros TO PUBLIC`],
];
for (const [label, ddl] of rogue) {
  await clone('pmf_rogue');
  await withDb('pmf_rogue', async (c) => {
    await c.query(ddl);
    const pre = await snapshot(c);
    let aborted = false;
    try { await c.query(migrationSql); } catch (e) { aborted = /permisos_maestros/.test(e.message); }
    await c.query('ROLLBACK').catch(() => {});
    record('self-check', `migration aborts: ${label}`, 'aborted', aborted ? 'aborted' : 'applied');
    record('self-check', `transaction left no partial change: ${label}`, 'same', (await snapshot(c)) === pre ? 'same' : 'different');
  });
}

// ROLLBACK
await clone('pmf_rb');
await withDb('pmf_rb', (c) => c.query(migrationSql));
await withDb('pmf_rb', (c) => c.query(rollbackSql));
record('rollback', 'rollback restores the exact pre-migration policies, ACL and triggers', 'same', (await withDb('pmf_rb', snapshot)) === snapBefore ? 'same' : 'different');
await withDb('pmf_rb', (c) => c.query(rollbackSql));
record('rollback', 'rollback is idempotent', 'same', (await withDb('pmf_rb', snapshot)) === snapBefore ? 'same' : 'different');
await runMatrix('pmf_rb', 'rollback');                       // the old behaviour is back, as documented
await withDb('pmf_rb', (c) => c.query(migrationSql));
record('rollback', 'migration re-applies cleanly after a rollback (same catalog as a fresh apply)', 'same', (await withDb('pmf_rb', snapshot)) === snap1 ? 'same' : 'different');

if (!keep) for (const d of ['pmf_before', 'pmf_after', 'pmf_before_flows', 'pmf_rogue', 'pmf_rb']) await admin(`DROP DATABASE IF EXISTS "${d}" WITH (FORCE)`);

// ── report ──────────────────────────────────────────────────────────────────
const by = {};
for (const r of results) { by[r.phase] ??= { total: 0, pass: 0 }; by[r.phase].total++; if (r.pass) by[r.phase].pass++; }
console.log('\nPhase                     passed/total');
for (const [p, s] of Object.entries(by)) console.log(`${p.padEnd(25)} ${s.pass}/${s.total}`);
const failed = results.filter((r) => !r.pass);
if (failed.length) {
  console.log('\nFAILED:');
  for (const f of failed.slice(0, 80)) console.log(` [${f.phase}] ${f.name}: expected ${f.expect}, got ${f.got} (${f.detail})`);
}
if (jsonOut) fs.writeFileSync(jsonOut, JSON.stringify({ byPhase: by, failed: failed.length, results }, null, 2));
console.log(failed.length ? `\n${failed.length} FAILURES` : '\nALL TESTS PASSED');
process.exit(failed.length ? 1 : 0);

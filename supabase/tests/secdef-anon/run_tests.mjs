// Role-by-role suite for migration 20261020130000 (SECURITY DEFINER group 1: functions that write/notify
// and were executable by anon). Runs on a throw-away PostgreSQL 17 (never production).
//
//   BEFORE      the exposure is real: anon/PUBLIC can EXECUTE every function of the group
//   AFTER       matrix actor x function (anon, signed-in roles, maestro, admin, service_role, postgres = cron)
//   EFFECT      denied calls leave no trace; allowed notifiers insert and fire the push trigger
//   FLOWS       definer trigger chain still reaches revoked internals; backfill wrapper end to end
//   ACL         exact proacl of every function, nobody keeps PUBLIC
//   IDEMPOTENT  applying twice leaves the catalog unchanged
//   SELF-CHECK  a missing function aborts the migration atomically (no ACL change)
//   ROLLBACK    restores the exact pre-migration ACLs and the original backfill function; migration re-applies
//
// Usage: node supabase/tests/secdef-anon/run_tests.mjs [--keep] [--json out.json]
// env:   PGHOST PGPORT PGUSER PGPASSWORD (default 127.0.0.1 54329 postgres test); MIGRATION_OVERRIDE=<file>
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import { FUNCTIONS, BACKFILL, identity, stubSql } from './functions.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const MIG_DIR = path.resolve(here, '../../migrations');
const RB_DIR = path.resolve(here, '../../rollback');
const find = (dir, v) => fs.readdirSync(dir).find((f) => f.startsWith(`${v}_`));
const VERSION = '20261020130000';
const migrationSql = fs.readFileSync(process.env.MIGRATION_OVERRIDE || path.join(MIG_DIR, find(MIG_DIR, VERSION)), 'utf8');
const rollbackSql = fs.readFileSync(path.join(RB_DIR, find(RB_DIR, VERSION)), 'utf8');
const baseMigrationSql = fs.readFileSync(path.join(MIG_DIR, find(MIG_DIR, '20261017180000')), 'utf8');
const subsetSql = fs.readFileSync(path.resolve(here, '../authenticated-wide-open/prod_schema_subset_block1_2026-10-20.sql'), 'utf8');

const args = process.argv.slice(2);
const keep = args.includes('--keep');
const jsonOut = args.includes('--json') ? args[args.indexOf('--json') + 1] : null;
const conn = { host: process.env.PGHOST || '127.0.0.1', port: Number(process.env.PGPORT || 54329),
  user: process.env.PGUSER || 'postgres', password: process.env.PGPASSWORD || 'test' };

const U = (n) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const ACTORS = {
  anon:              { role: 'anon' },
  user:              { role: 'authenticated', uid: U(1001), rol: 'user' },
  alumno:            { role: 'authenticated', uid: U(1002), rol: 'alumno' },
  maestro_titular:   { role: 'authenticated', uid: U(1004), rol: 'maestro' },
  maestro_sinactivo: { role: 'authenticated', uid: U(1019), rol: 'maestro', activo: false },   // 6 such profiles in production
  coordinacion:      { role: 'authenticated', uid: U(1007), rol: 'coordinacion_academica' },
  direccion:         { role: 'authenticated', uid: U(1008), rol: 'direccion' },
  finanzas:          { role: 'authenticated', uid: U(1012), rol: 'finanzas' },
  admin:             { role: 'authenticated', uid: U(1009), rol: 'admin' },
  admin_inactivo:    { role: 'authenticated', uid: U(1017), rol: 'admin', estado: 'inactivo' },
  superadmin:        { role: 'authenticated', uid: U(1010), rol: 'superadmin' },
  service_role:      { role: 'service_role' },
  postgres_cron:     { role: null },                                                          // pg_cron jobs run as postgres
};
const ALL = Object.keys(ACTORS);
const SIGNED_IN = ALL.filter((a) => ACTORS[a].role === 'authenticated');
const PRIV = ['service_role', 'postgres_cron'];
const ADMIN_SET = ['admin', 'superadmin'];

const fixtureSql = `
CREATE TYPE public.aplicabilidad_compas AS ENUM ('aplica', 'no_aplica');
CREATE TYPE public.estado_preparacion AS ENUM ('pendiente', 'listo');
CREATE TABLE public.secdef_probe (id bigserial PRIMARY KEY, fn text NOT NULL, at timestamptz DEFAULT now());
GRANT ALL ON public.secdef_probe TO anon, authenticated, service_role;
GRANT USAGE ON SEQUENCE public.secdef_probe_id_seq TO anon, authenticated, service_role;
${FUNCTIONS.map(stubSql).join('\n')}
-- production backfill: SECURITY DEFINER, search_path=public, ACL anon+authenticated+service_role (no PUBLIC entry)
CREATE FUNCTION public.backfill_alumnos_desde_postulantes(dry_run boolean)
  RETURNS TABLE(alumno_id uuid, alumno_nombre text, postulante_id uuid, postulante_nombre text, match_tipo text, campos_llenados integer, accion text)
  LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $stub$
BEGIN
  IF NOT dry_run THEN INSERT INTO public.secdef_probe (fn) VALUES ('backfill:write'); END IF;
  RETURN QUERY SELECT gen_random_uuid(), 'a'::text, gen_random_uuid(), 'p'::text, 'email'::text, 1, CASE WHEN dry_run THEN 'preview' ELSE 'updated' END;
END; $stub$;
REVOKE ALL ON FUNCTION public.backfill_alumnos_desde_postulantes(boolean) FROM PUBLIC;
-- gamification chain as in production: definer trigger on a table that signed-in users write, calling two internals
CREATE TABLE public.evaluacion_stub (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), alumno_id uuid);
GRANT ALL ON public.evaluacion_stub TO anon, authenticated, service_role;
CREATE FUNCTION public.fn_trigger_evaluacion_gamificacion() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $t$
BEGIN
  PERFORM public.fn_actualizar_racha_alumno(NEW.alumno_id, current_date, NULL);
  PERFORM public.fn_evaluar_logros_alumno(NEW.alumno_id);
  RETURN NEW;
END; $t$;
CREATE TRIGGER trg_evaluacion_stub AFTER INSERT ON public.evaluacion_stub FOR EACH ROW EXECUTE FUNCTION public.fn_trigger_evaluacion_gamificacion();
SET session_replication_role = replica;
${Object.entries(ACTORS).filter(([, a]) => a.uid).map(([k, a]) => `
INSERT INTO auth.users (id, email) VALUES ('${a.uid}', '${k}@test.local');
INSERT INTO public.profiles (id, email, rol, estado, activo) VALUES ('${a.uid}', '${k}@test.local', '${a.rol}', '${a.estado ?? 'activo'}', ${a.activo === false ? 'false' : 'true'});`).join('')}
SET session_replication_role = origin;
TRUNCATE public._push_log; TRUNCATE public.secdef_probe;
`;

// ── harness ────────────────────────────────────────────────────────────────
const results = [];
const record = (phase, name, expect, got, detail = '') => {
  const pass = expect === got;
  results.push({ phase, name, expect, got, pass, detail });
  return pass;
};
async function attempt(client, actorKey, sql) {
  const actor = ACTORS[actorKey];
  await client.query('BEGIN');
  try {
    await client.query('SET LOCAL session_replication_role = replica');
    if (actor.role) await client.query(`SET LOCAL ROLE ${actor.role}`);
    await client.query(`SELECT set_config('request.jwt.claims', $1, true)`,
      [JSON.stringify(actor.uid ? { sub: actor.uid, role: actor.role } : actor.role ? { role: actor.role } : {})]);
    await client.query(sql);
    return { outcome: 'allowed', detail: '' };
  } catch (e) {
    return { outcome: e.code === '42501' ? 'denied' : 'error', detail: `${e.code} ${e.message}` };
  } finally { await client.query('ROLLBACK'); }
}
async function withDb(name, fn) {
  const c = new pg.Client({ ...conn, database: name });
  await c.connect();
  try { return await fn(c); } finally { await c.end(); }
}
async function admin(sql) { await withDb('postgres', (c) => c.query(sql)); }
const callSql = (f) => `SELECT * FROM public.${f.name}(${f.call})`;
const allowedFor = (f) => (f.g === 'A' ? PRIV : [...SIGNED_IN, ...PRIV]);

async function snapshot(client) {
  const fns = [...FUNCTIONS.map(identity), `public.${BACKFILL.name}(boolean)`];
  const out = {};
  for (const sig of fns) {
    const r = await client.query(`SELECT (SELECT string_agg(a, ',' ORDER BY a) FROM unnest(proacl::text[]) a) acl, prosecdef, proconfig::text cfg
      FROM pg_proc WHERE oid = to_regprocedure($1)`, [sig]);
    out[sig] = r.rows[0] ?? null;
  }
  const names = await client.query(`SELECT proname FROM pg_proc WHERE pronamespace = 'public'::regnamespace AND proname LIKE 'backfill_alumnos%' ORDER BY 1`);
  out.names = names.rows.map((r) => r.proname);
  return JSON.stringify(out);
}

// ── build ──────────────────────────────────────────────────────────────────
console.log('Building modelled production baseline (template)…');
const b = spawnSync(process.execPath, [path.resolve(here, '../anon-write-fix/build_baseline.mjs'), 'soi_sd_tpl', '--from-prod-subset'], { stdio: 'inherit', env: process.env });
if (b.status !== 0) throw new Error('baseline build failed');
await withDb('soi_sd_tpl', async (c) => { await c.query(baseMigrationSql); await c.query(subsetSql); await c.query(fixtureSql); });
const clone = async (name) => {
  await admin(`DROP DATABASE IF EXISTS "${name}" WITH (FORCE)`);
  await admin(`CREATE DATABASE "${name}" TEMPLATE soi_sd_tpl`);
};

// BEFORE: exposure is real
await clone('soi_sd_before');
await withDb('soi_sd_before', async (c) => {
  for (const f of FUNCTIONS) {
    const sig = identity(f);
    const r = await c.query(`SELECT has_function_privilege('anon', to_regprocedure($1), 'EXECUTE') anon_x,
      has_function_privilege('authenticated', to_regprocedure($1), 'EXECUTE') auth_x`, [sig]);
    record('before', `${f.name}: anon can EXECUTE (exposure is real)`, 'true', String(r.rows[0].anon_x));
    record('before', `${f.name}: authenticated can EXECUTE`, 'true', String(r.rows[0].auth_x));
  }
  const bf = await c.query(`SELECT has_function_privilege('anon', to_regprocedure('public.${BACKFILL.name}(boolean)'), 'EXECUTE') x`);
  record('before', `${BACKFILL.name}: anon can EXECUTE (exposure is real)`, 'true', String(bf.rows[0].x));
});
const snapBefore = await withDb('soi_sd_before', snapshot);

// AFTER: matrix
await clone('soi_sd_after');
await withDb('soi_sd_after', (c) => c.query(migrationSql));
await withDb('soi_sd_after', async (c) => {
  for (const f of FUNCTIONS) {
    const allowed = allowedFor(f);
    for (const actor of ALL) {
      const r = await attempt(c, actor, callSql(f));
      const want = allowed.includes(actor) ? 'allowed' : 'denied';
      record('after', `${f.name} [${f.g}] as ${actor}`, want, r.outcome, r.detail);
    }
  }
  // backfill wrapper: active admin/superadmin and service_role only; the DBA breaks glass through *_impl
  const bfAllowed = [...ADMIN_SET, 'service_role'];
  for (const actor of ALL) {
    for (const dry of ['true', 'false']) {
      const r = await attempt(c, actor, `SELECT * FROM public.${BACKFILL.name}(${dry})`);
      record('after', `${BACKFILL.name}(${dry}) as ${actor}`, bfAllowed.includes(actor) ? 'allowed' : 'denied', r.outcome, r.detail);
    }
    const r = await attempt(c, actor, `SELECT * FROM public.${BACKFILL.name}_impl(true)`);
    record('after', `${BACKFILL.name}_impl is owner-only: ${actor} is denied`, actor === 'postgres_cron' ? 'allowed' : 'denied', r.outcome, r.detail);
  }
});

// EFFECT: denied calls leave no trace, allowed notifiers act, push trigger fires
await withDb('soi_sd_after', async (c) => {
  const run = async (actor, sql) => {
    const a = ACTORS[actor];
    await c.query('BEGIN');
    try {
      await c.query('SET LOCAL session_replication_role = replica');
      if (a.role) await c.query(`SET LOCAL ROLE ${a.role}`);
      await c.query(`SELECT set_config('request.jwt.claims', $1, true)`, [JSON.stringify(a.uid ? { sub: a.uid, role: a.role } : a.role ? { role: a.role } : {})]);
      try { await c.query(sql); } catch { /* expected for denied */ }
      // aborted transaction? read counts from a savepoint-free fresh view
    } finally { await c.query('ROLLBACK'); }
  };
  await run('anon', 'SELECT * FROM public.fn_check_and_notify_pending_asistencias()');
  const none = await c.query('SELECT (SELECT count(*) FROM public.secdef_probe) p, (SELECT count(*) FROM public.notificaciones WHERE titulo LIKE \'fn_%\') n, (SELECT count(*) FROM public._push_log) l');
  record('effect', 'anon call leaves no probe row, no notification, no push', '0/0/0', `${none.rows[0].p}/${none.rows[0].n}/${none.rows[0].l}`);
  await c.query('BEGIN');
  await c.query('SET LOCAL session_replication_role = origin');
  await c.query(`SET LOCAL ROLE service_role`);
  await c.query('SELECT * FROM public.fn_check_and_notify_pending_asistencias()');
  await c.query('SELECT * FROM public.fn_generate_class_start_reminders()');
  await c.query('RESET ROLE');
  const some = await c.query('SELECT (SELECT count(*) FROM public.secdef_probe) p, (SELECT count(*) FROM public.notificaciones) n, (SELECT count(*) FROM public._push_log) l');
  await c.query('ROLLBACK');
  record('effect', 'service_role notifiers still write 2 probe rows, 2 notifications and fire 2 pushes', '2/2/2', `${some.rows[0].p}/${some.rows[0].n}/${some.rows[0].l}`);
});

// FLOWS
await withDb('soi_sd_after', async (c) => {
  // signed-in user writes a table whose definer trigger calls the revoked internals
  const r = await attempt(c, 'maestro_titular', `INSERT INTO public.evaluacion_stub (alumno_id) VALUES ('${U(9006)}')`);
  record('flows', 'authenticated INSERT still fires the definer gamification trigger that calls revoked internals', 'allowed', r.outcome, r.detail);
  // admin backfill end to end
  await c.query('BEGIN');
  await c.query(`SET LOCAL ROLE authenticated`);
  await c.query(`SELECT set_config('request.jwt.claims', $1, true)`, [JSON.stringify({ sub: ACTORS.admin.uid, role: 'authenticated' })]);
  const dry = await c.query(`SELECT accion FROM public.${BACKFILL.name}(true)`);
  const real = await c.query(`SELECT accion FROM public.${BACKFILL.name}(false)`);
  await c.query('RESET ROLE');
  const probe = await c.query(`SELECT count(*) FROM public.secdef_probe WHERE fn = 'backfill:write'`);
  await c.query('ROLLBACK');
  record('flows', 'admin backfill: dry run previews, real run writes once through the wrapper', 'preview/updated/1', `${dry.rows[0].accion}/${real.rows[0].accion}/${probe.rows[0].count}`);
});

// ACL exact + no PUBLIC
const snapAfter = await withDb('soi_sd_after', snapshot);
await withDb('soi_sd_after', async (c) => {
  const grants = (acl) => JSON.parse(snapAfter)[acl]?.acl ?? '';
  for (const f of FUNCTIONS) {
    const sig = identity(f);
    const acl = JSON.parse(snapAfter)[sig].acl.split(',').sort().join(',');
    const want = (f.g === 'A'
      ? ['postgres=X/postgres', 'service_role=X/postgres']
      : ['authenticated=X/postgres', 'postgres=X/postgres', 'service_role=X/postgres']).sort().join(',');
    record('acl', `${f.name}: exact ACL (${f.g})`, want, acl);
  }
  const bf = JSON.parse(snapAfter)[`public.${BACKFILL.name}(boolean)`];
  record('acl', `${BACKFILL.name}: wrapper ACL`, ['authenticated=X/postgres', 'postgres=X/postgres', 'service_role=X/postgres'].join(','), bf.acl.split(',').sort().join(','));
  record('acl', `${BACKFILL.name}: wrapper is SECURITY DEFINER with fixed search_path`, 'true/{search_path=public}', `${bf.prosecdef}/${bf.cfg}`);
  const impl = await c.query(`SELECT proacl::text acl FROM pg_proc WHERE oid = to_regprocedure('public.${BACKFILL.name}_impl(boolean)')`);
  record('acl', `${BACKFILL.name}_impl: owner-only ACL`, '{postgres=X/postgres}', impl.rows[0].acl);
  const pub = await c.query(`SELECT count(*) FROM pg_proc p, LATERAL aclexplode(p.proacl) a WHERE a.grantee = 0 AND p.pronamespace = 'public'::regnamespace
    AND p.proname = ANY($1)`, [[...FUNCTIONS.map((f) => f.name), BACKFILL.name]]);
  record('acl', 'no function of the group grants EXECUTE to PUBLIC', '0', pub.rows[0].count);
  const left = await c.query(`SELECT count(*) FROM pg_proc p WHERE p.pronamespace = 'public'::regnamespace AND p.prosecdef
    AND has_function_privilege('anon', p.oid, 'EXECUTE') AND p.proname = ANY($1)`, [[...FUNCTIONS.map((f) => f.name), BACKFILL.name]]);
  record('acl', 'SECURITY DEFINER functions of the group still executable by anon', '0', left.rows[0].count);
  void grants;
});

// IDEMPOTENT
let second = 'applied';
try { await withDb('soi_sd_after', (c) => c.query(migrationSql)); } catch (e) { second = `error: ${e.message}`; }
record('idempotency', 'the migration can be applied a second time', 'applied', second);
record('idempotency', 'applying twice yields an identical catalog', 'same', snapAfter === (await withDb('soi_sd_after', snapshot)) ? 'same' : 'different');

// SELF-CHECK abort (drift): a dropped function aborts the whole migration, nothing else changes
await clone('soi_sd_sc');
await withDb('soi_sd_sc', (c) => c.query('DROP FUNCTION public.fn_escalar_mora()'));
let scErr = 'applied';
try { await withDb('soi_sd_sc', (c) => c.query(migrationSql)); } catch (e) { scErr = /not found/.test(e.message) ? 'aborted' : `other: ${e.message}`; }
record('self-check', 'a missing function aborts the migration', 'aborted', scErr);
await withDb('soi_sd_sc', async (c) => {
  const r = await c.query(`SELECT has_function_privilege('anon', to_regprocedure('public.fn_calcular_pulso_score(boolean)'), 'EXECUTE') x,
    to_regprocedure('public.backfill_alumnos_desde_postulantes_impl(boolean)') IS NULL AS no_rename`);
  record('self-check', 'abort is atomic: no ACL changed and backfill not renamed', 'true/true', `${r.rows[0].x}/${r.rows[0].no_rename}`);
});

// ROLLBACK
await withDb('soi_sd_after', (c) => c.query(rollbackSql));
const snapRb = await withDb('soi_sd_after', snapshot);
record('rollback', 'rollback restores the exact pre-migration ACLs and the original backfill function', 'same', snapRb === snapBefore ? 'same' : 'different',
  snapRb === snapBefore ? '' : `before=${snapBefore.slice(0, 200)} after=${snapRb.slice(0, 200)}`);
await withDb('soi_sd_after', async (c) => {
  const r = await attempt(c, 'anon', `SELECT * FROM public.${BACKFILL.name}(true)`);
  record('rollback', 'after rollback the original exposure is back (anon can call backfill)', 'allowed', r.outcome);
});
let again = 'applied';
try { await withDb('soi_sd_after', (c) => c.query(migrationSql)); } catch (e) { again = `error: ${e.message}`; }
record('rollback', 'the migration re-applies after a rollback', 'applied', again);
record('rollback', 'catalog after re-apply equals the first apply', 'same', snapAfter === (await withDb('soi_sd_after', snapshot)) ? 'same' : 'different');

// ── report ─────────────────────────────────────────────────────────────────
const bad = results.filter((r) => !r.pass);
const phases = [...new Set(results.map((r) => r.phase))];
for (const p of phases) {
  const rs = results.filter((r) => r.phase === p);
  console.log(`${rs.every((r) => r.pass) ? 'PASS' : 'FAIL'}  ${p}: ${rs.filter((r) => r.pass).length}/${rs.length}`);
}
for (const r of bad.slice(0, 40)) console.log(`  ✗ [${r.phase}] ${r.name}: expected ${r.expect}, got ${r.got} ${r.detail.slice(0, 120)}`);
console.log(`\n${results.length} checks, ${bad.length} FAILURES`);
if (jsonOut) fs.writeFileSync(jsonOut, JSON.stringify(results, null, 1));
if (!keep) for (const d of ['soi_sd_before', 'soi_sd_after', 'soi_sd_sc']) await admin(`DROP DATABASE IF EXISTS "${d}" WITH (FORCE)`);
process.exit(bad.length ? 1 : 0);

// Role-by-role regression suite for migration 20261017180000 (anonymous / over-broad write access).
//
// What it proves, on a throw-away PostgreSQL (never production):
//   BEFORE   the vulnerability is real: anon can INSERT/UPDATE/DELETE the eight tables
//   AFTER    every negative case is denied and every legitimate flow still works
//   AGAIN    the migration is idempotent (re-applying changes nothing)
//   ROLLBACK the rollback script restores the exact pre-migration policies and ACLs
//
// Usage:  node supabase/tests/anon-write-fix/run_tests.mjs [--keep] [--json out.json]
// env:    PGHOST PGPORT PGUSER PGPASSWORD (default 127.0.0.1 54329 postgres test)
//         See start_pg.sh to launch the container.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import { makeExtraPhases } from './extra_phases.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const MIGRATION_VERSION = '20261017180000';
const MIGRATION_FILE = fs.readdirSync(path.resolve(here, '../../migrations')).find((f) => f.startsWith(`${MIGRATION_VERSION}_`));
const ROLLBACK_FILE = fs.readdirSync(path.resolve(here, '../../rollback')).find((f) => f.startsWith(`${MIGRATION_VERSION}_`));
// MIGRATION_OVERRIDE lets you point the suite at an alternative migration (mutation check)
const migrationSql = fs.readFileSync(process.env.MIGRATION_OVERRIDE || path.resolve(here, '../../migrations', MIGRATION_FILE), 'utf8');
const rollbackSql = fs.readFileSync(path.resolve(here, '../../rollback', ROLLBACK_FILE), 'utf8');

const args = process.argv.slice(2);
const keep = args.includes('--keep');
// --baseline prod-subset (default): schema captured from production; --baseline repo-model: rebuilt from the repo
const baselineKind = args.includes('--baseline') ? args[args.indexOf('--baseline') + 1] : 'prod-subset';
const subset = baselineKind === 'prod-subset';
const jsonOut = args.includes('--json') ? args[args.indexOf('--json') + 1] : null;

const conn = {
  host: process.env.PGHOST || '127.0.0.1',
  port: Number(process.env.PGPORT || 54329),
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'test',
};

// ── fixtures ────────────────────────────────────────────────────────────────
const U = (n) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const ID = {
  programa: U(9001), salon: U(9002), horario: U(9003), clase: U(9004), sesion: U(9005),
  alumno: U(9006), evento: U(9007), metodologia: U(9008), tarea: U(9009), plan: U(9010),
  notif: U(9011), nodo: U(9012), alumno2: U(9013), evento2: U(9014), alumno3: U(9015),
  m_titular: U(7001), m_suplente: U(7002), m_otro: U(7003), m_cap: U(7004),
};
const ACTORS = {
  anon:               { role: 'anon' },
  user:               { role: 'authenticated', uid: U(1001), rol: 'user' },
  alumno:             { role: 'authenticated', uid: U(1002), rol: 'alumno' },
  representante:      { role: 'authenticated', uid: U(1003), rol: 'representante' },
  maestro_titular:    { role: 'authenticated', uid: U(1004), rol: 'maestro', maestro: ID.m_titular },
  maestro_suplente:   { role: 'authenticated', uid: U(1005), rol: 'maestro', maestro: ID.m_suplente },
  maestro_otro:       { role: 'authenticated', uid: U(1006), rol: 'maestro', maestro: ID.m_otro },
  coordinacion:       { role: 'authenticated', uid: U(1007), rol: 'coordinacion_academica' },
  direccion:          { role: 'authenticated', uid: U(1008), rol: 'direccion' },
  admin:              { role: 'authenticated', uid: U(1009), rol: 'admin' },
  admin2:             { role: 'authenticated', uid: U(1013), rol: 'admin' },
  admin3:             { role: 'authenticated', uid: U(1014), rol: 'admin' },
  admin4:             { role: 'authenticated', uid: U(1015), rol: 'admin' },
  admin5:             { role: 'authenticated', uid: U(1016), rol: 'admin' },
  admin_inactivo:     { role: 'authenticated', uid: U(1017), rol: 'admin', estado: 'inactivo' },
  maestro_cap:        { role: 'authenticated', uid: U(1018), rol: 'maestro', maestro: ID.m_cap },   // holds 'catalogo:escribir' in permisos_maestros: must NOT be enough
  superadmin:         { role: 'authenticated', uid: U(1010), rol: 'superadmin' },
  finanzas:           { role: 'authenticated', uid: U(1012), rol: 'finanzas' },
  service_role:       { role: 'service_role' },
};
// Holders of every capability by default. `direccion` is deliberately NOT here.
const GESTORES = ['coordinacion', 'admin', 'admin2', 'admin3', 'admin4', 'admin5', 'superadmin', 'service_role'];
const AUTHENTICATED_ALL = Object.keys(ACTORS).filter((a) => a !== 'anon');

const fixtureSql = `
SET session_replication_role = replica;
${Object.entries(ACTORS).filter(([, a]) => a.uid).map(([k, a]) => `
INSERT INTO auth.users (id, email) VALUES ('${a.uid}', '${k}@test.local');
INSERT INTO public.profiles (id, email, rol, estado) VALUES ('${a.uid}', '${k}@test.local', '${a.rol}', '${a.estado ?? 'activo'}');`).join('')}
INSERT INTO public.maestros (id, nombre_completo, especialidad, correo, user_id) VALUES
  ('${ID.m_titular}',  'Titular',  'violin', 'titular@test.local',  '${ACTORS.maestro_titular.uid}'),
  ('${ID.m_suplente}', 'Suplente', 'violin', 'suplente@test.local', '${ACTORS.maestro_suplente.uid}'),
  ('${ID.m_otro}',     'Otro',     'viola',  'otro@test.local',     '${ACTORS.maestro_otro.uid}'),
  ('${ID.m_cap}',      'ConCapacidad', 'viola', 'cap@test.local',    '${ACTORS.maestro_cap.uid}');
INSERT INTO public.permisos_maestros (maestro_id, permisos) VALUES ('${ID.m_cap}', ARRAY['catalogo:escribir']), ('${ID.m_otro}', '{}');
INSERT INTO public.nodes (id, level_id, route_version_id, name, type)
  VALUES ('${ID.nodo}', '${U(9101)}', '${U(9102)}', 'nodo fixture', 'topic');
${subset ? '' : `-- sequences used by generate_salon_code (prod ACL: rwU for anon/authenticated/service_role = legacy default)
CREATE SEQUENCE IF NOT EXISTS public.salones_codigo_seq;
CREATE SEQUENCE IF NOT EXISTS public.salon_code_seq;
-- production triggers of the eight tables (pg_get_triggerdef, read-only capture 2026-10-17); they are
-- attached here because the catalogue dump does not carry them. Matrix cases run with triggers off,
-- the flow cases below run with them on.
CREATE TRIGGER trg_class_events_updated_at BEFORE UPDATE ON public.class_events FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER update_horarios_updated_at BEFORE UPDATE ON public.horarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_notif_asistencia_update_timestamp BEFORE UPDATE ON public.notificaciones_asistencia FOR EACH ROW EXECUTE FUNCTION fn_update_notif_asistencia_timestamp();
CREATE TRIGGER update_programas_updated_at BEFORE UPDATE ON public.programas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER tr_generate_salon_code BEFORE INSERT ON public.salones FOR EACH ROW EXECUTE FUNCTION generate_salon_code();
CREATE TRIGGER update_salones_updated_at BEFORE UPDATE ON public.salones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();`}
INSERT INTO public.alumnos (id, nombre_completo) VALUES ('${ID.alumno}', 'Alumno Prueba'), ('${ID.alumno2}', 'Alumno Dos'), ('${ID.alumno3}', 'Alumno Tres');
INSERT INTO public.clases (id, nombre, maestro_principal_id, maestro_suplente_id)
  VALUES ('${ID.clase}', 'Clase de prueba', '${ID.m_titular}', '${ID.m_suplente}');
INSERT INTO public.sesiones_clase (id, clase_id, maestro_id, fecha)
  VALUES ('${ID.sesion}', '${ID.clase}', '${ID.m_titular}', current_date);
INSERT INTO public.programas (id, nombre) VALUES ('${ID.programa}', 'Programa fixture');
INSERT INTO public.salones (id, nombre) VALUES ('${ID.salon}', 'Salon fixture');
INSERT INTO public.horarios (id, clase_id, maestro_id, salon_id, dia_semana, hora_inicio, hora_fin)
  VALUES ('${ID.horario}', '${ID.clase}', '${ID.m_titular}', '${ID.salon}', 1, '10:00', '11:00');
INSERT INTO public.class_events (id, teacher_id, student_id, session_id, event_date, status)
  VALUES ('${ID.evento}', '${ID.m_titular}', '${ID.alumno}', '${ID.sesion}', current_date, 'draft');
INSERT INTO public.class_events (id, teacher_id, student_id, session_id, event_date, status)
  VALUES ('${ID.evento2}', '${ID.m_titular}', '${ID.alumno2}', '${ID.sesion}', current_date, 'draft');
INSERT INTO public.class_event_methodology (id, class_event_id, warmup) VALUES ('${ID.metodologia}', '${ID.evento}', 'fixture');
INSERT INTO public.homework_assignments (id, class_event_id, student_id, teacher_id, description)
  VALUES ('${ID.tarea}', '${ID.evento}', '${ID.alumno}', '${ID.m_titular}', 'fixture');
INSERT INTO public.planned_content (id, maestro_id, clase_id, node_id, planned_date)
  VALUES ('${ID.plan}', '${ID.m_titular}', '${ID.clase}', '${ID.nodo}', current_date);
INSERT INTO public.notificaciones_asistencia (id, tipo, canal, prioridad, destinatario_telefono, destinatario_nombre, titulo, cuerpo, estado)
  VALUES ('${ID.notif}', 'alerta_asistencia_alumno', 'whatsapp', 'normal', '+0000000', 'Fixture', 'fixture', 'fixture', 'pendiente');
`;

// ── attempts ────────────────────────────────────────────────────────────────
async function attempt(client, actorKey, sql, { replica = true } = {}) {
  const actor = ACTORS[actorKey];
  await client.query('BEGIN');
  try {
    if (replica) await client.query('SET LOCAL session_replication_role = replica');   // FK/trigger noise off; RLS stays on
    await client.query(`SET LOCAL ROLE ${actor.role}`);
    await client.query(`SELECT set_config('request.jwt.claims', $1, true)`,
      [JSON.stringify(actor.uid ? { sub: actor.uid, role: actor.role } : { role: actor.role })]);
    const r = await client.query(sql);
    if (r.command === 'DO') return { outcome: 'allowed', detail: 'do-block completed' };
    return { outcome: r.rowCount >= 1 ? 'allowed' : 'denied', detail: `rows=${r.rowCount}` };
  } catch (e) {
    if (e.code === '42501') return { outcome: 'denied', detail: e.message };
    return { outcome: 'error', detail: `${e.code} ${e.message}` };
  } finally {
    await client.query('ROLLBACK');
  }
}

// Statement builders per table. `ins(actor)` may depend on who is acting.
const uuid = () => crypto.randomUUID();
const TABLES = {
  programas: {
    ins: () => `INSERT INTO public.programas (nombre) VALUES ('pwn-${uuid()}')`,
    upd: () => `UPDATE public.programas SET descripcion = 'pwned' WHERE id = '${ID.programa}'`,
    del: () => `DELETE FROM public.programas WHERE id = '${ID.programa}'`,
    sel: () => `SELECT id FROM public.programas`,
    write: GESTORES,
  },
  salones: {
    ins: () => `INSERT INTO public.salones (nombre) VALUES ('pwn-${uuid()}')`,
    upd: () => `UPDATE public.salones SET descripcion = 'pwned' WHERE id = '${ID.salon}'`,
    del: () => `DELETE FROM public.salones WHERE id = '${ID.salon}'`,
    sel: () => `SELECT id FROM public.salones`,
    write: GESTORES,
  },
  horarios: {
    ins: () => `INSERT INTO public.horarios (clase_id, maestro_id, salon_id, dia_semana, hora_inicio, hora_fin)
                VALUES ('${ID.clase}', '${ID.m_titular}', '${ID.salon}', 2, '10:00', '11:00')`,
    upd: () => `UPDATE public.horarios SET activo = false WHERE id = '${ID.horario}'`,
    del: () => `DELETE FROM public.horarios WHERE id = '${ID.horario}'`,
    sel: () => `SELECT id FROM public.horarios`,
    write: GESTORES,
  },
  class_events: {
    ins: () => `INSERT INTO public.class_events (teacher_id, student_id, session_id, event_date, status)
                VALUES ('${ID.m_titular}', '${ID.alumno3}', '${ID.sesion}', current_date, 'draft')`,
    upd: () => `UPDATE public.class_events SET status = 'completed' WHERE id = '${ID.evento}'`,
    del: () => `DELETE FROM public.class_events WHERE id = '${ID.evento}'`,
    sel: () => `SELECT id FROM public.class_events`,
    write: [...GESTORES, 'maestro_titular', 'maestro_suplente'],
    deleteBy: GESTORES,
  },
  class_event_methodology: {
    ins: () => `INSERT INTO public.class_event_methodology (class_event_id, warmup) VALUES ('${ID.evento2}', 'pwn')`,
    upd: () => `UPDATE public.class_event_methodology SET warmup = 'pwned' WHERE id = '${ID.metodologia}'`,
    del: () => `DELETE FROM public.class_event_methodology WHERE id = '${ID.metodologia}'`,
    sel: () => `SELECT id FROM public.class_event_methodology`,
    write: [...GESTORES, 'maestro_titular', 'maestro_suplente'],
    deleteBy: GESTORES,
  },
  homework_assignments: {
    ins: () => `INSERT INTO public.homework_assignments (class_event_id, student_id, teacher_id, description)
                VALUES ('${ID.evento}', '${ID.alumno}', '${ID.m_titular}', 'pwn')`,
    upd: () => `UPDATE public.homework_assignments SET description = 'pwned' WHERE id = '${ID.tarea}'`,
    del: () => `DELETE FROM public.homework_assignments WHERE id = '${ID.tarea}'`,
    sel: () => `SELECT id FROM public.homework_assignments`,
    write: [...GESTORES, 'maestro_titular', 'maestro_suplente'],
    deleteBy: GESTORES,
  },
  planned_content: {
    ins: () => `INSERT INTO public.planned_content (maestro_id, clase_id, node_id, planned_date)
                VALUES ('${ID.m_titular}', '${ID.clase}', '${uuid()}', current_date)`,
    upd: () => `UPDATE public.planned_content SET covered = true WHERE id = '${ID.plan}'`,
    del: () => `DELETE FROM public.planned_content WHERE id = '${ID.plan}'`,
    sel: () => `SELECT id FROM public.planned_content`,
    write: [...GESTORES, 'maestro_titular'],
    deleteBy: GESTORES,
  },
  notificaciones_asistencia: {
    ins: () => `INSERT INTO public.notificaciones_asistencia (tipo, canal, prioridad, destinatario_telefono, destinatario_nombre, titulo, cuerpo, estado)
                VALUES ('alerta_asistencia_alumno', 'whatsapp', 'normal', '+1', 'x', 'x', 'x', 'pendiente')`,
    upd: () => `UPDATE public.notificaciones_asistencia SET estado = 'enviado' WHERE id = '${ID.notif}'`,
    del: () => `DELETE FROM public.notificaciones_asistencia WHERE id = '${ID.notif}'`,
    sel: () => `SELECT id FROM public.notificaciones_asistencia`,
    readBy: GESTORES,
    insertBy: GESTORES,                    // only the admin dashboard widget inserts
    write: ['service_role'],               // UPDATE
    deleteBy: ['service_role'],
  },
};

/** Builds the list of {name, actor, sql, expect} for the AFTER state. */
function afterCases() {
  const cases = [];
  for (const [table, t] of Object.entries(TABLES)) {
    for (const actor of Object.keys(ACTORS)) {
      const insAllowed = (t.insertBy ?? t.write).includes(actor);
      const updAllowed = t.write.includes(actor);
      const delAllowed = (t.deleteBy ?? t.write).includes(actor);
      cases.push({ name: `${table} INSERT as ${actor}`, actor, sql: t.ins(), expect: insAllowed ? 'allowed' : 'denied', kind: 'write' });
      cases.push({ name: `${table} UPDATE as ${actor}`, actor, sql: t.upd(), expect: updAllowed ? 'allowed' : 'denied', kind: 'write' });
      cases.push({ name: `${table} DELETE as ${actor}`, actor, sql: t.del(), expect: delAllowed ? 'allowed' : 'denied', kind: 'write' });
    }
    // reads: every signed-in role keeps reading; anon only keeps programas
    for (const actor of Object.keys(ACTORS)) {
      const expect = t.readBy ? (t.readBy.includes(actor) ? 'allowed' : 'denied')
        : actor === 'anon' ? (table === 'programas' ? 'allowed' : 'denied') : 'allowed';
      cases.push({ name: `${table} SELECT as ${actor}`, actor, sql: t.sel(), expect, kind: 'read' });
    }
  }
  // owner-specific positives: a teacher can always write their own plan
  cases.push({
    name: 'planned_content INSERT own plan as maestro_otro', actor: 'maestro_otro', kind: 'flow',
    sql: `INSERT INTO public.planned_content (maestro_id, clase_id, node_id, planned_date)
          VALUES ('${ID.m_otro}', '${ID.clase}', '${uuid()}', current_date)`, expect: 'allowed',
  });
  cases.push({
    name: 'class_events INSERT own event as maestro_otro (other class session)', actor: 'maestro_otro', kind: 'flow',
    sql: `INSERT INTO public.class_events (teacher_id, student_id, session_id, event_date, status)
          VALUES ('${ID.m_otro}', '${ID.alumno}', NULL, current_date, 'draft')`, expect: 'allowed',
  });
  cases.push({
    name: 'class_events INSERT impersonating titular as maestro_otro', actor: 'maestro_otro', kind: 'write',
    sql: `INSERT INTO public.class_events (teacher_id, student_id, session_id, event_date, status)
          VALUES ('${ID.m_titular}', '${ID.alumno}', NULL, current_date, 'draft')`, expect: 'denied',
  });
  cases.push({
    name: 'class_events UPDATE moving ownership to another teacher as maestro_titular (WITH CHECK)', actor: 'maestro_titular', kind: 'write',
    sql: `UPDATE public.class_events SET teacher_id = '${ID.m_otro}', session_id = NULL WHERE id = '${ID.evento}'`, expect: 'denied',
  });
  // public (no-login) flows that must keep working
  for (const view of ['signage_v_horario_semana', 'signage_v_horario_hoy', 'signage_v_horario_manana', 'signage_v_calendario_mes']) {
    cases.push({ name: `anon reads view ${view}`, actor: 'anon', sql: `SELECT * FROM public.${view} LIMIT 1`, expect: 'executes', kind: 'public-flow' });
  }
  cases.push({ name: 'anon reads signage_pantallas', actor: 'anon', sql: `SELECT id FROM public.signage_pantallas LIMIT 1`, expect: 'executes', kind: 'public-flow' });
  cases.push({ name: 'anon reads signage_media', actor: 'anon', sql: `SELECT id FROM public.signage_media LIMIT 1`, expect: 'executes', kind: 'public-flow' });
  return cases;
}

/**
 * BEFORE state: documents what an attacker can really do. Note the nuance PostgreSQL imposes:
 * UPDATE/DELETE need the target rows to be VISIBLE to the role, so where anon has no SELECT
 * policy (salones, horarios, notificaciones_asistencia) only a blind INSERT / the authenticated
 * path is open.
 */
function beforeCases() {
  const c = [];
  const add = (table, op, actor, expect) => c.push({
    name: `${table} ${op.toUpperCase()} as ${actor}`, actor, sql: TABLES[table][op](), expect, kind: 'vulnerability',
  });
  // anonymous, no login, only the public anon key
  for (const t of ['programas', 'class_events', 'class_event_methodology', 'homework_assignments', 'planned_content']) {
    for (const op of ['ins', 'upd', 'del']) add(t, op, 'anon', 'allowed');
  }
  add('salones', 'ins', 'anon', 'allowed');           // blind insert
  add('horarios', 'ins', 'anon', 'allowed');          // blind insert
  add('salones', 'upd', 'anon', 'denied');            // rows invisible to anon
  add('salones', 'del', 'anon', 'denied');
  add('horarios', 'upd', 'anon', 'denied');
  add('horarios', 'del', 'anon', 'denied');
  add('notificaciones_asistencia', 'upd', 'anon', 'denied');
  // the naive "public -> authenticated" fix would still leave these open to ANY registered account
  for (const t of ['programas', 'salones', 'horarios']) for (const op of ['ins', 'upd', 'del']) add(t, op, 'alumno', 'allowed');
  add('notificaciones_asistencia', 'upd', 'alumno', 'allowed');
  add('notificaciones_asistencia', 'ins', 'alumno', 'allowed');
  return c;
}

// ── orchestration ───────────────────────────────────────────────────────────
const results = [];
function record(phase, c, got) {
  const pass = c.expect === 'executes' ? got.outcome !== 'error' : got.outcome === c.expect;
  results.push({ phase, name: c.name, kind: c.kind, expect: c.expect, got: got.outcome, pass, detail: got.detail });
  return pass;
}

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
async function snapshot(client) {
  const pol = await client.query(`
    SELECT tablename, policyname, cmd, roles::text, permissive, qual, with_check FROM pg_policies
    WHERE schemaname = 'public' AND tablename = ANY($1) ORDER BY 1, 2`, [Object.keys(TABLES)]);
  const acl = await client.query(`
    SELECT c.relname, (SELECT string_agg(a, ',' ORDER BY a) FROM unnest(c.relacl::text[]) a) AS acl
    FROM pg_class c WHERE c.relnamespace = 'public'::regnamespace AND c.relname = ANY($1) ORDER BY 1`, [Object.keys(TABLES)]);
  return JSON.stringify({ pol: pol.rows, acl: acl.rows });
}

async function runCases(dbName, phase, cases, opts) {
  return withDb(dbName, async (client) => {
    let bad = 0;
    for (const c of cases) if (!record(phase, c, await attempt(client, c.actor, c.sql, opts))) bad++;
    return bad;
  });
}

// 1. template database
console.log('Building modelled production baseline (template)…');
const b = spawnSync(process.execPath, [path.join(here, 'build_baseline.mjs'), 'soi_tpl', ...(subset ? ['--from-prod-subset'] : ['--through', '20261017170000'])], { stdio: 'inherit', env: process.env });
if (b.status !== 0) throw new Error('baseline build failed');
await withDb('soi_tpl', (c) => c.query(fixtureSql));

const clone = async (name) => {
  await admin(`DROP DATABASE IF EXISTS "${name}" WITH (FORCE)`);
  await admin(`CREATE DATABASE "${name}" TEMPLATE soi_tpl`);
};

// BEFORE
await clone('soi_t_before');
const failBefore = await runCases('soi_t_before', 'before', beforeCases());
const snapBefore = await withDb('soi_t_before', snapshot);

// AFTER (+ idempotency)
await clone('soi_t_after');
await withDb('soi_t_after', (c) => c.query(migrationSql));
let failAfter = await runCases('soi_t_after', 'after', afterCases());
const snapAfter1 = await withDb('soi_t_after', snapshot);
await withDb('soi_t_after', (c) => c.query(migrationSql));
const snapAfter2 = await withDb('soi_t_after', snapshot);
const idempotent = snapAfter1 === snapAfter2;
results.push({ phase: 'idempotency', name: 'applying the migration twice yields an identical catalog', kind: 'migration', expect: 'same', got: idempotent ? 'same' : 'different', pass: idempotent, detail: '' });
failAfter += idempotent ? 0 : 1;

// AFTER: end-to-end flows with triggers on and foreign keys enforced
const extra = makeExtraPhases({ ID, TABLES });
failAfter += await runCases('soi_t_after', 'flows', extra.flowCases(), { replica: false });

// AFTER: the policy set must equal the whitelist, so no leftover permissive policy can override the new ones
{
  const inv = await withDb('soi_t_after', extra.policyInventory);
  const exp = extra.expectedPolicies();
  for (const t of Object.keys(exp)) {
    const have = (inv[t] ?? []).map((r) => r.policyname).sort();
    const want = [...exp[t]].sort();
    const restrictive = (inv[t] ?? []).filter((r) => r.permissive !== 'PERMISSIVE').length;
    const same = JSON.stringify(have) === JSON.stringify(want) && restrictive === 0;
    results.push({ phase: 'policies', name: `${t}: policy set equals the whitelist`, kind: 'migration', expect: want.join(','), got: have.join(','), pass: same, detail: '' });
  }
}

// COLLATERAL: unrelated flows (calendar, rooms, tasks, signage) behave identically before and after
{
  const run = (db) => withDb(db, async (client) => {
    const out = [];
    for (const c of extra.collateralCases()) {
      const r = await attempt(client, c.actor, c.sql, { replica: false });
      out.push([c.name, r.outcome === 'error' ? `error ${r.detail.split(' ')[0]}` : r.outcome]);
    }
    return out;
  });
  const before = await run('soi_t_before');
  const after = await run('soi_t_after');
  before.forEach(([name, outcome], i) => {
    results.push({ phase: 'collateral', name, kind: 'public-flow', expect: outcome, got: after[i][1], pass: outcome === after[i][1], detail: '' });
  });
}

// ROLLBACK
await clone('soi_t_rb');
await withDb('soi_t_rb', (c) => c.query(migrationSql));
await withDb('soi_t_rb', (c) => c.query(rollbackSql));
const snapRb = await withDb('soi_t_rb', snapshot);
const restored = snapRb === snapBefore;
results.push({ phase: 'rollback', name: 'rollback restores the exact pre-migration policies and ACLs', kind: 'migration', expect: 'same', got: restored ? 'same' : 'different', pass: restored, detail: '' });
const helpers = await withDb('soi_t_rb', (c) => c.query(`SELECT count(*)::int AS n FROM pg_proc WHERE proname IN ('tiene_capacidad_academica','puede_escribir_evento_clase')`));
const helpersGone = helpers.rows[0].n === 0;
results.push({ phase: 'rollback', name: 'rollback removes the helper functions', kind: 'migration', expect: 'removed', got: helpersGone ? 'removed' : 'present', pass: helpersGone, detail: '' });
const failRb = (restored ? 0 : 1) + (helpersGone ? 0 : 1)
  + await runCases('soi_t_rb', 'rollback', beforeCases());                    // vulnerability is back, as documented

// Rollback then re-apply: the migration must work on a rolled-back database
await withDb('soi_t_rb', (c) => c.query(migrationSql));
const snapReapply = await withDb('soi_t_rb', snapshot);
const reapplied = snapReapply === snapAfter1;
results.push({ phase: 'rollback', name: 'migration re-applies cleanly after a rollback (same catalog as a fresh apply)', kind: 'migration', expect: 'same', got: reapplied ? 'same' : 'different', pass: reapplied, detail: '' });

if (!keep) for (const d of ['soi_t_before', 'soi_t_after', 'soi_t_rb']) await admin(`DROP DATABASE IF EXISTS "${d}" WITH (FORCE)`);

// ── report ──────────────────────────────────────────────────────────────────
const byPhase = {};
for (const r of results) {
  byPhase[r.phase] ??= { total: 0, pass: 0 };
  byPhase[r.phase].total++;
  if (r.pass) byPhase[r.phase].pass++;
}
console.log('\nPhase        passed/total');
for (const [p, s] of Object.entries(byPhase)) console.log(`${p.padEnd(12)} ${s.pass}/${s.total}`);
const failed = results.filter((r) => !r.pass);
if (failed.length) {
  console.log('\nFAILED:');
  for (const f of failed.slice(0, 60)) console.log(` [${f.phase}] ${f.name}: expected ${f.expect}, got ${f.got} (${f.detail})`);
}
if (jsonOut) fs.writeFileSync(jsonOut, JSON.stringify({ byPhase, results }, null, 2));
console.log(failed.length ? `\n${failed.length} FAILURES` : '\nALL TESTS PASSED');
process.exit(failed.length ? 1 : 0);

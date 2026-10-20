// Role-by-role regression suite for migration 20261020120000 (block 1: student data open to any
// authenticated account). Runs on a throw-away PostgreSQL (never production).
//
//   BEFORE     the exposure is real (any signed-in account reads/rewrites/deletes; anon reads alumnos_programas)
//   AFTER      matrix actor x table x operation, flows with triggers ON and FKs enforced
//   ACL        exact table and column privileges
//   POLICIES   the policy set equals a whitelist (no leftover permissive policy can override the new ones)
//   SELF-CHECK an unknown residual policy makes the migration abort atomically
//   IDEMPOTENT applying twice leaves the catalog unchanged
//   ROLLBACK   restores the exact pre-migration policies and ACLs; the migration re-applies afterwards
//
// Usage:  node supabase/tests/authenticated-wide-open/run_tests.mjs [--keep] [--json out.json]
// env:    PGHOST PGPORT PGUSER PGPASSWORD (default 127.0.0.1 54329 postgres test); MIGRATION_OVERRIDE=<file>
//         swaps the migration under test (used by mutation_check.mjs).
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const here = path.dirname(fileURLToPath(import.meta.url));
const MIG_DIR = path.resolve(here, '../../migrations');
const VERSION = '20261020120000';
const BASE_VERSION = '20261017180000';
const find = (dir, v) => fs.readdirSync(dir).find((f) => f.startsWith(`${v}_`));
const migrationSql = fs.readFileSync(process.env.MIGRATION_OVERRIDE || path.join(MIG_DIR, find(MIG_DIR, VERSION)), 'utf8');
const rollbackSql = fs.readFileSync(path.resolve(here, '../../rollback', find(path.resolve(here, '../../rollback'), VERSION)), 'utf8');
const baseMigrationSql = fs.readFileSync(path.join(MIG_DIR, find(MIG_DIR, BASE_VERSION)), 'utf8');
const subsetSql = fs.readFileSync(path.join(here, 'prod_schema_subset_block1_2026-10-20.sql'), 'utf8');

const args = process.argv.slice(2);
const keep = args.includes('--keep');
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
  programa: U(9001), clase: U(9004), sesion: U(9005), alumno: U(9006), alumno2: U(9013),
  m_titular: U(7001), m_suplente: U(7002), m_otro: U(7003), m_sinactivo: U(7005),
  ap: U(9101), esc: U(9102), caso: U(9103), accion: U(9104), evento: U(9105), alerta: U(9106), seg: U(9107),
  post1: U(9108), post2: U(9109), n_titular: U(9110), n_admin: U(9111), n_null: U(9112), n_otro: U(9113),
  reg1: U(9114), reg2: U(9115), tarea: U(9116), coment: U(9117),
};
const ACTORS = {
  anon:             { role: 'anon' },
  user:             { role: 'authenticated', uid: U(1001), rol: 'user' },
  alumno:           { role: 'authenticated', uid: U(1002), rol: 'alumno' },
  representante:    { role: 'authenticated', uid: U(1003), rol: 'representante' },
  maestro_titular:  { role: 'authenticated', uid: U(1004), rol: 'maestro', maestro: ID.m_titular },
  maestro_suplente: { role: 'authenticated', uid: U(1005), rol: 'maestro', maestro: ID.m_suplente },
  maestro_otro:     { role: 'authenticated', uid: U(1006), rol: 'maestro', maestro: ID.m_otro },
  maestro_sinactivo:{ role: 'authenticated', uid: U(1019), rol: 'maestro', maestro: ID.m_sinactivo, activo: false }, // 6 such profiles in production
  coordinacion:     { role: 'authenticated', uid: U(1007), rol: 'coordinacion_academica' },
  direccion:        { role: 'authenticated', uid: U(1008), rol: 'direccion' },
  admin:            { role: 'authenticated', uid: U(1009), rol: 'admin' },
  admin2:           { role: 'authenticated', uid: U(1013), rol: 'admin' },
  admin3:           { role: 'authenticated', uid: U(1014), rol: 'admin' },
  admin4:           { role: 'authenticated', uid: U(1015), rol: 'admin' },
  admin5:           { role: 'authenticated', uid: U(1016), rol: 'admin' },
  admin6:           { role: 'authenticated', uid: U(1020), rol: 'admin' },   // production has 6 active admin profiles
  admin_inactivo:   { role: 'authenticated', uid: U(1017), rol: 'admin', estado: 'inactivo' },
  superadmin:       { role: 'authenticated', uid: U(1010), rol: 'superadmin' },
  finanzas:         { role: 'authenticated', uid: U(1012), rol: 'finanzas' },
  operaciones:      { role: 'authenticated', uid: U(1021), rol: 'operaciones' },
  service_role:     { role: 'service_role' },
};
const ALL = Object.keys(ACTORS);
const ADMINS = ['admin', 'admin2', 'admin3', 'admin4', 'admin5', 'admin6', 'superadmin'];
const SVC = ['service_role'];
const MAESTROS = ['maestro_titular', 'maestro_suplente', 'maestro_otro', 'maestro_sinactivo'];
const ADMIN_ONLY = [...ADMINS, ...SVC];
const GEST_EST = ['coordinacion', ...ADMINS, ...SVC];                       // casos / seguimiento / tareas:comentar
const READ_SEG = [...GEST_EST, 'direccion'];
const PERSONAL = [...ADMIN_ONLY, 'direccion', 'coordinacion', 'finanzas', 'operaciones', ...MAESTROS];
const READ_POST = [...ADMIN_ONLY, 'direccion', 'coordinacion', ...MAESTROS];
const NOBODY_BUT_SVC = SVC;

const fixtureSql = `
SET session_replication_role = replica;
${Object.entries(ACTORS).filter(([, a]) => a.uid).map(([k, a]) => `
INSERT INTO auth.users (id, email) VALUES ('${a.uid}', '${k}@test.local');
INSERT INTO public.profiles (id, email, rol, estado, activo) VALUES ('${a.uid}', '${k}@test.local', '${a.rol}', '${a.estado ?? 'activo'}', ${a.activo === false ? 'false' : 'true'});`).join('')}
INSERT INTO public.maestros (id, nombre_completo, especialidad, correo, user_id) VALUES
  ('${ID.m_titular}',   'Titular',    'violin', 'titular@test.local',   '${ACTORS.maestro_titular.uid}'),
  ('${ID.m_suplente}',  'Suplente',   'violin', 'suplente@test.local',  '${ACTORS.maestro_suplente.uid}'),
  ('${ID.m_otro}',      'Otro',       'viola',  'otro@test.local',      '${ACTORS.maestro_otro.uid}'),
  ('${ID.m_sinactivo}', 'SinActivo',  'viola',  'sinactivo@test.local', '${ACTORS.maestro_sinactivo.uid}');
INSERT INTO public.alumnos (id, nombre_completo) VALUES ('${ID.alumno}', 'Alumno Prueba'), ('${ID.alumno2}', 'Alumno Dos');
INSERT INTO public.programas (id, nombre) VALUES ('${ID.programa}', 'Programa fixture');
INSERT INTO public.clases (id, nombre, maestro_principal_id, maestro_suplente_id)
  VALUES ('${ID.clase}', 'Clase de prueba', '${ID.m_titular}', '${ID.m_suplente}');
INSERT INTO public.sesiones_clase (id, clase_id, maestro_id, fecha) VALUES ('${ID.sesion}', '${ID.clase}', '${ID.m_titular}', current_date);
INSERT INTO public.alumnos_programas (id, alumno_id, programa_id, calificacion) VALUES ('${ID.ap}', '${ID.alumno}', '${ID.programa}', 90);
INSERT INTO public.alumno_escolaridad (id, alumno_id, centro_estudios) VALUES ('${ID.esc}', '${ID.alumno}', 'Escuela fixture');
INSERT INTO public.student_cases (id, alumno_id, tipo, titulo, nivel_riesgo) VALUES ('${ID.caso}', '${ID.alumno}', 'seguimiento', 'caso fixture', 'medio');
INSERT INTO public.student_case_actions (id, case_id, alumno_id, tipo, titulo) VALUES ('${ID.accion}', '${ID.caso}', '${ID.alumno}', 'llamada', 'accion fixture');
INSERT INTO public.student_case_events (id, case_id, tipo, titulo) VALUES ('${ID.evento}', '${ID.caso}', 'nota', 'evento fixture');
INSERT INTO public.student_case_alerts (id, alumno_id, case_id, tipo, nivel_riesgo, titulo) VALUES ('${ID.alerta}', '${ID.alumno}', '${ID.caso}', 'ausentismo', 'alto', 'alerta fixture');
INSERT INTO public.comunicaciones_seguimiento (id, alumno_id, contacto_nombre, contacto_telefono, notas) VALUES ('${ID.seg}', '${ID.alumno}', 'Contacto', '+0000', 'nota fixture');
INSERT INTO public.postulantes (id, nombre_completo, correo, madre_nombre, madre_tlf_whatsapp) VALUES
  ('${ID.post1}', 'Postulante Uno', 'uno@test.local', 'Madre Uno', '+1111'), ('${ID.post2}', 'Postulante Dos', 'dos@test.local', 'Madre Dos', '+2222');
INSERT INTO public.notificaciones (id, profile_id, tipo, titulo, mensaje) VALUES
  ('${ID.n_titular}', '${ACTORS.maestro_titular.uid}', 'sistema', 'para titular', 'm'),
  ('${ID.n_admin}',   '${ACTORS.admin.uid}',           'sistema', 'para admin',   'm'),
  ('${ID.n_null}',    NULL,                            'sistema', 'sin destinatario', 'm'),
  ('${ID.n_otro}',    '${ACTORS.maestro_otro.uid}',    'sistema', 'para otro',    'm');
INSERT INTO public.registros_pendientes (id, maestro_id, sesion_clase_id, tipo, mensaje) VALUES
  ('${ID.reg1}', '${ID.m_titular}', '${ID.sesion}', 'asistencia_pendiente', 'pendiente titular'),
  ('${ID.reg2}', '${ID.m_otro}',    NULL,           'asistencia_pendiente', 'pendiente otro');
INSERT INTO public.tareas_institucionales (id, titulo) VALUES ('${ID.tarea}', 'tarea fixture');
INSERT INTO public.tarea_comentarios (id, tarea_id, autor_nombre, cuerpo) VALUES ('${ID.coment}', '${ID.tarea}', 'fixture', 'comentario fixture');
-- a SECURITY DEFINER notifier, like fn_check_and_notify_pending_asistencias / the cron jobs
CREATE FUNCTION public.test_definer_notify(p_profile uuid) RETURNS void LANGUAGE sql SECURITY DEFINER AS
  $$ INSERT INTO public.notificaciones (profile_id, tipo, titulo, mensaje) VALUES (p_profile, 'sistema', 'definer', 'm') $$;
TRUNCATE public._push_log;
`;

// ── attempts ────────────────────────────────────────────────────────────────
async function attempt(client, actorKey, sql, { replica = true } = {}) {
  const actor = ACTORS[actorKey] ?? { role: actorKey };
  await client.query('BEGIN');
  try {
    if (replica) await client.query('SET LOCAL session_replication_role = replica');
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

const uuid = () => crypto.randomUUID();
const T = (t) => `public.${t}`;

/** Matrix: each case lists the actors that must be ALLOWED; every other actor must be denied. */
function matrixCases() {
  const c = [];
  const add = (name, allowed, sql, kind = 'write') => c.push({ name, allowed, sql, kind });

  // student_cases family: managers write, direccion only reads; actions/events append-only; no client DELETE
  add('student_cases INSERT', GEST_EST, () => `INSERT INTO ${T('student_cases')} (alumno_id, tipo, titulo) VALUES ('${ID.alumno}', 'seguimiento', 'pwn-${uuid()}')`);
  add('student_cases UPDATE', GEST_EST, () => `UPDATE ${T('student_cases')} SET nivel_riesgo = 'critico' WHERE id = '${ID.caso}'`);
  add('student_cases DELETE', SVC, () => `DELETE FROM ${T('student_cases')} WHERE id = '${ID.caso}'`);
  add('student_cases SELECT', READ_SEG, () => `SELECT id FROM ${T('student_cases')}`, 'read');
  add('student_case_actions INSERT', GEST_EST, () => `INSERT INTO ${T('student_case_actions')} (case_id, tipo, titulo) VALUES ('${ID.caso}', 'llamada', 'pwn')`);
  add('student_case_actions UPDATE', SVC, () => `UPDATE ${T('student_case_actions')} SET resultado = 'pwned' WHERE id = '${ID.accion}'`);
  add('student_case_actions DELETE', SVC, () => `DELETE FROM ${T('student_case_actions')} WHERE id = '${ID.accion}'`);
  add('student_case_actions SELECT', READ_SEG, () => `SELECT id FROM ${T('student_case_actions')}`, 'read');
  add('student_case_events INSERT', GEST_EST, () => `INSERT INTO ${T('student_case_events')} (case_id, tipo, titulo) VALUES ('${ID.caso}', 'nota', 'pwn')`);
  add('student_case_events UPDATE', SVC, () => `UPDATE ${T('student_case_events')} SET titulo = 'pwned' WHERE id = '${ID.evento}'`);
  add('student_case_events DELETE', SVC, () => `DELETE FROM ${T('student_case_events')} WHERE id = '${ID.evento}'`);
  add('student_case_events SELECT', READ_SEG, () => `SELECT id FROM ${T('student_case_events')}`, 'read');
  add('student_case_alerts INSERT', GEST_EST, () => `INSERT INTO ${T('student_case_alerts')} (alumno_id, tipo, nivel_riesgo, titulo) VALUES ('${ID.alumno}', 'ausentismo', 'alto', 'pwn')`);
  add('student_case_alerts UPDATE', GEST_EST, () => `UPDATE ${T('student_case_alerts')} SET estado = 'revisada' WHERE id = '${ID.alerta}'`);
  add('student_case_alerts DELETE', SVC, () => `DELETE FROM ${T('student_case_alerts')} WHERE id = '${ID.alerta}'`);
  add('student_case_alerts SELECT', READ_SEG, () => `SELECT id FROM ${T('student_case_alerts')}`, 'read');

  // guardian contact log
  add('comunicaciones_seguimiento INSERT', GEST_EST, () => `INSERT INTO ${T('comunicaciones_seguimiento')} (alumno_id, contacto_nombre) VALUES ('${ID.alumno}', 'pwn')`);
  add('comunicaciones_seguimiento UPDATE', GEST_EST, () => `UPDATE ${T('comunicaciones_seguimiento')} SET notas = 'pwned' WHERE id = '${ID.seg}'`);
  add('comunicaciones_seguimiento DELETE', GEST_EST, () => `DELETE FROM ${T('comunicaciones_seguimiento')} WHERE id = '${ID.seg}'`);
  add('comunicaciones_seguimiento SELECT', READ_SEG, () => `SELECT id FROM ${T('comunicaciones_seguimiento')}`, 'read');

  // applicants: INSERT never open to the API (sync uses service_role)
  add('postulantes INSERT', SVC, () => `INSERT INTO ${T('postulantes')} (nombre_completo, correo) VALUES ('pwn-${uuid()}', 'x@x.test')`);
  add('postulantes UPDATE', ADMIN_ONLY, () => `UPDATE ${T('postulantes')} SET estado = 'contactado' WHERE id = '${ID.post1}'`);
  add('postulantes DELETE', ADMIN_ONLY, () => `DELETE FROM ${T('postulantes')} WHERE id = '${ID.post1}'`);
  add('postulantes SELECT', READ_POST, () => `SELECT id FROM ${T('postulantes')}`, 'read');

  // enrolment and school data
  add('alumnos_programas INSERT', ADMIN_ONLY, () => `INSERT INTO ${T('alumnos_programas')} (alumno_id, programa_id) VALUES ('${ID.alumno2}', '${ID.programa}')`);
  add('alumnos_programas UPDATE', ADMIN_ONLY, () => `UPDATE ${T('alumnos_programas')} SET calificacion = 100 WHERE id = '${ID.ap}'`);
  add('alumnos_programas DELETE', ADMIN_ONLY, () => `DELETE FROM ${T('alumnos_programas')} WHERE id = '${ID.ap}'`);
  add('alumnos_programas SELECT', PERSONAL, () => `SELECT id FROM ${T('alumnos_programas')}`, 'read');
  add('alumno_escolaridad INSERT', ADMIN_ONLY, () => `INSERT INTO ${T('alumno_escolaridad')} (alumno_id, centro_estudios) VALUES ('${ID.alumno2}', 'pwn')`);
  add('alumno_escolaridad UPDATE', ADMIN_ONLY, () => `UPDATE ${T('alumno_escolaridad')} SET centro_estudios = 'pwned' WHERE id = '${ID.esc}'`);
  add('alumno_escolaridad DELETE', ADMIN_ONLY, () => `DELETE FROM ${T('alumno_escolaridad')} WHERE id = '${ID.esc}'`);
  add('alumno_escolaridad SELECT', PERSONAL, () => `SELECT id FROM ${T('alumno_escolaridad')}`, 'read');

  // notificaciones
  const ins = (profile, tipo = 'sistema') => () => `INSERT INTO ${T('notificaciones')} (profile_id, tipo, titulo, mensaje) VALUES (${profile}, '${tipo}', 'pwn', 'pwn')`;
  const toDirector = [...ADMIN_ONLY, ...MAESTROS];
  add('notificaciones INSERT to a director (absence request)', toDirector, ins(`'${ACTORS.admin.uid}'`));
  add('notificaciones INSERT with NULL recipient (absence request)', toDirector, ins('NULL'));
  add('notificaciones INSERT to a teacher', ADMIN_ONLY, ins(`'${ACTORS.maestro_otro.uid}'`));
  add('notificaciones INSERT to self', ADMIN_ONLY, (a) => ins(`'${ACTORS[a]?.uid ?? ACTORS.admin.uid}'`)());
  add('notificaciones INSERT tipo in_app to a director', ADMIN_ONLY, ins(`'${ACTORS.admin.uid}'`, 'in_app'));
  add('notificaciones SELECT own (titular row)', [...ADMIN_ONLY, 'maestro_titular'], () => `SELECT id FROM ${T('notificaciones')} WHERE id = '${ID.n_titular}'`, 'read');
  add('notificaciones SELECT director row', ADMIN_ONLY, () => `SELECT id FROM ${T('notificaciones')} WHERE id = '${ID.n_admin}'`, 'read');
  add('notificaciones SELECT NULL-recipient row', ADMIN_ONLY, () => `SELECT id FROM ${T('notificaciones')} WHERE id = '${ID.n_null}'`, 'read');
  add('notificaciones UPDATE mark read (titular row)', [...ADMIN_ONLY, 'maestro_titular'], () => `UPDATE ${T('notificaciones')} SET estado = 'leida', leida_en = now() WHERE id = '${ID.n_titular}'`);
  add('notificaciones UPDATE mark read (director row)', ADMIN_ONLY, () => `UPDATE ${T('notificaciones')} SET estado = 'leida', leida_en = now() WHERE id = '${ID.n_admin}'`);
  add('notificaciones UPDATE rewrite mensaje (column not granted)', SVC, () => `UPDATE ${T('notificaciones')} SET mensaje = 'pwned' WHERE id = '${ID.n_titular}'`);
  add('notificaciones UPDATE re-address profile_id (column not granted)', SVC, () => `UPDATE ${T('notificaciones')} SET profile_id = '${ACTORS.admin.uid}' WHERE id = '${ID.n_titular}'`);
  add('notificaciones DELETE own (titular row)', [...ADMIN_ONLY, 'maestro_titular'], () => `DELETE FROM ${T('notificaciones')} WHERE id = '${ID.n_titular}'`);
  add('notificaciones DELETE director row', ADMIN_ONLY, () => `DELETE FROM ${T('notificaciones')} WHERE id = '${ID.n_admin}'`);

  // registros_pendientes: read-only for the API
  add('registros_pendientes SELECT (titular record)', [...ADMIN_ONLY, 'maestro_titular', 'maestro_suplente'], () => `SELECT id FROM ${T('registros_pendientes')} WHERE id = '${ID.reg1}'`, 'read');
  add('registros_pendientes SELECT (record without session)', [...ADMIN_ONLY, 'maestro_otro'], () => `SELECT id FROM ${T('registros_pendientes')} WHERE id = '${ID.reg2}'`, 'read');
  add('registros_pendientes INSERT', SVC, () => `INSERT INTO ${T('registros_pendientes')} (maestro_id, tipo, mensaje) VALUES ('${ID.m_titular}', 'otro', 'pwn')`);
  add('registros_pendientes UPDATE', SVC, () => `UPDATE ${T('registros_pendientes')} SET estado = 'resuelto' WHERE id = '${ID.reg1}'`);
  add('registros_pendientes DELETE', SVC, () => `DELETE FROM ${T('registros_pendientes')} WHERE id = '${ID.reg1}'`);

  // task comments: immutable, no impersonation
  add('tarea_comentarios INSERT (no author)', GEST_EST, () => `INSERT INTO ${T('tarea_comentarios')} (tarea_id, cuerpo) VALUES ('${ID.tarea}', 'c')`);
  add('tarea_comentarios INSERT as myself', GEST_EST, (a) => `INSERT INTO ${T('tarea_comentarios')} (tarea_id, autor_id, cuerpo) VALUES ('${ID.tarea}', '${ACTORS[a]?.uid ?? ACTORS.admin.uid}', 'c')`);
  add('tarea_comentarios INSERT impersonating another user', SVC, () => `INSERT INTO ${T('tarea_comentarios')} (tarea_id, autor_id, cuerpo) VALUES ('${ID.tarea}', '${ACTORS.user.uid}', 'c')`);
  add('tarea_comentarios UPDATE', SVC, () => `UPDATE ${T('tarea_comentarios')} SET cuerpo = 'pwned' WHERE id = '${ID.coment}'`);
  add('tarea_comentarios DELETE', SVC, () => `DELETE FROM ${T('tarea_comentarios')} WHERE id = '${ID.coment}'`);
  add('tarea_comentarios SELECT', READ_SEG, () => `SELECT id FROM ${T('tarea_comentarios')}`, 'read');

  const out = [];
  for (const k of c) for (const actor of ALL) {
    out.push({ name: `${k.name} as ${actor}`, actor, sql: k.sql(actor), expect: k.allowed.includes(actor) ? 'allowed' : 'denied', kind: k.kind });
  }
  return out;
}

/** BEFORE state: documents what any signed-in account (and anon) can really do today. */
function beforeCases() {
  const c = [];
  const add = (name, actor, expect, sql) => c.push({ name: `${name} as ${actor}`, actor, sql, expect, kind: 'vulnerability' });
  for (const actor of ['alumno', 'representante', 'user']) {
    add('student_cases SELECT', actor, 'allowed', `SELECT id FROM ${T('student_cases')}`);
    add('student_cases UPDATE (risk level)', actor, 'allowed', `UPDATE ${T('student_cases')} SET nivel_riesgo = 'critico' WHERE id = '${ID.caso}'`);
    add('student_case_events DELETE (audit trail)', actor, 'allowed', `DELETE FROM ${T('student_case_events')} WHERE id = '${ID.evento}'`);
    add('postulantes SELECT (guardian phones)', actor, 'allowed', `SELECT madre_tlf_whatsapp FROM ${T('postulantes')}`);
    add('postulantes DELETE', actor, 'allowed', `DELETE FROM ${T('postulantes')} WHERE id = '${ID.post1}'`);
    add('alumnos_programas UPDATE (calificacion)', actor, 'allowed', `UPDATE ${T('alumnos_programas')} SET calificacion = 0 WHERE id = '${ID.ap}'`);
    add('notificaciones INSERT to a director (push spam)', actor, 'allowed', `INSERT INTO ${T('notificaciones')} (profile_id, tipo, titulo, mensaje) VALUES ('${ACTORS.admin.uid}', 'sistema', 'pwn', 'pwn')`);
    add('notificaciones SELECT everybody\'s', actor, 'allowed', `SELECT id FROM ${T('notificaciones')} WHERE id = '${ID.n_admin}'`);
    add('notificaciones UPDATE mensaje of another user', actor, 'allowed', `UPDATE ${T('notificaciones')} SET mensaje = 'pwned' WHERE id = '${ID.n_admin}'`);
    add('comunicaciones_seguimiento SELECT (phones)', actor, 'allowed', `SELECT contacto_telefono FROM ${T('comunicaciones_seguimiento')}`);
    add('tarea_comentarios INSERT impersonating', actor, 'allowed', `INSERT INTO ${T('tarea_comentarios')} (tarea_id, autor_id, cuerpo) VALUES ('${ID.tarea}', '${ACTORS.admin.uid}', 'pwn')`);
  }
  add('alumnos_programas SELECT (anonymous read incl. calificacion)', 'anon', 'allowed', `SELECT alumno_id, calificacion FROM ${T('alumnos_programas')}`);
  add('student_cases SELECT', 'anon', 'denied', `SELECT id FROM ${T('student_cases')}`);
  add('postulantes SELECT', 'anon', 'denied', `SELECT id FROM ${T('postulantes')}`);
  add('notificaciones INSERT', 'anon', 'denied', `INSERT INTO ${T('notificaciones')} (profile_id, tipo, titulo, mensaje) VALUES (NULL, 'sistema', 'pwn', 'pwn')`);
  return c;
}

/** AFTER: end-to-end flows with triggers ON and foreign keys enforced. `expect` per actor. */
function flowCases() {
  const c = [];
  const flow = (name, actors, sql) => {
    for (const actor of ALL) c.push({ name: `flow: ${name} as ${actor}`, actor, sql: sql(actor), expect: actors.includes(actor) ? 'allowed' : 'denied', kind: 'flow' });
  };
  // failures inside a flow raise 42501 so that a negative expectation ("denied") is satisfied by ANY refusal
  const fail = (m) => `RAISE EXCEPTION '${m}' USING ERRCODE = '42501'`;

  flow('case lifecycle (case -> event -> action -> update -> alert reviewed)', GEST_EST, () => `DO $f$ DECLARE k uuid; l uuid; BEGIN
    INSERT INTO ${T('student_cases')} (alumno_id, alumno_nombre, tipo, titulo, nivel_riesgo, origen) VALUES ('${ID.alumno}', 'Alumno Prueba', 'seguimiento', 'flujo', 'medio', 'manual') RETURNING id INTO k;
    INSERT INTO ${T('student_case_events')} (case_id, tipo, titulo, metadata) VALUES (k, 'caso_creado', 'creado', '{"a":1}'::jsonb);
    INSERT INTO ${T('student_case_actions')} (case_id, alumno_id, tipo, titulo, registrado_por) VALUES (k, '${ID.alumno}', 'llamada', 'llamada', auth.uid());
    UPDATE ${T('student_cases')} SET proxima_accion = 'volver a llamar', updated_at = now() WHERE id = k;
    IF NOT FOUND THEN ${fail('case update affected 0 rows')}; END IF;
    INSERT INTO ${T('student_case_alerts')} (alumno_id, alumno_nombre, tipo, nivel_riesgo, titulo, evidencia) VALUES ('${ID.alumno}', 'Alumno Prueba', 'ausentismo', 'alto', 'alerta', '{"faltas":3}'::jsonb) RETURNING id INTO l;
    UPDATE ${T('student_case_alerts')} SET estado = 'convertida_en_caso', case_id = k, revisada_por = auth.uid(), revisada_en = now() WHERE id = l;
    IF NOT FOUND THEN ${fail('alert update affected 0 rows')}; END IF;
    PERFORM 1 FROM ${T('student_cases')} WHERE id = k; IF NOT FOUND THEN ${fail('case not readable')}; END IF;
  END $f$`);

  flow('contact log (insert, update with trigger, close, delete)', GEST_EST, () => `DO $f$ DECLARE s uuid; BEGIN
    INSERT INTO ${T('comunicaciones_seguimiento')} (alumno_id, contacto_nombre, contacto_telefono, canal, origen) VALUES ('${ID.alumno}', 'Madre', '+1', 'whatsapp', 'ausentismo') RETURNING id INTO s;
    UPDATE ${T('comunicaciones_seguimiento')} SET estado = 'cerrado', notas = 'resuelto' WHERE id = s;
    IF NOT FOUND THEN ${fail('update affected 0 rows')}; END IF;
    DELETE FROM ${T('comunicaciones_seguimiento')} WHERE id = s;
    IF NOT FOUND THEN ${fail('delete affected 0 rows')}; END IF;
  END $f$`);

  flow('admin handles applicants (update funnel state, notes, delete)', ADMIN_ONLY, () => `DO $f$ BEGIN
    UPDATE ${T('postulantes')} SET estado = 'contactado', fecha_contacto = now() WHERE id = '${ID.post1}';
    IF NOT FOUND THEN ${fail('applicant update affected 0 rows')}; END IF;
    UPDATE ${T('postulantes')} SET notas_seguimiento = 'llamar el lunes' WHERE id = '${ID.post1}';
    DELETE FROM ${T('postulantes')} WHERE id = '${ID.post2}';
    IF NOT FOUND THEN ${fail('applicant delete affected 0 rows')}; END IF;
  END $f$`);

  const rpcOk = [...ADMINS, 'coordinacion', ...MAESTROS];
  flow('enrolment wizard marks the applicant enrolled via RPC (only estado/alumno_id/updated_at change)', rpcOk, () => `DO $f$ DECLARE b record; a record; BEGIN
    SELECT nombre_completo, madre_tlf_whatsapp, correo INTO b FROM ${T('postulantes')} WHERE id = '${ID.post1}';
    PERFORM public.marcar_postulante_inscrito('${ID.post1}', '${ID.alumno}');
    SELECT nombre_completo, madre_tlf_whatsapp, correo, estado, alumno_id INTO a FROM ${T('postulantes')} WHERE id = '${ID.post1}';
    IF a.estado IS DISTINCT FROM 'inscrito' OR a.alumno_id IS DISTINCT FROM '${ID.alumno}'::uuid THEN ${fail('applicant not marked')}; END IF;
    IF a.nombre_completo IS DISTINCT FROM b.nombre_completo OR a.madre_tlf_whatsapp IS DISTINCT FROM b.madre_tlf_whatsapp OR a.correo IS DISTINCT FROM b.correo THEN ${fail('RPC changed other columns')}; END IF;
  END $f$`);
  flow('RPC refuses an applicant already linked to another student and an unknown student', rpcOk, () => `DO $f$ BEGIN
    PERFORM public.marcar_postulante_inscrito('${ID.post1}', '${ID.alumno}');
    BEGIN PERFORM public.marcar_postulante_inscrito('${ID.post1}', '${ID.alumno2}'); ${fail('relinking must fail')};
    EXCEPTION WHEN unique_violation THEN NULL; END;
    BEGIN PERFORM public.marcar_postulante_inscrito('${ID.post2}', '${uuid()}'); ${fail('unknown alumno must fail')};
    EXCEPTION WHEN foreign_key_violation THEN NULL; END;
  END $f$`);
  flow('teacher portal notifications (list own, mark one read, mark all read, delete own)', ['maestro_titular', 'admin'], () => `DO $f$ DECLARE n int; BEGIN
    SELECT count(*) INTO n FROM ${T('notificaciones')} WHERE profile_id = auth.uid(); IF n = 0 THEN ${fail('own notifications not listed')}; END IF;
    UPDATE ${T('notificaciones')} SET estado = 'leida', leida_en = now() WHERE id = '${ID.n_titular}';
    IF NOT FOUND THEN ${fail('mark read affected 0 rows')}; END IF;
    UPDATE ${T('notificaciones')} SET estado = 'leida', leida_en = now() WHERE profile_id = auth.uid() AND estado <> 'leida';
    DELETE FROM ${T('notificaciones')} WHERE id = '${ID.n_titular}';
    IF NOT FOUND THEN ${fail('delete own affected 0 rows')}; END IF;
  END $f$`);

  flow('teacher files an absence request for management (insert without RETURNING)', [...ADMIN_ONLY, ...MAESTROS], () => `DO $f$ DECLARE before_n int; BEGIN
    SELECT count(*) INTO before_n FROM public._push_log;
    INSERT INTO ${T('notificaciones')} (profile_id, tipo, titulo, mensaje, deep_link, estado) VALUES (NULL, 'sistema', 'Nueva Solicitud de Ausencia', 'm', '/ausencias/pendientes', 'pendiente');
    INSERT INTO ${T('notificaciones')} (profile_id, tipo, titulo, mensaje, deep_link, estado) VALUES ('${ACTORS.admin.uid}', 'sistema', 'Nueva solicitud de ausencia', 'm', NULL, 'pendiente');
    IF (SELECT count(*) FROM public._push_log) <> before_n + 2 THEN ${fail('push trigger did not fire for the two legitimate inserts')}; END IF;
  END $f$`);

  flow('INSERT ... RETURNING of a director notification is refused to a teacher (client must not chain select())', ADMIN_ONLY, () => `DO $f$ DECLARE i uuid; BEGIN
    INSERT INTO ${T('notificaciones')} (profile_id, tipo, titulo, mensaje) VALUES ('${ACTORS.admin.uid}', 'sistema', 'x', 'm') RETURNING id INTO i;
  END $f$`);

  flow('an unauthorised notification insert triggers no push', ALL.filter((a) => a !== 'service_role' && !ADMINS.includes(a)), () => `DO $f$ DECLARE before_n int; BEGIN
    SELECT count(*) INTO before_n FROM public._push_log;
    BEGIN INSERT INTO ${T('notificaciones')} (profile_id, tipo, titulo, mensaje) VALUES ('${ACTORS.maestro_otro.uid}', 'sistema', 'phishing', 'click here');
    EXCEPTION WHEN insufficient_privilege THEN NULL; END;
    IF (SELECT count(*) FROM public._push_log) <> before_n THEN ${fail('a push was fired for an unauthorised insert')}; END IF;
  END $f$`);

  flow('admin broadcasts a notice to a teacher and reads that teacher\'s history', ADMIN_ONLY, () => `DO $f$ DECLARE before_n int; BEGIN
    SELECT count(*) INTO before_n FROM public._push_log;
    INSERT INTO ${T('notificaciones')} (profile_id, tipo, titulo, mensaje, estado) VALUES ('${ACTORS.maestro_otro.uid}', 'sistema', 'aviso', 'm', 'pendiente');
    IF (SELECT count(*) FROM public._push_log) <> before_n + 1 THEN ${fail('push not fired for admin notice')}; END IF;
    PERFORM 1 FROM ${T('notificaciones')} WHERE profile_id = '${ACTORS.maestro_otro.uid}'; IF NOT FOUND THEN ${fail('history not readable')}; END IF;
  END $f$`);

  flow('cron / SECURITY DEFINER notifiers keep working (owner bypasses RLS)', ALL, () => `DO $f$ BEGIN
    PERFORM public.test_definer_notify('${ACTORS.maestro_titular.uid}');
    PERFORM 1 FROM public._push_log; IF NOT FOUND THEN ${fail('definer notifier did not insert')}; END IF;
  END $f$`);

  flow('task comment by a manager keeps authorship', GEST_EST, () => `DO $f$ BEGIN
    INSERT INTO ${T('tarea_comentarios')} (tarea_id, autor_id, autor_nombre, cuerpo) VALUES ('${ID.tarea}', auth.uid(), 'Actor', '[WhatsApp enviado]');
    PERFORM 1 FROM ${T('tarea_comentarios')} WHERE tarea_id = '${ID.tarea}'; IF NOT FOUND THEN ${fail('comment not readable')}; END IF;
  END $f$`);

  flow('pending-attendance dashboard read (admin: all; teacher: own)', [...ADMIN_ONLY, 'maestro_titular', 'maestro_suplente'], () => `DO $f$ BEGIN
    PERFORM 1 FROM ${T('registros_pendientes')} r WHERE r.id = '${ID.reg1}'; IF NOT FOUND THEN ${fail('record not visible')}; END IF;
  END $f$`);

  flow('teacher lists students with their programmes (embedded select)', PERSONAL, () => `DO $f$ BEGIN
    PERFORM a.id, ap.activo FROM public.alumnos a LEFT JOIN ${T('alumnos_programas')} ap ON ap.alumno_id = a.id WHERE ap.id = '${ID.ap}';
    IF NOT FOUND THEN ${fail('programme membership not visible')}; END IF;
  END $f$`);
  return c;
}

function directUpdateTeacherCase() {
  return ALL.map((actor) => ({
    name: `flow: direct UPDATE of postulantes.estado as ${actor}`, actor, kind: 'flow',
    sql: `UPDATE ${T('postulantes')} SET estado = 'inscrito' WHERE id = '${ID.post1}'`,
    expect: ADMIN_ONLY.includes(actor) ? 'allowed' : 'denied',
  }));
}

const EXPECTED_POLICIES = {
  alumno_escolaridad: ['alumno_escolaridad_gestor_write', 'alumno_escolaridad_read'],
  alumnos_programas: ['alumnos_programas_gestor_write', 'alumnos_programas_read'],
  comunicaciones_seguimiento: ['comunicaciones_seguimiento_gestor_delete', 'comunicaciones_seguimiento_gestor_insert', 'comunicaciones_seguimiento_gestor_update', 'comunicaciones_seguimiento_read'],
  notificaciones: ['notificaciones_delete', 'notificaciones_insert', 'notificaciones_read', 'notificaciones_update'],
  postulantes: ['postulantes_delete_service_role', 'postulantes_gestor_delete', 'postulantes_gestor_update', 'postulantes_insert_service_role', 'postulantes_read', 'postulantes_update_service_role'],
  registros_pendientes: ['registros_pendientes_read'],
  student_case_actions: ['student_case_actions_gestor_insert', 'student_case_actions_read'],
  student_case_alerts: ['student_case_alerts_gestor_insert', 'student_case_alerts_gestor_update', 'student_case_alerts_read'],
  student_case_events: ['student_case_events_gestor_insert', 'student_case_events_read'],
  student_cases: ['student_cases_gestor_insert', 'student_cases_gestor_update', 'student_cases_read'],
  tarea_comentarios: ['tarea_comentarios_gestor_insert', 'tarea_comentarios_read'],
};
const TABLES = Object.keys(EXPECTED_POLICIES);

// exact table privileges for `authenticated`; `anon` must have none
const EXPECTED_ACL = {
  alumno_escolaridad: 'DELETE,INSERT,SELECT,UPDATE', alumnos_programas: 'DELETE,INSERT,SELECT,UPDATE',
  comunicaciones_seguimiento: 'DELETE,INSERT,SELECT,UPDATE', notificaciones: 'DELETE,INSERT,SELECT',
  postulantes: 'DELETE,SELECT,UPDATE', registros_pendientes: 'SELECT', student_case_actions: 'INSERT,SELECT',
  student_case_alerts: 'INSERT,SELECT,UPDATE', student_case_events: 'INSERT,SELECT', student_cases: 'INSERT,SELECT,UPDATE',
  tarea_comentarios: 'INSERT,SELECT',
};

// ── orchestration ───────────────────────────────────────────────────────────
const results = [];
function record(phase, c, got) {
  const pass = got.outcome === c.expect;
  results.push({ phase, name: c.name, kind: c.kind, expect: c.expect, got: got.outcome, pass, detail: got.detail });
  return pass;
}
const plain = (phase, name, expect, got, pass = expect === got) => results.push({ phase, name, kind: 'migration', expect, got, pass, detail: '' });

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
  const pol = await client.query(`SELECT tablename, policyname, cmd, roles::text, permissive, qual, with_check FROM pg_policies
    WHERE schemaname = 'public' AND tablename = ANY($1) ORDER BY 1, 2`, [TABLES]);
  const acl = await client.query(`SELECT c.relname, (SELECT string_agg(a, ',' ORDER BY a) FROM unnest(c.relacl::text[]) a) AS acl
    FROM pg_class c WHERE c.relnamespace = 'public'::regnamespace AND c.relname = ANY($1) ORDER BY 1`, [TABLES]);
  const cols = await client.query(`SELECT c.relname, a.attname, (SELECT string_agg(x, ',' ORDER BY x) FROM unnest(a.attacl::text[]) x) AS acl
    FROM pg_attribute a JOIN pg_class c ON c.oid = a.attrelid WHERE c.relnamespace = 'public'::regnamespace AND c.relname = ANY($1) AND a.attacl IS NOT NULL ORDER BY 1, 2`, [TABLES]);
  return JSON.stringify({ pol: pol.rows, acl: acl.rows, cols: cols.rows });
}
async function runCases(dbName, phase, cases, opts) {
  return withDb(dbName, async (client) => {
    let bad = 0;
    for (const c of cases) if (!record(phase, c, await attempt(client, c.actor, c.sql, opts))) bad++;
    return bad;
  });
}

console.log('Building modelled production baseline (template)…');
const b = spawnSync(process.execPath, [path.resolve(here, '../anon-write-fix/build_baseline.mjs'), 'soi_aw_tpl', '--from-prod-subset'], { stdio: 'inherit', env: process.env });
if (b.status !== 0) throw new Error('baseline build failed');
await withDb('soi_aw_tpl', async (c) => {
  await c.query(baseMigrationSql);              // production already has the eight-tables fix (ledger 20261018042037)
  await c.query(subsetSql);
  await c.query(fixtureSql);
});
const clone = async (name) => {
  await admin(`DROP DATABASE IF EXISTS "${name}" WITH (FORCE)`);
  await admin(`CREATE DATABASE "${name}" TEMPLATE soi_aw_tpl`);
};

// BEFORE
await clone('soi_w_before');
await runCases('soi_w_before', 'before', beforeCases());
const snapBefore = await withDb('soi_w_before', snapshot);

// AFTER matrix + idempotency + ACL + policies + flows
await clone('soi_w_after');
await withDb('soi_w_after', (c) => c.query(migrationSql));
await runCases('soi_w_after', 'after', matrixCases());
const snap1 = await withDb('soi_w_after', snapshot);
let secondApply = 'applied';
try { await withDb('soi_w_after', (c) => c.query(migrationSql)); } catch (e) { secondApply = `error: ${e.message}`; }
const snap2 = await withDb('soi_w_after', snapshot);
plain('idempotency', 'the migration can be applied a second time', 'applied', secondApply);
plain('idempotency', 'applying the migration twice yields an identical catalog', 'same', snap1 === snap2 ? 'same' : 'different');
await runCases('soi_w_after', 'flows', [...flowCases(), ...directUpdateTeacherCase()], { replica: false });

await withDb('soi_w_after', async (client) => {
  const pol = await client.query(`SELECT tablename, policyname, permissive FROM pg_policies WHERE schemaname = 'public' AND tablename = ANY($1)`, [TABLES]);
  for (const t of TABLES) {
    const have = pol.rows.filter((r) => r.tablename === t).map((r) => r.policyname).sort();
    const restrictive = pol.rows.filter((r) => r.tablename === t && r.permissive !== 'PERMISSIVE').length;
    const want = [...EXPECTED_POLICIES[t]].sort();
    plain('policies', `${t}: policy set equals the whitelist`, want.join(','), have.join(','), JSON.stringify(have) === JSON.stringify(want) && restrictive === 0);
  }
  for (const t of TABLES) {
    const priv = await client.query(`SELECT string_agg(p, ',' ORDER BY p) AS have FROM unnest(ARRAY['SELECT','INSERT','UPDATE','DELETE','TRUNCATE','REFERENCES','TRIGGER']) p
      WHERE has_table_privilege('authenticated', $1, p)`, [`public.${t}`]);
    const anon = await client.query(`SELECT string_agg(p, ',') AS have FROM unnest(ARRAY['SELECT','INSERT','UPDATE','DELETE','TRUNCATE','REFERENCES','TRIGGER']) p
      WHERE has_table_privilege('anon', $1, p) OR (p IN ('SELECT','INSERT','UPDATE','REFERENCES') AND has_any_column_privilege('anon', $1, p))`, [`public.${t}`]);
    // notificaciones UPDATE is column-level only: table-level privilege must be absent, column grants checked below
    plain('acl', `${t}: authenticated holds exactly ${EXPECTED_ACL[t]}`, EXPECTED_ACL[t], priv.rows[0].have ?? '');
    plain('acl', `${t}: anon holds no privilege`, 'none', anon.rows[0].have ?? 'none');
  }
  const colPriv = await client.query(`SELECT string_agg(attname, ',' ORDER BY attname) AS cols FROM pg_attribute
    WHERE attrelid = 'public.notificaciones'::regclass AND attnum > 0 AND NOT attisdropped AND has_column_privilege('authenticated', 'public.notificaciones', attname, 'UPDATE')`);
  plain('acl', 'notificaciones: authenticated can UPDATE only estado, leida_en', 'estado,leida_en', colPriv.rows[0].cols ?? '');
  const fn = await client.query(`SELECT proname, has_function_privilege('anon', p.oid, 'EXECUTE') AS anon_x, has_function_privilege('authenticated', p.oid, 'EXECUTE') AS auth_x
    FROM pg_proc p WHERE pronamespace = 'public'::regnamespace AND proname IN ('tiene_capacidad_estudiantil','puede_leer_seguimiento_estudiantil','es_personal_institucional','puede_leer_postulantes','es_perfil_directivo','puede_ver_registro_pendiente','marcar_postulante_inscrito')`);
  plain('acl', 'the seven new functions exist, anon cannot execute any, authenticated can', '7/0/7', `${fn.rows.length}/${fn.rows.filter((r) => r.anon_x).length}/${fn.rows.filter((r) => r.auth_x).length}`);
});

// SELF-CHECK: a residual wide-open policy the migration does not know by name must abort it atomically
for (const [label, residual] of [
  ['unknown ALL policy on student_cases', `CREATE POLICY legacy_extra_all ON public.student_cases FOR ALL TO authenticated USING (true) WITH CHECK (true)`],
  ['unknown policy TO public on notificaciones', `CREATE POLICY legacy_public_read ON public.notificaciones FOR SELECT TO public USING (true)`],
  ['unknown INSERT policy on postulantes', `CREATE POLICY legacy_ins ON public.postulantes FOR INSERT TO authenticated WITH CHECK (true)`],
]) {
  await clone('soi_w_sc');
  const r = await withDb('soi_w_sc', async (c) => {
    await c.query(residual);
    const pre = await snapshot(c);
    let failed = null;
    try { await c.query(migrationSql); } catch (e) { failed = e.message; }
    await c.query('ROLLBACK').catch(() => {});
    const post = await snapshot(c);
    const helpers = await c.query(`SELECT count(*)::int AS n FROM pg_proc WHERE proname = 'tiene_capacidad_estudiantil'`);
    return { failed, unchanged: pre === post, helpers: helpers.rows[0].n };
  });
  plain('self-check', `migration aborts on: ${label}`, 'aborted', r.failed ? 'aborted' : 'applied');
  plain('self-check', `abort is atomic (${label}): catalog unchanged, no helper left`, 'unchanged', r.unchanged && r.helpers === 0 ? 'unchanged' : 'changed');
}

// ROLLBACK
await clone('soi_w_rb');
await withDb('soi_w_rb', (c) => c.query(migrationSql));
await withDb('soi_w_rb', (c) => c.query(rollbackSql));
const snapRb = await withDb('soi_w_rb', snapshot);
plain('rollback', 'rollback restores the exact pre-migration policies, table ACLs and column ACLs', 'same', snapRb === snapBefore ? 'same' : 'different');
const helpers = await withDb('soi_w_rb', (c) => c.query(`SELECT count(*)::int AS n FROM pg_proc WHERE proname IN ('tiene_capacidad_estudiantil','puede_leer_seguimiento_estudiantil','es_personal_institucional','puede_leer_postulantes','es_perfil_directivo','puede_ver_registro_pendiente','marcar_postulante_inscrito')`));
plain('rollback', 'rollback removes the helper functions and the RPC', 'removed', helpers.rows[0].n === 0 ? 'removed' : 'present');
await withDb('soi_w_rb', (c) => c.query(rollbackSql));
plain('rollback', 'rollback is idempotent (second run leaves the same catalog)', 'same', (await withDb('soi_w_rb', snapshot)) === snapBefore ? 'same' : 'different');
await runCases('soi_w_rb', 'rollback', beforeCases());
await withDb('soi_w_rb', (c) => c.query(migrationSql));
plain('rollback', 'migration re-applies cleanly after a rollback (same catalog as a fresh apply)', 'same', (await withDb('soi_w_rb', snapshot)) === snap1 ? 'same' : 'different');

if (!keep) for (const d of ['soi_w_before', 'soi_w_after', 'soi_w_sc', 'soi_w_rb']) await admin(`DROP DATABASE IF EXISTS "${d}" WITH (FORCE)`);

// ── report ──────────────────────────────────────────────────────────────────
const byPhase = {};
for (const r of results) { byPhase[r.phase] ??= { total: 0, pass: 0 }; byPhase[r.phase].total++; if (r.pass) byPhase[r.phase].pass++; }
console.log('\nPhase        passed/total');
for (const [p, s] of Object.entries(byPhase)) console.log(`${p.padEnd(12)} ${s.pass}/${s.total}`);
const failed = results.filter((r) => !r.pass);
if (failed.length) {
  console.log('\nFAILED:');
  for (const f of failed.slice(0, 80)) console.log(` [${f.phase}] ${f.name}: expected ${f.expect}, got ${f.got} (${String(f.detail).slice(0, 160)})`);
}
if (jsonOut) fs.writeFileSync(jsonOut, JSON.stringify({ byPhase, results }, null, 2));
console.log(failed.length ? `\n${failed.length} FAILURES` : '\nALL TESTS PASSED');
process.exit(failed.length ? 1 : 0);

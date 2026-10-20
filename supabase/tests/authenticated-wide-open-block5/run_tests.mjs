// Role-by-role regression suite for migration 20261020130000 (block 5: institutional catalogues and configuration
// open to any authenticated account). Runs on a throw-away PostgreSQL (never production).
//
//   BEFORE     the exposure is real (any signed-in account rewrites/deletes; anon holds every privilege)
//   AFTER      matrix actor x table x operation, flows with triggers ON and FKs enforced
//   ACL        exact table and column privileges
//   POLICIES   the policy set equals a whitelist (no leftover permissive policy can override the new ones)
//   SELF-CHECK an unknown residual policy / disabled RLS makes the migration abort atomically
//   IDEMPOTENT applying twice leaves the catalog unchanged
//   ROLLBACK   restores the exact pre-migration policies and ACLs; the migration re-applies afterwards
//
// Usage:  node supabase/tests/authenticated-wide-open-block5/run_tests.mjs [--keep] [--json out.json]
// env:    PGHOST PGPORT PGUSER PGPASSWORD (default 127.0.0.1 54329 postgres test); MIGRATION_OVERRIDE=<file>
//         swaps the migration under test (used by mutation_check.mjs).
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const here = path.dirname(fileURLToPath(import.meta.url));
const MIG_DIR = path.resolve(here, '../../migrations');
const ROLLBACK_DIR = path.resolve(here, '../../rollback');
const VERSION = '20261020130000';
const BASE_VERSION = '20261017180000';
const find = (dir, v) => fs.readdirSync(dir).find((f) => f.startsWith(`${v}_`));
const migrationSql = fs.readFileSync(process.env.MIGRATION_OVERRIDE || path.join(MIG_DIR, find(MIG_DIR, VERSION)), 'utf8');
const rollbackSql = fs.readFileSync(path.join(ROLLBACK_DIR, find(ROLLBACK_DIR, VERSION)), 'utf8');
const baseMigrationSql = fs.readFileSync(path.join(MIG_DIR, find(MIG_DIR, BASE_VERSION)), 'utf8');
const subsetSql = fs.readFileSync(path.join(here, 'prod_schema_subset_block5_2026-10-20.sql'), 'utf8');

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
  programa: U(9001), alumno: U(9006),
  m_titular: U(7001), m_suplente: U(7002), m_otro: U(7003), m_sinactivo: U(7005),
  dep_acm: U(9201), dep_fin: U(9202), inst1: U(9203), inst2: U(9204),
  nivel: U(9205), modulo: U(9206), unidad: U(9207), ejercicio: U(9208),
  regla: U(9209), cfg_titular: U(9210), cfg_otro: U(9211),
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
const ADMIN_ONLY = [...ADMINS, ...SVC];                                  // admin/superadmin capability (+ service_role)
const CATALOG_WRITE = ['coordinacion', ...ADMIN_ONLY];                   // catalogo:escribir
const STAFF_READ = [...ADMIN_ONLY, 'direccion', 'coordinacion', 'finanzas', 'operaciones', ...MAESTROS];   // departamentos, instrumentos
const CONFIG_READ = [...ADMIN_ONLY, 'direccion', 'coordinacion', 'finanzas', 'operaciones'];               // reglas, contratos
const SIGNED_IN = ALL.filter((a) => a !== 'anon');                       // curricular catalogue read, own preferences

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
INSERT INTO public.alumnos (id, nombre_completo) VALUES ('${ID.alumno}', 'Alumno Prueba');
INSERT INTO public.programas (id, nombre) VALUES ('${ID.programa}', 'Programa fixture');
INSERT INTO public.departamentos (id, nombre, codigo, email, activo) VALUES
  ('${ID.dep_acm}', 'Academico', 'ACM', 'acm@test.local', true), ('${ID.dep_fin}', 'Finanzas', 'FIN', 'fin@test.local', true);
INSERT INTO public.instrumentos (id, codigo, nombre, tipo, alumno_nombre) VALUES
  ('${ID.inst1}', 'INS-1', 'Violin 1', 'violin', NULL), ('${ID.inst2}', 'INS-2', 'Viola 1', 'viola', 'Alumno Prueba');
INSERT INTO public.niveles (id, programa_id, nombre, orden) VALUES ('${ID.nivel}', '${ID.programa}', 'Nivel fixture', 1);
INSERT INTO public.modulos (id, programa_id, nivel_id, nombre, orden) VALUES ('${ID.modulo}', '${ID.programa}', '${ID.nivel}', 'Modulo fixture', 1);
INSERT INTO public.unidades (id, modulo_id, nombre, orden) VALUES ('${ID.unidad}', '${ID.modulo}', 'Unidad fixture', 1);
INSERT INTO public.ejercicios (id, unidad_id, nombre, tipo_ejercicio, orden) VALUES ('${ID.ejercicio}', '${ID.unidad}', 'Ejercicio fixture', 'tecnico', 1);
INSERT INTO public.seguimiento_reglas (id, nombre, tipo, config) VALUES ('${ID.regla}', 'Ausentismo acumulado', 'ausentismo_acumulado', '{"nivel1":3,"nivel2":6,"nivel3":10}'::jsonb);
INSERT INTO public.soi_process_contracts (process_code, process_name, department_owner, canonical_doc_path) VALUES
  ('PC-1', 'Proceso fixture', 'ACM', 'docs/pc-1.md');
INSERT INTO public.configuracion_recordatorios (id, profile_id, push_activo) VALUES
  ('${ID.cfg_titular}', '${ACTORS.maestro_titular.uid}', true), ('${ID.cfg_otro}', '${ACTORS.maestro_otro.uid}', false);
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

const rnd = () => Math.floor(Math.random() * 900000) + 100;
const uuid = () => crypto.randomUUID();
const T = (t) => `public.${t}`;
const uidOf = (a) => ACTORS[a]?.uid ?? ACTORS.admin.uid;

/** Matrix: each case lists the actors that must be ALLOWED; every other actor must be denied. */
function matrixCases() {
  const c = [];
  const add = (name, allowed, sql, kind = 'write') => c.push({ name, allowed, sql, kind });

  // curricular catalogue: everybody signed in reads; catalogo:escribir writes
  add('niveles SELECT', SIGNED_IN, () => `SELECT id FROM ${T('niveles')}`, 'read');
  add('niveles INSERT', CATALOG_WRITE, () => `INSERT INTO ${T('niveles')} (programa_id, nombre, orden) VALUES ('${ID.programa}', 'pwn-${uuid()}', ${rnd()})`);
  add('niveles UPDATE', CATALOG_WRITE, () => `UPDATE ${T('niveles')} SET descripcion = 'pwned' WHERE id = '${ID.nivel}'`);
  add('niveles DELETE', CATALOG_WRITE, () => `DELETE FROM ${T('niveles')} WHERE id = '${ID.nivel}'`);
  add('modulos SELECT', SIGNED_IN, () => `SELECT id FROM ${T('modulos')}`, 'read');
  add('modulos INSERT', CATALOG_WRITE, () => `INSERT INTO ${T('modulos')} (programa_id, nivel_id, nombre, orden) VALUES ('${ID.programa}', '${ID.nivel}', 'pwn-${uuid()}', ${rnd()})`);
  add('modulos UPDATE', CATALOG_WRITE, () => `UPDATE ${T('modulos')} SET descripcion = 'pwned' WHERE id = '${ID.modulo}'`);
  add('modulos DELETE', CATALOG_WRITE, () => `DELETE FROM ${T('modulos')} WHERE id = '${ID.modulo}'`);
  add('unidades SELECT', SIGNED_IN, () => `SELECT id FROM ${T('unidades')}`, 'read');
  add('unidades INSERT', CATALOG_WRITE, () => `INSERT INTO ${T('unidades')} (modulo_id, nombre, orden) VALUES ('${ID.modulo}', 'pwn-${uuid()}', ${rnd()})`);
  add('unidades UPDATE', CATALOG_WRITE, () => `UPDATE ${T('unidades')} SET descripcion = 'pwned' WHERE id = '${ID.unidad}'`);
  add('unidades DELETE', CATALOG_WRITE, () => `DELETE FROM ${T('unidades')} WHERE id = '${ID.unidad}'`);
  add('ejercicios SELECT', SIGNED_IN, () => `SELECT id FROM ${T('ejercicios')}`, 'read');
  add('ejercicios INSERT', CATALOG_WRITE, () => `INSERT INTO ${T('ejercicios')} (unidad_id, nombre, tipo_ejercicio, orden) VALUES ('${ID.unidad}', 'pwn-${uuid()}', 'otro', ${rnd()})`);
  add('ejercicios UPDATE', CATALOG_WRITE, () => `UPDATE ${T('ejercicios')} SET instrucciones = 'pwned' WHERE id = '${ID.ejercicio}'`);
  add('ejercicios DELETE', CATALOG_WRITE, () => `DELETE FROM ${T('ejercicios')} WHERE id = '${ID.ejercicio}'`);

  // department mailboxes: staff read; admin/superadmin edit the screen's columns; nobody inserts/deletes via the API
  add('departamentos SELECT', STAFF_READ, () => `SELECT id FROM ${T('departamentos')}`, 'read');
  add('departamentos UPDATE email (diverts institutional mail)', ADMIN_ONLY, () => `UPDATE ${T('departamentos')} SET email = 'pwn@evil.test', updated_at = now() WHERE id = '${ID.dep_acm}'`);
  add('departamentos UPDATE responsable + activo', ADMIN_ONLY, () => `UPDATE ${T('departamentos')} SET responsable_nombre = 'R', responsable_email = 'r@x.test', activo = false WHERE id = '${ID.dep_fin}'`);
  add('departamentos UPDATE codigo (column not granted)', SVC, () => `UPDATE ${T('departamentos')} SET codigo = 'PWN' WHERE id = '${ID.dep_acm}'`);
  add('departamentos UPDATE jefe_id (column not granted)', SVC, () => `UPDATE ${T('departamentos')} SET jefe_id = '${ACTORS.user.uid}' WHERE id = '${ID.dep_acm}'`);
  add('departamentos INSERT', SVC, () => `INSERT INTO ${T('departamentos')} (nombre, codigo) VALUES ('pwn-${uuid()}', 'PWN')`);
  add('departamentos DELETE', SVC, () => `DELETE FROM ${T('departamentos')} WHERE id = '${ID.dep_acm}'`);

  // instrument inventory: staff read; catalogo:escribir inserts/updates; no client deletes
  add('instrumentos SELECT', STAFF_READ, () => `SELECT id FROM ${T('instrumentos')}`, 'read');
  add('instrumentos INSERT', CATALOG_WRITE, () => `INSERT INTO ${T('instrumentos')} (codigo, nombre) VALUES ('pwn-${uuid()}', 'x')`);
  add('instrumentos UPDATE', CATALOG_WRITE, () => `UPDATE ${T('instrumentos')} SET estado = 'danado', updated_at = now() WHERE id = '${ID.inst1}'`);
  add('instrumentos DELETE', SVC, () => `DELETE FROM ${T('instrumentos')} WHERE id = '${ID.inst1}'`);

  // follow-up rules: config readers read; admin/superadmin write; no client deletes
  add('seguimiento_reglas SELECT', CONFIG_READ, () => `SELECT id FROM ${T('seguimiento_reglas')}`, 'read');
  add('seguimiento_reglas INSERT', ADMIN_ONLY, () => `INSERT INTO ${T('seguimiento_reglas')} (nombre, tipo, config) VALUES ('pwn-${uuid()}', 'ausentismo_acumulado', '{"nivel1":0}'::jsonb)`);
  add('seguimiento_reglas UPDATE (thresholds)', ADMIN_ONLY, () => `UPDATE ${T('seguimiento_reglas')} SET config = '{"nivel1":99}'::jsonb, updated_at = now() WHERE id = '${ID.regla}'`);
  add('seguimiento_reglas DELETE', SVC, () => `DELETE FROM ${T('seguimiento_reglas')} WHERE id = '${ID.regla}'`);

  // Hermes process contracts: config readers read; no client write at all
  add('soi_process_contracts SELECT', CONFIG_READ, () => `SELECT process_code FROM ${T('soi_process_contracts')}`, 'read');
  add('soi_process_contracts INSERT', SVC, () => `INSERT INTO ${T('soi_process_contracts')} (process_code, process_name, department_owner, canonical_doc_path) VALUES ('PWN-${rnd()}', 'x', 'ACM', 'x')`);
  add('soi_process_contracts UPDATE', SVC, () => `UPDATE ${T('soi_process_contracts')} SET task_templates = '[{"pwn":1}]'::jsonb WHERE process_code = 'PC-1'`);
  add('soi_process_contracts DELETE', SVC, () => `DELETE FROM ${T('soi_process_contracts')} WHERE process_code = 'PC-1'`);

  // per-user reminder preferences: the owner; admin/superadmin read all
  const upsert = (a, target) => `INSERT INTO ${T('configuracion_recordatorios')} (profile_id, push_activo, updated_at) VALUES ('${target ?? uidOf(a)}', true, now())
    ON CONFLICT (profile_id) DO UPDATE SET profile_id = EXCLUDED.profile_id, push_activo = EXCLUDED.push_activo, updated_at = EXCLUDED.updated_at`;
  add('configuracion_recordatorios SELECT own row', [...ADMIN_ONLY, 'maestro_titular'], () => `SELECT id FROM ${T('configuracion_recordatorios')} WHERE id = '${ID.cfg_titular}'`, 'read');
  add('configuracion_recordatorios SELECT another teacher\'s row', [...ADMIN_ONLY, 'maestro_otro'], () => `SELECT id FROM ${T('configuracion_recordatorios')} WHERE id = '${ID.cfg_otro}'`, 'read');
  add('configuracion_recordatorios upsert own preferences (portal save)', SIGNED_IN, (a) => upsert(a));
  add('configuracion_recordatorios upsert onto ANOTHER profile (allowed only to its owner)', [...SVC, 'maestro_otro'], (a) => upsert(a, ACTORS.maestro_otro.uid));
  add('configuracion_recordatorios UPDATE own row', [...SVC, 'maestro_titular'], () => `UPDATE ${T('configuracion_recordatorios')} SET push_activo = false WHERE id = '${ID.cfg_titular}'`);
  add('configuracion_recordatorios UPDATE another teacher\'s row', [...SVC, 'maestro_otro'], () => `UPDATE ${T('configuracion_recordatorios')} SET push_activo = true WHERE id = '${ID.cfg_otro}'`);
  add('configuracion_recordatorios UPDATE re-address profile_id', SVC, () => `UPDATE ${T('configuracion_recordatorios')} SET profile_id = '${ACTORS.user.uid}' WHERE id = '${ID.cfg_titular}'`);
  add('configuracion_recordatorios DELETE', SVC, () => `DELETE FROM ${T('configuracion_recordatorios')} WHERE id = '${ID.cfg_titular}'`);

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
    add('departamentos UPDATE email (diverts institutional mail)', actor, 'allowed', `UPDATE ${T('departamentos')} SET email = 'pwn@evil.test' WHERE id = '${ID.dep_acm}'`);
    add('departamentos SELECT', actor, 'allowed', `SELECT email FROM ${T('departamentos')}`);
    add('instrumentos SELECT (borrower names)', actor, 'allowed', `SELECT alumno_nombre FROM ${T('instrumentos')}`);
    add('instrumentos INSERT', actor, 'allowed', `INSERT INTO ${T('instrumentos')} (codigo, nombre) VALUES ('pwn-${uuid()}', 'x')`);
    add('niveles DELETE', actor, 'allowed', `DELETE FROM ${T('niveles')} WHERE id = '${ID.nivel}'`);
    add('modulos UPDATE', actor, 'allowed', `UPDATE ${T('modulos')} SET nombre = 'pwned' WHERE id = '${ID.modulo}'`);
    add('unidades UPDATE', actor, 'allowed', `UPDATE ${T('unidades')} SET nombre = 'pwned' WHERE id = '${ID.unidad}'`);
    add('ejercicios UPDATE', actor, 'allowed', `UPDATE ${T('ejercicios')} SET instrucciones = 'pwned' WHERE id = '${ID.ejercicio}'`);
    add('seguimiento_reglas UPDATE (thresholds)', actor, 'allowed', `UPDATE ${T('seguimiento_reglas')} SET config = '{"nivel1":99}'::jsonb WHERE id = '${ID.regla}'`);
    add('soi_process_contracts SELECT', actor, 'allowed', `SELECT process_code FROM ${T('soi_process_contracts')}`);
    add('soi_process_contracts UPDATE', actor, 'allowed', `UPDATE ${T('soi_process_contracts')} SET task_templates = '[{"pwn":1}]'::jsonb WHERE process_code = 'PC-1'`);
    add('configuracion_recordatorios SELECT another teacher\'s row', actor, 'allowed', `SELECT id FROM ${T('configuracion_recordatorios')} WHERE id = '${ID.cfg_otro}'`);
    add('configuracion_recordatorios UPDATE another teacher\'s row', actor, 'allowed', `UPDATE ${T('configuracion_recordatorios')} SET push_activo = true WHERE id = '${ID.cfg_otro}'`);
  }
  // anon holds privileges but no policy lets it through: reads nothing, writes nothing (defence in depth is what is missing)
  add('niveles SELECT', 'anon', 'denied', `SELECT id FROM ${T('niveles')}`);
  add('departamentos UPDATE', 'anon', 'denied', `UPDATE ${T('departamentos')} SET email = 'x@x.test' WHERE id = '${ID.dep_acm}'`);
  add('seguimiento_reglas SELECT', 'anon', 'denied', `SELECT id FROM ${T('seguimiento_reglas')}`);
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

  flow('curricular tree (nivel -> modulo -> unidad -> ejercicio, update with trigger, cascade delete)', CATALOG_WRITE, () => `DO $f$ DECLARE n uuid; m uuid; u uuid; e uuid; BEGIN
    INSERT INTO ${T('niveles')} (programa_id, nombre, orden, criterios_promocion) VALUES ('${ID.programa}', 'N-${uuid()}', ${rnd()}, '{"min":80}'::jsonb) RETURNING id INTO n;
    INSERT INTO ${T('modulos')} (programa_id, nivel_id, nombre, orden) VALUES ('${ID.programa}', n, 'M', 1) RETURNING id INTO m;
    INSERT INTO ${T('unidades')} (modulo_id, nombre, orden) VALUES (m, 'U', 1) RETURNING id INTO u;
    INSERT INTO ${T('ejercicios')} (unidad_id, nombre, tipo_ejercicio, orden, contenido) VALUES (u, 'E', 'ritmico', 1, '{"bpm":80}'::jsonb) RETURNING id INTO e;
    UPDATE ${T('ejercicios')} SET dificultad = 5, puntaje_maximo = 20, puntaje_aprobacion = 12 WHERE id = e;
    IF NOT FOUND THEN ${fail('exercise update affected 0 rows')}; END IF;
    UPDATE ${T('unidades')} SET descripcion = 'x' WHERE id = u; IF NOT FOUND THEN ${fail('unit update affected 0 rows')}; END IF;
    UPDATE ${T('modulos')} SET porcentaje_aprobacion = 70 WHERE id = m; IF NOT FOUND THEN ${fail('module update affected 0 rows')}; END IF;
    DELETE FROM ${T('niveles')} WHERE id = n; IF NOT FOUND THEN ${fail('level delete affected 0 rows')}; END IF;
    PERFORM 1 FROM ${T('ejercicios')} WHERE id = e; IF FOUND THEN ${fail('cascade did not remove the exercise')}; END IF;
  END $f$`);

  flow('portal reads the curricular tree with an embedded join', SIGNED_IN, () => `DO $f$ BEGIN
    PERFORM 1 FROM ${T('niveles')} n JOIN ${T('modulos')} m ON m.nivel_id = n.id JOIN ${T('unidades')} u ON u.modulo_id = m.id JOIN ${T('ejercicios')} e ON e.unidad_id = u.id WHERE n.id = '${ID.nivel}';
    IF NOT FOUND THEN ${fail('curricular tree not readable')}; END IF;
  END $f$`);

  flow('instrument lifecycle (register, assign to a student, mark damaged, read back)', CATALOG_WRITE, () => `DO $f$ DECLARE i uuid; BEGIN
    INSERT INTO ${T('instrumentos')} (codigo, nombre, tipo, marca, serie) VALUES ('I-${uuid()}', 'Violin', 'violin', 'Yamaha', 'S1') RETURNING id INTO i;
    UPDATE ${T('instrumentos')} SET estado = 'asignado', alumno_id = '${ID.alumno}', alumno_nombre = 'Alumno Prueba', updated_at = now() WHERE id = i;
    IF NOT FOUND THEN ${fail('assign affected 0 rows')}; END IF;
    UPDATE ${T('instrumentos')} SET estado = 'danado', updated_at = now() WHERE id = i;
    PERFORM 1 FROM ${T('instrumentos')} WHERE id = i AND estado = 'danado'; IF NOT FOUND THEN ${fail('instrument not readable')}; END IF;
  END $f$`);

  flow('admin edits a department mailbox and Hermes (SECURITY DEFINER) dispatches to the new address', ADMIN_ONLY, () => `DO $f$ BEGIN
    UPDATE ${T('departamentos')} SET email = 'nuevo@test.local', responsable_nombre = 'Resp', responsable_email = 'resp@test.local', updated_at = now() WHERE codigo = 'ACM';
    IF NOT FOUND THEN ${fail('department update affected 0 rows')}; END IF;
    IF public.fn_email_departamento('ACM') IS DISTINCT FROM 'nuevo@test.local' THEN ${fail('definer reader did not see the new mailbox')}; END IF;
  END $f$`);

  flow('fn_email_departamento keeps working for everybody (SECURITY DEFINER; anon-executable in production, see residual risks)', ALL, () => `DO $f$ BEGIN
    IF public.fn_email_departamento('ACM') IS NULL THEN ${fail('definer reader returned nothing')}; END IF;
  END $f$`);

  flow('teacher portal saves reminder preferences twice (insert then update, as PostgREST upsert) and reads them back', SIGNED_IN, (a) => `DO $f$ BEGIN
    INSERT INTO ${T('configuracion_recordatorios')} (profile_id, push_activo, min_antes_clase, hora_resumen_diario, dia_resumen_semanal, updated_at)
      VALUES ('${uidOf(a)}', true, 20, '17:30', 3, now())
      ON CONFLICT (profile_id) DO UPDATE SET profile_id = EXCLUDED.profile_id, push_activo = EXCLUDED.push_activo,
        min_antes_clase = EXCLUDED.min_antes_clase, hora_resumen_diario = EXCLUDED.hora_resumen_diario,
        dia_resumen_semanal = EXCLUDED.dia_resumen_semanal, updated_at = EXCLUDED.updated_at;
    INSERT INTO ${T('configuracion_recordatorios')} (profile_id, push_activo, min_antes_clase, updated_at) VALUES ('${uidOf(a)}', false, 10, now())
      ON CONFLICT (profile_id) DO UPDATE SET profile_id = EXCLUDED.profile_id, push_activo = EXCLUDED.push_activo, min_antes_clase = EXCLUDED.min_antes_clase, updated_at = EXCLUDED.updated_at;
    PERFORM 1 FROM ${T('configuracion_recordatorios')} WHERE profile_id = '${uidOf(a)}' AND min_antes_clase = 10 AND push_activo = false;
    IF NOT FOUND THEN ${fail('preferences not saved or not readable')}; END IF;
  END $f$`);

  flow('cron reminder generator (SECURITY DEFINER) still sees every teacher\'s preferences', SIGNED_IN, () => `DO $f$ BEGIN
    IF public.fn_generate_class_start_reminders() < 2 THEN ${fail('cron reader lost rows')}; END IF;
  END $f$`);

  flow('admin manages follow-up rules (list, create, toggle) and the absence view sees the thresholds', ADMIN_ONLY, () => `DO $f$ DECLARE r uuid; BEGIN
    INSERT INTO ${T('seguimiento_reglas')} (nombre, tipo, config, prioridad, created_by) VALUES ('Nueva', 'otro', '{"x":1}'::jsonb, 2, auth.uid()) RETURNING id INTO r;
    UPDATE ${T('seguimiento_reglas')} SET activo = false, updated_at = now() WHERE id = r; IF NOT FOUND THEN ${fail('rule toggle affected 0 rows')}; END IF;
    UPDATE ${T('seguimiento_reglas')} SET config = '{"nivel1":4,"nivel2":7,"nivel3":11}'::jsonb WHERE id = '${ID.regla}';
    PERFORM 1 FROM ${T('vw_seguimiento_ausentes')} WHERE n1 = 4; IF NOT FOUND THEN ${fail('view did not pick up the new threshold')}; END IF;
  END $f$`);

  flow('security_invoker absence view resolves the thresholds for the pedagogical readers', CONFIG_READ, () => `DO $f$ BEGIN
    PERFORM 1 FROM ${T('vw_seguimiento_ausentes')} WHERE n1 IS NOT NULL; IF NOT FOUND THEN ${fail('view cannot read seguimiento_reglas')}; END IF;
  END $f$`);

  flow('Hermes starts a process case (SECURITY DEFINER reads the contract and bumps its counter)', SIGNED_IN, () => `DO $f$ BEGIN
    IF public.fn_hermes_start_process_case('PC-1') IS DISTINCT FROM 'Proceso fixture' THEN ${fail('contract not resolved')}; END IF;
    PERFORM 1 FROM public.soi_process_contracts WHERE process_code = 'PC-1' AND recurrence_count = 1;
  END $f$`);
  return c;
}

const EXPECTED_POLICIES = {
  configuracion_recordatorios: ['configuracion_recordatorios_insert', 'configuracion_recordatorios_read', 'configuracion_recordatorios_update'],
  departamentos: ['departamentos_gestor_update', 'departamentos_read'],
  ejercicios: ['ejercicios_gestor_write', 'ejercicios_read'],
  instrumentos: ['instrumentos_gestor_insert', 'instrumentos_gestor_update', 'instrumentos_read'],
  modulos: ['modulos_gestor_write', 'modulos_read'],
  niveles: ['niveles_gestor_write', 'niveles_read'],
  seguimiento_reglas: ['seguimiento_reglas_gestor_insert', 'seguimiento_reglas_gestor_update', 'seguimiento_reglas_read'],
  soi_process_contracts: ['soi_process_contracts_read'],
  unidades: ['unidades_gestor_write', 'unidades_read'],
};
const TABLES = Object.keys(EXPECTED_POLICIES);

// exact table privileges for `authenticated`; `anon` must have none
const EXPECTED_ACL = {
  configuracion_recordatorios: 'INSERT,SELECT,UPDATE', departamentos: 'SELECT', ejercicios: 'DELETE,INSERT,SELECT,UPDATE',
  instrumentos: 'INSERT,SELECT,UPDATE', modulos: 'DELETE,INSERT,SELECT,UPDATE', niveles: 'DELETE,INSERT,SELECT,UPDATE',
  seguimiento_reglas: 'INSERT,SELECT,UPDATE', soi_process_contracts: 'SELECT', unidades: 'DELETE,INSERT,SELECT,UPDATE',
};
const NEW_FUNCTIONS = ['tiene_capacidad_configuracion', 'puede_leer_catalogo_staff', 'puede_leer_configuracion_institucional'];

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
  const acl = await client.query(`SELECT c.relname, c.relrowsecurity, (SELECT string_agg(a, ',' ORDER BY a) FROM unnest(c.relacl::text[]) a) AS acl
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
const b = spawnSync(process.execPath, [path.resolve(here, '../anon-write-fix/build_baseline.mjs'), 'soi_b5_tpl', '--from-prod-subset'], { stdio: 'inherit', env: process.env });
if (b.status !== 0) throw new Error('baseline build failed');
await withDb('soi_b5_tpl', async (c) => {
  await c.query(baseMigrationSql);              // production already has the eight-tables fix (ledger 20261018042037)
  await c.query(subsetSql);
  await c.query(fixtureSql);
});
const clone = async (name) => {
  await admin(`DROP DATABASE IF EXISTS "${name}" WITH (FORCE)`);
  await admin(`CREATE DATABASE "${name}" TEMPLATE soi_b5_tpl`);
};

// BEFORE
await clone('soi_b5_before');
await runCases('soi_b5_before', 'before', beforeCases());
const snapBefore = await withDb('soi_b5_before', snapshot);
await withDb('soi_b5_before', async (client) => {
  const exposed = await client.query(`SELECT string_agg(t, ',' ORDER BY t) AS tables FROM unnest($1::text[]) t
    WHERE has_table_privilege('anon', 'public.' || t, 'INSERT') AND has_table_privilege('anon', 'public.' || t, 'UPDATE')`, [TABLES]);
  plain('before', 'anon holds INSERT+UPDATE on seven of the nine tables (instrumentos and soi_process_contracts never had an anon entry)',
    'ejercicios,departamentos,modulos,niveles,seguimiento_reglas,unidades,configuracion_recordatorios'.split(',').sort().join(','), exposed.rows[0].tables);
});

// AFTER matrix + idempotency + ACL + policies + flows
await clone('soi_b5_after');
await withDb('soi_b5_after', (c) => c.query(migrationSql));
await runCases('soi_b5_after', 'after', matrixCases());
const snap1 = await withDb('soi_b5_after', snapshot);
let secondApply = 'applied';
try { await withDb('soi_b5_after', (c) => c.query(migrationSql)); } catch (e) { secondApply = `error: ${e.message}`; }
const snap2 = await withDb('soi_b5_after', snapshot);
plain('idempotency', 'the migration can be applied a second time', 'applied', secondApply);
plain('idempotency', 'applying the migration twice yields an identical catalog', 'same', snap1 === snap2 ? 'same' : 'different');
await runCases('soi_b5_after', 'flows', flowCases(), { replica: false });

await withDb('soi_b5_after', async (client) => {
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
    const rls = await client.query(`SELECT relrowsecurity FROM pg_class WHERE oid = $1::regclass`, [`public.${t}`]);
    plain('acl', `${t}: authenticated holds exactly ${EXPECTED_ACL[t]}`, EXPECTED_ACL[t], priv.rows[0].have ?? '');
    plain('acl', `${t}: anon holds no privilege`, 'none', anon.rows[0].have ?? 'none');
    plain('acl', `${t}: row level security is enabled`, 'true', String(rls.rows[0].relrowsecurity));
  }
  const colPriv = await client.query(`SELECT string_agg(attname, ',' ORDER BY attname) AS cols FROM pg_attribute
    WHERE attrelid = 'public.departamentos'::regclass AND attnum > 0 AND NOT attisdropped AND has_column_privilege('authenticated', 'public.departamentos', attname, 'UPDATE')`);
  plain('acl', 'departamentos: authenticated can UPDATE only the columns the screen edits', 'activo,email,nombre,responsable_email,responsable_nombre,updated_at', colPriv.rows[0].cols ?? '');
  const fn = await client.query(`SELECT proname, has_function_privilege('anon', p.oid, 'EXECUTE') AS anon_x, has_function_privilege('authenticated', p.oid, 'EXECUTE') AS auth_x
    FROM pg_proc p WHERE pronamespace = 'public'::regnamespace AND proname = ANY($1)`, [NEW_FUNCTIONS]);
  plain('acl', 'the three new functions exist, anon cannot execute any, authenticated can', '3/0/3', `${fn.rows.length}/${fn.rows.filter((r) => r.anon_x).length}/${fn.rows.filter((r) => r.auth_x).length}`);
});

// SELF-CHECK: a residual wide-open policy (or disabled RLS) the migration does not know must abort it atomically
for (const [label, residual] of [
  ['unknown ALL policy on niveles', `CREATE POLICY legacy_extra_all ON public.niveles FOR ALL TO authenticated USING (true) WITH CHECK (true)`],
  ['unknown policy TO public on departamentos', `CREATE POLICY legacy_public_read ON public.departamentos FOR SELECT TO public USING (true)`],
  ['unknown UPDATE policy "own OR true" on configuracion_recordatorios', `CREATE POLICY legacy_obscure ON public.configuracion_recordatorios FOR UPDATE TO authenticated USING (profile_id = auth.uid() OR true)`],
  ['unknown RESTRICTIVE policy on instrumentos', `CREATE POLICY legacy_restrictive ON public.instrumentos AS RESTRICTIVE FOR ALL TO authenticated USING (true)`],
  ['row level security disabled on soi_process_contracts', `ALTER TABLE public.soi_process_contracts DISABLE ROW LEVEL SECURITY`],
]) {
  await clone('soi_b5_sc');
  const r = await withDb('soi_b5_sc', async (c) => {
    await c.query(residual);
    const pre = await snapshot(c);
    let failed = null;
    try { await c.query(migrationSql); } catch (e) { failed = e.message; }
    await c.query('ROLLBACK').catch(() => {});
    const post = await snapshot(c);
    const helpers = await c.query(`SELECT count(*)::int AS n FROM pg_proc WHERE proname = ANY($1)`, [NEW_FUNCTIONS]);
    return { failed, unchanged: pre === post, helpers: helpers.rows[0].n };
  });
  plain('self-check', `migration aborts on: ${label}`, 'aborted', r.failed ? 'aborted' : 'applied');
  plain('self-check', `abort is atomic (${label}): catalog unchanged, no helper left`, 'unchanged', r.unchanged && r.helpers === 0 ? 'unchanged' : 'changed');
}

// PRECONDITION: without the eight-tables migration (tiene_capacidad_academica) the migration refuses to run
await clone('soi_b5_sc');
{
  const r = await withDb('soi_b5_sc', async (c) => {
    await c.query('DROP FUNCTION public.tiene_capacidad_academica(text) CASCADE');
    const pre = await snapshot(c);
    let failed = null;
    try { await c.query(migrationSql); } catch (e) { failed = e.message; }
    await c.query('ROLLBACK').catch(() => {});
    return { failed, unchanged: pre === (await snapshot(c)) };
  });
  plain('self-check', 'migration refuses to run without public.tiene_capacidad_academica (20261017180000 not applied)', 'aborted', r.failed && /tiene_capacidad_academica/.test(r.failed) ? 'aborted' : 'applied');
  plain('self-check', 'refusal leaves the catalog unchanged', 'unchanged', r.unchanged ? 'unchanged' : 'changed');
}

// ROLLBACK
await clone('soi_b5_rb');
await withDb('soi_b5_rb', (c) => c.query(migrationSql));
await withDb('soi_b5_rb', (c) => c.query(rollbackSql));
const snapRb = await withDb('soi_b5_rb', snapshot);
plain('rollback', 'rollback restores the exact pre-migration policies, table ACLs, RLS flags and column ACLs', 'same', snapRb === snapBefore ? 'same' : 'different');
const helpers = await withDb('soi_b5_rb', (c) => c.query(`SELECT count(*)::int AS n FROM pg_proc WHERE proname = ANY($1)`, [NEW_FUNCTIONS]));
plain('rollback', 'rollback removes the three helper functions', 'removed', helpers.rows[0].n === 0 ? 'removed' : 'present');
const keepBase = await withDb('soi_b5_rb', (c) => c.query(`SELECT count(*)::int AS n FROM pg_proc WHERE proname = 'tiene_capacidad_academica'`));
plain('rollback', 'rollback leaves tiene_capacidad_academica (owned by 20261018042037) in place', '1', String(keepBase.rows[0].n));
await withDb('soi_b5_rb', (c) => c.query(rollbackSql));
plain('rollback', 'rollback is idempotent (second run leaves the same catalog)', 'same', (await withDb('soi_b5_rb', snapshot)) === snapBefore ? 'same' : 'different');
await runCases('soi_b5_rb', 'rollback', beforeCases());
await withDb('soi_b5_rb', (c) => c.query(migrationSql));
plain('rollback', 'migration re-applies cleanly after a rollback (same catalog as a fresh apply)', 'same', (await withDb('soi_b5_rb', snapshot)) === snap1 ? 'same' : 'different');

if (!keep) for (const d of ['soi_b5_before', 'soi_b5_after', 'soi_b5_sc', 'soi_b5_rb']) await admin(`DROP DATABASE IF EXISTS "${d}" WITH (FORCE)`);

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

// Isolated PostgreSQL suite for registros_sesion + cerrar_sesion (Bitácora de clase, F2).
// Usage: node run_tests.mjs [--mutate N]   env: PGHOST PGPORT (default 127.0.0.1 54332)
// With --mutate N the migration is altered (see MUTATIONS) and the suite is EXPECTED to fail
// (exit 0 = mutation killed, exit 3 = mutation survived).
// TEST HARNESS ONLY. Needs a throw-away PostgreSQL; never point it at a real project.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID as uuid } from 'node:crypto';
import pg from 'pg';

const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(here, '../../..');
const MIG = path.join(ROOT, 'supabase/migrations/20261020190000_registros_sesion_cerrar_sesion.sql');
const ROLLBACK = path.join(ROOT, 'supabase/rollback/20261020190000_registros_sesion_cerrar_sesion.rollback.sql');
const VALORACION_MIG = path.join(ROOT, 'supabase/migrations/20261020170631_asistencias_valoracion_clase.sql');
const BOOTSTRAP = path.resolve(here, '../documentos-qr/00_supabase_bootstrap.sql');
const FIXTURES = path.join(here, '01_fixtures.sql');
const conn = {
  host: process.env.PGHOST || '127.0.0.1',
  port: Number(process.env.PGPORT || 54332),
  user: 'postgres',
  password: 'test',
};
const mi = process.argv.indexOf('--mutate');
const mutation = mi > -1 ? Number(process.argv[mi + 1]) : 0;

// Each mutation replaces an exact anchor of the migration; the anchor must exist (or the run aborts).
const rep = (from, to) => (s) => {
  if (!s.includes(from)) throw new Error(`mutation anchor not found: ${from.slice(0, 70)}`);
  return s.replace(from, () => to);
};
export const MUTATIONS = {
  1: ['ownership check removed', rep(
    'IF v_sesion.maestro_id IS DISTINCT FROM v_maestro AND NOT public.maestro_en_clase(v_sesion.clase_id) THEN',
    'IF false THEN')],
  2: ['BR-02 present check removed for alumno scope', rep(
    'IF NOT (v_alumno = ANY (v_presentes)) THEN',
    'IF false THEN')],
  3: ['client destinatarios_ids trusted for grupo', rep(
    'v_destinatarios := v_presentes;',
    'v_destinatarios := COALESCE(ARRAY(SELECT jsonb_array_elements_text(v_item -> \'destinatarios_ids\')::uuid), v_presentes);')],
  4: ['confirmed rows omitted from payload are not discarded', rep(
    'AND NOT (rs.id = ANY (v_ids));',
    'AND false;')],
  5: ['same-session guard removed from registros upsert', (s) => rep(
    'IF EXISTS (SELECT 1 FROM public.registros_sesion x WHERE x.id = v_id AND x.sesion_clase_id <> v_sesion.id) THEN',
    'IF false THEN')(s).replace('WHERE rs.sesion_clase_id = v_sesion.id;', ';')],
  6: ['INSERT granted to authenticated', rep(
    'GRANT SELECT ON public.registros_sesion TO authenticated;',
    'GRANT SELECT, INSERT ON public.registros_sesion TO authenticated;')],
  7: ['valoracion presence check removed', rep(
    'IF NOT (ARRAY[v_alumno] <@ v_presentes) THEN',
    'IF false THEN')],
  8: ['RPC executable by anon', rep(
    'REVOKE ALL ON FUNCTION public.cerrar_sesion(jsonb) FROM PUBLIC, anon;',
    'GRANT EXECUTE ON FUNCTION public.cerrar_sesion(jsonb) TO anon;')],
  9: ['refuerzo/tarea do not start abierto', rep(
    "THEN 'abierto' ELSE NULL END,\n      v_maestro, now(), now(), now()",
    "THEN NULL ELSE NULL END,\n      v_maestro, now(), now(), now()")],
  11: ['session jsonb stores DB words instead of UI codes', rep(
    "CASE a.estado WHEN 'presente' THEN 'P' WHEN 'ausente' THEN 'A' WHEN 'justificado' THEN 'J' WHEN 'tarde' THEN 'T' ELSE a.estado END",
    'a.estado')],
  10: ['zero-present grupo check removed (BR-03)', rep(
    'IF cardinality(v_presentes) = 0 THEN',
    'IF false THEN')],
};

const admin = new pg.Client({ ...conn, database: 'postgres' });
await admin.connect();
const dbName = `registros_${mutation}_${process.pid}`;
await admin.query(`DROP DATABASE IF EXISTS ${dbName}`);
await admin.query(`CREATE DATABASE ${dbName}`);
await admin.end();
const db = new pg.Client({ ...conn, database: dbName });
await db.connect();

let pass = 0;
let fail = 0;
const ok = (cond, name, extra) => {
  if (cond) pass++;
  else { fail++; console.log('  FAIL', name, extra ?? ''); }
};
const sql = (q, p) => db.query(q, p);
const count = async (q, p = []) => Number((await sql(q, p)).rows[0].n);

/** Runs one statement as an API role: 'anon' or a labelled user (authenticated). */
async function as(who, q, params = []) {
  const apiRole = who === 'anon' ? 'anon' : 'authenticated';
  await db.query('BEGIN');
  try {
    if (U[who]) await db.query("SELECT set_config('request.jwt.claims', $1, true)", [JSON.stringify({ sub: U[who], role: apiRole })]);
    await db.query(`SET LOCAL ROLE ${apiRole}`);
    const r = await db.query(q, params);
    await db.query('COMMIT');
    return { rows: r.rows, rowCount: r.rowCount, err: null };
  } catch (e) {
    await db.query('ROLLBACK');
    return { rows: [], rowCount: 0, err: e };
  }
}
const denied = (r) => !!r.err && (r.err.code === '42501' || /permission denied|row-level security/i.test(r.err.message));
const code = (r, c) => !!r.err && r.err.code === c;
const cerrar = (who, payload) => as(who, 'SELECT public.cerrar_sesion($1::jsonb) AS r', [JSON.stringify(payload)]);
const resultOf = (r) => r.rows[0]?.r ?? {};
const sameSet = (a, b) => JSON.stringify([...(a ?? [])].sort()) === JSON.stringify([...(b ?? [])].sort());

const U = {};
const M = {};
const AL = {};
const C = {};
const S = {};
const IND = uuid();
const NOTA = 'Ana y Luis trabajaron fracciones; #Ana necesita refuerzo en "mixtos" — ¡bien!\nSegunda línea: tarea 3 para #Luis.';
const R = { grupo: uuid(), refuerzo: uuid(), tarea: uuid(), desempeno: uuid() };
const G = { grupo: uuid(), refuerzo: uuid(), tarea: uuid(), desempeno: uuid() };

const registrosBase = () => [
  { id: R.grupo, grupo_registro_id: G.grupo, tipo: 'contenido', alcance: 'grupo', texto: 'Repasamos fracciones.', evidencia: 'trabajaron fracciones', evidencia_inicio: 0, evidencia_fin: 21, origen: 'escrito', destinatarios_ids: [AL.marta, AL.ana] },
  { id: R.refuerzo, grupo_registro_id: G.refuerzo, tipo: 'refuerzo', alcance: 'alumno', alumno_id: AL.ana, texto: 'Refuerzo de mixtos', evidencia: '#Ana necesita refuerzo en "mixtos"', origen: 'chip' },
  { id: R.tarea, grupo_registro_id: G.tarea, tipo: 'tarea', alcance: 'alumno', alumno_id: AL.luis, texto: 'Tarea 3', evidencia: 'tarea 3 para #Luis', origen: 'escrito' },
  { id: R.desempeno, grupo_registro_id: G.desempeno, tipo: 'desempeno', alcance: 'alumno', alumno_id: AL.ana, texto: 'Buen desempeño', evidencia: 'trabajaron', origen: 'dictado', indicador_id: IND },
];
const asistenciaBase = () => [
  { alumno_id: AL.ana, estado: 'presente' },
  { alumno_id: AL.luis, estado: 'tarde' },
  { alumno_id: AL.marta, estado: 'ausente' },
  { alumno_id: AL.pedro, estado: 'justificado' },
];
const cierreBase = (over = {}) => ({
  sesion_id: S.uno,
  contenido: NOTA,
  asistencia: asistenciaBase(),
  registros: registrosBase(),
  valoraciones: [{ alumno_id: AL.ana, valoracion: 4 }, { alumno_id: AL.luis, valoracion: 5 }],
  ...over,
});
const regRow = async (id) => (await sql('SELECT *, destinatarios_ids::text[] AS dest FROM public.registros_sesion WHERE id = $1', [id])).rows[0];
const asistenciaRow = async (sesion, alumno) => (await sql('SELECT * FROM public.asistencias WHERE sesion_clase_id = $1 AND alumno_id = $2', [sesion, alumno])).rows[0];
const estadoAsistencia = async (sesion, alumno) => (await asistenciaRow(sesion, alumno))?.estado;
const sesionRow = async (id) => (await sql('SELECT * FROM public.sesiones_clase WHERE id = $1', [id])).rows[0];
const registrosDe = (sesion) => count('SELECT count(*)::int AS n FROM public.registros_sesion WHERE sesion_clase_id = $1', [sesion]);
const snapshotRegistros = async (sesion) => JSON.stringify((await sql(
  'SELECT id, estado, seguimiento, texto, tipo, alcance, alumno_id, destinatarios_ids::text[] AS dest FROM public.registros_sesion WHERE sesion_clase_id = $1 ORDER BY id', [sesion])).rows);

try {
  await sql(fs.readFileSync(BOOTSTRAP, 'utf8'));
  await sql(fs.readFileSync(FIXTURES, 'utf8'));
  await sql(fs.readFileSync(VALORACION_MIG, 'utf8'));
  let mig = fs.readFileSync(MIG, 'utf8');
  if (mutation) {
    const [label, fn] = MUTATIONS[mutation];
    const m = fn(mig);
    if (m === mig) throw new Error(`mutation ${mutation} did not change the migration`);
    mig = m;
    console.log(`MUTATION ${mutation}: ${label}`);
  }
  await sql(mig);

  // Users: owner (titular), suplente (same class), foreign (no relation), alumno (no maestro row).
  for (const label of ['owner', 'suplente', 'foreign', 'alumno']) {
    U[label] = (await sql('INSERT INTO auth.users (email) VALUES ($1) RETURNING id', [`${label}@t.local`])).rows[0].id;
    await sql('INSERT INTO public.profiles (id) VALUES ($1)', [U[label]]);
  }
  for (const label of ['owner', 'suplente', 'foreign']) {
    M[label] = (await sql('INSERT INTO public.maestros (user_id, nombre_completo) VALUES ($1, $2) RETURNING id', [U[label], label])).rows[0].id;
  }
  for (const n of ['ana', 'luis', 'marta', 'pedro']) {
    AL[n] = (await sql('INSERT INTO public.alumnos (nombre_completo) VALUES ($1) RETURNING id', [n])).rows[0].id;
  }
  C.uno = (await sql('INSERT INTO public.clases (maestro_principal_id, maestro_suplente_id) VALUES ($1, $2) RETURNING id', [M.owner, M.suplente])).rows[0].id;
  C.dos = (await sql('INSERT INTO public.clases (maestro_principal_id) VALUES ($1) RETURNING id', [M.owner])).rows[0].id;
  const nuevaSesion = async (clase, fecha) => (await sql(
    'INSERT INTO public.sesiones_clase (clase_id, maestro_id, fecha, estado, borrador) VALUES ($1, $2, $3, $4, true) RETURNING id',
    [clase, M.owner, fecha, 'abierta'])).rows[0].id;
  S.uno = await nuevaSesion(C.uno, '2026-10-20');
  S.dos = await nuevaSesion(C.dos, '2026-10-20');
  S.tres = await nuevaSesion(C.uno, '2026-10-21');
  await sql('INSERT INTO public.maestro_indicadores (id) VALUES ($1)', [IND]);

  // ── A. grants, privileges, definer ──
  console.log('A. grants and privileges');
  const tablePriv = async (role, p) => (await sql("SELECT has_table_privilege($1, 'public.registros_sesion', $2) AS ok", [role, p])).rows[0].ok;
  ok(await tablePriv('authenticated', 'SELECT'), 'authenticated can SELECT registros_sesion');
  for (const p of ['INSERT', 'UPDATE', 'DELETE']) {
    ok(!(await tablePriv('authenticated', p)), `authenticated has no ${p} privilege on registros_sesion`);
  }
  ok(!(await tablePriv('anon', 'SELECT')) && !(await tablePriv('anon', 'INSERT')), 'anon has no privilege on registros_sesion');
  const publicExec = await count(
    "SELECT count(*)::int AS n FROM pg_proc p, aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) a WHERE p.proname = 'cerrar_sesion' AND a.grantee = 0 AND a.privilege_type = 'EXECUTE'");
  ok(publicExec === 0, 'PUBLIC has no EXECUTE on cerrar_sesion');
  ok((await sql("SELECT has_function_privilege('anon', 'public.cerrar_sesion(jsonb)', 'EXECUTE') AS ok")).rows[0].ok === false, 'anon cannot EXECUTE cerrar_sesion');
  ok((await sql("SELECT has_function_privilege('authenticated', 'public.cerrar_sesion(jsonb)', 'EXECUTE') AS ok")).rows[0].ok === true, 'authenticated can EXECUTE cerrar_sesion');
  ok((await sql("SELECT prosecdef FROM pg_proc WHERE proname = 'cerrar_sesion'")).rows[0].prosecdef === true, 'cerrar_sesion is SECURITY DEFINER');
  ok((await sql("SELECT relrowsecurity FROM pg_class WHERE oid = 'public.registros_sesion'::regclass")).rows[0].relrowsecurity === true, 'RLS enabled on registros_sesion');
  ok(denied(await as('anon', 'SELECT public.cerrar_sesion($1::jsonb)', [JSON.stringify(cierreBase())])), 'anon cannot call cerrar_sesion');

  // ── B. happy path ──
  console.log('B. happy path');
  const h = await cerrar('owner', cierreBase());
  ok(!h.err, 'owner closes the class', h.err?.message);
  const hr = resultOf(h);
  ok(hr.sesion_id === S.uno && hr.presentes === 2 && hr.asistencias === 4 && hr.registros === 4 && hr.descartados === 0 && hr.valoraciones === 2,
    'returns counts', JSON.stringify(hr));
  ok((await count('SELECT count(*)::int AS n FROM public.asistencias WHERE sesion_clase_id = $1', [S.uno])) === 4, 'four attendance rows written');
  ok((await estadoAsistencia(S.uno, AL.ana)) === 'presente' && (await estadoAsistencia(S.uno, AL.luis)) === 'tarde'
    && (await estadoAsistencia(S.uno, AL.marta)) === 'ausente' && (await estadoAsistencia(S.uno, AL.pedro)) === 'justificado', 'attendance states stored');
  ok((await count('SELECT count(*)::int AS n FROM public.asistencias WHERE sesion_clase_id = $1 AND registrado_por = $2', [S.uno, U.owner])) === 4, 'attendance registrado_por = auth.uid()');
  ok((await registrosDe(S.uno)) === 4, 'four records stored for the session');
  ok((await count("SELECT count(*)::int AS n FROM public.registros_sesion WHERE sesion_clase_id = $1 AND estado = 'confirmado'", [S.uno])) === 4, 'all records confirmed');
  const rg = await regRow(R.grupo);
  ok(sameSet(rg.dest, [AL.ana, AL.luis]), 'grupo freezes the server present set, ignoring the client list (BR-03)', JSON.stringify(rg.dest));
  ok(rg.seguimiento === null, 'contenido grupal has no seguimiento');
  ok((await regRow(R.refuerzo)).seguimiento === 'abierto', 'refuerzo is born abierto (BR-07)');
  ok((await regRow(R.tarea)).seguimiento === 'abierto', 'tarea is born abierto (BR-07)');
  ok((await regRow(R.desempeno)).seguimiento === null, 'desempeno has no seguimiento');
  ok((await regRow(R.desempeno)).indicador_id === IND, 'indicador_id linked');
  ok((await regRow(R.refuerzo)).confirmado_por === M.owner, 'confirmado_por = caller maestro');
  ok((await asistenciaRow(S.uno, AL.ana)).valoracion === 4 && (await asistenciaRow(S.uno, AL.luis)).valoracion === 5, 'valoraciones stored for present students');
  ok((await asistenciaRow(S.uno, AL.marta)).valoracion === null, 'absent student not rated');
  ok((await asistenciaRow(S.uno, AL.ana)).valorada_por === U.owner, 'valorada_por = auth.uid()');
  const sr = await sesionRow(S.uno);
  ok(sr.contenido === NOTA, 'original note stored verbatim (BR-11)');
  ok(sr.estado === 'registrada' && sr.borrador === false, 'session marked registrada and not draft');
  ok(Array.isArray(sr.asistencia) && sr.asistencia.length === 4, 'session asistencia jsonb mirrors attendance');
  // Producción guarda en este jsonb los códigos de la interfaz (P/A/J/T), no las palabras de asistencias.estado.
  const codes = Object.fromEntries((sr.asistencia || []).map((x) => [x.alumno_id, x.estado]));
  ok(codes[AL.ana] === 'P' && codes[AL.luis] === 'T' && codes[AL.marta] === 'A' && codes[AL.pedro] === 'J',
    'session asistencia jsonb keeps the UI codes P/T/A/J that the app reads', JSON.stringify(codes));

  // ── C. idempotence (BR-10) ──
  console.log('C. idempotence');
  const snap1 = await snapshotRegistros(S.uno);
  const h2 = await cerrar('owner', cierreBase());
  ok(!h2.err && resultOf(h2).presentes === 2 && resultOf(h2).registros === 4 && resultOf(h2).descartados === 0, 'same payload twice succeeds with the same counts', h2.err?.message);
  ok((await registrosDe(S.uno)) === 4 && (await count('SELECT count(*)::int AS n FROM public.asistencias WHERE sesion_clase_id = $1', [S.uno])) === 4, 'no duplicate rows after a re-close');
  ok((await snapshotRegistros(S.uno)) === snap1, 'same payload twice leaves the same record state');

  // ── D. read access (RLS) ──
  console.log('D. read access');
  const reads = async (who) => (await as(who, 'SELECT id FROM public.registros_sesion WHERE sesion_clase_id = $1', [S.uno])).rows.length;
  ok((await reads('owner')) === 4, 'session owner reads the records');
  ok((await reads('suplente')) === 4, 'substitute teacher (maestro_en_clase) reads the records');
  ok((await reads('foreign')) === 0, 'foreign teacher reads none');
  ok((await reads('alumno')) === 0, 'user without maestro profile reads none');

  // ── E. substitute closes; frozen destinatarios survive later attendance changes ──
  console.log('E. substitute and frozen destinatarios');
  const sup = await cerrar('suplente', cierreBase({ asistencia: [{ alumno_id: AL.luis, estado: 'tarde' }], valoraciones: [] }));
  ok(!sup.err && resultOf(sup).descartados === 0 && resultOf(sup).presentes === 2, 'substitute teacher may close the class', sup.err?.message);
  await sql("UPDATE public.asistencias SET estado = 'ausente' WHERE sesion_clase_id = $1 AND alumno_id = $2", [S.uno, AL.luis]);
  ok(sameSet((await regRow(R.grupo)).dest, [AL.ana, AL.luis]), 'later attendance change does not alter frozen destinatarios (BR-03)');
  await sql("UPDATE public.asistencias SET estado = 'tarde' WHERE sesion_clase_id = $1 AND alumno_id = $2", [S.uno, AL.luis]);

  // ── F. foreign teacher: rejected and nothing written ──
  console.log('F. foreign teacher');
  const intruso = uuid();
  const fx = await cerrar('foreign', cierreBase({
    asistencia: [{ alumno_id: AL.marta, estado: 'presente' }],
    registros: [...registrosBase(), { id: intruso, grupo_registro_id: uuid(), tipo: 'contenido', alcance: 'grupo', texto: 'Intruso', evidencia: 'x', origen: 'escrito' }],
    valoraciones: [],
  }));
  ok(code(fx, '42501'), 'foreign teacher gets 42501');
  ok((await estadoAsistencia(S.uno, AL.marta)) === 'ausente', 'foreign close wrote no attendance');
  ok(!(await regRow(intruso)), 'foreign close wrote no record');
  ok((await registrosDe(S.uno)) === 4, 'record count unchanged after foreign close');

  // ── G. BR-02: individual records only for present students ──
  console.log('G. BR-02');
  for (const [nombre, id] of [['ausente (marta)', AL.marta], ['justificado (pedro)', AL.pedro]]) {
    const br2 = uuid();
    const r = await cerrar('owner', cierreBase({
      asistencia: [{ alumno_id: AL.ana, estado: 'tarde' }],
      registros: [{ id: br2, grupo_registro_id: uuid(), tipo: 'refuerzo', alcance: 'alumno', alumno_id: id, texto: 'x', evidencia: 'x', origen: 'chip' }, ...registrosBase()],
      valoraciones: [],
    }));
    ok(code(r, 'P0001') && /BR-02/.test(r.err?.message ?? ''), `individual record for ${nombre} rejected (BR-02)`, r.err?.message);
    ok(!(await regRow(br2)), `nothing written for ${nombre}`);
  }
  ok((await estadoAsistencia(S.uno, AL.ana)) === 'presente', 'BR-02 rejection rolled back attendance changes');

  // ── H. alumno scope needs alumno_id ──
  console.log('H. input validation');
  const noAl = uuid();
  const r1 = await cerrar('owner', cierreBase({ registros: [{ id: noAl, grupo_registro_id: uuid(), tipo: 'refuerzo', alcance: 'alumno', texto: 'x', evidencia: 'x', origen: 'chip' }] }));
  ok(code(r1, '22023') && !(await regRow(noAl)), 'alcance alumno without alumno_id rejected with 22023');

  // ── I. grupo with zero present students ──
  console.log('I. grupo without present students');
  const zero = uuid();
  const r2 = await cerrar('owner', {
    sesion_id: S.tres,
    contenido: 'Nadie vino',
    asistencia: [{ alumno_id: AL.ana, estado: 'ausente' }, { alumno_id: AL.luis, estado: 'justificado' }],
    registros: [{ id: zero, grupo_registro_id: uuid(), tipo: 'contenido', alcance: 'grupo', texto: 'Grupal', evidencia: 'Grupal', origen: 'escrito' }],
    valoraciones: [],
  });
  ok(code(r2, 'P0001'), 'grupo with zero present students rejected (BR-03)', r2.err?.message);
  ok(!(await regRow(zero)), 'no grupal record written');
  ok((await count('SELECT count(*)::int AS n FROM public.asistencias WHERE sesion_clase_id = $1', [S.tres])) === 0, 'attendance rolled back for the empty session');

  // ── J. re-close with fewer records discards the omitted ones ──
  console.log('J. re-close semantics');
  const few = await cerrar('owner', cierreBase({ asistencia: [], registros: registrosBase().slice(0, 2), valoraciones: [] }));
  ok(!few.err && resultOf(few).descartados === 2, 'omitted confirmed records are discarded (2)', few.err?.message ?? JSON.stringify(resultOf(few)));
  ok((await regRow(R.tarea)).estado === 'descartado' && (await regRow(R.desempeno)).estado === 'descartado', 'omitted rows are marked descartado, not deleted');
  ok((await regRow(R.grupo)).estado === 'confirmado' && (await regRow(R.refuerzo)).estado === 'confirmado', 'kept rows stay confirmed');
  const full = await cerrar('owner', cierreBase({ asistencia: [], valoraciones: [] }));
  ok(!full.err && resultOf(full).descartados === 0, 'closing again with every record restores them', full.err?.message);
  ok((await regRow(R.tarea)).estado === 'confirmado' && (await regRow(R.tarea)).seguimiento === 'abierto', 'restored tarea is confirmed and still abierto');
  ok((await registrosDe(S.uno)) === 4, 'still four records, no duplicates');

  // ── K. a record id from another session cannot be hijacked ──
  console.log('K. cross-session guard');
  const hJ = uuid();
  const otra = await cerrar('owner', {
    sesion_id: S.dos, contenido: 'Otra sesión', asistencia: [{ alumno_id: AL.ana, estado: 'presente' }],
    registros: [{ id: hJ, grupo_registro_id: uuid(), tipo: 'contenido', alcance: 'grupo', texto: 'De la otra sesión', evidencia: 'x', origen: 'escrito' }],
    valoraciones: [],
  });
  ok(!otra.err, 'setup: second session closed', otra.err?.message);
  const hijack = await cerrar('owner', cierreBase({
    asistencia: [], valoraciones: [],
    registros: [...registrosBase(), { id: hJ, grupo_registro_id: uuid(), tipo: 'contenido', alcance: 'grupo', texto: 'Secuestrado', evidencia: 'x', origen: 'escrito' }],
  }));
  ok(code(hijack, '42501'), 'record id of another session cannot be taken over');
  const hjRow = await regRow(hJ);
  ok(hjRow.sesion_clase_id === S.dos && hjRow.texto === 'De la otra sesión', 'other session record untouched');

  // ── L. valoraciones: range and presence, atomic ──
  console.log('L. valoraciones');
  const rv = uuid();
  const v6 = await cerrar('owner', cierreBase({
    asistencia: [{ alumno_id: AL.marta, estado: 'presente' }],
    registros: [...registrosBase(), { id: rv, grupo_registro_id: uuid(), tipo: 'contenido', alcance: 'grupo', texto: 'Con 6', evidencia: 'x', origen: 'escrito' }],
    valoraciones: [{ alumno_id: AL.ana, valoracion: 6 }],
  }));
  ok(code(v6, '22023'), 'valoracion 6 rejected with 22023');
  ok(!(await regRow(rv)) && (await estadoAsistencia(S.uno, AL.marta)) === 'ausente', 'invalid valoracion rolled back everything');
  const vAbs = await cerrar('owner', cierreBase({ asistencia: [], valoraciones: [{ alumno_id: AL.marta, valoracion: 3 }] }));
  ok(code(vAbs, 'P0001'), 'valoracion for an absent student rejected', vAbs.err?.message);
  ok((await asistenciaRow(S.uno, AL.marta)).valoracion === null, 'absent student keeps no valoracion');

  // ── M. unknown tipo and estado ──
  console.log('M. enumerations');
  const bt = await cerrar('owner', cierreBase({ registros: [{ id: uuid(), grupo_registro_id: uuid(), tipo: 'evaluacion', alcance: 'grupo', texto: 'x', evidencia: 'x', origen: 'escrito', destinatarios_ids: [] }] }));
  ok(code(bt, '22023') && /evaluacion/.test(bt.err?.message ?? ''), 'unknown tipo rejected with a clear message', bt.err?.message);
  const be = await cerrar('owner', cierreBase({ asistencia: [{ alumno_id: AL.ana, estado: 'llego' }] }));
  ok(code(be, '22023'), 'unknown attendance estado rejected with 22023');

  // ── N. indicador FK fails the whole close ──
  console.log('N. indicador_id');
  const rI = uuid();
  const fk = await cerrar('owner', cierreBase({
    asistencia: [{ alumno_id: AL.marta, estado: 'presente' }],
    registros: [{ id: rI, grupo_registro_id: uuid(), tipo: 'desempeno', alcance: 'alumno', alumno_id: AL.ana, texto: 'x', evidencia: 'x', origen: 'escrito', indicador_id: uuid() }],
    valoraciones: [],
  }));
  ok(code(fk, '23503'), 'unknown indicador_id fails the close (FK)', fk.err?.message);
  ok(!(await regRow(rI)) && (await estadoAsistencia(S.uno, AL.marta)) === 'ausente', 'nothing written when the FK fails');

  // ── O. payload shape and identity ──
  console.log('O. payload shape and identity');
  ok(code(await as('owner', 'SELECT public.cerrar_sesion($1::jsonb) AS r', ['[]']), '22023'), 'non-object payload rejected with 22023');
  ok(denied(await cerrar('alumno', cierreBase())), 'user without maestro profile rejected');
  ok(denied(await cerrar('anon', cierreBase())), 'anon rejected');

  // ── P. direct DML denied for the API role ──
  console.log('P. direct DML');
  ok(denied(await as('owner', 'INSERT INTO public.registros_sesion (id, sesion_clase_id, clase_id, maestro_id, fecha, grupo_registro_id, tipo, alcance, texto, evidencia, origen, estado) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)',
    [uuid(), S.uno, C.uno, M.owner, '2026-10-20', uuid(), 'contenido', 'grupo', 'x', 'x', 'escrito', 'confirmado'])), 'owner cannot INSERT directly');
  ok(denied(await as('owner', 'UPDATE public.registros_sesion SET texto = $1', ['hack'])), 'owner cannot UPDATE directly');
  ok(denied(await as('owner', 'DELETE FROM public.registros_sesion')), 'owner cannot DELETE directly');
  ok((await regRow(R.grupo)).texto === 'Repasamos fracciones.', 'records intact after denied DML');

  // ── Q. rollback removes the module and the migration re-applies ──
  if (!mutation) {
    console.log('Q. rollback');
    await sql(fs.readFileSync(ROLLBACK, 'utf8'));
    const left = await count("SELECT (SELECT count(*) FROM pg_tables WHERE tablename = 'registros_sesion') + (SELECT count(*) FROM pg_proc WHERE proname = 'cerrar_sesion') AS n");
    ok(left === 0, 'rollback removes table and function');
    ok((await sql("SELECT count(*)::int AS n FROM pg_tables WHERE tablename = 'asistencias'")).rows[0].n === 1, 'rollback leaves asistencias intact');
    await sql(mig);
    ok(!(await cerrar('owner', cierreBase({ asistencia: [], registros: [], valoraciones: [] }))).err, 'migration re-applies and works after rollback');
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

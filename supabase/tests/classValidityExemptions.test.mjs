import { PGlite } from '@electric-sql/pglite'
import fs from 'node:fs'
import assert from 'node:assert/strict'
const root = process.cwd()
const db = new PGlite()
await db.exec(`
CREATE ROLE authenticated; CREATE ROLE anon; CREATE ROLE service_role BYPASSRLS;
CREATE SCHEMA auth; CREATE TABLE auth.users(id uuid primary key);
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ select nullif(current_setting('test.uid',true),'')::uuid $$;
CREATE FUNCTION auth.jwt() RETURNS jsonb LANGUAGE sql STABLE AS $$ select jsonb_build_object('role',coalesce(nullif(current_setting('test.role',true),''),'authenticated')) $$;
CREATE FUNCTION auth.role() RETURNS text LANGUAGE sql STABLE AS $$ select auth.jwt()->>'role' $$;
CREATE FUNCTION public.is_admin() RETURNS boolean LANGUAGE sql STABLE AS $$ select coalesce(current_setting('test.admin',true),'false')='true' $$;
CREATE FUNCTION public.fn_es_dia_lectivo(date) RETURNS boolean LANGUAGE sql STABLE AS $$ select true $$;
CREATE TABLE maestros(id uuid primary key,user_id uuid,nombre_completo text,activo boolean default true);
CREATE TABLE clases(id uuid primary key,nombre text,created_at timestamptz,activo boolean default true,maestro_principal_id uuid,maestro_suplente_id uuid,maestro_id uuid);
CREATE TABLE clase_horarios(id uuid primary key,clase_id uuid,dia text,hora_inicio time,hora_fin time,created_at timestamptz,maestro_id uuid);
CREATE TABLE sesiones_clase(contenido text, cerrada_en timestamptz,id uuid primary key,clase_id uuid,maestro_id uuid,fecha date,estado text,borrador boolean,asistencia jsonb,emergente_id uuid,alcance_tipo text,created_at timestamptz,updated_at timestamptz);
CREATE TABLE asistencias(id uuid,sesion_clase_id uuid);
CREATE TABLE periodos(fecha_inicio date,fecha_fin date,activo boolean,cerrado boolean);
CREATE TABLE registros_pendientes(id uuid primary key,maestro_id uuid,sesion_clase_id uuid,tipo text,estado text,updated_at timestamptz);
GRANT USAGE ON SCHEMA public,auth TO authenticated,service_role;
GRANT SELECT,INSERT,UPDATE ON ALL TABLES IN SCHEMA public TO authenticated;


`)
const reference = fs.readFileSync(root+'/supabase/migrations/schema_reference.sql','utf8')
for (const name of ['fn_check_and_notify_pending_asistencias','generate_pending_class_notifications','fn_maestros_asistencia_pendiente','fn_resumen_cumplimiento_asistencia']) {
  const start = reference.indexOf('CREATE OR REPLACE FUNCTION public.'+name+'(')
  const end = reference.indexOf('$function$;',reference.indexOf('AS $function$',start))+12
  await db.exec(reference.slice(start,end))
}
const migration = fs.readFileSync(root+'/supabase/migrations/20261024163827_class_validity_and_record_exemptions.sql','utf8')
await db.exec(migration)
console.log('PASS migration compiles')
const admin='00000000-0000-0000-0000-000000000001', teacher='00000000-0000-0000-0000-000000000002', cls='00000000-0000-0000-0000-000000000003', schedule='00000000-0000-0000-0000-000000000004', session='00000000-0000-0000-0000-000000000005'
await db.exec(`set test.uid='${admin}'; set test.admin='true'; INSERT INTO auth.users values ('${admin}'),('${teacher}'); INSERT INTO maestros(id,user_id,nombre_completo) values ('${teacher}','${teacher}','Isabella'); INSERT INTO clases(id,nombre,created_at,maestro_principal_id) values ('${cls}','Iniciación','2026-09-02T18:00Z','${teacher}'); INSERT INTO clase_horarios values ('${schedule}','${cls}','miércoles','08:30','10:00','2026-09-23T19:00Z','${teacher}');`)
let r=await db.query(`select * from fn_estado_asistencia_maestro('${teacher}','2026-08-01','2026-09-30')`)
assert.deepEqual(r.rows.map(x=>x.fecha.toISOString().slice(0,10)),['2026-09-23','2026-09-30'])
console.log('PASS no invented August/early September obligations')
await db.exec(`INSERT INTO sesiones_clase(id,clase_id,maestro_id,fecha,estado,borrador) values ('${session}','${cls}','${teacher}','2026-09-09','registrada',false)`)
r=await db.query(`select * from fn_estado_asistencia_maestro('${teacher}','2026-09-01','2026-09-30')`)
assert(r.rows.some(x=>x.fecha.toISOString().slice(0,10)==='2026-09-09'&&x.estado==='registrada'))
console.log('PASS real historical evidence preserved')
await db.exec(`INSERT INTO registro_exoneraciones(clase_id,maestro_id,fecha,alcance,motivo) values ('${cls}','${teacher}','2026-09-30','contenido','Incidencia verificada de contenido')`)
r=await db.query(`select estado,asistencia_completa from fn_estado_asistencia_maestro('${teacher}','2026-09-30','2026-09-30')`)
assert.equal(r.rows[0].estado,'vencida')
await db.exec(`INSERT INTO registro_exoneraciones(clase_id,maestro_id,fecha,alcance,motivo) values ('${cls}','${teacher}','2026-09-30','ambos','Incidencia de registro no recuperable')`)
r=await db.query(`select estado,asistencia_completa from fn_estado_asistencia_maestro('${teacher}','2026-09-30','2026-09-30')`)
assert.equal(r.rows[0].estado,'exonerada'); assert.equal(r.rows[0].asistencia_completa,false)
r=await db.query(`select total_clases,registradas,pendientes,vencidas from fn_resumen_cumplimiento_asistencia('2026-09-30','2026-09-30','${teacher}')`)
assert.equal(Number(r.rows[0].total_clases),0);assert.equal(Number(r.rows[0].registradas),0)
console.log('PASS scope, no fabricated attendance, and excluded denominator')
let id=(await db.query(`select id from registro_exoneraciones where alcance='ambos'`)).rows[0].id
await assert.rejects(db.exec(`UPDATE registro_exoneraciones SET motivo='Cambiar evidencia original' WHERE id='${id}'`))
await db.exec(`UPDATE registro_exoneraciones SET motivo_revocacion='Revocada tras revisión documental' WHERE id='${id}'`)
r=await db.query(`select estado from fn_estado_asistencia_maestro('${teacher}','2026-09-30','2026-09-30')`)
assert.equal(r.rows[0].estado,'vencida')
console.log('PASS immutable evidence and revocation restores obligation')
await db.exec(`SET ROLE authenticated; SET test.uid='${teacher}'; SET test.admin='false'`)
await assert.rejects(db.exec(`INSERT INTO registro_exoneraciones(clase_id,maestro_id,fecha,alcance,motivo) values ('${cls}','${teacher}','2026-09-23','ambos','Autoexoneración no permitida')`))
await assert.rejects(db.exec(`UPDATE clases SET fecha_inicio='2027-01-01' WHERE id='${cls}'`))
await assert.rejects(db.exec(`UPDATE clases SET created_at='2027-01-01' WHERE id='${cls}'`))
r=await db.query('select * from registro_exoneraciones');assert.equal(r.rows.length,2)
await db.exec(`SET test.uid='00000000-0000-0000-0000-000000000099'`)
r=await db.query('select * from registro_exoneraciones');assert.equal(r.rows.length,0)
await assert.rejects(db.query(`select * from fn_estado_asistencia_maestro('${teacher}','2026-09-30','2026-09-30')`))
console.log('PASS teacher can read own decisions but cannot self-exempt or change validity')
await db.exec(`RESET ROLE; SET test.uid='${admin}'; SET test.admin='true'`)
await db.exec(`INSERT INTO registros_pendientes(id,maestro_id,sesion_clase_id,tipo,estado,updated_at) VALUES ('${session}','${teacher}','${session}','contenido_pendiente','pendiente',now())`)
r=await db.query(`select estado from registros_pendientes`);assert.equal(r.rows[0].estado,'pendiente') // session is Sept 9, exemption Sept 30
await db.exec(`INSERT INTO registro_exoneraciones(clase_id,maestro_id,fecha,alcance,motivo) values ('${cls}','${teacher}','2026-09-09','contenido','Exoneración de contenido histórico')`)
r=await db.query(`select estado from registros_pendientes`);assert.equal(r.rows[0].estado,'cancelado')
await db.exec(`UPDATE registros_pendientes SET estado='pendiente'`)
r=await db.query(`select estado from registros_pendientes`);assert.equal(r.rows[0].estado,'cancelado')
id=(await db.query(`select id from registro_exoneraciones where fecha='2026-09-09'`)).rows[0].id
await db.exec(`UPDATE registro_exoneraciones SET motivo_revocacion='Obligación recuperada para revisión' WHERE id='${id}'`)
r=await db.query(`select estado from registros_pendientes`);assert.equal(r.rows[0].estado,'pendiente')
console.log('PASS alerts cancelled, guarded against reopening, and restored after revocation')
let notificationBody=(await db.query("select pg_get_functiondef('public.generate_pending_class_notifications()'::regprocedure) body")).rows[0].body
assert.equal((notificationBody.match(/x.revocado_en IS NULL/g)||[]).length,3)
notificationBody=(await db.query("select pg_get_functiondef('public.fn_check_and_notify_pending_asistencias()'::regprocedure) body")).rows[0].body
assert(notificationBody.includes('x.revocado_en IS NULL'))
console.log('PASS all legacy notification paths filter exemptions')
await db.close()

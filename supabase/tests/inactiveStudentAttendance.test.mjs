import assert from 'node:assert/strict'
import fs from 'node:fs'
import { PGlite } from '@electric-sql/pglite'
const db = new PGlite()
await db.exec(`
CREATE ROLE anon; CREATE ROLE authenticated;
CREATE SCHEMA auth;
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$ SELECT nullif(current_setting('test.uid',true),'')::uuid $$;
CREATE TABLE alumnos(id uuid primary key,activo boolean,estado_academico text default 'activo',motivo_baja text,observaciones_baja text,fecha_baja date);
CREATE TABLE historial_estado_alumno(alumno_id uuid,estado text,motivo text,fecha date,registrado_por uuid);
CREATE TABLE asistencias(id uuid primary key default gen_random_uuid(),alumno_id uuid references alumnos,clase_id uuid,fecha date,estado text,unique(clase_id,alumno_id,fecha));
CREATE TABLE sesiones_clase(id uuid primary key default gen_random_uuid(),fecha date,asistencia jsonb default '[]',contenido text);
`)
const active='00000000-0000-0000-0000-000000000001'
const inactive='00000000-0000-0000-0000-000000000002'
const cls='00000000-0000-0000-0000-000000000003'
const actor='00000000-0000-0000-0000-000000000004'
await db.exec(`INSERT INTO alumnos(id,activo) VALUES ('${active}',true),('${inactive}',false);
INSERT INTO asistencias(alumno_id,clase_id,fecha,estado) VALUES ('${inactive}','${cls}','2026-11-04','presente');
INSERT INTO sesiones_clase(id,fecha,asistencia) VALUES ('${cls}','2026-11-04','[{"alumno_id":"${inactive}","estado":"P"}]');`)
const migration = fs.readFileSync(new URL('../migrations/20261105175509_inactive_student_attendance.sql',import.meta.url),'utf8')
await db.exec(migration)
await assert.rejects(db.exec(`INSERT INTO asistencias(alumno_id,clase_id,fecha,estado) VALUES ('${inactive}','${cls}','2026-11-05','ausente')`),/inactivo/i)
console.log('PASS inactive alumno cannot receive new attendance (including stale/offline clients)')
await db.exec(`INSERT INTO asistencias(alumno_id,clase_id,fecha,estado) VALUES ('${active}','${cls}','2026-11-05','presente')`)
await db.exec(`INSERT INTO asistencias(alumno_id,clase_id,fecha,estado) VALUES ('${inactive}','${cls}','2026-11-04','presente') ON CONFLICT(clase_id,alumno_id,fecha) DO UPDATE SET estado=excluded.estado`)
await assert.rejects(db.exec(`UPDATE asistencias SET estado='ausente' WHERE alumno_id='${inactive}'`),/inactivo/i)
await assert.rejects(db.exec(`UPDATE asistencias SET alumno_id='${inactive}',fecha='2026-11-06' WHERE alumno_id='${active}'`),/inactivo/i)
console.log('PASS historical attendance survives and cannot be overwritten or moved to inactive alumno')
await assert.rejects(db.exec(`INSERT INTO sesiones_clase(fecha,asistencia) VALUES ('2026-11-05','[{"alumno_id":"${inactive}","estado":"A"}]')`),/inactivo/i)
await assert.rejects(db.exec(`UPDATE sesiones_clase SET asistencia='[{"alumno_id":"${inactive}","estado":"A"}]' WHERE id='${cls}'`),/inactivo/i)
await db.exec(`UPDATE sesiones_clase SET asistencia='[{"alumno_id":"${active}","estado":"P"}]',contenido='Contenido corregido' WHERE id='${cls}'`)
let row=(await db.query(`SELECT asistencia FROM sesiones_clase WHERE id='${cls}'`)).rows[0]
assert.equal(row.asistencia.length,2)
assert(row.asistencia.some(x=>x.alumno_id===inactive&&x.estado==='P'))
console.log('PASS JSON attendance also guarded; hidden historical records retained on save')
await db.exec(`SET test.uid='${actor}'; UPDATE alumnos SET activo=false,motivo_baja='Retiro solicitado' WHERE id='${active}'`)
row=(await db.query(`SELECT * FROM alumnos WHERE id='${active}'`)).rows[0]
assert.equal(row.estado_academico,'retirado')
row=(await db.query(`SELECT * FROM historial_estado_alumno WHERE alumno_id='${active}'`)).rows[0]
assert.equal(row.registrado_por,actor)
assert.equal(row.estado,'inactivo')
assert.equal(row.motivo,'Retiro solicitado')
assert.equal((await db.query(`SELECT count(*) n FROM asistencias`)).rows[0].n,2)
console.log('PASS status synchronized, actor/reason audited, historical rows unchanged')
await db.exec(`UPDATE alumnos SET activo=true WHERE id='${active}'`)
assert.equal((await db.query(`SELECT estado_academico FROM alumnos WHERE id='${active}'`)).rows[0].estado_academico,'activo')
await db.exec(`GRANT USAGE ON SCHEMA public,auth TO authenticated;
GRANT SELECT,UPDATE ON alumnos TO authenticated;
GRANT SELECT,INSERT,UPDATE ON asistencias,sesiones_clase TO authenticated;
SET ROLE authenticated;
UPDATE alumnos SET activo=false,motivo_baja='Decisión administrativa autenticada' WHERE id='${active}';`)
await assert.rejects(db.exec(`INSERT INTO asistencias(alumno_id,clase_id,fecha,estado) VALUES ('${active}','${cls}','2026-11-07','presente')`),/inactivo/i)
await db.exec('RESET ROLE')
row=(await db.query(`SELECT motivo,registrado_por FROM historial_estado_alumno WHERE motivo='Decisión administrativa autenticada'`)).rows[0]
assert.equal(row.registrado_por,actor)
console.log('PASS authenticated writes enforce guards and audit without direct history grants')
await db.close()

import { PGlite } from '@electric-sql/pglite'
import { readFileSync } from 'node:fs'
import assert from 'node:assert/strict'
const db=new PGlite()
await db.exec(`
CREATE ROLE authenticated; CREATE ROLE anon; CREATE SCHEMA auth; CREATE SCHEMA soi_security;
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('test.uid',true),'')::uuid $$;
CREATE TABLE profiles(id uuid PRIMARY KEY,rol text,activo boolean DEFAULT true,estado text DEFAULT 'activo');
CREATE FUNCTION soi_security.has_role(allowed_roles text[]) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER AS $$ SELECT EXISTS(SELECT 1 FROM profiles WHERE id=auth.uid() AND activo AND estado='activo' AND rol=ANY(allowed_roles)) $$;
CREATE FUNCTION es_admin() RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER AS $$ SELECT soi_security.has_role(ARRAY['admin','inventarista']) $$;
CREATE TABLE alumnos(id uuid PRIMARY KEY,nombre_completo text,activo boolean,fecha_nacimiento date);
CREATE TABLE maestros(id uuid PRIMARY KEY,user_id uuid,nombre_completo text,especialidad text,activo boolean,es_admin boolean DEFAULT false);
CREATE TABLE clases(id uuid PRIMARY KEY,nombre text);
CREATE TABLE alumnos_clases(alumno_id uuid,clase_id uuid,activo boolean);
CREATE TABLE calendario_institucional(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),titulo text NOT NULL,descripcion text,categoria text NOT NULL,fecha_inicio timestamptz NOT NULL,fecha_fin timestamptz NOT NULL,ubicacion text,departamento_responsable text NOT NULL,metadata jsonb DEFAULT '{}',estado text,alcance text,programas_convocados uuid[] DEFAULT '{}',clases_convocadas uuid[] DEFAULT '{}',requiere_aprobacion boolean DEFAULT true,creado_por uuid REFERENCES profiles(id),version integer DEFAULT 1,updated_at timestamptz DEFAULT now());
CREATE TABLE hermes_effects(event_id uuid);
CREATE TABLE calendario_afectaciones_clase(id uuid); CREATE TABLE calendario_exenciones_alumno(id uuid); CREATE TABLE asistencias(id uuid);
CREATE FUNCTION fn_hermes_auto_delegar_tareas() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$ BEGIN INSERT INTO hermes_effects VALUES(NEW.id); RETURN NEW; END $$;
CREATE TRIGGER trg_hermes_event_inserted AFTER INSERT ON calendario_institucional FOR EACH ROW EXECUTE FUNCTION fn_hermes_auto_delegar_tareas();
ALTER TABLE maestros ENABLE ROW LEVEL SECURITY; ALTER TABLE calendario_institucional ENABLE ROW LEVEL SECURITY;
CREATE POLICY maestro_read ON maestros FOR SELECT TO authenticated USING (user_id=auth.uid() OR es_admin());
CREATE POLICY maestro_update ON maestros FOR UPDATE TO authenticated USING (es_admin()) WITH CHECK(es_admin());
CREATE POLICY calendar_read ON calendario_institucional FOR SELECT TO authenticated USING(true);
CREATE POLICY calendar_write ON calendario_institucional FOR ALL TO authenticated USING (soi_security.has_role(ARRAY['admin','coordinacion_academica'])) WITH CHECK(soi_security.has_role(ARRAY['admin','coordinacion_academica']));
GRANT USAGE ON SCHEMA public,auth,soi_security TO authenticated;
GRANT SELECT,INSERT,UPDATE ON ALL TABLES IN SCHEMA public TO authenticated;
`)
await db.exec(readFileSync('supabase/migrations/20261114044553_monthly_birthdays.sql','utf8'))
console.log('PASS birthday migration compiles without new tables')
const admin='00000000-0000-0000-0000-000000000001',teacher='00000000-0000-0000-0000-000000000002',other='00000000-0000-0000-0000-000000000003',superadmin='00000000-0000-0000-0000-000000000004'
await db.exec(`INSERT INTO profiles(id,rol) VALUES('${admin}','admin'),('${teacher}','maestro'),('${other}','maestro'),('${superadmin}','superadmin');
INSERT INTO alumnos VALUES('${admin}','Ana',true,'2008-02-29'),('${teacher}','Sin fecha',true,NULL),('${other}','Inactiva',false,'2000-02-02');
INSERT INTO maestros(id,user_id,nombre_completo,especialidad,activo)VALUES('${teacher}','${teacher}','Laura','Violín',true),('${other}','${other}','Carlos','Coro',true);
SET ROLE authenticated; SET test.uid='${admin}';`)
const overview=async()=> (await db.query('select fn_birthdays_overview(2026,false) AS data')).rows[0].data
let data=await overview()
assert.equal(data.people.length,4); assert(data.people.some(p=>p.name==='Ana'&&p.day===29&&p.month===2)); assert(!JSON.stringify(data).includes('2008')); assert(!JSON.stringify(data).includes('fecha_nacimiento'))
console.log('PASS complete roster, leap birthday and no birth year in overview')
await db.query(`SELECT fn_birthdays_save_date('maestro','${teacher}','1990-11-20')`)
assert((await overview()).people.some(p=>p.id===teacher&&p.kind==='maestro'&&p.month===11))
await assert.rejects(db.query(`SELECT fn_birthdays_save_date('maestro','${teacher}','2099-11-20')`),/futura/)
console.log('PASS staff date writer and future-date validation')
const save=(id=null,version=null,status='programado',date='2026-11-30')=>db.query(`SELECT fn_birthdays_save_celebration('2026-11',$1,'17:00','19:00','Sede','Omar',$2,'Compartir mensual',$3,$4) AS id`,[date,status,id,version])
const event=(await save()).rows[0].id
const record=(await db.query('select * from calendario_institucional where id=$1',[event])).rows[0]
assert.equal(record.fecha_inicio.toISOString(),'2026-11-30T21:00:00.000Z'); assert.equal(record.categoria,'otro');assert.equal(record.requiere_aprobacion,false)
assert.equal((await db.query('select count(*)::integer AS n from hermes_effects')).rows[0].n,0)
for(const table of ['calendario_afectaciones_clase','calendario_exenciones_alumno','asistencias'])assert.equal((await db.query(`select count(*)::integer AS n from ${table}`)).rows[0].n,0)
await assert.rejects(save(),/Ya existe/)
await assert.rejects(save(null,null,'programado','2026-12-01'),/mes/)
console.log('PASS unique reservation, Dominican time and no academic or Hermes side effects')
await save(event,1,'cancelado');await assert.rejects(save(event,1),/cambió/);await save(event,2,'programado');await save(event,3,'completado')
assert.equal((await overview()).celebrations[0].status,'completado')
console.log('PASS cancellation, reprogramming, completion, reload and stale-write protection')
await db.exec(`INSERT INTO calendario_institucional(titulo,categoria,fecha_inicio,fecha_fin,departamento_responsable) VALUES('Evento ordinario','otro',now(),now(),'ADM');`)
assert.equal((await db.query('select count(*)::integer AS n from hermes_effects')).rows[0].n,1)
console.log('PASS normal calendar events still emit their existing Hermes tasks')
await db.exec(`SET test.uid='${teacher}'`)
await assert.rejects(overview(),/Solo administración/)
await assert.rejects(save(),/Solo administración/)
await assert.rejects(db.query(`SELECT fn_birthdays_save_date('maestro','${other}','1990-01-01')`),/Solo administración/)
assert.equal((await db.query('select fn_birthdays_my_date() AS data')).rows[0].data.date,'1990-11-20')
await db.query("select fn_birthdays_save_my_date('1990-12-05')")
assert.equal((await db.query('select fn_birthdays_my_date() AS data')).rows[0].data.date,'1990-12-05')
await assert.rejects(db.query(`update maestros set es_admin=true where id='${teacher}'`),/solo permite/)
await db.query(`update maestros set fecha_nacimiento='1990-01-01' where id='${other}'`)
await db.exec(`SET test.uid='${admin}'`)
assert.equal((await db.query('select fecha_nacimiento from maestros where id=$1',[other])).rows[0].fecha_nacimiento,null)
console.log('PASS maestro self-service has no caller-provided target and cannot edit others or elevate privileges')
await db.exec(`RESET ROLE;CREATE FUNCTION test_existing_profile_rpc() RETURNS void LANGUAGE sql SECURITY DEFINER AS $$ UPDATE maestros SET especialidad='Especialidad desde RPC existente' WHERE user_id=auth.uid() $$;SET ROLE authenticated;SET test.uid='${teacher}';SELECT test_existing_profile_rpc();`)
assert.equal((await db.query('select especialidad from maestros where id=$1',[teacher])).rows[0].especialidad,'Especialidad desde RPC existente')
await db.query(`update maestros set especialidad='Cambio propio autorizado' where id='${teacher}'`)
assert.equal((await db.query('select especialidad from maestros where id=$1',[teacher])).rows[0].especialidad,'Cambio propio autorizado')
await assert.rejects(db.query(`update maestros set user_id='${other}' where id='${teacher}'`),/solo permite/)
console.log('PASS existing trusted profile RPCs are preserved while direct column escalation is denied')

await db.exec(`SET test.uid='${superadmin}'`)
assert((await overview()).people.some(p=>p.kind==='maestro'))
assert.equal((await db.query("select has_function_privilege('anon','fn_birthdays_overview(integer,boolean)','EXECUTE') AS allowed")).rows[0].allowed,false)
await db.exec("SET test.uid=''")
await assert.rejects(db.query('select fn_birthdays_my_date()'),/sesión/)
await assert.rejects(overview(),/Solo administración/)
console.log('PASS superadmin staff scope, anonymous denial and unauthenticated denial')
await db.exec(`RESET ROLE;UPDATE profiles SET activo=false WHERE id='${teacher}';SET ROLE authenticated;SET test.uid='${teacher}'`)
await assert.rejects(db.query("select fn_birthdays_save_my_date('1990-01-01')"),/perfil activo/)
console.log('PASS inactive account cannot use maestro self-service')

await db.close()

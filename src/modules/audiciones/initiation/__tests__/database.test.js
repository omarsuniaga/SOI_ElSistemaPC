// @vitest-environment node
import { PGlite } from '@electric-sql/pglite'
import { readFile } from 'node:fs/promises'
import { beforeAll, afterAll, beforeEach, afterEach, describe, expect, it } from 'vitest'
import { DEFAULT_RUBRIC } from '../domain.js'
const ids = { admin: '00000000-0000-0000-0000-000000000001', jury: '00000000-0000-0000-0000-000000000002', receiver: '00000000-0000-0000-0000-000000000003', other: '00000000-0000-0000-0000-000000000004', source: '10000000-0000-0000-0000-000000000001', dest: '10000000-0000-0000-0000-000000000002', student: '20000000-0000-0000-0000-000000000001' }
let db, campaign, candidate
const notes = Object.fromEntries(DEFAULT_RUBRIC.map(c => [c.key, 3]))
const q = async (sql, params = []) => (await db.query(sql, params)).rows
const actor = async key => { await db.exec('RESET ROLE'); await q("select set_config('request.jwt.claims',$1,true)", [JSON.stringify({ sub: ids[key], role: 'authenticated' })]); await db.exec('SET LOCAL ROLE authenticated') }
const rejected = async (sql, params, message) => {
  await db.exec('SAVEPOINT expected_failure')
  try { await expect(q(sql, params)).rejects.toThrow(message) } finally { await db.exec('ROLLBACK TO SAVEPOINT expected_failure') }
}
const score = (ronda = 0, scores = notes) => q('select public.iniciacion_guardar_valoracion($1,$2,$3,$4,null)', [candidate.id, ronda, JSON.stringify(scores), 'Evidencia de prueba'])
const decision = (action, version, more = {}) => q('select * from public.iniciacion_decidir($1,$2,$3,$4)', [candidate.id, version, action, JSON.stringify({ observacion: 'Decisión de prueba', ...more })])
const inviteData = () => ({ clase_destino_id: ids.dest, objetivos: 'Mantener el pulso en grupo', revision_fecha: '2099-03-01' })
const bootstrap = `
CREATE ROLE authenticated; CREATE ROLE anon;
CREATE SCHEMA auth; CREATE SCHEMA soi_security;
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('request.jwt.claims',true),'')::jsonb->>'sub' $$;
` // auth.uid cast is replaced below to match Supabase's UUID contract.

describe('PostgreSQL: initiation audition lifecycle and authorization', () => {
  beforeAll(async () => {
    db = new PGlite()
    await db.exec(bootstrap.replace("nullif(current_setting('request.jwt.claims',true),'')::jsonb->>'sub'", "(nullif(current_setting('request.jwt.claims',true),'')::jsonb->>'sub')::uuid"))
    await db.exec(`
CREATE TABLE public.profiles(id uuid PRIMARY KEY, nombre_completo text, rol text, estado text DEFAULT 'activo', activo boolean DEFAULT true);
CREATE TABLE public.maestros(id uuid PRIMARY KEY,user_id uuid,activo boolean DEFAULT true);
CREATE TABLE public.alumnos(id uuid PRIMARY KEY,nombre_completo text,activo boolean DEFAULT true,fecha_ingreso_iniciacion date);
CREATE TABLE public.clases(id uuid PRIMARY KEY,nombre text,activo boolean DEFAULT true,es_clase_iniciacion boolean DEFAULT false,capacidad_maxima integer,tipo_clase text DEFAULT 'grupal',maestro_principal_id uuid,maestro_suplente_id uuid);
CREATE TABLE public.alumnos_clases(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),alumno_id uuid REFERENCES public.alumnos,clase_id uuid REFERENCES public.clases,activo boolean DEFAULT true,fecha_inscripcion date DEFAULT current_date,dia text,hora_inicio time,hora_fin time,UNIQUE(alumno_id,clase_id));
CREATE TABLE public.clase_horarios(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),clase_id uuid,dia text,hora_inicio time,hora_fin time);
CREATE FUNCTION soi_security.has_role(roles text[]) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$ SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id=auth.uid() AND activo AND estado='activo' AND rol=ANY(roles)); $$;
CREATE FUNCTION soi_security.assigned_maestro(cid uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$ SELECT soi_security.has_role(ARRAY['maestro']) AND EXISTS(SELECT 1 FROM public.maestros m JOIN public.clases c ON m.id IN(c.maestro_principal_id,c.maestro_suplente_id) WHERE m.user_id=auth.uid() AND m.activo AND c.id=cid); $$;
GRANT USAGE ON SCHEMA public,auth,soi_security TO authenticated;
GRANT SELECT,INSERT,UPDATE,DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
REVOKE ALL ON SCHEMA soi_security FROM PUBLIC,anon;
INSERT INTO public.profiles(id,nombre_completo,rol) VALUES('${ids.admin}','Coordinación Prueba','admin'),('${ids.jury}','Jurado Prueba','maestro'),('${ids.receiver}','Receptor Prueba','maestro'),('${ids.other}','No asignado Prueba','maestro');
INSERT INTO public.maestros(id,user_id) VALUES('${ids.receiver}','${ids.receiver}');
INSERT INTO public.clases(id,nombre,es_clase_iniciacion,capacidad_maxima,maestro_principal_id) VALUES('${ids.source}','Iniciación Prueba',true,20,'${ids.jury}'),('${ids.dest}','Coro Prueba',false,20,'${ids.receiver}');
INSERT INTO public.alumnos(id,nombre_completo,fecha_ingreso_iniciacion) VALUES('${ids.student}','Alumno Sintético','2026-01-15');
INSERT INTO public.alumnos_clases(alumno_id,clase_id) VALUES('${ids.student}','${ids.source}');
INSERT INTO public.clase_horarios(clase_id,dia,hora_inicio,hora_fin) VALUES('${ids.source}','lunes','15:00','16:00'),('${ids.dest}','martes','15:00','16:00');
`)
    const migration = await readFile(new URL('../../../../../supabase/migrations/20261022181421_initiation_audition_guests.sql', import.meta.url), 'utf8')
    await db.exec(migration)
  }, 30000)
  afterAll(async () => db?.close())
  beforeEach(async () => {
    await db.exec('BEGIN')
    await actor('admin')
    ;[campaign] = await q('insert into public.iniciacion_convocatorias(nombre,clase_origen_id,cohorte_desde,cohorte_hasta,fecha_audicion,jurados,min_jurados,rubrica) values($1,$2,$3,$4,$5,$6,1,$7) returning *', ['Audición sintética', ids.source, '2026-01-01', '2026-02-01', '2026-04-15', [ids.jury], JSON.stringify(DEFAULT_RUBRIC)])
    ;[candidate] = await q('insert into public.iniciacion_candidatos(convocatoria_id,alumno_id) values($1,$2) returning *', [campaign.id, ids.student])
  })
  afterEach(async () => db.exec('ROLLBACK'))
  it('preserves source enrollment through invitation and confirmation, with an immutable audit', async () => {
    await actor('jury'); await score()
    await actor('admin'); await decision('invitar', 0, inviteData())
    expect((await q('select condicion from public.alumnos_clases where clase_id=$1', [ids.dest]))[0].condicion).toBe('invitado')
    expect((await q('select activo from public.alumnos_clases where clase_id=$1', [ids.source]))[0].activo).toBe(true)
    await actor('receiver'); await score(1)
    await actor('admin'); await decision('confirmar', 1)
    expect((await q('select estado,version from public.iniciacion_candidatos'))[0]).toMatchObject({ estado: 'fijo', version: 2 })
    expect((await q('select condicion,activo from public.alumnos_clases where clase_id=$1', [ids.dest]))[0]).toEqual({ condicion: 'fijo', activo: true })
    expect(await q('select accion from public.iniciacion_decisiones order by despues->>\'version\'')).toEqual([{ accion: 'invitar' }, { accion: 'confirmar' }])
    await rejected('delete from public.iniciacion_decisiones', [], /permission denied/)
  })
  it('requires complete evidence, observation, and a future review', async () => {
    await rejected('select public.iniciacion_decidir($1,0,\'invitar\',$2)', [candidate.id, JSON.stringify(inviteData())], /observación/)
    await actor('jury'); await score(0, { ...notes, teoria: null })
    await actor('admin'); await rejected('select public.iniciacion_decidir($1,0,\'invitar\',$2)', [candidate.id, JSON.stringify({ ...inviteData(), observacion: 'Prueba' })], /Faltan valoraciones/)
    await actor('jury'); await score()
    await actor('admin'); await rejected('select public.iniciacion_decidir($1,0,\'invitar\',$2)', [candidate.id, JSON.stringify({ ...inviteData(), observacion: 'Prueba', revision_fecha: '2000-01-01' })], /futura/)
  })
  it('rejects invalid scores, unassigned evaluators and jury decisions', async () => {
    await actor('jury'); await rejected('select public.iniciacion_guardar_valoracion($1,0,$2,\'\',null)', [candidate.id, JSON.stringify({ ...notes, teoria: 0 })], /notas/)
    await rejected('select public.iniciacion_decidir($1,0,\'continuar\',$2)', [candidate.id, JSON.stringify({ observacion: 'Prueba' })], /Solo coordinación/)
    await actor('other'); expect(await q('select id from public.iniciacion_convocatorias')).toHaveLength(0)
    await rejected('select public.iniciacion_guardar_valoracion($1,0,$2,\'\',null)', [candidate.id, JSON.stringify(notes)], /No autorizado/)
  })
  it('rejects stale decisions, direct invitation edits and review without evidence', async () => {
    await actor('jury'); await score(); await actor('admin'); await decision('invitar', 0, inviteData())
    await rejected('select public.iniciacion_decidir($1,0,\'invitar\',$2)', [candidate.id, JSON.stringify({ ...inviteData(), observacion: 'Prueba' })], /cambió/)
    await rejected("update public.alumnos_clases set condicion='fijo' where clase_id=$1", [ids.dest], /Audiciones/)
    await rejected('select public.iniciacion_decidir($1,1,\'confirmar\',$2)', [candidate.id, JSON.stringify({ observacion: 'Prueba' })], /Faltan valoraciones/)
  })
  it('ends only the invited enrollment when the alumno continues initiation', async () => {
    await actor('jury'); await score(); await actor('admin'); await decision('invitar', 0, inviteData())
    await actor('receiver'); await score(1); await actor('admin'); await decision('continuar', 1)
    expect((await q('select activo from public.alumnos_clases where clase_id=$1', [ids.dest]))[0].activo).toBe(false)
    expect((await q('select activo from public.alumnos_clases where clase_id=$1', [ids.source]))[0].activo).toBe(true)
  })
  it('starts a fresh review round after extension', async () => {
    await actor('jury'); await score(); await actor('admin'); await decision('invitar', 0, inviteData())
    await actor('receiver'); await score(1); await actor('admin'); await decision('prorrogar', 1, { revision_fecha: '2099-04-15' })
    expect((await q('select ronda from public.iniciacion_candidatos'))[0].ronda).toBe(2)
    await rejected('select public.iniciacion_decidir($1,2,\'confirmar\',$2)', [candidate.id, JSON.stringify({ observacion: 'Prueba' })], /Faltan valoraciones/)
  })
  it('blocks over-capacity and unapproved overlaps without creating an enrollment', async () => {
    await actor('jury'); await score(); await db.exec('RESET ROLE')
    await q('update public.clase_horarios set dia=\'lunes\' where clase_id=$1', [ids.dest])
    await actor('admin'); await rejected('select public.iniciacion_decidir($1,0,\'invitar\',$2)', [candidate.id, JSON.stringify({ ...inviteData(), observacion: 'Prueba' })], /solapamiento/)
    expect(await q('select id from public.alumnos_clases where clase_id=$1', [ids.dest])).toHaveLength(0)
  })
  it('hides individual scores from other jurors while preserving own historical score', async () => {
    await actor('jury'); await score(); await actor('admin'); await decision('invitar', 0, inviteData())
    await actor('receiver'); expect(await q('select * from public.iniciacion_valoraciones')).toHaveLength(0)
    await actor('jury'); expect(await q('select * from public.iniciacion_valoraciones')).toHaveLength(1)
  })
  it('rejects over-capacity without changing the candidate or inviting the alumno', async () => {
    await actor('jury'); await score(); await db.exec('RESET ROLE')
    await q("insert into public.alumnos(id,nombre_completo) values('20000000-0000-0000-0000-000000000002','Otro Sintético')")
    await q("insert into public.alumnos_clases(alumno_id,clase_id) values('20000000-0000-0000-0000-000000000002',$1)", [ids.dest])
    await q('update public.clases set capacidad_maxima=1 where id=$1', [ids.dest])
    await actor('admin')
    await rejected('select public.iniciacion_decidir($1,0,\'invitar\',$2)', [candidate.id, JSON.stringify({ ...inviteData(), observacion: 'Prueba' })], /sin cupo/)
    expect((await q('select estado from public.iniciacion_candidatos'))[0].estado).toBe('pendiente')
    expect(await q('select id from public.alumnos_clases where clase_id=$1 and alumno_id=$2', [ids.dest,ids.student])).toHaveLength(0)
  })
  it('requires a recorded exception for missing cohort evidence and prevents duplicate candidacy', async () => {
    await rejected('insert into public.iniciacion_candidatos(convocatoria_id,alumno_id) values($1,$2)', [campaign.id,ids.student], /duplicate key/)
    await db.exec('RESET ROLE')
    await q("insert into public.alumnos(id,nombre_completo) values('20000000-0000-0000-0000-000000000002','Sin Fecha Sintético')")
    await q("insert into public.alumnos_clases(alumno_id,clase_id) values('20000000-0000-0000-0000-000000000002',$1)", [ids.source])
    await actor('admin')
    await rejected("insert into public.iniciacion_candidatos(convocatoria_id,alumno_id) values($1,'20000000-0000-0000-0000-000000000002')", [campaign.id], /excepción/)
    await q("insert into public.iniciacion_candidatos(convocatoria_id,alumno_id,motivo_excepcion) values($1,'20000000-0000-0000-0000-000000000002','Ingreso revisado por coordinación')", [campaign.id])
    expect(await q('select id from public.iniciacion_candidatos')).toHaveLength(2)
  })
  it('denies anonymous access and direct score writes', async () => {
    await actor('jury')
    await rejected('insert into public.iniciacion_valoraciones(candidato_id,ronda,notas) values($1,0,$2)', [candidate.id,JSON.stringify(notes)], /permission denied/)
    await db.exec('RESET ROLE; SET LOCAL ROLE anon')
    await rejected('select * from public.iniciacion_candidatos', [], /permission denied/)
    await rejected('select public.iniciacion_contexto()', [], /permission denied/)
  })

  it('limits a receiving maestro to their own invited candidates within the same campaign', async () => {
    await actor('jury'); await score(); await actor('admin'); await decision('invitar', 0, inviteData())
    await db.exec('RESET ROLE')
    await q("insert into public.alumnos(id,nombre_completo,fecha_ingreso_iniciacion) values('20000000-0000-0000-0000-000000000002','Otro Sintético','2026-01-15')")
    await q("insert into public.alumnos_clases(alumno_id,clase_id) values('20000000-0000-0000-0000-000000000002',$1)", [ids.source])
    await actor('admin'); await q("insert into public.iniciacion_candidatos(convocatoria_id,alumno_id) values($1,'20000000-0000-0000-0000-000000000002')", [campaign.id])
    await actor('receiver')
    expect(await q('select id from public.iniciacion_candidatos')).toEqual([{ id: candidate.id }])
  })
  it('requires an in-schedule individual slot for a rotating destination', async () => {
    await actor('jury'); await score(); await db.exec('RESET ROLE')
    await q("update public.clases set tipo_clase='rotativa' where id=$1", [ids.dest])
    await actor('admin')
    await rejected('select public.iniciacion_decidir($1,0,\'invitar\',$2)', [candidate.id, JSON.stringify({ ...inviteData(), observacion: 'Prueba' })], /turno válido/)
    await decision('invitar',0,{ ...inviteData(),dia:'martes',hora_inicio:'15:00',hora_fin:'15:30' })
    expect((await q('select dia,hora_inicio,hora_fin from public.alumnos_clases where clase_id=$1',[ids.dest]))[0]).toMatchObject({ dia:'martes',hora_inicio:'15:00:00',hora_fin:'15:30:00' })
  })

})

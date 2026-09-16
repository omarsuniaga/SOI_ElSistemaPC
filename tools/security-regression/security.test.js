import { beforeAll, afterAll, beforeEach, afterEach, describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { createDatabase, asUser, id } from './database.js';

let db;
beforeAll(async () => { db = await createDatabase({ baseline: process.env.SOI_SECURITY_BASELINE === '1' }); });
afterAll(async () => { await db?.close(); });
beforeEach(async () => { await db.exec('BEGIN'); });
afterEach(async () => { await db.exec('ROLLBACK'); });
const close = (actor=null, options={}) => db.query(
  'SELECT public.fn_cerrar_periodo_academico($1,$2,$3,$4,$5,$6) result',
  [id(401),options.start??null,options.end??null,actor,options.reason??null,options.force??false]);

it('passes every read-only deployment postcondition', async () => {
  const sql=readFileSync(new URL('../../supabase/verify_f0_security.sql',import.meta.url),'utf8');
  const checks=(await db.query(sql)).rows;
  expect(checks.length).toBeGreaterThan(10);
  expect(checks.filter(check => check.ok !== true)).toEqual([]);
});

describe('RLS ejecutada por PostgreSQL, con filas sintéticas', () => {
  for (const table of ['alumnos','alumnos_clases','clases','clase_horarios','conversaciones_whatsapp','alertas_log']) {
    it(`denies anonymous table access: ${table}`, async () => {
      await asUser(db,null,'anon');
      await expect(db.query(`SELECT * FROM public.${table}`)).rejects.toMatchObject({code:'42501'});
    });
  }
  it('permits the titular only its own roster, using maestro ID distinct from auth ID', async () => {
    await asUser(db,2);
    expect((await db.query('SELECT id FROM public.alumnos')).rows).toEqual([{id:id(301)}]);
  });
  it('permits the suplente and its own titular roster', async () => {
    await asUser(db,3);
    expect((await db.query('SELECT id FROM public.alumnos')).rows).toHaveLength(2);
  });
  it.each([4,6,7,8])('denies unprivileged or inactive profile %s', async user => {
    await asUser(db,user);
    expect((await db.query('SELECT id FROM public.alumnos')).rows).toEqual([]);
  });
  it('denies a token with no profile', async () => {
    await asUser(db,999);
    expect((await db.query('SELECT id FROM public.alumnos')).rows).toEqual([]);
  });
  it.each([1,5])('retains staff roster reads for profile %s', async user => {
    await asUser(db,user);
    expect((await db.query('SELECT id FROM public.alumnos')).rows).toHaveLength(2);
  });
  it('denies maestro WhatsApp access', async () => {
    await asUser(db,2);
    expect((await db.query('SELECT jid FROM public.conversaciones_whatsapp')).rows).toEqual([]);
  });
  it('retains admin WhatsApp access', async () => {
    await asUser(db,1);
    expect((await db.query('SELECT jid FROM public.conversaciones_whatsapp')).rows).toHaveLength(1);
  });
  it('retains service_role access for the worker', async () => {
    await asUser(db,null,'service_role');
    expect((await db.query('SELECT jid FROM public.conversaciones_whatsapp')).rows).toHaveLength(1);
  });
  it('prevents inventarista from changing clases via es_admin', async () => {
    await asUser(db,4);
    expect((await db.query("UPDATE public.clases SET nombre='Unauthorized' RETURNING id")).rows).toEqual([]);
  });
  it('prevents maestro from deleting another clase', async () => {
    await asUser(db,2);
    expect((await db.query('DELETE FROM public.clases WHERE id=$1 RETURNING id',[id(202)])).rows).toEqual([]);
  });
  it('prevents direct administrative alumno deletion', async () => {
    await asUser(db,1);
    expect((await db.query('DELETE FROM public.alumnos RETURNING id')).rows).toEqual([]);
  });
  it('denies TRUNCATE, which bypasses row policies', async () => {
    await asUser(db,1);
    await expect(db.exec('TRUNCATE public.alumnos')).rejects.toMatchObject({code:'42501'});
  });
  it('retains assigned-maestro schedule editing', async () => {
    await db.query("INSERT INTO public.clase_horarios(id,clase_id,dia,hora_inicio,hora_fin) VALUES ($1,$2,'lunes','14:00','15:00')",[id(701),id(201)]);
    await asUser(db,2);
    expect((await db.query("UPDATE public.clase_horarios SET hora_inicio='14:15' RETURNING id")).rows).toEqual([{id:id(701)}]);
  });
  it('WITH CHECK prevents moving a horario to an unassigned clase', async () => {
    await db.query("INSERT INTO public.clase_horarios(id,clase_id,dia,hora_inicio,hora_fin) VALUES ($1,$2,'lunes','14:00','15:00')",[id(701),id(201)]);
    await asUser(db,2);
    await expect(db.query('UPDATE public.clase_horarios SET clase_id=$1 WHERE id=$2',[id(202),id(701)]))
      .rejects.toMatchObject({code:'42501'});
  });
});

describe('Contención de fusión destructiva', () => {
  it.each(['anon','authenticated','service_role'])('rejects merge for %s without touching histories', async role => {
    await db.exec('SAVEPOINT before_merge');
    await asUser(db,role==='authenticated'?1:null,role);
    await expect(db.query('SELECT public.fn_fusionar_alumnos_duplicados($1,$2,$3)',
      [id(301),id(302),{}])).rejects.toMatchObject({code:'42501'});
    await db.exec('ROLLBACK TO SAVEPOINT before_merge');
    expect((await db.query('SELECT id FROM public.alumnos')).rows).toHaveLength(2);
    expect((await db.query('SELECT id FROM public.asistencias')).rows).toHaveLength(2);
  });
});

describe('Vistas que contenían datos personales', () => {
  it.each(['vw_seguimiento_ausentes','vw_asistencias_consolidada'])('denies anonymous view access: %s', async view => {
    await asUser(db,null,'anon');
    await expect(db.query(`SELECT * FROM public.${view}`)).rejects.toMatchObject({code:'42501'});
  });
  it('does not expose consolidated attendance to inventarista', async () => {
    await asUser(db,4);
    expect((await db.query('SELECT * FROM public.vw_asistencias_consolidada')).rows).toEqual([]);
  });
  it('preserves the admin consolidated report', async () => {
    await asUser(db,1);
    expect((await db.query('SELECT * FROM public.vw_asistencias_consolidada')).rows).toHaveLength(1);
  });
  it('limits the consolidated report to assigned clases', async () => {
    await db.query('INSERT INTO public.sesiones_clase(id,clase_id,maestro_id,fecha) VALUES ($1,$2,$3,$4)',
      [id(502),id(202),id(103),'2026-09-11']);
    await asUser(db,2);
    expect((await db.query('SELECT sesion_clase_id FROM public.vw_asistencias_consolidada')).rows).toEqual([{sesion_clase_id:id(501)}]);
  });
});

describe('Perfiles: no se permite eludir los gates elevando el rol', () => {
  it('prevents inventarista from promoting its own profile', async () => {
    await asUser(db,4);
    expect((await db.query("UPDATE public.profiles SET rol='admin' WHERE id=$1 RETURNING id",[id(4)])).rows).toEqual([]);
  });
  it.each(['aprobar_usuario','rechazar_usuario'])('denies anonymous %s', async name => {
    await asUser(db,null,'anon');
    await expect(db.query(`SELECT public.${name}($1)`,[id(6)])).rejects.toMatchObject({code:'42501'});
  });
  it.each([null,7,8,999])('denies role escalation for inactive/missing actor %s', async user => {
    await asUser(db,user,user===null?'anon':'authenticated');
    await expect(db.query("SELECT public.cambiar_rol_usuario($1,'superadmin')",[id(6)])).rejects.toMatchObject({code:'42501'});
  });
  it('retains active-superadmin role changes', async () => {
    await asUser(db,9);
    await db.query("SELECT public.cambiar_rol_usuario($1,'admin')",[id(6)]);
    expect((await db.query('SELECT rol FROM public.profiles WHERE id=$1',[id(6)])).rows[0].rol).toBe('admin');
  });
  it('retains admin approval of a pending profile', async () => {
    await asUser(db,1);
    await db.query('SELECT public.aprobar_usuario($1)',[id(7)]);
    expect((await db.query('SELECT estado FROM public.profiles WHERE id=$1',[id(7)])).rows[0].estado).toBe('activo');
  });
  it('retains pending-user access to its own login status', async () => {
    await asUser(db,7);
    expect((await db.query('SELECT id,estado FROM public.profiles')).rows).toEqual([{id:id(7),estado:'pendiente'}]);
  });
  it.each([2,8,999])('denies privileged maestro approval for profile %s', async user => {
    await asUser(db,user);
    await expect(db.query("SELECT public.approve_maestro_profile($1,'admin','activo')",[id(6)]))
      .rejects.toMatchObject({code:'42501'});
  });
});

describe('Cierre transaccional autorizado', () => {
  it.each([2,4,6,8,999])('denies close for profile %s', async user => {
    await asUser(db,user);
    await expect(close()).rejects.toMatchObject({code:'42501'});
  });
  it('counts one clase occurrence with two attendance marks as one occurrence', async () => {
    await asUser(db,1);
    expect((await close()).rows[0].result.ok).toBe(true);
    const audit=(await db.query('SELECT resumen,cerrado_por FROM public.periodos_cierre_auditoria')).rows[0];
    expect(audit.resumen.totalSesiones).toBe(1);
    expect(audit.resumen.totalAsistencias).toBe(2);
    expect(audit.cerrado_por).toBe(id(1));
  });
  it('rejects caller-supplied impersonation', async () => {
    await asUser(db,1);
    await expect(close(id(2))).rejects.toMatchObject({code:'42501'});
  });
  it('fails closed if validation is unknown', async () => {
    await db.exec(`CREATE OR REPLACE FUNCTION public.fn_validar_cierre_periodo(p_periodo_id uuid) RETURNS jsonb
      LANGUAGE sql AS $$ SELECT NULL::jsonb $$;`);
    await asUser(db,1);
    await expect(close()).rejects.toMatchObject({code:'22023'});
  });
  it('rejects a range different from the validated periodo', async () => {
    await asUser(db,1);
    await expect(close(null,{start:'2026-08-01'})).rejects.toMatchObject({code:'22023'});
  });
  it('requires a reason for a forced incomplete close', async () => {
    await db.exec('DELETE FROM public.asistencias');
    await asUser(db,1);
    await expect(close(null,{force:true})).rejects.toThrow(/justifica/i);
  });
  it('allows an authorized forced close with a reason', async () => {
    await db.exec('DELETE FROM public.asistencias');
    await asUser(db,1);
    expect((await close(null,{force:true,reason:'Justificación sintética'})).rows[0].result.forzado).toBe(true);
  });
  it('rejects duplicate close', async () => {
    await asUser(db,1); await close();
    await expect(close()).rejects.toThrow(/cerrado/);
  });
  it('prevents a direct close that bypasses the RPC', async () => {
    await asUser(db,1);
    await expect(db.exec('UPDATE public.periodos SET cerrado=true')).rejects.toMatchObject({code:'42501'});
  });
  it('retains edits of an open periodo', async () => {
    await asUser(db,1);
    expect((await db.query("UPDATE public.periodos SET nombre='Nuevo nombre' RETURNING id")).rows).toHaveLength(1);
  });
  it('prevents date edits after a periodo is closed', async () => {
    await asUser(db,1); await close();
    expect((await db.query("UPDATE public.periodos SET fecha_fin='2026-10-31' RETURNING id")).rows).toEqual([]);
  });
  it('rolls back the periodo if audit insertion fails', async () => {
    await db.exec(`ALTER TABLE public.periodos_cierre_auditoria ADD CONSTRAINT injected_failure CHECK(false);
      SAVEPOINT before_close;`);
    await asUser(db,1);
    await expect(close()).rejects.toMatchObject({code:'23514'});
    await db.exec('ROLLBACK TO SAVEPOINT before_close');
    expect((await db.query('SELECT cerrado FROM public.periodos')).rows[0].cerrado).toBe(false);
  });
});

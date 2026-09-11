import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';

export const id = n => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const read = path => readFileSync(new URL(path, import.meta.url), 'utf8');
const quote = value => '"' + value.replaceAll('"', '""') + '"';

export async function createDatabase({ baseline = false } = {}) {
  const db = await PGlite.create();
  await db.exec(`
    CREATE ROLE anon NOLOGIN; CREATE ROLE authenticated NOLOGIN;
    CREATE ROLE service_role NOLOGIN BYPASSRLS;
    CREATE SCHEMA auth;
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$
      SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    CREATE FUNCTION auth.jwt() RETURNS jsonb LANGUAGE sql STABLE AS $$
      SELECT coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb $$;
    GRANT USAGE ON SCHEMA public, auth TO anon, authenticated, service_role;
  `);
  await db.exec(read('./fixtures/tables.sql'));
  const catalog = JSON.parse(read('./fixtures/catalog.json'));
  const dependencies = JSON.parse(read('./fixtures/dependencies.json'));
  const attendance = JSON.parse(read('./fixtures/attendance.json'));
  // Calendario lectivo es una dependencia acotada: todos los días del fixture son lectivos.
  await db.exec(`CREATE FUNCTION public.fn_es_dia_lectivo(date) RETURNS boolean
    LANGUAGE sql AS $$ SELECT true $$;`);
  await db.exec('SET check_function_bodies = off');
  for (const f of [...catalog.functions, ...dependencies.helpers]) await db.exec(f.definition);
  for (const f of JSON.parse(read('./fixtures/identity.json'))) await db.exec(f.definition);
  await db.exec(attendance.normalizer);
  await db.exec('SET check_function_bodies = on');
  for (const p of [...catalog.policies, ...attendance.policies]) {
    await db.exec(`ALTER TABLE public.${quote(p.tablename)} ENABLE ROW LEVEL SECURITY;
      CREATE POLICY ${quote(p.policyname)} ON public.${quote(p.tablename)}
      AS ${p.permissive} FOR ${p.cmd} TO ${p.roles.map(quote).join(',')}
      ${p.qual ? `USING (${p.qual})` : ''} ${p.with_check ? `WITH CHECK (${p.with_check})` : ''};`);
  }
  for (const view of JSON.parse(read('./fixtures/views.json')).filter(v => !v.relname.startsWith('signage_'))) {
    await db.exec(`CREATE VIEW public.${quote(view.relname)} AS ${view.definition}`);
  }
  await db.exec(`GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
    GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;
    REVOKE EXECUTE ON FUNCTION public.fn_cerrar_periodo_academico(uuid,date,date,uuid,text,boolean) FROM PUBLIC, anon;
    ALTER TABLE public.profiles ADD PRIMARY KEY(id);
    ALTER TABLE public.alumnos ADD PRIMARY KEY(id);
    ALTER TABLE public.periodos ADD PRIMARY KEY(id);
    ALTER TABLE public.periodos_cierre_auditoria ADD PRIMARY KEY(id);
    ALTER TABLE public.periodos ENABLE ROW LEVEL SECURITY;
    CREATE POLICY periodos_admin ON public.periodos FOR ALL TO authenticated USING (public.es_admin()) WITH CHECK (public.es_admin());
    ALTER TABLE public.periodos_cierre_auditoria ENABLE ROW LEVEL SECURITY;
    CREATE POLICY cierre_read ON public.periodos_cierre_auditoria FOR SELECT TO authenticated USING (public.get_user_role()='admin');
  `);
  const roles = ['admin','maestro','maestro','inventarista','finanzas','user','maestro','admin'];
  for (let i = 0; i < roles.length; i++) await db.query(
    'INSERT INTO public.profiles(id,email,rol,estado,activo) VALUES ($1,$2,$3,$4,$5)',
    [id(i+1),`synthetic-${i+1}@example.invalid`,roles[i],i===6?'pendiente':'activo',i!==7]);
  await db.query("INSERT INTO public.profiles(id,email,rol,estado,activo) VALUES ($1,'synthetic-superadmin@example.invalid','superadmin','activo',true)",[id(9)]);
  for (const n of [2,3,7]) await db.query(
    'INSERT INTO public.maestros(id,user_id,nombre_completo,especialidad,correo) VALUES ($1,$2,$3,$4,$5)',
    [id(n+100),id(n),'Maestro sintético','Violín',`synthetic-${n}@example.invalid`]);
  await db.exec(`
    INSERT INTO public.clases(id,nombre,maestro_principal_id,maestro_suplente_id) VALUES
      ('${id(201)}','Clase sintética A','${id(102)}','${id(103)}'),
      ('${id(202)}','Clase sintética B','${id(103)}',NULL);
    INSERT INTO public.alumnos(id,nombre_completo) VALUES
      ('${id(301)}','Alumno sintético A'),('${id(302)}','Alumno sintético B');
    INSERT INTO public.alumnos_clases(alumno_id,clase_id) VALUES
      ('${id(301)}','${id(201)}'),('${id(302)}','${id(202)}');
    INSERT INTO public.conversaciones_whatsapp(postulante_id,jid) VALUES ('${id(601)}','synthetic@example.invalid');
    INSERT INTO public.periodos(id,nombre,fecha_inicio,fecha_fin,activo)
      VALUES ('${id(401)}','Periodo sintético','2026-09-01','2026-09-30',true);
    INSERT INTO public.sesiones_clase(id,clase_id,maestro_id,fecha,estado) VALUES
      ('${id(501)}','${id(201)}','${id(102)}','2026-09-10','realizada');
    INSERT INTO public.asistencias(sesion_clase_id,clase_id,alumno_id,fecha,estado) VALUES
      ('${id(501)}','${id(201)}','${id(301)}','2026-09-10','presente'),
      ('${id(501)}','${id(201)}','${id(302)}','2026-09-10','ausente');
  `);
  if (!baseline) await db.exec(read('../../supabase/migrations/20260911020424_f0_security_containment.sql'));
  return db;
}

export async function asUser(db, user, role = 'authenticated') {
  if (!['anon', 'authenticated', 'service_role'].includes(role)) throw new Error('Invalid fixture role');
  await db.query("SELECT set_config('request.jwt.claim.sub',$1,true)", [user ? id(user) : '']);
  await db.exec(`SET LOCAL ROLE ${role}`);
}

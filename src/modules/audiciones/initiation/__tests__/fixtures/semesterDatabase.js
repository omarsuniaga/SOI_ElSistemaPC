import { readFile } from 'node:fs/promises'
export const ids = Object.fromEntries(
  ['admin', 'jury', 'receiver', 'other', 'jury2'].map((name, index) => [
    name,
    `00000000-0000-0000-0000-00000000000${index + 1}`,
  ]),
)
Object.assign(ids, {
  source: '10000000-0000-0000-0000-000000000001',
  dest: '10000000-0000-0000-0000-000000000002',
  dest2: '10000000-0000-0000-0000-000000000003',
  student: '20000000-0000-0000-0000-000000000001',
  student2: '20000000-0000-0000-0000-000000000002',
})
export const rubric = [
  {
    key: 'pulso',
    label: 'Sostiene el pulso al imitar cuatro compases',
    required: true,
    levels: ['Con acompañamiento continuo', 'Con apoyos puntuales', 'De forma autónoma'],
  },
  {
    key: 'escucha',
    label: 'Reconoce y reproduce un motivo trabajado en clase',
    required: true,
    levels: [
      'Necesita modelo continuo',
      'Reproduce fragmentos con apoyo',
      'Reproduce y ajusta al escuchar',
    ],
  },
]
export async function bootstrap(db) {
  await db.exec(`CREATE ROLE authenticated; CREATE ROLE anon; CREATE SCHEMA auth; CREATE SCHEMA soi_security;
 CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT (nullif(current_setting('request.jwt.claims',true),'')::jsonb->>'sub')::uuid $$;
 CREATE TABLE public.profiles(id uuid PRIMARY KEY,nombre_completo text,rol text,estado text DEFAULT 'activo',activo boolean DEFAULT true);
 CREATE TABLE public.maestros(id uuid PRIMARY KEY,user_id uuid,activo boolean DEFAULT true);
 CREATE TABLE public.permisos_maestros(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),maestro_id uuid,puede_inscribir_clases boolean DEFAULT false,fecha_inicio date,fecha_fin date);
 CREATE TABLE public.alumnos(id uuid PRIMARY KEY,nombre_completo text,activo boolean DEFAULT true,fecha_ingreso_iniciacion date);
 CREATE TABLE public.instrumentos(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),codigo text,estado text,alumno_id uuid);
 CREATE TABLE public.clases(id uuid PRIMARY KEY,nombre text,activo boolean DEFAULT true,es_clase_iniciacion boolean DEFAULT false,capacidad_maxima integer,tipo_clase text DEFAULT 'grupal',instrumento text,maestro_principal_id uuid,maestro_suplente_id uuid);
 CREATE TABLE public.alumnos_clases(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),alumno_id uuid REFERENCES public.alumnos,clase_id uuid REFERENCES public.clases,activo boolean DEFAULT true,fecha_inscripcion date DEFAULT current_date,dia text,hora_inicio time,hora_fin time,UNIQUE(alumno_id,clase_id));
 CREATE TABLE public.clase_horarios(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),clase_id uuid,dia text,hora_inicio time,hora_fin time);
 CREATE FUNCTION soi_security.has_role(roles text[]) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$ SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id=auth.uid() AND activo AND estado='activo' AND rol=ANY(roles)); $$;
 CREATE FUNCTION soi_security.assigned_maestro(cid uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$ SELECT soi_security.has_role(ARRAY['maestro']) AND EXISTS(SELECT 1 FROM public.maestros m JOIN public.clases c ON m.id IN(c.maestro_principal_id,c.maestro_suplente_id) WHERE (m.user_id=auth.uid() OR (m.user_id IS NULL AND m.id=auth.uid())) AND m.activo IS DISTINCT FROM false AND c.id=cid); $$;
 GRANT USAGE ON SCHEMA public,auth,soi_security TO authenticated; GRANT SELECT,INSERT,UPDATE,DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
 INSERT INTO public.profiles(id,nombre_completo,rol) VALUES ${Object.entries(ids)
   .filter(([key]) => ['admin', 'jury', 'receiver', 'other', 'jury2'].includes(key))
   .map(([name, id]) => `('${id}','${name} Sintético','${name === 'admin' ? 'admin' : 'maestro'}')`)
   .join(',')};
 INSERT INTO public.maestros(id,user_id) VALUES('${ids.receiver}','${ids.receiver}'),('${ids.jury}','${ids.jury}'),('${ids.other}','${ids.other}');
 INSERT INTO public.permisos_maestros(maestro_id,puede_inscribir_clases) VALUES('${ids.receiver}',true);
 INSERT INTO public.clases(id,nombre,es_clase_iniciacion,capacidad_maxima,instrumento,maestro_principal_id) VALUES('${ids.source}','Iniciación Prueba',true,20,null,'${ids.jury}'),('${ids.dest}','Coro Prueba',false,20,'Coro','${ids.receiver}'),('${ids.dest2}','Flauta Prueba',false,20,'Flauta','${ids.receiver}');
 INSERT INTO public.alumnos(id,nombre_completo,fecha_ingreso_iniciacion) VALUES('${ids.student}','Alumno Sintético','2026-01-15'),('${ids.student2}','Otro Sintético','2026-01-15');
 INSERT INTO public.alumnos_clases(alumno_id,clase_id) VALUES('${ids.student}','${ids.source}'),('${ids.student2}','${ids.source}');
 INSERT INTO public.clase_horarios(clase_id,dia,hora_inicio,hora_fin) VALUES('${ids.source}','lunes','15:00','16:00'),('${ids.dest}','martes','15:00','16:00'),('${ids.dest2}','miércoles','15:00','16:00');`)
  for (const name of [
    '20261022181421_initiation_audition_guests.sql',
    '20261023002545_initiation_semester_workflow.sql',
  ])
    await db.exec(
      await readFile(
        new URL(`../../../../../../supabase/migrations/${name}`, import.meta.url),
        'utf8',
      ),
    )
}

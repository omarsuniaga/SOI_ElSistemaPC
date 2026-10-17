-- Pruebas de comportamiento de las políticas de Storage DESPUÉS de la migración.
\set ON_ERROR_STOP on
\set adm 'a0000000-0000-0000-0000-000000000001'
\set u1  '00000000-0000-0000-0000-000000000001'
\set u2  '00000000-0000-0000-0000-000000000002'
\set m1  '00000000-0000-0000-0000-0000000000b1'
\set m2  '00000000-0000-0000-0000-0000000000b2'
\set alu 'c0000000-0000-0000-0000-000000000001'
\set inv 'd0000000-0000-0000-0000-000000000001'
\set c1  '11111111-1111-1111-1111-111111111111'

\o /dev/null

-- ── 1. Configuración de buckets ─────────────────────────────────────────────────
select t.expect('1.01 documentos es privado',            (select not public from storage.buckets where id = 'documentos'));
select t.expect('1.02 documentos limita tamaño (10 MB)', (select file_size_limit = 10485760 from storage.buckets where id = 'documentos'));
select t.expect('1.03 documentos limita tipos MIME',     (select allowed_mime_types is not null and not ('text/html' = any (allowed_mime_types)) from storage.buckets where id = 'documentos'));
select t.expect('1.04 tareas existe y es privado',       (select not public from storage.buckets where id = 'tareas'));
select t.expect('1.05 planificacion-docs existe y es privado', (select not public from storage.buckets where id = 'planificacion-docs'));
select t.expect('1.06 signage SIGUE público (cartelera/Raspberry Pi)', (select public from storage.buckets where id = 'signage'));
select t.expect('1.07 signage limita tamaño y tipos',    (select file_size_limit = 52428800 and 'video/mp4' = any (allowed_mime_types) and 'image/png' = any (allowed_mime_types) from storage.buckets where id = 'signage'));
select t.expect('1.08 instrumentos-fotos sigue público con sus límites', (select public and file_size_limit = 5242880 from storage.buckets where id = 'instrumentos-fotos'));
select t.expect('1.09 db-backups sigue privado',         (select not public from storage.buckets where id = 'db-backups'));

-- ── 2. Funciones de rol ─────────────────────────────────────────────────────────
select t.as_user(:'inv');
select t.expect('2.01 es_admin() sigue incluyendo inventarista (comportamiento heredado)', public.es_admin());
select t.expect('2.02 es_admin_estricto() EXCLUYE inventarista', not public.es_admin_estricto());
select t.back();
select t.as_user(:'adm');
select t.expect('2.03 es_admin_estricto() es true para admin', public.es_admin_estricto());
select t.back();
select t.as_user(:'alu');
select t.expect('2.04 es_admin_estricto() es false para un usuario sin rol admin', not public.es_admin_estricto());
select t.back();
select t.as_anon();
select t.expect('2.05 anon NO puede ejecutar es_admin_estricto()', not t.try_estricto());
select t.back();
select t.expect('2.06 es_admin() fija search_path',        (select coalesce(proconfig::text, '') like '%search_path%' from pg_proc where oid = 'public.es_admin()'::regprocedure));
select t.expect('2.07 maestro_actual() fija search_path',  (select coalesce(proconfig::text, '') like '%search_path%' from pg_proc where oid = 'public.maestro_actual()'::regprocedure));
select t.expect('2.08 es_admin_estricto() fija search_path', (select coalesce(proconfig::text, '') like '%search_path%' from pg_proc where oid = 'public.es_admin_estricto()'::regprocedure));

-- ── 3. documentos/justificaciones/<uid>/ ────────────────────────────────────────
select t.wipe();
select t.as_user(:'u1');
select t.expect('3.01 maestro sube a SU carpeta',                       t.try_insert('documentos', 'justificaciones/' || :'u1' || '/a.jpg'));
select t.expect('3.02 maestro NO sube a la carpeta de otro',            not t.try_insert('documentos', 'justificaciones/' || :'u2' || '/a.jpg'));
select t.expect('3.03 maestro NO sube en la raíz (ruta plana heredada)', not t.try_insert('documentos', 'justificaciones/plano.jpg'));
select t.expect('3.04 maestro NO sube en subcarpetas anidadas',         not t.try_insert('documentos', 'justificaciones/' || :'u1' || '/x/y.jpg'));
select t.expect('3.05 maestro NO sube fuera de los prefijos permitidos', not t.try_insert('documentos', 'otro/' || :'u1' || '/a.jpg'));
select t.back();

select t.as_user(:'alu');
select t.expect('3.06 usuario sin ficha de maestro NO sube (aunque use su uid)', not t.try_insert('documentos', 'justificaciones/' || :'alu' || '/a.jpg'));
select t.back();

select t.as_user(:'inv');
select t.expect('3.07 inventarista NO sube evidencia',                  not t.try_insert('documentos', 'justificaciones/' || :'inv' || '/a.jpg'));
select t.back();

select t.as_anon();
select t.expect('3.08 anon NO sube',                                    not t.try_insert('documentos', 'justificaciones/x.jpg'));
select t.back();

-- Lectura: f1.jpg (de u1) y f2.jpg (de u2) tienen fila padre en `justificaciones`.
select t.seed('documentos', 'justificaciones/' || :'u1' || '/f1.jpg');
select t.seed('documentos', 'justificaciones/' || :'u2' || '/f2.jpg');
select t.seed('documentos', 'justificaciones/' || :'u1' || '/huerfano.jpg');

select t.as_user(:'u1');
select t.expect('3.10 maestro lee su evidencia',                        t.can_see('documentos', 'justificaciones/' || :'u1' || '/f1.jpg'));
select t.expect('3.11 maestro NO lee la evidencia de otro maestro',     not t.can_see('documentos', 'justificaciones/' || :'u2' || '/f2.jpg'));
select t.back();

select t.as_user(:'u2');
select t.expect('3.12 otro maestro NO lee evidencia ajena',             not t.can_see('documentos', 'justificaciones/' || :'u1' || '/f1.jpg'));
select t.expect('3.13 otro maestro NO lee un archivo huérfano ajeno',   not t.can_see('documentos', 'justificaciones/' || :'u1' || '/huerfano.jpg'));
select t.expect('3.14 otro maestro NO borra evidencia ajena',           not t.try_delete('documentos', 'justificaciones/' || :'u1' || '/f1.jpg'));
select t.back();

-- Suplente de la clase: puede ver la evidencia por la fila padre (RLS de justificaciones).
update public.clases set maestro_suplente_id = :'m2' where id = :'c1';
select t.as_user(:'u2');
select t.expect('3.15 el maestro suplente de la clase SÍ lee la evidencia (fila padre)', t.can_see('documentos', 'justificaciones/' || :'u1' || '/f1.jpg'));
select t.expect('3.16 el suplente NO puede borrarla',                   not t.try_delete('documentos', 'justificaciones/' || :'u1' || '/f1.jpg'));
select t.back();
update public.clases set maestro_suplente_id = null where id = :'c1';

select t.as_user(:'alu');
select t.expect('3.17 usuario sin ficha NO lee evidencia',              not t.can_see('documentos', 'justificaciones/' || :'u1' || '/f1.jpg'));
select t.back();
select t.as_user(:'inv');
select t.expect('3.18 inventarista NO lee evidencia',                   not t.can_see('documentos', 'justificaciones/' || :'u1' || '/f1.jpg'));
select t.back();
select t.as_anon();
select t.expect('3.19 anon NO lee evidencia',                           not t.can_see('documentos', 'justificaciones/' || :'u1' || '/f1.jpg'));
select t.back();

select t.as_user(:'adm');
select t.expect('3.20 admin lee toda la evidencia',                     t.can_see('documentos', 'justificaciones/' || :'u1' || '/f1.jpg') and t.can_see('documentos', 'justificaciones/' || :'u2' || '/f2.jpg'));
select t.expect('3.21 admin puede borrar evidencia',                    t.try_delete('documentos', 'justificaciones/' || :'u2' || '/f2.jpg'));
select t.back();
select t.as_user(:'u1');
select t.expect('3.22 maestro borra su propia evidencia',               t.try_delete('documentos', 'justificaciones/' || :'u1' || '/huerfano.jpg'));
select t.back();

-- ── 4. documentos/ausencias y planning (carpeta = maestros.id) ──────────────────
select t.wipe();
select t.as_user(:'u1');
select t.expect('4.01 maestro sube ausencias/<su maestro_id>/',         t.try_insert('documentos', 'ausencias/' || :'m1' || '/a.pdf'));
select t.expect('4.02 maestro NO sube a ausencias/<otro maestro>/',     not t.try_insert('documentos', 'ausencias/' || :'m2' || '/a.pdf'));
select t.expect('4.03 maestro NO usa su uid como carpeta de ausencias (debe ser maestros.id)', not t.try_insert('documentos', 'ausencias/' || :'u1' || '/a.pdf'));
select t.expect('4.04 maestro sube planning/<su maestro_id>/',          t.try_insert('documentos', 'planning/' || :'m1' || '/p.pdf'));
select t.expect('4.05 maestro NO sube a planning/<otro>/',              not t.try_insert('documentos', 'planning/' || :'m2' || '/p.pdf'));
select t.back();
select t.seed('documentos', 'ausencias/' || :'m2' || '/b.pdf');
select t.seed('documentos', 'planning/'  || :'m2' || '/q.pdf');
select t.as_user(:'u1');
select t.expect('4.06 maestro NO lee ausencias de otro',                not t.can_see('documentos', 'ausencias/' || :'m2' || '/b.pdf'));
select t.expect('4.07 maestro NO lee planning de otro',                 not t.can_see('documentos', 'planning/' || :'m2' || '/q.pdf'));
select t.expect('4.08 maestro NO borra ausencias de otro',              not t.try_delete('documentos', 'ausencias/' || :'m2' || '/b.pdf'));
select t.back();
select t.as_user(:'adm');
select t.expect('4.09 admin lee ausencias y planning',                  t.can_see('documentos', 'ausencias/' || :'m2' || '/b.pdf') and t.can_see('documentos', 'planning/' || :'m2' || '/q.pdf'));
select t.back();
select t.as_user(:'inv');
select t.expect('4.10 inventarista NO lee ausencias',                   not t.can_see('documentos', 'ausencias/' || :'m2' || '/b.pdf'));
select t.expect('4.11 inventarista NO sube ausencias',                  not t.try_insert('documentos', 'ausencias/' || :'m1' || '/z.pdf'));
select t.back();
select t.as_anon();
select t.expect('4.12 anon NO lee ausencias',                           not t.can_see('documentos', 'ausencias/' || :'m2' || '/b.pdf'));
select t.back();

-- ── 5. documentos/comodatos (personal de inventario) ────────────────────────────
select t.wipe();
select t.as_user(:'adm');
select t.expect('5.01 admin sube contrato de comodato',                 t.try_insert('documentos', 'comodatos/abc/contrato.pdf'));
select t.back();
select t.as_user(:'inv');
select t.expect('5.02 inventarista sube contrato de comodato (intención del portal de inventario)', t.try_insert('documentos', 'comodatos/def/contrato.pdf'));
select t.expect('5.03 inventarista reemplaza (upsert) contrato',        t.try_update('documentos', 'comodatos/def/contrato.pdf'));
select t.back();
select t.as_user(:'u1');
select t.expect('5.04 maestro NO sube ni lee contratos',                not t.try_insert('documentos', 'comodatos/ghi/contrato.pdf') and not t.can_see('documentos', 'comodatos/abc/contrato.pdf'));
select t.back();
select t.as_anon();
select t.expect('5.05 anon NO lee contratos',                           not t.can_see('documentos', 'comodatos/abc/contrato.pdf'));
select t.back();

-- ── 6. instrumentos-fotos ───────────────────────────────────────────────────────
select t.wipe();
select t.as_user(:'inv');
select t.expect('6.01 inventarista sube foto de activo',                t.try_insert('instrumentos-fotos', 'activos/1/foto.png'));
select t.back();
select t.as_user(:'u1');
select t.expect('6.02 maestro NO sube fotos de instrumentos',           not t.try_insert('instrumentos-fotos', 'activos/2/foto.png'));
select t.back();
select t.as_anon();
select t.expect('6.03 anon NO sube fotos',                              not t.try_insert('instrumentos-fotos', 'activos/3/foto.png'));
select t.back();

-- ── 7. planificacion-docs ───────────────────────────────────────────────────────
select t.wipe();
select t.as_user(:'u1');
select t.expect('7.01 maestro sube a planificacion-uploads/<su uid>/',  t.try_insert('planificacion-docs', 'planificacion-uploads/' || :'u1' || '/a.pdf'));
select t.expect('7.02 maestro NO sube a la carpeta de otro',            not t.try_insert('planificacion-docs', 'planificacion-uploads/' || :'u2' || '/a.pdf'));
select t.back();
select t.seed('planificacion-docs', 'planificacion-uploads/' || :'u2' || '/b.pdf');
select t.as_user(:'u1');
select t.expect('7.03 maestro NO lee planificación de otro',            not t.can_see('planificacion-docs', 'planificacion-uploads/' || :'u2' || '/b.pdf'));
select t.back();
select t.as_user(:'alu');
select t.expect('7.04 usuario sin ficha NO sube',                       not t.try_insert('planificacion-docs', 'planificacion-uploads/' || :'alu' || '/a.pdf'));
select t.back();
select t.as_user(:'adm');
select t.expect('7.05 admin lee planificación',                         t.can_see('planificacion-docs', 'planificacion-uploads/' || :'u2' || '/b.pdf'));
select t.back();

-- ── 8. tareas (solo admin estricto) ─────────────────────────────────────────────
select t.wipe();
select t.as_user(:'adm');
select t.expect('8.01 admin sube adjunto de tarea',                     t.try_insert('tareas', 'tarea-1/doc.pdf'));
select t.back();
select t.as_user(:'u1');
select t.expect('8.02 maestro NO accede a adjuntos de tareas',          not t.try_insert('tareas', 'tarea-1/x.pdf') and not t.can_see('tareas', 'tarea-1/doc.pdf'));
select t.back();
select t.as_user(:'inv');
select t.expect('8.03 inventarista NO accede a adjuntos de tareas',     not t.try_insert('tareas', 'tarea-1/y.pdf') and not t.can_see('tareas', 'tarea-1/doc.pdf'));
select t.back();
select t.as_user(:'alu');
select t.expect('8.04 usuario sin ficha NO accede a adjuntos de tareas', not t.can_see('tareas', 'tarea-1/doc.pdf'));
select t.back();
select t.as_anon();
select t.expect('8.05 anon NO accede a adjuntos de tareas',             not t.can_see('tareas', 'tarea-1/doc.pdf'));
select t.back();

-- ── 9. signage: la cartelera sigue funcionando ──────────────────────────────────
select t.wipe();
select t.as_user(:'adm');
select t.expect('9.01 admin sube slides/logos a signage (el módulo admin sigue funcionando)', t.try_insert('signage', 'subidos/slide.png') and t.try_insert('signage', 'logos/logo.svg'));
select t.expect('9.02 admin reemplaza y borra archivos de signage',     t.try_update('signage', 'subidos/slide.png') and t.try_delete('signage', 'subidos/slide.png'));
select t.back();
select t.seed('signage', 'demo/slide1.svg');
select t.as_user(:'u1');
select t.expect('9.03 usuario autenticado sigue leyendo signage (signage_bucket_auth_read)', t.can_see('signage', 'demo/slide1.svg'));
select t.expect('9.04 maestro NO escribe en signage',                   not t.try_insert('signage', 'subidos/m.png'));
select t.back();
select t.as_user(:'inv');
select t.expect('9.05 inventarista NO escribe en signage',              not t.try_insert('signage', 'subidos/i.png'));
select t.back();
select t.as_anon();
select t.expect('9.06 anon NO escribe en signage',                      not t.try_insert('signage', 'subidos/a.png'));
select t.expect('9.07 anon NO borra en signage',                        not t.try_delete('signage', 'demo/slide1.svg'));
select t.back();

-- ── 10. db-backups: sin cambios ─────────────────────────────────────────────────
select t.wipe();
select t.seed('db-backups', 'backup.sql');
select t.as_user(:'adm');
select t.expect('10.01 un admin común NO accede a db-backups',          not t.can_see('db-backups', 'backup.sql'));
select t.back();
select t.as_user(:'u1');
select t.expect('10.02 un maestro NO accede a db-backups',              not t.can_see('db-backups', 'backup.sql'));
select t.back();
select t.as_user(:'u1', 'osuniagarivera@gmail.com');
select t.expect('10.03 el superadmin por email conserva su acceso (sin cambios)', t.can_see('db-backups', 'backup.sql'));
select t.back();
select t.as_anon();
select t.expect('10.04 anon NO accede a db-backups',                    not t.can_see('db-backups', 'backup.sql'));
select t.back();

select t.wipe();

\o
\echo
\echo '=== RESULTADOS ==='
select count(*) filter (where ok) as pasaron, count(*) filter (where not ok) as fallaron, count(*) as total from t.results;
select name as "FALLO" from t.results where not ok order by n;
do $$
begin
  if exists (select 1 from t.results where not ok) then
    raise exception 'FALLARON PRUEBAS DE POLÍTICAS DE STORAGE';
  end if;
end $$;

-- Sondas SOBRE EL ESTADO ACTUAL (antes de la migración): demuestran los riesgos reales.
\set u1  '00000000-0000-0000-0000-000000000001'
\set u2  '00000000-0000-0000-0000-000000000002'
\set inv 'd0000000-0000-0000-0000-000000000001'

\echo '--- SONDAS ANTES DE LA MIGRACIÓN (TRUE = riesgo presente) ---'
select 'bucket documentos es público' as hallazgo, public as presente from storage.buckets where id = 'documentos';

select t.seed('documentos', 'justificaciones/evidencia_alumno_de_m1.jpg');
select t.as_user(:'u2');
select 'un maestro lee la evidencia de OTRO maestro' as hallazgo,
       t.can_see('documentos', 'justificaciones/evidencia_alumno_de_m1.jpg') as presente;
select 'un maestro borra la evidencia de OTRO maestro' as hallazgo,
       t.try_delete('documentos', 'justificaciones/evidencia_alumno_de_m1.jpg') as presente;
select t.back();

select t.as_user(:'inv');
select 'un inventarista escribe en signage (cartelera)' as hallazgo,
       t.try_insert('signage', 'subidos/x.png') as presente;
select 'un inventarista sube evidencia de justificaciones' as hallazgo,
       t.try_insert('documentos', 'justificaciones/x.jpg') as presente;
select t.back();
select t.wipe();

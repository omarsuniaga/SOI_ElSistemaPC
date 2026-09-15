-- R1-B fila-specific preparation contract. Disposable local database only.
\set ON_ERROR_STOP on
BEGIN;

INSERT INTO auth.users (id) VALUES ('00000000-0000-0000-0000-000000000101') ON CONFLICT DO NOTHING;
INSERT INTO public.profiles (id) VALUES ('00000000-0000-0000-0000-000000000101') ON CONFLICT DO NOTHING;
INSERT INTO public.maestros (id) VALUES ('10000000-0000-0000-0000-000000000101') ON CONFLICT DO NOTHING;
INSERT INTO public.alumnos (id) VALUES ('20000000-0000-0000-0000-000000000101') ON CONFLICT DO NOTHING;
INSERT INTO public.clases (id, nombre, maestro_principal_id, activo) VALUES ('40000000-0000-0000-0000-000000000101', 'Fila R1B', '10000000-0000-0000-0000-000000000101', true) ON CONFLICT DO NOTHING;
INSERT INTO public.alumnos_clases (alumno_id, clase_id, activo) VALUES ('20000000-0000-0000-0000-000000000101', '40000000-0000-0000-0000-000000000101', true) ON CONFLICT DO NOTHING;
INSERT INTO public.obras (id, titulo) VALUES ('60000000-0000-0000-0000-000000000101', 'R1B') ON CONFLICT DO NOTHING;
INSERT INTO public.obra_versiones (id, obra_id, nombre) VALUES ('61000000-0000-0000-0000-000000000101', '60000000-0000-0000-0000-000000000101', 'Base') ON CONFLICT DO NOTHING;
INSERT INTO public.montajes (id, obra_version_id, conjunto, scope_type, owner_maestro_id) VALUES ('62000000-0000-0000-0000-000000000101', '61000000-0000-0000-0000-000000000101', 'R1B', 'PEDAGOGICO', '10000000-0000-0000-0000-000000000101') ON CONFLICT DO NOTHING;
INSERT INTO public.montaje_secciones (id, montaje_id, nombre) VALUES ('63000000-0000-0000-0000-000000000101', '62000000-0000-0000-0000-000000000101', 'Fila R1B') ON CONFLICT DO NOTHING;
INSERT INTO public.montaje_filas (id, montaje_seccion_id, nombre) VALUES ('64000000-0000-0000-0000-000000000101', '63000000-0000-0000-0000-000000000101', 'Fila R1B') ON CONFLICT DO NOTHING;
INSERT INTO public.montaje_alumnos (id, montaje_fila_id, alumno_id) VALUES ('65000000-0000-0000-0000-000000000101', '64000000-0000-0000-0000-000000000101', '20000000-0000-0000-0000-000000000101') ON CONFLICT DO NOTHING;
INSERT INTO public.obra_compases (id, obra_version_id, indice_interno, numero_visible, orden) VALUES ('66000000-0000-0000-0000-000000000101', '61000000-0000-0000-0000-000000000101', 0, '1', 0) ON CONFLICT DO NOTHING;
INSERT INTO public.montaje_compases (id, montaje_id, compas_id) VALUES ('67000000-0000-0000-0000-000000000101', '62000000-0000-0000-0000-000000000101', '66000000-0000-0000-0000-000000000101') ON CONFLICT DO NOTHING;
INSERT INTO public.montaje_fila_maestros (montaje_id, fila_id, maestro_id, can_read, can_edit_preparation) VALUES ('62000000-0000-0000-0000-000000000101', '64000000-0000-0000-0000-000000000101', '10000000-0000-0000-0000-000000000101', true, true) ON CONFLICT DO NOTHING;

SET ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000101', false);
SELECT set_config('repertoire.test_maestro_id', '10000000-0000-0000-0000-000000000101', false);
SELECT set_config('repertoire.test_role', 'maestro', false);
SELECT set_config('repertoire.test_department', 'ACM', false);

SELECT public.fn_repertoire_update_fila_preparation(
  '62000000-0000-0000-0000-000000000101', '64000000-0000-0000-0000-000000000101',
  '67000000-0000-0000-0000-000000000101', 'CON_DIFICULTAD'
);
SELECT public.fn_repertoire_update_fila_applicability(
  '62000000-0000-0000-0000-000000000101', '64000000-0000-0000-0000-000000000101',
  '67000000-0000-0000-0000-000000000101', 'TOCA'
);

DO $$
BEGIN
  IF (SELECT estado_colectivo FROM public.montaje_fila_compases WHERE montaje_fila_id = '64000000-0000-0000-0000-000000000101') <> 'CON_DIFICULTAD' THEN RAISE EXCEPTION 'fila state was not persisted'; END IF;
  IF (SELECT aplicabilidad FROM public.montaje_fila_compases WHERE montaje_fila_id = '64000000-0000-0000-0000-000000000101') <> 'TOCA' THEN RAISE EXCEPTION 'fila applicability was not persisted'; END IF;
  IF (SELECT count(*) FROM public.montaje_preparacion_historial WHERE montaje_fila_id = '64000000-0000-0000-0000-000000000101' AND alcance = 'fila') <> 1 THEN RAISE EXCEPTION 'fila history missing'; END IF;
END $$;

RESET ROLE;
SELECT 'R1-B fila-specific preparation contract: PASS' AS result;
ROLLBACK;

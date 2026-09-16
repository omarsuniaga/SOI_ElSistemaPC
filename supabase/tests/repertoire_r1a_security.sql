-- R1-A database authorization matrix.
-- Run only against a disposable local database after the current-schema
-- harness and Repertoire migrations have been installed. Never production.
\set ON_ERROR_STOP on
BEGIN;

INSERT INTO auth.users (id) VALUES
  ('00000000-0000-0000-0000-000000000001'), ('00000000-0000-0000-0000-000000000002'),
  ('00000000-0000-0000-0000-000000000003'), ('00000000-0000-0000-0000-000000000004'),
  ('00000000-0000-0000-0000-000000000005'), ('00000000-0000-0000-0000-000000000006')
ON CONFLICT DO NOTHING;
INSERT INTO public.profiles (id) SELECT id FROM auth.users ON CONFLICT DO NOTHING;
INSERT INTO public.maestros (id) VALUES
  ('10000000-0000-0000-0000-000000000001'), ('10000000-0000-0000-0000-000000000002'),
  ('10000000-0000-0000-0000-000000000003'), ('10000000-0000-0000-0000-000000000004'),
  ('10000000-0000-0000-0000-000000000005'), ('10000000-0000-0000-0000-000000000006')
ON CONFLICT DO NOTHING;
INSERT INTO public.alumnos (id) VALUES ('20000000-0000-0000-0000-000000000001') ON CONFLICT DO NOTHING;
INSERT INTO public.instrumentos (id) VALUES ('30000000-0000-0000-0000-000000000001'), ('30000000-0000-0000-0000-000000000002') ON CONFLICT DO NOTHING;
INSERT INTO public.sections (id) VALUES ('SEC-R1A') ON CONFLICT DO NOTHING;
INSERT INTO public.clases (id) VALUES ('40000000-0000-0000-0000-000000000001') ON CONFLICT DO NOTHING;
INSERT INTO public.sesiones_clase (id, maestro_id, clase_id) VALUES ('50000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001') ON CONFLICT DO NOTHING;

INSERT INTO public.obras (id, titulo) VALUES ('60000000-0000-0000-0000-000000000001', 'R1A') ON CONFLICT DO NOTHING;
INSERT INTO public.obra_versiones (id, obra_id, nombre) VALUES ('61000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000001', 'Base') ON CONFLICT DO NOTHING;
INSERT INTO public.montajes (id, obra_version_id, conjunto) VALUES ('62000000-0000-0000-0000-000000000001', '61000000-0000-0000-0000-000000000001', 'R1A') ON CONFLICT DO NOTHING;
INSERT INTO public.montaje_secciones (id, montaje_id, section_id, nombre) VALUES ('63000000-0000-0000-0000-000000000001', '62000000-0000-0000-0000-000000000001', 'SEC-R1A', 'Cuerdas') ON CONFLICT DO NOTHING;
INSERT INTO public.montaje_filas (id, montaje_seccion_id, nombre, instrumento_id) VALUES
 ('64000000-0000-0000-0000-000000000001', '63000000-0000-0000-0000-000000000001', 'Violín', '30000000-0000-0000-0000-000000000001'),
 ('64000000-0000-0000-0000-000000000002', '63000000-0000-0000-0000-000000000001', 'Trompeta', '30000000-0000-0000-0000-000000000002') ON CONFLICT DO NOTHING;
INSERT INTO public.montaje_alumnos (id, montaje_fila_id, alumno_id) VALUES ('65000000-0000-0000-0000-000000000001', '64000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001') ON CONFLICT DO NOTHING;
INSERT INTO public.obra_compases (id, obra_version_id, indice_interno, numero_visible, orden) VALUES ('66000000-0000-0000-0000-000000000001', '61000000-0000-0000-0000-000000000001', 1, '1', 1) ON CONFLICT DO NOTHING;
INSERT INTO public.montaje_compases (id, montaje_id, compas_id) VALUES ('67000000-0000-0000-0000-000000000001', '62000000-0000-0000-0000-000000000001', '66000000-0000-0000-0000-000000000001') ON CONFLICT DO NOTHING;
INSERT INTO public.montaje_fila_maestros (montaje_id, fila_id, maestro_id, can_edit_preparation, can_manage_passages, can_manage_targets)
VALUES ('62000000-0000-0000-0000-000000000001', '64000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', true, true, true) ON CONFLICT DO NOTHING;
INSERT INTO public.repertoire_signals (id, signal_type, severity, source_entity_type, source_entity_id, reason, dedupe_key)
VALUES ('68000000-0000-0000-0000-000000000001', 'R1A_TEST', 'LOW', 'montage', '62000000-0000-0000-0000-000000000001', 'test', 'r1a-test') ON CONFLICT DO NOTHING;
INSERT INTO public.repertoire_signal_deliveries (signal_id, profile_id, channel)
VALUES ('68000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'IN_APP') ON CONFLICT DO NOTHING;

SET ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000001', false);
SELECT set_config('repertoire.test_maestro_id', '10000000-0000-0000-0000-000000000001', false);
SELECT set_config('repertoire.test_role', 'maestro', false);
SELECT set_config('repertoire.test_department', 'ACM', false);

DO $$ BEGIN
  IF (SELECT count(*) FROM public.montaje_compases) <> 1 THEN RAISE EXCEPTION 'assigned teacher cannot read assigned montage'; END IF;
  IF NOT public.repertoire_maestro_puede_editar_fila('62000000-0000-0000-0000-000000000001', '64000000-0000-0000-0000-000000000001') THEN RAISE EXCEPTION 'assigned teacher cannot edit assigned fila'; END IF;
  IF public.repertoire_maestro_puede_editar_fila('62000000-0000-0000-0000-000000000001', '64000000-0000-0000-0000-000000000002') THEN RAISE EXCEPTION 'teacher crossed fila boundary'; END IF;
  IF has_table_privilege('authenticated', 'public.montaje_compases', 'UPDATE') THEN RAISE EXCEPTION 'direct preparation UPDATE grant remains'; END IF;
  IF has_table_privilege('authenticated', 'public.montaje_preparacion_historial', 'INSERT') THEN RAISE EXCEPTION 'history INSERT grant remains'; END IF;
  IF (SELECT count(*) FROM public.repertoire_signals) <> 1 THEN RAISE EXCEPTION 'recipient teacher cannot read delivered signal'; END IF;
  IF (SELECT count(*) FROM public.repertoire_signal_deliveries) <> 1 THEN RAISE EXCEPTION 'recipient teacher cannot read delivery'; END IF;
  PERFORM public.fn_repertoire_update_preparation('62000000-0000-0000-0000-000000000001', '67000000-0000-0000-0000-000000000001', 'DOMINADO', '10000000-0000-0000-0000-000000000001', 'collective', 'COLLECTIVE_FILA', '64000000-0000-0000-0000-000000000001');
  PERFORM public.fn_repertoire_update_preparation('62000000-0000-0000-0000-000000000001', '67000000-0000-0000-0000-000000000001', 'CON_DIFICULTAD', '10000000-0000-0000-0000-000000000001', 'student', 'INDIVIDUAL_OVERRIDE', '64000000-0000-0000-0000-000000000001', '65000000-0000-0000-0000-000000000001');
END $$;

DO $$ BEGIN
  BEGIN
    PERFORM public.fn_repertoire_update_preparation('62000000-0000-0000-0000-000000000001', '67000000-0000-0000-0000-000000000001', 'DOMINADO', '10000000-0000-0000-0000-000000000001', 'collective', 'COLLECTIVE_FILA', '64000000-0000-0000-0000-000000000002');
    RAISE EXCEPTION 'cross-fila collective RPC unexpectedly succeeded';
  EXCEPTION WHEN OTHERS THEN IF SQLERRM NOT LIKE '%fila assignment denied%' THEN RAISE; END IF;
  END;
END $$;

RESET ROLE;
SELECT set_config('repertoire.test_role', 'maestro', false);
SELECT set_config('repertoire.test_department', 'ACM', false);
SELECT set_config('repertoire.test_maestro_id', '10000000-0000-0000-0000-000000000002', false);
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000002', false);
SET ROLE authenticated;
DO $$ BEGIN
  IF (SELECT count(*) FROM public.montaje_compases) <> 0 THEN RAISE EXCEPTION 'unassigned teacher can read montage'; END IF;
  BEGIN
    PERFORM public.fn_repertoire_update_preparation('62000000-0000-0000-0000-000000000001', '67000000-0000-0000-0000-000000000001', 'DOMINADO', '10000000-0000-0000-0000-000000000002', 'collective', 'COLLECTIVE_FILA', '64000000-0000-0000-0000-000000000002');
    RAISE EXCEPTION 'unassigned trumpet teacher unexpectedly succeeded';
  EXCEPTION WHEN OTHERS THEN IF SQLERRM NOT LIKE '%fila assignment denied%' THEN RAISE; END IF;
  END;
END $$;

RESET ROLE;
SELECT set_config('repertoire.test_role', 'coordinacion_academica', false);
SET ROLE authenticated;
DO $$ BEGIN
  IF (SELECT count(*) FROM public.montaje_compases) <> 1 THEN RAISE EXCEPTION 'ACM cannot read montage'; END IF;
END $$;
RESET ROLE;
SELECT set_config('repertoire.test_role', 'direccion', false);
SET ROLE authenticated;
DO $$ BEGIN
  IF (SELECT count(*) FROM public.montaje_compases) <> 1 THEN RAISE EXCEPTION 'direction cannot read montage'; END IF;
  BEGIN
    PERFORM public.fn_repertoire_update_preparation('62000000-0000-0000-0000-000000000001', '67000000-0000-0000-0000-000000000001', 'DOMINADO', '10000000-0000-0000-0000-000000000004', 'collective', 'COLLECTIVE_FILA', '64000000-0000-0000-0000-000000000002');
    RAISE EXCEPTION 'direction granular preparation unexpectedly succeeded';
  EXCEPTION WHEN OTHERS THEN IF SQLERRM NOT LIKE '%fila assignment denied%' THEN RAISE; END IF;
  END;
END $$;
RESET ROLE;
SELECT set_config('repertoire.test_role', 'finanzas', false);
SELECT set_config('repertoire.test_department', 'FIN', false);
SELECT set_config('repertoire.test_maestro_id', '10000000-0000-0000-0000-000000000005', false);
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000005', false);
SET ROLE authenticated;
DO $$ BEGIN
  IF (SELECT count(*) FROM public.montaje_compases) <> 0 THEN RAISE EXCEPTION 'Finanzas can read Repertoire rows'; END IF;
  BEGIN
    PERFORM public.fn_repertoire_update_preparation('62000000-0000-0000-0000-000000000001', '67000000-0000-0000-0000-000000000001', 'DOMINADO', '10000000-0000-0000-0000-000000000005', 'collective', 'COLLECTIVE_FILA', '64000000-0000-0000-0000-000000000001');
    RAISE EXCEPTION 'Finanzas RPC unexpectedly succeeded';
  EXCEPTION WHEN OTHERS THEN IF SQLERRM NOT LIKE '%not authorized%' THEN RAISE; END IF;
  END;
END $$;
RESET ROLE;
SELECT set_config('repertoire.test_role', 'admin', false);
SELECT set_config('repertoire.test_department', 'ADMIN', false);
SELECT set_config('repertoire.test_maestro_id', '10000000-0000-0000-0000-000000000006', false);
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000006', false);
SET ROLE authenticated;
DO $$ BEGIN
  IF (SELECT count(*) FROM public.montaje_compases) <> 1 THEN RAISE EXCEPTION 'admin cannot read montage'; END IF;
  PERFORM public.fn_repertoire_update_preparation('62000000-0000-0000-0000-000000000001', '67000000-0000-0000-0000-000000000001', 'CONSOLIDADO', '10000000-0000-0000-0000-000000000006', 'collective', 'COLLECTIVE_FILA', '64000000-0000-0000-0000-000000000002');
END $$;
RESET ROLE;
SELECT 'R1-A six-identity SQL authorization matrix: PASS' AS result;
ROLLBACK;

-- R1-A production pre-flight. READ ONLY. Run before applying any migration.
DO $$
DECLARE missing text[]; bad text[]; unexpected text[]; collisions text[];
BEGIN
  IF current_database() IS NULL THEN RAISE EXCEPTION 'database unavailable'; END IF;
  SELECT array_agg(n) INTO missing FROM unnest(ARRAY['profiles','maestros','alumnos','instrumentos','sections','clases','sesiones_clase','observaciones_sesion','calendario_institucional','tareas_institucionales']) n WHERE to_regclass('public.' || n) IS NULL;
  IF missing IS NOT NULL THEN RAISE EXCEPTION 'missing prerequisite tables: %', missing; END IF;
  IF (SELECT atttypid::regtype::text FROM pg_attribute WHERE attrelid='public.sections'::regclass AND attname='id' AND NOT attisdropped) <> 'text' THEN RAISE EXCEPTION 'sections.id must be text'; END IF;
  SELECT array_agg(n) INTO bad FROM unnest(ARRAY['profiles','maestros','alumnos','clases','sesiones_clase','observaciones_sesion','calendario_institucional','tareas_institucionales']) n WHERE (SELECT atttypid::regtype::text FROM pg_attribute WHERE attrelid=('public.' || n)::regclass AND attname='id' AND NOT attisdropped) <> 'uuid';
  IF bad IS NOT NULL THEN RAISE EXCEPTION 'expected UUID primary identifiers are not UUID: %', bad; END IF;
  SELECT array_agg(n) INTO unexpected FROM unnest(ARRAY['obras','obra_versiones','montajes','montaje_secciones','montaje_filas','montaje_alumnos','obra_compases','montaje_compases','montaje_alumno_compases','montaje_pasajes','montaje_pasaje_compases','montaje_grupos_compases','montaje_grupo_compases','sesion_repertorio_trabajos','sesion_repertorio_trabajo_compases','observacion_sesion_repertorio','montaje_preparacion_historial','montaje_targets','montaje_target_milestones','montaje_eventos','repertoire_signals','repertoire_signal_deliveries','montaje_fila_maestros']) n WHERE to_regclass('public.' || n) IS NOT NULL;
  IF unexpected IS NOT NULL THEN RAISE EXCEPTION 'unexpected Repertoire tables already exist: %', unexpected; END IF;
  IF EXISTS (SELECT 1 FROM pg_proc WHERE pronamespace='public'::regnamespace AND proname IN ('fn_repertoire_update_preparation','fn_repertoire_update_applicability','repertoire_maestro_puede_leer_fila','repertoire_maestro_puede_editar_fila','repertoire_maestro_puede_editar_montage','repertoire_maestro_puede_leer_montage')) THEN RAISE EXCEPTION 'unexpected Repertoire functions already exist'; END IF;
  SELECT array_agg(object_name) INTO collisions FROM (
    SELECT c.relname AS object_name FROM pg_class c WHERE c.relnamespace='public'::regnamespace AND (c.relname LIKE 'idx_montaje_%' OR c.relname LIKE 'idx_obra_%' OR c.relname LIKE 'idx_sesion_repertorio_%' OR c.relname LIKE 'idx_observacion_sesion_repertorio_%')
    UNION ALL SELECT conname FROM pg_constraint WHERE conname LIKE 'montaje_%_uk' OR conname LIKE 'montaje_fila_maestros_%'
    UNION ALL SELECT polname FROM pg_policy WHERE polname LIKE 'repertoire_%'
    UNION ALL SELECT typname FROM pg_type WHERE typnamespace='public'::regnamespace AND typname IN ('montaje_estado','aplicabilidad_compas','estado_preparacion')
  ) objects;
  IF collisions IS NOT NULL THEN RAISE EXCEPTION 'migration object name collisions detected: %', collisions; END IF;
  RAISE NOTICE 'R1-A pre-flight passed; PostgreSQL %', version();
END $$;

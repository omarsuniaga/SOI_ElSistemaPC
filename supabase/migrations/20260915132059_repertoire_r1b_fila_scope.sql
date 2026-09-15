-- R1-B additive fila-specific preparation layer.
-- Production migration: intentionally NOT applied by this change.
-- Requires the ten deployed R1-A repertoire migrations.

BEGIN;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typnamespace = 'public'::regnamespace AND typname = 'montaje_scope_type') THEN
    CREATE TYPE public.montaje_scope_type AS ENUM ('PEDAGOGICO', 'INSTITUCIONAL');
  END IF;
END $$;

-- Production inspection confirmed zero rows in montajes, so a NOT NULL scope
-- contract is safe and prevents future rows from silently becoming ambiguous.
ALTER TABLE public.montajes
  ADD COLUMN IF NOT EXISTS scope_type public.montaje_scope_type NOT NULL,
  ADD COLUMN IF NOT EXISTS owner_maestro_id uuid REFERENCES public.maestros(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS published_at timestamptz,
  ADD COLUMN IF NOT EXISTS published_by uuid REFERENCES public.maestros(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS public.montaje_fila_compases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  montaje_fila_id uuid NOT NULL REFERENCES public.montaje_filas(id) ON DELETE CASCADE,
  montaje_compas_id uuid NOT NULL REFERENCES public.montaje_compases(id) ON DELETE CASCADE,
  aplicabilidad public.aplicabilidad_compas,
  estado_colectivo public.estado_preparacion,
  evaluado_por uuid REFERENCES public.maestros(id) ON DELETE SET NULL,
  evaluado_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT montaje_fila_compases_uk UNIQUE (montaje_fila_id, montaje_compas_id)
);

CREATE INDEX IF NOT EXISTS idx_montaje_fila_compases_fila ON public.montaje_fila_compases(montaje_fila_id, montaje_compas_id);
CREATE INDEX IF NOT EXISTS idx_montaje_fila_compases_measure ON public.montaje_fila_compases(montaje_compas_id, montaje_fila_id);

ALTER TABLE public.montaje_fila_compases ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS repertoire_fila_measure_read_scope ON public.montaje_fila_compases;
CREATE POLICY repertoire_fila_measure_read_scope ON public.montaje_fila_compases
  FOR SELECT TO authenticated
  USING (
    public.get_user_role() IN ('admin', 'superadmin', 'direccion', 'coordinacion_academica')
    OR EXISTS (
      SELECT 1
      FROM public.montaje_filas f
      JOIN public.montaje_secciones s ON s.id = f.montaje_seccion_id
      WHERE f.id = montaje_fila_id
        AND public.repertoire_maestro_puede_leer_fila(s.montaje_id, f.id)
    )
  );
REVOKE ALL ON public.montaje_fila_compases FROM authenticated;
GRANT SELECT ON public.montaje_fila_compases TO authenticated;

-- Teacher creation is one authorized transaction. Class ids are the real SOI
-- teaching scopes; the resulting montaje_alumnos rows are a point-in-time
-- membership snapshot and are not continuously synchronized.
CREATE OR REPLACE FUNCTION public.fn_repertoire_create_pedagogical_montage(
  p_title text,
  p_composer text DEFAULT NULL,
  p_arranger text DEFAULT NULL,
  p_version_name text DEFAULT 'Versión principal',
  p_num_measures integer DEFAULT NULL,
  p_notes text DEFAULT NULL,
  p_scope_class_ids uuid[] DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE
  actor uuid := public.maestro_actual();
  obra_id uuid;
  version_id uuid;
  montage_id uuid;
  class_row record;
  section_id uuid;
  fila_id uuid;
  measure_id uuid;
  index_value integer;
  requested_scope_count integer := COALESCE(cardinality(p_scope_class_ids), 0);
  authorized_scope_count integer;
BEGIN
  IF actor IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  IF NOT public.is_teacher() AND public.get_user_role() NOT IN ('admin', 'superadmin', 'direccion', 'coordinacion_academica') THEN RAISE EXCEPTION 'teacher capability required'; END IF;
  IF NULLIF(trim(p_title), '') IS NULL THEN RAISE EXCEPTION 'title is required'; END IF;
  IF p_num_measures IS NULL OR p_num_measures < 1 OR p_num_measures > 10000 THEN RAISE EXCEPTION 'invalid measure count'; END IF;
  IF requested_scope_count = 0 THEN RAISE EXCEPTION 'at least one teaching scope is required'; END IF;

  SELECT count(*) INTO authorized_scope_count
  FROM public.clases c
  WHERE c.id = ANY(p_scope_class_ids)
    AND c.activo
    AND (c.maestro_principal_id = actor OR c.maestro_suplente_id = actor OR c.maestro_id = actor OR c.maestro_auxiliar_id = actor);
  IF authorized_scope_count <> requested_scope_count THEN RAISE EXCEPTION 'one or more teaching scopes are not authorized'; END IF;

  INSERT INTO public.obras (titulo, compositor, arreglista, resena) VALUES (trim(p_title), NULLIF(trim(p_composer), ''), NULLIF(trim(p_arranger), ''), NULLIF(trim(p_notes), '')) RETURNING id INTO obra_id;
  INSERT INTO public.obra_versiones (obra_id, nombre, numero_compases, notas) VALUES (obra_id, COALESCE(NULLIF(trim(p_version_name), ''), 'Versión principal'), p_num_measures, NULLIF(trim(p_notes), '')) RETURNING id INTO version_id;
  INSERT INTO public.montajes (obra_version_id, nucleo, conjunto, scope_type, owner_maestro_id) VALUES (version_id, 'PEDAGOGICO', 'MAESTRO', 'PEDAGOGICO', actor) RETURNING id INTO montage_id;

  FOR index_value IN 0..(p_num_measures - 1) LOOP
    INSERT INTO public.obra_compases (obra_version_id, indice_interno, numero_visible, orden) VALUES (version_id, index_value, (index_value + 1)::text, index_value) RETURNING id INTO measure_id;
    INSERT INTO public.montaje_compases (montaje_id, compas_id) VALUES (montage_id, measure_id);
  END LOOP;

  FOR class_row IN SELECT c.id, c.nombre FROM public.clases c WHERE c.id = ANY(p_scope_class_ids) ORDER BY c.nombre LOOP
    INSERT INTO public.montaje_secciones (montaje_id, nombre, orden) VALUES (montage_id, class_row.nombre, 0) RETURNING id INTO section_id;
    INSERT INTO public.montaje_filas (montaje_seccion_id, nombre, responsable_maestro_id) VALUES (section_id, class_row.nombre, actor) RETURNING id INTO fila_id;
    INSERT INTO public.montaje_alumnos (montaje_fila_id, alumno_id)
      SELECT fila_id, ac.alumno_id FROM public.alumnos_clases ac JOIN public.alumnos a ON a.id = ac.alumno_id
      WHERE ac.clase_id = class_row.id AND COALESCE(ac.activo, true) AND COALESCE(a.activo, true)
      ON CONFLICT (montaje_fila_id, alumno_id) DO NOTHING;
    INSERT INTO public.montaje_fila_compases (montaje_fila_id, montaje_compas_id)
      SELECT fila_id, mc.id FROM public.montaje_compases mc WHERE mc.montaje_id = montage_id;
  END LOOP;

  RETURN jsonb_build_object('obra_id', obra_id, 'version_id', version_id, 'montage_id', montage_id, 'scope_count', requested_scope_count, 'measure_count', p_num_measures);
END; $$;

REVOKE ALL ON FUNCTION public.fn_repertoire_create_pedagogical_montage(text, text, text, text, integer, text, uuid[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fn_repertoire_create_pedagogical_montage(text, text, text, text, integer, text, uuid[]) TO authenticated;

-- Keep historical `collective` and `student` values readable. New fila
-- transitions use `fila`; no destructive rewrite is performed.
ALTER TABLE public.montaje_preparacion_historial
  DROP CONSTRAINT IF EXISTS montaje_preparacion_historial_alcance_check;
ALTER TABLE public.montaje_preparacion_historial
  ADD CONSTRAINT montaje_preparacion_historial_alcance_check
  CHECK (alcance IN ('collective', 'student', 'fila'));

CREATE OR REPLACE FUNCTION public.fn_repertoire_update_fila_preparation(
  p_montage_id uuid,
  p_fila_id uuid,
  p_montaje_compas_id uuid,
  p_estado public.estado_preparacion,
  p_source text DEFAULT 'COLLECTIVE_FILA',
  p_session_id uuid DEFAULT NULL,
  p_bulk_operation_id uuid DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE
  previous_state public.estado_preparacion;
  effective_actor uuid := public.maestro_actual();
BEGIN
  IF effective_actor IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  IF p_estado IS NULL THEN RAISE EXCEPTION 'fila state is required'; END IF;
  IF NOT public.repertoire_maestro_puede_editar_fila(p_montage_id, p_fila_id) THEN RAISE EXCEPTION 'fila assignment denied'; END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.montaje_filas f
    JOIN public.montaje_secciones s ON s.id = f.montaje_seccion_id
    WHERE f.id = p_fila_id AND s.montaje_id = p_montage_id
  ) THEN RAISE EXCEPTION 'fila outside montage'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.montaje_compases WHERE id = p_montaje_compas_id AND montaje_id = p_montage_id) THEN RAISE EXCEPTION 'measure outside montage'; END IF;

  SELECT estado_colectivo INTO previous_state
  FROM public.montaje_fila_compases
  WHERE montaje_fila_id = p_fila_id AND montaje_compas_id = p_montaje_compas_id
  FOR UPDATE;

  INSERT INTO public.montaje_fila_compases (montaje_fila_id, montaje_compas_id, estado_colectivo, evaluado_por, evaluado_at)
  VALUES (p_fila_id, p_montaje_compas_id, p_estado, effective_actor, now())
  ON CONFLICT (montaje_fila_id, montaje_compas_id) DO UPDATE SET
    estado_colectivo = EXCLUDED.estado_colectivo,
    evaluado_por = EXCLUDED.evaluado_por,
    evaluado_at = EXCLUDED.evaluado_at,
    updated_at = now();

  INSERT INTO public.montaje_preparacion_historial
    (montaje_id, montaje_fila_id, montaje_compas_id, estado_anterior, estado_nuevo, actor_maestro_id, alcance, fuente, sesion_id, operacion_masiva_id)
  VALUES (p_montage_id, p_fila_id, p_montaje_compas_id, previous_state, p_estado, effective_actor, 'fila', p_source, p_session_id, p_bulk_operation_id);

  RETURN jsonb_build_object('affected', 1, 'scope', 'fila', 'montage_id', p_montage_id, 'fila_id', p_fila_id, 'measure_id', p_montaje_compas_id, 'previous_state', previous_state, 'new_state', p_estado);
END; $$;

CREATE OR REPLACE FUNCTION public.fn_repertoire_update_fila_applicability(
  p_montage_id uuid,
  p_fila_id uuid,
  p_montaje_compas_id uuid,
  p_aplicabilidad public.aplicabilidad_compas
) RETURNS public.aplicabilidad_compas
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
BEGIN
  IF NOT public.repertoire_maestro_puede_editar_fila(p_montage_id, p_fila_id) THEN RAISE EXCEPTION 'fila assignment denied'; END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.montaje_filas f
    JOIN public.montaje_secciones s ON s.id = f.montaje_seccion_id
    WHERE f.id = p_fila_id AND s.montaje_id = p_montage_id
  ) THEN RAISE EXCEPTION 'fila outside montage'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.montaje_compases WHERE id = p_montaje_compas_id AND montaje_id = p_montage_id) THEN RAISE EXCEPTION 'measure outside montage'; END IF;

  INSERT INTO public.montaje_fila_compases (montaje_fila_id, montaje_compas_id, aplicabilidad)
  VALUES (p_fila_id, p_montaje_compas_id, p_aplicabilidad)
  ON CONFLICT (montaje_fila_id, montaje_compas_id) DO UPDATE SET aplicabilidad = EXCLUDED.aplicabilidad, updated_at = now();
  RETURN p_aplicabilidad;
END; $$;

REVOKE ALL ON FUNCTION public.fn_repertoire_update_fila_preparation(uuid, uuid, uuid, public.estado_preparacion, text, uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fn_repertoire_update_fila_preparation(uuid, uuid, uuid, public.estado_preparacion, text, uuid, uuid) TO authenticated;
REVOKE ALL ON FUNCTION public.fn_repertoire_update_fila_applicability(uuid, uuid, uuid, public.aplicabilidad_compas) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fn_repertoire_update_fila_applicability(uuid, uuid, uuid, public.aplicabilidad_compas) TO authenticated;

COMMENT ON TABLE public.montaje_fila_compases IS 'Fila-specific applicability and explicit collective preparation; derived student evidence is never stored here.';
COMMENT ON COLUMN public.montajes.scope_type IS 'PEDAGOGICO is teacher-owned preparation; INSTITUCIONAL is centrally managed preparation.';
COMMENT ON COLUMN public.montajes.created_by IS 'Auth provenance only; ownership is represented by owner_maestro_id when applicable.';
COMMENT ON TABLE public.montaje_alumnos IS 'Point-in-time Montage membership snapshot; enrollment changes require explicit refresh.';

COMMIT;

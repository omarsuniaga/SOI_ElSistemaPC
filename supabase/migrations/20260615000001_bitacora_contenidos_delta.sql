-- Migration: Bitácora de Cualificación de Contenidos — Delta
-- Date: 2026-06-15
-- Purpose: Repurpose indicator_sessions from árbol-B model to bitácora model.
--          Drops calificacion, node_id, route_version_id; adds objetivo_id FK
--          to ruta_contenido_objetivos; enforces clase_id NOT NULL; creates
--          v_semaforo_contenidos view and registrar_sesion_bitacora RPC.
--
-- Ordering invariant: constraint drops before column drops;
-- column additions before constraint additions; policy drops before policy additions.

-- ==============================================================================
-- 1. DROP EXISTING RLS POLICIES (before column changes)
-- ==============================================================================

DROP POLICY IF EXISTS "maestros_can_view_own_indicator_sessions" ON public.indicator_sessions;
DROP POLICY IF EXISTS "maestros_can_insert_indicator_sessions" ON public.indicator_sessions;
DROP POLICY IF EXISTS "maestros_can_update_own_indicator_sessions" ON public.indicator_sessions;
DROP POLICY IF EXISTS "users_can_view_session_students" ON public.indicator_session_students;
DROP POLICY IF EXISTS "users_can_insert_session_students" ON public.indicator_session_students;

-- ==============================================================================
-- 2. DROP OLD COLUMNS AND CONSTRAINTS (constraints first, columns second)
-- ==============================================================================

-- Drop FK constraints first
ALTER TABLE public.indicator_sessions
  DROP CONSTRAINT IF EXISTS indicator_sessions_route_version_id_fkey,
  DROP CONSTRAINT IF EXISTS indicator_sessions_node_id_fkey;

-- Drop columns
ALTER TABLE public.indicator_sessions
  DROP COLUMN IF EXISTS calificacion,
  DROP COLUMN IF EXISTS node_id,
  DROP COLUMN IF EXISTS route_version_id;

-- ==============================================================================
-- 3. ADD NEW COLUMNS
-- ==============================================================================

-- Add objetivo_id as nullable first (two-step to avoid NOT NULL failure on replay)
ALTER TABLE public.indicator_sessions
  ADD COLUMN IF NOT EXISTS objetivo_id UUID REFERENCES public.ruta_contenido_objetivos(id) ON DELETE SET NULL;

-- Set NOT NULL after addition (safe — table confirmed empty from exploration)
ALTER TABLE public.indicator_sessions
  ALTER COLUMN objetivo_id SET NOT NULL;

-- Enforce clase_id NOT NULL (was nullable in original schema)
ALTER TABLE public.indicator_sessions
  ALTER COLUMN clase_id SET NOT NULL;

-- Drop old indices that reference dropped columns
DROP INDEX IF EXISTS idx_indicator_sessions_route;
DROP INDEX IF EXISTS idx_indicator_sessions_node;
DROP INDEX IF EXISTS idx_indicator_sessions_maestro_route_node;

-- ==============================================================================
-- 4. ADD NEW CONSTRAINTS AND INDICES
-- ==============================================================================

-- Composite UNIQUE: one session record per (class, objective, date, teacher)
ALTER TABLE public.indicator_sessions
  DROP CONSTRAINT IF EXISTS indicator_sessions_unique_session;
ALTER TABLE public.indicator_sessions
  ADD CONSTRAINT indicator_sessions_unique_session UNIQUE (clase_id, objetivo_id, fecha, maestro_id);

-- Indices for new query patterns
CREATE INDEX IF NOT EXISTS idx_indicator_sessions_clase ON public.indicator_sessions(clase_id);
CREATE INDEX IF NOT EXISTS idx_indicator_sessions_objetivo ON public.indicator_sessions(objetivo_id);
CREATE INDEX IF NOT EXISTS idx_indicator_sessions_clase_objetivo ON public.indicator_sessions(clase_id, objetivo_id);

-- ==============================================================================
-- 5. NEW RLS POLICIES
-- ==============================================================================

-- indicator_sessions: SELECT — teacher sees only own sessions
CREATE POLICY "bitacora_indicator_sessions_select" ON public.indicator_sessions
  FOR SELECT TO authenticated
  USING (maestro_id = public.maestro_actual());

-- indicator_sessions: INSERT — teacher must own the session AND belong to the class
CREATE POLICY "bitacora_indicator_sessions_insert" ON public.indicator_sessions
  FOR INSERT TO authenticated
  WITH CHECK (
    maestro_id = public.maestro_actual()
    AND public.maestro_en_clase(clase_id)
  );

-- indicator_sessions: UPDATE — teacher must own the row AND belong to the class
CREATE POLICY "bitacora_indicator_sessions_update" ON public.indicator_sessions
  FOR UPDATE TO authenticated
  USING (maestro_id = public.maestro_actual())
  WITH CHECK (
    maestro_id = public.maestro_actual()
    AND public.maestro_en_clase(clase_id)
  );

-- indicator_session_students: SELECT — only via parent session owned by current teacher
CREATE POLICY "bitacora_indicator_session_students_select" ON public.indicator_session_students
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.indicator_sessions s
      WHERE s.id = indicator_session_id
      AND s.maestro_id = public.maestro_actual()
    )
  );

-- indicator_session_students: INSERT — only via parent session owned by current teacher
CREATE POLICY "bitacora_indicator_session_students_insert" ON public.indicator_session_students
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.indicator_sessions s
      WHERE s.id = indicator_session_id
      AND s.maestro_id = public.maestro_actual()
    )
  );

-- NOTE: No UPDATE or DELETE policies on either table — not granted in this change.

-- ==============================================================================
-- 6. VIEW: v_semaforo_contenidos
-- ==============================================================================

CREATE OR REPLACE VIEW public.v_semaforo_contenidos
SECURITY INVOKER
AS
SELECT
  iss.alumno_id,
  s.clase_id,
  s.objetivo_id,
  COUNT(iss.id)::BIGINT AS total_registros,
  COUNT(iss.id) FILTER (WHERE iss.nota_cualitativa = 'bien')::BIGINT AS bien_count,
  COUNT(iss.id) FILTER (WHERE iss.nota_cualitativa = 'regular')::BIGINT AS regular_count,
  COUNT(iss.id) FILTER (WHERE iss.nota_cualitativa = 'mal')::BIGINT AS mal_count,
  CASE
    -- rojo takes precedence over verde when both thresholds are met (conservative)
    WHEN COUNT(iss.id) FILTER (WHERE iss.nota_cualitativa = 'mal') > COUNT(iss.id) / 2 THEN 'rojo'
    WHEN COUNT(iss.id) FILTER (WHERE iss.nota_cualitativa = 'bien') >= CEIL(COUNT(iss.id) * 0.7) THEN 'verde'
    ELSE 'naranja'
  END::TEXT AS semaforo
FROM public.indicator_sessions s
INNER JOIN public.indicator_session_students iss ON iss.indicator_session_id = s.id
GROUP BY iss.alumno_id, s.clase_id, s.objetivo_id;

COMMENT ON VIEW public.v_semaforo_contenidos IS
  'Per-student, per-objective traffic-light aggregation from indicator_sessions.
   gris (untagged) is represented by absence of row — UI shows gris as default
   when no row exists for a given (alumno, clase, objetivo) combination.
   Thresholds: rojo = >50% mal, verde = >=70% bien, naranja = mixed, gris = no data.';

GRANT SELECT ON public.v_semaforo_contenidos TO authenticated;

-- ==============================================================================
-- 7. RPC: registrar_sesion_bitacora (atomic write)
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.registrar_sesion_bitacora(
  p_clase_id UUID,
  p_objetivo_id UUID,
  p_fecha DATE,
  p_notas JSONB  -- Array of { alumno_id: UUID, nota_cualitativa: TEXT }
)
RETURNS UUID
SECURITY INVOKER
LANGUAGE plpgsql
AS $$
DECLARE
  v_maestro_id UUID;
  v_session_id UUID;
  v_nota JSONB;
  v_nota_val TEXT;
  v_alumno_id UUID;
BEGIN
  -- NULL maestro guard: must be authenticated as a teacher
  v_maestro_id := public.maestro_actual();
  IF v_maestro_id IS NULL THEN
    RAISE EXCEPTION 'No tienes permisos para registrar sesiones (maestro no autenticado)'
      USING HINT = 'Debes iniciar sesión como maestro para usar esta función';
  END IF;

  -- Validate JSON array is present and non-empty
  IF p_notas IS NULL OR jsonb_array_length(p_notas) = 0 THEN
    RAISE EXCEPTION 'La lista de notas no puede estar vacía'
      USING HINT = 'Proporciona al menos un alumno con su nota';
  END IF;

  -- Validate fecha not in future
  IF p_fecha > CURRENT_DATE THEN
    RAISE EXCEPTION 'La fecha no puede ser posterior a hoy (%)', CURRENT_DATE
      USING HINT = 'Usa una fecha igual o anterior a la fecha actual';
  END IF;

  -- Validate each nota entry
  FOR v_nota IN SELECT * FROM jsonb_array_elements(p_notas)
  LOOP
    v_nota_val := v_nota ->> 'nota_cualitativa';
    v_alumno_id := (v_nota ->> 'alumno_id')::UUID;

    IF v_alumno_id IS NULL THEN
      RAISE EXCEPTION 'Cada nota debe incluir un alumno_id válido'
        USING HINT = 'Verifica que el objeto JSON incluya el campo alumno_id';
    END IF;

    IF v_nota_val IS NULL OR v_nota_val NOT IN ('bien', 'regular', 'mal') THEN
      RAISE EXCEPTION 'Nota no válida para alumno %: "%". Debe ser bien, regular o mal',
        v_alumno_id, COALESCE(v_nota_val, 'NULL')
        USING HINT = 'Usa solo los valores: bien, regular, mal';
    END IF;
  END LOOP;

  -- Insert parent session
  INSERT INTO public.indicator_sessions (maestro_id, clase_id, objetivo_id, fecha)
  VALUES (v_maestro_id, p_clase_id, p_objetivo_id, p_fecha)
  RETURNING id INTO v_session_id;

  -- Insert child student notes
  INSERT INTO public.indicator_session_students (indicator_session_id, alumno_id, nota_cualitativa)
  SELECT
    v_session_id,
    (v_nota ->> 'alumno_id')::UUID,
    v_nota ->> 'nota_cualitativa'
  FROM jsonb_array_elements(p_notas) AS v_nota;

  RETURN v_session_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.registrar_sesion_bitacora(UUID, UUID, DATE, JSONB) TO authenticated;

COMMENT ON FUNCTION public.registrar_sesion_bitacora IS
  'Atomically inserts an indicator_sessions row and all indicator_session_students rows.
   Validates: non-empty notas, no future date, valid nota values, non-null alumno_id.
   Returns the new session UUID.';

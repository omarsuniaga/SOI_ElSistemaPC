-- =============================================================================
-- Migration: Bitácora de Cualificación de Contenidos — Schema Delta
-- Date: 2026-06-15
-- Change: bitacora-cualificacion-contenidos (PR-1: T1, T2, T3)
-- =============================================================================
--
-- PURPOSE
-- -------
-- Transform indicator_sessions + indicator_session_students from the original
-- árbol-B design (nodes / route_versions FK) into the new bitácora design
-- anchored to ruta_contenido_objetivos (árbol A).
--
-- PREREQUISITES
-- -------------
-- • maestro_actual()       — defined in 20260518_rls_strict_membership.sql ✓
-- • maestro_en_clase(uuid) — defined in 20260518_rls_strict_membership.sql ✓
-- • ruta_contenido_objetivos — defined in 20260530_create_rutas_contenido.sql ✓
-- • indicator_sessions         — defined in 20260604000001_indicator_sessions.sql ✓
-- • indicator_session_students — defined in 20260604000002_indicator_session_students.sql ✓
--
-- SAFETY
-- ------
-- indicator_sessions confirmed EMPTY (no production data) at spec phase.
-- All schema changes are safe to apply directly.
--
-- ORDERING INVARIANTS
-- -------------------
-- 1. Policy drops before column drops (policies reference columns).
-- 2. FK constraint drops before column drops.
-- 3. Column additions before new FK/UNIQUE constraint additions.
-- 4. Schema changes on indicator_sessions before indicator_session_students.
-- 5. View + RPC created after all schema changes.
--
-- ACCEPTANCE SCENARIOS COVERED
-- ----------------------------
-- SC1: Happy path register 3 students, view reflects semaforo counts.
-- SC2: RLS cross-class read denied (teacher can only see own sessions).
-- SC3: registrar_sesion_bitacora rejects future date.
-- SC4: registrar_sesion_bitacora rejects empty notas array.
-- SC5: registrar_sesion_bitacora rejects invalid nota_cualitativa value.
-- SC6: getObjetivosClase returns ordered array (view exposes objetivo_id).
-- SC7: Untaught objective returns zero rows from v_semaforo_contenidos.
-- =============================================================================


-- =============================================================================
-- STEP 1: DROP LEGACY RLS POLICIES (before altering columns they reference)
-- =============================================================================

-- indicator_sessions legacy policies (use raw auth.uid() subqueries)
DROP POLICY IF EXISTS "maestros_can_view_own_indicator_sessions"   ON public.indicator_sessions;
DROP POLICY IF EXISTS "maestros_can_insert_indicator_sessions"     ON public.indicator_sessions;
DROP POLICY IF EXISTS "maestros_can_update_own_indicator_sessions" ON public.indicator_sessions;

-- indicator_session_students legacy policies
DROP POLICY IF EXISTS "users_can_view_session_students"   ON public.indicator_session_students;
DROP POLICY IF EXISTS "users_can_insert_session_students" ON public.indicator_session_students;


-- =============================================================================
-- STEP 2: ALTER indicator_sessions — drop legacy columns + constraints
-- =============================================================================

-- 2a. Drop FK constraints before dropping their columns.
--     Use IF EXISTS so replay is idempotent.
ALTER TABLE public.indicator_sessions
  DROP CONSTRAINT IF EXISTS indicator_sessions_route_version_id_fkey,
  DROP CONSTRAINT IF EXISTS indicator_sessions_node_id_fkey;

-- 2b. Drop legacy check constraints that referenced those columns.
ALTER TABLE public.indicator_sessions
  DROP CONSTRAINT IF EXISTS valid_node_route,
  DROP CONSTRAINT IF EXISTS valid_maestro_route;

-- 2c. Drop the legacy columns.
ALTER TABLE public.indicator_sessions
  DROP COLUMN IF EXISTS route_version_id,
  DROP COLUMN IF EXISTS node_id,
  DROP COLUMN IF EXISTS calificacion;

-- 2d. Enforce clase_id NOT NULL (table is empty; safe ALTER).
ALTER TABLE public.indicator_sessions
  ALTER COLUMN clase_id SET NOT NULL;

-- Restore the FK that was originally SET NULL — now it must CASCADE or RESTRICT.
-- The original DDL has ON DELETE SET NULL which conflicts with NOT NULL.
-- We replace it: drop the existing FK and add a new one with RESTRICT.
ALTER TABLE public.indicator_sessions
  DROP CONSTRAINT IF EXISTS indicator_sessions_clase_id_fkey;

ALTER TABLE public.indicator_sessions
  ADD CONSTRAINT indicator_sessions_clase_id_fkey
    FOREIGN KEY (clase_id) REFERENCES public.clases(id) ON DELETE RESTRICT;

-- 2e. Add objetivo_id — the new árbol-A FK.
--     Step 1: add nullable so replay of a partial run does not fail on NOT NULL.
ALTER TABLE public.indicator_sessions
  ADD COLUMN IF NOT EXISTS objetivo_id UUID
    REFERENCES public.ruta_contenido_objetivos(id) ON DELETE RESTRICT;

--     Step 2: enforce NOT NULL separately — idempotent on replay.
ALTER TABLE public.indicator_sessions
  ALTER COLUMN objetivo_id SET NOT NULL;

-- 2f. Add composite UNIQUE: one session per (class, objective, date, teacher).
--     Drop first so replay is idempotent (ADD CONSTRAINT has no IF NOT EXISTS).
ALTER TABLE public.indicator_sessions
  DROP CONSTRAINT IF EXISTS indicator_sessions_unique_session;

ALTER TABLE public.indicator_sessions
  ADD CONSTRAINT indicator_sessions_unique_session
    UNIQUE (clase_id, objetivo_id, fecha, maestro_id);

-- 2g. Add indices for the new FK columns.
CREATE INDEX IF NOT EXISTS idx_indicator_sessions_clase
  ON public.indicator_sessions(clase_id);

CREATE INDEX IF NOT EXISTS idx_indicator_sessions_objetivo
  ON public.indicator_sessions(objetivo_id);


-- =============================================================================
-- STEP 3: ALTER indicator_session_students — enforce nota_cualitativa NOT NULL
-- =============================================================================

-- The column already has a CHECK constraint. We now enforce NOT NULL because
-- every student row must carry a qualification (spec REQ-1 decision).
ALTER TABLE public.indicator_session_students
  ALTER COLUMN nota_cualitativa SET NOT NULL;


-- =============================================================================
-- STEP 4: ADD NEW RLS POLICIES — indicator_sessions
--
-- Uses maestro_actual() and maestro_en_clase() from 20260518_rls_strict_membership.sql
-- Satisfies REQ-3 and acceptance scenario SC2 (cross-class isolation).
-- =============================================================================

-- SELECT: teacher sees only their own sessions.
CREATE POLICY "bitacora_indicator_sessions_select"
  ON public.indicator_sessions
  FOR SELECT TO authenticated
  USING (maestro_id = public.maestro_actual());

-- INSERT: teacher can insert only for their own identity AND for a class they belong to.
CREATE POLICY "bitacora_indicator_sessions_insert"
  ON public.indicator_sessions
  FOR INSERT TO authenticated
  WITH CHECK (
    maestro_id = public.maestro_actual()
    AND public.maestro_en_clase(clase_id)
  );

-- UPDATE: teacher can update only their own sessions, and only for their classes.
--         WITH CHECK mirrors INSERT: both maestro_id and clase_id must match.
--         This prevents reassigning a session to another maestro (identity hijack).
CREATE POLICY "bitacora_indicator_sessions_update"
  ON public.indicator_sessions
  FOR UPDATE TO authenticated
  USING  (maestro_id = public.maestro_actual())
  WITH CHECK (maestro_id = public.maestro_actual() AND public.maestro_en_clase(clase_id));

-- DELETE: not granted (spec decision — omit policy entirely).


-- =============================================================================
-- STEP 5: ADD NEW RLS POLICIES — indicator_session_students
--
-- A student row is accessible only when the parent session belongs to the
-- current teacher. There is no direct teacher reference on this table, so we
-- gate through a subquery into indicator_sessions.
-- =============================================================================

-- SELECT
CREATE POLICY "bitacora_session_students_select"
  ON public.indicator_session_students
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.indicator_sessions s
      WHERE s.id = indicator_session_students.indicator_session_id
        AND s.maestro_id = public.maestro_actual()
    )
  );

-- INSERT
CREATE POLICY "bitacora_session_students_insert"
  ON public.indicator_session_students
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.indicator_sessions s
      WHERE s.id = indicator_session_id
        AND s.maestro_id = public.maestro_actual()
    )
  );

-- UPDATE / DELETE: not granted.


-- =============================================================================
-- STEP 6: CREATE VIEW v_semaforo_contenidos
--
-- Aggregates per (alumno_id, clase_id, objetivo_id).
-- Traffic-light thresholds (CONFIRMED product decision):
--   gris   : total_registros = 0   (no sessions for this student+objective)
--   rojo   : mal_count / total > 0.50
--   verde  : bien_count / total >= 0.70
--   naranja: all other cases
--
-- SECURITY INVOKER: the view runs with the privileges of the calling user,
-- so RLS on indicator_sessions and indicator_session_students is enforced.
-- The authenticated role receives SELECT (required for Supabase anon/auth flow).
--
-- SC7: untaught objectives produce ZERO rows (no LEFT JOIN against objectives).
-- The UI defaults to gris when no row is found for an objective. If product
-- later requires explicit gris rows for all objectives, a LEFT JOIN against
-- ruta_contenido_objetivos must be added — FLAG for product review.
-- =============================================================================

CREATE OR REPLACE VIEW public.v_semaforo_contenidos
  WITH (security_invoker = true)
AS
SELECT
  iss.alumno_id,
  s.clase_id,
  s.objetivo_id,
  COUNT(iss.id)::BIGINT                                          AS total_registros,
  COUNT(iss.id) FILTER (WHERE iss.nota_cualitativa = 'bien')::BIGINT    AS bien_count,
  COUNT(iss.id) FILTER (WHERE iss.nota_cualitativa = 'regular')::BIGINT AS regular_count,
  COUNT(iss.id) FILTER (WHERE iss.nota_cualitativa = 'mal')::BIGINT     AS mal_count,
  CASE
    -- gris (no records) is represented by the ABSENCE of a row; UI treats missing objetivo as gris.
    -- The INNER JOIN means COUNT(iss.id) = 0 is unreachable here; branch removed.
    -- rojo takes precedence over verde when both thresholds are met (conservative).
    WHEN COUNT(iss.id) FILTER (WHERE iss.nota_cualitativa = 'mal')::NUMERIC
         / COUNT(iss.id)::NUMERIC > 0.50
      THEN 'rojo'
    WHEN COUNT(iss.id) FILTER (WHERE iss.nota_cualitativa = 'bien')::NUMERIC
         / COUNT(iss.id)::NUMERIC >= 0.70
      THEN 'verde'
    ELSE
      'naranja'
  END::TEXT                                                      AS semaforo
FROM public.indicator_sessions         s
JOIN public.indicator_session_students iss
  ON iss.indicator_session_id = s.id
GROUP BY
  iss.alumno_id,
  s.clase_id,
  s.objetivo_id;

-- Grant SELECT to authenticated role (required for Supabase JS client queries).
GRANT SELECT ON public.v_semaforo_contenidos TO authenticated;


-- =============================================================================
-- STEP 7: CREATE RPC registrar_sesion_bitacora
--
-- Atomically inserts one indicator_sessions parent row + N
-- indicator_session_students child rows from a JSONB notas array.
--
-- Validation (all enforced BEFORE any INSERT):
--   V1: p_clase_id IS NOT NULL
--   V2: p_objetivo_id IS NOT NULL
--   V3: p_fecha IS NOT NULL AND p_fecha <= CURRENT_DATE (no future dates)
--   V4: jsonb_array_length(p_notas) >= 1 (at least one student)
--   V5: every nota_cualitativa IN ('bien','regular','mal')
--
-- On any exception the transaction rolls back atomically (EXCEPTION block).
--
-- Satisfies REQ-4 and acceptance scenarios SC3, SC4, SC5.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.registrar_sesion_bitacora(
  p_clase_id    UUID,
  p_objetivo_id UUID,
  p_fecha       DATE,
  p_notas       JSONB   -- array of {alumno_id: UUID, nota_cualitativa: text}
)
RETURNS UUID   -- returns the new indicator_sessions.id
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  v_session_id  UUID;
  v_nota        JSONB;
  v_nota_val    TEXT;
  v_alumno_id   UUID;
BEGIN
  -- W4: current user must be a registered maestro
  IF public.maestro_actual() IS NULL THEN
    RAISE EXCEPTION 'Current user is not registered as a maestro';
  END IF;

  -- V1: clase_id required
  IF p_clase_id IS NULL THEN
    RAISE EXCEPTION 'clase_id is required';
  END IF;

  -- V2: objetivo_id required
  IF p_objetivo_id IS NULL THEN
    RAISE EXCEPTION 'objetivo_id is required';
  END IF;

  -- V3: fecha required and must not be in the future
  IF p_fecha IS NULL THEN
    RAISE EXCEPTION 'fecha is required';
  END IF;
  IF p_fecha > CURRENT_DATE THEN
    RAISE EXCEPTION 'fecha cannot be in the future: %', p_fecha;
  END IF;

  -- V4: at least one student
  IF p_notas IS NULL OR jsonb_array_length(p_notas) < 1 THEN
    RAISE EXCEPTION 'notas array must contain at least one entry';
  END IF;

  -- V5: validate each nota entry — alumno_id and nota_cualitativa both required
  FOR v_nota IN SELECT jsonb_array_elements(p_notas)
  LOOP
    v_nota_val := v_nota->>'nota_cualitativa';
    IF v_nota_val IS NULL OR v_nota_val NOT IN ('bien', 'regular', 'mal') THEN
      RAISE EXCEPTION 'Invalid nota_cualitativa value: %. Must be one of: bien, regular, mal', v_nota_val;
    END IF;
    IF (v_nota->>'alumno_id') IS NULL THEN
      RAISE EXCEPTION 'alumno_id is required in every notas entry';
    END IF;
  END LOOP;

  -- INSERT parent session row (RLS enforced: maestro_actual() + maestro_en_clase)
  INSERT INTO public.indicator_sessions (
    maestro_id,
    clase_id,
    objetivo_id,
    fecha
  )
  VALUES (
    public.maestro_actual(),
    p_clase_id,
    p_objetivo_id,
    p_fecha
  )
  RETURNING id INTO v_session_id;

  -- INSERT child rows — one per student
  FOR v_nota IN SELECT jsonb_array_elements(p_notas)
  LOOP
    v_alumno_id := (v_nota->>'alumno_id')::UUID;
    v_nota_val  := v_nota->>'nota_cualitativa';

    INSERT INTO public.indicator_session_students (
      indicator_session_id,
      alumno_id,
      nota_cualitativa
    )
    VALUES (
      v_session_id,
      v_alumno_id,
      v_nota_val
    );
  END LOOP;

  RETURN v_session_id;

EXCEPTION
  WHEN OTHERS THEN
    -- Re-raise so Postgres rolls back the entire transaction atomically.
    RAISE;
END;
$$;

-- Grant EXECUTE to authenticated role.
GRANT EXECUTE ON FUNCTION public.registrar_sesion_bitacora(UUID, UUID, DATE, JSONB)
  TO authenticated;

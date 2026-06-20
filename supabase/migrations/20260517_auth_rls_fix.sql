-- ============================================================================
-- MIGRATION: 20260517_auth_rls_fix.sql
-- Fix auth chain: auth.users → profiles → maestros
-- Adds trigger for auto-creating maestros, fixes RLS policies,
-- adds estado check to all teacher-owned tables.
-- ============================================================================

-- ============================================================================
-- STEP 1: Helper function public.user_profile()
-- Returns the full profile row for the current authenticated user.
-- Used by RLS policies to check estado and rol.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.user_profile()
RETURNS RECORD AS $$
  SELECT * FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

COMMENT ON FUNCTION public.user_profile() IS 'Returns the profile row for the authenticated user. Used by RLS policies.';

-- ============================================================================
-- STEP 2: Fix public.get_user_role() — use 'rol' instead of 'role'
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT rol::TEXT FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

COMMENT ON FUNCTION public.get_user_role() IS 'Returns the role of the current authenticated user from profiles.rol';

-- ============================================================================
-- STEP 3: Fix public.is_admin() and public.is_teacher()
-- These now use get_user_role() which references the correct column.
-- is_teacher() now checks for 'maestro' instead of 'teacher'.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT public.get_user_role() IN ('admin', 'superadmin');
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

COMMENT ON FUNCTION public.is_admin() IS 'Returns true if the current user has admin or superadmin role';

CREATE OR REPLACE FUNCTION public.is_teacher()
RETURNS BOOLEAN AS $$
  SELECT public.get_user_role() = 'maestro';
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

COMMENT ON FUNCTION public.is_teacher() IS 'Returns true if the current user has maestro role';

-- ============================================================================
-- STEP 4: Trigger on_profile_insert_maestro
-- AFTER INSERT ON profiles, WHEN NEW.rol = 'maestro'
-- Automatically creates a maestros row with user_id pointing to profiles.id
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_profile_insert_maestro()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.rol = 'maestro' THEN
    INSERT INTO public.maestros (user_id, nombre_completo, correo, activo)
    VALUES (NEW.id, NEW.nombre_completo, NEW.email, true)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.handle_profile_insert_maestro()
IS 'Trigger function: when a profile with rol=maestro is inserted, auto-create a maestros row';

-- Drop existing trigger if any (safe re-run)
DROP TRIGGER IF EXISTS on_profile_insert_maestro ON public.profiles;

-- Create the trigger
CREATE TRIGGER on_profile_insert_maestro
  AFTER INSERT ON public.profiles
  FOR EACH ROW WHEN (NEW.rol = 'maestro')
  EXECUTE FUNCTION public.handle_profile_insert_maestro();

COMMENT ON TRIGGER on_profile_insert_maestro ON public.profiles
IS 'Auto-creates maestros row when a profile with rol=maestro is inserted';

-- ============================================================================
-- STEP 4b: Deprecate old trigger 20260513_auto_create_profile_for_maestro.sql
-- The old trigger created profiles FROM maestros (reverse direction).
-- With the new trigger, the direction is profiles → maestros (correct).
-- The old trigger file is kept for history but marked as deprecated.
-- Drop the old trigger function and trigger if they exist.
-- ============================================================================
DROP TRIGGER IF EXISTS trigger_auto_profile_maestro ON public.maestros;
DROP FUNCTION IF EXISTS public.create_profile_for_maestro();

-- ============================================================================
-- STEP 5: Backfill maestros.user_id for existing records
-- Maps maestros.correo to auth.users.email to populate user_id.
-- Records without a matching auth user remain NULL.
-- ============================================================================
UPDATE public.maestros m
SET user_id = au.id
FROM auth.users au
WHERE m.correo = au.email
  AND m.user_id IS NULL;

-- Log count of remaining NULL user_ids (for admin awareness)
DO $$
DECLARE
  null_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO null_count
  FROM public.maestros
  WHERE user_id IS NULL;

  IF null_count > 0 THEN
    RAISE NOTICE 'Backfill complete. % maestro(s) still have user_id IS NULL (no matching auth.users email found).', null_count;
  ELSE
    RAISE NOTICE 'Backfill complete. All maestros have user_id populated.';
  END IF;
END $$;

-- ============================================================================
-- STEP 6: Fix RLS policies in 004_rls_policies.sql
-- Rename tables from legacy names to actual names:
--   students → alumnos
--   progresos_academicos → progresos
--   observaciones → observaciones_sesion
-- ============================================================================

-- ---- Fix students → alumnos policies ----

-- Students public read
DROP POLICY IF EXISTS students_public_read ON public.alumnos;
CREATE POLICY students_public_read ON public.alumnos
  FOR SELECT USING (true);

-- Students admin write
DROP POLICY IF EXISTS students_admin_write ON public.alumnos;
CREATE POLICY students_admin_write ON public.alumnos
  FOR ALL USING ((SELECT public.is_admin()) = true);

-- ---- Fix progresos_academicos → progresos policies ----

-- Progresos admin all
DROP POLICY IF EXISTS progresos_admin_all ON public.progresos;
CREATE POLICY progresos_admin_all ON public.progresos
  FOR ALL USING ((SELECT public.is_admin()) = true);

-- Progresos teacher access
DROP POLICY IF EXISTS progresos_teacher_access ON public.progresos;
CREATE POLICY progresos_teacher_access ON public.progresos
  FOR ALL USING (
    (SELECT public.is_teacher()) = true OR
    (SELECT public.is_admin()) = true
  );

-- Progresos student read (with updated subquery references)
DROP POLICY IF EXISTS progresos_student_read ON public.progresos;
CREATE POLICY progresos_student_read ON public.progresos
  FOR SELECT USING (
    (SELECT public.is_teacher()) = true OR
    (SELECT public.is_admin()) = true OR
    -- Alumno puede ver su propio progreso
    EXISTS (
      SELECT 1 FROM public.alumnos s
      WHERE s.id = progresos.alumno_id
      AND s.correo_representante = auth.jwt()->>'email'
    )
  );

-- ---- Fix observaciones → observaciones_sesion policies ----

-- Observaciones admin all
DROP POLICY IF EXISTS observaciones_admin_all ON public.observaciones_sesion;
CREATE POLICY observaciones_admin_all ON public.observaciones_sesion
  FOR ALL USING ((SELECT public.is_admin()) = true);

-- Observaciones teacher access
DROP POLICY IF EXISTS observaciones_teacher_access ON public.observaciones_sesion;
CREATE POLICY observaciones_teacher_access ON public.observaciones_sesion
  FOR ALL USING (
    (SELECT public.is_teacher()) = true OR
    (SELECT public.is_admin()) = true
  );

-- Observaciones teacher read
DROP POLICY IF EXISTS observaciones_teacher_read ON public.observaciones_sesion;
CREATE POLICY observaciones_teacher_read ON public.observaciones_sesion
  FOR SELECT USING (
    (SELECT public.is_teacher()) = true OR
    (SELECT public.is_admin()) = true
  );

-- ============================================================================
-- STEP 7: Fix class_sessions RLS — subquery via maestros.user_id
-- class_sessions uses maestro_id which points to maestros.id, NOT auth.uid()
-- Fix: maestro_id IN (SELECT id FROM maestros WHERE user_id = auth.uid())
-- Also handle the table name if it exists as sesiones_clase in 007_academic_route_rls.sql
-- ============================================================================

-- Fix policy on class_sessions (English naming from academic route module)
DROP POLICY IF EXISTS teacher_manage_sessions ON public.class_sessions;
CREATE POLICY teacher_manage_sessions ON public.class_sessions FOR ALL TO authenticated
USING (maestro_id IN (SELECT id FROM public.maestros WHERE user_id = auth.uid()))
WITH CHECK (maestro_id IN (SELECT id FROM public.maestros WHERE user_id = auth.uid()));

-- Fix policy on class_session_content_snapshots (subquery depends on class_sessions)
DROP POLICY IF EXISTS teacher_manage_snapshots ON public.class_session_content_snapshots;
CREATE POLICY teacher_manage_snapshots ON public.class_session_content_snapshots FOR ALL TO authenticated
USING (session_id IN (SELECT id FROM public.class_sessions WHERE maestro_id IN (SELECT id FROM public.maestros WHERE user_id = auth.uid())));

-- Fix policy on attendance_records (subquery depends on class_sessions)
DROP POLICY IF EXISTS teacher_manage_attendance ON public.attendance_records FOR ALL TO authenticated
USING (session_id IN (SELECT id FROM public.class_sessions WHERE maestro_id IN (SELECT id FROM public.maestros WHERE user_id = auth.uid())));

-- Also fix sesiones_clase (Spanish naming from original schema) if policies exist
DROP POLICY IF EXISTS teacher_manage_sesiones ON public.sesiones_clase;
CREATE POLICY teacher_manage_sesiones ON public.sesiones_clase FOR ALL TO authenticated
USING (maestro_id IN (SELECT id FROM public.maestros WHERE user_id = auth.uid()))
WITH CHECK (maestro_id IN (SELECT id FROM public.maestros WHERE user_id = auth.uid()));

-- ============================================================================
-- STEP 8: New RLS policy — check profiles.estado = 'activo'
-- All teacher-owned tables must verify the user's profile is active.
-- Admin bypass via is_admin().
-- ============================================================================

-- Helper function to check if the current user's profile is active
CREATE OR REPLACE FUNCTION public.profile_is_active()
RETURNS BOOLEAN AS $$
  SELECT COALESCE(
    (SELECT estado = 'activo' FROM public.profiles WHERE id = auth.uid()),
    false
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

COMMENT ON FUNCTION public.profile_is_active()
IS 'Returns true if the current user has estado = activo in profiles';

-- Apply estado check to ALL existing teacher-facing policies
-- We do this by altering or recreating key policies for tables
-- where teachers need access.

-- sesiones_clase: teacher policy needs estado = activo
DROP POLICY IF EXISTS teacher_manage_sesiones_estado ON public.sesiones_clase;
CREATE POLICY teacher_manage_sesiones_estado ON public.sesiones_clase FOR ALL TO authenticated
USING (
  (SELECT public.is_admin()) = true OR
  (
    (SELECT public.profile_is_active()) = true
    AND maestro_id IN (SELECT id FROM public.maestros WHERE user_id = auth.uid())
  )
)
WITH CHECK (
  (SELECT public.is_admin()) = true OR
  (
    (SELECT public.profile_is_active()) = true
    AND maestro_id IN (SELECT id FROM public.maestros WHERE user_id = auth.uid())
  )
);

-- class_sessions: add estado check
DROP POLICY IF EXISTS teacher_manage_sessions_estado ON public.class_sessions;
CREATE POLICY teacher_manage_sessions_estado ON public.class_sessions FOR ALL TO authenticated
USING (
  (SELECT public.is_admin()) = true OR
  (
    (SELECT public.profile_is_active()) = true
    AND maestro_id IN (SELECT id FROM public.maestros WHERE user_id = auth.uid())
  )
)
WITH CHECK (
  (SELECT public.is_admin()) = true OR
  (
    (SELECT public.profile_is_active()) = true
    AND maestro_id IN (SELECT id FROM public.maestros WHERE user_id = auth.uid())
  )
);

-- progresos: teacher access requires estado = activo
DROP POLICY IF EXISTS progresos_teacher_access_estado ON public.progresos;
CREATE POLICY progresos_teacher_access_estado ON public.progresos
  FOR ALL USING (
    (SELECT public.is_admin()) = true OR
    ((SELECT public.profile_is_active()) = true AND (SELECT public.is_teacher()) = true)
  );

-- observaciones_sesion: teacher access requires estado = activo
DROP POLICY IF EXISTS observaciones_teacher_access_estado ON public.observaciones_sesion;
CREATE POLICY observaciones_teacher_access_estado ON public.observaciones_sesion
  FOR ALL USING (
    (SELECT public.is_admin()) = true OR
    ((SELECT public.profile_is_active()) = true AND (SELECT public.is_teacher()) = true)
  );

-- planificaciones: teacher access requires estado = activo
DROP POLICY IF EXISTS planificaciones_teacher_access_estado ON public.planificaciones;
CREATE POLICY planificaciones_teacher_access_estado ON public.planificaciones
  FOR ALL USING (
    (SELECT public.is_admin()) = true OR
    ((SELECT public.profile_is_active()) = true AND (SELECT public.is_teacher()) = true)
  );

-- attendance_records: teacher access requires estado = activo
DROP POLICY IF EXISTS teacher_manage_attendance_estado ON public.attendance_records;
CREATE POLICY teacher_manage_attendance_estado ON public.attendance_records FOR ALL TO authenticated
USING (
  (SELECT public.is_admin()) = true OR
  (
    (SELECT public.profile_is_active()) = true
    AND session_id IN (SELECT id FROM public.class_sessions WHERE maestro_id IN (SELECT id FROM public.maestros WHERE user_id = auth.uid()))
  )
);

-- class_session_content_snapshots: teacher access requires estado = activo
DROP POLICY IF EXISTS teacher_manage_snapshots_estado ON public.class_session_content_snapshots;
CREATE POLICY teacher_manage_snapshots_estado ON public.class_session_content_snapshots FOR ALL TO authenticated
USING (
  (SELECT public.is_admin()) = true OR
  (
    (SELECT public.profile_is_active()) = true
    AND session_id IN (SELECT id FROM public.class_sessions WHERE maestro_id IN (SELECT id FROM public.maestros WHERE user_id = auth.uid()))
  )
);

-- academic_plans: teacher read requires estado = activo
DROP POLICY IF EXISTS teacher_read_plans_estado ON public.academic_plans;
CREATE POLICY teacher_read_plans_estado ON public.academic_plans FOR SELECT TO authenticated
USING (
  (SELECT public.is_admin()) = true OR
  ((SELECT public.profile_is_active()) = true)
);

-- indicator_attempts: teacher insert/read requires estado = activo
DROP POLICY IF EXISTS teacher_insert_attempts_estado ON public.indicator_attempts;
CREATE POLICY teacher_insert_attempts_estado ON public.indicator_attempts FOR INSERT TO authenticated
WITH CHECK (
  (SELECT public.is_admin()) = true OR
  ((SELECT public.profile_is_active()) = true)
);

DROP POLICY IF EXISTS teacher_read_attempts_estado ON public.indicator_attempts;
CREATE POLICY teacher_read_attempts_estado ON public.indicator_attempts FOR SELECT TO authenticated
USING (
  (SELECT public.is_admin()) = true OR
  ((SELECT public.profile_is_active()) = true)
);

-- ============================================================================
-- FINAL: Mark old trigger file as deprecated (comment-safe reference)
-- The file 20260513_auto_create_profile_for_maestro.sql is now deprecated.
-- Its logic was reversed (maestros → profiles).
-- The NEW correct flow is: auth.users → profiles → maestros
-- ============================================================================

-- ============================================================================
-- VERIFICATION
-- ============================================================================

SELECT 'Auth RLS Fix migration applied successfully' AS status;

-- List all updated policies
SELECT
  tablename,
  policyname,
  cmd,
  permissive
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================

-- ============================================================================
-- Migration: 20260804150000_fix_alumnos_write_rls
-- Objetivo: habilitar escrituras reales sobre `alumnos` y `alumnos_clases`
-- para admins y maestros autorizados.
--
-- Root cause verificado en código:
-- - el flujo `crearAlumno()` inserta directo en `public.alumnos`
-- - la cadena de migraciones local no define una política explícita y estable
--   de INSERT para maestros con `alumnos:create`
-- - el alta opcional con inscripción también requiere políticas de escritura en
--   `public.alumnos_clases`
-- ============================================================================

-- --------------------------------------------------------------------------
-- 1. Helper local para no repetir la condición
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.teacher_can_create_students()
RETURNS boolean AS $$
  SELECT
    (SELECT public.profile_is_active()) = true
    AND (SELECT public.is_teacher()) = true
    AND public.tiene_permiso('alumnos:create');
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

COMMENT ON FUNCTION public.teacher_can_create_students()
IS 'Returns true when the authenticated maestro is active and has alumnos:create permission.';

GRANT EXECUTE ON FUNCTION public.teacher_can_create_students() TO authenticated;

-- --------------------------------------------------------------------------
-- 2. Escritura sobre alumnos
-- --------------------------------------------------------------------------
DROP POLICY IF EXISTS students_admin_write ON public.alumnos;
DROP POLICY IF EXISTS alumnos_admin_insert ON public.alumnos;
DROP POLICY IF EXISTS alumnos_admin_update ON public.alumnos;
DROP POLICY IF EXISTS alumnos_admin_delete ON public.alumnos;
DROP POLICY IF EXISTS alumnos_teacher_insert ON public.alumnos;

CREATE POLICY alumnos_admin_insert ON public.alumnos
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT public.is_admin()) = true);

CREATE POLICY alumnos_admin_update ON public.alumnos
  FOR UPDATE TO authenticated
  USING ((SELECT public.is_admin()) = true)
  WITH CHECK ((SELECT public.is_admin()) = true);

CREATE POLICY alumnos_admin_delete ON public.alumnos
  FOR DELETE TO authenticated
  USING ((SELECT public.is_admin()) = true);

CREATE POLICY alumnos_teacher_insert ON public.alumnos
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT public.teacher_can_create_students()) = true);

-- --------------------------------------------------------------------------
-- 3. Escritura sobre alumnos_clases (inscripción opcional)
-- --------------------------------------------------------------------------
DROP POLICY IF EXISTS alumnos_clases_insert ON public.alumnos_clases;
DROP POLICY IF EXISTS alumnos_clases_update ON public.alumnos_clases;
DROP POLICY IF EXISTS alumnos_clases_delete ON public.alumnos_clases;

CREATE POLICY alumnos_clases_insert ON public.alumnos_clases
  FOR INSERT TO authenticated
  WITH CHECK (
    (SELECT public.is_admin()) = true
    OR (
      (SELECT public.profile_is_active()) = true
      AND (
        (SELECT public.is_teacher()) = true
        AND public.tiene_permiso('clases:enroll')
        AND public.maestro_en_clase(clase_id)
      )
    )
  );

CREATE POLICY alumnos_clases_update ON public.alumnos_clases
  FOR UPDATE TO authenticated
  USING (
    (SELECT public.is_admin()) = true
    OR (
      (SELECT public.profile_is_active()) = true
      AND (
        (SELECT public.is_teacher()) = true
        AND public.tiene_permiso('clases:enroll')
        AND public.maestro_en_clase(clase_id)
      )
    )
  )
  WITH CHECK (
    (SELECT public.is_admin()) = true
    OR (
      (SELECT public.profile_is_active()) = true
      AND (
        (SELECT public.is_teacher()) = true
        AND public.tiene_permiso('clases:enroll')
        AND public.maestro_en_clase(clase_id)
      )
    )
  );

CREATE POLICY alumnos_clases_delete ON public.alumnos_clases
  FOR DELETE TO authenticated
  USING (
    (SELECT public.is_admin()) = true
    OR (
      (SELECT public.profile_is_active()) = true
      AND (
        (SELECT public.is_teacher()) = true
        AND public.tiene_permiso('clases:enroll')
        AND public.maestro_en_clase(clase_id)
      )
    )
  );

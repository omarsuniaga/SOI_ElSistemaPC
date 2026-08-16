-- ============================================================================
-- MAPA GAMIFICADO DE PLANIFICACIÓN — Coordinador Académico puede redactar
-- Fecha: 2026-08-16
-- Contexto:
--   El usuario pidió que tanto el maestro COMO el coordinador académico
--   puedan redactar unidades/objetivos/indicadores de una clase (no solo
--   curar el catálogo institucional de solo lectura). Hoy las políticas de
--   escritura de clase_mapa_objetivos/clase_mapa_indicadores (migración
--   20260731000001) solo permiten es_admin() o es_maestro_titular_de_clase().
--
-- BUG encontrado y corregido aquí: es_coordinador_acm() (definida en
--   20260731000006_sesion_bitacora.sql) compara contra el rol
--   'coordinador_academico', pero el CHECK constraint real de
--   public.profiles.rol (ver 20260622_audiciones_integration_fixes.sql y
--   20260719_fix_profiles_schema_and_triggers.sql) solo permite el valor
--   'coordinacion_academica'. Con el nombre equivocado, ese rol NUNCA podía
--   asignarse a ningún perfil (la escritura del rol violaría el CHECK) —
--   el helper quedaba fail-closed de forma permanente, no solo "sin filas
--   asignadas aún" como decía el comentario original. Se corrige el string
--   aquí; el comportamiento sigue siendo fail-closed hasta que se asigne
--   el rol 'coordinacion_academica' a algún perfil real.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. FIX: es_coordinador_acm() debe comparar contra el rol real
--    'coordinacion_academica', no 'coordinador_academico'.
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.es_coordinador_acm()
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_role TEXT;
BEGIN
  SELECT p.rol INTO v_role FROM public.profiles p WHERE p.id = auth.uid();
  RETURN COALESCE(v_role IN ('admin', 'coordinacion_academica'), FALSE);
END;
$$;

-- ----------------------------------------------------------------------------
-- 2. Extender las políticas de escritura de la estructura del mapa de clase
--    para incluir al coordinador académico, sin quitarle nada al titular.
--    Se reemplazan las políticas (mismo nombre) en vez de agregar una nueva,
--    para no dejar dos políticas FOR ALL solapadas sobre la misma tabla.
-- ----------------------------------------------------------------------------

DROP POLICY IF EXISTS "clase_mapa_objetivos_owner" ON public.clase_mapa_objetivos;
CREATE POLICY "clase_mapa_objetivos_owner" ON public.clase_mapa_objetivos
  FOR ALL TO authenticated
  USING (public.es_admin() OR public.es_coordinador_acm() OR public.es_maestro_titular_de_clase(clase_id))
  WITH CHECK (public.es_admin() OR public.es_coordinador_acm() OR public.es_maestro_titular_de_clase(clase_id));

DROP POLICY IF EXISTS "clase_mapa_indicadores_owner" ON public.clase_mapa_indicadores;
CREATE POLICY "clase_mapa_indicadores_owner" ON public.clase_mapa_indicadores
  FOR ALL TO authenticated
  USING (public.es_admin() OR public.es_coordinador_acm() OR public.es_maestro_titular_de_clase(clase_id))
  WITH CHECK (public.es_admin() OR public.es_coordinador_acm() OR public.es_maestro_titular_de_clase(clase_id));

-- ============================================================================
-- DOWN
-- ============================================================================
-- DROP POLICY IF EXISTS "clase_mapa_indicadores_owner" ON public.clase_mapa_indicadores;
-- CREATE POLICY "clase_mapa_indicadores_owner" ON public.clase_mapa_indicadores
--   FOR ALL TO authenticated
--   USING (public.es_admin() OR public.es_maestro_titular_de_clase(clase_id))
--   WITH CHECK (public.es_admin() OR public.es_maestro_titular_de_clase(clase_id));
-- DROP POLICY IF EXISTS "clase_mapa_objetivos_owner" ON public.clase_mapa_objetivos;
-- CREATE POLICY "clase_mapa_objetivos_owner" ON public.clase_mapa_objetivos
--   FOR ALL TO authenticated
--   USING (public.es_admin() OR public.es_maestro_titular_de_clase(clase_id))
--   WITH CHECK (public.es_admin() OR public.es_maestro_titular_de_clase(clase_id));
-- (es_coordinador_acm() se deja con el fix aplicado; revertir el string
--  requeriría volver a romper el helper a propósito, no se documenta un DOWN
--  para eso)
-- ============================================================================

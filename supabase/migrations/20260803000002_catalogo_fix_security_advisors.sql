-- ============================================================================
-- Fix de advisories de seguridad detectados sobre la migración anterior
-- (20260803000001_catalogo_propio_mapa_gamificado.sql):
--   1. update_catalogo_timestamp() sin search_path fijo (mutable).
--   2. clonar_catalogo_a_clase() ejecutable por anon/PUBLIC — CREATE FUNCTION
--      otorga EXECUTE a PUBLIC por defecto en Postgres si no se revoca
--      explícitamente, incluso habiendo hecho GRANT ... TO authenticated.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_catalogo_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.clonar_catalogo_a_clase(uuid, uuid, uuid[]) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.clonar_catalogo_a_clase(uuid, uuid, uuid[]) FROM anon;
GRANT EXECUTE ON FUNCTION public.clonar_catalogo_a_clase(uuid, uuid, uuid[]) TO authenticated;

-- Rollback de 20261020190000_registros_sesion_cerrar_sesion.sql
-- DESTRUCTIVO: elimina registros_sesion (todas sus filas: evidencia de la bitácora) y la RPC
-- cerrar_sesion. La asistencia, valoraciones y nota original en sesiones_clase NO se tocan.
-- Exportar registros_sesion antes si hay datos que conservar.
BEGIN;

DROP FUNCTION IF EXISTS public.cerrar_sesion(jsonb);
DROP TABLE IF EXISTS public.registros_sesion;

COMMIT;

-- Concede permisos DML a 'authenticated' en tablas académicas base (clases, clase_horarios)
-- La seguridad granular y el aislamiento multi-rol están gobernados estrictamente por las
-- políticas RESTRICTIVE y PERMISSIVE definidas en 20260911020424_f0_security_containment.sql.
-- 'anon' y 'PUBLIC' se mantienen expresamente sin permisos (REVOKE ALL).

BEGIN;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.clases TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clase_horarios TO authenticated;

COMMIT;

-- Decisión institucional: todos los maestros con perfil activo pueden consultar
-- todos los alumnos. Solo se amplían las dos políticas SELECT de alumnos.
-- No se modifican políticas de escritura, matrículas ni acceso anónimo.
BEGIN;
SET LOCAL lock_timeout = '5s';
ALTER POLICY f0_read_allow ON public.alumnos TO authenticated
  USING ((SELECT soi_security.has_role(ARRAY['admin','superadmin','direccion','coordinacion_academica','finanzas','maestro'])));
ALTER POLICY f0_read_scope ON public.alumnos TO authenticated
  USING ((SELECT soi_security.has_role(ARRAY['admin','superadmin','direccion','coordinacion_academica','finanzas','maestro'])));
COMMIT;

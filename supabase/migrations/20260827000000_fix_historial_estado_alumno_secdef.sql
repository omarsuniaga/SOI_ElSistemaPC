-- 20260827000000_fix_historial_estado_alumno_secdef.sql
--
-- Bug: al inactivar / reactivar un alumno desde el portal, el UPDATE de
-- `alumnos.activo` fallaba con:
--   "new row violates row-level security policy for table historial_estado_alumno"
--
-- Causa: el trigger de auditoria `trg_historial_estado_alumno` sobre `alumnos`
-- ejecuta `fn_trigger_historial_estado_alumno()`, que hace INSERT en
-- `historial_estado_alumno`. Esa funcion corria como SECURITY INVOKER, y la
-- tabla `historial_estado_alumno` tiene RLS ON con una unica policy
-- (`historial_admin_read`, solo SELECT) -> sin policy de INSERT -> default deny.
--
-- Fix: los triggers de auditoria/historial deben ser SECURITY DEFINER para
-- registrar el evento independientemente del RLS del usuario que lo dispara.
-- El owner de la funcion (postgres) salta RLS. No se agregan policies ni se
-- amplia la superficie de escritura de la tabla.
--
-- Aplicado en produccion via Supabase apply_migration el 2026-08-27
-- (migracion remota: fix_historial_estado_alumno_secdef). Este archivo deja
-- el cambio trazado en el repo. Verificado E2E: flip activo false<->true sin
-- error de RLS; historial_estado_alumno registra las bajas/altas.

ALTER FUNCTION public.fn_trigger_historial_estado_alumno()
  SECURITY DEFINER
  SET search_path = public;

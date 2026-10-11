-- Fix: el trigger de auditoria trg_historial_estado_alumno fallaba con
-- "new row violates row-level security policy for table historial_estado_alumno"
-- al inactivar/reactivar un alumno, porque fn_trigger_historial_estado_alumno()
-- corria como SECURITY INVOKER y la tabla historial_estado_alumno tiene RLS ON
-- sin policy de INSERT (default deny). Los triggers de auditoria deben ser
-- SECURITY DEFINER para registrar el evento independientemente del RLS del caller.
ALTER FUNCTION public.fn_trigger_historial_estado_alumno()
  SECURITY DEFINER
  SET search_path = public;
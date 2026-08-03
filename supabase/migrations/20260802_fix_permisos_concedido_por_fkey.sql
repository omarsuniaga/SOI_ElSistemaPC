-- ============================================================================
-- Fix: permisos_maestros.concedido_por / solicitudes_permisos.aprobado_por
-- referenciaban maestros(id), pero ambos campos siempre los llena un ADMIN
-- (auth.users), nunca un maestro — el trigger de integridad en
-- permisos_maestros fuerza esas columnas a NULL/OLD para cualquier escritura
-- que no venga de un admin. El FK a maestros(id) provocaba que todo
-- otorgamiento/aprobación hecho por un admin fallara con foreign key violation.
-- ============================================================================

ALTER TABLE public.permisos_maestros
  DROP CONSTRAINT permisos_maestros_concedido_por_fkey;

ALTER TABLE public.permisos_maestros
  ADD CONSTRAINT permisos_maestros_concedido_por_fkey
  FOREIGN KEY (concedido_por) REFERENCES auth.users(id);

ALTER TABLE public.solicitudes_permisos
  DROP CONSTRAINT solicitudes_permisos_aprobado_por_fkey;

ALTER TABLE public.solicitudes_permisos
  ADD CONSTRAINT solicitudes_permisos_aprobado_por_fkey
  FOREIGN KEY (aprobado_por) REFERENCES auth.users(id);

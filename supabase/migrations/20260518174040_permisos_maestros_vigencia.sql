-- Migration: permisos_maestros_vigencia
-- Adds temporal validity columns to permisos_maestros table.
-- PR-A foundation for expiry enforcement in JS service layer (ADR-1).

-- RLS NOTE: The two new columns (fecha_inicio, fecha_fin) inherit the existing
-- table-level RLS policies. No column-level grants needed because the admin
-- write policy already covers full-row upsert via actualizarPermiso().
-- Verify: SELECT grantee, privilege_type FROM information_schema.column_privileges
--         WHERE table_name = 'permisos_maestros';
-- If column-level grants exist, add: GRANT UPDATE(fecha_inicio, fecha_fin)
--   ON public.permisos_maestros TO authenticated;

ALTER TABLE public.permisos_maestros
  ADD COLUMN IF NOT EXISTS fecha_inicio date NOT NULL DEFAULT current_date;

ALTER TABLE public.permisos_maestros
  ADD COLUMN IF NOT EXISTS fecha_fin date NULL;

COMMENT ON COLUMN public.permisos_maestros.fecha_inicio IS
  'Fecha desde la que el permiso está activo. Default: día de creación.';

COMMENT ON COLUMN public.permisos_maestros.fecha_fin IS
  'Fecha de expiración del permiso. NULL = permanente.';

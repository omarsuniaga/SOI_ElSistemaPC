-- Migration: 20260831000001_add_puede_planificar_permisos_maestros.sql
-- Description: Add missing columns puede_planificar and puede_asistir to permisos_maestros

ALTER TABLE public.permisos_maestros
  ADD COLUMN IF NOT EXISTS puede_planificar boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS puede_asistir boolean DEFAULT true;

-- Ensure comment on columns for documentation
COMMENT ON COLUMN public.permisos_maestros.puede_planificar IS 'Permiso del maestro para registrar planificaciones curriculares';
COMMENT ON COLUMN public.permisos_maestros.puede_asistir IS 'Permiso del maestro para pasar lista y registrar asistencias';

-- Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';

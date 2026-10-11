-- Adds the denormalized class-detail columns the ausencias frontend/service expects.
-- Mirrors supabase/migrations/20260519_fix_ausencias_maestros_schema.sql (never tracked/applied).
-- ausencias_maestros currently has 0 rows.

ALTER TABLE public.ausencias_maestros ADD COLUMN IF NOT EXISTS clases_afectadas UUID[];
ALTER TABLE public.ausencias_maestros ADD COLUMN IF NOT EXISTS actividades_por_clase JSONB;
ALTER TABLE public.ausencias_maestros ADD COLUMN IF NOT EXISTS clase_emergente JSONB;

COMMENT ON COLUMN public.ausencias_maestros.clases_afectadas
  IS 'IDs de clases afectadas por la ausencia (denormalizado).';
COMMENT ON COLUMN public.ausencias_maestros.actividades_por_clase
  IS 'Mapa clase_id -> actividad de reemplazo.';
COMMENT ON COLUMN public.ausencias_maestros.clase_emergente
  IS 'Datos de reprogramacion { activo, clase_id, fecha, hora, salon_id } o null.';

NOTIFY pgrst, 'reload schema';
-- Extiende ausencias_maestros para el flujo completo sin duplicar el modelo JSONB existente.
-- Nota: 20260519_fix_ausencias_maestros_schema.sql ya agrega:
-- duracion_tipo, clases_afectadas, actividades_por_clase y clase_emergente.

ALTER TABLE public.ausencias_maestros
  ADD COLUMN IF NOT EXISTS archivo_url TEXT,
  ADD COLUMN IF NOT EXISTS director_notificacion_id UUID REFERENCES public.notificaciones(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS aprobado_por UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS decision_notas TEXT,
  ADD COLUMN IF NOT EXISTS decidido_en TIMESTAMPTZ;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'ausencias_maestros_duracion_tipo_check'
      AND conrelid = 'public.ausencias_maestros'::regclass
  ) THEN
    ALTER TABLE public.ausencias_maestros
      ADD CONSTRAINT ausencias_maestros_duracion_tipo_check
      CHECK (duracion_tipo IS NULL OR duracion_tipo IN ('un_dia', 'varios_dias'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_ausencias_maestros_estado
  ON public.ausencias_maestros(estado);

CREATE INDEX IF NOT EXISTS idx_ausencias_maestros_fechas
  ON public.ausencias_maestros(fecha_inicio, fecha_fin);

COMMENT ON COLUMN public.ausencias_maestros.archivo_url
  IS 'URL pública del documento de soporte subido al bucket documentos.';

COMMENT ON COLUMN public.ausencias_maestros.director_notificacion_id
  IS 'Notificación in-app enviada a dirección/admin para esta solicitud.';

-- Migration: extend_ausencias_schema
-- Extends ausencias_maestros with temporal validity + missing columns for full workflow
-- Adds junction table for affected classes + notification tracking

-- Add missing columns to ausencias_maestros
ALTER TABLE public.ausencias_maestros
  ADD COLUMN IF NOT EXISTS duracion_tipo TEXT DEFAULT 'un_dia'
    CHECK (duracion_tipo IN ('un_dia', 'varios_dias'));

ALTER TABLE public.ausencias_maestros
  ADD COLUMN IF NOT EXISTS archivo_url TEXT;

ALTER TABLE public.ausencias_maestros
  ADD COLUMN IF NOT EXISTS maestro_suplente_id UUID REFERENCES public.maestros(id) ON DELETE SET NULL;

ALTER TABLE public.ausencias_maestros
  ADD COLUMN IF NOT EXISTS notificar_director BOOLEAN DEFAULT true;

-- New table: ausencias_clases_afectadas (junction table for many-to-many)
CREATE TABLE IF NOT EXISTS public.ausencias_clases_afectadas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ausencia_id UUID NOT NULL REFERENCES public.ausencias_maestros(id) ON DELETE CASCADE,
  clase_id UUID NOT NULL REFERENCES public.clases(id) ON DELETE CASCADE,
  actividad_reemplazo TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- New table: ausencias_notificaciones (tracking director notifications)
CREATE TABLE IF NOT EXISTS public.ausencias_notificaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ausencia_id UUID NOT NULL REFERENCES public.ausencias_maestros(id) ON DELETE CASCADE,
  director_id UUID NOT NULL REFERENCES public.maestros(id) ON DELETE CASCADE,
  tipo TEXT DEFAULT 'director_alert' CHECK (tipo IN ('director_alert', 'maestro_confirmacion', 'aprobacion', 'rechazo')),
  estado TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'leida', 'actuado')),
  created_at TIMESTAMPTZ DEFAULT now(),
  leida_en TIMESTAMPTZ,
  actuado_en TIMESTAMPTZ
);

-- Enable RLS on both tables
ALTER TABLE public.ausencias_clases_afectadas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ausencias_notificaciones ENABLE ROW LEVEL SECURITY;

-- RLS policies for ausencias_clases_afectadas
CREATE POLICY "maestro_can_read_own_clase_afectada"
  ON public.ausencias_clases_afectadas
  FOR SELECT
  TO authenticated
  USING (
    ausencia_id IN (
      SELECT id FROM public.ausencias_maestros
      WHERE maestro_id = auth.uid()
    )
    OR
    clase_id IN (
      SELECT id FROM public.clases
      WHERE maestro_principal_id = auth.uid() OR maestro_suplente_id = auth.uid()
    )
  );

CREATE POLICY "maestro_can_insert_own_clase_afectada"
  ON public.ausencias_clases_afectadas
  FOR INSERT
  TO authenticated
  WITH CHECK (
    ausencia_id IN (
      SELECT id FROM public.ausencias_maestros
      WHERE maestro_id = auth.uid()
    )
  );

-- RLS policies for ausencias_notificaciones
CREATE POLICY "director_can_read_own_notifications"
  ON public.ausencias_notificaciones
  FOR SELECT
  TO authenticated
  USING (director_id = auth.uid());

CREATE POLICY "admin_can_insert_notifications"
  ON public.ausencias_notificaciones
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Comments
COMMENT ON TABLE public.ausencias_clases_afectadas IS 'Junction table: tracks which classes are affected by an absence and replacement activities';
COMMENT ON TABLE public.ausencias_notificaciones IS 'Tracks notifications sent to directors about absence requests';
COMMENT ON COLUMN public.ausencias_maestros.duracion_tipo IS 'Duration type: un_dia (single day) or varios_dias (date range)';
COMMENT ON COLUMN public.ausencias_maestros.archivo_url IS 'URL to uploaded supporting document in Supabase Storage';
COMMENT ON COLUMN public.ausencias_maestros.maestro_suplente_id IS 'Substitute teacher assigned to cover the absence';
COMMENT ON COLUMN public.ausencias_maestros.notificar_director IS 'Whether director should be automatically notified';

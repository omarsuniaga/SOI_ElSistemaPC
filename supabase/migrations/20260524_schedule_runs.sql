-- ============================================================================
-- MIGRACIÓN: Motor de Planificación — Tabla schedule_runs
-- ============================================================================
-- Tabla para registrar corridas del motor de scheduling automático (horarios borrador)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.schedule_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  periodo TEXT NOT NULL,                         -- Ex. 'S1-2026', 'S2-2026'
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  config JSONB NOT NULL,                         -- Parámetros de restricciones (gapMinimo, duracionBloque, jornada)
  resultado JSONB NOT NULL,                      -- Lista de asignaciones generadas
  metricas JSONB NOT NULL,                       -- Score, ocupación de salones, carga de maestros
  estado TEXT CHECK (estado IN ('borrador', 'aplicado', 'descartado')) DEFAULT 'borrador',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  applied_at TIMESTAMP WITH TIME ZONE
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_schedule_runs_periodo ON public.schedule_runs(periodo);
CREATE INDEX IF NOT EXISTS idx_schedule_runs_estado ON public.schedule_runs(estado);

-- Comentarios
COMMENT ON TABLE public.schedule_runs IS 'Corrida de propuestas generadas por el motor de scheduling automático';

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE public.schedule_runs ENABLE ROW LEVEL SECURITY;

-- Solo administradores pueden ver corridas de horario
DROP POLICY IF EXISTS schedule_runs_admin_read ON public.schedule_runs;
CREATE POLICY schedule_runs_admin_read ON public.schedule_runs
  FOR SELECT USING (
    (SELECT public.is_admin()) = true
  );

-- Solo administradores pueden insertar/modificar corridas de horario
DROP POLICY IF EXISTS schedule_runs_admin_write ON public.schedule_runs;
CREATE POLICY schedule_runs_admin_write ON public.schedule_runs
  FOR ALL USING (
    (SELECT public.is_admin()) = true
  );

-- Habilitar API
ALTER TABLE public.schedule_runs ENABLE API;

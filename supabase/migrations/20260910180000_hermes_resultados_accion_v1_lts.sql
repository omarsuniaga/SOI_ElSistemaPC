-- ============================================================================
-- Migration: 20260910180000_hermes_resultados_accion_v1_lts.sql
-- Ámbito: Hermes Telemetry Spine — Cierre de Brecha B (SOI v1 LTS)
-- Descripción:
--   Crea la tabla `public.soi_resultados_accion` para cerrar la cadena operativa:
--   Evento Detectado (`soi_eventos`) ──> Acción/Tarea (`tareas_institucionales`)
--                                   └──> Resultado Verificable (`soi_resultados_accion`)
--
--   Permite auditar el impacto real de las acciones disparadas por Hermes
--   (ej. contacto a padres por ausentismo, cobro de mora, mantenimiento de lutería)
--   sin romper el esquema as-is y garantizando trazabilidad completa.
-- ============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS public.soi_resultados_accion (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tarea_id uuid REFERENCES public.tareas_institucionales(id) ON DELETE SET NULL,
  case_id uuid REFERENCES public.hermes_process_cases(id) ON DELETE SET NULL,
  correlation_id uuid NOT NULL DEFAULT gen_random_uuid(),
  tipo_resultado text NOT NULL,
  estado text NOT NULL DEFAULT 'completado'::text,
  descripcion text NOT NULL,
  evidencia_url text,
  metricas_impacto jsonb NOT NULL DEFAULT '{}'::jsonb,
  registrado_por uuid DEFAULT auth.uid(),
  registrado_por_nombre text,
  departamento text NOT NULL DEFAULT 'DIR'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.soi_resultados_accion IS 
  'Auditoría y cierre de ciclo de acciones institucionales Hermes (Evento -> Acción -> Resultado Verificable). Cierra Brecha B.';

-- Habilitar RLS
ALTER TABLE public.soi_resultados_accion ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "soi_resultados_accion_read_auth" ON public.soi_resultados_accion
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "soi_resultados_accion_write_staff" ON public.soi_resultados_accion
  FOR ALL TO authenticated
  USING (
    es_admin() OR 
    (get_user_department() = departamento) OR
    (registrado_por = auth.uid())
  )
  WITH CHECK (
    es_admin() OR 
    (get_user_department() = departamento) OR
    (registrado_por = auth.uid())
  );

CREATE POLICY "soi_resultados_accion_service_role" ON public.soi_resultados_accion
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

REVOKE ALL ON public.soi_resultados_accion FROM anon;
GRANT SELECT, INSERT, UPDATE ON public.soi_resultados_accion TO authenticated;

-- Índices para consultas por correlación y caso
CREATE INDEX IF NOT EXISTS idx_soi_resultados_correlation_id ON public.soi_resultados_accion(correlation_id);
CREATE INDEX IF NOT EXISTS idx_soi_resultados_tarea_id ON public.soi_resultados_accion(tarea_id);
CREATE INDEX IF NOT EXISTS idx_soi_resultados_case_id ON public.soi_resultados_accion(case_id);

COMMIT;

-- ============================================================================
-- Migration: HERMES Pulso Score Engine (0-100) — Phase 4B
-- Timestamp: 20260818000007
-- Project: sistema-academico-pwa (zmhmdvmyeyswunurcyow)
-- Description: Historical tracking table and PL/pgSQL RPC function to compute
--              real-time institutional operational health score (0-100).
-- ============================================================================

-- 1. TABLA: Historial de Pulso Score
CREATE TABLE IF NOT EXISTS public.pulso_score_history (
  id                       uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  score                    numeric(5, 2) NOT NULL,
  nivel                    text          NOT NULL CHECK (nivel IN ('optimo', 'atencion', 'critico')),
  asistencia_pct           numeric(5, 2) NOT NULL DEFAULT 100.00,
  tareas_tiempo_pct        numeric(5, 2) NOT NULL DEFAULT 100.00,
  cobertura_registro_pct   numeric(5, 2) NOT NULL DEFAULT 100.00,
  penalizacion_vencidas_pct numeric(5, 2) NOT NULL DEFAULT 100.00,
  metricas_detalle         jsonb         NOT NULL DEFAULT '{}'::jsonb,
  calculado_at             timestamptz   NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pulso_score_history_calculado
  ON public.pulso_score_history(calculado_at DESC);

-- Habilitar RLS
ALTER TABLE public.pulso_score_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pulso_score_history_auth_select" ON public.pulso_score_history;
CREATE POLICY "pulso_score_history_auth_select" ON public.pulso_score_history
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "pulso_score_history_service_all" ON public.pulso_score_history;
CREATE POLICY "pulso_score_history_service_all" ON public.pulso_score_history
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 2. FUNCIÓN: fn_calcular_pulso_score
CREATE OR REPLACE FUNCTION public.fn_calcular_pulso_score(
  p_persistir boolean DEFAULT false
)
RETURNS jsonb AS $$
DECLARE
  -- 1. Asistencia semanal (40%)
  v_total_asistencias_7d int := 0;
  v_presentes_7d int := 0;
  v_asistencia_pct numeric(5, 2) := 100.00;

  -- 2. Tareas completadas a tiempo (30%)
  v_total_tareas_30d int := 0;
  v_tareas_a_tiempo_30d int := 0;
  v_tareas_tiempo_pct numeric(5, 2) := 100.00;

  -- 3. Cobertura de registro docente (20%)
  v_total_sesiones_7d int := 0;
  v_sesiones_con_asistencia_7d int := 0;
  v_cobertura_pct numeric(5, 2) := 100.00;

  -- 4. Penalización por tareas vencidas hoy (10%)
  v_tareas_vencidas_activas int := 0;
  v_tareas_activas int := 0;
  v_penalizacion_pct numeric(5, 2) := 100.00;

  -- Resultado consolidado
  v_score_final numeric(5, 2);
  v_nivel text;
  v_resultado jsonb;
BEGIN
  -- Componente 1: Asistencia últimos 7 días
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE estado IN ('presente', 'tardanza', 'asistio'))
  INTO v_total_asistencias_7d, v_presentes_7d
  FROM public.asistencias
  WHERE created_at >= (now() - interval '7 days');

  IF v_total_asistencias_7d > 0 THEN
    v_asistencia_pct := ROUND((v_presentes_7d::numeric / v_total_asistencias_7d::numeric) * 100.0, 2);
  ELSE
    v_asistencia_pct := 100.00;
  END IF;

  -- Componente 2: Tareas completadas en últimos 30 días vs vencimiento
  SELECT
    COUNT(*),
    COUNT(*) FILTER (WHERE fecha_vencimiento IS NULL OR updated_at <= (fecha_vencimiento + interval '1 day'))
  INTO v_total_tareas_30d, v_tareas_a_tiempo_30d
  FROM public.tareas_institucionales
  WHERE estado = 'completada'
    AND updated_at >= (now() - interval '30 days');

  IF v_total_tareas_30d > 0 THEN
    v_tareas_tiempo_pct := ROUND((v_tareas_a_tiempo_30d::numeric / v_total_tareas_30d::numeric) * 100.0, 2);
  ELSE
    v_tareas_tiempo_pct := 100.00;
  END IF;

  -- Componente 3: Cobertura de registro de clases últimos 7 días
  SELECT
    COUNT(DISTINCT s.id),
    COUNT(DISTINCT a.sesion_clase_id)
  INTO v_total_sesiones_7d, v_sesiones_con_asistencia_7d
  FROM public.sesiones_clase s
  LEFT JOIN public.asistencias a ON a.sesion_clase_id = s.id
  WHERE s.created_at >= (now() - interval '7 days');

  IF v_total_sesiones_7d > 0 THEN
    v_cobertura_pct := ROUND((v_sesiones_con_asistencia_7d::numeric / v_total_sesiones_7d::numeric) * 100.0, 2);
  ELSE
    v_cobertura_pct := 100.00;
  END IF;

  -- Componente 4: Tareas vencidas activas
  SELECT
    COUNT(*) FILTER (WHERE estado IN ('pendiente', 'en_progreso', 'bloqueada')),
    COUNT(*) FILTER (WHERE estado IN ('pendiente', 'en_progreso', 'bloqueada') AND fecha_vencimiento < CURRENT_DATE)
  INTO v_tareas_activas, v_tareas_vencidas_activas
  FROM public.tareas_institucionales;

  IF v_tareas_activas > 0 THEN
    v_penalizacion_pct := ROUND(GREATEST(0.0, (1.0 - (v_tareas_vencidas_activas::numeric / v_tareas_activas::numeric))) * 100.0, 2);
  ELSE
    v_penalizacion_pct := 100.00;
  END IF;

  -- Cálculo de Score Ponderado
  v_score_final := ROUND(
    (v_asistencia_pct * 0.40) +
    (v_tareas_tiempo_pct * 0.30) +
    (v_cobertura_pct * 0.20) +
    (v_penalizacion_pct * 0.10),
    1
  );

  -- Nivel Operativo
  IF v_score_final >= 80.0 THEN
    v_nivel := 'optimo';
  ELSIF v_score_final >= 60.0 THEN
    v_nivel := 'atencion';
  ELSE
    v_nivel := 'critico';
  END IF;

  -- Construir resultado
  v_resultado := jsonb_build_object(
    'score', v_score_final,
    'nivel', v_nivel,
    'componentes', jsonb_build_object(
      'asistencia_pct', v_asistencia_pct,
      'tareas_tiempo_pct', v_tareas_tiempo_pct,
      'cobertura_registro_pct', v_cobertura_pct,
      'penalizacion_vencidas_pct', v_penalizacion_pct
    ),
    'conteos', jsonb_build_object(
      'asistencias_total_7d', v_total_asistencias_7d,
      'asistencias_presentes_7d', v_presentes_7d,
      'tareas_completadas_30d', v_total_tareas_30d,
      'tareas_a_tiempo_30d', v_tareas_a_tiempo_30d,
      'sesiones_7d', v_total_sesiones_7d,
      'sesiones_con_asistencia_7d', v_sesiones_con_asistencia_7d,
      'tareas_activas', v_tareas_activas,
      'tareas_vencidas_activas', v_tareas_vencidas_activas
    ),
    'calculado_at', now()
  );

  -- Si se solicitó persistencia histórica
  IF p_persistir THEN
    INSERT INTO public.pulso_score_history (
      score, nivel, asistencia_pct, tareas_tiempo_pct,
      cobertura_registro_pct, penalizacion_vencidas_pct,
      metricas_detalle, calculado_at
    ) VALUES (
      v_score_final, v_nivel, v_asistencia_pct, v_tareas_tiempo_pct,
      v_cobertura_pct, v_penalizacion_pct,
      v_resultado, now()
    );
  END IF;

  RETURN v_resultado;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

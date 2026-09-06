-- ==============================================================================
-- Migración: 20260905010000_finanzas_fase0_cron_ciclo_cuotas.sql
-- Módulo 1: Cobro de Mensualidades — Fase 0
-- Propósito: Automatizar la generación del ciclo mensual de cuotas usando pg_cron.
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

-- Eliminar job previo si ya existía para garantizar idempotencia
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'finanzas_generar_ciclo_cuotas_mensual') THEN
    PERFORM cron.unschedule('finanzas_generar_ciclo_cuotas_mensual');
  END IF;
END $$;

-- Programar ejecución mensual: día 1 de cada mes a las 06:00 AM UTC
-- Invoca fn_generar_ciclo_cuotas con mes y año en curso, con RD$600 (60,000 centavos)
SELECT cron.schedule(
  'finanzas_generar_ciclo_cuotas_mensual',
  '0 6 1 * *',
  $$SELECT public.fn_generar_ciclo_cuotas(
      EXTRACT(MONTH FROM CURRENT_DATE)::integer,
      EXTRACT(YEAR FROM CURRENT_DATE)::integer,
      60000
    )$$
);

COMMENT ON EXTENSION pg_cron IS 'Programador de tareas periódicas para generación automática de mensualidades';

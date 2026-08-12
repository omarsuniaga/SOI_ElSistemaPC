-- ============================================================================
-- Migration: 20260812000006_whatsapp_gateway_heartbeat_and_outbox.sql
-- Description: Tablas y RPCs para el Heartbeat en vivo y Outbox real del Gateway WhatsApp
-- ============================================================================

-- 1. Tabla de salud y latido en vivo del worker Baileys / Evolution API
CREATE TABLE IF NOT EXISTS public.hermes_gateway_health (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_name text NOT NULL UNIQUE DEFAULT 'soi-main',
  status text NOT NULL DEFAULT 'disconnected' CHECK (
    status IN ('connected', 'connecting', 'disconnected', 'qr_ready')
  ),
  phone_number text,
  battery_level int,
  qr_code_base64 text,
  last_heartbeat timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

COMMENT ON TABLE public.hermes_gateway_health IS
  'Registro de telemetría y latido en vivo (heartbeat) emitido por el contenedor Evolution API / Baileys.';

CREATE INDEX IF NOT EXISTS idx_hermes_gateway_health_instance
  ON public.hermes_gateway_health (instance_name);

-- RLS
ALTER TABLE public.hermes_gateway_health ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS hgh_authenticated_read ON public.hermes_gateway_health;
CREATE POLICY hgh_authenticated_read
  ON public.hermes_gateway_health FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS hgh_service_role_all ON public.hermes_gateway_health;
CREATE POLICY hgh_service_role_all
  ON public.hermes_gateway_health FOR ALL TO service_role
  USING (true) WITH CHECK (true);

GRANT SELECT ON public.hermes_gateway_health TO authenticated;
GRANT ALL ON public.hermes_gateway_health TO service_role;

-- 2. RPC para que el worker registre su latido (heartbeat)
CREATE OR REPLACE FUNCTION public.fn_hermes_gateway_heartbeat(
  p_instance_name text DEFAULT 'soi-main',
  p_status text DEFAULT 'connected',
  p_phone text DEFAULT NULL,
  p_battery int DEFAULT NULL,
  p_qr text DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO public.hermes_gateway_health (
    instance_name,
    status,
    phone_number,
    battery_level,
    qr_code_base64,
    last_heartbeat,
    metadata
  ) VALUES (
    p_instance_name,
    p_status,
    p_phone,
    p_battery,
    p_qr,
    now(),
    p_metadata
  )
  ON CONFLICT (instance_name) DO UPDATE
  SET
    status = EXCLUDED.status,
    phone_number = COALESCE(EXCLUDED.phone_number, public.hermes_gateway_health.phone_number),
    battery_level = EXCLUDED.battery_level,
    qr_code_base64 = EXCLUDED.qr_code_base64,
    last_heartbeat = now(),
    metadata = EXCLUDED.metadata
  RETURNING id INTO v_id;

  RETURN v_id;
END $$;

-- 3. RPC para consultar el estado real en vivo considerando frescura del heartbeat
CREATE OR REPLACE FUNCTION public.fn_hermes_gateway_get_live_status(
  p_instance_name text DEFAULT 'soi-main'
)
RETURNS TABLE (
  instance_name text,
  status text,
  is_alive boolean,
  phone_number text,
  battery_level int,
  qr_code_base64 text,
  seconds_since_heartbeat numeric,
  last_heartbeat timestamptz
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    h.instance_name,
    CASE
      -- Si el último latido tiene más de 60 segundos, el worker se considera desconectado
      WHEN h.last_heartbeat < (now() - interval '60 seconds') THEN 'disconnected'
      ELSE h.status
    END AS status,
    (h.last_heartbeat >= (now() - interval '60 seconds') AND h.status = 'connected') AS is_alive,
    h.phone_number,
    h.battery_level,
    h.qr_code_base64,
    EXTRACT(EPOCH FROM (now() - h.last_heartbeat)) AS seconds_since_heartbeat,
    h.last_heartbeat
  FROM public.hermes_gateway_health h
  WHERE h.instance_name = p_instance_name
  LIMIT 1;
END $$;

REVOKE ALL ON FUNCTION public.fn_hermes_gateway_heartbeat FROM anon;
GRANT EXECUTE ON FUNCTION public.fn_hermes_gateway_heartbeat TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.fn_hermes_gateway_get_live_status FROM anon;
GRANT EXECUTE ON FUNCTION public.fn_hermes_gateway_get_live_status TO authenticated, service_role;

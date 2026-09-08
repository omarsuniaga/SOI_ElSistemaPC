-- ============================================================================
-- 20260907040000_whatsapp_gateway_devices.sql
-- SDD whatsapp-gateway-multidepto · F2 (device auth)
--
-- Cada instalación de la app Electron se autentica con un DEVICE TOKEN propio,
-- nunca con el service_role. El token se genera en el portal al provisionar un
-- equipo; solo se muestra una vez; en la DB vive únicamente su hash sha256.
--
-- La Edge Function `whatsapp-gateway` valida el token con
-- fn_whatsapp_device_validate (rol service_role) y deriva el departamento del
-- device — el cliente nunca elige su alcance.
--
-- pgcrypto vive en el schema `extensions` en Supabase -> digest/gen_random_bytes
-- se llaman calificadas.
--
-- Idempotente.
-- ============================================================================

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

CREATE TABLE IF NOT EXISTS public.whatsapp_gateway_devices (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  departamento  text NOT NULL CHECK (departamento IN ('DIR','ACM','ADM','FIN','LOG','COM','TECNICO','LUT')),
  token_hash    text NOT NULL UNIQUE,           -- sha256 hex; nunca el token en claro
  nombre_equipo text NOT NULL,
  activo        boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),
  created_by    uuid DEFAULT auth.uid(),
  last_seen_at  timestamptz,
  revoked_at    timestamptz
);

CREATE INDEX IF NOT EXISTS idx_wa_devices_depto_vivo
  ON public.whatsapp_gateway_devices (departamento)
  WHERE activo AND revoked_at IS NULL;

COMMENT ON TABLE public.whatsapp_gateway_devices IS
  'Un registro por instalación de la app Electron del gateway. Autenticación por device token (solo el hash se guarda).';

-- RLS: solo admin/superadmin gestionan (NO `es_admin()`, que incluye
-- `inventarista` — demasiado amplio para una credencial de envío de WhatsApp).
-- service_role valida vía la fn SECURITY DEFINER.
ALTER TABLE public.whatsapp_gateway_devices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS wgd_admin_all ON public.whatsapp_gateway_devices;
CREATE POLICY wgd_admin_all ON public.whatsapp_gateway_devices FOR ALL TO authenticated
  USING (coalesce(public.get_user_role(), '') IN ('admin', 'superadmin'))
  WITH CHECK (coalesce(public.get_user_role(), '') IN ('admin', 'superadmin'));
DROP POLICY IF EXISTS wgd_service_role_all ON public.whatsapp_gateway_devices;
CREATE POLICY wgd_service_role_all ON public.whatsapp_gateway_devices FOR ALL TO service_role
  USING (true) WITH CHECK (true);

REVOKE ALL ON public.whatsapp_gateway_devices FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.whatsapp_gateway_devices TO authenticated;
GRANT ALL ON public.whatsapp_gateway_devices TO service_role;

-- ── issue: genera el token, guarda el hash, lo devuelve UNA vez ─────────────
CREATE OR REPLACE FUNCTION public.fn_whatsapp_device_issue(
  p_departamento text,
  p_nombre_equipo text
)
RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_token text;
  v_hash text;
BEGIN
  IF coalesce(public.get_user_role(), '') NOT IN ('admin', 'superadmin') THEN
    RAISE EXCEPTION 'no autorizado';
  END IF;
  IF p_departamento NOT IN ('DIR','ACM','ADM','FIN','LOG','COM','TECNICO','LUT') THEN
    RAISE EXCEPTION 'departamento inválido: %', p_departamento;
  END IF;
  IF coalesce(trim(p_nombre_equipo), '') = '' THEN
    RAISE EXCEPTION 'nombre_equipo es obligatorio';
  END IF;

  v_token := encode(extensions.gen_random_bytes(32), 'hex');
  v_hash := encode(extensions.digest(v_token, 'sha256'), 'hex');

  INSERT INTO public.whatsapp_gateway_devices (departamento, token_hash, nombre_equipo)
  VALUES (p_departamento, v_hash, trim(p_nombre_equipo));

  RETURN v_token;   -- el llamador debe guardarlo ya; no se puede recuperar
END $$;

-- ── validate: usada por la Edge Function con service_role ──────────────────
CREATE OR REPLACE FUNCTION public.fn_whatsapp_device_validate(p_token text)
RETURNS TABLE (device_id uuid, departamento text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_hash text;
  v_id uuid;
  v_depto text;
BEGIN
  IF coalesce(p_token, '') = '' THEN RETURN; END IF;
  v_hash := encode(extensions.digest(p_token, 'sha256'), 'hex');

  SELECT d.id, d.departamento INTO v_id, v_depto
  FROM public.whatsapp_gateway_devices d
  WHERE d.token_hash = v_hash
    AND d.activo = true
    AND d.revoked_at IS NULL
  LIMIT 1;

  IF v_id IS NULL THEN RETURN; END IF;

  -- last_seen_at con throttle: se llama ~11 veces/min por gateway (claim cada
  -- 6s + heartbeat cada 25s + report). Solo escribir si pasó > 1 min.
  UPDATE public.whatsapp_gateway_devices
  SET last_seen_at = now()
  WHERE id = v_id
    AND (last_seen_at IS NULL OR last_seen_at < now() - interval '1 minute');

  device_id := v_id;
  departamento := v_depto;
  RETURN NEXT;
END $$;

-- ── revoke: baja inmediata ────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.fn_whatsapp_device_revoke(p_id uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF coalesce(public.get_user_role(), '') NOT IN ('admin', 'superadmin') THEN
    RAISE EXCEPTION 'no autorizado';
  END IF;
  UPDATE public.whatsapp_gateway_devices
  SET revoked_at = now(), activo = false
  WHERE id = p_id;
END $$;

REVOKE ALL ON FUNCTION public.fn_whatsapp_device_issue(text, text) FROM anon, public;
REVOKE ALL ON FUNCTION public.fn_whatsapp_device_validate(text) FROM anon, public, authenticated;
REVOKE ALL ON FUNCTION public.fn_whatsapp_device_revoke(uuid) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.fn_whatsapp_device_issue(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_whatsapp_device_revoke(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_whatsapp_device_validate(text) TO service_role;

COMMIT;

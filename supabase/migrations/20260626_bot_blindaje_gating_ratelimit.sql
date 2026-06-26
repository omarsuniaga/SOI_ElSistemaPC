-- 20260626_bot_blindaje_gating_ratelimit.sql
-- Subsistema 3: blindaje del bot publico.
-- Gating por periodo (abre_servicio_publico), rate-limit por numero.
-- La KB de respuestas cerradas vive en archivos: supabase/functions/whatsapp-webhook/kb/.

ALTER TABLE public.campanias_periodo DROP CONSTRAINT IF EXISTS campanias_periodo_accion_check;
ALTER TABLE public.campanias_periodo ADD CONSTRAINT campanias_periodo_accion_check
  CHECK (accion IN ('inscripcion','reinscripcion','concierto','microperiodo','servicio'));
ALTER TABLE public.campanias_periodo
  ADD COLUMN IF NOT EXISTS abre_servicio_publico boolean NOT NULL DEFAULT false;

ALTER TABLE public.hermes_whatsapp_config
  ADD COLUMN IF NOT EXISTS rate_limit_hora int NOT NULL DEFAULT 10;

CREATE OR REPLACE FUNCTION public.fn_servicio_publico_activo()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.campanias_periodo
    WHERE activo = true AND abre_servicio_publico = true
      AND (now() AT TIME ZONE 'America/Santo_Domingo')::date BETWEEN fecha_inicio AND fecha_fin
  );
$$;

CREATE OR REPLACE FUNCTION public.fn_whatsapp_rate_excedido(p_jid text)
RETURNS boolean LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE v_tope int; v_count int;
BEGIN
  SELECT coalesce(rate_limit_hora, 10) INTO v_tope FROM public.hermes_whatsapp_config WHERE activo = true LIMIT 1;
  IF v_tope IS NULL THEN v_tope := 10; END IF;
  SELECT count(*) INTO v_count FROM public.whatsapp_webhook_log
    WHERE jid_remitente = p_jid AND created_at > now() - interval '1 hour';
  RETURN v_count >= v_tope;
END $$;

REVOKE ALL ON FUNCTION public.fn_servicio_publico_activo() FROM anon, public;
REVOKE ALL ON FUNCTION public.fn_whatsapp_rate_excedido(text) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.fn_servicio_publico_activo() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.fn_whatsapp_rate_excedido(text) TO authenticated, service_role;

-- 20260626_whatsapp_antiban_layer.sql
-- Subsistema 2: capa anti-ban (Baileys gateway).
-- Config de ritmo/warm-up, opt-out, puente campania_envios->cola con tope diario,
-- trigger de sincronizacion de estado. Seguridad: revoke anon/public en funciones.

ALTER TABLE public.hermes_whatsapp_config
  ADD COLUMN IF NOT EXISTS jitter_min_seg int NOT NULL DEFAULT 8,
  ADD COLUMN IF NOT EXISTS jitter_max_seg int NOT NULL DEFAULT 20,
  ADD COLUMN IF NOT EXISTS cap_diario int NOT NULL DEFAULT 200,
  ADD COLUMN IF NOT EXISTS cap_horario int NOT NULL DEFAULT 40,
  ADD COLUMN IF NOT EXISTS batch_size int NOT NULL DEFAULT 10,
  ADD COLUMN IF NOT EXISTS batch_cooldown_seg int NOT NULL DEFAULT 60,
  ADD COLUMN IF NOT EXISTS warmup_inicio int NOT NULL DEFAULT 20,
  ADD COLUMN IF NOT EXISTS warmup_dias int NOT NULL DEFAULT 7,
  ADD COLUMN IF NOT EXISTS warmup_desde date;

ALTER TABLE public.hermes_whatsapp_queue
  ADD COLUMN IF NOT EXISTS campania_envio_id uuid REFERENCES public.campania_envios(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS public.whatsapp_optout (
  jid text PRIMARY KEY,
  motivo text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.whatsapp_optout ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS wo_admin_all ON public.whatsapp_optout;
CREATE POLICY wo_admin_all ON public.whatsapp_optout FOR ALL TO authenticated
  USING (es_admin()) WITH CHECK (es_admin());
REVOKE ALL ON public.whatsapp_optout FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.whatsapp_optout TO authenticated;

CREATE OR REPLACE FUNCTION public.fn_whatsapp_cap_hoy()
RETURNS int LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE cfg public.hermes_whatsapp_config; v_dias int;
BEGIN
  SELECT * INTO cfg FROM public.hermes_whatsapp_config WHERE activo = true LIMIT 1;
  IF NOT FOUND THEN RETURN 0; END IF;
  IF cfg.warmup_desde IS NULL THEN RETURN cfg.cap_diario; END IF;
  v_dias := ((now() AT TIME ZONE 'America/Santo_Domingo')::date - cfg.warmup_desde);
  IF v_dias >= cfg.warmup_dias THEN RETURN cfg.cap_diario; END IF;
  IF v_dias < 0 THEN RETURN cfg.warmup_inicio; END IF;
  RETURN round(cfg.warmup_inicio + (cfg.cap_diario - cfg.warmup_inicio)::numeric * v_dias / cfg.warmup_dias);
END $$;

CREATE OR REPLACE FUNCTION public.fn_whatsapp_enviados_hoy()
RETURNS int LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT count(*)::int FROM public.hermes_whatsapp_queue
  WHERE estado = 'enviado'
    AND (procesado_at AT TIME ZONE 'America/Santo_Domingo')::date
        = (now() AT TIME ZONE 'America/Santo_Domingo')::date;
$$;

CREATE OR REPLACE FUNCTION public.fn_whatsapp_optout(p_jid text, p_motivo text DEFAULT 'usuario')
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.whatsapp_optout (jid, motivo) VALUES (p_jid, p_motivo)
    ON CONFLICT (jid) DO NOTHING;
  UPDATE public.campania_envios SET estado = 'opt_out', updated_at = now()
    WHERE jid = p_jid AND estado IN ('pendiente_envio','encolado');
  UPDATE public.hermes_whatsapp_queue SET estado = 'cancelado'
    WHERE jid = p_jid AND estado = 'pendiente';
END $$;

CREATE OR REPLACE FUNCTION public.fn_encolar_campania(p_campania_id uuid, p_limite int DEFAULT NULL)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_cap int; v_enviados int; v_pendientes_cola int; v_restante int; v_encolados int;
BEGIN
  IF NOT es_admin() THEN RAISE EXCEPTION 'no autorizado'; END IF;
  v_cap := public.fn_whatsapp_cap_hoy();
  v_enviados := public.fn_whatsapp_enviados_hoy();
  SELECT count(*) INTO v_pendientes_cola FROM public.hermes_whatsapp_queue WHERE estado = 'pendiente';
  v_restante := GREATEST(v_cap - v_enviados - v_pendientes_cola, 0);
  IF p_limite IS NOT NULL THEN v_restante := LEAST(v_restante, p_limite); END IF;

  WITH a_encolar AS (
    SELECT ce.id, ce.jid, ce.mensaje
    FROM public.campania_envios ce
    WHERE ce.campania_id = p_campania_id
      AND ce.estado = 'pendiente_envio'
      AND NOT EXISTS (SELECT 1 FROM public.whatsapp_optout o WHERE o.jid = ce.jid)
    ORDER BY ce.created_at
    LIMIT v_restante
  ), ins AS (
    INSERT INTO public.hermes_whatsapp_queue (jid, mensaje, estado, campania_envio_id)
    SELECT jid, mensaje, 'pendiente', id FROM a_encolar
    RETURNING campania_envio_id
  )
  UPDATE public.campania_envios SET estado = 'encolado', updated_at = now()
    WHERE id IN (SELECT campania_envio_id FROM ins);
  GET DIAGNOSTICS v_encolados = ROW_COUNT;

  RETURN json_build_object('encolados', v_encolados, 'cap_hoy', v_cap,
                           'enviados_hoy', v_enviados, 'restante_tras_encolar', GREATEST(v_restante - v_encolados, 0));
END $$;

CREATE OR REPLACE FUNCTION public.fn_sync_campania_envio_estado()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.campania_envio_id IS NOT NULL AND NEW.estado IS DISTINCT FROM OLD.estado THEN
    IF NEW.estado = 'enviado' THEN
      UPDATE public.campania_envios SET estado = 'enviado', updated_at = now() WHERE id = NEW.campania_envio_id;
    ELSIF NEW.estado = 'fallido' THEN
      UPDATE public.campania_envios SET estado = 'fallido', updated_at = now() WHERE id = NEW.campania_envio_id;
    END IF;
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_sync_campania_envio ON public.hermes_whatsapp_queue;
CREATE TRIGGER trg_sync_campania_envio
  AFTER UPDATE OF estado ON public.hermes_whatsapp_queue
  FOR EACH ROW EXECUTE FUNCTION public.fn_sync_campania_envio_estado();

-- Seguridad: revocar EXECUTE a anon/public (Postgres lo concede por defecto) y conceder solo a roles validos.
REVOKE ALL ON FUNCTION public.fn_encolar_campania(uuid, int) FROM anon, public;
REVOKE ALL ON FUNCTION public.fn_whatsapp_optout(text, text) FROM anon, public;
REVOKE ALL ON FUNCTION public.fn_whatsapp_cap_hoy() FROM anon, public;
REVOKE ALL ON FUNCTION public.fn_whatsapp_enviados_hoy() FROM anon, public;
GRANT EXECUTE ON FUNCTION public.fn_encolar_campania(uuid, int) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_whatsapp_optout(text, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.fn_whatsapp_cap_hoy() TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_whatsapp_enviados_hoy() TO authenticated;

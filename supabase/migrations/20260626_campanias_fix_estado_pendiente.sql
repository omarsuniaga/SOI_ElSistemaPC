-- 20260626_campanias_fix_estado_pendiente.sql
-- La data real de postulantes usa estado 'pendiente' (no el vocabulario del
-- postuladoStateMachine). 'pendiente' => primer_contacto. Define las funciones RPC
-- de preview y activacion (admin-gated, security definer, NO tocan la cola viva).

CREATE OR REPLACE FUNCTION public.fn_preview_campania(p_id uuid)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE c public.campanias_periodo; v json;
BEGIN
  IF NOT es_admin() THEN RAISE EXCEPTION 'no autorizado'; END IF;
  SELECT * INTO c FROM public.campanias_periodo WHERE id = p_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'campania no encontrada'; END IF;

  IF c.accion = 'inscripcion' THEN
    WITH cand AS (
      SELECT p.id,
        CASE WHEN p.estado IN ('pendiente','postulado','contactado','en_espera') THEN 'primer_contacto'
             WHEN p.estado IN ('no_show','reprogramado') THEN 'recuperacion' END AS segmento,
        coalesce(nullif(normalize_phone(p.madre_tlf_whatsapp),''),
                 nullif(normalize_phone(p.padre_tlf_whatsapp),''),
                 nullif(normalize_phone(p.telefono_alumno),'')) AS jid
      FROM public.postulantes p
      WHERE p.estado IN ('pendiente','postulado','contactado','en_espera','no_show','reprogramado')
        AND ((c.tipo='A' AND extract(month FROM p.fecha_postulacion) BETWEEN 1 AND 6)
          OR (c.tipo='B' AND extract(month FROM p.fecha_postulacion) BETWEEN 7 AND 12))
    )
    SELECT json_build_object(
      'accion','inscripcion',
      'primer_contacto', count(DISTINCT jid) FILTER (WHERE segmento='primer_contacto' AND jid IS NOT NULL),
      'recuperacion', count(DISTINCT jid) FILTER (WHERE segmento='recuperacion' AND jid IS NOT NULL),
      'sin_telefono', count(*) FILTER (WHERE jid IS NULL),
      'cupo_disponible', (SELECT coalesce(sum(disponible),0) FROM public.vw_cupos_iniciacion),
      'cupo_total', (SELECT coalesce(sum(capacidad_maxima),0) FROM public.vw_cupos_iniciacion)
    ) INTO v FROM cand;
  ELSE
    WITH cand AS (
      SELECT a.id,
        coalesce(nullif(normalize_phone(a.madre_tlf_whatsapp),''),
                 nullif(normalize_phone(a.padre_tlf_whatsapp),''),
                 nullif(normalize_phone(a.representante_tlf),''),
                 nullif(normalize_phone(a.tlf_alumno),'')) AS jid
      FROM public.alumnos a WHERE a.activo = true
    )
    SELECT json_build_object(
      'accion','reinscripcion',
      'reinscripcion', count(DISTINCT jid) FILTER (WHERE jid IS NOT NULL),
      'sin_telefono', count(*) FILTER (WHERE jid IS NULL)
    ) INTO v FROM cand;
  END IF;
  RETURN v;
END $$;

CREATE OR REPLACE FUNCTION public.fn_activar_campania(p_id uuid)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE c public.campanias_periodo; v_insertados int;
BEGIN
  IF NOT es_admin() THEN RAISE EXCEPTION 'no autorizado'; END IF;
  SELECT * INTO c FROM public.campanias_periodo WHERE id = p_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'campania no encontrada'; END IF;

  IF c.accion = 'inscripcion' THEN
    WITH cand AS (
      SELECT DISTINCT ON (jid) sub.id AS persona_id, sub.nombre_completo AS nombre, sub.segmento, sub.jid
      FROM (
        SELECT p.id, p.nombre_completo,
          CASE WHEN p.estado IN ('pendiente','postulado','contactado','en_espera') THEN 'primer_contacto'
               WHEN p.estado IN ('no_show','reprogramado') THEN 'recuperacion' END AS segmento,
          coalesce(nullif(normalize_phone(p.madre_tlf_whatsapp),''),
                   nullif(normalize_phone(p.padre_tlf_whatsapp),''),
                   nullif(normalize_phone(p.telefono_alumno),'')) AS jid
        FROM public.postulantes p
        WHERE p.estado IN ('pendiente','postulado','contactado','en_espera','no_show','reprogramado')
          AND ((c.tipo='A' AND extract(month FROM p.fecha_postulacion) BETWEEN 1 AND 6)
            OR (c.tipo='B' AND extract(month FROM p.fecha_postulacion) BETWEEN 7 AND 12))
      ) sub
      WHERE sub.jid IS NOT NULL
      ORDER BY sub.jid, sub.id
    )
    INSERT INTO public.campania_envios (campania_id, fuente, persona_id, nombre, telefono, jid, segmento, mensaje)
    SELECT p_id, 'postulante', persona_id, nombre, jid, jid || '@s.whatsapp.net', segmento,
      CASE segmento
        WHEN 'primer_contacto' THEN 'Hola 👋 Le escribimos de El Sistema Punta Cana. Responda *CITA* para agendar su cita de Iniciación Musical.'
        WHEN 'recuperacion' THEN 'Hola 👋 El Sistema Punta Cana. Responda *REAGENDAR* para coordinar una nueva fecha para su cita de Iniciación Musical.'
      END
    FROM cand
    ON CONFLICT (campania_id, jid) DO NOTHING;
  ELSE
    WITH cand AS (
      SELECT DISTINCT ON (jid) sub.id AS persona_id, sub.nombre_completo AS nombre, sub.jid
      FROM (
        SELECT a.id, a.nombre_completo,
          coalesce(nullif(normalize_phone(a.madre_tlf_whatsapp),''),
                   nullif(normalize_phone(a.padre_tlf_whatsapp),''),
                   nullif(normalize_phone(a.representante_tlf),''),
                   nullif(normalize_phone(a.tlf_alumno),'')) AS jid
        FROM public.alumnos a WHERE a.activo = true
      ) sub
      WHERE sub.jid IS NOT NULL
      ORDER BY sub.jid, sub.id
    )
    INSERT INTO public.campania_envios (campania_id, fuente, persona_id, nombre, telefono, jid, segmento, mensaje)
    SELECT p_id, 'alumno', persona_id, nombre, jid, jid || '@s.whatsapp.net', 'reinscripcion',
      'Hola 👋 El Sistema Punta Cana. Inició la reinscripción. Responda *REINSCRIBIR* para confirmar su cupo y actualizar sus datos.'
    FROM cand
    ON CONFLICT (campania_id, jid) DO NOTHING;
  END IF;

  GET DIAGNOSTICS v_insertados = ROW_COUNT;
  UPDATE public.campanias_periodo SET activo = true, updated_at = now() WHERE id = p_id;
  RETURN json_build_object('materializados', v_insertados);
END $$;

REVOKE ALL ON FUNCTION public.fn_preview_campania(uuid) FROM anon, public;
REVOKE ALL ON FUNCTION public.fn_activar_campania(uuid) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.fn_preview_campania(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_activar_campania(uuid) TO authenticated;

-- 20260626_sp4_flujos_dominio.sql
-- SP-4: orquestacion por evento de dominio. Fan-out cross-departamental con
-- correlation_id compartido. Cada RPC abre un CASO y delega tareas a los departamentos.
-- Disparo por reporte explicito (la auto-deteccion por cruce de datos queda como mejora futura).

CREATE OR REPLACE FUNCTION public._fn_crear_tarea_caso(
  p_corr uuid, p_titulo text, p_desc text, p_depto soi_departamento, p_prioridad text,
  p_entidad_tipo text, p_entidad_id uuid, p_entidad_label text, p_actor_id uuid, p_actor_nombre text)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  INSERT INTO public.tareas_institucionales
    (titulo, descripcion, departamento, estado, prioridad, correlation_id,
     entidad_tipo, entidad_id, entidad_label, updated_by, updated_by_nombre)
  VALUES (p_titulo, p_desc, p_depto, 'pendiente', p_prioridad::tarea_institucional_prioridad, p_corr,
     p_entidad_tipo, p_entidad_id, p_entidad_label, p_actor_id, p_actor_nombre);
$$;

-- FLUJO 1: instrumento danado -> LUT, LOG, FIN, ACM, COM
CREATE OR REPLACE FUNCTION public.fn_reportar_instrumento_danado(
  p_instrumento_id uuid, p_descripcion text, p_actor_id uuid, p_actor_nombre text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_corr uuid := gen_random_uuid(); v_label text; v_alumno text;
BEGIN
  SELECT coalesce(nombre,'Instrumento') || coalesce(' ('||codigo||')',''), alumno_nombre
    INTO v_label, v_alumno FROM public.instrumentos WHERE id = p_instrumento_id;
  IF v_label IS NULL THEN RAISE EXCEPTION 'instrumento % no existe', p_instrumento_id; END IF;

  UPDATE public.instrumentos SET estado = 'danado', updated_at = now() WHERE id = p_instrumento_id;

  PERFORM public._fn_crear_tarea_caso(v_corr, 'LUT: Diagnosticar daño del instrumento',
    coalesce(p_descripcion,'') , 'LUT', 'alta', 'instrumento', p_instrumento_id, v_label, p_actor_id, p_actor_nombre);
  PERFORM public._fn_crear_tarea_caso(v_corr, 'LOG: Actualizar estado en inventario y evaluar reemplazo temporal',
    'Instrumento marcado como dañado; evaluar disponibilidad de reemplazo.', 'LOG', 'alta', 'instrumento', p_instrumento_id, v_label, p_actor_id, p_actor_nombre);
  PERFORM public._fn_crear_tarea_caso(v_corr, 'FIN: Evaluar si corresponde cargo al representante',
    coalesce('Alumno asociado: '||v_alumno, 'Revisar responsable del daño.'), 'FIN', 'media', 'instrumento', p_instrumento_id, v_label, p_actor_id, p_actor_nombre);
  PERFORM public._fn_crear_tarea_caso(v_corr, 'ACM: Caso de daño asociado al alumno',
    'El alumno tiene un caso abierto por daño de instrumento; considerar impacto en continuidad.', 'ACM', 'media', 'instrumento', p_instrumento_id, v_label, p_actor_id, p_actor_nombre);
  PERFORM public._fn_crear_tarea_caso(v_corr, 'COM: Evaluar comunicado al representante',
    'Coordinar mensaje al representante sobre el caso de instrumento dañado.', 'COM', 'media', 'instrumento', p_instrumento_id, v_label, p_actor_id, p_actor_nombre);

  RETURN v_corr;
END $$;

-- FLUJO 2: alumno en riesgo -> ACM, COM, FIN, DIR
CREATE OR REPLACE FUNCTION public.fn_reportar_alumno_riesgo(
  p_alumno_id uuid, p_alumno_nombre text, p_motivo text, p_actor_id uuid, p_actor_nombre text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_corr uuid := gen_random_uuid(); v_label text := coalesce(p_alumno_nombre, 'Alumno');
BEGIN
  PERFORM public._fn_crear_tarea_caso(v_corr, 'ACM: Levantar informe académico del alumno',
    coalesce(p_motivo,''), 'ACM', 'alta', 'alumno', p_alumno_id, v_label, p_actor_id, p_actor_nombre);
  PERFORM public._fn_crear_tarea_caso(v_corr, 'COM: Contactar al representante',
    'Coordinar contacto con el representante por caso de alumno en riesgo.', 'COM', 'alta', 'alumno', p_alumno_id, v_label, p_actor_id, p_actor_nombre);
  PERFORM public._fn_crear_tarea_caso(v_corr, 'FIN: Revisar estado de pago del representante',
    'Verificar morosidad y compromisos económicos del alumno.', 'FIN', 'media', 'alumno', p_alumno_id, v_label, p_actor_id, p_actor_nombre);
  PERFORM public._fn_crear_tarea_caso(v_corr, 'DIR: Seguimiento de caso crítico',
    coalesce('Motivo: '||p_motivo, 'Definir según protocolo: seguimiento, advertencia, suspensión o retiro.'), 'DIR', 'critica', 'alumno', p_alumno_id, v_label, p_actor_id, p_actor_nombre);

  RETURN v_corr;
END $$;

REVOKE ALL ON FUNCTION public._fn_crear_tarea_caso(uuid,text,text,soi_departamento,text,text,uuid,text,uuid,text) FROM anon, public;
REVOKE ALL ON FUNCTION public.fn_reportar_instrumento_danado(uuid,text,uuid,text) FROM anon, public;
REVOKE ALL ON FUNCTION public.fn_reportar_alumno_riesgo(uuid,text,text,uuid,text) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.fn_reportar_instrumento_danado(uuid,text,uuid,text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.fn_reportar_alumno_riesgo(uuid,text,text,uuid,text) TO authenticated, service_role;

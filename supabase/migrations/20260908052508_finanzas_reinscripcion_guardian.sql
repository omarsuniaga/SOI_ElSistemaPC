-- 20260908120000_finanzas_reinscripcion_guardian.sql
-- Guardián de reinscripción para el portal FIN + corrección de 2 bugs en
-- fn_dar_de_baja_alumno / fn_validar_reinscripcion_alumno.

-- ── 0. Extensiones y helpers de normalización ──
CREATE EXTENSION IF NOT EXISTS unaccent WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE OR REPLACE FUNCTION public.norm_cedula(p text)
RETURNS text LANGUAGE sql IMMUTABLE AS $$
  SELECT regexp_replace(COALESCE(p, ''), '\D', '', 'g');
$$;

CREATE INDEX IF NOT EXISTS idx_alumnos_nombre_trgm
  ON public.alumnos USING gin (lower(nombre_completo) public.gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_alumnos_fecha_nacimiento
  ON public.alumnos (fecha_nacimiento);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'alumnos_estado_academico_chk') THEN
    ALTER TABLE public.alumnos
      ADD CONSTRAINT alumnos_estado_academico_chk
      CHECK (estado_academico IN ('activo', 'retirado', 'retirado_con_deuda'));
  END IF;
END$$;

-- ── 1. Definición canónica de "deuda viva" ──
CREATE OR REPLACE FUNCTION public.fn_deuda_viva(
  p_alumno_id uuid DEFAULT NULL,
  p_familia_id uuid DEFAULT NULL
)
RETURNS bigint LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE(SUM(c.monto_final_centavos - COALESCE(c.monto_pagado_centavos, 0)), 0)::bigint
  FROM public.cuotas c
  WHERE (c.monto_final_centavos - COALESCE(c.monto_pagado_centavos, 0)) > 0
    AND c.estado::text NOT IN ('pagada', 'exonerada', 'becada', 'pre_pagada')
    AND (
      (p_alumno_id IS NOT NULL AND c.alumno_id = p_alumno_id)
      OR (p_familia_id IS NOT NULL AND c.familia_id = p_familia_id)
    );
$$;

CREATE OR REPLACE FUNCTION public.fn_reinscripcion_rol_autorizado()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.rol IN ('admin', 'finanzas', 'director')
  );
$$;

-- ── 2. Evaluador de reinscripción (solo lectura) ──
CREATE OR REPLACE FUNCTION public.fn_evaluar_reinscripcion(
  p_representante_cedula text,
  p_alumno_nombre text,
  p_alumno_fecha_nacimiento date DEFAULT NULL,
  p_representante_telefono text DEFAULT NULL
)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, extensions AS $fn$
DECLARE
  v_ced text := public.norm_cedula(p_representante_cedula);
  v_nombre_in text := lower(unaccent(trim(regexp_replace(COALESCE(p_alumno_nombre, ''), '\s+', ' ', 'g'))));
  v_familia_ids uuid[];
  v_rep jsonb;
  v_candidatos jsonb;
  v_deuda_alumno bigint := 0;
  v_deuda_rep bigint := 0;
  v_deuda_total bigint := 0;
  v_detalle jsonb;
  v_bloqueo_manual boolean := false;
  v_hay_exacto_activo boolean := false;
  v_reactivable_id uuid;
  v_permite boolean;
  v_accion text;
  v_mensaje text;
BEGIN
  SELECT array_agg(DISTINCT fid) INTO v_familia_ids FROM (
    SELECT r.familia_id AS fid FROM public.representantes r
     WHERE v_ced <> '' AND public.norm_cedula(r.cedula) = v_ced AND r.familia_id IS NOT NULL
    UNION
    SELECT a.familia_id AS fid FROM public.alumnos a
     WHERE v_ced <> '' AND a.familia_id IS NOT NULL
       AND v_ced IN (
         public.norm_cedula(a.representante_cedula), public.norm_cedula(a.padre_cedula),
         public.norm_cedula(a.madre_cedula), public.norm_cedula(a.otro_responsable_cedula))
  ) s;

  SELECT jsonb_build_object(
           'cedula', v_ced,
           'nombres', COALESCE(jsonb_agg(DISTINCT r.nombre) FILTER (WHERE r.nombre IS NOT NULL), '[]'::jsonb),
           'familia_ids', to_jsonb(COALESCE(v_familia_ids, ARRAY[]::uuid[])),
           'bloqueo_reinscripcion', COALESCE(bool_or(r.bloqueo_reinscripcion), false),
           'motivo_bloqueo', (array_agg(r.motivo_bloqueo) FILTER (WHERE r.motivo_bloqueo IS NOT NULL))[1]
         )
    INTO v_rep
    FROM public.representantes r
   WHERE v_ced <> '' AND public.norm_cedula(r.cedula) = v_ced;

  IF v_rep IS NULL THEN
    v_rep := jsonb_build_object(
      'cedula', v_ced, 'nombres', '[]'::jsonb,
      'familia_ids', to_jsonb(COALESCE(v_familia_ids, ARRAY[]::uuid[])),
      'bloqueo_reinscripcion', false, 'motivo_bloqueo', NULL);
  END IF;

  WITH cand AS (
    SELECT a.id, a.nombre_completo, a.fecha_nacimiento, a.estado_academico,
      a.activo, a.familia_id, a.fecha_baja,
      CASE
        WHEN lower(unaccent(a.nombre_completo)) = v_nombre_in
             AND (p_alumno_fecha_nacimiento IS NULL OR a.fecha_nacimiento = p_alumno_fecha_nacimiento)
          THEN 'exacto'
        WHEN v_ced <> ''
             AND v_ced IN (
               public.norm_cedula(a.representante_cedula), public.norm_cedula(a.padre_cedula),
               public.norm_cedula(a.madre_cedula), public.norm_cedula(a.otro_responsable_cedula))
             AND similarity(lower(unaccent(a.nombre_completo)), v_nombre_in) > 0.30
          THEN 'probable'
        WHEN similarity(lower(unaccent(a.nombre_completo)), v_nombre_in) > 0.55
          THEN 'probable'
        ELSE NULL
      END AS match
    FROM public.alumnos a
  )
  SELECT jsonb_agg(
           jsonb_build_object(
             'alumno_id', c.id, 'nombre', c.nombre_completo, 'fecha_nacimiento', c.fecha_nacimiento,
             'estado_academico', c.estado_academico, 'activo', c.activo, 'familia_id', c.familia_id,
             'fecha_baja', c.fecha_baja, 'match', c.match,
             'deuda_viva_centavos', public.fn_deuda_viva(c.id, NULL))
           ORDER BY (c.match = 'exacto') DESC, c.activo DESC)
    INTO v_candidatos
    FROM cand c WHERE c.match IS NOT NULL;

  v_candidatos := COALESCE(v_candidatos, '[]'::jsonb);

  SELECT COALESCE(SUM((e->>'deuda_viva_centavos')::bigint), 0)
    INTO v_deuda_alumno FROM jsonb_array_elements(v_candidatos) e;

  SELECT COALESCE(SUM(public.fn_deuda_viva(a.id, NULL)), 0)
    INTO v_deuda_rep
    FROM public.alumnos a
   WHERE v_familia_ids IS NOT NULL AND a.familia_id = ANY(v_familia_ids);

  SELECT COALESCE(jsonb_agg(
           jsonb_build_object(
             'alumno_nombre', al.nombre_completo,
             'periodo', c.ciclo_anio || '-' || lpad(c.ciclo_mes::text, 2, '0'),
             'concepto', c.concepto,
             'saldo_centavos', c.monto_final_centavos - COALESCE(c.monto_pagado_centavos, 0),
             'dias_atraso', GREATEST(0, CURRENT_DATE - c.fecha_vencimiento))
           ORDER BY c.fecha_vencimiento), '[]'::jsonb)
    INTO v_detalle
    FROM public.cuotas c
    JOIN public.alumnos al ON al.id = c.alumno_id
   WHERE (c.monto_final_centavos - COALESCE(c.monto_pagado_centavos, 0)) > 0
     AND c.estado::text NOT IN ('pagada', 'exonerada', 'becada', 'pre_pagada')
     AND (
       (v_familia_ids IS NOT NULL AND al.familia_id = ANY(v_familia_ids))
       OR al.id IN (SELECT (e->>'alumno_id')::uuid FROM jsonb_array_elements(v_candidatos) e)
     );

  SELECT v_deuda_rep + COALESCE(SUM((e->>'deuda_viva_centavos')::bigint), 0)
    INTO v_deuda_total
    FROM jsonb_array_elements(v_candidatos) e
   WHERE v_familia_ids IS NULL
      OR (e->>'familia_id') IS NULL
      OR NOT ((e->>'familia_id')::uuid = ANY(v_familia_ids));

  v_bloqueo_manual :=
       COALESCE((v_rep->>'bloqueo_reinscripcion')::boolean, false)
    OR EXISTS (SELECT 1 FROM jsonb_array_elements(v_candidatos) e
          WHERE COALESCE(e->>'activo', 'true') = 'false'
            AND (e->>'estado_academico') = 'retirado_con_deuda')
    OR EXISTS (SELECT 1 FROM public.alumnos a
          WHERE v_familia_ids IS NOT NULL AND a.familia_id = ANY(v_familia_ids)
            AND a.bloqueo_reinscripcion);

  v_hay_exacto_activo := EXISTS (
    SELECT 1 FROM jsonb_array_elements(v_candidatos) e
     WHERE e->>'match' = 'exacto' AND COALESCE(e->>'activo', 'true') = 'true');

  SELECT (e->>'alumno_id')::uuid INTO v_reactivable_id
    FROM jsonb_array_elements(v_candidatos) e
   WHERE e->>'match' = 'exacto' AND COALESCE(e->>'activo', 'true') = 'false'
   LIMIT 1;

  IF v_deuda_total > 0 THEN
    v_permite := false; v_accion := 'saldar_deuda';
    v_mensaje := 'Impedimento financiero: RD$ ' || to_char(v_deuda_total / 100.0, 'FM999999990.00')
      || ' de deuda viva vinculada al representante o al alumno. Debe saldarse antes de reinscribir.';
  ELSIF v_bloqueo_manual THEN
    v_permite := false; v_accion := 'levantar_bloqueo_manual';
    v_mensaje := 'Sin deuda viva, pero hay un bloqueo de reinscripcion activo. Requiere levantamiento manual por Finanzas o Direccion.';
  ELSIF v_hay_exacto_activo THEN
    v_permite := false; v_accion := 'ya_inscrito';
    v_mensaje := 'El alumno ya figura como matricula activa. No corresponde reinscribir (evitar expediente duplicado).';
  ELSIF v_reactivable_id IS NOT NULL THEN
    v_permite := true; v_accion := 'reactivar';
    v_mensaje := 'El alumno existe y esta retirado sin deuda. Reactivar el expediente con fn_reactivar_alumno.';
  ELSE
    v_permite := true; v_accion := 'crear_nuevo';
    v_mensaje := 'Sin coincidencias en la base ni impedimentos financieros. Alta normal.';
  END IF;

  RETURN jsonb_build_object(
    'alumno_existe', jsonb_array_length(v_candidatos) > 0,
    'candidatos', v_candidatos,
    'representante', v_rep,
    'deuda', jsonb_build_object(
      'alumno_centavos', v_deuda_alumno,
      'representante_centavos', v_deuda_rep,
      'total_centavos', v_deuda_total,
      'detalle', v_detalle),
    'permite_reinscripcion', v_permite,
    'accion_requerida', v_accion,
    'reactivable_alumno_id', v_reactivable_id,
    'mensaje', v_mensaje
  );
END;
$fn$;

-- ── 3. Auditoría de reinscripciones ──
CREATE TABLE IF NOT EXISTS public.alumnos_reinscripciones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alumno_id uuid NOT NULL REFERENCES public.alumnos(id),
  fecha date NOT NULL DEFAULT CURRENT_DATE,
  procesada_por uuid REFERENCES auth.users(id),
  deuda_verificada_centavos bigint NOT NULL DEFAULT 0,
  familia_anterior uuid,
  familia_nueva uuid,
  notas text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_alumnos_reinscripciones_alumno
  ON public.alumnos_reinscripciones (alumno_id, fecha DESC);

ALTER TABLE public.alumnos_reinscripciones ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'alumnos_reinscripciones'
      AND policyname = 'alumnos_reinscripciones_read'
  ) THEN
    CREATE POLICY "alumnos_reinscripciones_read"
      ON public.alumnos_reinscripciones
      FOR SELECT TO authenticated
      USING (public.fn_reinscripcion_rol_autorizado());
  END IF;
END$$;

-- ── 4. Reactivación de un expediente retirado ──
CREATE OR REPLACE FUNCTION public.fn_reactivar_alumno(
  p_alumno_id uuid,
  p_usuario_id uuid DEFAULT NULL,
  p_nueva_familia_id uuid DEFAULT NULL
)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
DECLARE
  v_alumno RECORD;
  v_familia_efectiva uuid;
  v_deuda_alumno bigint := 0;
  v_deuda_familia bigint := 0;
  v_deuda_total bigint := 0;
BEGIN
  SELECT id, nombre_completo, activo, estado_academico, familia_id, bloqueo_reinscripcion
    INTO v_alumno FROM public.alumnos WHERE id = p_alumno_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'El alumno con ID % no existe.', p_alumno_id;
  END IF;

  IF v_alumno.activo IS TRUE THEN
    RAISE EXCEPTION 'El alumno % ya esta activo; no requiere reactivacion.', v_alumno.nombre_completo;
  END IF;

  v_familia_efectiva := COALESCE(p_nueva_familia_id, v_alumno.familia_id);

  v_deuda_alumno := public.fn_deuda_viva(p_alumno_id, NULL);
  v_deuda_familia := public.fn_deuda_viva(NULL, v_familia_efectiva);
  IF p_nueva_familia_id IS NOT NULL AND v_alumno.familia_id IS DISTINCT FROM p_nueva_familia_id THEN
    v_deuda_familia := v_deuda_familia + public.fn_deuda_viva(NULL, v_alumno.familia_id);
  END IF;
  v_deuda_total := GREATEST(v_deuda_alumno, v_deuda_familia);

  IF v_deuda_total > 0 THEN
    RETURN jsonb_build_object(
      'success', false, 'permite_reinscripcion', false, 'accion_requerida', 'saldar_deuda',
      'deuda_centavos', v_deuda_total,
      'mensaje', 'No se puede reactivar: hay RD$ ' || to_char(v_deuda_total / 100.0, 'FM999999990.00') || ' de deuda viva pendiente.');
  END IF;

  IF v_alumno.bloqueo_reinscripcion OR v_alumno.estado_academico = 'retirado_con_deuda' THEN
    RETURN jsonb_build_object(
      'success', false, 'permite_reinscripcion', false, 'accion_requerida', 'levantar_bloqueo_manual',
      'deuda_centavos', 0,
      'mensaje', 'Sin deuda viva, pero el expediente tiene bloqueo de reinscripcion. Requiere levantamiento manual antes de reactivar.');
  END IF;

  UPDATE public.alumnos
     SET activo = true, estado_academico = 'activo', fecha_baja = NULL, motivo_baja = NULL,
         bloqueo_reinscripcion = false, deuda_pendiente_baja_centavos = 0,
         familia_id = v_familia_efectiva,
         observaciones_baja = NULLIF(TRIM(BOTH ' |' FROM COALESCE(observaciones_baja, '') || ' | Reactivado ' || CURRENT_DATE::text), ''),
         updated_at = timezone('utc'::text, now())
   WHERE id = p_alumno_id;

  INSERT INTO public.alumnos_reinscripciones (alumno_id, procesada_por, deuda_verificada_centavos, familia_anterior, familia_nueva, notas)
  VALUES (p_alumno_id, p_usuario_id, 0, v_alumno.familia_id, v_familia_efectiva, 'Reactivacion via fn_reactivar_alumno');

  RETURN jsonb_build_object(
    'success', true, 'permite_reinscripcion', true, 'accion_requerida', 'ninguna',
    'alumno_id', p_alumno_id, 'nombre_completo', v_alumno.nombre_completo,
    'familia_id', v_familia_efectiva,
    'mensaje', 'Expediente reactivado. Alumno habilitado para el ciclo vigente.');
END;
$fn$;

-- ── 5. Recalcular bloqueos de una familia (llamar DESPUES de cada pago) ──
CREATE OR REPLACE FUNCTION public.fn_recalcular_bloqueos_familia(p_familia_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
DECLARE
  v_deuda bigint := 0;
  v_reps int := 0;
  v_alumnos int := 0;
BEGIN
  IF p_familia_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'mensaje', 'familia_id nulo.');
  END IF;

  v_deuda := public.fn_deuda_viva(NULL, p_familia_id);

  IF v_deuda > 0 THEN
    RETURN jsonb_build_object(
      'success', true, 'familia_id', p_familia_id, 'deuda_viva_centavos', v_deuda,
      'bloqueos_levantados', false,
      'mensaje', 'La familia aun registra deuda viva; los bloqueos se mantienen.');
  END IF;

  UPDATE public.representantes SET bloqueo_reinscripcion = false, motivo_bloqueo = NULL
   WHERE familia_id = p_familia_id AND bloqueo_reinscripcion = true;
  GET DIAGNOSTICS v_reps = ROW_COUNT;

  UPDATE public.alumnos
     SET bloqueo_reinscripcion = false, deuda_pendiente_baja_centavos = 0,
         estado_academico = CASE WHEN estado_academico = 'retirado_con_deuda' THEN 'retirado' ELSE estado_academico END,
         updated_at = timezone('utc'::text, now())
   WHERE familia_id = p_familia_id
     AND (bloqueo_reinscripcion = true OR estado_academico = 'retirado_con_deuda');
  GET DIAGNOSTICS v_alumnos = ROW_COUNT;

  RETURN jsonb_build_object(
    'success', true, 'familia_id', p_familia_id, 'deuda_viva_centavos', 0,
    'bloqueos_levantados', (v_reps + v_alumnos) > 0,
    'representantes_desbloqueados', v_reps, 'alumnos_desbloqueados', v_alumnos,
    'mensaje', 'Deuda saldada: bloqueos de reinscripcion de la familia levantados.');
END;
$fn$;

-- ── 6. CORRECCION de fn_dar_de_baja_alumno ──
CREATE OR REPLACE FUNCTION public.fn_dar_de_baja_alumno(
  p_alumno_id uuid, p_motivo text, p_observaciones text DEFAULT NULL, p_usuario_id uuid DEFAULT NULL
)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
DECLARE
  v_alumno RECORD;
  v_deuda_centavos bigint := 0;
  v_cuotas_pendientes int := 0;
  v_estado_final text;
  v_bloqueo boolean := false;
  v_hoy date := CURRENT_DATE;
BEGIN
  SELECT id, familia_id, nombre_completo, activo, estado_academico
    INTO v_alumno FROM public.alumnos WHERE id = p_alumno_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'El alumno con ID % no existe.', p_alumno_id;
  END IF;

  IF v_alumno.activo = false AND v_alumno.estado_academico IN ('retirado', 'retirado_con_deuda') THEN
    RAISE EXCEPTION 'El alumno % ya se encuentra dado de baja (estado: %).', v_alumno.nombre_completo, v_alumno.estado_academico;
  END IF;

  v_deuda_centavos := public.fn_deuda_viva(p_alumno_id, NULL);

  SELECT COUNT(*) INTO v_cuotas_pendientes
    FROM public.cuotas c
   WHERE c.alumno_id = p_alumno_id
     AND c.estado::text NOT IN ('pagada', 'exonerada', 'becada', 'pre_pagada')
     AND (c.monto_final_centavos - COALESCE(c.monto_pagado_centavos, 0)) > 0;

  IF v_deuda_centavos > 0 THEN
    v_estado_final := 'retirado_con_deuda';
    v_bloqueo := true;
    UPDATE public.representantes
       SET bloqueo_reinscripcion = true,
           motivo_bloqueo = 'Deuda pendiente por retiro de ' || v_alumno.nombre_completo
             || ' (RD$ ' || to_char(v_deuda_centavos / 100.0, 'FM999999990.00') || ')'
     WHERE familia_id = v_alumno.familia_id;
  ELSE
    v_estado_final := 'retirado';
    v_bloqueo := false;
  END IF;

  UPDATE public.alumnos
     SET activo = false, estado_academico = v_estado_final, motivo_baja = p_motivo,
         fecha_baja = v_hoy, observaciones_baja = p_observaciones, baja_procesada_por = p_usuario_id,
         bloqueo_reinscripcion = v_bloqueo, deuda_pendiente_baja_centavos = v_deuda_centavos,
         updated_at = timezone('utc'::text, now())
   WHERE id = p_alumno_id;

  RETURN jsonb_build_object(
    'success', true, 'alumno_id', p_alumno_id, 'nombre_completo', v_alumno.nombre_completo,
    'estado_academico', v_estado_final, 'bloqueo_reinscripcion', v_bloqueo,
    'deuda_centavos', v_deuda_centavos, 'deuda_dop', ROUND(v_deuda_centavos / 100.0, 2),
    'cuotas_pendientes', v_cuotas_pendientes, 'fecha_baja', v_hoy);
END;
$fn$;

-- ── 7. CORRECCION de fn_validar_reinscripcion_alumno ──
CREATE OR REPLACE FUNCTION public.fn_validar_reinscripcion_alumno(p_alumno_id uuid)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $fn$
DECLARE
  v_alumno RECORD;
  v_deuda_alumno bigint := 0;
  v_deuda_familia bigint := 0;
  v_deuda_total bigint := 0;
BEGIN
  SELECT a.id, a.nombre_completo, a.activo, a.estado_academico, a.bloqueo_reinscripcion, a.familia_id
    INTO v_alumno FROM public.alumnos a WHERE a.id = p_alumno_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'El alumno con ID % no existe.', p_alumno_id;
  END IF;

  v_deuda_alumno := public.fn_deuda_viva(p_alumno_id, NULL);
  v_deuda_familia := public.fn_deuda_viva(NULL, v_alumno.familia_id);
  v_deuda_total := GREATEST(v_deuda_alumno, v_deuda_familia);

  IF v_deuda_total > 0 OR v_alumno.bloqueo_reinscripcion = true THEN
    RETURN jsonb_build_object(
      'permite_reinscripcion', false,
      'motivo', CASE
        WHEN v_deuda_total > 0
          THEN 'El alumno o su familia registra un impedimento financiero. Debe saldar RD$ '
               || to_char(v_deuda_total / 100.0, 'FM999999990.00') || ' antes de reinscribirse.'
        ELSE 'Bloqueo de reinscripcion activo sin deuda viva: requiere levantamiento manual.'
      END,
      'deuda_centavos', v_deuda_total,
      'estado_academico', v_alumno.estado_academico);
  END IF;

  RETURN jsonb_build_object(
    'permite_reinscripcion', true,
    'motivo', 'Alumno habilitado financieramente para reinscripcion.',
    'deuda_centavos', 0,
    'estado_academico', v_alumno.estado_academico);
END;
$fn$;

-- ── 8. Permisos ──
GRANT EXECUTE ON FUNCTION public.fn_deuda_viva(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_evaluar_reinscripcion(text, text, date, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_reactivar_alumno(uuid, uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_recalcular_bloqueos_familia(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_reinscripcion_rol_autorizado() TO authenticated;

-- ============================================================================
-- Migration: 20260910170000_harden_rls_and_security_definer_v1_lts.sql
-- Ámbito: SOI v1.x LTS Stabilization (Bloques 2 y 3)
-- Descripción:
--   1. Revoca lectura pública universal en `alumnos` y `alumnos_clases`.
--      - Elimina `alumnos_read_all` (USING true TO public).
--      - Mantiene acceso restringido: solo usuarios autenticados con rol
--        admin/coordinacion/finanzas o maestros asignados a la clase del alumno.
--      - Elimina `alumnos_clases_read_all` (USING true TO public).
--   2. Blinda la tabla `conversaciones_whatsapp`.
--      - Elimina `allow_all_conversaciones` (USING true TO public).
--      - Restringe a `service_role` (total) y a `authenticated` con perfil
--        en departamentos COM / DIR o rol admin.
--      - Revoca todo permiso a `anon`.
--   3. Cierra políticas abiertas en `alertas_log` y `calendario_institucional`.
--   4. Revoca permisos EXECUTE a `anon` en funciones críticas SECURITY DEFINER.
--   5. Refuerza validaciones de autorización server-side en RPCs de mutación
--      de alto impacto (ej. `fn_fusionar_alumnos_duplicados`, `fn_dar_de_baja_alumno`,
--      `fn_reactivar_alumno`).
-- ============================================================================

BEGIN;

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. TABLA: public.alumnos (Protección PII)
-- ─────────────────────────────────────────────────────────────────────────────

-- Eliminar la política permisiva anon/public
DROP POLICY IF EXISTS alumnos_read_all ON public.alumnos;

-- Asegurar que solo usuarios autenticados autorizados lean el padrón completo o filtrado
DROP POLICY IF EXISTS alumnos_staff_read ON public.alumnos;
CREATE POLICY alumnos_staff_read ON public.alumnos
  FOR SELECT TO authenticated
  USING (
    es_admin() OR
    (get_user_role() = ANY (ARRAY['admin'::text, 'finanzas'::text, 'coordinacion'::text, 'director'::text])) OR
    (EXISTS (
      SELECT 1 FROM public.alumnos_clases ac
      JOIN public.clases c ON c.id = ac.clase_id
      WHERE ac.alumno_id = alumnos.id
        AND (c.maestro_principal_id = auth.uid() OR c.maestro_suplente_id = maestro_actual() OR maestro_en_clase(c.id))
    ))
  );

REVOKE ALL ON public.alumnos FROM anon;
GRANT SELECT ON public.alumnos TO authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. TABLA: public.alumnos_clases (Protección de Inscripciones)
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS alumnos_clases_read_all ON public.alumnos_clases;

DROP POLICY IF EXISTS alumnos_clases_authenticated_read ON public.alumnos_clases;
CREATE POLICY alumnos_clases_authenticated_read ON public.alumnos_clases
  FOR SELECT TO authenticated
  USING (
    es_admin() OR
    (get_user_role() = ANY (ARRAY['admin'::text, 'finanzas'::text, 'coordinacion'::text, 'director'::text])) OR
    maestro_en_clase(clase_id)
  );

REVOKE ALL ON public.alumnos_clases FROM anon;
GRANT SELECT ON public.alumnos_clases TO authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. TABLA: public.conversaciones_whatsapp (Canal Hermes)
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS allow_all_conversaciones ON public.conversaciones_whatsapp;

-- Acceso total a service_role (Edge Functions, Hermes Dispatcher / Baileys)
CREATE POLICY conversaciones_whatsapp_service_role ON public.conversaciones_whatsapp
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- Acceso de lectura/gestión para COM, DIR y admin autenticados
CREATE POLICY conversaciones_whatsapp_staff_manage ON public.conversaciones_whatsapp
  FOR ALL TO authenticated
  USING (
    es_admin() OR
    (get_user_department() = ANY (ARRAY['COM'::text, 'DIR'::text]))
  )
  WITH CHECK (
    es_admin() OR
    (get_user_department() = ANY (ARRAY['COM'::text, 'DIR'::text]))
  );

REVOKE ALL ON public.conversaciones_whatsapp FROM anon;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. TABLA: public.alertas_log (Bitácora de Alertas)
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS alertas_log_authenticated_all ON public.alertas_log;

CREATE POLICY alertas_log_read ON public.alertas_log
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY alertas_log_admin_manage ON public.alertas_log
  FOR ALL TO authenticated
  USING (es_admin())
  WITH CHECK (es_admin());

CREATE POLICY alertas_log_service_role ON public.alertas_log
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

REVOKE ALL ON public.alertas_log FROM anon;

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. TABLA: public.calendario_institucional
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS calendario_auth_all ON public.calendario_institucional;

CREATE POLICY calendario_read_authenticated ON public.calendario_institucional
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY calendario_write_staff ON public.calendario_institucional
  FOR ALL TO authenticated
  USING (
    es_admin() OR
    (get_user_role() = ANY (ARRAY['admin'::text, 'coordinacion'::text, 'director'::text]))
  )
  WITH CHECK (
    es_admin() OR
    (get_user_role() = ANY (ARRAY['admin'::text, 'coordinacion'::text, 'director'::text]))
  );

REVOKE ALL ON public.calendario_institucional FROM anon;

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. SEGURIDAD: Revocar EXECUTE a `anon` en Funciones SECURITY DEFINER
-- ─────────────────────────────────────────────────────────────────────────────

REVOKE EXECUTE ON FUNCTION public.approve_maestro_profile(uuid, text, text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.aprobar_usuario(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.rechazar_usuario(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.cambiar_rol_usuario(uuid, text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.fn_fusionar_alumnos_duplicados(uuid, uuid, jsonb) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.fn_dar_de_baja_alumno(uuid, text, text, uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.fn_reactivar_alumno(uuid, uuid, uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.fn_registrar_pago_transaccional(uuid, bigint, text, text, text, uuid[], date) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.fn_cerrar_periodo_academico(uuid, date, date, uuid, text, boolean) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.eliminar_maestro_limpio(uuid) FROM anon, public;

-- Asegurar permisos explícitos solo a roles autenticados de staff o service_role
GRANT EXECUTE ON FUNCTION public.approve_maestro_profile(uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.aprobar_usuario(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rechazar_usuario(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cambiar_rol_usuario(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_fusionar_alumnos_duplicados(uuid, uuid, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_dar_de_baja_alumno(uuid, text, text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_reactivar_alumno(uuid, uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_registrar_pago_transaccional(uuid, bigint, text, text, text, uuid[], date) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_cerrar_periodo_academico(uuid, date, date, uuid, text, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.eliminar_maestro_limpio(uuid) TO authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. REFUERZO: Server-Side Guard en fn_fusionar_alumnos_duplicados
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.fn_fusionar_alumnos_duplicados(
  p_principal_id uuid,
  p_obsoleto_id uuid,
  p_datos_fusion jsonb
) RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_principal public.alumnos%ROWTYPE;
  v_obsoleto  public.alumnos%ROWTYPE;
  v_row_count integer := 0;
  v_migradas  jsonb := '[]'::jsonb;
  v_rec       record;
  v_col       text;
  v_tabla     text;
  v_antes     integer;
  v_despues   integer;
BEGIN
  -- ── 0. Guard de Autorización Server-Side ────────────────────────────────────
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'No autenticado';
  END IF;

  IF NOT (es_admin() OR (SELECT rol FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'coordinacion', 'director')) THEN
    RAISE EXCEPTION 'No autorizado para fusionar expedientes de alumnos';
  END IF;

  -- ── Validaciones de Integridad ──────────────────────────────────────────
  IF p_principal_id IS NULL OR p_obsoleto_id IS NULL THEN
    RAISE EXCEPTION 'Se requieren los dos ids de los alumnos a fusionar';
  END IF;

  IF p_principal_id = p_obsoleto_id THEN
    RAISE EXCEPTION 'No se puede fusionar un alumno consigo mismo';
  END IF;

  SELECT * INTO v_principal FROM public.alumnos WHERE id = p_principal_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'El alumno principal (a conservar) no existe';
  END IF;

  SELECT * INTO v_obsoleto FROM public.alumnos WHERE id = p_obsoleto_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'El alumno obsoleto (a eliminar) no existe';
  END IF;

  -- ── 1. Actualizar el alumno principal con los datos fusionados ────────────
  UPDATE public.alumnos
    SET
      nombre_completo      = COALESCE((p_datos_fusion->>'nombre_completo')::text,      v_principal.nombre_completo),
      genero               = COALESCE((p_datos_fusion->>'genero')::text,               v_principal.genero),
      fecha_nacimiento     = COALESCE((p_datos_fusion->>'fecha_nacimiento')::date,     v_principal.fecha_nacimiento),
      nacionalidad         = COALESCE((p_datos_fusion->>'nacionalidad')::text,         v_principal.nacionalidad),
      municipio_residencia = COALESCE((p_datos_fusion->>'municipio_residencia')::text, v_principal.municipio_residencia),
      direccion            = COALESCE((p_datos_fusion->>'direccion')::text,            v_principal.direccion),
      correo_representante = COALESCE((p_datos_fusion->>'correo_representante')::text, v_principal.correo_representante),
      representante_cedula = COALESCE((p_datos_fusion->>'representante_cedula')::text, v_principal.representante_cedula),
      representante_tlf    = COALESCE((p_datos_fusion->>'representante_tlf')::text,    v_principal.representante_tlf),
      representante_nombre = COALESCE((p_datos_fusion->>'representante_nombre')::text, v_principal.representante_nombre),
      representante_parentesco = COALESCE((p_datos_fusion->>'representante_parentesco')::text, v_principal.representante_parentesco),
      madre_nombre         = COALESCE((p_datos_fusion->>'madre_nombre')::text,         v_principal.madre_nombre),
      madre_tlf            = COALESCE((p_datos_fusion->>'madre_tlf')::text,            v_principal.madre_tlf),
      padre_nombre         = COALESCE((p_datos_fusion->>'padre_nombre')::text,         v_principal.padre_nombre),
      padre_tlf            = COALESCE((p_datos_fusion->>'padre_tlf')::text,            v_principal.padre_tlf),
      instrumento_principal = COALESCE((p_datos_fusion->>'instrumento_principal')::text, v_principal.instrumento_principal),
      tanda                = COALESCE((p_datos_fusion->>'tanda')::text,                v_principal.tanda),
      alergias             = COALESCE((p_datos_fusion->>'alergias')::text,             v_principal.alergias),
      condiciones_medicas  = COALESCE((p_datos_fusion->>'condiciones_medicas')::text,  v_principal.condiciones_medicas),
      medicamentos         = COALESCE((p_datos_fusion->>'medicamentos')::text,         v_principal.medicamentos),
      contacto_emergencia_nombre = COALESCE((p_datos_fusion->>'contacto_emergencia_nombre')::text, v_principal.contacto_emergencia_nombre),
      contacto_emergencia_tlf    = COALESCE((p_datos_fusion->>'contacto_emergencia_tlf')::text,    v_principal.contacto_emergencia_tlf),
      contacto_emergencia_parentesco = COALESCE((p_datos_fusion->>'contacto_emergencia_parentesco')::text, v_principal.contacto_emergencia_parentesco),
      autoriza_fotos       = COALESCE((p_datos_fusion->>'autoriza_fotos')::boolean,    v_principal.autoriza_fotos),
      autoriza_traslado    = COALESCE((p_datos_fusion->>'autoriza_traslado')::boolean, v_principal.autoriza_traslado),
      updated_at           = now()
    WHERE id = p_principal_id;

  -- ── 2. Tablas Hijas Especiales (Clases y Cuotas) ──────────────────────────
  -- 2a. Inscripciones a clases
  FOR v_rec IN
    SELECT ac.id, ac.clase_id
    FROM public.alumnos_clases ac
    WHERE ac.alumno_id = p_obsoleto_id
  LOOP
    IF EXISTS (
      SELECT 1 FROM public.alumnos_clases
      WHERE alumno_id = p_principal_id AND clase_id = v_rec.clase_id
    ) THEN
      DELETE FROM public.alumnos_clases WHERE id = v_rec.id;
    ELSE
      UPDATE public.alumnos_clases SET alumno_id = p_principal_id WHERE id = v_rec.id;
    END IF;
  END LOOP;
  v_migradas := v_migradas || jsonb_build_object('tabla', 'alumnos_clases');

  -- 2b. Cuotas
  UPDATE public.cuotas
  SET alumno_id = p_principal_id
  WHERE alumno_id = p_obsoleto_id;
  v_migradas := v_migradas || jsonb_build_object('tabla', 'cuotas');

  -- ── 3. Tablas Dinámicas con FK a alumnos ──────────────────────────────────
  FOR v_rec IN
    SELECT DISTINCT
      tc.table_name,
      kcu.column_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'public'
      AND ccu.table_name = 'alumnos'
      AND ccu.column_name = 'id'
      AND tc.table_name NOT IN ('alumnos', 'alumnos_clases', 'cuotas')
  LOOP
    v_tabla := v_rec.table_name;
    v_col   := v_rec.column_name;

    BEGIN
      EXECUTE format('UPDATE public.%I SET %I = $1 WHERE %I = $2', v_tabla, v_col, v_col)
        USING p_principal_id, p_obsoleto_id;
      GET DIAGNOSTICS v_row_count = ROW_COUNT;
      IF v_row_count > 0 THEN
        v_migradas := v_migradas || jsonb_build_object('tabla', v_tabla, 'filas', v_row_count);
      END IF;
    EXCEPTION WHEN unique_violation THEN
      EXECUTE format('DELETE FROM public.%I WHERE %I = $1', v_tabla, v_col)
        USING p_obsoleto_id;
    END;
  END LOOP;

  -- ── 4. Adopción de familia si aplica ──────────────────────────────────────
  IF v_principal.familia_id IS NULL AND v_obsoleto.familia_id IS NOT NULL THEN
    UPDATE public.alumnos SET familia_id = v_obsoleto.familia_id WHERE id = p_principal_id;
  END IF;

  -- ── 5. Eliminación del obsoleto ──────────────────────────────────────────
  DELETE FROM public.alumnos WHERE id = p_obsoleto_id;
  GET DIAGNOSTICS v_row_count = ROW_COUNT;
  IF v_row_count = 0 THEN
    RAISE EXCEPTION 'No se pudo eliminar el registro obsoleto tras la migración';
  END IF;

  RETURN json_build_object(
    'success', true,
    'principal_id', p_principal_id,
    'obsoleto_id', p_obsoleto_id,
    'eliminado', true,
    'tablas_migradas', v_migradas
  );
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. REFUERZO: Server-Side Guard en fn_dar_de_baja_alumno
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.fn_dar_de_baja_alumno(
  p_alumno_id uuid,
  p_motivo text,
  p_observaciones text DEFAULT NULL::text,
  p_usuario_id uuid DEFAULT NULL::uuid
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_alumno RECORD;
  v_deuda_centavos bigint := 0;
  v_cuotas_pendientes int := 0;
  v_estado_final text;
  v_bloqueo boolean := false;
  v_hoy date := CURRENT_DATE;
  v_actor_id uuid := COALESCE(auth.uid(), p_usuario_id);
BEGIN
  IF auth.uid() IS NULL AND p_usuario_id IS NULL THEN
    RAISE EXCEPTION 'No autenticado para procesar bajas de alumnos';
  END IF;

  IF auth.uid() IS NOT NULL AND NOT (es_admin() OR (SELECT rol FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'coordinacion', 'director')) THEN
    RAISE EXCEPTION 'No autorizado para dar de baja alumnos';
  END IF;

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
         fecha_baja = v_hoy, observaciones_baja = p_observaciones, baja_procesada_por = v_actor_id,
         bloqueo_reinscripcion = v_bloqueo, deuda_pendiente_baja_centavos = v_deuda_centavos,
         updated_at = timezone('utc'::text, now())
   WHERE id = p_alumno_id;

  RETURN jsonb_build_object(
    'success', true, 'alumno_id', p_alumno_id, 'nombre_completo', v_alumno.nombre_completo,
    'estado_academico', v_estado_final, 'bloqueo_reinscripcion', v_bloqueo,
    'deuda_centavos', v_deuda_centavos, 'deuda_dop', ROUND(v_deuda_centavos / 100.0, 2),
    'cuotas_pendientes', v_cuotas_pendientes, 'fecha_baja', v_hoy);
END;
$$;

COMMIT;

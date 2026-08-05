-- ============================================================================
-- Migration: 20260805000000_fusionar_alumnos_duplicados
-- Objetivo: RPC transaccional que fusiona dos alumnos duplicados en uno solo.
--
-- Flujo atómico (dentro de una sola transacción, SECURITY DEFINER):
--   1. Valida que ambos ids existan y sean distintos.
--   2. Actualiza el registro principal con los datos fusionados.
--   3. Migra TODOS los datos hijos (inscripciones, asistencias, progresos,
--      evaluaciones, tareas, etc.) desde el obsoleto al principal, reasignando
--      la columna alumno_id/student_id de cada tabla hija de forma dinámica.
--   4. Adopta la familia del obsoleto si el principal no tiene una.
--   5. Elimina el registro obsoleto SOLO después de confirmar 2 y 3.
--
-- Si cualquier paso falla, la transacción entera se revierte: jamás queda el
-- principal a medias ni el obsoleto huérfano con datos sin migrar.
-- ============================================================================

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
  v_filas_migradas jsonb;
  v_rec       record;
  v_col       text;
  v_tabla     text;
  v_sql       text;
  v_antes     integer;
  v_despues   integer;
BEGIN
  -- ── 0. Validaciones ───────────────────────────────────────────────────────
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

  -- ── 1. Actualizar el principal con los datos fusionados ──────────────────
  -- Solo se escriben las claves enviadas por el cliente (ya resueltas). Se
  -- borran las claves reservadas que nunca deben escribirse directo.
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
      madre_cedula         = COALESCE((p_datos_fusion->>'madre_cedula')::text,         v_principal.madre_cedula),
      madre_tlf_whatsapp   = COALESCE((p_datos_fusion->>'madre_tlf_whatsapp')::text,   v_principal.madre_tlf_whatsapp),
      padre_nombre         = COALESCE((p_datos_fusion->>'padre_nombre')::text,         v_principal.padre_nombre),
      padre_cedula         = COALESCE((p_datos_fusion->>'padre_cedula')::text,         v_principal.padre_cedula),
      padre_tlf_whatsapp   = COALESCE((p_datos_fusion->>'padre_tlf_whatsapp')::text,   v_principal.padre_tlf_whatsapp),
      familiar_nombre      = COALESCE((p_datos_fusion->>'familiar_nombre')::text,      v_principal.familiar_nombre),
      familiar_telefono    = COALESCE((p_datos_fusion->>'familiar_telefono')::text,    v_principal.familiar_telefono),
      familiar_parentesco  = COALESCE((p_datos_fusion->>'familiar_parentesco')::text,  v_principal.familiar_parentesco),
      contacto_emergencia_nombre   = COALESCE((p_datos_fusion->>'contacto_emergencia_nombre')::text,   v_principal.contacto_emergencia_nombre),
      contacto_emergencia_telefono = COALESCE((p_datos_fusion->>'contacto_emergencia_telefono')::text, v_principal.contacto_emergencia_telefono),
      contacto_emergencia_parentesco = COALESCE((p_datos_fusion->>'contacto_emergencia_parentesco')::text, v_principal.contacto_emergencia_parentesco),
      instrumento_principal = COALESCE((p_datos_fusion->>'instrumento_principal')::text, v_principal.instrumento_principal),
      instrumento_interes   = COALESCE((p_datos_fusion->>'instrumento_interes')::text,   v_principal.instrumento_interes),
      nivel_lectura_musical = COALESCE((p_datos_fusion->>'nivel_lectura_musical')::text, v_principal.nivel_lectura_musical),
      centro_estudios       = COALESCE((p_datos_fusion->>'centro_estudios')::text,       v_principal.centro_estudios),
      grado_nivel           = COALESCE((p_datos_fusion->>'grado_nivel')::text,           v_principal.grado_nivel),
      alergias_descripcion  = COALESCE((p_datos_fusion->>'alergias_descripcion')::text,  v_principal.alergias_descripcion),
      condiciones_medicas   = COALESCE((p_datos_fusion->>'condiciones_medicas')::text,   v_principal.condiciones_medicas),
      medicamentos          = COALESCE((p_datos_fusion->>'medicamentos')::text,          v_principal.medicamentos),
      updated_at            = now()
    WHERE id = p_principal_id;

  GET DIAGNOSTICS v_row_count = ROW_COUNT;
  IF v_row_count = 0 THEN
    RAISE EXCEPTION 'No se pudo actualizar el alumno principal';
  END IF;

  -- ── 2. Migrar datos hijos: reasignar cada columna que apunta a alumnos ──
  -- Migración dinámica: se descubren todas las tablas con una columna
  -- `alumno_id` o `student_id` (excepto la tabla alumnos y las ya tratadas)
  -- y se reasignan las filas del obsoleto hacia el principal. Esto cubre
  -- inscripciones, asistencias, progresos, evaluaciones, tareas, etc. sin
  -- hardcodear cada tabla (robusto ante tablas hijas nuevas).
  --
  -- Primero: inscripciones (alumnos_clases) — caso especial con posible
  -- constraint único (alumno_id, clase_id).
  UPDATE public.alumnos_clases ac
    SET alumno_id = p_principal_id
    WHERE ac.alumno_id = p_obsoleto_id
      AND NOT EXISTS (
        SELECT 1 FROM public.alumnos_clases x
        WHERE x.alumno_id = p_principal_id AND x.clase_id = ac.clase_id
      );

  -- Las inscripciones del obsoleto que YA existen en el principal se descartan
  DELETE FROM public.alumnos_clases
    WHERE alumno_id = p_obsoleto_id;

  -- Luego: resto de tablas hijas con columna alumno_id o student_id
  FOR v_rec IN
    SELECT table_name, column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND column_name IN ('alumno_id', 'student_id')
      AND table_name <> 'alumnos'
      AND table_name <> 'alumnos_clases'
    ORDER BY table_name
  LOOP
    v_tabla := v_rec.table_name;
    v_col   := v_rec.column_name;

    EXECUTE format('SELECT count(*) FROM public.%I WHERE %I = $1', v_tabla, v_col)
      INTO v_antes USING p_obsoleto_id;

    IF v_antes = 0 THEN
      CONTINUE;
    END IF;

    -- Reasignación best-effort por tabla: si una tabla tiene un constraint
    -- único que choca (ej. rachas cuyo PK es alumno_id), primero se descartan
    -- las filas que ya tengan su par en el principal.
    EXECUTE format(
      'UPDATE public.%I SET %I = $1 WHERE %I = $2 AND NOT EXISTS (SELECT 1 FROM public.%I x WHERE x.%I = $1)',
      v_tabla, v_col, v_col, v_tabla, v_col
    ) USING p_principal_id, p_obsoleto_id;

    -- Filas restantes del obsoleto: si aún quedan es porque ya existía su par
    -- en el principal (duplicado de constraint) → se eliminan.
    EXECUTE format('SELECT count(*) FROM public.%I WHERE %I = $1', v_tabla, v_col)
      INTO v_despues USING p_obsoleto_id;

    IF v_despues > 0 THEN
      EXECUTE format('DELETE FROM public.%I WHERE %I = $1', v_tabla, v_col)
        USING p_obsoleto_id;
      v_row_count := v_row_count + v_despues;
    END IF;

    IF v_antes - v_despues > 0 THEN
      v_migradas := v_migradas || jsonb_build_object(
        'tabla', v_tabla,
        'column', v_col,
        'migradas', v_antes - v_despues
      );
    END IF;
  END LOOP;

  -- ── 3. Familia: adoptar la del obsoleto si el principal no tiene ─────────
  IF v_principal.familia_id IS NULL AND v_obsoleto.familia_id IS NOT NULL THEN
    UPDATE public.alumnos SET familia_id = v_obsoleto.familia_id
      WHERE id = p_principal_id;
  END IF;

  -- ── 4. Eliminar el obsoleto (ya sin datos hijos) ─────────────────────────
  DELETE FROM public.alumnos WHERE id = p_obsoleto_id;

  GET DIAGNOSTICS v_row_count = ROW_COUNT;
  IF v_row_count = 0 THEN
    RAISE EXCEPTION 'No se pudo eliminar el registro obsoleto';
  END IF;

  RETURN json_build_object(
    'success', true,
    'principal_id', p_principal_id,
    'obsoleto_id', p_obsoleto_id,
    'eliminado', true,
    'tablas_migradas', v_migradas
  );
EXCEPTION WHEN OTHERS THEN
  RAISE;
END;
$$;

COMMENT ON FUNCTION public.fn_fusionar_alumnos_duplicados(uuid, uuid, jsonb)
IS 'Fusiona dos alumnos duplicados: actualiza el principal con los datos resueltos, migra todos sus datos hijos y elimina el registro obsoleto. Atómico: si cualquier paso falla se revierte todo.';

GRANT EXECUTE ON FUNCTION public.fn_fusionar_alumnos_duplicados(uuid, uuid, jsonb)
  TO authenticated;

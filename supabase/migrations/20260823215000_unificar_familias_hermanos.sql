-- ============================================================================
-- Migration: 20260823215000_unificar_familias_hermanos.sql
-- Objetivo: Centralizar y unificar grupos familiares que tienen múltiples alumnos
--           (hermanos) repartidos en familias separadas (mismo teléfono/representante).
-- ============================================================================

-- 1. Función RPC para unificar explícitamente una lista de familias en una sola
CREATE OR REPLACE FUNCTION public.fn_unificar_familias_hermanos(
  p_familia_principal_id uuid,
  p_familias_secundarias_ids uuid[],
  p_nuevo_nombre_familia text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_alumnos_migrados int := 0;
  v_cuotas_migradas int := 0;
  v_pagos_migrados int := 0;
  v_wallet_migrados int := 0;
  v_secundarias_limpias uuid[];
BEGIN
  IF p_familia_principal_id IS NULL THEN
    RAISE EXCEPTION 'Se requiere el ID de la familia principal destino';
  END IF;

  -- Filtrar para no incluir la principal dentro de las secundarias
  SELECT array_agg(id)
  INTO v_secundarias_limpias
  FROM unnest(p_familias_secundarias_ids) AS id
  WHERE id IS NOT NULL AND id <> p_familia_principal_id;

  IF v_secundarias_limpias IS NULL OR array_length(v_secundarias_limpias, 1) = 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'No hay familias secundarias válidas para fusionar.'
    );
  END IF;

  -- 1. Actualizar nombre de la familia principal si se proporciona
  IF p_nuevo_nombre_familia IS NOT NULL AND length(trim(p_nuevo_nombre_familia)) > 0 THEN
    UPDATE public.familias
    SET nombre_familia = trim(p_nuevo_nombre_familia)
    WHERE id = p_familia_principal_id;
  END IF;

  -- 2. Migrar alumnos a la familia principal
  WITH upd_alumnos AS (
    UPDATE public.alumnos
    SET familia_id = p_familia_principal_id,
        updated_at = now()
    WHERE familia_id = ANY(v_secundarias_limpias)
    RETURNING id
  )
  SELECT count(*) INTO v_alumnos_migrados FROM upd_alumnos;

  -- 3. Migrar cuotas a la familia principal
  WITH upd_cuotas AS (
    UPDATE public.cuotas
    SET familia_id = p_familia_principal_id
    WHERE familia_id = ANY(v_secundarias_limpias)
    RETURNING id
  )
  SELECT count(*) INTO v_cuotas_migradas FROM upd_cuotas;

  -- 4. Migrar pagos a la familia principal
  WITH upd_pagos AS (
    UPDATE public.pagos
    SET familia_id = p_familia_principal_id
    WHERE familia_id = ANY(v_secundarias_limpias)
    RETURNING id
  )
  SELECT count(*) INTO v_pagos_migrados FROM upd_pagos;

  -- 5. Migrar movimientos de wallet si existen
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'wallet_movimientos') THEN
    WITH upd_wallet AS (
      UPDATE public.wallet_movimientos
      SET familia_id = p_familia_principal_id
      WHERE familia_id = ANY(v_secundarias_limpias)
      RETURNING id
    )
    SELECT count(*) INTO v_wallet_migrados FROM upd_wallet;
  END IF;

  -- 6. Migrar beneficios de alumnos si existen
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'alumnos_beneficios') THEN
    -- alumnos_beneficios ya apunta a alumno_id, el alumno ya fue reasignado
    NULL;
  END IF;

  -- 7. Limpiar representantes huérfanos de las familias secundarias
  DELETE FROM public.representantes
  WHERE familia_id = ANY(v_secundarias_limpias);

  -- 8. Eliminar las familias secundarias vacías
  DELETE FROM public.familias
  WHERE id = ANY(v_secundarias_limpias);

  RETURN jsonb_build_object(
    'success', true,
    'familia_principal_id', p_familia_principal_id,
    'alumnos_migrados', v_alumnos_migrados,
    'cuotas_migradas', v_cuotas_migradas,
    'pagos_migrados', v_pagos_migrados,
    'familias_eliminadas', array_length(v_secundarias_limpias, 1)
  );
END;
$$;

-- 2. Función RPC para buscar y consolidar automáticamente familias por teléfono
CREATE OR REPLACE FUNCTION public.fn_auto_consolidar_familias_hermanos()
RETURNS TABLE (
  telefono text,
  nombre_unificado text,
  alumnos_unificados text,
  familias_procesadas int
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_grupo record;
  v_principal_id uuid;
  v_secundarias_ids uuid[];
  v_nuevo_nombre text;
  v_res jsonb;
BEGIN
  -- Identificar grupos de alumnos con el mismo teléfono de contacto y más de 1 familia
  FOR v_grupo IN
    WITH normalizados AS (
      SELECT 
        a.id AS alumno_id,
        a.nombre_completo,
        a.familia_id,
        f.nombre_familia,
        NULLIF(regexp_replace(COALESCE(a.representante_tlf, a.familiar_telefono, a.contacto_emergencia_telefono, r.telefono_whatsapp), '\D', '', 'g'), '') AS tlf
      FROM public.alumnos a
      LEFT JOIN public.familias f ON f.id = a.familia_id
      LEFT JOIN public.representantes r ON r.familia_id = a.familia_id
      WHERE a.activo = true AND a.familia_id IS NOT NULL
    )
    SELECT 
      tlf,
      array_agg(DISTINCT familia_id) AS fam_ids,
      string_agg(DISTINCT nombre_completo, ', ') AS lista_alumnos,
      max(COALESCE(nombre_familia, 'Familia')) AS nombre_base
    FROM normalizados
    WHERE tlf IS NOT NULL AND length(tlf) >= 7
    GROUP BY tlf
    HAVING COUNT(DISTINCT familia_id) > 1
  LOOP
    v_principal_id := v_grupo.fam_ids[1];
    v_secundarias_ids := v_grupo.fam_ids[2:array_length(v_grupo.fam_ids, 1)];
    
    -- Ajustar el nombre si contiene "(familia)" redundante
    v_nuevo_nombre := regexp_replace(v_grupo.nombre_base, '\s*\(familia\)', '', 'gi');

    -- Ejecutar unificación
    v_res := public.fn_unificar_familias_hermanos(v_principal_id, v_secundarias_ids, v_nuevo_nombre);

    telefono := v_grupo.tlf;
    nombre_unificado := v_nuevo_nombre;
    alumnos_unificados := v_grupo.lista_alumnos;
    familias_procesadas := array_length(v_grupo.fam_ids, 1);
    RETURN NEXT;
  END LOOP;
END;
$$;

-- 3. Ejecutar la unificación automática de datos históricos inmediatamente
DO $$
DECLARE
  v_reg record;
BEGIN
  FOR v_reg IN SELECT * FROM public.fn_auto_consolidar_familias_hermanos()
  LOOP
    RAISE NOTICE 'Grupo unificado con teléfono %: % (Alumnos: %)', v_reg.telefono, v_reg.nombre_unificado, v_reg.alumnos_unificados;
  END LOOP;
END $$;

-- 4. Permisos
REVOKE ALL ON FUNCTION public.fn_unificar_familias_hermanos(uuid, uuid[], text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.fn_auto_consolidar_familias_hermanos() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fn_unificar_familias_hermanos(uuid, uuid[], text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.fn_auto_consolidar_familias_hermanos() TO authenticated, service_role;

NOTIFY pgrst, 'reload schema';

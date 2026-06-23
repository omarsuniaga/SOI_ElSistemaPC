-- Migration: Módulo Inventario RPC Functions
-- Timestamp: 20260622_2
-- Date: 2026-06-22
-- Purpose: Implementar las funciones RPC requeridas por el módulo de inventario profesional
--          para corregir el error del Dashboard y habilitar las acciones operativas.
-- Status: PENDING

-- 1. DROP FUNCTIONS IF EXISTS FOR IDEMPOTENT RUNS
DROP FUNCTION IF EXISTS public.obtener_kpi_inventario();
DROP FUNCTION IF EXISTS public.cambiar_estado_activo(UUID, TEXT);
DROP FUNCTION IF EXISTS public.crear_reparacion(UUID, TEXT, TEXT, TEXT, NUMERIC, TEXT);
DROP FUNCTION IF EXISTS public.cambiar_estado_reparacion(UUID, TEXT);
DROP FUNCTION IF EXISTS public.intercambiar_instrumentos(UUID, UUID, UUID);
DROP FUNCTION IF EXISTS public.renovar_comodato(UUID, DATE, TEXT);
DROP FUNCTION IF EXISTS public.generar_contrato_pdf(UUID);
DROP FUNCTION IF EXISTS public.generar_reporte_inventario(TEXT, JSONB);

-- =====================================================================
-- 2. Función: obtener_kpi_inventario
-- =====================================================================
CREATE OR REPLACE FUNCTION public.obtener_kpi_inventario()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_resumen jsonb;
  v_distribucion jsonb;
  v_comodatos_vencidos integer;
  v_comodatos_proximos_vencer integer;
  v_total_en_reparacion integer;
BEGIN
  -- Verificar autenticación
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'No auth context';
  END IF;

  -- Verificar roles
  IF NOT es_admin() THEN
    RAISE EXCEPTION 'Unauthorized: solo admins e inventaristas pueden acceder a los KPIs';
  END IF;

  -- Calcular el resumen de inventario
  SELECT jsonb_build_object(
    'total', COUNT(*),
    'disponibles', COUNT(*) FILTER (WHERE estado_uso = 'disponible'),
    'en_uso', COUNT(*) FILTER (WHERE estado_uso = 'prestado'),
    'ociosos', (SELECT COUNT(*)::integer FROM public.comodatos_activos WHERE estado = 'activo'),
    'en_reparacion', COUNT(*) FILTER (WHERE estado_uso = 'en_reparacion'),
    'de_baja', COUNT(*) FILTER (WHERE estado_uso = 'de_baja'),
    'valor_total', COALESCE(SUM(valor_adquisicion), 0)
  ) INTO v_resumen
  FROM public.inventario_activos
  WHERE activo = TRUE;

  -- Calcular la distribución por tipo (solo activos)
  SELECT COALESCE(jsonb_object_agg(COALESCE(tipo_instrumento, 'Sin tipo'), cnt), '{}'::jsonb) INTO v_distribucion
  FROM (
    SELECT tipo_instrumento, COUNT(*)::integer AS cnt
    FROM public.inventario_activos
    WHERE activo = TRUE
    GROUP BY tipo_instrumento
  ) t;

  -- Calcular comodatos vencidos (estado = 'activo' y fecha_vencimiento < hoy)
  SELECT COUNT(*)::integer INTO v_comodatos_vencidos
  FROM public.comodatos_activos
  WHERE estado = 'activo' AND fecha_vencimiento < CURRENT_DATE;

  -- Calcular comodatos próximos a vencer (estado = 'activo' y fecha_vencimiento entre hoy y hoy + 7 días)
  SELECT COUNT(*)::integer INTO v_comodatos_proximos_vencer
  FROM public.comodatos_activos
  WHERE estado = 'activo' 
    AND fecha_vencimiento >= CURRENT_DATE 
    AND fecha_vencimiento <= CURRENT_DATE + INTERVAL '7 days';

  -- Calcular total en reparación (estado en_reparacion o recibido)
  SELECT COUNT(*)::integer INTO v_total_en_reparacion
  FROM public.inventario_reparaciones
  WHERE estado IN ('en_reparacion', 'recibido');

  -- Retornar el objeto estructurado
  RETURN jsonb_build_object(
    'resumen', v_resumen,
    'distribucion_por_tipo', v_distribucion,
    'comodatos_vencidos', v_comodatos_vencidos,
    'comodatos_proximos_vencer', v_comodatos_proximos_vencer,
    'total_en_reparacion', v_total_en_reparacion
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.obtener_kpi_inventario() TO authenticated;

-- =====================================================================
-- 3. Función: cambiar_estado_activo
-- =====================================================================
CREATE OR REPLACE FUNCTION public.cambiar_estado_activo(
  p_id UUID,
  p_nuevo_estado TEXT
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_updated RECORD;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'No auth context';
  END IF;
  
  IF NOT es_admin() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  UPDATE public.inventario_activos
  SET estado_uso = p_nuevo_estado,
      updated_at = NOW()
  WHERE id = p_id
  RETURNING * INTO v_updated;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Activo no encontrado';
  END IF;

  RETURN to_jsonb(v_updated);
END;
$$;

GRANT EXECUTE ON FUNCTION public.cambiar_estado_activo(UUID, TEXT) TO authenticated;

-- =====================================================================
-- 4. Función: crear_reparacion
-- =====================================================================
CREATE OR REPLACE FUNCTION public.crear_reparacion(
  p_activo_id UUID,
  p_tipo_tallerista TEXT,
  p_tallerista_nombre TEXT,
  p_descripcion TEXT,
  p_costo_estimado NUMERIC,
  p_proveedor_factura_url TEXT DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_inserted RECORD;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'No auth context';
  END IF;
  
  IF NOT es_admin() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  INSERT INTO public.inventario_reparaciones (
    activo_id,
    tipo_tallerista,
    tallerista_nombre,
    descripcion,
    costo_estimado,
    proveedor_factura_url,
    estado
  ) VALUES (
    p_activo_id,
    p_tipo_tallerista,
    p_tallerista_nombre,
    p_descripcion,
    p_costo_estimado,
    p_proveedor_factura_url,
    'recibido'
  )
  RETURNING * INTO v_inserted;

  RETURN to_jsonb(v_inserted);
END;
$$;

GRANT EXECUTE ON FUNCTION public.crear_reparacion(UUID, TEXT, TEXT, TEXT, NUMERIC, TEXT) TO authenticated;

-- =====================================================================
-- 5. Función: cambiar_estado_reparacion
-- =====================================================================
CREATE OR REPLACE FUNCTION public.cambiar_estado_reparacion(
  p_id UUID,
  p_nuevo_estado TEXT
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_updated RECORD;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'No auth context';
  END IF;
  
  IF NOT es_admin() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  UPDATE public.inventario_reparaciones
  SET estado = p_nuevo_estado,
      fecha_egreso = CASE WHEN p_nuevo_estado = 'entregado' THEN CURRENT_DATE ELSE fecha_egreso END,
      updated_at = NOW()
  WHERE id = p_id
  RETURNING * INTO v_updated;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Reparación no encontrada';
  END IF;

  RETURN to_jsonb(v_updated);
END;
$$;

GRANT EXECUTE ON FUNCTION public.cambiar_estado_reparacion(UUID, TEXT) TO authenticated;

-- =====================================================================
-- 6. Función: intercambiar_instrumentos
-- =====================================================================
CREATE OR REPLACE FUNCTION public.intercambiar_instrumentos(
  p_comodato_origen_id UUID,
  p_activo_destino_id UUID,
  p_alumno_id UUID
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_comodato_origen RECORD;
  v_comodato_destino RECORD;
  v_activo_origen RECORD;
  v_activo_destino RECORD;
  v_result jsonb;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'No auth context';
  END IF;
  
  IF NOT es_admin() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Obtener comodato de origen
  SELECT * INTO v_comodato_origen
  FROM public.comodatos_activos
  WHERE id = p_comodato_origen_id AND estado = 'activo';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Comodato origen no encontrado o no está activo';
  END IF;

  -- Obtener activo de destino
  SELECT * INTO v_activo_destino
  FROM public.inventario_activos
  WHERE id = p_activo_destino_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Activo destino no encontrado';
  END IF;

  -- Obtener activo de origen
  SELECT * INTO v_activo_origen
  FROM public.inventario_activos
  WHERE id = v_comodato_origen.activo_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Activo origen no encontrado';
  END IF;

  -- Buscar si el activo de destino tiene un comodato activo (intercambio mutuo)
  SELECT * INTO v_comodato_destino
  FROM public.comodatos_activos
  WHERE activo_id = p_activo_destino_id AND estado = 'activo';

  IF FOUND THEN
    -- CASO A: Intercambio mutuo
    UPDATE public.comodatos_activos
    SET activo_id = p_activo_destino_id,
        intercambiado_con_id = v_comodato_destino.id,
        updated_at = NOW()
    WHERE id = p_comodato_origen_id;

    UPDATE public.comodatos_activos
    SET activo_id = v_comodato_origen.activo_id,
        intercambiado_con_id = p_comodato_origen_id,
        updated_at = NOW()
    WHERE id = v_comodato_destino.id;

    INSERT INTO public.inventario_historial (activo_id, tipo_evento, descripcion, usuario_id, metadata)
    VALUES 
      (v_comodato_origen.activo_id, 'intercambio', 'Instrumento intercambiado. Destinatario original asignado a nuevo instrumento.', auth.uid(), jsonb_build_object('comodato_origen', p_comodato_origen_id, 'comodato_destino', v_comodato_destino.id)),
      (p_activo_destino_id, 'intercambio', 'Instrumento intercambiado. Destinatario original asignado a nuevo instrumento.', auth.uid(), jsonb_build_object('comodato_origen', p_comodato_origen_id, 'comodato_destino', v_comodato_destino.id));

    v_result := jsonb_build_object(
      'comodatoOrigen', (SELECT to_jsonb(t) FROM public.comodatos_activos t WHERE id = p_comodato_origen_id),
      'comodatoDestino', (SELECT to_jsonb(t) FROM public.comodatos_activos t WHERE id = v_comodato_destino.id)
    );
  ELSE
    -- CASO B: Transferir el comodato origen a un instrumento libre (p_activo_destino_id)
    UPDATE public.comodatos_activos
    SET activo_id = p_activo_destino_id,
        intercambiado_con_id = NULL,
        updated_at = NOW()
    WHERE id = p_comodato_origen_id;

    UPDATE public.inventario_activos
    SET estado_uso = 'disponible',
        updated_at = NOW()
    WHERE id = v_comodato_origen.activo_id;

    UPDATE public.inventario_activos
    SET estado_uso = 'prestado',
        updated_at = NOW()
    WHERE id = p_activo_destino_id;

    INSERT INTO public.inventario_historial (activo_id, tipo_evento, descripcion, usuario_id, metadata)
    VALUES 
      (v_comodato_origen.activo_id, 'cambio_estado', 'Comodato transferido a otro instrumento. Estado cambiado a disponible.', auth.uid(), jsonb_build_object('comodato_id', p_comodato_origen_id)),
      (p_activo_destino_id, 'cambio_estado', 'Comodato asignado por transferencia. Estado cambiado a prestado.', auth.uid(), jsonb_build_object('comodato_id', p_comodato_origen_id));

    v_result := jsonb_build_object(
      'comodatoOrigen', (SELECT to_jsonb(t) FROM public.comodatos_activos t WHERE id = p_comodato_origen_id)
    );
  END IF;

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.intercambiar_instrumentos(UUID, UUID, UUID) TO authenticated;

-- =====================================================================
-- 7. Función: renovar_comodato
-- =====================================================================
CREATE OR REPLACE FUNCTION public.renovar_comodato(
  p_comodato_id UUID,
  p_nueva_fecha_vencimiento DATE,
  p_nuevo_tipo TEXT
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_old_comodato RECORD;
  v_new_comodato RECORD;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'No auth context';
  END IF;
  
  IF NOT es_admin() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Obtener comodato viejo
  SELECT * INTO v_old_comodato
  FROM public.comodatos_activos
  WHERE id = p_comodato_id AND estado = 'activo';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Comodato no encontrado o no está activo';
  END IF;

  -- Marcar como renovado
  UPDATE public.comodatos_activos
  SET estado = 'renovado',
      fecha_devolucion = CURRENT_DATE
  WHERE id = p_comodato_id;

  -- Crear nuevo comodato
  INSERT INTO public.comodatos_activos (
    activo_id,
    alumno_id,
    tipo_comodato,
    fecha_entrega,
    fecha_vencimiento,
    renovado_de_id,
    estado,
    registrado_por
  ) VALUES (
    v_old_comodato.activo_id,
    v_old_comodato.alumno_id,
    p_nuevo_tipo,
    CURRENT_DATE,
    p_nueva_fecha_vencimiento,
    p_comodato_id,
    'activo',
    auth.uid()
  )
  RETURNING * INTO v_new_comodato;

  -- Registrar en el historial del activo
  INSERT INTO public.inventario_historial (activo_id, tipo_evento, descripcion, usuario_id, metadata)
  VALUES (
    v_old_comodato.activo_id,
    'renovacion',
    'Comodato renovado. Nueva fecha de vencimiento: ' || COALESCE(p_nueva_fecha_vencimiento::text, 'sin fecha'),
    auth.uid(),
    jsonb_build_object('comodato_anterior', p_comodato_id, 'comodato_nuevo', v_new_comodato.id)
  );

  RETURN jsonb_build_object(
    'viejo', (SELECT to_jsonb(t) FROM public.comodatos_activos t WHERE id = p_comodato_id),
    'nuevo', to_jsonb(v_new_comodato)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.renovar_comodato(UUID, DATE, TEXT) TO authenticated;

-- =====================================================================
-- 8. Función: generar_contrato_pdf
-- =====================================================================
CREATE OR REPLACE FUNCTION public.generar_contrato_pdf(
  p_comodato_id UUID
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_comodato RECORD;
BEGIN
  SELECT * INTO v_comodato FROM public.comodatos_activos WHERE id = p_comodato_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Comodato no encontrado';
  END IF;
  
  RETURN jsonb_build_object(
    'url', COALESCE(v_comodato.contrato_firmado_url, 'https://storage.test/comodatos/' || p_comodato_id || '/contrato.pdf'),
    'comodatoId', p_comodato_id
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.generar_contrato_pdf(UUID) TO authenticated;

-- =====================================================================
-- 9. Función: generar_reporte_inventario
-- =====================================================================
CREATE OR REPLACE FUNCTION public.generar_reporte_inventario(
  p_tipo TEXT,
  p_filtros JSONB DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_resumen jsonb;
  v_por_tipo jsonb;
  v_por_estado jsonb;
  v_total_reparaciones integer;
  v_total_comodatos integer;
  v_activos_comodatos integer;
  v_datos jsonb;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'No auth context';
  END IF;
  
  IF NOT es_admin() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  IF p_tipo = 'general' OR p_tipo = 'resumen' THEN
    SELECT jsonb_build_object(
      'total', COUNT(*),
      'disponibles', COUNT(*) FILTER (WHERE estado_uso = 'disponible'),
      'en_uso', COUNT(*) FILTER (WHERE estado_uso = 'prestado'),
      'ociosos', (SELECT COUNT(*)::integer FROM public.comodatos_activos WHERE estado = 'activo'),
      'en_reparacion', COUNT(*) FILTER (WHERE estado_uso = 'en_reparacion'),
      'de_baja', COUNT(*) FILTER (WHERE estado_uso = 'de_baja'),
      'valor_total', COALESCE(SUM(valor_adquisicion), 0)
    ) INTO v_resumen
    FROM public.inventario_activos
    WHERE activo = TRUE;

    IF p_tipo = 'general' THEN
      v_datos := v_resumen;
    ELSE
      SELECT COALESCE(jsonb_object_agg(COALESCE(tipo_instrumento, 'Sin tipo'), cnt), '{}'::jsonb) INTO v_por_tipo
      FROM (
        SELECT tipo_instrumento, COUNT(*)::integer AS cnt
        FROM public.inventario_activos
        WHERE activo = TRUE
        GROUP BY tipo_instrumento
      ) t;
      v_datos := jsonb_build_object(
        'resumen', v_resumen,
        'por_tipo', v_por_tipo
      );
    END IF;

  ELSIF p_tipo = 'reparaciones' THEN
    SELECT COUNT(*)::integer INTO v_total_reparaciones
    FROM public.inventario_reparaciones;

    SELECT COALESCE(jsonb_object_agg(COALESCE(estado, 'Sin estado'), cnt), '{}'::jsonb) INTO v_por_estado
    FROM (
      SELECT estado, COUNT(*)::integer AS cnt
      FROM public.inventario_reparaciones
      GROUP BY estado
    ) t;

    v_datos := jsonb_build_object(
      'total', v_total_reparaciones,
      'por_estado', v_por_estado
    );

  ELSIF p_tipo = 'comodatos' THEN
    SELECT COUNT(*)::integer INTO v_total_comodatos
    FROM public.comodatos_activos;

    SELECT COUNT(*)::integer INTO v_activos_comodatos
    FROM public.comodatos_activos
    WHERE estado = 'activo';

    v_datos := jsonb_build_object(
      'total', v_total_comodatos,
      'activos', v_activos_comodatos
    );
  ELSE
    v_datos := '{}'::jsonb;
  END IF;

  RETURN jsonb_build_object(
    'tipo', p_tipo,
    'fecha_generacion', NOW()::text,
    'filtros_aplicados', p_filtros,
    'datos', v_datos
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.generar_reporte_inventario(TEXT, JSONB) TO authenticated;

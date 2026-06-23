-- Patch de compatibilidad para el módulo de inventario profesional
-- El Sistema Punta Cana / SOI
-- Fecha: 2026-06-22
-- Objetivo: corregir bloqueos detectados antes de ejecutar las RPC y permitir importación fiel del CSV normalizado.

BEGIN;

-- 1) La RPC intercambiar_instrumentos() actualiza comodatos_activos.updated_at,
-- pero la tabla base no define esa columna.
ALTER TABLE public.comodatos_activos
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- 2) La RPC inserta eventos 'intercambio' y 'renovacion',
-- pero el CHECK original de inventario_historial.tipo_evento no los permite.
ALTER TABLE public.inventario_historial
  DROP CONSTRAINT IF EXISTS inventario_historial_tipo_evento_check;

ALTER TABLE public.inventario_historial
  ADD CONSTRAINT inventario_historial_tipo_evento_check
  CHECK (tipo_evento IN (
    'asignacion',
    'devolucion',
    'reparacion',
    'cambio_estado',
    'baja',
    'creacion',
    'observacion',
    'intercambio',
    'renovacion'
  ));

-- 3) Columnas auxiliares para no perder información del inventario histórico importado.
-- Estas columnas pueden mantenerse como metadatos operativos o migrarse luego a tablas más específicas.
ALTER TABLE public.inventario_activos
  ADD COLUMN IF NOT EXISTS familia TEXT,
  ADD COLUMN IF NOT EXISTS nombre_normalizado TEXT,
  ADD COLUMN IF NOT EXISTS tamano TEXT,
  ADD COLUMN IF NOT EXISTS cantidad NUMERIC DEFAULT 1,
  ADD COLUMN IF NOT EXISTS unidad TEXT DEFAULT 'unidad',
  ADD COLUMN IF NOT EXISTS estado_asignacion_original TEXT,
  ADD COLUMN IF NOT EXISTS asignado_a_texto TEXT,
  ADD COLUMN IF NOT EXISTS requiere_mantenimiento BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS tiene_arco BOOLEAN,
  ADD COLUMN IF NOT EXISTS tiene_estuche BOOLEAN,
  ADD COLUMN IF NOT EXISTS tiene_funda BOOLEAN,
  ADD COLUMN IF NOT EXISTS tiene_hombrera_almohadilla BOOLEAN,
  ADD COLUMN IF NOT EXISTS faltantes_detectados TEXT,
  ADD COLUMN IF NOT EXISTS donante_inferido TEXT,
  ADD COLUMN IF NOT EXISTS codigo_donante TEXT,
  ADD COLUMN IF NOT EXISTS fuente_importacion TEXT,
  ADD COLUMN IF NOT EXISTS numero_original TEXT,
  ADD COLUMN IF NOT EXISTS fila_origen_csv INTEGER,
  ADD COLUMN IF NOT EXISTS revisar BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS alertas_calidad TEXT,
  ADD COLUMN IF NOT EXISTS import_metadata JSONB NOT NULL DEFAULT '{}'::jsonb;

-- 4) Índices útiles para el dashboard y los filtros.
CREATE INDEX IF NOT EXISTS idx_inventario_activos_familia
  ON public.inventario_activos (familia)
  WHERE activo = TRUE;

CREATE INDEX IF NOT EXISTS idx_inventario_activos_requiere_mantenimiento
  ON public.inventario_activos (requiere_mantenimiento)
  WHERE activo = TRUE;

CREATE INDEX IF NOT EXISTS idx_inventario_activos_asignado_a_texto
  ON public.inventario_activos (asignado_a_texto)
  WHERE asignado_a_texto IS NOT NULL;

-- 5) Validación defensiva en cambios de estado.
-- Evita que una llamada RPC inserte estados fuera del contrato.
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

  IF p_nuevo_estado NOT IN ('disponible', 'prestado', 'en_mantenimiento', 'en_reparacion', 'de_baja') THEN
    RAISE EXCEPTION 'Estado de uso inválido: %', p_nuevo_estado;
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

-- 6) Validación defensiva en estados de reparación.
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

  IF p_nuevo_estado NOT IN ('recibido', 'en_reparacion', 'finalizado', 'entregado') THEN
    RAISE EXCEPTION 'Estado de reparación inválido: %', p_nuevo_estado;
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

COMMIT;

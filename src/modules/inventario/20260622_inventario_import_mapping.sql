-- Importación del CSV normalizado hacia el esquema del agente
-- El Sistema Punta Cana / SOI
-- Fecha: 2026-06-22
--
-- Orden recomendado:
-- 1. Ejecutar 20260622_erp_finanzas_inventario.sql
-- 2. Ejecutar 20260622_inventario_profesional.sql
-- 3. Ejecutar 20260622_inventario_patch_compatibilidad.sql
-- 4. Crear esta tabla staging.
-- 5. Importar inventario_supabase_import.csv a public.inventario_import_staging desde Supabase Table Editor.
-- 6. Ejecutar los INSERT de esta migración.
-- 7. Ejecutar 20260622_inventario_rpc_functions.sql
--
-- Nota: este script conserva los datos importados en staging para auditoría.

BEGIN;

CREATE TABLE IF NOT EXISTS public.inventario_import_staging (
  codigo_importacion TEXT PRIMARY KEY,
  codigo_interno_original TEXT,
  familia TEXT,
  tipo_item TEXT,
  nombre_item TEXT,
  nombre_normalizado TEXT,
  tamano TEXT,
  marca TEXT,
  modelo TEXT,
  serial TEXT,
  cantidad TEXT,
  unidad TEXT,
  ubicacion_actual TEXT,
  estado_asignacion TEXT,
  asignado_a TEXT,
  estado_fisico TEXT,
  requiere_mantenimiento TEXT,
  tiene_arco TEXT,
  tiene_estuche TEXT,
  tiene_funda TEXT,
  tiene_hombrera_almohadilla TEXT,
  faltantes_detectados TEXT,
  donante_inferido TEXT,
  codigo_donante TEXT,
  observaciones TEXT,
  tags TEXT,
  activo TEXT,
  fuente_seccion TEXT,
  numero_original TEXT,
  fila_origen_csv TEXT,
  revisar TEXT,
  alertas_calidad TEXT,
  imported_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.inventario_import_staging
  IS 'Tabla temporal/auditable para importar inventario_supabase_import.csv antes de normalizar a inventario_activos e inventario_accesorios.';

-- Instrumentos principales.
INSERT INTO public.inventario_activos (
  codigo_inventario,
  tipo_instrumento,
  marca,
  modelo,
  numero_serie,
  estado_conservacion,
  estado_uso,
  ubicacion,
  activo,
  notas,
  familia,
  nombre_normalizado,
  tamano,
  cantidad,
  unidad,
  estado_asignacion_original,
  asignado_a_texto,
  requiere_mantenimiento,
  tiene_arco,
  tiene_estuche,
  tiene_funda,
  tiene_hombrera_almohadilla,
  faltantes_detectados,
  donante_inferido,
  codigo_donante,
  fuente_importacion,
  numero_original,
  fila_origen_csv,
  revisar,
  alertas_calidad,
  import_metadata
)
SELECT
  NULLIF(TRIM(codigo_importacion), '') AS codigo_inventario,
  COALESCE(NULLIF(TRIM(nombre_normalizado), ''), NULLIF(TRIM(nombre_item), ''), 'sin_clasificar') AS tipo_instrumento,
  NULLIF(TRIM(marca), '') AS marca,
  NULLIF(TRIM(modelo), '') AS modelo,
  NULLIF(TRIM(serial), '') AS numero_serie,

  CASE
    WHEN LOWER(COALESCE(estado_asignacion, '')) = 'fuera_de_servicio' THEN 'de_baja'
    WHEN LOWER(COALESCE(estado_fisico, '')) = 'excelente' THEN 'excelente'
    WHEN LOWER(COALESCE(estado_fisico, '')) = 'bueno' THEN 'bueno'
    WHEN LOWER(COALESCE(estado_fisico, '')) = 'regular' THEN 'regular'
    WHEN LOWER(COALESCE(estado_fisico, '')) IN ('requiere_mantenimiento', 'dañado', 'danado') THEN 'mantenimiento'
    ELSE 'regular'
  END AS estado_conservacion,

  CASE
    WHEN LOWER(COALESCE(estado_asignacion, '')) = 'asignado' THEN 'prestado'
    WHEN LOWER(COALESCE(estado_asignacion, '')) = 'en_taller' THEN 'en_reparacion'
    WHEN LOWER(COALESCE(estado_asignacion, '')) = 'fuera_de_servicio' THEN 'de_baja'
    ELSE 'disponible'
  END AS estado_uso,

  COALESCE(NULLIF(TRIM(ubicacion_actual), ''), 'Sede Principal') AS ubicacion,

  CASE
    WHEN LOWER(COALESCE(activo, 'true')) IN ('true', 't', '1', 'si', 'sí', 'yes') 
         AND LOWER(COALESCE(estado_asignacion, '')) <> 'fuera_de_servicio'
      THEN TRUE
    ELSE FALSE
  END AS activo,

  CONCAT_WS(E'\n',
    NULLIF(TRIM(observaciones), ''),
    CASE WHEN NULLIF(TRIM(asignado_a), '') IS NOT NULL THEN 'Asignado a texto histórico: ' || TRIM(asignado_a) END,
    CASE WHEN NULLIF(TRIM(faltantes_detectados), '') IS NOT NULL THEN 'Faltantes detectados: ' || TRIM(faltantes_detectados) END,
    CASE WHEN NULLIF(TRIM(alertas_calidad), '') IS NOT NULL THEN 'Alertas de calidad: ' || TRIM(alertas_calidad) END
  ) AS notas,

  NULLIF(TRIM(familia), '') AS familia,
  NULLIF(TRIM(nombre_normalizado), '') AS nombre_normalizado,
  NULLIF(TRIM(tamano), '') AS tamano,

  CASE
    WHEN COALESCE(cantidad, '') ~ '^[0-9]+(\.[0-9]+)?$' THEN cantidad::numeric
    ELSE 1
  END AS cantidad,

  COALESCE(NULLIF(TRIM(unidad), ''), 'unidad') AS unidad,
  NULLIF(TRIM(estado_asignacion), '') AS estado_asignacion_original,
  NULLIF(TRIM(asignado_a), '') AS asignado_a_texto,

  CASE WHEN LOWER(COALESCE(requiere_mantenimiento, 'false')) IN ('true', 't', '1', 'si', 'sí', 'yes') THEN TRUE ELSE FALSE END AS requiere_mantenimiento,
  CASE WHEN LOWER(COALESCE(tiene_arco, '')) IN ('true', 't', '1', 'si', 'sí', 'yes') THEN TRUE WHEN NULLIF(TRIM(tiene_arco), '') IS NULL THEN NULL ELSE FALSE END AS tiene_arco,
  CASE WHEN LOWER(COALESCE(tiene_estuche, '')) IN ('true', 't', '1', 'si', 'sí', 'yes') THEN TRUE WHEN NULLIF(TRIM(tiene_estuche), '') IS NULL THEN NULL ELSE FALSE END AS tiene_estuche,
  CASE WHEN LOWER(COALESCE(tiene_funda, '')) IN ('true', 't', '1', 'si', 'sí', 'yes') THEN TRUE WHEN NULLIF(TRIM(tiene_funda), '') IS NULL THEN NULL ELSE FALSE END AS tiene_funda,
  CASE WHEN LOWER(COALESCE(tiene_hombrera_almohadilla, '')) IN ('true', 't', '1', 'si', 'sí', 'yes') THEN TRUE WHEN NULLIF(TRIM(tiene_hombrera_almohadilla), '') IS NULL THEN NULL ELSE FALSE END AS tiene_hombrera_almohadilla,

  NULLIF(TRIM(faltantes_detectados), '') AS faltantes_detectados,
  NULLIF(TRIM(donante_inferido), '') AS donante_inferido,
  NULLIF(TRIM(codigo_donante), '') AS codigo_donante,
  NULLIF(TRIM(fuente_seccion), '') AS fuente_importacion,
  NULLIF(TRIM(numero_original), '') AS numero_original,

  CASE
    WHEN COALESCE(fila_origen_csv, '') ~ '^[0-9]+$' THEN fila_origen_csv::integer
    ELSE NULL
  END AS fila_origen_csv,

  CASE WHEN LOWER(COALESCE(revisar, 'false')) IN ('true', 't', '1', 'si', 'sí', 'yes') THEN TRUE ELSE FALSE END AS revisar,
  NULLIF(TRIM(alertas_calidad), '') AS alertas_calidad,

  jsonb_strip_nulls(jsonb_build_object(
    'codigo_interno_original', NULLIF(TRIM(codigo_interno_original), ''),
    'nombre_item_original', NULLIF(TRIM(nombre_item), ''),
    'tags', NULLIF(TRIM(tags), ''),
    'fuente_seccion', NULLIF(TRIM(fuente_seccion), ''),
    'importado_desde', 'inventario_supabase_import.csv'
  )) AS import_metadata

FROM public.inventario_import_staging
WHERE LOWER(COALESCE(tipo_item, '')) = 'instrumento'
  AND NULLIF(TRIM(codigo_importacion), '') IS NOT NULL
ON CONFLICT (codigo_inventario) DO UPDATE SET
  tipo_instrumento = EXCLUDED.tipo_instrumento,
  marca = EXCLUDED.marca,
  modelo = EXCLUDED.modelo,
  numero_serie = EXCLUDED.numero_serie,
  estado_conservacion = EXCLUDED.estado_conservacion,
  estado_uso = EXCLUDED.estado_uso,
  ubicacion = EXCLUDED.ubicacion,
  activo = EXCLUDED.activo,
  notas = EXCLUDED.notas,
  familia = EXCLUDED.familia,
  nombre_normalizado = EXCLUDED.nombre_normalizado,
  tamano = EXCLUDED.tamano,
  cantidad = EXCLUDED.cantidad,
  unidad = EXCLUDED.unidad,
  estado_asignacion_original = EXCLUDED.estado_asignacion_original,
  asignado_a_texto = EXCLUDED.asignado_a_texto,
  requiere_mantenimiento = EXCLUDED.requiere_mantenimiento,
  tiene_arco = EXCLUDED.tiene_arco,
  tiene_estuche = EXCLUDED.tiene_estuche,
  tiene_funda = EXCLUDED.tiene_funda,
  tiene_hombrera_almohadilla = EXCLUDED.tiene_hombrera_almohadilla,
  faltantes_detectados = EXCLUDED.faltantes_detectados,
  donante_inferido = EXCLUDED.donante_inferido,
  codigo_donante = EXCLUDED.codigo_donante,
  fuente_importacion = EXCLUDED.fuente_importacion,
  numero_original = EXCLUDED.numero_original,
  fila_origen_csv = EXCLUDED.fila_origen_csv,
  revisar = EXCLUDED.revisar,
  alertas_calidad = EXCLUDED.alertas_calidad,
  import_metadata = EXCLUDED.import_metadata,
  updated_at = NOW();

-- Materiales/accesorios sin instrumento base.
INSERT INTO public.inventario_accesorios (
  activo_id,
  tipo,
  marca,
  cantidad,
  estado,
  observaciones
)
SELECT
  NULL AS activo_id,
  CASE
    WHEN LOWER(COALESCE(nombre_normalizado, nombre_item, '')) LIKE '%boquilla%' THEN 'boquilla'
    WHEN LOWER(COALESCE(nombre_normalizado, nombre_item, '')) LIKE '%atril%' THEN 'atril'
    WHEN LOWER(COALESCE(nombre_normalizado, nombre_item, '')) LIKE '%cuerda%' THEN 'cuerdas'
    WHEN LOWER(COALESCE(nombre_normalizado, nombre_item, '')) LIKE '%cable%' THEN 'cable'
    WHEN LOWER(COALESCE(nombre_normalizado, nombre_item, '')) LIKE '%arco%' THEN 'arco'
    WHEN LOWER(COALESCE(nombre_normalizado, nombre_item, '')) LIKE '%funda%' THEN 'funda'
    ELSE 'otro'
  END AS tipo,
  NULLIF(TRIM(marca), '') AS marca,
  CASE
    WHEN COALESCE(cantidad, '') ~ '^[0-9]+$' THEN cantidad::integer
    WHEN COALESCE(cantidad, '') ~ '^[0-9]+(\.[0-9]+)?$' THEN CEIL(cantidad::numeric)::integer
    ELSE 1
  END AS cantidad,
  CASE
    WHEN LOWER(COALESCE(estado_asignacion, '')) IN ('asignado', 'uso_institucional') THEN 'asignado'
    WHEN LOWER(COALESCE(estado_asignacion, '')) IN ('fuera_de_servicio') THEN 'agotado'
    ELSE 'disponible'
  END AS estado,
  CONCAT_WS(E'\n',
    COALESCE(NULLIF(TRIM(nombre_item), ''), NULLIF(TRIM(nombre_normalizado), '')),
    NULLIF(TRIM(observaciones), ''),
    CASE WHEN NULLIF(TRIM(codigo_importacion), '') IS NOT NULL THEN 'Código importación: ' || TRIM(codigo_importacion) END,
    CASE WHEN NULLIF(TRIM(alertas_calidad), '') IS NOT NULL THEN 'Alertas de calidad: ' || TRIM(alertas_calidad) END
  ) AS observaciones
FROM public.inventario_import_staging
WHERE LOWER(COALESCE(tipo_item, '')) = 'material';

COMMIT;

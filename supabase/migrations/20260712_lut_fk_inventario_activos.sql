-- ============================================================
-- Migration: Repunte de FK lut_ordenes_reparacion.instrumento_id
--            instrumentos (legacy, 3 filas demo) -> inventario_activos (fuente real)
-- Timestamp: 20260712_lut_fk_inventario_activos
-- Change: mcp-tool-gateway, Slice 5
--
-- ⛔ GATE HUMANO: NO APLICAR SIN CONFIRMACIÓN EXPLÍCITA DEL USUARIO.
--    Este archivo modifica una constraint de PRODUCCIÓN.
--
-- Contexto (auditoría obs #2734, verificado contra producción 2026-07-06):
--   - lut_ordenes_reparacion.instrumento_id tiene FK real hacia la tabla
--     legacy `instrumentos` (3 filas de demostración), no hacia
--     `inventario_activos` (304 activos reales). Cualquier orden creada con
--     un UUID real de inventario falla por violación de FK.
--   - En producción hay exactamente 1 orden, apuntando al instrumento legacy
--     9cf75b14-5f84-43ce-9000-c0a4e601bee2 ("Violín Guaneri 1742", V-002).
--   - Verificado: cero colisiones de id ni de codigo_inventario entre las
--     3 filas legacy y inventario_activos.
--
-- Estrategia (la más segura — no toca la orden existente):
--   1. Backfill: insertar las 3 filas legacy en inventario_activos
--      CONSERVANDO sus UUIDs, para que la orden existente siga siendo válida
--      sin modificarla. Mapeo de columnas documentado inline.
--   2. Repuntar la constraint hacia inventario_activos(id).
--   3. La tabla `instrumentos` NO se elimina aquí (queda huérfana de
--      referencias; su eliminación es una migración posterior separada,
--      cuando se confirme que nada más la usa).
-- ============================================================

BEGIN;

-- ------------------------------------------------------------
-- 1. Backfill de las 3 filas legacy hacia inventario_activos
--    Mapeo: tipo->tipo_instrumento, codigo->codigo_inventario,
--    nombre->nombre_normalizado, serie->numero_serie, notas->notas,
--    estado: 'disponible'->'disponible'; 'fuera_de_uso'->'en_reparacion'
--    (la nota del chelo dice "En taller desde 2026-06-20" — en_reparacion
--    es el estado real, y es valor válido del CHECK de estado_uso).
-- ------------------------------------------------------------
INSERT INTO public.inventario_activos
  (id, tipo_instrumento, marca, numero_serie, codigo_inventario,
   nombre_normalizado, estado_uso, notas, import_metadata)
SELECT
  i.id,
  i.tipo,
  i.marca,
  i.serie,
  i.codigo,
  i.nombre,
  CASE i.estado WHEN 'disponible' THEN 'disponible' ELSE 'en_reparacion' END,
  i.notas,
  jsonb_build_object(
    'origen', 'migracion_instrumentos_legacy',
    'migracion', '20260712_lut_fk_inventario_activos',
    'estado_original', i.estado
  )
FROM public.instrumentos i
WHERE NOT EXISTS (
  SELECT 1 FROM public.inventario_activos a WHERE a.id = i.id
);

-- ------------------------------------------------------------
-- 2. Verificación intra-transacción: ninguna orden puede quedar huérfana.
--    Si alguna orden referencia un instrumento_id que no exista en
--    inventario_activos tras el backfill, la transacción ABORTA.
-- ------------------------------------------------------------
DO $$
DECLARE
  huerfanas integer;
BEGIN
  SELECT count(*) INTO huerfanas
  FROM public.lut_ordenes_reparacion o
  WHERE NOT EXISTS (
    SELECT 1 FROM public.inventario_activos a WHERE a.id = o.instrumento_id
  );
  IF huerfanas > 0 THEN
    RAISE EXCEPTION 'ABORT: % ordenes de luteria quedarian huerfanas tras el repunte de FK', huerfanas;
  END IF;
END $$;

-- ------------------------------------------------------------
-- 3. Repunte de la constraint
-- ------------------------------------------------------------
ALTER TABLE public.lut_ordenes_reparacion
  DROP CONSTRAINT lut_ordenes_reparacion_instrumento_id_fkey;

ALTER TABLE public.lut_ordenes_reparacion
  ADD CONSTRAINT lut_ordenes_reparacion_instrumento_id_fkey
  FOREIGN KEY (instrumento_id) REFERENCES public.inventario_activos(id);

COMMENT ON CONSTRAINT lut_ordenes_reparacion_instrumento_id_fkey
  ON public.lut_ordenes_reparacion IS
  'Repuntada a inventario_activos (fuente de verdad, 304+ activos) el 2026-07-12. Antes apuntaba a la tabla legacy instrumentos (drift V8->V9, auditoria obs #2734).';

COMMIT;

-- ------------------------------------------------------------
-- Verificación post-migración (ejecutar aparte, debe devolver 0 / true):
--
-- SELECT count(*) FROM lut_ordenes_reparacion o
--   WHERE NOT EXISTS (SELECT 1 FROM inventario_activos a WHERE a.id = o.instrumento_id);
--
-- SELECT ccu.table_name = 'inventario_activos' AS fk_correcta
--   FROM information_schema.table_constraints tc
--   JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
--   WHERE tc.table_name = 'lut_ordenes_reparacion' AND tc.constraint_type = 'FOREIGN KEY';
-- ------------------------------------------------------------

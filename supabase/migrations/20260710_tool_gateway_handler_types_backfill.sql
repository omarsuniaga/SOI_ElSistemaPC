-- ============================================================
-- Migration: MCP Tool Gateway - Backfill de handler_type real (Slice 2)
-- Timestamp: 20260710_tool_gateway_handler_types_backfill
-- Project: sistema-academico-pwa
-- Description: Corrige el handler_type/handler_target de las 9 tools
--   sembradas en 20260708_tool_catalog_core.sql (todas quedaron 'edge' de
--   forma generica). Debe ejecutarse DESPUES de
--   20260709_tool_gateway_entidad_tipo.sql (que agrega el enum value
--   'mcp-legacy-inline' en su propia transaccion — no puede usarse en la
--   misma migracion donde se agrega, ver comentario en ese archivo).
-- Date: 2026-07-10
-- Design ref: sdd/mcp-tool-gateway/design (obs #2738)
-- Tasks ref: sdd/mcp-tool-gateway/tasks (obs #2740) - Phase 2 / Slice 2
-- ============================================================

-- Las 5 tools legacy (auditoria #2734, portadas a handlers.ts en este slice)
-- pasan a handler_type='mcp-legacy-inline'. handler_target ya coincide con
-- el nombre de la tool (seed original), que es la clave que index.ts usa
-- para resolver LEGACY_HANDLERS[handler_target] en handlers.ts.
UPDATE public.soi_tool_catalog
SET handler_type = 'mcp-legacy-inline'
WHERE name IN (
  'acm_get_student_pedagogical_profile',
  'acm_register_leveling_plan',
  'fin_register_lutherie_report',
  'inv_update_instrument_state',
  'fin_apply_repair_charge'
);

-- Las 4 tools de lectura NUEVAS del slice vertical (diseno nuevo, sin
-- handler Python previo) pasan a handler_type='rest' (forward directo a
-- PostgREST con service_role, ver index.ts). handler_target usa la
-- convencion "tabla:columna_filtro" que index.ts parsea para construir
-- la query REST (?columna_filtro=eq.<valor de ese arg>).
UPDATE public.soi_tool_catalog
SET handler_type = 'rest', handler_target = 'lut_ordenes_reparacion:id'
WHERE name = 'lut_estado_orden';

UPDATE public.soi_tool_catalog
SET handler_type = 'rest', handler_target = 'inventario_activos:id'
WHERE name = 'inv_consultar_activo';

UPDATE public.soi_tool_catalog
SET handler_type = 'rest', handler_target = 'cuotas:familia_id'
WHERE name = 'fin_estado_cuenta_familia';

UPDATE public.soi_tool_catalog
SET handler_type = 'rest', handler_target = 'calendario_institucional:fecha_inicio'
WHERE name = 'cal_listar_eventos';

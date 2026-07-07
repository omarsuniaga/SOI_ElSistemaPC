-- ============================================================
-- Migración: 20260711_sim_config_tool_gateway.sql
-- Slice 4 — mcp-tool-gateway: feature flag de integración
-- Simulador + tool-gateway.
--
-- DECISIÓN (resolviendo el punto abierto por el design obs #2738,
-- "Integración Simulador"/"Feature flag simulador-tick"): el design
-- proponía una fila en `sim_config` (tabla singleton *por canal*, ver
-- 20260707_simulador_core.sql: UNIQUE(canal), sólo 2 filas -
-- whatsapp/email- sin lugar natural para un flag global). Forzar el
-- flag ahí requeriría un tercer "canal" ficticio, ensuciando el
-- significado de la tabla.
--
-- En su lugar, el flag vive en `sim_runs.usar_tool_gateway` (columna
-- nueva, default false): cada CORRIDA del simulador puede togglear
-- independientemente el modo tool_calls vs. el parser JSON legacy,
-- sin afectar corridas concurrentes ni requerir redeploy. Coherente
-- con el patrón ya usado por `sim_runs.velocidad` (config por-run).
-- ============================================================

ALTER TABLE public.sim_runs
  ADD COLUMN IF NOT EXISTS usar_tool_gateway boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.sim_runs.usar_tool_gateway IS
  'Feature flag por corrida: si es true, simulador-tick pide tool_calls al LLM (subset del catálogo soi_tool_catalog con sandbox_behavior definido) y las ejecuta vía tool-gateway con caller_type=simulador. Si es false (default), usa el parser JSON legacy sin cambios. Togglable por run, sin redeploy (spec: mcp-proxy / "Compatibilidad con Simulador existente").';

-- ============================================================
-- Migration: MCP Tool Gateway - Ampliacion de entidad_tipo (Slice 2)
-- Timestamp: 20260709_tool_gateway_entidad_tipo
-- Project: sistema-academico-pwa
-- Description: `tareas_entidad_tipo_check` (20260626_sp0_substrato_tareas.sql)
--   es una lista CERRADA que NO incluye 'tool_call'. La convencion de tarea
--   de aprobacion del tool-gateway (tasks obs #2740: entidad_tipo='tool_call',
--   entidad_id=soi_tool_log.id, entidad_label=tool_name) requiere ese valor.
--   Sin esta migracion, todo INSERT de tarea de aprobacion de una tool_call
--   write/critical fallaria por violacion de CHECK constraint.
-- Date: 2026-07-09
-- Design ref: sdd/mcp-tool-gateway/design (obs #2738)
-- Tasks ref: sdd/mcp-tool-gateway/tasks (obs #2740) - Phase 2 / Slice 2
-- ============================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'tareas_entidad_tipo_check') THEN
    ALTER TABLE public.tareas_institucionales
      DROP CONSTRAINT tareas_entidad_tipo_check;
  END IF;

  ALTER TABLE public.tareas_institucionales
    ADD CONSTRAINT tareas_entidad_tipo_check CHECK (
      entidad_tipo IS NULL OR entidad_tipo IN
      ('alumno','maestro','postulante','representante','instrumento','evento','otro','tool_call')
    );
END $$;

COMMENT ON COLUMN public.tareas_institucionales.entidad_tipo IS
  'Entidad polimorfica referenciada por esta tarea. "tool_call" (agregado en este slice) identifica tareas de aprobacion generadas por tool-gateway: entidad_id=soi_tool_log.id, entidad_label=tool_name (design: mcp-tool-gateway, tasks obs #2740).';

-- ------------------------------------------------------------
-- 2. Ampliacion de soi_tool_handler_type: 'mcp-legacy-inline' distingue las
--    5 tools de escritura migradas 1:1 desde mcp_server.py (Python) que
--    ejecutan handlers.ts en vez de forward directo a PostgREST/RPC/otra
--    edge function. El seed original de Slice 1 marco las 9 tools como
--    'edge' de forma generica; este slice corrige el handler_type real de
--    cada una segun como el pipeline de index.ts las despacha.
--
--    IMPORTANTE (gotcha del proyecto, ver 20260626_sp0_tarea_estado_observada.sql
--    y 20260704_000002_route_status_enum.sql): `ALTER TYPE ... ADD VALUE` NO
--    puede ejecutarse en la misma transaccion/statement donde luego se usa
--    ese valor nuevo (los UPDATE de mas abajo). Por eso el ADD VALUE queda
--    aislado en ESTE archivo y los UPDATE que asignan 'mcp-legacy-inline' se
--    movieron a la migracion siguiente `20260710_tool_gateway_handler_types_backfill.sql`.
-- ------------------------------------------------------------
ALTER TYPE soi_tool_handler_type ADD VALUE IF NOT EXISTS 'mcp-legacy-inline';

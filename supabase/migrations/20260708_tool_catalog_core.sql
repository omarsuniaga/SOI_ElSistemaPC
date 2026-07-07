-- ============================================================
-- Migration: MCP Tool Gateway - Catálogo y Auditoría (Slice 1)
-- Timestamp: 20260708_tool_catalog_core
-- Project: sistema-academico-pwa
-- Description: Tabla de catálogo único de tools (`soi_tool_catalog`) con
--   nivel de riesgo (read/write/critical), inputSchema JSON Schema y
--   configuración de sandbox; tabla de auditoría inmutable de invocaciones
--   (`soi_tool_log`, append-only por RLS, sin política UPDATE/DELETE).
--   Seed de las 9 tools del slice vertical ACM/LUT/FIN/INV/CAL.
-- Date: 2026-07-08
-- Design ref: sdd/mcp-tool-gateway/design (obs #2738)
-- Spec ref: sdd/mcp-tool-gateway/spec (obs #2737)
-- Tasks ref: sdd/mcp-tool-gateway/tasks (obs #2740) - Phase 1 / Slice 1
-- ============================================================

-- ------------------------------------------------------------
-- 0. Enums propios de este slice.
--    soi_departamento YA EXISTE (definido en 20260622_hermes_core.sql:
--    'DIR','ACM','ADM','FIN','LOG','COM','TECNICO') — se reutiliza, no se
--    recrea, siguiendo el mismo patrón que 20260707_simulador_core.sql.
-- ------------------------------------------------------------

DO $$ BEGIN
  CREATE TYPE soi_tool_handler_type AS ENUM ('rpc', 'edge', 'rest');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE soi_tool_nivel_riesgo AS ENUM ('read', 'write', 'critical');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE soi_tool_caller_type AS ENUM ('humano', 'llm', 'simulador', 'mcp');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE soi_tool_log_resultado AS ENUM ('ejecutado', 'rechazado', 'pendiente_aprobacion', 'error');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ------------------------------------------------------------
-- 1. soi_tool_catalog — catálogo único de tools invocables por cualquier
--    caller (MCP proxy, Simulador, Hermes). Único punto de verdad de
--    inputSchema, nivel de riesgo y comportamiento de sandbox.
--    (spec: tool-catalog / "Catálogo declara nivel de riesgo por tool")
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.soi_tool_catalog (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name             text NOT NULL UNIQUE,
  descripcion      text,
  departamento     soi_departamento NOT NULL DEFAULT 'DIR',
  input_schema     jsonb NOT NULL DEFAULT '{}',
  handler_type     soi_tool_handler_type NOT NULL,
  handler_target   text NOT NULL,
  nivel_riesgo     soi_tool_nivel_riesgo NOT NULL,
  sandbox_behavior jsonb,
  activo           boolean NOT NULL DEFAULT true,
  version          integer NOT NULL DEFAULT 1,
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);

COMMENT ON TABLE public.soi_tool_catalog IS 'Catálogo único de tools invocables vía tool-gateway. Fuente de verdad de inputSchema, nivel_riesgo y sandbox_behavior (design: mcp-tool-gateway ADR#1/#5/#6/#8).';
COMMENT ON COLUMN public.soi_tool_catalog.nivel_riesgo IS 'read: ejecuta autónomo siempre. write: requiere tarea de aprobación salvo automation_status=auto. critical: siempre requiere tarea DIR salvo ejecución humana ya aprobada (spec: tool-gateway / Matriz de autonomía).';
COMMENT ON COLUMN public.soi_tool_catalog.sandbox_behavior IS 'Mapeo de tabla destino sim_* para ejecuciones con caller_type=simulador. Si es NULL y una tool write/critical se invoca en sandbox, el gateway MUST rechazar la tool_call (spec: simulador-tool-binding / "sandbox_behavior faltante rechaza la tool_call").';
COMMENT ON COLUMN public.soi_tool_catalog.handler_target IS 'Identificador del handler segun handler_type: nombre de función RPC, ruta relativa dentro de tool-gateway/handlers.ts, o URL REST externa.';

-- ------------------------------------------------------------
-- 2. soi_tool_log — auditoría INMUTABLE de toda invocación (ejecutada,
--    rechazada, pendiente de aprobación o con error).
--    (spec: tool-catalog / "Auditoría inmutable de toda invocación")
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.soi_tool_log (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  caller_type    soi_tool_caller_type NOT NULL,
  caller_id      text,
  tool_name      text NOT NULL,
  args           jsonb NOT NULL DEFAULT '{}',
  resultado      soi_tool_log_resultado NOT NULL,
  detalle        text,
  correlation_id uuid,
  tarea_id       uuid REFERENCES public.tareas_institucionales(id) ON DELETE SET NULL,
  duracion_ms    integer,
  created_at     timestamptz DEFAULT now()
);

COMMENT ON TABLE public.soi_tool_log IS 'Auditoría append-only de toda invocación de tool. INMUTABLE por diseño: sin updated_at, sin política RLS de UPDATE/DELETE para ningún rol, con REVOKE explícito adicional (design ADR#4, spec: tool-catalog / Auditoría inmutable).';
COMMENT ON COLUMN public.soi_tool_log.correlation_id IS 'Trazabilidad al Process Backbone de Hermes cuando la tool_call ocurre dentro de un proceso activo (spec: tool-catalog / "correlation_id trazable al Process Backbone").';
COMMENT ON COLUMN public.soi_tool_log.tarea_id IS 'Referencia a la tarea Hermes de aprobación cuando resultado=pendiente_aprobacion o cuando la ejecución final proviene de una aprobación diferida (design ADR#2). ON DELETE SET NULL preserva la fila de auditoría aunque la tarea se elimine.';

-- ------------------------------------------------------------
-- 3. Índices
-- ------------------------------------------------------------
CREATE UNIQUE INDEX IF NOT EXISTS idx_soi_tool_catalog_name ON public.soi_tool_catalog (name);
CREATE INDEX IF NOT EXISTS idx_soi_tool_log_correlation_id ON public.soi_tool_log (correlation_id);
CREATE INDEX IF NOT EXISTS idx_soi_tool_log_tarea_id ON public.soi_tool_log (tarea_id);

-- ------------------------------------------------------------
-- 4. Row Level Security
--    Convención vigente del proyecto (20260626_sp1_rls_hermes_authenticated_only.sql,
--    20260707_simulador_core.sql): NO 'allow_all_*' abierto a anon; RLS
--    authenticated-only, anon denegado por REVOKE explícito.
--
--    soi_tool_log es INMUTABLE por requisito duro de auditoría (design ADR#4):
--    solo existe política de INSERT (para permitir auditoría desde clientes
--    con JWT de usuario cuando no se use service_role) y SELECT; NO se crea
--    ninguna política de UPDATE ni DELETE para ningún rol, y se REVOCA
--    explícitamente UPDATE/DELETE incluso de authenticated para blindar
--    contra un futuro GRANT ALL accidental.
-- ------------------------------------------------------------
ALTER TABLE public.soi_tool_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.soi_tool_log     ENABLE ROW LEVEL SECURITY;

-- soi_tool_catalog: lectura para todo authenticated (MCP proxy, edge functions
-- y frontend necesitan poder listar/consultar el catálogo activo); escritura
-- (alta/edición de tools) reservada a admin.
DROP POLICY IF EXISTS soi_tool_catalog_auth_read ON public.soi_tool_catalog;
CREATE POLICY soi_tool_catalog_auth_read ON public.soi_tool_catalog
  FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS soi_tool_catalog_admin_write ON public.soi_tool_catalog;
CREATE POLICY soi_tool_catalog_admin_write ON public.soi_tool_catalog
  FOR ALL TO authenticated USING (es_admin()) WITH CHECK (es_admin());
REVOKE ALL ON public.soi_tool_catalog FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.soi_tool_catalog TO authenticated;

-- soi_tool_log: SOLO INSERT y SELECT para authenticated. Sin política de
-- UPDATE/DELETE para ningún rol -> inmutabilidad dura (spec: tool-catalog /
-- Auditoría inmutable de toda invocación).
DROP POLICY IF EXISTS soi_tool_log_auth_insert ON public.soi_tool_log;
CREATE POLICY soi_tool_log_auth_insert ON public.soi_tool_log
  FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS soi_tool_log_auth_read ON public.soi_tool_log;
CREATE POLICY soi_tool_log_auth_read ON public.soi_tool_log
  FOR SELECT TO authenticated USING (true);
REVOKE ALL ON public.soi_tool_log FROM anon;
GRANT SELECT, INSERT ON public.soi_tool_log TO authenticated;
REVOKE UPDATE, DELETE ON public.soi_tool_log FROM authenticated;
REVOKE UPDATE, DELETE ON public.soi_tool_log FROM anon;

-- ------------------------------------------------------------
-- 5. updated_at trigger (solo soi_tool_catalog; soi_tool_log es inmutable
--    y deliberadamente NO tiene columna updated_at ni trigger).
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_soi_tool_catalog_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_soi_tool_catalog_updated_at ON public.soi_tool_catalog;
CREATE TRIGGER trg_soi_tool_catalog_updated_at
  BEFORE UPDATE ON public.soi_tool_catalog
  FOR EACH ROW EXECUTE FUNCTION public.fn_soi_tool_catalog_set_updated_at();

-- ------------------------------------------------------------
-- 6. Seed: 9 tools del slice vertical ACM -> LUT -> FIN -> INV -> CAL.
--    Las 5 tools con input_schema idéntico al `inputSchema` real hoy vigente
--    en mcp-server-soi-portal/mcp_server.py (TOOLS[]), verificado 1:1 contra
--    el archivo fuente para que el proxy dinámico (Slice 3) y los handlers.ts
--    migrados (Slice 2) reciban exactamente los mismos args que los handlers
--    Python corregidos en la auditoría #2734 esperan hoy.
--    Idempotente vía ON CONFLICT (name) DO UPDATE.
--
--    ACTUALIZACIÓN 2026-07-09 (Slice 2, resolviendo cabo suelto del Slice 1):
--    los 4 sandbox_behavior de write/critical fueron editados para reflejar
--    el mapeo GENÉRICO de sandboxResolver.js (sim_tareas + sim_log siempre;
--    sim_outbox si envia_mensaje=true) en vez de las 4 tablas espejo por-tool
--    propuestas originalmente (sim_planificaciones, sim_ordenes_reparacion,
--    sim_inventario_activos, sim_cuotas), que nunca se crearon como tablas
--    reales. Esta migración aún NO se aplicó a Supabase, por lo que editarla
--    in-place es seguro (no hay drift entre archivo y base de datos real).
-- ------------------------------------------------------------

-- 6.1 READ — acm_get_student_pedagogical_profile
--     input_schema idéntico a mcp_server.py TOOLS[0].inputSchema.
INSERT INTO public.soi_tool_catalog
  (name, descripcion, departamento, input_schema, handler_type, handler_target, nivel_riesgo, sandbox_behavior, activo, version)
VALUES (
  'acm_get_student_pedagogical_profile',
  'Recupera KPIs de asistencia, nivel instrumental y alertas activas de un alumno.',
  'ACM',
  '{
    "type": "object",
    "properties": {
      "alumno_id": {"type": "string", "description": "UUID del alumno a consultar."}
    },
    "required": ["alumno_id"]
  }'::jsonb,
  'edge',
  'acm_get_student_pedagogical_profile',
  'read',
  NULL,
  true,
  1
)
ON CONFLICT (name) DO UPDATE SET
  descripcion = EXCLUDED.descripcion,
  departamento = EXCLUDED.departamento,
  input_schema = EXCLUDED.input_schema,
  handler_type = EXCLUDED.handler_type,
  handler_target = EXCLUDED.handler_target,
  nivel_riesgo = EXCLUDED.nivel_riesgo,
  sandbox_behavior = EXCLUDED.sandbox_behavior,
  updated_at = now();

-- 6.2 READ — lut_estado_orden
--     Tool de lectura del slice vertical (design: seed 9 tools / LUT read).
--     Consulta lut_ordenes_reparacion por orden_id o instrumento_id.
INSERT INTO public.soi_tool_catalog
  (name, descripcion, departamento, input_schema, handler_type, handler_target, nivel_riesgo, sandbox_behavior, activo, version)
VALUES (
  'lut_estado_orden',
  'Consulta el estado actual de una orden de reparación de lutería.',
  'ACM',
  '{
    "type": "object",
    "properties": {
      "orden_id": {"type": "string", "description": "UUID de la orden de reparación en lut_ordenes_reparacion."}
    },
    "required": ["orden_id"]
  }'::jsonb,
  'edge',
  'lut_estado_orden',
  'read',
  NULL,
  true,
  1
)
ON CONFLICT (name) DO UPDATE SET
  descripcion = EXCLUDED.descripcion,
  departamento = EXCLUDED.departamento,
  input_schema = EXCLUDED.input_schema,
  handler_type = EXCLUDED.handler_type,
  handler_target = EXCLUDED.handler_target,
  nivel_riesgo = EXCLUDED.nivel_riesgo,
  sandbox_behavior = EXCLUDED.sandbox_behavior,
  updated_at = now();

-- 6.3 READ — inv_consultar_activo
--     Tool de lectura del slice vertical (design: seed 9 tools / INV read).
--     Consulta inventario_activos por id.
INSERT INTO public.soi_tool_catalog
  (name, descripcion, departamento, input_schema, handler_type, handler_target, nivel_riesgo, sandbox_behavior, activo, version)
VALUES (
  'inv_consultar_activo',
  'Consulta el estado de disponibilidad y datos de un activo de inventario.',
  'LOG',
  '{
    "type": "object",
    "properties": {
      "instrumento_id": {"type": "string", "description": "UUID del activo en inventario_activos."}
    },
    "required": ["instrumento_id"]
  }'::jsonb,
  'edge',
  'inv_consultar_activo',
  'read',
  NULL,
  true,
  1
)
ON CONFLICT (name) DO UPDATE SET
  descripcion = EXCLUDED.descripcion,
  departamento = EXCLUDED.departamento,
  input_schema = EXCLUDED.input_schema,
  handler_type = EXCLUDED.handler_type,
  handler_target = EXCLUDED.handler_target,
  nivel_riesgo = EXCLUDED.nivel_riesgo,
  sandbox_behavior = EXCLUDED.sandbox_behavior,
  updated_at = now();

-- 6.4 READ — fin_estado_cuenta_familia
--     Tool de lectura del slice vertical (design: seed 9 tools / FIN read).
--     Consulta cuotas por familia_id.
INSERT INTO public.soi_tool_catalog
  (name, descripcion, departamento, input_schema, handler_type, handler_target, nivel_riesgo, sandbox_behavior, activo, version)
VALUES (
  'fin_estado_cuenta_familia',
  'Consulta el estado de cuenta (cuotas pendientes/pagadas) de una familia.',
  'FIN',
  '{
    "type": "object",
    "properties": {
      "familia_id": {"type": "string", "description": "UUID de la familia a consultar en cuotas."}
    },
    "required": ["familia_id"]
  }'::jsonb,
  'edge',
  'fin_estado_cuenta_familia',
  'read',
  NULL,
  true,
  1
)
ON CONFLICT (name) DO UPDATE SET
  descripcion = EXCLUDED.descripcion,
  departamento = EXCLUDED.departamento,
  input_schema = EXCLUDED.input_schema,
  handler_type = EXCLUDED.handler_type,
  handler_target = EXCLUDED.handler_target,
  nivel_riesgo = EXCLUDED.nivel_riesgo,
  sandbox_behavior = EXCLUDED.sandbox_behavior,
  updated_at = now();

-- 6.5 READ — cal_listar_eventos
--     Tool de lectura del slice vertical (design: seed 9 tools / CAL read).
--     Lista eventos de calendario_institucional en un rango de fechas.
INSERT INTO public.soi_tool_catalog
  (name, descripcion, departamento, input_schema, handler_type, handler_target, nivel_riesgo, sandbox_behavior, activo, version)
VALUES (
  'cal_listar_eventos',
  'Lista eventos del calendario institucional dentro de un rango de fechas.',
  'DIR',
  '{
    "type": "object",
    "properties": {
      "fecha_desde": {"type": "string", "description": "Fecha inicial del rango (YYYY-MM-DD)."},
      "fecha_hasta": {"type": "string", "description": "Fecha final del rango (YYYY-MM-DD)."},
      "departamento": {
        "type": "string",
        "enum": ["DIR", "ACM", "ADM", "FIN", "LOG", "COM", "TECNICO"],
        "description": "Filtro opcional por departamento responsable."
      }
    },
    "required": ["fecha_desde", "fecha_hasta"]
  }'::jsonb,
  'edge',
  'cal_listar_eventos',
  'read',
  NULL,
  true,
  1
)
ON CONFLICT (name) DO UPDATE SET
  descripcion = EXCLUDED.descripcion,
  departamento = EXCLUDED.departamento,
  input_schema = EXCLUDED.input_schema,
  handler_type = EXCLUDED.handler_type,
  handler_target = EXCLUDED.handler_target,
  nivel_riesgo = EXCLUDED.nivel_riesgo,
  sandbox_behavior = EXCLUDED.sandbox_behavior,
  updated_at = now();

-- 6.6 WRITE — acm_register_leveling_plan
--     input_schema idéntico a mcp_server.py TOOLS[1].inputSchema.
--     sandbox_behavior: DECISIÓN ACTUALIZADA (2026-07-09, Slice 2 — ver
--     sandboxResolver.js y apply-progress obs #2744/2748). La tabla
--     "sim_planificaciones" propuesta en la versión original de este seed
--     NUNCA se creó. sandboxResolver.js mapea TODA escritura sandbox a las
--     tablas GENÉRICAS ya existentes de 20260707_simulador_core.sql
--     (sim_tareas + sim_log siempre; sim_outbox solo si envia_mensaje=true).
--     El campo "tabla_destino" queda como metadata histórica/informativa —
--     el resolver NO lo lee para decidir la tabla real.
INSERT INTO public.soi_tool_catalog
  (name, descripcion, departamento, input_schema, handler_type, handler_target, nivel_riesgo, sandbox_behavior, activo, version)
VALUES (
  'acm_register_leveling_plan',
  'Registra un plan de nivelación o reforzamiento de 4 semanas para alumnos en riesgo.',
  'ACM',
  '{
    "type": "object",
    "properties": {
      "alumno_id": {"type": "string", "description": "UUID del alumno en riesgo."},
      "maestro_id": {"type": "string", "description": "UUID del maestro tutor."},
      "objetivos_pedagogicos": {
        "type": "array",
        "items": {"type": "string"},
        "description": "Lista de metas técnicas a lograr."
      },
      "fecha_inicio": {"type": "string", "description": "Fecha de inicio del plan (YYYY-MM-DD)."}
    },
    "required": ["alumno_id", "maestro_id", "objetivos_pedagogicos", "fecha_inicio"]
  }'::jsonb,
  'edge',
  'acm_register_leveling_plan',
  'write',
  '{"tabla_destino_legacy": "sim_planificaciones", "envia_mensaje": false, "departamento": "ACM", "nota": "Mapeo genérico: sandboxResolver.js redirige a sim_tareas + sim_log (Slice 2, decisión 2026-07-09). tabla_destino_legacy es solo metadata histórica, no se usa para resolver la tabla real."}'::jsonb,
  true,
  1
)
ON CONFLICT (name) DO UPDATE SET
  descripcion = EXCLUDED.descripcion,
  departamento = EXCLUDED.departamento,
  input_schema = EXCLUDED.input_schema,
  handler_type = EXCLUDED.handler_type,
  handler_target = EXCLUDED.handler_target,
  nivel_riesgo = EXCLUDED.nivel_riesgo,
  sandbox_behavior = EXCLUDED.sandbox_behavior,
  updated_at = now();

-- 6.7 WRITE — fin_register_lutherie_report
--     input_schema idéntico a mcp_server.py TOOLS[2].inputSchema.
INSERT INTO public.soi_tool_catalog
  (name, descripcion, departamento, input_schema, handler_type, handler_target, nivel_riesgo, sandbox_behavior, activo, version)
VALUES (
  'fin_register_lutherie_report',
  'Registra la orden inicial de luthería por instrumento dañado.',
  'ACM',
  '{
    "type": "object",
    "properties": {
      "instrumento_id": {"type": "string", "description": "UUID del instrumento dañado."},
      "alumno_id": {"type": "string", "description": "UUID del alumno responsable."},
      "descripcion_danio": {"type": "string", "description": "Detalle técnico de la avería."}
    },
    "required": ["instrumento_id", "alumno_id", "descripcion_danio"]
  }'::jsonb,
  'edge',
  'fin_register_lutherie_report',
  'write',
  '{"tabla_destino_legacy": "sim_ordenes_reparacion", "envia_mensaje": false, "departamento": "ACM", "nota": "Mapeo genérico: sandboxResolver.js redirige a sim_tareas + sim_log (Slice 2, decisión 2026-07-09)."}'::jsonb,
  true,
  1
)
ON CONFLICT (name) DO UPDATE SET
  descripcion = EXCLUDED.descripcion,
  departamento = EXCLUDED.departamento,
  input_schema = EXCLUDED.input_schema,
  handler_type = EXCLUDED.handler_type,
  handler_target = EXCLUDED.handler_target,
  nivel_riesgo = EXCLUDED.nivel_riesgo,
  sandbox_behavior = EXCLUDED.sandbox_behavior,
  updated_at = now();

-- 6.8 WRITE — inv_update_instrument_state
--     input_schema idéntico a mcp_server.py TOOLS[3].inputSchema.
INSERT INTO public.soi_tool_catalog
  (name, descripcion, departamento, input_schema, handler_type, handler_target, nivel_riesgo, sandbox_behavior, activo, version)
VALUES (
  'inv_update_instrument_state',
  'Actualiza el estado de disponibilidad y logs de un instrumento físico en inventario.',
  'LOG',
  '{
    "type": "object",
    "properties": {
      "instrumento_id": {"type": "string", "description": "UUID del instrumento."},
      "nuevo_estado": {
        "type": "string",
        "enum": ["disponible", "prestado", "en_mantenimiento", "en_reparacion", "de_baja"]
      },
      "nota_historial": {"type": "string", "description": "Motivo del cambio de estado."}
    },
    "required": ["instrumento_id", "nuevo_estado", "nota_historial"]
  }'::jsonb,
  'edge',
  'inv_update_instrument_state',
  'write',
  '{"tabla_destino_legacy": "sim_inventario_activos", "envia_mensaje": false, "departamento": "LOG", "nota": "Mapeo genérico: sandboxResolver.js redirige a sim_tareas + sim_log (Slice 2, decisión 2026-07-09)."}'::jsonb,
  true,
  1
)
ON CONFLICT (name) DO UPDATE SET
  descripcion = EXCLUDED.descripcion,
  departamento = EXCLUDED.departamento,
  input_schema = EXCLUDED.input_schema,
  handler_type = EXCLUDED.handler_type,
  handler_target = EXCLUDED.handler_target,
  nivel_riesgo = EXCLUDED.nivel_riesgo,
  sandbox_behavior = EXCLUDED.sandbox_behavior,
  updated_at = now();

-- 6.9 CRITICAL — fin_apply_repair_charge
--     input_schema idéntico a mcp_server.py TOOLS[4].inputSchema.
--     nivel_riesgo=critical: DECISIÓN CONFIRMADA (no reabrir, ver tasks
--     #2740 Phase 1 / 1.5). Afecta cobranza directa de la familia -> siempre
--     requiere tarea de aprobación asignada a rol DIR salvo ejecución humana
--     ya aprobada (spec: tool-gateway / "LLM invoca tool critical").
INSERT INTO public.soi_tool_catalog
  (name, descripcion, departamento, input_schema, handler_type, handler_target, nivel_riesgo, sandbox_behavior, activo, version)
VALUES (
  'fin_apply_repair_charge',
  'Carga el costo de la reparación aprobada en el perfil del alumno y genera la prefactura.',
  'FIN',
  '{
    "type": "object",
    "properties": {
      "alumno_id": {"type": "string", "description": "UUID del alumno responsable."},
      "orden_id": {"type": "string", "description": "Código de orden de reparación (ej. LUT-REP-2026-045)."},
      "monto": {"type": "number", "minimum": 0.01, "description": "Monto total a facturar (RD$)."},
      "fecha_compromiso_pago": {"type": "string", "description": "Fecha de compromiso acordada (YYYY-MM-DD)."}
    },
    "required": ["alumno_id", "orden_id", "monto", "fecha_compromiso_pago"]
  }'::jsonb,
  'edge',
  'fin_apply_repair_charge',
  'critical',
  '{"tabla_destino_legacy": "sim_cuotas", "envia_mensaje": false, "departamento": "FIN", "nota": "Mapeo genérico: sandboxResolver.js redirige a sim_tareas + sim_log (Slice 2, decisión 2026-07-09). nivel_riesgo=critical no cambia el mapeo de tablas sandbox, solo la matriz de autonomía (resolverAutonomia.js)."}'::jsonb,
  true,
  1
)
ON CONFLICT (name) DO UPDATE SET
  descripcion = EXCLUDED.descripcion,
  departamento = EXCLUDED.departamento,
  input_schema = EXCLUDED.input_schema,
  handler_type = EXCLUDED.handler_type,
  handler_target = EXCLUDED.handler_target,
  nivel_riesgo = EXCLUDED.nivel_riesgo,
  sandbox_behavior = EXCLUDED.sandbox_behavior,
  updated_at = now();

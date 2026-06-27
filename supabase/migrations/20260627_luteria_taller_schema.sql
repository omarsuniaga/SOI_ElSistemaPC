-- 20260627_luteria_taller_schema.sql
-- Portal Profesional de Lutería — esquema completo (7 tablas prefijo lut_).
-- Namespaced: NO altera tablas existentes. FK a public.instrumentos.
-- RLS: authenticated-only, REVOKE anon.

-- ============================================================================
-- 1. lut_ordenes_reparacion — Órdenes de reparación (corazón del sistema)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.lut_ordenes_reparacion (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  correlation_id uuid,
  instrumento_id uuid NOT NULL REFERENCES public.instrumentos(id) ON DELETE RESTRICT,
  alumno_id uuid,
  alumno_nombre text,
  reportado_por uuid,
  reportado_por_nombre text,
  recibido_por uuid,
  recibido_por_nombre text,
  tecnico_responsable uuid,
  tecnico_responsable_nombre text,
  departamento_origen text,
  estado text NOT NULL DEFAULT 'reportado'
    CHECK (estado IN (
      'reportado','recibido','pendiente_diagnostico','diagnosticado',
      'presupuesto_pendiente','esperando_aprobacion','esperando_insumos',
      'en_reparacion','en_prueba','listo_entrega','entregado','cerrado','cancelado'
    )),
  prioridad text NOT NULL DEFAULT 'media'
    CHECK (prioridad IN ('baja','media','alta','critica')),
  descripcion_inicial text,
  diagnostico_resumen text,
  tipo_dano text,
  gravedad text CHECK (gravedad IN ('leve','moderada','grave','critica')),
  requiere_reemplazo boolean NOT NULL DEFAULT false,
  requiere_cobro boolean NOT NULL DEFAULT false,
  requiere_aprobacion_direccion boolean NOT NULL DEFAULT false,
  costo_estimado numeric(10,2),
  costo_final numeric(10,2),
  fecha_recepcion timestamptz NOT NULL DEFAULT now(),
  fecha_diagnostico timestamptz,
  fecha_inicio_reparacion timestamptz,
  fecha_estimada_entrega timestamptz,
  fecha_entrega timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lut_ordenes_estado ON public.lut_ordenes_reparacion (estado);
CREATE INDEX IF NOT EXISTS idx_lut_ordenes_instrumento ON public.lut_ordenes_reparacion (instrumento_id);
CREATE INDEX IF NOT EXISTS idx_lut_ordenes_correlation ON public.lut_ordenes_reparacion (correlation_id);
CREATE INDEX IF NOT EXISTS idx_lut_ordenes_alumno ON public.lut_ordenes_reparacion (alumno_id);

ALTER TABLE public.lut_ordenes_reparacion ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS lut_ordenes_auth_all ON public.lut_ordenes_reparacion;
CREATE POLICY lut_ordenes_auth_all ON public.lut_ordenes_reparacion
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
REVOKE ALL ON public.lut_ordenes_reparacion FROM anon;
GRANT SELECT, INSERT, UPDATE ON public.lut_ordenes_reparacion TO authenticated;

-- ============================================================================
-- 2. lut_diagnosticos — Diagnósticos técnicos
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.lut_diagnosticos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  orden_id uuid NOT NULL REFERENCES public.lut_ordenes_reparacion(id) ON DELETE CASCADE,
  diagnostico_tecnico text NOT NULL,
  causa_probable text,
  tipo_dano text,
  gravedad text CHECK (gravedad IN ('leve','moderada','grave','critica')),
  zona_afectada text,
  reparacion_recomendada text,
  materiales_requeridos text,
  tiempo_estimado_horas numeric(5,1),
  costo_mano_obra numeric(10,2),
  costo_materiales numeric(10,2),
  requiere_servicio_externo boolean NOT NULL DEFAULT false,
  observaciones text,
  diagnosticado_por uuid,
  diagnosticado_por_nombre text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lut_diagnosticos_orden ON public.lut_diagnosticos (orden_id);

ALTER TABLE public.lut_diagnosticos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS lut_diagnosticos_auth_all ON public.lut_diagnosticos;
CREATE POLICY lut_diagnosticos_auth_all ON public.lut_diagnosticos
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
REVOKE ALL ON public.lut_diagnosticos FROM anon;
GRANT SELECT, INSERT, UPDATE ON public.lut_diagnosticos TO authenticated;

-- ============================================================================
-- 3. lut_presupuestos — Presupuestos
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.lut_presupuestos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  orden_id uuid NOT NULL REFERENCES public.lut_ordenes_reparacion(id) ON DELETE CASCADE,
  estado text NOT NULL DEFAULT 'borrador'
    CHECK (estado IN ('borrador','enviado','aprobado','rechazado','cubierto_institucion')),
  subtotal_mano_obra numeric(10,2) NOT NULL DEFAULT 0,
  subtotal_materiales numeric(10,2) NOT NULL DEFAULT 0,
  subtotal_servicios_externos numeric(10,2) NOT NULL DEFAULT 0,
  descuento numeric(10,2) NOT NULL DEFAULT 0,
  monto_institucion numeric(10,2) NOT NULL DEFAULT 0,
  monto_representante numeric(10,2) NOT NULL DEFAULT 0,
  total numeric(10,2) GENERATED ALWAYS AS (
    subtotal_mano_obra + subtotal_materiales + subtotal_servicios_externos - descuento
  ) STORED,
  aprobado_por uuid,
  aprobado_en timestamptz,
  observaciones text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lut_presupuestos_orden ON public.lut_presupuestos (orden_id);

ALTER TABLE public.lut_presupuestos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS lut_presupuestos_auth_all ON public.lut_presupuestos;
CREATE POLICY lut_presupuestos_auth_all ON public.lut_presupuestos
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
REVOKE ALL ON public.lut_presupuestos FROM anon;
GRANT SELECT, INSERT, UPDATE ON public.lut_presupuestos TO authenticated;

-- ============================================================================
-- 4. lut_insumos — Catálogo de insumos del taller
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.lut_insumos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  categoria text,
  unidad text NOT NULL DEFAULT 'unidad',
  stock_actual numeric(10,2) NOT NULL DEFAULT 0,
  stock_minimo numeric(10,2) NOT NULL DEFAULT 0,
  costo_unitario numeric(10,2),
  proveedor_sugerido text,
  activo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lut_insumos_categoria ON public.lut_insumos (categoria);
CREATE INDEX IF NOT EXISTS idx_lut_insumos_activo ON public.lut_insumos (activo);

ALTER TABLE public.lut_insumos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS lut_insumos_auth_all ON public.lut_insumos;
CREATE POLICY lut_insumos_auth_all ON public.lut_insumos
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
REVOKE ALL ON public.lut_insumos FROM anon;
GRANT SELECT, INSERT, UPDATE ON public.lut_insumos TO authenticated;

-- ============================================================================
-- 5. lut_movimientos_insumos — Control de inventario de insumos
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.lut_movimientos_insumos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  insumo_id uuid NOT NULL REFERENCES public.lut_insumos(id) ON DELETE RESTRICT,
  orden_id uuid REFERENCES public.lut_ordenes_reparacion(id) ON DELETE SET NULL,
  tipo_movimiento text NOT NULL
    CHECK (tipo_movimiento IN ('entrada','consumo','ajuste','devolucion','perdida')),
  cantidad numeric(10,2) NOT NULL,
  costo_unitario numeric(10,2),
  registrado_por uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lut_movimientos_insumo ON public.lut_movimientos_insumos (insumo_id);
CREATE INDEX IF NOT EXISTS idx_lut_movimientos_orden ON public.lut_movimientos_insumos (orden_id);

ALTER TABLE public.lut_movimientos_insumos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS lut_movimientos_auth_all ON public.lut_movimientos_insumos;
CREATE POLICY lut_movimientos_auth_all ON public.lut_movimientos_insumos
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
REVOKE ALL ON public.lut_movimientos_insumos FROM anon;
GRANT SELECT, INSERT, UPDATE ON public.lut_movimientos_insumos TO authenticated;

-- ============================================================================
-- 6. lut_solicitudes_compra — Solicitudes de compra de insumos
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.lut_solicitudes_compra (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  orden_id uuid REFERENCES public.lut_ordenes_reparacion(id) ON DELETE SET NULL,
  insumo_id uuid REFERENCES public.lut_insumos(id) ON DELETE SET NULL,
  cantidad_solicitada numeric(10,2) NOT NULL,
  justificacion text,
  urgencia text NOT NULL DEFAULT 'media'
    CHECK (urgencia IN ('baja','media','alta','critica')),
  costo_estimado numeric(10,2),
  proveedor_sugerido text,
  estado text NOT NULL DEFAULT 'pendiente'
    CHECK (estado IN ('pendiente','aprobada','rechazada','comprada','cancelada')),
  solicitado_por uuid,
  aprobado_por uuid,
  fecha_requerida date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lut_solicitudes_estado ON public.lut_solicitudes_compra (estado);
CREATE INDEX IF NOT EXISTS idx_lut_solicitudes_orden ON public.lut_solicitudes_compra (orden_id);

ALTER TABLE public.lut_solicitudes_compra ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS lut_solicitudes_auth_all ON public.lut_solicitudes_compra;
CREATE POLICY lut_solicitudes_auth_all ON public.lut_solicitudes_compra
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
REVOKE ALL ON public.lut_solicitudes_compra FROM anon;
GRANT SELECT, INSERT, UPDATE ON public.lut_solicitudes_compra TO authenticated;

-- ============================================================================
-- 7. lut_evidencias — Evidencias fotográficas y documentos
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.lut_evidencias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  orden_id uuid NOT NULL REFERENCES public.lut_ordenes_reparacion(id) ON DELETE CASCADE,
  tipo text NOT NULL
    CHECK (tipo IN ('foto_antes','foto_durante','foto_despues','documento','video','factura','informe')),
  nombre text,
  storage_path text,
  descripcion text,
  visibilidad text NOT NULL DEFAULT 'interno'
    CHECK (visibilidad IN ('interno','finanzas','representante','publico')),
  subido_por uuid,
  subido_por_nombre text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lut_evidencias_orden ON public.lut_evidencias (orden_id);

ALTER TABLE public.lut_evidencias ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS lut_evidencias_auth_all ON public.lut_evidencias;
CREATE POLICY lut_evidencias_auth_all ON public.lut_evidencias
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
REVOKE ALL ON public.lut_evidencias FROM anon;
GRANT SELECT, INSERT, UPDATE ON public.lut_evidencias TO authenticated;

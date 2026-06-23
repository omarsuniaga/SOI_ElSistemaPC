-- Migration: Módulo Inventario Profesional — Ampliación
-- Timestamp: 20260622
-- Date: 2026-06-22
-- Purpose: Tablas de accesorios, historial, reparaciones, facturación.
--          Extiende inventario_activos y comodatos_activos.
--          Corrige es_admin() para leer de profiles.rol y admite inventarista.
-- Reference: SDD INV-SPEC-01
-- Status: PENDING

-- =====================================================================
-- Step 1: Extender CHECK de estado_uso en inventario_activos
-- =====================================================================
ALTER TABLE public.inventario_activos
  DROP CONSTRAINT IF EXISTS inventario_activos_estado_uso_check;

ALTER TABLE public.inventario_activos
  ADD CONSTRAINT inventario_activos_estado_uso_check
  CHECK (estado_uso IN ('disponible', 'prestado', 'en_mantenimiento', 'en_reparacion', 'de_baja'));

-- =====================================================================
-- Step 2: Agregar columnas a inventario_activos
-- =====================================================================
ALTER TABLE public.inventario_activos
  ADD COLUMN IF NOT EXISTS fecha_adquisicion DATE,
  ADD COLUMN IF NOT EXISTS valor_adquisicion NUMERIC(10, 2),
  ADD COLUMN IF NOT EXISTS fecha_baja DATE,
  ADD COLUMN IF NOT EXISTS motivo_baja TEXT,
  ADD COLUMN IF NOT EXISTS foto_url VARCHAR(500),
  ADD COLUMN IF NOT EXISTS proveedor VARCHAR(200);

COMMENT ON COLUMN public.inventario_activos.fecha_adquisicion IS 'Fecha de compra del instrumento';
COMMENT ON COLUMN public.inventario_activos.valor_adquisicion IS 'Valor de compra original';
COMMENT ON COLUMN public.inventario_activos.fecha_baja IS 'Fecha en que se dio de baja';
COMMENT ON COLUMN public.inventario_activos.motivo_baja IS 'Motivo de la baja';
COMMENT ON COLUMN public.inventario_activos.foto_url IS 'URL de foto del instrumento';
COMMENT ON COLUMN public.inventario_activos.proveedor IS 'Proveedor o tienda de compra';

-- =====================================================================
-- Step 3: Agregar columnas a comodatos_activos
-- =====================================================================
ALTER TABLE public.comodatos_activos
  ADD COLUMN IF NOT EXISTS fecha_vencimiento DATE,
  ADD COLUMN IF NOT EXISTS tipo_comodato VARCHAR(50)
    CHECK (tipo_comodato IN ('escolar', 'anual', 'eventual')),
  ADD COLUMN IF NOT EXISTS instrumento_propio_id UUID REFERENCES public.inventario_activos(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS renovado_de_id UUID REFERENCES public.comodatos_activos(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS intercambiado_con_id UUID REFERENCES public.comodatos_activos(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.comodatos_activos.fecha_vencimiento IS 'Fecha de vencimiento del comodato';
COMMENT ON COLUMN public.comodatos_activos.tipo_comodato IS 'Tipo: escolar (ciclo), anual, eventual (evento específico)';
COMMENT ON COLUMN public.comodatos_activos.instrumento_propio_id IS 'Instrumento propio del alumno (intercambio)';
COMMENT ON COLUMN public.comodatos_activos.renovado_de_id IS 'Referencia al comodato anterior que se renovó';
COMMENT ON COLUMN public.comodatos_activos.intercambiado_con_id IS 'Referencia al comodato con que se intercambió';

-- =====================================================================
-- Step 4: Agregar 'inventarista' al CHECK de profiles.rol
-- =====================================================================
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Normalizar roles existentes antes de aplicar el nuevo CHECK
UPDATE public.profiles
  SET rol = 'maestro'
  WHERE rol IS NULL OR rol NOT IN ('admin', 'maestro', 'inventarista');

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (rol IN ('admin', 'maestro', 'inventarista'));

-- =====================================================================
-- Step 5: Corregir es_admin() para leer de profiles.rol y admitir inventarista
-- =====================================================================
CREATE OR REPLACE FUNCTION es_admin()
RETURNS boolean AS $$
DECLARE
  v_role TEXT;
BEGIN
  SELECT p.rol INTO v_role
  FROM public.profiles p
  WHERE p.id = auth.uid();
  RETURN COALESCE(v_role IN ('admin', 'inventarista'), FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION es_admin()
  IS 'Retorna true si el usuario autenticado tiene rol admin o inventarista en profiles';

-- =====================================================================
-- Step 6: ENUMs (via CHECK constraints, no custom types para evitar migraciones complejas)
-- =====================================================================

-- =====================================================================
-- Step 7: Tabla inventario_accesorios
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.inventario_accesorios (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activo_id       UUID REFERENCES public.inventario_activos(id) ON DELETE CASCADE,
  tipo            VARCHAR(50) NOT NULL
                    CHECK (tipo IN ('funda', 'arco', 'cuerdas', 'boquilla', 'atril', 'parlante', 'cable', 'otro')),
  marca           VARCHAR(100),
  cantidad        INTEGER NOT NULL DEFAULT 1 CHECK (cantidad >= 0),
  estado          VARCHAR(50) NOT NULL DEFAULT 'disponible'
                    CHECK (estado IN ('disponible', 'asignado', 'agotado')),
  fecha_asignacion DATE,
  observaciones   TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_accesorios_activo
  ON public.inventario_accesorios (activo_id);

CREATE INDEX IF NOT EXISTS idx_accesorios_tipo
  ON public.inventario_accesorios (tipo);

COMMENT ON TABLE public.inventario_accesorios
  IS 'Accesorios asociados a instrumentos (fundas, arcos, cuerdas, etc.)';

-- =====================================================================
-- Step 8: Tabla inventario_historial
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.inventario_historial (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activo_id   UUID NOT NULL REFERENCES public.inventario_activos(id) ON DELETE CASCADE,
  tipo_evento VARCHAR(50) NOT NULL
                CHECK (tipo_evento IN (
                  'asignacion', 'devolucion', 'reparacion', 'cambio_estado',
                  'baja', 'creacion', 'observacion'
                )),
  descripcion TEXT NOT NULL,
  fecha       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  usuario_id  UUID REFERENCES auth.users(id),
  metadata    JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_historial_activo_fecha
  ON public.inventario_historial (activo_id, fecha DESC);

CREATE INDEX IF NOT EXISTS idx_historial_tipo_evento
  ON public.inventario_historial (tipo_evento);

COMMENT ON TABLE public.inventario_historial
  IS 'Historial de eventos de instrumentos. Se inserta automáticamente via triggers.';

-- =====================================================================
-- Step 9: Tabla inventario_reparaciones
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.inventario_reparaciones (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activo_id          UUID NOT NULL REFERENCES public.inventario_activos(id) ON DELETE RESTRICT,
  tipo_tallerista    VARCHAR(50) NOT NULL
                       CHECK (tipo_tallerista IN ('externo', 'luthier_interno')),
  tallerista_nombre  VARCHAR(200) NOT NULL,
  descripcion        TEXT NOT NULL,
  costo_estimado     NUMERIC(10, 2) CHECK (costo_estimado >= 0),
  costo_real         NUMERIC(10, 2) CHECK (costo_real >= 0),
  fecha_ingreso      DATE NOT NULL DEFAULT CURRENT_DATE,
  fecha_egreso       DATE,
  estado             VARCHAR(50) NOT NULL DEFAULT 'recibido'
                       CHECK (estado IN ('recibido', 'en_reparacion', 'finalizado', 'entregado')),
  proveedor_factura_url VARCHAR(500),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reparaciones_activo_estado
  ON public.inventario_reparaciones (activo_id, estado);

CREATE INDEX IF NOT EXISTS idx_reparaciones_estado
  ON public.inventario_reparaciones (estado);

COMMENT ON TABLE public.inventario_reparaciones
  IS 'Reparaciones de instrumentos. estado controla el flujo: recibido → en_reparacion → finalizado → entregado';

-- =====================================================================
-- Step 10: Tabla facturas_reparacion
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.facturas_reparacion (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reparacion_id   UUID NOT NULL REFERENCES public.inventario_reparaciones(id) ON DELETE RESTRICT,
  numero_factura  VARCHAR(50) NOT NULL UNIQUE,
  monto_total     NUMERIC(10, 2) NOT NULL CHECK (monto_total > 0),
  impuestos       NUMERIC(10, 2) DEFAULT 0 CHECK (impuestos >= 0),
  metodo_pago     VARCHAR(50) NOT NULL
                    CHECK (metodo_pago IN ('efectivo', 'transferencia', 'deposito', 'tarjeta')),
  responsable_id  UUID REFERENCES auth.users(id),
  tipo_factura    VARCHAR(50) NOT NULL DEFAULT 'institucion'
                    CHECK (tipo_factura IN ('alumno', 'institucion')),
  fecha_emision   DATE NOT NULL DEFAULT CURRENT_DATE,
  pdf_generado_url VARCHAR(500),
  estado_pago     VARCHAR(50) NOT NULL DEFAULT 'pendiente'
                    CHECK (estado_pago IN ('pendiente', 'pagado', 'anulada')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_facturas_estado
  ON public.facturas_reparacion (estado_pago);

CREATE INDEX IF NOT EXISTS idx_facturas_reparacion
  ON public.facturas_reparacion (reparacion_id);

COMMENT ON TABLE public.facturas_reparacion
  IS 'Facturas asociadas a reparaciones de instrumentos';

-- =====================================================================
-- Step 11: Función generar_numero_factura()
-- =====================================================================
CREATE OR REPLACE FUNCTION generar_numero_factura()
RETURNS VARCHAR(50) AS $$
DECLARE
  v_anio   VARCHAR(4);
  v_contador INTEGER;
  v_numero VARCHAR(50);
BEGIN
  v_anio := EXTRACT(YEAR FROM CURRENT_DATE)::VARCHAR;
  SELECT COALESCE(MAX(SUBSTRING(numero_factura FROM '\d+$')::INTEGER), 0) + 1
    INTO v_contador
    FROM public.facturas_reparacion
   WHERE numero_factura LIKE 'FACT-' || v_anio || '-%';
  v_numero := 'FACT-' || v_anio || '-' || LPAD(v_contador::VARCHAR, 5, '0');
  RETURN v_numero;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION generar_numero_factura()
  IS 'Genera número de factura secuencial: FACT-2026-00001';

-- =====================================================================
-- Step 12: Trigger — historial automático en inventario_activos
-- =====================================================================
CREATE OR REPLACE FUNCTION fn_historial_activo()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.inventario_historial (activo_id, tipo_evento, descripcion, usuario_id, metadata)
    VALUES (
      NEW.id,
      'creacion',
      'Instrumento creado: ' || COALESCE(NEW.tipo_instrumento, 'sin tipo') || ' - ' || COALESCE(NEW.codigo_inventario, ''),
      NULL,
      jsonb_build_object(
        'tipo_instrumento', NEW.tipo_instrumento,
        'codigo_inventario', NEW.codigo_inventario,
        'estado_uso', NEW.estado_uso,
        'estado_conservacion', NEW.estado_conservacion
      )
    );
  ELSIF TG_OP = 'UPDATE' AND (
    OLD.estado_uso IS DISTINCT FROM NEW.estado_uso OR
    OLD.estado_conservacion IS DISTINCT FROM NEW.estado_conservacion
  ) THEN
    INSERT INTO public.inventario_historial (activo_id, tipo_evento, descripcion, usuario_id, metadata)
    VALUES (
      NEW.id,
      'cambio_estado',
      CASE
        WHEN OLD.estado_uso IS DISTINCT FROM NEW.estado_uso
          THEN 'Cambio de estado_uso: ' || COALESCE(OLD.estado_uso, '?') || ' → ' || COALESCE(NEW.estado_uso, '?')
        WHEN OLD.estado_conservacion IS DISTINCT FROM NEW.estado_conservacion
          THEN 'Cambio de estado_conservacion: ' || COALESCE(OLD.estado_conservacion, '?') || ' → ' || COALESCE(NEW.estado_conservacion, '?')
        ELSE 'Cambio de estado'
      END,
      NULL,
      jsonb_build_object(
        'estado_uso_anterior', OLD.estado_uso,
        'estado_uso_nuevo', NEW.estado_uso,
        'estado_conservacion_anterior', OLD.estado_conservacion,
        'estado_conservacion_nuevo', NEW.estado_conservacion
      )
    );

    IF NEW.estado_uso = 'de_baja' AND OLD.estado_uso IS DISTINCT FROM 'de_baja' THEN
      UPDATE public.inventario_activos
         SET fecha_baja = CURRENT_DATE,
             motivo_baja = COALESCE(NEW.notas, 'Sin motivo especificado')
       WHERE id = NEW.id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_historial_activo ON public.inventario_activos;
CREATE TRIGGER trg_historial_activo
  AFTER INSERT OR UPDATE ON public.inventario_activos
  FOR EACH ROW EXECUTE FUNCTION fn_historial_activo();

-- =====================================================================
-- Step 13: Trigger — historial en comodatos_activos
-- =====================================================================
CREATE OR REPLACE FUNCTION fn_historial_comodato()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.estado = 'activo' THEN
    INSERT INTO public.inventario_historial (activo_id, tipo_evento, descripcion, usuario_id, metadata)
    VALUES (
      NEW.activo_id,
      'asignacion',
      'Instrumento asignado en comodato',
      NEW.registrado_por,
      jsonb_build_object(
        'comodato_id', NEW.id,
        'alumno_id', NEW.alumno_id,
        'fecha_entrega', NEW.fecha_entrega
      )
    );
  ELSIF TG_OP = 'UPDATE' AND OLD.estado = 'activo' AND NEW.estado = 'devuelto' THEN
    INSERT INTO public.inventario_historial (activo_id, tipo_evento, descripcion, usuario_id, metadata)
    VALUES (
      NEW.activo_id,
      'devolucion',
      'Instrumento devuelto de comodato',
      NEW.registrado_por,
      jsonb_build_object(
        'comodato_id', NEW.id,
        'alumno_id', NEW.alumno_id,
        'fecha_devolucion', NEW.fecha_devolucion
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_historial_comodato ON public.comodatos_activos;
CREATE TRIGGER trg_historial_comodato
  AFTER INSERT OR UPDATE ON public.comodatos_activos
  FOR EACH ROW EXECUTE FUNCTION fn_historial_comodato();

-- =====================================================================
-- Step 14: Trigger — sync estado_uso con reparaciones
-- =====================================================================
CREATE OR REPLACE FUNCTION fn_sync_estado_reparacion()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.inventario_activos
       SET estado_uso = 'en_reparacion',
           updated_at = NOW()
     WHERE id = NEW.activo_id;
  ELSIF TG_OP = 'UPDATE' AND NEW.estado = 'entregado' AND OLD.estado IS DISTINCT FROM 'entregado' THEN
    UPDATE public.inventario_activos
       SET estado_uso = CASE
             WHEN EXISTS (
               SELECT 1 FROM public.comodatos_activos
               WHERE activo_id = NEW.activo_id AND estado = 'activo'
             ) THEN 'prestado'
             ELSE 'disponible'
           END,
           updated_at = NOW()
     WHERE id = NEW.activo_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_sync_estado_reparacion ON public.inventario_reparaciones;
CREATE TRIGGER trg_sync_estado_reparacion
  AFTER INSERT OR UPDATE ON public.inventario_reparaciones
  FOR EACH ROW EXECUTE FUNCTION fn_sync_estado_reparacion();

-- =====================================================================
-- Step 15: Trigger — historial de reparaciones
-- =====================================================================
CREATE OR REPLACE FUNCTION fn_historial_reparacion()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.inventario_historial (activo_id, tipo_evento, descripcion, metadata)
    VALUES (
      NEW.activo_id,
      'reparacion',
      'Reparación iniciada: ' || LEFT(NEW.descripcion, 100),
      jsonb_build_object(
        'reparacion_id', NEW.id,
        'tipo_tallerista', NEW.tipo_tallerista,
        'tallerista_nombre', NEW.tallerista_nombre,
        'estado', NEW.estado
      )
    );
  ELSIF TG_OP = 'UPDATE' AND OLD.estado IS DISTINCT FROM NEW.estado THEN
    INSERT INTO public.inventario_historial (activo_id, tipo_evento, descripcion, metadata)
    VALUES (
      NEW.activo_id,
      'reparacion',
      'Reparación cambió a estado: ' || NEW.estado,
      jsonb_build_object(
        'reparacion_id', NEW.id,
        'estado_anterior', OLD.estado,
        'estado_nuevo', NEW.estado
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_historial_reparacion ON public.inventario_reparaciones;
CREATE TRIGGER trg_historial_reparacion
  AFTER INSERT OR UPDATE ON public.inventario_reparaciones
  FOR EACH ROW EXECUTE FUNCTION fn_historial_reparacion();

-- =====================================================================
-- Step 16: Vistas
-- =====================================================================

-- Vista: instrumentos disponibles (para asignar en comodato)
CREATE OR REPLACE VIEW public.vw_instrumentos_disponibles AS
SELECT
  ia.id,
  ia.codigo_inventario,
  ia.tipo_instrumento,
  ia.marca,
  ia.modelo,
  ia.estado_conservacion,
  ia.ubicacion,
  ia.foto_url,
  COALESCE(ca.comodato_id, NULL) AS comodato_activo_id
FROM public.inventario_activos ia
LEFT JOIN LATERAL (
  SELECT id AS comodato_id
  FROM public.comodatos_activos
  WHERE activo_id = ia.id AND estado = 'activo'
  LIMIT 1
) ca ON TRUE
WHERE ia.activo = TRUE
  AND ia.estado_uso = 'disponible'
  AND ia.estado_conservacion NOT IN ('mantenimiento', 'de_baja');

COMMENT ON VIEW public.vw_instrumentos_disponibles
  IS 'Instrumentos disponibles para asignar en comodato (filtrados y con comodato activo si existe)';

-- Vista: reparaciones pendientes
CREATE OR REPLACE VIEW public.vw_reparaciones_pendientes AS
SELECT
  ir.id,
  ir.activo_id,
  ia.codigo_inventario,
  ia.tipo_instrumento,
  ia.marca,
  ia.modelo,
  ir.tipo_tallerista,
  ir.tallerista_nombre,
  ir.descripcion,
  ir.costo_estimado,
  ir.costo_real,
  ir.fecha_ingreso,
  ir.estado,
  CURRENT_DATE - ir.fecha_ingreso AS dias_en_reparacion,
  CASE
    WHEN ir.estado = 'recibido' THEN 'Recibido'
    WHEN ir.estado = 'en_reparacion' THEN 'En reparación'
    WHEN ir.estado = 'finalizado' THEN 'Finalizado'
    WHEN ir.estado = 'entregado' THEN 'Entregado'
  END AS estado_label
FROM public.inventario_reparaciones ir
JOIN public.inventario_activos ia ON ia.id = ir.activo_id
WHERE ir.estado IN ('recibido', 'en_reparacion', 'finalizado')
ORDER BY ir.fecha_ingreso DESC;

COMMENT ON VIEW public.vw_reparaciones_pendientes
  IS 'Reparaciones no entregadas aún, con datos del instrumento y días transcurridos';

-- Vista: KPIs de inventario
CREATE OR REPLACE VIEW public.vw_kpi_inventario AS
SELECT
  COUNT(*) FILTER (WHERE activo = TRUE) AS total_activos,
  COUNT(*) FILTER (WHERE estado_uso = 'disponible' AND activo = TRUE) AS disponibles,
  COUNT(*) FILTER (WHERE estado_uso = 'prestado' AND activo = TRUE) AS en_uso,
  COUNT(*) FILTER (WHERE estado_uso = 'en_mantenimiento' AND activo = TRUE) AS en_mantenimiento,
  COUNT(*) FILTER (WHERE estado_uso = 'en_reparacion' AND activo = TRUE) AS en_reparacion,
  COUNT(*) FILTER (WHERE estado_uso = 'de_baja' OR activo = FALSE) AS de_baja,
  COALESCE(SUM(valor_adquisicion) FILTER (WHERE activo = TRUE), 0) AS valor_total_inventario
FROM public.inventario_activos;

COMMENT ON VIEW public.vw_kpi_inventario
  IS 'Indicadores clave del inventario: totales por estado y valor total';

-- Vista extendida: activos ociosos
DROP VIEW IF EXISTS public.vw_activos_ociosos;
CREATE OR REPLACE VIEW public.vw_activos_ociosos AS
SELECT
  c.id                             AS comodato_id,
  c.activo_id,
  ia.codigo_inventario,
  ia.tipo_instrumento,
  ia.marca,
  ia.modelo,
  c.alumno_id,
  a.nombre_completo                AS alumno_nombre,
  a.activo                         AS alumno_activo,
  c.fecha_entrega,
  c.fecha_vencimiento,
  CURRENT_DATE - c.fecha_entrega   AS dias_prestado,
  CASE
    WHEN c.fecha_vencimiento IS NULL THEN NULL
    WHEN c.fecha_vencimiento < CURRENT_DATE THEN 0
    ELSE c.fecha_vencimiento - CURRENT_DATE
  END AS dias_hasta_vencimiento,
  CASE
    WHEN a.activo = FALSE THEN 'alumno_inactivo'
    WHEN c.fecha_vencimiento IS NOT NULL AND c.fecha_vencimiento < CURRENT_DATE THEN 'vencido'
    WHEN c.fecha_vencimiento IS NOT NULL AND c.fecha_vencimiento <= CURRENT_DATE + 7 THEN 'proximo_vencer'
    ELSE 'normal'
  END AS alerta_tipo
FROM public.comodatos_activos c
JOIN public.inventario_activos ia ON ia.id = c.activo_id
JOIN public.alumnos            a  ON a.id  = c.alumno_id
WHERE c.estado = 'activo';

-- =====================================================================
-- Step 17: Índices adicionales
-- =====================================================================
CREATE INDEX IF NOT EXISTS idx_comodatos_vencimiento
  ON public.comodatos_activos (fecha_vencimiento)
  WHERE estado = 'activo';

CREATE INDEX IF NOT EXISTS idx_comodatos_tipo
  ON public.comodatos_activos (tipo_comodato)
  WHERE estado = 'activo';

CREATE INDEX IF NOT EXISTS idx_inventario_activos_tipo
  ON public.inventario_activos (tipo_instrumento)
  WHERE activo = TRUE;

-- =====================================================================
-- Step 18: RLS — inventario_accesorios
-- =====================================================================
ALTER TABLE public.inventario_accesorios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "accesorios_authenticated_select" ON public.inventario_accesorios;
CREATE POLICY "accesorios_authenticated_select"
  ON public.inventario_accesorios FOR SELECT
  TO authenticated
  USING (TRUE);

DROP POLICY IF EXISTS "accesorios_admin_insert" ON public.inventario_accesorios;
CREATE POLICY "accesorios_admin_insert"
  ON public.inventario_accesorios FOR INSERT
  TO authenticated
  WITH CHECK (es_admin());

DROP POLICY IF EXISTS "accesorios_admin_update" ON public.inventario_accesorios;
CREATE POLICY "accesorios_admin_update"
  ON public.inventario_accesorios FOR UPDATE
  TO authenticated
  USING (es_admin());

DROP POLICY IF EXISTS "accesorios_admin_delete" ON public.inventario_accesorios;
CREATE POLICY "accesorios_admin_delete"
  ON public.inventario_accesorios FOR DELETE
  TO authenticated
  USING (es_admin());

-- =====================================================================
-- Step 19: RLS — inventario_historial
-- =====================================================================
ALTER TABLE public.inventario_historial ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "historial_authenticated_select" ON public.inventario_historial;
CREATE POLICY "historial_authenticated_select"
  ON public.inventario_historial FOR SELECT
  TO authenticated
  USING (TRUE);

-- Insert solo via trigger, no RLS directo
DROP POLICY IF EXISTS "historial_admin_insert" ON public.inventario_historial;
CREATE POLICY "historial_admin_insert"
  ON public.inventario_historial FOR INSERT
  TO authenticated
  WITH CHECK (es_admin());

DROP POLICY IF EXISTS "historial_admin_delete" ON public.inventario_historial;
CREATE POLICY "historial_admin_delete"
  ON public.inventario_historial FOR DELETE
  TO authenticated
  USING (es_admin());

-- =====================================================================
-- Step 20: RLS — inventario_reparaciones
-- =====================================================================
ALTER TABLE public.inventario_reparaciones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reparaciones_authenticated_select" ON public.inventario_reparaciones;
CREATE POLICY "reparaciones_authenticated_select"
  ON public.inventario_reparaciones FOR SELECT
  TO authenticated
  USING (TRUE);

DROP POLICY IF EXISTS "reparaciones_admin_insert" ON public.inventario_reparaciones;
CREATE POLICY "reparaciones_admin_insert"
  ON public.inventario_reparaciones FOR INSERT
  TO authenticated
  WITH CHECK (es_admin());

DROP POLICY IF EXISTS "reparaciones_admin_update" ON public.inventario_reparaciones;
CREATE POLICY "reparaciones_admin_update"
  ON public.inventario_reparaciones FOR UPDATE
  TO authenticated
  USING (es_admin());

DROP POLICY IF EXISTS "reparaciones_admin_delete" ON public.inventario_reparaciones;
CREATE POLICY "reparaciones_admin_delete"
  ON public.inventario_reparaciones FOR DELETE
  TO authenticated
  USING (es_admin());

-- =====================================================================
-- Step 21: RLS — facturas_reparacion
-- =====================================================================
ALTER TABLE public.facturas_reparacion ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "facturas_authenticated_select" ON public.facturas_reparacion;
CREATE POLICY "facturas_authenticated_select"
  ON public.facturas_reparacion FOR SELECT
  TO authenticated
  USING (TRUE);

DROP POLICY IF EXISTS "facturas_admin_insert" ON public.facturas_reparacion;
CREATE POLICY "facturas_admin_insert"
  ON public.facturas_reparacion FOR INSERT
  TO authenticated
  WITH CHECK (es_admin());

DROP POLICY IF EXISTS "facturas_admin_update" ON public.facturas_reparacion;
CREATE POLICY "facturas_admin_update"
  ON public.facturas_reparacion FOR UPDATE
  TO authenticated
  USING (es_admin());

DROP POLICY IF EXISTS "facturas_admin_delete" ON public.facturas_reparacion;
CREATE POLICY "facturas_admin_delete"
  ON public.facturas_reparacion FOR DELETE
  TO authenticated
  USING (es_admin());

-- =====================================================================
-- Step 22: Verificación post-migración
-- =====================================================================
-- SELECT table_name FROM information_schema.tables
--   WHERE table_schema = 'public'
--     AND table_name IN (
--       'inventario_accesorios', 'inventario_historial',
--       'inventario_reparaciones', 'facturas_reparacion'
--     );
-- SELECT * FROM public.vw_kpi_inventario;
-- SELECT es_admin(); -- debe retornar true solo si profiles.rol IN ('admin','inventarista')

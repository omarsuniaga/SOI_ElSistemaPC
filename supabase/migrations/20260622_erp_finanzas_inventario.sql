-- Migration: ERP Expansion — Finanzas e Inventarios
-- Timestamp: 20260622
-- Date: 2026-06-22
-- Purpose: Módulos de pagos/morosidad e inventario/comodatos de instrumentos.
--          Incluye hook hacia hermes_inbox para Task Contract V1 (FIN-P13).
-- Reference: docs/superpowers/specs/2026-06-22-erp-expansion-design.md (SIS-SPEC-ERP-V2)
-- ENGRAM:    erp-expansion/spec (project: omedsunriv)
-- Status: PENDING

-- =====================================================================
-- Step 1: Extender tabla alumnos — campo exento_mensualidad
-- =====================================================================
-- Alumnos becados o bajo convenio institucional nunca acumulan mora.
-- calcularEstadoFinanciero() retorna 'verde' sin evaluar fechas para ellos.
ALTER TABLE public.alumnos
  ADD COLUMN IF NOT EXISTS exento_mensualidad BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN public.alumnos.exento_mensualidad
  IS 'true = alumno becado o bajo convenio. calcularEstadoFinanciero() ignora mora.';

-- =====================================================================
-- Step 2: Tabla pagos_alumnos
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.pagos_alumnos (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alumno_id               UUID NOT NULL REFERENCES public.alumnos(id) ON DELETE RESTRICT,
  monto                   NUMERIC(10, 2) NOT NULL CHECK (monto > 0),
  concepto                VARCHAR(100) NOT NULL
                            CHECK (concepto IN ('mensualidad', 'inscripcion', 'uniforme', 'otro')),
  periodo_mes             DATE NOT NULL,
  -- Siempre el primer día del mes que cubre el pago: 2026-06-01
  -- Permite calcular días de mora comparando con el mes actual.
  fecha_pago              DATE NOT NULL DEFAULT CURRENT_DATE,
  metodo_pago             VARCHAR(50) NOT NULL
                            CHECK (metodo_pago IN ('efectivo', 'transferencia', 'deposito', 'beca')),
  referencia_transaccion  VARCHAR(100),
  registrado_por          UUID REFERENCES auth.users(id),
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índice: impide dos mensualidades del mismo alumno para el mismo mes
CREATE UNIQUE INDEX IF NOT EXISTS uix_pagos_mensualidad_mes
  ON public.pagos_alumnos (alumno_id, periodo_mes)
  WHERE concepto = 'mensualidad';

-- Índice: búsquedas por alumno (estado de cuenta)
CREATE INDEX IF NOT EXISTS idx_pagos_alumno_periodo
  ON public.pagos_alumnos (alumno_id, periodo_mes DESC);

COMMENT ON TABLE public.pagos_alumnos
  IS 'Registro de pagos por alumno. periodo_mes es el mes cubierto, no la fecha de pago.';

-- =====================================================================
-- Step 3: Tabla inventario_activos
-- =====================================================================
-- estado_conservacion = condición física del instrumento
-- estado_uso          = disponibilidad operativa (manejado por trigger)
CREATE TABLE IF NOT EXISTS public.inventario_activos (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo_instrumento     VARCHAR(100) NOT NULL,
  marca                VARCHAR(100),
  modelo               VARCHAR(100),
  numero_serie         VARCHAR(100) UNIQUE,
  codigo_inventario    VARCHAR(50) UNIQUE NOT NULL,
  -- Formato institucional: V8-VIO-001, V8-CEL-002, etc.
  estado_conservacion  VARCHAR(50) NOT NULL DEFAULT 'bueno'
                         CHECK (estado_conservacion IN
                           ('excelente', 'bueno', 'regular', 'mantenimiento', 'de_baja')),
  estado_uso           VARCHAR(50) NOT NULL DEFAULT 'disponible'
                         CHECK (estado_uso IN ('disponible', 'prestado', 'en_mantenimiento')),
  ubicacion            VARCHAR(100) NOT NULL DEFAULT 'Sede Principal',
  activo               BOOLEAN NOT NULL DEFAULT TRUE,
  notas                TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inventario_estado_uso
  ON public.inventario_activos (estado_uso)
  WHERE activo = TRUE;

COMMENT ON TABLE public.inventario_activos
  IS 'Catálogo de instrumentos. estado_uso lo gestiona el trigger trg_comodato_sync_estado_uso.';

-- =====================================================================
-- Step 4: Tabla comodatos_activos
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.comodatos_activos (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activo_id             UUID NOT NULL REFERENCES public.inventario_activos(id) ON DELETE RESTRICT,
  alumno_id             UUID NOT NULL REFERENCES public.alumnos(id) ON DELETE RESTRICT,
  fecha_entrega         DATE NOT NULL DEFAULT CURRENT_DATE,
  fecha_devolucion      DATE,
  estado                VARCHAR(50) NOT NULL DEFAULT 'activo'
                          CHECK (estado IN ('activo', 'devuelto', 'renovado')),
  contrato_firmado_url  VARCHAR(255),
  -- Supabase Storage path: comodatos/{id}/contrato.pdf
  -- Generado con jsPDF en controlComodatosView.js, subido y URL guardada aquí.
  observaciones         TEXT,
  registrado_por        UUID REFERENCES auth.users(id),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Un instrumento solo puede tener un comodato activo a la vez
CREATE UNIQUE INDEX IF NOT EXISTS uix_comodato_activo_por_instrumento
  ON public.comodatos_activos (activo_id)
  WHERE estado = 'activo';

CREATE INDEX IF NOT EXISTS idx_comodatos_alumno
  ON public.comodatos_activos (alumno_id, estado);

COMMENT ON TABLE public.comodatos_activos
  IS 'Préstamos de instrumentos. El trigger trg_comodato_sync_estado_uso sincroniza inventario_activos.estado_uso.';

-- =====================================================================
-- Step 5: Trigger — sincronizar estado_uso en inventario_activos
-- =====================================================================
CREATE OR REPLACE FUNCTION fn_sync_estado_uso_activo()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.estado = 'activo' THEN
    UPDATE public.inventario_activos
       SET estado_uso = 'prestado',
           updated_at = NOW()
     WHERE id = NEW.activo_id;

  ELSIF TG_OP = 'UPDATE'
    AND OLD.estado = 'activo'
    AND NEW.estado IN ('devuelto', 'renovado') THEN
      UPDATE public.inventario_activos
         SET estado_uso = 'disponible',
             updated_at = NOW()
       WHERE id = NEW.activo_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_comodato_sync_estado_uso ON public.comodatos_activos;
CREATE TRIGGER trg_comodato_sync_estado_uso
  AFTER INSERT OR UPDATE ON public.comodatos_activos
  FOR EACH ROW EXECUTE FUNCTION fn_sync_estado_uso_activo();

-- =====================================================================
-- Step 6: Tabla hermes_inbox (HERMES event bus)
-- =====================================================================
-- Receptora de eventos del sistema para que HERMES emita Task Contracts.
-- Si ya existe por implementación previa de HERMES, el IF NOT EXISTS la omite.
CREATE TABLE IF NOT EXISTS public.hermes_inbox (
  id          BIGSERIAL PRIMARY KEY,
  canal       VARCHAR(50) NOT NULL DEFAULT 'db_trigger',
  categoria   VARCHAR(100) NOT NULL,
  -- 'mora_pago' | 'activo_ocioso' | etc. — mapea al árbol AGT-P02
  summary     TEXT NOT NULL,
  raw_ref     UUID,
  -- UUID del alumno, instrumento u objeto relevante
  processed   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hermes_inbox_unprocessed
  ON public.hermes_inbox (created_at)
  WHERE processed = FALSE;

-- hermes_inbox es solo accesible por service_role (HERMES).
-- No se expone a usuarios autenticados con RLS.
ALTER TABLE public.hermes_inbox ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "hermes_inbox_service_only" ON public.hermes_inbox;
CREATE POLICY "hermes_inbox_service_only"
  ON public.hermes_inbox FOR ALL
  TO service_role
  USING (TRUE)
  WITH CHECK (TRUE);

COMMENT ON TABLE public.hermes_inbox
  IS 'Bus de eventos para HERMES. Leída por analyze-risk.js y cron jobs. Solo service_role.';

-- =====================================================================
-- Step 7: Trigger — emitir evento de mora a hermes_inbox
-- =====================================================================
-- Activado AFTER INSERT en pagos_alumnos.
-- Calcula días desde el período más reciente de mensualidad y emite si >= 30 días.
-- HERMES cron (AGT-P08) lee hermes_inbox y emite Task Contract con soi_policy_ref: FIN-P13.
-- PREREQUISITO: FIN-P13_Gestion_Mora_y_Cobranza debe existir en vault SOI (Ola 3, VAULT_AUDIT_REPORT_V1).
CREATE OR REPLACE FUNCTION fn_emit_mora_event()
RETURNS TRIGGER AS $$
DECLARE
  v_dias   INT;
  v_estado TEXT;
  v_nombre TEXT;
BEGIN
  -- Solo evaluar mensualidades (no inscripcion, uniforme, etc.)
  IF NEW.concepto != 'mensualidad' THEN
    RETURN NEW;
  END IF;

  -- Calcular días desde el período mensual más reciente pagado
  SELECT EXTRACT(DAY FROM (CURRENT_DATE - MAX(periodo_mes)))::INT
    INTO v_dias
    FROM public.pagos_alumnos
   WHERE alumno_id = NEW.alumno_id
     AND concepto  = 'mensualidad';

  -- Sin historial previo → primer pago, no hay mora
  IF v_dias IS NULL OR v_dias < 30 THEN
    RETURN NEW;
  END IF;

  -- Clasificar estado
  IF v_dias >= 60 THEN
    v_estado := 'rojo';
  ELSE
    v_estado := 'amarillo';
  END IF;

  -- Resolver nombre del alumno
  SELECT nombre_completo INTO v_nombre
    FROM public.alumnos
   WHERE id = NEW.alumno_id;

  -- Emitir evento al bus de HERMES
  INSERT INTO public.hermes_inbox (canal, categoria, summary, raw_ref)
  VALUES (
    'db_trigger',
    'mora_pago',
    format(
      'Alumno %s en estado financiero %s (%s días desde último pago de mensualidad)',
      COALESCE(v_nombre, NEW.alumno_id::TEXT),
      v_estado,
      v_dias
    ),
    NEW.alumno_id
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_mora_emit_hermes ON public.pagos_alumnos;
CREATE TRIGGER trg_mora_emit_hermes
  AFTER INSERT ON public.pagos_alumnos
  FOR EACH ROW EXECUTE FUNCTION fn_emit_mora_event();

-- =====================================================================
-- Step 8: RLS — pagos_alumnos
-- =====================================================================
ALTER TABLE public.pagos_alumnos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pagos_admin_select" ON public.pagos_alumnos;
CREATE POLICY "pagos_admin_select"
  ON public.pagos_alumnos FOR SELECT
  TO authenticated
  USING (es_admin());

DROP POLICY IF EXISTS "pagos_admin_insert" ON public.pagos_alumnos;
CREATE POLICY "pagos_admin_insert"
  ON public.pagos_alumnos FOR INSERT
  TO authenticated
  WITH CHECK (es_admin());

DROP POLICY IF EXISTS "pagos_admin_update" ON public.pagos_alumnos;
CREATE POLICY "pagos_admin_update"
  ON public.pagos_alumnos FOR UPDATE
  TO authenticated
  USING (es_admin());

-- =====================================================================
-- Step 9: RLS — inventario_activos
-- =====================================================================
ALTER TABLE public.inventario_activos ENABLE ROW LEVEL SECURITY;

-- Todos los autenticados ven el inventario (es información de trabajo operativo)
DROP POLICY IF EXISTS "inventario_authenticated_select" ON public.inventario_activos;
CREATE POLICY "inventario_authenticated_select"
  ON public.inventario_activos FOR SELECT
  TO authenticated
  USING (TRUE);

DROP POLICY IF EXISTS "inventario_admin_insert" ON public.inventario_activos;
CREATE POLICY "inventario_admin_insert"
  ON public.inventario_activos FOR INSERT
  TO authenticated
  WITH CHECK (es_admin());

DROP POLICY IF EXISTS "inventario_admin_update" ON public.inventario_activos;
CREATE POLICY "inventario_admin_update"
  ON public.inventario_activos FOR UPDATE
  TO authenticated
  USING (es_admin());

-- =====================================================================
-- Step 10: RLS — comodatos_activos
-- =====================================================================
ALTER TABLE public.comodatos_activos ENABLE ROW LEVEL SECURITY;

-- Todos los autenticados ven comodatos (maestros necesitan saber qué alumno tiene qué)
DROP POLICY IF EXISTS "comodatos_authenticated_select" ON public.comodatos_activos;
CREATE POLICY "comodatos_authenticated_select"
  ON public.comodatos_activos FOR SELECT
  TO authenticated
  USING (TRUE);

DROP POLICY IF EXISTS "comodatos_admin_insert" ON public.comodatos_activos;
CREATE POLICY "comodatos_admin_insert"
  ON public.comodatos_activos FOR INSERT
  TO authenticated
  WITH CHECK (es_admin());

DROP POLICY IF EXISTS "comodatos_admin_update" ON public.comodatos_activos;
CREATE POLICY "comodatos_admin_update"
  ON public.comodatos_activos FOR UPDATE
  TO authenticated
  USING (es_admin());

-- =====================================================================
-- Step 11: Vista auxiliar — alertas de activos ociosos
-- =====================================================================
-- Usada por alertasComodatosView.js para mostrar instrumentos prestados
-- a alumnos que ya no están activos.
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
  CURRENT_DATE - c.fecha_entrega   AS dias_prestado
FROM public.comodatos_activos c
JOIN public.inventario_activos ia ON ia.id = c.activo_id
JOIN public.alumnos            a  ON a.id  = c.alumno_id
WHERE c.estado = 'activo'
  AND (
    a.activo = FALSE
    -- Alumno marcado como inactivo en el sistema
  );

COMMENT ON VIEW public.vw_activos_ociosos
  IS 'Instrumentos en comodato activo cuyo alumno tiene activo=false. Alimenta alertasComodatosView.js.';

-- =====================================================================
-- Verificación post-migración (ejecutar manualmente si hace falta)
-- =====================================================================
-- SELECT table_name FROM information_schema.tables
--   WHERE table_schema = 'public'
--     AND table_name IN ('pagos_alumnos','inventario_activos','comodatos_activos','hermes_inbox');
--
-- SELECT column_name FROM information_schema.columns
--   WHERE table_name = 'alumnos' AND column_name = 'exento_mensualidad';

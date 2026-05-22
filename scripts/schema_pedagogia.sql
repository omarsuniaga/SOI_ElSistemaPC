-- ============================================================================
-- SCHEMA: Módulo Pedagógico
-- Ejecutar en Supabase SQL Editor
-- Aplica solo los cambios faltantes (IF NOT EXISTS / DO NOTHING)
-- ============================================================================

-- ── 1. PLANIFICACIONES ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS planificaciones (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clase_id          UUID REFERENCES clases(id) ON DELETE SET NULL,
  maestro_id        UUID REFERENCES maestros(id) ON DELETE SET NULL,
  fecha_inicio      DATE,
  tema              TEXT NOT NULL CHECK (char_length(tema) BETWEEN 3 AND 200),
  objetivos         TEXT,
  contenido         TEXT,
  recursos          JSONB DEFAULT '[]',
  evaluacion_metodo TEXT,
  observaciones     TEXT,
  notas_dsl         TEXT,
  instrumento       TEXT,
  estado            TEXT NOT NULL DEFAULT 'planificado'
                    CHECK (estado IN ('planificado', 'ejecutado', 'revisado')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_planificaciones_updated_at ON planificaciones;
CREATE TRIGGER trg_planificaciones_updated_at
  BEFORE UPDATE ON planificaciones
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- RLS
ALTER TABLE planificaciones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "planificaciones_select" ON planificaciones;
CREATE POLICY "planificaciones_select"
  ON planificaciones FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "planificaciones_insert" ON planificaciones;
CREATE POLICY "planificaciones_insert"
  ON planificaciones FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "planificaciones_update" ON planificaciones;
CREATE POLICY "planificaciones_update"
  ON planificaciones FOR UPDATE
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "planificaciones_delete" ON planificaciones;
CREATE POLICY "planificaciones_delete"
  ON planificaciones FOR DELETE
  USING (auth.role() = 'authenticated');


-- ── 2. PROGRESOS ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS progresos (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alumno_id         UUID NOT NULL REFERENCES alumnos(id) ON DELETE CASCADE,
  clase_id          UUID REFERENCES clases(id) ON DELETE SET NULL,
  maestro_id        UUID REFERENCES maestros(id) ON DELETE SET NULL,
  sesion_clase_id   UUID,
  asistencia_id     UUID,
  ejercicio_id      UUID,
  fecha_evaluacion  DATE,
  evaluacion_tipo   TEXT NOT NULL DEFAULT 'parcial'
                    CHECK (evaluacion_tipo IN ('parcial', 'final', 'continua', 'oral', 'practica', 'diagnostica')),
  calificacion      NUMERIC(4,2) CHECK (calificacion BETWEEN 0 AND 5),
  estado_cualitativo TEXT DEFAULT 'en_progreso'
                    CHECK (estado_cualitativo IN ('excelente', 'bueno', 'en_progreso', 'necesita_mejora', 'critico')),
  observaciones     TEXT,
  indicadores       JSONB,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_progresos_updated_at ON progresos;
CREATE TRIGGER trg_progresos_updated_at
  BEFORE UPDATE ON progresos
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- RLS
ALTER TABLE progresos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "progresos_select" ON progresos;
CREATE POLICY "progresos_select"
  ON progresos FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "progresos_insert" ON progresos;
CREATE POLICY "progresos_insert"
  ON progresos FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "progresos_update" ON progresos;
CREATE POLICY "progresos_update"
  ON progresos FOR UPDATE
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "progresos_delete" ON progresos;
CREATE POLICY "progresos_delete"
  ON progresos FOR DELETE
  USING (auth.role() = 'authenticated');


-- ── 3. OBSERVACIONES_ALUMNOS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS observaciones_alumnos (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alumno_id              UUID NOT NULL REFERENCES alumnos(id) ON DELETE CASCADE,
  maestro_id             UUID REFERENCES maestros(id) ON DELETE SET NULL,
  clase_id               UUID REFERENCES clases(id) ON DELETE SET NULL,
  sesion_id              UUID,
  titulo                 TEXT NOT NULL,
  descripcion            TEXT NOT NULL,
  tipo                   TEXT NOT NULL DEFAULT 'comportamiento'
                         CHECK (tipo IN ('comportamiento', 'academico', 'asistencia', 'logro', 'otro')),
  prioridad              TEXT NOT NULL DEFAULT 'media'
                         CHECK (prioridad IN ('baja', 'media', 'alta')),
  estado                 TEXT NOT NULL DEFAULT 'abierta'
                         CHECK (estado IN ('abierta', 'seguimiento', 'resuelta')),
  fecha_observacion      DATE NOT NULL DEFAULT CURRENT_DATE,
  requiere_seguimiento   BOOLEAN NOT NULL DEFAULT FALSE,
  seguimiento_observacion TEXT,
  seguimiento_fecha      DATE,
  -- fields for session-to-canonical promotion
  contenido_parsed       JSONB,
  dedup_key              TEXT,
  origen                 TEXT DEFAULT 'manual',
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_obs_alumnos_updated_at ON observaciones_alumnos;
CREATE TRIGGER trg_obs_alumnos_updated_at
  BEFORE UPDATE ON observaciones_alumnos
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- RLS
ALTER TABLE observaciones_alumnos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "obs_alumnos_select" ON observaciones_alumnos;
CREATE POLICY "obs_alumnos_select"
  ON observaciones_alumnos FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "obs_alumnos_insert" ON observaciones_alumnos;
CREATE POLICY "obs_alumnos_insert"
  ON observaciones_alumnos FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "obs_alumnos_update" ON observaciones_alumnos;
CREATE POLICY "obs_alumnos_update"
  ON observaciones_alumnos FOR UPDATE
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "obs_alumnos_delete" ON observaciones_alumnos;
CREATE POLICY "obs_alumnos_delete"
  ON observaciones_alumnos FOR DELETE
  USING (auth.role() = 'authenticated');

-- ── FIN ───────────────────────────────────────────────────────────────────────

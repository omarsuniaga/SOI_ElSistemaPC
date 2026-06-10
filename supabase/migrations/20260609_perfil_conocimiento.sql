-- ══════════════════════════════════════════════════════════════════
-- Perfil de Conocimiento del Alumno + Cockpit del Director
-- ══════════════════════════════════════════════════════════════════
-- Crea las tablas base para el perfil de conocimiento:
--   perfil_conocimiento          — aserciones de conocimiento por alumno
--   perfil_conocimiento_historial — trayectoria append-only de madurez
-- ══════════════════════════════════════════════════════════════════

-- 1. perfil_conocimiento
CREATE TABLE IF NOT EXISTS public.perfil_conocimiento (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alumno_id         UUID NOT NULL REFERENCES public.alumnos(id) ON DELETE CASCADE,
  dimension         TEXT NOT NULL
                    CHECK (dimension IN ('objetivo', 'escala', 'repertorio', 'tecnica', 'problema')),
  item              TEXT NOT NULL,
  indicator_id      UUID REFERENCES public.indicators(id) ON DELETE SET NULL,
  madurez           TEXT NOT NULL DEFAULT 'introducido'
                    CHECK (madurez IN ('introducido', 'en_progreso', 'dominado')),
  confianza         NUMERIC(3,2) NOT NULL DEFAULT 0.00
                    CHECK (confianza >= 0 AND confianza <= 1),
  estado            TEXT NOT NULL DEFAULT 'propuesto'
                    CHECK (estado IN ('propuesto', 'confirmado', 'descartado')),
  origen_obs_id     UUID REFERENCES public.observaciones_sesion(id) ON DELETE SET NULL,
  evidencia_texto   TEXT,
  creado_por        TEXT NOT NULL DEFAULT 'ia'
                    CHECK (creado_por IN ('ia', 'dsl', 'maestro')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Unique per alumno + dimension + item (upsert key)
  CONSTRAINT uq_perfil_conocimiento_alumno_dimension_item
    UNIQUE (alumno_id, dimension, item)
);

-- 2. perfil_conocimiento_historial (append-only)
CREATE TABLE IF NOT EXISTS public.perfil_conocimiento_historial (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  perfil_id       UUID NOT NULL REFERENCES public.perfil_conocimiento(id) ON DELETE CASCADE,
  madurez_old     TEXT
                  CHECK (madurez_old IS NULL OR madurez_old IN ('introducido', 'en_progreso', 'dominado')),
  madurez_new     TEXT NOT NULL
                  CHECK (madurez_new IN ('introducido', 'en_progreso', 'dominado')),
  origen_obs_id   UUID REFERENCES public.observaciones_sesion(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Índices
CREATE INDEX IF NOT EXISTS idx_perfil_alumno
  ON public.perfil_conocimiento (alumno_id);

CREATE INDEX IF NOT EXISTS idx_perfil_dimension
  ON public.perfil_conocimiento (alumno_id, dimension);

CREATE INDEX IF NOT EXISTS idx_perfil_estado
  ON public.perfil_conocimiento (alumno_id, estado);

CREATE INDEX IF NOT EXISTS idx_perfil_problemas
  ON public.perfil_conocimiento (alumno_id, dimension, estado)
  WHERE dimension = 'problema' AND estado = 'confirmado';

CREATE INDEX IF NOT EXISTS idx_perfil_historial_perfil
  ON public.perfil_conocimiento_historial (perfil_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_perfil_historial_obs
  ON public.perfil_conocimiento_historial (origen_obs_id);

-- 4. RLS
ALTER TABLE public.perfil_conocimiento ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.perfil_conocimiento_historial ENABLE ROW LEVEL SECURITY;

-- Admin: full access
CREATE POLICY "perfil_admin_all"
  ON public.perfil_conocimiento FOR ALL
  TO authenticated
  USING (public.es_admin());

CREATE POLICY "perfil_historial_admin_all"
  ON public.perfil_conocimiento_historial FOR ALL
  TO authenticated
  USING (public.es_admin());

-- Maestros: read + insert/update (necesitan crear aserciones)
CREATE POLICY "perfil_maestro_select"
  ON public.perfil_conocimiento FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "perfil_maestro_insert"
  ON public.perfil_conocimiento FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "perfil_maestro_update"
  ON public.perfil_conocimiento FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "perfil_historial_maestro_select"
  ON public.perfil_conocimiento_historial FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "perfil_historial_maestro_insert"
  ON public.perfil_conocimiento_historial FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 5. Trigger de updated_at
CREATE OR REPLACE FUNCTION public.update_perfil_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_perfil_conocimiento_updated_at ON public.perfil_conocimiento;
CREATE TRIGGER trg_perfil_conocimiento_updated_at
  BEFORE UPDATE ON public.perfil_conocimiento
  FOR EACH ROW
  EXECUTE FUNCTION public.update_perfil_updated_at();

-- 6. Comments
COMMENT ON TABLE public.perfil_conocimiento IS
  'Aserciones de conocimiento por alumno. Una fila = un ítem (objetivo, escala, repertorio, técnica o problema).';

COMMENT ON TABLE public.perfil_conocimiento_historial IS
  'Trayectoria append-only de madurez. Cada cambio de madurez inserta una fila nueva.';

COMMENT ON COLUMN public.perfil_conocimiento.creado_por IS
  'Origen de la aserción: ia (LLM), dsl (parseo determinístico), maestro (manual)';

COMMENT ON COLUMN public.perfil_conocimiento.confianza IS
  'Confianza de la IA en la aserción (0.00–1.00). ≥0.85 → confirmado, <0.85 → propuesto. DSL siempre 1.00.';

COMMENT ON COLUMN public.perfil_conocimiento.estado IS
  'propuesto (confianza baja, requiere confirmación), confirmado (validado), descartado (rechazado por maestro)';

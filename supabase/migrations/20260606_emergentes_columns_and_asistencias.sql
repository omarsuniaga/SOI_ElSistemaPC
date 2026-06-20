-- ══════════════════════════════════════════════════════════════════
-- Etapa 3 — Clases emergentes: columnas adicionales + asistencias
-- ══════════════════════════════════════════════════════════════════

-- 1. Agregar columnas faltantes a clases_emergentes
ALTER TABLE public.clases_emergentes
  ADD COLUMN IF NOT EXISTS salon        TEXT,
  ADD COLUMN IF NOT EXISTS grupo        TEXT,
  ADD COLUMN IF NOT EXISTS instrumento  TEXT,
  ADD COLUMN IF NOT EXISTS tipo         TEXT DEFAULT 'refuerzo',
  ADD COLUMN IF NOT EXISTS estado       TEXT DEFAULT 'pendiente';

-- 2. Crear tabla asistencias_emergentes
CREATE TABLE IF NOT EXISTS public.asistencias_emergentes (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clase_emergente_id  UUID NOT NULL REFERENCES public.clases_emergentes(id) ON DELETE CASCADE,
  alumno_id           UUID,
  alumno_nombre       TEXT NOT NULL,
  estado              TEXT NOT NULL DEFAULT 'presente'
                      CHECK (estado IN ('presente', 'ausente', 'justificado', 'tarde')),
  justificacion       TEXT,
  observacion         TEXT,
  fecha               DATE,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- 3. RLS para asistencias_emergentes
ALTER TABLE public.asistencias_emergentes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read asistencias_emergentes"
  ON public.asistencias_emergentes FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Allow authenticated insert asistencias_emergentes"
  ON public.asistencias_emergentes FOR INSERT
  TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update asistencias_emergentes"
  ON public.asistencias_emergentes FOR UPDATE
  TO authenticated USING (true);

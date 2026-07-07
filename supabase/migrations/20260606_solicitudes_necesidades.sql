-- ══════════════════════════════════════════════════════════════════
-- Etapa 3 — Solicitudes de necesidades de maestros
-- ══════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.solicitudes_necesidades (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  maestro_id       UUID NOT NULL,
  maestro_nombre   TEXT,
  tipo_necesidad   TEXT NOT NULL,
  categoria        TEXT,
  titulo           TEXT NOT NULL,
  descripcion      TEXT NOT NULL,
  prioridad        TEXT NOT NULL DEFAULT 'media'
                   CHECK (prioridad IN ('baja', 'media', 'alta', 'urgente')),
  cantidad         INTEGER,
  area             TEXT,
  observaciones    TEXT,
  estado           TEXT NOT NULL DEFAULT 'pendiente'
                   CHECK (estado IN ('pendiente', 'en_revision', 'aprobada', 'rechazada', 'resuelta')),
  respuesta_admin  TEXT,
  fecha_solicitud  DATE DEFAULT CURRENT_DATE,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.solicitudes_necesidades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Maestros read solicitudes"
  ON public.solicitudes_necesidades FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Maestros insert solicitudes"
  ON public.solicitudes_necesidades FOR INSERT
  TO authenticated WITH CHECK (true);

CREATE POLICY "Admin update solicitudes"
  ON public.solicitudes_necesidades FOR UPDATE
  TO authenticated USING (true);

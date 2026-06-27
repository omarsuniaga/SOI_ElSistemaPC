-- 20260626_sp2_instrumentos.sql
-- SP-2: tabla instrumentos (activos institucionales). Base para entidad asociada de tareas
-- y para el flujo de dominio "instrumento danado" (SP-4).
CREATE TABLE IF NOT EXISTS public.instrumentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text UNIQUE,
  nombre text NOT NULL,
  tipo text,
  marca text,
  serie text,
  estado text NOT NULL DEFAULT 'disponible'
    CHECK (estado IN ('disponible','asignado','danado','en_reparacion','fuera_de_uso')),
  alumno_id uuid,
  alumno_nombre text,
  notas text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_instrumentos_estado ON public.instrumentos (estado);
CREATE INDEX IF NOT EXISTS idx_instrumentos_alumno ON public.instrumentos (alumno_id);

ALTER TABLE public.instrumentos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS instrumentos_auth_all ON public.instrumentos;
CREATE POLICY instrumentos_auth_all ON public.instrumentos
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
REVOKE ALL ON public.instrumentos FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.instrumentos TO authenticated;

-- ============================================================================
-- Seguimiento de Ausentes -- reinicio manual del contador + suspension temporal
-- Aditivo. Aplicar a zmhmdvmyeyswunurcyow.
-- ============================================================================

-- 1. Reinicio manual del contador de ausencias (corte por alumno)
CREATE TABLE IF NOT EXISTS public.seguimiento_ausencias_reinicio (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alumno_id    uuid NOT NULL REFERENCES public.alumnos(id) ON DELETE CASCADE,
  fecha_corte  timestamptz NOT NULL DEFAULT now(),
  motivo       text,
  creado_por   uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at   timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.seguimiento_ausencias_reinicio IS
  'Corte manual: la vista de ausentes solo cuenta ausencias con fecha posterior al fecha_corte mas reciente del alumno. Lo usa el boton "Reiniciar contador" del panel de seguimiento.';
CREATE INDEX IF NOT EXISTS idx_ausencias_reinicio_alumno ON public.seguimiento_ausencias_reinicio (alumno_id);

ALTER TABLE public.seguimiento_ausencias_reinicio ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS ausencias_reinicio_select ON public.seguimiento_ausencias_reinicio;
CREATE POLICY ausencias_reinicio_select ON public.seguimiento_ausencias_reinicio
  FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS ausencias_reinicio_write ON public.seguimiento_ausencias_reinicio;
CREATE POLICY ausencias_reinicio_write ON public.seguimiento_ausencias_reinicio
  FOR ALL TO authenticated USING (public.es_admin()) WITH CHECK (public.es_admin());
GRANT SELECT, INSERT, DELETE ON public.seguimiento_ausencias_reinicio TO authenticated;

-- 2. Suspension temporal del alumno (no es baja; es una pausa aprobada)
CREATE TABLE IF NOT EXISTS public.alumno_suspensiones (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alumno_id      uuid NOT NULL REFERENCES public.alumnos(id) ON DELETE CASCADE,
  desde          date NOT NULL DEFAULT CURRENT_DATE,
  hasta          date,
  motivo         text,
  estado         text NOT NULL DEFAULT 'activa' CHECK (estado IN ('activa', 'levantada')),
  creado_por     uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE SET NULL,
  levantada_por  uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  levantada_en   timestamptz,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.alumno_suspensiones IS
  'Pausa temporal aprobada de un alumno (salud, viaje, familia). Mientras este activa y dentro de la ventana, el alumno no aparece en el panel de seguimiento de ausentes. No modifica alumnos.activo.';
CREATE INDEX IF NOT EXISTS idx_alumno_suspensiones_alumno ON public.alumno_suspensiones (alumno_id);
CREATE INDEX IF NOT EXISTS idx_alumno_suspensiones_activa ON public.alumno_suspensiones (alumno_id) WHERE estado = 'activa';

ALTER TABLE public.alumno_suspensiones ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS alumno_suspensiones_select ON public.alumno_suspensiones;
CREATE POLICY alumno_suspensiones_select ON public.alumno_suspensiones
  FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS alumno_suspensiones_write ON public.alumno_suspensiones;
CREATE POLICY alumno_suspensiones_write ON public.alumno_suspensiones
  FOR ALL TO authenticated USING (public.es_admin()) WITH CHECK (public.es_admin());
GRANT SELECT, INSERT, UPDATE, DELETE ON public.alumno_suspensiones TO authenticated;

CREATE OR REPLACE FUNCTION public.tg_alumno_suspensiones_touch()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := now();
  IF NEW.estado = 'levantada' AND OLD.estado IS DISTINCT FROM 'levantada' THEN
    NEW.levantada_por := COALESCE(NEW.levantada_por, auth.uid());
    NEW.levantada_en  := COALESCE(NEW.levantada_en, now());
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_alumno_suspensiones_touch ON public.alumno_suspensiones;
CREATE TRIGGER trg_alumno_suspensiones_touch BEFORE UPDATE ON public.alumno_suspensiones
  FOR EACH ROW EXECUTE FUNCTION public.tg_alumno_suspensiones_touch();

-- ROLLBACK:
--   DROP TRIGGER IF EXISTS trg_alumno_suspensiones_touch ON public.alumno_suspensiones;
--   DROP FUNCTION IF EXISTS public.tg_alumno_suspensiones_touch();
--   DROP TABLE IF EXISTS public.alumno_suspensiones;
--   DROP TABLE IF EXISTS public.seguimiento_ausencias_reinicio;

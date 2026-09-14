-- Phase 7: link canonical sessions/observations to repertoire work.
-- Additive and unapplied until explicit production approval.

BEGIN;

CREATE TABLE IF NOT EXISTS public.sesion_repertorio_trabajos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sesion_id uuid NOT NULL REFERENCES public.sesiones_clase(id) ON DELETE RESTRICT,
  montaje_id uuid NOT NULL REFERENCES public.montajes(id) ON DELETE RESTRICT,
  montaje_fila_id uuid REFERENCES public.montaje_filas(id) ON DELETE SET NULL,
  alumno_id uuid REFERENCES public.alumnos(id) ON DELETE SET NULL,
  pasaje_id uuid REFERENCES public.montaje_pasajes(id) ON DELETE SET NULL,
  notas text,
  focus_tags text[] NOT NULL DEFAULT '{}',
  tempo_actual integer CHECK (tempo_actual IS NULL OR tempo_actual > 0),
  tempo_objetivo integer CHECK (tempo_objetivo IS NULL OR tempo_objetivo > 0),
  created_by uuid NOT NULL REFERENCES public.maestros(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT sesion_repertorio_trabajos_tempo_valid CHECK (tempo_objetivo IS NULL OR tempo_actual IS NULL OR tempo_objetivo >= tempo_actual)
);

CREATE TABLE IF NOT EXISTS public.sesion_repertorio_trabajo_compases (
  trabajo_id uuid NOT NULL REFERENCES public.sesion_repertorio_trabajos(id) ON DELETE RESTRICT,
  montaje_compas_id uuid NOT NULL REFERENCES public.montaje_compases(id) ON DELETE RESTRICT,
  orden integer NOT NULL DEFAULT 0 CHECK (orden >= 0),
  PRIMARY KEY (trabajo_id, montaje_compas_id)
);

CREATE TABLE IF NOT EXISTS public.observacion_sesion_repertorio (
  observacion_id uuid NOT NULL REFERENCES public.observaciones_sesion(id) ON DELETE RESTRICT,
  trabajo_id uuid NOT NULL REFERENCES public.sesion_repertorio_trabajos(id) ON DELETE RESTRICT,
  PRIMARY KEY (observacion_id, trabajo_id)
);

CREATE INDEX IF NOT EXISTS idx_sesion_repertorio_trabajos_sesion ON public.sesion_repertorio_trabajos(sesion_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sesion_repertorio_trabajos_montaje ON public.sesion_repertorio_trabajos(montaje_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sesion_repertorio_trabajo_compases_compas ON public.sesion_repertorio_trabajo_compases(montaje_compas_id);
CREATE INDEX IF NOT EXISTS idx_observacion_sesion_repertorio_trabajo ON public.observacion_sesion_repertorio(trabajo_id);

ALTER TABLE public.sesion_repertorio_trabajos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sesion_repertorio_trabajo_compases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.observacion_sesion_repertorio ENABLE ROW LEVEL SECURITY;

CREATE POLICY repertoire_session_work_read ON public.sesion_repertorio_trabajos
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.sesiones_clase s WHERE s.id = sesion_id AND (s.maestro_id = maestro_actual() OR maestro_en_clase(s.clase_id) OR es_admin())));
CREATE POLICY repertoire_session_work_write ON public.sesion_repertorio_trabajos
  FOR INSERT TO authenticated
  WITH CHECK (created_by = maestro_actual() AND EXISTS (SELECT 1 FROM public.sesiones_clase s WHERE s.id = sesion_id AND (s.maestro_id = maestro_actual() OR maestro_en_clase(s.clase_id) OR es_admin())));
CREATE POLICY repertoire_session_work_update ON public.sesion_repertorio_trabajos
  FOR UPDATE TO authenticated
  USING (created_by = maestro_actual() OR es_admin())
  WITH CHECK (created_by = maestro_actual() OR es_admin());

CREATE POLICY repertoire_session_work_measure_read ON public.sesion_repertorio_trabajo_compases
  FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.sesion_repertorio_trabajos w WHERE w.id = trabajo_id));
CREATE POLICY repertoire_session_work_measure_write ON public.sesion_repertorio_trabajo_compases
  FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.sesion_repertorio_trabajos w WHERE w.id = trabajo_id AND (w.created_by = maestro_actual() OR es_admin())))
  WITH CHECK (EXISTS (SELECT 1 FROM public.sesion_repertorio_trabajos w WHERE w.id = trabajo_id AND (w.created_by = maestro_actual() OR es_admin())));

CREATE POLICY repertoire_observation_context_read ON public.observacion_sesion_repertorio
  FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.observaciones_sesion o WHERE o.id = observacion_id));
CREATE POLICY repertoire_observation_context_write ON public.observacion_sesion_repertorio
  FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.observaciones_sesion o JOIN public.sesion_repertorio_trabajos w ON w.sesion_id = o.sesion_id WHERE o.id = observacion_id AND w.id = trabajo_id AND (w.created_by = maestro_actual() OR es_admin())))
  WITH CHECK (EXISTS (SELECT 1 FROM public.observaciones_sesion o JOIN public.sesion_repertorio_trabajos w ON w.sesion_id = o.sesion_id WHERE o.id = observacion_id AND w.id = trabajo_id AND (w.created_by = maestro_actual() OR es_admin())));

COMMENT ON TABLE public.sesion_repertorio_trabajos IS 'Trabajo de repertorio dentro de una sesión institucional existente; no reemplaza sesiones_clase.';
COMMENT ON TABLE public.observacion_sesion_repertorio IS 'Relación opcional entre observaciones canónicas y contexto de repertorio.';

COMMIT;

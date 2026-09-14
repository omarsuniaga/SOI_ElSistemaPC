-- Phase 9: explicit human-defined preparation targets and milestones.
-- Local migration only. Do not apply to production without approval.
CREATE TABLE IF NOT EXISTS public.montaje_targets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  montaje_id uuid NOT NULL REFERENCES public.montajes(id) ON DELETE RESTRICT,
  alcance text NOT NULL CHECK (alcance IN ('montage', 'fila', 'passage', 'measure_range', 'student')),
  montaje_fila_id uuid REFERENCES public.montaje_filas(id) ON DELETE SET NULL,
  pasaje_id uuid REFERENCES public.montaje_pasajes(id) ON DELETE SET NULL,
  alumno_id uuid REFERENCES public.alumnos(id) ON DELETE SET NULL,
  estado_objetivo public.estado_preparacion,
  fecha_objetivo date,
  umbral_porcentaje numeric(5,2) CHECK (umbral_porcentaje IS NULL OR umbral_porcentaje BETWEEN 0 AND 100),
  tempo_objetivo integer CHECK (tempo_objetivo IS NULL OR tempo_objetivo > 0),
  prioridad smallint,
  notas text,
  created_by uuid REFERENCES public.maestros(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (estado_objetivo IS NOT NULL OR umbral_porcentaje IS NOT NULL OR tempo_objetivo IS NOT NULL)
);
CREATE TABLE IF NOT EXISTS public.montaje_target_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  target_id uuid NOT NULL REFERENCES public.montaje_targets(id) ON DELETE RESTRICT,
  etiqueta text NOT NULL,
  fecha_objetivo date NOT NULL,
  estado_objetivo public.estado_preparacion,
  umbral_porcentaje numeric(5,2) CHECK (umbral_porcentaje IS NULL OR umbral_porcentaje BETWEEN 0 AND 100),
  tempo_objetivo integer CHECK (tempo_objetivo IS NULL OR tempo_objetivo > 0),
  notas text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_montaje_targets_scope ON public.montaje_targets(montaje_id, alcance, fecha_objetivo);
CREATE INDEX IF NOT EXISTS idx_target_milestones_date ON public.montaje_target_milestones(target_id, fecha_objetivo);
ALTER TABLE public.montaje_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.montaje_target_milestones ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS repertoire_targets_read ON public.montaje_targets;
CREATE POLICY repertoire_targets_read ON public.montaje_targets FOR SELECT TO authenticated USING (get_user_department() = 'ACM' OR get_user_role() = ANY (ARRAY['admin','superadmin','direccion','coordinacion_academica']));
DROP POLICY IF EXISTS repertoire_targets_write ON public.montaje_targets;
CREATE POLICY repertoire_targets_write ON public.montaje_targets FOR ALL TO authenticated USING (get_user_department() = 'ACM' OR get_user_role() = ANY (ARRAY['admin','superadmin','direccion','coordinacion_academica'])) WITH CHECK (get_user_department() = 'ACM' OR get_user_role() = ANY (ARRAY['admin','superadmin','direccion','coordinacion_academica']));
DROP POLICY IF EXISTS repertoire_target_milestones_read ON public.montaje_target_milestones;
CREATE POLICY repertoire_target_milestones_read ON public.montaje_target_milestones FOR SELECT TO authenticated USING (get_user_department() = 'ACM' OR get_user_role() = ANY (ARRAY['admin','superadmin','direccion','coordinacion_academica']));
DROP POLICY IF EXISTS repertoire_target_milestones_write ON public.montaje_target_milestones;
CREATE POLICY repertoire_target_milestones_write ON public.montaje_target_milestones FOR ALL TO authenticated USING (get_user_department() = 'ACM' OR get_user_role() = ANY (ARRAY['admin','superadmin','direccion','coordinacion_academica'])) WITH CHECK (get_user_department() = 'ACM' OR get_user_role() = ANY (ARRAY['admin','superadmin','direccion','coordinacion_academica']));
COMMENT ON TABLE public.montaje_targets IS 'Human-defined expected preparation trajectory; never duplicates preparation history.';

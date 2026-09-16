-- Phase 8: append-only preparation transitions. Local migration only.
-- Do not apply to production without explicit approval.

CREATE TABLE IF NOT EXISTS public.montaje_preparacion_historial (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  montaje_id uuid NOT NULL REFERENCES public.montajes(id) ON DELETE RESTRICT,
  montaje_fila_id uuid REFERENCES public.montaje_filas(id) ON DELETE SET NULL,
  alumno_id uuid REFERENCES public.alumnos(id) ON DELETE SET NULL,
  montaje_compas_id uuid NOT NULL REFERENCES public.montaje_compases(id) ON DELETE RESTRICT,
  estado_anterior public.estado_preparacion,
  estado_nuevo public.estado_preparacion NOT NULL,
  actor_maestro_id uuid REFERENCES public.maestros(id) ON DELETE SET NULL,
  alcance text NOT NULL CHECK (alcance IN ('collective', 'student')),
  fuente text NOT NULL CHECK (fuente IN ('PREPARATION_MUTATION', 'COLLECTIVE_FILA', 'INDIVIDUAL_OVERRIDE', 'OVERRIDE_REMOVED', 'LINKED_GROUP_PROPAGATION')),
  sesion_id uuid REFERENCES public.sesiones_clase(id) ON DELETE SET NULL,
  operacion_masiva_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_montaje_prep_hist_measure ON public.montaje_preparacion_historial(montaje_compas_id, created_at);
CREATE INDEX IF NOT EXISTS idx_montaje_prep_hist_fila ON public.montaje_preparacion_historial(montaje_id, montaje_fila_id, created_at);
CREATE INDEX IF NOT EXISTS idx_montaje_prep_hist_student ON public.montaje_preparacion_historial(alumno_id, montaje_compas_id, created_at);

ALTER TABLE public.montaje_preparacion_historial ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS repertoire_preparation_history_read ON public.montaje_preparacion_historial;
CREATE POLICY repertoire_preparation_history_read ON public.montaje_preparacion_historial
  FOR SELECT TO authenticated
  USING (get_user_department() = 'ACM' OR get_user_role() = ANY (ARRAY['admin','superadmin','direccion','coordinacion_academica']));

COMMENT ON TABLE public.montaje_preparacion_historial IS 'Append-only preparation transitions; session evidence remains in sesion_repertorio_trabajos.';

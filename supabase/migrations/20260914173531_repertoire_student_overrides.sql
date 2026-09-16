CREATE TABLE IF NOT EXISTS public.montaje_alumno_compases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  montaje_alumno_id uuid NOT NULL REFERENCES public.montaje_alumnos(id) ON DELETE CASCADE,
  montaje_compas_id uuid NOT NULL REFERENCES public.montaje_compases(id) ON DELETE CASCADE,
  estado_preparacion public.estado_preparacion NOT NULL DEFAULT 'SIN_EVALUAR',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT montaje_alumno_compases_uk UNIQUE (montaje_alumno_id, montaje_compas_id)
);

CREATE INDEX IF NOT EXISTS idx_montaje_alumno_compases_student ON public.montaje_alumno_compases(montaje_alumno_id);
CREATE INDEX IF NOT EXISTS idx_montaje_alumno_compases_measure ON public.montaje_alumno_compases(montaje_compas_id);

ALTER TABLE public.montaje_alumno_compases ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS repertoire_student_override_read ON public.montaje_alumno_compases;
CREATE POLICY repertoire_student_override_read ON public.montaje_alumno_compases
  FOR SELECT TO authenticated
  USING (get_user_department() = 'ACM' OR get_user_role() = ANY (ARRAY['admin','superadmin','direccion','coordinacion_academica']));
DROP POLICY IF EXISTS repertoire_student_override_write ON public.montaje_alumno_compases;
CREATE POLICY repertoire_student_override_write ON public.montaje_alumno_compases
  FOR ALL TO authenticated
  USING (get_user_department() = 'ACM' OR get_user_role() = ANY (ARRAY['admin','superadmin','direccion','coordinacion_academica']))
  WITH CHECK (get_user_department() = 'ACM' OR get_user_role() = ANY (ARRAY['admin','superadmin','direccion','coordinacion_academica']));

COMMENT ON TABLE public.montaje_alumno_compases IS 'Override individual por alumno y compás; nunca se modifica por cambios colectivos de fila.';

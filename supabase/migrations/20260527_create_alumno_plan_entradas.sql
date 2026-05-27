-- ============================================================
-- alumno_plan_entradas
-- Bitácora de dominio por alumno: diagnóstico inicial +
-- entradas acumulativas de logros/dificultades/objetivos.
-- Aplicada en DB el 2026-05-27 via MCP (migration: create_alumno_plan_entradas)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.alumno_plan_entradas (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  alumno_id       uuid        NOT NULL REFERENCES public.alumnos(id) ON DELETE CASCADE,
  maestro_id      uuid        NOT NULL REFERENCES public.maestros(id) ON DELETE CASCADE,
  tipo            text        NOT NULL
                              CHECK (tipo IN ('diagnostico','logro','en_progreso','dificultad','objetivo')),
  titulo          text        NOT NULL CHECK (char_length(titulo) BETWEEN 2 AND 200),
  descripcion     text        CHECK (char_length(descripcion) <= 2000),
  objetivo_id     uuid        REFERENCES public.curriculo_objetivos(id) ON DELETE SET NULL,
  nivel_referencia text       CHECK (nivel_referencia IN ('inicial','basico','intermedio','avanzado')),
  sesion_id       uuid        REFERENCES public.sesiones_clase(id) ON DELETE SET NULL,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ape_alumno   ON public.alumno_plan_entradas (alumno_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ape_maestro  ON public.alumno_plan_entradas (maestro_id);
CREATE INDEX IF NOT EXISTS idx_ape_objetivo ON public.alumno_plan_entradas (objetivo_id) WHERE objetivo_id IS NOT NULL;

ALTER TABLE public.alumno_plan_entradas ENABLE ROW LEVEL SECURITY;

-- Maestro ve entradas de alumnos en sus clases, o entradas que él creó
CREATE POLICY "maestro_select_plan_entradas"
  ON public.alumno_plan_entradas FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.alumnos_clases ac
      JOIN public.clases c ON c.id = ac.clase_id
      JOIN public.maestros m ON m.id = c.maestro_id
      WHERE ac.alumno_id = alumno_plan_entradas.alumno_id
        AND m.user_id = auth.uid()
    )
    OR maestro_id IN (SELECT id FROM public.maestros WHERE user_id = auth.uid())
  );

-- Maestro solo puede insertar para alumnos en sus clases activas
CREATE POLICY "maestro_insert_plan_entradas"
  ON public.alumno_plan_entradas FOR INSERT
  WITH CHECK (
    maestro_id IN (SELECT id FROM public.maestros WHERE user_id = auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.alumnos_clases ac
      JOIN public.clases c ON c.id = ac.clase_id
      WHERE ac.alumno_id = alumno_plan_entradas.alumno_id
        AND c.maestro_id = alumno_plan_entradas.maestro_id
        AND ac.activo = true
    )
  );

CREATE POLICY "maestro_update_plan_entradas"
  ON public.alumno_plan_entradas FOR UPDATE
  USING (maestro_id IN (SELECT id FROM public.maestros WHERE user_id = auth.uid()));

CREATE POLICY "maestro_delete_plan_entradas"
  ON public.alumno_plan_entradas FOR DELETE
  USING (maestro_id IN (SELECT id FROM public.maestros WHERE user_id = auth.uid()));

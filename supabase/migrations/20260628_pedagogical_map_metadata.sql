-- Pedagogical map metadata for teacher planning v9
-- Adds explicit fields for weighting, evidence, suggested exercises and skill branches.

ALTER TABLE public.plan_temas
  ADD COLUMN IF NOT EXISTS ponderacion NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS habilidad_clave TEXT,
  ADD COLUMN IF NOT EXISTS descripcion TEXT;

ALTER TABLE public.plan_objetivos
  ADD COLUMN IF NOT EXISTS ponderacion NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS evidencia_sugerida TEXT,
  ADD COLUMN IF NOT EXISTS descripcion TEXT;

ALTER TABLE public.plan_indicadores
  ADD COLUMN IF NOT EXISTS ponderacion NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS evidencia_sugerida TEXT,
  ADD COLUMN IF NOT EXISTS ejercicio_sugerido TEXT,
  ADD COLUMN IF NOT EXISTS criterio TEXT,
  ADD COLUMN IF NOT EXISTS calificacion INTEGER DEFAULT 0;

COMMENT ON COLUMN public.plan_temas.ponderacion IS
  'Peso relativo del tema dentro de la rama pedagógica de la clase.';
COMMENT ON COLUMN public.plan_temas.habilidad_clave IS
  'Habilidad principal que esta rama busca desarrollar.';
COMMENT ON COLUMN public.plan_objetivos.ponderacion IS
  'Peso relativo del objetivo dentro del tema.';
COMMENT ON COLUMN public.plan_objetivos.evidencia_sugerida IS
  'Evidencia o desempeño observable sugerido para validar el objetivo.';
COMMENT ON COLUMN public.plan_indicadores.ponderacion IS
  'Peso relativo del indicador dentro del objetivo.';
COMMENT ON COLUMN public.plan_indicadores.evidencia_sugerida IS
  'Evidencia observable sugerida para validar el dominio del indicador.';
COMMENT ON COLUMN public.plan_indicadores.ejercicio_sugerido IS
  'Ejercicio o actividad sugerida para evaluar el indicador.';
COMMENT ON COLUMN public.plan_indicadores.criterio IS
  'Criterio cualitativo resumido para considerar el indicador dominado.';

DROP POLICY IF EXISTS "Maestros gestionan temas de su clase" ON public.plan_temas;
CREATE POLICY "Maestros gestionan temas de su clase" ON public.plan_temas
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.plan_niveles n
    JOIN public.plan_clases pc ON n.clase_id = pc.id
    WHERE n.id = plan_temas.nivel_id
      AND public.maestro_en_clase(pc.id::uuid)
  )
)
WITH CHECK (public.tiene_permiso('planificacion:write'));

DROP POLICY IF EXISTS "Maestros gestionan objetivos de su clase" ON public.plan_objetivos;
CREATE POLICY "Maestros gestionan objetivos de su clase" ON public.plan_objetivos
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.plan_temas t
    JOIN public.plan_niveles n ON t.nivel_id = n.id
    JOIN public.plan_clases pc ON n.clase_id = pc.id
    WHERE t.id = plan_objetivos.tema_id
      AND public.maestro_en_clase(pc.id::uuid)
  )
)
WITH CHECK (public.tiene_permiso('planificacion:write'));

DROP POLICY IF EXISTS "Maestros gestionan indicadores de su clase" ON public.plan_indicadores;
CREATE POLICY "Maestros gestionan indicadores de su clase" ON public.plan_indicadores
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.plan_objetivos o
    JOIN public.plan_temas t ON o.tema_id = t.id
    JOIN public.plan_niveles n ON t.nivel_id = n.id
    JOIN public.plan_clases pc ON n.clase_id = pc.id
    WHERE o.id = plan_indicadores.objetivo_id
      AND public.maestro_en_clase(pc.id::uuid)
  )
)
WITH CHECK (public.tiene_permiso('planificacion:write'));

-- Migration: Desbloqueo de Jerarquía Pedagógica (plan_*)
-- Date: 2026-05-18
-- Objetivo: Asegurar que el maestro vea sus temas, objetivos e indicadores

-- ==============================================================================
-- 1. ASEGURAR QUE RLS ESTÉ ENCENDIDO
-- ==============================================================================
ALTER TABLE public.plan_clases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_niveles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_temas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_objetivos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_indicadores ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 2. POLÍTICAS DE LECTURA (Basadas en pertenencia de Clase)
-- ==============================================================================

-- 2.1 PLAN_CLASES
-- Nota: plan_clases.id se vincula a clases.id (según uso en el sistema)
DROP POLICY IF EXISTS "Maestros ven sus plan_clases" ON public.plan_clases;
CREATE POLICY "Maestros ven sus plan_clases" ON public.plan_clases
FOR SELECT TO authenticated
USING (public.maestro_en_clase(id::uuid));

-- 2.2 PLAN_NIVELES (Cuelga de plan_clases)
DROP POLICY IF EXISTS "Maestros ven sus plan_niveles" ON public.plan_niveles;
CREATE POLICY "Maestros ven sus plan_niveles" ON public.plan_niveles
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.plan_clases pc
    WHERE pc.id = plan_niveles.clase_id
    AND public.maestro_en_clase(pc.id::uuid)
  )
);

-- 2.3 PLAN_TEMAS (Cuelga de plan_niveles)
DROP POLICY IF EXISTS "Maestros ven sus plan_temas" ON public.plan_temas;
CREATE POLICY "Maestros ven sus plan_temas" ON public.plan_temas
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.plan_niveles n
    JOIN public.plan_clases pc ON n.clase_id = pc.id
    WHERE n.id = plan_temas.nivel_id
    AND public.maestro_en_clase(pc.id::uuid)
  )
);

-- 2.4 PLAN_OBJETIVOS (Cuelga de plan_temas)
DROP POLICY IF EXISTS "Maestros ven sus plan_objetivos" ON public.plan_objetivos;
CREATE POLICY "Maestros ven sus plan_objetivos" ON public.plan_objetivos
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.plan_temas t
    JOIN public.plan_niveles n ON t.nivel_id = n.id
    JOIN public.plan_clases pc ON n.clase_id = pc.id
    WHERE t.id = plan_objetivos.tema_id
    AND public.maestro_en_clase(pc.id::uuid)
  )
);

-- 2.5 PLAN_INDICADORES (Cuelga de plan_objetivos)
DROP POLICY IF EXISTS "Maestros ven sus plan_indicadores" ON public.plan_indicadores;
CREATE POLICY "Maestros ven sus plan_indicadores" ON public.plan_indicadores
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.plan_objetivos o
    JOIN public.plan_temas t ON o.tema_id = t.id
    JOIN public.plan_niveles n ON t.nivel_id = n.id
    JOIN public.plan_clases pc ON n.clase_id = pc.id
    WHERE o.id = plan_indicadores.objetivo_id
    AND public.maestro_en_clase(pc.id::uuid)
  )
);

-- ==============================================================================
-- 3. POLÍTICAS DE ESCRITURA (Si el maestro tiene permiso de planificación)
-- ==============================================================================
-- Solo permitimos INSERT/UPDATE si tiene el permiso en su array

CREATE POLICY "Maestros editan sus plan_clases" ON public.plan_clases
FOR ALL TO authenticated
USING (public.maestro_en_clase(id::uuid))
WITH CHECK (public.tiene_permiso('planificacion:write'));

-- Nota: Para simplificar, si tiene acceso de lectura (pertenencia) Y el permiso de escritura global,
-- puede gestionar sus propios niveles, temas e indicadores.

CREATE POLICY "Maestros gestionan niveles de su clase" ON public.plan_niveles
FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.plan_clases WHERE id = plan_niveles.clase_id AND public.maestro_en_clase(id::uuid)))
WITH CHECK (public.tiene_permiso('planificacion:write'));

-- Migration: RLS Estricto basado en Pertenencia (Resolución Definitiva)
-- Date: 2026-05-18
-- Objetivo: Reemplazar políticas permisivas por filtros reales con helpers blindados

-- ==============================================================================
-- 0. HELPERS (Refactorizados a PLPGSQL para robustez)
-- ==============================================================================

-- Helper 1: Obtener ID del maestro vinculado al usuario actual
CREATE OR REPLACE FUNCTION public.maestro_actual()
RETURNS uuid 
SECURITY INVOKER
AS $$ 
BEGIN
  RETURN (SELECT id FROM public.maestros WHERE user_id = auth.uid());
END;
$$ LANGUAGE plpgsql STABLE;

-- Helper 2: Verificar si el maestro tiene un permiso específico
CREATE OR REPLACE FUNCTION public.tiene_permiso(p_permiso text)
RETURNS boolean 
SECURITY INVOKER
AS $$
BEGIN
  RETURN COALESCE(
    (SELECT p_permiso = ANY(permisos)
     FROM public.permisos_maestros
     WHERE maestro_id = public.maestro_actual()),
    false
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- Helper 3: Verificar si el maestro actual pertenece a una clase (Principal o Suplente)
CREATE OR REPLACE FUNCTION public.maestro_en_clase(p_clase_id uuid)
RETURNS boolean 
SECURITY INVOKER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.clases 
    WHERE id = p_clase_id 
    AND (maestro_principal_id = public.maestro_actual() OR maestro_suplente_id = public.maestro_actual())
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- Permisos de ejecución
GRANT EXECUTE ON FUNCTION public.maestro_actual() TO authenticated;
GRANT EXECUTE ON FUNCTION public.tiene_permiso(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.maestro_en_clase(uuid) TO authenticated;

-- ==============================================================================
-- 1. LIMPIEZA DE POLÍTICAS RESIDUALES
-- ==============================================================================

DO $$ 
BEGIN
    -- Alumnos
    DROP POLICY IF EXISTS "alumnos_authenticated_all" ON public.alumnos;
    DROP POLICY IF EXISTS "alumnos_select_public" ON public.alumnos;
    DROP POLICY IF EXISTS "Enable read access for all users" ON public.alumnos;
    DROP POLICY IF EXISTS "Maestros ven alumnos de sus clases" ON public.alumnos;

    -- Clases
    DROP POLICY IF EXISTS "clases_authenticated_all" ON public.clases;
    DROP POLICY IF EXISTS "Enable read access for all users" ON public.clases;
    DROP POLICY IF EXISTS "Maestros ven sus clases" ON public.clases;

    -- Sesiones Clase
    DROP POLICY IF EXISTS "sesiones_clase_authenticated_all" ON public.sesiones_clase;
    DROP POLICY IF EXISTS "Enable read access for all users" ON public.sesiones_clase;
    DROP POLICY IF EXISTS "Maestros ven sus sesiones" ON public.sesiones_clase;
    DROP POLICY IF EXISTS "Maestros gestionan sus sesiones" ON public.sesiones_clase;

    -- Asistencias
    DROP POLICY IF EXISTS "asistencias_authenticated_all" ON public.asistencias;
    DROP POLICY IF EXISTS "Enable read access for all users" ON public.asistencias;
    DROP POLICY IF EXISTS "Maestros gestionan sus asistencias" ON public.asistencias;

    -- Planificacion
    DROP POLICY IF EXISTS "planificacion_authenticated_all" ON public.planificacion;
    DROP POLICY IF EXISTS "viewable by everyone" ON public.planificacion;
    DROP POLICY IF EXISTS "Maestros ven sus planes de clase" ON public.plan_clases;

    -- Ausencias
    DROP POLICY IF EXISTS "ausencias_authenticated_all" ON public.ausencias;
    DROP POLICY IF EXISTS "Maestros ven sus ausencias" ON public.ausencias;
    DROP POLICY IF EXISTS "Maestros gestionan sus ausencias" ON public.ausencias;
END $$;

-- ==============================================================================
-- 2. POLÍTICAS DE PERTENENCIA REAL (CON CASTING EXPLÍCITO)
-- ==============================================================================

-- 2.1 CLASES
CREATE POLICY "Maestros ven sus clases" ON public.clases
FOR SELECT TO authenticated
USING (
  maestro_principal_id = public.maestro_actual() 
  OR maestro_suplente_id = public.maestro_actual()
);

-- 2.2 SESIONES DE CLASE
CREATE POLICY "Maestros ven sus sesiones" ON public.sesiones_clase
FOR SELECT TO authenticated
USING (
  maestro_id = public.maestro_actual()
  OR public.maestro_en_clase(clase_id::uuid)
);

CREATE POLICY "Maestros gestionan sus sesiones" ON public.sesiones_clase
FOR ALL TO authenticated
WITH CHECK (
  maestro_id = public.maestro_actual()
  OR public.maestro_en_clase(clase_id::uuid)
);

-- 2.3 ALUMNOS_CLASES (Inscripciones)
CREATE POLICY "Maestros ven sus inscripciones" ON public.alumnos_clases
FOR SELECT TO authenticated
USING (public.maestro_en_clase(clase_id::uuid));

-- 2.4 ALUMNOS
CREATE POLICY "Maestros ven alumnos de sus clases" ON public.alumnos
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.alumnos_clases ac
    WHERE ac.alumno_id = alumnos.id
    AND public.maestro_en_clase(ac.clase_id::uuid)
  )
);

-- 2.5 ASISTENCIAS
CREATE POLICY "Maestros gestionan sus asistencias" ON public.asistencias
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.sesiones_clase s
    WHERE s.id = asistencias.sesion_clase_id
    AND (s.maestro_id = public.maestro_actual() OR public.maestro_en_clase(s.clase_id::uuid))
  )
)
WITH CHECK (
  public.tiene_permiso('asistencias:write')
  AND EXISTS (
    SELECT 1 FROM public.sesiones_clase s
    WHERE s.id = asistencias.sesion_clase_id
    AND (s.maestro_id = public.maestro_actual() OR public.maestro_en_clase(s.clase_id::uuid))
  )
);

-- 2.6 CONTENIDOS SESION
CREATE POLICY "Maestros gestionan contenidos de sus sesiones" ON public.contenidos_sesion
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.sesiones_clase s
    WHERE s.id = contenidos_sesion.sesion_clase_id
    AND (s.maestro_id = public.maestro_actual() OR public.maestro_en_clase(s.clase_id::uuid))
  )
);

-- 2.7 AUSENCIAS
CREATE POLICY "Maestros gestionan sus ausencias" ON public.ausencias
FOR ALL TO authenticated
USING (maestro_id = public.maestro_actual());

-- 2.8 PLANIFICACIONES
CREATE POLICY "Maestros gestionan sus planificaciones" ON public.planificaciones
FOR ALL TO authenticated
USING (
  maestro_id = public.maestro_actual()
  OR public.maestro_en_clase(clase_id::uuid)
);

-- 2.9 PLAN CLASES
CREATE POLICY "Maestros ven sus planes de clase" ON public.plan_clases
FOR SELECT TO authenticated
USING (
  public.maestro_en_clase(id::uuid)
);

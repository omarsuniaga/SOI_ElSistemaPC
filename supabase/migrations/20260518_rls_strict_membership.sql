-- Migration: RLS Estricto basado en Pertenencia (Maestro -> Clase -> Sesión)
-- Date: 2026-05-18
-- Objetivo: Reemplazar políticas permissive/true por filtros de membresía reales

-- ==============================================================================
-- 1. LIMPIEZA DE POLÍTICAS RESIDUALES (Basado en Auditoría)
-- ==============================================================================

-- Alumnos
DROP POLICY IF EXISTS "alumnos_authenticated_all" ON public.alumnos;
DROP POLICY IF EXISTS "alumnos_select_public" ON public.alumnos;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.alumnos;

-- Clases
DROP POLICY IF EXISTS "clases_authenticated_all" ON public.clases;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.clases;

-- Sesiones Clase
DROP POLICY IF EXISTS "sesiones_clase_authenticated_all" ON public.sesiones_clase;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.sesiones_clase;

-- Asistencias
DROP POLICY IF EXISTS "asistencias_authenticated_all" ON public.asistencias;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.asistencias;

-- Planificacion / Planificaciones
DROP POLICY IF EXISTS "planificacion_authenticated_all" ON public.planificacion;
DROP POLICY IF EXISTS "planificaciones_authenticated_all" ON public.planificaciones;
DROP POLICY IF EXISTS "viewable by everyone" ON public.planificacion;

-- Ausencias
DROP POLICY IF EXISTS "ausencias_authenticated_all" ON public.ausencias;

-- ==============================================================================
-- 2. POLÍTICAS DE PERTENENCIA REAL (CORE TEACHER)
-- ==============================================================================

-- 2.1 CLASES (El ancla de todo)
-- Un maestro ve sus clases donde es principal o suplente
DROP POLICY IF EXISTS "Maestros ven sus clases" ON public.clases;
CREATE POLICY "Maestros ven sus clases" ON public.clases
FOR SELECT TO authenticated
USING (
  maestro_principal_id = public.maestro_actual() 
  OR maestro_suplente_id = public.maestro_actual()
);

-- 2.2 SESIONES DE CLASE
-- Un maestro ve sesiones de sus clases
DROP POLICY IF EXISTS "Maestros ven sus sesiones" ON public.sesiones_clase;
CREATE POLICY "Maestros ven sus sesiones" ON public.sesiones_clase
FOR SELECT TO authenticated
USING (
  maestro_id = public.maestro_actual()
  OR EXISTS (
    SELECT 1 FROM public.clases 
    WHERE id = sesiones_clase.clase_id 
    AND (maestro_principal_id = public.maestro_actual() OR maestro_suplente_id = public.maestro_actual())
  )
);

-- Maestros pueden crear/editar sesiones de sus clases
CREATE POLICY "Maestros gestionan sus sesiones" ON public.sesiones_clase
FOR ALL TO authenticated
WITH CHECK (
  maestro_id = public.maestro_actual()
  OR EXISTS (
    SELECT 1 FROM public.clases 
    WHERE id = sesiones_clase.clase_id 
    AND (maestro_principal_id = public.maestro_actual() OR maestro_suplente_id = public.maestro_actual())
  )
);

-- 2.3 ALUMNOS_CLASES (Inscripciones)
DROP POLICY IF EXISTS "Maestros ven sus inscripciones" ON public.alumnos_clases;
CREATE POLICY "Maestros ven sus inscripciones" ON public.alumnos_clases
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.clases 
    WHERE id = alumnos_clases.clase_id 
    AND (maestro_principal_id = public.maestro_actual() OR maestro_suplente_id = public.maestro_actual())
  )
);

-- 2.4 ALUMNOS (Filtrado por inscripción en sus clases)
DROP POLICY IF EXISTS "Maestros ven alumnos de sus clases" ON public.alumnos;
CREATE POLICY "Maestros ven alumnos de sus clases" ON public.alumnos
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.alumnos_clases ac
    JOIN public.clases c ON ac.clase_id = c.id
    WHERE ac.alumno_id = alumnos.id
    AND (c.maestro_principal_id = public.maestro_actual() OR c.maestro_suplente_id = public.maestro_actual())
  )
);

-- 2.5 ASISTENCIAS
DROP POLICY IF EXISTS "Maestros gestionan sus asistencias" ON public.asistencias;
CREATE POLICY "Maestros gestionan sus asistencias" ON public.asistencias
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.sesiones_clase s
    WHERE s.id = asistencias.sesion_clase_id
    AND (s.maestro_id = public.maestro_actual() OR public.maestro_en_clase(s.clase_id))
  )
)
WITH CHECK (
  public.tiene_permiso('asistencias:write')
  AND EXISTS (
    SELECT 1 FROM public.sesiones_clase s
    WHERE s.id = asistencias.sesion_clase_id
    AND (s.maestro_id = public.maestro_actual() OR public.maestro_en_clase(s.clase_id))
  )
);

-- 2.6 CONTENIDOS SESION
DROP POLICY IF EXISTS "Maestros ven contenidos de sus sesiones" ON public.contenidos_sesion;
CREATE POLICY "Maestros gestionan contenidos de sus sesiones" ON public.contenidos_sesion
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.sesiones_clase s
    WHERE s.id = contenidos_sesion.sesion_clase_id
    AND (s.maestro_id = public.maestro_actual() OR public.maestro_en_clase(s.clase_id))
  )
);

-- 2.7 AUSENCIAS
DROP POLICY IF EXISTS "Maestros ven sus ausencias" ON public.ausencias;
CREATE POLICY "Maestros gestionan sus ausencias" ON public.ausencias
FOR ALL TO authenticated
USING (maestro_id = public.maestro_actual());

-- ==============================================================================
-- 3. PLANIFICACIÓN (P0 CRITICAL)
-- ==============================================================================

-- Planificaciones
DROP POLICY IF EXISTS "Maestros gestionan sus planificaciones" ON public.planificaciones;
CREATE POLICY "Maestros gestionan sus planificaciones" ON public.planificaciones
FOR ALL TO authenticated
USING (
  maestro_id = public.maestro_actual()
  OR public.maestro_en_clase(clase_id)
);

-- Plan Clases
DROP POLICY IF EXISTS "Maestros ven sus planes de clase" ON public.plan_clases;
CREATE POLICY "Maestros ven sus planes de clase" ON public.plan_clases
FOR SELECT TO authenticated
USING (
  public.maestro_en_clase(id) -- Si plan_clases.id == clases.id (según ajuste previo)
  OR EXISTS (SELECT 1 FROM public.clases WHERE id = plan_clases.id AND (maestro_principal_id = public.maestro_actual() OR maestro_suplente_id = public.maestro_actual()))
);

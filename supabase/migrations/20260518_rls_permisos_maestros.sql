-- Migration: RLS + Permisos Flexibles para Maestros
-- Date: 2026-05-18
-- SDD: rls-permisos-maestros

-- 1. HELPERS
CREATE OR REPLACE FUNCTION public.maestro_actual()
RETURNS uuid AS $$ 
  SELECT id FROM public.maestros WHERE user_id = auth.uid();
$$ LANGUAGE SQL STABLE;

CREATE OR REPLACE FUNCTION public.tiene_permiso(p_permiso text)
RETURNS boolean AS $$
  SELECT COALESCE(
    (SELECT p_permiso = ANY(permisos)
     FROM public.permisos_maestros
     WHERE maestro_id = public.maestro_actual()),
    false
  );
$$ LANGUAGE SQL STABLE;

CREATE OR REPLACE FUNCTION public.maestro_en_clase(p_clase_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.clases 
    WHERE id = p_clase_id 
    AND (maestro_principal_id = public.maestro_actual() OR maestro_suplente_id = public.maestro_actual())
  );
$$ LANGUAGE SQL STABLE;

-- 2. MIGRACION PERMISOS -> ARREGLO
ALTER TABLE public.permisos_maestros
  ADD COLUMN IF NOT EXISTS permisos text[] DEFAULT ARRAY[]::text[],
  ADD COLUMN IF NOT EXISTS solicitudes text[] DEFAULT ARRAY[]::text[];

-- Poblar arreglo desde booleanos existentes (Solo si el arreglo está vacío)
UPDATE public.permisos_maestros
SET permisos = ARRAY(
  SELECT key FROM (VALUES
    ('alumnos:create', puede_registrar_alumnos),
    ('clases:enroll', puede_inscribir_clases)
  ) AS p(key, flag) WHERE flag = true
)::text[]
WHERE permisos = ARRAY[]::text[];

-- 3. AJUSTE SCHEMA (Asociar planes con clases para RLS)
ALTER TABLE public.plan_clases ADD COLUMN IF NOT EXISTS clase_id uuid REFERENCES public.clases(id);

-- 4. INDICES PARA PERFORMANCE RLS
CREATE INDEX IF NOT EXISTS idx_sesiones_clase_maestro ON public.sesiones_clase(maestro_id, id);
CREATE INDEX IF NOT EXISTS idx_asistencias_sesion ON public.asistencias(sesion_clase_id);
CREATE INDEX IF NOT EXISTS idx_clases_maestro_principal ON public.clases(maestro_principal_id, id);
CREATE INDEX IF NOT EXISTS idx_alumnos_clases_clase_alumno ON public.alumnos_clases(clase_id, alumno_id);
CREATE INDEX IF NOT EXISTS idx_plan_clases_clase ON public.plan_clases(clase_id);
CREATE INDEX IF NOT EXISTS idx_plan_niveles_clase ON public.plan_niveles(clase_id);
CREATE INDEX IF NOT EXISTS idx_plan_temas_nivel ON public.plan_temas(nivel_id);
CREATE INDEX IF NOT EXISTS idx_plan_objetivos_tema ON public.plan_objetivos(tema_id);
CREATE INDEX IF NOT EXISTS idx_plan_indicadores_objetivo ON public.plan_indicadores(objetivo_id);
CREATE INDEX IF NOT EXISTS idx_horarios_clase ON public.horarios(clase_id);
CREATE INDEX IF NOT EXISTS idx_planificaciones_maestro ON public.planificaciones(maestro_id);
CREATE INDEX IF NOT EXISTS idx_planificacion_nodos_maestro ON public.planificacion_nodos(maestro_id);

-- 5. ENABLE RLS
ALTER TABLE public.plan_indicadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_objetivos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_niveles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_temas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alumnos_clases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asistencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planificaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_clases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planificacion_nodos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alumnos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sesiones_clase ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.horarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contenidos_sesion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ausencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.justificaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progresos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.observaciones_sesion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.observaciones_alumnos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planificacion ENABLE ROW LEVEL SECURITY;

-- 6. POLICIES P0 (Alta Prioridad - Planificación y Core)

-- Plan Clases
CREATE POLICY "Maestros ven sus planes de clase" ON public.plan_clases
FOR SELECT TO authenticated USING (public.maestro_en_clase(clase_id));

-- Plan Niveles
CREATE POLICY "Maestros ven sus niveles" ON public.plan_niveles
FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.plan_clases WHERE id = plan_niveles.clase_id AND public.maestro_en_clase(clase_id))
);

-- Plan Temas
CREATE POLICY "Maestros ven sus temas" ON public.plan_temas
FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.plan_niveles n
    JOIN public.plan_clases pc ON n.clase_id = pc.id
    WHERE n.id = plan_temas.nivel_id AND public.maestro_en_clase(pc.clase_id)
  )
);

-- Plan Objetivos
CREATE POLICY "Maestros ven sus objetivos" ON public.plan_objetivos
FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.plan_temas t
    JOIN public.plan_niveles n ON t.nivel_id = n.id
    JOIN public.plan_clases pc ON n.clase_id = pc.id
    WHERE t.id = plan_objetivos.tema_id AND public.maestro_en_clase(pc.clase_id)
  )
);

-- Plan Indicadores
CREATE POLICY "Maestros ven sus indicadores" ON public.plan_indicadores
FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.plan_objetivos o
    JOIN public.plan_temas t ON o.tema_id = t.id
    JOIN public.plan_niveles n ON t.nivel_id = n.id
    JOIN public.plan_clases pc ON n.clase_id = pc.id
    WHERE o.id = plan_indicadores.objetivo_id AND public.maestro_en_clase(pc.clase_id)
  )
);

-- Asistencias
CREATE POLICY "Maestros gestionan sus asistencias" ON public.asistencias
FOR ALL TO authenticated 
USING (EXISTS (SELECT 1 FROM public.sesiones_clase WHERE id = sesion_clase_id AND maestro_id = public.maestro_actual()))
WITH CHECK (public.tiene_permiso('asistencias:write'));

-- Alumnos Clases
CREATE POLICY "Maestros ven sus inscripciones" ON public.alumnos_clases
FOR SELECT TO authenticated USING (public.maestro_en_clase(clase_id));

-- Planificaciones
CREATE POLICY "Maestros gestionan sus planificaciones" ON public.planificaciones
FOR ALL TO authenticated USING (maestro_id = public.maestro_actual());

-- Planificacion Nodos
CREATE POLICY "Maestros gestionan sus nodos de planificación" ON public.planificacion_nodos
FOR ALL TO authenticated USING (maestro_id = public.maestro_actual());

-- 7. POLICIES P1 (Core Diario)

-- Alumnos (Solo ven alumnos que están en sus clases)
CREATE POLICY "Maestros ven alumnos de sus clases" ON public.alumnos
FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.alumnos_clases WHERE alumno_id = id AND public.maestro_en_clase(clase_id))
);

-- Clases
CREATE POLICY "Maestros ven sus clases" ON public.clases
FOR SELECT TO authenticated USING (maestro_principal_id = public.maestro_actual() OR maestro_suplente_id = public.maestro_actual());

-- Sesiones Clase
CREATE POLICY "Maestros ven sus sesiones" ON public.sesiones_clase
FOR SELECT TO authenticated USING (maestro_id = public.maestro_actual());

-- Horarios
CREATE POLICY "Maestros ven horarios de sus clases" ON public.horarios
FOR SELECT TO authenticated USING (public.maestro_en_clase(clase_id));

-- Contenidos Sesion
CREATE POLICY "Maestros ven contenidos de sus sesiones" ON public.contenidos_sesion
FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.sesiones_clase WHERE id = sesion_clase_id AND maestro_id = public.maestro_actual())
);

-- 8. POLICIES P2 (Secundarias)

-- Ausencias
CREATE POLICY "Maestros ven sus ausencias" ON public.ausencias
FOR SELECT TO authenticated USING (maestro_id = public.maestro_actual());

-- Justificaciones
CREATE POLICY "Maestros ven justificaciones de sus alumnos" ON public.justificaciones
FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.alumnos_clases WHERE alumno_id = justificaciones.alumno_id AND public.maestro_en_clase(clase_id))
);

-- Progresos
CREATE POLICY "Maestros ven progresos de sus alumnos" ON public.progresos
FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.alumnos_clases WHERE alumno_id = progresos.alumno_id AND public.maestro_en_clase(clase_id))
);

-- Observaciones Sesion
CREATE POLICY "Maestros ven observaciones de sus sesiones" ON public.observaciones_sesion
FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.sesiones_clase WHERE id = sesion_id AND maestro_id = public.maestro_actual())
);

-- Observaciones Alumnos
CREATE POLICY "Maestros ven observaciones de sus alumnos" ON public.observaciones_alumnos
FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.alumnos_clases WHERE alumno_id = observaciones_alumnos.alumno_id AND public.maestro_en_clase(clase_id))
);

-- 9. GRANTS
GRANT EXECUTE ON FUNCTION public.maestro_actual() TO authenticated;
GRANT EXECUTE ON FUNCTION public.tiene_permiso(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.maestro_en_clase(uuid) TO authenticated;

-- Habilitar RLS en todas las tablas del módulo
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_level_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_node_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.indicator_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_session_content_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_plan_nodes ENABLE ROW LEVEL SECURITY;

-------------------------------------------------------------------------------
-- POLÍTICAS PARA MAESTROS
-------------------------------------------------------------------------------

-- Los maestros pueden leer toda la estructura curricular
CREATE POLICY teacher_read_routes ON public.routes FOR SELECT TO authenticated USING (true);
CREATE POLICY teacher_read_versions ON public.route_versions FOR SELECT TO authenticated USING (true);
CREATE POLICY teacher_read_blocks ON public.blocks FOR SELECT TO authenticated USING (true);
CREATE POLICY teacher_read_levels ON public.levels FOR SELECT TO authenticated USING (true);
CREATE POLICY teacher_read_nodes ON public.nodes FOR SELECT TO authenticated USING (true);
CREATE POLICY teacher_read_indicators ON public.indicators FOR SELECT TO authenticated USING (true);

-- Los maestros pueden gestionar sesiones de clase donde ellos son los encargados
CREATE POLICY teacher_manage_sessions ON public.class_sessions FOR ALL TO authenticated 
USING (maestro_id = auth.uid())
WITH CHECK (maestro_id = auth.uid());

-- Los maestros pueden gestionar snapshots de sus sesiones
CREATE POLICY teacher_manage_snapshots ON public.class_session_content_snapshots FOR ALL TO authenticated 
USING (session_id IN (SELECT id FROM public.class_sessions WHERE maestro_id = auth.uid()));

-- Los maestros pueden registrar asistencia en sus sesiones
CREATE POLICY teacher_manage_attendance ON public.attendance_records FOR ALL TO authenticated 
USING (session_id IN (SELECT id FROM public.class_sessions WHERE maestro_id = auth.uid()));

-- Los maestros pueden ver planes académicos de sus alumnos y registrar intentos de evaluación
CREATE POLICY teacher_read_plans ON public.academic_plans FOR SELECT TO authenticated USING (true);
CREATE POLICY teacher_insert_attempts ON public.indicator_attempts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY teacher_read_attempts ON public.indicator_attempts FOR SELECT TO authenticated USING (true);

-- Los maestros pueden ver el progreso de los alumnos
CREATE POLICY teacher_read_student_node_progress ON public.student_node_progress FOR SELECT TO authenticated USING (true);
CREATE POLICY teacher_read_student_level_progress ON public.student_level_progress FOR SELECT TO authenticated USING (true);

-------------------------------------------------------------------------------
-- POLÍTICAS PARA ALUMNOS (Asumiendo que auth.uid() coincide con student_id)
-------------------------------------------------------------------------------

-- Los alumnos pueden leer su propio plan académico
CREATE POLICY student_read_own_plan ON public.academic_plans FOR SELECT TO authenticated 
USING (student_id = auth.uid());

-- Los alumnos pueden leer su propio progreso de nivel
CREATE POLICY student_read_own_level_progress ON public.student_level_progress FOR SELECT TO authenticated 
USING (student_id = auth.uid());

-- Los alumnos pueden leer su propio progreso de nodo
CREATE POLICY student_read_own_node_progress ON public.student_node_progress FOR SELECT TO authenticated 
USING (student_id = auth.uid());

-- Los alumnos pueden leer sus propios intentos de evaluación
CREATE POLICY student_read_own_attempts ON public.indicator_attempts FOR SELECT TO authenticated 
USING (student_id = auth.uid());

-- Los alumnos pueden ver la estructura de la ruta que están cursando (simplificado a lectura global por ahora)
CREATE POLICY student_read_routes ON public.routes FOR SELECT TO authenticated USING (true);
CREATE POLICY student_read_versions ON public.route_versions FOR SELECT TO authenticated USING (true);
CREATE POLICY student_read_blocks ON public.blocks FOR SELECT TO authenticated USING (true);
CREATE POLICY student_read_levels ON public.levels FOR SELECT TO authenticated USING (true);
CREATE POLICY student_read_nodes ON public.nodes FOR SELECT TO authenticated USING (true);
CREATE POLICY student_read_indicators ON public.indicators FOR SELECT TO authenticated USING (true);

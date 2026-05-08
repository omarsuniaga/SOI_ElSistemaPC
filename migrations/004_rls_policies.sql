-- ============================================================================
-- MIGRACIÓN: Row Level Security (RLS) Policies
-- ============================================================================
-- Sistema Académico PWA
-- Roles: admin, teacher, user (estudiante)
-- ============================================================================

-- ============================================================================
-- HABILITAR RLS EN TABLAS
-- ============================================================================

-- Profiles (habilitar RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- ROLES Y FUNCIONES AUXILIARES
-- ============================================================================

-- Función para obtener el rol del usuario actual
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT role::TEXT FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Función para verificar si es admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT public.get_user_role() = 'admin';
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Función para verificar si es teacher
CREATE OR REPLACE FUNCTION public.is_teacher()
RETURNS BOOLEAN AS $$
  SELECT public.get_user_role() = 'teacher';
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- ============================================================================
-- POLÍTICAS PARA profiles
-- ============================================================================

-- Admin puede ver todos los perfiles
DROP POLICY IF EXISTS profiles_admin_read ON public.profiles;
CREATE POLICY profiles_admin_read ON public.profiles
  FOR SELECT USING (
    (SELECT public.is_admin()) = true
  );

-- Usuario puede ver su propio perfil
DROP POLICY IF EXISTS profiles_own_read ON public.profiles;
CREATE POLICY profiles_own_read ON public.profiles
  FOR SELECT USING (id = auth.uid());

-- Usuario puede actualizar su propio perfil
DROP POLICY IF EXISTS profiles_own_update ON public.profiles;
CREATE POLICY profiles_own_update ON public.profiles
  FOR UPDATE USING (id = auth.uid());

-- Admin puede crear perfiles
DROP POLICY IF EXISTS profiles_admin_insert ON public.profiles;
CREATE POLICY profiles_admin_insert ON public.profiles
  FOR INSERT WITH CHECK (
    (SELECT public.is_admin()) = true OR id = auth.uid()
  );

-- ============================================================================
-- POLÍTICAS PARA students
-- ============================================================================

-- Todos pueden leer estudiantes (necesario para el frontend)
DROP POLICY IF EXISTS students_public_read ON public.students;
CREATE POLICY students_public_read ON public.students
  FOR SELECT USING (true);

-- Solo admin puede insertar/actualizar/eliminar
DROP POLICY IF EXISTS students_admin_write ON public.students;
CREATE POLICY students_admin_write ON public.students
  FOR ALL USING ((SELECT public.is_admin()) = true);

-- ============================================================================
-- POLÍTICAS PARA progresos_academicos
-- ============================================================================

-- Admin puede hacer todo
DROP POLICY IF EXISTS progresos_admin_all ON public.progresos_academicos;
CREATE POLICY progresos_admin_all ON public.progresos_academicos
  FOR ALL USING ((SELECT public.is_admin()) = true);

-- Teacher puede crear y leer calificaciones
DROP POLICY IF EXISTS progresos_teacher_access ON public.progresos_academicos;
CREATE POLICY progresos_teacher_access ON public.progresos_academicos
  FOR ALL USING (
    (SELECT public.is_teacher()) = true OR 
    (SELECT public.is_admin()) = true
  );

-- Estudiante puede ver sus propias calificaciones
DROP POLICY IF EXISTS progresos_student_read ON public.progresos_academicos;
CREATE POLICY progresos_student_read ON public.progresos_academicos
  FOR SELECT USING (
    (SELECT public.is_teacher()) = true OR 
    (SELECT public.is_admin()) = true OR
    -- Alumno puede ver su propio progreso (por relacion con students)
    EXISTS (
      SELECT 1 FROM public.students s 
      WHERE s.id = progresos_academicos.alumno_id 
      AND s.email = auth.jwt()->>'email'
    )
  );

-- ============================================================================
-- POLÍTICAS PARA observaciones
-- ============================================================================

-- Admin puede hacer todo
DROP POLICY IF EXISTS observaciones_admin_all ON public.observaciones;
CREATE POLICY observaciones_admin_all ON public.observaciones
  FOR ALL USING ((SELECT public.is_admin()) = true);

-- Teacher puede crear y leer observaciones
DROP POLICY IF EXISTS observaciones_teacher_access ON public.observaciones;
CREATE POLICY observaciones_teacher_access ON public.observaciones
  FOR ALL USING (
    (SELECT public.is_teacher()) = true OR 
    (SELECT public.is_admin()) = true
  );

--Teacher y admin pueden ver observaciones
DROP POLICY IF EXISTS observaciones_teacher_read ON public.observaciones;
CREATE POLICY observaciones_teacher_read ON public.observaciones
  FOR SELECT USING (
    (SELECT public.is_teacher()) = true OR 
    (SELECT public.is_admin()) = true
  );

-- ============================================================================
-- POLÍTICAS PARA planificaciones
-- ============================================================================

-- Admin puede hacer todo
DROP POLICY IF EXISTS planificaciones_admin_all ON public.planificaciones;
CREATE POLICY planificaciones_admin_all ON public.planificaciones
  FOR ALL USING ((SELECT public.is_admin()) = true);

-- Teacher puede crear y modificar sus planificaciones
DROP POLICY IF EXISTS planificaciones_teacher_access ON public.planificaciones;
CREATE POLICY planificaciones_teacher_access ON public.planificaciones
  FOR ALL USING (
    (SELECT public.is_teacher()) = true OR 
    (SELECT public.is_admin()) = true
  );

-- Público puede leer planificaciones (visible en frontend)
DROP POLICY IF EXISTS planificaciones_public_read ON public.planificaciones;
CREATE POLICY planificaciones_public_read ON public.planificaciones
  FOR SELECT USING (true);

-- ============================================================================
-- NOTAS
-- ============================================================================

-- Estas políticas asumen:
-- 1. La tabla profiles tiene una columna 'role' con valores: 'admin', 'teacher', 'user'
-- 2. La función auth.uid() devuelve el UUID del usuario autenticado
-- 3. Los estudiantes tienen email en la tabla students (para verificar identidad)

-- Para producción, revisar y ajustar según necesidades específicas
-- Las políticas actuales permiten bastante acceso (debug mode)

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================

SELECT 'RLS Policies aplicadas' AS status;

-- Verificar políticas creadas
SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'students', 'progresos_academicos', 'observaciones', 'planificaciones')
ORDER BY tablename, policyname;

-- ============================================================================
-- FIN DE MIGRACIÓN
-- ============================================================================
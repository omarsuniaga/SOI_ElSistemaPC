-- Migration: Correcciones de Seguridad RLS y Políticas Permisivas
-- Date: 2026-05-18
-- Objetivo: Sellar brechas de seguridad identificadas en la auditoría

-- ==============================================================================
-- 1. DROP DE POLÍTICAS "ALWAYS TRUE" O PERMISIVAS EXISTENTES
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

-- Planificacion
DROP POLICY IF EXISTS "planificacion_authenticated_all" ON public.planificacion;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.planificacion;

-- Planificaciones
DROP POLICY IF EXISTS "planificaciones_authenticated_all" ON public.planificaciones;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.planificaciones;

-- Ausencias
DROP POLICY IF EXISTS "ausencias_authenticated_all" ON public.ausencias;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.ausencias;

-- Observaciones Alumnos
DROP POLICY IF EXISTS "observaciones_alumnos_authenticated_all" ON public.observaciones_alumnos;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.observaciones_alumnos;

-- Observaciones Sesion
DROP POLICY IF EXISTS "observaciones_sesion_authenticated_all" ON public.observaciones_sesion;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.observaciones_sesion;

-- ==============================================================================
-- 2. HABILITAR RLS EN TABLAS SECUNDARIAS/ADMIN-ONLY QUE ESTABAN DESHABILITADAS
-- ==============================================================================
ALTER TABLE public.alumnos_rutas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalogos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clase_acceso_temporal ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clases_emergentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historial_estado_alumno ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maestro_tareas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.periodos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permisos_maestros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solicitudes_ausencia ENABLE ROW LEVEL SECURITY;

-- Nota: Las tablas admin-only se dejan con RLS ON y SIN POLÍTICAS (default deny) 
-- para roles 'authenticated' comunes. Los accesos de admin deben manejarse mediante 
-- roles específicos o Service Role Key desde el backend.

-- Para las tablas de solo lectura necesarias para el flujo del teacher (ej. rutas, niveles):
CREATE POLICY "Maestros pueden leer bloques de rutas" ON public.blocks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Maestros pueden leer rutas" ON public.routes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Maestros pueden leer niveles" ON public.levels FOR SELECT TO authenticated USING (true);
CREATE POLICY "Maestros pueden leer nodos" ON public.nodes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Maestros pueden leer indicadores" ON public.indicators FOR SELECT TO authenticated USING (true);

-- Permisos_maestros (el maestro puede leer el suyo)
CREATE POLICY "Maestro ve sus propios permisos" ON public.permisos_maestros
FOR SELECT TO authenticated USING (maestro_id = public.maestro_actual());

-- ==============================================================================
-- 3. REVOCAR ACCESO PÚBLICO A FUNCIONES SECURITY DEFINER
-- ==============================================================================
-- Estas funciones realizan acciones críticas (cambiar roles, aprobar usuarios)
-- y NUNCA deben ser invocables por el rol 'public' o un 'authenticated' sin verificación.
REVOKE EXECUTE ON FUNCTION public.aprobar_usuario(uuid) FROM public;
REVOKE EXECUTE ON FUNCTION public.aprobar_usuario(uuid) FROM authenticated;

REVOKE EXECUTE ON FUNCTION public.rechazar_usuario(uuid) FROM public;
REVOKE EXECUTE ON FUNCTION public.rechazar_usuario(uuid) FROM authenticated;

REVOKE EXECUTE ON FUNCTION public.cambiar_rol_usuario(uuid, text) FROM public;
REVOKE EXECUTE ON FUNCTION public.cambiar_rol_usuario(uuid, text) FROM authenticated;

REVOKE EXECUTE ON FUNCTION public.create_profile_for_maestro() FROM public;
-- (Esta se usa en el trigger, el rol de la BDD lo ejecuta)

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM public;

REVOKE EXECUTE ON FUNCTION public.update_profile(uuid, text, text) FROM public;

-- Las funciones SECURITY DEFINER deben incluir verificaciones internas de auth.uid() 
-- o requerir permisos específicos en su lógica.

-- ==============================================================================
-- 4. VISTAS SECURITY DEFINER
-- ==============================================================================
-- Las vistas vw_* marcadas como SECURITY DEFINER deben ser revisadas. 
-- Idealmente, deberían cambiarse a SECURITY INVOKER para que respeten el RLS,
-- o su lógica interna debe incluir un filtro `WHERE maestro_id = public.maestro_actual()`.

ALTER VIEW public.node_student_coverage SET (security_invoker = true);
ALTER VIEW public.view_node_difficulty SET (security_invoker = true);
ALTER VIEW public.vw_resumen_alumno SET (security_invoker = true);
ALTER VIEW public.vw_estadisticas_periodo SET (security_invoker = true);
ALTER VIEW public.vw_rendimiento_maestro SET (security_invoker = true);
ALTER VIEW public.vw_destacados_y_riesgo_academico SET (security_invoker = true);
ALTER VIEW public.vw_alertas_activas SET (security_invoker = true);
ALTER VIEW public.vw_riesgo_abandono SET (security_invoker = true);
ALTER VIEW public.vw_patron_asistencia SET (security_invoker = true);

-- Al usar security_invoker = true, las vistas ejecutarán la consulta bajo los privilegios
-- del usuario que las invoca, respetando así las políticas RLS de las tablas subyacentes.

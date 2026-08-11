-- ============================================================================
-- FIX RLS: evaluacion_indicador
-- Fecha: 2026-08-11
-- Motivo:
--   1. Permitir a los usuarios con rol admin (public.es_admin()) realizar
--      operaciones completas (ALL: SELECT, INSERT, UPDATE, DELETE) en evaluacion_indicador.
--   2. Permitir que usuarios autenticados / maestros inserten y actualicen
--      evaluaciones cuando evaluado_por coincida con su auth.uid(), o cuando
--      evaluado_por sea NULL (por ejemplo durante sincronizaciones offline),
--      o cuando el usuario sea admin.
-- ============================================================================

-- 1. Asegurar que RLS sigue habilitado
ALTER TABLE public.evaluacion_indicador ENABLE ROW LEVEL SECURITY;

-- 2. Limpiar políticas previas de inserción/actualización/lectura/borrado de admin y maestros
DROP POLICY IF EXISTS "admin_read_all_ei" ON public.evaluacion_indicador;
DROP POLICY IF EXISTS "admin_all_ei" ON public.evaluacion_indicador;
DROP POLICY IF EXISTS "teacher_insert_ei" ON public.evaluacion_indicador;
DROP POLICY IF EXISTS "teacher_read_own_ei" ON public.evaluacion_indicador;
DROP POLICY IF EXISTS "teacher_update_own_ei" ON public.evaluacion_indicador;
DROP POLICY IF EXISTS "teacher_delete_own_ei" ON public.evaluacion_indicador;

-- 3. Política Admin: Acceso total para usuarios con rol admin
CREATE POLICY "admin_all_ei" ON public.evaluacion_indicador
  FOR ALL TO authenticated
  USING (public.es_admin())
  WITH CHECK (public.es_admin());

-- 4. Políticas para Maestros / Usuarios Autenticados:
-- Inserción: permite si es el autor, si evaluado_por es null, o si es admin
CREATE POLICY "teacher_insert_ei" ON public.evaluacion_indicador
  FOR INSERT TO authenticated
  WITH CHECK (
    evaluado_por = auth.uid()
    OR evaluado_por IS NULL
    OR public.es_admin()
  );

-- Lectura: permite leer si es el autor, si evaluado_por es null, o si es admin
CREATE POLICY "teacher_read_own_ei" ON public.evaluacion_indicador
  FOR SELECT TO authenticated
  USING (
    evaluado_por = auth.uid()
    OR evaluado_por IS NULL
    OR public.es_admin()
  );

-- Actualización: permite actualizar si es el autor, si evaluado_por es null, o si es admin
CREATE POLICY "teacher_update_own_ei" ON public.evaluacion_indicador
  FOR UPDATE TO authenticated
  USING (
    evaluado_por = auth.uid()
    OR evaluado_por IS NULL
    OR public.es_admin()
  )
  WITH CHECK (
    evaluado_por = auth.uid()
    OR evaluado_por IS NULL
    OR public.es_admin()
  );

-- Eliminación: permite eliminar si es el autor o si es admin
CREATE POLICY "teacher_delete_own_ei" ON public.evaluacion_indicador
  FOR DELETE TO authenticated
  USING (
    evaluado_por = auth.uid()
    OR public.es_admin()
  );

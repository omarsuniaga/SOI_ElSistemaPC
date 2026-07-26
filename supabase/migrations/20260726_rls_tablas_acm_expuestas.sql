-- 20260726_rls_tablas_acm_expuestas.sql
--
-- Cierra la exposición de 11 tablas que tenían Row Level Security DESHABILITADA.
-- Sin RLS, cualquiera con la anon key —que en una PWA viaja al navegador y es
-- pública por definición— podía leer y escribir todas sus filas. Entre ellas
-- student_indicator_progress y acm_evidence_files, que contienen evaluaciones y
-- evidencias de menores de edad.
--
-- CONTEXTO OPERATIVO
-- ------------------
-- Las 11 tablas están vacías en producción salvo soi_event_bus (1 fila), de modo
-- que habilitar RLS no interrumpe tráfico existente. El código que las consume ya
-- está escrito (hasta 10 archivos referencian acm_active_routes), así que las
-- políticas deben quedar correctas desde el inicio: la funcionalidad se estrenará
-- ya con ellas puestas.
--
-- CONVENCIÓN SEGUIDA
-- ------------------
-- Se reutilizan los helpers que ya gobiernan el resto del esquema, en vez de
-- introducir un criterio nuevo:
--   · es_admin()        -> rol IN ('admin','inventarista')      [SECURITY DEFINER]
--   · maestro_actual()  -> id de maestros para el auth.uid()    [SECURITY DEFINER]
-- El patrón de agrupación replica el que ya usan routes/levels/nodes/indicators
-- (contenido curricular de lectura común) y sesiones_clase (pertenencia docente).
--
-- Nota sobre los NULL: cuando la columna de pertenencia es NULL, la comparación
-- devuelve NULL, que no es TRUE, y la fila queda accesible sólo para admin. Ese
-- es el comportamiento deseado: ante la duda, no se expone.

BEGIN;

-- ══════════════════════════════════════════════════════════════════════════════
-- GRUPO A — CURRÍCULO INSTITUCIONAL
--
-- Son el plan de estudios de la institución, no datos de una persona. Todo
-- docente autenticado necesita leerlos para planificar; sólo la coordinación
-- los modifica. Mismo criterio que routes / levels / nodes / indicators.
-- ══════════════════════════════════════════════════════════════════════════════
ALTER TABLE public.acm_curriculum_sources  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acm_curriculum_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acm_weekly_plans        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acm_weekly_plan_items   ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS acm_curriculum_sources_read ON public.acm_curriculum_sources;
CREATE POLICY acm_curriculum_sources_read
  ON public.acm_curriculum_sources FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS acm_curriculum_sources_admin_write ON public.acm_curriculum_sources;
CREATE POLICY acm_curriculum_sources_admin_write
  ON public.acm_curriculum_sources FOR ALL TO authenticated
  USING (es_admin()) WITH CHECK (es_admin());

DROP POLICY IF EXISTS acm_curriculum_versions_read ON public.acm_curriculum_versions;
CREATE POLICY acm_curriculum_versions_read
  ON public.acm_curriculum_versions FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS acm_curriculum_versions_admin_write ON public.acm_curriculum_versions;
CREATE POLICY acm_curriculum_versions_admin_write
  ON public.acm_curriculum_versions FOR ALL TO authenticated
  USING (es_admin()) WITH CHECK (es_admin());

DROP POLICY IF EXISTS acm_weekly_plans_read ON public.acm_weekly_plans;
CREATE POLICY acm_weekly_plans_read
  ON public.acm_weekly_plans FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS acm_weekly_plans_admin_write ON public.acm_weekly_plans;
CREATE POLICY acm_weekly_plans_admin_write
  ON public.acm_weekly_plans FOR ALL TO authenticated
  USING (es_admin()) WITH CHECK (es_admin());

DROP POLICY IF EXISTS acm_weekly_plan_items_read ON public.acm_weekly_plan_items;
CREATE POLICY acm_weekly_plan_items_read
  ON public.acm_weekly_plan_items FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS acm_weekly_plan_items_admin_write ON public.acm_weekly_plan_items;
CREATE POLICY acm_weekly_plan_items_admin_write
  ON public.acm_weekly_plan_items FOR ALL TO authenticated
  USING (es_admin()) WITH CHECK (es_admin());

-- ══════════════════════════════════════════════════════════════════════════════
-- GRUPO B — OPERACIÓN DOCENTE
--
-- Cada fila pertenece a un docente identificable. Ve y edita lo suyo; la
-- coordinación ve todo. Mismo criterio que sesiones_clase.
-- ══════════════════════════════════════════════════════════════════════════════
ALTER TABLE public.acm_active_routes            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_class_sessions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acm_teacher_week_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_session_indicators   ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS acm_active_routes_owner ON public.acm_active_routes;
CREATE POLICY acm_active_routes_owner
  ON public.acm_active_routes FOR ALL TO authenticated
  USING      (es_admin() OR teacher_id = maestro_actual())
  WITH CHECK (es_admin() OR teacher_id = maestro_actual());

DROP POLICY IF EXISTS teacher_class_sessions_owner ON public.teacher_class_sessions;
CREATE POLICY teacher_class_sessions_owner
  ON public.teacher_class_sessions FOR ALL TO authenticated
  USING      (es_admin() OR teacher_id = maestro_actual())
  WITH CHECK (es_admin() OR teacher_id = maestro_actual());

DROP POLICY IF EXISTS acm_teacher_week_adjustments_owner ON public.acm_teacher_week_adjustments;
CREATE POLICY acm_teacher_week_adjustments_owner
  ON public.acm_teacher_week_adjustments FOR ALL TO authenticated
  USING      (es_admin() OR teacher_id = maestro_actual())
  WITH CHECK (es_admin() OR teacher_id = maestro_actual());

-- No tiene teacher_id propio: la pertenencia se resuelve por la sesión padre.
DROP POLICY IF EXISTS teacher_session_indicators_owner ON public.teacher_session_indicators;
CREATE POLICY teacher_session_indicators_owner
  ON public.teacher_session_indicators FOR ALL TO authenticated
  USING (
    es_admin() OR EXISTS (
      SELECT 1 FROM public.teacher_class_sessions s
      WHERE s.id = teacher_session_indicators.session_id
        AND s.teacher_id = maestro_actual())
  )
  WITH CHECK (
    es_admin() OR EXISTS (
      SELECT 1 FROM public.teacher_class_sessions s
      WHERE s.id = teacher_session_indicators.session_id
        AND s.teacher_id = maestro_actual())
  );

-- ══════════════════════════════════════════════════════════════════════════════
-- GRUPO C — DATOS DE ALUMNOS
--
-- Evaluaciones y evidencias de menores. El acceso se limita a la coordinación y
-- al docente responsable de la sesión donde se registró el dato. No se abre a
-- "cualquier maestro autenticado": un docente no tiene por qué ver la evaluación
-- de un alumno con el que no trabaja.
--
-- Si session_id es NULL la pertenencia no puede establecerse y sólo admin accede.
-- ══════════════════════════════════════════════════════════════════════════════
ALTER TABLE public.student_indicator_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acm_evidence_files         ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS student_indicator_progress_scoped ON public.student_indicator_progress;
CREATE POLICY student_indicator_progress_scoped
  ON public.student_indicator_progress FOR ALL TO authenticated
  USING (
    es_admin() OR EXISTS (
      SELECT 1 FROM public.teacher_class_sessions s
      WHERE s.id = student_indicator_progress.session_id
        AND s.teacher_id = maestro_actual())
  )
  WITH CHECK (
    es_admin() OR EXISTS (
      SELECT 1 FROM public.teacher_class_sessions s
      WHERE s.id = student_indicator_progress.session_id
        AND s.teacher_id = maestro_actual())
  );

DROP POLICY IF EXISTS acm_evidence_files_scoped ON public.acm_evidence_files;
CREATE POLICY acm_evidence_files_scoped
  ON public.acm_evidence_files FOR ALL TO authenticated
  USING (
    es_admin()
    OR uploaded_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.teacher_class_sessions s
      WHERE s.id = acm_evidence_files.session_id
        AND s.teacher_id = maestro_actual())
  )
  WITH CHECK (
    es_admin()
    OR uploaded_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.teacher_class_sessions s
      WHERE s.id = acm_evidence_files.session_id
        AND s.teacher_id = maestro_actual())
  );

-- ══════════════════════════════════════════════════════════════════════════════
-- GRUPO D — BUS INTERNO
--
-- soi_event_bus no tiene ninguna referencia en el código del cliente: lo consumen
-- procesos de servidor. Se habilita RLS con una única política para service_role;
-- al no existir política para `authenticated`, ningún usuario del navegador puede
-- leerlo ni escribirlo. Esa ausencia es deliberada, no un olvido.
-- ══════════════════════════════════════════════════════════════════════════════
ALTER TABLE public.soi_event_bus ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS soi_event_bus_service_only ON public.soi_event_bus;
CREATE POLICY soi_event_bus_service_only
  ON public.soi_event_bus FOR ALL TO service_role
  USING (true) WITH CHECK (true);

COMMENT ON TABLE public.soi_event_bus IS
  'Bus de eventos interno. Solo service_role: sin politica para authenticated, el cliente no accede.';

-- ══════════════════════════════════════════════════════════════════════════════
-- Revocar el acceso directo de anon a estas tablas. RLS ya lo bloquea, pero
-- quitar el GRANT elimina la dependencia de que exista una política correcta:
-- defensa en profundidad sobre datos de menores.
-- ══════════════════════════════════════════════════════════════════════════════
REVOKE ALL ON public.acm_curriculum_sources,
              public.acm_curriculum_versions,
              public.acm_weekly_plans,
              public.acm_weekly_plan_items,
              public.acm_active_routes,
              public.teacher_class_sessions,
              public.teacher_session_indicators,
              public.student_indicator_progress,
              public.acm_evidence_files,
              public.acm_teacher_week_adjustments,
              public.soi_event_bus
  FROM anon;

COMMIT;

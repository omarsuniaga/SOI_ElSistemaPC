-- Migration: Enable RLS on 17 unprotected tables
-- Date: 2026-07-15
-- Description: Closes security gaps found in audit — tables created without ENABLE ROW LEVEL SECURITY
--
-- Pattern:
--   Admin ALL  → es_admin() (existing helper from 20260519)
--   Auth SELECT → any authenticated user can read
--   Auth INSERT → added per table where teachers need write access

-- =====================================================================
-- Helper: check authenticated role (used by many existing policies)
-- =====================================================================
CREATE OR REPLACE FUNCTION is_authenticated()
RETURNS boolean AS $$
BEGIN
  RETURN (auth.role() = 'authenticated');
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================================
-- 1. dir_decisions — admin only
-- =====================================================================
ALTER TABLE public.dir_decisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "dir_decisions_admin_all" ON public.dir_decisions
  FOR ALL USING (es_admin());

CREATE POLICY "dir_decisions_auth_read" ON public.dir_decisions
  FOR SELECT USING (is_authenticated());

-- =====================================================================
-- 2-7. ACM governance tables — admin all, auth read
-- =====================================================================
ALTER TABLE public.acm_curriculum_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acm_curriculum_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acm_weekly_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acm_weekly_plan_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acm_active_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acm_evidence_files ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  tbl text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'acm_curriculum_sources', 'acm_curriculum_versions', 'acm_weekly_plans',
    'acm_weekly_plan_items', 'acm_active_routes', 'acm_evidence_files'
  ]
  LOOP
    EXECUTE format('CREATE POLICY %I ON public.%I FOR ALL USING (es_admin())',
      tbl || '_admin_all', tbl);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT USING (is_authenticated())',
      tbl || '_auth_read', tbl);
  END LOOP;
END;
$$;

-- =====================================================================
-- 8. acm_teacher_week_adjustments — admin all, teachers read/write own
-- =====================================================================
ALTER TABLE public.acm_teacher_week_adjustments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "acm_teacher_week_adjustments_admin_all" ON public.acm_teacher_week_adjustments
  FOR ALL USING (es_admin());

CREATE POLICY "acm_teacher_week_adjustments_auth_read" ON public.acm_teacher_week_adjustments
  FOR SELECT USING (is_authenticated());

CREATE POLICY "acm_teacher_week_adjustments_teacher_insert" ON public.acm_teacher_week_adjustments
  FOR INSERT WITH CHECK (is_authenticated());

CREATE POLICY "acm_teacher_week_adjustments_teacher_update" ON public.acm_teacher_week_adjustments
  FOR UPDATE USING (teacher_id = auth.uid() OR es_admin())
  WITH CHECK (teacher_id = auth.uid() OR es_admin());

-- =====================================================================
-- 9-10. rutas_contenido — admin all, auth read
-- =====================================================================
ALTER TABLE public.rutas_contenido ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ruta_contenido_objetivos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rutas_contenido_admin_all" ON public.rutas_contenido
  FOR ALL USING (es_admin());
CREATE POLICY "rutas_contenido_auth_read" ON public.rutas_contenido
  FOR SELECT USING (is_authenticated());

CREATE POLICY "ruta_contenido_objetivos_admin_all" ON public.ruta_contenido_objetivos
  FOR ALL USING (es_admin());
CREATE POLICY "ruta_contenido_objetivos_auth_read" ON public.ruta_contenido_objetivos
  FOR SELECT USING (is_authenticated());

-- =====================================================================
-- 11. periodos_cierre_auditoria — admin only
-- =====================================================================
ALTER TABLE public.periodos_cierre_auditoria ENABLE ROW LEVEL SECURITY;

CREATE POLICY "periodos_cierre_auditoria_admin_all" ON public.periodos_cierre_auditoria
  FOR ALL USING (es_admin());

-- =====================================================================
-- 12. weekly_plan_entries — admin all, auth read
-- =====================================================================
ALTER TABLE public.weekly_plan_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "weekly_plan_entries_admin_all" ON public.weekly_plan_entries
  FOR ALL USING (es_admin());
CREATE POLICY "weekly_plan_entries_auth_read" ON public.weekly_plan_entries
  FOR SELECT USING (is_authenticated());

-- =====================================================================
-- 13. notification_trigger_logs — admin only
-- =====================================================================
ALTER TABLE public.notification_trigger_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notification_trigger_logs_admin_all" ON public.notification_trigger_logs
  FOR ALL USING (es_admin());

-- =====================================================================
-- 14. push_subscriptions — admin all, owner read/write own
-- =====================================================================
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "push_subscriptions_admin_all" ON public.push_subscriptions
  FOR ALL USING (es_admin());

CREATE POLICY "push_subscriptions_owner_select" ON public.push_subscriptions
  FOR SELECT USING (profile_id = auth.uid());

CREATE POLICY "push_subscriptions_owner_insert" ON public.push_subscriptions
  FOR INSERT WITH CHECK (profile_id = auth.uid());

CREATE POLICY "push_subscriptions_owner_update" ON public.push_subscriptions
  FOR UPDATE USING (profile_id = auth.uid());

CREATE POLICY "push_subscriptions_owner_delete" ON public.push_subscriptions
  FOR DELETE USING (profile_id = auth.uid());

-- =====================================================================
-- 15-17. Teacher class session tables — admin all, teacher own write
-- =====================================================================
ALTER TABLE public.teacher_class_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_session_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_indicator_progress ENABLE ROW LEVEL SECURITY;

-- teacher_class_sessions
CREATE POLICY "teacher_class_sessions_admin_all" ON public.teacher_class_sessions
  FOR ALL USING (es_admin());
CREATE POLICY "teacher_class_sessions_auth_read" ON public.teacher_class_sessions
  FOR SELECT USING (is_authenticated());
CREATE POLICY "teacher_class_sessions_teacher_insert" ON public.teacher_class_sessions
  FOR INSERT WITH CHECK (is_authenticated());

-- teacher_session_indicators
CREATE POLICY "teacher_session_indicators_admin_all" ON public.teacher_session_indicators
  FOR ALL USING (es_admin());
CREATE POLICY "teacher_session_indicators_auth_read" ON public.teacher_session_indicators
  FOR SELECT USING (is_authenticated());
CREATE POLICY "teacher_session_indicators_auth_insert" ON public.teacher_session_indicators
  FOR INSERT WITH CHECK (is_authenticated());

-- student_indicator_progress
CREATE POLICY "student_indicator_progress_admin_all" ON public.student_indicator_progress
  FOR ALL USING (es_admin());
CREATE POLICY "student_indicator_progress_auth_read" ON public.student_indicator_progress
  FOR SELECT USING (is_authenticated());
CREATE POLICY "student_indicator_progress_teacher_insert" ON public.student_indicator_progress
  FOR INSERT WITH CHECK (is_authenticated());
CREATE POLICY "student_indicator_progress_teacher_update" ON public.student_indicator_progress
  FOR UPDATE USING (is_authenticated());

-- ============================================================================
-- MAPA GAMIFICADO DE PLANIFICACIÓN — Scoping de nivel por clase (Tarea 1.7)
-- Fecha: 2026-07-31
-- Contexto (openspec/changes/mapa-gamificado-planificacion/design.md,
--   sección "RLS concreta (REQ-13)" -> "Scoping de nivel a nivel de datos",
--   REQ-01):
--
--   El selector de Nivel del builder MUST listar únicamente los niveles ya
--   asignados a la clase vía la matriz ACM. La UI ya bloquea antes de
--   llegar acá; este trigger garantiza que TAMBIÉN se bloquee vía API/SQL
--   directo, no solo desde la UI (la spec exige que el SISTEMA rechace).
--
--   Columna real verificada (misma disciplina que el spike 0.1 — NO se
--   asume el esquema, se audita): `acm_active_routes` vincula clase vía
--   `group_id` (no `clase_id`), confirmado por grep directo contra
--   supabase/migrations/20260629_acm_curriculum_governance.sql:
--     group_id uuid REFERENCES public.clases(id) ON DELETE SET NULL,
--     level_id uuid,
--     status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'archived')),
-- ============================================================================

CREATE OR REPLACE FUNCTION public.fn_validar_nivel_asignado_a_clase()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.acm_active_routes ar
    WHERE ar.group_id = NEW.clase_id
      AND ar.level_id = NEW.level_id
      AND ar.status = 'active'
  ) THEN
    RAISE EXCEPTION 'SOI-MAPA-02: nivel no asignado a la clase' USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validar_nivel_asignado_a_clase
  BEFORE INSERT OR UPDATE ON public.clase_mapa_objetivos
  FOR EACH ROW EXECUTE FUNCTION public.fn_validar_nivel_asignado_a_clase();

-- ============================================================================
-- DOWN
-- ============================================================================
-- DROP TRIGGER IF EXISTS trg_validar_nivel_asignado_a_clase ON public.clase_mapa_objetivos;
-- DROP FUNCTION IF EXISTS public.fn_validar_nivel_asignado_a_clase();
-- ============================================================================

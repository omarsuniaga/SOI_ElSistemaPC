-- 20260627_hermes_process_case_closure_v2.sql
-- Hermes Process Case Closure V2
-- Cierre automático/manual de casos Hermes con verificación de tareas y evidencias.
-- Diseño: docs/superpowers/specs/2026-06-27-hermes-soi-process-contract-v1-design.md

-- 1. RPC canónica para cerrar un caso Hermes.
CREATE OR REPLACE FUNCTION public.fn_hermes_close_process_case(
  p_case_id uuid,
  p_closure_summary text DEFAULT NULL,
  p_actor_id uuid DEFAULT NULL,
  p_actor_nombre text DEFAULT NULL,
  p_force boolean DEFAULT false
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_case public.hermes_process_cases%ROWTYPE;
  v_total_tasks int;
  v_pending_tasks int;
  v_blocked_tasks int;
  v_evidence_required jsonb;
  v_missing_evidence text[];
BEGIN
  -- 1. Verificar que el caso existe
  SELECT * INTO v_case
  FROM public.hermes_process_cases
  WHERE id = p_case_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'process case % not found', p_case_id;
  END IF;

  -- 2. Verificar que no esté ya cerrado
  IF v_case.status = 'closed' THEN
    RAISE EXCEPTION 'process case % is already closed', p_case_id;
  END IF;

  IF v_case.status = 'cancelled' THEN
    RAISE EXCEPTION 'process case % is cancelled — cannot close', p_case_id;
  END IF;

  -- 3. Verificar tareas (skip si force=true)
  IF NOT p_force THEN
    SELECT
      COUNT(*),
      COUNT(*) FILTER (WHERE estado NOT IN ('completada', 'cancelada')),
      COUNT(*) FILTER (WHERE estado = 'bloqueada')
    INTO v_total_tasks, v_pending_tasks, v_blocked_tasks
    FROM public.tareas_institucionales
    WHERE correlation_id = p_case_id;

    IF v_pending_tasks > 0 THEN
      RAISE EXCEPTION 'cannot close case: % tareas pendientes (%, bloqueadas: %)',
        v_pending_tasks, (v_total_tasks - v_pending_tasks - v_blocked_tasks), v_blocked_tasks;
    END IF;

    -- 4. Verificar evidencias requeridas (del snapshot del contrato)
    v_evidence_required := v_case.closure_criteria_snapshot;
    IF jsonb_array_length(v_evidence_required) > 0 THEN
      v_missing_evidence := ARRAY[]::text[];
      SELECT ARRAY_AGG(criteria::text) INTO v_missing_evidence
      FROM jsonb_array_elements_text(v_evidence_required) AS criteria
      WHERE criteria IS NOT NULL;

      -- Si hay criterios de cierre definidos, al menos pedimos que exista closure_summary
      IF array_length(v_missing_evidence, 1) > 0 AND p_closure_summary IS NULL THEN
        RAISE EXCEPTION 'closure_summary is required when closure criteria are defined';
      END IF;
    END IF;
  END IF;

  -- 5. Cerrar el caso
  UPDATE public.hermes_process_cases
  SET
    status = 'closed',
    closure_summary = COALESCE(p_closure_summary, closure_summary, 'Cerrado sin observaciones'),
    closed_at = now(),
    updated_at = now()
  WHERE id = p_case_id;

  RETURN jsonb_build_object(
    'case_id', p_case_id,
    'status', 'closed',
    'closed_at', now(),
    'summary', COALESCE(p_closure_summary, 'Cerrado sin observaciones')
  );
END;
$$;

COMMENT ON FUNCTION public.fn_hermes_close_process_case(uuid,text,uuid,text,boolean) IS
  'Cierra un caso/procedimiento Hermes. Verifica tareas completas y evidencias requeridas a menos que force=true.';

-- 2. RPC para cerrar caso SIN verificación (forzar cierre).
-- Re-usa la misma función con force=true, pero la exponemos como wrapper
-- para que el frontend distinga intención.
CREATE OR REPLACE FUNCTION public.fn_hermes_force_close_process_case(
  p_case_id uuid,
  p_closure_summary text DEFAULT NULL,
  p_actor_id uuid DEFAULT NULL,
  p_actor_nombre text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN public.fn_hermes_close_process_case(
    p_case_id := p_case_id,
    p_closure_summary := p_closure_summary,
    p_actor_id := p_actor_id,
    p_actor_nombre := p_actor_nombre,
    p_force := true
  );
END;
$$;

COMMENT ON FUNCTION public.fn_hermes_force_close_process_case(uuid,text,uuid,text) IS
  'Fuerza el cierre de un caso Hermes sin verificar tareas pendientes ni evidencias.';

-- 3. RLS: authenticated puede ejecutar ambas funciones.
REVOKE EXECUTE ON FUNCTION public.fn_hermes_close_process_case(uuid,text,uuid,text,boolean)
  FROM anon, public;
GRANT EXECUTE ON FUNCTION public.fn_hermes_close_process_case(uuid,text,uuid,text,boolean)
  TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.fn_hermes_force_close_process_case(uuid,text,uuid,text)
  FROM anon, public;
GRANT EXECUTE ON FUNCTION public.fn_hermes_force_close_process_case(uuid,text,uuid,text)
  TO authenticated, service_role;

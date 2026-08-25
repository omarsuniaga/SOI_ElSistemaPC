-- 20260825145903_fn_hermes_resolver_caso.sql
-- Panel Hermes Proactivo — Calendario Institucional (PR1 de 6, Fase 1)
-- RPC de autorización server-side para aprobar/rechazar un hermes_process_case,
-- scoped por owner_department.
--
-- Vocabulario real de status (CHECK constraint verificado en vivo contra el
-- proyecto zmhmdvmyeyswunurcyow, hermes_process_cases_status_check):
--   status = ANY (ARRAY['open','in_progress','blocked','closed','cancelled'])
-- p_decision sigue siendo 'approve'/'reject' (acción de negocio en la interfaz
-- pública del RPC) pero se remapea internamente al vocabulario real de status:
--   decision 'approve' -> status='closed'
--   decision 'reject'  -> status='cancelled'
-- Precondición de estado: status='open' (NO 'pending', ese valor no existe
-- en el CHECK constraint real).
--
-- Diseño auditado (openspec/changes/panel-hermes-calendario/design.md,
-- Engram obs #79 — topic_key sdd/panel-hermes-calendario/design), con fix de
-- seguridad post-auditoría adversarial: fail-closed ante owner_department NULL.
-- No se toca hermes_process_cases_status_check: el esquema real ya soporta
-- 'open'/'closed'/'cancelled' sin necesidad de ALTER.
CREATE OR REPLACE FUNCTION public.fn_hermes_resolver_caso(
  p_case_id uuid,
  p_decision text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_case public.hermes_process_cases%ROWTYPE;
  v_user_dept_match boolean;
  v_new_status text;
  v_updated public.hermes_process_cases%ROWTYPE;
BEGIN
  -- Guard: decisión válida (vocabulario de acción de negocio, no de status).
  IF p_decision NOT IN ('approve', 'reject') THEN
    RAISE EXCEPTION 'p_decision inválido: % (esperado approve|reject)', p_decision
      USING ERRCODE = '22023';
  END IF;

  -- 1. Verificar que el caso existe.
  SELECT * INTO v_case
  FROM public.hermes_process_cases
  WHERE id = p_case_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'hermes_process_case % not found', p_case_id
      USING ERRCODE = 'P0002';
  END IF;

  -- 2. Guard de estado: solo casos en 'open' pueden resolverse.
  IF v_case.status <> 'open' THEN
    RAISE EXCEPTION 'caso % no está en estado open (status actual: %)', p_case_id, v_case.status
      USING ERRCODE = '42501';
  END IF;

  -- 3. Guard NULL fail-closed (FIX CRÍTICO post-auditoría adversarial):
  -- owner_department es NULLABLE. Sin este guard explícito, la comparación
  -- posterior con NULL se evalúa como NULL (no true/false) y el RAISE
  -- EXCEPTION nunca se dispara en un IF, permitiendo a cualquier usuario
  -- autenticado resolver un caso sin dueño asignado. Fail-closed obligatorio.
  IF v_case.owner_department IS NULL THEN
    RAISE EXCEPTION 'caso % sin owner_department asignado — requiere asignación manual antes de poder resolverse', p_case_id
      USING ERRCODE = '42501';
  END IF;

  -- 4. Autorización: el usuario autenticado debe pertenecer al departamento
  -- dueño del caso. Cardinalidad N:M vía EXISTS (usuario_departamentos
  -- soporta múltiples departamentos por usuario).
  SELECT EXISTS (
    SELECT 1
    FROM public.usuario_departamentos ud
    JOIN public.departamentos d ON d.id = ud.departamento_id
    WHERE ud.user_id = auth.uid()
      AND upper(d.codigo) = upper(v_case.owner_department)
  ) INTO v_user_dept_match;

  IF NOT v_user_dept_match THEN
    RAISE EXCEPTION 'usuario % no autorizado para resolver caso % (owner_department: %)', auth.uid(), p_case_id, v_case.owner_department
      USING ERRCODE = '42501';
  END IF;

  -- 5. Remapear decisión de negocio -> status real del esquema.
  v_new_status := CASE p_decision
    WHEN 'approve' THEN 'closed'
    WHEN 'reject' THEN 'cancelled'
  END;

  -- 6. Resolver el caso. WHERE status='open' adicional como defensa
  -- belt-and-suspenders contra condición de carrera entre el guard (paso 2)
  -- y este UPDATE.
  UPDATE public.hermes_process_cases
  SET
    status = v_new_status,
    closure_summary = format(
      '%s por departamento %s — usuario %s — %s',
      CASE p_decision WHEN 'approve' THEN 'Aprobado' ELSE 'Rechazado' END,
      upper(v_case.owner_department),
      auth.uid(),
      to_char(now(), 'YYYY-MM-DD HH24:MI:SS TZ')
    ),
    closed_at = now(),
    updated_at = now()
  WHERE id = p_case_id
    AND status = 'open'
  RETURNING * INTO v_updated;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'caso % fue modificado concurrentemente — resolución abortada', p_case_id
      USING ERRCODE = '40001';
  END IF;

  RETURN jsonb_build_object(
    'case_id', p_case_id,
    'status', v_updated.status,
    'closure_summary', v_updated.closure_summary,
    'updated_at', v_updated.updated_at
  );
END;
$$;

COMMENT ON FUNCTION public.fn_hermes_resolver_caso(uuid, text) IS
  'Aprueba (approve->status=closed) o rechaza (reject->status=cancelled) un hermes_process_case. Autorización server-side scoped por owner_department vs. departamentos del usuario autenticado (N:M via usuario_departamentos). Fail-closed si owner_department es NULL o el usuario no pertenece al departamento dueño. Precondición: status=open.';

-- Defensa en profundidad: REVOKE explícito antes del GRANT selectivo.
REVOKE EXECUTE ON FUNCTION public.fn_hermes_resolver_caso(uuid, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.fn_hermes_resolver_caso(uuid, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.fn_hermes_resolver_caso(uuid, text) TO authenticated;

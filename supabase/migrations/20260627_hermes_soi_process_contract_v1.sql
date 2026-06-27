-- 20260627_hermes_soi_process_contract_v1.sql
-- Hermes SOI Process Contract V1
-- Amarra el canon documental del SOI con casos/procedimientos Hermes, tareas,
-- evidencia, cierre y futuras automatizaciones.
-- Diseño: docs/superpowers/specs/2026-06-27-hermes-soi-process-contract-v1-design.md

-- 1. Contratos digitales de procesos SOI.
CREATE TABLE IF NOT EXISTS public.soi_process_contracts (
  process_code text PRIMARY KEY,
  process_name text NOT NULL,
  department_owner text NOT NULL,
  canonical_doc_path text NOT NULL,
  doc_id text,
  trigger_type text NOT NULL DEFAULT 'manual' CHECK (
    trigger_type IN ('manual', 'event', 'scheduled', 'data_driven', 'conversation')
  ),
  required_evidence jsonb NOT NULL DEFAULT '[]'::jsonb,
  closure_criteria jsonb NOT NULL DEFAULT '[]'::jsonb,
  responsible_departments text[] NOT NULL DEFAULT ARRAY[]::text[],
  task_templates jsonb NOT NULL DEFAULT '[]'::jsonb,
  automation_status text NOT NULL DEFAULT 'manual' CHECK (
    automation_status IN ('manual', 'semi_auto', 'automated', 'deprecated')
  ),
  recurrence_count integer NOT NULL DEFAULT 0 CHECK (recurrence_count >= 0),
  active boolean NOT NULL DEFAULT true,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.soi_process_contracts IS
  'Contrato digital ejecutable de un proceso SOI documentado. No reemplaza la ficha canonica; la vuelve operable por Hermes.';
COMMENT ON COLUMN public.soi_process_contracts.process_code IS 'Codigo canonico del proceso SOI, por ejemplo FIN-P13, ACM-P02 u OPR-P10.';
COMMENT ON COLUMN public.soi_process_contracts.canonical_doc_path IS 'Ruta al documento canonico del proceso en la documentacion SOI.';
COMMENT ON COLUMN public.soi_process_contracts.task_templates IS 'Plantillas JSONB de tareas departamentales que Hermes puede instanciar al abrir un caso.';

CREATE INDEX IF NOT EXISTS idx_soi_process_contracts_owner
  ON public.soi_process_contracts (department_owner);
CREATE INDEX IF NOT EXISTS idx_soi_process_contracts_active
  ON public.soi_process_contracts (active)
  WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_soi_process_contracts_automation
  ON public.soi_process_contracts (automation_status);

-- 2. Casos/procedimientos Hermes amarrados a procesos SOI.
-- Regla de compatibilidad SP-0: hermes_process_cases.id == tareas_institucionales.correlation_id.
CREATE TABLE IF NOT EXISTS public.hermes_process_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  process_code text REFERENCES public.soi_process_contracts(process_code) ON UPDATE CASCADE,
  title text NOT NULL,
  description text,
  source text NOT NULL DEFAULT 'manual' CHECK (
    source IN ('manual', 'event', 'scheduled', 'data_driven', 'conversation')
  ),
  status text NOT NULL DEFAULT 'open' CHECK (
    status IN ('open', 'in_progress', 'blocked', 'closed', 'cancelled')
  ),
  priority text NOT NULL DEFAULT 'media' CHECK (
    priority IN ('baja', 'media', 'alta', 'critica')
  ),
  requested_by uuid,
  requested_by_name text,
  owner_department text,
  entity_type text CHECK (
    entity_type IS NULL OR entity_type IN ('alumno','maestro','postulante','representante','instrumento','evento','otro')
  ),
  entity_id uuid,
  entity_label text,
  required_evidence_snapshot jsonb NOT NULL DEFAULT '[]'::jsonb,
  closure_criteria_snapshot jsonb NOT NULL DEFAULT '[]'::jsonb,
  closure_summary text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  opened_at timestamptz NOT NULL DEFAULT now(),
  closed_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.hermes_process_cases IS
  'Ejecucion concreta de un proceso SOI. Su id se usa como correlation_id para agrupar tareas institucionales.';
COMMENT ON COLUMN public.hermes_process_cases.required_evidence_snapshot IS
  'Copia de required_evidence al momento de abrir el caso para preservar auditoria aunque el contrato evolucione.';
COMMENT ON COLUMN public.hermes_process_cases.closure_criteria_snapshot IS
  'Copia de closure_criteria al momento de abrir el caso para preservar auditoria aunque el contrato evolucione.';

CREATE INDEX IF NOT EXISTS idx_hermes_process_cases_process
  ON public.hermes_process_cases (process_code);
CREATE INDEX IF NOT EXISTS idx_hermes_process_cases_status
  ON public.hermes_process_cases (status);
CREATE INDEX IF NOT EXISTS idx_hermes_process_cases_entity
  ON public.hermes_process_cases (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_hermes_process_cases_owner
  ON public.hermes_process_cases (owner_department);

-- 3. Vinculo ligero desde tareas al contrato documental.
ALTER TABLE public.tareas_institucionales
  ADD COLUMN IF NOT EXISTS process_code text REFERENCES public.soi_process_contracts(process_code) ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS idx_tareas_process_code
  ON public.tareas_institucionales (process_code);

COMMENT ON COLUMN public.tareas_institucionales.process_code IS
  'Proceso SOI que esta tarea ejecuta. correlation_id agrupa el caso/procedimiento.';

-- 4. RPC canonica para abrir un caso desde un contrato SOI.
CREATE OR REPLACE FUNCTION public.fn_hermes_start_process_case(
  p_process_code text,
  p_title text DEFAULT NULL,
  p_description text DEFAULT NULL,
  p_source text DEFAULT 'manual',
  p_priority text DEFAULT 'media',
  p_requested_by uuid DEFAULT NULL,
  p_requested_by_name text DEFAULT NULL,
  p_entity_type text DEFAULT NULL,
  p_entity_id uuid DEFAULT NULL,
  p_entity_label text DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_contract public.soi_process_contracts%ROWTYPE;
  v_case_id uuid := gen_random_uuid();
  v_task jsonb;
  v_department text;
  v_priority text;
BEGIN
  SELECT * INTO v_contract
  FROM public.soi_process_contracts
  WHERE process_code = p_process_code
    AND active = true;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'process contract % does not exist or is inactive', p_process_code;
  END IF;

  IF p_source NOT IN ('manual', 'event', 'scheduled', 'data_driven', 'conversation') THEN
    RAISE EXCEPTION 'invalid process case source: %', p_source;
  END IF;

  IF p_priority NOT IN ('baja', 'media', 'alta', 'critica') THEN
    RAISE EXCEPTION 'invalid process case priority: %', p_priority;
  END IF;

  IF p_entity_type IS NOT NULL AND p_entity_type NOT IN ('alumno','maestro','postulante','representante','instrumento','evento','otro') THEN
    RAISE EXCEPTION 'invalid process case entity_type: %', p_entity_type;
  END IF;

  INSERT INTO public.hermes_process_cases (
    id,
    process_code,
    title,
    description,
    source,
    status,
    priority,
    requested_by,
    requested_by_name,
    owner_department,
    entity_type,
    entity_id,
    entity_label,
    required_evidence_snapshot,
    closure_criteria_snapshot,
    metadata
  ) VALUES (
    v_case_id,
    v_contract.process_code,
    coalesce(p_title, v_contract.process_name),
    p_description,
    p_source,
    'open',
    p_priority,
    p_requested_by,
    p_requested_by_name,
    v_contract.department_owner,
    p_entity_type,
    p_entity_id,
    p_entity_label,
    v_contract.required_evidence,
    v_contract.closure_criteria,
    coalesce(p_metadata, '{}'::jsonb)
  );

  -- Instancia tareas iniciales si el contrato declara task_templates.
  FOR v_task IN SELECT * FROM jsonb_array_elements(v_contract.task_templates)
  LOOP
    v_department := v_task->>'department';
    v_priority := coalesce(v_task->>'priority', p_priority, 'media');

    IF v_department IS NULL OR length(trim(v_department)) = 0 THEN
      RAISE EXCEPTION 'task template for process % is missing department', p_process_code;
    END IF;

    INSERT INTO public.tareas_institucionales (
      titulo,
      descripcion,
      departamento,
      estado,
      prioridad,
      fecha_vencimiento,
      checklist,
      process_code,
      correlation_id,
      entidad_tipo,
      entidad_id,
      entidad_label,
      updated_by,
      updated_by_nombre
    ) VALUES (
      coalesce(v_task->>'title', v_task->>'titulo', v_contract.process_name),
      coalesce(v_task->>'description', v_task->>'descripcion', p_description),
      v_department::public.soi_departamento,
      'pendiente',
      v_priority::public.tarea_institucional_prioridad,
      CASE
        WHEN v_task ? 'due_in_days'
          THEN (now()::date + ((v_task->>'due_in_days')::integer || ' days')::interval)::date
        WHEN v_task ? 'diferencia_dias'
          THEN (now()::date + ((v_task->>'diferencia_dias')::integer || ' days')::interval)::date
        ELSE NULL
      END,
      coalesce(v_task->'checklist', '[]'::jsonb),
      v_contract.process_code,
      v_case_id,
      p_entity_type,
      p_entity_id,
      p_entity_label,
      p_requested_by,
      p_requested_by_name
    );
  END LOOP;

  UPDATE public.soi_process_contracts
  SET recurrence_count = recurrence_count + 1,
      updated_at = now()
  WHERE process_code = v_contract.process_code;

  RETURN v_case_id;
END;
$$;

COMMENT ON FUNCTION public.fn_hermes_start_process_case(text,text,text,text,text,uuid,text,text,uuid,text,jsonb) IS
  'Abre un caso/procedimiento Hermes desde un contrato SOI y genera tareas departamentales con correlation_id compartido.';

-- 5. RLS basico: authenticated opera, anon denegado.
ALTER TABLE public.soi_process_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hermes_process_cases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS soi_process_contracts_auth_read ON public.soi_process_contracts;
CREATE POLICY soi_process_contracts_auth_read
  ON public.soi_process_contracts FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS soi_process_contracts_auth_write ON public.soi_process_contracts;
CREATE POLICY soi_process_contracts_auth_write
  ON public.soi_process_contracts FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS hermes_process_cases_auth_all ON public.hermes_process_cases;
CREATE POLICY hermes_process_cases_auth_all
  ON public.hermes_process_cases FOR ALL TO authenticated USING (true) WITH CHECK (true);

REVOKE ALL ON public.soi_process_contracts FROM anon;
REVOKE ALL ON public.hermes_process_cases FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.soi_process_contracts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hermes_process_cases TO authenticated;

REVOKE EXECUTE ON FUNCTION public.fn_hermes_start_process_case(text,text,text,text,text,uuid,text,text,uuid,text,jsonb)
  FROM anon, public;
GRANT EXECUTE ON FUNCTION public.fn_hermes_start_process_case(text,text,text,text,text,uuid,text,text,uuid,text,jsonb)
  TO authenticated, service_role;

-- 6. Seeds iniciales no destructivos para procesos criticos.
INSERT INTO public.soi_process_contracts (
  process_code,
  process_name,
  department_owner,
  canonical_doc_path,
  doc_id,
  trigger_type,
  required_evidence,
  closure_criteria,
  responsible_departments,
  task_templates,
  automation_status,
  metadata
) VALUES
(
  'ACM-P02',
  'Asistencia y contenido de clase',
  'ACM',
  '01_DEPARTAMENTOS/02_ACM_ACADEMICO_MUSICAL/ACM-P02_Asistencia_y_Contenido_V8.md',
  'ACM-P02',
  'manual',
  '[{"type":"attendance_record","label":"Registro de asistencia"},{"type":"class_content","label":"Contenido trabajado"}]'::jsonb,
  '["Asistencia registrada", "Contenido pedagogico documentado", "Observaciones criticas escaladas si aplica"]'::jsonb,
  ARRAY['ACM','ADM'],
  '[{"department":"ACM","title":"ACM: Registrar asistencia y contenido","priority":"alta","due_in_days":1,"checklist":[{"item":"Registrar asistencia","completado":false},{"item":"Registrar contenido trabajado","completado":false},{"item":"Escalar observaciones criticas","completado":false}]}]'::jsonb,
  'semi_auto',
  '{"source":"seed_v1"}'::jsonb
),
(
  'FIN-P13',
  'Gestion de mora y cobranza',
  'FIN',
  '01_DEPARTAMENTOS/05_ADM_FIN_ADMINISTRATIVO_FINANCIERO/FIN-P13_Gestion_Mora_y_Cobranza_V8.md',
  'FIN-P13',
  'data_driven',
  '[{"type":"account_status","label":"Estado de cuenta"},{"type":"contact_log","label":"Registro de contacto al representante"}]'::jsonb,
  '["Estado de deuda verificado", "Representante contactado", "Acuerdo o decision documentada"]'::jsonb,
  ARRAY['FIN','COM','DIR'],
  '[{"department":"FIN","title":"FIN: Verificar estado de mora","priority":"alta","due_in_days":1,"checklist":[{"item":"Revisar estado de cuenta","completado":false},{"item":"Confirmar monto vencido","completado":false}]},{"department":"COM","title":"COM: Contactar representante por mora","priority":"media","due_in_days":2,"checklist":[{"item":"Enviar comunicacion aprobada","completado":false},{"item":"Registrar respuesta","completado":false}]}]'::jsonb,
  'semi_auto',
  '{"source":"seed_v1"}'::jsonb
),
(
  'OPR-P10',
  'Taller de luteria y mantenimiento',
  'OPR',
  '01_DEPARTAMENTOS/06_OPR_OPERACIONES/OPR-P10_Taller_Lutheria_Mantenimiento_V9.md',
  'OPR-P10',
  'manual',
  '[{"type":"diagnostic","label":"Diagnostico tecnico"},{"type":"photo","label":"Evidencia fotografica"},{"type":"closure_note","label":"Nota de cierre"}]'::jsonb,
  '["Instrumento diagnosticado", "Evidencia adjunta", "Decision de reparacion o cierre documentada"]'::jsonb,
  ARRAY['LUT','FIN','ACM','COM'],
  '[{"department":"LUT","title":"LUT: Diagnosticar instrumento en taller","priority":"alta","due_in_days":2,"checklist":[{"item":"Registrar diagnostico","completado":false},{"item":"Adjuntar evidencia fotografica","completado":false},{"item":"Definir accion correctiva","completado":false}]},{"department":"FIN","title":"FIN: Evaluar costo de reparacion","priority":"media","due_in_days":3,"checklist":[{"item":"Revisar presupuesto","completado":false},{"item":"Confirmar aprobacion si aplica","completado":false}]}]'::jsonb,
  'manual',
  '{"source":"seed_v1","note":"Luteria se documenta como OPR-P10 y ejecuta tareas en el departamento digital LUT."}'::jsonb
)
ON CONFLICT (process_code) DO UPDATE SET
  process_name = EXCLUDED.process_name,
  department_owner = EXCLUDED.department_owner,
  canonical_doc_path = EXCLUDED.canonical_doc_path,
  doc_id = EXCLUDED.doc_id,
  trigger_type = EXCLUDED.trigger_type,
  required_evidence = EXCLUDED.required_evidence,
  closure_criteria = EXCLUDED.closure_criteria,
  responsible_departments = EXCLUDED.responsible_departments,
  task_templates = EXCLUDED.task_templates,
  automation_status = EXCLUDED.automation_status,
  metadata = public.soi_process_contracts.metadata || EXCLUDED.metadata,
  updated_at = now();


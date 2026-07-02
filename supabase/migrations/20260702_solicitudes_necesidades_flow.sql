-- 20260702_solicitudes_necesidades_flow.sql
-- Flujo maestro -> ACM -> FIN para solicitudes de necesidades.
-- Extiende la tabla existente, reemplaza RLS permisivas y conecta Hermes.

BEGIN;

-- 1) Extensión de esquema: campos para ruteo, presupuesto y aprobaciones.
ALTER TABLE public.solicitudes_necesidades
  ADD COLUMN IF NOT EXISTS correlation_id uuid,
  ADD COLUMN IF NOT EXISTS link_tienda text,
  ADD COLUMN IF NOT EXISTS costo_estimado numeric(10,2),
  ADD COLUMN IF NOT EXISTS presupuesto numeric(10,2),
  ADD COLUMN IF NOT EXISTS departamento_actual text,
  ADD COLUMN IF NOT EXISTS pre_aprobada_por uuid,
  ADD COLUMN IF NOT EXISTS presupuestado_por uuid;

COMMENT ON COLUMN public.solicitudes_necesidades.correlation_id IS
  'Caso Hermes asociado a la solicitud. Se usa para ruteo ACM -> FIN y auditoria.';
COMMENT ON COLUMN public.solicitudes_necesidades.link_tienda IS
  'URL de referencia de tienda para solicitudes de tipo accesorio.';
COMMENT ON COLUMN public.solicitudes_necesidades.costo_estimado IS
  'Costo estimado inicial declarado o inferido en etapa ACM.';
COMMENT ON COLUMN public.solicitudes_necesidades.presupuesto IS
  'Presupuesto aprobado o propuesto en etapa FIN.';
COMMENT ON COLUMN public.solicitudes_necesidades.departamento_actual IS
  'Departamento Hermes que tiene la solicitud en curso (ACM o FIN).';
COMMENT ON COLUMN public.solicitudes_necesidades.pre_aprobada_por IS
  'Usuario de profiles.id que pre-aprobo la solicitud en ACM.';
COMMENT ON COLUMN public.solicitudes_necesidades.presupuestado_por IS
  'Usuario de profiles.id que cargo el presupuesto en FIN.';

-- 2) Estados ampliados para el flujo hibrido.
ALTER TABLE public.solicitudes_necesidades
  DROP CONSTRAINT IF EXISTS solicitudes_necesidades_estado_check;

ALTER TABLE public.solicitudes_necesidades
  ADD CONSTRAINT solicitudes_necesidades_estado_check
  CHECK (
    estado IN (
      'pendiente',
      'pre_aprobada_acm',
      'rechazada_acm',
      'en_presupuesto',
      'presupuestada',
      'aprobada',
      'rechazada',
      'comprada',
      'entregada',
      'cancelada'
    )
  );

-- 3) Seed del contrato Hermes para necesidades.
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
) VALUES (
  'ACM-NEC',
  'Flujo de necesidades de maestros',
  'ACM',
  'docs/specs/necesidades-flow-implementation-brief.md',
  'NECESIDADES-FLOW',
  'event',
  '[{"type":"request_created","label":"Solicitud creada"},{"type":"acm_review","label":"Revision ACM"},{"type":"fin_budget","label":"Presupuesto FIN"}]'::jsonb,
  '["Solicitud creada", "Pre-aprobacion o rechazo ACM registrado", "Presupuesto FIN registrado cuando aplique", "Estado final documentado"]'::jsonb,
  ARRAY['ACM','FIN','ADM'],
  '[
    {
      "department": "ACM",
      "title": "ACM: Revisar solicitud de necesidad",
      "priority": "alta",
      "due_in_days": 1,
      "checklist": [
        {"item":"Verificar solicitud y soporte", "completado": false},
        {"item":"Pre-aprobar o rechazar", "completado": false},
        {"item":"Escalar a FIN si corresponde", "completado": false}
      ]
    },
    {
      "department": "FIN",
      "title": "FIN: Cargar presupuesto de necesidad",
      "priority": "alta",
      "due_in_days": 2,
      "checklist": [
        {"item":"Revisar solicitud pre-aprobada", "completado": false},
        {"item":"Cargar presupuesto o costo estimado", "completado": false},
        {"item":"Registrar decision financiera", "completado": false}
      ]
    }
  ]'::jsonb,
  'semi_auto',
  '{"source":"necesidades_flow_seed_v1"}'::jsonb
) ON CONFLICT (process_code) DO UPDATE SET
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

-- 4) Trigger: al insertar la solicitud, abrir caso Hermes y guardar correlation_id.
CREATE OR REPLACE FUNCTION public.fn_solicitudes_necesidades_open_process_case()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_case_id uuid;
BEGIN
  IF NEW.correlation_id IS NOT NULL THEN
    RETURN NEW;
  END IF;

  v_case_id := public.fn_hermes_start_process_case(
    'ACM-NEC',
    coalesce(NEW.titulo, 'Solicitud de necesidad'),
    coalesce(NEW.descripcion, NEW.tipo_necesidad, 'Solicitud de necesidad'),
    'event',
    CASE
      WHEN NEW.prioridad = 'urgente' THEN 'critica'
      WHEN NEW.prioridad = 'alta' THEN 'alta'
      ELSE 'media'
    END,
    NEW.maestro_id,
    NEW.maestro_nombre,
    'maestro',
    NEW.maestro_id,
    NEW.titulo,
    jsonb_build_object(
      'solicitud_id', NEW.id,
      'tipo_necesidad', NEW.tipo_necesidad,
      'categoria', NEW.categoria,
      'prioridad', NEW.prioridad,
      'cantidad', NEW.cantidad,
      'area', NEW.area,
      'estado', NEW.estado
    )
  );

  UPDATE public.solicitudes_necesidades
  SET correlation_id = v_case_id,
      departamento_actual = 'ACM',
      updated_at = now()
  WHERE id = NEW.id;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.fn_solicitudes_necesidades_open_process_case() IS
  'Abre el caso Hermes ACM-NEC para cada solicitud de necesidades e inyecta el correlation_id.';

DROP TRIGGER IF EXISTS trg_solicitudes_necesidades_open_case ON public.solicitudes_necesidades;
CREATE TRIGGER trg_solicitudes_necesidades_open_case
AFTER INSERT ON public.solicitudes_necesidades
FOR EACH ROW
EXECUTE FUNCTION public.fn_solicitudes_necesidades_open_process_case();

-- 5) RLS por rol y etapa.
DROP POLICY IF EXISTS "solic_select_own_or_admin" ON public.solicitudes_necesidades;
DROP POLICY IF EXISTS "solic_insert_own" ON public.solicitudes_necesidades;
DROP POLICY IF EXISTS "solic_update_admin" ON public.solicitudes_necesidades;
DROP POLICY IF EXISTS "solic_update_own_cancel" ON public.solicitudes_necesidades;

CREATE POLICY "solic_select_owner_acm_fin_admin" ON public.solicitudes_necesidades
  FOR SELECT TO authenticated
  USING (
    maestro_id IN (SELECT id FROM public.maestros WHERE user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND rol = 'admin')
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND rol = 'cajero')
  );

CREATE POLICY "solic_insert_own" ON public.solicitudes_necesidades
  FOR INSERT TO authenticated
  WITH CHECK (
    maestro_id IN (SELECT id FROM public.maestros WHERE user_id = auth.uid())
  );

CREATE POLICY "solic_update_owner_cancel" ON public.solicitudes_necesidades
  FOR UPDATE TO authenticated
  USING (
    estado = 'pendiente'
    AND maestro_id IN (SELECT id FROM public.maestros WHERE user_id = auth.uid())
  )
  WITH CHECK (
    estado = 'cancelada'
    AND maestro_id IN (SELECT id FROM public.maestros WHERE user_id = auth.uid())
  );

CREATE POLICY "solic_update_acm_admin_stage" ON public.solicitudes_necesidades
  FOR UPDATE TO authenticated
  USING (
    estado = 'pendiente'
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND rol = 'admin')
  )
  WITH CHECK (
    estado IN ('pre_aprobada_acm', 'rechazada_acm', 'en_presupuesto')
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND rol = 'admin')
  );

CREATE POLICY "solic_update_fin_admin_cajero_stage" ON public.solicitudes_necesidades
  FOR UPDATE TO authenticated
  USING (
    estado IN ('en_presupuesto', 'presupuestada')
    AND EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE id = auth.uid()
        AND rol IN ('admin', 'cajero')
    )
  )
  WITH CHECK (
    estado IN ('presupuestada', 'aprobada', 'rechazada', 'comprada', 'entregada')
    AND EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE id = auth.uid()
        AND rol IN ('admin', 'cajero')
    )
  );

CREATE POLICY "solic_update_admin_override" ON public.solicitudes_necesidades
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND rol = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND rol = 'admin')
  );

COMMIT;

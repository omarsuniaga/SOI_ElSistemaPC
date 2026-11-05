-- No new tables. activo controls eligibility; historical attendance is immutable
-- when an alumno becomes inactive. No enrollment or financial data is deleted.
BEGIN;

CREATE OR REPLACE FUNCTION public.fn_guard_active_attendance()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
DECLARE
  v_active boolean;
  v_existing public.asistencias%ROWTYPE;
BEGIN
  SELECT activo INTO v_active FROM public.alumnos WHERE id = NEW.alumno_id;
  IF v_active IS TRUE THEN RETURN NEW; END IF;

  -- UPSERT invokes BEFORE INSERT even for existing historical rows. Permit
  -- only an unchanged historical mark, never a new/changed mark or identity.
  IF TG_OP = 'UPDATE' THEN
    v_existing := OLD;
  ELSE
    SELECT * INTO v_existing FROM public.asistencias
      WHERE alumno_id = NEW.alumno_id AND clase_id = NEW.clase_id AND fecha = NEW.fecha;
  END IF;
  IF v_existing.id IS NOT NULL
     AND v_existing.alumno_id IS NOT DISTINCT FROM NEW.alumno_id
     AND v_existing.clase_id IS NOT DISTINCT FROM NEW.clase_id
     AND v_existing.fecha IS NOT DISTINCT FROM NEW.fecha
     AND v_existing.estado IS NOT DISTINCT FROM NEW.estado THEN
    RETURN NEW;
  END IF;
  RAISE EXCEPTION USING ERRCODE = '23514',
    MESSAGE = 'El alumno está inactivo. Actualice la lista de asistencia antes de guardar.';
END;
$$;
DROP TRIGGER IF EXISTS trg_guard_active_attendance ON public.asistencias;
CREATE TRIGGER trg_guard_active_attendance BEFORE INSERT OR UPDATE ON public.asistencias
FOR EACH ROW EXECUTE FUNCTION public.fn_guard_active_attendance();

CREATE OR REPLACE FUNCTION public.fn_guard_active_session_attendance()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
DECLARE
  v_item jsonb;
  v_old jsonb := '[]'::jsonb;
  v_new jsonb;
BEGIN
  IF TG_OP = 'UPDATE' THEN v_old := COALESCE(OLD.asistencia, '[]'::jsonb); END IF;
  v_new := COALESCE(NEW.asistencia, '[]'::jsonb);
  IF jsonb_typeof(v_new) <> 'array' THEN
    RAISE EXCEPTION USING ERRCODE = '23514', MESSAGE = 'La asistencia debe ser una lista.';
  END IF;
  FOR v_item IN SELECT value FROM jsonb_array_elements(v_new) LOOP
    IF NOT EXISTS (SELECT 1 FROM public.alumnos WHERE id = (v_item->>'alumno_id')::uuid AND activo IS TRUE) THEN
      IF TG_OP = 'INSERT' OR NOT EXISTS (
        SELECT 1 FROM jsonb_array_elements(v_old) previous
        WHERE previous = v_item AND NEW.fecha IS NOT DISTINCT FROM OLD.fecha
      ) THEN
        RAISE EXCEPTION USING ERRCODE = '23514',
          MESSAGE = 'El alumno está inactivo. Actualice la lista de asistencia antes de guardar.';
      END IF;
    END IF;
  END LOOP;
  -- The editor hides inactive alumnos. Do not interpret their absence in the
  -- submitted array as deletion of their earlier attendance evidence.
  FOR v_item IN SELECT value FROM jsonb_array_elements(v_old) LOOP
    IF NOT EXISTS (SELECT 1 FROM public.alumnos WHERE id = (v_item->>'alumno_id')::uuid AND activo IS TRUE)
       AND NOT EXISTS (SELECT 1 FROM jsonb_array_elements(v_new) item WHERE item->>'alumno_id' = v_item->>'alumno_id') THEN
      IF NEW.fecha IS DISTINCT FROM OLD.fecha THEN
        RAISE EXCEPTION USING ERRCODE = '23514', MESSAGE = 'No se puede mover la asistencia histórica de un alumno inactivo.';
      END IF;
      v_new := v_new || jsonb_build_array(v_item);
    END IF;
  END LOOP;
  NEW.asistencia := v_new;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_guard_active_session_attendance ON public.sesiones_clase;
CREATE TRIGGER trg_guard_active_session_attendance BEFORE INSERT OR UPDATE OF asistencia, fecha
ON public.sesiones_clase FOR EACH ROW EXECUTE FUNCTION public.fn_guard_active_session_attendance();

CREATE OR REPLACE FUNCTION public.fn_sync_alumno_activity_state()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
BEGIN
  IF NEW.activo IS FALSE AND NEW.estado_academico = 'activo' THEN
    NEW.estado_academico := 'retirado';
  ELSIF NEW.activo IS TRUE AND NEW.estado_academico = 'retirado' THEN
    NEW.estado_academico := 'activo';
  ELSIF NEW.activo IS TRUE AND NEW.estado_academico = 'retirado_con_deuda' THEN
    RAISE EXCEPTION 'La reactivación requiere resolver el retiro con deuda mediante el procedimiento administrativo.';
  END IF;
  IF TG_OP = 'UPDATE' AND OLD.activo IS DISTINCT FROM NEW.activo THEN
    IF NEW.activo IS FALSE THEN
      NEW.fecha_baja := COALESCE(NEW.fecha_baja, (now() AT TIME ZONE 'America/Santo_Domingo')::date);
    ELSE
      NEW.fecha_baja := NULL;
      NEW.motivo_baja := NULL;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_sync_alumno_activity_state ON public.alumnos;
CREATE TRIGGER trg_sync_alumno_activity_state BEFORE INSERT OR UPDATE OF activo, estado_academico
ON public.alumnos FOR EACH ROW EXECUTE FUNCTION public.fn_sync_alumno_activity_state();

-- Preserve the existing audit trigger and its privilege boundary. A plain
-- deactivation is not evidence of a voluntary departure: record neutral state.
CREATE OR REPLACE FUNCTION public.fn_trigger_historial_estado_alumno()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF OLD.activo IS DISTINCT FROM NEW.activo THEN
    INSERT INTO public.historial_estado_alumno(alumno_id, estado, motivo, fecha, registrado_por)
    VALUES (NEW.id, CASE WHEN NEW.activo THEN 'activo' ELSE 'inactivo' END,
      CASE WHEN NEW.activo THEN 'Reactivación administrativa'
        ELSE COALESCE(NULLIF(trim(NEW.motivo_baja), ''), 'Desactivación administrativa') END,
      (now() AT TIME ZONE 'America/Santo_Domingo')::date, auth.uid());
  END IF;
  RETURN NEW;
END;
$$;
-- Existing production trigger; also establish it for fresh installations.
DROP TRIGGER IF EXISTS trg_historial_estado_alumno ON public.alumnos;
CREATE TRIGGER trg_historial_estado_alumno AFTER UPDATE OF activo ON public.alumnos
FOR EACH ROW EXECUTE FUNCTION public.fn_trigger_historial_estado_alumno();

REVOKE ALL ON FUNCTION public.fn_guard_active_attendance() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.fn_guard_active_session_attendance() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.fn_sync_alumno_activity_state() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.fn_trigger_historial_estado_alumno() FROM PUBLIC, anon, authenticated;

-- Only reconcile the redundant label of already inactive alumnos. Do not infer
-- motives, dates, debt, restore enrollments, or modify historical audit records.
UPDATE public.alumnos SET estado_academico = 'retirado'
WHERE activo IS FALSE AND estado_academico = 'activo';
COMMIT;

-- ============================================================================
-- URGENT FIX: Both T6 and T7 triggers referenced non-existent columns:
--   NEW.sesion_id   → real column is NEW.sesion_clase_id
--   NEW.maestro_id  → not in asistencias; must JOIN sesiones_clase
--   NEW.tipo_asistencia → real column is NEW.estado
-- Applied directly to remote via supabase db query --linked because
-- the migration history table was out of sync.
-- ============================================================================

-- ── T6: AFTER INSERT on asistencias ─────────────────────────────────────────
DROP TRIGGER IF EXISTS trg_soi_evento_asistencia_registrada ON public.asistencias;
DROP FUNCTION IF EXISTS public.fn_soi_evento_asistencia_registrada();

CREATE OR REPLACE FUNCTION public.fn_soi_evento_asistencia_registrada()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_maestro_id uuid;
BEGIN
  SELECT maestro_id INTO v_maestro_id
  FROM public.sesiones_clase
  WHERE id = NEW.sesion_clase_id;

  INSERT INTO public.soi_eventos (
    tipo, entidad_tipo, entidad_id, actor_id, payload, correlation_id
  )
  VALUES (
    'asistencia.registrada',
    'asistencias',
    NEW.id,
    auth.uid(),
    jsonb_build_object(
      'alumno_id', NEW.alumno_id,
      'sesion_id', NEW.sesion_clase_id,
      'maestro_id', v_maestro_id,
      'estado', NEW.estado,
      'clase_id', NEW.clase_id
    ),
    NULL
  )
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END $$;

CREATE TRIGGER trg_soi_evento_asistencia_registrada
  AFTER INSERT ON public.asistencias
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_soi_evento_asistencia_registrada();

-- ── T7: AFTER UPDATE on asistencias ─────────────────────────────────────────
DROP TRIGGER IF EXISTS trg_soi_evento_asistencia_falta ON public.asistencias;
DROP FUNCTION IF EXISTS public.fn_soi_evento_asistencia_falta();

CREATE OR REPLACE FUNCTION public.fn_soi_evento_asistencia_falta()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tipo text;
  v_correlation_id uuid;
  v_maestro_id uuid;
BEGIN
  IF NEW.estado = OLD.estado THEN
    RETURN NEW;
  END IF;

  IF NEW.estado IN ('ausente', 'falta_injustificada') THEN
    v_tipo := 'asistencia.falta_injustificada';
    v_correlation_id := NULL;
  ELSIF NEW.estado = 'falta_justificada' THEN
    v_tipo := 'asistencia.falta_justificada';
    v_correlation_id := gen_random_uuid();
  ELSE
    RETURN NEW;
  END IF;

  SELECT maestro_id INTO v_maestro_id
  FROM public.sesiones_clase
  WHERE id = NEW.sesion_clase_id;

  INSERT INTO public.soi_eventos (
    tipo, entidad_tipo, entidad_id, actor_id, payload, correlation_id
  )
  VALUES (
    v_tipo,
    'asistencias',
    NEW.id,
    auth.uid(),
    jsonb_build_object(
      'alumno_id', NEW.alumno_id,
      'sesion_id', NEW.sesion_clase_id,
      'maestro_id', v_maestro_id,
      'dias_consecutivos', 0
    ),
    v_correlation_id
  )
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END $$;

CREATE TRIGGER trg_soi_evento_asistencia_falta
  AFTER UPDATE ON public.asistencias
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_soi_evento_asistencia_falta();

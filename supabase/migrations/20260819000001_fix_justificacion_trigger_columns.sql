-- ============================================================================
-- FIX: T9 trigger fn_soi_evento_justificacion() referenced non-existent columns
--   NEW.ausencia_fecha  → real column is NEW.fecha
--   NEW.aprobada_por    → real column is NEW.revisado_por
--   NEW.razon_rechazo   → does not exist; use NEW.motivo as fallback
-- Same pattern as 20260818185451_fix_asistencias_trigger_direct.sql (T6/T7)
-- ============================================================================

DROP TRIGGER IF EXISTS trg_soi_evento_justificacion ON public.justificaciones;
DROP FUNCTION IF EXISTS public.fn_soi_evento_justificacion();

CREATE OR REPLACE FUNCTION public.fn_soi_evento_justificacion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tipo text;
  v_payload jsonb;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_tipo := 'justificacion.solicitada';
    v_payload := jsonb_build_object(
      'alumno_id', NEW.alumno_id,
      'ausencia_fecha', NEW.fecha,
      'motivo', NEW.motivo
    );
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.estado IS DISTINCT FROM OLD.estado THEN
      CASE NEW.estado
        WHEN 'aprobado' THEN
          v_tipo := 'justificacion.aprobada';
        WHEN 'rechazado' THEN
          v_tipo := 'justificacion.rechazada';
        ELSE
          RETURN NEW;
      END CASE;

      v_payload := jsonb_build_object(
        'alumno_id', NEW.alumno_id,
        'ausencia_fecha', NEW.fecha,
        'estado_anterior', OLD.estado,
        'estado_nuevo', NEW.estado,
        'motivo', NEW.motivo,
        'revisado_por', NEW.revisado_por
      );
    ELSE
      RETURN NEW;
    END IF;
  ELSE
    RETURN NEW;
  END IF;

  INSERT INTO public.soi_eventos (
    tipo,
    entidad_tipo,
    entidad_id,
    actor_id,
    payload,
    correlation_id
  )
  VALUES (
    v_tipo,
    'justificaciones',
    NEW.id,
    auth.uid(),
    v_payload,
    NULL
  )
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END $$;

CREATE TRIGGER trg_soi_evento_justificacion
  AFTER INSERT OR UPDATE ON public.justificaciones
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_soi_evento_justificacion();

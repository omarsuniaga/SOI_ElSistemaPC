-- =====================================================
-- FIX URGENTE: Trigger asistencias usa NEW.sesion_id
-- pero la columna real es sesion_clase_id
-- Pegar en: Supabase Dashboard → SQL Editor → Run
-- =====================================================

-- 1) Reemplazar fn_soi_evento_asistencia_registrada (AFTER INSERT)
DROP TRIGGER IF EXISTS trg_soi_evento_asistencia_registrada ON public.asistencias;
DROP FUNCTION IF EXISTS public.fn_soi_evento_asistencia_registrada();

CREATE OR REPLACE FUNCTION public.fn_soi_evento_asistencia_registrada()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
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
      'maestro_id', NEW.maestro_id,
      'tipo_asistencia', NEW.tipo_asistencia,
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

-- 2) Reemplazar fn_soi_evento_asistencia_falta (AFTER UPDATE)
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
BEGIN
  IF NEW.tipo_asistencia = OLD.tipo_asistencia THEN
    RETURN NEW;
  END IF;

  IF NEW.tipo_asistencia IN ('ausente', 'falta_injustificada') THEN
    v_tipo := 'asistencia.falta_injustificada';
    v_correlation_id := NULL;
  ELSIF NEW.tipo_asistencia = 'falta_justificada' THEN
    v_tipo := 'asistencia.falta_justificada';
    v_correlation_id := gen_random_uuid();
  ELSE
    RETURN NEW;
  END IF;

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
      'maestro_id', NEW.maestro_id,
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

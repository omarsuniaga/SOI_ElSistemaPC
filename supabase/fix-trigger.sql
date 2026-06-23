-- 1. Corregir la función del trigger sin guiones bajos
CREATE OR REPLACE FUNCTION fn_emit_mora_event()
RETURNS TRIGGER AS $$
DECLARE
  vdias   INT;
  vestado TEXT;
  vnombre TEXT;
BEGIN
  -- Solo evaluar mensualidades
  IF NEW.concepto != 'mensualidad' THEN
    RETURN NEW;
  END IF;

  -- Calcular dias desde el periodo mensual mas reciente
  SELECT (CURRENT_DATE - MAX(periodo_mes))::INT
    INTO vdias
    FROM public.pagos_alumnos
   WHERE alumno_id = NEW.alumno_id
     AND concepto  = 'mensualidad';

  -- Si no hay historial o es menor a 30 dias, no hacer nada
  IF vdias IS NULL OR vdias < 30 THEN
    RETURN NEW;
  END IF;

  -- Determinar color del estado
  IF vdias >= 60 THEN
    vestado := 'rojo';
  ELSE
    vestado := 'amarillo';
  END IF;

  -- Buscar nombre del alumno
  SELECT nombre_completo INTO vnombre
    FROM public.alumnos
   WHERE id = NEW.alumno_id;

  -- Insertar en la tabla de Hermes
  INSERT INTO public.hermes_inbox (canal, categoria, summary, raw_ref)
  VALUES (
    'db_trigger',
    'mora_pago',
    format(
      'Alumno %s en estado financiero %s (%s dias desde ultimo pago de mensualidad)',
      COALESCE(vnombre, NEW.alumno_id::TEXT),
      vestado,
      vdias
    ),
    NEW.alumno_id
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Recrear el trigger
DROP TRIGGER IF EXISTS trg_mora_emit_hermes ON public.pagos_alumnos;
CREATE TRIGGER trg_mora_emit_hermes
  AFTER INSERT ON public.pagos_alumnos
  FOR EACH ROW EXECUTE FUNCTION fn_emit_mora_event();

-- Valoración de 0 a 5 estrellas por alumno presente en una sesión de clase.
--
-- Diseño: columna sobre `asistencias`, no tabla nueva. Ya existe una fila única
-- por (sesion_clase_id, alumno_id), así que corregir una nota es un UPDATE y no
-- puede duplicarse. NULL significa "Sin evaluar"; 0 es una valoración explícita.
--
-- policy: sin tabla nueva → R1 (escritor) y R3 (institucion_id) no aplican aquí.
-- R1 en esta columna: el escritor es el botón «Evaluar presentes» del portal de
-- maestros (src/portal-maestros/components/attendance/PresentRatingsPanel.js),
-- que viaja en el mismo PR. Primera fila real: la primera clase en que un
-- maestro valore a un alumno presente tras el despliegue.
-- R6: es un dato que la persona (el maestro) decide; nada lo calcula ni lo
-- dispara de forma automática, y no etiqueta ni sanciona al alumno.

ALTER TABLE public.asistencias
  ADD COLUMN IF NOT EXISTS valoracion smallint,
  ADD COLUMN IF NOT EXISTS valorada_por uuid,
  ADD COLUMN IF NOT EXISTS valorada_at timestamptz;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'asistencias_valoracion_check'
  ) THEN
    ALTER TABLE public.asistencias
      ADD CONSTRAINT asistencias_valoracion_check
      CHECK (valoracion IS NULL OR valoracion BETWEEN 0 AND 5);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'asistencias_valorada_por_fkey'
  ) THEN
    ALTER TABLE public.asistencias
      ADD CONSTRAINT asistencias_valorada_por_fkey
      FOREIGN KEY (valorada_por) REFERENCES public.profiles(id) ON DELETE SET NULL;
  END IF;
END $$;

COMMENT ON COLUMN public.asistencias.valoracion IS
  'Valoración de la sesión por el maestro, 0 a 5 estrellas. NULL = sin evaluar (distinto de 0). Solo aplica a presente/tarde.';

-- Un ausente o justificado no se evalúa. Si la asistencia se corrige después de
-- haber valorado, la valoración se descarta en lugar de quedar huérfana.
CREATE OR REPLACE FUNCTION public.fn_asistencias_limpiar_valoracion()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.estado IS NULL OR NEW.estado NOT IN ('presente', 'tarde') THEN
    NEW.valoracion := NULL;
    NEW.valorada_por := NULL;
    NEW.valorada_at := NULL;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_asistencias_limpiar_valoracion ON public.asistencias;
CREATE TRIGGER trg_asistencias_limpiar_valoracion
  BEFORE INSERT OR UPDATE OF estado, valoracion ON public.asistencias
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_asistencias_limpiar_valoracion();

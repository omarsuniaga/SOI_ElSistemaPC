-- ============================================================================
-- MAPA GAMIFICADO DE PLANIFICACIÓN — historial de evaluaciones (append-only)
-- Fecha: 2026-08-07
--
-- Contexto: `evaluacion_indicador` tiene UNIQUE(alumno_id, clase_indicador_id)
-- (índice `ei_unq_clase`, migración 20260731000003) y `registrarEvaluacion`
-- (evaluacionClaseService.js) hace UPSERT sobre ese conflicto — es "estado
-- actual", no un log. Cada vez que se recalifica a un alumno en el mismo
-- indicador, la fila anterior se SOBRESCRIBE: no queda rastro de la nota ni
-- la fecha previas. `historialIndicadorModal.js` (Tarea de sesión anterior)
-- se presentó como "historial de evaluaciones" pero en la práctica solo
-- podía mostrar la última nota por alumno — no las sesiones anteriores.
--
-- Esta migración agrega una tabla append-only, poblada por trigger, que
-- preserva cada evaluación tal como se registró en su momento —
-- `evaluacion_indicador` en sí NO se toca (sigue siendo "estado actual",
-- de donde sigue derivando `vw_clase_objetivo_estrellas` y todo lo demás
-- que ya depende de esa semántica; ningún otro consumidor se ve afectado).
-- ============================================================================

CREATE TABLE public.evaluacion_indicador_historial (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluacion_id      uuid NOT NULL REFERENCES public.evaluacion_indicador(id) ON DELETE CASCADE,
  alumno_id          uuid NOT NULL REFERENCES public.alumnos(id) ON DELETE CASCADE,
  clase_id           uuid NOT NULL REFERENCES public.clases(id) ON DELETE CASCADE,
  indicator_id       uuid          REFERENCES public.indicators(id) ON DELETE SET NULL,
  clase_indicador_id uuid          REFERENCES public.clase_mapa_indicadores(id) ON DELETE SET NULL,
  nota               integer CHECK (nota BETWEEN 1 AND 5),
  evaluado_por       uuid          REFERENCES public.maestros(id),
  registrado_en      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_eih_clase_indicador ON public.evaluacion_indicador_historial(clase_indicador_id, alumno_id);
CREATE INDEX idx_eih_indicator ON public.evaluacion_indicador_historial(indicator_id, alumno_id);
CREATE INDEX idx_eih_evaluacion ON public.evaluacion_indicador_historial(evaluacion_id);

-- ----------------------------------------------------------------------------
-- Trigger: registra un evento cada vez que se INSERTA una evaluación, o se
-- ACTUALIZA con una nota distinta (recalificación). Cambios que no tocan
-- `nota` (ej. solo `observaciones`) no generan un evento — el historial es
-- de calificación, no una bitácora genérica de auditoría de la fila.
-- SECURITY DEFINER: el maestro que califica tiene permiso de escribir en
-- `evaluacion_indicador` (RLS `ei_owner`) pero no necesita un permiso propio
-- sobre esta tabla nueva — el trigger corre con los privilegios del dueño
-- de la función, no los del cliente.
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.registrar_historial_evaluacion_indicador()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.nota IS NOT DISTINCT FROM OLD.nota THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.evaluacion_indicador_historial (
    evaluacion_id, alumno_id, clase_id, indicator_id, clase_indicador_id,
    nota, evaluado_por, registrado_en
  ) VALUES (
    NEW.id, NEW.alumno_id, NEW.clase_id, NEW.indicator_id, NEW.clase_indicador_id,
    NEW.nota, NEW.evaluado_por, COALESCE(NEW.fecha_evaluacion, now())
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_evaluacion_indicador_historial
  AFTER INSERT OR UPDATE ON public.evaluacion_indicador
  FOR EACH ROW EXECUTE FUNCTION public.registrar_historial_evaluacion_indicador();

-- ----------------------------------------------------------------------------
-- RLS — solo lectura desde el cliente (mismo alcance que `ei_owner`: el
-- admin ve todo, el maestro/suplente de la clase ve el historial de SU
-- clase). No hace falta política de escritura: el trigger inserta como
-- SECURITY DEFINER, ningún cliente escribe acá directamente.
-- ----------------------------------------------------------------------------

ALTER TABLE public.evaluacion_indicador_historial ENABLE ROW LEVEL SECURITY;

CREATE POLICY "eih_read" ON public.evaluacion_indicador_historial
  FOR SELECT TO authenticated
  USING (public.es_admin() OR public.es_maestro_de_clase(clase_id));

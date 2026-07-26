-- 20260726_asistencia_docente_y_rls_periodos.sql
--
-- Tres huecos detectados en el diagnóstico de cierre de semestre:
--
--   1. No existe captura de asistencia del personal docente. Las tablas `ausencias`
--      y `ausencias_maestros` tienen 0 filas: `ausencias_maestros` modela SOLICITUDES
--      de permiso (con aprobación, suplente, urgencia), no presencia diaria. Falta el
--      registro de "el maestro estuvo o no estuvo en esta sesión".
--
--   2. `periodos` tiene RLS habilitado con UNA sola política (SELECT / es_admin()).
--      Sin políticas de escritura, todo el CRUD del módulo falla contra producción.
--
--   3. La activación de período se hacía en dos requests separados desde el cliente,
--      descartando el error del primero. Si el segundo fallaba, el sistema quedaba
--      SIN ningún período activo.

BEGIN;

-- ══════════════════════════════════════════════════════════════════════════════
-- 1. ASISTENCIA DEL PERSONAL DOCENTE
-- ══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.asistencia_maestros (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sesion_clase_id   uuid NOT NULL REFERENCES public.sesiones_clase(id) ON DELETE CASCADE,
  maestro_id        uuid NOT NULL REFERENCES public.maestros(id)       ON DELETE RESTRICT,
  clase_id          uuid          REFERENCES public.clases(id)         ON DELETE SET NULL,
  periodo_id        uuid          REFERENCES public.periodos(id)       ON DELETE SET NULL,
  fecha             date NOT NULL,
  estado            text NOT NULL
                    CHECK (estado IN ('presente','ausente','justificado','suplencia','tardanza')),
  -- Cuando la ausencia responde a un permiso ya tramitado, se enlaza la solicitud
  -- en vez de duplicar el motivo.
  ausencia_id       uuid          REFERENCES public.ausencias_maestros(id) ON DELETE SET NULL,
  suplente_id       uuid          REFERENCES public.maestros(id)        ON DELETE SET NULL,
  motivo            text,
  observaciones     text,
  registrado_por    uuid          REFERENCES public.profiles(id)        ON DELETE SET NULL,
  marked_at         timestamptz   NOT NULL DEFAULT now(),
  created_at        timestamptz   NOT NULL DEFAULT now(),
  updated_at        timestamptz   NOT NULL DEFAULT now(),

  -- Un maestro tiene exactamente un estado por sesión.
  CONSTRAINT asistencia_maestros_sesion_maestro_uniq UNIQUE (sesion_clase_id, maestro_id),
  -- Una suplencia sin suplente designado es un registro incompleto, no un dato.
  CONSTRAINT asistencia_maestros_suplencia_chk
    CHECK (estado <> 'suplencia' OR suplente_id IS NOT NULL)
);

COMMENT ON TABLE public.asistencia_maestros IS
  'Presencia del docente por sesión de clase. Complementa ausencias_maestros (que modela solicitudes de permiso, no presencia diaria).';
COMMENT ON COLUMN public.asistencia_maestros.marked_at IS
  'Momento del registro. Permite medir puntualidad de carga: marked_at::date - fecha.';

CREATE INDEX IF NOT EXISTS idx_asist_maestros_maestro_fecha
  ON public.asistencia_maestros (maestro_id, fecha DESC);
CREATE INDEX IF NOT EXISTS idx_asist_maestros_periodo
  ON public.asistencia_maestros (periodo_id) WHERE periodo_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_asist_maestros_sesion
  ON public.asistencia_maestros (sesion_clase_id);

-- Denormaliza clase_id / fecha / periodo_id desde la sesión, para que el registro
-- sea consultable sin join y quede anclado al período correcto.
CREATE OR REPLACE FUNCTION public.fn_asistencia_maestro_completar()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_sesion record;
BEGIN
  SELECT clase_id, fecha INTO v_sesion
  FROM public.sesiones_clase WHERE id = NEW.sesion_clase_id;

  IF FOUND THEN
    NEW.clase_id := coalesce(NEW.clase_id, v_sesion.clase_id);
    NEW.fecha    := coalesce(NEW.fecha, v_sesion.fecha);
  END IF;

  IF NEW.periodo_id IS NULL AND NEW.fecha IS NOT NULL THEN
    SELECT id INTO NEW.periodo_id
    FROM public.periodos
    WHERE NEW.fecha BETWEEN fecha_inicio AND fecha_fin
    ORDER BY activo DESC, fecha_inicio DESC
    LIMIT 1;
  END IF;

  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_asistencia_maestro_completar ON public.asistencia_maestros;
CREATE TRIGGER trg_asistencia_maestro_completar
  BEFORE INSERT OR UPDATE ON public.asistencia_maestros
  FOR EACH ROW EXECUTE FUNCTION public.fn_asistencia_maestro_completar();

ALTER TABLE public.asistencia_maestros ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS asistencia_maestros_admin_all ON public.asistencia_maestros;
CREATE POLICY asistencia_maestros_admin_all
  ON public.asistencia_maestros FOR ALL TO authenticated
  USING (es_admin()) WITH CHECK (es_admin());

-- Un maestro puede consultar su propio historial, pero no editarlo: quien registra
-- la presencia es la coordinación, no el evaluado.
DROP POLICY IF EXISTS asistencia_maestros_self_read ON public.asistencia_maestros;
CREATE POLICY asistencia_maestros_self_read
  ON public.asistencia_maestros FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.maestros m
    WHERE m.id = asistencia_maestros.maestro_id AND m.user_id = auth.uid()
  ));

-- ══════════════════════════════════════════════════════════════════════════════
-- 2. POLÍTICAS DE ESCRITURA PARA `periodos`
-- ══════════════════════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS periodos_admin_insert ON public.periodos;
CREATE POLICY periodos_admin_insert
  ON public.periodos FOR INSERT TO authenticated
  WITH CHECK (es_admin());

DROP POLICY IF EXISTS periodos_admin_update ON public.periodos;
CREATE POLICY periodos_admin_update
  ON public.periodos FOR UPDATE TO authenticated
  USING (es_admin()) WITH CHECK (es_admin());

-- El borrado se restringe a períodos sin cerrar: un período cerrado es archivo
-- histórico y no debe poder eliminarse desde la interfaz.
DROP POLICY IF EXISTS periodos_admin_delete ON public.periodos;
CREATE POLICY periodos_admin_delete
  ON public.periodos FOR DELETE TO authenticated
  USING (es_admin() AND cerrado IS NOT TRUE);

-- ══════════════════════════════════════════════════════════════════════════════
-- 3. ACTIVACIÓN ATÓMICA DE PERÍODO
-- ══════════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.fn_activar_periodo(p_periodo_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_periodo record;
  v_anterior uuid;
BEGIN
  IF NOT es_admin() THEN
    RAISE EXCEPTION 'Operación no autorizada: se requiere rol administrador';
  END IF;

  SELECT * INTO v_periodo FROM public.periodos WHERE id = p_periodo_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Período no encontrado';
  END IF;

  IF v_periodo.cerrado THEN
    RAISE EXCEPTION 'No se puede activar un período cerrado: %', v_periodo.nombre;
  END IF;

  SELECT id INTO v_anterior FROM public.periodos WHERE activo IS TRUE AND id <> p_periodo_id;

  -- Ambas escrituras en la misma transacción: o el corte ocurre completo, o no ocurre.
  -- El índice único parcial sobre (activo) WHERE activo exige desactivar antes de activar.
  UPDATE public.periodos SET activo = false, updated_at = now()
   WHERE activo IS TRUE AND id <> p_periodo_id;

  UPDATE public.periodos SET activo = true, updated_at = now()
   WHERE id = p_periodo_id;

  RETURN jsonb_build_object(
    'ok', true,
    'periodo_id', p_periodo_id,
    'nombre', v_periodo.nombre,
    'periodo_anterior_id', v_anterior
  );
END;
$$;

COMMENT ON FUNCTION public.fn_activar_periodo IS
  'Activa un período desactivando el anterior en una sola transacción. Reemplaza el par de updates del cliente, que dejaba el sistema sin período activo si el segundo fallaba.';

REVOKE ALL ON FUNCTION public.fn_activar_periodo FROM public, anon;
GRANT EXECUTE ON FUNCTION public.fn_activar_periodo TO authenticated, service_role;

-- ══════════════════════════════════════════════════════════════════════════════
-- 4. TAXONOMÍA DE JUSTIFICACIONES
--
-- De los cuatro indicadores propuestos para el informe, tres NO requieren schema:
--   · Retención        -> trg_historial_estado_alumno YA EXISTE sobre alumnos.
--                         Está vacío porque nunca se ha marcado una baja, no por
--                         falta de código. Es adopción de proceso, no desarrollo.
--   · Contingencias    -> clases_emergentes YA EXISTE (0 filas), y las suplencias
--                         quedan cubiertas por asistencia_maestros.estado='suplencia'.
--   · Avance pedagógico-> indicator_attempts YA EXISTE (20 filas, 2 días de uso).
--
-- El único que sí lo requiere es el desglose de justificaciones por causal:
-- `motivo` es texto libre ("Enfermo", "Cuestiones religiosas", "test") y no admite
-- agrupación. Se agrega un vocabulario controlado SIN tocar el texto existente.
-- ══════════════════════════════════════════════════════════════════════════════
ALTER TABLE public.justificaciones
  ADD COLUMN IF NOT EXISTS categoria text
  CHECK (categoria IS NULL OR categoria IN
    ('medica','familiar','academica','institucional','religiosa','transporte','otra'));

COMMENT ON COLUMN public.justificaciones.categoria IS
  'Causal normalizada para agregación en informes. NULL = sin clasificar; el informe la reporta como SIN_CLASIFICAR en vez de asumir una categoría.';

CREATE INDEX IF NOT EXISTS idx_justificaciones_categoria
  ON public.justificaciones (categoria) WHERE categoria IS NOT NULL;

COMMIT;

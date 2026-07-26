-- 20260726_calendario_lectivo.sql
--
-- PROBLEMA QUE RESUELVE
-- ---------------------
-- Al entrar el receso, el sistema siguió generando clases pendientes: el motor de
-- notificaciones calcula la jornada desde `horarios.dia_semana`, un horario semanal
-- recurrente que no sabe que existen los períodos académicos. Resultado: maestros
-- penalizados por no registrar clases que nunca ocurrieron, y alumnos arrastrando
-- ausencias de días sin actividad.
--
-- TRES FUENTES DE VERDAD QUE SE UNIFICAN AQUÍ
-- -------------------------------------------
-- Antes de esta migración, "¿hay clases hoy?" se respondía de tres formas distintas:
--
--   1. `periodos.fecha_inicio/fecha_fin`  -> nadie lo consultaba para esto.
--   2. `calendario_institucional` con `titulo ILIKE '%RECESO%'`, leído por
--      fn_portal_maestro_bloqueado(). Una regla institucional colgando de una
--      coincidencia de texto: escribir "Vacaciones" en vez de "RECESO" la anulaba.
--   3. `system_config.whatsapp_ingest_enabled = 'false'`, usado como interruptor de
--      vacaciones en los guards de notificación. Apagar la ingesta de WhatsApp y
--      declarar receso académico son decisiones distintas que compartían perilla.
--
-- A partir de aquí la única fuente es `periodos` + `periodo_excepciones`, expuesta
-- por fn_es_dia_lectivo(). Las otras dos rutas pasan a derivar de ella.

BEGIN;

-- ══════════════════════════════════════════════════════════════════════════════
-- 1. EXCEPCIONES AL CALENDARIO LECTIVO
--
-- Un semestre de seis meses no son seis meses de clases. Semana Santa, Carnaval,
-- feriados nacionales y suspensiones por clima caen DENTRO del período y no son
-- días lectivos. Sin este modelo, cada feriado genera pendientes falsos.
--
-- periodo_id NULL = excepción global (aplica a cualquier período que la contenga),
-- útil para feriados nacionales que no hay que recargar semestre a semestre.
-- ══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.periodo_excepciones (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  periodo_id    uuid REFERENCES public.periodos(id) ON DELETE CASCADE,
  fecha_inicio  date NOT NULL,
  fecha_fin     date NOT NULL,
  motivo        text NOT NULL,
  tipo          text NOT NULL DEFAULT 'feriado'
                CHECK (tipo IN ('feriado','receso','suspension','institucional','otro')),
  creado_por    uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT periodo_excepciones_rango_chk CHECK (fecha_fin >= fecha_inicio)
);

COMMENT ON TABLE public.periodo_excepciones IS
  'Días no lectivos dentro de un período académico. periodo_id NULL = excepción global (feriado nacional).';
COMMENT ON COLUMN public.periodo_excepciones.periodo_id IS
  'NULL aplica la excepción a cualquier período que contenga el rango. Útil para feriados recurrentes.';

CREATE INDEX IF NOT EXISTS idx_periodo_excepciones_rango
  ON public.periodo_excepciones (fecha_inicio, fecha_fin);
CREATE INDEX IF NOT EXISTS idx_periodo_excepciones_periodo
  ON public.periodo_excepciones (periodo_id) WHERE periodo_id IS NOT NULL;

ALTER TABLE public.periodo_excepciones ENABLE ROW LEVEL SECURITY;

-- Todo docente necesita leer el calendario para saber si tiene clase.
DROP POLICY IF EXISTS periodo_excepciones_read ON public.periodo_excepciones;
CREATE POLICY periodo_excepciones_read
  ON public.periodo_excepciones FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS periodo_excepciones_admin_write ON public.periodo_excepciones;
CREATE POLICY periodo_excepciones_admin_write
  ON public.periodo_excepciones FOR ALL TO authenticated
  USING (es_admin()) WITH CHECK (es_admin());

REVOKE ALL ON public.periodo_excepciones FROM anon;

-- ══════════════════════════════════════════════════════════════════════════════
-- 2. FUNCIONES NÚCLEO DEL CALENDARIO
-- ══════════════════════════════════════════════════════════════════════════════

-- Período académico que contiene la fecha. Si hay solape (no debería, pero la base
-- no lo impide hoy) prefiere el marcado como activo.
CREATE OR REPLACE FUNCTION public.fn_periodo_vigente(p_fecha date DEFAULT CURRENT_DATE)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT id
  FROM public.periodos
  WHERE p_fecha BETWEEN fecha_inicio AND fecha_fin
  ORDER BY activo DESC, fecha_inicio DESC
  LIMIT 1;
$$;

COMMENT ON FUNCTION public.fn_periodo_vigente IS
  'Período académico que contiene la fecha dada. NULL si la fecha cae fuera de todo período.';

-- Responde la única pregunta que importa: ¿este día hay actividad académica?
--
-- Deliberadamente NO considera el día de la semana. Qué días de la semana hay clase
-- lo define el horario de cada clase (horarios / clase_horarios), no el calendario
-- institucional. Mezclar ambas cosas aquí acoplaría dos decisiones independientes.
CREATE OR REPLACE FUNCTION public.fn_es_dia_lectivo(p_fecha date DEFAULT CURRENT_DATE)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.periodos
    WHERE p_fecha BETWEEN fecha_inicio AND fecha_fin
  )
  AND NOT EXISTS (
    SELECT 1 FROM public.periodo_excepciones e
    WHERE p_fecha BETWEEN e.fecha_inicio AND e.fecha_fin
      AND (e.periodo_id IS NULL OR e.periodo_id = public.fn_periodo_vigente(p_fecha))
  );
$$;

COMMENT ON FUNCTION public.fn_es_dia_lectivo IS
  'TRUE si la fecha cae dentro de un período académico y no está cubierta por una excepción. Fuente única para decidir si se exige registro de asistencia.';

-- Explicación legible para la interfaz: no basta con saber que no hay clase,
-- el maestro debe poder ver por qué.
CREATE OR REPLACE FUNCTION public.fn_estado_calendario(p_fecha date DEFAULT CURRENT_DATE)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_periodo   record;
  v_excepcion record;
BEGIN
  SELECT * INTO v_periodo FROM public.periodos
   WHERE p_fecha BETWEEN fecha_inicio AND fecha_fin
   ORDER BY activo DESC, fecha_inicio DESC LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'es_lectivo', false,
      'motivo', 'FUERA_DE_PERIODO',
      'detalle', 'La fecha no pertenece a ningún período académico registrado.',
      'periodo', NULL);
  END IF;

  SELECT * INTO v_excepcion FROM public.periodo_excepciones e
   WHERE p_fecha BETWEEN e.fecha_inicio AND e.fecha_fin
     AND (e.periodo_id IS NULL OR e.periodo_id = v_periodo.id)
   ORDER BY e.fecha_inicio LIMIT 1;

  IF FOUND THEN
    RETURN jsonb_build_object(
      'es_lectivo', false,
      'motivo', upper(v_excepcion.tipo),
      'detalle', v_excepcion.motivo,
      'desde', v_excepcion.fecha_inicio,
      'hasta', v_excepcion.fecha_fin,
      'periodo', jsonb_build_object('id', v_periodo.id, 'nombre', v_periodo.nombre));
  END IF;

  RETURN jsonb_build_object(
    'es_lectivo', true,
    'motivo', 'LECTIVO',
    'detalle', 'Día dentro del período académico.',
    'periodo', jsonb_build_object(
      'id', v_periodo.id, 'nombre', v_periodo.nombre,
      'fecha_inicio', v_periodo.fecha_inicio, 'fecha_fin', v_periodo.fecha_fin,
      'cerrado', v_periodo.cerrado));
END;
$$;

COMMENT ON FUNCTION public.fn_estado_calendario IS
  'Estado del calendario para una fecha, con el motivo legible. Permite que la interfaz explique por qué no se pide registro.';

REVOKE ALL ON FUNCTION public.fn_periodo_vigente(date)   FROM public, anon;
REVOKE ALL ON FUNCTION public.fn_es_dia_lectivo(date)    FROM public, anon;
REVOKE ALL ON FUNCTION public.fn_estado_calendario(date) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.fn_periodo_vigente(date)   TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.fn_es_dia_lectivo(date)    TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.fn_estado_calendario(date) TO authenticated, service_role;

-- ══════════════════════════════════════════════════════════════════════════════
-- 3. MIGRAR EL RECESO EXISTENTE A LA NUEVA FUENTE
--
-- calendario_institucional tiene hoy una fila "RECESO ACADÉMICO: Bloqueo de Carga"
-- (11-jul a 3-ago) que gobierna el bloqueo por coincidencia de texto. Se copia como
-- excepción para que el comportamiento actual se preserve al cambiar de fuente.
-- La fila original NO se borra: sigue siendo un evento válido del calendario
-- institucional, sólo deja de ser el mecanismo que decide si hay clases.
-- ══════════════════════════════════════════════════════════════════════════════
-- Sobre el huso horario: los eventos de calendario_institucional guardan fechas
-- codificadas como límites UTC (`00:00:00+00` de inicio, `23:59:59+00` de fin), no
-- instantes locales reales. Convertirlos a America/Santo_Domingo (UTC-4) correría
-- la medianoche al día anterior y el receso empezaría 24 h antes de lo declarado.
-- Se toma la fecha directa: aquí UTC es el contenedor del dato, no su zona.
INSERT INTO public.periodo_excepciones (periodo_id, fecha_inicio, fecha_fin, motivo, tipo)
SELECT NULL,
       ci.fecha_inicio::date,
       ci.fecha_fin::date,
       ci.titulo,
       'receso'
FROM public.calendario_institucional ci
WHERE ci.categoria = 'otro'
  AND ci.titulo ILIKE '%RECESO%'
  AND NOT EXISTS (
    SELECT 1 FROM public.periodo_excepciones e
    WHERE e.fecha_inicio = ci.fecha_inicio::date
      AND e.fecha_fin    = ci.fecha_fin::date
  );

-- ══════════════════════════════════════════════════════════════════════════════
-- 4. EL PORTAL DEL MAESTRO PASA A LEER EL CALENDARIO
--
-- Antes: EXISTS sobre calendario_institucional con titulo ILIKE '%RECESO%'.
-- Ahora: la negación de fn_es_dia_lectivo(). Se conserva el nombre y la firma para
-- no romper a los consumidores existentes.
-- ══════════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.fn_portal_maestro_bloqueado()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT NOT public.fn_es_dia_lectivo(
    (now() AT TIME ZONE 'America/Santo_Domingo')::date
  );
$$;

COMMENT ON FUNCTION public.fn_portal_maestro_bloqueado IS
  'TRUE cuando hoy no es día lectivo. Deriva de fn_es_dia_lectivo; ya no depende de que el título del evento contenga la palabra RECESO.';

COMMIT;

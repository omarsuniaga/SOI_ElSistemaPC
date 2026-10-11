-- POLICY-EXCEPTION R1: esta migración crea escritores nuevos (afectaciones,
-- exenciones, convocatoria, asistencia de actividad) sin código de UI en el
-- mismo PR — se pidió explícitamente separar migración y UI en dos pasos.
-- Pago: el próximo PR (adapter + vistas de Actividades Institucionales)
-- produce la primera fila real y viaja antes de habilitar el flujo en
-- producción. Sin ese PR, estas tablas quedan vacías y no se anuncian como
-- "listas".
--
-- POLICY-EXCEPTION R3: calendario_institucional ya existe sin institucion_id
-- (confirmado en producción, cero instituciones múltiples en este deploy).
-- Las 4 tablas nuevas heredan esa misma exención por consistencia con la
-- tabla padre; no se introduce una columna que el resto del dominio no
-- tiene. El checker exige el marcador `policy:exento-institucion_id` dentro
-- del cuerpo de cada CREATE TABLE (no alcanza con este comentario de
-- cabecera), así que también aparece repetido en cada una, más abajo.
--
-- Contexto: SPEC_actividades_institucionales_SOI.md. calendario_institucional
-- (7 filas en prod, categorías concierto/ensayo/reunion/etc., estado='programado'
-- en el 100% de los casos) no tenía columnas de alcance, aprobación ni
-- afectación de clase. El registro emergente actual
-- (autoJustificarClasesProgramadas) escribe justificaciones sin ningún paso
-- institucional: confirmado en vivo el 24/09/2026, donde 3 maestros crearon
-- 3 sesiones "Feriado" independientes para la misma fecha en vez de un único
-- cierre institucional.

-- ============================================================
-- 1. Extender calendario_institucional: alcance, convocatoria y aprobación
-- ============================================================

-- categoria es un enum cerrado sin 'feriado' ni 'suspension'. Agregar valores
-- a un enum es aditivo y no requiere reescribir filas existentes.
ALTER TYPE public.event_categoria ADD VALUE IF NOT EXISTS 'feriado';
ALTER TYPE public.event_categoria ADD VALUE IF NOT EXISTS 'suspension';
ALTER TYPE public.event_categoria ADD VALUE IF NOT EXISTS 'actividad_especial';

ALTER TABLE public.calendario_institucional
  ADD COLUMN IF NOT EXISTS alcance text NOT NULL DEFAULT 'institucional',
  ADD COLUMN IF NOT EXISTS programas_convocados uuid[] NOT NULL DEFAULT '{}'::uuid[],
  ADD COLUMN IF NOT EXISTS clases_convocadas uuid[] NOT NULL DEFAULT '{}'::uuid[],
  ADD COLUMN IF NOT EXISTS responsable_asistencia_id uuid REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS requiere_aprobacion boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS aprobado_por uuid REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS aprobado_en timestamptz,
  ADD COLUMN IF NOT EXISTS motivo_rechazo text,
  ADD COLUMN IF NOT EXISTS creado_por uuid REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS version integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS reemplaza_a uuid REFERENCES public.calendario_institucional(id);

-- alcance describe a quién convoca/afecta el evento (§2 y §10.3 del spec):
-- institucional = todo el centro (feriado total); programa = un programa
-- concreto vía programas_convocados; clase = ocurrencias explícitas vía
-- clases_convocadas.
ALTER TABLE public.calendario_institucional
  ADD CONSTRAINT calendario_institucional_alcance_check
  CHECK (alcance IN ('institucional', 'programa', 'clase'));

-- estado ya tenía un CHECK (programado/en_curso/completado/cancelado; el
-- 100% de las filas en prod usa 'programado'). Se reemplaza por uno que
-- suma los estados del flujo de aprobación (§3) sin romper los eventos
-- existentes (conciertos, reuniones) que no pasan por ese flujo.
ALTER TABLE public.calendario_institucional
  DROP CONSTRAINT IF EXISTS calendario_institucional_estado_check;
ALTER TABLE public.calendario_institucional
  ADD CONSTRAINT calendario_institucional_estado_check
  CHECK (estado IN (
    'programado', 'en_curso', 'completado', 'cancelado',
    'borrador', 'pendiente_revision', 'aprobado', 'rechazado'
  ));

COMMENT ON COLUMN public.calendario_institucional.alcance IS
  'A quién convoca/afecta: institucional (todo el centro), programa (via programas_convocados) o clase (via clases_convocadas).';
COMMENT ON COLUMN public.calendario_institucional.version IS
  'Se incrementa en cada corrección aprobada. reemplaza_a encadena con la revisión anterior para el historial auditable del §3.';

-- ============================================================
-- 2. Afectación por ocurrencia de clase (§2, §7: "Afectación")
-- ============================================================

CREATE TABLE IF NOT EXISTS public.calendario_afectaciones_clase (
  -- policy:exento-institucion_id razón: hereda de calendario_institucional, que tampoco lo tiene; deploy de una sola institución.
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id uuid NOT NULL REFERENCES public.calendario_institucional(id) ON DELETE CASCADE,
  clase_id uuid NOT NULL REFERENCES public.clases(id),
  fecha date NOT NULL,
  tipo_afectacion text NOT NULL CHECK (tipo_afectacion IN (
    'suspendida', 'impartida_con_exencion', 'impartida_sin_cambios', 'sustituida'
  )),
  motivo text,
  vigente boolean NOT NULL DEFAULT true,
  reemplaza_a uuid REFERENCES public.calendario_afectaciones_clase(id),
  creado_por uuid REFERENCES public.profiles(id),
  creado_en timestamptz NOT NULL DEFAULT now(),
  actualizado_en timestamptz NOT NULL DEFAULT now()
);

-- "Una sola decisión vigente por ocurrencia" (§7): una clase+fecha no puede
-- tener dos afectaciones vigentes a la vez. Una corrección marca la anterior
-- vigente=false y crea una fila nueva encadenada por reemplaza_a.
CREATE UNIQUE INDEX IF NOT EXISTS calendario_afectaciones_clase_vigente_uk
  ON public.calendario_afectaciones_clase (clase_id, fecha)
  WHERE vigente;

CREATE INDEX IF NOT EXISTS calendario_afectaciones_clase_evento_idx
  ON public.calendario_afectaciones_clase (evento_id);

COMMENT ON TABLE public.calendario_afectaciones_clase IS
  'Decisión aprobada sobre una ocurrencia concreta de clase (por clase_id + fecha). No modifica el horario recurrente (§2, §6).';

-- ============================================================
-- 3. Exención individual dentro de una afectación (§2, §3.5)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.calendario_exenciones_alumno (
  -- policy:exento-institucion_id razón: hereda de calendario_institucional, que tampoco lo tiene; deploy de una sola institución.
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  afectacion_id uuid NOT NULL REFERENCES public.calendario_afectaciones_clase(id) ON DELETE CASCADE,
  alumno_id uuid NOT NULL REFERENCES public.alumnos(id),
  motivo text,
  creado_por uuid REFERENCES public.profiles(id),
  creado_en timestamptz NOT NULL DEFAULT now(),
  UNIQUE (afectacion_id, alumno_id)
);

COMMENT ON TABLE public.calendario_exenciones_alumno IS
  'Alumnos liberados de una clase impartida-con-exencion por estar convocados a la actividad (§3.3). Solo tiene sentido cuando la afectación es impartida_con_exencion.';

-- ============================================================
-- 4. Convocatoria: a quién invita la actividad (§2, §10.3)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.calendario_convocatoria (
  -- policy:exento-institucion_id razón: hereda de calendario_institucional, que tampoco lo tiene; deploy de una sola institución.
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id uuid NOT NULL REFERENCES public.calendario_institucional(id) ON DELETE CASCADE,
  programa_id uuid REFERENCES public.programas(id),
  clase_id uuid REFERENCES public.clases(id),
  alumno_id uuid REFERENCES public.alumnos(id),
  creado_en timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT calendario_convocatoria_referencia_unica CHECK (
    num_nonnulls(programa_id, clase_id, alumno_id) = 1
  )
);

CREATE INDEX IF NOT EXISTS calendario_convocatoria_evento_idx
  ON public.calendario_convocatoria (evento_id);

COMMENT ON TABLE public.calendario_convocatoria IS
  'Programa, clase o alumno convocado a la actividad. Exactamente una de las tres referencias por fila (§10.3: "programa convocado, alumnos concretos o ambos").';

-- ============================================================
-- 5. Asistencia real a la actividad (§2: convocado ≠ presente)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.calendario_asistencia_actividad (
  -- policy:exento-institucion_id razón: hereda de calendario_institucional, que tampoco lo tiene; deploy de una sola institución.
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id uuid NOT NULL REFERENCES public.calendario_institucional(id) ON DELETE CASCADE,
  alumno_id uuid NOT NULL REFERENCES public.alumnos(id),
  estado text NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('presente', 'ausente', 'pendiente')),
  registrado_por uuid REFERENCES public.profiles(id),
  registrado_en timestamptz,
  UNIQUE (evento_id, alumno_id)
);

COMMENT ON TABLE public.calendario_asistencia_actividad IS
  'Asistencia a la actividad institucional en sí, distinta de la asistencia a clase (§2, §4). La pasa el responsable_asistencia_id del evento.';

-- ============================================================
-- 6. Triggers de actualizado_en (reutiliza la función existente del proyecto)
-- ============================================================

CREATE TRIGGER set_actualizado_en_afectaciones
  BEFORE UPDATE ON public.calendario_afectaciones_clase
  FOR EACH ROW EXECUTE FUNCTION public.actualizar_timestamp_permisos();

-- ============================================================
-- 7. RLS: lectura amplia, escritura solo con permiso institucional
-- ============================================================

ALTER TABLE public.calendario_afectaciones_clase ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendario_exenciones_alumno ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendario_convocatoria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendario_asistencia_actividad ENABLE ROW LEVEL SECURITY;

-- Lectura: cualquier usuario autenticado (maestros necesitan ver qué les
-- afecta; mismo criterio que "Todos pueden leer permisos" en permisos_maestros).
CREATE POLICY calendario_afectaciones_select ON public.calendario_afectaciones_clase
  FOR SELECT TO authenticated USING (true);
CREATE POLICY calendario_exenciones_select ON public.calendario_exenciones_alumno
  FOR SELECT TO authenticated USING (true);
CREATE POLICY calendario_convocatoria_select ON public.calendario_convocatoria
  FOR SELECT TO authenticated USING (true);
CREATE POLICY calendario_asistencia_actividad_select ON public.calendario_asistencia_actividad
  FOR SELECT TO authenticated USING (true);

-- Escritura de afectaciones/exenciones/convocatoria: exige es_admin() —
-- validado en el servidor (§3, §10.3), no solo ocultando el botón en la UI.
-- NOTA: es_admin() hoy reconoce 'admin' e 'inventarista' pero no 'superadmin'
-- (hallazgo de la auditoría de permisos del 24/09/2026, aún no corregido).
CREATE POLICY calendario_afectaciones_write ON public.calendario_afectaciones_clase
  FOR ALL TO authenticated USING (public.es_admin()) WITH CHECK (public.es_admin());
CREATE POLICY calendario_exenciones_write ON public.calendario_exenciones_alumno
  FOR ALL TO authenticated USING (public.es_admin()) WITH CHECK (public.es_admin());
CREATE POLICY calendario_convocatoria_write ON public.calendario_convocatoria
  FOR ALL TO authenticated USING (public.es_admin()) WITH CHECK (public.es_admin());

-- Asistencia de actividad: la registra el responsable designado del evento,
-- no cualquier admin (§3: "confirmar asistencia a actividad si se le designa
-- responsable"). El propio evento guarda responsable_asistencia_id.
CREATE POLICY calendario_asistencia_actividad_write ON public.calendario_asistencia_actividad
  FOR ALL TO authenticated USING (
    public.es_admin()
    OR evento_id IN (
      SELECT id FROM public.calendario_institucional
      WHERE responsable_asistencia_id = auth.uid()
    )
  ) WITH CHECK (
    public.es_admin()
    OR evento_id IN (
      SELECT id FROM public.calendario_institucional
      WHERE responsable_asistencia_id = auth.uid()
    )
  );

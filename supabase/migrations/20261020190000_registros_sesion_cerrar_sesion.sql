-- ════════════════════════════════════════════════════════════════════════════
-- 20261020190000_registros_sesion_cerrar_sesion.sql
--
-- Bitácora de clase, Fase F2: registro estructurado de cada sesión y cierre transaccional.
-- Especificación: docs/planning/SPEC_BITACORA_DE_CLASE.md (§6 reglas BR-01..BR-11, §7.1, §7.3)
-- Diseño F2     : odd/tasks/bitacora-de-clase.md, sección "Phase F2"
-- Rollback      : supabase/rollback/20261020190000_registros_sesion_cerrar_sesion.rollback.sql
-- Pruebas       : supabase/tests/registros-sesion/ (npm run test:db:registros-sesion)
--
-- R1 · ESCRITOR (viaja en esta misma migración + src/portal-maestros/services/bitacoraCloseService.js):
--   registros_sesion ← cerrar_sesion(jsonb), la única vía de escritura (sin INSERT/UPDATE/DELETE).
--   Primera fila real: un maestro piloto, tras aplicar a mano esta migración; fecha propuesta
--   2026-11-03 (por confirmar).
-- R2 · El bucle se cierra: el cierre escribe la asistencia, los registros confirmados, las
--   valoraciones y el estado de la sesión en una sola transacción.
-- R3 · Exención declarada en la columna institucion_id (ver comentario dentro de CREATE TABLE).
-- R5 · Trazabilidad: cada registro guarda sesión, autor, confirmación y su evidencia literal.
--
-- AUTORIZACIÓN: esta migración se aplica A MANO en el SQL Editor del Dashboard de Supabase,
-- nunca con `supabase db push` (divergencia de ledger). Nada de esto se aplica a producción
-- sin autorización explícita del usuario.
--
-- SEGURIDAD: RLS activo. Lectura para el titular de la sesión, para quien tenga la clase
-- (maestro_en_clase) y para es_admin(). Sin políticas de escritura y sin privilegios DML para
-- los roles de API: la única escritura posible es la RPC SECURITY DEFINER cerrar_sesion.
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE public.registros_sesion (
  id uuid PRIMARY KEY,
  -- policy:exento-institucion_id razón: producción no tiene tabla instituciones ni institucion_id en las tablas núcleo; ver plan en docs/planning/SPEC_BITACORA_DE_CLASE.md §7.5
  institucion_id uuid NULL,
  sesion_clase_id uuid NOT NULL REFERENCES public.sesiones_clase(id),
  clase_id uuid NOT NULL REFERENCES public.clases(id),
  maestro_id uuid NOT NULL REFERENCES public.maestros(id),
  fecha date NOT NULL,
  grupo_registro_id uuid NOT NULL,
  tipo text NOT NULL,
  alcance text NOT NULL,
  alumno_id uuid NULL REFERENCES public.alumnos(id),
  destinatarios_ids uuid[] NULL,
  texto text NOT NULL,
  evidencia text NOT NULL,
  evidencia_inicio integer NULL,
  evidencia_fin integer NULL,
  indicador_id uuid NULL REFERENCES public.maestro_indicadores(id) ON DELETE SET NULL,
  origen text NOT NULL,
  estado text NOT NULL,
  seguimiento text NULL,
  resuelto_en_sesion_id uuid NULL REFERENCES public.sesiones_clase(id),
  resuelto_por uuid NULL,
  resuelto_at timestamptz NULL,
  reemplaza_id uuid NULL REFERENCES public.registros_sesion(id),
  confirmado_por uuid NULL,
  confirmado_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT registros_sesion_tipo_check CHECK (tipo IN ('contenido', 'refuerzo', 'tarea', 'desempeno')),
  CONSTRAINT registros_sesion_alcance_check CHECK (alcance IN ('alumno', 'grupo')),
  CONSTRAINT registros_sesion_alcance_alumno_check CHECK ((alcance = 'alumno') = (alumno_id IS NOT NULL)),
  CONSTRAINT registros_sesion_grupo_destinatarios_check CHECK (alcance <> 'grupo' OR destinatarios_ids IS NOT NULL),
  CONSTRAINT registros_sesion_origen_check CHECK (origen IN ('escrito', 'dictado', 'chip', 'sugerido_ia', 'planificado', 'migrado')),
  CONSTRAINT registros_sesion_estado_check CHECK (estado IN ('borrador', 'confirmado', 'descartado')),
  CONSTRAINT registros_sesion_seguimiento_check CHECK (seguimiento IS NULL OR seguimiento IN ('abierto', 'cumplido', 'parcial', 'no_cumplido', 'descartado')),
  CONSTRAINT registros_sesion_seguimiento_tipo_check CHECK ((seguimiento IS NULL) = (tipo NOT IN ('refuerzo', 'tarea')))
);

CREATE INDEX registros_sesion_sesion_clase_idx ON public.registros_sesion (sesion_clase_id);
CREATE INDEX registros_sesion_alumno_fecha_idx ON public.registros_sesion (alumno_id, fecha);
CREATE INDEX registros_sesion_clase_fecha_idx ON public.registros_sesion (clase_id, fecha);
CREATE INDEX registros_sesion_seguimiento_abierto_idx ON public.registros_sesion (alumno_id) WHERE seguimiento = 'abierto';
CREATE INDEX registros_sesion_destinatarios_gin_idx ON public.registros_sesion USING gin (destinatarios_ids);

ALTER TABLE public.registros_sesion ENABLE ROW LEVEL SECURITY;

CREATE POLICY registros_sesion_select_participantes ON public.registros_sesion
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.sesiones_clase s
       WHERE s.id = registros_sesion.sesion_clase_id
         AND s.maestro_id = public.maestro_actual()
    )
    OR public.maestro_en_clase(registros_sesion.clase_id)
    OR public.es_admin()
  );

REVOKE ALL ON public.registros_sesion FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.registros_sesion TO authenticated;

COMMENT ON TABLE public.registros_sesion IS
  'Registro estructurado de la sesión de clase (una fila por registro y destinatario, o una fila grupal con destinatarios congelados). Solo se escribe con cerrar_sesion().';

-- ────────────────────────────────────────────────────────────────────────────
-- cerrar_sesion(p_payload): cierre transaccional de una sesión (§7.3 y F2).
-- Todo o nada: cualquier violación lanza excepción y no se escribe nada.
--   22023  entrada inválida · 42501  no autorizado o registro de otra sesión
--   P0001  regla de negocio (BR-02, BR-03, valoración de no presente) · 23503  FK
-- Idempotente (BR-10): el mismo payload dos veces deja el mismo estado.
-- ────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.cerrar_sesion(p_payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_maestro uuid := public.maestro_actual();
  v_uid uuid := auth.uid();
  v_sesion public.sesiones_clase%ROWTYPE;
  v_item jsonb;
  v_alumno uuid;
  v_estado text;
  v_tipo text;
  v_alcance text;
  v_origen text;
  v_id uuid;
  v_texto text;
  v_valor integer;
  v_destinatarios uuid[];
  v_presentes uuid[];
  v_ids uuid[] := '{}';
  v_n_asistencias integer := 0;
  v_n_registros integer := 0;
  v_n_valoraciones integer := 0;
  v_n_descartados integer := 0;
BEGIN
  -- 0. Forma del payload
  IF p_payload IS NULL OR jsonb_typeof(p_payload) <> 'object' THEN
    RAISE EXCEPTION 'El cierre debe enviarse como objeto JSON' USING ERRCODE = '22023';
  END IF;
  IF jsonb_typeof(COALESCE(p_payload -> 'asistencia', '[]'::jsonb)) <> 'array'
     OR jsonb_typeof(COALESCE(p_payload -> 'registros', '[]'::jsonb)) <> 'array'
     OR jsonb_typeof(COALESCE(p_payload -> 'valoraciones', '[]'::jsonb)) <> 'array' THEN
    RAISE EXCEPTION 'asistencia, registros y valoraciones deben ser listas' USING ERRCODE = '22023';
  END IF;

  -- 1. Autorización: maestro identificado, sesión existente, bloqueada y propia (titular o clase).
  IF v_maestro IS NULL THEN
    RAISE EXCEPTION 'No autorizado: el usuario no tiene perfil de maestro' USING ERRCODE = '42501';
  END IF;
  SELECT * INTO v_sesion FROM public.sesiones_clase WHERE id = (p_payload ->> 'sesion_id')::uuid FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Sesión no encontrada' USING ERRCODE = 'P0001';
  END IF;
  IF v_sesion.maestro_id IS DISTINCT FROM v_maestro AND NOT public.maestro_en_clase(v_sesion.clase_id) THEN
    RAISE EXCEPTION 'No autorizado para cerrar esta sesión' USING ERRCODE = '42501';
  END IF;

  -- 2. Asistencia: upsert por (sesión, alumno); registrado_por = usuario autenticado.
  FOR v_item IN SELECT value FROM jsonb_array_elements(COALESCE(p_payload -> 'asistencia', '[]'::jsonb)) LOOP
    v_alumno := (v_item ->> 'alumno_id')::uuid;
    v_estado := v_item ->> 'estado';
    IF v_alumno IS NULL THEN
      RAISE EXCEPTION 'Asistencia sin alumno_id' USING ERRCODE = '22023';
    END IF;
    IF v_estado IS NULL OR v_estado NOT IN ('presente', 'ausente', 'tarde', 'justificado') THEN
      RAISE EXCEPTION 'Estado de asistencia no válido: %', v_estado USING ERRCODE = '22023';
    END IF;
    INSERT INTO public.asistencias (sesion_clase_id, clase_id, alumno_id, fecha, estado, registrado_por)
    VALUES (v_sesion.id, v_sesion.clase_id, v_alumno, v_sesion.fecha, v_estado, v_uid)
    ON CONFLICT (sesion_clase_id, alumno_id) DO UPDATE
      SET estado = EXCLUDED.estado, registrado_por = EXCLUDED.registrado_por, updated_at = now();
    v_n_asistencias := v_n_asistencias + 1;
  END LOOP;

  -- 3. Presentes del cierre (BR-02/BR-03): estado presente o tarde, leído tras el upsert.
  SELECT COALESCE(array_agg(a.alumno_id), '{}'::uuid[]) INTO v_presentes
    FROM public.asistencias a
   WHERE a.sesion_clase_id = v_sesion.id
     AND a.estado IN ('presente', 'tarde');

  -- 4. Registros confirmados: upsert por id, solo dentro de la misma sesión.
  FOR v_item IN SELECT value FROM jsonb_array_elements(COALESCE(p_payload -> 'registros', '[]'::jsonb)) LOOP
    v_id := (v_item ->> 'id')::uuid;
    v_tipo := v_item ->> 'tipo';
    v_alcance := v_item ->> 'alcance';
    v_origen := v_item ->> 'origen';
    v_texto := v_item ->> 'texto';
    IF v_id IS NULL OR v_item ->> 'grupo_registro_id' IS NULL THEN
      RAISE EXCEPTION 'Registro sin id o sin grupo_registro_id' USING ERRCODE = '22023';
    END IF;
    IF v_tipo IS NULL OR v_tipo NOT IN ('contenido', 'refuerzo', 'tarea', 'desempeno') THEN
      RAISE EXCEPTION 'Tipo de registro no válido: %', v_tipo USING ERRCODE = '22023';
    END IF;
    IF v_alcance IS NULL OR v_alcance NOT IN ('alumno', 'grupo') THEN
      RAISE EXCEPTION 'Alcance de registro no válido: %', v_alcance USING ERRCODE = '22023';
    END IF;
    IF v_origen IS NULL OR v_origen NOT IN ('escrito', 'dictado', 'chip', 'sugerido_ia', 'planificado', 'migrado') THEN
      RAISE EXCEPTION 'Origen de registro no válido: %', v_origen USING ERRCODE = '22023';
    END IF;
    IF v_texto IS NULL OR btrim(v_texto) = '' THEN
      RAISE EXCEPTION 'El texto del registro es obligatorio' USING ERRCODE = '22023';
    END IF;
    IF EXISTS (SELECT 1 FROM public.registros_sesion x WHERE x.id = v_id AND x.sesion_clase_id <> v_sesion.id) THEN
      RAISE EXCEPTION 'El registro % pertenece a otra sesión', v_id USING ERRCODE = '42501';
    END IF;

    IF v_alcance = 'alumno' THEN
      v_alumno := (v_item ->> 'alumno_id')::uuid;
      IF v_alumno IS NULL THEN
        RAISE EXCEPTION 'Un registro individual requiere alumno_id' USING ERRCODE = '22023';
      END IF;
      -- BR-02: contenido individual solo para alumnos presentes.
      IF NOT (v_alumno = ANY (v_presentes)) THEN
        RAISE EXCEPTION 'BR-02: el alumno % no está presente en la sesión', v_alumno USING ERRCODE = 'P0001';
      END IF;
      v_destinatarios := NULL;
    ELSE
      v_alumno := NULL;
      -- BR-03: destinatarios = presentes al cerrar, congelados en la fila (el cliente no decide).
      IF cardinality(v_presentes) = 0 THEN
        RAISE EXCEPTION 'BR-03: un registro grupal requiere al menos un alumno presente' USING ERRCODE = 'P0001';
      END IF;
      v_destinatarios := v_presentes;
    END IF;

    INSERT INTO public.registros_sesion AS rs (
      id, institucion_id, sesion_clase_id, clase_id, maestro_id, fecha, grupo_registro_id,
      tipo, alcance, alumno_id, destinatarios_ids, texto, evidencia, evidencia_inicio, evidencia_fin,
      indicador_id, origen, estado, seguimiento, confirmado_por, confirmado_at, created_at, updated_at
    ) VALUES (
      v_id, NULL, v_sesion.id, v_sesion.clase_id, v_maestro, v_sesion.fecha, (v_item ->> 'grupo_registro_id')::uuid,
      v_tipo, v_alcance, v_alumno, v_destinatarios, v_texto, COALESCE(v_item ->> 'evidencia', ''),
      (v_item ->> 'evidencia_inicio')::integer, (v_item ->> 'evidencia_fin')::integer,
      (v_item ->> 'indicador_id')::uuid, v_origen, 'confirmado',
      CASE WHEN v_tipo IN ('refuerzo', 'tarea') THEN 'abierto' ELSE NULL END,
      v_maestro, now(), now(), now()
    )
    ON CONFLICT (id) DO UPDATE SET
      tipo = EXCLUDED.tipo,
      alcance = EXCLUDED.alcance,
      alumno_id = EXCLUDED.alumno_id,
      destinatarios_ids = EXCLUDED.destinatarios_ids,
      texto = EXCLUDED.texto,
      evidencia = EXCLUDED.evidencia,
      evidencia_inicio = EXCLUDED.evidencia_inicio,
      evidencia_fin = EXCLUDED.evidencia_fin,
      indicador_id = EXCLUDED.indicador_id,
      origen = EXCLUDED.origen,
      estado = 'confirmado',
      seguimiento = CASE WHEN EXCLUDED.tipo IN ('refuerzo', 'tarea') THEN COALESCE(rs.seguimiento, 'abierto') ELSE NULL END,
      confirmado_por = EXCLUDED.confirmado_por,
      confirmado_at = EXCLUDED.confirmado_at,
      updated_at = now()
    WHERE rs.sesion_clase_id = v_sesion.id;

    v_ids := array_append(v_ids, v_id);
    v_n_registros := v_n_registros + 1;
  END LOOP;

  -- 5. Registros confirmados de la sesión que ya no vienen en el cierre pasan a descartado.
  UPDATE public.registros_sesion rs
     SET estado = 'descartado', updated_at = now()
   WHERE rs.sesion_clase_id = v_sesion.id
     AND rs.estado = 'confirmado'
     AND NOT (rs.id = ANY (v_ids));
  GET DIAGNOSTICS v_n_descartados = ROW_COUNT;

  -- 6. Valoraciones 0..5 solo para alumnos presentes.
  FOR v_item IN SELECT value FROM jsonb_array_elements(COALESCE(p_payload -> 'valoraciones', '[]'::jsonb)) LOOP
    v_alumno := (v_item ->> 'alumno_id')::uuid;
    v_valor := (v_item ->> 'valoracion')::integer;
    IF v_alumno IS NULL OR v_valor IS NULL OR v_valor NOT BETWEEN 0 AND 5 THEN
      RAISE EXCEPTION 'Valoración no válida: debe ser un entero entre 0 y 5' USING ERRCODE = '22023';
    END IF;
    IF NOT (ARRAY[v_alumno] <@ v_presentes) THEN
      RAISE EXCEPTION 'Solo se valora a alumnos presentes o con tardanza (alumno %)', v_alumno USING ERRCODE = 'P0001';
    END IF;
    UPDATE public.asistencias
       SET valoracion = v_valor, valorada_por = v_uid, valorada_at = now(), updated_at = now()
     WHERE sesion_clase_id = v_sesion.id
       AND alumno_id = v_alumno
       AND valoracion IS DISTINCT FROM v_valor;
    v_n_valoraciones := v_n_valoraciones + 1;
  END LOOP;

  -- 7. Sesión: nota original intacta (BR-11), asistencia normalizada y sesión registrada.
  UPDATE public.sesiones_clase s
     SET contenido = COALESCE(p_payload ->> 'contenido', s.contenido),
         asistencia = (
           -- sesiones_clase.asistencia guarda los códigos de la interfaz (P/A/J/T), no las palabras de
           -- asistencias.estado: así lo escribe y lo lee el resto de la app (verificado en producción).
           SELECT COALESCE(jsonb_agg(jsonb_build_object('alumno_id', a.alumno_id, 'estado',
                    CASE a.estado WHEN 'presente' THEN 'P' WHEN 'ausente' THEN 'A' WHEN 'justificado' THEN 'J' WHEN 'tarde' THEN 'T' ELSE a.estado END)
                  ORDER BY a.alumno_id), '[]'::jsonb)
             FROM public.asistencias a
            WHERE a.sesion_clase_id = v_sesion.id
         ),
         borrador = false,
         estado = 'registrada',
         updated_at = now()
   WHERE s.id = v_sesion.id;

  -- 8. Resultado.
  RETURN jsonb_build_object(
    'sesion_id', v_sesion.id,
    'presentes', cardinality(v_presentes),
    'asistencias', v_n_asistencias,
    'registros', v_n_registros,
    'descartados', v_n_descartados,
    'valoraciones', v_n_valoraciones
  );
END;
$$;

REVOKE ALL ON FUNCTION public.cerrar_sesion(jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.cerrar_sesion(jsonb) TO authenticated, service_role;

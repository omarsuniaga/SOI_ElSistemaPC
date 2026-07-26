-- 20260726_notificaciones_respetan_calendario.sql
--
-- Reemplaza el interruptor de receso de los motores de notificación.
--
-- ANTES: ambas funciones abortaban si `system_config.whatsapp_ingest_enabled` valía
-- 'false'. Ese flag gobierna la ingesta de WhatsApp; usarlo como modo vacaciones
-- ataba dos decisiones sin relación: no se podía apagar WhatsApp sin declarar
-- receso, ni declarar receso sin apagar WhatsApp. Además exigía que alguien se
-- acordara de moverlo a mano cada semestre.
--
-- AHORA: ambas consultan fn_es_dia_lectivo(). El calendario decide.
--
-- CORRECCIÓN DE FONDO
-- -------------------
-- Cambiar el guard no bastaba. `generate_pending_class_notifications` cuenta las
-- clases vencidas y pendientes leyendo teacher_class_fill_metrics SIN filtrar por
-- fecha lectiva: acumula toda sesión sin asistencia, haya sido o no un día de
-- clases. Por eso, al reabrir la app tras el receso, aparecían pendientes de días
-- en que nadie tenía que dar clase. Los conteos ahora excluyen los días no lectivos.

BEGIN;

-- ══════════════════════════════════════════════════════════════════════════════
-- 1. Notificación diaria de asistencia pendiente
-- ══════════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.fn_check_and_notify_pending_asistencias()
RETURNS TABLE (notification_count INT)
SET search_path = public
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_maestro_id   UUID;
  v_profile_id   UUID;
  v_ultima_hora_fin TIME;
  v_clases_pendientes RECORD;
  v_deep_link TEXT;
  v_notification_count INT := 0;
  v_current_time TIME;
  v_day_of_week INT;
  v_hoy DATE;
BEGIN
  v_hoy := (NOW() AT TIME ZONE 'America/Santo_Domingo')::DATE;

  -- GUARD DE CALENDARIO LECTIVO
  -- Fuera de período o en día de excepción no se exige registro, así que no se
  -- notifica: el maestro no incumple por una clase que no existió.
  IF NOT public.fn_es_dia_lectivo(v_hoy) THEN
    RAISE NOTICE 'Dia no lectivo (%). Abortando notificaciones.', v_hoy;
    RETURN QUERY SELECT 0::INT;
    RETURN;
  END IF;

  v_current_time := (NOW() AT TIME ZONE 'America/Santo_Domingo')::TIME;
  v_day_of_week  := EXTRACT(ISODOW FROM NOW() AT TIME ZONE 'America/Santo_Domingo');

  -- ISODOW: 1=Monday … 6=Saturday, 7=Sunday
  IF v_day_of_week = 7 THEN
    RETURN QUERY SELECT 0::INT;
    RETURN;
  END IF;

  FOR v_maestro_id, v_profile_id IN
    SELECT DISTINCT m.id, m.user_id
    FROM maestros m
    INNER JOIN horarios h ON h.maestro_id = m.id
    WHERE h.dia_semana = v_day_of_week
      AND h.activo = TRUE
      AND m.activo = TRUE
      AND m.user_id IS NOT NULL
  LOOP
    SELECT MAX(h.hora_fin)
    INTO v_ultima_hora_fin
    FROM horarios h
    WHERE h.maestro_id = v_maestro_id
      AND h.dia_semana = v_day_of_week
      AND h.hora_fin IS NOT NULL
      AND h.activo = TRUE;

    IF v_ultima_hora_fin IS NULL THEN
      CONTINUE;
    END IF;

    IF v_current_time >= (v_ultima_hora_fin + INTERVAL '5 minutes') THEN

      FOR v_clases_pendientes IN
        SELECT
          c.id        AS clase_id,
          c.nombre    AS clase_nombre
        FROM horarios h
        INNER JOIN clases c ON c.id = h.clase_id
        WHERE h.maestro_id = v_maestro_id
          AND h.dia_semana = v_day_of_week
          AND h.activo = TRUE
          AND NOT EXISTS (
            SELECT 1
            FROM asistencias a
            WHERE a.clase_id = c.id
              AND a.fecha = CURRENT_DATE
          )
          AND NOT EXISTS (
            SELECT 1
            FROM notificaciones n
            WHERE n.profile_id = v_profile_id
              AND n.clase_id = c.id
              AND n.created_at > NOW() - INTERVAL '24 hours'
          )
      LOOP
        v_deep_link := '/asistencia/' || v_clases_pendientes.clase_id::TEXT || '/' || CURRENT_DATE::TEXT;

        INSERT INTO notificaciones (
          profile_id, tipo, titulo, mensaje, deep_link, clase_id, estado, created_at
        ) VALUES (
          v_profile_id,
          'sistema',
          'Asistencia Pendiente',
          'Debes llenar la asistencia de ' || v_clases_pendientes.clase_nombre,
          v_deep_link,
          v_clases_pendientes.clase_id,
          'pendiente',
          NOW()
        );

        v_notification_count := v_notification_count + 1;
      END LOOP;

     END IF;
  END LOOP;

  RETURN QUERY SELECT v_notification_count;
END;
$$;

COMMENT ON FUNCTION public.fn_check_and_notify_pending_asistencias IS
  'Notifica asistencias pendientes del dia. Aborta en dias no lectivos segun fn_es_dia_lectivo.';

-- ══════════════════════════════════════════════════════════════════════════════
-- 2. Escalamiento de clases vencidas / pendientes
-- ══════════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.generate_pending_class_notifications()
RETURNS TABLE (
  maestros_processed INT,
  notifications_created INT,
  errors_logged INT
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_maestro_id UUID;
  v_profile_id UUID;
  v_vencida_count INT;
  v_pendiente_count INT;
  v_dedup_key TEXT;
  v_mensaje TEXT;
  v_titulo TEXT;
  v_errors INT := 0;
  v_created INT := 0;
  v_processed INT := 0;
  v_profile_exists BOOLEAN;
BEGIN
  -- GUARD DE CALENDARIO LECTIVO
  IF NOT public.fn_es_dia_lectivo((NOW() AT TIME ZONE 'America/Santo_Domingo')::DATE) THEN
    RAISE NOTICE 'Dia no lectivo. Abortando alertas de escalamiento.';
    RETURN QUERY SELECT 0::INT, 0::INT, 0::INT;
    RETURN;
  END IF;

  -- Solo se consideran maestros con sesiones sin asistencia EN DÍAS LECTIVOS.
  -- Sin este filtro, las sesiones generadas durante un receso quedaban contadas
  -- como deuda del maestro apenas se reanudaba el período.
  FOR v_maestro_id, v_profile_id IN
    SELECT DISTINCT tcfm.maestro_id, m.user_id
    FROM teacher_class_fill_metrics tcfm
    INNER JOIN maestros m ON m.id = tcfm.maestro_id
    WHERE tcfm.asistencia_marked_at IS NULL
      AND m.user_id IS NOT NULL
      AND public.fn_es_dia_lectivo(tcfm.fecha)
  LOOP
    v_processed := v_processed + 1;

    BEGIN
      SELECT EXISTS(SELECT 1 FROM profiles WHERE id = v_profile_id) INTO v_profile_exists;

      IF NOT v_profile_exists THEN
        RAISE EXCEPTION 'Maestro profile does not exist: %', v_profile_id;
      END IF;

      SELECT COUNT(*) INTO v_vencida_count
      FROM teacher_class_fill_metrics
      WHERE maestro_id = v_maestro_id
        AND asistencia_marked_at IS NULL
        AND fecha < CURRENT_DATE - INTERVAL '7 days'
        AND public.fn_es_dia_lectivo(fecha);

      SELECT COUNT(*) INTO v_pendiente_count
      FROM teacher_class_fill_metrics
      WHERE maestro_id = v_maestro_id
        AND asistencia_marked_at IS NULL
        AND fecha >= CURRENT_DATE - INTERVAL '7 days'
        AND public.fn_es_dia_lectivo(fecha);

      IF v_vencida_count > 0 OR v_pendiente_count > 0 THEN
        v_dedup_key := v_maestro_id::TEXT || ':vencidas_pendientes:' || DATE(NOW())::TEXT;

        IF NOT EXISTS (
          SELECT 1 FROM notificaciones
          WHERE dedup_key = v_dedup_key
            AND created_at > NOW() - INTERVAL '24 hours'
        ) THEN
          v_titulo := 'Clases pendientes de asistencia';
          v_mensaje := 'Tienes ' || v_vencida_count || ' clases vencidas, '
                       || v_pendiente_count || ' pendientes';

          INSERT INTO notificaciones (
            profile_id, tipo, titulo, mensaje, deep_link, estado, dedup_key, leida_en
          ) VALUES (
            v_profile_id, 'sistema', v_titulo, v_mensaje,
            '/portal/notificaciones', 'pendiente', v_dedup_key, NULL
          );

          v_created := v_created + 1;
        END IF;
      END IF;

    EXCEPTION WHEN OTHERS THEN
      INSERT INTO notification_trigger_logs (
        execution_time, status, error_message, context
      ) VALUES (
        NOW(), 'ERROR', SQLERRM,
        'maestro_id=' || v_maestro_id::TEXT || ', profile_id=' || v_profile_id::TEXT
      );
      v_errors := v_errors + 1;
    END;
  END LOOP;

  INSERT INTO notification_trigger_logs (
    execution_time, status, maestros_processed, notifications_created, errors_count
  ) VALUES (
    NOW(), 'SUCCESS', v_processed, v_created, v_errors
  );

  RETURN QUERY SELECT v_processed, v_created, v_errors;
END;
$$;

COMMENT ON FUNCTION public.generate_pending_class_notifications IS
  'Escala clases vencidas/pendientes. Excluye los dias no lectivos del conteo: una sesion en receso no es deuda del maestro.';

COMMIT;

-- ============================================================================
-- Migration: Receso Académico Guards (Modo Vacaciones) - CORREGIDO
-- Timestamp: 20260714_receso_academico_guards
-- Project: sistema-academico-pwa
-- Description: Inyecta guards a nivel de base de datos en las funciones de
--   notificación y alertas de asistencia. Cuando system_config.whatsapp_ingest_enabled
--   es 'false' (Modo Receso), las funciones abortan inmediatamente para
--   no penalizar ni spamear a los maestros en vacaciones.
-- Correcciones de auditoría:
--   - Vinculación correcta de IDs entre teacher_class_fill_metrics (maestro_id) y profiles (user_id).
--   - Ajuste de huso horario a America/Santo_Domingo (UTC-4) para El Sistema Punta Cana.
-- ============================================================================

BEGIN;

-- 1. Guard en fn_check_and_notify_pending_asistencias
CREATE OR REPLACE FUNCTION public.fn_check_and_notify_pending_asistencias()
RETURNS TABLE (notification_count INT)
SET search_path = public
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_maestro_id   UUID;  -- maestros.id
  v_profile_id   UUID;  -- profiles.id (notification recipient)
  v_ultima_hora_fin TIME;
  v_clases_pendientes RECORD;
  v_deep_link TEXT;
  v_notification_count INT := 0;
  v_current_time TIME;
  v_day_of_week INT;
BEGIN
  -- GUARD DE RECESO ACADÉMICO / VACACIONES
  IF EXISTS (
    SELECT 1 FROM public.system_config 
    WHERE key = 'whatsapp_ingest_enabled' AND value = 'false'
  ) THEN
    RAISE NOTICE 'Receso académico activo (whatsapp_ingest_enabled = false). Abortando notificaciones.';
    RETURN QUERY SELECT 0::INT;
    RETURN;
  END IF;

  -- Get current time and day in Santo Domingo timezone (UTC-4)
  v_current_time := (NOW() AT TIME ZONE 'America/Santo_Domingo')::TIME;
  v_day_of_week  := EXTRACT(ISODOW FROM NOW() AT TIME ZONE 'America/Santo_Domingo');

  -- ISODOW: 1=Monday … 6=Saturday, 7=Sunday
  -- Skip Sundays — no classes
  IF v_day_of_week = 7 THEN
    RETURN QUERY SELECT 0::INT;
    RETURN;
  END IF;

  -- Iterate maestros who have at least one horario scheduled for today
  FOR v_maestro_id, v_profile_id IN
    SELECT DISTINCT m.id, m.user_id
    FROM maestros m
    INNER JOIN horarios h ON h.maestro_id = m.id
    WHERE h.dia_semana = v_day_of_week
      AND h.activo = TRUE
      AND m.activo = TRUE
      AND m.user_id IS NOT NULL
  LOOP
    -- Last class end time for this maestro today
    SELECT MAX(h.hora_fin)
    INTO v_ultima_hora_fin
    FROM horarios h
    WHERE h.maestro_id = v_maestro_id
      AND h.dia_semana = v_day_of_week
      AND h.hora_fin IS NOT NULL
      AND h.activo = TRUE;

    -- Skip if no end time found
    IF v_ultima_hora_fin IS NULL THEN
      CONTINUE;
    END IF;

    -- Only notify once the workday has ended (5-min buffer)
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
          -- "pending" = no attendance row recorded for this class today
          AND NOT EXISTS (
            SELECT 1
            FROM asistencias a
            WHERE a.clase_id = c.id
              AND a.fecha = CURRENT_DATE
          )
          -- Dedup: skip if we already sent a notification in the last 24 hours
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
          profile_id,
          tipo,
          titulo,
          mensaje,
          deep_link,
          clase_id,
          estado,
          created_at
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

-- 2. Guard en generate_pending_class_notifications (Mapeo de IDs corregido)
CREATE OR REPLACE FUNCTION public.generate_pending_class_notifications()
RETURNS TABLE (
  maestros_processed INT,
  notifications_created INT,
  errors_logged INT
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_maestro_id UUID;   -- ID de la tabla maestros
  v_profile_id UUID;   -- ID de la tabla profiles (user_id del maestro)
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
  -- GUARD DE RECESO ACADÉMICO / VACACIONES
  IF EXISTS (
    SELECT 1 FROM public.system_config 
    WHERE key = 'whatsapp_ingest_enabled' AND value = 'false'
  ) THEN
    RAISE NOTICE 'Receso académico activo (whatsapp_ingest_enabled = false). Abortando alertas de escalamiento.';
    RETURN QUERY SELECT 0::INT, 0::INT, 0::INT;
    RETURN;
  END IF;

  -- Process each maestro with unfilled (vencida/pendiente) classes.
  -- Obtenemos el maestro_id para las consultas de métricas y el user_id para las notificaciones.
  FOR v_maestro_id, v_profile_id IN
    SELECT DISTINCT tcfm.maestro_id, m.user_id
    FROM teacher_class_fill_metrics tcfm
    INNER JOIN maestros m ON m.id = tcfm.maestro_id
    WHERE tcfm.asistencia_marked_at IS NULL
      AND m.user_id IS NOT NULL
  LOOP
    v_processed := v_processed + 1;

    BEGIN
      -- Verify maestro profile exists usando el ID de perfil correcto
      SELECT EXISTS(SELECT 1 FROM profiles WHERE id = v_profile_id) INTO v_profile_exists;

      IF NOT v_profile_exists THEN
        RAISE EXCEPTION 'Maestro profile does not exist: %', v_profile_id;
      END IF;

      -- Count vencida classes (>7 days old without attendance)
      SELECT COUNT(*) INTO v_vencida_count
      FROM teacher_class_fill_metrics
      WHERE maestro_id = v_maestro_id
        AND asistencia_marked_at IS NULL
        AND fecha < CURRENT_DATE - INTERVAL '7 days';

      -- Count pendiente classes (recent, without attendance)
      SELECT COUNT(*) INTO v_pendiente_count
      FROM teacher_class_fill_metrics
      WHERE maestro_id = v_maestro_id
        AND asistencia_marked_at IS NULL
        AND fecha >= CURRENT_DATE - INTERVAL '7 days';

      -- Only create notification if there are vencida or pendiente classes
      IF v_vencida_count > 0 OR v_pendiente_count > 0 THEN
        -- Generate dedup key: maestro_id:vencidas_pendientes:YYYY-MM-DD
        v_dedup_key := v_maestro_id::TEXT || ':vencidas_pendientes:' || DATE(NOW())::TEXT;

        -- Check if notification already exists within 24h
        IF NOT EXISTS (
          SELECT 1 FROM notificaciones
          WHERE dedup_key = v_dedup_key
            AND created_at > NOW() - INTERVAL '24 hours'
        ) THEN
          -- Build title and message
          v_titulo := 'Clases pendientes de asistencia';
          v_mensaje := 'Tienes ' || v_vencida_count || ' clases vencidas, '
                       || v_pendiente_count || ' pendientes';

          -- Insert notification usando v_profile_id
          INSERT INTO notificaciones (
            profile_id,
            tipo,
            titulo,
            mensaje,
            deep_link,
            estado,
            dedup_key,
            leida_en
          ) VALUES (
            v_profile_id,
            'sistema',
            v_titulo,
            v_mensaje,
            '/portal/notificaciones',
            'pendiente',
            v_dedup_key,
            NULL
          );

          v_created := v_created + 1;
        END IF;
      END IF;

    EXCEPTION WHEN OTHERS THEN
      -- Log error without interrupting loop
      INSERT INTO notification_trigger_logs (
        execution_time,
        status,
        error_message,
        context
      ) VALUES (
        NOW(),
        'ERROR',
        SQLERRM,
        'maestro_id=' || v_maestro_id::TEXT || ', profile_id=' || v_profile_id::TEXT
      );
      v_errors := v_errors + 1;
    END;
  END LOOP;

  -- Log successful execution
  INSERT INTO notification_trigger_logs (
    execution_time,
    status,
    maestros_processed,
    notifications_created,
    errors_count
  ) VALUES (
    NOW(),
    'SUCCESS',
    v_processed,
    v_created,
    v_errors
  );

  -- Return summary
  RETURN QUERY SELECT v_processed, v_created, v_errors;
END;
$$;

COMMIT;

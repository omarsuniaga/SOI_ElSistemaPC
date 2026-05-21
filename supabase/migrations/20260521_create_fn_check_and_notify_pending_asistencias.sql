-- Function to check pending asistencias and send notifications after workday ends
-- Schema-aligned version:
--   horarios.dia_semana  = INTEGER (ISODOW 1-7), compared directly
--   horarios.maestro_id  -> maestros(id)  (proper FK)
--   maestros.user_id     -> profiles(id)  (notification recipient)
--   asistencias.estado valid values: 'presente','ausente','tarde','justificado'
--     "pending" = no asistencias row exists for that class+date (a.id IS NULL)
--   notificaciones.estado valid values: 'pendiente','enviada','leida','fallida'
--   notificaciones.clase_id  EXISTS (added by Task 1 migration)
CREATE OR REPLACE FUNCTION fn_check_and_notify_pending_asistencias()
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
  -- Get current time and day in Buenos Aires timezone
  v_current_time := (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::TIME;
  v_day_of_week  := EXTRACT(ISODOW FROM NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires');

  -- ISODOW: 1=Monday … 6=Saturday, 7=Sunday
  -- Skip Sundays — no classes
  IF v_day_of_week = 7 THEN
    RETURN QUERY SELECT 0::INT;
    RETURN;
  END IF;

  -- Iterate maestros who have at least one horario scheduled for today
  -- horarios.maestro_id -> maestros(id), horarios.dia_semana is INTEGER
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

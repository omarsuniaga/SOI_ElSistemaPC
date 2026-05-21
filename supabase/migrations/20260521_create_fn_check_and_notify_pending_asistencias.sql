-- Function to check pending asistencias and send notifications after workday ends
CREATE OR REPLACE FUNCTION fn_check_and_notify_pending_asistencias()
RETURNS TABLE (notification_count INT) AS $$
DECLARE
  v_maestro_id UUID;
  v_ultima_hora_fin TIME;
  v_clases_pendientes RECORD;
  v_deep_link TEXT;
  v_notification_count INT := 0;
  v_current_time TIME;
  v_day_of_week INT;
BEGIN
  -- Get current time in Buenos Aires timezone
  v_current_time := NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires'::TEXT;
  v_day_of_week := EXTRACT(ISODOW FROM NOW());

  -- Determine if we should run today
  -- ISODOW: 1=Monday, ..., 5=Friday, 6=Saturday, 7=Sunday
  -- Run on weekdays (1-5) AND Saturdays (6) — skip Sundays (7)
  IF v_day_of_week = 7 THEN
    RETURN QUERY SELECT 0::INT;
    RETURN;
  END IF;

  -- Iterate through maestros who have classes today
  FOR v_maestro_id IN
    SELECT DISTINCT m.id
    FROM profiles m
    INNER JOIN clases c ON c.maestro_id = m.id
    INNER JOIN horarios h ON h.clase_id = c.id
    WHERE h.dia_semana = CASE
                          WHEN v_day_of_week = 6 THEN 'sabado'::TEXT
                          WHEN v_day_of_week = 5 THEN 'viernes'::TEXT
                          WHEN v_day_of_week = 4 THEN 'jueves'::TEXT
                          WHEN v_day_of_week = 3 THEN 'miercoles'::TEXT
                          WHEN v_day_of_week = 2 THEN 'martes'::TEXT
                          WHEN v_day_of_week = 1 THEN 'lunes'::TEXT
                        END
    AND m.rol = 'maestro'
    AND m.activo = TRUE
  LOOP
    -- Get the last class end time for this maestro today
    SELECT MAX(h.hora_fin)::TIME
    INTO v_ultima_hora_fin
    FROM horarios h
    INNER JOIN clases c ON c.id = h.clase_id
    WHERE c.maestro_id = v_maestro_id
    AND h.dia_semana = CASE
                        WHEN v_day_of_week = 6 THEN 'sabado'::TEXT
                        WHEN v_day_of_week = 5 THEN 'viernes'::TEXT
                        WHEN v_day_of_week = 4 THEN 'jueves'::TEXT
                        WHEN v_day_of_week = 3 THEN 'miercoles'::TEXT
                        WHEN v_day_of_week = 2 THEN 'martes'::TEXT
                        WHEN v_day_of_week = 1 THEN 'lunes'::TEXT
                      END
    AND h.hora_inicio IS NOT NULL
    AND h.hora_fin IS NOT NULL;

    -- Check if current time >= last class end time (allow 5 min buffer)
    IF v_ultima_hora_fin IS NULL THEN
      CONTINUE; -- No classes found, skip
    END IF;

    IF v_current_time >= (v_ultima_hora_fin + INTERVAL '5 minutes') THEN
      -- Maestro's workday is over. Create notifications for each pending class today.
      FOR v_clases_pendientes IN
        SELECT c.id, c.nombre, CURRENT_DATE::TEXT AS fecha
        FROM clases c
        INNER JOIN horarios h ON h.clase_id = c.id
        LEFT JOIN asistencias a ON a.clase_id = c.id AND a.fecha = CURRENT_DATE
        WHERE c.maestro_id = v_maestro_id
        AND h.dia_semana = CASE
                            WHEN v_day_of_week = 6 THEN 'sabado'::TEXT
                            WHEN v_day_of_week = 5 THEN 'viernes'::TEXT
                            WHEN v_day_of_week = 4 THEN 'jueves'::TEXT
                            WHEN v_day_of_week = 3 THEN 'miercoles'::TEXT
                            WHEN v_day_of_week = 2 THEN 'martes'::TEXT
                            WHEN v_day_of_week = 1 THEN 'lunes'::TEXT
                          END
        AND (a.id IS NULL OR a.estado = 'draft') -- No record or draft = pending
        AND NOT EXISTS ( -- Dedup: no notification in last 24 hours
          SELECT 1 FROM notificaciones n
          WHERE n.profile_id = v_maestro_id
          AND n.clase_id = c.id
          AND n.created_at > NOW() - INTERVAL '24 hours'
        )
      LOOP
        v_deep_link := '/asistencia/' || v_clases_pendientes.id::TEXT || '/' || v_clases_pendientes.fecha;

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
          v_maestro_id,
          'sistema',
          'Asistencia Pendiente',
          'Debes llenar la asistencia de ' || v_clases_pendientes.nombre,
          v_deep_link,
          v_clases_pendientes.id,
          'pendiente',
          NOW()
        );

        v_notification_count := v_notification_count + 1;
      END LOOP;
    END IF;
  END LOOP;

  RETURN QUERY SELECT v_notification_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

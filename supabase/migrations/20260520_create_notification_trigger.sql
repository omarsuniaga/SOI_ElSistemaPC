-- Migration: Create notification trigger infrastructure
-- Purpose: Setup logging table and PL/pgSQL function for automatic notification generation
-- Date: 2026-05-20

CREATE TABLE IF NOT EXISTS notification_trigger_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_time TIMESTAMP DEFAULT NOW(),
  status TEXT NOT NULL,
  maestros_processed INT,
  notifications_created INT,
  errors_count INT,
  error_message TEXT,
  context TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notification_trigger_logs_execution_time
ON notification_trigger_logs(execution_time DESC);

CREATE OR REPLACE FUNCTION generate_pending_class_notifications()
RETURNS TABLE (
  maestros_processed INT,
  notifications_created INT,
  errors_logged INT
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_maestro_id UUID;
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
  -- Process each maestro with unfilled (vencida/pendiente) classes
  FOR v_maestro_id IN
    SELECT DISTINCT maestro_id
    FROM teacher_class_fill_metrics
    WHERE asistencia_marked_at IS NULL
  LOOP
    v_processed := v_processed + 1;

    BEGIN
      -- Verify maestro profile exists
      SELECT EXISTS(SELECT 1 FROM profiles WHERE id = v_maestro_id) INTO v_profile_exists;

      IF NOT v_profile_exists THEN
        RAISE EXCEPTION 'Maestro profile does not exist: %', v_maestro_id;
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

        -- Check if notification already exists within 24h (dedup check)
        IF NOT EXISTS (
          SELECT 1 FROM notificaciones
          WHERE dedup_key = v_dedup_key
            AND created_at > NOW() - INTERVAL '24 hours'
        ) THEN
          -- Build title and message
          v_titulo := 'Clases pendientes de asistencia';
          v_mensaje := 'Tienes ' || v_vencida_count || ' clases vencidas, '
                       || v_pendiente_count || ' pendientes';

          -- Insert notification
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
            v_maestro_id,
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
        'maestro_id=' || v_maestro_id::TEXT
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

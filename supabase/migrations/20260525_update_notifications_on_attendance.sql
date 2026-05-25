-- Migration: Update notifications on attendance change
-- Date: 2026-05-25
-- Purpose: Automatically recalculate or resolve pending attendance notifications 
--          when a maestro registers attendance for a class.

CREATE OR REPLACE FUNCTION public.fn_update_notifications_on_attendance_change()
RETURNS TRIGGER AS $$
DECLARE
  v_vencida_count INT;
  v_pendiente_count INT;
  v_dedup_key TEXT;
  v_mensaje TEXT;
  v_user_has_notif BOOLEAN;
BEGIN
  -- We only act if the state changed to 'registrada' (attendance registered)
  IF (TG_OP = 'UPDATE' AND OLD.estado IS DISTINCT FROM NEW.estado AND NEW.estado = 'registrada')
     OR (TG_OP = 'INSERT' AND NEW.estado = 'registrada') THEN

    -- 1. Check if there's an active pending notification for this teacher today
    -- dedup_key format: maestro_id:vencidas_pendientes:YYYY-MM-DD
    v_dedup_key := NEW.maestro_id::TEXT || ':vencidas_pendientes:' || DATE(NOW())::TEXT;

    SELECT EXISTS (
      SELECT 1 FROM public.notificaciones
      WHERE profile_id = NEW.maestro_id
        AND tipo = 'sistema'
        AND (dedup_key = v_dedup_key OR dedup_key = NEW.maestro_id::TEXT || ':vencidas_pendientes:' || DATE(NEW.fecha)::TEXT)
        AND estado = 'pendiente'
    ) INTO v_user_has_notif;

    IF v_user_has_notif THEN
      -- 2. Recalculate counts
      SELECT COUNT(*) INTO v_vencida_count
      FROM public.teacher_class_fill_metrics
      WHERE maestro_id = NEW.maestro_id
        AND asistencia_marked_at IS NULL
        AND fecha < CURRENT_DATE - INTERVAL '7 days';

      SELECT COUNT(*) INTO v_pendiente_count
      FROM public.teacher_class_fill_metrics
      WHERE maestro_id = NEW.maestro_id
        AND asistencia_marked_at IS NULL
        AND fecha >= CURRENT_DATE - INTERVAL '7 days';

      -- 3. If there are still pending classes, update the notification text
      IF v_vencida_count > 0 OR v_pendiente_count > 0 THEN
        v_mensaje := 'Tienes ' || v_vencida_count || ' clases vencidas, '
                     || v_pendiente_count || ' pendientes';
        
        UPDATE public.notificaciones
        SET mensaje = v_mensaje,
            created_at = NOW()
        WHERE profile_id = NEW.maestro_id
          AND (dedup_key = v_dedup_key OR dedup_key = NEW.maestro_id::TEXT || ':vencidas_pendientes:' || DATE(NEW.fecha)::TEXT)
          AND estado = 'pendiente';
      ELSE
        -- 4. If no more pending classes, auto-mark as read
        UPDATE public.notificaciones
        SET estado = 'leida',
            leida_en = NOW()
        WHERE profile_id = NEW.maestro_id
          AND (dedup_key = v_dedup_key OR dedup_key = NEW.maestro_id::TEXT || ':vencidas_pendientes:' || DATE(NEW.fecha)::TEXT)
          AND estado = 'pendiente';
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS trg_update_notifications_on_attendance ON public.sesiones_clase;
CREATE TRIGGER trg_update_notifications_on_attendance
  AFTER INSERT OR UPDATE ON public.sesiones_clase
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_update_notifications_on_attendance_change();

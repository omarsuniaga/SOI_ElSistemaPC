-- Recordatorio de inicio de clase (push server-driven, funciona con la app cerrada/teléfono bloqueado).
-- El pipeline notificaciones -> trigger on_notification_inserted -> send-push (VAPID/Web Push) ya
-- funciona de forma independiente de que la PWA esté abierta (usado hoy para "asistencia pendiente").
-- Lo único que faltaba era el disparador de "tu clase empieza en N minutos"; esta migración agrega
-- esa función y su cron, reutilizando el pipeline existente sin tocar infraestructura de push.

-- 1. Permitir el nuevo tipo de notificación 'recordatorio_clase' junto a los ya existentes.
ALTER TABLE public.notificaciones DROP CONSTRAINT IF EXISTS notificaciones_tipo_check;
ALTER TABLE public.notificaciones ADD CONSTRAINT notificaciones_tipo_check
  CHECK (tipo = ANY (ARRAY['in_app'::text, 'push'::text, 'email'::text, 'sistema'::text, 'recordatorio_clase'::text]));

-- 2. Función que evalúa horarios próximos a iniciar y crea la notificación correspondiente.
--    Dedup por dedup_key (profile+clase+día) para que corridas repetidas del cron no dupliquen.
--    Respeta preferencias del maestro (push_activo, alerta_pre_clase, recordatorios_activos) y
--    el calendario académico (fn_es_dia_lectivo), igual que las funciones de notificaciones existentes.
CREATE OR REPLACE FUNCTION public.fn_generate_class_start_reminders()
RETURNS TABLE(notifications_created integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_hoy DATE;
  v_day_of_week INT;
  v_now_time TIME;
  v_rec RECORD;
  v_deep_link TEXT;
  v_dedup_key TEXT;
  v_created INT := 0;
BEGIN
  v_hoy := (NOW() AT TIME ZONE 'America/Santo_Domingo')::DATE;

  IF NOT public.fn_es_dia_lectivo(v_hoy) THEN
    RETURN QUERY SELECT 0::INT;
    RETURN;
  END IF;

  v_now_time := (NOW() AT TIME ZONE 'America/Santo_Domingo')::TIME;
  v_day_of_week := EXTRACT(ISODOW FROM NOW() AT TIME ZONE 'America/Santo_Domingo');

  FOR v_rec IN
    SELECT
      h.clase_id,
      c.nombre AS clase_nombre,
      h.hora_inicio,
      m.user_id AS profile_id
    FROM horarios h
    INNER JOIN clases c ON c.id = h.clase_id
    INNER JOIN maestros m ON m.id = h.maestro_id
    INNER JOIN configuracion_recordatorios cr ON cr.profile_id = m.user_id
    WHERE h.dia_semana = v_day_of_week
      AND h.activo = TRUE
      AND c.activo = TRUE
      AND c.estado = 'activa'
      AND m.activo = TRUE
      AND m.user_id IS NOT NULL
      AND cr.recordatorios_activos = TRUE
      AND cr.alerta_pre_clase = TRUE
      AND cr.push_activo = TRUE
      -- Comparación por timestamp completo (fecha + hora), no por TIME puro: la
      -- aritmética de TIME en Postgres da módulo 24h y produce un rango vacío para
      -- clases que inician en los últimos minutos antes de medianoche.
      AND (v_hoy + h.hora_inicio) > (v_hoy + v_now_time)
      AND (v_hoy + h.hora_inicio) <= (v_hoy + v_now_time) + (COALESCE(cr.min_antes_clase, 15) || ' minutes')::INTERVAL
  LOOP
    -- Incluye hora_inicio: una misma clase puede tener más de un horario (fila en
    -- `horarios`) el mismo día (ej. sesión de mañana y de tarde), y cada uno necesita
    -- su propio recordatorio en vez de que el segundo quede bloqueado por el dedup del primero.
    v_dedup_key := v_rec.profile_id::TEXT || ':recordatorio_clase:' || v_rec.clase_id::TEXT
      || ':' || v_rec.hora_inicio::TEXT || ':' || v_hoy::TEXT;

    IF NOT EXISTS (SELECT 1 FROM notificaciones WHERE dedup_key = v_dedup_key) THEN
      -- Formato de deep_link consistente con el resto del sistema (check_deep_link_format
      -- no admite query strings); el hash-route con querystring se arma en el cliente
      -- (resolveNotificationUrl en sw.js) a partir de data.tipo + data.clase_id.
      v_deep_link := '/asistencia/' || v_rec.clase_id::TEXT || '/' || v_hoy::TEXT;

      INSERT INTO notificaciones (
        profile_id, tipo, titulo, mensaje, deep_link, clase_id, estado, dedup_key, created_at
      ) VALUES (
        v_rec.profile_id, 'recordatorio_clase',
        'Tu clase empieza pronto',
        v_rec.clase_nombre || ' inicia a las ' || to_char(v_rec.hora_inicio, 'HH24:MI') || '.',
        v_deep_link, v_rec.clase_id, 'pendiente', v_dedup_key, NOW()
      );

      v_created := v_created + 1;
    END IF;
  END LOOP;

  RETURN QUERY SELECT v_created;
END;
$function$;

-- 3. Cron cada 2 minutos (misma cadencia que telegram-ingest-poll, ya probada en este
--    proyecto). NOTA: con esta cadencia, min_antes_clase debe ser >= 2 para garantizar que
--    alguna corrida caiga dentro de la ventana [hora_inicio - min_antes_clase, hora_inicio).
--    El valor por defecto de configuracion_recordatorios.min_antes_clase es 15, muy por
--    encima del mínimo, dejando margen ante jitter del cron.
SELECT cron.unschedule('class-start-reminders-cron') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'class-start-reminders-cron'
);

SELECT cron.schedule(
  'class-start-reminders-cron',
  '*/2 * * * *',
  $$SELECT fn_generate_class_start_reminders();$$
);

-- Fix class notifications: replace bulk "33 clases vencidas" with per-session notifications
-- Each unregistered session in the last 14 days gets its own notification
-- dedup_key prevents duplicates across pg_cron runs

-- 1. Remove stale bulk notifications
DELETE FROM public.notificaciones
WHERE tipo = 'sistema'
  AND titulo ILIKE '%clases pendientes%';

-- 2. Replace the pg_cron function with per-session logic
CREATE OR REPLACE FUNCTION public.generate_pending_class_notifications()
RETURNS void AS $$
DECLARE
  v_rec RECORD;
  v_dedup_key TEXT;
  v_fecha_fmt TEXT;
BEGIN
  -- One notification per unregistered session in the last 14 days
  FOR v_rec IN
    SELECT
      m.sesion_id,
      m.clase_id,
      m.maestro_id,
      m.fecha,
      m.hora_inicio,
      c.nombre AS clase_nombre,
      -- resolve profile_id from maestros
      ma.user_id AS profile_id
    FROM teacher_class_fill_metrics m
    JOIN clases c ON c.id = m.clase_id
    JOIN maestros ma ON ma.id = m.maestro_id
    WHERE m.asistencia_marked_at IS NULL
      AND m.fecha >= CURRENT_DATE - INTERVAL '14 days'
      AND m.fecha <  CURRENT_DATE          -- today excluded: still time to register
  LOOP
    v_dedup_key := v_rec.maestro_id::text
                   || ':sesion_sin_registrar:'
                   || v_rec.clase_id::text
                   || ':'
                   || v_rec.fecha::text;

    v_fecha_fmt := TO_CHAR(v_rec.fecha, 'DD/MM/YYYY');

    INSERT INTO public.notificaciones
      (profile_id, tipo, titulo, mensaje, deep_link, estado, dedup_key)
    VALUES (
      v_rec.profile_id,
      'sistema',
      'Sesión sin registrar: ' || v_rec.clase_nombre,
      'La clase del ' || v_fecha_fmt || ' (' || v_rec.hora_inicio::text || ') no tiene asistencia registrada.',
      '/maestro/hoy',
      'no_leida',
      v_dedup_key
    )
    ON CONFLICT (dedup_key) DO NOTHING;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

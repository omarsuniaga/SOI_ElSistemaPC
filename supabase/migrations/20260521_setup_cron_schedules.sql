-- Enable pg_cron extension (usually already enabled in Supabase)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule for 7:00 PM (19:00) on weekdays (Mon-Fri)
-- Cron format: minute hour day month day_of_week
-- 0 19 * * 1-5 = 19:00 on Monday(1) through Friday(5)
SELECT cron.schedule(
  'notify_pending_asistencias_weekdays',
  '0 19 * * 1-5',
  'SELECT fn_check_and_notify_pending_asistencias();'
);

-- Schedule for 1:00 PM (13:00) on Saturdays
-- 0 13 * * 6 = 13:00 on Saturday(6)
SELECT cron.schedule(
  'notify_pending_asistencias_saturday',
  '0 13 * * 6',
  'SELECT fn_check_and_notify_pending_asistencias();'
);

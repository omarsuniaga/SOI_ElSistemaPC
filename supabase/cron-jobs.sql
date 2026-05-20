-- Supabase Cron Jobs for Notification Trigger
-- Date: 2026-05-20
-- Reference: https://supabase.com/docs/guides/database/postgres/extensions/pg_cron
--
-- These jobs automatically generate notifications for maestros with vencida/pendiente classes
-- Three trigger points daily:
-- - 9:00 AM (ES): Morning check after overnight
-- - 3:15 PM (ES): Critical timing - 15 minutes before 3:30 PM classes start
-- - 8:45 PM (ES): Evening wind-down check
--
-- Each job calls generate_pending_class_notifications() which:
-- 1. Queries teacher_class_fill_metrics VIEW for unfilled classes
-- 2. Counts vencida (>7 days old) and pendiente (recent) classes per maestro
-- 3. Checks dedup_key for 24h window to avoid duplicate notifications
-- 4. Inserts aggregated notification if new or >24h since last notification
-- 5. Logs execution results to notification_trigger_logs table

-- Job 1: Morning check (9:00 AM ES time)
-- Schedule: "0 9 * * *" (daily at 9 AM)
SELECT cron.schedule(
  'generate-pending-notifs-9am',
  '0 9 * * *',
  'SELECT generate_pending_class_notifications()'
);

-- Job 2: Afternoon check (3:15 PM ES time) - CRITICAL for 3:30 PM class attendance
-- Schedule: "15 15 * * *" (daily at 3:15 PM)
SELECT cron.schedule(
  'generate-pending-notifs-3:15pm',
  '15 15 * * *',
  'SELECT generate_pending_class_notifications()'
);

-- Job 3: Evening check (8:45 PM ES time)
-- Schedule: "45 20 * * *" (daily at 8:45 PM)
SELECT cron.schedule(
  'generate-pending-notifs-8:45pm',
  '45 20 * * *',
  'SELECT generate_pending_class_notifications()'
);

-- Verify jobs are scheduled
-- Run this query to check that all 3 jobs exist:
-- SELECT jobid, jobname, schedule, command FROM cron.job
-- WHERE jobname LIKE 'generate-pending-notifs-%';

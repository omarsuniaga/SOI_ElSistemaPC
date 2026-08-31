-- Migration: 20260827210000_soi_enrollment_calendar_and_cron.sql
-- Module: M5 (Admin Portal Calendar & Morning Briefing) & M6 (Retention Reminders)
-- Spec: /home/omedsunriv/docs/srs/srs-enrollment-funnel.md (FR-04, FR-05)

-- ---------------------------------------------------------------------------
-- 1. View for Admin Portal Calendar
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.vw_admin_enrollment_calendar AS
SELECT 
    apt.id AS appointment_id,
    apt.scheduled_datetime,
    apt.status AS appointment_status,
    apt.notes,
    app.id AS applicant_id,
    app.full_name AS applicant_name,
    app.phone_number,
    app.email,
    app.utm_source,
    app.status AS applicant_status,
    apt.created_at AS appointment_created_at
FROM public.appointments apt
JOIN public.applicants app ON apt.applicant_id = app.id
WHERE apt.status IN ('CONFIRMED', 'RESERVED_PENDING');

-- Permissions on the view
GRANT SELECT ON public.vw_admin_enrollment_calendar TO authenticated;
GRANT SELECT ON public.vw_admin_enrollment_calendar TO service_role;

-- ---------------------------------------------------------------------------
-- 2. Morning Admissions Briefing Function (8:00 AM Daily)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_morning_admissions_briefing()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    today_start timestamptz := date_trunc('day', now() AT TIME ZONE 'America/Santo_Domingo') AT TIME ZONE 'America/Santo_Domingo';
    today_end   timestamptz := today_start + interval '1 day';
    r RECORD;
    agenda_text text := '';
    total_count integer := 0;
    coordinator_jid text;
BEGIN
    -- Build agenda list
    FOR r IN (
        SELECT 
            app.full_name,
            app.phone_number,
            to_char(apt.scheduled_datetime AT TIME ZONE 'America/Santo_Domingo', 'HH12:MI AM') as hora
        FROM public.appointments apt
        JOIN public.applicants app ON apt.applicant_id = app.id
        WHERE apt.status = 'CONFIRMED'
          AND apt.scheduled_datetime >= today_start
          AND apt.scheduled_datetime < today_end
        ORDER BY apt.scheduled_datetime ASC
    ) LOOP
        total_count := total_count + 1;
        agenda_text := agenda_text || chr(10) || '• ' || r.hora || ' - ' || r.full_name || ' (Tel: ' || r.phone_number || ')';
    END LOOP;

    IF total_count > 0 THEN
        agenda_text := '📋 *AGENDA DE ENTREVISTAS DE HOY (' || to_char(today_start, 'DD/MM/YYYY') || ')*' || chr(10) ||
                       'Total citados: ' || total_count || chr(10) || agenda_text || chr(10) || chr(10) ||
                       '¡Éxitos en la jornada de inscripciones!';
    ELSE
        agenda_text := '📋 *AGENDA DE ENTREVISTAS DE HOY (' || to_char(today_start, 'DD/MM/YYYY') || ')*' || chr(10) ||
                       'No hay citas agendadas para el día de hoy.';
    END IF;

    -- Look up coordinator phone from system_config if available
    SELECT value INTO coordinator_jid FROM public.system_config WHERE key = 'admission_coordinator_jid' LIMIT 1;
    
    IF coordinator_jid IS NOT NULL AND coordinator_jid <> '' THEN
        INSERT INTO public.hermes_whatsapp_queue (jid, mensaje, estado)
        VALUES (coordinator_jid, agenda_text, 'pendiente');
    END IF;

    RETURN agenda_text;
END;
$$;

-- ---------------------------------------------------------------------------
-- 3. Automated Reminder Dispatcher (T-24h and T-2h)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_dispatch_enrollment_reminders()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    r RECORD;
    dispatched_count integer := 0;
    clean_phone text;
    user_jid text;
    msg text;
BEGIN
    -- Find confirmed appointments within the next 24 to 25 hours (D-1 reminder)
    FOR r IN (
        SELECT 
            apt.id as appointment_id,
            app.id as applicant_id,
            app.full_name,
            app.phone_number,
            to_char(apt.scheduled_datetime AT TIME ZONE 'America/Santo_Domingo', 'DD/MM a las HH12:MI AM') as fecha_fmt
        FROM public.appointments apt
        JOIN public.applicants app ON apt.applicant_id = app.id
        WHERE apt.status = 'CONFIRMED'
          AND apt.scheduled_datetime >= (now() + interval '23 hours 45 minutes')
          AND apt.scheduled_datetime <= (now() + interval '24 hours 45 minutes')
          AND NOT EXISTS (
              SELECT 1 FROM public.applicant_events 
              WHERE applicant_id = app.id AND event_name = 'REMINDER_24H_SENT'
          )
    ) LOOP
        clean_phone := regexp_replace(r.phone_number, '\D', '', 'g');
        IF length(clean_phone) >= 10 THEN
            user_jid := clean_phone || '@s.whatsapp.net';
            msg := '👋 ¡Hola ' || r.full_name || '! Te recordamos que mañana tienes tu cita de inscripción en El Sistema Punta Cana:' || chr(10) ||
                   '📅 *' || r.fecha_fmt || '*' || chr(10) || chr(10) ||
                   '📍 Lugar: Sede El Sistema Punta Cana' || chr(10) ||
                   '📄 *Documentos a presentar:*' || chr(10) ||
                   '1. Copia del acta de nacimiento del niño/a.' || chr(10) ||
                   '2. Copia de cédula del representante.' || chr(10) ||
                   '3. 2 fotos 2x2.' || chr(10) || chr(10) ||
                   '¡Te esperamos puntual!';

            INSERT INTO public.hermes_whatsapp_queue (jid, mensaje, estado)
            VALUES (user_jid, msg, 'pendiente');

            INSERT INTO public.applicant_events (applicant_id, event_name, payload)
            VALUES (r.applicant_id, 'REMINDER_24H_SENT', jsonb_build_object('appointment_id', r.appointment_id));

            dispatched_count := dispatched_count + 1;
        END IF;
    END LOOP;

    RETURN dispatched_count;
END;
$$;

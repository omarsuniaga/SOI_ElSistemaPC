-- Migration: Create trigger to automatically invoke send-push on notification insert
-- Date: 2026-05-23
-- Description: Automatically formats and forwards all new notificaciones to the send-push Edge Function.

CREATE OR REPLACE FUNCTION public.on_notification_inserted()
RETURNS TRIGGER AS $$
DECLARE
  v_payload JSONB;
  v_url TEXT;
  v_anon_key TEXT;
  v_actions JSONB := '[]'::jsonb;
BEGIN
  -- 1. Configure Supabase send-push Edge Function endpoint and credentials
  v_url := 'https://zmhmdvmyeyswunurcyow.supabase.co/functions/v1/send-push';
  v_anon_key := 'sb_publishable_-TE6E79mrn4fSs4XGnvWnw_2QgDrX0P'; -- standard anon key

  -- 2. Dynamically attach interactive quick actions (buttons) based on the notification type
  IF NEW.tipo = 'sesion_sin_registrar' OR NEW.titulo = 'Asistencia Pendiente' THEN
    v_actions := '[
      {
        "action": "mark-read",
        "title": "Entendido (Marcar Leído)",
        "icon": "/icons/check.png"
      }
    ]'::jsonb;
  ELSE
    v_actions := '[
      {
        "action": "mark-read",
        "title": "Marcar como Leído",
        "icon": "/icons/check.png"
      }
    ]'::jsonb;
  END IF;

  -- 3. Build the payload matching the edge function signature
  v_payload := jsonb_build_object(
    'profile_id', NEW.profile_id,
    'title', NEW.titulo,
    'body', NEW.mensaje,
    'actions', v_actions,
    'data', jsonb_build_object(
      'notification_id', NEW.id,
      'clase_id', NEW.clase_id,
      'tipo', NEW.tipo,
      'created_at', NEW.created_at
    )
  );

  -- 4. Invoke the send-push Edge Function asynchronously using pg_net extension
  -- This prevents blocking the main INSERT transaction if the HTTP request has delays.
  PERFORM net.http_post(
    url := v_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'apikey', v_anon_key,
      'Authorization', 'Bearer ' || v_anon_key
    )::json,
    body := v_payload::json,
    timeout_milliseconds := 5000
  );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Fall-soft: log the trigger failure to postgres logs but allow the original INSERT to succeed
  RAISE WARNING '[on_notification_inserted] Fallo al enviar push para notificacion %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the AFTER INSERT trigger
DROP TRIGGER IF EXISTS trigger_on_notification_inserted ON public.notificaciones;
CREATE TRIGGER trigger_on_notification_inserted
AFTER INSERT ON public.notificaciones
FOR EACH ROW
EXECUTE FUNCTION public.on_notification_inserted();

COMMENT ON FUNCTION public.on_notification_inserted() IS 'Automatically sends a Web Push notification via send-push Edge Function on insert';

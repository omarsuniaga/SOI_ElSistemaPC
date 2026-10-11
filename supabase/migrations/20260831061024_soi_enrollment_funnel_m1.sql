-- Migration: 20260827200000_soi_enrollment_funnel_m1.sql
-- Module: SOI — Automated Enrollment Funnel & Appointment Scheduling (Módulo 1)
-- Spec: /home/omedsunriv/docs/srs/srs-enrollment-funnel.md (SRS v1.0, sección 4)
--
-- Scope: 100% ADITIVA Y PARALELA. No elimina ni modifica ninguna tabla,
-- función, política o índice existente. Crea el esquema base del embudo de
-- inscripción: captura de leads (applicants), agenda de entrevistas con
-- guardia de concurrencia (appointments) y log de event sourcing
-- (applicant_events).
--
-- Modelo de acceso:
--   - service_role: acceso total. Es el actor real del embudo — el Apps
--     Script de Google Forms hace el upsert en applicants/applicant_events,
--     y el motor FSM de Hermes gestiona el slot locking en appointments.
--   - authenticated (staff/admin portal): SELECT sobre las tres tablas +
--     UPDATE sobre appointments (gestión manual de citas: confirmar,
--     cancelar, notas). Restringido a rol 'admin' vía get_user_role().
--   - anon: sin acceso.
--
-- Patrón de trigger updated_at: función scoped propia del módulo, igual que
-- fin_service_balances / soi_tool_catalog en migraciones recientes.

-- ---------------------------------------------------------------------------
-- 1. applicants — captura de leads del embudo
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.applicants (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  idempotency_key text NOT NULL UNIQUE,
  full_name       text NOT NULL,
  phone_number    text NOT NULL,
  email           text,
  utm_source      text DEFAULT 'direct',
  status          text NOT NULL DEFAULT 'LEAD'
                    CHECK (status IN ('LEAD','FORM_COMPLETED','SCHEDULED','ATTENDED','NO_SHOW','CANCELLED')),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_applicants_status ON public.applicants (status);
CREATE INDEX IF NOT EXISTS idx_applicants_phone_number ON public.applicants (phone_number);

-- ---------------------------------------------------------------------------
-- 2. appointments — agenda de entrevistas con guardia de concurrencia
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.appointments (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_id       uuid NOT NULL REFERENCES public.applicants(id) ON DELETE CASCADE,
  scheduled_datetime timestamptz NOT NULL,
  status             text NOT NULL DEFAULT 'RESERVED_PENDING'
                       CHECK (status IN ('RESERVED_PENDING','CONFIRMED','CANCELLED','COMPLETED')),
  locked_until       timestamptz,
  notes              text,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_appointments_applicant_id ON public.appointments (applicant_id);
CREATE INDEX IF NOT EXISTS idx_appointments_scheduled_datetime ON public.appointments (scheduled_datetime);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments (status);

-- Índice único parcial: garantiza cero dobles reservas sobre un mismo horario
-- una vez que la cita está CONFIRMED. Los estados RESERVED_PENDING (lock con
-- TTL) no bloquean el índice; la exclusividad se resuelve en el commit del FSM.
CREATE UNIQUE INDEX IF NOT EXISTS uq_active_confirmed_slot
  ON public.appointments (scheduled_datetime)
  WHERE status = 'CONFIRMED';

-- ---------------------------------------------------------------------------
-- 3. applicant_events — event sourcing / analítica del embudo
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.applicant_events (
  id           bigserial PRIMARY KEY,
  applicant_id uuid REFERENCES public.applicants(id) ON DELETE CASCADE,
  event_name   text NOT NULL,
  payload      jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_applicant_events_applicant_id ON public.applicant_events (applicant_id);
CREATE INDEX IF NOT EXISTS idx_applicant_events_event_name ON public.applicant_events (event_name);
CREATE INDEX IF NOT EXISTS idx_applicant_events_created_at ON public.applicant_events (created_at DESC);

-- ---------------------------------------------------------------------------
-- 4. Trigger updated_at (scoped al módulo)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_enrollment_funnel_set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_applicants_set_updated_at ON public.applicants;
CREATE TRIGGER trg_applicants_set_updated_at
  BEFORE UPDATE ON public.applicants
  FOR EACH ROW EXECUTE FUNCTION public.fn_enrollment_funnel_set_updated_at();

DROP TRIGGER IF EXISTS trg_appointments_set_updated_at ON public.appointments;
CREATE TRIGGER trg_appointments_set_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.fn_enrollment_funnel_set_updated_at();

-- ---------------------------------------------------------------------------
-- 5. Row Level Security
-- ---------------------------------------------------------------------------
ALTER TABLE public.applicants       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applicant_events ENABLE ROW LEVEL SECURITY;

-- service_role: acceso total (ingestión Google Forms + motor FSM Hermes).
-- service_role ignora RLS por defecto, pero se declara explícito para dejar
-- la intención en el esquema y cubrir un futuro cambio de BYPASSRLS.
CREATE POLICY applicants_all_service_role
  ON public.applicants FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY appointments_all_service_role
  ON public.appointments FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY applicant_events_all_service_role
  ON public.applicant_events FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Staff / Admin Portal: lectura del embudo + gestión manual de citas.
CREATE POLICY applicants_select_admin
  ON public.applicants FOR SELECT TO authenticated
  USING (get_user_role() = 'admin');

CREATE POLICY appointments_select_admin
  ON public.appointments FOR SELECT TO authenticated
  USING (get_user_role() = 'admin');

CREATE POLICY appointments_update_admin
  ON public.appointments FOR UPDATE TO authenticated
  USING (get_user_role() = 'admin')
  WITH CHECK (get_user_role() = 'admin');

CREATE POLICY applicant_events_select_admin
  ON public.applicant_events FOR SELECT TO authenticated
  USING (get_user_role() = 'admin');

-- anon: bloqueo explícito (defensa en profundidad; sin políticas ya deniega).
CREATE POLICY applicants_no_anon
  ON public.applicants FOR ALL TO anon USING (false) WITH CHECK (false);

CREATE POLICY appointments_no_anon
  ON public.appointments FOR ALL TO anon USING (false) WITH CHECK (false);

CREATE POLICY applicant_events_no_anon
  ON public.applicant_events FOR ALL TO anon USING (false) WITH CHECK (false);

-- ---------------------------------------------------------------------------
-- 6. Grants (privilegios de tabla; RLS filtra las filas por encima)
-- ---------------------------------------------------------------------------
GRANT ALL ON public.applicants       TO service_role;
GRANT ALL ON public.appointments     TO service_role;
GRANT ALL ON public.applicant_events TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.applicant_events_id_seq TO service_role;

GRANT SELECT ON public.applicants       TO authenticated;
GRANT SELECT, UPDATE ON public.appointments TO authenticated;
GRANT SELECT ON public.applicant_events TO authenticated;

REVOKE ALL ON public.applicants       FROM anon;
REVOKE ALL ON public.appointments     FROM anon;
REVOKE ALL ON public.applicant_events FROM anon;

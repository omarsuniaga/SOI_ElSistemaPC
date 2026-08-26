-- Migration: 020_notificaciones_asistencia.sql
-- Purpose: Create table for attendance alert notifications (HERMES integration)
-- Date: 2026-08-18
-- Description: Stores WhatsApp notifications for student absences and incomplete attendance records.
--              HERMES polling service reads and processes these notifications.

-- ────────────────────────────────────────────────────────────────────────────
-- CREATE TABLE notificaciones_asistencia
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.notificaciones_asistencia (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Notification metadata
  tipo TEXT NOT NULL CHECK (tipo IN (
    'alerta_asistencia_alumno',
    'recordatorio_asistencia_maestro',
    'reporte_asistencia_semanal'
  )),
  canal TEXT NOT NULL DEFAULT 'whatsapp' CHECK (canal IN ('whatsapp', 'email', 'ambos')),
  prioridad TEXT NOT NULL DEFAULT 'normal' CHECK (prioridad IN ('baja', 'normal', 'alta', 'urgente')),

  -- Recipient info
  destinatario_telefono TEXT NOT NULL,
  destinatario_nombre TEXT,
  destinatario_email TEXT,

  -- Message content
  titulo TEXT,
  cuerpo TEXT NOT NULL,

  -- Status tracking (HERMES updates these)
  estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN (
    'pendiente',
    'enviado',
    'fallido',
    'entregado',
    'leido'
  )),

  -- HERMES timestamps
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT now(),
  fecha_programada TIMESTAMP WITH TIME ZONE,
  fecha_envio TIMESTAMP WITH TIME ZONE,
  fecha_respuesta TIMESTAMP WITH TIME ZONE,

  -- Response tracking
  respuesta TEXT,
  respuesta_hora TIMESTAMP WITH TIME ZONE,

  -- Metadata
  datos_extra JSONB,
  intentos_envio INTEGER DEFAULT 0,
  error_ultimo JSONB,

  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ────────────────────────────────────────────────────────────────────────────
-- INDEXES for HERMES polling
-- ────────────────────────────────────────────────────────────────────────────

-- HERMES polls: WHERE estado='pendiente' AND (fecha_programada IS NULL OR fecha_programada <= now())
CREATE INDEX IF NOT EXISTS idx_notif_asistencia_estado
  ON public.notificaciones_asistencia(estado)
  WHERE estado = 'pendiente';

CREATE INDEX IF NOT EXISTS idx_notif_asistencia_estado_programada
  ON public.notificaciones_asistencia(estado, fecha_programada)
  WHERE estado = 'pendiente';

-- For analytics / admin queries
CREATE INDEX IF NOT EXISTS idx_notif_asistencia_tipo
  ON public.notificaciones_asistencia(tipo);

CREATE INDEX IF NOT EXISTS idx_notif_asistencia_created
  ON public.notificaciones_asistencia(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notif_asistencia_destinatario
  ON public.notificaciones_asistencia(destinatario_telefono);

-- ────────────────────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY (RLS)
-- ────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.notificaciones_asistencia ENABLE ROW LEVEL SECURITY;

-- Portal (portal-maestros, admin-dashboard) can READ their own notifications
CREATE POLICY portal_read_own_notifications
  ON public.notificaciones_asistencia
  FOR SELECT
  TO authenticated
  USING (
    -- For now: allow authenticated users to read all notifications
    -- TODO: Restrict by user profile / maestro_id when needed
    true
  );

-- Portal can INSERT new notification requests
CREATE POLICY portal_insert_notifications
  ON public.notificaciones_asistencia
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- HERMES (restricted service role) can UPDATE estado/timestamps
CREATE POLICY hermes_update_notifications
  ON public.notificaciones_asistencia
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- ────────────────────────────────────────────────────────────────────────────
-- AUTO-UPDATE updated_at TIMESTAMP
-- ────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.fn_update_notif_asistencia_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_notif_asistencia_update_timestamp
BEFORE UPDATE ON public.notificaciones_asistencia
FOR EACH ROW
EXECUTE FUNCTION public.fn_update_notif_asistencia_timestamp();

-- ────────────────────────────────────────────────────────────────────────────
-- GRANT permissions to service roles
-- ────────────────────────────────────────────────────────────────────────────

GRANT SELECT, INSERT ON public.notificaciones_asistencia TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.notificaciones_asistencia TO service_role;

-- ────────────────────────────────────────────────────────────────────────────
-- DOCUMENTATION
-- ────────────────────────────────────────────────────────────────────────────

COMMENT ON TABLE public.notificaciones_asistencia IS
  'Stores attendance alert notifications for WhatsApp delivery via HERMES. ' ||
  'Types: alerta_asistencia_alumno (to parent), recordatorio_asistencia_maestro (to teacher), ' ||
  'reporte_asistencia_semanal (weekly report). HERMES polling reads estado=pendiente rows.';

COMMENT ON COLUMN public.notificaciones_asistencia.estado IS
  'Notification status: pendiente (waiting), enviado (sent), fallido (failed), ' ||
  'entregado (delivered), leido (read). HERMES updates this column.';

COMMENT ON COLUMN public.notificaciones_asistencia.fecha_programada IS
  'Optional: if set, notification waits until this timestamp before HERMES sends it.';

COMMENT ON COLUMN public.notificaciones_asistencia.datos_extra IS
  'JSON metadata: alumno_id, maestro_id, sesion_id, periodo_dias, etc. for context.';

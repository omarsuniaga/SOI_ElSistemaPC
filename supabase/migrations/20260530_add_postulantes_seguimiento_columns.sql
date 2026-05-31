-- Migration: Add seguimiento columns to postulantes table
-- Columns needed for the admission workflow (state machine, citas, seguimiento)
-- These were referenced in postuladosSupabase.js but never migrated

ALTER TABLE postulantes
ADD COLUMN IF NOT EXISTS estado TEXT DEFAULT 'postulado'
  CHECK (estado IN (
    'postulado', 'contactado', 'cita_agendada', 'documentos_ok',
    'inscrito', 'no_show', 'reprogramado', 'en_espera', 'descartado'
  )),
ADD COLUMN IF NOT EXISTS fecha_contacto TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS fecha_cita TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS notas_seguimiento TEXT,
ADD COLUMN IF NOT EXISTS alumno_id UUID REFERENCES alumnos(id);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_postulantes_created_at ON postulantes(created_at);
CREATE INDEX IF NOT EXISTS idx_postulantes_fecha_cita ON postulantes(fecha_cita);
CREATE INDEX IF NOT EXISTS idx_postulantes_estado ON postulantes(estado);

-- supabase/migrations/20260530_emergente_id_sesiones.sql

-- Link auto-justified sessions back to their originating emergent session.
-- ON DELETE SET NULL: if the emergent is deleted, justified sessions keep their data.
ALTER TABLE sesiones_clase
  ADD COLUMN IF NOT EXISTS emergente_id UUID REFERENCES sesiones_clase(id) ON DELETE SET NULL;

-- Required for UPSERT idempotency in emergenteJustificacionService.
-- A class can only have one session per date per teacher.
ALTER TABLE sesiones_clase
  ADD CONSTRAINT sesiones_clase_clase_fecha_maestro_unique
  UNIQUE (clase_id, fecha, maestro_id);

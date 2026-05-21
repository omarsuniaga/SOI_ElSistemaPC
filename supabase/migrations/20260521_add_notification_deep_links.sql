-- Add new columns to notificaciones table for deep linking and class context
ALTER TABLE notificaciones ADD COLUMN IF NOT EXISTS clase_id UUID REFERENCES clases(id) ON DELETE CASCADE;
ALTER TABLE notificaciones ADD COLUMN IF NOT EXISTS deep_link TEXT;

-- Create index on clase_id for faster queries
CREATE INDEX IF NOT EXISTS idx_notificaciones_clase_id ON notificaciones(clase_id);

-- Add constraint: deep_link must be a valid internal path (allows both generic and class-specific formats)
-- Note: strict /asistencia/{uuid}/{date} pattern widened to accommodate existing /portal/* deep_links
-- NOT VALID: existing rows are not validated, only future writes are checked
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'check_deep_link_format'
          AND conrelid = 'notificaciones'::regclass
    ) THEN
        ALTER TABLE notificaciones ADD CONSTRAINT check_deep_link_format
            CHECK (deep_link IS NULL OR deep_link ~ '^/[a-zA-Z0-9/_-]+$') NOT VALID;
    END IF;
END $$;

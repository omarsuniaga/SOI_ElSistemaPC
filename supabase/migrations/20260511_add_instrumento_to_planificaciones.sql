-- Add instrumento column to planificaciones
-- Allows specifying which instrument/level this planning targets

ALTER TABLE planificaciones
ADD COLUMN IF NOT EXISTS instrumento TEXT;

COMMENT ON COLUMN planificaciones.instrumento IS
  'Instrumento o grupo objetivo de la planificación. NULL = aplica a todos los instrumentos de la clase. Ej: "Violín", "Iniciación Violines", "Taller de Cuerdas"';
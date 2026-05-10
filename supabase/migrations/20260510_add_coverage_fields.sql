-- Add coverage tracking fields to indicator_attempts table
-- Tracks when content was covered and which class session covered it

ALTER TABLE indicator_attempts
ADD COLUMN IF NOT EXISTS covered_date DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS covered_by_clase_id UUID REFERENCES clases(id) ON DELETE SET NULL;

-- Create index for efficient queries by node and covered date
CREATE INDEX IF NOT EXISTS idx_indicator_attempts_covered_date
ON indicator_attempts(indicator_id, covered_date DESC);

-- Create index for efficient queries by clase and covered date
CREATE INDEX IF NOT EXISTS idx_indicator_attempts_clase
ON indicator_attempts(covered_by_clase_id, covered_date DESC);

-- Create view for efficient student list per node with coverage metrics
CREATE OR REPLACE VIEW node_student_coverage AS
SELECT
  i.node_id,
  a.id as student_id,
  a.nombre_completo,
  MAX(ia.created_at) as last_attempt_date,
  COUNT(*) as attempt_count
FROM indicator_attempts ia
JOIN indicators i ON ia.indicator_id = i.id
JOIN alumnos a ON ia.student_id = a.id
GROUP BY i.node_id, a.id, a.nombre_completo;

COMMENT ON COLUMN indicator_attempts.covered_date IS 'Date when the content was covered in class';
COMMENT ON COLUMN indicator_attempts.covered_by_clase_id IS 'Reference to the clase that covered this content';
COMMENT ON VIEW node_student_coverage IS 'Aggregated view of student attempts per node with coverage metrics';

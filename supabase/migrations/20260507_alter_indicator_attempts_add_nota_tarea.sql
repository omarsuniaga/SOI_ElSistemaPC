-- Add nota (1-5 grade) and tarea (assigned task) to existing indicator_attempts table
ALTER TABLE indicator_attempts ADD COLUMN IF NOT EXISTS nota smallint CHECK (nota BETWEEN 1 AND 5);
ALTER TABLE indicator_attempts ADD COLUMN IF NOT EXISTS tarea text;

-- Unique constraint for UPSERT: one evaluation per session+indicator+student
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uq_attempt_session_indicator_student'
  ) THEN
    ALTER TABLE indicator_attempts
      ADD CONSTRAINT uq_attempt_session_indicator_student
      UNIQUE (session_id, indicator_id, student_id);
  END IF;
EXCEPTION WHEN others THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_attempts_student ON indicator_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_attempts_indicator ON indicator_attempts(indicator_id);
CREATE INDEX IF NOT EXISTS idx_attempts_session ON indicator_attempts(session_id);

COMMENT ON COLUMN indicator_attempts.nota IS 'Numeric grade 1-5 from DSL /N syntax';
COMMENT ON COLUMN indicator_attempts.tarea IS 'Assigned task from DSL {task} syntax';

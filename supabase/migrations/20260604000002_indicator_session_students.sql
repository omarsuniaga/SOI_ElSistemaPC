-- Migration: Create indicator_session_students table
-- Purpose: Map students to teaching observations (many-to-many)
-- Date: 2026-06-04

CREATE TABLE IF NOT EXISTS indicator_session_students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign keys
  indicator_session_id UUID NOT NULL REFERENCES indicator_sessions(id) ON DELETE CASCADE,
  alumno_id UUID NOT NULL REFERENCES alumnos(id) ON DELETE CASCADE,

  -- Individual assessment
  nota_cualitativa VARCHAR(20) CHECK (nota_cualitativa IN ('bien', 'regular', 'mal')),
  observaciones_individuales TEXT,

  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  UNIQUE(indicator_session_id, alumno_id)  -- Prevent duplicates
);

-- Indices for fast lookups
CREATE INDEX idx_indicator_session_students_session ON indicator_session_students(indicator_session_id);
CREATE INDEX idx_indicator_session_students_alumno ON indicator_session_students(alumno_id);
CREATE INDEX idx_indicator_session_students_session_alumno ON indicator_session_students(indicator_session_id, alumno_id);

-- Enable RLS
ALTER TABLE indicator_session_students ENABLE ROW LEVEL SECURITY;

-- RLS Policy: users can view students in sessions they created
CREATE POLICY "users_can_view_session_students" ON indicator_session_students
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM indicator_sessions
      WHERE indicator_sessions.id = indicator_session_students.indicator_session_id
      AND indicator_sessions.maestro_id IN (
        SELECT id FROM maestros WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "users_can_insert_session_students" ON indicator_session_students
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM indicator_sessions
      WHERE indicator_sessions.id = indicator_session_id
      AND indicator_sessions.maestro_id IN (
        SELECT id FROM maestros WHERE user_id = auth.uid()
      )
    )
  );

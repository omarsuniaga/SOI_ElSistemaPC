-- Migration: class_events + class_event_methodology + homework_assignments
-- Date: 2026-05-07
-- Module: Academic Route — Class Content Selection (instrument-agnostic)

-- 1. class_events — explicit event record per session+student
CREATE TABLE IF NOT EXISTS class_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL REFERENCES maestros(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES alumnos(id) ON DELETE CASCADE,
  academic_plan_id uuid REFERENCES academic_plans(id) ON DELETE SET NULL,
  session_id uuid REFERENCES sesiones_clase(id) ON DELETE SET NULL,
  level_id uuid REFERENCES levels(id) ON DELETE SET NULL,
  event_date date NOT NULL DEFAULT CURRENT_DATE,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'completed', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_class_events_teacher ON class_events(teacher_id);
CREATE INDEX IF NOT EXISTS idx_class_events_student ON class_events(student_id);
CREATE INDEX IF NOT EXISTS idx_class_events_session ON class_events(session_id);
CREATE INDEX IF NOT EXISTS idx_class_events_date ON class_events(event_date);
CREATE UNIQUE INDEX IF NOT EXISTS idx_class_events_session_student ON class_events(session_id, student_id);

-- Reuse existing updated_at trigger function if available
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_class_events_updated_at ON class_events;
CREATE TRIGGER trg_class_events_updated_at
  BEFORE UPDATE ON class_events
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE class_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ce_select_all" ON class_events FOR SELECT USING (true);
CREATE POLICY "ce_insert_all" ON class_events FOR INSERT WITH CHECK (true);
CREATE POLICY "ce_update_all" ON class_events FOR UPDATE USING (true);
CREATE POLICY "ce_delete_all" ON class_events FOR DELETE USING (true);

-- 2. class_event_methodology — structured methodology form per class event
CREATE TABLE IF NOT EXISTS class_event_methodology (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_event_id uuid NOT NULL REFERENCES class_events(id) ON DELETE CASCADE,
  warmup text,
  sound_focus text,
  intonation_focus text,
  main_node_id uuid REFERENCES nodes(id) ON DELETE SET NULL,
  technical_focus text,
  study_used text,
  repertoire_used text,
  sight_reading_work text,
  ear_training_work text,
  closing_observation text,
  homework_text text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_methodology_event ON class_event_methodology(class_event_id);

ALTER TABLE class_event_methodology ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cem_select_all" ON class_event_methodology FOR SELECT USING (true);
CREATE POLICY "cem_insert_all" ON class_event_methodology FOR INSERT WITH CHECK (true);
CREATE POLICY "cem_update_all" ON class_event_methodology FOR UPDATE USING (true);
CREATE POLICY "cem_delete_all" ON class_event_methodology FOR DELETE USING (true);

-- 3. homework_assignments — formal homework with due date
CREATE TABLE IF NOT EXISTS homework_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_event_id uuid NOT NULL REFERENCES class_events(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES alumnos(id) ON DELETE CASCADE,
  teacher_id uuid NOT NULL REFERENCES maestros(id) ON DELETE CASCADE,
  node_id uuid REFERENCES nodes(id) ON DELETE SET NULL,
  description text NOT NULL,
  due_date date,
  status text NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned', 'completed', 'overdue')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_homework_student ON homework_assignments(student_id);
CREATE INDEX IF NOT EXISTS idx_homework_teacher ON homework_assignments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_homework_event ON homework_assignments(class_event_id);
CREATE INDEX IF NOT EXISTS idx_homework_due_date ON homework_assignments(due_date);

ALTER TABLE homework_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "hw_select_all" ON homework_assignments FOR SELECT USING (true);
CREATE POLICY "hw_insert_all" ON homework_assignments FOR INSERT WITH CHECK (true);
CREATE POLICY "hw_update_all" ON homework_assignments FOR UPDATE USING (true);
CREATE POLICY "hw_delete_all" ON homework_assignments FOR DELETE USING (true);

COMMENT ON TABLE class_events IS 'Explicit class event record per session+student, linking academic plan, level, and methodology.';
COMMENT ON TABLE class_event_methodology IS 'Structured methodology notes for a class event (warmup, focus areas, repertoire, etc).';
COMMENT ON TABLE homework_assignments IS 'Formal homework assignments with optional node link and due date.';

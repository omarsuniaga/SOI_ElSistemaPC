-- Migration: schedule_run_feedback table
-- Adds feedback/review tracking for schedule publication workflow
-- Sprint 3: Task 10

-- 1. Add 'estado' column to schedule_runs if it doesn't exist
ALTER TABLE schedule_runs
  ADD COLUMN IF NOT EXISTS estado TEXT NOT NULL DEFAULT 'borrador'
  CHECK (estado IN ('borrador', 'revision', 'publicado'));

-- 2. Create schedule_run_feedback table
CREATE TABLE IF NOT EXISTS schedule_run_feedback (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id        UUID NOT NULL REFERENCES schedule_runs(id) ON DELETE CASCADE,
  usuario_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  comentario    TEXT NOT NULL,
  tipo          TEXT NOT NULL DEFAULT 'observacion'
                CHECK (tipo IN ('observacion', 'aprobacion', 'rechazo')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Index for fast lookup by run_id
CREATE INDEX IF NOT EXISTS idx_schedule_run_feedback_run_id
  ON schedule_run_feedback(run_id);

-- 4. RLS
ALTER TABLE schedule_run_feedback ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "admins_all_feedback" ON schedule_run_feedback
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM maestros
      WHERE maestros.usuario_id = auth.uid()
        AND maestros.es_admin = true
    )
  );

-- Any authenticated user can insert feedback
CREATE POLICY "authenticated_insert_feedback" ON schedule_run_feedback
  FOR INSERT
  TO authenticated
  WITH CHECK (usuario_id = auth.uid());

-- Anyone can read feedback for runs they can see
CREATE POLICY "authenticated_select_feedback" ON schedule_run_feedback
  FOR SELECT
  TO authenticated
  USING (true);

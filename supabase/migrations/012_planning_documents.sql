CREATE TABLE IF NOT EXISTS planning_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  maestro_id uuid NOT NULL REFERENCES maestros(id) ON DELETE CASCADE,
  clase_id uuid REFERENCES clases(id) ON DELETE SET NULL,
  title text NOT NULL,
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_type text,
  file_size bigint,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_plandocs_maestro ON planning_documents(maestro_id);
CREATE INDEX IF NOT EXISTS idx_plandocs_clase ON planning_documents(clase_id);

ALTER TABLE planning_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "plandocs_select_all" ON planning_documents FOR SELECT USING (true);
CREATE POLICY "plandocs_insert_all" ON planning_documents FOR INSERT WITH CHECK (true);
CREATE POLICY "plandocs_update_all" ON planning_documents FOR UPDATE USING (true);
CREATE POLICY "plandocs_delete_all" ON planning_documents FOR DELETE USING (true);

COMMENT ON TABLE planning_documents IS 'Teacher planning documents (PDFs, images, etc.) linked to classes.';

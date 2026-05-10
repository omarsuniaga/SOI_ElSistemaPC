-- Create planned_content table for daily content planning
-- Teachers plan which content (nodes) they will cover in each class

CREATE TABLE IF NOT EXISTS planned_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  maestro_id UUID NOT NULL REFERENCES maestros(id) ON DELETE CASCADE,
  clase_id UUID NOT NULL REFERENCES clases(id) ON DELETE CASCADE,
  node_id UUID NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
  planned_date DATE DEFAULT CURRENT_DATE,
  covered BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(maestro_id, clase_id, node_id, planned_date)
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_planned_content_clase
ON planned_content(clase_id, planned_date);

CREATE INDEX IF NOT EXISTS idx_planned_content_maestro
ON planned_content(maestro_id, planned_date);

CREATE INDEX IF NOT EXISTS idx_planned_content_node
ON planned_content(node_id, planned_date);

-- Enable RLS
ALTER TABLE planned_content ENABLE ROW LEVEL SECURITY;

-- RLS Policies - allow all operations for now (can be refined)
CREATE POLICY "planned_content_select_all" ON planned_content FOR SELECT USING (true);
CREATE POLICY "planned_content_insert_all" ON planned_content FOR INSERT WITH CHECK (true);
CREATE POLICY "planned_content_update_all" ON planned_content FOR UPDATE USING (true);
CREATE POLICY "planned_content_delete_all" ON planned_content FOR DELETE USING (true);

-- Comments
COMMENT ON TABLE planned_content IS 'Teachers'' daily planning of content to cover in each class session';
COMMENT ON COLUMN planned_content.maestro_id IS 'Teacher who planned this content';
COMMENT ON COLUMN planned_content.clase_id IS 'Class where content will be covered';
COMMENT ON COLUMN planned_content.node_id IS 'Content node/topic planned for coverage';
COMMENT ON COLUMN planned_content.planned_date IS 'Date when content is planned to be covered';
COMMENT ON COLUMN planned_content.covered IS 'Flag indicating if the planned content was actually covered';

-- Observation drafts and confirmed observations per session
CREATE TABLE IF NOT EXISTS observaciones_sesion (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sesion_id uuid NOT NULL REFERENCES sesiones_clase(id) ON DELETE CASCADE,
  maestro_id uuid NOT NULL REFERENCES maestros(id) ON DELETE CASCADE,
  contenido_raw text NOT NULL DEFAULT '',
  contenido_parsed jsonb,
  es_borrador boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_obs_sesion ON observaciones_sesion(sesion_id);
CREATE INDEX IF NOT EXISTS idx_obs_maestro ON observaciones_sesion(maestro_id);
CREATE INDEX IF NOT EXISTS idx_obs_borrador ON observaciones_sesion(sesion_id, es_borrador) WHERE es_borrador = true;

ALTER TABLE observaciones_sesion ENABLE ROW LEVEL SECURITY;

CREATE POLICY "obs_select_all" ON observaciones_sesion FOR SELECT USING (true);
CREATE POLICY "obs_insert_all" ON observaciones_sesion FOR INSERT WITH CHECK (true);
CREATE POLICY "obs_update_all" ON observaciones_sesion FOR UPDATE USING (true);
CREATE POLICY "obs_delete_drafts" ON observaciones_sesion FOR DELETE USING (es_borrador = true);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS observaciones_sesion_updated_at ON observaciones_sesion;
CREATE TRIGGER observaciones_sesion_updated_at
  BEFORE UPDATE ON observaciones_sesion
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

COMMENT ON TABLE observaciones_sesion IS 'Raw DSL observations per session. es_borrador=true for auto-drafts, false for confirmed saves.';

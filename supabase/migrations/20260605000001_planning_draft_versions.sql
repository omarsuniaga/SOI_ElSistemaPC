-- Migration: Planning draft versions for maestros
-- Purpose: Let a maestro work on their OWN draft copy of a published route
--          (clone-on-demand) and edit its curriculum without touching the
--          shared published version.
-- Date: 2026-06-05
--
-- Strategy:
--   * route_versions.status='draft' + created_by=auth.uid() identifies a
--     maestro's private draft. The published version stays read-only.
--   * clone_route_version_as_draft() deep-copies blocks→levels→nodes→
--     indicators in a single transaction (SECURITY DEFINER) and is idempotent
--     (returns the existing draft if one already exists for that user+route).
--   * Write RLS policies allow INSERT/UPDATE/DELETE on content tables only
--     when the row belongs to a draft owned by the calling maestro.

-- ──────────────────────────────────────────────────────────────
-- 1. Clone function (idempotent get-or-create draft)
-- ──────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION clone_route_version_as_draft(p_source_version_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_route_id uuid;
  v_new_version_id uuid;
  v_uid uuid := auth.uid();
  v_existing uuid;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'No authenticated user';
  END IF;

  SELECT route_id INTO v_route_id FROM route_versions WHERE id = p_source_version_id;
  IF v_route_id IS NULL THEN
    RAISE EXCEPTION 'Source route version % not found', p_source_version_id;
  END IF;

  -- Idempotent: reuse existing draft for this user + route
  SELECT id INTO v_existing
    FROM route_versions
   WHERE route_id = v_route_id AND created_by = v_uid AND status = 'draft'
   LIMIT 1;
  IF v_existing IS NOT NULL THEN
    RETURN v_existing;
  END IF;

  v_new_version_id := gen_random_uuid();
  INSERT INTO route_versions (id, route_id, version, status, notes, created_by, created_at)
  VALUES (v_new_version_id, v_route_id, 'draft-' || left(v_uid::text, 8), 'draft',
          'Borrador del maestro', v_uid, now());

  -- Temp id-mapping tables (dropped at end of transaction)
  CREATE TEMP TABLE _blk_map (old uuid, new uuid) ON COMMIT DROP;
  CREATE TEMP TABLE _lvl_map (old uuid, new uuid) ON COMMIT DROP;
  CREATE TEMP TABLE _nod_map (old uuid, new uuid) ON COMMIT DROP;

  -- Blocks
  INSERT INTO _blk_map(old, new)
  SELECT id, gen_random_uuid() FROM blocks WHERE route_version_id = p_source_version_id;
  INSERT INTO blocks (id, route_version_id, name, level_from, level_to, objective, description, order_index)
  SELECT m.new, v_new_version_id, b.name, b.level_from, b.level_to, b.objective, b.description, b.order_index
  FROM blocks b JOIN _blk_map m ON m.old = b.id
  WHERE b.route_version_id = p_source_version_id;

  -- Levels
  INSERT INTO _lvl_map(old, new)
  SELECT id, gen_random_uuid() FROM levels WHERE route_version_id = p_source_version_id;
  INSERT INTO levels (id, block_id, route_version_id, level_number, name, main_objective,
                      suggested_duration_value, suggested_duration_unit, is_flexible_duration,
                      target_work, unlock_criteria, order_index)
  SELECT lm.new, bm.new, v_new_version_id, l.level_number, l.name, l.main_objective,
         l.suggested_duration_value, l.suggested_duration_unit, l.is_flexible_duration,
         l.target_work, l.unlock_criteria, l.order_index
  FROM levels l
  JOIN _lvl_map lm ON lm.old = l.id
  LEFT JOIN _blk_map bm ON bm.old = l.block_id
  WHERE l.route_version_id = p_source_version_id;

  -- Nodes
  INSERT INTO _nod_map(old, new)
  SELECT id, gen_random_uuid() FROM nodes WHERE route_version_id = p_source_version_id;
  INSERT INTO nodes (id, level_id, route_version_id, name, type, is_critical, is_required, objective, order_index)
  SELECT nm.new, lm.new, v_new_version_id, n.name, n.type, n.is_critical, n.is_required, n.objective, n.order_index
  FROM nodes n
  JOIN _nod_map nm ON nm.old = n.id
  LEFT JOIN _lvl_map lm ON lm.old = n.level_id
  WHERE n.route_version_id = p_source_version_id;

  -- Indicators (linked by node)
  INSERT INTO indicators (id, node_id, description, minimum_criteria, is_required, order_index, nombre, activo)
  SELECT gen_random_uuid(), nm.new, i.description, i.minimum_criteria, i.is_required, i.order_index, i.nombre, i.activo
  FROM indicators i
  JOIN _nod_map nm ON nm.old = i.node_id;

  RETURN v_new_version_id;
END;
$$;

GRANT EXECUTE ON FUNCTION clone_route_version_as_draft(uuid) TO authenticated;

-- ──────────────────────────────────────────────────────────────
-- 2. Write RLS policies — only on draft versions owned by the maestro
-- ──────────────────────────────────────────────────────────────

-- Helper predicate is inlined per-table for clarity.

-- route_versions: maestro can read/update/delete their own draft
CREATE POLICY "maestros_select_own_draft_versions" ON route_versions
  FOR SELECT USING (created_by = auth.uid() AND status = 'draft');
CREATE POLICY "maestros_update_own_draft_versions" ON route_versions
  FOR UPDATE USING (created_by = auth.uid() AND status = 'draft');
CREATE POLICY "maestros_delete_own_draft_versions" ON route_versions
  FOR DELETE USING (created_by = auth.uid() AND status = 'draft');

-- blocks
CREATE POLICY "maestros_write_own_draft_blocks" ON blocks
  FOR ALL
  USING (route_version_id IN (
    SELECT id FROM route_versions WHERE created_by = auth.uid() AND status = 'draft'
  ))
  WITH CHECK (route_version_id IN (
    SELECT id FROM route_versions WHERE created_by = auth.uid() AND status = 'draft'
  ));

-- levels
CREATE POLICY "maestros_write_own_draft_levels" ON levels
  FOR ALL
  USING (route_version_id IN (
    SELECT id FROM route_versions WHERE created_by = auth.uid() AND status = 'draft'
  ))
  WITH CHECK (route_version_id IN (
    SELECT id FROM route_versions WHERE created_by = auth.uid() AND status = 'draft'
  ));

-- nodes
CREATE POLICY "maestros_write_own_draft_nodes" ON nodes
  FOR ALL
  USING (route_version_id IN (
    SELECT id FROM route_versions WHERE created_by = auth.uid() AND status = 'draft'
  ))
  WITH CHECK (route_version_id IN (
    SELECT id FROM route_versions WHERE created_by = auth.uid() AND status = 'draft'
  ));

-- indicators (no route_version_id → join through node)
CREATE POLICY "maestros_write_own_draft_indicators" ON indicators
  FOR ALL
  USING (node_id IN (
    SELECT n.id FROM nodes n
    JOIN route_versions rv ON rv.id = n.route_version_id
    WHERE rv.created_by = auth.uid() AND rv.status = 'draft'
  ))
  WITH CHECK (node_id IN (
    SELECT n.id FROM nodes n
    JOIN route_versions rv ON rv.id = n.route_version_id
    WHERE rv.created_by = auth.uid() AND rv.status = 'draft'
  ));

-- Migration: Fix concurrency in clone_route_version_as_draft
-- Purpose: The portal can fire getOrCreateDraftVersion several times in parallel
--          (multiple auth/init events). The original function's idempotency
--          check raced — concurrent calls all saw "no draft yet" and each
--          inserted one, producing duplicate (and partially-cloned) drafts due
--          to fixed-name temp-table collisions.
-- Fix:
--   1. Partial UNIQUE index: at most one draft per (route_id, created_by).
--   2. Transaction-level advisory lock keyed on (route_id, user) serializes
--      concurrent calls so the first creates the draft and the rest reuse it.
-- Date: 2026-06-05

-- 1. Safety net at the DB level (cleanup already removed existing drafts)
CREATE UNIQUE INDEX IF NOT EXISTS uniq_one_draft_per_route_user
  ON route_versions (route_id, created_by)
  WHERE status = 'draft';

-- 2. Serialize concurrent clones
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

  -- Serialize concurrent clones for the same (route, user). Released at commit.
  PERFORM pg_advisory_xact_lock(hashtext(v_route_id::text || ':' || v_uid::text));

  -- Idempotent: after acquiring the lock, reuse any existing draft
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

  CREATE TEMP TABLE _blk_map (old uuid, new uuid) ON COMMIT DROP;
  CREATE TEMP TABLE _lvl_map (old uuid, new uuid) ON COMMIT DROP;
  CREATE TEMP TABLE _nod_map (old uuid, new uuid) ON COMMIT DROP;

  INSERT INTO _blk_map(old, new)
  SELECT id, gen_random_uuid() FROM blocks WHERE route_version_id = p_source_version_id;
  INSERT INTO blocks (id, route_version_id, name, level_from, level_to, objective, description, order_index)
  SELECT m.new, v_new_version_id, b.name, b.level_from, b.level_to, b.objective, b.description, b.order_index
  FROM blocks b JOIN _blk_map m ON m.old = b.id
  WHERE b.route_version_id = p_source_version_id;

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

  INSERT INTO _nod_map(old, new)
  SELECT id, gen_random_uuid() FROM nodes WHERE route_version_id = p_source_version_id;
  INSERT INTO nodes (id, level_id, route_version_id, name, type, is_critical, is_required, objective, order_index)
  SELECT nm.new, lm.new, v_new_version_id, n.name, n.type, n.is_critical, n.is_required, n.objective, n.order_index
  FROM nodes n
  JOIN _nod_map nm ON nm.old = n.id
  LEFT JOIN _lvl_map lm ON lm.old = n.level_id
  WHERE n.route_version_id = p_source_version_id;

  INSERT INTO indicators (id, node_id, description, minimum_criteria, is_required, order_index, nombre, activo)
  SELECT gen_random_uuid(), nm.new, i.description, i.minimum_criteria, i.is_required, i.order_index, i.nombre, i.activo
  FROM indicators i
  JOIN _nod_map nm ON nm.old = i.node_id;

  RETURN v_new_version_id;
END;
$$;

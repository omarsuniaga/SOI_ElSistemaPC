-- Migration: Add route_version_id column to clases table
-- Date: 2026-05-18
-- Purpose: Allow direct linkage between a clase and a specific route_version,
--          enabling O(1) curriculum resolution instead of fuzzy instrument matching.
--
-- NOTE: This column was applied to the Supabase DB on 2026-05-18.
--       This file exists for documentation and reproducibility only.

ALTER TABLE clases
  ADD COLUMN IF NOT EXISTS route_version_id UUID NULL
    REFERENCES route_versions(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_clases_route_version_id
  ON clases(route_version_id);

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * WU #1 — Schema: objetivos tier + route_status enum.
 *
 * No hay Postgres local disponible en este entorno (Docker no corre), así
 * que estas pruebas validan la ESTRUCTURA y las INVARIANTES de seguridad de
 * las migraciones (aditivas, balanceadas, sin romper el esquema real de
 * producción) en lugar de un apply/rollback real contra una base de datos.
 *
 * Antes de mergear a producción, estas migraciones deben correrse contra un
 * staging real de SOI_DDBB_EL_SISTEMAPC (supabase db push --dry-run o
 * equivalente) — ver design.md, sección Rollback.
 */

const MIGRATIONS_DIR = resolve(__dirname, '../../../supabase/migrations')

function readMigration(filename) {
  return readFileSync(resolve(MIGRATIONS_DIR, filename), 'utf8')
}

describe('migration: 20260704_000001_create_objetivos_tier.sql', () => {
  const sql = readMigration('20260704_000001_create_objetivos_tier.sql')

  it('creates the objetivos table additively (IF NOT EXISTS)', () => {
    expect(sql).toMatch(/CREATE TABLE IF NOT EXISTS public\.objetivos/)
  })

  it('links objetivos to nodes via node_id FK', () => {
    expect(sql).toMatch(/node_id uuid NOT NULL REFERENCES public\.nodes\(id\)/)
  })

  it('adds indicators.objetivo_id as an additive nullable FK (no data loss on existing 4163 rows)', () => {
    expect(sql).toMatch(
      /ALTER TABLE public\.indicators\s+ADD COLUMN IF NOT EXISTS objetivo_id uuid REFERENCES public\.objetivos\(id\)/,
    )
    // Debe ser aditiva/nullable: exigir NOT NULL rompería los indicadores
    // existentes que aún no tengan objetivo asignado por el backfill.
    expect(sql).not.toMatch(/objetivo_id uuid NOT NULL/)
  })

  it('backfills a default objetivo per node from legacy nodes.objective', () => {
    expect(sql).toMatch(/INSERT INTO public\.objetivos/)
    expect(sql).toMatch(/UPDATE public\.indicators/)
  })

  it('enables RLS on objetivos', () => {
    expect(sql).toMatch(/ALTER TABLE public\.objetivos ENABLE ROW LEVEL SECURITY/)
  })

  it('has balanced DO $$ ... END $$ blocks', () => {
    const doBlocks = (sql.match(/DO \$\$/g) || []).length
    const endBlocks = (sql.match(/END \$\$/g) || []).length
    expect(doBlocks).toBeGreaterThan(0)
    expect(doBlocks).toBe(endBlocks)
  })
})

describe('migration: 20260704_000002_route_status_enum.sql', () => {
  const sql = readMigration('20260704_000002_route_status_enum.sql')

  it('extends the REAL production enum values (draft/published/archived), not aspirational Spanish names', () => {
    // route_status en prod = ('draft','published','archived') — ver
    // ruta-academica-tables.sql. Esta migración NO debe asumir 'publicada'.
    expect(sql).not.toMatch(/'publicada'/)
  })

  it('adds propuesta and devuelta as new enum values guarded by existence checks', () => {
    expect(sql).toMatch(/ALTER TYPE route_status ADD VALUE 'propuesta'/)
    expect(sql).toMatch(/ALTER TYPE route_status ADD VALUE 'devuelta'/)
    expect(sql).toMatch(/JOIN pg_enum e ON e\.enumtypid = t\.oid/)
  })

  it('adds authorship columns to route_versions additively with safe defaults', () => {
    expect(sql).toMatch(/ADD COLUMN IF NOT EXISTS origen text NOT NULL DEFAULT 'acm'/)
    expect(sql).toMatch(/ADD COLUMN IF NOT EXISTS propuesta_por uuid REFERENCES public\.maestros\(id\)/)
    expect(sql).toMatch(/ADD COLUMN IF NOT EXISTS clase_id uuid REFERENCES public\.clases\(id\)/)
    expect(sql).toMatch(/ADD COLUMN IF NOT EXISTS feedback text/)
  })

  it('enforces that maestro-origin proposals always carry an author and a class', () => {
    expect(sql).toMatch(/route_versions_origen_maestro_check/)
    expect(sql).toMatch(/origen <> 'maestro'/)
  })

  it('adds a maestro INSERT-only policy that cannot set status beyond propuesta', () => {
    expect(sql).toMatch(/CREATE POLICY maestro_insert_propuesta/)
    expect(sql).toMatch(/FOR INSERT/)
    expect(sql).toMatch(/status = 'propuesta'/)
  })

  it('does not grant maestro UPDATE policy on route_versions status', () => {
    expect(sql).not.toMatch(/CREATE POLICY[^;]*maestro[^;]*FOR UPDATE/s)
  })

  it('has balanced DO $$ ... END $$ blocks', () => {
    const doBlocks = (sql.match(/DO \$\$/g) || []).length
    const endBlocks = (sql.match(/END \$\$/g) || []).length
    expect(doBlocks).toBeGreaterThan(0)
    expect(doBlocks).toBe(endBlocks)
  })
})

describe('migration: 20260704_000003_fn_objetivo_actual_alumno.sql', () => {
  const sql = readMigration('20260704_000003_fn_objetivo_actual_alumno.sql')

  it('creates the function with the exact signature (student_id, route_version_id) -> json', () => {
    expect(sql).toMatch(
      /CREATE OR REPLACE FUNCTION public\.fn_objetivo_actual_alumno\(\s*p_student_id uuid,\s*p_route_version_id uuid\s*\)\s*RETURNS json/,
    )
  })

  it('walks the real hierarchy levels -> nodes -> objetivos -> indicators', () => {
    expect(sql).toMatch(/FROM public\.levels lv/)
    expect(sql).toMatch(/JOIN public\.nodes n ON n\.level_id = lv\.id/)
    expect(sql).toMatch(/JOIN public\.objetivos o ON o\.node_id = n\.id/)
    expect(sql).toMatch(/FROM public\.indicators i/)
  })

  it('scopes required indicators using the REAL is_required column (not an aspirational es_requerido)', () => {
    expect(sql).toMatch(/i\.is_required/)
    expect(sql).not.toMatch(/i\.es_requerido/)
  })

  it('filters approved attempts using the REAL indicator_attempts columns (student_id, result)', () => {
    expect(sql).toMatch(/FROM public\.indicator_attempts ia/)
    expect(sql).toMatch(/ia\.student_id = p_student_id/)
    expect(sql).toMatch(/ia\.result = 'approved'/)
  })

  it('orders by level_number, node order, objetivo order to pick the FIRST pending objective', () => {
    expect(sql).toMatch(/ORDER BY oo\.level_number, oo\.node_order, oo\.objetivo_order/)
    expect(sql).toMatch(/LIMIT 1/)
  })

  it('returns an explicit null-shaped json when there is no pending objective (route completed or empty)', () => {
    expect(sql).toMatch(/IF v_result IS NULL THEN/)
    expect(sql).toMatch(/'objetivo_actual_id', NULL/)
  })

  it('grants EXECUTE to authenticated role', () => {
    expect(sql).toMatch(/GRANT EXECUTE ON FUNCTION public\.fn_objetivo_actual_alumno\(uuid, uuid\) TO authenticated/)
  })
})

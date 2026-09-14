import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const migrationPath = resolve(process.cwd(), 'supabase/migrations/20260914160601_repertoire_engine_foundation.sql')

describe('repertoire foundation migration contract', () => {
  it('defines the permanent work/version/montaje hierarchy and preparation primitives', async () => {
    const sql = await readFile(migrationPath, 'utf8')
    for (const table of ['obras', 'obra_versiones', 'montajes', 'montaje_secciones', 'montaje_filas', 'montaje_alumnos', 'obra_compases', 'montaje_compases']) {
      expect(sql).toContain(`public.${table}`)
    }
    expect(sql).toContain("'DESCONOCIDO'")
    expect(sql).toContain("'SIN_EVALUAR'")
    expect(sql).toContain('ENABLE ROW LEVEL SECURITY')
  })

  it('does not contain destructive production operations', async () => {
    const sql = await readFile(migrationPath, 'utf8')
    expect(sql).not.toMatch(/\bDROP\s+TABLE\b/i)
    expect(sql).not.toMatch(/\bTRUNCATE\b/i)
  })
})

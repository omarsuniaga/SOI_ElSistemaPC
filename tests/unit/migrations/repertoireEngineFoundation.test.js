import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const migrationPath = resolve(process.cwd(), 'supabase/migrations/20260914160601_repertoire_engine_foundation.sql')
const studentMigrationPath = resolve(process.cwd(), 'supabase/migrations/20260914173531_repertoire_student_overrides.sql')
const passageMigrationPath = resolve(process.cwd(), 'supabase/migrations/20260914174948_repertoire_passages_linked_measures.sql')
const sessionMigrationPath = resolve(process.cwd(), 'supabase/migrations/20260914192916_repertoire_session_work.sql')

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

  it('defines individual preparation overrides independently from row state', async () => {
    const sql = await readFile(studentMigrationPath, 'utf8')
    expect(sql).toContain('public.montaje_alumno_compases')
    expect(sql).toContain('montaje_alumno_id')
    expect(sql).toContain('montaje_compas_id')
    expect(sql).toContain('ENABLE ROW LEVEL SECURITY')
    expect(sql).toContain('nunca se modifica por cambios colectivos de fila')
    expect(sql).not.toMatch(/\bDROP\s+TABLE\b/i)
  })

  it('defines reversible pedagogical passages and linked measure groups', async () => {
    const sql = await readFile(passageMigrationPath, 'utf8')
    for (const table of ['montaje_pasajes', 'montaje_pasaje_compases', 'montaje_grupos_compases', 'montaje_grupo_compases']) expect(sql).toContain(`public.${table}`)
    expect(sql).toContain('ENABLE ROW LEVEL SECURITY')
    expect(sql).toContain('separados de las marcas de ensayo')
    expect(sql).not.toMatch(/\bDROP\s+TABLE\b|\bTRUNCATE\b/i)
  })

  it('keeps event integration deferred and links session work additively', async () => {
    const foundation = await readFile(migrationPath, 'utf8')
    const sql = await readFile(sessionMigrationPath, 'utf8')
    expect(foundation).toContain('evento_id uuid,')
    expect(foundation).not.toContain('REFERENCES public.eventos_conciertos')
    for (const table of ['sesion_repertorio_trabajos', 'sesion_repertorio_trabajo_compases', 'observacion_sesion_repertorio']) expect(sql).toContain(`public.${table}`)
    expect(sql).toContain('sesiones_clase(id)')
    expect(sql).toContain('observaciones_sesion(id)')
    expect(sql).not.toMatch(/DROP\s+TABLE|TRUNCATE|CASCADE/i)
  })
})

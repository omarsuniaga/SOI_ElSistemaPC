import { describe, it, expect, beforeAll } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

/**
 * migration.maestroRoutesCoordinadorAcmRls.test.js — Spec A-03
 * (openspec/changes/juego-gamificado-planificacion)
 *
 * Auditoría previa (pg_policy contra la base real) confirmó que
 * maestro_routes/maestro_unidades/maestro_objetivos/maestro_indicadores/
 * indicador_prerequisito solo daban acceso al maestro dueño — ni admin
 * (salvo un SELECT suelto) ni coordinador académico tenían acceso. Esta
 * migración agrega `es_admin() OR es_coordinador_acm()` a las 19 políticas
 * de las 5 tablas, preservando la condición de dueño existente.
 */

const MIGRATION_PATH = resolve(
  process.cwd(),
  'supabase/migrations/20260816025531_maestro_routes_coordinador_acm_rls.sql',
)

let sql

beforeAll(() => {
  try {
    sql = readFileSync(MIGRATION_PATH, 'utf-8')
  } catch {
    sql = null
  }
})

const TABLES_AND_POLICIES = {
  maestro_routes: ['maestro_routes_select', 'maestro_routes_insert', 'maestro_routes_update', 'maestro_routes_delete'],
  maestro_unidades: ['maestro_unidades_select', 'maestro_unidades_write', 'maestro_unidades_update', 'maestro_unidades_delete'],
  maestro_objetivos: ['maestro_objetivos_select', 'maestro_objetivos_write', 'maestro_objetivos_update', 'maestro_objetivos_delete'],
  maestro_indicadores: ['maestro_indicadores_select', 'maestro_indicadores_write', 'maestro_indicadores_update', 'maestro_indicadores_delete'],
  indicador_prerequisito: ['indicador_prerequisito_select', 'indicador_prerequisito_write', 'indicador_prerequisito_delete'],
}

describe('Migration: 20260816025531_maestro_routes_coordinador_acm_rls.sql', () => {
  it('should exist at the expected path', () => {
    expect(sql).not.toBeNull()
  })

  it('should have a commented DOWN block at the end of the file', () => {
    expect(sql).toMatch(/--\s*={5,}\s*\n--\s*DOWN\s*\n--\s*={5,}/i)
  })

  for (const [table, policies] of Object.entries(TABLES_AND_POLICIES)) {
    describe(`${table}`, () => {
      for (const policyName of policies) {
        it(`${policyName} should DROP+CREATE with es_admin() OR es_coordinador_acm(), preserving the owner condition`, () => {
          expect(sql).toMatch(new RegExp(`DROP\\s+POLICY\\s+IF\\s+EXISTS\\s+"${policyName}"\\s+ON\\s+${table}`, 'i'))

          const createMatch = sql.match(
            new RegExp(`CREATE\\s+POLICY\\s+"${policyName}"[\\s\\S]*?;`, 'i'),
          )
          expect(createMatch).not.toBeNull()
          expect(createMatch[0]).toMatch(/es_admin\(\)/i)
          expect(createMatch[0]).toMatch(/es_coordinador_acm\(\)/i)
          expect(createMatch[0]).toMatch(/maestros\.user_id|WHERE user_id = auth\.uid\(\)/i)
        })
      }
    })
  }

  it('should not weaken any policy to AND instead of OR (owner access must be preserved unconditionally)', () => {
    // Cada bloque CREATE POLICY debe usar "OR", nunca "AND", entre las 3 condiciones.
    const blocks = sql.match(/CREATE\s+POLICY[\s\S]*?;/gi) || []
    expect(blocks.length).toBeGreaterThan(0)
    for (const block of blocks) {
      if (block.includes('es_coordinador_acm()')) {
        expect(block).not.toMatch(/es_admin\(\)\s+AND\s+es_coordinador_acm\(\)/i)
      }
    }
  })
})

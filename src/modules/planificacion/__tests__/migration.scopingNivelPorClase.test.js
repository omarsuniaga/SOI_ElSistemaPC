import { describe, it, expect, beforeAll } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

/**
 * migration.scopingNivelPorClase.test.js — Tarea 1.7
 * (openspec/changes/mapa-gamificado-planificacion, REQ-01, design.md
 * sección "RLS concreta" / "Scoping de nivel a nivel de datos").
 *
 * Mismo patrón de guard-test que el resto de la Fase 1: el trigger
 * SOI-MAPA-02 solo puede validarse de verdad contra un Postgres real (no
 * ejecutable desde Vitest), así que se verifica la ESTRUCTURA del SQL,
 * incluyendo el nombre de columna real de acm_active_routes (`group_id`,
 * confirmado vía grep contra 20260629_acm_curriculum_governance.sql — NO se
 * asume, se verificó, misma disciplina que el spike 0.1).
 */

const MIGRATION_PATH = resolve(process.cwd(), 'supabase/migrations/20260731000007_scoping_nivel_por_clase.sql')

let sql

beforeAll(() => {
  try {
    sql = readFileSync(MIGRATION_PATH, 'utf-8')
  } catch {
    sql = null
  }
})

describe('Migration: 20260731000007_scoping_nivel_por_clase.sql', () => {
  it('should exist at the expected path', () => {
    expect(sql).not.toBeNull()
  })

  it('should have a commented DOWN block dropping the trigger and function', () => {
    expect(sql).toMatch(/--\s*={5,}\s*\n--\s*DOWN\s*\n--\s*={5,}/i)
    expect(sql).toMatch(/--\s*DROP\s+TRIGGER\s+IF\s+EXISTS/i)
    expect(sql).toMatch(/--\s*DROP\s+FUNCTION\s+IF\s+EXISTS/i)
  })

  it('should define a trigger function that validates against acm_active_routes', () => {
    expect(sql).toMatch(/CREATE\s+(OR\s+REPLACE\s+)?FUNCTION\s+public\.\w+\s*\(\s*\)\s*\nRETURNS\s+TRIGGER/i)
    expect(sql).toMatch(/acm_active_routes/i)
  })

  it('should check group_id = NEW.clase_id (real column name, verified against acm_curriculum_governance)', () => {
    expect(sql).toMatch(/ar\.group_id\s*=\s*NEW\.clase_id/i)
  })

  it('should check level_id = NEW.level_id AND status = active', () => {
    expect(sql).toMatch(/ar\.level_id\s*=\s*NEW\.level_id/i)
    expect(sql).toMatch(/ar\.status\s*=\s*'active'/i)
  })

  it("should RAISE EXCEPTION 'SOI-MAPA-02: nivel no asignado a la clase' when the EXISTS check fails", () => {
    expect(sql).toMatch(/RAISE\s+EXCEPTION\s+'SOI-MAPA-02:\s+nivel\s+no\s+asignado\s+a\s+la\s+clase'/i)
  })

  it('should attach the trigger BEFORE INSERT OR UPDATE ON clase_mapa_objetivos', () => {
    expect(sql).toMatch(
      /CREATE\s+TRIGGER\s+\S+\s+BEFORE\s+INSERT\s+OR\s+UPDATE\s+ON\s+public\.clase_mapa_objetivos/i
    )
  })

  it('should fire FOR EACH ROW', () => {
    expect(sql).toMatch(/FOR\s+EACH\s+ROW\s+EXECUTE\s+FUNCTION/i)
  })
})

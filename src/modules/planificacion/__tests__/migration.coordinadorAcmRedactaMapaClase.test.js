import { describe, it, expect, beforeAll } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

/**
 * Migration validation tests for
 * 20260816000000_coordinador_acm_redacta_mapa_clase.sql
 *
 * Estas pruebas verifican la ESTRUCTURA del archivo SQL sin ejecutarlo
 * contra una base de datos — mismo patrón que
 * migration.evaluacionIndicadorClaseScope.test.js.
 *
 * BUG corregido: es_coordinador_acm() (20260731000006_sesion_bitacora.sql)
 * comparaba contra el rol 'coordinador_academico', pero el CHECK constraint
 * real de public.profiles.rol (20260622_audiciones_integration_fixes.sql,
 * 20260719_fix_profiles_schema_and_triggers.sql) solo permite el valor
 * 'coordinacion_academica'. Ese rol nunca podía asignarse a ningún perfil.
 */

const MIGRATION_PATH = resolve(
  process.cwd(),
  'supabase/migrations/20260816000000_coordinador_acm_redacta_mapa_clase.sql'
)

let sql

beforeAll(() => {
  try {
    sql = readFileSync(MIGRATION_PATH, 'utf-8')
  } catch {
    sql = null
  }
})

describe('Migration: 20260816000000_coordinador_acm_redacta_mapa_clase.sql', () => {
  describe('File existence', () => {
    it('should exist at the expected path', () => {
      expect(sql).not.toBeNull()
    })
  })

  describe('DOWN block (rollback documentation, repo convention)', () => {
    it('should have a commented DOWN block at the end of the file', () => {
      expect(sql).toMatch(/--\s*={5,}\s*\n--\s*DOWN\s*\n--\s*={5,}/i)
    })
  })

  describe('Fix: es_coordinador_acm() usa el rol real de la CHECK constraint', () => {
    it('should compare against "coordinacion_academica", not "coordinador_academico"', () => {
      const fnMatch = sql.match(/CREATE\s+OR\s+REPLACE\s+FUNCTION\s+public\.es_coordinador_acm[\s\S]*?\$\$;/i)
      expect(fnMatch).not.toBeNull()
      expect(fnMatch[0]).toMatch(/'coordinacion_academica'/)
      expect(fnMatch[0]).not.toMatch(/'coordinador_academico'/)
    })

    it('should still allow admin (fail-closed otherwise)', () => {
      const fnMatch = sql.match(/CREATE\s+OR\s+REPLACE\s+FUNCTION\s+public\.es_coordinador_acm[\s\S]*?\$\$;/i)
      expect(fnMatch[0]).toMatch(/'admin'/)
    })
  })

  describe('RLS: clase_mapa_objetivos/indicadores escribibles por coordinador ACM', () => {
    it('clase_mapa_objetivos_owner policy should include es_coordinador_acm() without dropping es_maestro_titular_de_clase', () => {
      const policyMatch = sql.match(/CREATE\s+POLICY\s+"clase_mapa_objetivos_owner"[\s\S]*?;/i)
      expect(policyMatch).not.toBeNull()
      expect(policyMatch[0]).toMatch(/es_coordinador_acm\(\)/i)
      expect(policyMatch[0]).toMatch(/es_maestro_titular_de_clase\(clase_id\)/i)
      expect(policyMatch[0]).toMatch(/es_admin\(\)/i)
    })

    it('clase_mapa_indicadores_owner policy should include es_coordinador_acm() without dropping es_maestro_titular_de_clase', () => {
      const policyMatch = sql.match(/CREATE\s+POLICY\s+"clase_mapa_indicadores_owner"[\s\S]*?;/i)
      expect(policyMatch).not.toBeNull()
      expect(policyMatch[0]).toMatch(/es_coordinador_acm\(\)/i)
      expect(policyMatch[0]).toMatch(/es_maestro_titular_de_clase\(clase_id\)/i)
    })

    it('should DROP POLICY IF EXISTS before recreating both policies (idempotent)', () => {
      expect(sql).toMatch(/DROP\s+POLICY\s+IF\s+EXISTS\s+"clase_mapa_objetivos_owner"/i)
      expect(sql).toMatch(/DROP\s+POLICY\s+IF\s+EXISTS\s+"clase_mapa_indicadores_owner"/i)
    })
  })
})

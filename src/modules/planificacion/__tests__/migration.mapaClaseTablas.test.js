import { describe, it, expect, beforeAll } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

/**
 * Migration validation tests for 20260731000001_mapa_clase_tablas.sql
 * (openspec/changes/mapa-gamificado-planificacion, Tarea 1.1).
 * These tests verify the SQL migration file structure WITHOUT running it
 * against a database — same pattern as migration.tablas.test.js.
 */

const MIGRATION_PATH = resolve(
  process.cwd(),
  'supabase/migrations/20260731000001_mapa_clase_tablas.sql'
)

let sql

beforeAll(() => {
  try {
    sql = readFileSync(MIGRATION_PATH, 'utf-8')
  } catch {
    sql = null
  }
})

const P = (name) => `(public\\.)?${name}`

describe('Migration: 20260731000001_mapa_clase_tablas.sql', () => {
  describe('File existence', () => {
    it('should exist at the expected path', () => {
      expect(sql).not.toBeNull()
    })
  })

  describe('DOWN block (rollback documentation, repo convention)', () => {
    it('should have a commented DOWN block at the end of the file', () => {
      expect(sql).toMatch(/--\s*={5,}\s*\n--\s*DOWN\s*\n--\s*={5,}/i)
    })

    it('DOWN block should include DROP TABLE for both new tables', () => {
      expect(sql).toMatch(/--\s*DROP\s+TABLE\s+IF\s+EXISTS\s+public\.clase_mapa_indicadores/i)
      expect(sql).toMatch(/--\s*DROP\s+TABLE\s+IF\s+EXISTS\s+public\.clase_mapa_objetivos/i)
    })

    it('DOWN block should include DROP FUNCTION for both RLS helpers', () => {
      expect(sql).toMatch(/--\s*DROP\s+FUNCTION\s+IF\s+EXISTS\s+public\.es_maestro_titular_de_clase\(uuid\)/i)
      expect(sql).toMatch(/--\s*DROP\s+FUNCTION\s+IF\s+EXISTS\s+public\.es_maestro_de_clase\(uuid\)/i)
    })

    it('DOWN block should include DROP POLICY for the owner policies', () => {
      expect(sql).toMatch(/--\s*DROP\s+POLICY\s+IF\s+EXISTS\s+"clase_mapa_objetivos_owner"/i)
      expect(sql).toMatch(/--\s*DROP\s+POLICY\s+IF\s+EXISTS\s+"clase_mapa_indicadores_owner"/i)
    })
  })

  describe('RLS helper functions (REQ-13, design.md "RLS concreta")', () => {
    it('should define es_maestro_titular_de_clase(p_clase_id uuid) STABLE SECURITY DEFINER', () => {
      expect(sql).toMatch(/CREATE\s+OR\s+REPLACE\s+FUNCTION\s+public\.es_maestro_titular_de_clase\(p_clase_id\s+uuid\)/i)
      expect(sql).toMatch(/es_maestro_titular_de_clase[\s\S]*?SECURITY\s+DEFINER/i)
    })

    it('titular helper should check maestro_principal_id and maestro_id only (no suplente)', () => {
      const fnMatch = sql.match(/CREATE\s+OR\s+REPLACE\s+FUNCTION\s+public\.es_maestro_titular_de_clase[\s\S]*?\$\$;/i)
      expect(fnMatch).not.toBeNull()
      expect(fnMatch[0]).toMatch(/maestro_principal_id/i)
      expect(fnMatch[0]).not.toMatch(/maestro_suplente_id/i)
    })

    it('should define es_maestro_de_clase(p_clase_id uuid) including suplente', () => {
      expect(sql).toMatch(/CREATE\s+OR\s+REPLACE\s+FUNCTION\s+public\.es_maestro_de_clase\(p_clase_id\s+uuid\)/i)
      const fnMatch = sql.match(/CREATE\s+OR\s+REPLACE\s+FUNCTION\s+public\.es_maestro_de_clase[\s\S]*?\$\$;/i)
      expect(fnMatch).not.toBeNull()
      expect(fnMatch[0]).toMatch(/maestro_suplente_id/i)
    })

    it('should GRANT EXECUTE on both helpers to authenticated', () => {
      expect(sql).toMatch(/GRANT\s+EXECUTE\s+ON\s+FUNCTION\s+public\.es_maestro_titular_de_clase\(uuid\)\s+TO\s+authenticated/i)
      expect(sql).toMatch(/GRANT\s+EXECUTE\s+ON\s+FUNCTION\s+public\.es_maestro_de_clase\(uuid\)\s+TO\s+authenticated/i)
    })
  })

  describe('clase_mapa_objetivos table (Decisión 1)', () => {
    it('should CREATE TABLE clase_mapa_objetivos', () => {
      expect(sql).toMatch(new RegExp(`CREATE\\s+TABLE\\s+${P('clase_mapa_objetivos')}\\s*\\(`, 'i'))
    })

    it('should have clase_id NOT NULL FK to clases ON DELETE CASCADE', () => {
      expect(sql).toMatch(/clase_id\s+uuid\s+NOT\s+NULL\s+REFERENCES\s+public\.clases\(id\)\s+ON\s+DELETE\s+CASCADE/i)
    })

    it('should have level_id NOT NULL FK to levels ON DELETE RESTRICT', () => {
      expect(sql).toMatch(/level_id\s+uuid\s+NOT\s+NULL\s+REFERENCES\s+public\.levels\(id\)\s+ON\s+DELETE\s+RESTRICT/i)
    })

    it('should have nullable origen_node_id and origen_objetivo_id (clonado opcional)', () => {
      expect(sql).toMatch(/origen_node_id\s+uuid\s+REFERENCES\s+public\.nodes\(id\)\s+ON\s+DELETE\s+SET\s+NULL/i)
      expect(sql).toMatch(/origen_objetivo_id\s+uuid\s+REFERENCES\s+public\.objetivos\(id\)\s+ON\s+DELETE\s+SET\s+NULL/i)
    })

    it('should have orden_objetivo integer NOT NULL (inmutable, tramo 2 del ID jerárquico)', () => {
      expect(sql).toMatch(/orden_objetivo\s+integer\s+NOT\s+NULL/i)
    })

    it('should have UNIQUE (clase_id, level_id, orden_objetivo)', () => {
      expect(sql).toMatch(/UNIQUE\s*\(\s*clase_id\s*,\s*level_id\s*,\s*orden_objetivo\s*\)/i)
    })

    it('should have created_by NOT NULL FK to maestros', () => {
      expect(sql).toMatch(/created_by\s+uuid\s+NOT\s+NULL\s+REFERENCES\s+public\.maestros\(id\)/i)
    })

    it('should have RLS enabled', () => {
      expect(sql).toMatch(new RegExp(`ALTER\\s+TABLE\\s+${P('clase_mapa_objetivos')}\\s+ENABLE\\s+ROW\\s+LEVEL\\s+SECURITY`, 'i'))
    })
  })

  describe('clase_mapa_indicadores table (Decisión 1)', () => {
    it('should CREATE TABLE clase_mapa_indicadores', () => {
      expect(sql).toMatch(new RegExp(`CREATE\\s+TABLE\\s+${P('clase_mapa_indicadores')}\\s*\\(`, 'i'))
    })

    it('should have objetivo_id NOT NULL FK to clase_mapa_objetivos ON DELETE RESTRICT', () => {
      expect(sql).toMatch(/objetivo_id\s+uuid\s+NOT\s+NULL\s+REFERENCES\s+public\.clase_mapa_objetivos\(id\)\s+ON\s+DELETE\s+RESTRICT/i)
    })

    it('should have clase_id NOT NULL (denormalizado, sin JOIN para RLS)', () => {
      expect(sql).toMatch(/clase_id\s+uuid\s+NOT\s+NULL\s+REFERENCES\s+public\.clases\(id\)\s+ON\s+DELETE\s+CASCADE/i)
    })

    it('should have id_jerarquico text NOT NULL column', () => {
      expect(sql).toMatch(/id_jerarquico\s+text\s+NOT\s+NULL/i)
    })

    it('should have UNIQUE (objetivo_id, orden_indicador) and UNIQUE (clase_id, id_jerarquico)', () => {
      expect(sql).toMatch(/UNIQUE\s*\(\s*objetivo_id\s*,\s*orden_indicador\s*\)/i)
      expect(sql).toMatch(/UNIQUE\s*\(\s*clase_id\s*,\s*id_jerarquico\s*\)/i)
    })

    it('should have es_requerido boolean NOT NULL DEFAULT true', () => {
      expect(sql).toMatch(/es_requerido\s+boolean\s+NOT\s+NULL\s+DEFAULT\s+true/i)
    })

    it('should have RLS enabled', () => {
      expect(sql).toMatch(new RegExp(`ALTER\\s+TABLE\\s+${P('clase_mapa_indicadores')}\\s+ENABLE\\s+ROW\\s+LEVEL\\s+SECURITY`, 'i'))
    })
  })

  describe('RLS owner policies — solo titular (diseño de estructura, no sesión)', () => {
    it('clase_mapa_objetivos_owner policy should use es_maestro_titular_de_clase', () => {
      const policyMatch = sql.match(/CREATE\s+POLICY\s+"clase_mapa_objetivos_owner"[\s\S]*?;/i)
      expect(policyMatch).not.toBeNull()
      expect(policyMatch[0]).toMatch(/es_maestro_titular_de_clase\(clase_id\)/i)
      expect(policyMatch[0]).toMatch(/es_admin\(\)/i)
    })

    it('clase_mapa_indicadores_owner policy should use es_maestro_titular_de_clase', () => {
      const policyMatch = sql.match(/CREATE\s+POLICY\s+"clase_mapa_indicadores_owner"[\s\S]*?;/i)
      expect(policyMatch).not.toBeNull()
      expect(policyMatch[0]).toMatch(/es_maestro_titular_de_clase\(clase_id\)/i)
    })
  })

  describe('Índices', () => {
    it('should index clase_id on both tables', () => {
      expect(sql).toMatch(/idx_cmo_clase\s+ON\s+(public\.)?clase_mapa_objetivos\(clase_id\)/i)
      expect(sql).toMatch(/idx_cmi_clase\s+ON\s+(public\.)?clase_mapa_indicadores\(clase_id\)/i)
    })

    it('should index objetivo_id on clase_mapa_indicadores', () => {
      expect(sql).toMatch(/idx_cmi_objetivo\s+ON\s+(public\.)?clase_mapa_indicadores\(objetivo_id\)/i)
    })
  })
})

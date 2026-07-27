import { describe, it, expect, beforeAll } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

/**
 * Migration validation tests for planificacion_rediseño_tablas.sql
 * These tests verify the SQL migration file structure WITHOUT running it against a database.
 * They ensure the migration is well-formed and contains all required elements.
 */

const MIGRATION_PATH = resolve(
  process.cwd(),
  'supabase/migrations/20260722000001_planificacion_rediseño_tablas.sql'
)

let sql

beforeAll(() => {
  try {
    sql = readFileSync(MIGRATION_PATH, 'utf-8')
  } catch {
    sql = null
  }
})

// Helper: matches table name with optional public. schema prefix
const P = (name) => `(public\\.)?${name}`

describe('Migration: planificacion_rediseño_tablas.sql', () => {
  describe('File existence', () => {
    it('should exist at the expected path', () => {
      expect(sql).not.toBeNull()
    })
  })

  describe('class_curriculum_plan table', () => {
    it('should CREATE TABLE class_curriculum_plan', () => {
      expect(sql).toMatch(new RegExp(`CREATE\\s+TABLE\\s+(IF\\s+NOT\\s+EXISTS\\s+)?${P('class_curriculum_plan')}\\s*\\(`, 'i'))
    })

    it('should have id UUID PRIMARY KEY with gen_random_uuid()', () => {
      expect(sql).toMatch(/id\s+UUID\s+DEFAULT\s+gen_random_uuid\(\)\s+PRIMARY\s+KEY/i)
    })

    it('should have clase_id UUID NOT NULL with FK to clases ON DELETE CASCADE', () => {
      expect(sql).toMatch(/clase_id\s+UUID\s+NOT\s+NULL\s+REFERENCES\s+public\.clases\(id\)\s+ON\s+DELETE\s+CASCADE/i)
    })

    it('should have route_version_id UUID NOT NULL with FK to route_versions ON DELETE RESTRICT', () => {
      expect(sql).toMatch(/route_version_id\s+UUID\s+NOT\s+NULL\s+REFERENCES\s+public\.route_versions\(id\)\s+ON\s+DELETE\s+RESTRICT/i)
    })

    it('should have estado TEXT with CHECK constraint for borrador/activo/archivado', () => {
      expect(sql).toMatch(/estado\s+TEXT\s+DEFAULT\s+'borrador'/i)
      expect(sql).toMatch(/CHECK\s*\(\s*estado\s+IN\s*\(\s*'borrador'\s*,\s*'activo'\s*,\s*'archivado'\s*\)\s*\)/i)
    })

    it('should have created_at and updated_at TIMESTAMPTZ DEFAULT NOW()', () => {
      expect(sql).toMatch(/created_at\s+TIMESTAMPTZ\s+DEFAULT\s+NOW\(\)/i)
      expect(sql).toMatch(/updated_at\s+TIMESTAMPTZ\s+DEFAULT\s+NOW\(\)/i)
    })

    it('should have UNIQUE partial index on clase_id WHERE estado = activo', () => {
      expect(sql).toMatch(/CREATE\s+UNIQUE\s+INDEX/i)
      expect(sql).toMatch(new RegExp(`ON\\s+${P('class_curriculum_plan')}\\s*\\(\\s*clase_id\\s*\\)\\s+WHERE\\s+estado\\s*=\\s*'activo'`, 'i'))
    })

    it('should have indexes on clase_id and route_version_id', () => {
      expect(sql).toMatch(/idx_ccp_clase\s+ON\s+(public\.)?class_curriculum_plan/i)
      expect(sql).toMatch(/idx_ccp_route\s+ON\s+(public\.)?class_curriculum_plan/i)
    })

    it('should have RLS enabled', () => {
      expect(sql).toMatch(new RegExp(`ALTER\\s+TABLE\\s+${P('class_curriculum_plan')}\\s+ENABLE\\s+ROW\\s+LEVEL\\s+SECURITY`, 'i'))
    })

    it('should have authenticated RLS policies', () => {
      expect(sql).toMatch(new RegExp(`CREATE\\s+POLICY\\s+"authenticated[^"]*"\\s+ON\\s+${P('class_curriculum_plan')}`, 'i'))
    })

    it('should have updated_at trigger', () => {
      expect(sql).toMatch(new RegExp(`CREATE\\s+(OR\\s+REPLACE\\s+)?FUNCTION\\s+${P('update_ccp_timestamp')}`, 'i'))
      expect(sql).toMatch(/CREATE\s+TRIGGER\s+trg_ccp_updated_at/i)
    })
  })

  describe('clase_objetivos table', () => {
    it('should CREATE TABLE clase_objetivos', () => {
      expect(sql).toMatch(new RegExp(`CREATE\\s+TABLE\\s+(IF\\s+NOT\\s+EXISTS\\s+)?${P('clase_objetivos')}\\s*\\(`, 'i'))
    })

    it('should have id UUID PRIMARY KEY', () => {
      const tableMatch = sql.match(new RegExp(`CREATE\\s+TABLE[^;]*${P('clase_objetivos')}[^;]*\\)`, 'is'))
      expect(tableMatch).not.toBeNull()
      expect(tableMatch[0]).toMatch(/id\s+UUID/i)
      expect(tableMatch[0]).toMatch(/PRIMARY\s+KEY/i)
    })

    it('should have planificacion_id FK to planificaciones ON DELETE CASCADE', () => {
      expect(sql).toMatch(/planificacion_id\s+UUID\s+NOT\s+NULL\s+REFERENCES\s+public\.planificaciones\(id\)\s+ON\s+DELETE\s+CASCADE/i)
    })

    it('should have class_curriculum_plan_id FK to class_curriculum_plan ON DELETE CASCADE', () => {
      expect(sql).toMatch(/class_curriculum_plan_id\s+UUID\s+NOT\s+NULL\s+REFERENCES\s+public\.class_curriculum_plan\(id\)\s+ON\s+DELETE\s+CASCADE/i)
    })

    it('should have node_id FK to nodes ON DELETE RESTRICT', () => {
      expect(sql).toMatch(/node_id\s+UUID\s+NOT\s+NULL\s+REFERENCES\s+public\.nodes\(id\)\s+ON\s+DELETE\s+RESTRICT/i)
    })

    it('should have indicator_id FK to indicators ON DELETE RESTRICT', () => {
      expect(sql).toMatch(/indicator_id\s+UUID\s+NOT\s+NULL\s+REFERENCES\s+public\.indicators\(id\)\s+ON\s+DELETE\s+RESTRICT/i)
    })

    it('should have estado CHECK constraint for pendiente/en_progreso/completado', () => {
      expect(sql).toMatch(/CHECK\s*\(\s*estado\s+IN\s*\(\s*'pendiente'\s*,\s*'en_progreso'\s*,\s*'completado'\s*\)\s*\)/i)
    })

    it('should have indexes on planificacion_id, class_curriculum_plan_id, node_id, indicator_id', () => {
      expect(sql).toMatch(/idx_co_plan\s+ON\s+(public\.)?clase_objetivos/i)
      expect(sql).toMatch(/idx_co_ccp\s+ON\s+(public\.)?clase_objetivos/i)
      expect(sql).toMatch(/idx_co_node\s+ON\s+(public\.)?clase_objetivos/i)
      expect(sql).toMatch(/idx_co_indicator\s+ON\s+(public\.)?clase_objetivos/i)
    })

    it('should have RLS enabled', () => {
      expect(sql).toMatch(new RegExp(`ALTER\\s+TABLE\\s+${P('clase_objetivos')}\\s+ENABLE\\s+ROW\\s+LEVEL\\s+SECURITY`, 'i'))
    })
  })

  describe('evaluacion_indicador table', () => {
    it('should CREATE TABLE evaluacion_indicador', () => {
      expect(sql).toMatch(new RegExp(`CREATE\\s+TABLE\\s+(IF\\s+NOT\\s+EXISTS\\s+)?${P('evaluacion_indicador')}\\s*\\(`, 'i'))
    })

    it('should have alumno_id FK to alumnos ON DELETE CASCADE', () => {
      expect(sql).toMatch(/alumno_id\s+UUID\s+NOT\s+NULL\s+REFERENCES\s+public\.alumnos\(id\)\s+ON\s+DELETE\s+CASCADE/i)
    })

    it('should have indicator_id FK to indicators ON DELETE CASCADE', () => {
      expect(sql).toMatch(/evaluacion_indicador[\s\S]*indicator_id\s+UUID\s+NOT\s+NULL\s+REFERENCES\s+public\.indicators\(id\)\s+ON\s+DELETE\s+CASCADE/i)
    })

    it('should have clase_id FK to clases ON DELETE CASCADE', () => {
      expect(sql).toMatch(/clase_id\s+UUID\s+NOT\s+NULL\s+REFERENCES\s+public\.clases\(id\)\s+ON\s+DELETE\s+CASCADE/i)
    })

    it('should have nota INTEGER CHECK BETWEEN 1 AND 5', () => {
      expect(sql).toMatch(/nota\s+INTEGER\s+CHECK\s*\(\s*nota\s+BETWEEN\s+1\s+AND\s+5\s*\)/i)
    })

    it('should have estado CHECK for sin_evaluar/inicia/en_progreso/avanzado/dominado', () => {
      expect(sql).toMatch(/CHECK\s*\(\s*estado\s+IN\s*\(\s*'sin_evaluar'\s*,\s*'inicia'\s*,\s*'en_progreso'\s*,\s*'avanzado'\s*,\s*'dominado'\s*\)\s*\)/i)
    })

    it('should have UNIQUE constraint on (alumno_id, indicator_id, clase_id)', () => {
      expect(sql).toMatch(/UNIQUE\s*\(\s*alumno_id\s*,\s*indicator_id\s*,\s*clase_id\s*\)/i)
    })

    it('should have evaluado_por FK to maestros', () => {
      expect(sql).toMatch(/evaluado_por\s+UUID\s+REFERENCES\s+public\.maestros\(id\)/i)
    })

    it('should have indexes on alumno_id, indicator_id, clase_id, and (clase_id, alumno_id)', () => {
      expect(sql).toMatch(/idx_ei_alumno\s+ON\s+(public\.)?evaluacion_indicador/i)
      expect(sql).toMatch(/idx_ei_indicator\s+ON\s+(public\.)?evaluacion_indicador/i)
      expect(sql).toMatch(/idx_ei_clase\s+ON\s+(public\.)?evaluacion_indicador/i)
      expect(sql).toMatch(/idx_ei_clase_alumno\s+ON\s+(public\.)?evaluacion_indicador/i)
    })

    it('should have RLS enabled', () => {
      expect(sql).toMatch(new RegExp(`ALTER\\s+TABLE\\s+${P('evaluacion_indicador')}\\s+ENABLE\\s+ROW\\s+LEVEL\\s+SECURITY`, 'i'))
    })

    it('should have updated_at trigger', () => {
      expect(sql).toMatch(new RegExp(`CREATE\\s+(OR\\s+REPLACE\\s+)?FUNCTION\\s+${P('update_ei_timestamp')}`, 'i'))
      expect(sql).toMatch(/CREATE\s+TRIGGER\s+trg_ei_updated_at/i)
    })
  })
})

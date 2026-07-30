import { describe, it, expect, beforeAll } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

/**
 * Migration validation tests for
 * 20260731000003_evaluacion_indicador_clase_scope.sql
 * (openspec/changes/mapa-gamificado-planificacion, Tarea 1.3 — priority
 * security bugfix, REQ-13, design.md Decisión 2 + "RLS concreta").
 *
 * These tests verify the SQL migration file structure WITHOUT running it
 * against a database — same pattern as migration.mapaClaseTablas.test.js.
 *
 * BUG CRÍTICO corregido (design.md): las 5 políticas de
 * 20260730000001_deploy_evaluacion_indicador.sql comparan
 * `evaluado_por = auth.uid()`, pero `evaluado_por` es FK a `maestros(id)` y
 * `auth.uid()` es el id de `auth.users` — nunca coinciden. La tabla es hoy
 * inescribible/ilegible para cualquier maestro.
 */

const MIGRATION_PATH = resolve(
  process.cwd(),
  'supabase/migrations/20260731000003_evaluacion_indicador_clase_scope.sql'
)

let sql

beforeAll(() => {
  try {
    sql = readFileSync(MIGRATION_PATH, 'utf-8')
  } catch {
    sql = null
  }
})

describe('Migration: 20260731000003_evaluacion_indicador_clase_scope.sql', () => {
  describe('File existence', () => {
    it('should exist at the expected path', () => {
      expect(sql).not.toBeNull()
    })
  })

  describe('DOWN block (rollback documentation, repo convention)', () => {
    it('should have a commented DOWN block at the end of the file', () => {
      expect(sql).toMatch(/--\s*={5,}\s*\n--\s*DOWN\s*\n--\s*={5,}/i)
    })

    it('DOWN block should drop the view and the new ei_owner policy', () => {
      expect(sql).toMatch(/--\s*DROP\s+VIEW\s+IF\s+EXISTS\s+public\.vw_evaluacion_indicador_global/i)
      expect(sql).toMatch(/--\s*DROP\s+POLICY\s+IF\s+EXISTS\s+"ei_owner"/i)
    })

    it('DOWN block should drop the new column and constraint', () => {
      expect(sql).toMatch(/--\s*DROP\s+CONSTRAINT\s+IF\s+EXISTS\s+ei_una_sola_fuente/i)
      expect(sql).toMatch(/--\s*DROP\s+COLUMN\s+IF\s+EXISTS\s+clase_indicador_id/i)
    })
  })

  describe('BUG CRÍTICO — las 5 políticas rotas ya no están activas', () => {
    it('should DROP POLICY the 4 broken teacher_* policies using auth.uid()', () => {
      expect(sql).toMatch(/DROP\s+POLICY\s+IF\s+EXISTS\s+"teacher_insert_ei"/i)
      expect(sql).toMatch(/DROP\s+POLICY\s+IF\s+EXISTS\s+"teacher_read_own_ei"/i)
      expect(sql).toMatch(/DROP\s+POLICY\s+IF\s+EXISTS\s+"teacher_update_own_ei"/i)
      expect(sql).toMatch(/DROP\s+POLICY\s+IF\s+EXISTS\s+"teacher_delete_own_ei"/i)
    })

    it('should DROP POLICY the admin_read_all_ei policy (folded into ei_owner)', () => {
      expect(sql).toMatch(/DROP\s+POLICY\s+IF\s+EXISTS\s+"admin_read_all_ei"/i)
    })

    it('should NOT define any active policy comparing evaluado_por = auth.uid()', () => {
      // Strip DROP POLICY statements and comments before asserting — only the
      // *active* CREATE POLICY bodies matter for this bug check.
      const activeSql = sql
        .split('\n')
        .filter((line) => !/^\s*--/.test(line))
        .filter((line) => !/DROP\s+POLICY/i.test(line))
        .join('\n')
      expect(activeSql).not.toMatch(/evaluado_por\s*=\s*auth\.uid\(\)/i)
    })
  })

  describe('Nueva política única ei_owner (reemplaza las 5 rotas)', () => {
    it('should CREATE POLICY "ei_owner" FOR ALL', () => {
      expect(sql).toMatch(/CREATE\s+POLICY\s+"ei_owner"\s+ON\s+public\.evaluacion_indicador\s+FOR\s+ALL/i)
    })

    it('USING clause should be es_admin() OR es_maestro_de_clase(clase_id)', () => {
      const policyMatch = sql.match(/CREATE\s+POLICY\s+"ei_owner"[\s\S]*?;/i)
      expect(policyMatch).not.toBeNull()
      expect(policyMatch[0]).toMatch(/USING\s*\(\s*public\.es_admin\(\)\s+OR\s+public\.es_maestro_de_clase\(clase_id\)\s*\)/i)
    })

    it('WITH CHECK clause should require es_maestro_de_clase(clase_id) AND evaluado_por = maestro_actual()', () => {
      const policyMatch = sql.match(/CREATE\s+POLICY\s+"ei_owner"[\s\S]*?;/i)
      expect(policyMatch).not.toBeNull()
      expect(policyMatch[0]).toMatch(
        /WITH\s+CHECK\s*\(\s*public\.es_maestro_de_clase\(clase_id\)\s+AND\s+evaluado_por\s*=\s*public\.maestro_actual\(\)\s*\)/i
      )
    })
  })

  describe('Columna aditiva clase_indicador_id (design.md Decisión 2)', () => {
    it('should ALTER COLUMN indicator_id DROP NOT NULL', () => {
      expect(sql).toMatch(/ALTER\s+COLUMN\s+indicator_id\s+DROP\s+NOT\s+NULL/i)
    })

    it('should ADD COLUMN clase_indicador_id uuid REFERENCES clase_mapa_indicadores ON DELETE RESTRICT', () => {
      expect(sql).toMatch(
        /ADD\s+COLUMN\s+clase_indicador_id\s+uuid\s+REFERENCES\s+public\.clase_mapa_indicadores\(id\)\s+ON\s+DELETE\s+RESTRICT/i
      )
    })

    it('should ADD CONSTRAINT ei_una_sola_fuente CHECK (num_nonnulls(indicator_id, clase_indicador_id) = 1)', () => {
      expect(sql).toMatch(
        /ADD\s+CONSTRAINT\s+ei_una_sola_fuente\s+CHECK\s*\(\s*num_nonnulls\(indicator_id,\s*clase_indicador_id\)\s*=\s*1\s*\)/i
      )
    })
  })

  describe('Índices únicos parciales (reemplazan el UNIQUE original)', () => {
    it('should DROP the original inline UNIQUE constraint (not DROP INDEX — it is constraint-backed, 2BP01)', () => {
      expect(sql).toMatch(
        /DROP\s+CONSTRAINT\s+IF\s+EXISTS\s+evaluacion_indicador_alumno_id_indicator_id_clase_id_key/i
      )
    })

    it('should CREATE UNIQUE INDEX ei_unq_global scoped to indicator_id IS NOT NULL', () => {
      expect(sql).toMatch(
        /CREATE\s+UNIQUE\s+INDEX\s+ei_unq_global\s+ON\s+public\.evaluacion_indicador\(alumno_id,\s*indicator_id,\s*clase_id\)\s+WHERE\s+indicator_id\s+IS\s+NOT\s+NULL/i
      )
    })

    it('should CREATE UNIQUE INDEX ei_unq_clase scoped to clase_indicador_id IS NOT NULL', () => {
      expect(sql).toMatch(
        /CREATE\s+UNIQUE\s+INDEX\s+ei_unq_clase\s+ON\s+public\.evaluacion_indicador\(alumno_id,\s*clase_indicador_id\)\s+WHERE\s+clase_indicador_id\s+IS\s+NOT\s+NULL/i
      )
    })
  })

  describe('Vista vw_evaluacion_indicador_global (fuente única para reportes ACM)', () => {
    it('should CREATE (OR REPLACE) VIEW vw_evaluacion_indicador_global', () => {
      expect(sql).toMatch(/CREATE\s+(OR\s+REPLACE\s+)?VIEW\s+public\.vw_evaluacion_indicador_global/i)
    })

    it('should set security_invoker = true — without it the view bypasses RLS via the owner\'s privileges (Supabase advisor: "Security Definer View")', () => {
      const viewMatch = sql.match(/CREATE\s+(OR\s+REPLACE\s+)?VIEW\s+public\.vw_evaluacion_indicador_global[\s\S]*?AS/i)
      expect(viewMatch).not.toBeNull()
      expect(viewMatch[0]).toMatch(/WITH\s*\(\s*security_invoker\s*=\s*true\s*\)/i)
    })

    it('should expose indicator_id_global as COALESCE(ei.indicator_id, cmi.origen_indicator_id)', () => {
      const viewMatch = sql.match(/CREATE\s+(OR\s+REPLACE\s+)?VIEW\s+public\.vw_evaluacion_indicador_global[\s\S]*?;/i)
      expect(viewMatch).not.toBeNull()
      expect(viewMatch[0]).toMatch(
        /COALESCE\s*\(\s*ei\.indicator_id\s*,\s*cmi\.origen_indicator_id\s*\)\s+AS\s+indicator_id_global/i
      )
    })

    it('should LEFT JOIN clase_mapa_indicadores to resolve origen_indicator_id', () => {
      const viewMatch = sql.match(/CREATE\s+(OR\s+REPLACE\s+)?VIEW\s+public\.vw_evaluacion_indicador_global[\s\S]*?;/i)
      expect(viewMatch).not.toBeNull()
      expect(viewMatch[0]).toMatch(/LEFT\s+JOIN\s+public\.clase_mapa_indicadores\s+cmi/i)
    })
  })

  describe('evaluacion_indicador no se trunca ni se reescribe (§9.3)', () => {
    it('should not contain a TRUNCATE or DELETE FROM evaluacion_indicador statement', () => {
      expect(sql).not.toMatch(/TRUNCATE\s+(TABLE\s+)?(public\.)?evaluacion_indicador/i)
      expect(sql).not.toMatch(/DELETE\s+FROM\s+(public\.)?evaluacion_indicador/i)
    })
  })
})

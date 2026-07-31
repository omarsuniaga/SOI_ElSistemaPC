import { describe, it, expect, beforeAll } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

/**
 * migration.sesionBitacora.test.js — Tarea 1.6
 * (openspec/changes/mapa-gamificado-planificacion, REQ-11/12/16, design.md
 * Decisión 7).
 *
 * Mismo patrón de guard-test que migration.mapaClaseTablas.test.js /
 * migration.evaluacionIndicadorClaseScope.test.js: se verifica la
 * estructura del SQL sin ejecutarlo contra una base de datos real.
 *
 * REQ-12 crítico: sesion_bitacora NO debe tener ninguna FK hacia
 * indicators / clase_mapa_indicadores / evaluacion_indicador — aislamiento
 * ESTRUCTURAL, no solo de comportamiento (una bitácora nunca puede
 * alimentar el cálculo de estrellas).
 */

const MIGRATION_PATH = resolve(process.cwd(), 'supabase/migrations/20260731000006_sesion_bitacora.sql')

let sql

beforeAll(() => {
  try {
    sql = readFileSync(MIGRATION_PATH, 'utf-8')
  } catch {
    sql = null
  }
})

describe('Migration: 20260731000006_sesion_bitacora.sql', () => {
  it('should exist at the expected path', () => {
    expect(sql).not.toBeNull()
  })

  it('should have a commented DOWN block', () => {
    expect(sql).toMatch(/--\s*={5,}\s*\n--\s*DOWN\s*\n--\s*={5,}/i)
    expect(sql).toMatch(/--\s*DROP\s+TABLE\s+IF\s+EXISTS\s+public\.sesion_bitacora/i)
    expect(sql).toMatch(/--\s*DROP\s+FUNCTION\s+IF\s+EXISTS\s+public\.es_coordinador_acm\s*\(\s*\)/i)
  })

  describe('es_coordinador_acm() — helper nuevo (spike 0.1, distinto de es_admin())', () => {
    it('should define es_coordinador_acm() as SECURITY DEFINER plpgsql', () => {
      expect(sql).toMatch(/CREATE\s+(OR\s+REPLACE\s+)?FUNCTION\s+public\.es_coordinador_acm\s*\(\s*\)/i)
      expect(sql).toMatch(/SECURITY\s+DEFINER/i)
    })

    it('should read the role from public.profiles.rol (verified schema, spike 0.1) — NOT usuarios', () => {
      expect(sql).toMatch(/FROM\s+public\.profiles\s+p/i)
      expect(sql).not.toMatch(/FROM\s+public\.usuarios/i)
    })

    it("should check rol IN ('admin', 'coordinador_academico') — excludes inventarista", () => {
      expect(sql).toMatch(/v_role\s+IN\s*\(\s*'admin'\s*,\s*'coordinador_academico'\s*\)/i)
    })

    it('should be fail-closed: COALESCE(..., FALSE)', () => {
      expect(sql).toMatch(/COALESCE\s*\([\s\S]*?,\s*FALSE\s*\)/i)
    })
  })

  describe('Tabla sesion_bitacora (design.md Decisión 7, DDL exacto)', () => {
    it('should CREATE TABLE sesion_bitacora with sesion_id UNIQUE FK', () => {
      expect(sql).toMatch(/CREATE\s+TABLE\s+public\.sesion_bitacora/i)
      expect(sql).toMatch(/sesion_id\s+uuid\s+NOT\s+NULL\s+UNIQUE\s+REFERENCES\s+public\.sesiones_clase\(id\)\s+ON\s+DELETE\s+CASCADE/i)
    })

    it('should have clase_id and maestro_id FKs', () => {
      expect(sql).toMatch(/clase_id\s+uuid\s+NOT\s+NULL\s+REFERENCES\s+public\.clases\(id\)\s+ON\s+DELETE\s+CASCADE/i)
      expect(sql).toMatch(/maestro_id\s+uuid\s+NOT\s+NULL\s+REFERENCES\s+public\.maestros\(id\)/i)
    })

    it('should have texto_libre + texto_ia + the 3 independent toggles with optional detail text', () => {
      expect(sql).toMatch(/texto_libre\s+text\s+NOT\s+NULL\s+DEFAULT\s+''/i)
      expect(sql).toMatch(/texto_ia\s+text/i)
      expect(sql).toMatch(/tareas_enviadas\s+boolean\s+NOT\s+NULL\s+DEFAULT\s+false/i)
      expect(sql).toMatch(/tareas_detalle\s+text/i)
      expect(sql).toMatch(/incidencia_comportamiento\s+boolean\s+NOT\s+NULL\s+DEFAULT\s+false/i)
      expect(sql).toMatch(/incidencia_detalle\s+text/i)
      expect(sql).toMatch(/clase_no_realizada\s+boolean\s+NOT\s+NULL\s+DEFAULT\s+false/i)
      expect(sql).toMatch(/motivo_no_realizada\s+text/i)
    })
  })

  describe('RLS sesion_bitacora — owner RW / ACM read-only, sin política de escritura para ACM', () => {
    it('bitacora_owner: FOR ALL USING/WITH CHECK es_maestro_de_clase(clase_id) AND maestro_id = maestro_actual()', () => {
      const policyMatch = sql.match(/CREATE\s+POLICY\s+"?bitacora_owner"?[\s\S]*?;/i)
      expect(policyMatch).not.toBeNull()
      expect(policyMatch[0]).toMatch(/FOR\s+ALL/i)
      expect(policyMatch[0]).toMatch(
        /es_maestro_de_clase\s*\(\s*clase_id\s*\)\s+AND\s+maestro_id\s*=\s*public\.maestro_actual\(\)/i
      )
    })

    it('bitacora_acm_read: FOR SELECT USING es_coordinador_acm()', () => {
      const policyMatch = sql.match(/CREATE\s+POLICY\s+"?bitacora_acm_read"?[\s\S]*?;/i)
      expect(policyMatch).not.toBeNull()
      expect(policyMatch[0]).toMatch(/FOR\s+SELECT/i)
      expect(policyMatch[0]).toMatch(/USING\s*\(\s*public\.es_coordinador_acm\(\)\s*\)/i)
    })

    it('ACM read policy should NOT grant UPDATE/DELETE/INSERT (no write policy for ACM, REQ-16)', () => {
      const policyMatch = sql.match(/CREATE\s+POLICY\s+"?bitacora_acm_read"?[\s\S]*?;/i)
      expect(policyMatch[0]).not.toMatch(/FOR\s+ALL/i)
      expect(policyMatch[0]).not.toMatch(/WITH\s+CHECK/i)
    })
  })

  describe('REQ-12 — aislamiento estructural: sin arista hacia evaluación/indicadores', () => {
    it('should NOT reference indicators, clase_mapa_indicadores, or evaluacion_indicador anywhere in the file', () => {
      expect(sql).not.toMatch(/\bindicators\b/i)
      expect(sql).not.toMatch(/clase_mapa_indicadores/i)
      expect(sql).not.toMatch(/evaluacion_indicador/i)
    })

    it('should NOT define any trigger other than the updated_at housekeeping trigger', () => {
      const triggerMatches = sql.match(/CREATE\s+TRIGGER\s+(\S+)/gi) || []
      expect(triggerMatches.length).toBeLessThanOrEqual(1)
      if (triggerMatches.length === 1) {
        expect(triggerMatches[0]).toMatch(/updated_at/i)
      }
    })
  })
})

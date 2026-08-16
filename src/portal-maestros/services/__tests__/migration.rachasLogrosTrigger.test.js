import { describe, it, expect, beforeAll } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

/**
 * migration.rachasLogrosTrigger.test.js — Spec B-01/B-02
 * (openspec/changes/juego-gamificado-planificacion)
 *
 * Test de estructura (no ejecuta SQL contra una base real — sigue el mismo
 * patrón que migration.maestroRoutesCoordinadorAcmRls.test.js): verifica que
 * el archivo define las funciones/trigger esperados, con SECURITY DEFINER, y
 * que fn_evaluar_logros_alumno soporta tanto los 3 tipos de criterio ya
 * seedeados en producción (asistencia, ejercicio_aprobado,
 * asistencias_totales) como los 2 anticipados en spec.md
 * (primer_objetivo_completado, primero_en_desbloquear_objetivo).
 */

const MIGRATION_PATH = resolve(process.cwd(), 'supabase/migrations/20260816040000_rachas_logros_trigger.sql')

let sql

beforeAll(() => {
  try {
    sql = readFileSync(MIGRATION_PATH, 'utf-8')
  } catch {
    sql = null
  }
})

describe('Migration: 20260816040000_rachas_logros_trigger.sql', () => {
  it('should exist at the expected path', () => {
    expect(sql).not.toBeNull()
  })

  it('should have a commented DOWN block at the end of the file', () => {
    expect(sql).toMatch(/--\s*={5,}\s*\n--\s*DOWN\s*\n--\s*={5,}/i)
  })

  describe('fn_actualizar_racha_alumno', () => {
    it('is declared with SECURITY DEFINER and the expected signature', () => {
      const fn = sql.match(/CREATE OR REPLACE FUNCTION fn_actualizar_racha_alumno[\s\S]*?\$\$;/i)
      expect(fn).not.toBeNull()
      expect(fn[0]).toMatch(/p_alumno_id uuid/i)
      expect(fn[0]).toMatch(/p_fecha date/i)
      expect(fn[0]).toMatch(/p_clase_id uuid/i)
      expect(fn[0]).toMatch(/SECURITY DEFINER/i)
    })

    it('creates a new rachas row (racha_actual=1) when the alumno has none', () => {
      const fn = sql.match(/CREATE OR REPLACE FUNCTION fn_actualizar_racha_alumno[\s\S]*?\$\$;/i)[0]
      expect(fn).toMatch(/NOT FOUND/i)
      expect(fn).toMatch(/INSERT INTO rachas[\s\S]*?1,\s*1,\s*p_fecha/i)
    })

    it('no-ops when the date was already counted (same or earlier than ultima_fecha_activa)', () => {
      const fn = sql.match(/CREATE OR REPLACE FUNCTION fn_actualizar_racha_alumno[\s\S]*?\$\$;/i)[0]
      expect(fn).toMatch(/p_fecha\s*<=\s*v_racha\.ultima_fecha_activa/i)
    })

    it('checks sesiones_clase for the previous scheduled session before incrementing or resetting', () => {
      const fn = sql.match(/CREATE OR REPLACE FUNCTION fn_actualizar_racha_alumno[\s\S]*?\$\$;/i)[0]
      expect(fn).toMatch(/FROM sesiones_clase/i)
      expect(fn).toMatch(/clase_id\s*=\s*p_clase_id/i)
      expect(fn).toMatch(/racha_actual\s*=\s*v_racha\.racha_actual\s*\+\s*1/i)
      expect(fn).toMatch(/racha_actual\s*=\s*1/i)
    })
  })

  describe('fn_evaluar_logros_alumno', () => {
    it('is declared with SECURITY DEFINER and the expected signature', () => {
      const fn = sql.match(/CREATE OR REPLACE FUNCTION fn_evaluar_logros_alumno[\s\S]*?\$\$;/i)
      expect(fn).not.toBeNull()
      expect(fn[0]).toMatch(/p_alumno_id uuid/i)
      expect(fn[0]).toMatch(/SECURITY DEFINER/i)
    })

    it('loops only over logros WHERE activo = true', () => {
      const fn = sql.match(/CREATE OR REPLACE FUNCTION fn_evaluar_logros_alumno[\s\S]*?\$\$;/i)[0]
      expect(fn).toMatch(/FROM logros WHERE activo\s*=\s*true/i)
    })

    it('supports the 3 criterio types already seeded in production', () => {
      const fn = sql.match(/CREATE OR REPLACE FUNCTION fn_evaluar_logros_alumno[\s\S]*?\$\$;/i)[0]
      expect(fn).toMatch(/'asistencia', 'asistencias_totales'/i)
      expect(fn).toMatch(/estado\s*=\s*'presente'/i)
      expect(fn).toMatch(/'ejercicio_aprobado'/i)
      expect(fn).toMatch(/nota\s*>=\s*3/i)
    })

    it('supports the 2 criterio types anticipated in spec.md (B-02)', () => {
      const fn = sql.match(/CREATE OR REPLACE FUNCTION fn_evaluar_logros_alumno[\s\S]*?\$\$;/i)[0]
      expect(fn).toMatch(/'primer_objetivo_completado'/i)
      expect(fn).toMatch(/'primero_en_desbloquear_objetivo'/i)
    })

    it('inserts into alumnos_logros with ON CONFLICT DO NOTHING on (alumno_id, logro_id)', () => {
      const fn = sql.match(/CREATE OR REPLACE FUNCTION fn_evaluar_logros_alumno[\s\S]*?\$\$;/i)[0]
      expect(fn).toMatch(/INSERT INTO alumnos_logros \(alumno_id, logro_id\)/i)
      expect(fn).toMatch(/ON CONFLICT \(alumno_id, logro_id\) DO NOTHING/i)
    })

    it('"primero_en_desbloquear_objetivo" compares completion time against classmates, not just self', () => {
      const fn = sql.match(/CREATE OR REPLACE FUNCTION fn_evaluar_logros_alumno[\s\S]*?\$\$;/i)[0]
      const branch = fn.split("'primero_en_desbloquear_objetivo'")[1]
      expect(branch).toMatch(/oc2\.alumno_id\s*<>\s*p_alumno_id/i)
      expect(branch).toMatch(/<=\s*ALL/i)
    })
  })

  describe('trigger', () => {
    it('fires on INSERT and on UPDATE of nota/recovery_status (upsert-based writes, not INSERT-only)', () => {
      expect(sql).toMatch(/CREATE TRIGGER trg_evaluacion_indicador_gamificacion\s+AFTER INSERT OR UPDATE OF nota, recovery_status ON evaluacion_indicador/i)
    })

    it('guards on maestro_indicador_id IS NOT NULL (does not fire for legacy indicator_id evaluations)', () => {
      const fn = sql.match(/CREATE OR REPLACE FUNCTION fn_trigger_evaluacion_gamificacion[\s\S]*?\$\$;/i)[0]
      expect(fn).toMatch(/NEW\.maestro_indicador_id IS NOT NULL/i)
      expect(fn).toMatch(/fn_actualizar_racha_alumno\(NEW\.alumno_id/i)
      expect(fn).toMatch(/fn_evaluar_logros_alumno\(NEW\.alumno_id\)/i)
    })
  })
})

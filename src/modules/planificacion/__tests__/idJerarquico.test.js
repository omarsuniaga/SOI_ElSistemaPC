import { describe, it, expect, beforeAll } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import {
  componerIdJerarquico,
  siguienteOrdenIndicador,
  asignarIdJerarquico,
} from '../domain/IdJerarquico.js'

/**
 * REQ-04 (spec): cada indicador recibe un ID 'Nivel.Objetivo.Indicador'
 * (ej. '2.1.3') autogenerado y secuencial. Reordenar visualmente MUST NOT
 * renumerar, y el ID MUST NOT modificarse una vez que el indicador tiene
 * evaluaciones registradas.
 *
 * La lógica real vive en un trigger SQL (fn_asignar_id_jerarquico /
 * fn_bloquear_id_jerarquico, migración 20260731000002) que no se puede
 * ejecutar directo desde Vitest sin una base de datos real. Este archivo
 * cubre dos cosas:
 *  1. Un fixture puro de niveles/objetivos/indicadores contra la función
 *     espejo en domain/IdJerarquico.js.
 *  2. Un caso de "migration guard" que confirma que el archivo SQL de la
 *     migración existe y define los tres triggers/funciones esperados.
 */

// ── 1. Fixture de niveles/objetivos/indicadores ──────────────────────────
// Nivel 2 ("Iniciación"), Objetivo 1 ("La 3ª posición") con 2 indicadores
// existentes (orden_indicador 1 y 2) — el fixture que usa el ejemplo de la
// spec y el design ('2.1.3').
const FIXTURE_NIVEL_2 = { levelNumber: 2 }
const FIXTURE_OBJETIVO_1 = { ordenObjetivo: 1 }
const FIXTURE_INDICADORES_HERMANOS = [
  { ordenIndicador: 1 },
  { ordenIndicador: 2 },
]

describe('IdJerarquico (domain, espejo puro de fn_asignar_id_jerarquico)', () => {
  describe('componerIdJerarquico', () => {
    it('compone Nivel.Objetivo.Indicador con el ejemplo de la spec (2.1.3)', () => {
      expect(
        componerIdJerarquico({ levelNumber: 2, ordenObjetivo: 1, ordenIndicador: 3 })
      ).toBe('2.1.3')
    })

    it('rechaza levelNumber no entero o < 1', () => {
      expect(() => componerIdJerarquico({ levelNumber: 0, ordenObjetivo: 1, ordenIndicador: 1 })).toThrow()
      expect(() => componerIdJerarquico({ levelNumber: 1.5, ordenObjetivo: 1, ordenIndicador: 1 })).toThrow()
    })

    it('rechaza ordenObjetivo u ordenIndicador no entero o < 1', () => {
      expect(() => componerIdJerarquico({ levelNumber: 2, ordenObjetivo: 0, ordenIndicador: 1 })).toThrow()
      expect(() => componerIdJerarquico({ levelNumber: 2, ordenObjetivo: 1, ordenIndicador: 0 })).toThrow()
    })
  })

  describe('siguienteOrdenIndicador (espejo de COALESCE(MAX(orden_indicador), 0) + 1)', () => {
    it('devuelve 1 cuando el objetivo no tiene indicadores todavía', () => {
      expect(siguienteOrdenIndicador([])).toBe(1)
    })

    it('devuelve MAX + 1 dado un fixture de hermanos existentes', () => {
      expect(siguienteOrdenIndicador(FIXTURE_INDICADORES_HERMANOS)).toBe(3)
    })

    it('no se ve afectado por el orden de inserción del fixture (usa MAX, no length)', () => {
      const hermanosDesordenados = [{ ordenIndicador: 5 }, { ordenIndicador: 1 }, { ordenIndicador: 3 }]
      expect(siguienteOrdenIndicador(hermanosDesordenados)).toBe(6)
    })
  })

  describe('asignarIdJerarquico (autogeneración secuencial, REQ-04)', () => {
    it('autogenera el siguiente orden_indicador y compone el ID completo usando el fixture', () => {
      const resultado = asignarIdJerarquico({
        levelNumber: FIXTURE_NIVEL_2.levelNumber,
        ordenObjetivo: FIXTURE_OBJETIVO_1.ordenObjetivo,
        indicadoresHermanos: FIXTURE_INDICADORES_HERMANOS,
      })

      expect(resultado).toEqual({ ordenIndicador: 3, idJerarquico: '2.1.3' })
    })

    it('respeta un ordenIndicador explícito en lugar de autogenerar', () => {
      const resultado = asignarIdJerarquico({
        levelNumber: 2,
        ordenObjetivo: 1,
        indicadoresHermanos: FIXTURE_INDICADORES_HERMANOS,
        ordenIndicador: 10,
      })

      expect(resultado).toEqual({ ordenIndicador: 10, idJerarquico: '2.1.10' })
    })

    it('reordenar visualmente (order_index) MUST NOT afectar el id_jerarquico — la función espejo ni siquiera recibe order_index', () => {
      const resultado = asignarIdJerarquico({
        levelNumber: 2,
        ordenObjetivo: 1,
        indicadoresHermanos: FIXTURE_INDICADORES_HERMANOS,
        ordenIndicador: 2, // mismo tramo aunque el maestro haya reordenado visualmente
      })

      expect(resultado.idJerarquico).toBe('2.1.2')
    })
  })
})

// ── 2. Migration guard: 20260731000002_mapa_clase_id_jerarquico.sql ──────
const MIGRATION_PATH = resolve(
  process.cwd(),
  'supabase/migrations/20260731000002_mapa_clase_id_jerarquico.sql'
)

let sql

beforeAll(() => {
  try {
    sql = readFileSync(MIGRATION_PATH, 'utf-8')
  } catch {
    sql = null
  }
})

describe('Migration: 20260731000002_mapa_clase_id_jerarquico.sql', () => {
  it('should exist at the expected path', () => {
    expect(sql).not.toBeNull()
  })

  it('should have a commented DOWN block at the end of the file', () => {
    expect(sql).toMatch(/--\s*={5,}\s*\n--\s*DOWN\s*\n--\s*={5,}/i)
  })

  it('should define fn_asignar_id_jerarquico() as a BEFORE INSERT trigger on clase_mapa_indicadores', () => {
    expect(sql).toMatch(/CREATE\s+OR\s+REPLACE\s+FUNCTION\s+public\.fn_asignar_id_jerarquico\(\)/i)
    expect(sql).toMatch(/CREATE\s+TRIGGER\s+trg_asignar_id_jerarquico\s+BEFORE\s+INSERT\s+ON\s+public\.clase_mapa_indicadores/i)
  })

  it('should define fn_bloquear_id_jerarquico() as a BEFORE UPDATE trigger on clase_mapa_indicadores', () => {
    expect(sql).toMatch(/CREATE\s+OR\s+REPLACE\s+FUNCTION\s+public\.fn_bloquear_id_jerarquico\(\)/i)
    expect(sql).toMatch(/CREATE\s+TRIGGER\s+trg_bloquear_id_jerarquico\s+BEFORE\s+UPDATE\s+ON\s+public\.clase_mapa_indicadores/i)
  })

  it('fn_bloquear_id_jerarquico should raise SOI-MAPA-01 when evaluations exist', () => {
    const fnMatch = sql.match(/CREATE\s+OR\s+REPLACE\s+FUNCTION\s+public\.fn_bloquear_id_jerarquico[\s\S]*?\$\$;/i)
    expect(fnMatch).not.toBeNull()
    expect(fnMatch[0]).toMatch(/SOI-MAPA-01/)
    expect(fnMatch[0]).toMatch(/clase_indicador_id/i)
  })

  it('should define the "trigger gemelo" fn_bloquear_objetivo_jerarquico() on clase_mapa_objetivos', () => {
    expect(sql).toMatch(/CREATE\s+OR\s+REPLACE\s+FUNCTION\s+public\.fn_bloquear_objetivo_jerarquico\(\)/i)
    expect(sql).toMatch(/CREATE\s+TRIGGER\s+trg_bloquear_objetivo_jerarquico\s+BEFORE\s+UPDATE\s+ON\s+public\.clase_mapa_objetivos/i)
  })

  it('fn_bloquear_objetivo_jerarquico should guard orden_objetivo/level_id changes against descendant evaluations', () => {
    const fnMatch = sql.match(/CREATE\s+OR\s+REPLACE\s+FUNCTION\s+public\.fn_bloquear_objetivo_jerarquico[\s\S]*?\$\$;/i)
    expect(fnMatch).not.toBeNull()
    expect(fnMatch[0]).toMatch(/orden_objetivo/i)
    expect(fnMatch[0]).toMatch(/level_id/i)
    expect(fnMatch[0]).toMatch(/SOI-MAPA-01/)
  })

  it('should force clase_id coherence from the parent objetivo (Decisión 1 denormalization)', () => {
    expect(sql).toMatch(/NEW\.clase_id\s*:=/)
  })
})

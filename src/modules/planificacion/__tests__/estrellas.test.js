import { describe, it, expect, beforeAll } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import {
  calcularPctAvance,
  esAlumnoSuperador,
  bandaEstrellas,
  calcularEstrellasObjetivo,
} from '../domain/EstrellasObjetivo.js'

/**
 * estrellas.test.js — Tarea 1.4 (openspec/changes/mapa-gamificado-planificacion)
 *
 * Dos frentes, mismo patrón que idJerarquico.test.js:
 * 1. Espejo JS puro de vw_clase_objetivo_estrellas (REQ-06/07/08) — la lógica
 *    real vive en SQL y no es ejecutable desde Vitest.
 * 2. Guard de migración: el archivo existe, tiene DOWN block,
 *    security_invoker = true, y — crítico para REQ-12 — el SQL de la vista
 *    NUNCA contiene el token 'sesion_bitacora'.
 */

describe('EstrellasObjetivo (espejo JS de vw_clase_objetivo_estrellas)', () => {
  describe('calcularPctAvance', () => {
    it('returns 50% for 2/4 indicadores evaluados (REQ-06 scenario)', () => {
      expect(calcularPctAvance({ totalIndicadores: 4, indicadoresEvaluados: 2 })).toBe(50)
    })

    it('returns 0 when totalIndicadores is 0 (no divide by zero)', () => {
      expect(calcularPctAvance({ totalIndicadores: 0, indicadoresEvaluados: 0 })).toBe(0)
    })
  })

  describe('esAlumnoSuperador', () => {
    it('REQ-07 scenario: incomplete indicator does not count as superador nor as 0', () => {
      // alumno con 2 evaluados (4 y 5) y 1 sin evaluar de 3 requeridos
      const indicadoresRequeridos = ['ind-1', 'ind-2', 'ind-3']
      const evaluaciones = [
        { indicadorId: 'ind-1', nota: 4 },
        { indicadorId: 'ind-2', nota: 5 },
        // ind-3 sin evaluar
      ]
      expect(esAlumnoSuperador({ indicadoresRequeridos, evaluaciones })).toBe(false)
    })

    it('is superador only when ALL required indicators have nota >= 3', () => {
      const indicadoresRequeridos = ['ind-1', 'ind-2']
      expect(
        esAlumnoSuperador({
          indicadoresRequeridos,
          evaluaciones: [
            { indicadorId: 'ind-1', nota: 3 },
            { indicadorId: 'ind-2', nota: 3 },
          ],
        })
      ).toBe(true)
    })

    it('is not superador if any required indicator has nota < 3', () => {
      const indicadoresRequeridos = ['ind-1', 'ind-2']
      expect(
        esAlumnoSuperador({
          indicadoresRequeridos,
          evaluaciones: [
            { indicadorId: 'ind-1', nota: 2 },
            { indicadorId: 'ind-2', nota: 5 },
          ],
        })
      ).toBe(false)
    })

    it('is never superador for an objective with zero required indicators', () => {
      expect(esAlumnoSuperador({ indicadoresRequeridos: [], evaluaciones: [] })).toBe(false)
    })
  })

  describe('bandaEstrellas', () => {
    it('bands 3.0-3.4 -> 1 estrella', () => {
      expect(bandaEstrellas(3.0)).toBe(1)
      expect(bandaEstrellas(3.4)).toBe(1)
    })

    it('bands 3.5-4.2 -> 2 estrellas (REQ-07 scenario: promedio 3.8 -> 2★)', () => {
      expect(bandaEstrellas(3.5)).toBe(2)
      expect(bandaEstrellas(3.8)).toBe(2)
      expect(bandaEstrellas(4.2)).toBe(2)
    })

    it('bands 4.3-5.0 -> 3 estrellas', () => {
      expect(bandaEstrellas(4.3)).toBe(3)
      expect(bandaEstrellas(5.0)).toBe(3)
    })

    it('returns 0 for a null/undefined promedio (no superadores yet)', () => {
      expect(bandaEstrellas(null)).toBe(0)
      expect(bandaEstrellas(undefined)).toBe(0)
    })

    it('returns 0 below the 3.0 floor', () => {
      expect(bandaEstrellas(2.9)).toBe(0)
    })
  })

  describe('calcularEstrellasObjetivo — fila completa de la vista', () => {
    it('REQ-07 scenario: nodo asigna 2 estrellas cuando el promedio de superadores es 3.8', () => {
      const indicadoresRequeridos = ['ind-1', 'ind-2']
      const evaluacionesPorAlumno = {
        'alumno-1': [
          { indicadorId: 'ind-1', nota: 4 },
          { indicadorId: 'ind-2', nota: 4 },
        ], // promedio 4.0
        'alumno-2': [
          { indicadorId: 'ind-1', nota: 3 },
          { indicadorId: 'ind-2', nota: 4 },
        ], // promedio 3.5
      }
      // promedio de superadores = (4.0 + 3.5) / 2 = 3.75 -> banda 2 (3.5-4.2)
      const res = calcularEstrellasObjetivo({ indicadoresRequeridos, evaluacionesPorAlumno })
      expect(res.alumnosSuperadores).toBe(2)
      expect(res.promedioSuperadores).toBeCloseTo(3.75, 5)
      expect(res.estrellas).toBe(2)
      expect(res.estadoVisual).toBe('con_estrellas')
    })

    it('REQ-08 scenario: estado_visual = en_progreso (never "0★") when no student has superado yet', () => {
      const indicadoresRequeridos = ['ind-1', 'ind-2']
      const evaluacionesPorAlumno = {
        'alumno-1': [{ indicadorId: 'ind-1', nota: 5 }], // ind-2 sin evaluar -> no superador
      }
      const res = calcularEstrellasObjetivo({ indicadoresRequeridos, evaluacionesPorAlumno })
      expect(res.alumnosSuperadores).toBe(0)
      expect(res.promedioSuperadores).toBeNull()
      expect(res.estrellas).toBe(0)
      expect(res.estadoVisual).toBe('en_progreso')
    })

    it('excludes non-superador students from promedioSuperadores while still counting indicadoresEvaluados', () => {
      const indicadoresRequeridos = ['ind-1', 'ind-2', 'ind-3']
      const evaluacionesPorAlumno = {
        'alumno-superador': [
          { indicadorId: 'ind-1', nota: 5 },
          { indicadorId: 'ind-2', nota: 5 },
          { indicadorId: 'ind-3', nota: 5 },
        ],
        'alumno-incompleto': [{ indicadorId: 'ind-1', nota: 1 }], // no superador, no penaliza
      }
      const res = calcularEstrellasObjetivo({ indicadoresRequeridos, evaluacionesPorAlumno })
      expect(res.alumnosSuperadores).toBe(1)
      expect(res.promedioSuperadores).toBe(5)
      expect(res.estrellas).toBe(3)
      // indicadoresEvaluados cuenta indicadores del objetivo con AL MENOS una
      // evaluación de cualquier alumno (ind-1 e ind-2 e ind-3 tienen alguna)
      expect(res.indicadoresEvaluados).toBe(3)
      expect(res.pctAvance).toBe(100)
    })

    it('REQ-06 scenario: 4 indicadores, 2 evaluados -> 50% avance, sin nota numérica propia del objetivo', () => {
      const indicadoresRequeridos = ['ind-1', 'ind-2', 'ind-3', 'ind-4']
      const evaluacionesPorAlumno = {
        'alumno-1': [
          { indicadorId: 'ind-1', nota: 4 },
          { indicadorId: 'ind-2', nota: 3 },
        ],
      }
      const res = calcularEstrellasObjetivo({ indicadoresRequeridos, evaluacionesPorAlumno })
      expect(res.pctAvance).toBe(50)
      expect(res).not.toHaveProperty('nota')
    })
  })
})

// ── Migration guard (Tarea 1.4) ───────────────────────────────────────────

const MIGRATION_PATH = resolve(process.cwd(), 'supabase/migrations/20260731000004_mapa_estrellas_view.sql')

let sql

beforeAll(() => {
  try {
    sql = readFileSync(MIGRATION_PATH, 'utf-8')
  } catch {
    sql = null
  }
})

describe('Migration: 20260731000004_mapa_estrellas_view.sql', () => {
  it('should exist at the expected path', () => {
    expect(sql).not.toBeNull()
  })

  it('should have a commented DOWN block that drops the view', () => {
    expect(sql).toMatch(/--\s*={5,}\s*\n--\s*DOWN\s*\n--\s*={5,}/i)
    expect(sql).toMatch(/--\s*DROP\s+VIEW\s+IF\s+EXISTS\s+public\.vw_clase_objetivo_estrellas/i)
  })

  it('should CREATE (OR REPLACE) VIEW vw_clase_objetivo_estrellas', () => {
    expect(sql).toMatch(/CREATE\s+(OR\s+REPLACE\s+)?VIEW\s+public\.vw_clase_objetivo_estrellas/i)
  })

  it('should set security_invoker = true — lección de la migración #3 (bypasea RLS sin esto)', () => {
    const viewMatch = sql.match(/CREATE\s+(OR\s+REPLACE\s+)?VIEW\s+public\.vw_clase_objetivo_estrellas[\s\S]*?AS/i)
    expect(viewMatch).not.toBeNull()
    expect(viewMatch[0]).toMatch(/WITH\s*\(\s*security_invoker\s*=\s*true\s*\)/i)
  })

  it('should filter indicadores by es_requerido = true and archived_at IS NULL', () => {
    expect(sql).toMatch(/es_requerido\s*=\s*true/i)
    expect(sql).toMatch(/archived_at\s+IS\s+NULL/i)
  })

  it('REQ-12: the view SQL must NEVER contain the token "sesion_bitacora"', () => {
    expect(sql).not.toMatch(/sesion_bitacora/i)
  })

  it('should expose all columns required by design.md Decisión 5', () => {
    for (const col of [
      'objetivo_id',
      'clase_id',
      'total_indicadores',
      'indicadores_evaluados',
      'pct_avance',
      'alumnos_superadores',
      'promedio_superadores',
      'estrellas',
      'estado_visual',
    ]) {
      expect(sql).toMatch(new RegExp(`\\b${col}\\b`, 'i'))
    }
  })

  it("estado_visual should be 'en_progreso' when there are zero superadores (REQ-08)", () => {
    expect(sql).toMatch(/en_progreso/)
  })
})

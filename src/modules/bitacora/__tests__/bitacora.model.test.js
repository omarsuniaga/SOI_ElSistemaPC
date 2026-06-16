import { describe, it, expect, beforeEach } from 'vitest'
import { BitacoraRegistro } from '../models/bitacora.model.js'

// ── Helpers ──────────────────────────────────────────────────────

function today() {
  return new Date().toISOString().slice(0, 10)
}

function tomorrow() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().slice(0, 10)
}

function validData(overrides = {}) {
  return {
    claseId: 'clase-001',
    objetivoId: 'obj-001',
    alumnoId: 'alumno-001',
    fecha: today(),
    nota: 'bien',
    ...overrides,
  }
}

// ── Constructor ───────────────────────────────────────────────────

describe('BitacoraRegistro — constructor', () => {
  it('should create instance with provided values', () => {
    const r = new BitacoraRegistro(validData())
    expect(r.claseId).toBe('clase-001')
    expect(r.objetivoId).toBe('obj-001')
    expect(r.alumnoId).toBe('alumno-001')
    expect(r.nota).toBe('bien')
  })

  it('should default fecha to today when not provided', () => {
    const r = new BitacoraRegistro({ claseId: 'c1', objetivoId: 'o1', alumnoId: 'a1', nota: 'bien' })
    expect(r.fecha).toBe(today())
  })

  it('should default observacion to empty string', () => {
    const r = new BitacoraRegistro(validData())
    expect(r.observacion).toBe('')
  })

  it('should accept observacion when provided', () => {
    const r = new BitacoraRegistro(validData({ observacion: 'Buen desempeño' }))
    expect(r.observacion).toBe('Buen desempeño')
  })
})

// ── validate() ───────────────────────────────────────────────────

describe('BitacoraRegistro — validate()', () => {
  it('should return empty array for valid data', () => {
    const r = new BitacoraRegistro(validData())
    expect(r.validate()).toEqual([])
  })

  it('should reject missing claseId', () => {
    const r = new BitacoraRegistro(validData({ claseId: null }))
    const errors = r.validate()
    expect(errors.some((e) => e.includes('claseId'))).toBe(true)
  })

  it('should reject missing objetivoId', () => {
    const r = new BitacoraRegistro(validData({ objetivoId: null }))
    const errors = r.validate()
    expect(errors.some((e) => e.includes('objetivoId'))).toBe(true)
  })

  it('should reject missing alumnoId', () => {
    const r = new BitacoraRegistro(validData({ alumnoId: null }))
    const errors = r.validate()
    expect(errors.some((e) => e.includes('alumnoId'))).toBe(true)
  })

  it('should reject missing nota', () => {
    const r = new BitacoraRegistro(validData({ nota: null }))
    const errors = r.validate()
    expect(errors.some((e) => e.includes('nota'))).toBe(true)
  })

  it('should reject invalid nota value', () => {
    const r = new BitacoraRegistro(validData({ nota: 'excelente' }))
    const errors = r.validate()
    expect(errors.some((e) => e.includes('nota'))).toBe(true)
  })

  it('should accept all valid nota values', () => {
    for (const nota of ['bien', 'regular', 'mal']) {
      const r = new BitacoraRegistro(validData({ nota }))
      expect(r.validate()).toEqual([])
    }
  })

  it('should reject future fecha', () => {
    const r = new BitacoraRegistro(validData({ fecha: tomorrow() }))
    const errors = r.validate()
    expect(errors.some((e) => e.includes('fecha'))).toBe(true)
  })

  it('should accept today as fecha', () => {
    const r = new BitacoraRegistro(validData({ fecha: today() }))
    expect(r.validate()).toEqual([])
  })
})

// ── toJSON() ─────────────────────────────────────────────────────

describe('BitacoraRegistro — toJSON()', () => {
  it('should return snake_case keys for Supabase', () => {
    const r = new BitacoraRegistro(validData({ observacion: 'Test obs' }))
    const json = r.toJSON()
    expect(json).toHaveProperty('clase_id')
    expect(json).toHaveProperty('objetivo_id')
    expect(json).toHaveProperty('alumno_id')
    expect(json).toHaveProperty('fecha')
    expect(json).toHaveProperty('nota_cualitativa')
    expect(json).toHaveProperty('observacion')
  })

  it('should map camelCase fields to snake_case values correctly', () => {
    const r = new BitacoraRegistro(validData({ observacion: 'Obs test' }))
    const json = r.toJSON()
    expect(json.clase_id).toBe('clase-001')
    expect(json.objetivo_id).toBe('obj-001')
    expect(json.alumno_id).toBe('alumno-001')
    expect(json.nota_cualitativa).toBe('bien')
    expect(json.observacion).toBe('Obs test')
  })

  it('should return null for empty observacion', () => {
    const r = new BitacoraRegistro(validData())
    const json = r.toJSON()
    expect(json.observacion).toBeNull()
  })
})

// ── calcularSemaforo() ───────────────────────────────────────────

describe('BitacoraRegistro — calcularSemaforo()', () => {
  it('should return gris when total_registros is 0', () => {
    expect(
      BitacoraRegistro.calcularSemaforo({ bien_count: 0, regular_count: 0, mal_count: 0, total_registros: 0 }),
    ).toBe('gris')
  })

  it('should return verde when bien_count / total >= 0.70', () => {
    expect(
      BitacoraRegistro.calcularSemaforo({ bien_count: 7, regular_count: 2, mal_count: 1, total_registros: 10 }),
    ).toBe('verde')
  })

  it('should return rojo when mal_count / total > 0.50', () => {
    expect(
      BitacoraRegistro.calcularSemaforo({ bien_count: 1, regular_count: 2, mal_count: 6, total_registros: 9 }),
    ).toBe('rojo')
  })

  it('should return naranja for mixed cases (not verde, not rojo)', () => {
    expect(
      BitacoraRegistro.calcularSemaforo({ bien_count: 3, regular_count: 4, mal_count: 3, total_registros: 10 }),
    ).toBe('naranja')
  })

  it('rojo takes precedence over verde when both thresholds met', () => {
    // Pathological case: impossible in practice but tests conservative precedence
    // bien=7/9 >= 0.70 AND mal=5/9 > 0.50 → rojo wins (conservative)
    expect(
      BitacoraRegistro.calcularSemaforo({ bien_count: 7, regular_count: 0, mal_count: 5, total_registros: 9 }),
    ).toBe('rojo')
  })
})

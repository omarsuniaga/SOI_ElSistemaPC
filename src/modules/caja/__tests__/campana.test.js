import { describe, test, expect } from 'vitest'
import { buildCampana, campanaVigente, buildParticipacion, calcularMontoRecuperado } from '../domain/campana.js'

describe('buildCampana', () => {
  const base = {
    nombre: 'Campaña Junio',
    descripcion: 'Recuperación de mora',
    incentivo: '10% descuento',
    fecha_inicio: '2026-06-01',
    fecha_fin: '2026-06-30',
    creado_por: 'usr-admin-1',
  }

  test('builds campana with required fields', () => {
    const c = buildCampana(base)
    expect(c.nombre).toBe('Campaña Junio')
    expect(c.descripcion).toBe('Recuperación de mora')
    expect(c.fecha_inicio).toBe('2026-06-01')
    expect(c.fecha_fin).toBe('2026-06-30')
  })

  test('activa defaults to true', () => {
    const c = buildCampana(base)
    expect(c.activa).toBe(true)
  })
})

describe('campanaVigente', () => {
  const today = new Date('2026-06-22')

  test('active campana within dates → vigente', () => {
    expect(campanaVigente({ activa: true, fecha_inicio: '2026-06-01', fecha_fin: '2026-06-30' }, today)).toBe(true)
  })

  test('inactive campana → not vigente', () => {
    expect(campanaVigente({ activa: false, fecha_inicio: '2026-06-01', fecha_fin: '2026-06-30' }, today)).toBe(false)
  })

  test('campana before start date → not vigente', () => {
    expect(campanaVigente({ activa: true, fecha_inicio: '2026-07-01', fecha_fin: '2026-07-31' }, today)).toBe(false)
  })

  test('campana after end date → not vigente', () => {
    expect(campanaVigente({ activa: true, fecha_inicio: '2026-05-01', fecha_fin: '2026-06-01' }, today)).toBe(false)
  })
})

describe('buildParticipacion', () => {
  test('builds participacion with campana_id and familia_id', () => {
    const p = buildParticipacion('camp-1', 'fam-1')
    expect(p.campana_id).toBe('camp-1')
    expect(p.familia_id).toBe('fam-1')
  })

  test('monto_recuperado defaults to 0', () => {
    const p = buildParticipacion('camp-1', 'fam-1')
    expect(p.monto_recuperado).toBe(0)
  })
})

describe('calcularMontoRecuperado', () => {
  test('sums monto_recuperado from all participaciones', () => {
    const parts = [
      { monto_recuperado: 100 },
      { monto_recuperado: 200 },
      { monto_recuperado: 50 },
    ]
    expect(calcularMontoRecuperado(parts)).toBe(350)
  })

  test('returns 0 for empty array', () => {
    expect(calcularMontoRecuperado([])).toBe(0)
  })
})

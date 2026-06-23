import { describe, test, expect } from 'vitest'
import { buildBeca, aplicarBecaACuota, becaVigente, debeLiquidarseBeca } from '../domain/beca.js'

describe('buildBeca', () => {
  const base = { alumno_id: 'alu-1', familia_id: 'fam-1', porcentaje: 50, motivo: 'Rendimiento', aprobado_por: 'usr-1', indicador_progreso_minimo: 80 }

  test('builds beca with required fields', () => {
    const b = buildBeca(base)
    expect(b.alumno_id).toBe('alu-1')
    expect(b.familia_id).toBe('fam-1')
    expect(b.porcentaje).toBe(50)
    expect(b.motivo).toBe('Rendimiento')
  })

  test('activa defaults to true', () => {
    const b = buildBeca(base)
    expect(b.activa).toBe(true)
  })

  test('fecha_fin defaults to null', () => {
    const b = buildBeca(base)
    expect(b.fecha_fin).toBeNull()
  })

  test('includes indicador_progreso_minimo', () => {
    const b = buildBeca(base)
    expect(b.indicador_progreso_minimo).toBe(80)
  })
})

describe('aplicarBecaACuota', () => {
  const cuota = { id: 'c1', monto_base: 300 }
  const beca = { porcentaje: 50 }

  test('returns estado becada', () => {
    const r = aplicarBecaACuota(cuota, beca)
    expect(r.newEstado).toBe('becada')
  })

  test('monto_final = monto_base * (1 - porcentaje/100)', () => {
    const r = aplicarBecaACuota(cuota, beca)
    expect(r.monto_final).toBe(150)
  })

  test('100% beca → monto_final = 0', () => {
    const r = aplicarBecaACuota(cuota, { porcentaje: 100 })
    expect(r.monto_final).toBe(0)
  })
})

describe('becaVigente', () => {
  const today = new Date('2026-06-22')

  test('active beca with no end date is vigente', () => {
    const b = { activa: true, fecha_inicio: '2026-01-01', fecha_fin: null }
    expect(becaVigente(b, today)).toBe(true)
  })

  test('active beca within date range is vigente', () => {
    const b = { activa: true, fecha_inicio: '2026-01-01', fecha_fin: '2026-12-31' }
    expect(becaVigente(b, today)).toBe(true)
  })

  test('expired beca (fecha_fin in past) is not vigente', () => {
    const b = { activa: true, fecha_inicio: '2026-01-01', fecha_fin: '2026-06-01' }
    expect(becaVigente(b, today)).toBe(false)
  })

  test('inactive beca is not vigente', () => {
    const b = { activa: false, fecha_inicio: '2026-01-01', fecha_fin: null }
    expect(becaVigente(b, today)).toBe(false)
  })

  test('future beca (not yet started) is not vigente', () => {
    const b = { activa: true, fecha_inicio: '2026-07-01', fecha_fin: null }
    expect(becaVigente(b, today)).toBe(false)
  })
})

describe('debeLiquidarseBeca', () => {
  const beca = { indicador_progreso_minimo: 80 }

  test('progreso below minimum → debe liquidarse', () => {
    expect(debeLiquidarseBeca(beca, 70)).toBe(true)
  })

  test('progreso at minimum → no debe liquidarse', () => {
    expect(debeLiquidarseBeca(beca, 80)).toBe(false)
  })

  test('progreso above minimum → no debe liquidarse', () => {
    expect(debeLiquidarseBeca(beca, 90)).toBe(false)
  })
})

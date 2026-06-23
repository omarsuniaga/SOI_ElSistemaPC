import { describe, test, expect } from 'vitest'
import { buildPatrocinio, calcularAportePatrocinio, cubriendoCargo } from '../domain/patrocinio.js'

describe('buildPatrocinio', () => {
  const base = { patrocinante_id: 'pat-1', alumno_id: 'alu-1', familia_id: 'fam-1', cubre: 'cuota', monto_mensual: 150 }

  test('builds patrocinio with required fields', () => {
    const p = buildPatrocinio(base)
    expect(p.patrocinante_id).toBe('pat-1')
    expect(p.alumno_id).toBe('alu-1')
    expect(p.familia_id).toBe('fam-1')
    expect(p.cubre).toBe('cuota')
    expect(p.monto_mensual).toBe(150)
  })

  test('activo defaults to true', () => {
    const p = buildPatrocinio(base)
    expect(p.activo).toBe(true)
  })

  test('fecha_fin defaults to null', () => {
    const p = buildPatrocinio(base)
    expect(p.fecha_fin).toBeNull()
  })
})

describe('calcularAportePatrocinio', () => {
  test('cubre=cuota: returns min(monto_mensual, cuotaMonto)', () => {
    const p = { cubre: 'cuota', monto_mensual: 150 }
    expect(calcularAportePatrocinio(p, 300)).toBe(150)
  })

  test('cubre=cuota: when monto_mensual >= cuotaMonto returns cuotaMonto', () => {
    const p = { cubre: 'cuota', monto_mensual: 400 }
    expect(calcularAportePatrocinio(p, 300)).toBe(300)
  })

  test('cubre=wallet: returns monto_mensual (for wallet contribution)', () => {
    const p = { cubre: 'wallet', monto_mensual: 100 }
    expect(calcularAportePatrocinio(p, 300)).toBe(100)
  })

  test('cubre=accesorio: returns monto_mensual', () => {
    const p = { cubre: 'accesorio', monto_mensual: 200 }
    expect(calcularAportePatrocinio(p, 200)).toBe(200)
  })
})

describe('cubriendoCargo', () => {
  test('patrocinio cubre=cuota matches cuota', () => {
    expect(cubriendoCargo({ cubre: 'cuota' }, 'cuota')).toBe(true)
  })

  test('patrocinio cubre=cuota does not match accesorio', () => {
    expect(cubriendoCargo({ cubre: 'cuota' }, 'accesorio')).toBe(false)
  })

  test('patrocinio cubre=accesorio matches accesorio', () => {
    expect(cubriendoCargo({ cubre: 'accesorio' }, 'accesorio')).toBe(true)
  })

  test('patrocinio cubre=wallet matches wallet', () => {
    expect(cubriendoCargo({ cubre: 'wallet' }, 'wallet')).toBe(true)
  })

  test('patrocinio cubre=wallet does not match cuota', () => {
    expect(cubriendoCargo({ cubre: 'wallet' }, 'cuota')).toBe(false)
  })
})

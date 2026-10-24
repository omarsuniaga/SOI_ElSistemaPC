import { describe, expect, it } from 'vitest'
import { isClassScheduledOn } from '../classValidity.js'

const clase = { id: 'c', created_at: '2026-09-02T18:00:00Z' }
const horario = { clase_id: 'c', created_at: '2026-09-23T19:00:00Z' }
describe('vigencia de clase y horario', () => {
  it('no proyecta un horario nuevo sobre agosto', () => {
    expect(isClassScheduledOn(clase, horario, '2026-08-12')).toBe(false)
    expect(isClassScheduledOn(clase, horario, '2026-09-16')).toBe(false)
    expect(isClassScheduledOn(clase, horario, '2026-09-23')).toBe(true)
  })
  it('respeta inicio explícito y fin inclusivo', () => {
    const h = { ...horario, vigente_desde: '2026-09-02', vigente_hasta: '2026-09-30' }
    expect(isClassScheduledOn(clase, h, '2026-09-02')).toBe(true)
    expect(isClassScheduledOn(clase, h, '2026-09-30')).toBe(true)
    expect(isClassScheduledOn(clase, h, '2026-10-07')).toBe(false)
  })
  it('interpreta created_at en Santo Domingo', () => {
    expect(isClassScheduledOn({ created_at: '2026-09-03T02:00:00Z' }, {}, '2026-09-02')).toBe(true)
  })
  it('preserva evidencia histórica real aunque el horario se cargó después', () => {
    expect(isClassScheduledOn(clase, horario, '2026-09-09', { estado: 'registrada', borrador: false })).toBe(true)
    expect(isClassScheduledOn(clase, horario, '2026-09-09', { borrador: true })).toBe(false)
  })
})

import { describe, expect, it } from 'vitest'
import { alumnoCoincideBusqueda, resolveEsRotativa } from './claseModal.helpers.js'

describe('claseModal student eligibility', () => {
  it('does not use the student program to determine visibility', () => {
    expect(alumnoCoincideBusqueda({ nombre: 'ana', instrumento: 'violín', programa_id: 'otro' })).toBe(true)
    expect(alumnoCoincideBusqueda({ nombre: 'luis', instrumento: 'piano', programa_id: null })).toBe(true)
  })

  it('keeps the existing name and instrument search behavior', () => {
    const alumno = { nombre: 'ana pérez', instrumento: 'violín' }
    expect(alumnoCoincideBusqueda(alumno, 'ana')).toBe(true)
    expect(alumnoCoincideBusqueda(alumno, 'violín')).toBe(true)
    expect(alumnoCoincideBusqueda(alumno, 'piano')).toBe(false)
  })
})

describe('claseModal dinámica (grupal ↔ rotativa)', () => {
  it('respeta el tipo guardado aunque la nómina arrastre horas por alumno', () => {
    const slotsConHora = [{ hora_inicio: '15:00', hora_fin: '15:30' }]
    expect(resolveEsRotativa({ tipoClase: 'grupal', inscritosSlots: slotsConHora })).toBe(false)
    expect(resolveEsRotativa({ tipoClase: 'GRUPAL ', inscritosSlots: slotsConHora })).toBe(false)
  })

  it('reconoce los tipos guardados que sí son rotativos', () => {
    expect(resolveEsRotativa({ tipoClase: 'rotativa' })).toBe(true)
    expect(resolveEsRotativa({ tipoClase: 'rotativo' })).toBe(true)
    expect(resolveEsRotativa({ tipoClase: 'individual' })).toBe(true)
  })

  it('solo infiere por los turnos cuando no hay tipo guardado', () => {
    expect(resolveEsRotativa({ inscritosSlots: [{ hora_inicio: '15:00' }] })).toBe(true)
    expect(resolveEsRotativa({ tipoClase: null, inscritosSlots: [{ hora_fin: '15:30' }] })).toBe(true)
    expect(resolveEsRotativa({ tipoClase: '', inscritosSlots: [{ hora_inicio: null, hora_fin: null }] })).toBe(false)
    expect(resolveEsRotativa({})).toBe(false)
  })
})

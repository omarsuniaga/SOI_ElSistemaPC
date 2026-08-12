import { describe, expect, it } from 'vitest'
import { alumnoCoincideBusqueda } from './claseModal.helpers.js'

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

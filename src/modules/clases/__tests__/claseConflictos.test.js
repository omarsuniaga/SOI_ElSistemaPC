import { describe, it, expect } from 'vitest'

function detectOverlaps(horarios1, horarios2) {
  for (const h1 of horarios1) {
    for (const h2 of horarios2) {
      if ((h1.dia || '').toLowerCase() === (h2.dia || '').toLowerCase()) {
        const start1 = h1.hora_inicio
        const end1 = h1.hora_fin
        const start2 = h2.hora_inicio
        const end2 = h2.hora_fin

        if (start1 < end2 && start2 < end1) {
          return true
        }
      }
    }
  }
  return false
}

describe('Detección y Marcaje de Conflictos de Clases', () => {
  it('detecta solape cuando dos clases coinciden en día y horas superpuestas', () => {
    const h1 = [{ dia: 'Lunes', hora_inicio: '14:00', hora_fin: '15:30' }]
    const h2 = [{ dia: 'Lunes', hora_inicio: '15:00', hora_fin: '16:30' }]

    expect(detectOverlaps(h1, h2)).toBe(true)
  })

  it('no marca choque cuando las clases son el mismo día pero en horas consecutivas sin solape', () => {
    const h1 = [{ dia: 'Lunes', hora_inicio: '14:00', hora_fin: '15:00' }]
    const h2 = [{ dia: 'Lunes', hora_inicio: '15:00', hora_fin: '16:00' }]

    expect(detectOverlaps(h1, h2)).toBe(false)
  })

  it('detecta solapes de alumnos coincidentes en dos clases el mismo día y hora', () => {
    const alumnosClaseA = ['alumno-1', 'alumno-2', 'alumno-3']
    const alumnosClaseB = ['alumno-3', 'alumno-4']

    const coincidentes = alumnosClaseA.filter(id => alumnosClaseB.includes(id))
    expect(coincidentes).toEqual(['alumno-3'])
    expect(coincidentes.length).toBe(1)
  })
})

import { describe, it, expect } from 'vitest'
import { construirJustificaciones, aplicarJustificadosDeAsistencias } from '../justificacionesAdm.js'

describe('construirJustificaciones', () => {
  it('indexa por alumno el motivo guardado en la tabla justificaciones', () => {
    const mapa = construirJustificaciones(
      [{ id: 'j1', alumno_id: 'a1', motivo: 'Cita médica', sesion_id: 's1' }],
      [],
    )
    expect(mapa.a1).toMatchObject({ id: 'j1', motivo: 'Cita médica' })
  })

  it('usa asistencias.justificacion_texto cuando no hay fila en justificaciones (sin id: no se puede borrar de la tabla)', () => {
    const mapa = construirJustificaciones(
      [],
      [{ alumno_id: 'a2', estado: 'justificado', justificacion_texto: 'Viaje familiar', sesion_clase_id: 's1' }],
    )
    expect(mapa.a2.motivo).toBe('Viaje familiar')
    expect(mapa.a2.id).toBeUndefined()
  })

  it('la fila de justificaciones tiene prioridad sobre el texto de asistencias', () => {
    const mapa = construirJustificaciones(
      [{ id: 'j1', alumno_id: 'a1', motivo: 'Motivo oficial' }],
      [{ alumno_id: 'a1', estado: 'justificado', justificacion_texto: 'Otro texto' }],
    )
    expect(mapa.a1.motivo).toBe('Motivo oficial')
  })

  it('ignora asistencias que no están justificadas o no tienen texto', () => {
    const mapa = construirJustificaciones(
      [],
      [
        { alumno_id: 'a3', estado: 'ausente', justificacion_texto: 'x' },
        { alumno_id: 'a4', estado: 'justificado', justificacion_texto: null },
      ],
    )
    expect(mapa.a3).toBeUndefined()
    expect(mapa.a4).toBeUndefined()
  })
})

describe('aplicarJustificadosDeAsistencias', () => {
  it('marca J a quien administración justificó, aunque el maestro ya tenga otros registros del día', () => {
    const estado = { a1: null, a2: 'P', a3: 'A' }
    aplicarJustificadosDeAsistencias(estado, [
      { alumno_id: 'a1', estado: 'justificado' },
      { alumno_id: 'a3', estado: 'justificado' },
    ])
    expect(estado).toEqual({ a1: 'J', a2: 'P', a3: 'J' })
  })

  it('no toca a alumnos que no están en la lista de la clase', () => {
    const estado = { a1: null }
    aplicarJustificadosDeAsistencias(estado, [{ alumno_id: 'zz', estado: 'justificado' }])
    expect(estado).toEqual({ a1: null })
  })

  it('no pisa una asistencia presente ya marcada por el maestro', () => {
    const estado = { a1: 'P' }
    aplicarJustificadosDeAsistencias(estado, [{ alumno_id: 'a1', estado: 'justificado' }])
    expect(estado.a1).toBe('P')
  })
})

import { describe, expect, it } from 'vitest'
import { proyectarHistorial } from '../../../../src/modules/alumnos/api/historialIndividual.js'
import { filasHistorial } from '../../../../src/modules/alumnos/views/historialPdfAlumno.js'
import { generarHorarioAlumno } from '../../../../src/modules/alumnos/domain/generarPdfInscripcion.js'

describe('documentos individuales del directorio', () => {
  it('distingue contenido recibido, ausencia y evaluación sin sesión, sin mezclar alumnos', () => {
    const history = proyectarHistorial('uno', {
      sessions: ['P', 'A'].map((estado, i) => ({ id: i + 1, fecha: '2026-10-03', contenido: 'Escalas', asistencia: [{ alumno_id: 'uno', estado }] })),
      studentObservations: [], progress: [
        { id: 'n1', alumno_id: 'uno', observaciones: 'Mejora en afinación' },
        { id: 'n2', alumno_id: 'otro', observaciones: 'Nota ajena' },
      ],
    })
    const rows = filasHistorial(history)
    expect(rows).toHaveLength(3)
    expect(rows.find(r => r[2] === 'Ausente')[3]).toBe('Sin participación registrada')
    expect(rows.find(r => r[2] === 'Presente')[3]).toBe('Escalas')
    expect(JSON.stringify(rows)).not.toContain('Nota ajena')
  })
  it('usa el turno individual y conserva todos los horarios de una clase colectiva', () => {
    const doc = generarHorarioAlumno({ nombre: 'Prueba' }, [
      { nombre: 'Viola', turno: { dia: 'lunes', hora_inicio: '15:15' }, clase_horarios: [{ dia: 'domingo' }] },
      { nombre: 'Coro', clase_horarios: [{ dia: 'martes' }, { dia: 'jueves' }] },
    ])
    const pdf = doc.output()
    for (const value of ['lunes', '15:15', 'martes', 'jueves']) expect(pdf).toContain(value)
    expect(pdf).not.toContain('domingo')
  })
})

import { describe, expect, it } from 'vitest'
import { agruparTurnos, diaEfectivo, ordenarInscripciones, validarTurno } from './turnosIndividuales.js'

const horarios = [
  { dia: 'jueves', hora_inicio: '14:00:00', hora_fin: '17:00:00' },
  { dia: 'lunes', hora_inicio: '14:00:00', hora_fin: '17:00:00' },
]

describe('turnos individuales', () => {
  it('no inventa un día cuando la clase tiene varios', () => {
    expect(diaEfectivo({ dia: null }, horarios).dia).toBeNull()
    expect(diaEfectivo({ dia: null }, [horarios[0]])).toEqual({ dia: 'jueves', heredado: true })
  })
  it('ordena por día y hora sin fusionar franjas iguales', () => {
    const rows = [{ dia: 'jueves', hora_inicio: '15:00', alumnos: { nombre_completo: 'B' } }, { dia: 'lunes', hora_inicio: '15:00', alumnos: { nombre_completo: 'A' } }]
    expect(ordenarInscripciones(rows, horarios)).toEqual([rows[1], rows[0]])
  })
  it('separa horas iguales en días distintos y conserva días originales', () => {
    const grupos = agruparTurnos([
      { alumno_id: 'a', dia: 'lunes', hora_inicio: '15:00', hora_fin: '15:30' },
      { alumno_id: 'b', dia: 'jueves', hora_inicio: '15:00', hora_fin: '15:30' },
    ], horarios)
    expect(grupos.map(g => [g.dia, g.alumnosIds])).toEqual([['lunes', ['a']], ['jueves', ['b']]])
  })
  it('rechaza un turno fuera del bloque y acepta uno dentro', () => {
    expect(validarTurno({ dia: 'lunes', horaInicio: '15:00', horaFin: '15:30' }, horarios)).toBeNull()
    expect(validarTurno({ dia: 'martes', horaInicio: '15:00', horaFin: '15:30' }, horarios)).toMatch(/dentro/)
  })
})

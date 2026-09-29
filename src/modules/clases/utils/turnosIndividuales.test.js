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

  it('representa los 18 turnos reales anonimizados de piano de Juan Cardona (29-09-2026)', () => {
    // Consulta de solo lectura: se conservan únicamente día y franja, sin IDs ni nombres.
    const bloques = [
      { dia: 'jueves', hora_inicio: '14:00:00', hora_fin: '17:00:00' },
      { dia: 'viernes', hora_inicio: '14:00:00', hora_fin: '17:00:00' },
      { dia: 'sábado', hora_inicio: '09:00:00', hora_fin: '13:00:00' },
    ]
    const franjas = {
      jueves: ['14:00', '14:30', '15:00', '15:30', '16:30'],
      viernes: ['14:00', '14:30', '15:00', '15:30', '16:00', '16:30'],
      sábado: ['09:00', '09:30', '10:00', '10:30', '11:00', '12:00', '12:30'],
    }
    const siguienteMediaHora = (hora) => {
      const minutes = Number(hora.slice(0, 2)) * 60 + Number(hora.slice(3)) + 30
      return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`
    }
    const alumnos = Object.entries(franjas).flatMap(([dia, horas]) => horas.map((hora, i) => ({
      alumno_id: `${dia}-${i}`, dia, hora_inicio: `${hora}:00`, hora_fin: `${siguienteMediaHora(hora)}:00`,
    })))
    expect(alumnos).toHaveLength(18)
    expect(alumnos.every(a => validarTurno({ dia: a.dia, horaInicio: a.hora_inicio.slice(0, 5), horaFin: a.hora_fin.slice(0, 5) }, bloques) === null)).toBe(true)
    const grupos = agruparTurnos(alumnos, bloques)
    expect(grupos).toHaveLength(18)
    expect(grupos.reduce((acc, g) => ({ ...acc, [g.dia]: (acc[g.dia] || 0) + 1 }), {})).toEqual({ jueves: 5, viernes: 6, sábado: 7 })
    expect(grupos.filter(g => g.hora_inicio === '14:00')).toHaveLength(2)
    expect(ordenarInscripciones(alumnos, bloques).map(a => a.dia)).toEqual([
      ...Array(5).fill('jueves'), ...Array(6).fill('viernes'), ...Array(7).fill('sábado'),
    ])
  })
})

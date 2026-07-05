// src/portal-maestros/services/__tests__/reportService.test.js
import { describe, it, expect } from 'vitest'
import { calcAttendanceStats, buildAlumnoAttMap } from '../reportService.js'

describe('calcAttendanceStats', () => {
  it('counts P, A, J from a session asistencia array', () => {
    const att = [
      { alumno_id: '1', estado: 'P' },
      { alumno_id: '2', estado: 'A' },
      { alumno_id: '3', estado: 'J' },
      { alumno_id: '4', estado: 'P' },
    ]
    expect(calcAttendanceStats(att)).toEqual({ P: 2, A: 1, J: 1, total: 4 })
  })

  it('returns zeros for empty array', () => {
    expect(calcAttendanceStats([])).toEqual({ P: 0, A: 0, J: 0, total: 0 })
  })
})

describe('buildAlumnoAttMap', () => {
  it('builds a map of alumnoId → estado per sesion', () => {
    const sesiones = [
      { id: 's1', asistencia: [{ alumno_id: 'a1', estado: 'P' }, { alumno_id: 'a2', estado: 'A' }] },
      { id: 's2', asistencia: [{ alumno_id: 'a1', estado: 'J' }, { alumno_id: 'a2', estado: 'P' }] },
    ]
    const result = buildAlumnoAttMap(sesiones)
    expect(result['a1']['s1']).toBe('P')
    expect(result['a1']['s2']).toBe('J')
    expect(result['a2']['s1']).toBe('A')
    expect(result['a2']['s2']).toBe('P')
  })
})

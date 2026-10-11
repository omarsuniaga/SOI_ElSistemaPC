import { describe, it, expect } from 'vitest'
import { buildClassHealthData } from '../classHealthService.js'

const timeline = [
  {
    fecha: '2025-12-15',
    clases: [
      {
        clase_id: 'coro',
        clase_nombre: 'Coro',
        maestro_nombre: 'Equipo',
        instrumento: 'Coro',
        presentes: 2,
        justificados: 0,
        ausentes: 2,
        asistencias: [],
      },
    ],
  },
  {
    fecha: '2026-01-12',
    clases: [
      {
        clase_id: 'coro',
        clase_nombre: 'Coro',
        maestro_nombre: 'Equipo',
        instrumento: 'Coro',
        presentes: 3,
        justificados: 0,
        ausentes: 1,
        asistencias: [],
      },
    ],
  },
  {
    fecha: '2026-08-27',
    clases: [
      {
        clase_id: 'c1',
        clase_nombre: 'Violín N2',
        maestro_nombre: 'Omar',
        instrumento: 'Violín',
        presentes: 1,
        justificados: 1,
        ausentes: 2,
        asistencias: [],
      },
    ],
  },
  {
    fecha: '2026-09-03',
    clases: [
      {
        clase_id: 'c1',
        clase_nombre: 'Violín N2',
        maestro_nombre: 'Omar',
        instrumento: 'Violín',
        presentes: 0,
        justificados: 0,
        ausentes: 0,
        asistencias: [
          { alumno_id: 'a1', alumno_nombre: 'Ana', estado: 'presente' },
          { alumno_id: 'a2', alumno_nombre: 'Luis', estado: 'tarde' },
          { alumno_id: 'a3', alumno_nombre: 'Marta', estado: 'justificado' },
          { alumno_id: 'a4', alumno_nombre: 'Pedro', estado: 'ausente' },
        ],
      },
    ],
  },
  {
    fecha: '2026-09-10',
    clases: [
      {
        clase_id: 'c1',
        clase_nombre: 'Violín N2',
        maestro_nombre: 'Omar',
        instrumento: 'Violín',
        presentes: 4,
        justificados: 0,
        ausentes: 0,
        asistencias: [
          { alumno_id: 'a1', alumno_nombre: 'Ana', estado: 'presente' },
          { alumno_id: 'a2', alumno_nombre: 'Luis', estado: 'presente' },
          { alumno_id: 'a3', alumno_nombre: 'Marta', estado: 'presente' },
          { alumno_id: 'a4', alumno_nombre: 'Pedro', estado: 'presente' },
        ],
      },
    ],
  },
  {
    fecha: '2026-09-05',
    clases: [
      {
        clase_id: 'c2',
        clase_nombre: 'Viola N1',
        maestro_nombre: 'Omar',
        instrumento: 'Viola',
        presentes: 2,
        justificados: 0,
        ausentes: 0,
        asistencias: [],
      },
    ],
  },
]

describe('buildClassHealthData - attendance', () => {
  it('counts tarde as attended and as late', () => {
    const data = buildClassHealthData(timeline, { year: 2026, monthIndex: 8 })
    const violin = data.classes.find((c) => c.classId === 'c1')

    expect(violin.sessions).toBe(2)
    expect(violin.attended).toBe(6)
    expect(violin.late).toBe(1)
    expect(violin.justified).toBe(1)
    expect(violin.absent).toBe(1)
    expect(violin.convoked).toBe(8)
    expect(violin.attendanceRatePct).toBe(75)
  })

  it('falls back to the presentes/justificados/ausentes counters when asistencias is empty', () => {
    const data = buildClassHealthData(timeline, { year: 2026, monthIndex: 8 })
    const viola = data.classes.find((c) => c.classId === 'c2')

    expect(viola.attended).toBe(2)
    expect(viola.late).toBe(0)
    expect(viola.absent).toBe(0)
    expect(viola.attendanceRatePct).toBe(100)
  })
})

describe('buildClassHealthData - month over month', () => {
  it('computes the delta in points against the previous month', () => {
    const data = buildClassHealthData(timeline, { year: 2026, monthIndex: 8 })
    const violin = data.classes.find((c) => c.classId === 'c1')

    expect(violin.previous).toEqual({ sessions: 1, attendanceRatePct: 25 })
    expect(violin.attendanceDeltaPts).toBe(50)
  })

  it('returns null previous and null delta when the previous month has no sessions for the class', () => {
    const data = buildClassHealthData(timeline, { year: 2026, monthIndex: 8 })
    const viola = data.classes.find((c) => c.classId === 'c2')

    expect(viola.previous).toBeNull()
    expect(viola.attendanceDeltaPts).toBeNull()
  })

  it('compares January against December of the previous year', () => {
    const data = buildClassHealthData(timeline, { year: 2026, monthIndex: 0 })
    const coro = data.classes.find((c) => c.classId === 'coro')

    expect(coro.sessions).toBe(1)
    expect(coro.attendanceRatePct).toBe(75)
    expect(coro.previous).toEqual({ sessions: 1, attendanceRatePct: 50 })
    expect(coro.attendanceDeltaPts).toBe(25)
  })

  it('excludes classes without sessions in the target month', () => {
    const data = buildClassHealthData(timeline, { year: 2026, monthIndex: 0 })

    expect(data.classes.map((c) => c.classId)).toEqual(['coro'])
  })

  it('reports the target month in the result', () => {
    const data = buildClassHealthData(timeline, { year: 2026, monthIndex: 8 })

    expect(data.month).toEqual({ year: 2026, monthIndex: 8 })
  })
})

describe('buildClassHealthData - ordering and summary', () => {
  it('sorts classes by name using Spanish collation', () => {
    const data = buildClassHealthData(timeline, { year: 2026, monthIndex: 8 })

    expect(data.classes.map((c) => c.className)).toEqual(['Viola N1', 'Violín N2'])
  })

  it('maps teacher and department from the session fields', () => {
    const data = buildClassHealthData(timeline, { year: 2026, monthIndex: 8 })
    const violin = data.classes.find((c) => c.classId === 'c1')

    expect(violin.teacher).toBe('Omar')
    expect(violin.department).toBe('Violín')
  })

  it('aggregates the month across classes in the summary', () => {
    const data = buildClassHealthData(timeline, { year: 2026, monthIndex: 8 })

    expect(data.summary.classCount).toBe(2)
    expect(data.summary.sessions).toBe(3)
    expect(data.summary.convoked).toBe(10)
    expect(data.summary.attendanceRatePct).toBe(80)
  })

  it('returns an empty month without throwing', () => {
    const data = buildClassHealthData([], { year: 2026, monthIndex: 8 })

    expect(data.classes).toEqual([])
    expect(data.summary.classCount).toBe(0)
    expect(data.summary.sessions).toBe(0)
    expect(data.summary.attendanceRatePct).toBeNull()
  })
})

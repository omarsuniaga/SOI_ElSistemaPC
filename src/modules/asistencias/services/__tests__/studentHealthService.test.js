import { describe, it, expect } from 'vitest'
import { buildStudentHealthData } from '../studentHealthService.js'

const target = { year: 2026, monthIndex: 2 } // March 2026

const dia = (fecha, clases) => ({ fecha, clases })
const clase = (nombre, asistencias, extra = {}) => ({
  clase_id: nombre.toLowerCase().replace(/\s+/g, '-'),
  clase_nombre: nombre,
  maestro_nombre: 'Omar',
  instrumento: 'Violín',
  asistencias,
  ...extra,
})
const fila = (alumno_id, alumno_nombre, estado, extra = {}) => ({ alumno_id, alumno_nombre, estado, ...extra })

function studentOf(result, name) {
  return result.students.find((s) => s.studentName === name)
}

describe('buildStudentHealthData: attendance states', () => {
  it('counts tarde as attended and as late', () => {
    const timeline = [dia('2026-03-02', [clase('Violín N2', [
      fila('a1', 'Ana', 'presente'),
      fila('a1', 'Ana', 'tarde'),
    ])])]

    const { students } = buildStudentHealthData(timeline, target)
    const ana = students[0]

    expect(ana.month.convoked).toBe(2)
    expect(ana.month.attended).toBe(2)
    expect(ana.month.late).toBe(1)
    expect(ana.month.attendanceRatePct).toBe(100)
  })

  it('splits absences into justified and unjustified, and rate = attended / convoked', () => {
    const timeline = [dia('2026-03-02', [clase('Violín N2', [
      fila('a1', 'Ana', 'presente'),
      fila('a1', 'Ana', 'justificado'),
      fila('a1', 'Ana', 'ausente'),
    ])]), dia('2026-03-09', [clase('Violín N2', [
      fila('a1', 'Ana', 'ausente'),
    ])])]

    const ana = buildStudentHealthData(timeline, target).students[0]

    expect(ana.month.convoked).toBe(4)
    expect(ana.month.attended).toBe(1)
    expect(ana.month.justified).toBe(1)
    expect(ana.month.unjustified).toBe(2)
    expect(ana.month.attendanceRatePct).toBe(25)
  })

  it('ignores attendance rows with an unknown estado', () => {
    const timeline = [dia('2026-03-02', [clase('Violín N2', [
      fila('a1', 'Ana', 'licencia'),
      fila('a2', 'Beto', 'presente'),
    ])])]

    const { students, summary } = buildStudentHealthData(timeline, target)

    expect(students.map((s) => s.studentName)).toEqual(['Beto'])
    expect(summary.studentCount).toBe(1)
  })
})

describe('buildStudentHealthData: period and month windows', () => {
  it('separates the period (all months up to the target) from the target month', () => {
    const timeline = [
      dia('2026-02-10', [clase('Violín N2', [fila('a1', 'Ana', 'presente')])]),
      dia('2026-03-02', [clase('Violín N2', [fila('a1', 'Ana', 'ausente')])]),
    ]

    const ana = buildStudentHealthData(timeline, target).students[0]

    expect(ana.period.convoked).toBe(2)
    expect(ana.period.attended).toBe(1)
    expect(ana.period.attendanceRatePct).toBe(50)
    expect(ana.month.convoked).toBe(1)
    expect(ana.month.attended).toBe(0)
    expect(ana.month.attendanceRatePct).toBe(0)
  })

  it('ignores sessions after the target month', () => {
    const timeline = [
      dia('2026-03-02', [clase('Violín N2', [fila('a1', 'Ana', 'presente')])]),
      dia('2026-04-06', [clase('Violín N2', [fila('a1', 'Ana', 'ausente')])]),
    ]

    const { students, summary } = buildStudentHealthData(timeline, target)

    expect(students[0].period.convoked).toBe(1)
    expect(students[0].period.unjustified).toBe(0)
    expect(students[0].series.map((p) => p.monthIndex)).toEqual([2])
    expect(summary.period.convoked).toBe(1)
  })

  it('reports null rates when there are no convocations in the month', () => {
    const timeline = [
      dia('2026-02-10', [clase('Violín N2', [fila('a1', 'Ana', 'presente')])]),
    ]

    const ana = buildStudentHealthData(timeline, target).students[0]

    expect(ana.month.convoked).toBe(0)
    expect(ana.month.attendanceRatePct).toBeNull()
    expect(ana.period.attendanceRatePct).toBe(100)
  })
})

describe('buildStudentHealthData: monthly series, trend and projection', () => {
  it('builds one chronological series point per month with convocations', () => {
    const timeline = [
      dia('2026-01-12', [clase('Violín N2', [fila('a1', 'Ana', 'presente')])]),
      dia('2026-02-09', [clase('Violín N2', [fila('a1', 'Ana', 'presente'), fila('a1', 'Ana', 'ausente')])]),
    ]

    const ana = buildStudentHealthData(timeline, target).students[0]

    expect(ana.series).toEqual([
      { year: 2026, monthIndex: 0, convoked: 1, attendanceRatePct: 100 },
      { year: 2026, monthIndex: 1, convoked: 2, attendanceRatePct: 50 },
    ])
  })

  it('computes the trend slope and projection by least squares', () => {
    // Rates 80, 70, 60 over Jan, Feb, Mar: slope -10 pts/month.
    // Fitted line: y = 80 - 10 * (x - Jan). April (x = 3) projects 50.
    const timeline = [
      dia('2026-01-05', [clase('Violín N2', [
        fila('a1', 'Ana', 'presente'), fila('a1', 'Ana', 'presente'),
        fila('a1', 'Ana', 'presente'), fila('a1', 'Ana', 'presente'),
        fila('a1', 'Ana', 'ausente'),
      ])]),
      dia('2026-02-05', [clase('Violín N2', [
        ...Array(7).fill(fila('a1', 'Ana', 'presente')),
        ...Array(3).fill(fila('a1', 'Ana', 'ausente')),
      ])]),
      dia('2026-03-05', [clase('Violín N2', [
        ...Array(3).fill(fila('a1', 'Ana', 'presente')),
        ...Array(2).fill(fila('a1', 'Ana', 'ausente')),
      ])]),
    ]

    const ana = buildStudentHealthData(timeline, target).students[0]

    expect(ana.trendPtsPerMonth).toBe(-10)
    expect(ana.projectedNextMonthRatePct).toBe(50)
  })

  it('returns null trend and projection with fewer than 3 months', () => {
    const timeline = [
      dia('2026-02-05', [clase('Violín N2', [fila('a1', 'Ana', 'presente')])]),
      dia('2026-03-05', [clase('Violín N2', [fila('a1', 'Ana', 'ausente')])]),
    ]

    const ana = buildStudentHealthData(timeline, target).students[0]

    expect(ana.trendPtsPerMonth).toBeNull()
    expect(ana.projectedNextMonthRatePct).toBeNull()
  })

  it('clamps the projection to 0 when the fitted line goes below zero', () => {
    // Rates 40, 20, 0 -> slope -20, fitted April = -20 -> clamped to 0.
    const timeline = [
      dia('2026-01-05', [clase('Violín N2', [
        fila('a1', 'Ana', 'presente'), fila('a1', 'Ana', 'presente'),
        ...Array(3).fill(fila('a1', 'Ana', 'ausente')),
      ])]),
      dia('2026-02-05', [clase('Violín N2', [
        fila('a1', 'Ana', 'presente'),
        ...Array(4).fill(fila('a1', 'Ana', 'ausente')),
      ])]),
      dia('2026-03-05', [clase('Violín N2', [
        ...Array(5).fill(fila('a1', 'Ana', 'ausente')),
      ])]),
    ]

    const ana = buildStudentHealthData(timeline, target).students[0]

    expect(ana.trendPtsPerMonth).toBe(-20)
    expect(ana.projectedNextMonthRatePct).toBe(0)
  })

  it('clamps the projection to 100 when the fitted line goes above 100', () => {
    // Rates 60, 80, 100 -> slope +20, fitted April = 120 -> clamped to 100.
    const timeline = [
      dia('2026-01-05', [clase('Violín N2', [
        ...Array(3).fill(fila('a1', 'Ana', 'presente')),
        ...Array(2).fill(fila('a1', 'Ana', 'ausente')),
      ])]),
      dia('2026-02-05', [clase('Violín N2', [
        ...Array(4).fill(fila('a1', 'Ana', 'presente')),
        fila('a1', 'Ana', 'ausente'),
      ])]),
      dia('2026-03-05', [clase('Violín N2', [
        ...Array(5).fill(fila('a1', 'Ana', 'presente')),
      ])]),
    ]

    const ana = buildStudentHealthData(timeline, target).students[0]

    expect(ana.trendPtsPerMonth).toBe(20)
    expect(ana.projectedNextMonthRatePct).toBe(100)
  })
})

describe('buildStudentHealthData: students and summary', () => {
  it('aggregates a student who appears in two classes once', () => {
    const timeline = [dia('2026-03-02', [
      clase('Violín N2', [fila('a1', 'Ana', 'presente')]),
      clase('Coro', [fila('a1', 'Ana', 'ausente')]),
    ])]

    const { students, summary } = buildStudentHealthData(timeline, target)

    expect(students).toHaveLength(1)
    expect(students[0].classes).toEqual(['Coro', 'Violín N2'])
    expect(students[0].month.convoked).toBe(2)
    expect(summary.studentCount).toBe(1)
  })

  it('sorts students by name in Spanish collation', () => {
    const timeline = [dia('2026-03-02', [clase('Violín N2', [
      fila('a2', 'Zoe', 'presente'),
      fila('a1', 'Álvaro', 'presente'),
      fila('a3', 'Beatriz', 'presente'),
    ])])]

    const { students } = buildStudentHealthData(timeline, target)

    expect(students.map((s) => s.studentName)).toEqual(['Álvaro', 'Beatriz', 'Zoe'])
  })

  it('summarises period and month totals across students', () => {
    const timeline = [dia('2026-03-02', [clase('Violín N2', [
      fila('a1', 'Ana', 'presente'),
      fila('a2', 'Beto', 'ausente'),
      fila('a2', 'Beto', 'justificado'),
    ])])]

    const { summary } = buildStudentHealthData(timeline, target)

    expect(summary.studentCount).toBe(2)
    expect(summary.month).toEqual({
      convoked: 3, attended: 1, late: 0, justified: 1, unjustified: 1, attendanceRatePct: 33.3,
    })
    expect(summary.period.convoked).toBe(3)
  })

  it('returns empty students and null rates for an empty timeline', () => {
    const result = buildStudentHealthData([], target)

    expect(result.month).toEqual({ year: 2026, monthIndex: 2 })
    expect(result.students).toEqual([])
    expect(result.summary.studentCount).toBe(0)
    expect(result.summary.month.attendanceRatePct).toBeNull()
    expect(result.summary.period.attendanceRatePct).toBeNull()
  })

  it('exposes the per-student data shape', () => {
    const timeline = [dia('2026-03-02', [clase('Violín N2', [fila('a1', 'Ana', 'presente')])])]

    const ana = studentOf(buildStudentHealthData(timeline, target), 'Ana')

    expect(ana).toMatchObject({
      studentId: 'a1',
      studentName: 'Ana',
      instrument: 'Violín',
      classes: ['Violín N2'],
    })
  })
})

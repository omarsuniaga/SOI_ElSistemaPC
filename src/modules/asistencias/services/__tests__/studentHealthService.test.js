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

const GENERATED_AT = new Date('2026-03-20T12:00:00Z')
const build = (timeline, progressByStudent = null) =>
  buildStudentHealthData(timeline, { ...target, progressByStudent, generatedAt: GENERATED_AT })
const progresoDto = ({ gradesCount = 0, promedio = null, indTotal = 0, indPassed = 0 } = {}) => ({
  grades: { count: gradesCount, promedio },
  indicators: {
    total: indTotal,
    passed: indPassed,
    pass_rate: indTotal > 0 ? indPassed / indTotal : null,
  },
})
const recTypes = (student) => student.recommendations.map((r) => r.type)
const recOf = (student, type) => student.recommendations.find((r) => r.type === type)

describe('buildStudentHealthData: content received and not received', () => {
  it('lists content only as received when attended, and as not received with status when absent or justified', () => {
    const timeline = [
      dia('2026-03-02', [clase('Violín N2', [fila('a1', 'Ana', 'presente')], { observacion_clase: 'Escalas mayores' })]),
      dia('2026-03-09', [clase('Violín N2', [fila('a1', 'Ana', 'ausente')], { observacion_clase: 'Arpegios' })]),
      dia('2026-03-16', [clase('Violín N2', [fila('a1', 'Ana', 'justificado')], { observacion_sesion: 'Repaso de escalas' })]),
    ]

    const ana = build(timeline).students[0]

    expect(ana.content.received).toEqual([
      { date: '2026-03-02', className: 'Violín N2', text: 'Escalas mayores' },
    ])
    expect(ana.content.notReceived).toEqual([
      { date: '2026-03-09', className: 'Violín N2', text: 'Arpegios', status: 'ausente' },
      { date: '2026-03-16', className: 'Violín N2', text: 'Repaso de escalas', status: 'justificado' },
    ])
  })

  it('excludes sessions without content from both lists and from exposure', () => {
    const timeline = [
      dia('2026-03-02', [clase('Violín N2', [fila('a1', 'Ana', 'presente')])]),
      dia('2026-03-09', [clase('Violín N2', [fila('a1', 'Ana', 'presente')], { observacion_clase: 'Arpegios' })]),
      dia('2026-03-16', [clase('Violín N2', [fila('a1', 'Ana', 'ausente')], { observacion_sesion: '   ' })]),
    ]

    const ana = build(timeline).students[0]

    expect(ana.content.received).toHaveLength(1)
    expect(ana.content.notReceived).toEqual([])
    expect(ana.content.period).toEqual({ delivered: 1, received: 1, exposurePct: 100 })
  })

  it('computes period exposure over all sessions with content, while lists cover the month only', () => {
    const timeline = [
      dia('2026-02-10', [clase('Violín N2', [fila('a1', 'Ana', 'presente')], { observacion_clase: 'Febrero' })]),
      dia('2026-03-02', [clase('Violín N2', [fila('a1', 'Ana', 'ausente')], { observacion_clase: 'Marzo A' })]),
      dia('2026-03-09', [clase('Violín N2', [fila('a1', 'Ana', 'presente')], { observacion_clase: 'Marzo B' })]),
    ]

    const ana = build(timeline).students[0]

    expect(ana.content.period).toEqual({ delivered: 3, received: 2, exposurePct: 66.7 })
    expect(ana.content.received.map((c) => c.text)).toEqual(['Marzo B'])
    expect(ana.content.notReceived.map((c) => c.text)).toEqual(['Marzo A'])
  })
})

describe('buildStudentHealthData: progress merge', () => {
  const dto = progresoDto({ gradesCount: 4, promedio: 7.25, indTotal: 5, indPassed: 4 })
  const timeline = [dia('2026-03-02', [clase('Violín N2', [fila('a1', 'Ana', 'presente')])])]

  it('is null when there is no progress data or no entry for the student', () => {
    expect(build(timeline).students[0].progress).toBeNull()
    expect(build(timeline, new Map()).students[0].progress).toBeNull()
    expect(build(timeline, { other: dto }).students[0].progress).toBeNull()
  })

  it('merges progress from a Map keyed by student id', () => {
    const ana = build(timeline, new Map([['a1', dto]])).students[0]

    expect(ana.progress).toEqual({
      gradesCount: 4, gradesAverage: 7.25, indicatorAttempts: 5, indicatorPassRatePct: 80,
    })
  })

  it('merges progress from a plain object keyed by student id', () => {
    const ana = build(timeline, { a1: dto }).students[0]

    expect(ana.progress.gradesAverage).toBe(7.25)
    expect(ana.progress.indicatorPassRatePct).toBe(80)
  })
})

describe('buildStudentHealthData: recommendations', () => {
  it('guardian_meeting fires at 3 unjustified absences in the period, not at 2', () => {
    const febrero = (n) => dia('2026-02-10', [clase('Violín N2', Array(n).fill(fila('a1', 'Ana', 'ausente')))])
    const marzo = dia('2026-03-02', [clase('Violín N2', Array(5).fill(fila('a1', 'Ana', 'presente')))])

    expect(recTypes(build([febrero(2), marzo]).students[0])).not.toContain('guardian_meeting')
    expect(recTypes(build([febrero(3), marzo]).students[0])).toContain('guardian_meeting')
  })

  it('guardian_meeting fires when the month rate is below 70% with two or more convocations', () => {
    const ana = build([dia('2026-03-02', [clase('Violín N2', [
      fila('a1', 'Ana', 'presente'), fila('a1', 'Ana', 'justificado'),
    ])])]).students[0]

    expect(recTypes(ana)).toContain('guardian_meeting')
  })

  it('guardian_meeting does not fire with a single convocation in the month or at exactly 70%', () => {
    const single = build([dia('2026-03-02', [clase('Violín N2', [fila('a1', 'Ana', 'justificado')])])]).students[0]
    const exact = build([dia('2026-03-02', [clase('Violín N2', [
      ...Array(7).fill(fila('a1', 'Ana', 'presente')),
      ...Array(3).fill(fila('a1', 'Ana', 'justificado')),
    ])])]).students[0]

    expect(recTypes(single)).not.toContain('guardian_meeting')
    expect(recTypes(exact)).not.toContain('guardian_meeting')
  })

  it('plan_review fires at 80% period attendance with 3+ grades averaging below 2.5 (1-5 scale)', () => {
    const timeline = [dia('2026-03-02', [clase('Violín N2', [
      ...Array(4).fill(fila('a1', 'Ana', 'presente')),
      fila('a1', 'Ana', 'justificado'),
    ])])]
    const low = new Map([['a1', progresoDto({ gradesCount: 3, promedio: 2.4 })]])
    const boundary = new Map([['a1', progresoDto({ gradesCount: 3, promedio: 2.5 })]])
    const usual = new Map([['a1', progresoDto({ gradesCount: 5, promedio: 3 })]])
    const fewGrades = new Map([['a1', progresoDto({ gradesCount: 2, promedio: 1 })]])
    const rec = build(timeline, low).students[0].recommendations.find((r) => r.type === 'plan_review')

    expect(rec.evidence).toContain('promedio 2.4')
    expect(rec.evidence).toContain('escala de 1 a 5')
    expect(recTypes(build(timeline, boundary).students[0])).not.toContain('plan_review')
    expect(recTypes(build(timeline, usual).students[0])).not.toContain('plan_review')
    expect(recTypes(build(timeline, fewGrades).students[0])).not.toContain('plan_review')
  })

  it('plan_review fires with 4+ indicator attempts below 50% pass rate, not with 3', () => {
    const timeline = [dia('2026-03-02', [clase('Violín N2', [
      ...Array(4).fill(fila('a1', 'Ana', 'presente')),
      fila('a1', 'Ana', 'justificado'),
    ])])]
    const four = new Map([['a1', progresoDto({ indTotal: 4, indPassed: 1 })]])
    const three = new Map([['a1', progresoDto({ indTotal: 3, indPassed: 0 })]])

    expect(recTypes(build(timeline, four).students[0])).toContain('plan_review')
    expect(recTypes(build(timeline, three).students[0])).not.toContain('plan_review')
  })

  it('plan_review never fires below 80% period attendance, even with weak progress', () => {
    const timeline = [dia('2026-03-02', [clase('Violín N2', [
      fila('a1', 'Ana', 'presente'), fila('a1', 'Ana', 'presente'),
      ...Array(3).fill(fila('a1', 'Ana', 'justificado')),
    ])])]
    const weak = new Map([['a1', progresoDto({ gradesCount: 4, promedio: 3, indTotal: 5, indPassed: 0 })]])

    expect(recTypes(build(timeline, weak).students[0])).not.toContain('plan_review')
  })

  it('plan_review never fires without progress data', () => {
    const timeline = [dia('2026-03-02', [clase('Violín N2', Array(5).fill(fila('a1', 'Ana', 'presente'))) ])]

    expect(recTypes(build(timeline).students[0])).not.toContain('plan_review')
  })

  it('preventive_followup fires with trend <= -10 and projection < 70 when no guardian meeting applies', () => {
    // Rates 90, 80, 70 with justified (not unjustified) absences: slope -10, April projects 60.
    const timeline = [
      dia('2026-01-05', [clase('Violín N2', [...Array(9).fill(fila('a1', 'Ana', 'presente')), fila('a1', 'Ana', 'justificado')])]),
      dia('2026-02-05', [clase('Violín N2', [...Array(8).fill(fila('a1', 'Ana', 'presente')), ...Array(2).fill(fila('a1', 'Ana', 'justificado'))])]),
      dia('2026-03-05', [clase('Violín N2', [...Array(7).fill(fila('a1', 'Ana', 'presente')), ...Array(3).fill(fila('a1', 'Ana', 'justificado'))])]),
    ]

    const ana = build(timeline).students[0]

    expect(ana.trendPtsPerMonth).toBe(-10)
    expect(ana.projectedNextMonthRatePct).toBe(60)
    expect(recTypes(ana)).toEqual(['preventive_followup'])
  })

  it('preventive_followup is suppressed when guardian_meeting fires', () => {
    // Same declining series as the S1 trend test: 6 unjustified absences in the period.
    const timeline = [
      dia('2026-01-05', [clase('Violín N2', [
        fila('a1', 'Ana', 'presente'), fila('a1', 'Ana', 'presente'),
        fila('a1', 'Ana', 'presente'), fila('a1', 'Ana', 'presente'), fila('a1', 'Ana', 'ausente'),
      ])]),
      dia('2026-02-05', [clase('Violín N2', [
        ...Array(7).fill(fila('a1', 'Ana', 'presente')), ...Array(3).fill(fila('a1', 'Ana', 'ausente')),
      ])]),
      dia('2026-03-05', [clase('Violín N2', [
        ...Array(3).fill(fila('a1', 'Ana', 'presente')), ...Array(2).fill(fila('a1', 'Ana', 'ausente')),
      ])]),
    ]

    const ana = build(timeline).students[0]

    expect(ana.trendPtsPerMonth).toBe(-10)
    expect(recTypes(ana)).toEqual(['guardian_meeting'])
  })

  it('gives every recommendation the six R6 fields and reviewBy = generatedAt + 30 days', () => {
    const timeline = [dia('2026-03-02', [clase('Violín N2', [fila('a1', 'Ana', 'ausente'), fila('a1', 'Ana', 'ausente')])])]

    const rec = build(timeline).students[0].recommendations[0]

    expect(rec.type).toBe('guardian_meeting')
    for (const field of ['what', 'evidence', 'why', 'action', 'decides']) {
      expect(typeof rec[field]).toBe('string')
      expect(rec[field].trim()).not.toBe('')
    }
    expect(rec.reviewBy).toBe('2026-04-19')
  })

  it('cites the dates of unjustified absences in the evidence', () => {
    const timeline = [
      dia('2026-03-02', [clase('Violín N2', [fila('a1', 'Ana', 'ausente')])]),
      dia('2026-03-09', [clase('Violín N2', [fila('a1', 'Ana', 'ausente')])]),
      dia('2026-03-16', [clase('Violín N2', [fila('a1', 'Ana', 'ausente')])]),
    ]

    const rec = recOf(build(timeline).students[0], 'guardian_meeting')

    expect(rec.evidence).toContain('02/03/2026')
    expect(rec.evidence).toContain('16/03/2026')
  })

  it('never labels or diagnoses a student in any recommendation text', () => {
    const scenarios = [
      [dia('2026-03-02', [clase('Violín N2', Array(3).fill(fila('a1', 'Ana', 'ausente')))])],
      [dia('2026-03-02', [clase('Violín N2', [...Array(4).fill(fila('a1', 'Ana', 'presente')), fila('a1', 'Ana', 'justificado')])])],
    ]
    const texts = scenarios.flatMap((timeline, i) => {
      const progress = i === 1 ? new Map([['a1', progresoDto({ indTotal: 4, indPassed: 1 })]]) : null
      return build(timeline, progress).students[0].recommendations.flatMap((r) =>
        [r.what, r.evidence, r.why, r.action, r.decides])
    })

    expect(texts.length).toBeGreaterThan(0)
    for (const text of texts) {
      expect(text).not.toMatch(/problem[aá]tic|sin aptitud|talento|incapaz|flojo/i)
    }
  })

  it('reports recommendation counts and students with recommendations in the summary', () => {
    const timeline = [dia('2026-03-02', [clase('Violín N2', [
      ...Array(3).fill(fila('a1', 'Ana', 'ausente')),
      fila('a2', 'Beto', 'presente'),
    ])])]

    const { summary } = build(timeline)

    expect(summary.recommendationCounts).toEqual({
      guardian_meeting: 1, plan_review: 0, preventive_followup: 0,
    })
    expect(summary.studentsWithRecommendations).toBe(1)
  })
})

describe('buildStudentHealthData: guardian meeting on justified absences', () => {
  it('does not describe justified absences as unjustified', () => {
    const timeline = [dia('2026-03-02', [clase('Violín N2', [
      fila('a1', 'Ana', 'justificado'), fila('a1', 'Ana', 'justificado'), fila('a1', 'Ana', 'justificado'),
    ])])]
    const rec = recOf(build(timeline).students[0], 'guardian_meeting')

    expect(rec.what).not.toMatch(/sin justificar/i)
    expect(rec.why).not.toMatch(/sin justificar/i)
    expect(rec.why).toMatch(/justificadas/i)
    expect(rec.evidence).toContain('3 justificadas, 0 sin justificar')
  })

  it('keeps the unjustified wording when unjustified absences trigger the rule', () => {
    const timeline = [dia('2026-03-02', [clase('Violín N2', Array(3).fill(fila('a1', 'Ana', 'ausente')))])]
    const rec = recOf(build(timeline).students[0], 'guardian_meeting')

    expect(rec.why).toMatch(/sin justificar/i)
  })
})

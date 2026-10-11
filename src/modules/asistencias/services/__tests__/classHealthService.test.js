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

function sesion(fecha, { clase_id = 'c1', clase_nombre = 'Violín N2', ...campos } = {}) {
  return {
    fecha,
    clases: [{
      clase_id,
      clase_nombre,
      maestro_nombre: 'Omar',
      instrumento: 'Violín',
      presentes: 3,
      justificados: 0,
      ausentes: 1,
      observacion_sesion: null,
      observacion_clase: null,
      asistencias: [],
      ...campos,
    }],
  }
}

const SEPTIEMBRE = { year: 2026, monthIndex: 8 }

describe('buildClassHealthData - content topics', () => {
  it('lists a topic repeated in 2+ sessions with its count, attention % and dates', () => {
    const data = buildClassHealthData([
      sesion('2026-09-03', { observacion_sesion: 'Escalas mayores en tono de do' }),
      sesion('2026-09-10', { observacion_sesion: 'Escalas mayores en tono de sol' }),
      sesion('2026-09-17', { observacion_sesion: 'Arpegios de triada' }),
      sesion('2026-09-24', { observacion_sesion: 'Escalas menores' }),
    ], SEPTIEMBRE)
    const topic = data.classes[0].content.topics.find((t) => t.label === 'escalas mayores')

    expect(topic).toEqual({
      label: 'escalas mayores',
      sessions: 2,
      attentionPct: 50,
      dates: ['2026-09-03', '2026-09-10'],
    })
  })

  it('does not treat a term appearing in only one session as a topic', () => {
    const data = buildClassHealthData([
      sesion('2026-09-03', { observacion_sesion: 'Escalas mayores en tono de do' }),
      sesion('2026-09-10', { observacion_sesion: 'Escalas mayores en tono de sol' }),
      sesion('2026-09-17', { observacion_sesion: 'Arpegios de triada' }),
    ], SEPTIEMBRE)
    const labels = data.classes[0].content.topics.map((t) => t.label)

    expect(labels).not.toContain('arpegios')
    expect(labels).not.toContain('triada')
    expect(labels).not.toContain('arpegios triada')
    expect(data.classes[0].content.topics.every((t) => t.sessions >= 2)).toBe(true)
  })

  it('drops a unigram that is contained in a kept bigram', () => {
    const data = buildClassHealthData([
      sesion('2026-09-03', { observacion_sesion: 'Escalas mayores en tono de do' }),
      sesion('2026-09-10', { observacion_sesion: 'Escalas mayores en tono de sol' }),
    ], SEPTIEMBRE)
    const labels = data.classes[0].content.topics.map((t) => t.label)

    expect(labels).toContain('escalas mayores')
    expect(labels).not.toContain('escalas')
    expect(labels).not.toContain('mayores')
  })

  it('normalizes accents, case and punctuation before counting', () => {
    const data = buildClassHealthData([
      sesion('2026-09-03', { observacion_sesion: 'Práctica del RÍTMO binario' }),
      sesion('2026-09-10', { observacion_sesion: 'practica del ritmo BINARIO.' }),
    ], SEPTIEMBRE)
    const labels = data.classes[0].content.topics.map((t) => t.label)

    expect(labels).toEqual(['practica ritmo', 'ritmo binario'])
  })

  it('uses observacion_clase when observacion_sesion is empty', () => {
    const data = buildClassHealthData([
      sesion('2026-09-03', { observacion_sesion: null, observacion_clase: 'Escalas mayores' }),
      sesion('2026-09-10', { observacion_sesion: 'Escalas mayores' }),
    ], SEPTIEMBRE)

    expect(data.classes[0].content.sessionsWithContent).toBe(2)
    expect(data.classes[0].content.topics.map((t) => t.label)).toContain('escalas mayores')
  })
})

describe('buildClassHealthData - content coverage and repetition', () => {
  it('counts sessions without recorded content and lowers coverage', () => {
    const data = buildClassHealthData([
      sesion('2026-09-03', { observacion_sesion: 'Escalas mayores' }),
      sesion('2026-09-10', { observacion_sesion: '   ' }),
      sesion('2026-09-17', { observacion_sesion: null }),
      sesion('2026-09-24', { observacion_sesion: 'Arpegios de triada' }),
    ], SEPTIEMBRE)
    const { content } = data.classes[0]

    expect(content.sessionsWithContent).toBe(2)
    expect(content.sessionsWithoutContent).toBe(2)
    expect(content.coveragePct).toBe(50)
  })

  it('detects identical content as repeated, ignoring case, accents and spacing', () => {
    const data = buildClassHealthData([
      sesion('2026-09-03', { observacion_sesion: 'Escalas mayores.' }),
      sesion('2026-09-10', { observacion_sesion: 'escalas   MAYORES' }),
      sesion('2026-09-17', { observacion_sesion: 'Arpegios' }),
    ], SEPTIEMBRE)
    const { content } = data.classes[0]

    expect(content.repeatedContentSessions).toBe(1)
    expect(content.varietyPct).toBe(66.7)
  })
})

describe('buildClassHealthData - health score', () => {
  it('computes the score with the documented formula', () => {
    // Attendance 12/16 = 75%. Coverage 3/4 = 75%. Variety 2 distinct / 3 with content = 66.7%.
    // 0.5*75 + 0.3*75 + 0.2*66.7 = 73.34 -> 73
    const data = buildClassHealthData([
      sesion('2026-09-03', { observacion_sesion: 'Escalas mayores en tono de do' }),
      sesion('2026-09-10', { observacion_sesion: 'Escalas mayores en tono de sol' }),
      sesion('2026-09-17', { observacion_sesion: null }),
      sesion('2026-09-24', { observacion_sesion: 'Escalas mayores en tono de do' }),
    ], SEPTIEMBRE)
    const violin = data.classes[0]

    expect(violin.attendanceRatePct).toBe(75)
    expect(violin.content.coveragePct).toBe(75)
    expect(violin.content.varietyPct).toBe(66.7)
    expect(violin.healthScore).toBe(73)
    expect(violin.healthLevel).toBe('En observación')
  })

  it('returns null score and level when the class has no convocations', () => {
    const data = buildClassHealthData([
      sesion('2026-09-03', { observacion_sesion: 'Escalas mayores' }),
      sesion('2026-09-10', { clase_id: 'c9', clase_nombre: 'Coro', presentes: 0, ausentes: 0, justificados: 0 }),
    ], SEPTIEMBRE)
    const coro = data.classes.find((c) => c.classId === 'c9')

    expect(coro.healthScore).toBeNull()
    expect(coro.healthLevel).toBeNull()
  })

  it('averages non-null scores and counts classes per level in the summary', () => {
    const data = buildClassHealthData([
      sesion('2026-09-03', { observacion_sesion: 'Escalas mayores en tono de do' }),
      sesion('2026-09-10', { observacion_sesion: 'Escalas mayores en tono de sol' }),
      sesion('2026-09-17', { observacion_sesion: null }),
      sesion('2026-09-24', { observacion_sesion: 'Escalas mayores en tono de do' }),
      sesion('2026-09-10', { clase_id: 'c9', clase_nombre: 'Coro', presentes: 0, ausentes: 0, justificados: 0 }),
    ], SEPTIEMBRE)

    expect(data.summary.averageHealthScore).toBe(73)
    expect(data.summary.levelCounts).toEqual({
      'Saludable': 0,
      'En observación': 1,
      'Requiere atención': 0,
    })
  })
})

describe('buildClassHealthData - topic boundaries', () => {
  it('does not build a topic across punctuation or across the two observation fields', () => {
    const data = buildClassHealthData([
      sesion('2026-09-03', { observacion_sesion: 'Escala mayor, posición del arco', observacion_clase: 'Afinación grupal' }),
      sesion('2026-09-10', { observacion_sesion: 'Escala mayor, posición del arco', observacion_clase: 'Afinación grupal' }),
    ], SEPTIEMBRE)
    const labels = data.classes[0].content.topics.map((t) => t.label)

    expect(labels).toEqual(expect.arrayContaining(['escala mayor', 'posicion arco', 'afinacion grupal']))
    expect(labels).not.toContain('mayor posicion')
    expect(labels).not.toContain('arco afinacion')
  })
})

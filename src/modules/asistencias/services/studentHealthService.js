/**
 * studentHealthService.js — Salud de los estudiantes (informe mensual por alumno).
 *
 * Funciones puras: reciben el timeline ya cargado por la vista de Control de
 * Asistencia. Puntúan asistencia por alumno; las recomendaciones son insumos
 * para que una persona decida, nunca etiquetan ni diagnostican a un alumno.
 */

import { pct, sessionContent } from './classHealthService.js'
import { THRESHOLDS } from '../../progresos/services/riskRules.js'

const ATTENDED_STATES = new Set(['presente', 'tarde'])
const KNOWN_STATES = new Set(['presente', 'tarde', 'justificado', 'ausente'])
const MIN_TREND_MONTHS = 3

const GUARDIAN_MIN_UNJUSTIFIED = 3
const GUARDIAN_MIN_MONTH_CONVOKED = 2
const PLAN_REVIEW_MIN_ATTENDANCE = 0.8
const PLAN_REVIEW_MIN_INDICATOR_ATTEMPTS = 4
const PREVENTIVE_MAX_TREND_PTS = -10
const REVIEW_DAYS = 30

const RECOMMENDATION_TYPES = ['guardian_meeting', 'plan_review', 'preventive_followup']

function round1(value) {
  return Math.round(value * 10) / 10
}

function ymOf(year, monthIndex) {
  return `${year}-${String(Number(monthIndex) + 1).padStart(2, '0')}`
}

function absoluteMonth(year, monthIndex) {
  return Number(year) * 12 + Number(monthIndex)
}

function fechaCorta(iso) {
  const [year, month, day] = iso.split('-')
  return `${day}/${month}/${year}`
}

/** Least squares over (x, y) pairs. Returns { slope, intercept }. */
function leastSquares(points) {
  const n = points.length
  const meanX = points.reduce((sum, p) => sum + p.x, 0) / n
  const meanY = points.reduce((sum, p) => sum + p.y, 0) / n
  let num = 0
  let den = 0
  for (const { x, y } of points) {
    num += (x - meanX) * (y - meanY)
    den += (x - meanX) ** 2
  }
  const slope = num / den
  return { slope, intercept: meanY - slope * meanX }
}

/** Trend (pts per month) and next-month projection; null below MIN_TREND_MONTHS. */
function trendOf(series, target) {
  if (series.length < MIN_TREND_MONTHS) {
    return { trendPtsPerMonth: null, projectedNextMonthRatePct: null }
  }
  const points = series.map((p) => ({
    x: absoluteMonth(p.year, p.monthIndex),
    y: p.attendanceRatePct,
  }))
  const { slope, intercept } = leastSquares(points)
  const nextX = absoluteMonth(target.year, target.monthIndex) + 1
  const projected = Math.min(100, Math.max(0, intercept + slope * nextX))
  return {
    trendPtsPerMonth: round1(slope),
    projectedNextMonthRatePct: round1(projected),
  }
}

/** Counts of one student's rows. Rate = attended / convoked. */
function tally(rows) {
  const totals = { convoked: 0, attended: 0, late: 0, justified: 0, unjustified: 0 }
  for (const { estado } of rows) {
    totals.convoked++
    if (ATTENDED_STATES.has(estado)) totals.attended++
    if (estado === 'tarde') totals.late++
    if (estado === 'justificado') totals.justified++
    if (estado === 'ausente') totals.unjustified++
  }
  return { ...totals, attendanceRatePct: pct(totals.attended, totals.convoked) }
}

/** Attendance ratio as a fraction (not rounded), used by rule boundaries. */
function ratioOf(totals) {
  return totals.convoked > 0 ? totals.attended / totals.convoked : null
}

function seriesOf(rows) {
  const byMonth = new Map()
  for (const row of rows) {
    const key = row.fecha.slice(0, 7)
    if (!byMonth.has(key)) byMonth.set(key, [])
    byMonth.get(key).push(row)
  }
  return [...byMonth.keys()].sort().map((key) => {
    const [year, month] = key.split('-')
    const totals = tally(byMonth.get(key))
    return {
      year: Number(year),
      monthIndex: Number(month) - 1,
      convoked: totals.convoked,
      attendanceRatePct: totals.attendanceRatePct,
    }
  })
}

/** Session content the student received (attended) or did not (absent/justified). */
function contentOf(rows, monthYm) {
  const withContent = rows.filter((row) => row.text)
  const monthWithContent = withContent.filter((row) => row.fecha.slice(0, 7) === monthYm)
  const received = []
  const notReceived = []

  for (const row of monthWithContent) {
    const entry = { date: row.fecha, className: row.className, text: row.text }
    if (ATTENDED_STATES.has(row.estado)) received.push(entry)
    else notReceived.push({ ...entry, status: row.estado })
  }

  const receivedCount = withContent.filter((row) => ATTENDED_STATES.has(row.estado)).length
  return {
    received,
    notReceived,
    period: {
      delivered: withContent.length,
      received: receivedCount,
      exposurePct: pct(receivedCount, withContent.length),
    },
  }
}

function progressEntry(progressByStudent, studentId) {
  if (!progressByStudent) return null
  if (progressByStudent instanceof Map) return progressByStudent.get(studentId) ?? null
  return Object.prototype.hasOwnProperty.call(progressByStudent, studentId)
    ? progressByStudent[studentId]
    : null
}

/** Display shape of a StudentProgress DTO; rules read the raw DTO instead. */
function progressOf(dto) {
  if (!dto) return null
  return {
    gradesCount: dto.grades?.count ?? 0,
    gradesAverage: dto.grades?.promedio == null
      ? null
      : Math.round(dto.grades.promedio * 100) / 100,
    indicatorAttempts: dto.indicators?.total ?? 0,
    indicatorPassRatePct: dto.indicators?.pass_rate == null
      ? null
      : round1(dto.indicators.pass_rate * 100),
  }
}

function reviewDateOf(generatedAt) {
  const date = new Date(generatedAt)
  date.setUTCDate(date.getUTCDate() + REVIEW_DAYS)
  return date.toISOString().slice(0, 10)
}

function guardianRecommendation(student, rows, reviewBy) {
  const { period, month } = student
  const periodFires = period.unjustified >= GUARDIAN_MIN_UNJUSTIFIED
  const monthRatio = ratioOf(month)
  const monthFires = month.convoked >= GUARDIAN_MIN_MONTH_CONVOKED
    && monthRatio < THRESHOLDS.attendance_min_rate
  if (!periodFires && !monthFires) return null

  const what = []
  const evidence = []
  if (periodFires) {
    const dates = rows.filter((r) => r.estado === 'ausente').map((r) => fechaCorta(r.fecha))
    what.push(`Registra ${period.unjustified} inasistencias sin justificar en el período.`)
    evidence.push(`Inasistencias sin justificar en el período: ${period.unjustified} (${dates.join(', ')}).`)
  }
  if (monthFires) {
    what.push(`Asistencia del mes de ${month.attendanceRatePct}% en ${month.convoked} convocatorias.`)
    evidence.push(`Asistencia del mes: ${month.attendanceRatePct}% (${month.attended} de ${month.convoked}).`)
  }

  return {
    type: 'guardian_meeting',
    what: what.join(' '),
    evidence: evidence.join(' '),
    why: 'Las inasistencias sin justificar y la asistencia baja pueden afectar el avance del alumno. Conviene conocer la causa junto con la familia antes de decidir otra medida.',
    action: 'Convocar a la persona encargada del alumno (tutor o tutora) a una reunión de seguimiento académico.',
    decides: 'Coordinación académica',
    reviewBy,
  }
}

function planReviewRecommendation(student, dto, reviewBy) {
  const periodRatio = ratioOf(student.period)
  if (!dto || periodRatio === null || periodRatio < PLAN_REVIEW_MIN_ATTENDANCE) return null

  const gradesLow = dto.grades?.count >= THRESHOLDS.grade_window_count
    && dto.grades.promedio < THRESHOLDS.grade_min_avg
  const indicatorsLow = dto.indicators?.total >= PLAN_REVIEW_MIN_INDICATOR_ATTEMPTS
    && dto.indicators.pass_rate < THRESHOLDS.indicator_min_pass_rate
  if (!gradesLow && !indicatorsLow) return null

  const evidence = [
    `Asistencia del período: ${student.period.attendanceRatePct}% (${student.period.attended} de ${student.period.convoked}).`,
  ]
  if (gradesLow) {
    evidence.push(`Calificaciones: ${dto.grades.count} con promedio ${Math.round(dto.grades.promedio * 100) / 100} (umbral ${THRESHOLDS.grade_min_avg}).`)
  }
  if (indicatorsLow) {
    evidence.push(`Indicadores: ${dto.indicators.total} intentos con ${Math.round(dto.indicators.pass_rate * 100)}% aprobados (umbral ${Math.round(THRESHOLDS.indicator_min_pass_rate * 100)}%).`)
  }

  return {
    type: 'plan_review',
    what: 'El progreso académico está por debajo del umbral de referencia, con asistencia alta en el período.',
    evidence: evidence.join(' '),
    why: 'Con asistencia alta, el resultado no se explica por falta de presencia; conviene revisar el plan de estudio. Esta recomendación solo se emite con asistencia del período de 80% o más, porque el progreso no puede juzgarse con asistencia baja.',
    action: 'Revisar con el maestro y la persona encargada del alumno el plan de estudio y los objetivos del período. Como una alternativa a considerar entre ambos, no como una conclusión, explorar otro instrumento.',
    decides: 'Maestro y coordinación académica',
    reviewBy,
  }
}

function preventiveRecommendation(student, reviewBy) {
  const { trendPtsPerMonth, projectedNextMonthRatePct } = student
  if (trendPtsPerMonth === null || projectedNextMonthRatePct === null) return null
  if (trendPtsPerMonth > PREVENTIVE_MAX_TREND_PTS) return null
  if (projectedNextMonthRatePct / 100 >= THRESHOLDS.attendance_min_rate) return null

  const limitPct = Math.round(THRESHOLDS.attendance_min_rate * 100)
  return {
    type: 'preventive_followup',
    what: `La asistencia baja ${Math.abs(trendPtsPerMonth)} puntos porcentuales por mes y la proyección del próximo mes es ${projectedNextMonthRatePct}%.`,
    evidence: `Tendencia sobre ${student.series.length} meses con convocatorias: ${trendPtsPerMonth} pts por mes. Proyección del próximo mes: ${projectedNextMonthRatePct}%. Asistencia del período: ${student.period.attendanceRatePct}%.`,
    why: `Si la tendencia continúa, la asistencia podría quedar por debajo del ${limitPct}% de referencia. Una revisión temprana permite conocer el motivo antes de que se acumulen inasistencias.`,
    action: 'Dar seguimiento cercano en las próximas sesiones y registrar lo conversado con el alumno.',
    decides: 'Maestro',
    reviewBy,
  }
}

/** The three R6 rules. Guardian suppresses the preventive follow-up. */
function recommendationsOf(student, rows, dto, generatedAt) {
  const reviewBy = reviewDateOf(generatedAt)
  const guardian = guardianRecommendation(student, rows, reviewBy)
  const planReview = planReviewRecommendation(student, dto, reviewBy)
  const preventive = guardian ? null : preventiveRecommendation(student, reviewBy)
  return [guardian, planReview, preventive].filter(Boolean)
}

/**
 * @param {Array} timeline Full-period timeline (days with `clases`).
 * @param {{ year: number, monthIndex: number, progressByStudent?: Map|object|null, generatedAt?: Date }} options
 *   Target month, 0-based. `progressByStudent` is keyed by student id.
 */
export function buildStudentHealthData(timeline, {
  year,
  monthIndex,
  progressByStudent = null,
  generatedAt = new Date(),
}) {
  const targetYm = ymOf(year, monthIndex)
  const target = { year: Number(year), monthIndex: Number(monthIndex) }
  const dias = Array.isArray(timeline) ? timeline : []

  const byStudent = new Map()
  const allPeriodRows = []

  for (const dia of dias) {
    if (typeof dia?.fecha !== 'string' || dia.fecha.slice(0, 7) > targetYm) continue

    for (const clase of dia.clases || []) {
      for (const asistencia of clase.asistencias || []) {
        const estado = String(asistencia.estado || '').toLowerCase()
        const key = asistencia.alumno_id || asistencia.alumno_nombre
        if (!KNOWN_STATES.has(estado) || !key) continue

        if (!byStudent.has(key)) {
          byStudent.set(key, {
            studentId: String(key),
            studentName: asistencia.alumno_nombre || String(key),
            instrument: null,
            classNames: new Set(),
            rows: [],
          })
        }
        const student = byStudent.get(key)
        student.instrument = student.instrument || asistencia.instrumento || clase.instrumento || null
        const className = clase.clase_nombre || 'Clase'
        student.classNames.add(className)

        const row = { fecha: dia.fecha, clase, estado, className, text: sessionContent(clase) }
        student.rows.push(row)
        allPeriodRows.push(row)
      }
    }
  }

  const students = [...byStudent.values()]
    .map((student) => {
      student.rows.sort((a, b) => a.fecha.localeCompare(b.fecha))
      const monthRows = student.rows.filter((row) => row.fecha.slice(0, 7) === targetYm)
      const series = seriesOf(student.rows)
      const { trendPtsPerMonth, projectedNextMonthRatePct } = trendOf(series, target)

      const base = {
        studentId: student.studentId,
        studentName: student.studentName,
        instrument: student.instrument,
        classes: [...student.classNames].sort((a, b) => a.localeCompare(b, 'es')),
        period: tally(student.rows),
        month: tally(monthRows),
        series,
        trendPtsPerMonth,
        projectedNextMonthRatePct,
      }
      const dto = progressEntry(progressByStudent, student.studentId)

      return {
        ...base,
        content: contentOf(student.rows, targetYm),
        progress: progressOf(dto),
        recommendations: recommendationsOf(base, student.rows, dto, generatedAt),
      }
    })
    .sort((a, b) => a.studentName.localeCompare(b.studentName, 'es'))

  const monthRows = allPeriodRows.filter((row) => row.fecha.slice(0, 7) === targetYm)

  const recommendationCounts = Object.fromEntries(RECOMMENDATION_TYPES.map((type) => [type, 0]))
  for (const student of students) {
    for (const rec of student.recommendations) recommendationCounts[rec.type]++
  }

  return {
    month: target,
    summary: {
      studentCount: students.length,
      period: tally(allPeriodRows),
      month: tally(monthRows),
      recommendationCounts,
      studentsWithRecommendations: students.filter((s) => s.recommendations.length > 0).length,
    },
    students,
  }
}

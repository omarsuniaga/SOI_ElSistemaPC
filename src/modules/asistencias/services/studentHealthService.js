/**
 * studentHealthService.js — Salud de los estudiantes (informe mensual por alumno).
 *
 * Funciones puras: reciben el timeline ya cargado por la vista de Control de
 * Asistencia. Puntúan asistencia por alumno; las recomendaciones son insumos
 * para que una persona decida, nunca etiquetan ni diagnostican a un alumno.
 */

import { pct } from './classHealthService.js'

const ATTENDED_STATES = new Set(['presente', 'tarde'])
const KNOWN_STATES = new Set(['presente', 'tarde', 'justificado', 'ausente'])
const MIN_TREND_MONTHS = 3

function round1(value) {
  return Math.round(value * 10) / 10
}

function ymOf(year, monthIndex) {
  return `${year}-${String(Number(monthIndex) + 1).padStart(2, '0')}`
}

function absoluteMonth(year, monthIndex) {
  return Number(year) * 12 + Number(monthIndex)
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

/**
 * @param {Array} timeline Full-period timeline (days with `clases`).
 * @param {{ year: number, monthIndex: number }} options Target month, 0-based.
 */
export function buildStudentHealthData(timeline, { year, monthIndex }) {
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
        student.classNames.add(clase.clase_nombre || 'Clase')

        const row = { fecha: dia.fecha, clase, estado }
        student.rows.push(row)
        allPeriodRows.push(row)
      }
    }
  }

  const students = [...byStudent.values()]
    .map((student) => {
      const monthRows = student.rows.filter((row) => row.fecha.slice(0, 7) === targetYm)
      const series = seriesOf(student.rows)
      const { trendPtsPerMonth, projectedNextMonthRatePct } = trendOf(series, target)

      return {
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
    })
    .sort((a, b) => a.studentName.localeCompare(b.studentName, 'es'))

  const monthRows = allPeriodRows.filter((row) => row.fecha.slice(0, 7) === targetYm)

  return {
    month: target,
    summary: {
      studentCount: students.length,
      period: tally(allPeriodRows),
      month: tally(monthRows),
    },
    students,
  }
}

/**
 * classHealthService.js — Salud de la clase (informe mensual por clase).
 *
 * Funciones puras: reciben el timeline completo del período ya cargado por la
 * vista de Control de Asistencia y no consultan datos. Solo puntúan clases,
 * nunca alumnos.
 */

const ATTENDED_STATES = new Set(['presente', 'tarde'])

function round1(value) {
  return Math.round(value * 10) / 10
}

function pct(numerator, denominator) {
  return denominator > 0 ? round1((numerator / denominator) * 100) : null
}

function monthPrefix(year, monthIndex) {
  return `${year}-${String(Number(monthIndex) + 1).padStart(2, '0')}-`
}

function previousMonth(year, monthIndex) {
  return Number(monthIndex) === 0
    ? { year: Number(year) - 1, monthIndex: 11 }
    : { year: Number(year), monthIndex: Number(monthIndex) - 1 }
}

function classKeyOf(clase) {
  return clase.clase_id || [
    clase.clase_nombre || 'Clase',
    clase.maestro_nombre || 'Sin asignar',
    clase.instrumento || 'General',
  ].join('|')
}

/**
 * Attendance of one class session. Counts from the per-student states when
 * present; falls back to the aggregated counters otherwise.
 */
function countSession(clase) {
  const asistencias = Array.isArray(clase.asistencias) ? clase.asistencias : []

  if (asistencias.length > 0) {
    const counts = { attended: 0, late: 0, justified: 0, absent: 0 }
    for (const asistencia of asistencias) {
      const estado = String(asistencia.estado || '').toLowerCase()
      if (ATTENDED_STATES.has(estado)) counts.attended++
      if (estado === 'tarde') counts.late++
      if (estado === 'justificado') counts.justified++
      if (estado === 'ausente') counts.absent++
    }
    return counts
  }

  return {
    attended: Number(clase.presentes || 0),
    late: 0,
    justified: Number(clase.justificados || 0),
    absent: Number(clase.ausentes || 0),
  }
}

/** Groups the sessions of one month by class, keeping class metadata. */
function collectSessionsByClass(timeline, prefix) {
  const byClass = new Map()
  const dias = Array.isArray(timeline) ? timeline : []

  for (const dia of dias) {
    if (typeof dia?.fecha !== 'string' || !dia.fecha.startsWith(prefix)) continue

    for (const clase of dia.clases || []) {
      const key = classKeyOf(clase)
      if (!byClass.has(key)) {
        byClass.set(key, {
          classId: clase.clase_id || null,
          className: clase.clase_nombre || 'Clase',
          teacher: clase.maestro_nombre || 'Sin asignar',
          department: clase.instrumento || 'General',
          sessions: [],
        })
      }
      byClass.get(key).sessions.push({ fecha: dia.fecha, clase, counts: countSession(clase) })
    }
  }

  return byClass
}

function sumCounts(sessions) {
  const totals = { sessions: sessions.length, attended: 0, late: 0, justified: 0, absent: 0 }
  for (const { counts } of sessions) {
    totals.attended += counts.attended
    totals.late += counts.late
    totals.justified += counts.justified
    totals.absent += counts.absent
  }
  totals.convoked = totals.attended + totals.justified + totals.absent
  totals.attendanceRatePct = pct(totals.attended, totals.convoked)
  return totals
}

/**
 * @param {Array} timeline Full-period timeline (days with `clases`).
 * @param {{ year: number, monthIndex: number }} period Target month, 0-based.
 */
export function buildClassHealthData(timeline, { year, monthIndex }) {
  const currentByClass = collectSessionsByClass(timeline, monthPrefix(year, monthIndex))
  const prev = previousMonth(year, monthIndex)
  const previousByClass = collectSessionsByClass(timeline, monthPrefix(prev.year, prev.monthIndex))

  const comparable = []

  const classes = [...currentByClass.entries()]
    .map(([key, entry]) => {
      const current = sumCounts(entry.sessions)
      const previousEntry = previousByClass.get(key)
      const previousTotals = previousEntry ? sumCounts(previousEntry.sessions) : null
      const hasPrevious = previousTotals !== null && previousTotals.attendanceRatePct !== null

      if (hasPrevious) {
        comparable.push({ current, previous: previousTotals })
      }

      return {
        classId: entry.classId,
        className: entry.className,
        teacher: entry.teacher,
        department: entry.department,
        sessions: current.sessions,
        attended: current.attended,
        late: current.late,
        justified: current.justified,
        absent: current.absent,
        convoked: current.convoked,
        attendanceRatePct: current.attendanceRatePct,
        previous: previousTotals
          ? { sessions: previousTotals.sessions, attendanceRatePct: previousTotals.attendanceRatePct }
          : null,
        attendanceDeltaPts: hasPrevious && current.attendanceRatePct !== null
          ? round1(current.attendanceRatePct - previousTotals.attendanceRatePct)
          : null,
      }
    })
    .sort((a, b) => a.className.localeCompare(b.className, 'es'))

  const total = classes.reduce(
    (acc, c) => {
      acc.sessions += c.sessions
      acc.attended += c.attended
      acc.late += c.late
      acc.justified += c.justified
      acc.absent += c.absent
      acc.convoked += c.convoked
      return acc
    },
    { sessions: 0, attended: 0, late: 0, justified: 0, absent: 0, convoked: 0 },
  )

  const comparableCurrent = comparable.reduce(
    (acc, { current }) => ({
      attended: acc.attended + current.attended,
      convoked: acc.convoked + current.convoked,
    }),
    { attended: 0, convoked: 0 },
  )
  const comparablePrevious = comparable.reduce(
    (acc, { previous }) => ({
      attended: acc.attended + previous.attended,
      convoked: acc.convoked + previous.convoked,
    }),
    { attended: 0, convoked: 0 },
  )
  const previousAttendanceRatePct = pct(comparablePrevious.attended, comparablePrevious.convoked)
  const comparableRatePct = pct(comparableCurrent.attended, comparableCurrent.convoked)

  return {
    month: { year: Number(year), monthIndex: Number(monthIndex) },
    summary: {
      classCount: classes.length,
      sessions: total.sessions,
      attended: total.attended,
      late: total.late,
      justified: total.justified,
      absent: total.absent,
      convoked: total.convoked,
      attendanceRatePct: pct(total.attended, total.convoked),
      previousAttendanceRatePct,
      attendanceDeltaPts: comparableRatePct !== null && previousAttendanceRatePct !== null
        ? round1(comparableRatePct - previousAttendanceRatePct)
        : null,
    },
    classes,
  }
}

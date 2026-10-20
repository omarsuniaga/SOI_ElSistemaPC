import { buildClassHealthData, sessionContent } from './classHealthService.js'

/** Only evidence for the exact class ID; no inferred enrollment or start dates. */
export function buildClassHistory(timeline, classId, { from = '', to = '' } = {}) {
  if (!classId) throw new Error('Se requiere el identificador de la clase')
  const all = (timeline || []).map(day => ({ ...day,
    clases: (day.clases || []).filter(c => c.clase_id === classId),
  })).filter(day => day.clases.length).sort((a, b) => a.fecha.localeCompare(b.fecha))
  const selected = all.filter(day => (!from || day.fecha >= from) && (!to || day.fecha <= to))
  const entries = selected.flatMap(day => day.clases.map(c => ({
    date: day.fecha, id: c.sesion_clase_id, teacher: c.maestro_nombre || 'Sin asignar',
    content: sessionContent(c), attendance: c.asistencias || [],
  })))
  const months = []
  if (selected.length) {
    const first = selected[0].fecha.slice(0, 7)
    const last = selected.at(-1).fecha.slice(0, 7)
    let [year, month] = first.split('-').map(Number)
    while (`${year}-${String(month).padStart(2, '0')}` <= last) {
      const key = `${year}-${String(month).padStart(2, '0')}`
      // Apply range to this month, keeping previous-month evidence for comparisons.
      const bounded = all.filter(d => d.fecha.slice(0, 7) !== key || selected.includes(d))
      const report = buildClassHealthData(bounded, { year, monthIndex: month - 1 }).classes[0]
      months.push({ key, data: report || null })
      if (++month > 12) { month = 1; year++ }
    }
  }
  const students = new Map()
  for (const entry of entries) for (const a of entry.attendance) {
    const id = a.alumno_id || a.alumnoId
    if (id) students.set(id, a.alumno_nombre || a.alumnoNombre || id)
  }
  return { classId, firstRecorded: all[0]?.fecha || null, entries, months,
    students: [...students].map(([id, name]) => ({ id, name })), from, to }
}

/** Attendance is exposure evidence, never a claim of technical mastery. */
export function buildStudentClassHistory(report, student, details = {}) {
  const records = report.entries.map(entry => {
    const detail = details[entry.id]
    const attendance = (detail?.asistencias || entry.attendance).find(a => (a.alumno_id || a.alumnoId) === student.id)
    const state = attendance?.estado || null
    const attended = ['presente', 'tarde', 'tardanza'].includes(state)
    const missed = ['ausente', 'justificado'].includes(state)
    const notes = (detail?.observaciones || []).filter(o => o.alumnoId === student.id)
      .map(o => o.descripcion || o.observacion || o.titulo).filter(Boolean)
    const direct = attendance?.observacion || attendance?.observaciones
    if (direct) notes.unshift(direct)
    return { date: entry.date, sessionId: entry.id, content: entry.content, state,
      participation: attended ? 'Asistió: contenido grupal, dominio no evaluado' : missed
        ? 'No asistió: contenido pendiente de verificar o recuperar' : 'Sin evidencia de participación',
      notes, detailsAvailable: Boolean(detail),
    }
  }).filter(r => r.state || r.notes.length)
  return { ...student, records }
}

/** Rolling three calendar months, clamped at month end; Dominican calendar dates. */
export function defaultClassHistoryRange(now = new Date()) {
  const to = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Santo_Domingo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now)
  const [year, month, day] = to.split('-').map(Number)
  const target = new Date(Date.UTC(year, month - 4, 1))
  const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate()
  target.setUTCDate(Math.min(day, lastDay))
  return { from: target.toISOString().slice(0, 10), to }
}

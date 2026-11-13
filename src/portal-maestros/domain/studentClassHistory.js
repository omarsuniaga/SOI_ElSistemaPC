/** Pure projection of authorized evidence. Never copy a group's raw evaluation into a student profile. */
const STATES = { P: 'P', presente: 'P', A: 'A', ausente: 'A', J: 'J', justificado: 'J', justificada: 'J', T: 'T', tarde: 'T', tardanza: 'T' }
export const attendanceState = value => STATES[value] || null
export const isRecordedSession = row => row.borrador !== true && !['pendiente', 'programada', 'suspendida', 'cancelada', 'sustituida', 'exonerada', 'exonerado', 'suspendida_justificada'].includes(row.estado)
const text = value => typeof value === 'string' ? value.trim() : ''
const ownStudent = (row, id) => String(row.alumno_id) === String(id)
const scale = row => [5, 10].includes(Number(row.indicadores?.escala)) ? Number(row.indicadores.escala) : null
export function historyGradeLabel(value, denominator) {
  if (value == null || value === '' || !Number.isFinite(Number(value))) return ''
  return denominator ? `${value}/${denominator}` : `${value} · escala no registrada`
}

/** Structured brackets are safe general content; raw DSL/natural evaluations are withheld. */
export function generalHistoryContent(row) {
  const raw = text(row.contenido) || text(row.contenido_dsl)
  const topics = [...raw.matchAll(/\[([^\]]+)\]/g)].map(match => match[1].trim()).filter(Boolean)
  if (topics.length) return [...new Set(topics)].join(' · ')
  if (/#|\b\d\s*\/\s*\d|\n/.test(raw)) return text(row.tema_principal)
  // Plain legacy class content is a class-wide description, never contenido_raw from observations.
  return raw || text(row.tema_principal)
}

export function buildStudentHistory(studentId, data = {}) {
  const { sessions = [], attendance = [], progress = [], studentObservations = [], sessionObservations = [], classes = [], teachers = [] } = data
  const classMap = new Map(classes.map(c => [c.id, c]))
  const teacherMap = new Map(teachers.map(t => [t.id, t]))
  const group = (rows, key) => {
    const grouped = new Map()
    for (const row of rows) {
      const value = row[key]
      if (!grouped.has(value)) grouped.set(value, [])
      grouped.get(value).push(row)
    }
    return grouped
  }
  const ownAttendance = attendance.filter(a => ownStudent(a, studentId))
  const attendanceBySession = group(ownAttendance.filter(a => a.sesion_clase_id), 'sesion_clase_id')
  const legacyAttendance = new Map(ownAttendance.filter(a => !a.sesion_clase_id).map(a => [`${a.clase_id}:${a.fecha}`, a]))
  const progressBySession = group(progress.filter(p => ownStudent(p, studentId)), 'sesion_clase_id')
  const studentNotesBySession = group(studentObservations.filter(o => ownStudent(o, studentId)), 'sesion_clase_id')
  const sessionNotesBySession = group(sessionObservations.filter(o => !o.es_borrador), 'sesion_id')
  const entries = []
  const seenSessions = new Set()
  for (const session of sessions) {
    if (seenSessions.has(session.id) || !isRecordedSession(session)) continue
    seenSessions.add(session.id)
    const json = (Array.isArray(session.asistencia) ? session.asistencia : []).find(row => ownStudent(row, studentId))
    const relational = attendanceBySession.get(session.id)?.[0] || legacyAttendance.get(`${session.clase_id}:${session.fecha}`)
    const status = attendanceState(relational?.estado) || attendanceState(json?.estado)
    if (!status) continue
    const participated = status === 'P' || status === 'T'
    const notes = []
    const addNote = note => {
      if (!note.text && note.grade == null && !note.task && !note.topic) return
      const sameAuthor = n => !n.author?.maestro_id || !note.author?.maestro_id || n.author.maestro_id === note.author.maestro_id
      const duplicate = notes.find(n => sameAuthor(n) && n.text === note.text && n.topic === note.topic && n.grade === note.grade && n.task === note.task)
        || (note.text && notes.find(n => sameAuthor(n) && n.text === note.text && (note.grade == null || n.grade === note.grade)))
      if (duplicate) {
        if (note.author) duplicate.author = note.author
        if (note.task && !duplicate.task) duplicate.task = note.task
        if (note.scale && !duplicate.scale) duplicate.scale = note.scale
        duplicate.sources.push(...note.sources)
      } else notes.push(note)
    }
    if (participated) {
      for (const row of (progressBySession.get(session.id) || [])) {
        addNote({ text: text(row.observaciones), topic: text(row.contenido_dsl), grade: row.calificacion ?? null, scale: scale(row), task: text(row.indicadores?.tarea), state: row.estado_cualitativo, author: row.indicadores?._author || (teacherMap.has(row.maestro_id) ? { maestro_id: row.maestro_id, nombre: teacherMap.get(row.maestro_id).nombre_completo } : null), sources: [{ table: 'progresos', id: row.id }] })
      }
      for (const row of (studentNotesBySession.get(session.id) || [])) {
        const teacher = teacherMap.get(row.maestro_id)
        addNote({ text: text(row.descripcion) || text(row.observacion), topic: '', grade: null, scale: null, task: '', author: teacher ? { maestro_id: teacher.id, nombre: teacher.nombre_completo || teacher.nombre } : null, sources: [{ table: 'observaciones_alumnos', id: row.id }] })
      }
      for (const row of (sessionNotesBySession.get(session.id) || [])) {
        const parsed = row.contenido_parsed || {}
        // Student IDs, not fuzzy names or #todos, determine whose private feedback is rendered.
        for (const evaluation of (Array.isArray(parsed.evaluaciones) ? parsed.evaluaciones : []).filter(e => ownStudent(e, studentId))) {
          addNote({ text: text(evaluation.observacion), topic: '', grade: evaluation.nota ?? null, scale: parsed._rating_scale || null, task: text(evaluation.tarea), author: parsed._author || null, sources: [{ table: 'observaciones_sesion', id: row.id }] })
        }
      }
    }
    const clazz = classMap.get(session.clase_id)
    entries.push({ id: session.id, classId: session.clase_id, className: clazz?.nombre || 'Clase', instrument: clazz?.instrumento || '', date: session.fecha, status, participated, content: generalHistoryContent(session), notes, recovery: null, attendanceNote: text(relational?.observaciones) || text(json?.observaciones), rating: participated ? relational?.valoracion ?? null : null, warning: relational && json && attendanceState(relational.estado) !== attendanceState(json.estado) ? 'La asistencia individual difiere del registro de clase; se muestra la individual.' : '', source: { table: 'sesiones_clase', id: session.id } })
  }
  const byId = new Map(entries.map(e => [e.id, e]))
  for (const observation of sessionObservations) {
    const recovery = observation.contenido_parsed?._history_recovery
    if (!recovery || observation.es_borrador || !ownStudent(recovery, studentId)) continue
    const original = byId.get(recovery.original_sesion_id)
    const attended = byId.get(observation.sesion_id)
    if (!original || original.participated || !attended?.participated || attended.classId !== original.classId || attended.date <= original.date) continue
    original.recovery = { sessionId: attended.id, date: attended.date, author: observation.contenido_parsed?._author || null, observationId: observation.id }
  }
  return entries.sort((a, b) => b.date.localeCompare(a.date) || String(b.id).localeCompare(String(a.id)))
}

export function summarizeStudentHistory(entries) {
  const counts = { P: 0, T: 0, A: 0, J: 0 }
  for (const entry of entries) counts[entry.status]++
  return { ...counts, total: entries.length, participated: counts.P + counts.T, percent: entries.length ? Math.round(100 * (counts.P + counts.T) / entries.length) : null }
}

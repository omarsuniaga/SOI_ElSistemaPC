export function buildAcademicIndicatorLabel(candidate) {
  if (!candidate) return 'Indicador académico'
  const parts = [
    candidate.level_name ? `Nivel ${candidate.level_name}` : null,
    candidate.node_name || null,
    candidate.indicator_name || null,
  ].filter(Boolean)
  return parts.join(' · ') || 'Indicador académico'
}

export function classifyIndicatorAttempt(attempt) {
  if (!attempt) return 'pending'

  const nota = Number(attempt.nota)
  const status = String(attempt.status || '').toLowerCase()
  const result = String(attempt.result || '').toLowerCase()

  if (
    nota >= 4 ||
    ['mastered', 'completed', 'approved', 'passed', 'done', 'success'].includes(status) ||
    ['mastered', 'approved', 'passed', 'success'].includes(result)
  ) {
    return 'mastered'
  }

  if (attempt.id) return 'in_progress'
  return 'pending'
}

export function summarizeIndicatorMastery(students = [], attempts = []) {
  const latestByStudent = new Map()

  for (const attempt of attempts) {
    const studentId = attempt?.student_id
    if (!studentId) continue
    const current = latestByStudent.get(studentId)
    const currentTime = current ? new Date(current.updated_at || current.created_at || 0).getTime() : 0
    const nextTime = new Date(attempt.updated_at || attempt.created_at || 0).getTime()
    if (!current || nextTime >= currentTime) {
      latestByStudent.set(studentId, attempt)
    }
  }

  const summary = {
    total: students.length,
    mastered: 0,
    in_progress: 0,
    pending: 0,
  }

  for (const student of students) {
    const state = classifyIndicatorAttempt(latestByStudent.get(student.id))
    summary[state] += 1
  }

  return summary
}

export function mapMasteryStateMeta(state) {
  if (state === 'mastered') {
    return { label: 'Domina', tone: 'ok' }
  }
  if (state === 'in_progress') {
    return { label: 'En progreso', tone: 'warn' }
  }
  return { label: 'Sin evidencia', tone: 'muted' }
}

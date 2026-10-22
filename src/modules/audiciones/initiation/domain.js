export const DEFAULT_RUBRIC = Object.freeze([
  { key: 'ritmo', label: 'Pulso y ritmo', required: true },
  { key: 'escucha', label: 'Escucha y entonación', required: true },
  { key: 'teoria', label: 'Lectura y teoría', required: true },
  { key: 'coordinacion', label: 'Coordinación musical', required: true },
  { key: 'grupo', label: 'Trabajo en grupo', required: true },
  { key: 'destino', label: 'Preparación para la clase de destino', required: true },
])
export const STATUS_LABELS = { pendiente: 'Pendiente de decisión', invitado: 'Invitado', fijo: 'Fijo', continua_iniciacion: 'Continúa Iniciación' }
export function evaluateScores(rubric, scores) {
  if (!scores || Array.isArray(scores) || typeof scores !== 'object') throw new Error('Notas inválidas')
  const keys = rubric.map(c => c.key)
  if (Object.keys(scores).some(k => !keys.includes(k))) throw new Error('Criterio desconocido')
  const observed = []
  let complete = true
  for (const criterion of rubric) {
    const value = scores[criterion.key]
    if (value == null) { if (criterion.required) complete = false }
    else if (!Number.isInteger(value) || value < 1 || value > 4) throw new Error('Las notas deben ser enteros de 1 a 4')
    else observed.push(value)
  }
  return { complete: complete && observed.length > 0, observed: observed.length, total: rubric.length, average: observed.length ? observed.reduce((a, b) => a + b, 0) / observed.length : null }
}
export function calendarMonthsAfter(date, months) {
  const [y, m, d] = date.split('-').map(Number)
  const end = new Date(Date.UTC(y, m - 1 + months + 1, 0))
  return new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), Math.min(d, end.getUTCDate()))).toISOString().slice(0, 10)
}
export function needsException(student, campaign) {
  const date = student.fecha_ingreso_iniciacion
  return !date || date < campaign.cohorte_desde || date > campaign.cohorte_hasta || calendarMonthsAfter(date, 3) > campaign.fecha_audicion
}
export function validateDecision(candidate, campaign, evaluations, action, data, today) {
  if (!['pendiente', 'invitado'].includes(candidate.estado)) throw new Error('Esta candidatura ya está finalizada')
  if (!data.observacion?.trim()) throw new Error('La decisión requiere observación')
  const complete = evaluations.filter(v => v.ronda === candidate.ronda && evaluateScores(campaign.rubrica, v.notas).complete)
  if (complete.length < (candidate.ronda === 0 ? campaign.min_jurados : 1)) throw new Error('Faltan valoraciones completas para decidir')
  if (action === 'invitar') {
    if (candidate.estado !== 'pendiente') throw new Error('El alumno ya tiene invitación')
    if (!data.clase_destino_id || !data.objetivos?.trim()) throw new Error('Defina clase de destino y objetivos')
    if (!data.revision_fecha || data.revision_fecha <= today) throw new Error('La revisión debe ser futura')
  } else if (['confirmar', 'prorrogar'].includes(action)) {
    if (candidate.estado !== 'invitado') throw new Error('Se requiere una invitación vigente')
    if (action === 'prorrogar' && (!data.revision_fecha || data.revision_fecha <= today || data.revision_fecha <= candidate.revision_fecha)) throw new Error('La prórroga requiere una revisión futura posterior')
  } else if (action !== 'continuar') throw new Error('Decisión desconocida')
}
export function escapeText(value) {
  return String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
}
export function renderEnrollmentBadge(enrollment) {
  if (enrollment?.condicion !== 'invitado') return ''
  const date = enrollment.invitacion_revision
  return `<span class="badge bg-warning text-dark" data-enrollment="invitado">Invitado${date ? ` · revisión ${escapeText(date)}` : ''}</span>`
}

import { supabase } from '../../../lib/supabaseClient.js'

const T_CASES   = 'student_cases'
const T_EVENTS  = 'student_case_events'
const T_ALERTS  = 'student_case_alerts'

/** Helper: log a timeline event for a case */
async function _logEvent(caseId, tipo, titulo, { descripcion = '', metadata = {}, actorId = null } = {}) {
  await supabase.from(T_EVENTS).insert({
    case_id: caseId, tipo, titulo, descripcion, metadata, actor_id: actorId,
  })
}

export async function listStudentCases(filters = {}) {
  let q = supabase.from(T_CASES).select('*').order('created_at', { ascending: false })
  if (filters.estado)        q = q.eq('estado', filters.estado)
  if (filters.nivelRiesgo)   q = q.eq('nivel_riesgo', filters.nivelRiesgo)
  if (filters.tipo)          q = q.eq('tipo', filters.tipo)
  if (filters.alumnoId)      q = q.eq('alumno_id', filters.alumnoId)
  if (filters.responsableId) q = q.eq('responsable_id', filters.responsableId)
  if (filters.limit)         q = q.limit(filters.limit)
  const { data, error } = await q
  if (error) throw error
  return data || []
}

export async function getStudentCaseById(id) {
  const { data, error } = await supabase.from(T_CASES).select('*').eq('id', id).single()
  if (error) throw error
  return data
}

export async function getCasesByStudent(alumnoId) {
  return listStudentCases({ alumnoId })
}

export async function createStudentCase(payload) {
  const insertPayload = {
    ...payload,
    estado:         payload.estado || 'abierto',
    origen:         payload.origen || 'manual',
    nivel_riesgo:   payload.nivel_riesgo || 'bajo',
    fecha_apertura: payload.fecha_apertura || new Date().toISOString().slice(0, 10),
    updated_at:     new Date().toISOString(),
  }
  const { data, error } = await supabase.from(T_CASES).insert(insertPayload).select().single()
  if (error) throw error
  await _logEvent(data.id, 'caso_abierto', `Caso abierto: ${data.titulo}`, {
    descripcion: `Origen: ${data.origen} · Nivel inicial: ${data.nivel_riesgo}`,
  })
  return data
}

export async function createCaseFromAlert(alertId, payload = {}) {
  const { data: alert } = await supabase.from(T_ALERTS).select('*').eq('id', alertId).single()
  if (!alert) throw new Error('Alert not found')

  const caseRow = await createStudentCase({
    alumno_id:      alert.alumno_id,
    alumno_nombre:  alert.alumno_nombre,
    tipo:           alert.tipo === 'riesgo_combinado' ? 'seguimiento_pedagogico' : alert.tipo,
    titulo:         payload.titulo      || alert.titulo,
    descripcion:    payload.descripcion || alert.descripcion,
    nivel_riesgo:   alert.nivel_riesgo,
    origen:         'automatico',
    resumen_actual: alert.descripcion,
    ...payload,
  })

  const { error: alertErr } = await supabase.from(T_ALERTS).update({
    case_id: caseRow.id, estado: 'convertida_en_caso', revisada_en: new Date().toISOString(),
  }).eq('id', alertId)
  if (alertErr) {
    console.error('[createCaseFromAlert] alert update failed — alert may be re-used:', alertErr)
  }

  await _logEvent(caseRow.id, 'alerta_detectada', `Caso creado desde alerta`, {
    metadata: { alert_id: alertId, evidencia: alert.evidencia },
  })

  return caseRow
}

export async function updateStudentCase(id, payload) {
  const { data, error } = await supabase
    .from(T_CASES)
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select().single()
  if (error) throw error
  return data
}

export async function changeCaseStatus(id, estado, notes = '') {
  const updated = await updateStudentCase(id, { estado })
  await _logEvent(id, 'estado_actualizado', `Estado cambiado a: ${estado}`, { descripcion: notes })
  return updated
}

export async function changeRiskLevel(id, nivelRiesgo, notes = '') {
  const updated = await updateStudentCase(id, { nivel_riesgo: nivelRiesgo })
  await _logEvent(id, 'nivel_riesgo_actualizado', `Nivel de riesgo cambiado a: ${nivelRiesgo}`, { descripcion: notes })
  return updated
}

export async function closeStudentCase(id, resolutionNotes = '') {
  const updated = await updateStudentCase(id, {
    estado:         'resuelto',
    fecha_cierre:   new Date().toISOString().slice(0, 10),
    resumen_actual: resolutionNotes,
  })
  await _logEvent(id, 'caso_resuelto', 'Caso resuelto', { descripcion: resolutionNotes })
  return updated
}

export async function archiveStudentCase(id, notes = '') {
  const updated = await updateStudentCase(id, { estado: 'archivado' })
  await _logEvent(id, 'caso_archivado', 'Caso archivado', { descripcion: notes })
  return updated
}

export async function escalateStudentCase(id, notes = '') {
  const updated = await updateStudentCase(id, { estado: 'escalado' })
  await _logEvent(id, 'caso_escalado', 'Caso escalado a directiva', { descripcion: notes })
  return updated
}

export async function listCaseEvents(caseId) {
  const { data, error } = await supabase
    .from(T_EVENTS)
    .select('*')
    .eq('case_id', caseId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

// ── Alert helpers ───────────────────────────────────────────────────────────

export async function listAlerts(filters = {}) {
  let q = supabase.from(T_ALERTS).select('*').order('detectada_en', { ascending: false })
  if (filters.estado)      q = q.eq('estado', filters.estado)
  if (filters.nivelRiesgo) q = q.eq('nivel_riesgo', filters.nivelRiesgo)
  if (filters.limit)       q = q.limit(filters.limit)
  const { data, error } = await q
  if (error) throw error
  return data || []
}

export async function markAlertReviewed(id, by = null) {
  await supabase.from(T_ALERTS).update({
    estado: 'revisada', revisada_por: by, revisada_en: new Date().toISOString(),
  }).eq('id', id)
}

export async function discardAlert(id) {
  await supabase.from(T_ALERTS).update({ estado: 'descartada', revisada_en: new Date().toISOString() }).eq('id', id)
}

export async function archiveAlert(id) {
  await supabase.from(T_ALERTS).update({ estado: 'archivada' }).eq('id', id)
}

// ── KPI helpers (used by Dashboard) ─────────────────────────────────────────

export async function getCaseKPIs() {
  const [abiertos, enSeguim, criticos, alertasPend] = await Promise.all([
    supabase.from(T_CASES).select('id', { count: 'exact', head: true }).eq('estado', 'abierto'),
    supabase.from(T_CASES).select('id', { count: 'exact', head: true }).eq('estado', 'en_seguimiento'),
    supabase.from(T_CASES).select('id', { count: 'exact', head: true }).eq('nivel_riesgo', 'critico').in('estado', ['abierto', 'en_seguimiento']),
    supabase.from(T_ALERTS).select('id', { count: 'exact', head: true }).eq('estado', 'pendiente'),
  ])

  const today = new Date().toISOString().slice(0, 10)
  const vencidas = await supabase
    .from(T_CASES)
    .select('id', { count: 'exact', head: true })
    .in('estado', ['abierto', 'en_seguimiento'])
    .lt('proxima_accion_fecha', today)

  const [mFrom, mTo] = (() => {
    const n = new Date()
    return [new Date(n.getFullYear(), n.getMonth(), 1).toISOString(),
            new Date(n.getFullYear(), n.getMonth() + 1, 0, 23, 59, 59, 999).toISOString()]
  })()
  const cartas = await supabase
    .from('student_case_actions')
    .select('id', { count: 'exact', head: true })
    .eq('tipo', 'carta_generada')
    .gte('created_at', mFrom)
    .lte('created_at', mTo)

  return {
    casosAbiertos:            abiertos.count    || 0,
    casosEnSeguimiento:       enSeguim.count    || 0,
    casosCriticos:            criticos.count    || 0,
    alertasPendientes:        alertasPend.count || 0,
    proximasAccionesVencidas: vencidas.count    || 0,
    cartasEsteMes:            cartas.count      || 0,
  }
}

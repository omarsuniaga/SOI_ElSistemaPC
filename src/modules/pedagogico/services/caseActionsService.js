import { supabase } from '../../../lib/supabaseClient.js'

const T_ACTIONS = 'student_case_actions'
const T_EVENTS  = 'student_case_events'
const T_CASES   = 'student_cases'

async function _logEvent(caseId, tipo, titulo, { descripcion = '', metadata = {} } = {}) {
  await supabase.from(T_EVENTS).insert({
    case_id: caseId, tipo, titulo, descripcion, metadata,
  })
}

async function _updateCaseLastContact(caseId, { proximaAccion, proximaAccionFecha } = {}) {
  const update = {
    ultimo_contacto_en: new Date().toISOString(),
    updated_at:         new Date().toISOString(),
  }
  if (proximaAccion !== undefined)      update.proxima_accion       = proximaAccion
  if (proximaAccionFecha !== undefined) update.proxima_accion_fecha = proximaAccionFecha
  await supabase.from(T_CASES).update(update).eq('id', caseId)
}

export async function listCaseActions(caseId, { tipo } = {}) {
  let q = supabase.from(T_ACTIONS).select('*').eq('case_id', caseId).order('fecha_accion', { ascending: false })
  if (tipo) q = q.eq('tipo', tipo)
  const { data, error } = await q
  if (error) throw error
  return data || []
}

/** Generic action insert. payload must include tipo and titulo at minimum. */
export async function addCaseAction(caseId, payload) {
  const insertPayload = {
    case_id:      caseId,
    alumno_id:    payload.alumno_id || null,
    fecha_accion: payload.fecha_accion || new Date().toISOString(),
    ...payload,
  }
  const { data, error } = await supabase.from(T_ACTIONS).insert(insertPayload).select().single()
  if (error) throw error

  await _logEvent(caseId, 'accion_registrada', data.titulo, {
    descripcion: data.descripcion || '',
    metadata:    { action_id: data.id, tipo: data.tipo },
  })
  await _updateCaseLastContact(caseId, {
    proximaAccion:      data.proxima_accion,
    proximaAccionFecha: data.proxima_accion_fecha,
  })
  return data
}

export async function addCallAction(caseId, payload) {
  return addCaseAction(caseId, {
    ...payload,
    tipo:   'llamada_representante',
    titulo: payload.titulo || `Llamada a ${payload.persona_contactada || 'representante'}`,
  })
}

export async function addMeetingAction(caseId, payload) {
  return addCaseAction(caseId, {
    ...payload,
    tipo:   'reunion_representante',
    titulo: payload.titulo || `Reunión con representante`,
  })
}

export async function addAgreementAction(caseId, payload) {
  return addCaseAction(caseId, {
    ...payload,
    tipo:   'acuerdo_compromiso',
    titulo: payload.titulo || 'Acuerdo registrado',
  })
}

export async function addDocumentAction(caseId, documentId, payload = {}) {
  return addCaseAction(caseId, {
    ...payload,
    tipo:         'carta_generada',
    titulo:       payload.titulo || 'Documento generado',
    documento_id: documentId,
  })
}

export async function addInstrumentReturnAction(caseId, payload) {
  return addCaseAction(caseId, {
    ...payload,
    tipo:   'devolucion_instrumento',
    titulo: payload.titulo || `Solicitud de devolución de instrumento`,
  })
}

export async function addInternalNote(caseId, payload) {
  return addCaseAction(caseId, {
    ...payload,
    tipo:   'nota_interna',
    titulo: payload.titulo || 'Nota interna',
  })
}

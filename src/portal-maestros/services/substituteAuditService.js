import { supabase } from '../../lib/supabaseClient.js'
import { auditLog } from './auditService.js'

export const SUBSTITUTE_ACTIVITY_ENTITY = 'substitute_class_activity'

function normalizeText(value, fallback = '') {
  if (value === null || value === undefined) return fallback
  const text = String(value).trim()
  return text.length > 0 ? text : fallback
}

async function getCurrentActorId(explicitUserId = null) {
  if (explicitUserId) return explicitUserId

  try {
    const { data } = await supabase.auth.getUser()
    return data?.user?.id || null
  } catch {
    return null
  }
}

function resolveClassId(clase, explicitClassId = null) {
  return explicitClassId || clase?.id || null
}

function resolveTitularId(clase, explicitTitularId = null) {
  return explicitTitularId || clase?.maestro_principal_id || clase?.maestro_id || null
}

function resolveSuplenteId(clase, explicitSuplenteId = null) {
  return explicitSuplenteId || clase?.maestro_suplente_id || null
}

export function isSubstituteAssignment(clase, maestroId) {
  if (!clase || !maestroId) return false
  const suplenteId = clase.maestro_suplente_id || clase.maestro_auxiliar_id || null
  return String(suplenteId) === String(maestroId)
}

export async function logSubstituteActivity({
  action,
  clase = null,
  classId = null,
  maestroTitularId = null,
  maestroSuplenteId = null,
  fecha = null,
  sesionId = null,
  userId = null,
  result = 'ok',
  summary = '',
  changes = {},
  metadata = {},
  force = false,
} = {}) {
  if (!action) return null

  const resolvedClassId = resolveClassId(clase, classId)
  if (!resolvedClassId) return null

  const resolvedSuplenteId = resolveSuplenteId(clase, maestroSuplenteId)
  const resolvedTitularId = resolveTitularId(clase, maestroTitularId)

  if (!force && !resolvedSuplenteId) return null

  const actorId = await getCurrentActorId(userId)
  const payloadSummary = normalizeText(summary, 'Actividad de suplencia registrada')

  return auditLog(action, SUBSTITUTE_ACTIVITY_ENTITY, resolvedClassId, {
    user_id: actorId,
    changes: {
      class_id: resolvedClassId,
      sesion_id: sesionId || null,
      fecha: fecha || null,
      maestro_titular_id: resolvedTitularId,
      maestro_suplente_id: resolvedSuplenteId,
      result,
      summary: payloadSummary,
      ...changes,
    },
    ...metadata,
  })
}

export async function listSubstituteActivityLogs({
  classId = null,
  action = null,
  limit = 50,
} = {}) {
  let query = supabase
    .from('audit_logs')
    .select('id, action, entity, entity_id, user_id, changes, metadata, timestamp')
    .eq('entity', SUBSTITUTE_ACTIVITY_ENTITY)
    .order('timestamp', { ascending: false })
    .limit(limit)

  if (classId) query = query.eq('entity_id', classId)
  if (action) query = query.eq('action', action)

  const { data, error } = await query
  if (error) throw error
  return data || []
}

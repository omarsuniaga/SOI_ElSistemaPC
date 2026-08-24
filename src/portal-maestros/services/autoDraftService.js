/**
 * autoDraftService - Debounced auto-draft saving for session observations
 */

import { supabase } from '../../lib/supabaseClient.js'
import { enqueue } from './offlineQueue.js'
import { logSubstituteActivity, isSubstituteAssignment } from './substituteAuditService.js'

/**
 * Factory that creates an auto-draft controller with debounced saving.
 * @param {Object} options
 * @param {Function} options.saveFn - async function called with content after debounce
 * @param {number} [options.debounceMs=30000] - debounce delay in milliseconds
 * @returns {{ onInput: Function, destroy: Function, onSaved: Function }}
 */
export function createAutoDraft({ saveFn, debounceMs = 30000 }) {
  let timer = null
  const savedCallbacks = []

  function onInput(content) {
    if (timer !== null) {
      clearTimeout(timer)
      timer = null
    }
    if (!content || !content.trim()) return

    timer = setTimeout(async () => {
      timer = null
      await saveFn(content)
      savedCallbacks.forEach((cb) => cb(content))
    }, debounceMs)
  }

  function destroy() {
    if (timer !== null) {
      clearTimeout(timer)
      timer = null
    }
  }

  function onSaved(callback) {
    savedCallbacks.push(callback)
  }

  return { onInput, destroy, onSaved }
}

/**
 * Save or update a draft observation for a session.
 * @param {string} sesionId
 * @param {string} maestroId
 * @param {string} contenidoRaw
 * @returns {Promise<Object>} saved row
 */
export async function saveDraft(sesionId, maestroId, contenidoRaw) {
  const { data: existing, error: selectError } = await supabase
    .from('observaciones_sesion')
    .select('id')
    .eq('sesion_id', sesionId)
    .eq('maestro_id', maestroId)
    .eq('es_borrador', true)
    .limit(1)
    .maybeSingle()

  if (selectError) throw selectError

  if (existing) {
    const { data, error } = await supabase
      .from('observaciones_sesion')
      .update({ contenido_raw: contenidoRaw })
      .eq('id', existing.id)
      .select()
      .single()
    if (error) throw error
    return data
  } else {
    const { data, error } = await supabase
      .from('observaciones_sesion')
      .insert({
        sesion_id: sesionId,
        maestro_id: maestroId,
        contenido_raw: contenidoRaw,
        es_borrador: true,
      })
      .select()
      .single()
    if (error) throw error
    return data
  }
}

/**
 * Load the active draft for a session.
 * @param {string} sesionId
 * @param {string} maestroId
 * @returns {Promise<{id: string, contenido_raw: string, updated_at: string}|null>}
 */
export async function loadDraft(sesionId, maestroId) {
  const { data, error } = await supabase
    .from('observaciones_sesion')
    .select('id, contenido_raw, updated_at')
    .eq('sesion_id', sesionId)
    .eq('maestro_id', maestroId)
    .eq('es_borrador', true)
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return data ?? null
}

/**
 * Discard (delete) a draft by id.
 * @param {string} draftId
 * @returns {Promise<void>}
 */
export async function discardDraft(draftId) {
  const { error } = await supabase.from('observaciones_sesion').delete().eq('id', draftId)

  if (error) throw error
}

/**
 * Finalize an observation (delete draft, insert permanent record).
 * @param {string} sesionId
 * @param {string} maestroId - Dueño de la fila (titular preferido — puede no
 *   ser quien la escribió realmente; ver auditContext.actorMaestroId).
 * @param {string} contenidoRaw - Texto original del maestro (lenguaje natural o DSL)
 * @param {Object} contenidoParsed - Datos cuantificados extraídos del texto
 * @param {string|null} contenidoIaDsl - DSL generado por IA (null si el maestro escribió en DSL directo)
 * @param {string|null} contenidoIaMejorado
 * @param {Object} auditContext - `actorMaestroId` es quien realmente escribió
 *   (puede ser el suplente); si no llega, se asume igual a `maestroId`.
 * @returns {Promise<Object>} saved row
 */
export async function saveObservation(
  sesionId,
  maestroId,
  contenidoRaw,
  contenidoParsed,
  contenidoIaDsl = null,
  contenidoIaMejorado = null,
  auditContext = {},
) {
  const actorMaestroId = auditContext.actorMaestroId || maestroId
  try {
    // Delete any active draft first
    const { error: deleteError } = await supabase
      .from('observaciones_sesion')
      .delete()
      .eq('sesion_id', sesionId)
      .eq('maestro_id', maestroId)
      .eq('es_borrador', true)

    if (deleteError) throw deleteError

    const { data, error } = await supabase
      .from('observaciones_sesion')
      .insert({
        sesion_id: sesionId,
        maestro_id: maestroId,
        contenido_raw: contenidoRaw,
        contenido_parsed: contenidoParsed,
        contenido_ia_dsl: contenidoIaDsl,
        contenido_ia_mejorado: contenidoIaMejorado,
        es_borrador: false,
      })
      .select()
      .single()

    if (error) throw error

    if (auditContext?.clase && isSubstituteAssignment(auditContext.clase, actorMaestroId)) {
      await logSubstituteActivity({
        action: 'SUBSTITUTE_CONTENT',
        clase: auditContext.clase,
        maestroTitularId: auditContext.clase?.maestro_principal_id,
        maestroSuplenteId: actorMaestroId,
        fecha: auditContext.fechaHoy || auditContext.fecha || null,
        sesionId,
        userId: auditContext.userId || auditContext.maestroUserId || null,
        summary: `Se registró contenido de clase como suplente en "${auditContext.clase?.nombre || 'Clase'}"`,
        changes: {
          indicador_id: contenidoParsed?.indicador_id || null,
          dsl_length: typeof contenidoRaw === 'string' ? contenidoRaw.length : null,
          es_borrador: false,
        },
      })
    }
    return data
  } catch (err) {
    // Fallback: encolar para sync offline
    if (!navigator.onLine || err.message?.includes('Failed to fetch')) {
      console.warn('[autoDraftService] Offline, encolando saveObservation...')
      await enqueue({
        tabla: 'observaciones_sesion',
        operacion: 'upsert',
        payload: {
          sesion_id: sesionId,
          maestro_id: maestroId,
          contenido_raw: contenidoRaw,
          contenido_parsed: contenidoParsed,
          contenido_ia_dsl: contenidoIaDsl,
          contenido_ia_mejorado: contenidoIaMejorado,
          es_borrador: false,
        },
      })
      return { _offline: true, sesion_id: sesionId }
    }
    throw err
  }
}

/**
 * knowledgeExtractionService
 *
 * Frontend service that triggers the extract-knowledge edge function
 * after a teacher saves an observation (es_borrador=false).
 *
 * Usage:
 *   import { triggerExtraction } from './knowledgeExtractionService.js'
 *
 *   // After saveObservation succeeds:
 *   triggerExtraction(observacion.id).then(result => {
 *     if (result?.assertions?.length) {
 *       showNotification(`${result.assertions.length} aserciones extraídas`)
 *     }
 *   }).catch(err => {
 *     console.warn('[extract] Extraction failed (non-blocking):', err)
 *   })
 */

import { supabase } from '../../../lib/supabaseClient.js'

/**
 * Trigger the knowledge extraction pipeline for a saved observation.
 *
 * @param {string} observacionId — observaciones_sesion.id
 * @param {object} [options]
 * @param {string[]} [options.nodeIds] — optional: pre-resolved curricular node IDs
 * @returns {Promise<{ status: string, summary: object, assertions: Array } | null>}
 */
export async function triggerExtraction(observacionId, options = {}) {
  if (!observacionId) {
    console.warn('[triggerExtraction] No observacionId provided')
    return null
  }

  try {
    const body = { observacion_id: observacionId }
    if (options.nodeIds?.length) {
      body.node_ids = options.nodeIds
    }

    const { data, error } = await supabase.functions.invoke('extract-knowledge', {
      body,
    })

    if (error) {
      console.error('[triggerExtraction] Invocation error:', error.message)
      return null
    }

    if (data?.error) {
      console.error('[triggerExtraction] Function error:', data.error)
      return null
    }

    return data
  } catch (err) {
    // Never throw — extraction failure should not break the save flow
    console.warn('[triggerExtraction] Network or unexpected error:', err)
    return null
  }
}

/**
 * Fire-and-forget: triggers extraction without awaiting the result.
 * Use this when you don't need to show propuestas immediately.
 *
 * @param {string} observacionId
 * @param {object} [options]
 */
export function triggerExtractionAsync(observacionId, options = {}) {
  triggerExtraction(observacionId, options).catch(() => {
    // Swallow — already logged in triggerExtraction
  })
}

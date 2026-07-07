import { supabase } from '../../lib/supabaseClient.js'

/**
 * Log data mutations (CREATE, UPDATE, DELETE)
 * @param {string} action - CREATE, UPDATE, DELETE
 * @param {string} entity - Table name
 * @param {string} entityId - Record ID
 * @param {Object} context - { user_id, changes, metadata }
 */
export async function auditLog(action, entity, entityId, context = {}) {
  const { user_id, changes = {}, ...metadata } = context

  try {
    const { error } = await supabase
      .from('audit_logs')
      .insert({
        action,
        entity,
        entity_id: entityId,
        user_id: user_id || null,
        changes,
        metadata,
        timestamp: new Date().toISOString(),
      })

    if (error) {
      console.warn('[Audit] Error logging mutation:', error.message)
      // Fallback: log to console if table doesn't exist
    }
  } catch (err) {
    console.error('[Audit] Critical error:', err)
  }
}

export default { auditLog }

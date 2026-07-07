/**
 * Audit logging service
 * Logs all data mutations (CREATE, UPDATE, DELETE) to the database
 */

let auditEnabled = false
let database = null

/**
 * Initialize audit service
 * @param {Object} options
 * @param {boolean} options.enabled - Enable audit logging
 * @param {Object} options.db - Database reference
 */
export function initAuditService(options = {}) {
  const { enabled = true, db = null } = options
  auditEnabled = enabled
  database = db
  console.log('[AuditService] Initialized, enabled:', enabled)
}

/**
 * Log a data mutation
 * @param {string} action - CREATE, UPDATE, or DELETE
 * @param {string} entity - Table name
 * @param {string} entityId - Record ID
 * @param {Object} details - Additional details
 */
export async function auditLog(action, entity, entityId, details = {}) {
  if (!auditEnabled) {
    console.log('[Audit] Disabled, skipping:', action, entity, entityId)
    return null
  }

  const { user_id, changes = {} } = details
  const timestamp = new Date().toISOString()

  const logEntry = {
    action,
    entity,
    entity_id: entityId,
    user_id: user_id || null,
    changes: JSON.stringify(changes),
    timestamp,
    ip_address: getClientIP(),
    user_agent: navigator?.userAgent || 'unknown',
  }

  console.log('[Audit]', action, entity, entityId, 'by', user_id)

  if (database?.insert) {
    try {
      const result = await database.insert('audit_logs', logEntry)
      return result
    } catch (error) {
      console.error('[AuditService] Failed to insert log:', error)
    }
  }

  return logEntry
}

/**
 * Get audit logs for a user or entity
 * @param {Object} filters - Query filters
 * @param {string} [filters.user_id] - Filter by user
 * @param {string} [filters.entity] - Filter by entity
 * @param {string} [filters.action] - Filter by action
 * @param {number} [filters.limit] - Max results
 */
export async function getAuditLogs(filters = {}) {
  if (!database?.query) {
    console.warn('[AuditService] No database configured')
    return []
  }

  const { user_id, entity, action, limit = 50 } = filters

  const query = {
    table: 'audit_logs',
    limit,
    order_by: 'timestamp',
    order: 'desc',
  }

  if (user_id) query.user_id = user_id
  if (entity) query.entity = entity
  if (action) query.action = action

  try {
    const results = await database.query(query)
    return results
  } catch (error) {
    console.error('[AuditService] Failed to fetch logs:', error)
    return []
  }
}

/**
 * Get client IP address (approximation)
 */
function getClientIP() {
  return 'client-ip-unavailable'
}

export default {
  initAuditService,
  auditLog,
  getAuditLogs,
}
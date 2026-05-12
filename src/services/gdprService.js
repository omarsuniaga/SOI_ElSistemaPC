/**
 * GDPR Service
 * Right to be forgotten - cascade delete user data
 */

const deleteStatus = new Map()

const TABLES_TO_DELETE = [
  'observations',
  'lesson_plans',
  'evaluations',
  'notifications',
]

/**
 * Delete all user data (Right to be forgotten)
 * @param {string} userId - User ID to delete
 * @param {Object} database - Database adapter
 */
export async function deleteUserData(userId, database) {
  console.log(`[GDPR] Starting deletion for user: ${userId}`)

  const results = {
    success: true,
    deleted: [],
    failed: [],
  }

  for (const table of TABLES_TO_DELETE) {
    try {
      await database.delete(table, { maestro_id: userId })
      results.deleted.push(table)
      console.log(`[GDPR] Deleted from ${table}`)
    } catch (error) {
      results.failed.push({ table, error: error.message })
      console.error(`[GDPR] Failed to delete from ${table}:`, error)
    }
  }

  results.success = results.failed.length === 0

  deleteStatus.set(userId, {
    pending: false,
    completed: new Date().toISOString(),
    tablesDeleted: results.deleted,
  })

  return results
}

/**
 * Export all user data (Data portability)
 * @param {string} userId - User ID
 * @param {Object} database - Database adapter
 */
export async function exportUserData(userId, database) {
  console.log(`[GDPR] Exporting data for user: ${userId}`)

  const exportData = {
    exportedAt: new Date().toISOString(),
    userId,
    observations: [],
    lessonPlans: [],
    evaluations: [],
    profile: null,
  }

  try {
    exportData.observations = await database.query('observations', {
      maestro_id: userId,
      limit: 1000,
    })
  } catch (e) {
    console.warn('[GDPR] Could not export observations:', e)
  }

  try {
    exportData.lessonPlans = await database.query('lesson_plans', {
      maestro_id: userId,
      limit: 500,
    })
  } catch (e) {
    console.warn('[GDPR] Could not export lesson plans:', e)
  }

  try {
    exportData.evaluations = await database.query('evaluations', {
      maestro_id: userId,
      limit: 500,
    })
  } catch (e) {
    console.warn('[GDPR] Could not export evaluations:', e)
  }

  return exportData
}

/**
 * Get delete request status
 * @param {string} userId - User ID
 */
export function getDeleteStatus(userId) {
  return deleteStatus.get(userId) || { pending: false, completed: null }
}

/**
 * Request data deletion (marks as pending)
 * @param {string} userId - User ID
 */
export function requestDelete(userId) {
  deleteStatus.set(userId, {
    pending: true,
    requestedAt: new Date().toISOString(),
    completed: null,
  })
  console.log(`[GDPR] Deletion requested for user: ${userId}`)
}

/**
 * Anonymize user data (alternative to full deletion)
 * @param {string} userId - User ID
 * @param {Object} database - Database adapter
 */
export async function anonymizeUserData(userId, database) {
  console.log(`[GDPR] Anonymizing data for user: ${userId}`)

  const anonymized = {
    nombre: 'Usuario Eliminado',
    email: `deleted-${userId.substring(0, 8)}@elsistema.pc`,
  }

  try {
    await database.update('maestros', { id: userId }, anonymized)
    return { success: true }
  } catch (error) {
    console.error('[GDPR] Anonymization failed:', error)
    return { success: false, error: error.message }
  }
}

export default {
  deleteUserData,
  exportUserData,
  getDeleteStatus,
  requestDelete,
  anonymizeUserData,
}
/**
 * Permission Check Middleware
 * RBAC (Role-Based Access Control) for Portal Maestros
 */

export const ROLES = {
  TEACHER: 'teacher',
  ADMIN: 'admin',
  OBSERVER: 'observer',
}

const ROLE_HIERARCHY = {
  [ROLES.ADMIN]: [ROLES.ADMIN, ROLES.TEACHER, ROLES.OBSERVER],
  [ROLES.TEACHER]: [ROLES.TEACHER],
  [ROLES.OBSERVER]: [ROLES.OBSERVER],
}

let permissionConfig = {
  defaultRole: ROLES.TEACHER,
}

/**
 * Initialize permissions configuration
 * @param {Object} config
 */
export function initPermissions(config = {}) {
  permissionConfig = { ...permissionConfig, ...config }
  console.log('[Permission] Initialized')
}

/**
 * Check if user has a specific role
 * @param {Object} user - User object
 * @param {string} role - Role to check
 */
export function hasRole(user, role) {
  if (!user || !user.role) return false
  const allowedRoles = ROLE_HIERARCHY[user.role] || []
  return allowedRoles.includes(role)
}

/**
 * Check permission for resource
 * @param {Object} user - User object
 * @param {Object} resource - Resource object with maestro_id
 * @param {string} action - Action (read, write, delete)
 */
export function checkPermission(user, resource, action = 'read') {
  if (!user) return false
  
  const isAdmin = hasRole(user, ROLES.ADMIN)
  const isTeacher = hasRole(user, ROLES.TEACHER)
  const isObserver = hasRole(user, ROLES.OBSERVER)

  if (isAdmin) {
    return true
  }

  if (isObserver && action === 'read') {
    return true
  }

  if (isObserver && action !== 'read') {
    return false
  }

  if (isTeacher && resource?.maestro_id) {
    return resource.maestro_id === user.id || resource.maestro_id === user.maestro_id
  }

  return false
}

/**
 * Middleware function for request validation
 * @param {Object} user - Current user
 * @param {string} resourceType - Type of resource
 * @param {Object} resource - Resource data
 * @param {string} action - Action being performed
 */
export function permissionMiddleware(user, resourceType, resource, action) {
  const allowed = checkPermission(user, resource, action)
  
  if (!allowed) {
    console.warn(`[Permission] Denied: ${user?.role} attempted ${action} on ${resourceType}`)
  }
  
  return allowed
}

/**
 * Get user's accessible scopes
 * @param {Object} user - User object
 */
export function getUserScopes(user) {
  if (!user) return []
  
  if (hasRole(user, ROLES.ADMIN)) {
    return ['all']
  }
  
  if (hasRole(user, ROLES.TEACHER)) {
    return ['own']
  }
  
  if (hasRole(user, ROLES.OBSERVER)) {
    return ['read']
  }
  
  return []
}

export default {
  ROLES,
  initPermissions,
  hasRole,
  checkPermission,
  permissionMiddleware,
  getUserScopes,
}
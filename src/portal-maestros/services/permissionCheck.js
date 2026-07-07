/**
 * RBAC (Role-Based Access Control) Enforcement
 */

export const ROLES = {
  TEACHER: 'teacher',
  ADMIN: 'admin',
  OBSERVER: 'observer',
}

const PERMISSIONS = {
  [ROLES.TEACHER]: ['read:classes', 'write:observations', 'write:plans', 'read:students'],
  [ROLES.ADMIN]: ['*'], // All permissions
  [ROLES.OBSERVER]: ['read:classes', 'read:students'],
}

/**
 * Check if a user role has a specific permission
 * @param {string} role 
 * @param {string} permission 
 * @returns {boolean}
 */
export function hasPermission(role, permission) {
  if (!role) return false
  
  const userPermissions = PERMISSIONS[role] || []
  if (userPermissions.includes('*')) return true
  
  return userPermissions.includes(permission)
}

/**
 * Filter an array of items based on permission check
 */
export function filterByPermission(items, role, permission) {
  if (hasPermission(role, permission)) return items
  return []
}

export default { hasPermission, ROLES }

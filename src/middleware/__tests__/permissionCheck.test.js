import { describe, it, expect, beforeEach, vi } from 'vitest'
import { checkPermission, hasRole, ROLES, initPermissions } from '../permissionCheck.js'

describe('permissionCheck', () => {
  beforeEach(() => {
    initPermissions()
  })

  it('defines roles correctly', () => {
    expect(ROLES.TEACHER).toBe('teacher')
    expect(ROLES.ADMIN).toBe('admin')
    expect(ROLES.OBSERVER).toBe('observer')
  })

  it('teacher can access own data', () => {
    const user = { id: 'user-1', role: 'teacher', maestro_id: 'user-1' }
    expect(hasRole(user, 'teacher')).toBe(true)
  })

  it('admin has all permissions', () => {
    const user = { id: 'admin-1', role: 'admin' }
    expect(hasRole(user, 'admin')).toBe(true)
    expect(hasRole(user, 'teacher')).toBe(true)
  })

  it('observer has read-only access', () => {
    const user = { id: 'obs-1', role: 'observer' }
    expect(hasRole(user, 'observer')).toBe(true)
  })

  it('checks permission for resource ownership', () => {
    const user = { id: 'user-1', role: 'teacher', maestro_id: 'user-1' }
    const resource = { maestro_id: 'user-1' }
    expect(checkPermission(user, resource, 'read')).toBe(true)
    expect(checkPermission(user, resource, 'write')).toBe(true)
  })

  it('denies access to other user resources', () => {
    const user = { id: 'user-1', role: 'teacher', maestro_id: 'user-1' }
    const resource = { maestro_id: 'user-2' }
    expect(checkPermission(user, resource, 'read')).toBe(false)
    expect(checkPermission(user, resource, 'write')).toBe(false)
  })

  it('admin can access all resources', () => {
    const admin = { id: 'admin-1', role: 'admin' }
    const resource = { maestro_id: 'user-2' }
    expect(checkPermission(admin, resource, 'read')).toBe(true)
    expect(checkPermission(admin, resource, 'write')).toBe(true)
  })

  it('observer can only read', () => {
    const observer = { id: 'obs-1', role: 'observer' }
    const resource = { maestro_id: 'user-1' }
    expect(checkPermission(observer, resource, 'read')).toBe(true)
    expect(checkPermission(observer, resource, 'write')).toBe(false)
  })
})
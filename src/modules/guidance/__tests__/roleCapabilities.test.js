/**
 * Tests for roleCapabilities.js
 * @module guidance/knowledge/__tests__
 */

import { describe, it, expect } from 'vitest'
import { ROLE_VIEW_CAPABILITIES, getCapabilities, getViewsForRole, canPerformAction } from '../knowledge/roleCapabilities.js'

describe('roleCapabilities', () => {
  it('should define capabilities for core roles', () => {
    expect(ROLE_VIEW_CAPABILITIES).toHaveProperty('maestro')
    expect(ROLE_VIEW_CAPABILITIES).toHaveProperty('coordinador')
    expect(ROLE_VIEW_CAPABILITIES).toHaveProperty('admin')
  })

  it('getCapabilities should return capabilities for maestro in asistencia', () => {
    const caps = getCapabilities('maestro', 'asistencia')
    expect(caps.length).toBeGreaterThan(0)
    expect(caps.some(c => c.action === 'mark_present')).toBe(true)
  })

  it('getCapabilities should return empty for unknown role', () => {
    const caps = getCapabilities('unknown_role', 'hoy')
    expect(caps).toEqual([])
  })

  it('getCapabilities should return empty for unknown view', () => {
    const caps = getCapabilities('maestro', 'unknown_view')
    expect(caps).toEqual([])
  })

  it('getViewsForRole should return views for maestro', () => {
    const views = getViewsForRole('maestro')
    expect(views).toContain('hoy')
    expect(views).toContain('asistencia')
    expect(views).toContain('calificaciones')
  })

  it('getViewsForRole should return empty for unknown role', () => {
    const views = getViewsForRole('unknown')
    expect(views).toEqual([])
  })

  it('canPerformAction should return true for valid action', () => {
    expect(canPerformAction('maestro', 'asistencia', 'mark_present')).toBe(true)
  })

  it('canPerformAction should return false for invalid action', () => {
    expect(canPerformAction('maestro', 'asistencia', 'delete_all')).toBe(false)
  })

  it('capabilities should have required fields', () => {
    const caps = getCapabilities('maestro', 'hoy')
    for (const cap of caps) {
      expect(cap).toHaveProperty('action')
      expect(cap).toHaveProperty('label')
      expect(cap).toHaveProperty('icon')
      expect(cap).toHaveProperty('priority')
      expect(['primary', 'secondary']).toContain(cap.priority)
    }
  })

  it('maestra_suplente should have fewer capabilities than maestro', () => {
    const maestroViews = getViewsForRole('maestro')
    const suplenteViews = getViewsForRole('maestra_suplente')
    expect(suplenteViews.length).toBeLessThan(maestroViews.length)
  })
})

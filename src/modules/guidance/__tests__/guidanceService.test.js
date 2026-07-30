/**
 * Tests for guidanceService.js (orchestrator)
 * @module guidance/__tests__
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createGuidanceService } from '../guidanceService.js'

// Mock supabase to avoid real DB calls
vi.mock('../../../lib/supabaseClient.js', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue({ data: [], error: null }),
  },
}))

// Mock permissions
vi.mock('../../../lib/permissions.js', () => ({}))

describe('createGuidanceService', () => {
  let service

  beforeEach(() => {
    service = createGuidanceService()
  })

  it('should initialize with a role', async () => {
    await service.init('maestro')
    const ctx = service.getContext()
    expect(ctx.role).toBe('maestro')
  })

  it('should set view and refresh data', async () => {
    await service.init('maestro')
    await service.setView('asistencia')

    const ctx = service.getContext()
    expect(ctx.view).toBe('asistencia')
  })

  it('should get hints for current view', async () => {
    await service.init('maestro')
    await service.setView('asistencia')

    const hints = service.getHints()
    expect(hints).toHaveProperty('proactive')
    expect(hints).toHaveProperty('reactive')
    expect(hints).toHaveProperty('total')
    expect(Array.isArray(hints.proactive)).toBe(true)
    expect(Array.isArray(hints.reactive)).toBe(true)
  })

  it('should get actions for current view and role', async () => {
    await service.init('maestro')
    await service.setView('asistencia')

    const actions = service.getActions()
    expect(Array.isArray(actions)).toBe(true)
    expect(actions.length).toBeGreaterThan(0)
    expect(actions.some(a => a.action === 'mark_present')).toBe(true)
  })

  it('should subscribe to context changes', async () => {
    await service.init('maestro')
    const callback = vi.fn()
    service.subscribe(callback)

    await service.setView('calificaciones')
    expect(callback).toHaveBeenCalled()
  })

  it('should destroy and reset state', async () => {
    await service.init('maestro')
    service.destroy()

    const ctx = service.getContext()
    expect(ctx.role).toBeNull()
    expect(ctx.view).toBeNull()
  })

  it('should provide proactive hints (top 3 critical/high)', async () => {
    await service.init('maestro')
    await service.setView('asistencia')

    const hints = service.getHints()
    // Should have at most 3 proactive hints
    expect(hints.proactive.length).toBeLessThanOrEqual(3)
  })

  it('should return empty actions when view is null (before init)', () => {
    // No init called, context.view is null
    const actions = service.getActions()
    expect(actions).toEqual([])
  })
})

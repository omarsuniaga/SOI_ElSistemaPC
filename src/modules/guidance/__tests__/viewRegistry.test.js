/**
 * Tests for viewRegistry.js
 * @module guidance/context/__tests__
 */

import { describe, it, expect } from 'vitest'
import { VIEWS, getViewDefinition, getAllViewIds } from '../context/viewRegistry.js'

describe('viewRegistry', () => {
  it('should export a VIEWS array with at least 7 entries', () => {
    expect(VIEWS).toBeDefined()
    expect(Array.isArray(VIEWS)).toBe(true)
    expect(VIEWS.length).toBeGreaterThanOrEqual(7)
  })

  it('each view should have required fields', () => {
    for (const view of VIEWS) {
      expect(view).toHaveProperty('viewId')
      expect(view).toHaveProperty('label')
      expect(view).toHaveProperty('primaryAction')
      expect(view).toHaveProperty('criticalRules')
      expect(view).toHaveProperty('contextualTips')
      expect(Array.isArray(view.criticalRules)).toBe(true)
      expect(Array.isArray(view.contextualTips)).toBe(true)
    }
  })

  it('should get a view by id', () => {
    const hoy = getViewDefinition('hoy')
    expect(hoy).toBeDefined()
    expect(hoy.label).toBe('Vista del Día')
  })

  it('should return undefined for unknown view', () => {
    expect(getViewDefinition('unknown')).toBeUndefined()
  })

  it('should return all view ids', () => {
    const ids = getAllViewIds()
    expect(ids).toContain('hoy')
    expect(ids).toContain('asistencia')
    expect(ids).toContain('calificaciones')
    expect(ids.length).toBe(VIEWS.length)
  })

  it('each contextual tip should have condition and tip', () => {
    for (const view of VIEWS) {
      for (const tip of view.contextualTips) {
        expect(tip).toHaveProperty('condition')
        expect(tip).toHaveProperty('tip')
        expect(typeof tip.condition).toBe('string')
        expect(typeof tip.tip).toBe('string')
      }
    }
  })
})

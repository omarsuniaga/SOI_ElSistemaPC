import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AlumnosHook, useAlumnos } from '../hooks/useAlumnos.js'

describe('useAlumnos', () => {
  let hook

  beforeEach(() => {
    hook = new AlumnosHook()
    hook.alumnos = [
      { id: '1', nombre: 'Ana García', email: 'ana@test.com', cedula: '001-1', is_active: true, familiar_nombre: 'María García', instrumento_principal: 'Violín' },
      { id: '2', nombre: 'Pedro López', email: 'pedro@test.com', cedula: '002-2', is_active: false, familiar_nombre: 'Juan López', instrumento_principal: 'Piano' },
      { id: '3', nombre: 'Lucía Pérez', email: 'lucia@test.com', cedula: '003-3', is_active: true, familiar_nombre: '', instrumento_principal: 'Violín' },
    ]
  })

  describe('search', () => {
    it('searches by nombre', () => {
      const results = hook.search('Ana')
      expect(results).toHaveLength(1)
      expect(results[0].id).toBe('1')
    })

    it('searches by familiar_nombre', () => {
      const results = hook.search('María')
      expect(results).toHaveLength(1)
      expect(results[0].id).toBe('1')
    })

    it('does not break with empty familiar_nombre', () => {
      const results = hook.search('Lucía')
      expect(results).toHaveLength(1)
      expect(results[0].id).toBe('3')
    })

    it('returns all when no search term', () => {
      expect(hook.search('')).toHaveLength(3)
      expect(hook.search(null)).toHaveLength(3)
    })
  })

  describe('filterByEstado', () => {
    it('filters by is_active', () => {
      expect(hook.filterByEstado(true)).toHaveLength(2)
      expect(hook.filterByEstado(false)).toHaveLength(1)
    })
  })

  describe('getActivos / getInactivos', () => {
    it('returns active alumnos using is_active', () => {
      expect(hook.getActivos()).toHaveLength(2)
    })

    it('returns inactive alumnos using is_active', () => {
      expect(hook.getInactivos()).toHaveLength(1)
    })
  })

  describe('countBySection', () => {
    it('counts by instrumento_principal', () => {
      const counts = hook.countBySection()
      expect(counts).toEqual({ 'Violín': 2, 'Piano': 1 })
    })

    it('handles empty instrumento_principal as Sin sección', () => {
      hook.alumnos.push({ id: '4', nombre: 'Test', instrumento_principal: '' })
      const counts = hook.countBySection()
      expect(counts['Sin sección']).toBe(1)
    })
  })

  describe('singleton', () => {
    it('returns same instance', () => {
      const a = useAlumnos()
      const b = useAlumnos()
      expect(a).toBe(b)
    })
  })
})

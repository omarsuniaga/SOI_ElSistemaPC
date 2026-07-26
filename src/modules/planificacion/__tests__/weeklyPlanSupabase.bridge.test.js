import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── In-memory Supabase mock ────────────────────────────────────

let tables = {}
let nextId = 1

function resetStore() {
  tables = {
    class_curriculum_plan: [],
    route_versions: [],
    routes: [],
    levels: [],
    nodes: [],
    objetivos: [],
    indicators: [],
    clases: [],
  }
  nextId = 1
}

function buildChain(forTable) {
  let queryFilters = {}
  let queryOrder = null
  let queryLimit = null
  let pendingOp = null
  let pendingData = null

  const applyFilters = (rows) => {
    let result = rows.filter((r) =>
      Object.entries(queryFilters).every(([k, v]) => r[k] === v),
    )
    if (queryOrder) {
      const [field, asc] = queryOrder
      result.sort((a, b) => {
        if (asc) return a[field] > b[field] ? 1 : -1
        return a[field] < b[field] ? 1 : -1
      })
    }
    if (queryLimit) result = result.slice(0, queryLimit)
    return result
  }

  const executePending = () => {
    if (pendingOp === 'update') {
      const rows = applyFilters(tables[forTable] || [])
      rows.forEach((r) => Object.assign(r, pendingData, { updated_at: new Date().toISOString() }))
      pendingOp = null
      pendingData = null
    }
  }

  const c = {
    select: vi.fn(() => c),
    eq: vi.fn((k, v) => {
      queryFilters[k] = v
      return c
    }),
    ilike: vi.fn(() => c),
    or: vi.fn(() => c),
    order: vi.fn((field, opts) => {
      queryOrder = [field, opts?.ascending !== false]
      return c
    }),
    limit: vi.fn((n) => {
      queryLimit = n
      return c
    }),
    single: vi.fn(() => {
      executePending()
      const rows = applyFilters(tables[forTable] || [])
      return Promise.resolve({
        data: rows[0] || null,
        error: rows.length ? null : { message: 'not found' },
      })
    }),
    maybeSingle: vi.fn(() => {
      executePending()
      const rows = applyFilters(tables[forTable] || [])
      return Promise.resolve({ data: rows[0] || null, error: null })
    }),
    update: vi.fn((updates) => {
      pendingOp = 'update'
      pendingData = updates
      return c
    }),
  }

  c.then = (resolve) => {
    executePending()
    const rows = applyFilters(tables[forTable] || [])
    return Promise.resolve({ data: rows, error: null }).then(resolve)
  }
  c.catch = (reject) => c.then(undefined, reject)
  c.finally = (cb) => c.then(cb, cb)

  return c
}

vi.mock('../../../lib/supabaseClient.js', () => ({
  supabase: {
    from: vi.fn((table) => buildChain(table)),
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'test-user', email: 'test@test.com' } },
        error: null,
      }),
    },
  },
}))

vi.mock('../../../lib/periodoSniffer.js', () => ({
  checkPeriodoSupport: vi.fn().mockResolvedValue(false),
}))

// ── Import AFTER mock ──────────────────────────────────────────

import {
  obtenerFuentesCurriculares,
  obtenerVersionesCurriculares,
  publicarVersionCurricular,
  _resolveRouteVersionForClase,
} from '../api/weeklyPlanSupabase.js'

// ── Tests ──────────────────────────────────────────────────────

describe('weeklyPlanSupabase — stub replacement', () => {
  beforeEach(() => {
    resetStore()
  })

  describe('obtenerFuentesCurriculares', () => {
    it('should return nodes and indicators via bridge for a class', async () => {
      // Setup bridge
      tables.class_curriculum_plan.push({
        id: 'ccp_001',
        clase_id: 'clase_001',
        route_version_id: 'rv_001',
        estado: 'activo',
      })

      // Setup route version with hierarchy
      tables.route_versions.push({
        id: 'rv_001',
        route_id: 'route_001',
        status: 'published',
      })

      tables.levels.push({
        id: 'lvl_001',
        route_version_id: 'rv_001',
        level_number: 1,
        name: 'Nivel 1',
      })

      tables.nodes.push({
        id: 'node_001',
        level_id: 'lvl_001',
        name: 'Escalas',
        type: 'tema',
      })

      tables.objetivos.push({
        id: 'obj_001',
        node_id: 'node_001',
        nombre: 'Escala Do Mayor',
      })

      tables.indicators.push({
        id: 'ind_001',
        objetivo_id: 'obj_001',
        description: 'Toca la escala con fluidez',
      })

      const result = await obtenerFuentesCurriculares('clase_001')

      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBeGreaterThan(0)
    })

    it('should return empty array when class has no bridge', async () => {
      const result = await obtenerFuentesCurriculares('clase_999')
      expect(result).toEqual([])
    })
  })

  describe('obtenerVersionesCurriculares', () => {
    it('should return published route versions for a route', async () => {
      tables.route_versions.push(
        {
          id: 'rv_001',
          route_id: 'route_001',
          version: 1,
          status: 'published',
          created_at: '2026-01-01T00:00:00Z',
        },
        {
          id: 'rv_002',
          route_id: 'route_001',
          version: 2,
          status: 'draft',
          created_at: '2026-07-01T00:00:00Z',
        },
      )

      const result = await obtenerVersionesCurriculares('route_001')

      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBe(2)
      expect(result[0].route_id).toBe('route_001')
    })

    it('should return empty array when no versions exist for route', async () => {
      const result = await obtenerVersionesCurriculares('route_999')
      expect(result.length).toBe(0)
    })
  })

  describe('publicarVersionCurricular', () => {
    it('should update route_version status to published', async () => {
      tables.route_versions.push({
        id: 'rv_001',
        route_id: 'route_001',
        version: 1,
        status: 'draft',
      })

      const result = await publicarVersionCurricular('rv_001')

      expect(result).toBeDefined()
      expect(result.status).toBe('published')
    })

    it('should throw if versionId is not provided', async () => {
      await expect(publicarVersionCurricular(null)).rejects.toThrow(
        'Se requiere versionId',
      )
    })
  })

  describe('_resolveRouteVersionForClase', () => {
    it('should resolve via class_curriculum_plan bridge', async () => {
      tables.class_curriculum_plan.push({
        id: 'ccp_001',
        clase_id: 'clase_001',
        route_version_id: 'rv_001',
        estado: 'activo',
      })

      tables.route_versions.push({
        id: 'rv_001',
        route_id: 'route_001',
        version: 1,
        status: 'published',
      })

      const result = await _resolveRouteVersionForClase('clase_001')

      expect(result).toBeDefined()
      expect(result.id).toBe('rv_001')
    })

    it('should return null if no bridge exists', async () => {
      const result = await _resolveRouteVersionForClase('clase_999')
      expect(result).toBeNull()
    })
  })
})

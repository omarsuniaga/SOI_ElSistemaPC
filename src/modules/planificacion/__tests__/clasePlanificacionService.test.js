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
  }
  nextId = 1
}

function buildChain(forTable) {
  let queryFilters = {}
  let queryOrder = null
  let queryLimit = null

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

  const c = {
    select: vi.fn(() => c),
    eq: vi.fn((k, v) => {
      queryFilters[k] = v
      return c
    }),
    neq: vi.fn(() => c),
    ilike: vi.fn(() => c),
    or: vi.fn(() => c),
    in: vi.fn(() => c),
    order: vi.fn((field, opts) => {
      queryOrder = [field, opts?.ascending !== false]
      return c
    }),
    limit: vi.fn((n) => {
      queryLimit = n
      return c
    }),
    single: vi.fn(() => {
      const rows = applyFilters(tables[forTable] || [])
      return Promise.resolve({
        data: rows[0] || null,
        error: rows.length ? null : { message: 'not found' },
      })
    }),
    maybeSingle: vi.fn(() => {
      const rows = applyFilters(tables[forTable] || [])
      return Promise.resolve({ data: rows[0] || null, error: null })
    }),
    insert: vi.fn((data) => {
      const items = Array.isArray(data) ? data : [data]
      const records = items.map((d) => {
        const id = d.id || `${forTable}_${nextId++}`
        const rec = {
          ...d,
          id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        if (!tables[forTable]) tables[forTable] = []
        tables[forTable].push(rec)
        return rec
      })
      const ic = buildChain(forTable)
      ic.select = vi.fn(() => {
        ic.single = vi.fn(() => Promise.resolve({ data: records[0], error: null }))
        ic.then = (resolve) =>
          Promise.resolve({ data: records, error: null }).then(resolve)
        ic.catch = (reject) =>
          Promise.resolve({ data: records, error: null }).catch(reject)
        ic.finally = (cb) =>
          Promise.resolve({ data: records, error: null }).finally(cb)
        return ic
      })
      return ic
    }),
    update: vi.fn((updates) => {
      const rows = applyFilters(tables[forTable] || [])
      rows.forEach((r) => Object.assign(r, updates, { updated_at: new Date().toISOString() }))
      return c
    }),
    delete: vi.fn(() => {
      const rows = applyFilters(tables[forTable] || [])
      const ids = new Set(rows.map((r) => r.id))
      tables[forTable] = (tables[forTable] || []).filter((r) => !ids.has(r.id))
      return c
    }),
  }

  c.then = (resolve) => {
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
    rpc: vi.fn(),
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'test-user', email: 'test@test.com' } },
        error: null,
      }),
    },
  },
}))

// ── Import service AFTER mock setup ────────────────────────────

import {
  asignarRutaAClase,
  obtenerRutaDeClase,
  cambiarEstadoPlan,
  eliminarRutaDeClase,
  obtenerRutaActivaPorClase,
} from '../services/clasePlanificacionService.js'

// ── Seed helpers ───────────────────────────────────────────────

function seedRouteVersion(id = 'rv_001', overrides = {}) {
  tables.route_versions.push({
    id,
    route_id: 'route_001',
    version: 1,
    status: 'published',
    created_at: new Date().toISOString(),
    ...overrides,
  })
}

function seedRoute(id = 'route_001', overrides = {}) {
  tables.routes.push({
    id,
    instrument: 'violín',
    ...overrides,
  })
}

// ── Tests ──────────────────────────────────────────────────────

describe('clasePlanificacionService', () => {
  beforeEach(() => {
    resetStore()
  })

  describe('asignarRutaAClase', () => {
    it('should create a new class_curriculum_plan with estado activo', async () => {
      seedRouteVersion('rv_001')

      const result = await asignarRutaAClase('clase_001', 'rv_001')

      expect(result).toBeDefined()
      expect(result.clase_id).toBe('clase_001')
      expect(result.route_version_id).toBe('rv_001')
      expect(result.estado).toBe('activo')
    })

    it('should archive previous active route when assigning a new one', async () => {
      seedRouteVersion('rv_001')
      seedRouteVersion('rv_002')

      // First assignment
      await asignarRutaAClase('clase_001', 'rv_001')

      // Second assignment — should archive rv_001
      const result = await asignarRutaAClase('clase_001', 'rv_002')

      expect(result.route_version_id).toBe('rv_002')
      expect(result.estado).toBe('activo')

      // Verify the old one is archived
      const archived = tables.class_curriculum_plan.find(
        (p) => p.route_version_id === 'rv_001',
      )
      expect(archived).toBeDefined()
      expect(archived.estado).toBe('archivado')
    })

    it('should throw if claseId is missing', async () => {
      await expect(asignarRutaAClase(null, 'rv_001')).rejects.toThrow(
        'claseId y routeVersionId son requeridos',
      )
    })

    it('should throw if routeVersionId is missing', async () => {
      await expect(asignarRutaAClase('clase_001', null)).rejects.toThrow(
        'claseId y routeVersionId son requeridos',
      )
    })
  })

  describe('obtenerRutaDeClase', () => {
    it('should return the active route for a class', async () => {
      seedRouteVersion('rv_001')
      tables.class_curriculum_plan.push({
        id: 'ccp_001',
        clase_id: 'clase_001',
        route_version_id: 'rv_001',
        estado: 'activo',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      const result = await obtenerRutaDeClase('clase_001')

      expect(result).toBeDefined()
      expect(result.route_version_id).toBe('rv_001')
      expect(result.estado).toBe('activo')
    })

    it('should return null if no active route exists', async () => {
      const result = await obtenerRutaDeClase('clase_999')
      expect(result).toBeNull()
    })
  })

  describe('cambiarEstadoPlan', () => {
    it('should update the estado of a class curriculum plan', async () => {
      tables.class_curriculum_plan.push({
        id: 'ccp_001',
        clase_id: 'clase_001',
        route_version_id: 'rv_001',
        estado: 'activo',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      const result = await cambiarEstadoPlan('clase_001', 'archivado')

      expect(result).toBeDefined()
      expect(result.estado).toBe('archivado')
    })

    it('should throw for invalid estado', async () => {
      await expect(cambiarEstadoPlan('clase_001', 'invalid')).rejects.toThrow(
        'Estado no válido',
      )
    })
  })

  describe('eliminarRutaDeClase', () => {
    it('should remove the curriculum plan for a class', async () => {
      tables.class_curriculum_plan.push({
        id: 'ccp_001',
        clase_id: 'clase_001',
        route_version_id: 'rv_001',
        estado: 'activo',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      await eliminarRutaDeClase('clase_001')

      expect(tables.class_curriculum_plan.length).toBe(0)
    })

    it('should not throw if no plan exists for the class', async () => {
      await expect(eliminarRutaDeClase('clase_999')).resolves.not.toThrow()
    })
  })

  describe('obtenerRutaActivaPorClase', () => {
    it('should return the active plan for a class', async () => {
      tables.class_curriculum_plan.push({
        id: 'ccp_001',
        clase_id: 'clase_001',
        route_version_id: 'rv_001',
        estado: 'activo',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      const result = await obtenerRutaActivaPorClase('clase_001')
      expect(result).toBeDefined()
      expect(result.id).toBe('ccp_001')
      expect(result.estado).toBe('activo')
    })

    it('should return null if no active plan exists', async () => {
      const result = await obtenerRutaActivaPorClase('clase_999')
      expect(result).toBeNull()
    })
  })
})

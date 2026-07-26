import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── In-memory Supabase mock ────────────────────────────────────

let tables = {}
let nextId = 1

function resetStore() {
  tables = {
    clases: [],
    route_versions: [],
    routes: [],
    levels: [],
    nodes: [],
    objetivos: [],
    indicators: [],
    class_curriculum_plan: [],
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
        const rec = { ...d, id, created_at: new Date().toISOString() }
        if (!tables[forTable]) tables[forTable] = []
        tables[forTable].push(rec)
        return rec
      })
      const ic = buildChain(forTable)
      ic.select = vi.fn(() => {
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
  },
}))

// ── Import AFTER mock ──────────────────────────────────────────

import { getLevelsByClass, getFullHierarchy } from '../api/routeSupabase.js'

// ── Tests ──────────────────────────────────────────────────────

describe('routeSupabase — bridge resolution', () => {
  beforeEach(() => {
    resetStore()
  })

  it('should resolve route_version_id from class_curriculum_plan', async () => {
    // Setup: bridge exists
    tables.class_curriculum_plan.push({
      id: 'ccp_001',
      clase_id: 'clase_001',
      route_version_id: 'rv_001',
      estado: 'activo',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    // Setup: levels for that route version
    tables.levels.push({
      id: 'lvl_001',
      route_version_id: 'rv_001',
      level_number: 1,
      name: 'Nivel 1',
      main_objective: 'Objetivo general',
    })

    const levels = await getLevelsByClass('clase_001')

    expect(levels.length).toBe(1)
    expect(levels[0].nombre).toBe('Nivel 1')
    expect(levels[0].numero_nivel).toBe(1)
  })

  it('should return empty array when no bridge exists for class', async () => {
    const levels = await getLevelsByClass('clase_999')
    expect(levels).toEqual([])
  })

  it('should use the most recent active bridge when multiple exist', async () => {
    tables.class_curriculum_plan.push(
      {
        id: 'ccp_001',
        clase_id: 'clase_001',
        route_version_id: 'rv_old',
        estado: 'archivado',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      },
      {
        id: 'ccp_002',
        clase_id: 'clase_001',
        route_version_id: 'rv_new',
        estado: 'activo',
        created_at: '2026-07-01T00:00:00Z',
        updated_at: '2026-07-01T00:00:00Z',
      },
    )

    tables.levels.push({
      id: 'lvl_001',
      route_version_id: 'rv_new',
      level_number: 1,
      name: 'Nivel Nuevo',
    })

    const levels = await getLevelsByClass('clase_001')
    expect(levels.length).toBe(1)
    expect(levels[0].nombre).toBe('Nivel Nuevo')
  })

  it('should NOT use instrument-based fallback', async () => {
    // Setup: no bridge, but instrument exists on class
    tables.clases.push({
      id: 'clase_001',
      instrumento: 'violín',
      activo: true,
    })

    // Setup: routes with instrument match (should NOT be used)
    tables.routes.push({ id: 'route_001', instrument: 'violín' })
    tables.route_versions.push({
      id: 'rv_fallback',
      route_id: 'route_001',
      status: 'published',
      created_at: new Date().toISOString(),
    })

    const levels = await getLevelsByClass('clase_001')
    expect(levels).toEqual([])
  })

  it('getFullHierarchy should return full hierarchy via bridge', async () => {
    tables.class_curriculum_plan.push({
      id: 'ccp_001',
      clase_id: 'clase_001',
      route_version_id: 'rv_001',
      estado: 'activo',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    tables.levels.push({
      id: 'lvl_001',
      route_version_id: 'rv_001',
      level_number: 1,
      name: 'Nivel 1',
    })

    const hierarchy = await getFullHierarchy('clase_001')
    expect(hierarchy.length).toBe(1)
    expect(hierarchy[0].nombre).toBe('Nivel 1')
  })
})

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

/**
 * Resolución de ruta por clase.
 *
 * Estas pruebas afirmaban la tabla puente `class_curriculum_plan`, que nunca
 * llegó a producción: su migración quedó sin aplicar y el código terminó
 * cortocircuitado para no arrastrar el error. La relación real es la columna
 * `clases.route_version_id`, que ya existía. Las pruebas se reescribieron sobre
 * esa relación en vez de seguir describiendo un puente inexistente.
 */
describe('routeSupabase — resolución de ruta por clase', () => {
  beforeEach(() => {
    resetStore()
  })

  it('resuelve la versión de ruta desde clases.route_version_id', async () => {
    tables.clases.push({
      id: 'clase_001',
      route_version_id: 'rv_001',
      activo: true,
    })

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

  it('devuelve arreglo vacío cuando la clase no tiene ruta asignada', async () => {
    tables.clases.push({ id: 'clase_002', route_version_id: null, activo: true })
    const levels = await getLevelsByClass('clase_002')
    expect(levels).toEqual([])
  })

  it('devuelve arreglo vacío cuando la clase no existe', async () => {
    const levels = await getLevelsByClass('clase_999')
    expect(levels).toEqual([])
  })

  it('no infiere la ruta por instrumento cuando la clase no la tiene asignada', async () => {
    // Una clase sin ruta debe reportar que no la tiene, no adivinar por
    // instrumento: elegir currículo es una decisión de ACM, no del resolver.
    tables.clases.push({
      id: 'clase_001',
      instrumento: 'violín',
      route_version_id: null,
      activo: true,
    })
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

  it('consulta la jerarquía en el navegador, no solo bajo test', async () => {
    // El resolver anterior hacía `if (!isTestEnv && typeof window !== 'undefined')
    // return null`, de modo que en producción nunca consultaba. Con jsdom
    // presente (window definido), la consulta debe ocurrir igual.
    expect(typeof window).toBe('object')

    tables.clases.push({ id: 'clase_001', route_version_id: 'rv_001', activo: true })
    tables.levels.push({
      id: 'lvl_001',
      route_version_id: 'rv_001',
      level_number: 1,
      name: 'Nivel 1',
    })

    const levels = await getLevelsByClass('clase_001')
    expect(levels.length).toBe(1)
  })

  it('getFullHierarchy devuelve la jerarquía completa', async () => {
    tables.clases.push({ id: 'clase_001', route_version_id: 'rv_001', activo: true })

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

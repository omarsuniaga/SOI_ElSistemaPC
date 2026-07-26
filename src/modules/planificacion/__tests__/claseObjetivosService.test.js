import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── In-memory Supabase mock ────────────────────────────────────

let tables = {}
let nextId = 1

function resetStore() {
  tables = {
    clase_objetivos: [],
    nodes: [],
    indicators: [],
    class_curriculum_plan: [],
  }
  nextId = 1
}

function buildChain(forTable) {
  let queryFilters = {}
  let queryOrder = null
  let queryLimit = null
  let pendingOp = null // 'update' | 'delete' | null
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
    } else if (pendingOp === 'delete') {
      const rows = applyFilters(tables[forTable] || [])
      const ids = new Set(rows.map((r) => r.id))
      tables[forTable] = (tables[forTable] || []).filter((r) => !ids.has(r.id))
      pendingOp = null
    }
  }

  const c = {
    select: vi.fn(() => c),
    eq: vi.fn((k, v) => {
      queryFilters[k] = v
      return c
    }),
    in: vi.fn((k, arr) => {
      queryFilters[k] = arr
      return c
    }),
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
    update: vi.fn((updates) => {
      pendingOp = 'update'
      pendingData = updates
      return c
    }),
    delete: vi.fn(() => {
      pendingOp = 'delete'
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
  },
}))

// ── Import AFTER mock ──────────────────────────────────────────

import {
  agregarObjetivos,
  obtenerObjetivosPorPlanificacion,
  actualizarObjetivo,
  eliminarObjetivos,
  reordenarObjetivos,
} from '../services/claseObjetivosService.js'

// ── Tests ──────────────────────────────────────────────────────

describe('claseObjetivosService', () => {
  beforeEach(() => {
    resetStore()
  })

  describe('agregarObjetivos', () => {
    it('should bulk insert objectives for a planificacion', async () => {
      const objetivos = [
        {
          planificacion_id: 'plan_001',
          class_curriculum_plan_id: 'ccp_001',
          node_id: 'node_001',
          indicator_id: 'ind_001',
        },
        {
          planificacion_id: 'plan_001',
          class_curriculum_plan_id: 'ccp_001',
          node_id: 'node_001',
          indicator_id: 'ind_002',
        },
      ]

      const result = await agregarObjetivos(objetivos)

      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBe(2)
      expect(result[0].planificacion_id).toBe('plan_001')
      expect(result[0].node_id).toBe('node_001')
      expect(result[1].indicator_id).toBe('ind_002')
    })

    it('should default estado to pendiente', async () => {
      const objetivos = [
        {
          planificacion_id: 'plan_001',
          class_curriculum_plan_id: 'ccp_001',
          node_id: 'node_001',
          indicator_id: 'ind_001',
        },
      ]

      const result = await agregarObjetivos(objetivos)
      expect(result[0].estado).toBe('pendiente')
    })

    it('should throw if objetivos array is empty', async () => {
      await expect(agregarObjetivos([])).rejects.toThrow(
        'Se requiere al menos un objetivo',
      )
    })

    it('should set semana when provided', async () => {
      const objetivos = [
        {
          planificacion_id: 'plan_001',
          class_curriculum_plan_id: 'ccp_001',
          node_id: 'node_001',
          indicator_id: 'ind_001',
          semana: 3,
        },
      ]

      const result = await agregarObjetivos(objetivos)
      expect(result[0].semana).toBe(3)
    })
  })

  describe('obtenerObjetivosPorPlanificacion', () => {
    it('should return objectives for a given planificacion', async () => {
      tables.clase_objetivos.push(
        {
          id: 'co_001',
          planificacion_id: 'plan_001',
          class_curriculum_plan_id: 'ccp_001',
          node_id: 'node_001',
          indicator_id: 'ind_001',
          estado: 'pendiente',
          created_at: new Date().toISOString(),
        },
        {
          id: 'co_002',
          planificacion_id: 'plan_001',
          class_curriculum_plan_id: 'ccp_001',
          node_id: 'node_001',
          indicator_id: 'ind_002',
          estado: 'en_progreso',
          created_at: new Date().toISOString(),
        },
        {
          id: 'co_003',
          planificacion_id: 'plan_002',
          class_curriculum_plan_id: 'ccp_001',
          node_id: 'node_002',
          indicator_id: 'ind_003',
          estado: 'completado',
          created_at: new Date().toISOString(),
        },
      )

      const result = await obtenerObjetivosPorPlanificacion('plan_001')

      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBe(2)
      result.forEach((o) => expect(o.planificacion_id).toBe('plan_001'))
    })

    it('should return empty array when no objectives exist', async () => {
      const result = await obtenerObjetivosPorPlanificacion('plan_999')
      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBe(0)
    })
  })

  describe('actualizarObjetivo', () => {
    it('should update the estado of an objective', async () => {
      tables.clase_objetivos.push({
        id: 'co_001',
        planificacion_id: 'plan_001',
        class_curriculum_plan_id: 'ccp_001',
        node_id: 'node_001',
        indicator_id: 'ind_001',
        estado: 'pendiente',
        created_at: new Date().toISOString(),
      })

      const result = await actualizarObjetivo('co_001', { estado: 'completado' })

      expect(result).toBeDefined()
      expect(result.estado).toBe('completado')
    })

    it('should update semana of an objective', async () => {
      tables.clase_objetivos.push({
        id: 'co_001',
        planificacion_id: 'plan_001',
        class_curriculum_plan_id: 'ccp_001',
        node_id: 'node_001',
        indicator_id: 'ind_001',
        estado: 'pendiente',
        semana: null,
        created_at: new Date().toISOString(),
      })

      const result = await actualizarObjetivo('co_001', { semana: 5 })
      expect(result.semana).toBe(5)
    })
  })

  describe('eliminarObjetivos', () => {
    it('should remove all objectives for a planificacion', async () => {
      tables.clase_objetivos.push(
        {
          id: 'co_001',
          planificacion_id: 'plan_001',
          class_curriculum_plan_id: 'ccp_001',
          node_id: 'node_001',
          indicator_id: 'ind_001',
          estado: 'pendiente',
          created_at: new Date().toISOString(),
        },
        {
          id: 'co_002',
          planificacion_id: 'plan_001',
          class_curriculum_plan_id: 'ccp_001',
          node_id: 'node_001',
          indicator_id: 'ind_002',
          estado: 'pendiente',
          created_at: new Date().toISOString(),
        },
        {
          id: 'co_003',
          planificacion_id: 'plan_002',
          class_curriculum_plan_id: 'ccp_001',
          node_id: 'node_002',
          indicator_id: 'ind_003',
          estado: 'pendiente',
          created_at: new Date().toISOString(),
        },
      )

      await eliminarObjetivos('plan_001')

      expect(tables.clase_objetivos.length).toBe(1)
      expect(tables.clase_objetivos[0].planificacion_id).toBe('plan_002')
    })

    it('should not throw for non-existent planificacion', async () => {
      await expect(eliminarObjetivos('plan_999')).resolves.not.toThrow()
    })
  })

  describe('reordenarObjetivos', () => {
    it('should update semana for multiple objectives', async () => {
      tables.clase_objetivos.push(
        {
          id: 'co_001',
          planificacion_id: 'plan_001',
          class_curriculum_plan_id: 'ccp_001',
          node_id: 'node_001',
          indicator_id: 'ind_001',
          semana: 1,
          estado: 'pendiente',
          created_at: new Date().toISOString(),
        },
        {
          id: 'co_002',
          planificacion_id: 'plan_001',
          class_curriculum_plan_id: 'ccp_001',
          node_id: 'node_001',
          indicator_id: 'ind_002',
          semana: 2,
          estado: 'pendiente',
          created_at: new Date().toISOString(),
        },
      )

      const orden = [
        { id: 'co_001', semana: 3 },
        { id: 'co_002', semana: 1 },
      ]

      const result = await reordenarObjetivos('plan_001', orden)

      expect(result).toBe(true)
      // Verify the store was updated
      const co1 = tables.clase_objetivos.find((o) => o.id === 'co_001')
      const co2 = tables.clase_objetivos.find((o) => o.id === 'co_002')
      expect(co1.semana).toBe(3)
      expect(co2.semana).toBe(1)
    })
  })
})

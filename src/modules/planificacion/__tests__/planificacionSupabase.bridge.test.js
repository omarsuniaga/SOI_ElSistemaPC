import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── In-memory Supabase mock ────────────────────────────────────

let tables = {}
let nextId = 1

function resetStore() {
  tables = {
    planificaciones: [],
    clases: [],
    maestros: [],
    class_curriculum_plan: [],
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
    or: vi.fn((clause) => {
      // Simple or support for ilike queries
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
    range: vi.fn((from, to) => c),
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
        const rec = { ...d, id, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
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
    rpc: vi.fn(),
    auth: {
      getUser: vi.fn(),
    },
  },
}))

// ── Import AFTER mock ──────────────────────────────────────────

import { Planificacion } from '../models/planificacion.model.js'
import { supabase } from '../../../lib/supabaseClient.js'
import {
  crearPlanificacion,
  actualizarPlanificacion,
  obtenerPlanificacion,
} from '../api/planificacionSupabase.js'

// ── Tests ──────────────────────────────────────────────────────

describe('planificacionSupabase — class_curriculum_plan_id support', () => {
  beforeEach(() => {
    resetStore()
    supabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user_001' } }, error: null })
    tables.maestros.push({ id: 'mae_001', user_id: 'user_001', nombre_completo: 'Maestro Test' })
  })

  describe('crearPlanificacion', () => {
    it('should include class_curriculum_plan_id in the created record', async () => {
      const planData = {
        tema: 'Clase de escalas',
        clase_id: 'clase_001',
        maestro_id: 'mae_001',
        fecha_inicio: '2026-08-04',
        class_curriculum_plan_id: 'ccp_001',
      }

      const result = await crearPlanificacion(planData)

      expect(result).toBeDefined()
      expect(result.tema).toBe('Clase de escalas')
      expect(result.clase_id).toBe('clase_001')
      // Verify it was persisted in the store
      const stored = tables.planificaciones.find((p) => p.titulo === 'Clase de escalas')
      expect(stored).toBeDefined()
      expect(stored.class_curriculum_plan_id).toBe('ccp_001')
      expect(stored.contenido).toBeUndefined()
      expect(stored.fecha_inicio).toBe('2026-08-04')
    })

    it('should allow creating planificacion without class_curriculum_plan_id (legacy / unmigrated schema)', async () => {
      const planData = {
        tema: 'Clase legacy',
        clase_id: 'clase_001',
        maestro_id: 'mae_001',
        fecha_inicio: '2026-08-04',
      }

      const result = await crearPlanificacion(planData)
      expect(result).toBeDefined()

      // La columna no existe en el esquema desplegado (migración archivada):
      // el payload NO debe referenciarla cuando no hay valor. Enviarla como
      // null rompía el insert con PGRST204.
      const stored = tables.planificaciones.find((p) => p.titulo === 'Clase legacy')
      expect(stored.class_curriculum_plan_id).toBeUndefined()
    })

    it('should resolve maestro_id from the authenticated user when not provided by the UI', async () => {
      const planData = {
        tema: 'Clase autocompletada',
        clase_id: 'clase_001',
        fecha_inicio: '2026-08-04',
      }

      const result = await crearPlanificacion(planData)

      expect(result).toBeDefined()
      const stored = tables.planificaciones.find((p) => p.titulo === 'Clase autocompletada')
      expect(stored.maestro_id).toBe('mae_001')
    })
  })

  describe('actualizarPlanificacion', () => {
    it('should be able to update class_curriculum_plan_id', async () => {
      // Seed a planificacion
      tables.planificaciones.push({
        id: 'plan_001',
        titulo: 'Existing plan',
        clase_id: 'clase_001',
        maestro_id: 'mae_001',
        estado: 'planificado',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      const result = await actualizarPlanificacion('plan_001', {
        class_curriculum_plan_id: 'ccp_002',
      })

      expect(result).toBeDefined()
      const stored = tables.planificaciones.find((p) => p.id === 'plan_001')
      expect(stored.class_curriculum_plan_id).toBe('ccp_002')
    })
  })

  describe('obtenerPlanificacion', () => {
    it('should return class_curriculum_plan_id when present', async () => {
      tables.planificaciones.push({
        id: 'plan_001',
        titulo: 'Plan with bridge',
        clase_id: 'clase_001',
        maestro_id: 'mae_001',
        class_curriculum_plan_id: 'ccp_001',
        estado: 'planificado',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      const result = await obtenerPlanificacion('plan_001')
      expect(result).toBeDefined()
      expect(result.class_curriculum_plan_id).toBe('ccp_001')
    })

    it('should return null class_curriculum_plan_id for legacy plans', async () => {
      tables.planificaciones.push({
        id: 'plan_002',
        titulo: 'Legacy plan',
        clase_id: 'clase_001',
        maestro_id: 'mae_001',
        estado: 'planificado',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      const result = await obtenerPlanificacion('plan_002')
      expect(result.class_curriculum_plan_id).toBeNull()
    })
  })
})

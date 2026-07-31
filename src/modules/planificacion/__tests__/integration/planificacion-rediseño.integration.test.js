import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── In-memory Supabase mock (shared across all services) ───────

let tables = {}
let rpcResults = {}
let nextId = 1

function resetStore() {
  tables = {
    class_curriculum_plan: [],
    clase_mapa_objetivos: [],
    evaluacion_indicador: [],
    planificaciones: [],
    route_versions: [],
    levels: [],
    nodes: [],
    objetivos: [],
    indicators: [],
  }
  rpcResults = {}
  nextId = 1
}

function buildChain(forTable) {
  let queryFilters = {}
  let queryOrder = null
  let queryLimit = null
  let pendingOp = null
  let pendingData = null

  let queryIsFilters = {}

  const applyFilters = (rows) => {
    let result = rows.filter((r) =>
      Object.entries(queryFilters).every(([k, v]) => r[k] === v),
    )
    result = result.filter((r) =>
      Object.entries(queryIsFilters).every(([k, v]) => (r[k] ?? null) === v),
    )
    if (queryOrder) {
      const [field, asc] = queryOrder
      result.sort((a, b) => {
        if (asc) return a[field] > b[field] ? 1 : a[field] < b[field] ? -1 : 0
        return a[field] < b[field] ? 1 : a[field] > b[field] ? -1 : 0
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
    } else if (pendingOp === 'upsert') {
      const items = Array.isArray(pendingData) ? pendingData : [pendingData]
      for (const item of items) {
        const existingIdx = tables[forTable].findIndex(
          (r) =>
            r.alumno_id === item.alumno_id &&
            r.indicator_id === item.indicator_id &&
            r.clase_id === item.clase_id,
        )
        if (existingIdx >= 0) {
          Object.assign(tables[forTable][existingIdx], item, { updated_at: new Date().toISOString() })
        } else {
          const id = item.id || `${forTable}_${nextId++}`
          tables[forTable].push({
            ...item,
            id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
        }
      }
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
    is: vi.fn((k, v) => {
      queryIsFilters[k] = v
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
        const rec = { ...d, id, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
        if (!tables[forTable]) tables[forTable] = []
        tables[forTable].push(rec)
        return rec
      })
      const ic = buildChain(forTable)
      ic.select = vi.fn(() => {
        ic.single = vi.fn(() => Promise.resolve({ data: records[0] || null, error: null }))
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
    upsert: vi.fn((data, opts) => {
      const items = Array.isArray(data) ? data : [data]
      const upserted = []
      for (const item of items) {
        const existingIdx = tables[forTable].findIndex(
          (r) =>
            r.alumno_id === item.alumno_id &&
            r.indicator_id === item.indicator_id &&
            r.clase_id === item.clase_id,
        )
        if (existingIdx >= 0) {
          Object.assign(tables[forTable][existingIdx], item, { updated_at: new Date().toISOString() })
          upserted.push(tables[forTable][existingIdx])
        } else {
          const id = item.id || `${forTable}_${nextId++}`
          const rec = { ...item, id, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
          tables[forTable].push(rec)
          upserted.push(rec)
        }
      }
      const uc = buildChain(forTable)
      uc.select = vi.fn(() => {
        uc.then = (resolve) =>
          Promise.resolve({ data: upserted[0] || null, error: null }).then(resolve)
        uc.catch = (reject) =>
          Promise.resolve({ data: upserted[0] || null, error: null }).catch(reject)
        uc.finally = (cb) =>
          Promise.resolve({ data: upserted[0] || null, error: null }).finally(cb)
        return uc
      })
      return uc
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

vi.mock('../../../../lib/supabaseClient.js', () => ({
  supabase: {
    from: vi.fn((table) => buildChain(table)),
    rpc: vi.fn((fnName, params) => {
      if (rpcResults[fnName]) {
        return Promise.resolve({ data: rpcResults[fnName], error: null })
      }
      return Promise.resolve({ data: null, error: { message: `RPC ${fnName} not mocked` } })
    }),
  },
}))

// ── Import all services AFTER mock ─────────────────────────────

import {
  asignarRutaAClase,
  obtenerRutaActivaPorClase,
} from '../../services/clasePlanificacionService.js'

import {
  agregarObjetivos,
  obtenerObjetivosPorPlanificacion,
} from '../../services/claseObjetivosService.js'

import {
  registrarEvaluacion,
  obtenerEvaluacionesPorClase,
  obtenerProgresoAlumnos,
} from '../../services/evaluacionClaseService.js'

// ── Integration Tests ──────────────────────────────────────────

describe('Planificación Rediseño — Integration Flow', () => {
  beforeEach(() => {
    resetStore()
  })

  it('end-to-end: assign route → create planification → link objectives → evaluate → get progress', async () => {
    // ── Step 1: Assign a route to a class ──
    const bridge = await asignarRutaAClase('clase_001', 'rv_001')
    expect(bridge.clase_id).toBe('clase_001')
    expect(bridge.route_version_id).toBe('rv_001')
    expect(bridge.estado).toBe('activo')

    // ── Step 2: Verify the bridge is active ──
    const activeBridge = await obtenerRutaActivaPorClase('clase_001')
    expect(activeBridge).toBeDefined()
    expect(activeBridge.id).toBe(bridge.id)

    // ── Step 3: Create objetivos owned directly by the class (REQ-14, Decisión 8) ──
    // clase_mapa_objetivos has no planificacion_id bridge — objetivos belong to
    // clase_id + level_id directly, independent of any route-assignment bridge.
    const objetivos = [
      { clase_id: 'clase_001', level_id: 'level_001', nombre: 'Objetivo 1', orden_objetivo: 1 },
      { clase_id: 'clase_001', level_id: 'level_001', nombre: 'Objetivo 2', orden_objetivo: 2 },
      { clase_id: 'clase_001', level_id: 'level_001', nombre: 'Objetivo 3', orden_objetivo: 3 },
    ]

    const linked = await agregarObjetivos(objetivos)
    expect(linked.length).toBe(3)
    expect(linked[0].clase_id).toBe('clase_001')

    // ── Step 4: Verify objectives are linked to the class ──
    const claseObjetivos = await obtenerObjetivosPorPlanificacion('clase_001')
    expect(claseObjetivos.length).toBe(3)
    expect(claseObjetivos[2].orden_objetivo).toBe(3)

    // ── Step 5: Evaluate indicators for students ──
    await registrarEvaluacion({
      alumno_id: 'alu_001',
      indicator_id: 'ind_001',
      clase_id: 'clase_001',
      nota: 4,
      estado: 'avanzado',
      evaluado_por: 'mae_001',
    })

    await registrarEvaluacion({
      alumno_id: 'alu_001',
      indicator_id: 'ind_002',
      clase_id: 'clase_001',
      nota: 3,
      estado: 'en_progreso',
      evaluado_por: 'mae_001',
    })

    await registrarEvaluacion({
      alumno_id: 'alu_002',
      indicator_id: 'ind_001',
      clase_id: 'clase_001',
      nota: 2,
      estado: 'inicia',
      evaluado_por: 'mae_001',
    })

    // ── Step 6: Get evaluations for the class ──
    const evaluations = await obtenerEvaluacionesPorClase('clase_001')
    expect(evaluations.length).toBe(3)

    // ── Step 7: Get progress via RPC ──
    rpcResults['fn_evaluacion_indicadores_por_clase'] = [
      {
        alumno_id: 'alu_001',
        alumno_nombre: 'Luis Pérez',
        total_indicadores: 2,
        dominados: 0,
        en_progreso: 1,
        inicia: 0,
        sin_evaluar: 0,
        nota_promedio: 3.5,
      },
      {
        alumno_id: 'alu_002',
        alumno_nombre: 'María García',
        total_indicadores: 1,
        dominados: 0,
        en_progreso: 0,
        inicia: 1,
        sin_evaluar: 0,
        nota_promedio: 2.0,
      },
    ]

    const progress = await obtenerProgresoAlumnos('clase_001')
    expect(progress.length).toBe(2)
    expect(progress[0].alumno_nombre).toBe('Luis Pérez')
    expect(progress[1].alumno_nombre).toBe('María García')
  })

  it('archiving old route when assigning new one preserves the class-owned objetivos (REQ-14: no cascade, no bridge dependency)', async () => {
    // Assign first route
    const bridge1 = await asignarRutaAClase('clase_001', 'rv_001')

    // Objetivos belong to clase_id directly (clase_mapa_objetivos) — there is
    // no class_curriculum_plan_id column in the new model, so they never
    // reference the route-assignment bridge at all.
    await agregarObjetivos([
      { clase_id: 'clase_001', level_id: 'level_001', nombre: 'Objetivo 1', orden_objetivo: 1 },
    ])

    // Assign second route (should archive the first)
    const bridge2 = await asignarRutaAClase('clase_001', 'rv_002')
    expect(bridge2.estado).toBe('activo')

    // Old bridge should be archived
    const oldBridge = tables.class_curriculum_plan.find((b) => b.id === bridge1.id)
    expect(oldBridge.estado).toBe('archivado')

    // Objetivos should still be there, unaffected by route archival (no cascade,
    // no dependency on the bridge at all — they are owned by clase_id directly)
    const objetivos = await obtenerObjetivosPorPlanificacion('clase_001')
    expect(objetivos.length).toBe(1)
    expect(objetivos[0].clase_id).toBe('clase_001')
  })

  it('evaluation upsert updates existing record', async () => {
    // First evaluation
    await registrarEvaluacion({
      alumno_id: 'alu_001',
      indicator_id: 'ind_001',
      clase_id: 'clase_001',
      nota: 2,
      estado: 'inicia',
    })

    let evals = await obtenerEvaluacionesPorClase('clase_001')
    expect(evals.length).toBe(1)
    expect(evals[0].nota).toBe(2)

    // Update same evaluation (upsert)
    await registrarEvaluacion({
      alumno_id: 'alu_001',
      indicator_id: 'ind_001',
      clase_id: 'clase_001',
      nota: 4,
      estado: 'avanzado',
    })

    evals = await obtenerEvaluacionesPorClase('clase_001')
    expect(evals.length).toBe(1) // Still one record, not two
    expect(evals[0].nota).toBe(4)
    expect(evals[0].estado).toBe('avanzado')
  })
})

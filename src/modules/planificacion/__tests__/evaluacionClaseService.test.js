import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── In-memory Supabase mock ────────────────────────────────────

let tables = {}
let rpcResults = {}
let nextId = 1

function resetStore() {
  tables = {
    evaluacion_indicador: [],
    alumnos: [],
    indicators: [],
    nodes: [],
    clases: [],
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

  const applyFilters = (rows) => {
    let result = rows.filter((r) =>
      Object.entries(queryFilters).every(([k, v]) => {
        if (Array.isArray(v)) return v.includes(r[k])
        return r[k] === v
      }),
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
    } else if (pendingOp === 'upsert') {
      const items = Array.isArray(pendingData) ? pendingData : [pendingData]
      for (const item of items) {
        const existing = tables[forTable].findIndex(
          (r) =>
            r.alumno_id === item.alumno_id &&
            r.indicator_id === item.indicator_id &&
            r.clase_id === item.clase_id,
        )
        if (existing >= 0) {
          Object.assign(tables[forTable][existing], item, { updated_at: new Date().toISOString() })
        } else {
          const id = item.id || `${forTable}_${nextId++}`
          tables[forTable].push({ ...item, id, created_at: new Date().toISOString(), updated_at: new Date().toISOString() })
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

vi.mock('../../../lib/supabaseClient.js', () => ({
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

// ── Import AFTER mock ──────────────────────────────────────────

import {
  registrarEvaluacion,
  obtenerEvaluacionesPorClase,
  obtenerEvaluacionPorAlumno,
  obtenerProgresoAlumnos,
  obtenerProgresoPorIndicador,
} from '../services/evaluacionClaseService.js'

// ── Tests ──────────────────────────────────────────────────────

describe('evaluacionClaseService', () => {
  beforeEach(() => {
    resetStore()
  })

  describe('registrarEvaluacion', () => {
    it('should upsert an evaluation for alumno+indicator+clase', async () => {
      const data = {
        alumno_id: 'alu_001',
        indicator_id: 'ind_001',
        clase_id: 'clase_001',
        nota: 4,
        estado: 'avanzado',
        observaciones: 'Buen desempeño',
        evaluado_por: 'mae_001',
      }

      const result = await registrarEvaluacion(data)

      expect(result).toBeDefined()
      expect(result.alumno_id).toBe('alu_001')
      expect(result.indicator_id).toBe('ind_001')
      expect(result.clase_id).toBe('clase_001')
      expect(result.nota).toBe(4)
      expect(result.estado).toBe('avanzado')
    })

    it('should default estado to sin_evaluar when not provided', async () => {
      const data = {
        alumno_id: 'alu_001',
        indicator_id: 'ind_001',
        clase_id: 'clase_001',
      }

      const result = await registrarEvaluacion(data)
      expect(result.estado).toBe('sin_evaluar')
    })

    it('should throw if alumno_id is missing', async () => {
      await expect(
        registrarEvaluacion({ indicator_id: 'ind_001', clase_id: 'clase_001' }),
      ).rejects.toThrow('alumno_id, indicator_id y clase_id son requeridos')
    })

    it('should throw if indicator_id is missing', async () => {
      await expect(
        registrarEvaluacion({ alumno_id: 'alu_001', clase_id: 'clase_001' }),
      ).rejects.toThrow('alumno_id, indicator_id y clase_id son requeridos')
    })

    it('should throw if clase_id is missing', async () => {
      await expect(
        registrarEvaluacion({ alumno_id: 'alu_001', indicator_id: 'ind_001' }),
      ).rejects.toThrow('alumno_id, indicator_id y clase_id son requeridos')
    })

    it('should validate nota range (1-5)', async () => {
      await expect(
        registrarEvaluacion({
          alumno_id: 'alu_001',
          indicator_id: 'ind_001',
          clase_id: 'clase_001',
          nota: 6,
        }),
      ).rejects.toThrow('La nota debe estar entre 1 y 5')
    })

    it('should accept null nota', async () => {
      const result = await registrarEvaluacion({
        alumno_id: 'alu_001',
        indicator_id: 'ind_001',
        clase_id: 'clase_001',
        nota: null,
      })
      expect(result.nota).toBeNull()
    })
  })

  describe('obtenerEvaluacionesPorClase', () => {
    it('should return evaluations for a given class', async () => {
      tables.evaluacion_indicador.push(
        {
          id: 'ei_001',
          alumno_id: 'alu_001',
          indicator_id: 'ind_001',
          clase_id: 'clase_001',
          nota: 4,
          estado: 'avanzado',
          created_at: new Date().toISOString(),
        },
        {
          id: 'ei_002',
          alumno_id: 'alu_002',
          indicator_id: 'ind_001',
          clase_id: 'clase_001',
          nota: 2,
          estado: 'inicia',
          created_at: new Date().toISOString(),
        },
        {
          id: 'ei_003',
          alumno_id: 'alu_001',
          indicator_id: 'ind_001',
          clase_id: 'clase_002',
          nota: 5,
          estado: 'dominado',
          created_at: new Date().toISOString(),
        },
      )

      const result = await obtenerEvaluacionesPorClase('clase_001')

      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBe(2)
      result.forEach((e) => expect(e.clase_id).toBe('clase_001'))
    })

    it('should return empty array for class with no evaluations', async () => {
      const result = await obtenerEvaluacionesPorClase('clase_999')
      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBe(0)
    })
  })

  describe('obtenerEvaluacionPorAlumno', () => {
    it('should return evaluations for a specific alumno in a class', async () => {
      tables.evaluacion_indicador.push(
        {
          id: 'ei_001',
          alumno_id: 'alu_001',
          indicator_id: 'ind_001',
          clase_id: 'clase_001',
          nota: 4,
          estado: 'avanzado',
          created_at: new Date().toISOString(),
        },
        {
          id: 'ei_002',
          alumno_id: 'alu_002',
          indicator_id: 'ind_001',
          clase_id: 'clase_001',
          nota: 2,
          estado: 'inicia',
          created_at: new Date().toISOString(),
        },
      )

      const result = await obtenerEvaluacionPorAlumno('alu_001', 'clase_001')

      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBe(1)
      expect(result[0].alumno_id).toBe('alu_001')
    })

    it('should return empty array when alumno has no evaluations', async () => {
      const result = await obtenerEvaluacionPorAlumno('alu_999', 'clase_001')
      expect(result.length).toBe(0)
    })
  })

  describe('obtenerProgresoAlumnos', () => {
    it('should return progress summary via RPC', async () => {
      rpcResults['fn_evaluacion_indicadores_por_clase'] = [
        {
          alumno_id: 'alu_001',
          alumno_nombre: 'Luis Pérez',
          total_indicadores: 10,
          dominados: 5,
          en_progreso: 3,
          inicia: 1,
          sin_evaluar: 1,
          nota_promedio: 3.8,
        },
      ]

      const result = await obtenerProgresoAlumnos('clase_001')

      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBe(1)
      expect(result[0].alumno_nombre).toBe('Luis Pérez')
      expect(result[0].total_indicadores).toBe(10)
    })

    it('should return empty array when RPC returns no data', async () => {
      rpcResults['fn_evaluacion_indicadores_por_clase'] = []

      const result = await obtenerProgresoAlumnos('clase_999')
      expect(result.length).toBe(0)
    })
  })

  describe('obtenerProgresoPorIndicador', () => {
    it('should return evaluations for a specific indicator in a class', async () => {
      tables.evaluacion_indicador.push(
        {
          id: 'ei_001',
          alumno_id: 'alu_001',
          indicator_id: 'ind_001',
          clase_id: 'clase_001',
          nota: 4,
          estado: 'avanzado',
          created_at: new Date().toISOString(),
        },
        {
          id: 'ei_002',
          alumno_id: 'alu_002',
          indicator_id: 'ind_001',
          clase_id: 'clase_001',
          nota: 2,
          estado: 'inicia',
          created_at: new Date().toISOString(),
        },
        {
          id: 'ei_003',
          alumno_id: 'alu_001',
          indicator_id: 'ind_002',
          clase_id: 'clase_001',
          nota: 5,
          estado: 'dominado',
          created_at: new Date().toISOString(),
        },
      )

      const result = await obtenerProgresoPorIndicador('ind_001', 'clase_001')

      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBe(2)
      result.forEach((e) => expect(e.indicator_id).toBe('ind_001'))
    })

    it('should return empty array when no evaluations exist for indicator', async () => {
      const result = await obtenerProgresoPorIndicador('ind_999', 'clase_001')
      expect(result.length).toBe(0)
    })
  })
})

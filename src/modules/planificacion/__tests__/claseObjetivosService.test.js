import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── In-memory Supabase mock ────────────────────────────────────
//
// Targets clase_mapa_objetivos (Decisión 8, design.md): claseObjetivosService.js
// used to point to clase_objetivos / class_curriculum_plan, tables that never
// existed in production (to_regclass = NULL). This rewrite targets the real
// class-owned map table introduced by REQ-14 / Decisión 1.

let tables = {}
let nextId = 1

function resetStore() {
  tables = {
    clase_mapa_objetivos: [],
  }
  nextId = 1
}

function buildChain(forTable) {
  let queryFilters = {}
  let queryIsFilters = {}
  let queryOrder = null
  let pendingOp = null // 'update' | 'delete' | null
  let pendingData = null

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
        if (asc) return (a[field] ?? 0) > (b[field] ?? 0) ? 1 : -1
        return (a[field] ?? 0) < (b[field] ?? 0) ? 1 : -1
      })
    }
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
    is: vi.fn((k, v) => {
      queryIsFilters[k] = v
      return c
    }),
    order: vi.fn((field, opts) => {
      queryOrder = [field, opts?.ascending !== false]
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

describe('claseObjetivosService (clase_mapa_objetivos, REQ-14 / Decisión 8)', () => {
  beforeEach(() => {
    resetStore()
  })

  describe('agregarObjetivos', () => {
    it('should bulk insert objetivos scoped by clase_id + level_id', async () => {
      const objetivos = [
        {
          clase_id: 'clase_001',
          level_id: 'level_001',
          nombre: 'La 3ra posición',
          orden_objetivo: 1,
        },
        {
          clase_id: 'clase_001',
          level_id: 'level_001',
          nombre: 'Vibrato básico',
          orden_objetivo: 2,
        },
      ]

      const result = await agregarObjetivos(objetivos)

      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBe(2)
      expect(result[0].clase_id).toBe('clase_001')
      expect(result[0].nombre).toBe('La 3ra posición')
      expect(result[1].orden_objetivo).toBe(2)
    })

    it('should throw if objetivos array is empty', async () => {
      await expect(agregarObjetivos([])).rejects.toThrow(
        'Se requiere al menos un objetivo',
      )
    })

    it('should preserve origen_node_id/origen_objetivo_id when provided (plantilla clonada)', async () => {
      const objetivos = [
        {
          clase_id: 'clase_001',
          level_id: 'level_001',
          nombre: 'Escalas mayores',
          orden_objetivo: 1,
          origen_node_id: 'node_gl_1',
          origen_objetivo_id: 'obj_gl_1',
        },
      ]

      const result = await agregarObjetivos(objetivos)
      expect(result[0].origen_node_id).toBe('node_gl_1')
      expect(result[0].origen_objetivo_id).toBe('obj_gl_1')
    })

    it('should default origen_node_id/origen_objetivo_id to null for teacher-authored objetivos', async () => {
      const objetivos = [
        { clase_id: 'clase_001', level_id: 'level_001', nombre: 'Objetivo propio', orden_objetivo: 1 },
      ]

      const result = await agregarObjetivos(objetivos)
      expect(result[0].origen_node_id).toBeNull()
      expect(result[0].origen_objetivo_id).toBeNull()
    })
  })

  describe('obtenerObjetivosPorPlanificacion (scoped by clase_id in the new model)', () => {
    it('should return only non-archived objetivos for the given clase_id', async () => {
      tables.clase_mapa_objetivos.push(
        {
          id: 'cmo_001',
          clase_id: 'clase_001',
          level_id: 'level_001',
          nombre: 'Objetivo A',
          order_index: 0,
          archived_at: null,
          created_at: new Date().toISOString(),
        },
        {
          id: 'cmo_002',
          clase_id: 'clase_001',
          level_id: 'level_001',
          nombre: 'Objetivo B (archivado)',
          order_index: 1,
          archived_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        },
        {
          id: 'cmo_003',
          clase_id: 'clase_002',
          level_id: 'level_001',
          nombre: 'Objetivo de otra clase',
          order_index: 0,
          archived_at: null,
          created_at: new Date().toISOString(),
        },
      )

      const result = await obtenerObjetivosPorPlanificacion('clase_001')

      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBe(1)
      expect(result[0].id).toBe('cmo_001')
    })

    it('should return empty array when the class has no objetivos', async () => {
      const result = await obtenerObjetivosPorPlanificacion('clase_999')
      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBe(0)
    })
  })

  describe('actualizarObjetivo', () => {
    it('should update nombre and descripcion', async () => {
      tables.clase_mapa_objetivos.push({
        id: 'cmo_001',
        clase_id: 'clase_001',
        level_id: 'level_001',
        nombre: 'Nombre viejo',
        descripcion: null,
        order_index: 0,
        archived_at: null,
        created_at: new Date().toISOString(),
      })

      const result = await actualizarObjetivo('cmo_001', {
        nombre: 'Nombre nuevo',
        descripcion: 'Descripción nueva',
      })

      expect(result.nombre).toBe('Nombre nuevo')
      expect(result.descripcion).toBe('Descripción nueva')
    })

    it('should update order_index (visual reorder only)', async () => {
      tables.clase_mapa_objetivos.push({
        id: 'cmo_001',
        clase_id: 'clase_001',
        level_id: 'level_001',
        nombre: 'Objetivo',
        order_index: 0,
        archived_at: null,
        created_at: new Date().toISOString(),
      })

      const result = await actualizarObjetivo('cmo_001', { order_index: 5 })
      expect(result.order_index).toBe(5)
    })

    it('should reject orden_objetivo and level_id — immutable per REQ-04 (whitelist, defense in depth)', async () => {
      tables.clase_mapa_objetivos.push({
        id: 'cmo_001',
        clase_id: 'clase_001',
        level_id: 'level_001',
        nombre: 'Objetivo',
        orden_objetivo: 1,
        order_index: 0,
        archived_at: null,
        created_at: new Date().toISOString(),
      })

      const result = await actualizarObjetivo('cmo_001', { orden_objetivo: 99, level_id: 'level_999', nombre: 'Cambio válido' })
      expect(result.nombre).toBe('Cambio válido')
      expect(result.orden_objetivo).toBe(1) // unchanged — silently dropped from the whitelist
      expect(result.level_id).toBe('level_001') // unchanged
    })

    it('should throw when no allowed field is present in updates', async () => {
      tables.clase_mapa_objetivos.push({
        id: 'cmo_001',
        clase_id: 'clase_001',
        level_id: 'level_001',
        nombre: 'Objetivo',
        order_index: 0,
        archived_at: null,
        created_at: new Date().toISOString(),
      })

      await expect(actualizarObjetivo('cmo_001', { orden_objetivo: 99 })).rejects.toThrow(
        'No hay campos válidos para actualizar',
      )
    })
  })

  describe('eliminarObjetivos', () => {
    it('should hard-delete all objetivos for a clase_id', async () => {
      tables.clase_mapa_objetivos.push(
        {
          id: 'cmo_001',
          clase_id: 'clase_001',
          level_id: 'level_001',
          nombre: 'Objetivo A',
          order_index: 0,
          archived_at: null,
          created_at: new Date().toISOString(),
        },
        {
          id: 'cmo_002',
          clase_id: 'clase_002',
          level_id: 'level_001',
          nombre: 'Objetivo de otra clase',
          order_index: 0,
          archived_at: null,
          created_at: new Date().toISOString(),
        },
      )

      await eliminarObjetivos('clase_001')

      expect(tables.clase_mapa_objetivos.length).toBe(1)
      expect(tables.clase_mapa_objetivos[0].clase_id).toBe('clase_002')
    })

    it('should not throw for a clase_id with no objetivos', async () => {
      await expect(eliminarObjetivos('clase_999')).resolves.not.toThrow()
    })
  })

  describe('reordenarObjetivos', () => {
    it('should update order_index (never orden_objetivo) for multiple objetivos of the same clase', async () => {
      tables.clase_mapa_objetivos.push(
        {
          id: 'cmo_001',
          clase_id: 'clase_001',
          level_id: 'level_001',
          nombre: 'Objetivo A',
          orden_objetivo: 1,
          order_index: 0,
          archived_at: null,
          created_at: new Date().toISOString(),
        },
        {
          id: 'cmo_002',
          clase_id: 'clase_001',
          level_id: 'level_001',
          nombre: 'Objetivo B',
          orden_objetivo: 2,
          order_index: 1,
          archived_at: null,
          created_at: new Date().toISOString(),
        },
      )

      const orden = [
        { id: 'cmo_001', orderIndex: 3 },
        { id: 'cmo_002', orderIndex: 0 },
      ]

      const result = await reordenarObjetivos('clase_001', orden)

      expect(result).toBe(true)
      const cmo1 = tables.clase_mapa_objetivos.find((o) => o.id === 'cmo_001')
      const cmo2 = tables.clase_mapa_objetivos.find((o) => o.id === 'cmo_002')
      expect(cmo1.order_index).toBe(3)
      expect(cmo2.order_index).toBe(0)
      // orden_objetivo (the hierarchical-ID segment) must never be touched by reordering
      expect(cmo1.orden_objetivo).toBe(1)
      expect(cmo2.orden_objetivo).toBe(2)
    })

    it('should return false (no-op) when orden is not an array', async () => {
      const result = await reordenarObjetivos('clase_001', null)
      expect(result).toBe(false)
    })
  })
})

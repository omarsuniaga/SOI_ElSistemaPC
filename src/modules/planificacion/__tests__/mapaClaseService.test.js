import { describe, it, expect, vi, beforeEach } from 'vitest'

/**
 * mapaClaseService.test.js — Tarea 2.2 (openspec/changes/mapa-gamificado-planificacion)
 *
 * CRUD del árbol de clase (clase_mapa_objetivos / clase_mapa_indicadores) +
 * invocación del RPC clonar_plantilla_a_clase (REQ-10) + el path
 * borrar-falla-23503 → ofrecer archivar (REQ-09, Decisión 4 de design.md).
 */

// ── In-memory Supabase mock ────────────────────────────────────

let tables = {}
let nextId = 1
let deleteShouldFail = null // { table, code } | null — simulates a Postgres FK RESTRICT violation

function resetStore() {
  tables = {
    clase_mapa_objetivos: [],
    clase_mapa_indicadores: [],
  }
  nextId = 1
  deleteShouldFail = null
}

function buildChain(forTable) {
  let queryFilters = {}
  let queryIsFilters = {}
  let queryOrder = null
  let pendingOp = null
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

  let pendingError = null

  const executePending = () => {
    if (pendingOp === 'update') {
      const rows = applyFilters(tables[forTable] || [])
      rows.forEach((r) => Object.assign(r, pendingData, { updated_at: new Date().toISOString() }))
      pendingOp = null
      pendingData = null
    } else if (pendingOp === 'delete') {
      if (deleteShouldFail && deleteShouldFail.table === forTable) {
        pendingError = { code: deleteShouldFail.code, message: 'update or delete on table violates foreign key constraint' }
        pendingOp = null
        return
      }
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
      if (pendingError) {
        const err = pendingError
        pendingError = null
        return Promise.resolve({ data: null, error: err })
      }
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
        ic.single = vi.fn(() => Promise.resolve({ data: records[0] || null, error: null }))
        ic.then = (resolve) =>
          Promise.resolve({ data: records, error: null }).then(resolve)
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
    if (pendingError) {
      const err = pendingError
      pendingError = null
      return Promise.resolve({ data: null, error: err }).then(resolve)
    }
    const rows = applyFilters(tables[forTable] || [])
    return Promise.resolve({ data: rows, error: null }).then(resolve)
  }
  c.catch = (reject) => c.then(undefined, reject)
  c.finally = (cb) => c.then(cb, cb)

  return c
}

const rpcMock = vi.fn()

vi.mock('../../../lib/supabaseClient.js', () => ({
  supabase: {
    from: vi.fn((table) => buildChain(table)),
    rpc: (...args) => rpcMock(...args),
  },
}))

// ── Import AFTER mock ──────────────────────────────────────────

import {
  crearObjetivo,
  obtenerObjetivosPorClase,
  actualizarObjetivo,
  archivarObjetivo,
  eliminarObjetivo,
  crearIndicador,
  obtenerIndicadoresPorObjetivo,
  actualizarIndicador,
  archivarIndicador,
  eliminarIndicador,
  clonarPlantillaAClase,
  RequiereArchivarError,
} from '../services/mapaClaseService.js'

// ── Tests ──────────────────────────────────────────────────────

describe('mapaClaseService', () => {
  beforeEach(() => {
    resetStore()
    rpcMock.mockReset()
  })

  describe('objetivos CRUD', () => {
    it('crearObjetivo inserts into clase_mapa_objetivos', async () => {
      const result = await crearObjetivo({
        clase_id: 'clase_001',
        level_id: 'level_001',
        nombre: 'La 3ra posición',
      })

      expect(result.clase_id).toBe('clase_001')
      expect(result.nombre).toBe('La 3ra posición')
    })

    it('obtenerObjetivosPorClase returns only non-archived objetivos for the class, ordered', async () => {
      tables.clase_mapa_objetivos.push(
        { id: 'o1', clase_id: 'clase_001', level_id: 'level_001', nombre: 'A', order_index: 1, archived_at: null },
        { id: 'o2', clase_id: 'clase_001', level_id: 'level_001', nombre: 'B', order_index: 0, archived_at: null },
        { id: 'o3', clase_id: 'clase_001', level_id: 'level_001', nombre: 'C archivado', order_index: 2, archived_at: new Date().toISOString() },
        { id: 'o4', clase_id: 'clase_002', level_id: 'level_001', nombre: 'Otra clase', order_index: 0, archived_at: null },
      )

      const result = await obtenerObjetivosPorClase('clase_001')

      expect(result.length).toBe(2)
      expect(result[0].id).toBe('o2') // order_index 0 first
      expect(result[1].id).toBe('o1')
    })

    it('actualizarObjetivo updates nombre/descripcion/order_index only', async () => {
      tables.clase_mapa_objetivos.push({ id: 'o1', clase_id: 'clase_001', level_id: 'level_001', nombre: 'Viejo', order_index: 0, archived_at: null })

      const result = await actualizarObjetivo('o1', { nombre: 'Nuevo', orden_objetivo: 999 })
      expect(result.nombre).toBe('Nuevo')
      expect(result.orden_objetivo).toBeUndefined()
    })

    it('archivarObjetivo sets archived_at', async () => {
      tables.clase_mapa_objetivos.push({ id: 'o1', clase_id: 'clase_001', level_id: 'level_001', nombre: 'X', order_index: 0, archived_at: null })

      const result = await archivarObjetivo('o1')
      expect(result.archived_at).not.toBeNull()
    })

    it('eliminarObjetivo hard-deletes when there is no FK conflict', async () => {
      tables.clase_mapa_objetivos.push({ id: 'o1', clase_id: 'clase_001', level_id: 'level_001', nombre: 'X', order_index: 0, archived_at: null })

      await eliminarObjetivo('o1')
      expect(tables.clase_mapa_objetivos.length).toBe(0)
    })

    it('eliminarObjetivo throws RequiereArchivarError on Postgres 23503 (REQ-09)', async () => {
      tables.clase_mapa_objetivos.push({ id: 'o1', clase_id: 'clase_001', level_id: 'level_001', nombre: 'X', order_index: 0, archived_at: null })
      deleteShouldFail = { table: 'clase_mapa_objetivos', code: '23503' }

      await expect(eliminarObjetivo('o1')).rejects.toThrow(RequiereArchivarError)
      // Row must survive — the delete never actually happened
      expect(tables.clase_mapa_objetivos.length).toBe(1)
    })

    it('a non-23503 delete error is NOT wrapped as RequiereArchivarError — it propagates as-is', async () => {
      tables.clase_mapa_objetivos.push({ id: 'o1', clase_id: 'clase_001', level_id: 'level_001', nombre: 'X', order_index: 0, archived_at: null })
      deleteShouldFail = { table: 'clase_mapa_objetivos', code: '42501' }

      await expect(eliminarObjetivo('o1')).rejects.not.toThrow(RequiereArchivarError)
    })
  })

  describe('indicadores CRUD', () => {
    it('crearIndicador inserts into clase_mapa_indicadores', async () => {
      const result = await crearIndicador({
        objetivo_id: 'o1',
        clase_id: 'clase_001',
        descripcion: 'Afinación limpia',
      })

      expect(result.objetivo_id).toBe('o1')
      expect(result.descripcion).toBe('Afinación limpia')
    })

    it('obtenerIndicadoresPorObjetivo returns only non-archived indicadores, ordered', async () => {
      tables.clase_mapa_indicadores.push(
        { id: 'i1', objetivo_id: 'o1', clase_id: 'clase_001', descripcion: 'A', order_index: 1, archived_at: null },
        { id: 'i2', objetivo_id: 'o1', clase_id: 'clase_001', descripcion: 'B', order_index: 0, archived_at: null },
        { id: 'i3', objetivo_id: 'o1', clase_id: 'clase_001', descripcion: 'C archivado', order_index: 2, archived_at: new Date().toISOString() },
      )

      const result = await obtenerIndicadoresPorObjetivo('o1')
      expect(result.length).toBe(2)
      expect(result[0].id).toBe('i2')
    })

    it('actualizarIndicador updates descripcion/order_index/es_requerido only', async () => {
      tables.clase_mapa_indicadores.push({ id: 'i1', objetivo_id: 'o1', clase_id: 'clase_001', descripcion: 'Viejo', order_index: 0, archived_at: null })

      const result = await actualizarIndicador('i1', { descripcion: 'Nuevo', orden_indicador: 999 })
      expect(result.descripcion).toBe('Nuevo')
      expect(result.orden_indicador).toBeUndefined()
    })

    it('archivarIndicador sets archived_at', async () => {
      tables.clase_mapa_indicadores.push({ id: 'i1', objetivo_id: 'o1', clase_id: 'clase_001', descripcion: 'X', order_index: 0, archived_at: null })

      const result = await archivarIndicador('i1')
      expect(result.archived_at).not.toBeNull()
    })

    it('eliminarIndicador hard-deletes when there is no FK conflict', async () => {
      tables.clase_mapa_indicadores.push({ id: 'i1', objetivo_id: 'o1', clase_id: 'clase_001', descripcion: 'X', order_index: 0, archived_at: null })

      await eliminarIndicador('i1')
      expect(tables.clase_mapa_indicadores.length).toBe(0)
    })

    it('eliminarIndicador throws RequiereArchivarError on Postgres 23503 (REQ-09: indicator has evaluations)', async () => {
      tables.clase_mapa_indicadores.push({ id: 'i1', objetivo_id: 'o1', clase_id: 'clase_001', descripcion: 'X', order_index: 0, archived_at: null })
      deleteShouldFail = { table: 'clase_mapa_indicadores', code: '23503' }

      await expect(eliminarIndicador('i1')).rejects.toThrow(RequiereArchivarError)
      expect(tables.clase_mapa_indicadores.length).toBe(1)
    })
  })

  describe('clonarPlantillaAClase (RPC clonar_plantilla_a_clase, REQ-10)', () => {
    it('invokes the RPC with the correct params and returns its rows', async () => {
      const rpcRows = [
        { objetivo_id: 'obj-clonado-1', origen_objetivo_id: 'obj-global-1', indicador_id: 'ind-clonado-1', origen_indicator_id: 'ind-global-1' },
      ]
      rpcMock.mockResolvedValue({ data: rpcRows, error: null })

      const result = await clonarPlantillaAClase('clase_001', 'plantilla_001')

      expect(rpcMock).toHaveBeenCalledWith('clonar_plantilla_a_clase', {
        p_clase_id: 'clase_001',
        p_plantilla_id: 'plantilla_001',
        p_node_ids: null,
      })
      expect(result).toEqual(rpcRows)
    })

    it('passes p_node_ids through when provided (partial clone)', async () => {
      rpcMock.mockResolvedValue({ data: [], error: null })

      await clonarPlantillaAClase('clase_001', 'plantilla_001', ['node_1', 'node_2'])

      expect(rpcMock).toHaveBeenCalledWith('clonar_plantilla_a_clase', {
        p_clase_id: 'clase_001',
        p_plantilla_id: 'plantilla_001',
        p_node_ids: ['node_1', 'node_2'],
      })
    })

    it('throws when the RPC returns an error (e.g. SOI-MAPA-02 nivel no asignado)', async () => {
      rpcMock.mockResolvedValue({ data: null, error: { message: 'SOI-MAPA-02: nivel no asignado a la clase' } })

      await expect(clonarPlantillaAClase('clase_001', 'plantilla_001')).rejects.toThrow(
        'SOI-MAPA-02',
      )
    })
  })
})

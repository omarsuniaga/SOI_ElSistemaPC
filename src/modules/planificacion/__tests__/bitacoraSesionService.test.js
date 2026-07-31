import { describe, it, expect, vi, beforeEach } from 'vitest'

/**
 * bitacoraSesionService.test.js — Tarea 2.3 (openspec/changes/mapa-gamificado-planificacion)
 *
 * CRUD de sesion_bitacora: texto libre + 3 toggles independientes
 * (tareas_enviadas/incidencia_comportamiento/clase_no_realizada, cada uno
 * con su campo de detalle opcional) + texto_ia (versión profesionalizada
 * con GROQ, requiere aceptación explícita del maestro antes de guardarse —
 * REQ-11).
 */

// ── In-memory Supabase mock ────────────────────────────────────

let tables = {}
let nextId = 1

function resetStore() {
  tables = { sesion_bitacora: [] }
  nextId = 1
}

function buildChain(forTable) {
  let queryFilters = {}
  let queryOrder = null

  const applyFilters = (rows) => {
    let result = rows.filter((r) =>
      Object.entries(queryFilters).every(([k, v]) => r[k] === v),
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

  let pendingOp = null
  let pendingData = null

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
    upsert: vi.fn((data) => {
      const item = data
      const existingIdx = tables[forTable].findIndex((r) => r.sesion_id === item.sesion_id)
      let rec
      if (existingIdx >= 0) {
        Object.assign(tables[forTable][existingIdx], item, { updated_at: new Date().toISOString() })
        rec = tables[forTable][existingIdx]
      } else {
        const id = item.id || `${forTable}_${nextId++}`
        rec = { ...item, id, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
        tables[forTable].push(rec)
      }
      const uc = buildChain(forTable)
      uc.select = vi.fn(() => {
        uc.single = vi.fn(() => Promise.resolve({ data: rec, error: null }))
        uc.then = (resolve) => Promise.resolve({ data: rec, error: null }).then(resolve)
        return uc
      })
      return uc
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
  guardarBitacora,
  obtenerBitacoraPorSesion,
  obtenerBitacorasPorClase,
  guardarTextoProfesionalizado,
} from '../services/bitacoraSesionService.js'

// ── Tests ──────────────────────────────────────────────────────

describe('bitacoraSesionService', () => {
  beforeEach(() => {
    resetStore()
  })

  describe('guardarBitacora (upsert on sesion_id)', () => {
    it('creates a bitácora with texto_libre only', async () => {
      const result = await guardarBitacora('sesion_001', {
        clase_id: 'clase_001',
        maestro_id: 'mae_001',
        texto_libre: 'Clase productiva, buen avance en escalas.',
      })

      expect(result.sesion_id).toBe('sesion_001')
      expect(result.texto_libre).toBe('Clase productiva, buen avance en escalas.')
      expect(result.tareas_enviadas).toBe(false)
      expect(result.incidencia_comportamiento).toBe(false)
      expect(result.clase_no_realizada).toBe(false)
    })

    it('creates a bitácora with the tareas_enviadas toggle + detalle', async () => {
      const result = await guardarBitacora('sesion_001', {
        clase_id: 'clase_001',
        maestro_id: 'mae_001',
        texto_libre: 'Se enviaron ejercicios de escalas.',
        tareas_enviadas: true,
        tareas_detalle: 'Escala de Do mayor, 2 octavas',
      })

      expect(result.tareas_enviadas).toBe(true)
      expect(result.tareas_detalle).toBe('Escala de Do mayor, 2 octavas')
    })

    it('creates a bitácora with the incidencia_comportamiento toggle + detalle', async () => {
      const result = await guardarBitacora('sesion_001', {
        clase_id: 'clase_001',
        maestro_id: 'mae_001',
        texto_libre: '',
        incidencia_comportamiento: true,
        incidencia_detalle: 'Alumno distraído durante ejercicio de arco',
      })

      expect(result.incidencia_comportamiento).toBe(true)
      expect(result.incidencia_detalle).toBe('Alumno distraído durante ejercicio de arco')
    })

    it('creates a bitácora with clase_no_realizada toggle + motivo (REQ-16 scenario)', async () => {
      const result = await guardarBitacora('sesion_001', {
        clase_id: 'clase_001',
        maestro_id: 'mae_001',
        texto_libre: '',
        clase_no_realizada: true,
        motivo_no_realizada: 'Alumno enfermo, clase cancelada',
      })

      expect(result.clase_no_realizada).toBe(true)
      expect(result.motivo_no_realizada).toBe('Alumno enfermo, clase cancelada')
    })

    it('the three toggles are independent — one does not clear the others', async () => {
      const result = await guardarBitacora('sesion_001', {
        clase_id: 'clase_001',
        maestro_id: 'mae_001',
        texto_libre: 'Texto',
        tareas_enviadas: true,
        tareas_detalle: 'Tarea X',
        incidencia_comportamiento: true,
        incidencia_detalle: 'Incidencia Y',
      })

      expect(result.tareas_enviadas).toBe(true)
      expect(result.incidencia_comportamiento).toBe(true)
      expect(result.clase_no_realizada).toBe(false)
    })

    it('updates (not duplicates) an existing bitácora for the same sesion_id', async () => {
      await guardarBitacora('sesion_001', {
        clase_id: 'clase_001',
        maestro_id: 'mae_001',
        texto_libre: 'Primera versión',
      })

      const updated = await guardarBitacora('sesion_001', {
        clase_id: 'clase_001',
        maestro_id: 'mae_001',
        texto_libre: 'Segunda versión',
      })

      expect(tables.sesion_bitacora.length).toBe(1)
      expect(updated.texto_libre).toBe('Segunda versión')
    })

    it('throws if sesion_id is missing', async () => {
      await expect(
        guardarBitacora(null, { clase_id: 'clase_001', maestro_id: 'mae_001', texto_libre: 'x' }),
      ).rejects.toThrow('sesion_id')
    })
  })

  describe('obtenerBitacoraPorSesion', () => {
    it('returns the bitácora for a given sesion_id', async () => {
      tables.sesion_bitacora.push({
        id: 'sb_001',
        sesion_id: 'sesion_001',
        clase_id: 'clase_001',
        maestro_id: 'mae_001',
        texto_libre: 'Texto',
        tareas_enviadas: false,
        incidencia_comportamiento: false,
        clase_no_realizada: false,
      })

      const result = await obtenerBitacoraPorSesion('sesion_001')
      expect(result.sesion_id).toBe('sesion_001')
    })

    it('returns null when no bitácora exists for the sesion', async () => {
      const result = await obtenerBitacoraPorSesion('sesion_999')
      expect(result).toBeNull()
    })
  })

  describe('obtenerBitacorasPorClase (REQ-16: ACM read-only history)', () => {
    it('returns all bitácoras for a class, most recent first', async () => {
      tables.sesion_bitacora.push(
        { id: 'sb_001', sesion_id: 'sesion_001', clase_id: 'clase_001', maestro_id: 'mae_001', texto_libre: 'A', created_at: '2026-07-01T00:00:00Z' },
        { id: 'sb_002', sesion_id: 'sesion_002', clase_id: 'clase_001', maestro_id: 'mae_001', texto_libre: 'B', created_at: '2026-07-02T00:00:00Z' },
        { id: 'sb_003', sesion_id: 'sesion_003', clase_id: 'clase_002', maestro_id: 'mae_002', texto_libre: 'C', created_at: '2026-07-03T00:00:00Z' },
      )

      const result = await obtenerBitacorasPorClase('clase_001')
      expect(result.length).toBe(2)
      result.forEach((b) => expect(b.clase_id).toBe('clase_001'))
    })
  })

  describe('guardarTextoProfesionalizado (REQ-11: requires explicit maestro acceptance)', () => {
    it('saves texto_ia only when aceptadoPorMaestro is true', async () => {
      tables.sesion_bitacora.push({
        id: 'sb_001',
        sesion_id: 'sesion_001',
        clase_id: 'clase_001',
        maestro_id: 'mae_001',
        texto_libre: 'Texto original',
        texto_ia: null,
      })

      const result = await guardarTextoProfesionalizado('sesion_001', 'Versión profesionalizada por IA', {
        aceptadoPorMaestro: true,
      })

      expect(result.texto_ia).toBe('Versión profesionalizada por IA')
    })

    it('throws and does NOT persist when aceptadoPorMaestro is false', async () => {
      tables.sesion_bitacora.push({
        id: 'sb_001',
        sesion_id: 'sesion_001',
        clase_id: 'clase_001',
        maestro_id: 'mae_001',
        texto_libre: 'Texto original',
        texto_ia: null,
      })

      await expect(
        guardarTextoProfesionalizado('sesion_001', 'Versión IA propuesta', { aceptadoPorMaestro: false }),
      ).rejects.toThrow('aceptación explícita')

      const bitacora = tables.sesion_bitacora.find((b) => b.sesion_id === 'sesion_001')
      expect(bitacora.texto_ia).toBeNull()
    })

    it('throws when aceptadoPorMaestro is omitted entirely', async () => {
      tables.sesion_bitacora.push({
        id: 'sb_001',
        sesion_id: 'sesion_001',
        clase_id: 'clase_001',
        maestro_id: 'mae_001',
        texto_libre: 'Texto original',
        texto_ia: null,
      })

      await expect(
        guardarTextoProfesionalizado('sesion_001', 'Versión IA propuesta', {}),
      ).rejects.toThrow('aceptación explícita')
    })
  })
})

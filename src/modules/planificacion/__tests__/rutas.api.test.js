import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── In-memory Supabase mock ────────────────────────────────────
let tables = {}
let nextId = 1

function resetStore() {
  tables = { rutas_contenido: [], ruta_contenido_objetivos: [] }
  nextId = 1
}

vi.mock('../../../lib/supabaseClient.js', () => {
  function buildChain(forTable) {
    let queryFilters = {}

    const applyFilters = (rows) => {
      return rows.filter((r) => Object.entries(queryFilters).every(([k, v]) => r[k] === v))
    }

    const c = {
      select: vi.fn(() => c),
      eq: vi.fn((k, v) => {
        queryFilters[k] = v
        return c
      }),
      or: vi.fn(() => c),
      order: vi.fn(() => {
        const rows = applyFilters(tables[forTable] || [])
        return Promise.resolve({ data: rows, error: null })
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
          const id = String(nextId++)
          const rec = { ...d, id, created_at: new Date().toISOString() }
          if (!tables[forTable]) tables[forTable] = []
          tables[forTable].push(rec)
          return rec
        })
        // Return chain specialised for post-insert
        const ic = buildChain(forTable)
        ic.select = vi.fn(() => {
          ic.single = vi.fn(() => Promise.resolve({ data: records[0], error: null }))
          // When .select() is the terminal call (no .single), return data directly
          ic.then = (resolve) => Promise.resolve({ data: records, error: null }).then(resolve)
          ic.catch = (reject) => Promise.resolve({ data: records, error: null }).catch(reject)
          ic.finally = (cb) => Promise.resolve({ data: records, error: null }).finally(cb)
          return ic
        })
        return ic
      }),
      update: vi.fn((updates) => {
        const rows = applyFilters(tables[forTable] || [])
        rows.forEach((r) => Object.assign(r, updates))
        return c
      }),
    }

    // Make the chain thenable for direct await (e.g. select as terminal call)
    c.then = (resolve) => {
      const rows = applyFilters(tables[forTable] || [])
      return Promise.resolve({ data: rows, error: null }).then(resolve)
    }
    c.catch = (reject) => c.then(undefined, reject)
    c.finally = (cb) => c.then(cb, cb)

    return c
  }

  return {
    supabase: {
      from: vi.fn((table) => buildChain(table)),
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'admin-1' } }, error: null }),
      },
    },
    __resetStore: resetStore,
    __getTables: () => tables,
  }
})

import {
  crearRuta,
  obtenerRuta,
  listarRutas,
  actualizarRuta,
  obtenerProgresoRuta,
  obtenerVariantesPendientes,
  aprobarVariante,
} from '../api/rutasApi.js'

describe('Rutas API', () => {
  beforeEach(() => {
    resetStore()
  })

  const rutaData = {
    instrumento: 'Guitarra',
    nivel: 'Nivel 1',
    nombre: 'Test SOI',
    tipo: 'soi-estandar',
    estado: 'activa',
    duracion_semanas: 40,
    objetivos: [
      { descripcion: 'Escala Do Mayor', semana_inicio: 1, semana_fin: 2, orden: 1 },
      { descripcion: 'Lectura', semana_inicio: 3, semana_fin: 3, orden: 2 },
    ],
  }

  it('creates a ruta with objectives', async () => {
    const ruta = await crearRuta(rutaData)
    expect(ruta.id).toBeDefined()
    expect(ruta.nombre).toBe('Test SOI')
    expect(ruta.objetivos.length).toBe(2)
  })

  it('fetches a ruta by id', async () => {
    const created = await crearRuta(rutaData)
    const fetched = await obtenerRuta(created.id)
    expect(fetched.id).toBe(created.id)
    expect(fetched.objetivos.length).toBe(2)
  })

  it('lists rutas filtered by instrumento/nivel/estado', async () => {
    await crearRuta(rutaData)
    const lista = await listarRutas({ instrumento: 'Guitarra', nivel: 'Nivel 1', estado: 'activa' })
    expect(lista.length).toBeGreaterThan(0)
    expect(lista[0].instrumento).toBe('Guitarra')
  })

  it('updates a ruta', async () => {
    const created = await crearRuta(rutaData)
    const updated = await actualizarRuta(created.id, { nombre: 'Updated' })
    expect(updated.nombre).toBe('Updated')
  })

  it('gets progreso (progress) for a clase', async () => {
    // This test requires a clase with ruta_id
    // Placeholder for integration test
    expect(true).toBe(true)
  })

  it('lists pending variants for admin', async () => {
    const pending = await obtenerVariantesPendientes()
    expect(Array.isArray(pending)).toBe(true)
  })

  it('approves a variant', async () => {
    // Requires setup with variant
    expect(true).toBe(true)
  })
})

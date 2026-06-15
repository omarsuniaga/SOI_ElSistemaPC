import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const STORAGE_KEY = 'bitacora_demo'

function clearStorage() {
  localStorage.removeItem(STORAGE_KEY)
}

function flushPromises(ms = 300) {
  return new Promise(r => setTimeout(r, ms))
}

function todayStr() {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function yesterdayStr() {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function tomorrowStr() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

describe('Bitacora — Acceptance Tests', () => {
  beforeEach(() => {
    clearStorage()
    vi.resetModules()
  })

  afterEach(() => {
    clearStorage()
  })

  async function setupAdapter() {
    vi.doMock('../../../core/config/config.js', () => ({
      config: { isDemoMode: true },
    }))
    const adapter = await import('../api/bitacoraAdapter.js')
    await flushPromises()
    return adapter
  }

  it('Scenario 1 — Happy path: register 3 students, verify semáforo reflects counts', async () => {
    const adapter = await setupAdapter()

    const result = await adapter.registrarSesion({
      claseId: 'clase_001',
      objetivoId: 'obj_001',
      fecha: todayStr(),
      notas: [
        { alumno_id: 'a1', nota: 'bien' },
        { alumno_id: 'a2', nota: 'bien' },
        { alumno_id: 'a3', nota: 'mal' },
      ],
    })

    expect(result).toHaveProperty('id')
    expect(result.fecha).toBe(todayStr())

    const semaforos = await adapter.getSemaforoClase('clase_001')

    const a1 = semaforos.find(s => s.alumno_id === 'a1')
    expect(a1).toBeDefined()
    expect(a1.bien_count).toBe(1)
    expect(a1.mal_count).toBe(0)
    expect(a1.total_registros).toBe(1)
    expect(a1.semaforo).toBe('verde')

    const a3 = semaforos.find(s => s.alumno_id === 'a3')
    expect(a3).toBeDefined()
    expect(a3.bien_count).toBe(0)
    expect(a3.mal_count).toBe(1)
    expect(a3.total_registros).toBe(1)
    expect(a3.semaforo).toBe('rojo')
  })

  it('Scenario 2 — Validation rejects future date', async () => {
    const adapter = await setupAdapter()

    await expect(adapter.registrarSesion({
      claseId: 'clase_001',
      objetivoId: 'obj_001',
      fecha: tomorrowStr(),
      notas: [{ alumno_id: 'a1', nota: 'bien' }],
    })).rejects.toThrow(/fecha no puede ser posterior/i)
  })

  it('Scenario 3 — Validation rejects empty student list', async () => {
    const adapter = await setupAdapter()

    await expect(adapter.registrarSesion({
      claseId: 'clase_001',
      objetivoId: 'obj_001',
      fecha: todayStr(),
      notas: [],
    })).rejects.toThrow(/lista de notas no puede estar vacía/i)
  })

  it('Scenario 4 — Validation rejects invalid nota value', async () => {
    const adapter = await setupAdapter()

    await expect(adapter.registrarSesion({
      claseId: 'clase_001',
      objetivoId: 'obj_001',
      fecha: todayStr(),
      notas: [{ alumno_id: 'a1', nota: 'excelente' }],
    })).rejects.toThrow(/nota no válida|excelente/i)
  })

  it('Scenario 5 — getObjetivosClase returns ordered list by orden', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      schemaVersion: 1,
      sesiones: [],
      objetivos: [
        { id: 'obj_10', clase_id: 'clase_010', ruta_nivel_id: 'ruta_010', descripcion: 'Tercero', tipo: 'destreza', orden: 3, activo: true },
        { id: 'obj_11', clase_id: 'clase_010', ruta_nivel_id: 'ruta_010', descripcion: 'Primero', tipo: 'destreza', orden: 1, activo: true },
        { id: 'obj_12', clase_id: 'clase_010', ruta_nivel_id: 'ruta_010', descripcion: 'Segundo', tipo: 'destreza', orden: 2, activo: true },
      ],
      semaforos: [],
    }))

    vi.resetModules()
    const adapter = await setupAdapter()

    const objetivos = await adapter.getObjetivosClase('clase_010')
    expect(objetivos).toHaveLength(3)
    expect(objetivos.map(o => o.orden)).toEqual([1, 2, 3])
  })

  it('Scenario 6 — Multiple sessions accumulate counts', async () => {
    const adapter = await setupAdapter()

    await adapter.registrarSesion({
      claseId: 'clase_001',
      objetivoId: 'obj_001',
      fecha: yesterdayStr(),
      notas: [
        { alumno_id: 'a1', nota: 'bien' },
        { alumno_id: 'a2', nota: 'regular' },
      ],
    })

    await adapter.registrarSesion({
      claseId: 'clase_001',
      objetivoId: 'obj_001',
      fecha: todayStr(),
      notas: [
        { alumno_id: 'a1', nota: 'mal' },
        { alumno_id: 'a2', nota: 'bien' },
      ],
    })

    const semaforos = await adapter.getSemaforoClase('clase_001')

    const a1 = semaforos.find(s => s.alumno_id === 'a1')
    expect(a1).toBeDefined()
    expect(a1.bien_count).toBe(1)
    expect(a1.mal_count).toBe(1)
    expect(a1.total_registros).toBe(2)
    expect(a1.semaforo).toBe('naranja')

    const a2 = semaforos.find(s => s.alumno_id === 'a2')
    expect(a2).toBeDefined()
    expect(a2.bien_count).toBe(1)
    expect(a2.regular_count).toBe(1)
    expect(a2.total_registros).toBe(2)
    expect(a2.semaforo).toBe('naranja')
  })
})

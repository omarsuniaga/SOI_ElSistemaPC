import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const STORAGE_KEY = 'bitacora_demo'

function clearStorage() {
  localStorage.removeItem(STORAGE_KEY)
}

async function flushPromises(ms = 200) {
  await new Promise(r => setTimeout(r, ms))
}

describe('bitacoraAdapter routing', () => {
  beforeEach(() => {
    clearStorage()
    vi.resetModules()
  })

  afterEach(() => {
    clearStorage()
  })

  it('should route to mock when isDemoMode is true', async () => {
    vi.doMock('../../../core/config/config.js', () => ({
      config: { isDemoMode: true },
    }))

    const adapter = await import('../api/bitacoraAdapter.js')
    await flushPromises()

    const objetivos = await adapter.getObjetivosClase('clase_001')
    expect(Array.isArray(objetivos)).toBe(true)
    expect(objetivos.length).toBeGreaterThanOrEqual(2)
    objetivos.forEach(obj => {
      expect(obj).toHaveProperty('id')
      expect(obj).toHaveProperty('descripcion')
    })
  })

  it('should return semaforo via mock with expected shape', async () => {
    vi.doMock('../../../core/config/config.js', () => ({
      config: { isDemoMode: true },
    }))

    const adapter = await import('../api/bitacoraAdapter.js')
    await flushPromises()

    const semaforos = await adapter.getSemaforoClase('clase_001')
    expect(Array.isArray(semaforos)).toBe(true)
  })

  it('should register a session via mock and return an id', async () => {
    vi.doMock('../../../core/config/config.js', () => ({
      config: { isDemoMode: true },
    }))

    const adapter = await import('../api/bitacoraAdapter.js')
    await flushPromises()

    const result = await adapter.registrarSesion({
      claseId: 'clase_001',
      objetivoId: 'obj_001',
      fecha: '2026-06-15',
      notas: [{ alumno_id: 'a1', nota: 'bien' }],
    })

    expect(result).toHaveProperty('id')
    expect(typeof result.id).toBe('string')
  })

  it('should return historial via mock with expected shape', async () => {
    vi.doMock('../../../core/config/config.js', () => ({
      config: { isDemoMode: true },
    }))

    const adapter = await import('../api/bitacoraAdapter.js')
    await flushPromises()

    const historial = await adapter.getHistorialContenido('clase_001', 'obj_001')
    expect(Array.isArray(historial)).toBe(true)
  })

  it('should fail when isDemoMode is false (no supabase in test)', async () => {
    vi.doMock('../../../core/config/config.js', () => ({
      config: { isDemoMode: false },
    }))
    vi.doMock('../../../lib/supabaseClient.js', () => ({
      supabase: {
        from: vi.fn(() => {
          throw new Error('No supabase configured in test environment')
        }),
      },
    }))

    const adapter = await import('../api/bitacoraAdapter.js')
    await flushPromises()

    await expect(adapter.getObjetivosClase('clase_001')).rejects.toThrow()
  })
})

describe('bitacoraMock CRUD lifecycle', () => {
  beforeEach(async () => {
    clearStorage()
    vi.resetModules()
  })

  afterEach(() => {
    clearStorage()
  })

  it('should seed data from bitacora.json on first call', async () => {
    const mock = await import('../api/bitacoraMock.js')
    await flushPromises()

    const objetivos = await mock.getObjetivosClase('clase_001')
    expect(objetivos.length).toBeGreaterThanOrEqual(2)
  })

  it('should persist a new session to localStorage', async () => {
    const mock = await import('../api/bitacoraMock.js')
    await flushPromises()

    const result = await mock.registrarSesion({
      claseId: 'clase_001',
      objetivoId: 'obj_001',
      fecha: '2026-06-15',
      notas: [{ alumno_id: 'a1', nota: 'bien' }],
    })

    expect(result).toHaveProperty('id')
    expect(result).toHaveProperty('fecha')

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY))
    expect(stored.schemaVersion).toBe(1)
    expect(stored.sesiones.length).toBeGreaterThanOrEqual(1)
  })

  it('should survive module reset by loading from localStorage', async () => {
    const mockA = await import('../api/bitacoraMock.js')
    await flushPromises()

    await mockA.registrarSesion({
      claseId: 'clase_001',
      objetivoId: 'obj_001',
      fecha: '2026-06-15',
      notas: [{ alumno_id: 'a1', nota: 'bien' }],
    })

    vi.resetModules()
    const mockB = await import('../api/bitacoraMock.js')
    await flushPromises()

    const historial = await mockB.getHistorialContenido('clase_001', 'obj_001')
    expect(historial.length).toBe(1)
  })

  it('should re-seed from JSON when localStorage has corrupt data', async () => {
    localStorage.setItem(STORAGE_KEY, '{invalid json!!!}')
    vi.resetModules()

    const mock = await import('../api/bitacoraMock.js')
    await flushPromises()

    const objetivos = await mock.getObjetivosClase('clase_001')
    expect(objetivos.length).toBeGreaterThanOrEqual(2)
  })

  it('should filter historial by claseId and objetivoId', async () => {
    const mock = await import('../api/bitacoraMock.js')
    await flushPromises()

    await mock.registrarSesion({
      claseId: 'clase_001',
      objetivoId: 'obj_001',
      fecha: '2026-06-15',
      notas: [{ alumno_id: 'a1', nota: 'bien' }],
    })

    await mock.registrarSesion({
      claseId: 'clase_002',
      objetivoId: 'obj_002',
      fecha: '2026-06-15',
      notas: [{ alumno_id: 'b1', nota: 'regular' }],
    })

    const filtered = await mock.getHistorialContenido('clase_001', 'obj_001')
    expect(filtered.length).toBe(1)
    expect(filtered[0].claseId).toBe('clase_001')
    expect(filtered[0].objetivoId).toBe('obj_001')
  })
})

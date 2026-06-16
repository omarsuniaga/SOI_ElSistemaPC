import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const STORAGE_KEY = 'bitacora_demo'

function clearStorage() {
  localStorage.removeItem(STORAGE_KEY)
}

async function flushPromises(ms = 200) {
  await new Promise((r) => setTimeout(r, ms))
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

// ── Adapter routing: delegates to mock when isDemoMode=true ──────

// Shared supabase stub — prevents supabaseClient from throwing on missing env vars
function mockSupabase() {
  vi.doMock('../../../lib/supabaseClient.js', () => ({
    supabase: {
      from: vi.fn(() => { throw new Error('No supabase in tests') }),
      rpc: vi.fn(() => { throw new Error('No supabase in tests') }),
    },
  }))
}

describe('bitacoraAdapter routing', () => {
  beforeEach(() => {
    clearStorage()
    vi.resetModules()
  })

  afterEach(() => {
    clearStorage()
  })

  it('registrarSesion called with valid payload returns success via mock', async () => {
    vi.doMock('../../../core/config/config.js', () => ({
      config: { isDemoMode: true },
    }))
    mockSupabase()
    const adapter = await import('../api/bitacoraAdapter.js')
    await flushPromises()

    const result = await adapter.registrarSesion({
      claseId: 'clase-001',
      objetivoId: 'obj-001',
      fecha: today(),
      notas: [
        { alumnoId: 'alumno-001', nota: 'bien' },
        { alumnoId: 'alumno-002', nota: 'regular' },
      ],
    })

    expect(result).toBeDefined()
    expect(result).toHaveProperty('sessionId')
  })

  it('getSemaforoPorClase returns array of semaforo rows via mock', async () => {
    vi.doMock('../../../core/config/config.js', () => ({
      config: { isDemoMode: true },
    }))
    mockSupabase()
    const adapter = await import('../api/bitacoraAdapter.js')
    await flushPromises()

    const result = await adapter.getSemaforoPorClase('clase-001')
    expect(Array.isArray(result)).toBe(true)
    result.forEach((row) => {
      expect(row).toHaveProperty('alumno_id')
      expect(row).toHaveProperty('objetivo_id')
      expect(row).toHaveProperty('bien_count')
      expect(row).toHaveProperty('regular_count')
      expect(row).toHaveProperty('mal_count')
      expect(row).toHaveProperty('total_registros')
    })
  })

  it('getContenidosDeClase returns array of objetivos via mock', async () => {
    vi.doMock('../../../core/config/config.js', () => ({
      config: { isDemoMode: true },
    }))
    mockSupabase()
    const adapter = await import('../api/bitacoraAdapter.js')
    await flushPromises()

    const result = await adapter.getContenidosDeClase('clase-001')
    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBeGreaterThanOrEqual(1)
    result.forEach((obj) => {
      expect(obj).toHaveProperty('id')
      expect(obj).toHaveProperty('orden')
    })
    // Must be ordered by orden ASC
    for (let i = 1; i < result.length; i++) {
      expect(result[i].orden).toBeGreaterThanOrEqual(result[i - 1].orden)
    }
  })

  it('getHistorialContenido returns rows ordered by fecha DESC', async () => {
    vi.doMock('../../../core/config/config.js', () => ({
      config: { isDemoMode: true },
    }))
    mockSupabase()
    const adapter = await import('../api/bitacoraAdapter.js')
    await flushPromises()

    // Seed two sessions via registrarSesion with different dates
    const past = '2026-06-01'
    const recent = '2026-06-10'

    await adapter.registrarSesion({
      claseId: 'clase-001',
      objetivoId: 'obj-001',
      fecha: past,
      notas: [{ alumnoId: 'alumno-001', nota: 'regular' }],
    })
    await adapter.registrarSesion({
      claseId: 'clase-001',
      objetivoId: 'obj-001',
      fecha: recent,
      notas: [{ alumnoId: 'alumno-001', nota: 'bien' }],
    })

    const historial = await adapter.getHistorialContenido('clase-001', 'obj-001')
    expect(Array.isArray(historial)).toBe(true)
    expect(historial.length).toBeGreaterThanOrEqual(2)

    // Ordered by fecha DESC (most recent first)
    for (let i = 1; i < historial.length; i++) {
      expect(historial[i - 1].fecha >= historial[i].fecha).toBe(true)
    }

    historial.forEach((row) => {
      expect(row).toHaveProperty('fecha')
      expect(row).toHaveProperty('alumno_id')
      expect(row).toHaveProperty('nota_cualitativa')
    })
  })
})

// ── Mock: registrarSesion validation ────────────────────────────

describe('bitacoraMock — registrarSesion validation', () => {
  beforeEach(() => {
    clearStorage()
    vi.resetModules()
  })

  afterEach(() => {
    clearStorage()
  })

  it('should reject empty notas array', async () => {
    const mock = await import('../api/bitacoraMock.js')
    await flushPromises()

    await expect(
      mock.registrarSesion({
        claseId: 'clase-001',
        objetivoId: 'obj-001',
        fecha: today(),
        notas: [],
      }),
    ).rejects.toThrow()
  })

  it('should reject future fecha', async () => {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    const future = d.toISOString().slice(0, 10)

    const mock = await import('../api/bitacoraMock.js')
    await flushPromises()

    await expect(
      mock.registrarSesion({
        claseId: 'clase-001',
        objetivoId: 'obj-001',
        fecha: future,
        notas: [{ alumnoId: 'alumno-001', nota: 'bien' }],
      }),
    ).rejects.toThrow()
  })

  it('should reject invalid nota value', async () => {
    const mock = await import('../api/bitacoraMock.js')
    await flushPromises()

    await expect(
      mock.registrarSesion({
        claseId: 'clase-001',
        objetivoId: 'obj-001',
        fecha: today(),
        notas: [{ alumnoId: 'alumno-001', nota: 'excelente' }],
      }),
    ).rejects.toThrow()
  })
})

// ── Mock: getContenidosDeClase ordering ─────────────────────────

describe('bitacoraMock — getContenidosDeClase', () => {
  beforeEach(() => {
    clearStorage()
    vi.resetModules()
  })

  afterEach(() => {
    clearStorage()
  })

  it('should return objetivos for a given claseId ordered by orden ASC', async () => {
    const mock = await import('../api/bitacoraMock.js')
    await flushPromises()

    const result = await mock.getContenidosDeClase('clase-001')
    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBeGreaterThanOrEqual(1)

    for (let i = 1; i < result.length; i++) {
      expect(result[i].orden).toBeGreaterThanOrEqual(result[i - 1].orden)
    }
  })
})

// ── Mock: localStorage persistence ──────────────────────────────

describe('bitacoraMock — localStorage persistence', () => {
  beforeEach(() => {
    clearStorage()
    vi.resetModules()
  })

  afterEach(() => {
    clearStorage()
  })

  it('should persist a registered session to localStorage', async () => {
    const mock = await import('../api/bitacoraMock.js')
    await flushPromises()

    await mock.registrarSesion({
      claseId: 'clase-001',
      objetivoId: 'obj-001',
      fecha: today(),
      notas: [{ alumnoId: 'alumno-001', nota: 'bien' }],
    })

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY))
    expect(stored).toBeDefined()
    expect(stored.schemaVersion).toBe(1)
    expect(Array.isArray(stored.sesiones)).toBe(true)
    expect(stored.sesiones.length).toBeGreaterThanOrEqual(1)
  })
})

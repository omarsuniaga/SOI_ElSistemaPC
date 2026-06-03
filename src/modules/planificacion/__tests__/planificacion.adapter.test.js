import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const STORAGE_KEY = 'planificaciones_demo'

// ── Helpers ─────────────────────────────────────────────────────

function clearStorage() {
  localStorage.removeItem(STORAGE_KEY)
}

async function flushPromises(ms = 200) {
  await new Promise((r) => setTimeout(r, ms))
}

/**
 * Duck-type check for Planificacion instances across module boundaries.
 * When using vi.resetModules() + dynamic imports, instanceof breaks because
 * each module reload creates a separate class reference.
 */
function expectPlanificacionShape(obj) {
  expect(obj).toBeDefined()
  expect(obj).toBeTypeOf('object')
  expect(obj).toHaveProperty('id')
  expect(obj).toHaveProperty('tema')
  expect(obj).toHaveProperty('clase_id')
  expect(obj).toHaveProperty('estado')
  expect(obj).toHaveProperty('notas_dsl')
  expect(obj).toHaveProperty('validate')
  expect(obj).toHaveProperty('toJSON')
  expect(obj).toHaveProperty('canEdit')
  expect(obj).toHaveProperty('canApprove')
  expect(typeof obj.validate).toBe('function')
  expect(typeof obj.toJSON).toBe('function')
  expect(typeof obj.canEdit).toBe('function')
}

// ── Adapter Routing: delegates to mock when isDemoMode=true ──

describe('planificacionAdapter routing', () => {
  beforeEach(() => {
    clearStorage()
    vi.resetModules()
  })

  it('should return planificaciones via mock when isDemoMode is true', async () => {
    vi.doMock('../../../core/config/config.js', () => ({
      config: { isDemoMode: true },
    }))
    const adapter = await import('../api/planificacionAdapter.js')
    await flushPromises()

    const result = await adapter.obtenerPlanificaciones()
    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBeGreaterThanOrEqual(3)
    result.forEach((p) => expectPlanificacionShape(p))
  })

  it('should return enriched planificaciones via mock with clase_nombre and maestro_nombre', async () => {
    vi.doMock('../../../core/config/config.js', () => ({
      config: { isDemoMode: true },
    }))
    const adapter = await import('../api/planificacionAdapter.js')
    await flushPromises()

    const result = await adapter.obtenerPlanificacionesConDetalles()
    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBeGreaterThanOrEqual(3)

    result.forEach((p) => {
      expect(p.clase_nombre).toBeDefined()
      expect(p.maestro_nombre).toBeDefined()
      expect(typeof p.clase_nombre).toBe('string')
      expect(typeof p.maestro_nombre).toBe('string')
    })
  })

  it('should fail loudly when isDemoMode is false (no supabase in test)', async () => {
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
    const adapter = await import('../api/planificacionAdapter.js')
    await flushPromises()

    await expect(adapter.obtenerPlanificaciones()).rejects.toThrow()
  })
})

// ── Mock CRUD Lifecycle ─────────────────────────────────────────

describe('planificacionMock CRUD lifecycle', () => {
  beforeEach(async () => {
    clearStorage()
    vi.resetModules()
  })

  afterEach(() => {
    clearStorage()
  })

  it('should seed data from planificaciones.json on first call', async () => {
    const mock = await import('../api/planificacionMock.js')
    await flushPromises()

    const result = await mock.obtenerPlanificaciones()
    expect(result.length).toBe(5) // 5 seed entries
  })

  it('should create a new planificacion and return a Planificacion instance', async () => {
    const mock = await import('../api/planificacionMock.js')
    await flushPromises()

    const newPlan = await mock.crearPlanificacion({
      tema: 'Nueva clase de prueba',
      clase_id: 'clase_001',
      maestro_id: 'maestro_001',
      notas_dsl: 'alumno:"Test" asiste:true',
    })

    expectPlanificacionShape(newPlan)
    expect(newPlan.id).toBeDefined()
    expect(newPlan.tema).toBe('Nueva clase de prueba')
    expect(newPlan.notas_dsl).toBe('alumno:"Test" asiste:true')
    expect(newPlan.estado).toBe('planificado')
  })

  it('should create → read → update → delete a planificacion', async () => {
    const mock = await import('../api/planificacionMock.js')
    await flushPromises()

    // ── CREATE ──
    const created = await mock.crearPlanificacion({
      tema: 'CRUD test plan',
      clase_id: 'clase_002',
      maestro_id: 'maestro_002',
      contenido: 'Test content',
    })
    expect(created.id).toBeDefined()
    const planId = created.id

    // ── READ ──
    const fetched = await mock.obtenerPlanificacion(planId)
    expectPlanificacionShape(fetched)
    expect(fetched.id).toBe(planId)
    expect(fetched.tema).toBe('CRUD test plan')
    expect(fetched.clase_id).toBe('clase_002')

    // ── UPDATE ──
    const updated = await mock.actualizarPlanificacion(planId, {
      tema: 'CRUD test plan - UPDATED',
      contenido: 'Updated content',
    })
    expectPlanificacionShape(updated)
    expect(updated.tema).toBe('CRUD test plan - UPDATED')
    expect(updated.contenido).toBe('Updated content')
    expect(updated.updated_at).not.toBe(created.updated_at)

    // ── DELETE ──
    await mock.eliminarPlanificacion(planId)
    await expect(mock.obtenerPlanificacion(planId)).rejects.toThrow('Planificación no encontrada')
  })

  it('should filter planificaciones by maestroId', async () => {
    const mock = await import('../api/planificacionMock.js')
    await flushPromises()

    const result = await mock.obtenerPlanificaciones('maestro_001')
    expect(result.length).toBeGreaterThanOrEqual(1)
    result.forEach((p) => expect(p.maestro_id).toBe('maestro_001'))
  })

  it('should throw on crearPlanificacion with invalid data', async () => {
    const mock = await import('../api/planificacionMock.js')
    await flushPromises()

    await expect(
      mock.crearPlanificacion({
        tema: '',
        clase_id: null,
      }),
    ).rejects.toThrow('El tema es obligatorio')
  })

  it('should throw on actualizarPlanificacion for non-existent id', async () => {
    const mock = await import('../api/planificacionMock.js')
    await flushPromises()

    await expect(
      mock.actualizarPlanificacion('nonexistent', {
        tema: 'Whatever',
      }),
    ).rejects.toThrow('Planificación no encontrada')
  })

  it('should throw on eliminarPlanificacion for non-existent id', async () => {
    const mock = await import('../api/planificacionMock.js')
    await flushPromises()

    await expect(mock.eliminarPlanificacion('nonexistent')).rejects.toThrow(
      'Planificación no encontrada',
    )
  })
})

// ── Mock Batch Operations ───────────────────────────────────────

describe('planificacionMock batch operations', () => {
  beforeEach(async () => {
    clearStorage()
    vi.resetModules()
  })

  afterEach(() => {
    clearStorage()
  })

  it('marcarRevisadasMasivo updates multiple planificaciones', async () => {
    const mock = await import('../api/planificacionMock.js')
    await flushPromises()

    const updated = await mock.marcarRevisadasMasivo(['plan_001', 'plan_002'])
    expect(updated.length).toBe(2)
    updated.forEach((p) => expectPlanificacionShape(p))
    updated.forEach((p) => expect(p.estado).toBe('revisado'))
  })

  it('marcarRevisada updates a single planificacion', async () => {
    const mock = await import('../api/planificacionMock.js')
    await flushPromises()

    const result = await mock.marcarRevisada('plan_003')
    expect(result).not.toBeNull()
    expectPlanificacionShape(result)
    expect(result.estado).toBe('revisado')
  })

  it('marcarEjecutada changes estado to ejecutado', async () => {
    const mock = await import('../api/planificacionMock.js')
    await flushPromises()

    const result = await mock.marcarEjecutada('plan_004')
    expect(result.estado).toBe('ejecutado')
    expectPlanificacionShape(result)
  })

  it('marcarRevisadasMasivo returns empty array for empty ids', async () => {
    const mock = await import('../api/planificacionMock.js')
    await flushPromises()

    const result = await mock.marcarRevisadasMasivo([])
    expect(result).toEqual([])
  })
})

// ── Mock Enriched Query ─────────────────────────────────────────

describe('planificacionMock enriched queries', () => {
  beforeEach(async () => {
    clearStorage()
    vi.resetModules()
  })

  afterEach(() => {
    clearStorage()
  })

  it('obtenerPlanificacionesConDetalles returns enriched data with names', async () => {
    const mock = await import('../api/planificacionMock.js')
    await flushPromises()

    const result = await mock.obtenerPlanificacionesConDetalles()
    expect(result.length).toBe(5)

    // Check enrichment: plan_001 → clase_001 → "Violín Principiantes A"
    const plan001 = result.find((p) => p.id === 'plan_001')
    expect(plan001).toBeDefined()
    expect(plan001.clase_nombre).toBe('Violín Principiantes A')
    expect(plan001.maestro_nombre).toBe('Carlos Méndez')

    // Check enrichment: plan_003 → clase_003 → "Guitarra Avanzada", maestro_001 → "Carlos Méndez"
    const plan003 = result.find((p) => p.id === 'plan_003')
    expect(plan003).toBeDefined()
    expect(plan003.clase_nombre).toBe('Guitarra Avanzada')
    expect(plan003.maestro_nombre).toBe('Carlos Méndez')
  })

  it('obtenerPlanificacionesConDetalles filters by maestroId', async () => {
    const mock = await import('../api/planificacionMock.js')
    await flushPromises()

    const result = await mock.obtenerPlanificacionesConDetalles('maestro_002')
    expect(result.length).toBe(1)
    expect(result[0].id).toBe('plan_002')
    expect(result[0].maestro_nombre).toBe('María Torres')
  })

  it('enriched rows still return Planificacion instances', async () => {
    const mock = await import('../api/planificacionMock.js')
    await flushPromises()

    const result = await mock.obtenerPlanificacionesConDetalles()
    result.forEach((p) => expectPlanificacionShape(p))
  })

  it('handles unknown clase/maestro gracefully with Sin asignar fallback', async () => {
    const mock = await import('../api/planificacionMock.js')
    await flushPromises()

    const newPlan = await mock.crearPlanificacion({
      tema: 'Unknown references',
      clase_id: 'clase_unknown',
      maestro_id: 'maestro_unknown',
    })

    const result = await mock.obtenerPlanificacionesConDetalles()
    const unknown = result.find((p) => p.id === newPlan.id)
    expect(unknown).toBeDefined()
    expect(unknown.clase_nombre).toBe('Sin asignar')
    expect(unknown.maestro_nombre).toBe('Sin asignar')
  })
})

// ── localStorage persistence ────────────────────────────────────

describe('planificacionMock localStorage persistence', () => {
  beforeEach(async () => {
    clearStorage()
    vi.resetModules()
  })

  afterEach(() => {
    clearStorage()
  })

  it('persists created planificaciones to localStorage', async () => {
    const mock = await import('../api/planificacionMock.js')
    await flushPromises()

    await mock.crearPlanificacion({
      tema: 'Persistent plan',
      clase_id: 'clase_001',
      maestro_id: 'maestro_001',
    })

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY))
    expect(stored).toBeDefined()
    expect(stored.schemaVersion).toBe(1)
    expect(Array.isArray(stored.planificaciones)).toBe(true)
    expect(stored.planificaciones.length).toBe(6) // 5 seed + 1 new
  })

  it('survives module reset by loading from localStorage', async () => {
    const mockA = await import('../api/planificacionMock.js')
    await flushPromises()

    await mockA.crearPlanificacion({
      tema: 'Surviving plan',
      clase_id: 'clase_001',
      maestro_id: 'maestro_002',
    })

    vi.resetModules()
    const mockB = await import('../api/planificacionMock.js')
    await flushPromises()

    const result = await mockB.obtenerPlanificaciones()
    expect(result.length).toBe(6) // 5 seed + 1 new
  })

  it('re-seeds from JSON when localStorage has corrupt data', async () => {
    // Write corrupt JSON to localStorage
    localStorage.setItem(STORAGE_KEY, '{invalid json!!!}')
    vi.resetModules()

    const mock = await import('../api/planificacionMock.js')
    await flushPromises()

    const result = await mock.obtenerPlanificaciones()
    expect(result.length).toBe(5) // re-seeded from planificaciones.json

    // Verify the corrupt data was replaced with valid schema
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY))
    expect(stored.schemaVersion).toBe(1)
    expect(stored.planificaciones.length).toBe(5)
  })
})

// ── New functions: obtenerClases ─────────────────────────────────

describe('planificacionMock obtenerClases', () => {
  beforeEach(async () => {
    clearStorage()
    vi.resetModules()
  })

  it('should return all clases from mock data', async () => {
    const mock = await import('../api/planificacionMock.js')
    await flushPromises()
    const result = await mock.obtenerClases()
    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBe(5) // 5 seed clases
  })

  it('should return clases sorted by nombre', async () => {
    const mock = await import('../api/planificacionMock.js')
    await flushPromises()
    const result = await mock.obtenerClases()
    const names = result.map((c) => c.nombre)
    const sorted = [...names].sort()
    expect(names).toEqual(sorted)
  })

  it('should return full clase objects with expected fields', async () => {
    const mock = await import('../api/planificacionMock.js')
    await flushPromises()
    const result = await mock.obtenerClases()
    const primera = result[0]
    expect(primera).toHaveProperty('id')
    expect(primera).toHaveProperty('nombre')
    expect(primera).toHaveProperty('instrumento')
    expect(primera).toHaveProperty('estado')
  })
})

// ── New functions: obtenerMaestro ────────────────────────────────

describe('planificacionMock obtenerMaestro', () => {
  beforeEach(async () => {
    clearStorage()
    vi.resetModules()
  })

  it('should return a maestro by id', async () => {
    const mock = await import('../api/planificacionMock.js')
    await flushPromises()
    const result = await mock.obtenerMaestro('maestro_001')
    expect(result).toBeDefined()
    expect(result.id).toBe('maestro_001')
    expect(result.nombre_completo).toBe('Carlos Méndez')
  })

  it('should throw for non-existent id', async () => {
    const mock = await import('../api/planificacionMock.js')
    await flushPromises()
    await expect(mock.obtenerMaestro('nonexistent')).rejects.toThrow('Maestro no encontrado')
  })

  it('should return correct data for each maestro', async () => {
    const mock = await import('../api/planificacionMock.js')
    await flushPromises()
    const result = await mock.obtenerMaestro('maestro_002')
    expect(result.nombre_completo).toBe('María Torres')
    expect(result.email).toBe('maria.torres@instituto.edu')
  })
})

// ── New functions: obtenerSesiones ───────────────────────────────

describe('planificacionMock obtenerSesiones', () => {
  beforeEach(async () => {
    clearStorage()
    vi.resetModules()
  })

  it('should return an array (may be empty for mock)', async () => {
    const mock = await import('../api/planificacionMock.js')
    await flushPromises()
    const result = await mock.obtenerSesiones('maestro_001')
    expect(Array.isArray(result)).toBe(true)
  })

  it('should accept optional date filters', async () => {
    const mock = await import('../api/planificacionMock.js')
    await flushPromises()
    const result = await mock.obtenerSesiones('maestro_001', '2026-01-01', '2026-12-31')
    expect(Array.isArray(result)).toBe(true)
  })
})

// ── Adapter routing for new functions ────────────────────────────

describe('planificacionAdapter routing for new functions', () => {
  beforeEach(() => {
    clearStorage()
    vi.resetModules()
  })

  it('should route obtenerClases via mock when isDemoMode is true', async () => {
    vi.doMock('../../../core/config/config.js', () => ({
      config: { isDemoMode: true },
    }))
    const adapter = await import('../api/planificacionAdapter.js')
    await flushPromises()

    const result = await adapter.obtenerClases()
    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBeGreaterThanOrEqual(3)
    result.forEach((c) => {
      expect(c).toHaveProperty('id')
      expect(c).toHaveProperty('nombre')
    })
  })

  it('should route obtenerMaestro via mock when isDemoMode is true', async () => {
    vi.doMock('../../../core/config/config.js', () => ({
      config: { isDemoMode: true },
    }))
    const adapter = await import('../api/planificacionAdapter.js')
    await flushPromises()

    const result = await adapter.obtenerMaestro('maestro_001')
    expect(result.id).toBe('maestro_001')
    expect(result.nombre_completo).toBe('Carlos Méndez')
  })

  it('should route obtenerSesiones via mock when isDemoMode is true', async () => {
    vi.doMock('../../../core/config/config.js', () => ({
      config: { isDemoMode: true },
    }))
    const adapter = await import('../api/planificacionAdapter.js')
    await flushPromises()

    const result = await adapter.obtenerSesiones('maestro_001')
    expect(Array.isArray(result)).toBe(true)
  })

  it('should fail on obtenerClases when isDemoMode is false (no supabase)', async () => {
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
    const adapter = await import('../api/planificacionAdapter.js')
    await flushPromises()

    await expect(adapter.obtenerClases()).rejects.toThrow()
  })
})

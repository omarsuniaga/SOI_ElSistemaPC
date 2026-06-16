/**
 * bitacora.acceptance.test.js — Acceptance scenarios SC1–SC7
 *
 * All scenarios run against the mock adapter (isDemoMode path) using an
 * isolated in-memory store. localStorage is stubbed so tests are hermetic.
 *
 * Scenario mapping:
 *   SC1 — Happy path: register 3 students → semaforo counts correct
 *   SC2 — RLS scope: adapter only returns rows for the queried claseId
 *   SC3 — Validation rejects future fecha
 *   SC4 — Validation rejects empty notas array
 *   SC5 — calcularSemaforo returns verde when ≥ 70 % bien
 *   SC6 — calcularSemaforo returns rojo when ≥ 50 % mal
 *   SC7 — getSemaforoPorClase returns no row for objetivo with no sessions (gris handled by UI)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { BitacoraRegistro } from '../models/bitacora.model.js'

// ── localStorage stub (Node/jsdom safe) ──────────────────────────────────────

function makeLocalStorage() {
  let store = {}
  return {
    getItem: (k) => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v) },
    removeItem: (k) => { delete store[k] },
    clear: () => { store = {} },
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function today() {
  return new Date().toISOString().slice(0, 10)
}

function tomorrow() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().slice(0, 10)
}

/**
 * Loads a fresh instance of bitacoraMock with a clean localStorage and empty seed.
 * Returns the four adapter functions bound to that instance.
 */
async function freshMock(seedOverride = {}) {
  // Stub localStorage before importing the module
  const ls = makeLocalStorage()
  vi.stubGlobal('localStorage', ls)

  // Inject a pre-configured seed via localStorage so the module starts with
  // exactly the data we want (bypasses static JSON import).
  const seed = {
    schemaVersion: 1,
    sesiones: seedOverride.sesiones ?? [],
    objetivos: seedOverride.objetivos ?? [],
  }
  ls.setItem('bitacora_demo', JSON.stringify(seed))

  // Re-import to get a fresh module instance (vitest isolates per test via beforeEach reset)
  const mod = await import('../api/bitacoraMock.js?v=' + Math.random())
  return mod
}

// ── SC1 — Happy path: register 3 students, view reflects counts ───────────────

describe('SC1 — Happy path: register 3 students for an objetivo', () => {
  let mock

  beforeEach(async () => {
    mock = await freshMock()
  })

  it('getSemaforoPorClase returns a row with correct bien/regular/mal counts after registrarSesion', async () => {
    // Given: clean store (no prior sessions)
    const claseId = 'clase-sc1'
    const objetivoId = 'obj-sc1'
    const fecha = today()

    // When: register 3 students with mixed notas
    await mock.registrarSesion({
      claseId,
      objetivoId,
      fecha,
      notas: [
        { alumnoId: 'alumno-A', nota: 'bien' },
        { alumnoId: 'alumno-B', nota: 'bien' },
        { alumnoId: 'alumno-C', nota: 'mal' },
      ],
    })

    // Then: semaforo aggregates reflect the exact counts
    const rows = await mock.getSemaforoPorClase(claseId)

    const rowA = rows.find((r) => r.alumno_id === 'alumno-A' && r.objetivo_id === objetivoId)
    const rowC = rows.find((r) => r.alumno_id === 'alumno-C' && r.objetivo_id === objetivoId)

    expect(rowA).toBeDefined()
    expect(rowA.bien_count).toBe(1)
    expect(rowA.mal_count).toBe(0)
    expect(rowA.total_registros).toBe(1)

    expect(rowC).toBeDefined()
    expect(rowC.bien_count).toBe(0)
    expect(rowC.mal_count).toBe(1)
    expect(rowC.total_registros).toBe(1)
  })

  it('getSemaforoPorClase returns exactly 3 rows (one per student) for the registered objetivo', async () => {
    const claseId = 'clase-sc1'
    const objetivoId = 'obj-sc1'

    await mock.registrarSesion({
      claseId,
      objetivoId,
      fecha: today(),
      notas: [
        { alumnoId: 'alumno-A', nota: 'bien' },
        { alumnoId: 'alumno-B', nota: 'bien' },
        { alumnoId: 'alumno-C', nota: 'mal' },
      ],
    })

    const rows = await mock.getSemaforoPorClase(claseId)
    const forObj = rows.filter((r) => r.objetivo_id === objetivoId)
    expect(forObj).toHaveLength(3)
  })
})

// ── SC2 — RLS scope: adapter respects claseId ────────────────────────────────

describe('SC2 — RLS scope: getSemaforoPorClase only returns rows for the given claseId', () => {
  let mock

  beforeEach(async () => {
    mock = await freshMock()
  })

  it('returns empty array when querying a different claseId than the one registered', async () => {
    // Given: M1 has data for clase-C1
    await mock.registrarSesion({
      claseId: 'clase-C1',
      objetivoId: 'obj-001',
      fecha: today(),
      notas: [{ alumnoId: 'alumno-001', nota: 'bien' }],
    })

    // When: M2 queries clase-C2
    const rows = await mock.getSemaforoPorClase('clase-C2')

    // Then: zero rows returned (RLS scope enforced)
    expect(rows).toHaveLength(0)
  })

  it('does not leak rows across classes when both have sessions', async () => {
    await mock.registrarSesion({
      claseId: 'clase-C1',
      objetivoId: 'obj-001',
      fecha: today(),
      notas: [{ alumnoId: 'alumno-001', nota: 'bien' }],
    })
    await mock.registrarSesion({
      claseId: 'clase-C2',
      objetivoId: 'obj-001',
      fecha: today(),
      notas: [{ alumnoId: 'alumno-002', nota: 'mal' }],
    })

    const rowsC1 = await mock.getSemaforoPorClase('clase-C1')
    const rowsC2 = await mock.getSemaforoPorClase('clase-C2')

    expect(rowsC1.every((r) => r.alumno_id !== 'alumno-002')).toBe(true)
    expect(rowsC2.every((r) => r.alumno_id !== 'alumno-001')).toBe(true)
  })
})

// ── SC3 — Validation rejects future fecha ────────────────────────────────────

describe('SC3 — Validation rejects future fecha', () => {
  let mock

  beforeEach(async () => {
    mock = await freshMock()
  })

  it('registrarSesion rejects with an error when fecha is tomorrow', async () => {
    await expect(
      mock.registrarSesion({
        claseId: 'clase-001',
        objetivoId: 'obj-001',
        fecha: tomorrow(),
        notas: [{ alumnoId: 'alumno-001', nota: 'bien' }],
      }),
    ).rejects.toThrow(/fecha/i)
  })

  it('no rows are inserted when fecha validation fails', async () => {
    try {
      await mock.registrarSesion({
        claseId: 'clase-001',
        objetivoId: 'obj-001',
        fecha: tomorrow(),
        notas: [{ alumnoId: 'alumno-001', nota: 'bien' }],
      })
    } catch {
      // expected
    }

    const rows = await mock.getSemaforoPorClase('clase-001')
    expect(rows).toHaveLength(0)
  })
})

// ── SC4 — Validation rejects empty student list ───────────────────────────────

describe('SC4 — Validation rejects empty notas array', () => {
  let mock

  beforeEach(async () => {
    mock = await freshMock()
  })

  it('registrarSesion rejects with an error when notas is empty', async () => {
    await expect(
      mock.registrarSesion({
        claseId: 'clase-001',
        objetivoId: 'obj-001',
        fecha: today(),
        notas: [],
      }),
    ).rejects.toThrow()
  })

  it('no rows are inserted when notas validation fails', async () => {
    try {
      await mock.registrarSesion({
        claseId: 'clase-001',
        objetivoId: 'obj-001',
        fecha: today(),
        notas: [],
      })
    } catch {
      // expected
    }

    const rows = await mock.getSemaforoPorClase('clase-001')
    expect(rows).toHaveLength(0)
  })
})

// ── SC5 — Semaforo turns verde when ≥ 70 % bien ──────────────────────────────

describe('SC5 — calcularSemaforo returns verde when ≥ 70 % bien', () => {
  it('exactly 70 % bien → verde', () => {
    const result = BitacoraRegistro.calcularSemaforo({
      bien_count: 7,
      regular_count: 3,
      mal_count: 0,
      total_registros: 10,
    })
    expect(result).toBe('verde')
  })

  it('above 70 % bien → verde', () => {
    const result = BitacoraRegistro.calcularSemaforo({
      bien_count: 9,
      regular_count: 1,
      mal_count: 0,
      total_registros: 10,
    })
    expect(result).toBe('verde')
  })

  it('below 70 % bien and below 50 % mal → naranja (not verde)', () => {
    const result = BitacoraRegistro.calcularSemaforo({
      bien_count: 5,
      regular_count: 5,
      mal_count: 0,
      total_registros: 10,
    })
    expect(result).toBe('naranja')
  })
})

// ── SC6 — Semaforo turns rojo when ≥ 50 % mal ────────────────────────────────

describe('SC6 — calcularSemaforo returns rojo when > 50 % mal', () => {
  it('above 50 % mal → rojo', () => {
    const result = BitacoraRegistro.calcularSemaforo({
      bien_count: 1,
      regular_count: 1,
      mal_count: 6,
      total_registros: 8,
    })
    expect(result).toBe('rojo')
  })

  it('exactly 50 % mal → naranja (threshold is strictly > 0.50)', () => {
    const result = BitacoraRegistro.calcularSemaforo({
      bien_count: 2,
      regular_count: 3,
      mal_count: 5,
      total_registros: 10,
    })
    // 5/10 = 0.50 which is NOT > 0.50, so it falls through to naranja or verde
    // 2/10 = 0.20 which is < 0.70, so naranja
    expect(result).toBe('naranja')
  })

  it('rojo takes precedence over verde (conservative: > 50 % mal even with high bien)', () => {
    // Pathological case: rojo threshold takes priority
    const result = BitacoraRegistro.calcularSemaforo({
      bien_count: 8,
      regular_count: 0,
      mal_count: 6,
      total_registros: 10, // mal/total = 0.6 > 0.50 → rojo despite high bien_count
    })
    expect(result).toBe('rojo')
  })
})

// ── SC7 — Objetivo with no sessions → no row in getSemaforoPorClase ───────────

describe('SC7 — Objetivo with no sessions returns no semaforo row (gris handled by UI)', () => {
  let mock

  beforeEach(async () => {
    mock = await freshMock({
      objetivos: [
        { id: 'obj-taught', clase_id: 'clase-sc7', ruta_id: 'ruta-001', descripcion: 'Taught', orden: 1 },
        { id: 'obj-untaught', clase_id: 'clase-sc7', ruta_id: 'ruta-001', descripcion: 'Untaught', orden: 2 },
      ],
    })
  })

  it('returns no row for an objetivo that has no registered sessions', async () => {
    // Seed a session for obj-taught but NOT for obj-untaught
    await mock.registrarSesion({
      claseId: 'clase-sc7',
      objetivoId: 'obj-taught',
      fecha: today(),
      notas: [{ alumnoId: 'alumno-001', nota: 'bien' }],
    })

    const rows = await mock.getSemaforoPorClase('clase-sc7')

    // obj-taught has a row
    const taughtRow = rows.find((r) => r.objetivo_id === 'obj-taught')
    expect(taughtRow).toBeDefined()

    // obj-untaught has NO row (UI default is gris)
    const untaughtRow = rows.find((r) => r.objetivo_id === 'obj-untaught')
    expect(untaughtRow).toBeUndefined()
  })

  it('returns empty array when no sessions exist at all for the clase', async () => {
    const rows = await mock.getSemaforoPorClase('clase-sc7')
    expect(rows).toHaveLength(0)
  })
})

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { IndicadorLogro } from '../domain/IndicadorLogro.js'
import { PrerrequisitoValidator } from '../domain/PrerrequisitoValidator.js'
import { CalculadorSaludPerfil } from '../domain/CalculadorSaludPerfil.js'
import { CalculadorVelocidadCurricular } from '../domain/CalculadorVelocidadCurricular.js'
import { procesarProtocoloAusencia } from '../../asistencias/services/protocoloAusentismoService.js'
import { OfflineSyncAdapter } from '../api/offlineSyncAdapter.js'

// ── Mock idb para OfflineSyncAdapter (mismo patrón que
// src/portal-maestros/services/__tests__/offlineQueue.test.js) — la cola
// ahora vive en IndexedDB, no en localStorage. ──
const _idbStore = new Map()

const _mockIdbDb = {
  put: vi.fn(async (_storeName, value) => {
    _idbStore.set(value.id, { ...value })
    return value.id
  }),
  getAll: vi.fn(async () => Array.from(_idbStore.values())),
  delete: vi.fn(async (_storeName, id) => {
    _idbStore.delete(id)
  }),
  transaction: vi.fn(() => ({
    store: {
      clear: vi.fn(async () => {
        _idbStore.clear()
      }),
    },
    done: Promise.resolve(),
  })),
  objectStoreNames: { contains: vi.fn(() => false) },
  createObjectStore: vi.fn(() => ({ createIndex: vi.fn() })),
}

vi.mock('idb', () => ({
  openDB: vi.fn(async (_dbName, _version, { upgrade } = {}) => {
    if (upgrade) upgrade(_mockIdbDb)
    return _mockIdbDb
  }),
}))

vi.mock('../../../lib/supabaseClient.js', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(() => Promise.resolve({ data: { user: null }, error: null })),
    },
  },
}))

vi.mock('../services/evaluacionClaseService.js', () => ({
  registrarEvaluacion: vi.fn(() => Promise.resolve()),
}))

describe('Evaluación por Estrellas y Protocolo SDD Suite', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('IndicadorLogro Domain Entity', () => {
    it('creates an indicator correctly and checks pass threshold (>=3)', () => {
      const ind = new IndicadorLogro({
        id: 'ind-1',
        objetivoId: 'obj-1',
        titulo: 'Escala de Do',
        nivelIndex: 1,
      })

      expect(ind.id).toBe('ind-1')
      expect(ind.esLogrado(2)).toBe(false)
      expect(ind.esLogrado(3)).toBe(true)
      expect(ind.esLogrado(5)).toBe(true)
    })

    it('returns performance label for stars 0-5', () => {
      expect(IndicadorLogro.getEtiquetaDesempeno(1)).toContain('Iniciado')
      expect(IndicadorLogro.getEtiquetaDesempeno(3)).toContain('Logrado Básico')
      expect(IndicadorLogro.getEtiquetaDesempeno(5)).toContain('Dominado')
    })
  })

  describe('PrerrequisitoValidator', () => {
    it('blocks advancing if the linked prerequisite node (prerrequisitoId) is not passed', () => {
      const nodos = [
        { id: 'nodo-1', titulo: 'Postura' },
        { id: 'nodo-2', titulo: 'Escala', prerrequisitoId: 'nodo-1' },
      ]
      const evals = [{ indicator_id: 'nodo-1', nota: 2 }]

      const res = PrerrequisitoValidator.validarPrerrequisitos({
        targetIndicadorId: 'nodo-2',
        nodosRuta: nodos,
        evaluacionesAlumno: evals,
      })

      expect(res.puedeAvanzar).toBe(false)
      expect(res.razon).toContain('Postura')
    })

    it('allows advancing if the linked prerequisite is passed (>=3)', () => {
      const nodos = [
        { id: 'nodo-1', titulo: 'Postura' },
        { id: 'nodo-2', titulo: 'Escala', prerrequisitoId: 'nodo-1' },
      ]
      const evals = [{ indicator_id: 'nodo-1', nota: 4 }]

      const res = PrerrequisitoValidator.validarPrerrequisitos({
        targetIndicadorId: 'nodo-2',
        nodosRuta: nodos,
        evaluacionesAlumno: evals,
      })

      expect(res.puedeAvanzar).toBe(true)
    })

    it('follows the prerrequisitoId graph edge, not array adjacency', () => {
      // 'nodo-2' sits right before 'nodo-3' in the array, but nodo-3's REAL
      // prerequisite (via prerrequisitoId) is 'nodo-1', which IS passed.
      // A positional (array-index) validator would incorrectly block this
      // because 'nodo-2' (the array-previous node) has not been passed.
      const nodos = [
        { id: 'nodo-1', titulo: 'Postura' },
        { id: 'nodo-2', titulo: 'Escala', prerrequisitoId: 'nodo-1' },
        { id: 'nodo-3', titulo: 'Arpegios', prerrequisitoId: 'nodo-1' },
      ]
      const evals = [
        { indicator_id: 'nodo-1', nota: 5 },
        // nodo-2 deliberately has no evaluation / is not passed
      ]

      const res = PrerrequisitoValidator.validarPrerrequisitos({
        targetIndicadorId: 'nodo-3',
        nodosRuta: nodos,
        evaluacionesAlumno: evals,
      })

      expect(res.puedeAvanzar).toBe(true)
    })

    it('walks multi-level prerequisite chains, not just the immediate parent', () => {
      const nodos = [
        { id: 'nodo-1', titulo: 'Postura' },
        { id: 'nodo-2', titulo: 'Escala', prerrequisitoId: 'nodo-1' },
        { id: 'nodo-3', titulo: 'Arpegios', prerrequisitoId: 'nodo-2' },
      ]
      const evals = [
        { indicator_id: 'nodo-1', nota: 5 },
        { indicator_id: 'nodo-2', nota: 1 }, // not passed
      ]

      const res = PrerrequisitoValidator.validarPrerrequisitos({
        targetIndicadorId: 'nodo-3',
        nodosRuta: nodos,
        evaluacionesAlumno: evals,
      })

      expect(res.puedeAvanzar).toBe(false)
      expect(res.razon).toContain('Escala')
    })

    it('treats a node with no prerrequisitoId as always valid', () => {
      const nodos = [{ id: 'nodo-1', titulo: 'Postura', prerrequisitoId: null }]

      const res = PrerrequisitoValidator.validarPrerrequisitos({
        targetIndicadorId: 'nodo-1',
        nodosRuta: nodos,
        evaluacionesAlumno: [],
      })

      expect(res.puedeAvanzar).toBe(true)
    })

    it('detects a circular prerequisite chain and blocks instead of looping forever', () => {
      const nodos = [
        { id: 'nodo-1', titulo: 'A', prerrequisitoId: 'nodo-2' },
        { id: 'nodo-2', titulo: 'B', prerrequisitoId: 'nodo-1' },
      ]

      const res = PrerrequisitoValidator.validarPrerrequisitos({
        targetIndicadorId: 'nodo-1',
        nodosRuta: nodos,
        evaluacionesAlumno: [
          { indicator_id: 'nodo-1', nota: 5 },
          { indicator_id: 'nodo-2', nota: 5 },
        ],
      })

      expect(res.puedeAvanzar).toBe(false)
      expect(res.razon).toMatch(/ciclo/i)
    })
  })

  describe('CalculadorSaludPerfil (IDIA)', () => {
    it('calculates pure progress and applies attendance penalty', () => {
      const res = CalculadorSaludPerfil.calcular({
        totalIndicadores: 10,
        indicadoresLogrados: 8, // 80%
        inasistenciasInjustificadas: 2, // -8%
        inasistenciasJustificadas: 0,
      })

      expect(res.avancePuroPct).toBe(80)
      expect(res.progresoAjustadoPct).toBe(72)
    })

    it('blends content progress with star average before applying attendance penalty', () => {
      const res = CalculadorSaludPerfil.calcular({
        progresoContenidoPct: 60,
        promedioEstrellas: 4,
        inasistenciasInjustificadas: 1,
        inasistenciasJustificadas: 0,
      })

      expect(res.avanceContenidoPct).toBe(60)
      expect(res.avanceEstrellasPct).toBe(80)
      expect(res.avancePuroPct).toBe(70)
      expect(res.progresoAjustadoPct).toBe(66)
    })

    it('triggers critical alert on 4 unexcused absences', () => {
      const res = CalculadorSaludPerfil.calcular({
        totalIndicadores: 10,
        indicadoresLogrados: 5,
        inasistenciasInjustificadas: 4,
      })

      expect(res.alertaAusentismo.codigo).toBe('CITA_OBLIGATORIA')
    })
  })

  describe('CalculadorVelocidadCurricular (Desfase Temporal)', () => {
    it('detects critical time drift when actual progress falls behind expected schedule', () => {
      const res = CalculadorVelocidadCurricular.calcular({
        semanasTotales: 24, // 6 meses
        semanaActual: 12,    // 50% tiempo transcurrido (se esperaba 50%)
        totalIndicadores: 20,
        indicadoresCompletados: 5, // 25% avance real
      })

      expect(res.avanceEsperadoPct).toBe(50)
      expect(res.avanceRealPct).toBe(25)
      expect(res.desfasePct).toBe(-25)
      expect(res.alertaDesfase.codigo).toBe('DESFASE_CRITICO')
      expect(res.alertaDesfase.requiereJustificacion).toBe(true)
    })
  })

  describe('protocoloAusentismoService', () => {
    it('blocks class evaluation entry when student reaches 4 absences', () => {
      const res = procesarProtocoloAusencia({
        alumnoId: 'alum-1',
        alumnoNombre: 'Juan Perez',
        inasistenciasAcumuladas: 4,
        esJustificada: false,
      })

      expect(res.permiteEvaluacionClase).toBe(false)
      expect(res.accionRequerida).toBe('BLOQUEO_INGRESO_CITA_REPRESENTANTE')
    })
  })

  describe('OfflineSyncAdapter (cola offline en IndexedDB — fix C-5)', () => {
    let originalOnLine

    beforeEach(() => {
      _idbStore.clear()
      vi.clearAllMocks()
      originalOnLine = navigator.onLine
    })

    afterEach(() => {
      Object.defineProperty(navigator, 'onLine', { value: originalOnLine, configurable: true })
    })

    it('saves an item locally and manages the offline queue', async () => {
      await OfflineSyncAdapter.guardarLocal({ alumnoId: 'a1', claseId: 'c1', nodoId: 'n1', estrellas: 4 })
      const cola = await OfflineSyncAdapter.obtenerCola()

      expect(cola.length).toBe(1)
      expect(cola[0].alumnoId).toBe('a1')
      expect(cola[0].pendingSync).toBe(true)

      await OfflineSyncAdapter.limpiarCola()
      expect(await OfflineSyncAdapter.obtenerCola()).toHaveLength(0)
    })

    it('dedupes re-evaluations of the same alumno+clase+nodo instead of growing the queue unbounded', async () => {
      await OfflineSyncAdapter.guardarLocal({ alumnoId: 'a1', claseId: 'c1', nodoId: 'n1', estrellas: 1 })
      await OfflineSyncAdapter.guardarLocal({ alumnoId: 'a1', claseId: 'c1', nodoId: 'n1', estrellas: 2 })
      await OfflineSyncAdapter.guardarLocal({ alumnoId: 'a1', claseId: 'c1', nodoId: 'n1', estrellas: 3 })

      const cola = await OfflineSyncAdapter.obtenerCola()
      expect(cola).toHaveLength(1)
      expect(cola[0].estrellas).toBe(3)
    })

    it('does not sync while offline — item stays queued, remoteSyncFn is never called', async () => {
      Object.defineProperty(navigator, 'onLine', { value: false, configurable: true })
      await OfflineSyncAdapter.guardarLocal({ alumnoId: 'a1', claseId: 'c1', nodoId: 'n1', estrellas: 5 })

      const remoteSyncFn = vi.fn().mockResolvedValue(undefined)
      const result = await OfflineSyncAdapter.sincronizarEnSegundoPlano(remoteSyncFn)

      expect(remoteSyncFn).not.toHaveBeenCalled()
      expect(result).toEqual({ synced: 0, failed: 0 })
      expect(await OfflineSyncAdapter.obtenerCola()).toHaveLength(1)
    })

    it('drains the queue once connectivity returns and every item syncs', async () => {
      Object.defineProperty(navigator, 'onLine', { value: true, configurable: true })
      await OfflineSyncAdapter.guardarLocal({ alumnoId: 'a1', claseId: 'c1', nodoId: 'n1', estrellas: 5 })
      await OfflineSyncAdapter.guardarLocal({ alumnoId: 'a2', claseId: 'c1', nodoId: 'n1', estrellas: 2 })

      const remoteSyncFn = vi.fn().mockResolvedValue(undefined)
      const result = await OfflineSyncAdapter.sincronizarEnSegundoPlano(remoteSyncFn)

      expect(remoteSyncFn).toHaveBeenCalledTimes(2)
      expect(result).toEqual({ synced: 2, failed: 0 })
      expect(await OfflineSyncAdapter.obtenerCola()).toHaveLength(0)
    })

    it('keeps a failing item queued without losing the others (partial failure)', async () => {
      Object.defineProperty(navigator, 'onLine', { value: true, configurable: true })
      await OfflineSyncAdapter.guardarLocal({ alumnoId: 'fail', claseId: 'c1', nodoId: 'n1', estrellas: 1 })
      await OfflineSyncAdapter.guardarLocal({ alumnoId: 'ok', claseId: 'c1', nodoId: 'n1', estrellas: 3 })

      const remoteSyncFn = vi.fn(async (item) => {
        if (item.alumnoId === 'fail') throw new Error('boom')
      })

      const result = await OfflineSyncAdapter.sincronizarEnSegundoPlano(remoteSyncFn)

      expect(result).toEqual({ synced: 1, failed: 1 })
      const cola = await OfflineSyncAdapter.obtenerCola()
      expect(cola).toHaveLength(1)
      expect(cola[0].alumnoId).toBe('fail')
    })

    it('skips queued items with non-UUID identifiers instead of retrying forever', async () => {
      Object.defineProperty(navigator, 'onLine', { value: true, configurable: true })
      await OfflineSyncAdapter.guardarLocal({ alumnoId: 'nd-1', claseId: 'c1', nodoId: 'nd-2', estrellas: 4 })

      const remoteSyncFn = vi.fn().mockResolvedValue(undefined)
      const result = await OfflineSyncAdapter.sincronizarEnSegundoPlano(remoteSyncFn)

      expect(remoteSyncFn).not.toHaveBeenCalled()
      expect(result).toEqual({ synced: 0, failed: 0 })
      expect(await OfflineSyncAdapter.obtenerCola()).toHaveLength(0)
    })

    it('does not double-process items when sync is triggered concurrently (idempotent)', async () => {
      Object.defineProperty(navigator, 'onLine', { value: true, configurable: true })
      await OfflineSyncAdapter.guardarLocal({ alumnoId: 'a1', claseId: 'c1', nodoId: 'n1', estrellas: 5 })

      const remoteSyncFn = vi.fn().mockResolvedValue(undefined)

      // Ambas llamadas se disparan en el mismo tick (p.ej. el listener de
      // `online` disparándose mientras el sync inicial de `initOfflineSync`
      // sigue en curso). La segunda debe reutilizar la promesa en curso de la
      // primera en vez de volver a leer/procesar la cola.
      const call1 = OfflineSyncAdapter.sincronizarEnSegundoPlano(remoteSyncFn)
      const call2 = OfflineSyncAdapter.sincronizarEnSegundoPlano(remoteSyncFn)

      await Promise.all([call1, call2])

      expect(remoteSyncFn).toHaveBeenCalledTimes(1)
    })

    it('eliminarDeCola removes a single item, leaving the rest queued', async () => {
      await OfflineSyncAdapter.guardarLocal({ alumnoId: 'a1', claseId: 'c1', nodoId: 'n1', estrellas: 5 })
      await OfflineSyncAdapter.guardarLocal({ alumnoId: 'a2', claseId: 'c1', nodoId: 'n1', estrellas: 2 })

      const cola = await OfflineSyncAdapter.obtenerCola()
      const itemA1 = cola.find((i) => i.alumnoId === 'a1')
      await OfflineSyncAdapter.eliminarDeCola(itemA1)

      const restante = await OfflineSyncAdapter.obtenerCola()
      expect(restante).toHaveLength(1)
      expect(restante[0].alumnoId).toBe('a2')
    })
  })
})

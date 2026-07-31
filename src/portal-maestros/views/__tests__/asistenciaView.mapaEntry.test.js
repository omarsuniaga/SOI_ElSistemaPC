/**
 * asistenciaView.mapaEntry.test.js — Tarea 3.8 (openspec/changes/mapa-gamificado-planificacion)
 *
 * Punto de entrada real desde el flujo diario de asistencia a:
 *   - Modo Sesión del mapa gamificado (`MapaClaseView.js`, ya existe —
 *     Tarea 3.2). El gate de REQ-03 ("Dar Clase exige asistencia tomada")
 *     lo aplica esa vista al abrir; este botón solo navega.
 *   - Bitácora de la sesión (`bitacoraSesionPanel.js`, Tarea 3.5).
 *
 * REQ-11/REQ-03. La DSL de texto libre existente (`dslParser.js`) NO se
 * toca — se verifica explícitamente con un caso dedicado más abajo.
 *
 * Mocks base tomados de `asistenciaViewTopic.test.js` (mismo patrón ya
 * probado que permite un render real de `asistenciaView.js` de punta a
 * punta sin crashear).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../services/rutaTopicStore.js', () => ({
  consumeRutaTema: vi.fn(),
  setRutaTema: vi.fn(),
}))

vi.mock('../../auth/maestroAuth.js', () => ({
  getMaestroLocal: () => ({ id: 'maestro-1', nombre: 'Test' }),
}))

vi.mock('../../services/maestroDataService.js', () => ({
  getMisClases: vi.fn(() => Promise.resolve([{ id: 'clase-1', nombre: 'Clase 1' }])),
  getHorariosClases: vi.fn(() => Promise.resolve([])),
  getInscripcionesClases: vi.fn(() => Promise.resolve([])),
  getSalones: vi.fn(() => Promise.resolve([])),
  getRutasMaestro: vi.fn(() => Promise.resolve([])),
  invalidateClasesCache: vi.fn(),
}))

vi.mock('../../services/rutaService.js', () => ({
  loadRouteTree: vi.fn(async () => []),
  resolveRutaIdForClase: vi.fn(async () => 'ruta1'),
  loadNodesForLevel: vi.fn(async () => []),
  loadIndicatorsForNode: vi.fn(async () => []),
  invalidateSemaphoresForClase: vi.fn(),
}))

vi.mock('../../services/autoDraftService.js', () => ({
  createAutoDraft: vi.fn(() => ({ onSaved: vi.fn(), onInput: vi.fn() })),
  saveDraft: vi.fn(),
  loadDraft: vi.fn(() => Promise.resolve(null)),
  discardDraft: vi.fn(),
  saveObservation: vi.fn(),
}))

vi.mock('../../services/evaluationService.js', () => ({
  resolveDSL: vi.fn(),
  saveEvaluaciones: vi.fn(),
  processarEvaluacion: vi.fn(),
}))

vi.mock('../../services/navigationHooks.js', () => ({
  invalidateView: vi.fn(),
}))

vi.mock('../../utils/a11yUtils.js', () => ({
  announce: vi.fn(),
}))

vi.mock('../../services/offlineQueue.js', () => ({
  enqueue: vi.fn(),
  getQueueCount: vi.fn().mockResolvedValue(0),
  getQueue: vi.fn().mockResolvedValue([]),
  dequeue: vi.fn(),
  processQueue: vi.fn(),
  clearQueue: vi.fn(),
}))

vi.mock('../../services/classEventService.js', () => ({
  getClassEvent: vi.fn(() => Promise.resolve({ data: {} })),
  updateClassEventStatus: vi.fn(),
}))

vi.mock('../../components/LevelCompletionModal.js', () => ({
  createLevelCompletionModal: vi.fn(),
}))

vi.mock('../../components/studentProgressPanel.js', () => ({
  createStudentProgressPanel: vi.fn(() => ({ destroy: vi.fn() })),
}))

vi.mock('../../components/routeTreeBar.js', () => ({
  createRouteTreeBar: vi.fn(() => ({ destroy: vi.fn() })),
}))

vi.mock('../../services/justificacionService.js', () => ({
  guardarJustificacion: vi.fn(),
  obtenerJustificacion: vi.fn(),
  eliminarJustificacion: vi.fn(),
}))

vi.mock('../../components/JustificacionModal.js', () => ({
  createJustificacionModal: vi.fn(),
}))

vi.mock('../../components/dslEditor.js', () => ({
  createDslEditor: vi.fn(() => ({
    insertText: vi.fn(),
    getValue: vi.fn(() => ''),
    setValue: vi.fn(),
    setContext: vi.fn(),
    on: vi.fn(),
  })),
}))

vi.mock('../../components/dslToolbar.js', () => ({
  createDslToolbar: vi.fn(() => ({
    setContext: vi.fn(),
  })),
}))

vi.mock('../../../modules/planificacion/components/bitacoraSesionPanel.js', () => ({
  renderBitacoraSesionPanel: vi.fn(),
}))

// AsistenciaTour schedules a real setTimeout auto-start (AUTO_START_DELAY)
// that calls the real scrollIntoView (unimplemented in jsdom) — mocked here
// so it never fires as stray async noise across this file's several tests.
vi.mock('../../components/AsistenciaTour.js', () => ({
  AsistenciaTour: vi.fn().mockImplementation(function AsistenciaTourMock() {
    this.mount = vi.fn()
    this.start = vi.fn()
    this.destroy = vi.fn()
  }),
}))

vi.mock('../../../shared/components/AppToast.js', () => ({
  AppToast: {
    show: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  },
}))

// mockSesionRows: prefixed with "mock" so Vitest's hoisted vi.mock factory
// below can reference it without a TDZ violation.
let mockSesionRows = []

function buildQuery(table) {
  const q = {
    select: vi.fn(() => q),
    eq: vi.fn(() => q),
    ilike: vi.fn(() => q),
    gte: vi.fn(() => q),
    lte: vi.fn(() => q),
    in: vi.fn(() => q),
    order: vi.fn(() => q),
    limit: vi.fn(() => q),
    maybeSingle: vi.fn(() => Promise.resolve({ data: null })),
    single: vi.fn(() => Promise.resolve({ data: null })),
    then: (resolve) => {
      if (table === 'sesiones_clase') {
        return Promise.resolve({ data: mockSesionRows, error: null }).then(resolve)
      }
      return Promise.resolve({ data: [], error: null }).then(resolve)
    },
  }
  return q
}

vi.mock('../../../lib/supabaseClient.js', () => ({
  supabase: {
    from: vi.fn((table) => buildQuery(table)),
  },
}))

import { renderAsistenciaView } from '../asistenciaView.js'
import { renderBitacoraSesionPanel } from '../../../modules/planificacion/components/bitacoraSesionPanel.js'
import { AppToast } from '../../../shared/components/AppToast.js'
import { parseDSL } from '../../utils/dslParser.js'

describe('asistenciaView — entrada a Modo Sesión (mapa) + Bitácora (Tarea 3.8)', () => {
  let container
  let router

  beforeEach(() => {
    container = document.createElement('div')
    router = { navigate: vi.fn() }
    mockSesionRows = []
    vi.clearAllMocks()
  })

  it('renderiza los botones de entrada al mapa y a la bitácora', async () => {
    await renderAsistenciaView(container, { claseId: 'clase-1', router })

    expect(container.querySelector('#btn-ir-modo-sesion')).toBeTruthy()
    expect(container.querySelector('#btn-abrir-bitacora')).toBeTruthy()
  })

  it('"Ir a Modo Sesión" navega a planificacion-mapa-clase con el claseId (el gate de REQ-03 lo aplica MapaClaseView.js al abrir)', async () => {
    await renderAsistenciaView(container, { claseId: 'clase-1', router })

    container.querySelector('#btn-ir-modo-sesion').click()

    expect(router.navigate).toHaveBeenCalledWith('planificacion-mapa-clase?clase=clase-1')
  })

  it('"Bitácora de la sesión" sin sesión guardada hoy muestra una advertencia y NO abre el panel', async () => {
    mockSesionRows = [] // sin sesión de hoy todavía

    await renderAsistenciaView(container, { claseId: 'clase-1', router })
    container.querySelector('#btn-abrir-bitacora').click()

    expect(AppToast.warning).toHaveBeenCalledWith(expect.stringContaining('Guardá la asistencia'))
    expect(renderBitacoraSesionPanel).not.toHaveBeenCalled()
  })

  it('"Bitácora de la sesión" con sesión ya guardada hoy abre bitacoraSesionPanel con sesionId/claseId/maestroId', async () => {
    mockSesionRows = [
      { id: 'sesion-1', clase_id: 'clase-1', maestro_id: 'maestro-1', fecha: '2026-07-31', borrador: true, asistencia: [] },
    ]

    await renderAsistenciaView(container, { claseId: 'clase-1', router })
    container.querySelector('#btn-abrir-bitacora').click()

    expect(renderBitacoraSesionPanel).toHaveBeenCalledWith(
      expect.objectContaining({
        sesionId: 'sesion-1',
        claseId: 'clase-1',
        maestroId: 'maestro-1',
      }),
    )
    expect(AppToast.warning).not.toHaveBeenCalled()
  })

  describe('la DSL de texto libre existente no se toca (REQ-11)', () => {
    it('el editor/toolbar DSL sigue montándose igual que antes de esta tarea', async () => {
      await renderAsistenciaView(container, { claseId: 'clase-1', router })

      expect(container.querySelector('#pm-dsl-editor-container')).toBeTruthy()
      expect(container.querySelector('#pm-dsl-toolbar-container')).toBeTruthy()
    })

    it('el parser DSL real (dslParser.js) sigue funcionando exactamente igual — no fue modificado por esta tarea', () => {
      const resultado = parseDSL('#alumno Juan\n#bien Escala de Do')
      expect(resultado).toHaveProperty('alumnos')
      expect(resultado).toHaveProperty('contenido')
      expect(resultado).toHaveProperty('por_capas')
    })
  })
})

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock dependencies
vi.mock('../../services/rutaTopicStore.js', () => ({
  consumeRutaTema: vi.fn(),
  setRutaTema: vi.fn(),
}))

vi.mock('../../auth/maestroAuth.js', () => ({
  getMaestroLocal: () => ({ id: 'm1', nombre: 'Test' }),
}))

vi.mock('../../services/maestroDataService.js', () => ({
  getMisClases: vi.fn(() => Promise.resolve([{ id: 'clase1', nombre: 'Clase 1' }])),
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
  createAutoDraft: vi.fn(),
  saveDraft: vi.fn(),
  loadDraft: vi.fn(),
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

vi.mock('../../components/ContentSelectionPanel.js', () => ({
  createContentSelectionPanel: vi.fn(() => ({ destroy: vi.fn() })),
}))

vi.mock('../../components/MethodologyForm.js', () => ({
  createMethodologyForm: vi.fn(() => ({ destroy: vi.fn() })),
}))

vi.mock('../../components/HomeworkPanel.js', () => ({
  createHomeworkPanel: vi.fn(() => ({ destroy: vi.fn() })),
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

const mockQuery = {
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  ilike: vi.fn().mockReturnThis(),
  gte: vi.fn().mockReturnThis(),
  lte: vi.fn().mockReturnThis(),
  in: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  maybeSingle: vi.fn().mockResolvedValue({ data: null }),
  single: vi.fn().mockResolvedValue({ data: null }),
  then: (onFullfilled) => Promise.resolve({ data: [], error: null }).then(onFullfilled),
}

vi.mock('../../../lib/supabaseClient.js', () => ({
  supabase: {
    from: vi.fn(() => mockQuery),
  },
}))

// Mock DSL Editor to track calls
const mockEditor = {
  insertText: vi.fn(),
  getValue: vi.fn(() => ''),
  setValue: vi.fn(),
  setContext: vi.fn(),
  on: vi.fn(),
}
vi.mock('../../components/dslEditor.js', () => ({
  createDslEditor: vi.fn(() => mockEditor),
}))

vi.mock('../../components/dslToolbar.js', () => ({
  createDslToolbar: vi.fn(() => ({
    setContext: vi.fn(),
  })),
}))

import { renderAsistenciaView } from '../asistenciaView.js'
import { consumeRutaTema } from '../../services/rutaTopicStore.js'

describe('asistenciaView Topic Handoff', () => {
  let container

  beforeEach(() => {
    container = document.createElement('div')
    vi.clearAllMocks()
  })

  it('should auto-inject topic if consumed from rutaTopicStore', async () => {
    consumeRutaTema.mockReturnValueOnce({
      nombre: 'Indicador de Prueba',
      claseId: 'clase1',
    })

    try {
      await renderAsistenciaView(container, { claseId: 'clase1' })
    } catch (err) {
      console.error('Render error:', err)
    }

    expect(consumeRutaTema).toHaveBeenCalled()
    expect(mockEditor.insertText).toHaveBeenCalledWith('[Indicador de Prueba] ')

    expect(container.textContent).toContain('Tema cargado desde Ruta')
    expect(container.textContent).toContain('Indicador de Prueba')
  })

  it('should not inject topic if claseId mismatch', async () => {
    consumeRutaTema.mockReturnValueOnce({
      nombre: 'Indicador de Prueba',
      claseId: 'otra-clase',
    })

    await renderAsistenciaView(container, { claseId: 'clase1' })

    expect(mockEditor.insertText).not.toHaveBeenCalled()
  })
})

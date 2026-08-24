import { describe, it, expect, vi, beforeEach } from 'vitest'

/**
 * asistenciaView.suplente.test.js
 *
 * Bug real que este archivo cubre: cuando el suplente registraba asistencia
 * o contenido, el sistema creaba una fila NUEVA en sesiones_clase atribuida
 * a él en vez de continuar la sesión del titular del día — violando la
 * regla 4.3 de SPEC_suplencias_auditoria.md ("la asistencia y el contenido
 * registrados por el suplente se guardan en la clase del titular"). Aquí se
 * verifica que:
 *  - la consulta de "sesión de hoy" ya NO filtra por maestro_id del actor
 *    (así encuentra la sesión que abrió el titular, o viceversa);
 *  - se registra un evento de auditoría SUBSTITUTE_ENTER cuando el suplente
 *    abre la clase.
 *
 * La decisión de "quién es el dueño de la sesión" (maestroIdSesion) está
 * cubierta exhaustivamente en suplenciaService.test.js — este archivo solo
 * verifica que asistenciaView.js efectivamente use esa resolución al armar
 * la query, no reimplementa esos casos.
 */

const MAESTRO_TITULAR = 'maestro-titular'
const MAESTRO_SUPLENTE = 'maestro-suplente'

let maestroLogueado = { id: MAESTRO_SUPLENTE, user_id: 'user-suplente' }

vi.mock('../../services/rutaTopicStore.js', () => ({
  consumeRutaTema: vi.fn(() => null),
  setRutaTema: vi.fn(),
}))

vi.mock('../../auth/maestroAuth.js', () => ({
  getMaestroLocal: () => maestroLogueado,
}))

vi.mock('../../services/maestroDataService.js', () => ({
  getMisClases: vi.fn(() =>
    Promise.resolve([
      {
        id: 'clase1',
        nombre: 'Violín 101',
        maestro_principal_id: MAESTRO_TITULAR,
        maestro_suplente_id: MAESTRO_SUPLENTE,
        maestro_id: null,
      },
    ]),
  ),
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

const mockLogSubstituteActivity = vi.fn().mockResolvedValue(null)
vi.mock('../../services/substituteAuditService.js', () => ({
  logSubstituteActivity: (...args) => mockLogSubstituteActivity(...args),
  isSubstituteAssignment: (clase, maestroId) =>
    !!clase?.maestro_suplente_id && String(clase.maestro_suplente_id) === String(maestroId),
}))

function makeGenericQuery() {
  const q = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    ilike: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({ data: null }),
    single: vi.fn().mockResolvedValue({ data: null }),
    then: (onFulfilled) => Promise.resolve({ data: [], error: null }).then(onFulfilled),
  }
  return q
}

// La sesión de HOY ya existe, abierta por el TITULAR (no por el suplente).
const sesionesClaseQuery = makeGenericQuery()
sesionesClaseQuery.then = (onFulfilled) =>
  Promise.resolve({
    data: [
      {
        id: 'sesion-existente-1',
        clase_id: 'clase1',
        maestro_id: MAESTRO_TITULAR,
        fecha: '2026-08-24',
        borrador: false,
        asistencia: [],
        contenido: '',
      },
    ],
    error: null,
  }).then(onFulfilled)

vi.mock('../../../lib/supabaseClient.js', () => ({
  supabase: {
    from: vi.fn((table) => (table === 'sesiones_clase' ? sesionesClaseQuery : makeGenericQuery())),
  },
}))

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
  createDslToolbar: vi.fn(() => ({ setContext: vi.fn() })),
}))

import { renderAsistenciaView } from '../asistenciaView.js'

describe('asistenciaView — sesión compartida titular/suplente', () => {
  let container

  beforeEach(() => {
    container = document.createElement('div')
    vi.clearAllMocks()
    maestroLogueado = { id: MAESTRO_SUPLENTE, user_id: 'user-suplente' }
    sesionesClaseQuery.eq.mockClear()
  })

  it('la consulta de la sesión de hoy NO filtra por maestro_id del actor logueado', async () => {
    await renderAsistenciaView(container, { claseId: 'clase1' })

    const eqCalls = sesionesClaseQuery.eq.mock.calls.map(([col]) => col)
    expect(eqCalls).toContain('clase_id')
    expect(eqCalls).toContain('fecha')
    expect(eqCalls).not.toContain('maestro_id')
  })

  it('el suplente entrando a su clase asignada dispara SUBSTITUTE_ENTER en la bitácora', async () => {
    await renderAsistenciaView(container, { claseId: 'clase1' })

    expect(mockLogSubstituteActivity).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'SUBSTITUTE_ENTER',
        maestroSuplenteId: MAESTRO_SUPLENTE,
      }),
    )
  })

  it('el titular entrando a su propia clase NO dispara auditoría de suplencia', async () => {
    maestroLogueado = { id: MAESTRO_TITULAR, user_id: 'user-titular' }

    await renderAsistenciaView(container, { claseId: 'clase1' })

    expect(mockLogSubstituteActivity).not.toHaveBeenCalled()
  })
})

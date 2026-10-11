import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

/**
 * Regresión: al abrir una fecha cuya sesión YA tenía texto guardado, la vista
 * moría con "Error: Cannot access '<x>' before initialization" y el maestro no
 * veía ni la asistencia ni la reseña de la clase.
 *
 * Causa: con contenido inicial, el editor DSL emite `onChange` mientras se monta
 * (createDslSection). Ese `onChange` llega al autosaver, que emite su estado y
 * llama a `_renderContentStatus`, que lee `statusEl`. `statusEl` se declaraba
 * DESPUÉS de montar el editor (zona muerta temporal de `const`). Con la sesión
 * vacía no se emitía nada al montar, por eso solo fallaba al reabrir fechas
 * con texto.
 */

const SAVED_TEXT = 'Se trabajó escala de Sol mayor y arco legato'

vi.mock('../../../modules/repertoire/api/repertoireRuntime.js', async () => {
  class RepertoireUnavailableError extends Error {}
  return {
    RepertoireUnavailableError,
    getRepertoireAdapter: vi.fn(() => {
      throw new RepertoireUnavailableError('no disponible')
    }),
  }
})

vi.mock('../../../lib/supabaseClient.js', () => {
  const sesion = {
    id: 'sesion-con-texto-1',
    clase_id: null,
    maestro_id: 'm1',
    fecha: '2026-10-07',
    actividad: 'Clase con reseña guardada',
    contenido: 'Se trabajó escala de Sol mayor y arco legato',
    asistencia: [],
  }
  const q = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({ data: null }),
    single: vi.fn().mockResolvedValue({ data: sesion, error: null }),
    then: (onFulfilled) => Promise.resolve({ data: [], error: null }).then(onFulfilled),
  }
  return { supabase: { from: vi.fn(() => q) } }
})

vi.mock('../../auth/maestroAuth.js', () => ({
  getMaestroLocal: () => ({ id: 'm1', nombre: 'Maestro Prueba' }),
}))

vi.mock('../../services/maestroDataService.js', () => ({
  getMisClases: vi.fn(() => Promise.resolve([])),
  getHorariosClases: vi.fn(() => Promise.resolve([])),
  getInscripcionesClases: vi.fn(() => Promise.resolve([])),
  getSalones: vi.fn(() => Promise.resolve([])),
  getRutasMaestro: vi.fn(() => Promise.resolve([])),
  invalidateClasesCache: vi.fn(),
}))

vi.mock('../../services/rutaTopicStore.js', () => ({
  consumeRutaTema: vi.fn(),
  setRutaTema: vi.fn(),
}))

vi.mock('../../services/offlineQueue.js', () => ({
  enqueue: vi.fn(),
  getQueueCount: vi.fn().mockResolvedValue(0),
  getQueue: vi.fn().mockResolvedValue([]),
  dequeue: vi.fn(),
  processQueue: vi.fn(),
  clearQueue: vi.fn(),
}))

vi.mock('../../services/justificacionService.js', () => ({
  guardarJustificacion: vi.fn(),
  actualizarJustificacion: vi.fn(),
  obtenerJustificacion: vi.fn(),
  eliminarJustificacion: vi.fn(),
}))

vi.mock('../../utils/a11yUtils.js', () => ({ announce: vi.fn() }))
vi.mock('../../services/navigationHooks.js', () => ({ invalidateView: vi.fn() }))
vi.mock('../../services/notificationService.js', () => ({
  fetchNotificaciones: vi.fn().mockResolvedValue([]),
}))

import { renderAsistenciaView } from '../asistenciaView.js'

describe('asistenciaView · fecha con reseña de clase ya guardada', () => {
  let container

  beforeEach(() => {
    container = document.createElement('div')
    container.id = 'asistencia-container'
    document.body.appendChild(container)
  })

  afterEach(() => {
    container?.remove()
    vi.clearAllMocks()
  })

  it('abre la vista sin error de inicialización y muestra el texto guardado', async () => {
    await renderAsistenciaView('asistencia-container', {
      sesionId: 'sesion-con-texto-1',
      fecha: '2026-10-07',
      router: { navigate: vi.fn() },
    })

    expect(container.textContent).not.toMatch(/before initialization/)
    expect(container.textContent).not.toMatch(/^\s*Error:/)
    expect(container.querySelector('.pm-asist-title')?.textContent).toBe('Clase con reseña guardada')
    expect(container.querySelector('#pm-dsl-editable')?.textContent).toContain(SAVED_TEXT)
  })

  it('el indicador de guardado arranca en "Guardado" cuando el texto ya está en el servidor', async () => {
    await renderAsistenciaView('asistencia-container', {
      sesionId: 'sesion-con-texto-1',
      fecha: '2026-10-07',
      router: { navigate: vi.fn() },
    })

    const status = container.querySelector('#pm-content-save-status')
    expect(status?.dataset.status).toBe('saved')
    expect(status?.textContent).toBe('Guardado')
  })
})

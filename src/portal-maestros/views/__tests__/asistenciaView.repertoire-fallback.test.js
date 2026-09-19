import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

/**
 * Regresión: un maestro fuera del piloto de Repertorio veía
 * "Error: El módulo de Repertorio no está activado para este usuario."
 * en lugar de la asistencia al entrar a una sesión emergente.
 *
 * getRepertoireAdapter lanza RepertoireUnavailableError para maestros no piloto;
 * la ruta de sesión emergente lo invocaba sin protección y el catch general
 * pintaba el mensaje como si toda la vista hubiera fallado. Repertorio es un
 * extra: sin adaptador, la asistencia debe funcionar y el panel decir
 * "Repertorio no disponible".
 */

vi.mock('../../../modules/repertoire/api/repertoireRuntime.js', async () => {
  class RepertoireUnavailableError extends Error {
    constructor(message = 'El módulo de Repertorio no está disponible.') {
      super(message)
      this.name = 'RepertoireUnavailableError'
    }
  }
  return {
    RepertoireUnavailableError,
    getRepertoireAdapter: vi.fn(() => {
      throw new RepertoireUnavailableError('El módulo de Repertorio no está activado para este usuario.')
    }),
  }
})

vi.mock('../../../lib/supabaseClient.js', () => {
  const sesion = {
    id: 'sesion-emergente-1',
    clase_id: null,
    maestro_id: 'm1',
    fecha: '2026-05-21',
    actividad: 'Ensayo especial',
    contenido: '',
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
  getMaestroLocal: () => ({ id: 'm1', nombre: 'Maestro Fuera Del Piloto' }),
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
  obtenerJustificacion: vi.fn(),
  eliminarJustificacion: vi.fn(),
}))

vi.mock('../../utils/a11yUtils.js', () => ({ announce: vi.fn() }))
vi.mock('../../services/navigationHooks.js', () => ({ invalidateView: vi.fn() }))
vi.mock('../../services/notificationService.js', () => ({
  fetchNotificaciones: vi.fn().mockResolvedValue([]),
}))

import { renderAsistenciaView } from '../asistenciaView.js'

describe('asistenciaView · maestro fuera del piloto de Repertorio', () => {
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

  it('sesión emergente: NO muestra el error de Repertorio; la asistencia se renderiza', async () => {
    await renderAsistenciaView('asistencia-container', {
      sesionId: 'sesion-emergente-1',
      fecha: '2026-05-21',
      router: { navigate: vi.fn() },
    })

    expect(container.textContent).not.toContain('no está activado para este usuario')
    expect(container.textContent).not.toMatch(/^\s*Error:/)
    // la vista de asistencia sí se pintó
    expect(container.querySelector('.pm-asist-title')?.textContent).toBe('Ensayo especial')
  })

  it('sesión emergente: el panel de repertorio queda como "no disponible"', async () => {
    await renderAsistenciaView('asistencia-container', {
      sesionId: 'sesion-emergente-1',
      fecha: '2026-05-21',
      router: { navigate: vi.fn() },
    })

    expect(container.textContent).toContain('Repertorio no disponible')
  })
})

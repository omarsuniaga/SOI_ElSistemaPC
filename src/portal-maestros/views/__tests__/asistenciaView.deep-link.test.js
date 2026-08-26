import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock dependencies required by asistenciaView
vi.mock('../../../lib/supabaseClient.js', () => {
  const mockQuery = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({ data: null }),
    single: vi.fn().mockResolvedValue({ data: null }),
    then: (onFulfilled) =>
      Promise.resolve({
        data: [
          {
            id: 'sesion-1',
            clase_id: '550e8400-e29b-41d4-a716-446655440000',
            maestro_id: 'm1',
            fecha: '2026-05-21',
            borrador: false,
            contenido: '',
            asistencia: [{ alumno_id: '2', estado: 'P' }],
          },
        ],
        error: null,
      }).then(onFulfilled),
  }
  return {
    supabase: {
      from: vi.fn(() => mockQuery),
    },
  }
})

vi.mock('../../auth/maestroAuth.js', () => ({
  getMaestroLocal: () => ({ id: 'm1', nombre: 'Maestro Test' }),
}))

vi.mock('../../services/maestroDataService.js', () => ({
  getMisClases: vi.fn(() =>
    Promise.resolve([
      {
        id: '550e8400-e29b-41d4-a716-446655440000',
        nombre: 'Violin 101',
        salon: 'sal1',
        instrumento: 'Violín',
      },
    ]),
  ),
  getHorariosClases: vi.fn(() =>
    Promise.resolve([
      {
        id: 'h1',
        clase_id: '550e8400-e29b-41d4-a716-446655440000',
        dia: 'jueves',
        hora_inicio: '14:00',
        hora_fin: '15:00',
      },
    ]),
  ),
  getInscripcionesClases: vi.fn(() =>
    Promise.resolve([
      {
        id: 'i1',
        clase_id: '550e8400-e29b-41d4-a716-446655440000',
        alumnos: {
          id: '1',
          nombre_completo: 'Estudiante 1',
          instrumento_principal: 'Violín',
        },
      },
      {
        id: 'i2',
        clase_id: '550e8400-e29b-41d4-a716-446655440000',
        alumnos: {
          id: '2',
          nombre_completo: 'Estudiante 2',
          instrumento_principal: 'Violín',
        },
      },
    ]),
  ),
  getSalones: vi.fn(() => Promise.resolve([{ id: 'sal1', nombre: 'Salón 101' }])),
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

vi.mock('../../utils/a11yUtils.js', () => ({
  announce: vi.fn(),
}))

vi.mock('../../services/navigationHooks.js', () => ({
  invalidateView: vi.fn(),
}))

vi.mock('../../services/notificationService.js', () => ({
  fetchNotificaciones: vi.fn().mockResolvedValue([]),
}))

import { renderAsistenciaView } from '../asistenciaView.js'

describe('Asistencia View Direct Navigation (Deep Link)', () => {
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

  it('should load and render specific class asistencia when claseId and fecha are provided', async () => {
    const params = {
      claseId: '550e8400-e29b-41d4-a716-446655440000',
      fecha: '2026-05-21',
    }

    await renderAsistenciaView('asistencia-container', params)

    // Verify student names are rendered in the DOM
    expect(container.innerHTML).toContain('Estudiante 1')
    expect(container.innerHTML).toContain('Estudiante 2')
    expect(container.innerHTML).toContain('Violin 101')

    // Verify that attendance state restored from session is rendered
    const itemEstudiante2 = container.querySelector('.pm-asist-item[data-id="2"]')
    expect(itemEstudiante2).toBeTruthy()
    const activeBtnP = itemEstudiante2.querySelector('button[data-action="P"].active-p')
    expect(activeBtnP).toBeTruthy()
  })

  it('should render header with class title and formatted date', async () => {
    const params = {
      claseId: '550e8400-e29b-41d4-a716-446655440000',
      fecha: '2026-05-21',
    }

    await renderAsistenciaView('asistencia-container', params)

    const titleElement = container.querySelector('.pm-asist-title')
    expect(titleElement?.textContent).toBe('Violin 101')

    const subtitleElement = container.querySelector('.pm-asist-subtitle')
    expect(subtitleElement).toBeTruthy()
    // Should format or contain the day/month or year
    expect(subtitleElement.textContent).toMatch(/21.*mayo|2026-05-21|mayo/i)
  })

  it('should redirect to fechas view when claseId is omitted', async () => {
    const routerMock = { navigate: vi.fn() }
    await renderAsistenciaView('asistencia-container', { router: routerMock })

    expect(routerMock.navigate).toHaveBeenCalledWith('fechas')
  })
})

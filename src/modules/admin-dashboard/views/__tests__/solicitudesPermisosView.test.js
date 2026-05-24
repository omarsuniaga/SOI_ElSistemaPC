import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderSolicitudesPermisosView } from '../solicitudesPermisosView.js'
import * as permisosApi from '../../../permisos/api/permisosSupabase.js'

vi.mock('../../../permisos/api/permisosSupabase.js', () => ({
  obtenerSolicitudesPendientes: vi.fn(),
  aprobarSolicitud: vi.fn(),
  rechazarSolicitud: vi.fn(),
}))

vi.mock('../../../../lib/supabaseClient.js', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(() =>
        Promise.resolve({
          data: {
            user: {
              id: 'admin-123',
              email: 'admin@example.com',
            },
          },
        })
      ),
    },
  },
}))

describe('solicitudesPermisosView', () => {
  let container

  beforeEach(() => {
    container = document.createElement('div')
    container.id = 'test-container'
    document.body.appendChild(container)
    vi.clearAllMocks()
  })

  afterEach(() => {
    container?.remove()
  })

  it('should render empty state when no pending solicitudes', async () => {
    permisosApi.obtenerSolicitudesPendientes.mockResolvedValueOnce([])

    await renderSolicitudesPermisosView(container)

    await new Promise(resolve => setTimeout(resolve, 100))

    expect(container.textContent).toContain('No hay solicitudes pendientes')
  })

  it('should render solicitud cards with maestro information', async () => {
    const mockSolicitudes = [
      {
        id: 'sol-1',
        maestro_id: 'maestro-1',
        maestro_nombre: 'Prof. García',
        maestro_email: 'garcia@example.com',
        solicita_alumnos: true,
        solicita_clases: false,
        estado: 'pendiente',
        creado_en: new Date().toISOString(),
      },
    ]

    permisosApi.obtenerSolicitudesPendientes.mockResolvedValueOnce(mockSolicitudes)

    await renderSolicitudesPermisosView(container)

    await new Promise(resolve => setTimeout(resolve, 100))

    expect(container.textContent).toContain('Prof. García')
    expect(container.textContent).toContain('garcia@example.com')
  })

  it('should display permission types when maestro requests both', async () => {
    const mockSolicitudes = [
      {
        id: 'sol-2',
        maestro_id: 'maestro-2',
        maestro_nombre: 'Prof. López',
        maestro_email: 'lopez@example.com',
        solicita_alumnos: true,
        solicita_clases: true,
        estado: 'pendiente',
        creado_en: new Date().toISOString(),
      },
    ]

    permisosApi.obtenerSolicitudesPendientes.mockResolvedValueOnce(mockSolicitudes)

    await renderSolicitudesPermisosView(container)

    await new Promise(resolve => setTimeout(resolve, 100))

    expect(container.textContent).toContain('Registrar Alumnos')
    expect(container.textContent).toContain('Gestionar Clases')
  })

  it('should show error when failing to load solicitudes', async () => {
    permisosApi.obtenerSolicitudesPendientes.mockRejectedValueOnce(
      new Error('Database connection failed')
    )

    await renderSolicitudesPermisosView(container)

    await new Promise(resolve => setTimeout(resolve, 100))

    expect(container.textContent).toContain('Error al cargar solicitudes')
  })

  it('should render multiple solicitud cards', async () => {
    const mockSolicitudes = [
      {
        id: 'sol-1',
        maestro_id: 'maestro-1',
        maestro_nombre: 'Prof. García',
        maestro_email: 'garcia@example.com',
        solicita_alumnos: true,
        solicita_clases: false,
        estado: 'pendiente',
        creado_en: new Date().toISOString(),
      },
      {
        id: 'sol-2',
        maestro_id: 'maestro-2',
        maestro_nombre: 'Prof. López',
        maestro_email: 'lopez@example.com',
        solicita_alumnos: false,
        solicita_clases: true,
        estado: 'pendiente',
        creado_en: new Date().toISOString(),
      },
    ]

    permisosApi.obtenerSolicitudesPendientes.mockResolvedValueOnce(mockSolicitudes)

    await renderSolicitudesPermisosView(container)

    await new Promise(resolve => setTimeout(resolve, 100))

    expect(container.textContent).toContain('Prof. García')
    expect(container.textContent).toContain('Prof. López')
    expect(container.querySelectorAll('.admin-solicitud-card')).toHaveLength(2)
  })
})

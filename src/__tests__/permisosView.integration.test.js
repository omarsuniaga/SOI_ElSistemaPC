import { describe, it, expect, vi, beforeEach } from 'vitest'
import { JSDOM } from 'jsdom'

vi.mock('../modules/permisos/api/permisosApi.js', () => ({
  obtenerPermisos: vi.fn(),
  actualizarPermiso: vi.fn(),
  obtenerPermisoPorMaestro: vi.fn(),
}))

vi.mock('../core/config/config.js', () => ({
  config: { isDemoMode: true },
}))

vi.mock('../shared/components/AppToast.js', () => ({
  AppToast: {
    success: vi.fn(),
    error: vi.fn(),
    show: vi.fn(),
  },
}))

vi.mock('../modules/auth/hooks/useAuth.js', () => ({
  useAuth: {
    getUser: vi.fn(() => ({ nombre_completo: 'Admin Test', email: 'admin@test.com' })),
  },
}))

import { renderPermisosView } from '../modules/permisos/views/permisosView.js'
import { obtenerPermisos, actualizarPermiso } from '../modules/permisos/api/permisosApi.js'
import { AppToast } from '../shared/components/AppToast.js'

describe('Permisos View — Admin toggle integration', () => {
  let container

  const mockPermisos = [
    {
      id: 'perm-001',
      maestro_id: 'maestro_001',
      maestro_nombre: 'Carlos Méndez',
      maestro_email: 'carlos@ejemplo.com',
      maestro_activo: true,
      total_clases_asignadas: 2,
      clases_titular: 2,
      clases_suplente: 0,
      puede_gestionar_clases_habilitable: true,
      puede_registrar_alumnos: true,
      puede_inscribir_clases: false,
      puede_crear_clases: false,
      concedido_por: 'admin_001',
      concedido_por_nombre: 'Admin Sistema',
      creado_en: '2026-01-15T10:00:00Z',
      actualizado_en: '2026-05-01T14:30:00Z',
    },
    {
      id: 'perm-002',
      maestro_id: 'maestro_002',
      maestro_nombre: 'Luisa Díaz',
      maestro_email: 'luisa@ejemplo.com',
      maestro_activo: true,
      total_clases_asignadas: 0,
      clases_titular: 0,
      clases_suplente: 0,
      puede_gestionar_clases_habilitable: false,
      puede_registrar_alumnos: false,
      puede_inscribir_clases: false,
      puede_crear_clases: false,
      concedido_por: null,
      concedido_por_nombre: null,
      creado_en: '2026-01-16T10:00:00Z',
      actualizado_en: '2026-05-02T14:30:00Z',
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()

    const dom = new JSDOM('<!DOCTYPE html><html><body><div id="app"></div></body></html>', {
      url: 'http://localhost',
    })

    globalThis.document = dom.window.document
    globalThis.window = dom.window
    globalThis.navigator = dom.window.navigator

    container = dom.window.document.getElementById('app')
    obtenerPermisos.mockResolvedValue(JSON.parse(JSON.stringify(mockPermisos)))
    actualizarPermiso.mockResolvedValue({
      maestro_id: 'maestro_001',
      puede_registrar_alumnos: true,
      puede_inscribir_clases: false,
    })
  })

  it('should render permisos table with all maestros returned by the API', async () => {
    await renderPermisosView(container)

    expect(container.querySelector('#permisosTable')).toBeTruthy()
    expect(container.querySelectorAll('#permisosTBody tr')).toHaveLength(2)
    expect(container.querySelector('.page-title').textContent).toContain('Permisos')
  })

  it('should render toggle for puede_registrar_alumnos checked', async () => {
    await renderPermisosView(container)

    const toggleRegistrar = container.querySelector(
      'tr[data-maestro-id="maestro_001"] input[data-field="puede_registrar_alumnos"]',
    )

    expect(toggleRegistrar).toBeTruthy()
    expect(toggleRegistrar.checked).toBe(true)
  })

  it('should render class management toggle unchecked for eligible maestro', async () => {
    await renderPermisosView(container)

    const toggleInscribir = container.querySelector(
      'tr[data-maestro-id="maestro_001"] input[data-field="puede_inscribir_clases"]',
    )

    expect(toggleInscribir).toBeTruthy()
    expect(toggleInscribir.checked).toBe(false)
    expect(toggleInscribir.disabled).toBe(false)
  })

  it('should disable class management toggle when the maestro has no assigned classes', async () => {
    await renderPermisosView(container)

    const toggleInscribir = container.querySelector(
      'tr[data-maestro-id="maestro_002"] input[data-field="puede_inscribir_clases"]',
    )

    expect(toggleInscribir).toBeTruthy()
    expect(toggleInscribir.disabled).toBe(true)
    expect(container.textContent).toContain('Asigna al menos una clase para habilitar este acceso')
  })

  it('should render class creation toggle unchecked for eligible maestro', async () => {
    await renderPermisosView(container)

    const toggleCrear = container.querySelector(
      'tr[data-maestro-id="maestro_001"] input[data-field="puede_crear_clases"]',
    )

    expect(toggleCrear).toBeTruthy()
    expect(toggleCrear.checked).toBe(false)
    expect(toggleCrear.disabled).toBe(false)
  })

  it('should show empty state when no maestros are returned', async () => {
    obtenerPermisos.mockResolvedValueOnce([])
    await renderPermisosView(container)

    expect(container.querySelector('#permisosTable')).toBeFalsy()
    expect(container.textContent).toContain('No hay maestros para gestionar')
  })

  it('should show loading state while fetching', async () => {
    obtenerPermisos.mockImplementationOnce(() => new Promise(() => {}))
    renderPermisosView(container)

    expect(container.querySelector('.spinner-border')).toBeTruthy()
  })

  it('should show error state when API fails', async () => {
    obtenerPermisos.mockRejectedValueOnce(new Error('Connection failed'))
    await renderPermisosView(container)

    expect(container.textContent).toContain('Error')
    expect(container.textContent).toContain('Connection failed')
  })

  it('should call actualizarPermiso when an eligible class-management toggle is changed', async () => {
    await renderPermisosView(container)

    const toggle = container.querySelector(
      'tr[data-maestro-id="maestro_001"] input[data-field="puede_inscribir_clases"]',
    )

    toggle.checked = true
    toggle.dispatchEvent(new window.Event('change', { bubbles: true }))

    await new Promise((resolve) => setTimeout(resolve, 50))

    expect(actualizarPermiso).toHaveBeenCalledWith('maestro_001', {
      puede_inscribir_clases: true,
      permisos: ['clases:enroll'],
      solicitudes: [],
      concedido_por: 'admin',
      concedido_por_nombre: 'Admin Test',
    })
  })

  it('should call actualizarPermiso when an eligible class-creation toggle is changed', async () => {
    await renderPermisosView(container)

    const toggle = container.querySelector(
      'tr[data-maestro-id="maestro_001"] input[data-field="puede_crear_clases"]',
    )

    toggle.checked = true
    toggle.dispatchEvent(new window.Event('change', { bubbles: true }))

    await new Promise((resolve) => setTimeout(resolve, 50))

    expect(actualizarPermiso).toHaveBeenCalledWith('maestro_001', {
      puede_crear_clases: true,
      permisos: ['clases:create'],
      solicitudes: [],
      concedido_por: 'admin',
      concedido_por_nombre: 'Admin Test',
    })
  })

  it('should rollback toggle on API error and show error toast', async () => {
    actualizarPermiso.mockRejectedValueOnce(new Error('Server error'))
    await renderPermisosView(container)

    const toggle = container.querySelector(
      'tr[data-maestro-id="maestro_001"] input[data-field="puede_registrar_alumnos"]',
    )

    expect(toggle.checked).toBe(true)

    toggle.checked = false
    toggle.dispatchEvent(new window.Event('change', { bubbles: true }))

    await new Promise((resolve) => setTimeout(resolve, 50))

    expect(toggle.checked).toBe(true)
    expect(AppToast.error).toHaveBeenCalled()
  })

  it('should block enabling class management when the maestro has no assigned classes', async () => {
    await renderPermisosView(container)

    const toggle = container.querySelector(
      'tr[data-maestro-id="maestro_002"] input[data-field="puede_inscribir_clases"]',
    )

    toggle.checked = true
    toggle.dispatchEvent(new window.Event('change', { bubbles: true }))

    await new Promise((resolve) => setTimeout(resolve, 10))

    expect(actualizarPermiso).not.toHaveBeenCalledWith('maestro_002', expect.anything())
    expect(toggle.checked).toBe(false)
    expect(AppToast.error).toHaveBeenCalledWith(
      'No puedes habilitar gestionar clases hasta asignarle al menos una clase al maestro.',
    )
  })

  it('should block enabling class creation when the maestro has no assigned classes', async () => {
    await renderPermisosView(container)

    const toggle = container.querySelector(
      'tr[data-maestro-id="maestro_002"] input[data-field="puede_crear_clases"]',
    )

    toggle.checked = true
    toggle.dispatchEvent(new window.Event('change', { bubbles: true }))

    await new Promise((resolve) => setTimeout(resolve, 10))

    expect(actualizarPermiso).not.toHaveBeenCalledWith('maestro_002', expect.anything())
    expect(toggle.checked).toBe(false)
    expect(AppToast.error).toHaveBeenCalledWith(
      'No puedes habilitar crear clases hasta asignarle al menos una clase al maestro.',
    )
  })
})

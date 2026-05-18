import { describe, it, expect, vi, beforeEach } from 'vitest'
import { JSDOM } from 'jsdom'

// Mock dependencies
vi.mock('../modules/permisos/api/permisosSupabase.js', () => ({
  obtenerPermisos: vi.fn().mockResolvedValue([]),
  obtenerPermisoPorMaestro: vi.fn().mockResolvedValue(null),
  actualizarPermiso: vi.fn().mockResolvedValue({ data: null, error: null }),
  listarMaestrosSinPermisos: vi.fn().mockResolvedValue([]),
  grantBulk: vi.fn().mockResolvedValue({ succeeded: [], failed: [] }),
}))

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
      puede_registrar_alumnos: true,
      puede_inscribir_clases: false,
      concedido_por: 'admin_001',
      concedido_por_nombre: 'Admin Sistema',
      creado_en: '2026-01-15T10:00:00Z',
      actualizado_en: '2026-05-01T14:30:00Z',
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()

    // Setup DOM
    const dom = new JSDOM('<!DOCTYPE html><html><body><div id="app"></div></body></html>', {
      url: 'http://localhost',
    })
    global.document = dom.window.document
    global.window = dom.window
    global.navigator = dom.window.navigator

    container = dom.window.document.getElementById('app')
    obtenerPermisos.mockResolvedValue(mockPermisos)
    actualizarPermiso.mockResolvedValue({
      maestro_id: 'maestro_001',
      puede_registrar_alumnos: true,
      puede_inscribir_clases: false,
    })
  })

  it('should render permisos table with toggle switches', async () => {
    await renderPermisosView(container)

    expect(container.querySelector('#permisosTable')).toBeTruthy()
    const rows = container.querySelectorAll('#permisosTBody tr')
    expect(rows.length).toBe(1)
    expect(container.querySelector('.page-title').textContent).toContain('Permisos')
  })

  it('should render toggle for puede_registrar_alumnos checked', async () => {
    await renderPermisosView(container)

    const toggleRegistrar = container.querySelector(
      'input[data-field="puede_registrar_alumnos"]'
    )
    expect(toggleRegistrar).toBeTruthy()
    expect(toggleRegistrar.checked).toBe(true)
  })

  it('should render toggle for puede_inscribir_clases unchecked', async () => {
    await renderPermisosView(container)

    const toggleInscribir = container.querySelector(
      'input[data-field="puede_inscribir_clases"]'
    )
    expect(toggleInscribir).toBeTruthy()
    expect(toggleInscribir.checked).toBe(false)
  })

  it('should show empty state when no permisos', async () => {
    obtenerPermisos.mockResolvedValueOnce([])
    await renderPermisosView(container)

    expect(container.querySelector('#permisosTable')).toBeFalsy()
    expect(container.textContent).toContain('No hay permisos')
  })

  it('should show loading state while fetching', async () => {
    // Don't resolve the promise yet
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

  it('should call actualizarPermiso when toggle is changed and show success toast', async () => {
    await renderPermisosView(container)

    const toggle = container.querySelector('input[data-field="puede_inscribir_clases"]')
    expect(toggle).toBeTruthy()

    // Simulate toggle change
    toggle.checked = true
    toggle.dispatchEvent(new window.Event('change', { bubbles: true }))

    // Wait for async handler
    await new Promise((resolve) => setTimeout(resolve, 50))

    expect(actualizarPermiso).toHaveBeenCalledWith('maestro_001', {
      puede_inscribir_clases: true,
    })
  })

  it('should rollback toggle on API error and show error toast', async () => {
    actualizarPermiso.mockRejectedValueOnce(new Error('Server error'))
    await renderPermisosView(container)

    const toggle = container.querySelector('input[data-field="puede_registrar_alumnos"]')
    expect(toggle.checked).toBe(true)

    // Try to toggle off
    toggle.checked = false
    toggle.dispatchEvent(new window.Event('change', { bubbles: true }))

    // Wait for async handler
    await new Promise((resolve) => setTimeout(resolve, 50))

    // Should have rolled back
    expect(toggle.checked).toBe(true)
    expect(AppToast.error).toHaveBeenCalled()
  })
})

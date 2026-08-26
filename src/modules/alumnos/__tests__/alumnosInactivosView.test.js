import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderAlumnosInactivosView } from '../views/alumnosInactivosView.js'
import * as alumnosApi from '../api/alumnosApi.js'
import { AppModal } from '../../../shared/components/AppModal.js'
import { AppToast } from '../../../shared/components/AppToast.js'

vi.mock('../api/alumnosApi.js', () => ({
  obtenerAlumnosInactivos: vi.fn(),
  reactivarAlumno: vi.fn(),
}))

vi.mock('../../../shared/components/AppModal.js', () => ({
  AppModal: {
    open: vi.fn(),
    close: vi.fn(),
    showLoading: vi.fn(),
  },
}))

vi.mock('../../../shared/components/AppToast.js', () => ({
  AppToast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

describe('alumnosInactivosView', () => {
  let container

  beforeEach(() => {
    vi.clearAllMocks()
    document.body.innerHTML = ''
    container = document.createElement('div')
    document.body.appendChild(container)
    window.router = { navigate: vi.fn() }
  })


  it('renders empty state when there are no inactive students', async () => {
    alumnosApi.obtenerAlumnosInactivos.mockResolvedValue({ alumnos: [], total: 0 })

    await renderAlumnosInactivosView(container)

    expect(container.textContent).toContain('Alumnos Inactivos')
    expect(container.textContent).toContain('No hay alumnos inactivos')
  })

  it('renders inactive students with reactivate button', async () => {
    const mockInactivos = [
      {
        id: 'alum-001',
        nombre_completo: 'Carlos Perez',
        instrumento_principal: 'Violín',
        correo_representante: 'carlos@test.com',
        activo: false,
      },
    ]
    alumnosApi.obtenerAlumnosInactivos.mockResolvedValue({ alumnos: mockInactivos, total: 1 })

    await renderAlumnosInactivosView(container)

    expect(container.textContent).toContain('Carlos Perez')
    expect(container.textContent).toContain('Violín')
    expect(container.querySelector('[data-action="reactivate"]')).not.toBeNull()
  })

  it('navigates back to active students when clicking Alumnos Activos button', async () => {
    alumnosApi.obtenerAlumnosInactivos.mockResolvedValue({ alumnos: [], total: 0 })

    await renderAlumnosInactivosView(container)

    const btnVolver = container.querySelector('#btnVolverActivos')
    expect(btnVolver).not.toBeNull()
    btnVolver.click()

    expect(window.router.navigate).toHaveBeenCalledWith('alumnos')
  })



  it('opens confirmation modal and reactivates student', async () => {
    const mockInactivos = [
      {
        id: 'alum-002',
        nombre_completo: 'Laura Gomez',
        instrumento_principal: 'Flauta',
        activo: false,
      },
    ]
    alumnosApi.obtenerAlumnosInactivos.mockResolvedValue({ alumnos: mockInactivos, total: 1 })
    alumnosApi.reactivarAlumno.mockResolvedValue({ id: 'alum-002', activo: true })

    await renderAlumnosInactivosView(container)

    const btnReactivate = container.querySelector('[data-action="reactivate"][data-id="alum-002"]')
    expect(btnReactivate).not.toBeNull()
    btnReactivate.dispatchEvent(new MouseEvent('click', { bubbles: true }))

    expect(AppModal.open).toHaveBeenCalled()
    const modalCall = AppModal.open.mock.calls[0][0]
    expect(modalCall.title).toBe('Reactivar Alumno')

    // Execute onSave
    const result = await modalCall.onSave()
    expect(result).toBe(true)
    expect(alumnosApi.reactivarAlumno).toHaveBeenCalledWith('alum-002')
    expect(AppToast.success).toHaveBeenCalledWith('Alumno reactivado correctamente')
  })
})

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderProgramasView } from '../views/programasView.js'
import * as programasApi from '../api/programasApi.js'
import { AppModal } from '../../../shared/components/AppModal.js'

// Mock de la API
vi.mock('../api/programasApi.js', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    obtenerProgramas: vi.fn(),
    crearPrograma: vi.fn(),
    actualizarPrograma: vi.fn(),
    eliminarPrograma: vi.fn(),
    exportarProgramasPDF: vi.fn()
  }
})

// Mock de AppModal y AppToast para evitar efectos secundarios en el DOM global
vi.mock('../../../shared/components/AppModal.js', () => ({
  AppModal: {
    open: vi.fn(),
    close: vi.fn()
  }
}))

vi.mock('../../../shared/components/AppToast.js', () => ({
  AppToast: {
    success: vi.fn(),
    error: vi.fn()
  }
}))

describe('Programas Integration', () => {
  let container

  beforeEach(() => {
    container = document.createElement('div')
    vi.clearAllMocks()
  })

  it('should render the programs list correctly', async () => {
    const mockProgramas = [
      { id: '1', nombre: 'Programa A', nivel: 'inicial', activo: true, created_at: new Date().toISOString() },
      { id: '2', nombre: 'Programa B', nivel: 'avanzado', activo: false, created_at: new Date().toISOString() }
    ]
    programasApi.obtenerProgramas.mockResolvedValue(mockProgramas)

    await renderProgramasView(container)

    expect(container.querySelector('.page-title').textContent).toContain('Programas')
    expect(container.querySelectorAll('#programasTBody tr').length).toBe(2)
    expect(container.textContent).toContain('Programa A')
    expect(container.textContent).toContain('Programa B')
  })

  it('should filter programs by search term', async () => {
    const mockProgramas = [
      { id: '1', nombre: 'Cuerdas', nivel: '1', activo: true },
      { id: '2', nombre: 'Vientos', nivel: '2', activo: true }
    ]
    programasApi.obtenerProgramas.mockResolvedValue(mockProgramas)

    await renderProgramasView(container)

    const searchInput = container.querySelector('#buscar')
    searchInput.value = 'Cuerdas'
    searchInput.dispatchEvent(new Event('input'))

    expect(container.querySelectorAll('#programasTBody tr').length).toBe(1)
    expect(container.textContent).toContain('Cuerdas')
    expect(container.textContent).not.toContain('Vientos')
  })

  it('should open the create modal when "Nuevo" is clicked', async () => {
    programasApi.obtenerProgramas.mockResolvedValue([])
    await renderProgramasView(container)

    const btnNuevo = container.querySelector('#btnAgregarPrograma')
    btnNuevo.click()

    expect(AppModal.open).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Nuevo Programa' })
    )
  })

  it('should handle API errors gracefully', async () => {
    programasApi.obtenerProgramas.mockRejectedValue(new Error('API Failure'))
    
    await renderProgramasView(container)

    expect(container.querySelector('.alert-danger')).toBeTruthy()
    expect(container.textContent).toContain('API Failure')
  })
})

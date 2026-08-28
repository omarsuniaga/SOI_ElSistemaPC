import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderDuplicadosWorkbenchView } from '../../../src/modules/alumnos/views/duplicadosWorkbenchView.js'
import { router } from '../../../src/core/router/router.js'
import * as alumnosApi from '../../../src/modules/alumnos/api/alumnosApi.js'

vi.mock('../../../src/core/router/router.js', () => ({
  router: {
    navigate: vi.fn(),
  },
}))

vi.mock('../../../src/shared/components/AppToast.js', () => ({
  AppToast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock('../../../src/shared/components/AppModal.js', () => ({
  AppModal: {
    open: vi.fn(),
    showLoading: vi.fn(),
    hideLoading: vi.fn(),
  },
}))

vi.mock('../../../src/modules/alumnos/api/alumnosApi.js', () => ({
  obtenerTodosLosAlumnosParaAnalisis: vi.fn(),
  obtenerInscripcionesDetalladasAlumno: vi.fn(),
  fusionarAlumnos: vi.fn(),
}))

describe('duplicadosWorkbenchView (Workbench 2-Panel View)', () => {
  let container

  beforeEach(() => {
    vi.clearAllMocks()
    document.body.innerHTML = ''
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  it('muestra el estado limpio cuando no existen alumnos duplicados', async () => {
    alumnosApi.obtenerTodosLosAlumnosParaAnalisis.mockResolvedValue([
      { id: '1', nombre_completo: 'Carlos Santana', padre_nombre: 'José Santana' },
      { id: '2', nombre_completo: 'Mariana Lopez', padre_nombre: 'Pedro Lopez' },
    ])

    await renderDuplicadosWorkbenchView(container)

    expect(container.innerHTML).toContain('¡Base de Alumnos Impecable!')
    expect(container.innerHTML).toContain('No se detectaron registros duplicados')
  })

  it('renderiza el layout con panel izquierdo y derecho cuando se detectan parejas duplicadas', async () => {
    alumnosApi.obtenerTodosLosAlumnosParaAnalisis.mockResolvedValue([
      { id: '1', nombre_completo: 'Matias Paredes', padre_nombre: 'Carlos Paredes', instrumento_principal: 'Violín' },
      { id: '2', nombre_completo: 'Mathias Alejandro Paredes Masuoka', padre_nombre: 'Carlos Paredes', instrumento_principal: 'Violín' },
    ])

    alumnosApi.obtenerInscripcionesDetalladasAlumno.mockImplementation(async (id) => {
      if (id === '1') return [{ id: 'c1', nombre: 'Violín I', clase_horarios: [{ dia: 'Lunes', hora_inicio: '15:30:00' }] }]
      if (id === '2') return [{ id: 'c2', nombre: 'Coro Infantil', clase_horarios: [{ dia: 'Sábado', hora_inicio: '10:00:00' }] }]
      return []
    })

    await renderDuplicadosWorkbenchView(container)

    // Panel Izquierdo: Cola de Revisión
    expect(container.innerHTML).toContain('Cola de Revisión')
    expect(container.innerHTML).toContain('input-buscar-cola')

    // Panel Derecho: Tarjetas y Consolidación
    expect(container.innerHTML).toContain('Matias Paredes')
    expect(container.innerHTML).toContain('Mathias Alejandro Paredes Masuoka')
    expect(container.innerHTML).toContain('Consolidación automática de clases')
    expect(container.innerHTML).toContain('Resolución Campo a Campo')
    expect(container.innerHTML).toContain('btnConfirmarFusion')
  })

  it('permite alternar el alumno Principal haciendo clic en la tarjeta y ejecutar la fusión', async () => {
    alumnosApi.obtenerTodosLosAlumnosParaAnalisis.mockResolvedValue([
      { id: '1', nombre_completo: 'Matias Paredes', padre_nombre: 'Carlos Paredes' },
      { id: '2', nombre_completo: 'Mathias Alejandro Paredes Masuoka', padre_nombre: 'Carlos Paredes' },
    ])
    alumnosApi.obtenerInscripcionesDetalladasAlumno.mockResolvedValue([])
    alumnosApi.fusionarAlumnos.mockResolvedValue({ success: true, principal_id: '1' })

    await renderDuplicadosWorkbenchView(container)

    // Clic en la tarjeta A para fijarlo como principal
    const cardA = container.querySelector('#card-select-a')
    expect(cardA).not.toBeNull()
    cardA.click()

    // Confirmar Fusión
    const btnConfirmar = container.querySelector('#btnConfirmarFusion')
    expect(btnConfirmar).not.toBeNull()
    await btnConfirmar.click()

    expect(alumnosApi.fusionarAlumnos).toHaveBeenCalledWith(expect.objectContaining({
      principalId: '1',
      obsoletoId: '2',
      datosFusion: expect.any(Object),
    }))

    // Al liquidar la única pareja, pasa a estado vacío
    expect(container.innerHTML).toContain('¡Base de Alumnos Impecable!')
  })
})

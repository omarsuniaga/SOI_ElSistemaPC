import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DuplicadosModal } from '../../../src/modules/alumnos/components/DuplicadosModal.js'
import { AppModal } from '../../../src/shared/components/AppModal.js'
import * as alumnosApi from '../../../src/modules/alumnos/api/alumnosApi.js'

vi.mock('../../../src/shared/components/AppModal.js', () => ({
  AppModal: {
    open: vi.fn(),
    close: vi.fn(),
    showLoading: vi.fn(),
    hideLoading: vi.fn(),
  },
}))

vi.mock('../../../src/shared/components/AppToast.js', () => ({
  AppToast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock('../../../src/modules/alumnos/api/alumnosApi.js', () => ({
  obtenerTodosLosAlumnosParaAnalisis: vi.fn(),
  obtenerInscripcionesDetalladasAlumno: vi.fn(),
  fusionarAlumnos: vi.fn(),
}))

describe('DuplicadosModal (Zero-Friction Flow)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('analiza automáticamente de forma inmediata y muestra la lista de duplicados encontrados', async () => {
    const alumnos = [
      { id: '1', nombre_completo: 'Matias Paredes', padre_nombre: 'Carlos Paredes' },
      { id: '2', nombre_completo: 'Mathias Alejandro Paredes Masuoka', padre_nombre: 'Carlos Paredes' },
    ]

    await DuplicadosModal.abrir({ alumnos })

    // Se salta el modal previo de bienvenida y abre directo la lista de resultados
    expect(AppModal.open).toHaveBeenCalledTimes(1)
    const listArgs = AppModal.open.mock.calls[0][0]
    expect(listArgs.title).toContain('Alumnos duplicados detectados (1)')
  })

  it('permite abrir el detalle de una pareja, cargando clases de ambos', async () => {
    const alumnos = [
      { id: '1', nombre_completo: 'Matias Paredes', padre_nombre: 'Carlos Paredes' },
      { id: '2', nombre_completo: 'Mathias Alejandro Paredes Masuoka', padre_nombre: 'Carlos Paredes' },
    ]

    alumnosApi.obtenerInscripcionesDetalladasAlumno.mockImplementation(async (id) => {
      if (id === '1') return [{ id: 'c1', nombre: 'Iniciación Musical', clase_horarios: [{ dia: 'Lunes', hora_inicio: '15:30:00' }] }]
      if (id === '2') return [{ id: 'c2', nombre: 'Coro Infantil', clase_horarios: [{ dia: 'Sábado', hora_inicio: '10:00:00' }] }]
      return []
    })

    await DuplicadosModal.abrir({ alumnos })

    // Inspect list modal onShow
    const listModal = AppModal.open.mock.calls[0][0]
    const dummyContainer = document.createElement('div')
    dummyContainer.innerHTML = listModal.body
    listModal.onShow(dummyContainer)

    const btnRevisar = dummyContainer.querySelector('[data-action="revisar"]')
    expect(btnRevisar).not.toBeNull()
    btnRevisar.click()

    // Wait for microtasks (detail loading)
    await new Promise((r) => setTimeout(r, 20))

    expect(alumnosApi.obtenerInscripcionesDetalladasAlumno).toHaveBeenCalledWith('1')
    expect(alumnosApi.obtenerInscripcionesDetalladasAlumno).toHaveBeenCalledWith('2')

    // Detail modal opened
    const detailModal = AppModal.open.mock.calls[1][0]
    expect(detailModal.title).toBe('Revisar y fusionar alumnos')
    expect(detailModal.body).toContain('Iniciación Musical')
    expect(detailModal.body).toContain('Coro Infantil')
    expect(detailModal.body).toContain('Fusión de clases')
  })

  it('ejecuta fusionarAlumnos al confirmar y mantiene el flujo de duplicados pendientes', async () => {
    alumnosApi.fusionarAlumnos.mockResolvedValue({ success: true, principal_id: '2', eliminado: true })
    alumnosApi.obtenerInscripcionesDetalladasAlumno.mockResolvedValue([])

    const alumnos = [
      { id: '1', nombre_completo: 'Matias Paredes', padre_nombre: 'Carlos Paredes' },
      { id: '2', nombre_completo: 'Mathias Alejandro Paredes Masuoka', padre_nombre: 'Carlos Paredes' },
    ]

    const onSuccess = vi.fn()
    await DuplicadosModal.abrir({ alumnos, onSuccess })

    const dummyContainer = document.createElement('div')
    dummyContainer.innerHTML = AppModal.open.mock.calls[0][0].body
    AppModal.open.mock.calls[0][0].onShow(dummyContainer)
    dummyContainer.querySelector('[data-action="revisar"]').click()

    await new Promise((r) => setTimeout(r, 20))

    const detailModal = AppModal.open.mock.calls[1][0]
    await detailModal.onSave()

    expect(alumnosApi.fusionarAlumnos).toHaveBeenCalledWith(expect.objectContaining({
      principalId: expect.any(String),
      obsoletoId: expect.any(String),
      datosFusion: expect.any(Object),
    }))
    expect(onSuccess).toHaveBeenCalled()

    // Final screen when all are resolved
    expect(AppModal.open).toHaveBeenCalledTimes(3)
    const finalModal = AppModal.open.mock.calls[2][0]
    expect(finalModal.title).toBe('Alumnos duplicados')
    expect(finalModal.body).toContain('Base de datos optimizada')
  })
})

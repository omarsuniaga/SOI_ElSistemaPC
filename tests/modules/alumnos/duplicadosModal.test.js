import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DuplicadosModal } from '../../../src/modules/alumnos/components/DuplicadosModal.js'
import { AppModal } from '../../../src/shared/components/AppModal.js'
import * as alumnosApi from '../../../src/modules/alumnos/api/alumnosApi.js'

vi.mock('../../../src/shared/components/AppModal.js', () => ({
  AppModal: {
    open: vi.fn(),
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

describe('DuplicadosModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('abre el detector inicial y permite analizar la lista', async () => {
    const alumnos = [
      { id: '1', nombre_completo: 'Matias Paredes', padre_nombre: 'Carlos Paredes' },
      { id: '2', nombre_completo: 'Mathias Alejandro Paredes Masuoka', padre_nombre: 'Carlos Paredes' },
    ]

    await DuplicadosModal.abrir({ alumnos })
    expect(AppModal.open).toHaveBeenCalled()
    const callArgs = AppModal.open.mock.calls[0][0]
    expect(callArgs.title).toBe('Detectar alumnos duplicados')

    // Simulate clicking Analizar
    await callArgs.onSave()

    // Second modal opened with results
    expect(AppModal.open).toHaveBeenCalledTimes(2)
    const listArgs = AppModal.open.mock.calls[1][0]
    expect(listArgs.title).toContain('Alumnos duplicados encontrados (1)')
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
    const initialOnSave = AppModal.open.mock.calls[0][0].onSave
    await initialOnSave()

    // Inspect list modal onShow
    const listModal = AppModal.open.mock.calls[1][0]
    const dummyContainer = document.createElement('div')
    dummyContainer.innerHTML = listModal.body
    listModal.onShow(dummyContainer)

    const card = dummyContainer.querySelector('[data-duplicado-idx="0"]')
    expect(card).not.toBeNull()
    card.click()

    // Wait for microtasks (detail loading)
    await new Promise((r) => setTimeout(r, 20))

    expect(alumnosApi.obtenerInscripcionesDetalladasAlumno).toHaveBeenCalledWith('1')
    expect(alumnosApi.obtenerInscripcionesDetalladasAlumno).toHaveBeenCalledWith('2')

    // Detail modal opened
    const detailModal = AppModal.open.mock.calls[2][0]
    expect(detailModal.title).toBe('Revisar y fusionar alumnos')
    expect(detailModal.body).toContain('Iniciación Musical')
    expect(detailModal.body).toContain('Coro Infantil')
    expect(detailModal.body).toContain('Fusión de clases')
  })

  it('ejecuta fusionarAlumnos al confirmar en el modal de detalle', async () => {
    alumnosApi.fusionarAlumnos.mockResolvedValue({ success: true, principal_id: '2', eliminado: true })
    alumnosApi.obtenerInscripcionesDetalladasAlumno.mockResolvedValue([])

    const alumnos = [
      { id: '1', nombre_completo: 'Matias Paredes', padre_nombre: 'Carlos Paredes' },
      { id: '2', nombre_completo: 'Mathias Alejandro Paredes Masuoka', padre_nombre: 'Carlos Paredes' },
    ]

    const onSuccess = vi.fn()
    await DuplicadosModal.abrir({ alumnos, onSuccess })
    await AppModal.open.mock.calls[0][0].onSave()

    const dummyContainer = document.createElement('div')
    dummyContainer.innerHTML = AppModal.open.mock.calls[1][0].body
    AppModal.open.mock.calls[1][0].onShow(dummyContainer)
    dummyContainer.querySelector('[data-duplicado-idx="0"]').click()

    await new Promise((r) => setTimeout(r, 20))

    const detailModal = AppModal.open.mock.calls[2][0]
    await detailModal.onSave()

    expect(alumnosApi.fusionarAlumnos).toHaveBeenCalledWith(expect.objectContaining({
      principalId: expect.any(String),
      obsoletoId: expect.any(String),
      datosFusion: expect.any(Object),
    }))
    expect(onSuccess).toHaveBeenCalled()
  })
})

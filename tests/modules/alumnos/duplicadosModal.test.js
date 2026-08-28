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

const parejaAlumnos = () => [
  { id: '1', nombre_completo: 'Matias Paredes', padre_nombre: 'Carlos Paredes' },
  { id: '2', nombre_completo: 'Mathias Alejandro Paredes Masuoka', padre_nombre: 'Carlos Paredes' },
]

const ultimoOpen = () => AppModal.open.mock.calls[AppModal.open.mock.calls.length - 1][0]

describe('DuplicadosModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    alumnosApi.obtenerInscripcionesDetalladasAlumno.mockResolvedValue([])
  })

  it('analiza automáticamente al abrir y muestra la lista sin pantallas intermedias', async () => {
    await DuplicadosModal.abrir({ alumnos: parejaAlumnos() })

    // No hay botón "Analizar": la última vista es directamente la lista.
    const listArgs = ultimoOpen()
    expect(listArgs.title).toContain('pareja(s) por revisar')
    expect(listArgs.hideSave).toBe(true)
  })

  it('carga automáticamente los alumnos cuando no se pasan por parámetro', async () => {
    alumnosApi.obtenerTodosLosAlumnosParaAnalisis.mockResolvedValue(parejaAlumnos())

    await DuplicadosModal.abrir({})

    expect(alumnosApi.obtenerTodosLosAlumnosParaAnalisis).toHaveBeenCalled()
    expect(ultimoOpen().title).toContain('pareja(s) por revisar')
  })

  it('permite abrir el detalle de una pareja cargando clases de ambos', async () => {
    alumnosApi.obtenerInscripcionesDetalladasAlumno.mockImplementation(async (id) => {
      if (id === '1') return [{ id: 'c1', nombre: 'Iniciación Musical', clase_horarios: [{ dia: 'Lunes', hora_inicio: '15:30:00' }] }]
      if (id === '2') return [{ id: 'c2', nombre: 'Coro Infantil', clase_horarios: [{ dia: 'Sábado', hora_inicio: '10:00:00' }] }]
      return []
    })

    await DuplicadosModal.abrir({ alumnos: parejaAlumnos() })

    const listModal = ultimoOpen()
    const dummyContainer = document.createElement('div')
    dummyContainer.innerHTML = listModal.body
    listModal.onShow(dummyContainer)
    dummyContainer.querySelector('[data-duplicado-idx="0"]').click()

    await new Promise((r) => setTimeout(r, 20))

    expect(alumnosApi.obtenerInscripcionesDetalladasAlumno).toHaveBeenCalledWith('1')
    expect(alumnosApi.obtenerInscripcionesDetalladasAlumno).toHaveBeenCalledWith('2')

    const detailModal = ultimoOpen()
    expect(detailModal.title).toBe('Revisar y fusionar alumnos')
    expect(detailModal.body).toContain('Iniciación Musical')
    expect(detailModal.body).toContain('Coro Infantil')
    expect(detailModal.body).toContain('Fusión de clases')
    expect(detailModal.body).toContain('btn-volver-lista')
  })

  it('tras fusionar mantiene el modal abierto y vuelve a la lista con la cola actualizada', async () => {
    alumnosApi.fusionarAlumnos.mockResolvedValue({ success: true, principal_id: '2', eliminado: true })

    const onSuccess = vi.fn()
    await DuplicadosModal.abrir({ alumnos: parejaAlumnos(), onSuccess })

    const listModal = ultimoOpen()
    const dummyContainer = document.createElement('div')
    dummyContainer.innerHTML = listModal.body
    listModal.onShow(dummyContainer)
    dummyContainer.querySelector('[data-duplicado-idx="0"]').click()
    await new Promise((r) => setTimeout(r, 20))

    const detailModal = ultimoOpen()
    const openCountAntes = AppModal.open.mock.calls.length
    const resultado = await detailModal.onSave()

    // onSave devuelve false => AppModal NO cierra el modal.
    expect(resultado).toBe(false)
    expect(alumnosApi.fusionarAlumnos).toHaveBeenCalledWith(expect.objectContaining({
      principalId: expect.any(String),
      obsoletoId: expect.any(String),
      datosFusion: expect.any(Object),
    }))

    // Se re-renderizó una vista (vuelta a la lista / estado vacío).
    expect(AppModal.open.mock.calls.length).toBeGreaterThan(openCountAntes)

    // onSuccess todavía NO se llamó: se difiere al cierre.
    expect(onSuccess).not.toHaveBeenCalled()

    // Al cerrar el modal se emite la actualización una sola vez.
    ultimoOpen().onCancel()
    expect(onSuccess).toHaveBeenCalledTimes(1)
  })

  it('no llama onSuccess si el usuario cierra sin fusionar', async () => {
    const onSuccess = vi.fn()
    await DuplicadosModal.abrir({ alumnos: parejaAlumnos(), onSuccess })

    ultimoOpen().onCancel()
    expect(onSuccess).not.toHaveBeenCalled()
  })

  it('muestra estado vacío cuando no hay duplicados', async () => {
    await DuplicadosModal.abrir({
      alumnos: [
        { id: '1', nombre_completo: 'Ana Torres' },
        { id: '2', nombre_completo: 'Pedro Gómez' },
      ],
    })

    expect(ultimoOpen().body).toContain('No se encontraron alumnos duplicados')
  })
})

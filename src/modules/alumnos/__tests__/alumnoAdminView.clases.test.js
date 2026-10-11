/**
 * alumnoAdminView.clases.test.js
 * La pestaña "Clases" del perfil del alumno debe permitir gestionar sus
 * inscripciones: quitar de una clase, editar el turno (clases rotativas) y
 * añadir a una clase nueva — no solo listarlas de forma read-only.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const mockAppModalOpen = vi.fn()
vi.mock('../../../shared/components/AppModal.js', () => ({
  AppModal: { open: (...args) => mockAppModalOpen(...args), close: vi.fn() },
}))
vi.mock('../../../shared/components/AppToast.js', () => ({
  AppToast: { success: vi.fn(), error: vi.fn() },
}))

const inscripcionesMock = vi.fn()
vi.mock('../api/alumnosApi.js', () => ({
  obtenerAlumno: vi.fn().mockResolvedValue({
    id: 'al-1', nombre_completo: 'Daraling Peguero', activo: true, instrumento_principal: 'Violín',
  }),
  obtenerInscripcionesDetalladasAlumno: (...args) => inscripcionesMock(...args),
  obtenerProgresoAlumno: vi.fn().mockResolvedValue(null),
  obtenerResumenAcademico: vi.fn().mockResolvedValue(null),
  obtenerAsistenciasAlumno: vi.fn().mockResolvedValue([]),
  actualizarAlumno: vi.fn(),
  reactivarAlumno: vi.fn(),
}))

const obtenerClasesMock = vi.fn()
const inscribirAlumnoMock = vi.fn().mockResolvedValue({})
const desinscribirAlumnoMock = vi.fn().mockResolvedValue(undefined)
const actualizarTurnoMock = vi.fn().mockResolvedValue({})
vi.mock('../../clases/api/clasesApi.js', () => ({
  obtenerClases: (...args) => obtenerClasesMock(...args),
  inscribirAlumno: (...args) => inscribirAlumnoMock(...args),
  desinscribirAlumno: (...args) => desinscribirAlumnoMock(...args),
  actualizarTurnoInscripcion: (...args) => actualizarTurnoMock(...args),
}))

vi.mock('../components/AlumnoForm.js', () => ({
  AlumnoForm: {},
  SECTIONS: { personal: [], madre: [], padre: [], representante: [], salud: [], musical: [] },
}))
vi.mock('../components/PostulanteResolver.js', () => ({ PostulanteResolver: { resolve: vi.fn() } }))
vi.mock('../components/AlumnoDeleteModal.js', () => ({ AlumnoDeleteModal: { open: vi.fn() } }))
vi.mock('../domain/generarPdfInscripcion.js', () => ({
  descargarFichaAlumno: vi.fn(), descargarConstancia: vi.fn(),
}))

import { renderAlumnoAdminView } from '../views/alumnoAdminView.js'
import { AppToast } from '../../../shared/components/AppToast.js'

const claseFija = {
  id: 'c-fija', nombre: 'Iniciación de Piano', tipo_clase: 'fija',
  clase_horarios: [{ dia: 'jueves', hora_inicio: '14:00:00', hora_fin: '15:00:00' }],
  turno: null,
}
const claseRotativa = {
  id: 'c-rot', nombre: '2A - Clases de Violines', tipo_clase: 'rotativa',
  clase_horarios: [{ dia: 'lunes', hora_inicio: '17:00:00', hora_fin: '18:00:00' }],
  turno: { dia: 'lunes', hora_inicio: '17:00:00', hora_fin: '18:00:00' },
}

async function montar() {
  const container = document.createElement('div')
  document.body.appendChild(container)
  await renderAlumnoAdminView(container, { id: 'al-1' })
  return container
}

describe('alumnoAdminView — gestión de clases del alumno', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    document.body.innerHTML = ''
    inscripcionesMock.mockResolvedValue([claseFija, claseRotativa])
    obtenerClasesMock.mockResolvedValue([
      { id: 'c-fija', nombre: 'Iniciación de Piano', tipo_clase: 'fija', activo: true },
      { id: 'c-rot', nombre: '2A - Clases de Violines', tipo_clase: 'rotativa', activo: true },
      { id: 'c-nueva', nombre: 'Coro Infantil', instrumento: 'Vocal', tipo_clase: 'fija', activo: true },
    ])
  })

  afterEach(() => vi.unstubAllGlobals())

  it('cada clase inscrita tiene un botón para quitarla', async () => {
    const container = await montar()
    const panel = container.querySelector('#panel-clases')

    expect(panel.querySelectorAll('[data-quitar-clase]')).toHaveLength(2)
  })

  it('"Editar turno" solo aparece en clases rotativas', async () => {
    const container = await montar()
    const panel = container.querySelector('#panel-clases')

    expect(panel.querySelector('[data-editar-turno="c-fija"]')).toBeNull()
    expect(panel.querySelector('[data-editar-turno="c-rot"]')).not.toBeNull()
  })

  it('quitar de una clase pide confirmación (AppModal, no window.confirm) y llama a desinscribirAlumno(claseId, alumnoId)', async () => {
    const container = await montar()
    const panel = container.querySelector('#panel-clases')

    panel.querySelector('[data-quitar-clase="c-fija"]').click()
    await vi.waitFor(() => expect(mockAppModalOpen).toHaveBeenCalled())

    const opts = mockAppModalOpen.mock.calls[0][0]
    expect(opts.body).toContain('Iniciación de Piano')
    expect(desinscribirAlumnoMock).not.toHaveBeenCalled() // aún no confirmó

    const resultado = await opts.onSave()

    expect(resultado).not.toBe(false)
    expect(desinscribirAlumnoMock).toHaveBeenCalledWith('c-fija', 'al-1')
    expect(AppToast.success).toHaveBeenCalled()
  })

  it('si no se confirma en el modal (onSave nunca se llama), no llama a desinscribirAlumno', async () => {
    const container = await montar()
    const panel = container.querySelector('#panel-clases')

    panel.querySelector('[data-quitar-clase="c-fija"]').click()
    await vi.waitFor(() => expect(mockAppModalOpen).toHaveBeenCalled())

    expect(desinscribirAlumnoMock).not.toHaveBeenCalled()
  })

  it('editar turno abre un modal con los valores actuales y guarda con actualizarTurnoInscripcion', async () => {
    const container = await montar()
    const panel = container.querySelector('#panel-clases')

    panel.querySelector('[data-editar-turno="c-rot"]').click()
    await vi.waitFor(() => expect(mockAppModalOpen).toHaveBeenCalled())

    const opts = mockAppModalOpen.mock.calls[0][0]
    const body = document.createElement('div')
    body.innerHTML = opts.body
    opts.onShow?.(body)

    expect(body.querySelector('#turno-dia').value).toBe('lunes')
    expect(body.querySelector('#turno-hora-inicio').value).toBe('17:00')

    body.querySelector('#turno-hora-fin').value = '18:30'
    const resultado = await opts.onSave(body)

    expect(resultado).not.toBe(false)
    expect(actualizarTurnoMock).toHaveBeenCalledWith('c-rot', 'al-1', '17:00', '18:30', 'lunes')
  })

  it('"Añadir a una clase" abre un modal con las clases donde el alumno no está inscrito', async () => {
    const container = await montar()
    const panel = container.querySelector('#panel-clases')

    panel.querySelector('#btn-agregar-clase').click()
    await vi.waitFor(() => expect(mockAppModalOpen).toHaveBeenCalled())

    const opts = mockAppModalOpen.mock.calls[0][0]
    const body = document.createElement('div')
    body.innerHTML = opts.body
    document.body.appendChild(body)
    opts.onShow?.(body)

    expect(body.textContent).toContain('Coro Infantil')
    expect(body.textContent).not.toContain('Iniciación de Piano')
    expect(body.textContent).not.toContain('2A - Clases de Violines')
  })

  it('seleccionar una clase y guardar llama a inscribirAlumno(claseId, alumnoId, ...)', async () => {
    const container = await montar()
    const panel = container.querySelector('#panel-clases')

    panel.querySelector('#btn-agregar-clase').click()
    await vi.waitFor(() => expect(mockAppModalOpen).toHaveBeenCalled())

    const opts = mockAppModalOpen.mock.calls[0][0]
    const body = document.createElement('div')
    body.innerHTML = opts.body
    document.body.appendChild(body)
    opts.onShow?.(body)

    body.querySelector('[data-clase-id="c-nueva"]').click()
    const resultado = await opts.onSave(body)

    expect(resultado).not.toBe(false)
    expect(inscribirAlumnoMock).toHaveBeenCalledWith('c-nueva', 'al-1', null, null, null)
    expect(AppToast.success).toHaveBeenCalled()
  })

  it('sin ninguna clase seleccionada, guardar no llama a inscribirAlumno', async () => {
    const container = await montar()
    const panel = container.querySelector('#panel-clases')

    panel.querySelector('#btn-agregar-clase').click()
    await vi.waitFor(() => expect(mockAppModalOpen).toHaveBeenCalled())

    const opts = mockAppModalOpen.mock.calls[0][0]
    const body = document.createElement('div')
    body.innerHTML = opts.body
    document.body.appendChild(body)
    opts.onShow?.(body)

    const resultado = await opts.onSave(body)

    expect(resultado).toBe(false)
    expect(inscribirAlumnoMock).not.toHaveBeenCalled()
  })

  it('después de quitar/añadir, la lista se refresca con obtenerInscripcionesDetalladasAlumno', async () => {
    const container = await montar()
    const panel = container.querySelector('#panel-clases')
    inscripcionesMock.mockClear()

    panel.querySelector('[data-quitar-clase="c-fija"]').click()
    await vi.waitFor(() => expect(mockAppModalOpen).toHaveBeenCalled())
    await mockAppModalOpen.mock.calls[0][0].onSave()

    expect(inscripcionesMock).toHaveBeenCalledWith('al-1')
  })
})

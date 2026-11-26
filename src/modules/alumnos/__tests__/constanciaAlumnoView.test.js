import { describe, it, expect, vi, beforeEach } from 'vitest'
const mocks = vi.hoisted(() => ({
  alumno: vi.fn(), clases: vi.fn(), inscription: vi.fn(), studies: vi.fn(), save: vi.fn(), navigate: vi.fn(),
}))
vi.mock('../../../core/router/router.js', () => ({ router: { _portalPrefix: '/admin', navigate: mocks.navigate } }))
vi.mock('../api/alumnosApi.js', () => ({ obtenerAlumno: mocks.alumno, obtenerInscripcionesDetalladasAlumno: mocks.clases }))
vi.mock('../domain/generarPdfInscripcion.js', () => ({ descargarConstancia: mocks.inscription, generarConstanciaEstudios: mocks.studies }))
import { renderConstanciaInscripcionView, renderConstanciaEstudiosView } from '../views/constanciaAlumnoView.js'

const student = { id: 'al-1', nombre_completo: 'Ana Pérez', fecha_ingreso: '2024-05-01', instrumento_principal: 'Viola', activo: true }
let container
beforeEach(() => {
  vi.clearAllMocks()
  container = document.createElement('div')
  document.body.replaceChildren(container)
  mocks.alumno.mockResolvedValue(student)
  mocks.clases.mockResolvedValue([])
  mocks.studies.mockReturnValue({ save: mocks.save })
})
const submit = () => container.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))

describe('Generación de constancias por alumno', () => {
  it('precarga el alumno seleccionado y genera solo el documento de estudios', async () => {
    await renderConstanciaEstudiosView(container, { id: 'al-1' })
    expect(mocks.alumno).toHaveBeenCalledWith('al-1')
    expect(container.querySelector('[name="nombre_completo"]').value).toBe('Ana Pérez')
    expect(container.querySelector('[name="representante_nombre"]')).toBeNull()
    container.querySelector('#certificate-reviewed').checked = true
    submit()
    await vi.waitFor(() => expect(mocks.save).toHaveBeenCalledWith('constancia-estudios-ana-pérez.pdf'))
    expect(mocks.inscription).not.toHaveBeenCalled()
  })
  it('bloquea datos faltantes y permite completarlos sin cambiar el alumno cargado', async () => {
    mocks.alumno.mockResolvedValue({ ...student, fecha_ingreso: null })
    await renderConstanciaEstudiosView(container, { id: 'al-1' })
    container.querySelector('#certificate-reviewed').checked = true
    submit()
    expect(mocks.studies).not.toHaveBeenCalled()
    expect(container.querySelector('[name="fecha_ingreso"]').classList.contains('is-invalid')).toBe(true)
    container.querySelector('[name="fecha_ingreso"]').value = '2023-09-01'
    submit()
    await vi.waitFor(() => expect(mocks.studies).toHaveBeenCalledWith(expect.objectContaining({ id: 'al-1', fecha_ingreso: '2023-09-01' })))
    expect(student.fecha_ingreso).toBe('2024-05-01')
  })
  it('requiere revisar datos y completar la identidad del representante para inscripción', async () => {
    await renderConstanciaInscripcionView(container, { id: 'al-1' })
    submit()
    expect(mocks.inscription).not.toHaveBeenCalled()
    for (const [key, value] of Object.entries({ representante_nombre: 'José Pérez', representante_parentesco: 'Padre', representante_cedula: 'ID-001' })) {
      container.querySelector(`[name="${key}"]`).value = value
    }
    submit()
    expect(mocks.inscription).not.toHaveBeenCalled()
    container.querySelector('#certificate-reviewed').checked = true
    submit()
    await vi.waitFor(() => expect(mocks.inscription).toHaveBeenCalledWith(expect.objectContaining({ representante_nombre: 'José Pérez' })))
    expect(mocks.studies).not.toHaveBeenCalled()
  })
  it('muestra el fallo del PDF y permite reintentar', async () => {
    mocks.studies.mockImplementationOnce(() => { throw new Error('PDF unavailable') })
    await renderConstanciaEstudiosView(container, { id: 'al-1' })
    container.querySelector('#certificate-reviewed').checked = true
    submit()
    await vi.waitFor(() => expect(container.querySelector('[data-message]').textContent).toContain('No se pudo generar'))
    expect(container.querySelector('button[type="submit"]').disabled).toBe(false)
  })
  it('escapa los datos del perfil al precargar el formulario', async () => {
    mocks.alumno.mockResolvedValue({ ...student, nombre_completo: '\"><img src=x onerror=alert(1)>' })
    await renderConstanciaEstudiosView(container, { id: 'al-1' })
    expect(container.querySelector('img')).toBeNull()
    expect(container.querySelector('[name="nombre_completo"]').value).toContain('<img')
  })
  it('no emite pertenencia actual de un alumno inactivo', async () => {
    mocks.alumno.mockResolvedValue({ ...student, activo: false })
    await renderConstanciaEstudiosView(container, { id: 'al-1' })
    expect(container.textContent).toContain('inactivo')
    expect(container.querySelector('form')).toBeNull()
  })
  it('maneja un enlace sin alumno o un error de carga', async () => {
    await renderConstanciaEstudiosView(container)
    expect(container.textContent).toContain('Selecciona primero')
    expect(mocks.alumno).not.toHaveBeenCalled()
    mocks.alumno.mockRejectedValueOnce(new Error('Unauthorized'))
    await renderConstanciaEstudiosView(container, { id: 'al-1' })
    expect(container.textContent).toContain('No se pudieron cargar')
  })
})

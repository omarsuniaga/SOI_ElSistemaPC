import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../../modules/clases/api/clasesApi.js', () => ({
  obtenerClasesPorMaestro: vi.fn(),
  obtenerAlumnosInscritos: vi.fn(),
  obtenerAlumnosSinClase: vi.fn(),
  inscribirAlumno: vi.fn(),
  desinscribirAlumno: vi.fn(),
}))

vi.mock('../../../modules/alumnos/api/alumnosApi.js', () => ({
  obtenerAlumnos: vi.fn(),
  crearAlumno: vi.fn(),
}))

vi.mock('../../../modules/clases/components/claseModal.js', () => ({
  openClaseModal: vi.fn(),
}))

vi.mock('../../auth/maestroAuth.js', () => ({
  getMaestroLocal: vi.fn(),
}))

vi.mock('../../api/crearClasePortalApi.js', () => ({
  obtenerDatosCreadorClases: vi.fn(),
}))

vi.mock('../../services/permisoService.js', () => ({
  getPermisos: vi.fn(),
  solicitarPermiso: vi.fn(),
}))

vi.mock('../../../shared/components/AppToast.js', () => ({
  AppToast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

import { renderGestionarClasesView } from '../gestionarClasesView.js'
import {
  obtenerClasesPorMaestro,
  obtenerAlumnosInscritos,
  obtenerAlumnosSinClase,
} from '../../../modules/clases/api/clasesApi.js'
import { obtenerAlumnos } from '../../../modules/alumnos/api/alumnosApi.js'
import { openClaseModal } from '../../../modules/clases/components/claseModal.js'
import { getMaestroLocal } from '../../auth/maestroAuth.js'
import { obtenerDatosCreadorClases } from '../../api/crearClasePortalApi.js'
import { getPermisos } from '../../services/permisoService.js'

describe('gestionarClasesView', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>'
    vi.clearAllMocks()

    getMaestroLocal.mockReturnValue({ id: 'maestro-1', nombre_completo: 'Maestro Uno' })
    getPermisos.mockResolvedValue({ puede_inscribir_clases: true, puede_crear_clases: false })
    obtenerClasesPorMaestro.mockResolvedValue([
      {
        id: 'clase-1',
        nombre: 'Violin',
        horarios: [],
        capacidad_maxima: 10,
        maestro_principal_id: 'maestro-1',
      },
    ])
    obtenerAlumnosInscritos.mockResolvedValue([])
    obtenerAlumnosSinClase.mockResolvedValue([])
    obtenerDatosCreadorClases.mockResolvedValue({
      maestros: [{ id: 'maestro-1', nombre_completo: 'Maestro Uno' }],
      salones: [],
      programas: [],
      alumnos: [],
    })
  })

  it('normaliza el payload de alumnos y renderiza sin romper cuando viene como { alumnos, total }', async () => {
    obtenerAlumnos.mockResolvedValue({
      alumnos: [
        { id: 'alumno-1', nombre_completo: 'Ana', instrumento_principal: 'Violin', activo: true },
      ],
      total: 1,
    })

    const container = document.getElementById('app')

    await renderGestionarClasesView(container)
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(obtenerAlumnos).toHaveBeenCalled()
    expect(container.querySelector('#gcv-clase-list')).toBeTruthy()
    expect(container.querySelector('#gcv-panel')).toBeTruthy()
    expect(container.textContent).toContain('Mis Clases')
  })

  it('permite filtrar disponibles para mostrar solo alumnos sin clase', async () => {
    obtenerAlumnos.mockResolvedValue([
      { id: 'alumno-1', nombre_completo: 'Ana', instrumento_principal: 'Violin', activo: true },
      { id: 'alumno-2', nombre_completo: 'Pedro', instrumento_principal: 'Piano', activo: true },
    ])
    obtenerAlumnosSinClase.mockResolvedValue([
      {
        instrumento: 'Violin',
        total: 1,
        alumnos: [{ id: 'alumno-1', nombre_completo: 'Ana', instrumento_principal: 'Violin' }],
      },
    ])

    const container = document.getElementById('app')
    await renderGestionarClasesView(container)
    await new Promise((resolve) => setTimeout(resolve, 0))

    const rows = container.querySelectorAll('.disponible-item')
    expect(rows).toHaveLength(2)

    const toggle = container.querySelector('#gcv-filter-sin-clase')
    toggle.checked = true
    toggle.dispatchEvent(new Event('change'))

    expect(rows[0].style.display).toBe('')
    expect(rows[1].style.display).toBe('none')
    expect(container.querySelector('#gcv-count-disponibles').textContent).toContain('1 de 2')
  })

  it('abre el editor de clase desde la vista del maestro usando el modal real', async () => {
    obtenerAlumnos.mockResolvedValue([])

    const container = document.getElementById('app')
    await renderGestionarClasesView(container)
    await new Promise((resolve) => setTimeout(resolve, 0))

    const button = container.querySelector('#gcv-btn-editar-clase')
    expect(button).toBeTruthy()

    button.click()
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(obtenerDatosCreadorClases).toHaveBeenCalledTimes(1)
    expect(openClaseModal).toHaveBeenCalledTimes(1)
    expect(openClaseModal).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'clase-1' }),
      expect.objectContaining({
        allowPrincipalTeacherSelection: false,
        lockedPrincipalTeacherId: 'maestro-1',
      }),
    )
  })

  it('permite buscar alumnos disponibles ignorando acentos y mayúsculas', async () => {
    obtenerAlumnos.mockResolvedValue([
      { id: 'alumno-1', nombre_completo: 'Iriam Méndez José', instrumento_principal: 'Violín', activo: true },
      { id: 'alumno-2', nombre_completo: 'Ángel Ramírez', instrumento_principal: 'Flauta', activo: true },
      { id: 'alumno-3', nombre_completo: 'Dylan Machillanda', instrumento_principal: 'Coro', activo: true },
    ])
    obtenerAlumnosSinClase.mockResolvedValue([])

    const container = document.getElementById('app')
    await renderGestionarClasesView(container)
    await new Promise((resolve) => setTimeout(resolve, 0))

    const searchInput = container.querySelector('#gcv-disponibles-search')
    const rows = container.querySelectorAll('.disponible-item')
    expect(rows).toHaveLength(3)

    // Buscar "mendez" sin acento debe encontrar "Iriam Méndez José"
    searchInput.value = 'mendez'
    searchInput.dispatchEvent(new Event('input'))

    expect(rows[0].style.display).toBe('')
    expect(rows[1].style.display).toBe('none')
    expect(rows[2].style.display).toBe('none')

    // Buscar "ángel" con acento debe encontrar "Ángel Ramírez" si se busca como "angel"
    searchInput.value = 'angel'
    searchInput.dispatchEvent(new Event('input'))

    expect(rows[0].style.display).toBe('none')
    expect(rows[1].style.display).toBe('')
    expect(rows[2].style.display).toBe('none')

    // Buscar "RAMIREZ" en mayúsculas
    searchInput.value = 'RAMIREZ'
    searchInput.dispatchEvent(new Event('input'))

    expect(rows[0].style.display).toBe('none')
    expect(rows[1].style.display).toBe('')
    expect(rows[2].style.display).toBe('none')
  })

  it('mantiene seleccionados alumnos en la cola entre múltiples búsquedas consecutivas e inscribe a todos', async () => {
    obtenerAlumnos.mockResolvedValue([
      { id: 'alumno-1', nombre_completo: 'Iriam Méndez José', instrumento_principal: 'Violín', activo: true },
      { id: 'alumno-2', nombre_completo: 'Ángel Ramírez', instrumento_principal: 'Flauta', activo: true },
      { id: 'alumno-3', nombre_completo: 'Dylan Machillanda', instrumento_principal: 'Coro', activo: true },
    ])
    obtenerAlumnosSinClase.mockResolvedValue([])

    const container = document.getElementById('app')
    await renderGestionarClasesView(container)
    await new Promise((resolve) => setTimeout(resolve, 0))

    const searchInput = container.querySelector('#gcv-disponibles-search')
    const queueBar = container.querySelector('#gcv-selection-queue-bar')
    const queueText = container.querySelector('#gcv-selection-queue-text')
    const btnInscribir = container.querySelector('#gcv-btn-inscribir')

    // 1. Buscar "iriam" y seleccionarlo
    searchInput.value = 'iriam'
    searchInput.dispatchEvent(new Event('input'))

    const cb1 = container.querySelector('.disponible-item[data-alumno-id="alumno-1"] .gcv-checkbox')
    cb1.checked = true
    cb1.dispatchEvent(new Event('change', { bubbles: true }))

    expect(queueBar.classList.contains('d-none')).toBe(false)
    expect(queueText.textContent).toContain('1 alumno seleccionado en cola')
    expect(btnInscribir.textContent).toContain('(1)')

    // 2. Nueva búsqueda "dylan" (Iriam queda oculta pero no desmarcada)
    searchInput.value = 'dylan'
    searchInput.dispatchEvent(new Event('input'))

    const cb3 = container.querySelector('.disponible-item[data-alumno-id="alumno-3"] .gcv-checkbox')
    cb3.checked = true
    cb3.dispatchEvent(new Event('change', { bubbles: true }))

    expect(queueText.textContent).toContain('2 alumnos seleccionados en cola')
    expect(btnInscribir.textContent).toContain('(2)')

    // 3. Limpiar búsqueda: ambos siguen marcados
    searchInput.value = ''
    searchInput.dispatchEvent(new Event('input'))

    const row1 = container.querySelector('.disponible-item[data-alumno-id="alumno-1"]')
    const row2 = container.querySelector('.disponible-item[data-alumno-id="alumno-2"]')
    const row3 = container.querySelector('.disponible-item[data-alumno-id="alumno-3"]')

    expect(row1.querySelector('.gcv-checkbox').checked).toBe(true)
    expect(row2.querySelector('.gcv-checkbox').checked).toBe(false)
    expect(row3.querySelector('.gcv-checkbox').checked).toBe(true)

    // 4. Inscribir seleccionados
    const { inscribirAlumno } = await import('../../../modules/clases/api/clasesApi.js')
    btnInscribir.click()
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(inscribirAlumno).toHaveBeenCalledTimes(2)
    expect(inscribirAlumno).toHaveBeenCalledWith('clase-1', 'alumno-1')
    expect(inscribirAlumno).toHaveBeenCalledWith('clase-1', 'alumno-3')
  })

  it('detecta duplicados en tiempo real al escribir en el formulario de nuevo alumno y permite inscribir existente', async () => {
    obtenerAlumnos.mockResolvedValue([
      { id: 'alumno-99', nombre_completo: 'Dylan Machillanda', instrumento_principal: 'Iniciación', familiar_telefono: '8293159040', activo: true },
    ])
    obtenerAlumnosSinClase.mockResolvedValue([])

    const container = document.getElementById('app')
    await renderGestionarClasesView(container)
    await new Promise((resolve) => setTimeout(resolve, 0))

    // 1. Abrir formulario
    container.querySelector('#gcv-btn-nuevo').click()
    const form = container.querySelector('#gcv-new-form')
    expect(form.classList.contains('d-none')).toBe(false)

    // 2. Escribir nombre coincidente
    const nameInput = container.querySelector('#gcv-nuevo-nombre')
    nameInput.value = 'dylan'
    nameInput.dispatchEvent(new Event('input'))

    const feedback = container.querySelector('#gcv-dup-feedback')
    expect(feedback.innerHTML).toContain('Dylan Machillanda')
    expect(feedback.innerHTML).toContain('Inscribir existente')

    // 3. Usar alumno existente
    const { inscribirAlumno } = await import('../../../modules/clases/api/clasesApi.js')
    const useExistingBtn = feedback.querySelector('.gcv-btn-use-existing')
    expect(useExistingBtn).toBeTruthy()
    useExistingBtn.click()
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(inscribirAlumno).toHaveBeenCalledWith('clase-1', 'alumno-99')
  })

  it('permite alternar entre las píldoras de filtro (Todos, Inscritos, Disponibles, Sin clase)', async () => {
    obtenerAlumnosInscritos.mockResolvedValue([
      { alumno_id: 'alumno-1', alumno: { id: 'alumno-1', nombre_completo: 'Ana Inscrita', instrumento_principal: 'Violín', activo: true } },
    ])
    obtenerAlumnos.mockResolvedValue([
      { id: 'alumno-1', nombre_completo: 'Ana Inscrita', instrumento_principal: 'Violín', activo: true },
      { id: 'alumno-2', nombre_completo: 'Pedro Disponible', instrumento_principal: 'Piano', activo: true },
    ])
    obtenerAlumnosSinClase.mockResolvedValue([])

    const container = document.getElementById('app')
    await renderGestionarClasesView(container)
    await new Promise((resolve) => setTimeout(resolve, 0))

    const enrolledRow = container.querySelector('.inscrito-item')
    const availableRow = container.querySelector('.disponible-item')

    // Por defecto 'all': ambos visibles
    expect(enrolledRow.style.display).toBe('')
    expect(availableRow.style.display).toBe('')

    // Filtrar solo inscritos
    const pillInscritos = container.querySelector('.gcv-pill[data-filter="inscritos"]')
    pillInscritos.click()
    expect(enrolledRow.style.display).toBe('')
    expect(availableRow.style.display).toBe('none')

    // Filtrar solo disponibles
    const pillDisponibles = container.querySelector('.gcv-pill[data-filter="disponibles"]')
    pillDisponibles.click()
    expect(enrolledRow.style.display).toBe('none')
    expect(availableRow.style.display).toBe('')
  })
})

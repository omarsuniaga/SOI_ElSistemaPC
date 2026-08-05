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
})

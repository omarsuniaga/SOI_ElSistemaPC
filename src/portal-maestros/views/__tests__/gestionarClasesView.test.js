import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../../modules/clases/api/clasesApi.js', () => ({
  obtenerClasesPorMaestro: vi.fn(),
  obtenerAlumnosInscritos: vi.fn(),
  inscribirAlumno: vi.fn(),
  desinscribirAlumno: vi.fn(),
}))

vi.mock('../../../modules/alumnos/api/alumnosApi.js', () => ({
  obtenerAlumnos: vi.fn(),
  crearAlumno: vi.fn(),
}))

vi.mock('../../auth/maestroAuth.js', () => ({
  getMaestroLocal: vi.fn(),
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
import { obtenerClasesPorMaestro, obtenerAlumnosInscritos } from '../../../modules/clases/api/clasesApi.js'
import { obtenerAlumnos } from '../../../modules/alumnos/api/alumnosApi.js'
import { getMaestroLocal } from '../../auth/maestroAuth.js'
import { getPermisos } from '../../services/permisoService.js'

describe('gestionarClasesView', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>'
    vi.clearAllMocks()
  })

  it('normaliza el payload de alumnos y renderiza sin romper cuando viene como { alumnos, total }', async () => {
    getMaestroLocal.mockReturnValue({ id: 'maestro-1' })
    getPermisos.mockResolvedValue({ puede_inscribir_clases: true })
    obtenerClasesPorMaestro.mockResolvedValue([
      { id: 'clase-1', nombre: 'Violín', horarios: [], capacidad_maxima: 10 },
    ])
    obtenerAlumnos.mockResolvedValue({
      alumnos: [
        { id: 'alumno-1', nombre_completo: 'Ana', instrumento_principal: 'Violín', activo: true },
      ],
      total: 1,
    })
    obtenerAlumnosInscritos.mockResolvedValue([])

    const container = document.getElementById('app')

    await renderGestionarClasesView(container)
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(obtenerAlumnos).toHaveBeenCalled()
    expect(container.querySelector('#gcv-clase-list')).toBeTruthy()
    expect(container.querySelector('#gcv-panel')).toBeTruthy()
    expect(container.textContent).toContain('Mis Clases')
  })
})

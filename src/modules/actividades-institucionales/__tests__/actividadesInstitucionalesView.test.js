import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../api/actividadesInstitucionalesApi.js', () => ({
  listarActividades: vi.fn(),
  crearActividad: vi.fn(),
  previsualizarImpacto: vi.fn(),
  listarAlumnosDeClase: vi.fn(),
  aprobarActividad: vi.fn(),
  rechazarActividad: vi.fn(),
  obtenerListaAsistenciaActividad: vi.fn(),
  registrarAsistenciaActividad: vi.fn(),
}))
vi.mock('../../programas/api/programasApi.js', () => ({ obtenerProgramas: vi.fn().mockResolvedValue([]) }))
vi.mock('../../clases/api/clasesApi.js', () => ({ obtenerClases: vi.fn().mockResolvedValue([]) }))
vi.mock('../../maestros/api/maestrosApi.js', () => ({ obtenerMaestrosActivos: vi.fn().mockResolvedValue([]) }))
vi.mock('../../../shared/components/AppToast.js', () => ({
  AppToast: { success: vi.fn(), error: vi.fn(), warning: vi.fn() },
}))

import { renderActividadesInstitucionalesView } from '../views/actividadesInstitucionalesView.js'
import {
  listarActividades,
  crearActividad,
  previsualizarImpacto,
  listarAlumnosDeClase,
  aprobarActividad,
  rechazarActividad,
  obtenerListaAsistenciaActividad,
  registrarAsistenciaActividad,
} from '../api/actividadesInstitucionalesApi.js'
import { AppToast } from '../../../shared/components/AppToast.js'

const flush = () => new Promise((resolve) => setTimeout(resolve, 0))

function actividad(overrides = {}) {
  return {
    id: 'act-1',
    titulo: 'Feriado de prueba',
    descripcion: '',
    categoria: 'feriado',
    alcance: 'institucional',
    fechaInicio: '2026-11-10',
    fechaFin: '2026-11-10',
    ubicacion: '',
    programasConvocados: [],
    clasesConvocadas: [],
    responsableAsistenciaId: null,
    requiereAprobacion: true,
    estado: 'pendiente_revision',
    aprobadoPor: null,
    aprobadoEn: null,
    motivoRechazo: null,
    creadoPor: 'demo-admin',
    version: 1,
    createdAt: '2026-11-01T00:00:00Z',
    ...overrides,
  }
}

describe('actividadesInstitucionalesView', () => {
  let container

  beforeEach(() => {
    vi.clearAllMocks()
    container = document.createElement('div')
    document.body.appendChild(container)
    listarActividades.mockResolvedValue([actividad()])
    previsualizarImpacto.mockResolvedValue([])
  })

  afterEach(() => {
    container.remove()
    document.getElementById('app-modal-backdrop')?.remove()
    document.getElementById('app-modal')?.remove()
  })

  it('carga y muestra la bandeja de pendientes por defecto', async () => {
    await renderActividadesInstitucionalesView(container)
    await flush()

    expect(container.textContent).toContain('Feriado de prueba')
    expect(container.querySelector('.ai-tab[data-estado="pendiente_revision"]').className).toContain('btn-primary')
  })

  it('crea una propuesta con los datos del formulario', async () => {
    crearActividad.mockResolvedValue(actividad({ id: 'act-2', titulo: 'Nueva actividad' }))
    listarActividades.mockResolvedValueOnce([actividad()]).mockResolvedValueOnce([actividad(), actividad({ id: 'act-2', titulo: 'Nueva actividad' })])

    await renderActividadesInstitucionalesView(container)
    await flush()

    container.querySelector('#ai-btn-crear').click()
    await flush()

    const modalBody = document.querySelector('.app-modal-body')
    modalBody.querySelector('#ai-c-titulo').value = 'Nueva actividad'
    modalBody.querySelector('#ai-c-fecha-inicio').value = '2026-11-15'
    modalBody.querySelector('#ai-c-fecha-fin').value = '2026-11-15'
    document.querySelector('.app-modal-btn-save').click()
    await flush()

    expect(crearActividad).toHaveBeenCalledWith(expect.objectContaining({
      titulo: 'Nueva actividad',
      fechaInicio: '2026-11-15',
      fechaFin: '2026-11-15',
      categoria: 'actividad_especial',
      alcance: 'institucional',
    }))
    expect(AppToast.success).toHaveBeenCalled()
  })

  it('no crea si falta el título', async () => {
    await renderActividadesInstitucionalesView(container)
    await flush()

    container.querySelector('#ai-btn-crear').click()
    await flush()
    const modalBody = document.querySelector('.app-modal-body')
    modalBody.querySelector('#ai-c-fecha-inicio').value = '2026-11-15'
    modalBody.querySelector('#ai-c-fecha-fin').value = '2026-11-15'
    document.querySelector('.app-modal-btn-save').click()
    await flush()

    expect(crearActividad).not.toHaveBeenCalled()
    expect(AppToast.error).toHaveBeenCalledWith(expect.stringContaining('título'))
  })

  it('precarga la fecha al venir de "Actividad especial" en Clases de Hoy', async () => {
    await renderActividadesInstitucionalesView(container, { crear: true, fecha: '2026-11-20' })
    await flush()

    const modalBody = document.querySelector('.app-modal-body')
    expect(modalBody.querySelector('#ai-c-fecha-inicio').value).toBe('2026-11-20')
  })

  it('revisar: calcula impacto, aprueba con la decisión elegida y refresca la lista', async () => {
    previsualizarImpacto.mockResolvedValue([
      { claseId: 'clase-1', claseNombre: 'Violín A', programaId: 'prog-1', totalAlumnos: 5, decisionVigente: null },
    ])
    aprobarActividad.mockResolvedValue({ evento_id: 'act-1', estado: 'aprobado', version: 2, afectaciones_creadas: 1, exenciones_creadas: 0, convocatoria_creada: 0 })
    listarActividades
      .mockResolvedValueOnce([actividad()])
      .mockResolvedValueOnce([actividad({ estado: 'aprobado' })])

    await renderActividadesInstitucionalesView(container)
    await flush()

    container.querySelector('.ai-btn-revisar').click()
    await flush()
    await flush()

    const modalBody = document.querySelector('.app-modal-body')
    expect(modalBody.textContent).toContain('Violín A')

    const select = modalBody.querySelector('.ai-select-tipo')
    select.value = 'suspendida'
    select.dispatchEvent(new Event('change'))

    document.querySelector('.app-modal-btn-save').click()
    await flush()

    expect(aprobarActividad).toHaveBeenCalledWith(
      'act-1',
      [expect.objectContaining({ claseId: 'clase-1', fecha: '2026-11-10', tipoAfectacion: 'suspendida' })],
      [],
      null,
    )
    expect(AppToast.success).toHaveBeenCalledWith(expect.stringContaining('aprobada'))
  })

  it('revisar: al elegir impartida_con_exencion carga y permite marcar alumnos exentos', async () => {
    previsualizarImpacto.mockResolvedValue([
      { claseId: 'clase-1', claseNombre: 'Violín A', programaId: 'prog-1', totalAlumnos: 2, decisionVigente: null },
    ])
    listarAlumnosDeClase.mockResolvedValue([{ id: 'al-1', nombreCompleto: 'Alumno Uno' }])
    aprobarActividad.mockResolvedValue({ evento_id: 'act-1', estado: 'aprobado', version: 2 })
    listarActividades.mockResolvedValueOnce([actividad()]).mockResolvedValueOnce([actividad({ estado: 'aprobado' })])

    await renderActividadesInstitucionalesView(container)
    await flush()
    container.querySelector('.ai-btn-revisar').click()
    await flush()
    await flush()

    const modalBody = document.querySelector('.app-modal-body')
    const select = modalBody.querySelector('.ai-select-tipo')
    select.value = 'impartida_con_exencion'
    select.dispatchEvent(new Event('change'))
    await flush()

    const chk = modalBody.querySelector('.ai-chk-exento')
    expect(chk).toBeTruthy()
    chk.checked = true
    chk.dispatchEvent(new Event('change'))

    document.querySelector('.app-modal-btn-save').click()
    await flush()

    expect(aprobarActividad).toHaveBeenCalledWith(
      'act-1',
      [expect.objectContaining({ tipoAfectacion: 'impartida_con_exencion', exentos: ['al-1'] })],
      [],
      null,
    )
  })

  it('revisar: rechazar pide motivo y no llama a aprobar', async () => {
    const promptSpy = vi.spyOn(window, 'prompt').mockReturnValue('No corresponde')
    rechazarActividad.mockResolvedValue({ evento_id: 'act-1', estado: 'rechazado' })
    listarActividades.mockResolvedValueOnce([actividad()]).mockResolvedValueOnce([actividad({ estado: 'rechazado' })])

    await renderActividadesInstitucionalesView(container)
    await flush()
    container.querySelector('.ai-btn-revisar').click()
    await flush()
    await flush()

    document.querySelector('#ai-btn-rechazar').click()
    await flush()

    expect(rechazarActividad).toHaveBeenCalledWith('act-1', 'No corresponde')
    expect(aprobarActividad).not.toHaveBeenCalled()
    expect(AppToast.success).toHaveBeenCalledWith(expect.stringContaining('rechazada'))
    promptSpy.mockRestore()
  })

  it('pasar lista: carga el roster y guarda el cambio de estado por alumno', async () => {
    listarActividades.mockResolvedValue([actividad({ estado: 'aprobado' })])
    obtenerListaAsistenciaActividad.mockResolvedValue([
      { alumnoId: 'al-1', nombreCompleto: 'Alumno Uno', estado: 'pendiente' },
    ])
    registrarAsistenciaActividad.mockResolvedValue({ eventoId: 'act-1', alumnoId: 'al-1', estado: 'presente' })

    await renderActividadesInstitucionalesView(container)
    await flush()

    container.querySelector('.ai-tab[data-estado="aprobado"]').click()
    await flush()

    container.querySelector('.ai-btn-pasar-lista').click()
    await flush()
    await flush()

    const modalBody = document.querySelector('.app-modal-body')
    expect(modalBody.textContent).toContain('Alumno Uno')

    const select = modalBody.querySelector('.ai-select-asistencia')
    select.value = 'presente'
    select.dispatchEvent(new Event('change'))
    await flush()

    expect(registrarAsistenciaActividad).toHaveBeenCalledWith('act-1', 'al-1', 'presente')
  })
})

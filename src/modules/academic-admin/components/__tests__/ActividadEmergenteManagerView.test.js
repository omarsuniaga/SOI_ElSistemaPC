import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../../../portal-maestros/services/confirmacionesEmergentesAdapter.js', () => ({
  crearActividadInstitucional: vi.fn(),
  validarConfirmacionAcm: vi.fn(),
  obtenerTodasLasConfirmaciones: vi.fn(),
  obtenerResumenAgregado: vi.fn()
}))

import * as adapter from '../../../../portal-maestros/services/confirmacionesEmergentesAdapter.js'
import { renderActividadEmergenteManagerView } from '../ActividadEmergenteManagerView.js'

describe('ActividadEmergenteManagerView (Portal ACM)', () => {
  let container

  const mockConfirmaciones = [
    {
      id: 'conf-1',
      actividad_id: 'act-1',
      maestro_id: 'maestro-1',
      fecha: '2026-09-15',
      respuesta: 'si',
      estado_validacion: 'validado',
      actividad_info: { actividad: 'Concierto Gala' }
    },
    {
      id: 'conf-2',
      actividad_id: 'act-1',
      maestro_id: 'maestro-2',
      fecha: '2026-09-15',
      respuesta: 'no',
      estado_validacion: 'validado',
      actividad_info: { actividad: 'Concierto Gala' }
    },
    {
      id: 'conf-3',
      actividad_id: 'act-2',
      maestro_id: 'maestro-3',
      fecha: '2026-09-15',
      respuesta: 'no_se',
      estado_validacion: 'pendiente',
      observaciones: 'Tuve ensayo externo',
      actividad_info: { actividad: 'Masterclass Cuerdas' }
    },
    {
      id: 'conf-4',
      actividad_id: 'act-2',
      maestro_id: 'maestro-4',
      fecha: '2026-09-15',
      respuesta: 'no_aplica',
      estado_validacion: 'validado',
      actividad_info: { actividad: 'Masterclass Cuerdas' }
    }
  ]

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    vi.clearAllMocks()

    adapter.obtenerResumenAgregado.mockImplementation((items = []) => ({
      total: items.length,
      si: items.filter(i => i.respuesta === 'si').length,
      no: items.filter(i => i.respuesta === 'no').length,
      no_aplica: items.filter(i => i.respuesta === 'no_aplica').length,
      no_se: items.filter(i => i.respuesta === 'no_se').length,
      por_maestro: {}
    }))
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('crear actividad con alcance="institucion" notifica y difunde a todos los maestros', async () => {
    adapter.obtenerTodasLasConfirmaciones.mockResolvedValue([])
    adapter.crearActividadInstitucional.mockResolvedValueOnce({
      actividad: { id: 'act-inst-new', actividad: 'Gira Nacional' },
      maestros_notificados: ['m1', 'm2', 'm3', 'm4', 'm5']
    })

    const onCreadaSpy = vi.fn()
    renderActividadEmergenteManagerView(container, { onActividadCreada: onCreadaSpy })

    await vi.waitFor(() => {
      expect(container.querySelector('[data-role="btn-submit-actividad"]')).toBeTruthy()
    })

    const inputNombre = container.querySelector('[data-role="input-actividad-nombre"]')
    inputNombre.value = 'Gira Nacional'
    inputNombre.dispatchEvent(new Event('input'))

    const selectAlcance = container.querySelector('[data-role="select-actividad-alcance"]')
    selectAlcance.value = 'institucion'
    selectAlcance.dispatchEvent(new Event('change'))

    const btnSubmit = container.querySelector('[data-role="btn-submit-actividad"]')
    btnSubmit.click()

    await vi.waitFor(() => {
      expect(adapter.crearActividadInstitucional).toHaveBeenCalledWith(expect.objectContaining({
        actividad: 'Gira Nacional',
        alcance_tipo: 'institucion'
      }))
      expect(onCreadaSpy).toHaveBeenCalled()
      expect(container.textContent).toContain('Actividad creada, 5 maestros notificados.')
    })
  })

  it('crear actividad con alcance="programa" difunde con programa_id en alcance_config', async () => {
    adapter.obtenerTodasLasConfirmaciones.mockResolvedValue([])
    adapter.crearActividadInstitucional.mockResolvedValueOnce({
      actividad: { id: 'act-prog-new', actividad: 'Taller de Viento' },
      maestros_notificados: ['m-viento-1', 'm-viento-2']
    })

    renderActividadEmergenteManagerView(container)

    await vi.waitFor(() => {
      expect(container.querySelector('[data-role="btn-submit-actividad"]')).toBeTruthy()
    })

    const inputNombre = container.querySelector('[data-role="input-actividad-nombre"]')
    inputNombre.value = 'Taller de Viento'
    inputNombre.dispatchEvent(new Event('input'))

    const selectAlcance = container.querySelector('[data-role="select-actividad-alcance"]')
    selectAlcance.value = 'programa'
    selectAlcance.dispatchEvent(new Event('change'))

    // Re-buscar input config dinámico generado al cambiar alcance
    const inputConfig = container.querySelector('[data-role="input-alcance-config"]')
    inputConfig.value = '{"programa_id": "prog-viento-uuid"}'
    inputConfig.dispatchEvent(new Event('input'))

    container.querySelector('[data-role="btn-submit-actividad"]').click()

    await vi.waitFor(() => {
      expect(adapter.crearActividadInstitucional).toHaveBeenCalledWith(expect.objectContaining({
        actividad: 'Taller de Viento',
        alcance_tipo: 'programa',
        alcance_config: { programa_id: 'prog-viento-uuid' }
      }))
      expect(container.textContent).toContain('Actividad creada, 2 maestros notificados.')
    })
  })

  it('tabla muestra confirmaciones y permite filtrar por maestro/fecha/estado', async () => {
    adapter.obtenerTodasLasConfirmaciones.mockResolvedValueOnce(mockConfirmaciones)

    renderActividadEmergenteManagerView(container)

    await vi.waitFor(() => {
      const filas = container.querySelectorAll('[data-role="fila-confirmacion"]')
      expect(filas.length).toBe(4)
    })

    expect(container.textContent).toContain('Concierto Gala')
    expect(container.textContent).toContain('Masterclass Cuerdas')

    // Aplicar filtro
    const filtroMaestro = container.querySelector('[data-role="filtro-maestro"]')
    filtroMaestro.value = 'maestro-3'
    filtroMaestro.dispatchEvent(new Event('input'))

    adapter.obtenerTodasLasConfirmaciones.mockResolvedValueOnce([mockConfirmaciones[2]])

    container.querySelector('[data-action="aplicar-filtros"]').click()

    await vi.waitFor(() => {
      expect(adapter.obtenerTodasLasConfirmaciones).toHaveBeenCalledWith(expect.objectContaining({
        maestro_id: 'maestro-3'
      }))
      const filasFiltradas = container.querySelectorAll('[data-role="fila-confirmacion"]')
      expect(filasFiltradas.length).toBe(1)
    })
  })

  it('validar confirmación "no_se" abre modal y cambia estado_validacion a "validado"', async () => {
    adapter.obtenerTodasLasConfirmaciones
      .mockResolvedValueOnce(mockConfirmaciones)
      .mockResolvedValueOnce([
        { ...mockConfirmaciones[2], estado_validacion: 'validado' }
      ])

    adapter.validarConfirmacionAcm.mockResolvedValueOnce({
      id: 'conf-3',
      estado_validacion: 'validado',
      observaciones: 'Aprobado por dirección técnica'
    })

    const onValidacionSpy = vi.fn()
    renderActividadEmergenteManagerView(container, { onValidacionCompletada: onValidacionSpy })

    await vi.waitFor(() => {
      expect(container.querySelectorAll('[data-role="btn-validar-acm"]').length).toBe(1)
    })

    // Click en Validar
    const btnValidar = container.querySelector('[data-role="btn-validar-acm"]')
    btnValidar.click()

    const modal = container.querySelector('[data-role="modal-validacion-acm"]')
    expect(modal).toBeTruthy()
    expect(modal.textContent).toContain('Validar Respuesta "No Sé"')

    // Escribir observación
    const inputObs = modal.querySelector('[data-role="input-observaciones-val"]')
    inputObs.value = 'Aprobado por dirección técnica'
    inputObs.dispatchEvent(new Event('input'))

    // Guardar resolución
    modal.querySelector('[data-role="btn-guardar-val"]').click()

    await vi.waitFor(() => {
      expect(adapter.validarConfirmacionAcm).toHaveBeenCalledWith(expect.objectContaining({
        confirmacion_id: 'conf-3',
        estado_validacion: 'validado',
        observaciones: 'Aprobado por dirección técnica'
      }))
      expect(onValidacionSpy).toHaveBeenCalled()
      expect(container.querySelector('[data-role="modal-validacion-acm"]')).toBeNull()
    })
  })

  it('resumen agregado cuenta correctamente los totales (si, no, no_aplica, no_se)', async () => {
    adapter.obtenerTodasLasConfirmaciones.mockResolvedValueOnce(mockConfirmaciones)

    renderActividadEmergenteManagerView(container)

    await vi.waitFor(() => {
      expect(container.querySelector('[data-role="kpi-total"]').textContent).toBe('4')
      expect(container.querySelector('[data-role="kpi-si"]').textContent).toBe('1')
      expect(container.querySelector('[data-role="kpi-no"]').textContent).toBe('1')
      expect(container.querySelector('[data-role="kpi-no_aplica"]').textContent).toBe('1')
      expect(container.querySelector('[data-role="kpi-no_se"]').textContent).toBe('1')
    })
  })
})

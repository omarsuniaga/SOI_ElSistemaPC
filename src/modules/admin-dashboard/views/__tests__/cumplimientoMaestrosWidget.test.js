import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

/**
 * cumplimientoMaestrosWidget.test.js
 *
 * Vista principal de admin con TODOS los maestros. Cubre lo agregado en
 * esta tarea: el botón "Reporte Institucional" que arma un PDF con TODAS
 * las clases de TODOS los maestros en un rango de fechas personalizable
 * (no uno de los presets del selector existente).
 */

const mockGetMaestrosComplianceStatus = vi.fn(() => Promise.resolve([]))
vi.mock('../../api/adminMaestroApi.js', () => ({
  getMaestrosComplianceStatus: (...args) => mockGetMaestrosComplianceStatus(...args),
  getSemanaActualSantoDomingo: () => ({ desde: '2026-08-17', hasta: '2026-08-23' }),
}))

vi.mock('../../../../shared/components/InfoTooltip.js', () => ({
  InfoTooltip: () => '',
  attachInfoTooltipEvents: () => {},
  injectInfoTooltipStyles: () => {},
}))

const mockCargarHistorialInstitucional = vi.fn()
vi.mock('../../../../portal-maestros/services/historialClasesService.js', () => ({
  cargarHistorialInstitucional: (...args) => mockCargarHistorialInstitucional(...args),
}))

const mockGenerateInstitutionalReportHTML = vi.fn(() => '<html>reporte-institucional</html>')
vi.mock('../../../../portal-maestros/services/reportService.js', () => ({
  generateInstitutionalReportHTML: (...args) => mockGenerateInstitutionalReportHTML(...args),
}))

const mockOpenReport = vi.fn(() => true)
vi.mock('../../../../portal-maestros/services/reportTemplates.js', () => ({
  openReport: (...args) => mockOpenReport(...args),
}))

const mockAppToast = vi.hoisted(() => ({ error: vi.fn(), info: vi.fn(), show: vi.fn() }))
vi.mock('../../../../shared/components/AppToast.js', () => ({
  AppToast: mockAppToast,
}))

vi.mock('../../../../core/router/router.js', () => ({
  router: { navigate: vi.fn() },
}))

import { CumplimientoMaestrosWidget } from '../cumplimientoMaestrosWidget.js'

function maestroCompliance(overrides) {
  return {
    maestro_id: 'maestro-1',
    maestros: { nombre_completo: 'Prof. Ana', especialidad: 'Violín' },
    es_solvente: true,
    pending_count: 0,
    vencidas_count: 0,
    total_sesiones: 4,
    registradas: 4,
    ...overrides,
  }
}

describe('CumplimientoMaestrosWidget — Reporte Institucional', () => {
  let container

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetMaestrosComplianceStatus.mockResolvedValue([maestroCompliance({})])
    mockCargarHistorialInstitucional.mockResolvedValue({ sesiones: [] })
    container = document.createElement('div')
    container.id = 'test-container'
    document.body.appendChild(container)
  })

  afterEach(() => {
    container?.remove()
  })

  async function initWidget() {
    const widget = new CumplimientoMaestrosWidget('test-container')
    await widget.init()
    return widget
  }

  it('el botón de reporte institucional aparece junto a Actualizar y Centro de Actividad', async () => {
    await initWidget()

    expect(container.querySelector('#btnReporteInstitucional')).toBeTruthy()
    expect(container.querySelector('#btnRefresh')).toBeTruthy()
    expect(container.querySelector('#btnGotoNotificaciones')).toBeTruthy()
    expect(container.textContent).toContain('Reporte Institucional')
  })

  it('el panel de rango personalizado está oculto hasta hacer click en el botón', async () => {
    await initWidget()

    expect(container.querySelector('#reportePanel')).toBeFalsy()

    container.querySelector('#btnReporteInstitucional').click()

    expect(container.querySelector('#reportePanel')).toBeTruthy()
    expect(container.querySelector('#reporteDesde')).toBeTruthy()
    expect(container.querySelector('#reporteHasta')).toBeTruthy()
  })

  it('el botón de cerrar oculta el panel de nuevo', async () => {
    await initWidget()

    container.querySelector('#btnReporteInstitucional').click()
    expect(container.querySelector('#reportePanel')).toBeTruthy()

    container.querySelector('#btnCerrarReportePanel').click()
    expect(container.querySelector('#reportePanel')).toBeFalsy()
  })

  it('genera el PDF institucional con el rango elegido por el usuario, no un preset', async () => {
    mockCargarHistorialInstitucional.mockResolvedValue({
      sesiones: [{ id: 's1', fecha: '2026-08-05', maestroNombre: 'Prof. Ana', presentes: 1, ausentes: 0, justificados: 0 }],
    })

    await initWidget()
    container.querySelector('#btnReporteInstitucional').click()

    container.querySelector('#reporteDesde').value = '2026-08-01'
    container.querySelector('#reporteDesde').dispatchEvent(new Event('change'))
    container.querySelector('#reporteHasta').value = '2026-08-10'
    container.querySelector('#reporteHasta').dispatchEvent(new Event('change'))

    container.querySelector('#btnGenerarReporteInstitucional').click()
    await new Promise((r) => setTimeout(r, 0))
    await new Promise((r) => setTimeout(r, 0))

    expect(mockCargarHistorialInstitucional).toHaveBeenCalledWith({ desde: '2026-08-01', hasta: '2026-08-10' })
    expect(mockGenerateInstitutionalReportHTML).toHaveBeenCalledOnce()
    expect(mockOpenReport).toHaveBeenCalledOnce()
  })

  it('no permite generar el reporte si "desde" es posterior a "hasta"', async () => {
    await initWidget()
    container.querySelector('#btnReporteInstitucional').click()

    container.querySelector('#reporteDesde').value = '2026-08-20'
    container.querySelector('#reporteDesde').dispatchEvent(new Event('change'))
    container.querySelector('#reporteHasta').value = '2026-08-10'
    container.querySelector('#reporteHasta').dispatchEvent(new Event('change'))

    container.querySelector('#btnGenerarReporteInstitucional').click()
    await new Promise((r) => setTimeout(r, 0))

    expect(mockAppToast.error).toHaveBeenCalled()
    expect(mockCargarHistorialInstitucional).not.toHaveBeenCalled()
  })

  it('si no hay clases en el rango, avisa y no abre ningún reporte', async () => {
    mockCargarHistorialInstitucional.mockResolvedValue({ sesiones: [] })

    await initWidget()
    container.querySelector('#btnReporteInstitucional').click()
    container.querySelector('#btnGenerarReporteInstitucional').click()
    await new Promise((r) => setTimeout(r, 0))
    await new Promise((r) => setTimeout(r, 0))

    expect(mockAppToast.info).toHaveBeenCalled()
    expect(mockOpenReport).not.toHaveBeenCalled()
  })

  it('un error al cargar el historial se reporta sin romper la vista', async () => {
    mockCargarHistorialInstitucional.mockRejectedValue(new Error('timeout de red'))

    await initWidget()
    container.querySelector('#btnReporteInstitucional').click()
    container.querySelector('#btnGenerarReporteInstitucional').click()
    await new Promise((r) => setTimeout(r, 0))
    await new Promise((r) => setTimeout(r, 0))

    expect(mockAppToast.error).toHaveBeenCalled()
    expect(mockOpenReport).not.toHaveBeenCalled()
    expect(container.querySelector('#btnReporteInstitucional')).toBeTruthy()
  })

  it('el reporte institucional no depende del preset semana/mes del selector existente', async () => {
    await initWidget()

    container.querySelector('#selectRangoFechas').value = 'mes_actual'
    container.querySelector('#selectRangoFechas').dispatchEvent(new Event('change'))
    await new Promise((r) => setTimeout(r, 0))

    container.querySelector('#btnReporteInstitucional').click()
    container.querySelector('#reporteDesde').value = '2026-01-01'
    container.querySelector('#reporteDesde').dispatchEvent(new Event('change'))
    container.querySelector('#reporteHasta').value = '2026-01-31'
    container.querySelector('#reporteHasta').dispatchEvent(new Event('change'))
    container.querySelector('#btnGenerarReporteInstitucional').click()
    await new Promise((r) => setTimeout(r, 0))
    await new Promise((r) => setTimeout(r, 0))

    expect(mockCargarHistorialInstitucional).toHaveBeenCalledWith({ desde: '2026-01-01', hasta: '2026-01-31' })
  })
})

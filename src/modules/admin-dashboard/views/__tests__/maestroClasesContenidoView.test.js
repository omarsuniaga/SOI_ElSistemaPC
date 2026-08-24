import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

/**
 * maestroClasesContenidoView.test.js
 *
 * Vista de admin/superadmin/coordinación académica sobre CUALQUIER maestro
 * (recibe maestroId por parámetro, no por sesión local). Cubre:
 * - Agrupación de sesiones por clase (no por fecha, a diferencia de la
 *   vista propia del maestro) para el vistazo aéreo por clase.
 * - Filtros de rango/clase disparan una nueva carga con ese maestroId fijo.
 * - Botón "Analizar con IA": manual, muestra el veredicto avanza/estancada,
 *   y un error de la API no rompe la vista ni inventa un veredicto falso.
 * - Reportes PDF (por sesión, por clase, y del rango completo).
 */

const mockGetMaestroProfile = vi.fn()
vi.mock('../../api/adminMaestroApi.js', () => ({
  getMaestroProfile: (...args) => mockGetMaestroProfile(...args),
}))

const mockCargarHistorialClases = vi.fn()
const mockCargarProgresosDeClase = vi.fn(() => Promise.resolve([]))
vi.mock('../../../../portal-maestros/services/historialClasesService.js', () => ({
  cargarHistorialClases: (...args) => mockCargarHistorialClases(...args),
  cargarProgresosDeClase: (...args) => mockCargarProgresosDeClase(...args),
  rangoFechas: (dias) => ({ desde: `desde-${dias}`, hasta: 'hasta' }),
  RANGOS: [
    { dias: 7, label: 'Últimos 7 días' },
    { dias: 30, label: 'Últimos 30 días' },
    { dias: 90, label: 'Últimos 90 días' },
  ],
}))

const mockGenerateDailyReport = vi.fn()
const mockGenerateRangeReportHTML = vi.fn(() => '<html>reporte</html>')
vi.mock('../../../../portal-maestros/services/reportService.js', () => ({
  generateDailyReport: (...args) => mockGenerateDailyReport(...args),
  generateRangeReportHTML: (...args) => mockGenerateRangeReportHTML(...args),
}))

const mockOpenReport = vi.fn(() => true)
vi.mock('../../../../portal-maestros/services/reportTemplates.js', () => ({
  openReport: (...args) => mockOpenReport(...args),
}))

const mockAnalyzeClassProgress = vi.fn()
vi.mock('../../../../portal-maestros/services/groqService.js', () => ({
  analyzeClassProgress: (...args) => mockAnalyzeClassProgress(...args),
}))

const mockNavigate = vi.fn()
vi.mock('../../../../core/router/router.js', () => ({
  router: { navigate: (...args) => mockNavigate(...args) },
}))

import { MaestroClasesContenidoView } from '../maestroClasesContenidoView.js'

const CLASES = [
  { id: 'clase-1', nombre: 'Violín 101' },
  { id: 'clase-2', nombre: 'Cello 201' },
]

function sesion(overrides) {
  return {
    id: 's1',
    fecha: '2026-08-20',
    horaInicio: '14:00:00',
    horaFin: '15:00:00',
    claseId: 'clase-1',
    claseNombre: 'Violín 101',
    salonNombre: null,
    contenido: 'Escalas de Do mayor',
    presentes: 2,
    ausentes: 1,
    justificados: 0,
    totalRegistros: 3,
    roster: [
      { alumnoId: 'a1', nombre: 'Ana Torres', estado: 'P', motivo: null },
      { alumnoId: 'a2', nombre: 'Bruno Vera', estado: 'P', motivo: null },
      { alumnoId: 'a3', nombre: 'Carlos Ruiz', estado: 'A', motivo: null },
    ],
    ...overrides,
  }
}

describe('MaestroClasesContenidoView', () => {
  let container

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetMaestroProfile.mockResolvedValue({ nombre_completo: 'Prof. Ana' })
    mockCargarHistorialClases.mockResolvedValue({ clases: CLASES, sesiones: [sesion({})] })
    container = document.createElement('div')
    container.id = 'test-container'
    document.body.appendChild(container)
  })

  afterEach(() => {
    container?.remove()
  })

  async function initView(maestroId = 'maestro-1') {
    const view = new MaestroClasesContenidoView('test-container', maestroId)
    await view.init()
    return view
  }

  it('pide el historial con el maestroId recibido, no con una sesión local', async () => {
    await initView('maestro-cualquiera')

    expect(mockCargarHistorialClases).toHaveBeenCalledWith(
      expect.objectContaining({ maestroId: 'maestro-cualquiera', dias: 30, claseId: 'todas' }),
    )
  })

  it('agrupa las sesiones por clase — una tarjeta por clase, no por fecha', async () => {
    mockCargarHistorialClases.mockResolvedValue({
      clases: CLASES,
      sesiones: [
        sesion({ id: 's1', claseId: 'clase-1', claseNombre: 'Violín 101', contenido: 'contenido-violin' }),
        sesion({ id: 's2', claseId: 'clase-2', claseNombre: 'Cello 201', contenido: 'contenido-cello' }),
      ],
    })

    await initView()

    const tarjetas = container.querySelectorAll('.clase-card')
    expect(tarjetas).toHaveLength(2)
    expect(container.textContent).toContain('Violín 101')
    expect(container.textContent).toContain('Cello 201')
  })

  it('el contenido de la sesión se muestra literal y escapado', async () => {
    mockCargarHistorialClases.mockResolvedValue({
      clases: CLASES,
      sesiones: [sesion({ contenido: '<img src=x onerror=alert(1)>' })],
    })

    await initView()

    expect(container.innerHTML).not.toContain('<img src=x')
    expect(container.textContent).toContain('<img src=x onerror=alert(1)>')
  })

  it('al cambiar el rango, recarga con el mismo maestroId y el nuevo rango', async () => {
    await initView('maestro-1')
    mockCargarHistorialClases.mockClear()

    container.querySelector('#selectRango').value = '7'
    container.querySelector('#selectRango').dispatchEvent(new Event('change'))
    await new Promise((r) => setTimeout(r, 0))

    expect(mockCargarHistorialClases).toHaveBeenCalledWith(
      expect.objectContaining({ maestroId: 'maestro-1', dias: 7 }),
    )
  })

  it('el botón "Volver" navega al detalle del maestro', async () => {
    await initView('maestro-1')

    container.querySelector('#btnVolver').click()

    expect(mockNavigate).toHaveBeenCalledWith('admin-maestro-detalle', { maestroId: 'maestro-1' })
  })

  // ── Análisis con IA — manual, nunca automático ──────────────────────────

  it('no dispara el análisis solo — requiere click en "Analizar con IA"', async () => {
    await initView()

    expect(mockAnalyzeClassProgress).not.toHaveBeenCalled()
  })

  it('al hacer click, arma el veredicto y lo muestra con puntaje y resumen', async () => {
    mockAnalyzeClassProgress.mockResolvedValue({
      estado: 'estancada',
      puntaje: 40,
      resumen: 'La clase repite el mismo contenido hace varias sesiones.',
      senalesPositivas: [],
      senalesAlerta: ['Sin repertorio nuevo en 3 sesiones'],
    })

    await initView()
    container.querySelector('.btn-analizar-ia').click()
    await new Promise((r) => setTimeout(r, 0))
    await new Promise((r) => setTimeout(r, 0))

    expect(container.textContent).toContain('ESTANCADA')
    expect(container.textContent).toContain('40/100')
    expect(container.textContent).toContain('repite el mismo contenido')
    expect(container.textContent).toContain('Sin repertorio nuevo')
  })

  it('pasa el contenido de las sesiones de ESA clase y el conteo de progresos al analizador', async () => {
    mockCargarHistorialClases.mockResolvedValue({
      clases: CLASES,
      sesiones: [
        sesion({ id: 's1', claseId: 'clase-1', contenido: 'contenido-violin' }),
        sesion({ id: 's2', claseId: 'clase-2', contenido: 'contenido-cello' }),
      ],
    })
    mockCargarProgresosDeClase.mockResolvedValue([{ estado_cualitativo: 'LOGRADO' }])
    mockAnalyzeClassProgress.mockResolvedValue({ estado: 'avanza', puntaje: 90, resumen: 'ok', senalesPositivas: [], senalesAlerta: [] })

    await initView()
    const btn = [...container.querySelectorAll('.btn-analizar-ia')].find((b) => b.dataset.claseId === 'clase-1')
    btn.click()
    await new Promise((r) => setTimeout(r, 0))
    await new Promise((r) => setTimeout(r, 0))

    expect(mockCargarProgresosDeClase).toHaveBeenCalledWith('clase-1', expect.any(Object))
    const [sesionesArg, progresosArg] = mockAnalyzeClassProgress.mock.calls[0]
    expect(sesionesArg).toHaveLength(1)
    expect(sesionesArg[0].contenido).toBe('contenido-violin')
    expect(progresosArg).toEqual([{ estado_cualitativo: 'LOGRADO' }])
  })

  it('si el análisis falla, muestra el error sin inventar un veredicto', async () => {
    mockAnalyzeClassProgress.mockRejectedValue(new Error('Groq no disponible'))

    await initView()
    container.querySelector('.btn-analizar-ia').click()
    await new Promise((r) => setTimeout(r, 0))
    await new Promise((r) => setTimeout(r, 0))

    expect(container.textContent).toContain('No se pudo completar el análisis')
    expect(container.textContent).toContain('Groq no disponible')
    expect(container.textContent).not.toContain('AVANZA')
    expect(container.textContent).not.toContain('ESTANCADA')
  })

  // ── Reportes PDF ─────────────────────────────────────────────────────────

  it('genera el reporte diario al hacer click en el PDF de una sesión', async () => {
    await initView()

    container.querySelector('.btn-pdf-sesion').click()
    await new Promise((r) => setTimeout(r, 0))

    expect(mockGenerateDailyReport).toHaveBeenCalledWith('s1')
  })

  it('el reporte por clase arma el HTML solo con las sesiones de esa clase', async () => {
    mockCargarHistorialClases.mockResolvedValue({
      clases: CLASES,
      sesiones: [
        sesion({ id: 's1', claseId: 'clase-1', contenido: 'contenido-violin' }),
        sesion({ id: 's2', claseId: 'clase-2', contenido: 'contenido-cello' }),
      ],
    })

    await initView()
    const btn = [...container.querySelectorAll('.btn-pdf-clase')].find((b) => b.dataset.claseId === 'clase-2')
    btn.click()

    const [sesionesArg, contexto] = mockGenerateRangeReportHTML.mock.calls[0]
    expect(sesionesArg).toHaveLength(1)
    expect(sesionesArg[0].contenido).toBe('contenido-cello')
    expect(contexto.claseLabel).toBe('Cello 201')
    expect(mockOpenReport).toHaveBeenCalledOnce()
  })

  it('el reporte institucional completo incluye todas las clases visibles', async () => {
    mockCargarHistorialClases.mockResolvedValue({
      clases: CLASES,
      sesiones: [
        sesion({ id: 's1', claseId: 'clase-1' }),
        sesion({ id: 's2', claseId: 'clase-2' }),
      ],
    })

    await initView()
    container.querySelector('#btnReporteCompleto').click()

    const [sesionesArg, contexto] = mockGenerateRangeReportHTML.mock.calls[0]
    expect(sesionesArg).toHaveLength(2)
    expect(contexto.claseLabel).toBe('Todas las clases')
    expect(contexto.maestroNombre).toBe('Prof. Ana')
  })

  it('sin sesiones, el botón de reporte institucional está deshabilitado', async () => {
    mockCargarHistorialClases.mockResolvedValue({ clases: CLASES, sesiones: [] })

    await initView()

    expect(container.querySelector('#btnReporteCompleto').disabled).toBe(true)
  })
})

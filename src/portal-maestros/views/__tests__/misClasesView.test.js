import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

/**
 * misClasesView.test.js
 *
 * "Mis Clases Dadas": render e interacción. La lógica de datos (roster,
 * causa de justificación, respaldo de hora/salón) vive en
 * historialClasesService.js y se cubre en su propio test — acá se mockea
 * directo para no duplicar esa cobertura.
 */

vi.mock('../../auth/maestroAuth.js', () => ({
  getMaestroLocal: vi.fn(() => ({ id: 'maestro-1', nombre_completo: 'Prof. Ana' })),
}))

const mockCargarHistorialClases = vi.fn()
vi.mock('../../services/historialClasesService.js', () => ({
  cargarHistorialClases: (...args) => mockCargarHistorialClases(...args),
  RANGOS: [
    { dias: 7, label: 'Últimos 7 días' },
    { dias: 30, label: 'Últimos 30 días' },
    { dias: 90, label: 'Últimos 90 días' },
  ],
}))

vi.mock('../../services/reportService.js', () => ({
  generateDailyReport: vi.fn(),
  generateRangeReportHTML: vi.fn(() => '<html>reporte</html>'),
}))

vi.mock('../../services/reportTemplates.js', () => ({
  openReport: vi.fn(() => true),
}))

import { getMaestroLocal } from '../../auth/maestroAuth.js'
import { generateDailyReport, generateRangeReportHTML } from '../../services/reportService.js'
import { openReport } from '../../services/reportTemplates.js'

// misClasesView.js guarda `estadoActual`/`_ultimosDatos` como singletons de
// módulo (mismo patrón que metricasView.js) — sin resetModules() un test que
// cambia el filtro de clase deja ese estado pisado para el siguiente test.
let renderMisClasesView

const CLASES = [
  { id: 'clase-1', nombre: 'Violín 101' },
  { id: 'clase-2', nombre: 'Cello 201' },
]

function sesionResuelta(overrides) {
  return {
    id: 's1',
    fecha: '2026-08-20',
    horaInicio: '14:00:00',
    horaFin: '15:00:00',
    claseId: 'clase-1',
    claseNombre: 'Violín 101',
    salonNombre: null,
    contenido: '#Ana [Escalas] práctica de vibrato',
    presentes: 1,
    ausentes: 1,
    justificados: 1,
    totalRegistros: 3,
    roster: [
      { alumnoId: 'a1', nombre: 'Ana Torres', estado: 'P', motivo: null },
      { alumnoId: 'a2', nombre: 'Bruno Vera', estado: 'A', motivo: null },
      { alumnoId: 'a3', nombre: 'Carlos Ruiz', estado: 'J', motivo: 'Cita médica' },
    ],
    ...overrides,
  }
}

describe('misClasesView', () => {
  let container

  beforeEach(async () => {
    vi.resetModules()
    vi.clearAllMocks()
    ;({ renderMisClasesView } = await import('../misClasesView.js'))
    getMaestroLocal.mockReturnValue({ id: 'maestro-1', nombre_completo: 'Prof. Ana' })
    mockCargarHistorialClases.mockResolvedValue({ clases: CLASES, sesiones: [sesionResuelta({})] })
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    container?.remove()
  })

  it('muestra el contenido de la sesión literal, sin reformatear', async () => {
    await renderMisClasesView(container)

    expect(container.textContent).toContain('#Ana [Escalas] práctica de vibrato')
  })

  it('escapa HTML en el contenido para evitar inyección', async () => {
    mockCargarHistorialClases.mockResolvedValue({
      clases: CLASES,
      sesiones: [sesionResuelta({ contenido: '<img src=x onerror=alert(1)>' })],
    })

    await renderMisClasesView(container)

    expect(container.innerHTML).not.toContain('<img src=x')
    expect(container.textContent).toContain('<img src=x onerror=alert(1)>')
  })

  it('muestra un aviso cuando la sesión no tiene contenido registrado', async () => {
    mockCargarHistorialClases.mockResolvedValue({ clases: CLASES, sesiones: [sesionResuelta({ contenido: '' })] })

    await renderMisClasesView(container)

    expect(container.textContent).toContain('Sin contenido registrado')
  })

  it('muestra estado vacío cuando no hay sesiones en el rango', async () => {
    mockCargarHistorialClases.mockResolvedValue({ clases: CLASES, sesiones: [] })

    await renderMisClasesView(container)

    expect(container.textContent).toContain('No hay clases registradas en este rango')
  })

  it('sin sesión de maestro activa, muestra mensaje y no consulta datos', async () => {
    getMaestroLocal.mockReturnValueOnce(null)

    await renderMisClasesView(container)

    expect(container.textContent).toContain('No hay sesión activa')
    expect(mockCargarHistorialClases).not.toHaveBeenCalled()
  })

  it('llama a cargarHistorialClases con el maestroId de la sesión local', async () => {
    await renderMisClasesView(container)

    expect(mockCargarHistorialClases).toHaveBeenCalledWith(
      expect.objectContaining({ maestroId: 'maestro-1', dias: 30, claseId: 'todas' }),
    )
  })

  it('al cambiar el filtro de clase, recarga con el nuevo claseId', async () => {
    await renderMisClasesView(container)

    const selectClase = container.querySelector('#pm-misclases-clase')
    selectClase.value = 'clase-2'
    selectClase.dispatchEvent(new Event('change'))
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(mockCargarHistorialClases).toHaveBeenLastCalledWith(
      expect.objectContaining({ claseId: 'clase-2' }),
    )
  })

  it('el roster agrupado muestra nombres y la causa de justificación', async () => {
    await renderMisClasesView(container)

    expect(container.textContent).toContain('Presentes (1)')
    expect(container.textContent).toContain('Ana Torres')
    expect(container.textContent).toContain('Cita médica')
  })

  it('el botón de reporte por sesión es solo ícono (sin texto)', async () => {
    await renderMisClasesView(container)

    const btn = container.querySelector('.pm-misclases-btn-reporte')
    expect(btn.dataset.sesionId).toBe('s1')
    expect(btn.textContent.trim()).toBe('')
  })

  it('genera el reporte diario al hacer click en el botón por sesión', async () => {
    await renderMisClasesView(container)

    container.querySelector('.pm-misclases-btn-reporte').click()
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(generateDailyReport).toHaveBeenCalledWith('s1')
  })

  it('el botón de reporte de rango está deshabilitado sin sesiones', async () => {
    mockCargarHistorialClases.mockResolvedValue({ clases: CLASES, sesiones: [] })

    await renderMisClasesView(container)

    expect(container.querySelector('#pm-misclases-btn-reporte-rango').disabled).toBe(true)
  })

  it('el botón de reporte de rango arma el HTML y lo abre', async () => {
    await renderMisClasesView(container)

    container.querySelector('#pm-misclases-btn-reporte-rango').click()

    expect(generateRangeReportHTML).toHaveBeenCalledWith(
      expect.any(Array),
      expect.objectContaining({ maestroNombre: 'Prof. Ana', claseLabel: 'Todas mis clases' }),
    )
    expect(openReport).toHaveBeenCalledOnce()
  })

  // ── Distinción visual: clases propias vs. suplidas (SPEC §4.4/§9) ─────

  it('una sesión de una clase suplida muestra el badge "Suplencia"', async () => {
    mockCargarHistorialClases.mockResolvedValue({
      clases: CLASES,
      sesiones: [sesionResuelta({ esSuplencia: true })],
    })

    await renderMisClasesView(container)

    expect(container.textContent).toContain('Suplencia')
  })

  it('una sesión de una clase propia (titular) NO muestra el badge "Suplencia"', async () => {
    mockCargarHistorialClases.mockResolvedValue({
      clases: CLASES,
      sesiones: [sesionResuelta({ esSuplencia: false })],
    })

    await renderMisClasesView(container)

    expect(container.querySelector('.pm-misclases-card .pm-badge-info')).toBeFalsy()
  })

  it('el selector de clase marca las clases suplidas para distinguirlas de las propias', async () => {
    mockCargarHistorialClases.mockResolvedValue({
      clases: [
        { id: 'clase-1', nombre: 'Violín 101', esSuplencia: false },
        { id: 'clase-2', nombre: 'Cello 201', esSuplencia: true },
      ],
      sesiones: [sesionResuelta({})],
    })

    await renderMisClasesView(container)

    const opciones = [...container.querySelectorAll('#pm-misclases-clase option')].map((o) => o.textContent)
    expect(opciones.find((t) => t.includes('Cello 201'))).toContain('🔁')
    expect(opciones.find((t) => t.includes('Violín 101'))).not.toContain('🔁')
  })
})

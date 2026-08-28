import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const mockCargarHorarioGeneral = vi.fn()
vi.mock('../../services/horarioGeneralService.js', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    cargarHorarioGeneral: (...args) => mockCargarHorarioGeneral(...args),
  }
})

const mockGenerateHorarioGeneralReportHTML = vi.fn(() => '<html>reporte</html>')
vi.mock('../../services/horarioGeneralReportService.js', () => ({
  generateHorarioGeneralReportHTML: (...args) => mockGenerateHorarioGeneralReportHTML(...args),
}))

const mockOpenReport = vi.fn(() => true)
vi.mock('../../../../portal-maestros/services/reportTemplates.js', () => ({
  openReport: (...args) => mockOpenReport(...args),
}))

const mockNavigate = vi.hoisted(() => vi.fn())
vi.mock('../../../../core/router/router.js', () => ({
  router: { navigate: mockNavigate },
}))

import { HorarioGeneralWidget } from '../horarioGeneralView.js'

function datosBase(overrides) {
  return {
    clases: [{ id: 'c1', nombre: 'Violín 101', capacidad_maxima: 15, inscritos: 8 }],
    sesiones: [
      {
        claseId: 'c1',
        clase: 'Violín 101',
        instrumento: 'Violines',
        maestro: 'Prof. Ana',
        suplente: null,
        dia: 'lunes',
        inicio: '15:30',
        fin: '17:00',
        salon: 'Salón DeWindt',
        salonId: 's1',
        cupo: 15,
        inscritos: 8,
      },
    ],
    diagnostico: {
      stats: { totalClases: 1, totalSesiones: 1, conflictos: 0, sinSalon: 0, sobreCupo: 0, salonesEnUso: 1 },
      findings: [],
    },
    ...overrides,
  }
}

describe('HorarioGeneralWidget', () => {
  let container

  beforeEach(() => {
    vi.clearAllMocks()
    mockCargarHorarioGeneral.mockResolvedValue(datosBase())
    container = document.createElement('div')
    container.id = 'test-container'
    document.body.appendChild(container)
  })

  afterEach(() => {
    container?.remove()
  })

  async function initWidget() {
    const widget = new HorarioGeneralWidget('test-container')
    await widget.init()
    return widget
  }

  it('muestra el título y los botones de Actualizar y Descargar PDF', async () => {
    await initWidget()

    expect(container.textContent).toContain('Horario General')
    expect(container.querySelector('#btnHorarioRefresh')).toBeTruthy()
    expect(container.querySelector('#btnHorarioReporte')).toBeTruthy()
  })

  it('sin hallazgos, muestra el mensaje de todo OK', async () => {
    await initWidget()

    expect(container.textContent).toContain('No se detectaron conflictos')
  })

  it('con un conflicto, lo muestra en el diagnóstico con botón "Ver clase"', async () => {
    mockCargarHorarioGeneral.mockResolvedValue(
      datosBase({
        diagnostico: {
          stats: { totalClases: 1, totalSesiones: 1, conflictos: 1, sinSalon: 0, sobreCupo: 0, salonesEnUso: 1 },
          findings: [{ sev: 'crit', chip: 'Conflicto', claseId: 'c1', summary: 'Salón Bach se solapa.', detail: 'Reasignar.' }],
        },
      }),
    )

    await initWidget()

    expect(container.textContent).toContain('Salón Bach se solapa.')
    expect(container.querySelector('.btn-ver-clase')).toBeTruthy()
  })

  it('el botón "Ver clase" navega a Gestión de Clases con el deep-link selectedId', async () => {
    mockCargarHorarioGeneral.mockResolvedValue(
      datosBase({
        diagnostico: {
          stats: { totalClases: 1, totalSesiones: 1, conflictos: 1, sinSalon: 0, sobreCupo: 0, salonesEnUso: 1 },
          findings: [{ sev: 'crit', chip: 'Conflicto', claseId: 'c1', summary: 'x', detail: '' }],
        },
      }),
    )

    await initWidget()
    container.querySelector('.btn-ver-clase').click()
    await new Promise((r) => setTimeout(r, 0))

    expect(mockNavigate).toHaveBeenCalledWith('clases', { selectedId: 'c1' })
  })

  it('agrupa las sesiones por día', async () => {
    mockCargarHorarioGeneral.mockResolvedValue(
      datosBase({
        sesiones: [
          { claseId: 'c1', clase: 'Violín 101', instrumento: 'Violines', maestro: 'Prof. Ana', suplente: null, dia: 'lunes', inicio: '15:30', fin: '17:00', salon: 'Salón A', salonId: 's1', cupo: 15, inscritos: 8 },
          { claseId: 'c2', clase: 'Cello 201', instrumento: 'Violoncellos', maestro: 'Prof. Bruno', suplente: null, dia: 'martes', inicio: '15:30', fin: '17:00', salon: 'Salón B', salonId: 's2', cupo: 15, inscritos: 8 },
        ],
      }),
    )

    await initWidget()

    expect(container.textContent).toContain('Lunes')
    expect(container.textContent).toContain('Martes')
    expect(container.textContent).toContain('Violín 101')
    expect(container.textContent).toContain('Cello 201')
  })

  it('marca "Sin salón" y "Sobre cupo" en la fila cuando corresponde', async () => {
    mockCargarHorarioGeneral.mockResolvedValue(
      datosBase({
        sesiones: [
          { claseId: 'c1', clase: 'Violín 101', instrumento: 'Violines', maestro: 'Prof. Ana', suplente: null, dia: 'lunes', inicio: '15:30', fin: '17:00', salon: null, salonId: null, cupo: 5, inscritos: 8 },
        ],
      }),
    )

    await initWidget()

    expect(container.textContent).toContain('Sin salón')
    expect(container.textContent).toContain('Sobre cupo')
  })

  it('el botón de reporte genera el HTML y lo abre', async () => {
    await initWidget()

    container.querySelector('#btnHorarioReporte').click()
    await new Promise((r) => setTimeout(r, 0))

    expect(mockGenerateHorarioGeneralReportHTML).toHaveBeenCalledOnce()
    expect(mockOpenReport).toHaveBeenCalledOnce()
  })

  it('el botón de Actualizar vuelve a cargar los datos', async () => {
    await initWidget()
    mockCargarHorarioGeneral.mockClear()

    container.querySelector('#btnHorarioRefresh').click()
    await new Promise((r) => setTimeout(r, 0))

    expect(mockCargarHorarioGeneral).toHaveBeenCalledOnce()
  })

  it('un error al cargar se muestra sin romper la vista', async () => {
    mockCargarHorarioGeneral.mockRejectedValue(new Error('timeout de red'))

    await initWidget()

    expect(container.textContent).toContain('timeout de red')
  })
})

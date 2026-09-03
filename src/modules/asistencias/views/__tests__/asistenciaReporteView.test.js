import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../styles/asistencias.css', () => ({}))
vi.mock('../../../metricas/components/kpiCard.js', () => ({
  createKpiCard: vi.fn(({ titulo, valor }) => `<div class="kpi-mock">${titulo}: ${valor}</div>`),
}))

vi.mock('../../api/asistenciasApi.js', () => ({
  getPeriodos: vi.fn(),
  getPeriodoActivo: vi.fn(),
  getSesionesPorRango: vi.fn(),
}))

import { renderAsistenciaReporteView } from '../asistenciaReporteView.js'
import { getPeriodos, getPeriodoActivo, getSesionesPorRango } from '../../api/asistenciasApi.js'

describe('asistenciaReporteView - Render & Calculations', () => {
  let container

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    vi.clearAllMocks()
  })

  it('renders attendance report without ReferenceError when attendance totals exist', async () => {
    getPeriodos.mockResolvedValue([{ id: 'p1', nombre: 'Semestre 2026-I' }])
    getPeriodoActivo.mockResolvedValue({ id: 'p1', nombre: 'Semestre 2026-I' })
    getSesionesPorRango.mockResolvedValue([
      {
        fecha: '2026-03-01',
        sesiones: [
          {
            claseNombre: 'Cuerdas - Nivel 1',
            instrumento: 'Violín',
            totalRegistros: 20,
            totalPresentes: 18,
            totalAusentes: 2,
            totalJustificados: 0,
          },
        ],
      },
    ])

    // Should NOT throw ReferenceError: Cannot access 'tasa' before initialization
    await expect(renderAsistenciaReporteView(container)).resolves.not.toThrow()

    // Assert that KPIs and headers were rendered properly
    expect(container.textContent).toContain('Reportes de Asistencia')
    expect(container.textContent).toContain('Tasa Asistencia: 90%')
    expect(container.textContent).toContain('Ausentes: 2')
    expect(container.textContent).toContain('Cuerdas')
    expect(container.textContent).toContain('Violín')
  })
})

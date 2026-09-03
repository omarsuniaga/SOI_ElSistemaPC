import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../styles/asistencias.css', () => ({}))
vi.mock('../../../shared/components/AppToast.js', () => ({
  AppToast: { info: vi.fn(), success: vi.fn(), error: vi.fn() },
}))

const mockAppModalOpen = vi.fn()
vi.mock('../../../../shared/components/AppModal.js', () => ({
  AppModal: { open: (...args) => mockAppModalOpen(...args), close: vi.fn() },
}))

vi.mock('../../api/asistenciasApi.js', () => ({
  getPeriodos: vi.fn(),
  getPeriodoActivo: vi.fn(),
  getClases: vi.fn(),
  getReporteConsolidado: vi.fn(),
  getDetalleSesion: vi.fn(),
  ESTADO_LABEL: {},
}))

import { renderAsistenciasView } from '../asistenciasView.js'
import { getPeriodos, getPeriodoActivo, getClases, getReporteConsolidado } from '../../api/asistenciasApi.js'

describe('asistenciasView - Justificado Status & Modal', () => {
  let container

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    vi.clearAllMocks()
  })

  it('renders a clickable button for justificado students and opens AppModal on click', async () => {
    getPeriodos.mockResolvedValue([{ id: 'p1', nombre: 'Semestre 2026-I', activo: true }])
    getPeriodoActivo.mockResolvedValue({ id: 'p1', nombre: 'Semestre 2026-I' })
    getClases.mockResolvedValue([{ id: 'c1', nombre: 'Cátedra de Violín', instrumento: 'Violín', maestro_nombre: 'Carlos Gómez' }])
    getReporteConsolidado.mockResolvedValue({
      timelineByDate: [
        {
          fecha: '2026-03-10',
          clases: [
            {
              clase_id: 'c1',
              clase_nombre: 'Cátedra de Violín',
              instrumento: 'Violín',
              maestro_nombre: 'Carlos Gómez',
              hora_inicio: '14:00',
              hora_fin: '16:00',
              fecha: '2026-03-10',
              presentes: 1,
              ausentes: 0,
              justificados: 1,
              total_alumnos: 2,
              asistencias: [
                { alumno_id: 'a1', alumno_nombre: 'Sofía Martínez', estado: 'presente' },
                {
                  alumno_id: 'a2',
                  alumno_nombre: 'Mateo Rivas',
                  estado: 'justificado',
                  justificacion_texto: 'Reposo médico por cuadro viral.',
                },
              ],
              justificaciones: [
                {
                  alumno_id: 'a2',
                  motivo: 'Médico',
                  descripcion: 'Reposo médico por cuadro viral.',
                  evidencia_url: 'https://example.com/certificado.pdf',
                },
              ],
            },
          ],
        },
      ],
      resumenGlobal: { totalClases: 1, totalPresentes: 1, totalAusentes: 0, totalJustificados: 1, totalRegistros: 2, totalSesiones: 1 },
    })

    await renderAsistenciasView(container)

    // Check that the justificado button exists and has the clickable class
    const justifBtn = container.querySelector('.badge-justificado-clickable')
    expect(justifBtn).not.toBeNull()
    expect(justifBtn.textContent).toContain('Justificado')
    expect(justifBtn.getAttribute('title')).toContain('justificativo')
    expect(justifBtn.dataset.action).toBe('ver-justificacion-modal')
    expect(justifBtn.dataset.student).toBe('Mateo Rivas')

    // Trigger click on the badge
    justifBtn.dispatchEvent(new Event('click', { bubbles: true }))

    // Assert that AppModal.open was called with formatted content
    expect(mockAppModalOpen).toHaveBeenCalledTimes(1)
    const callArgs = mockAppModalOpen.mock.calls[0][0]
    expect(callArgs.title).toContain('Detalle de Inasistencia Justificada')
    expect(callArgs.body).toContain('Mateo Rivas')
    expect(callArgs.body).toContain('Cátedra de Violín')
    expect(callArgs.body).toContain('Carlos Gómez')
    expect(callArgs.body).toContain('Reposo médico por cuadro viral.')
    expect(callArgs.body).toContain('certificado.pdf')
    expect(callArgs.hideSave).toBe(true)
    expect(callArgs.cancelText).toBe('Entendido')
  })
})

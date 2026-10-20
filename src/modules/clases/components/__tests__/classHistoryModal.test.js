import { it, expect, vi } from 'vitest'
const mocks = vi.hoisted(() => ({ pdf: vi.fn(), narrative: vi.fn(), open: vi.fn() }))
vi.mock('../../../../shared/components/AppModal.js', () => ({ AppModal: { open: mocks.open } }))
vi.mock('../../../../shared/components/AppToast.js', () => ({ AppToast: { progress: () => ({ success() {}, error() {} }), error: vi.fn(), info: vi.fn() } }))
vi.mock('../../../asistencias/api/asistenciasApi.js', () => ({
  getClassRoster: async () => [{ id: 's1', name: 'Alumno actual' }],
  getDetalleSesion: async () => ({ asistencias: [], observaciones: [] }),
  getPeriodos: async () => [{ id: 'p', nombre: 'Septiembre', fecha_inicio: '2026-09-01', fecha_fin: '2026-09-30' }],
  getReporteConsolidado: async () => ({ timelineByDate: [{ fecha: '2026-09-02', clases: [{ clase_id: 'c', maestro_nombre: 'Omar', observacion_sesion: '<script>Escalas</script>', presentes: 1 }] }] }),
}))
vi.mock('../../../asistencias/services/classHistoryPdfService.js', () => ({ downloadClassHistoryPdf: mocks.pdf }))
vi.mock('../../../asistencias/services/classHealthNarrativeService.js', () => ({ generateClassNarratives: mocks.narrative }))
vi.mock('../../../../core/config/config.js', () => ({ config: { isDemoMode: false } }))
import { openClassHistoryModal } from '../classHistoryModal.js'
it('explores HTML without export and downloads the same selected analysis without another AI call', async () => {
  mocks.narrative.mockResolvedValue({ narratives: ['Trabajo de escalas'], failed: 0 })
  await openClassHistoryModal({ id: 'c', nombre: 'Violín' })
  const options = mocks.open.mock.calls[0][0]
  const body = document.createElement('div'); body.innerHTML = options.body; document.body.append(body)
  options.onShow(body)
  expect(body.querySelector('[data-history-results]').textContent).toContain('2026-09-02')
  expect(body.querySelector('script')).toBeNull()
  expect(mocks.pdf).not.toHaveBeenCalled()
  body.querySelector('[data-history-period]').value = 'p'
  body.querySelector('[data-history-mode]').value = 'ai'
  await body.querySelector('[data-history-filter]').onclick()
  expect(body.textContent).toContain('Trabajo de escalas')
  body.querySelector('[data-history-export]').click()
  expect(mocks.pdf.mock.calls[0][0]).toMatchObject({ from: '2026-09-01', to: '2026-09-30', mode: 'ai' })
  expect(mocks.narrative).toHaveBeenCalledTimes(1)
  body.remove()
})

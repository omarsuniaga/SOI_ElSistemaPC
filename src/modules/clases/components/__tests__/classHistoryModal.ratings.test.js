import { it, expect, vi } from 'vitest'
const mocks = vi.hoisted(() => ({ pdf: vi.fn(), open: vi.fn() }))
vi.mock('../../../../shared/components/AppModal.js', () => ({ AppModal: { open: mocks.open } }))
vi.mock('../../../../shared/components/AppToast.js', () => ({ AppToast: { progress: () => ({ success() {}, error() {} }), error: vi.fn(), info: vi.fn() } }))
vi.mock('../../../asistencias/api/asistenciasApi.js', () => ({
  getClassRoster: async () => [{ id: 's1', name: 'Ana' }, { id: 's2', name: 'Beto' }, { id: 's3', name: 'Carla' }],
  getPeriodos: async () => [],
  getDetalleSesion: async () => ({ valoracionesDisponibles: true, observaciones: [], asistencias: [
    { alumnoId: 's1', estado: 'presente', valoracion: 0 },
    { alumnoId: 's2', estado: 'presente', valoracion: null },
    { alumnoId: 's3', estado: 'ausente', valoracion: 5 },
  ] }),
  getReporteConsolidado: async () => ({ timelineByDate: [{ fecha: new Date().toISOString().slice(0, 10), clases: [{
    clase_id: 'c', sesion_clase_id: 'ses', maestro_nombre: 'Omar', observacion_sesion: 'Escalas',
    asistencias: [{ alumno_id: 's1', estado: 'presente' }, { alumno_id: 's2', estado: 'presente' }, { alumno_id: 's3', estado: 'ausente' }] }] }] }),
}))
vi.mock('../../../asistencias/services/classHistoryPdfService.js', () => ({ downloadClassHistoryPdf: mocks.pdf }))
vi.mock('../../../asistencias/services/classHealthNarrativeService.js', () => ({ generateClassNarratives: vi.fn() }))
vi.mock('../../../../core/config/config.js', () => ({ config: { isDemoMode: false } }))
import { openClassHistoryModal } from '../classHistoryModal.js'

it('renders the 0–5 rating in the class report: zero, sin evaluar, and not applicable for absentees', async () => {
  await openClassHistoryModal({ id: 'c', nombre: 'Violín' })
  const options = mocks.open.mock.calls[0][0]
  const body = document.createElement('div'); body.innerHTML = options.body; document.body.append(body)
  options.onShow(body)
  const status = name => [...body.querySelectorAll('details')]
    .find(d => d.querySelector('summary')?.textContent.startsWith(name))
    .querySelector('[data-rating-status]')
  expect(status('Ana').dataset.ratingStatus).toBe('rated')
  expect(status('Ana').textContent).toContain('0 estrellas')
  expect(status('Beto').dataset.ratingStatus).toBe('unrated')
  expect(status('Beto').textContent).toContain('Sin evaluar')
  expect(status('Carla').dataset.ratingStatus).toBe('not_applicable')
  expect(status('Carla').textContent).not.toContain('5/5')
  const summaryAna = [...body.querySelectorAll('summary')].find(s => s.textContent.startsWith('Ana')).textContent
  expect(summaryAna).toContain('promedio 0,0/5 (1 evaluadas, 0 sin evaluar)')
  const summaryBeto = [...body.querySelectorAll('summary')].find(s => s.textContent.startsWith('Beto')).textContent
  expect(summaryBeto).toContain('sin valoraciones (1 sin evaluar)')
  expect(summaryBeto).not.toContain('—')
  body.remove()
})

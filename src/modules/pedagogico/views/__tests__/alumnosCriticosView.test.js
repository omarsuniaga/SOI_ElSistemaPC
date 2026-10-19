import { beforeEach, expect, it, vi } from 'vitest'
vi.mock('../../../../shared/components/AppModal.js', () => ({ AppModal: { open: vi.fn(), close: vi.fn() } }))
vi.mock('../../services/alumnosCriticosService.js', () => ({
  obtenerCriticos: vi.fn(async () => Array.from({ length: 30 }, (_, i) => ({ alumno_id: String(i), nombre_completo: `Alumno ${i}`, instrumento: 'Violín', dias_ausencia_distintos: i, fechas_ausencia: [] }))),
  justificarDiaCritico: vi.fn(), filtrarCriticosPorInstrumento: (items) => items,
  renderPlantillaWhatsapp: vi.fn(), enlaceWhatsappCritico: vi.fn(), PLANTILLA_WHATSAPP_DEFAULT: '',
}))
import { renderAlumnosCriticosView } from '../alumnosCriticosView.js'
beforeEach(() => { document.body.innerHTML = ''; vi.clearAllMocks() })
it('paginates a large list and searches by alumno name', async () => {
  const container = document.body.appendChild(document.createElement('div'))
  await renderAlumnosCriticosView(container)
  expect(container.querySelectorAll('[data-ver]').length).toBe(20)
  const search = container.querySelector('#crit-search')
  search.value = 'Alumno 29'
  search.dispatchEvent(new Event('input', { bubbles: true }))
  expect(container.querySelectorAll('[data-ver]').length).toBe(1)
  expect(container.textContent).toContain('Alumno 29')
})


it('prevents duplicate justification and refreshes the open detail', async () => {
  const { AppModal } = await import('../../../../shared/components/AppModal.js')
  const { obtenerCriticos, justificarDiaCritico } = await import('../../services/alumnosCriticosService.js')
  const alumno = { alumno_id: 'a1', nombre_completo: 'Ana', dias_ausencia_distintos: 3, fechas_ausencia: ['2026-10-01'] }
  obtenerCriticos.mockResolvedValueOnce([alumno]).mockResolvedValueOnce([{ ...alumno, dias_ausencia_distintos: 2 }])
  let finish
  justificarDiaCritico.mockImplementationOnce(() => new Promise(resolve => { finish = resolve }))
  const container = document.body.appendChild(document.createElement('div'))
  await renderAlumnosCriticosView(container)
  container.querySelector('#crit-search').value = ''
  container.querySelector('#crit-search').dispatchEvent(new Event('input'))
  container.querySelector('[data-ver]').click()
  const modal = AppModal.open.mock.lastCall[0]
  const body = document.body.appendChild(document.createElement('div'))
  body.innerHTML = modal.body
  modal.onShow(body)
  body.querySelector('#crit-just-fecha').value = '2026-10-01'
  body.querySelector('#crit-just-motivo').value = 'Reposo'
  body.querySelector('#crit-just-btn').click()
  body.querySelector('#crit-just-btn').click()
  expect(justificarDiaCritico).toHaveBeenCalledTimes(1)
  finish()
  await vi.waitFor(() => expect(AppModal.open.mock.lastCall[0]).not.toBe(modal))
  expect(container.textContent).toContain('2 días')
})

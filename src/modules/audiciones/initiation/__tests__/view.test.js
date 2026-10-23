import { describe, expect, it, vi } from 'vitest'
import { mountInitiation } from '../view.js'
import { DEFAULT_RUBRIC } from '../domain.js'
import { createMockAdapter } from '../mock.js'
import fixture from '../../../../assets/data/mocks/initiation-auditions.json'
async function setup() {
  const adapter = createMockAdapter(fixture, { today: '2026-05-01' })
  const campaign = await adapter.createCampaign({ nombre: 'Audición UI', clase_origen_id: 'source', cohorte_desde: '2026-01-01', cohorte_hasta: '2026-02-01', fecha_audicion: '2026-04-15', jurados: ['demo-admin'], min_jurados: 1, rubrica: DEFAULT_RUBRIC })
  await adapter.addCandidate({ convocatoria_id: campaign.id, alumno_id: 'demo-student-1' })
  document.body.innerHTML = '<div id="app"></div>'
  const root = document.getElementById('app')
  const view = await mountInitiation(root, adapter)
  return { root, view, adapter }
}
describe('initiation jury UI', () => {
  it('saves scores, invites and shows an explicit review state', async () => {
    const { root, adapter, view } = await setup()
    root.querySelectorAll('[data-score]').forEach(el => { el.value = '3'; el.dispatchEvent(new Event('change')) })
    expect(root.querySelector('#ia-summary').textContent).toContain('6/6')
    root.querySelector('#ia-score').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    await vi.waitFor(() => expect(root.querySelector('table').textContent).toContain('Completa'))
    const form = root.querySelector('#ia-decision')
    form.elements.clase_destino_id.value = 'choir'; form.elements.revision_fecha.value = '2026-07-01'; form.elements.objetivos.value = 'Participar'; form.elements.observacion.value = 'Preparado para invitación'
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    await vi.waitFor(() => expect(root.textContent).toContain('Revisión · ronda 1'))
    expect(adapter.getDemoEnrollments().find(e => e.clase_id === 'source').activo).toBe(true)
    view.destroy()
    expect(root.innerHTML).toBe('')
  })
  it('retains the form when a decision lacks evidence', async () => {
    const { root, view } = await setup()
    const form = root.querySelector('#ia-decision')
    form.elements.observacion.value = 'Observación que se conserva'
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    await vi.waitFor(() => expect(root.querySelector('[role="alert"]').textContent).toContain('valoraciones'))
    expect(root.querySelector('#ia-decision').elements.observacion.value).toBe('Observación que se conserva')
    view.destroy()
  })
  it('explains missing backend capability instead of displaying a fabricated empty list', async () => {
    document.body.innerHTML = '<div id="app"></div>'
    const root = document.getElementById('app')
    await mountInitiation(root, { getContext: vi.fn().mockRejectedValue(new Error('Módulo no habilitado')) })
    expect(root.querySelector('[role="alert"]').textContent).toBe('Módulo no habilitado')
  })
})

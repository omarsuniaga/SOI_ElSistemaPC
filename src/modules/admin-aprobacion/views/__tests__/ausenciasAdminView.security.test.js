import { expect, it, vi } from 'vitest'
vi.mock('../../api/ausenciaAprobacionApi.js', () => ({
  aprobarAusencia: vi.fn(), rechazarAusencia: vi.fn(),
  obtenerAusenciasPendientes: vi.fn(async () => []),
  obtenerHistorialAusencias: vi.fn(async () => [{ id: '1', estado: 'aprobada', motivo: '<img src=x onerror=alert(1)>', maestros: { nombre_completo: '<script>bad</script>' }, archivo_url: 'javascript:alert(1)' }]),
}))
vi.mock('../../api/ausenciasTriageJev.js', () => ({ triageAusenciasPendientes: vi.fn(() => new Promise(() => {})) }))
import { renderAusenciasAdminView } from '../ausenciasAdminView.js'
it('renders without waiting for optional triage and safely displays history', async () => {
  const container = document.body.appendChild(document.createElement('div'))
  await renderAusenciasAdminView(container)
  container.querySelector('#aav-tab-historial').click()
  expect(container.querySelector('img, script')).toBeNull()
  expect(container.querySelector('a[href^="javascript:"]')).toBeNull()
  expect(container.textContent).toContain('<img src=x onerror=alert(1)>')
})

it('discards an older refresh that resolves after the latest one', async () => {
  const { obtenerAusenciasPendientes } = await import('../../api/ausenciaAprobacionApi.js')
  const container = document.body.appendChild(document.createElement('div'))
  let release
  obtenerAusenciasPendientes.mockImplementationOnce(() => new Promise(resolve => { release = resolve }))
  const oldLoad = renderAusenciasAdminView(container)
  await renderAusenciasAdminView(container)
  release([{ id: 'old', motivo: 'Respuesta antigua' }])
  await oldLoad
  expect(container.textContent).not.toContain('Respuesta antigua')
})

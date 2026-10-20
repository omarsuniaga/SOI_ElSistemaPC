import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
vi.mock('../../../../modules/planificacion/api/weeklyPlanAdapter.js', () => ({
  obtenerRutaActivaPorGrupo: vi.fn(async () => { throw new Error('offline') }),
}))
vi.mock('../../../../lib/supabaseClient.js', () => ({ supabase: {} }))
vi.mock('../../../../modules/planificacion/components/MapaContenidoSVG.js', () => ({ renderMapaContenidoSVG: vi.fn() }))
vi.mock('../../teacherRouteMapPanel.js', () => ({ abrirMapaDeRutas: vi.fn() }))
import { createPlanificationCard } from '../PlanificationCard.js'

describe('Academic planning disclosure', () => {
  let host, component
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    host = document.createElement('div')
    host.innerHTML = '<div id="pm-planificacion-card" class="open"><div id="pm-planificacion-header"><button>Configurar</button></div><div id="pm-planificacion-dropdown"></div><div id="pm-planificacion-nombre"></div><div id="pm-route-tree-container"></div></div>'
    document.body.appendChild(host)
    component = createPlanificationCard(host, { claseId: 'class' })
  })
  afterEach(() => { component.destroy(); host.remove(); vi.restoreAllMocks() })
  it('starts collapsed even when legacy markup includes open', () => {
    expect(host.querySelector('#pm-planificacion-card').classList.contains('open')).toBe(false)
    expect(host.querySelector('#pm-planificacion-dropdown').style.display).toBe('none')
    expect(host.querySelector('#pm-planificacion-header').getAttribute('aria-expanded')).toBe('false')
  })
  it('supports keyboard opening and does not reset teacher choice on data refresh', async () => {
    const header = host.querySelector('#pm-planificacion-header')
    header.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    expect(header.getAttribute('aria-expanded')).toBe('true')
    await component.refreshTree()
    expect(host.querySelector('#pm-planificacion-dropdown').style.display).toBe('block')
  })
  it('does not toggle when the embedded configuration button is used', () => {
    host.querySelector('button').click()
    expect(host.querySelector('#pm-planificacion-dropdown').style.display).toBe('none')
  })
})

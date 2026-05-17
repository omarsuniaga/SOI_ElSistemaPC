import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderRutaGameificadaView } from '../rutaGameificadaView.js'

describe('rutaGameificadaView', () => {
  let container

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    vi.clearAllMocks()
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('renders without crashing', async () => {
    // Mock global helpers used in rutaGameificadaView
    global.getMaestroLocal = () => ({ id: 'm1', nombre: 'Test' })
    global.getMisClases = () => Promise.resolve([{ id: 'c1', nombre: 'Grupo A' }])
    global.loadRouteTree = () => Promise.resolve([])

    await renderRutaGameificadaView(container)

    expect(container.querySelector('.pm-ruta-gamificada')).toBeTruthy()
    expect(container.querySelector('h2').textContent).toBe('Mi Ruta')
  })

  it('displays loading state initially', () => {
    global.getMaestroLocal = () => ({ id: 'm1', nombre: 'Test' })

    renderRutaGameificadaView(container)

    expect(container.querySelector('.pm-loading')).toBeTruthy()
  })

  it('handles no session gracefully', async () => {
    global.getMaestroLocal = () => null

    await renderRutaGameificadaView(container)

    expect(container.textContent).toContain('No hay sesión activa.')
  })

  it('displays class selector when classes exist', async () => {
    global.getMaestroLocal = () => ({ id: 'm1', nombre: 'Test' })
    global.getMisClases = () => Promise.resolve([
      { id: 'c1', nombre: 'Grupo A' },
      { id: 'c2', nombre: 'Grupo B' }
    ])
    global.loadRouteTree = () => Promise.resolve([])

    await renderRutaGameificadaView(container)

    const select = container.querySelector('#ruta-clase-select')
    expect(select).toBeTruthy()
    expect(select.options.length).toBe(2)
  })
})

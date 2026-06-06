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
    globalThis.getMaestroLocal = () => ({ id: 'm1', nombre: 'Test' })
    globalThis.getMisClases = () => Promise.resolve([{ id: 'c1', nombre: 'Grupo A' }])
    globalThis.loadRouteTree = () => Promise.resolve([])

    await renderRutaGameificadaView(container)

    expect(container.querySelector('.pm-ruta-gamificada')).toBeTruthy()
    expect(container.querySelector('h2').textContent).toBe('Mi Ruta')
  })

  it('displays loading state initially', () => {
    globalThis.getMaestroLocal = () => ({ id: 'm1', nombre: 'Test' })

    renderRutaGameificadaView(container)

    expect(container.querySelector('.pm-loading')).toBeTruthy()
  })

  it('handles no session gracefully', async () => {
    globalThis.getMaestroLocal = () => null

    await renderRutaGameificadaView(container)

    expect(container.textContent).toContain('No hay sesión activa.')
  })

  it('displays class selector when classes exist', async () => {
    globalThis.getMaestroLocal = () => ({ id: 'm1', nombre: 'Test' })
    globalThis.getMisClases = () => Promise.resolve([
      { id: 'c1', nombre: 'Grupo A' },
      { id: 'c2', nombre: 'Grupo B' }
    ])
    globalThis.loadRouteTree = () => Promise.resolve([])

    await renderRutaGameificadaView(container)

    const select = container.querySelector('#ruta-clase-select')
    expect(select).toBeTruthy()
    expect(select.options.length).toBe(2)
  })
})

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderRutaGameificadaView } from '../rutaGameificadaView.js'

describe('rutaGameificadaView', () => {
  let container

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('renders without crashing', async () => {
    // Mock maestro
    global.getMaestroLocal = () => ({ id: 'm1', nombre: 'Test' })
    global.getMisClases = () => Promise.resolve([{ id: 'c1', nombre: 'Grupo A' }])
    global.loadRouteTree = () => Promise.resolve([])

    await renderRutaGameificadaView(container)

    expect(container.querySelector('.pm-ruta-gamificada')).toBeTruthy()
  })

  it('displays loading state initially', () => {
    global.getMaestroLocal = () => ({ id: 'm1', nombre: 'Test' })

    renderRutaGameificadaView(container)

    expect(container.querySelector('.pm-loading')).toBeTruthy()
  })

  it('handles no session gracefully', async () => {
    global.getMaestroLocal = () => null

    await renderRutaGameificadaView(container)

    expect(container.textContent).toContain('No hay sesión')
  })
})

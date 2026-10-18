// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest'

const puede = vi.fn()
const listar = vi.fn(async () => [])
vi.mock('../api/documentosPublicosApi.js', () => ({ puedeGestionar: puede, listarPublicaciones: listar }))
const { renderDocumentosPublicosView } = await import('../views/documentosPublicosView.js')

describe('panel: pantalla de acceso restringido para quien no es administrador', () => {
  it('no carga ni lista nada si el usuario no puede gestionar (p. ej. coordinación)', async () => {
    puede.mockResolvedValue(false)
    const el = document.createElement('div')
    await renderDocumentosPublicosView(el)
    expect(el.textContent).toContain('Acceso restringido')
    expect(listar).not.toHaveBeenCalled()
    expect(el.querySelector('#dpNueva')).toBeNull()
  })
  it('muestra el panel a un administrador', async () => {
    puede.mockResolvedValue(true)
    const el = document.createElement('div')
    await renderDocumentosPublicosView(el)
    expect(el.querySelector('#dpNueva')).toBeTruthy()
  })
})

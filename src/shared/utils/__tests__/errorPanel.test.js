import { describe, expect, it } from 'vitest'
import { renderFatalErrorPanel } from '../errorPanel.js'

describe('renderFatalErrorPanel', () => {
  it('muestra los detalles dinámicos como texto literal, sin crear marcado', () => {
    const app = document.createElement('div')
    renderFatalErrorPanel(app, {
      icon: 'bi-x-circle-fill',
      title: 'Ups! Algo salió mal',
      subtitle: 'Se ha producido un error inesperado.',
      details: [{ text: '<img src=x onerror="window.__pwned=3">', style: 'color:#ef4444;' }],
    })

    expect(app.querySelector('img')).toBeNull()
    expect(app.textContent).toContain('<img src=x onerror="window.__pwned=3">')
    expect(window.__pwned).toBeUndefined()
  })

  it('conserva el título, el subtítulo y el botón de recarga estáticos', () => {
    const app = document.createElement('div')
    renderFatalErrorPanel(app, { icon: 'bi-x-circle-fill', title: 'Título', subtitle: 'Subtítulo', details: [] })

    expect(app.querySelector('h2').textContent).toBe('Título')
    expect(app.querySelector('p').textContent).toBe('Subtítulo')
    expect(app.querySelector('button').textContent).toContain('Recargar Aplicación')
  })
})

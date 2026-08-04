import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderMapaContenidoSVG } from '../MapaContenidoSVG.js'

describe('MapaContenidoSVG', () => {
  let container

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  const nodos = [
    { id: 'n1', titulo: 'Objetivo 1: Postura', estado: 'logrado' },
    { id: 'n2', titulo: 'Objetivo 2: Escalas', estado: 'pendiente' },
  ]

  it('renders svg-node-group elements as keyboard-accessible buttons with semantic labels', () => {
    renderMapaContenidoSVG({ container, nodos })

    const groups = container.querySelectorAll('.svg-node-group')
    expect(groups.length).toBe(4)
    groups.forEach((g) => {
      expect(g.getAttribute('role')).toBe('button')
      expect(g.getAttribute('tabindex')).toBe('0')
    })

    expect(groups[0].getAttribute('aria-label')).toMatch(/^Unidad 1:/)
    expect(groups[1].getAttribute('aria-label')).toMatch(/^Objetivo 1\.1:/)
    expect(groups[2].getAttribute('aria-label')).toMatch(/^Indicador 1\.1\.1:/)
  })

  it('triggers onNodeClick on click and on Enter/Space keydown with normalized nodes', () => {
    const onNodeClick = vi.fn()
    renderMapaContenidoSVG({ container, nodos, onNodeClick })

    const [firstGroup, secondGroup] = container.querySelectorAll('.svg-node-group')

    firstGroup.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(onNodeClick).toHaveBeenCalledTimes(1)
    // El componente entrega el nodo NORMALIZADO (tipo, persistido, raw, ...),
    // no el objeto crudo de entrada.
    expect(onNodeClick).toHaveBeenLastCalledWith(
      expect.objectContaining({
        id: expect.any(String),
        tipo: 'unidad',
        persistido: false,
      }),
    )

    secondGroup.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }))
    expect(onNodeClick).toHaveBeenCalledTimes(2)
    expect(onNodeClick).toHaveBeenLastCalledWith(
      expect.objectContaining({
        tipo: 'objetivo',
      }),
    )

    secondGroup.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true }))
    expect(onNodeClick).toHaveBeenCalledTimes(3)

    firstGroup.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }))
    expect(onNodeClick).toHaveBeenCalledTimes(3)
  })

  it('uses a theme-aware CSS variable for the node ring stroke instead of a hardcoded white', () => {
    renderMapaContenidoSVG({ container, nodos })

    const circles = container.querySelectorAll('.svg-node-group circle[stroke]')
    expect(circles.length).toBeGreaterThan(0)
    circles.forEach((c) => {
      expect(c.getAttribute('stroke')).toBe('#ffffff')
    })
  })

  it('renders a last unit without throwing when the final segment has no next unit', () => {
    const longNodos = [
      { id: 'n1', tipo: 'unidad', numero: '1', titulo: 'Unidad 1 · A', estado: 'logrado' },
      { id: 'n2', tipo: 'objetivo', numero: '1.1', unidadId: 'n1', titulo: 'Objetivo 1.1', estado: 'logrado' },
      { id: 'n3', tipo: 'indicador', numero: '1.1.1', unidadId: 'n1', objetivoId: 'n2', titulo: 'Indicador 1.1.1', estado: 'pendiente' },
      { id: 'n4', tipo: 'unidad', numero: '2', titulo: 'Unidad 2 · D', estado: 'pendiente' },
    ]

    expect(() => renderMapaContenidoSVG({ container, nodos: longNodos })).not.toThrow()
    expect(container.querySelectorAll('svg').length).toBe(1)
    expect(container.querySelectorAll('.svg-node-group').length).toBe(4)
  })
})

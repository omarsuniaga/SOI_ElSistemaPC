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

  it('renders svg-node-group elements as keyboard-accessible buttons', () => {
    renderMapaContenidoSVG({ container, nodos })

    const groups = container.querySelectorAll('.svg-node-group')
    expect(groups.length).toBe(2)
    groups.forEach((g) => {
      expect(g.getAttribute('role')).toBe('button')
      expect(g.getAttribute('tabindex')).toBe('0')
      expect(g.getAttribute('aria-label')).toMatch(/^Evaluar nodo:/)
    })
  })

  it('triggers onNodeClick on click and on Enter/Space keydown', () => {
    const onNodeClick = vi.fn()
    renderMapaContenidoSVG({ container, nodos, onNodeClick })

    const [firstGroup, secondGroup] = container.querySelectorAll('.svg-node-group')

    firstGroup.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(onNodeClick).toHaveBeenCalledTimes(1)
    expect(onNodeClick).toHaveBeenLastCalledWith(nodos[0])

    secondGroup.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }))
    expect(onNodeClick).toHaveBeenCalledTimes(2)
    expect(onNodeClick).toHaveBeenLastCalledWith(nodos[1])

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
      expect(c.getAttribute('stroke')).toContain('var(--bs-border-color')
    })
  })
})

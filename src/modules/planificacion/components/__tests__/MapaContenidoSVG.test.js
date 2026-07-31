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

  // ── Tarea 3.1 (mapa-gamificado-planificacion): modo + {estrellas, pctAvance, estadoVisual} ──

  describe('modo (diseno | sesion)', () => {
    it('defaults to modo="sesion" — aria-label keeps "Evaluar nodo:" for existing callers that never pass modo', () => {
      renderMapaContenidoSVG({ container, nodos })

      const group = container.querySelector('.svg-node-group')
      expect(group.getAttribute('aria-label')).toMatch(/^Evaluar nodo:/)
      expect(group.dataset.modo).toBe('sesion')
    })

    it('modo="diseno" switches the click affordance to "Editar objetivo:" and tags data-modo', () => {
      renderMapaContenidoSVG({ container, nodos, modo: 'diseno' })

      const groups = container.querySelectorAll('.svg-node-group')
      groups.forEach((g) => {
        expect(g.getAttribute('aria-label')).toMatch(/^Editar objetivo:/)
        expect(g.dataset.modo).toBe('diseno')
      })
    })

    it('still delegates the click decision to the caller via onNodeClick regardless of modo', () => {
      const onNodeClick = vi.fn()
      renderMapaContenidoSVG({ container, nodos, modo: 'diseno', onNodeClick })

      container.querySelector('.svg-node-group').dispatchEvent(new MouseEvent('click', { bubbles: true }))
      expect(onNodeClick).toHaveBeenCalledWith(nodos[0])
    })
  })

  describe('per-node {estrellas, pctAvance, estadoVisual} (vw_clase_objetivo_estrellas, REQ-07/08)', () => {
    it('renders the star count as text when the node has evaluated superadores', () => {
      const nodosConEstrellas = [
        { id: 'o1', titulo: 'Objetivo 1', estrellas: 2, pctAvance: 60, estadoVisual: 'con_estrellas' },
      ]
      renderMapaContenidoSVG({ container, nodos: nodosConEstrellas, modo: 'sesion' })

      const estrellasEl = container.querySelector('.svg-node-estrellas')
      expect(estrellasEl).toBeTruthy()
      expect(estrellasEl.textContent).toBe('★★')
    })

    it('shows a neutral "En progreso" label instead of "0★" when estadoVisual is en_progreso (REQ-08)', () => {
      const nodosSinSuperadores = [
        { id: 'o1', titulo: 'Objetivo 1', estrellas: 0, pctAvance: 50, estadoVisual: 'en_progreso' },
      ]
      renderMapaContenidoSVG({ container, nodos: nodosSinSuperadores, modo: 'sesion' })

      const estrellasEl = container.querySelector('.svg-node-estrellas')
      expect(estrellasEl.textContent).toBe('En progreso')
      expect(estrellasEl.textContent).not.toContain('0★')
    })

    it('exposes pctAvance in the node tooltip (<title>) for both modos', () => {
      const nodosConAvance = [
        { id: 'o1', titulo: 'Objetivo 1', estrellas: 1, pctAvance: 33.3, estadoVisual: 'con_estrellas' },
      ]
      renderMapaContenidoSVG({ container, nodos: nodosConAvance, modo: 'diseno' })

      const title = container.querySelector('.svg-node-group title')
      expect(title.textContent).toContain('33.3%')
    })

    it('falls back to the legacy estado-based color/rendering when estrellas is not provided (backwards compatible)', () => {
      renderMapaContenidoSVG({ container, nodos })

      expect(container.querySelector('.svg-node-estrellas')).toBeFalsy()
      const circle = container.querySelector('.svg-node-group circle[fill]')
      expect(circle.getAttribute('fill')).toBe('#10b981') // nodos[0].estado === 'logrado'
    })
  })
})

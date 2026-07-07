/**
 * Tests para acmProuestasView.js — curriculo-tres-planos WU #6.
 *
 * Vista ACM: lista propuestas de maestros pendientes de revisión, muestra el
 * árbol de contenido y permite Publicar o Devolver con feedback.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

vi.mock('../../api/propuestasAdapter.js', () => ({
  listarPropuestasPendientes: vi.fn(),
  publicarPropuesta: vi.fn(),
  devolverPropuesta: vi.fn(),
}))

import {
  listarPropuestasPendientes,
  publicarPropuesta,
  devolverPropuesta,
} from '../../api/propuestasAdapter.js'
import { renderAcmPropuestasView } from '../acmProuestasView.js'

const mockPropuesta = {
  id: 'rv-1',
  clase_id: 'clase-1',
  origen: 'maestro',
  status: 'propuesta',
  created_at: '2026-07-01T10:00:00Z',
  levels: [
    {
      id: 'lvl-1',
      level_number: 1,
      nodes: [
        {
          id: 'node-1',
          name: 'Postura',
          objetivos: [
            {
              id: 'obj-1',
              nombre: 'Mantener la espalda recta',
              indicators: [{ id: 'ind-1', description: 'Espalda alineada' }],
            },
          ],
        },
      ],
    },
  ],
}

describe('acmProuestasView', () => {
  let container

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    vi.clearAllMocks()
    window.alert = vi.fn()
    window.confirm = vi.fn().mockReturnValue(true)
  })

  afterEach(() => {
    document.body.removeChild(container)
    vi.restoreAllMocks()
  })

  it('muestra un placeholder cuando no hay propuestas pendientes', async () => {
    listarPropuestasPendientes.mockResolvedValue([])

    await renderAcmPropuestasView(container)

    expect(container.textContent).toMatch(/no hay propuestas/i)
  })

  it('lista las propuestas pendientes', async () => {
    listarPropuestasPendientes.mockResolvedValue([mockPropuesta])

    await renderAcmPropuestasView(container)

    expect(container.querySelector('[data-propuesta-id="rv-1"]')).toBeTruthy()
    expect(container.querySelectorAll('[data-propuesta-id]').length).toBe(1)
    expect(container.textContent).toContain('clase-1')
  })

  it('al seleccionar una propuesta, muestra el árbol de contenido (nivel/tema/objetivo/indicador)', async () => {
    listarPropuestasPendientes.mockResolvedValue([mockPropuesta])

    await renderAcmPropuestasView(container)
    container.querySelector('[data-propuesta-id="rv-1"]').click()

    expect(container.textContent).toContain('Postura')
    expect(container.textContent).toContain('Mantener la espalda recta')
    expect(container.textContent).toContain('Espalda alineada')
  })

  it('botón Publicar llama a publicarPropuesta con el id de la propuesta seleccionada', async () => {
    listarPropuestasPendientes.mockResolvedValue([mockPropuesta])
    publicarPropuesta.mockResolvedValue({ id: 'rv-1', status: 'published' })

    await renderAcmPropuestasView(container)
    container.querySelector('[data-propuesta-id="rv-1"]').click()
    container.querySelector('[data-action="publicar"]').click()
    await Promise.resolve()
    await Promise.resolve()

    expect(publicarPropuesta).toHaveBeenCalledWith('rv-1')
  })

  it('botón Devolver requiere feedback y llama a devolverPropuesta', async () => {
    listarPropuestasPendientes.mockResolvedValue([mockPropuesta])
    devolverPropuesta.mockResolvedValue({ id: 'rv-1', status: 'devuelta', feedback: 'Revisar nivel 2' })

    await renderAcmPropuestasView(container)
    container.querySelector('[data-propuesta-id="rv-1"]').click()

    const textarea = container.querySelector('[data-role="feedback-textarea"]')
    textarea.value = 'Revisar nivel 2'
    textarea.dispatchEvent(new Event('input'))

    container.querySelector('[data-action="devolver"]').click()
    await Promise.resolve()
    await Promise.resolve()

    expect(devolverPropuesta).toHaveBeenCalledWith('rv-1', 'Revisar nivel 2')
  })
})

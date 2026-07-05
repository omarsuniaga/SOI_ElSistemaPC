/**
 * Tests para proponerContenidoView.js — curriculo-tres-planos WU #7.
 *
 * Vista maestro: sube un archivo de planificación, lo parsea (WU #4),
 * previsualiza el árbol resultante y lo envía como propuesta (WU #7 API)
 * o lo descarta ([Cancelar]). [Borrador] mantiene el resultado en memoria
 * sin proponerlo (modo borrador explícito, nunca auto-save).
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

vi.mock('../../services/planningParserService.js', () => ({
  parsePlanningFile: vi.fn(),
}))
vi.mock('../../services/proponerContenidoAdapter.js', () => ({
  enviarPropuesta: vi.fn(),
}))

import { parsePlanningFile } from '../../services/planningParserService.js'
import { enviarPropuesta } from '../../services/proponerContenidoAdapter.js'
import { renderProponerContenidoView } from '../proponerContenidoView.js'

const estructuraParsed = {
  niveles: [
    {
      nombre: 'Nivel 1',
      numero_nivel: 1,
      temas: [
        {
          nombre: 'Postura',
          objetivos: [
            {
              nombre: 'Mantener la espalda recta',
              indicadores: [{ descripcion: 'Espalda alineada', es_requerido: true }],
            },
          ],
        },
      ],
    },
  ],
}

function makeFile(name = 'plan.md') {
  return new File(['contenido de prueba'], name, { type: 'text/markdown' })
}

describe('proponerContenidoView', () => {
  let container

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    vi.clearAllMocks()
    window.alert = vi.fn()
  })

  afterEach(() => {
    document.body.removeChild(container)
    vi.restoreAllMocks()
  })

  it('renderiza dos pestañas: Subir archivo y Revisar', () => {
    renderProponerContenidoView(container, { maestroId: 'maestro-1', claseId: 'clase-1' })

    expect(container.querySelector('[data-tab="upload"]')).toBeTruthy()
    expect(container.querySelector('[data-tab="revisar"]')).toBeTruthy()
  })

  it('al subir un archivo válido, lo parsea y cambia a la pestaña Revisar con el árbol', async () => {
    parsePlanningFile.mockResolvedValue(estructuraParsed)
    renderProponerContenidoView(container, { maestroId: 'maestro-1', claseId: 'clase-1' })

    const input = container.querySelector('[data-role="file-input"]')
    Object.defineProperty(input, 'files', { value: [makeFile()] })
    input.dispatchEvent(new Event('change'))

    await Promise.resolve()
    await Promise.resolve()
    await Promise.resolve()

    expect(parsePlanningFile).toHaveBeenCalled()
    expect(container.querySelector('[data-pane="revisar"]').classList.contains('d-none')).toBe(false)
    expect(container.textContent).toContain('Mantener la espalda recta')
  })

  it('muestra un error si el parseo falla (ej. validación de estructura) y NO avanza a Revisar', async () => {
    parsePlanningFile.mockRejectedValue(new Error('Estructura inválida: falta "temas"'))
    renderProponerContenidoView(container, { maestroId: 'maestro-1', claseId: 'clase-1' })

    const input = container.querySelector('[data-role="file-input"]')
    Object.defineProperty(input, 'files', { value: [makeFile()] })
    input.dispatchEvent(new Event('change'))

    await Promise.resolve()
    await Promise.resolve()
    await Promise.resolve()

    expect(container.textContent).toContain('Estructura inválida')
    expect(container.querySelector('[data-pane="revisar"]').classList.contains('d-none')).toBe(true)
  })

  it('botón Proponer llama a enviarPropuesta con la estructura parseada y el contexto', async () => {
    parsePlanningFile.mockResolvedValue(estructuraParsed)
    enviarPropuesta.mockResolvedValue({ id: 'rv-new' })
    renderProponerContenidoView(container, { maestroId: 'maestro-1', claseId: 'clase-1' })

    const input = container.querySelector('[data-role="file-input"]')
    Object.defineProperty(input, 'files', { value: [makeFile()] })
    input.dispatchEvent(new Event('change'))
    await Promise.resolve()
    await Promise.resolve()
    await Promise.resolve()

    container.querySelector('[data-action="proponer"]').click()
    await Promise.resolve()
    await Promise.resolve()

    expect(enviarPropuesta).toHaveBeenCalledWith(estructuraParsed, {
      maestroId: 'maestro-1',
      claseId: 'clase-1',
    })
  })

  it('botón Borrador NO llama a enviarPropuesta (modo borrador, nunca auto-guarda)', async () => {
    parsePlanningFile.mockResolvedValue(estructuraParsed)
    renderProponerContenidoView(container, { maestroId: 'maestro-1', claseId: 'clase-1' })

    const input = container.querySelector('[data-role="file-input"]')
    Object.defineProperty(input, 'files', { value: [makeFile()] })
    input.dispatchEvent(new Event('change'))
    await Promise.resolve()
    await Promise.resolve()
    await Promise.resolve()

    container.querySelector('[data-action="borrador"]').click()

    expect(enviarPropuesta).not.toHaveBeenCalled()
  })

  it('botón Cancelar descarta la estructura parseada y vuelve a la pestaña de subida', async () => {
    parsePlanningFile.mockResolvedValue(estructuraParsed)
    renderProponerContenidoView(container, { maestroId: 'maestro-1', claseId: 'clase-1' })

    const input = container.querySelector('[data-role="file-input"]')
    Object.defineProperty(input, 'files', { value: [makeFile()] })
    input.dispatchEvent(new Event('change'))
    await Promise.resolve()
    await Promise.resolve()
    await Promise.resolve()

    container.querySelector('[data-action="cancelar"]').click()

    expect(container.querySelector('[data-pane="upload"]').classList.contains('d-none')).toBe(false)
    expect(enviarPropuesta).not.toHaveBeenCalled()
  })
})

import { describe, it, expect, vi, beforeEach } from 'vitest'

/**
 * maestroRouteService.iaContexto.test.js — cubre `sugerirUnidadRutaIA`
 * (Spec A-02, openspec/changes/juego-gamificado-planificacion).
 *
 * Sistema B (maestro_routes) no tenía ningún generador IA de contenido —
 * este test cubre el nuevo, construido siguiendo el mismo patrón que
 * `sugerirRutaDidacticaIA` de Sistema A: cuando ya hay objetivos previos en
 * la ruta, se agregan al prompt pidiendo continuidad, no repetición.
 */

vi.mock('../groqService.js', () => ({
  callGroq: vi.fn(),
}))

import { callGroq } from '../groqService.js'
import { sugerirUnidadRutaIA } from '../maestroRouteService.js'

describe('sugerirUnidadRutaIA', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('parses the JSON object returned by GROQ (fenced or not)', async () => {
    callGroq.mockResolvedValue(
      '```json\n{"nombre":"Escalas","objetivos":[{"nombre":"Escala mayor","indicadores":[{"nombre":"Escala de Do mayor"}]}]}\n```',
    )

    const result = await sugerirUnidadRutaIA({ instrumento: 'Violín' })

    expect(result).toEqual({
      nombre: 'Escalas',
      objetivos: [{ nombre: 'Escala mayor', indicadores: [{ nombre: 'Escala de Do mayor' }] }],
    })
  })

  it('does not mention prior content in the prompt when the route is empty (backwards compatible)', async () => {
    callGroq.mockResolvedValue('{"nombre":"Unidad 1","objetivos":[]}')

    await sugerirUnidadRutaIA({ instrumento: 'Violín', unidadesExistentes: [] })

    const [messages] = callGroq.mock.calls[0]
    expect(messages[0].content).not.toContain('YA tiene estos objetivos')
  })

  it('includes existing objetivo names from unidadesExistentes and asks for continuity, not repetition', async () => {
    callGroq.mockResolvedValue('{"nombre":"Unidad 2","objetivos":[]}')

    await sugerirUnidadRutaIA({
      instrumento: 'Violín',
      unidadesExistentes: [
        { nombre: 'Postura y emisión de sonido', objetivos: [{ nombre: 'Postura' }, { nombre: 'Control de pulso rítmico' }] },
      ],
    })

    const [messages] = callGroq.mock.calls[0]
    expect(messages[0].content).toContain('YA tiene estos objetivos')
    expect(messages[0].content).toContain('1. Postura')
    expect(messages[0].content).toContain('2. Control de pulso rítmico')
    expect(messages[0].content).toContain('unidad NUEVA')
  })

  it('falls back to a demo unidad when GROQ fails, without throwing (does not block the teacher)', async () => {
    callGroq.mockRejectedValue(new Error('network error'))

    const result = await sugerirUnidadRutaIA({ instrumento: 'Violín' })

    expect(result.nombre).toContain('Violín')
    expect(result.objetivos.length).toBeGreaterThan(0)
  })

  it('falls back to a demo unidad when GROQ returns malformed JSON', async () => {
    callGroq.mockResolvedValue('esto no es JSON')

    const result = await sugerirUnidadRutaIA({ instrumento: 'Violín' })

    expect(result.objetivos.length).toBeGreaterThan(0)
  })
})

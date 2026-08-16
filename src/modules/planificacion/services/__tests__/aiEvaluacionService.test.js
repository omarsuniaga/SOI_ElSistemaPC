import { describe, it, expect, vi, beforeEach } from 'vitest'

/**
 * aiEvaluacionService.test.js — cubre `profesionalizarBitacoraIA` (Tarea 3.5,
 * openspec/changes/mapa-gamificado-planificacion, REQ-11).
 *
 * REQ-11: "profesionalizar con IA" MUST devolver el texto reescrito para que
 * `bitacoraSesionPanel.js` lo muestre a revisión — nunca se auto-guarda acá,
 * eso lo garantiza `bitacoraSesionService.guardarTextoProfesionalizado`
 * (Tarea 2.3, ya probado).
 */

vi.mock('../../api/groqService.js', () => ({
  callGroq: vi.fn(),
}))

import { callGroq } from '../../api/groqService.js'
import { profesionalizarBitacoraIA, sugerirRutaDidacticaIA } from '../aiEvaluacionService.js'

describe('sugerirRutaDidacticaIA', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('parses the JSON array returned by GROQ (fenced or not)', async () => {
    callGroq.mockResolvedValue(
      '```json\n[{"id":"obj-1","titulo":"Postura","indicadores":[{"id":"ind-1","titulo":"Espalda recta"}]}]\n```',
    )

    const result = await sugerirRutaDidacticaIA({ instrumento: 'Violín', nivelIndex: 0 })

    expect(result).toEqual([
      { id: 'obj-1', titulo: 'Postura', indicadores: [{ id: 'ind-1', titulo: 'Espalda recta' }] },
    ])
  })

  it('does not mention prior content in the prompt when objetivosExistentes is omitted (backwards compatible with legacy callers)', async () => {
    callGroq.mockResolvedValue('[]')

    await sugerirRutaDidacticaIA({ instrumento: 'Violín', nivelIndex: 1 })

    const [messages] = callGroq.mock.calls[0]
    expect(messages[0].content).not.toContain('YA tiene estos objetivos')
  })

  it('includes objetivosExistentes in the prompt and asks for continuity, not repetition', async () => {
    callGroq.mockResolvedValue('[]')

    await sugerirRutaDidacticaIA({
      instrumento: 'Violín',
      nivelIndex: 1,
      objetivosExistentes: ['Postura y emisión de sonido', 'Control de pulso rítmico'],
    })

    const [messages] = callGroq.mock.calls[0]
    expect(messages[0].content).toContain('YA tiene estos objetivos')
    expect(messages[0].content).toContain('1. Postura y emisión de sonido')
    expect(messages[0].content).toContain('2. Control de pulso rítmico')
    expect(messages[0].content).toContain('SOLO objetivos NUEVOS')
  })

  it('falls back to a demo objetivo (no orphaned demo IDs are ever persisted by callers) when GROQ fails', async () => {
    callGroq.mockRejectedValue(new Error('proxy down'))

    const result = await sugerirRutaDidacticaIA({ instrumento: 'Violín', nivelIndex: 2 })

    expect(result).toHaveLength(1)
    expect(result[0].titulo).toContain('Nivel 2')
    expect(result[0].indicadores.length).toBeGreaterThan(0)
  })

  it('returns an empty array when GROQ responds with valid JSON that is not an array', async () => {
    callGroq.mockResolvedValue('{"not": "an array"}')

    const result = await sugerirRutaDidacticaIA({ instrumento: 'Violín' })

    expect(result).toEqual([])
  })
})

describe('profesionalizarBitacoraIA', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns empty string for empty/whitespace-only input without calling GROQ', async () => {
    expect(await profesionalizarBitacoraIA('')).toBe('')
    expect(await profesionalizarBitacoraIA('   ')).toBe('')
    expect(callGroq).not.toHaveBeenCalled()
  })

  it('calls callGroq with the original text embedded in the prompt', async () => {
    callGroq.mockResolvedValue('Versión profesionalizada del texto.')

    const result = await profesionalizarBitacoraIA('el alumno no vino bien hoy, distraido')

    expect(result).toBe('Versión profesionalizada del texto.')
    expect(callGroq).toHaveBeenCalledTimes(1)
    const [messages] = callGroq.mock.calls[0]
    expect(messages[0].content).toContain('el alumno no vino bien hoy, distraido')
  })

  it('falls back to the original text if GROQ fails (never blocks the maestro)', async () => {
    callGroq.mockRejectedValue(new Error('proxy down'))

    const result = await profesionalizarBitacoraIA('texto original')

    expect(result).toBe('texto original')
  })
})

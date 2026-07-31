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
import { profesionalizarBitacoraIA } from '../aiEvaluacionService.js'

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

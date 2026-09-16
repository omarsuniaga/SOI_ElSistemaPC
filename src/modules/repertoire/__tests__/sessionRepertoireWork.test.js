import { describe, expect, it } from 'vitest'
import { createSessionRepertoireWork, normalizeMeasureRange } from '../domain/sessionRepertoireWork.js'

describe('session repertoire work', () => {
  it('supports continuous ranges and non-contiguous measures without promoting preparation', () => {
    expect(normalizeMeasureRange(20, 22)).toEqual(['20', '21', '22'])
    const work = createSessionRepertoireWork({ sessionId: 'session', montajeId: 'montaje', createdBy: 'maestro', measureIds: ['44', '48', '52', '56'], focusTags: ['RITMO', 'ARTICULACION'] })
    expect(work.measureIds).toEqual(['44', '48', '52', '56'])
    expect(work.preparationMutation).toBeNull()
  })

  it('reuses the canonical focus taxonomy and rejects invalid work records', () => {
    expect(() => createSessionRepertoireWork({ sessionId: 's', montajeId: 'm', createdBy: 'x', measureIds: ['1'], focusTags: ['FAKE'] })).toThrow('focus inválido')
    expect(() => createSessionRepertoireWork({ sessionId: 's', montajeId: 'm', createdBy: 'x', measureIds: [] })).toThrow('al menos un compás')
    expect(() => createSessionRepertoireWork({ sessionId: 's', montajeId: 'm', createdBy: 'x', measureIds: ['1'], tempoActual: 100, tempoObjetivo: 80 })).toThrow('tempo objetivo')
  })
})

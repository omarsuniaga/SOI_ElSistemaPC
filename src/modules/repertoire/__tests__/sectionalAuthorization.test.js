import { describe, expect, it } from 'vitest'
import { assertFilaEditable } from '../domain/studentPreparation.js'

describe('sectional read/edit authorization', () => {
  it('allows assigned fila edits but rejects visible unassigned filas', () => {
    expect(assertFilaEditable({ editableFilaIds: ['flauta'], filaId: 'flauta' })).toBe(true)
    expect(() => assertFilaEditable({ editableFilaIds: ['flauta'], filaId: 'oboe' })).toThrow('fuera del alcance')
  })
})

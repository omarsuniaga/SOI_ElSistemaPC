import { describe, expect, it } from 'vitest'
import { alumnoPerteneceAPrograma, getAlumnoProgramaId } from './claseModal.helpers.js'

describe('claseModal program student filter', () => {
  it('resolves the student program id from supported shapes', () => {
    expect(getAlumnoProgramaId({ programa_id: 'piano' })).toBe('piano')
    expect(getAlumnoProgramaId({ programa: { id: 'cuerdas' } })).toBe('cuerdas')
  })

  it('only matches students belonging to the selected program', () => {
    expect(alumnoPerteneceAPrograma({ programa_id: 'piano' }, 'piano')).toBe(true)
    expect(alumnoPerteneceAPrograma({ programa_id: 'cuerdas' }, 'piano')).toBe(false)
    expect(alumnoPerteneceAPrograma({ programa_id: null }, 'piano')).toBe(false)
  })
})

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { setRutaTema, consumeRutaTema, peekRutaTema, getRutaTemaForAsistencia } from '../rutaTopicStore.js'

describe('rutaTopicStore', () => {
  const mockTema = {
    indicatorId: 'ind-123',
    nombre: 'Identificar Notas',
    nodeNombre: 'Fundamentos',
    levelNombre: 'Nivel 1',
    blockNombre: 'Bloque A',
    claseId: 'clase-456'
  }

  beforeEach(() => {
    sessionStorage.clear()
  })

  afterEach(() => {
    sessionStorage.clear()
  })

  it('should store and peek a topic', () => {
    setRutaTema(mockTema)
    const peeked = peekRutaTema()
    expect(peeked).toEqual(mockTema)
  })

  it('should consume a topic (return and clear from storage)', () => {
    setRutaTema(mockTema)
    const consumed = consumeRutaTema()
    expect(consumed).toEqual(mockTema)
    
    const secondTry = consumeRutaTema()
    expect(secondTry).toBeNull()
  })

  it('should return null if no topic is stored', () => {
    const result = consumeRutaTema()
    expect(result).toBeNull()
  })

  it('should return formatted topic for asistencia', () => {
    setRutaTema(mockTema)
    const formatted = getRutaTemaForAsistencia()
    expect(formatted).toEqual({
      indicatorId: 'ind-123',
      nombre: 'Identificar Notas',
      claseId: 'clase-456'
    })
  })

  it('should return null for asistencia if nothing stored', () => {
    const result = getRutaTemaForAsistencia()
    expect(result).toBeNull()
  })
})

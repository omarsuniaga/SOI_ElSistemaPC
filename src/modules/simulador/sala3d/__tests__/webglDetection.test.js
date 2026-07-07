import { describe, it, expect, vi } from 'vitest'
import { puedeUsarWebGL } from '../webglDetection.js'

describe('webglDetection', () => {
  describe('puedeUsarWebGL', () => {
    it('devuelve true si probeFn retorna true', () => {
      const probeFn = vi.fn(() => true)
      expect(puedeUsarWebGL(probeFn)).toBe(true)
      expect(probeFn).toHaveBeenCalledOnce()
    })

    it('devuelve false si probeFn retorna false', () => {
      const probeFn = vi.fn(() => false)
      expect(puedeUsarWebGL(probeFn)).toBe(false)
    })

    it('devuelve false si probeFn lanza excepción', () => {
      const probeFn = vi.fn(() => { throw new Error('WebGL no soportado') })
      expect(puedeUsarWebGL(probeFn)).toBe(false)
    })

    it('usa probeFn por defecto si no se inyecta', () => {
      expect(puedeUsarWebGL()).toBeTypeOf('boolean')
    })
  })
})

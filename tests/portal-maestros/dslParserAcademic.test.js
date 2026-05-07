import { describe, it, expect } from 'vitest'
import { parseDSL } from '../../src/portal-maestros/utils/dslParser.js'

describe('DSL Parser — Academic extension', () => {
  describe('calificacion extraction', () => {
    it('extracts N/5 for valid values 1-5', () => {
      for (let n = 1; n <= 5; n++) {
        const result = parseDSL(`#Pedro ${n}/5`)
        expect(result.calificacion).toEqual({ valor: n, sobre: 5 })
      }
    })

    it('extracts 0/5 as valid', () => {
      const result = parseDSL('#Pedro 0/5')
      expect(result.calificacion).toEqual({ valor: 0, sobre: 5 })
    })

    it('returns null when denominator is not 5', () => {
      const result = parseDSL('#Pedro 3/10')
      expect(result.calificacion).toBeNull()
    })

    it('returns null when valor > 5', () => {
      // digit > 5 would be 6,7,8,9
      const result = parseDSL('#Pedro 6/5')
      expect(result.calificacion).toBeNull()
    })

    it('returns null when no calificacion present', () => {
      const result = parseDSL('#Pedro [escala]')
      expect(result.calificacion).toBeNull()
    })
  })

  describe('#todos keyword', () => {
    it('captures "todos" as an alumno token', () => {
      const result = parseDSL('#todos 3/5')
      expect(result.alumnos).toContain('todos')
    })

    it('captures #todos among other alumnos', () => {
      const result = parseDSL('#todos 4/5\n#Pedro 2/5')
      expect(result.alumnos).toContain('todos')
      expect(result.alumnos).toContain('Pedro')
    })
  })

  describe('multiple alumnos on same line', () => {
    it('captures multiple #name tokens', () => {
      const result = parseDSL('#Ana #Luis 3/5')
      expect(result.alumnos).toContain('Ana')
      expect(result.alumnos).toContain('Luis')
    })
  })
})

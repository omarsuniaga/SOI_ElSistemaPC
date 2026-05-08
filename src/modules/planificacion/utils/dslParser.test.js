import { describe, it, expect } from 'vitest'
import { parseDsl, highlightDsl, getTokenSummary, validateDsl, TOKEN_COLORS } from './dslParser.js'

describe('dslParser', () => {
  describe('parseDsl', () => {
    it('should return empty object for empty input', () => {
      const result = parseDsl('')
      expect(result.alumnos).toEqual([])
      expect(result.contenido).toEqual([])
      expect(result.sugerencias).toEqual([])
      expect(result.tareas).toEqual([])
      expect(result.medidas).toEqual([])
      expect(result.calificacion).toBeNull()
      expect(result.objetivos).toEqual([])
    })

    it('should return empty object for null input', () => {
      const result = parseDsl(null)
      expect(result.alumnos).toEqual([])
    })

    it('should return empty object for undefined input', () => {
      const result = parseDsl(undefined)
      expect(result.alumnos).toEqual([])
    })

    it('should parse single alumno', () => {
      const result = parseDsl('#Pedro')
      expect(result.alumnos).toContain('Pedro')
    })

    it('should parse multiple alumnos', () => {
      const result = parseDsl('#Pedro, #Martín, #Laura')
      expect(result.alumnos).toHaveLength(3)
      expect(result.alumnos).toContain('Pedro')
      expect(result.alumnos).toContain('Martín')
      expect(result.alumnos).toContain('Laura')
    })

    it('should parse contenido with brackets', () => {
      const result = parseDsl('[Escala Do Mayor]')
      expect(result.contenido).toContain('Escala Do Mayor')
    })

    it('should parse multiple contenido', () => {
      const result = parseDsl('[Escala Do Mayor] [Arpegio]')
      expect(result.contenido).toHaveLength(2)
    })

    it('should parse suggestion with parentheses', () => {
      const result = parseDsl('(mejorar cambio posición)')
      expect(result.sugerencias).toContain('mejorar cambio posición')
    })

    it('should parse multiple suggestions', () => {
      const result = parseDsl('(primera) (segunda)')
      expect(result.sugerencias).toHaveLength(2)
    })

    it('should parse tarea with braces', () => {
      const result = parseDsl('{estudiar glisandos}')
      expect(result.tareas).toContain('estudiar glisandos')
    })

    it('should parse multiple tareas', () => {
      const result = parseDsl('{tarea uno} {tarea dos}')
      expect(result.tareas).toHaveLength(2)
    })

    it('should parse medida with dollar sign', () => {
      const result = parseDsl('$3Octavas')
      expect(result.medidas).toContain('3Octavas')
    })

    it('should parse multiple medidas', () => {
      const result = parseDsl('$3Octavas $Mi_bemol')
      expect(result.medidas).toHaveLength(2)
    })

    it('should parse calificacion', () => {
      const result = parseDsl('4/5')
      expect(result.calificacion).not.toBeNull()
      expect(result.calificacion.valor).toBe(4)
      expect(result.calificacion.sobre).toBe(5)
    })

    it('should return null for invalid calificacion', () => {
      const result = parseDsl('6/5')
      expect(result.calificacion).toBeNull()
    })

    it('should return null for non-5 denominator', () => {
      const result = parseDsl('4/10')
      expect(result.calificacion).toBeNull()
    })

    it('should parse objetivo with greater than', () => {
      const result = parseDsl('>DO-2.3')
      expect(result.objetivos).toContain('DO-2.3')
    })

    it('should parse full DSL sentence', () => {
      const result = parseDsl('#Pedro [Escala Do Mayor] 4/5 $3Octavas (mejorar) {tarea} >DO-2.3')
      expect(result.alumnos).toContain('Pedro')
      expect(result.contenido).toContain('Escala Do Mayor')
      expect(result.calificacion.valor).toBe(4)
      expect(result.medidas).toContain('3Octavas')
      expect(result.sugerencias).toContain('mejorar')
      expect(result.tareas).toContain('tarea')
      expect(result.objetivos[0]).toMatch(/DO-2/)
    })

    it('should handle mixed text with DSL tokens', () => {
      const result = parseDsl('Hoy trabajaremos #Juan en [Escala] y luego #Maria')
      expect(result.alumnos).toHaveLength(2)
      expect(result.contenido).toContain('Escala')
    })
  })

  describe('TOKEN_COLORS', () => {
    it('should have colors for all token types', () => {
      expect(TOKEN_COLORS.alumnos).toBe('#0d6efd')
      expect(TOKEN_COLORS.contenido).toBe('#198754')
      expect(TOKEN_COLORS.sugerencias).toBe('#fd7e14')
      expect(TOKEN_COLORS.tareas).toBe('#9333ea')
      expect(TOKEN_COLORS.medidas).toBe('#6dd5ed')
      expect(TOKEN_COLORS.calificacion).toBe('#dc3545')
      expect(TOKEN_COLORS.objetivos).toBe('#6c757d')
    })
  })

  describe('highlightDsl', () => {
    it('should return empty string for empty input', () => {
      const result = highlightDsl('')
      expect(result).toBe('')
    })

    it('should return empty string for null input', () => {
      const result = highlightDsl(null)
      expect(result).toBe('')
    })

    it('should highlight alumno', () => {
      const result = highlightDsl('#Pedro')
      expect(result).toContain('dsl-token')
      expect(result).toContain('dsl-alumno')
      expect(result).toContain('#Pedro')
    })

    it('should highlight contenido', () => {
      const result = highlightDsl('[Escala]')
      expect(result).toContain('dsl-contenido')
    })

    it('should highlight suggestion', () => {
      const result = highlightDsl('(sugerencia)')
      expect(result).toContain('dsl-sugerencia')
    })

    it('should highlight tarea', () => {
      const result = highlightDsl('{tarea}')
      expect(result).toContain('dsl-tarea')
    })

    it('should highlight medida', () => {
      const result = highlightDsl('$medida')
      expect(result).toContain('dsl-medida')
    })

    it('should highlight calificacion', () => {
      const result = highlightDsl('4/5')
      expect(result).toContain('dsl-calificacion')
      expect(result).toContain('data-valor=')
    })

    it('should highlight objetivo', () => {
      const result = highlightDsl('>DO-2.3')
      expect(result).toContain('dsl-objetivo')
      expect(result).toContain('&gt;')
    })

    it('should escape HTML characters', () => {
      const result = highlightDsl('<test>')
      expect(result).toContain('&lt;test&gt;')
    })
  })

  describe('getTokenSummary', () => {
    it('should return "Sin tokens" for empty input', () => {
      const result = getTokenSummary({ alumnos: [], contenido: [], sugerencias: [], tareas: [], medidas: [], calificacion: null, objetivos: [] })
      expect(result).toBe('Sin tokens')
    })

    it('should count alumnos', () => {
      const result = getTokenSummary({ alumnos: ['Pedro'], contenido: [], sugerencias: [], tareas: [], medidas: [], calificacion: null, objetivos: [] })
      expect(result).toContain('1 alumno(s)')
    })

    it('should include calificacion', () => {
      const result = getTokenSummary({ alumnos: [], contenido: [], sugerencias: [], tareas: [], medidas: [], calificacion: { valor: 4, sobre: 5 }, objetivos: [] })
      expect(result).toContain('calificación: 4/5')
    })
  })

  describe('validateDsl', () => {
    it('should return valid for empty text', () => {
      const result = validateDsl('')
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should return error for invalid calificacion', () => {
      const result = validateDsl('6/5')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('La calificación debe estar entre 0 y 5')
    })

    it('should return error for text over 10KB', () => {
      const longText = 'a'.repeat(10001)
      const result = validateDsl(longText)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('El texto excede el límite de 10KB')
    })

    it('should validate correct DSL', () => {
      const result = validateDsl('#Pedro [Contenido] 4/5')
      expect(result.valid).toBe(true)
    })
  })
})
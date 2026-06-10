import { describe, it, expect } from 'vitest'
import {
  parseDsl,
  parseDSL,
  highlightDsl,
  getTokenSummary,
  validateDsl,
  TOKEN_COLORS,
  generateProfileAssertions,
  hasProfileTokens,
} from './dslParser.js'

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
      const result = getTokenSummary({
        alumnos: [],
        contenido: [],
        sugerencias: [],
        tareas: [],
        medidas: [],
        calificacion: null,
        objetivos: [],
      })
      expect(result).toBe('Sin tokens')
    })

    it('should count alumnos', () => {
      const result = getTokenSummary({
        alumnos: ['Pedro'],
        contenido: [],
        sugerencias: [],
        tareas: [],
        medidas: [],
        calificacion: null,
        objetivos: [],
      })
      expect(result).toContain('1 alumno(s)')
    })

    it('should include calificacion', () => {
      const result = getTokenSummary({
        alumnos: [],
        contenido: [],
        sugerencias: [],
        tareas: [],
        medidas: [],
        calificacion: { valor: 4, sobre: 5 },
        objetivos: [],
      })
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

  describe('generateProfileAssertions', () => {
    const alumnoMap = { Pedro: 'uuid-pedro', María: 'uuid-maria' }
    const indicatorMap = { 'DO-2.3': 'uuid-do-2-3', 'RE-1': 'uuid-re-1' }

    it('should return empty array for empty parsed input', () => {
      const parsed = parseDSL('')
      const result = generateProfileAssertions(parsed, alumnoMap)
      expect(result).toEqual([])
    })

    it('should generate assertion for each alumno+objetivo pair', () => {
      const parsed = parseDSL('#Pedro >DO-2.3 >RE-1')
      const result = generateProfileAssertions(parsed, alumnoMap, indicatorMap, 'obs-1')

      expect(result).toHaveLength(2)
      expect(result[0]).toMatchObject({
        alumno_id: 'uuid-pedro',
        dimension: 'objetivo',
        confianza: 1.0,
        estado: 'confirmado',
        creado_por: 'dsl',
        indicator_id: 'uuid-do-2-3',
      })
    })

    it('should generate assertion for contenido as escala dimension', () => {
      const parsed = parseDSL('#Pedro [Escala Do Mayor]')
      const result = generateProfileAssertions(parsed, alumnoMap)

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({
        alumno_id: 'uuid-pedro',
        dimension: 'escala',
        item: 'Escala Do Mayor',
        indicator_id: null,
        madurez: 'introducido',
      })
    })

    it('should skip alumnos not in alumnoMap', () => {
      const parsed = parseDSL('#Pedro #Inexistente >DO-2.3')
      const result = generateProfileAssertions(parsed, alumnoMap, indicatorMap)

      expect(result).toHaveLength(1)
      expect(result[0].alumno_id).toBe('uuid-pedro')
    })

    it('should deduplicate same alumno+dimension+item', () => {
      const parsed = parseDSL('#Pedro >DO-2.3\n#Pedro >DO-2.3')
      const result = generateProfileAssertions(parsed, alumnoMap, indicatorMap)

      // Same alumno + same objetivo code = 1 assertion, not 2
      expect(result).toHaveLength(1)
    })

    it('should handle multiple alumnos with shared objetivos', () => {
      const parsed = parseDSL('#Pedro #María >DO-2.3')
      const result = generateProfileAssertions(parsed, alumnoMap, indicatorMap)

      expect(result).toHaveLength(2)
      expect(result.map((a) => a.alumno_id)).toContain('uuid-pedro')
      expect(result.map((a) => a.alumno_id)).toContain('uuid-maria')
      expect(result[0].item).toBe(result[1].item) // same objective code
    })

    it('should set evidencia_texto when obsId is provided', () => {
      const parsed = parseDSL('#Pedro [Escala]')
      const result = generateProfileAssertions(parsed, alumnoMap, {}, 'obs-42')

      expect(result[0].evidencia_texto).toBe('[Escala]')
    })

    it('should ignore medidas (do not create assertions)', () => {
      const parsed = parseDSL('#Pedro $3Octavas')
      const result = generateProfileAssertions(parsed, alumnoMap)

      expect(result).toHaveLength(0)
    })

    it('should handle empty alumnoMap gracefully', () => {
      const parsed = parseDSL('#Pedro >DO-2.3')
      const result = generateProfileAssertions(parsed, {}, indicatorMap)

      expect(result).toHaveLength(0)
    })

    it('should skip non-matching objective codes without error', () => {
      // VL-N2-12 has digits after first dash segment — not supported by current regex
      const parsed = parseDSL('#Pedro >DO-2.3 >VL-N2-12')
      const result = generateProfileAssertions(parsed, alumnoMap, indicatorMap)

      // Only DO-2.3 gets parsed as objetivo
      expect(result).toHaveLength(1)
      expect(result[0].item).toBe('DO-2.3')
    })
  })

  describe('hasProfileTokens', () => {
    it('should return true when objetivos are present', () => {
      const parsed = parseDSL('#Pedro >VL-N2-12')
      expect(hasProfileTokens(parsed)).toBe(true)
    })

    it('should return true when contenido is present', () => {
      const parsed = parseDSL('[Escala]')
      expect(hasProfileTokens(parsed)).toBe(true)
    })

    it('should return true when alumnos are present', () => {
      const parsed = parseDSL('#Pedro')
      expect(hasProfileTokens(parsed)).toBe(true)
    })

    it('should return false for empty parse', () => {
      const parsed = parseDSL('')
      expect(hasProfileTokens(parsed)).toBe(false)
    })

    it('should return false when only sugerencias/tareas/medidas are present', () => {
      const parsed = parseDSL('(mejorar) {tarea} $medida')
      // No alumnos, objetivos, or contenido
      expect(hasProfileTokens(parsed)).toBe(false)
    })

    it('should return true for mixed content with objetivos', () => {
      const parsed = parseDSL('#Pedro [Escala] 4/5 >DO-2.3 (mejorar)')
      expect(hasProfileTokens(parsed)).toBe(true)
    })
  })
})

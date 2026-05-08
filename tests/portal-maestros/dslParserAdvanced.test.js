import { describe, it, expect, vi, beforeEach } from 'vitest'
import { parseDSL, getTokenSummary } from '../../src/portal-maestros/utils/dslParser.js'

describe('dslParser - Auditoría de Capas y 40 Niveles', () => {
  
  describe('Jerarquía de 40 Niveles y Nodos', () => {
    it('debe detectar correctamente un nivel de doble dígito (>NIVEL-25)', () => {
      const text = '>NIVEL-25 [Foco: Virtuosismo]'
      const parsed = parseDSL(text)
      expect(parsed.niveles).toContain('25')
    })

    it('debe detectar múltiples nodos en un mismo texto', () => {
      const text = '>NODO:ESCALAS y >NODO:ARCO'
      const parsed = parseDSL(text)
      expect(parsed.nodos).toContain('ESCALAS')
      expect(parsed.nodos).toContain('ARCO')
    })

    it('debe manejar nodos con guiones bajos (>NODO:MANO_IZQUIERDA)', () => {
      const text = '>NODO:MANO_IZQUIERDA [dedo 4]'
      const parsed = parseDSL(text)
      expect(parsed.nodos).toContain('MANO_IZQUIERDA')
    })
  })

  describe('Planificación por Capas (:::CAPA)', () => {
    it('debe separar el contenido en el objeto por_capas', () => {
      const text = `
:::CAPA: TECNICA
>NIVEL-10
* #Juan trabajar escalas
:::CAPA: REPERTORIO
* [Vivaldi] compases 1-8
      `
      const parsed = parseDSL(text)
      
      expect(parsed.por_capas).toHaveProperty('TECNICA')
      expect(parsed.por_capas).toHaveProperty('REPERTORIO')
      
      expect(parsed.por_capas.TECNICA.niveles).toContain('10')
      expect(parsed.por_capas.TECNICA.alumnos).toContain('Juan')
      expect(parsed.por_capas.REPERTORIO.contenido).toContain('Vivaldi')
    })

    it('debe ser insensible a mayúsculas/minúsculas en el nombre de la capa', () => {
      const text = ':::CAPA: tecnica\n#Ana'
      const parsed = parseDSL(text)
      expect(parsed.por_capas).toHaveProperty('TECNICA')
      expect(parsed.por_capas.TECNICA.alumnos).toContain('Ana')
    })

    it('debe manejar capas mal formadas o vacías sin explotar', () => {
      const text = ':::CAPA: \n#Vacio'
      const parsed = parseDSL(text)
      // No debería crear la capa si el nombre está vacío tras el split
      expect(Object.keys(parsed.por_capas).length).toBe(0)
    })
  })

  describe('Resumen de Tokens (getTokenSummary)', () => {
    it('debe incluir el conteo de capas, niveles y nodos en el resumen', () => {
      const text = ':::CAPA: TECNICA\n>NIVEL-5\n>NODO:ARCO\n#Luis 5/5'
      const parsed = parseDSL(text)
      const summary = getTokenSummary(parsed)
      
      expect(summary).toContain('1 alumno(s)')
      expect(summary).toContain('calificación: 5/5')
      expect(summary).toContain('1 nivel(es)')
      expect(summary).toContain('1 nodo(s)')
      expect(summary).toContain('1 capa(s)')
    })
  })

  describe('Estrés y Casos Borde', () => {
    it('debe procesar un texto largo con múltiples capas y tokens sin degradación evidente', () => {
      let largeText = ''
      for(let i=1; i<=10; i++) {
        largeText += `:::CAPA: CAPA_${i}\n>NIVEL-${i} >NODO:NODO_${i} #Alumno${i} [Contenido${i}] (Sugerencia${i}) {Tarea${i}} $Medida${i} 5/5\n`
      }
      
      const start = performance.now()
      const parsed = parseDSL(largeText)
      const end = performance.now()
      
      expect(Object.keys(parsed.por_capas).length).toBe(10)
      expect(end - start).toBeLessThan(50) // Debe procesar en menos de 50ms
    })

    it('debe manejar caracteres especiales en los nombres de alumnos', () => {
      const text = '#Pepe #Ñandú'
      const parsed = parseDSL(text)
      expect(parsed.alumnos).toContain('Pepe')
      expect(parsed.alumnos).toContain('Ñandú')
    })
  })
})

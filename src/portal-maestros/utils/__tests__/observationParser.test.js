import { describe, it, expect } from 'vitest'
import {
  normalizeText,
  detectState,
  segmentSentences,
  buildRosterLookup,
  findMentionedStudents,
  segmentObservation
} from '../observationParser.js'

describe('Hardened Observation Parser (v2) Tests', () => {

  // 1. Normalizador de Texto
  describe('normalizeText', () => {
    it('should lowercase, remove accents, diacritics, and normalize whitespace', () => {
      const raw = '  Évans RÓDRÍGUEZ,   Matias   carmén! '
      expect(normalizeText(raw)).toBe('evans rodriguez matias carmen')
    })
  })

  // 2. Clasificador de Estados con Pesos Jerárquicos
  describe('detectState (Weighted rules)', () => {
    it('should classify negations as DIFICULTAD even if positive keywords are present', () => {
      const txt = 'Evans no logró ubicar el primer dedo'
      const stateObj = detectState(txt)
      expect(stateObj.value).toBe('DIFICULTAD')
      expect(stateObj.confidence).toBeGreaterThan(0.5)
      expect(stateObj.evidence).toContain('no logro')
    })

    it('should classify LOGRADO when positive keywords dominate', () => {
      const txt = 'Matias dominó la escala de Sol mayor de forma excelente'
      const stateObj = detectState(txt)
      expect(stateObj.value).toBe('LOGRADO')
      expect(stateObj.evidence).toContain('domino')
    })

    it('should fallback to EN_PROGRESO when no keywords match', () => {
      const txt = 'Alfred tocó algunas notas al aire'
      const stateObj = detectState(txt)
      expect(stateObj.value).toBe('EN_PROGRESO')
      expect(stateObj.confidence).toBe(0.4)
    })
  })

  // 3. Segmentador de Oraciones con Protección Musical
  describe('segmentSentences', () => {
    it('should protect musical abbreviations (Lec., c., n.º) and decimals (3.5/5) from false cuts', () => {
      const txt = 'Hoy todos trabajaron la Lec. 11 de violín. Practicaron los c. 33-40 en casa. La nota promedio fue 4.5/5 en la escala n.º 2.'
      const sentences = segmentSentences(txt)
      expect(sentences).toHaveLength(3)
      expect(sentences[0]).toBe('Hoy todos trabajaron la Lec. 11 de violín.')
      expect(sentences[1]).toBe('Practicaron los c. 33-40 en casa.')
      expect(sentences[2]).toBe('La nota promedio fue 4.5/5 en la escala n.º 2.')
    })
  })

  // 4. Búsqueda e Indexación de Alumnos (Ambigüedad)
  describe('buildRosterLookup & findMentionedStudents', () => {
    const roster = [
      { id: '1', nombre: 'Evans Rodriguez Leonardo', nombreCorto: 'Evans Rodriguez' },
      { id: '2', nombre: 'Evans Martinez Perez', nombreCorto: 'Evans Martinez' },
      { id: '3', nombre: 'Matias Carmen Paredes', nombreCorto: 'Matias Carmen' }
    ]

    it('should flag ambiguous results when a duplicate first name is used', () => {
      const lookup = buildRosterLookup(roster)
      const txt = 'Evans trabajó con dificultad en los ejercicios'
      
      const { students, ambiguous, requires_confirmation } = findMentionedStudents(txt, lookup, roster, roster)
      expect(students).toHaveLength(2) // Matches both Evans
      expect(ambiguous).toBe(true)
      expect(requires_confirmation).toBe(true)
    })

    it('should match a unique name with high confidence and no ambiguity', () => {
      const lookup = buildRosterLookup(roster)
      const txt = 'Matias Carmen trabajó la escala'
      
      const { students, ambiguous, requires_confirmation } = findMentionedStudents(txt, lookup, roster, roster)
      expect(students).toHaveLength(1)
      expect(students[0].id).toBe('3')
      expect(ambiguous).toBe(false)
      expect(requires_confirmation).toBe(false)
    })
  })

  // 5. Segmentación de Observaciones Completa
  describe('segmentObservation', () => {
    const roster = [
      { id: '1', nombre: 'Evans Rodriguez Leonardo', nombreCorto: 'Evans Rodriguez' },
      { id: '3', nombre: 'Matias Carmen Paredes', nombreCorto: 'Matias Carmen' }
    ]

    it('should segment a multi-student observation and correctly attribute states', () => {
      const txt = 'Matias dominó la Lec. 11 de forma excelente. Evans sigue mostrando dificultad para colocar la mano izquierda.'
      const groups = segmentObservation(txt, { alumnos: roster })
      
      expect(groups).toHaveLength(2)
      
      // First sentence group (Matias)
      expect(groups[0].alumnos[0].id).toBe('3')
      expect(groups[0].estado.value).toBe('LOGRADO')
      expect(groups[0].fragment).toBe('Matias dominó la Lec. 11 de forma excelente.')

      // Second sentence group (Evans)
      expect(groups[1].alumnos[0].id).toBe('1')
      expect(groups[1].estado.value).toBe('DIFICULTAD')
      expect(groups[1].alerta).toBe(true)
      expect(groups[1].alertDetails.type).toBe('RIESGO_PEDAGOGICO')
    })

    it('should automatically exclude students with individual difficulties from "los demas" collective scope', () => {
      const txt = 'Evans Rodriguez no logró ubicar el dedo. Los demás alumnos visiblemente sienten un poco más de confianza.'
      const groups = segmentObservation(txt, { alumnos: roster })
      
      expect(groups).toHaveLength(2)
      expect(groups[0].alumnos[0].id).toBe('1')
      expect(groups[0].estado.value).toBe('DIFICULTAD')

      // "Los demás" group should exclude Evans
      expect(groups[1].scope).toBe('grupo_excluyendo')
      expect(groups[1].alumnos).toHaveLength(1)
      expect(groups[1].alumnos[0].id).toBe('3') // Only Matias
      expect(groups[1].excludeIds).toContain('1')
    })

    it('should flag indeterminate sub-groups ("algunos") with confirmation required', () => {
      const txt = 'Algunos alumnos ya están tocando estrellita.'
      const groups = segmentObservation(txt, { alumnos: roster })
      
      expect(groups).toHaveLength(1)
      expect(groups[0].scope).toBe('subgrupo_indeterminado')
      expect(groups[0].requires_confirmation).toBe(true)
      expect(groups[0].alumnos).toHaveLength(0)
    })
  })

})

import { describe, it, expect } from 'vitest'
import {
  OBSERVACION_TIPOS,
  OBSERVACION_TIPO_LABELS,
  LEGACY_TIPO_MAP,
  CALIFICACION_MIN,
  CALIFICACION_MAX,
  PERMISO_EVALUACION_WRITE,
  normalizeTipo,
} from '../evaluacion-constants.js'

describe('evaluacion-constants', () => {
  describe('OBSERVACION_TIPOS', () => {
    it('should contain exactly 7 canonical values', () => {
      expect(OBSERVACION_TIPOS).toHaveLength(7)
    })

    it('should include all canonical tipos', () => {
      const expected = ['academica', 'conductual', 'asistencia', 'tecnica', 'motivacional', 'administrativa', 'otra']
      expected.forEach(t => expect(OBSERVACION_TIPOS).toContain(t))
    })

    it('should be frozen', () => {
      expect(Object.isFrozen(OBSERVACION_TIPOS)).toBe(true)
    })
  })

  describe('OBSERVACION_TIPO_LABELS', () => {
    it('should have a label for every canonical tipo', () => {
      OBSERVACION_TIPOS.forEach(t => {
        expect(OBSERVACION_TIPO_LABELS[t]).toBeDefined()
      })
    })
  })

  describe('LEGACY_TIPO_MAP', () => {
    it('should map comportamiento → conductual', () => {
      expect(LEGACY_TIPO_MAP['comportamiento']).toBe('conductual')
    })
    it('should map academico → academica', () => {
      expect(LEGACY_TIPO_MAP['academico']).toBe('academica')
    })
    it('should map social → otra', () => {
      expect(LEGACY_TIPO_MAP['social']).toBe('otra')
    })
    it('should map disciplina → conductual', () => {
      expect(LEGACY_TIPO_MAP['disciplina']).toBe('conductual')
    })
  })

  describe('CALIFICACION constants', () => {
    it('should have MIN = 0', () => {
      expect(CALIFICACION_MIN).toBe(0)
    })
    it('should have MAX = 10', () => {
      expect(CALIFICACION_MAX).toBe(10)
    })
  })

  describe('PERMISO_EVALUACION_WRITE', () => {
    it('should equal evaluacion:write', () => {
      expect(PERMISO_EVALUACION_WRITE).toBe('evaluacion:write')
    })
  })

  describe('normalizeTipo()', () => {
    it('should passthrough all 7 canonical valores unchanged', () => {
      const canonical = ['academica', 'conductual', 'asistencia', 'tecnica', 'motivacional', 'administrativa', 'otra']
      canonical.forEach(t => expect(normalizeTipo(t)).toBe(t))
    })

    it('should map comportamiento → conductual', () => {
      expect(normalizeTipo('comportamiento')).toBe('conductual')
    })

    it('should map academico → academica', () => {
      expect(normalizeTipo('academico')).toBe('academica')
    })

    it('should map social → otra', () => {
      expect(normalizeTipo('social')).toBe('otra')
    })

    it('should map disciplina → conductual', () => {
      expect(normalizeTipo('disciplina')).toBe('conductual')
    })

    it('should return null for unknown tipo', () => {
      expect(normalizeTipo('foobar')).toBeNull()
    })

    it('should return null for undefined input', () => {
      expect(normalizeTipo(undefined)).toBeNull()
    })
  })
})

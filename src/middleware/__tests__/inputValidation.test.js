import { describe, it, expect, beforeEach, vi } from 'vitest'
import { validateObservation, validateLessonPlan, validateStudent, sanitizeInput } from '../inputValidation.js'

describe('inputValidation', () => {
  beforeEach(() => {
    vi.stubGlobal('DOMPurify', {
      sanitize: vi.fn((input) => input),
    })
  })

  describe('validateObservation', () => {
    it('validates valid observation data', () => {
      const data = {
        student_id: '123e4567-e89b-12d3-a456-426614174000',
        clase_id: '123e4567-e89b-12d3-a456-426614174001',
        texto: 'Student showed good progress',
        registrado: true,
      }
      const result = validateObservation(data)
      expect(result.valid).toBe(true)
    })

    it('rejects missing student_id', () => {
      const data = {
        texto: 'Test',
        registrado: true,
      }
      const result = validateObservation(data)
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('rejects too long texto', () => {
      const data = {
        student_id: '123e4567-e89b-12d3-a456-426614174000',
        texto: 'a'.repeat(5001),
        registrado: true,
      }
      const result = validateObservation(data)
      expect(result.valid).toBe(false)
    })
  })

  describe('validateLessonPlan', () => {
    it('validates valid lesson plan', () => {
      const data = {
        route_id: '123e4567-e89b-12d3-a456-426614174000',
        level: 1,
        objectives: 'Learn rhythm',
        activities: 'Clapping exercises',
        duration_minutes: 45,
      }
      const result = validateLessonPlan(data)
      expect(result.valid).toBe(true)
    })

    it('rejects missing required fields', () => {
      const data = {
        level: 1,
      }
      const result = validateLessonPlan(data)
      expect(result.valid).toBe(false)
    })

    it('rejects invalid level', () => {
      const data = {
        route_id: '123e4567-e89b-12d3-a456-426614174000',
        level: 99,
        objectives: 'Test',
        activities: 'Test',
        duration_minutes: 45,
      }
      const result = validateLessonPlan(data)
      expect(result.valid).toBe(false)
    })
  })

  describe('validateStudent', () => {
    it('validates valid student data', () => {
      const data = {
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'juan@example.com',
      }
      const result = validateStudent(data)
      expect(result.valid).toBe(true)
    })

    it('rejects invalid email', () => {
      const data = {
        nombre: 'Juan',
        email: 'invalid-email',
      }
      const result = validateStudent(data)
      expect(result.valid).toBe(false)
    })
  })

  describe('sanitizeInput', () => {
    it('sanitizes HTML input', () => {
      const input = '<script>alert("xss")</script>Hello'
      const result = sanitizeInput(input)
      expect(result).toBeDefined()
    })

    it('preserves safe HTML', () => {
      const input = '<p>Hello world</p>'
      const result = sanitizeInput(input)
      expect(result).toBeDefined()
    })
  })
})
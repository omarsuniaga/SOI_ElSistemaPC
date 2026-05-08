import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock supabase
vi.mock('../../src/lib/supabaseClient.js', () => {
  const chainable = () => {
    const chain = {
      select: vi.fn(() => chain),
      insert: vi.fn(() => chain),
      update: vi.fn(() => chain),
      upsert: vi.fn(() => chain),
      eq: vi.fn(() => chain),
      in: vi.fn(() => chain),
      or: vi.fn(() => chain),
      order: vi.fn(() => chain),
      limit: vi.fn(() => chain),
      single: vi.fn(() => Promise.resolve({ data: null, error: null })),
      maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
    }
    return chain
  }
  return {
    supabase: {
      from: vi.fn(() => chainable()),
    },
  }
})

import {
  generateClassEvent,
  getClassEvent,
  saveMethodology,
  updateClassEventStatus,
  assignHomework,
  getStudentHomework,
} from '../../src/portal-maestros/services/classEventService.js'

describe('classEventService', () => {
  describe('exports', () => {
    it('exports all expected functions', () => {
      expect(typeof generateClassEvent).toBe('function')
      expect(typeof getClassEvent).toBe('function')
      expect(typeof saveMethodology).toBe('function')
      expect(typeof updateClassEventStatus).toBe('function')
      expect(typeof assignHomework).toBe('function')
      expect(typeof getStudentHomework).toBe('function')
    })
  })

  describe('generateClassEvent', () => {
    it('throws if studentId is missing', async () => {
      await expect(generateClassEvent({ teacherId: 't1', sessionId: 's1' }))
        .rejects.toThrow('studentId, teacherId, and sessionId are required')
    })

    it('throws if teacherId is missing', async () => {
      await expect(generateClassEvent({ studentId: 's1', sessionId: 's1' }))
        .rejects.toThrow('studentId, teacherId, and sessionId are required')
    })

    it('throws if sessionId is missing', async () => {
      await expect(generateClassEvent({ studentId: 's1', teacherId: 't1' }))
        .rejects.toThrow('studentId, teacherId, and sessionId are required')
    })
  })

  describe('getClassEvent', () => {
    it('throws if sessionId is missing', async () => {
      await expect(getClassEvent(null, 'student1'))
        .rejects.toThrow('sessionId and studentId are required')
    })

    it('throws if studentId is missing', async () => {
      await expect(getClassEvent('session1', null))
        .rejects.toThrow('sessionId and studentId are required')
    })
  })

  describe('saveMethodology', () => {
    it('throws if classEventId is missing', async () => {
      await expect(saveMethodology(null, {}))
        .rejects.toThrow('classEventId is required')
    })
  })

  describe('updateClassEventStatus', () => {
    it('throws if classEventId is missing', async () => {
      await expect(updateClassEventStatus(null, 'completed'))
        .rejects.toThrow('classEventId and status are required')
    })

    it('throws if status is missing', async () => {
      await expect(updateClassEventStatus('ce1', null))
        .rejects.toThrow('classEventId and status are required')
    })
  })

  describe('assignHomework', () => {
    it('throws if required params are missing', async () => {
      await expect(assignHomework({ studentId: 's1', teacherId: 't1', description: 'test' }))
        .rejects.toThrow('classEventId, studentId, and teacherId are required')
    })

    it('throws if description is missing', async () => {
      await expect(assignHomework({
        classEventId: 'ce1', studentId: 's1', teacherId: 't1', description: '',
      })).rejects.toThrow('description is required')
    })

    it('throws if description is only whitespace', async () => {
      await expect(assignHomework({
        classEventId: 'ce1', studentId: 's1', teacherId: 't1', description: '   ',
      })).rejects.toThrow('description is required')
    })
  })

  describe('getStudentHomework', () => {
    it('throws if studentId is missing', async () => {
      await expect(getStudentHomework(null))
        .rejects.toThrow('studentId is required')
    })
  })
})

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { deleteUserData, exportUserData, getDeleteStatus } from '../gdprService.js'

describe('gdprService', () => {
  let mockDatabase

  beforeEach(() => {
    mockDatabase = {
      delete: vi.fn().mockResolvedValue({ success: true }),
      query: vi.fn().mockResolvedValue([]),
    }
  })

  it('deletes all user data (cascade)', async () => {
    const result = await deleteUserData('user-123', mockDatabase)
    expect(result.success).toBe(true)
    expect(mockDatabase.delete).toHaveBeenCalledTimes(4)
  })

  it('deletes observations first', async () => {
    await deleteUserData('user-123', mockDatabase)
    const calls = mockDatabase.delete.mock.calls
    expect(calls[0][0]).toBe('observations')
  })

  it('deletes lesson plans', async () => {
    await deleteUserData('user-123', mockDatabase)
    const calls = mockDatabase.delete.mock.calls
    const tables = calls.map(c => c[0])
    expect(tables).toContain('lesson_plans')
  })

  it('deletes evaluations', async () => {
    await deleteUserData('user-123', mockDatabase)
    const calls = mockDatabase.delete.mock.calls
    const tables = calls.map(c => c[0])
    expect(tables).toContain('evaluations')
  })

  it('exports user data as JSON', async () => {
    mockDatabase.query
      .mockResolvedValueOnce([{ id: 1, texto: 'obs1' }])
      .mockResolvedValueOnce([{ id: 1, objectives: 'plan1' }])
      .mockResolvedValueOnce([{ id: 1, criteria: { a: 1 } }])

    const data = await exportUserData('user-123', mockDatabase)
    expect(data).toBeDefined()
    expect(data.observations).toBeDefined()
    expect(data.lessonPlans).toBeDefined()
    expect(data.evaluations).toBeDefined()
  })

  it('returns delete status', async () => {
    const status = getDeleteStatus('user-123')
    expect(status.pending).toBeDefined()
    expect(status.completed).toBeDefined()
  })
})
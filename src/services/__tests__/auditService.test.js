import { describe, it, expect, beforeEach, vi } from 'vitest'
import { auditLog, getAuditLogs, initAuditService } from '../auditService.js'

describe('auditService', () => {
  let mockDatabase

  beforeEach(() => {
    mockDatabase = {
      insert: vi.fn().mockResolvedValue({ id: 'new-uuid' }),
      query: vi.fn().mockResolvedValue([]),
    }
    initAuditService({ enabled: true, db: mockDatabase })
  })

  it('initializes audit service', () => {
    initAuditService({ enabled: true })
    expect(mockDatabase).toBeDefined()
  })

  it('logs CREATE action', async () => {
    await auditLog('CREATE', 'observation', 'obs-123', {
      user_id: 'user-456',
      changes: { texto: 'New observation' },
    })
    expect(mockDatabase.insert).toHaveBeenCalled()
  })

  it('logs UPDATE action', async () => {
    await auditLog('UPDATE', 'lesson_plan', 'plan-789', {
      user_id: 'user-456',
      changes: { objectives: 'Updated objectives' },
    })
    expect(mockDatabase.insert).toHaveBeenCalled()
  })

  it('logs DELETE action', async () => {
    await auditLog('DELETE', 'student', 'student-999', {
      user_id: 'user-456',
      changes: { nombre: 'Deleted student' },
    })
    expect(mockDatabase.insert).toHaveBeenCalled()
  })

  it('retrieves audit logs', async () => {
    const logs = await getAuditLogs({ user_id: 'user-456' })
    expect(mockDatabase.query).toHaveBeenCalled()
  })
})
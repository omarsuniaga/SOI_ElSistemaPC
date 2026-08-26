import { describe, it, expect, beforeEach, vi } from 'vitest'

const { auditLogMock, fromMock, getUserMock } = vi.hoisted(() => ({
  auditLogMock: vi.fn().mockResolvedValue(null),
  fromMock: vi.fn(),
  getUserMock: vi.fn(),
}))

vi.mock('../../../lib/supabaseClient.js', () => ({
  supabase: {
    from: fromMock,
    auth: {
      getUser: getUserMock,
    },
  },
}))

vi.mock('../auditService.js', () => ({
  auditLog: auditLogMock,
}))

import {
  SUBSTITUTE_ACTIVITY_ENTITY,
  isSubstituteAssignment,
  listSubstituteActivityLogs,
  logSubstituteActivity,
} from '../substituteAuditService.js'

describe('substituteAuditService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('detects substitute assignments by maestro_suplente_id and maestro_auxiliar_id', () => {
    expect(
      isSubstituteAssignment({ maestro_suplente_id: 'm-2' }, 'm-2'),
    ).toBe(true)
    expect(
      isSubstituteAssignment({ maestro_auxiliar_id: 'm-3' }, 'm-3'),
    ).toBe(true)
    expect(
      isSubstituteAssignment({ maestro_suplente_id: 'm-2' }, 'm-9'),
    ).toBe(false)
  })

  it('logs substitute activity with the resolved actor and class metadata', async () => {
    getUserMock.mockResolvedValue({
      data: { user: { id: 'actor-1' } },
    })

    await logSubstituteActivity({
      action: 'SUBSTITUTE_CONTENT',
      clase: {
        id: 'clase-1',
        nombre: 'Violín Inicial',
        maestro_principal_id: 'm-titular',
        maestro_suplente_id: 'm-suplente',
      },
      fecha: '2026-08-14',
      sesionId: 'ses-1',
      summary: 'Contenido registrado por suplente',
      changes: {
        indicador_id: 'ind-1',
      },
    })

    expect(auditLogMock).toHaveBeenCalledWith(
      'SUBSTITUTE_CONTENT',
      SUBSTITUTE_ACTIVITY_ENTITY,
      'clase-1',
      expect.objectContaining({
        user_id: 'actor-1',
        changes: expect.objectContaining({
          class_id: 'clase-1',
          maestro_titular_id: 'm-titular',
          maestro_suplente_id: 'm-suplente',
          sesion_id: 'ses-1',
          fecha: '2026-08-14',
          result: 'ok',
          summary: 'Contenido registrado por suplente',
          indicador_id: 'ind-1',
        }),
      }),
    )
  })

  it('lists substitute logs from the audit_logs table with filters', async () => {
    const query = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      then: vi.fn((resolve) =>
        resolve({
          data: [{ id: 'log-1' }],
          error: null,
        }),
      ),
    }

    fromMock.mockReturnValue(query)

    const result = await listSubstituteActivityLogs({
      classId: 'clase-1',
      action: 'SUBSTITUTE_ASSIGN',
      limit: 10,
    })

    expect(fromMock).toHaveBeenCalledWith('audit_logs')
    expect(query.eq).toHaveBeenCalledWith('entity', SUBSTITUTE_ACTIVITY_ENTITY)
    expect(query.eq).toHaveBeenCalledWith('entity_id', 'clase-1')
    expect(query.eq).toHaveBeenCalledWith('action', 'SUBSTITUTE_ASSIGN')
    expect(result).toEqual([{ id: 'log-1' }])
  })
})

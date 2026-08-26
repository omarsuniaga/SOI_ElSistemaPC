import { describe, it, expect, beforeEach, vi } from 'vitest'

const { fromMock, logSubstituteActivityMock, isSubstituteAssignmentMock } = vi.hoisted(() => ({
  fromMock: vi.fn(),
  logSubstituteActivityMock: vi.fn().mockResolvedValue(null),
  isSubstituteAssignmentMock: vi.fn(),
}))

vi.mock('../../../../lib/supabaseClient.js', () => ({
  supabase: {
    from: fromMock,
  },
}))

vi.mock('../../../../portal-maestros/services/substituteAuditService.js', () => ({
  logSubstituteActivity: logSubstituteActivityMock,
  isSubstituteAssignment: isSubstituteAssignmentMock,
}))

import { registrarAsistenciaBulk } from '../asistenciasSupabase.js'

describe('registrarAsistenciaBulk substitute audit integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('records substitute attendance when the class belongs to the substitute maestro', async () => {
    isSubstituteAssignmentMock.mockReturnValue(true)

    const alumnosQuery = {
      select: vi.fn().mockReturnThis(),
      in: vi.fn().mockResolvedValue({
        data: [{ id: 'al-1' }, { id: 'al-2' }],
        error: null,
      }),
    }

    const asistenciasQuery = {
      upsert: vi.fn().mockReturnThis(),
      select: vi.fn().mockResolvedValue({
        data: [
          { id: 'asis-1', estado: 'presente' },
          { id: 'asis-2', estado: 'ausente' },
        ],
        error: null,
      }),
    }

    fromMock
      .mockReturnValueOnce(alumnosQuery)
      .mockReturnValueOnce(asistenciasQuery)

    const result = await registrarAsistenciaBulk(
      [
        {
          sesion_clase_id: 'ses-1',
          clase_id: 'clase-1',
          alumno_id: 'al-1',
          fecha: '2026-08-14',
          estado: 'P',
        },
        {
          sesion_clase_id: 'ses-1',
          clase_id: 'clase-1',
          alumno_id: 'al-2',
          fecha: '2026-08-14',
          estado: 'A',
        },
      ],
      {
        clase: {
          id: 'clase-1',
          nombre: 'Piano I',
          maestro_principal_id: 'maestro-titular',
          maestro_suplente_id: 'maestro-suplente',
        },
        maestroId: 'maestro-suplente',
        fecha: '2026-08-14',
        sesionId: 'ses-1',
        userId: 'user-1',
      },
    )

    expect(result).toHaveLength(2)
    expect(logSubstituteActivityMock).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'SUBSTITUTE_ATTENDANCE',
        clase: expect.objectContaining({ id: 'clase-1' }),
        maestroTitularId: 'maestro-titular',
        maestroSuplenteId: 'maestro-suplente',
        fecha: '2026-08-14',
        sesionId: 'ses-1',
        userId: 'user-1',
        changes: expect.objectContaining({
          total_presentes: 1,
          total_ausentes: 1,
          total_justificados: 0,
        }),
      }),
    )
  })

  it('does not log substitute activity when the class is not assigned to the maestro', async () => {
    isSubstituteAssignmentMock.mockReturnValue(false)

    const alumnosQuery = {
      select: vi.fn().mockReturnThis(),
      in: vi.fn().mockResolvedValue({
        data: [{ id: 'al-1' }],
        error: null,
      }),
    }

    const asistenciasQuery = {
      upsert: vi.fn().mockReturnThis(),
      select: vi.fn().mockResolvedValue({
        data: [{ id: 'asis-1', estado: 'presente' }],
        error: null,
      }),
    }

    fromMock
      .mockReturnValueOnce(alumnosQuery)
      .mockReturnValueOnce(asistenciasQuery)

    await registrarAsistenciaBulk(
      [
        {
          sesion_clase_id: 'ses-1',
          clase_id: 'clase-1',
          alumno_id: 'al-1',
          fecha: '2026-08-14',
          estado: 'P',
        },
      ],
      {
        clase: {
          id: 'clase-1',
          maestro_principal_id: 'maestro-titular',
          maestro_suplente_id: 'maestro-suplente',
        },
        maestroId: 'maestro-otro',
      },
    )

    expect(logSubstituteActivityMock).not.toHaveBeenCalled()
  })
})

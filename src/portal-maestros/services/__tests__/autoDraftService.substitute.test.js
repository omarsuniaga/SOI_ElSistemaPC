import { describe, it, expect, beforeEach, vi } from 'vitest'

const {
  fromMock,
  enqueueMock,
  logSubstituteActivityMock,
  isSubstituteAssignmentMock,
} = vi.hoisted(() => ({
  fromMock: vi.fn(),
  enqueueMock: vi.fn(),
  logSubstituteActivityMock: vi.fn().mockResolvedValue(null),
  isSubstituteAssignmentMock: vi.fn(),
}))

vi.mock('../../../lib/supabaseClient.js', () => ({
  supabase: {
    from: fromMock,
  },
}))

vi.mock('../offlineQueue.js', () => ({
  enqueue: enqueueMock,
}))

vi.mock('../substituteAuditService.js', () => ({
  logSubstituteActivity: logSubstituteActivityMock,
  isSubstituteAssignment: isSubstituteAssignmentMock,
}))

import { saveObservation } from '../autoDraftService.js'

describe('autoDraftService substitute audit integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true })
  })

  it('logs substitute content when the maestro is assigned as substitute', async () => {
    isSubstituteAssignmentMock.mockReturnValue(true)

    const deleteChain = {
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
    }
    const insertChain = {
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { id: 'obs-1' },
        error: null,
      }),
    }

    fromMock
      .mockReturnValueOnce(deleteChain)
      .mockReturnValueOnce(insertChain)

    const result = await saveObservation(
      'ses-1',
      'maestro-suplente',
      'Contenido de prueba',
      { indicador_id: 'ind-1', evaluaciones: [] },
      'dsl-ia',
      'texto-mejorado',
      {
        clase: {
          id: 'clase-1',
          nombre: 'Violín Inicial',
          maestro_principal_id: 'maestro-titular',
          maestro_suplente_id: 'maestro-suplente',
        },
        fechaHoy: '2026-08-14',
        maestroUserId: 'user-1',
      },
    )

    expect(result).toEqual({ id: 'obs-1' })
    expect(logSubstituteActivityMock).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'SUBSTITUTE_CONTENT',
        clase: expect.objectContaining({ id: 'clase-1' }),
        maestroTitularId: 'maestro-titular',
        maestroSuplenteId: 'maestro-suplente',
        fecha: '2026-08-14',
        sesionId: 'ses-1',
        userId: 'user-1',
        changes: expect.objectContaining({
          indicador_id: 'ind-1',
          dsl_length: 'Contenido de prueba'.length,
          es_borrador: false,
        }),
      }),
    )
    expect(enqueueMock).not.toHaveBeenCalled()
  })

  it('saves the row under the titular id but audits the real actor via actorMaestroId', async () => {
    isSubstituteAssignmentMock.mockReturnValue(true)

    const deleteChain = {
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
    }
    const insertChain = {
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { id: 'obs-2' }, error: null }),
    }
    fromMock.mockReturnValueOnce(deleteChain).mockReturnValueOnce(insertChain)

    await saveObservation(
      'ses-1',
      'maestro-titular', // dueño de la fila — lo que ahora pasa asistenciaView.js/ObservationSaveButton.js
      'Contenido de prueba',
      { indicador_id: 'ind-1', evaluaciones: [] },
      null,
      null,
      {
        clase: {
          id: 'clase-1',
          nombre: 'Violín Inicial',
          maestro_principal_id: 'maestro-titular',
          maestro_suplente_id: 'maestro-suplente',
        },
        actorMaestroId: 'maestro-suplente', // quien realmente escribió
        fechaHoy: '2026-08-14',
      },
    )

    // La fila en observaciones_sesion queda bajo el titular
    expect(insertChain.insert).toHaveBeenCalledWith(
      expect.objectContaining({ maestro_id: 'maestro-titular' }),
    )
    // isSubstituteAssignment se evalúa con el ACTOR real, no con el dueño de la fila
    expect(isSubstituteAssignmentMock).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'clase-1' }),
      'maestro-suplente',
    )
    // La bitácora atribuye el evento al suplente real, no al titular
    expect(logSubstituteActivityMock).toHaveBeenCalledWith(
      expect.objectContaining({ maestroSuplenteId: 'maestro-suplente' }),
    )
  })

  it('sin actorMaestroId explícito, sigue funcionando como antes (retro-compatible)', async () => {
    isSubstituteAssignmentMock.mockReturnValue(true)

    const deleteChain = { delete: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis() }
    const insertChain = {
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { id: 'obs-3' }, error: null }),
    }
    fromMock.mockReturnValueOnce(deleteChain).mockReturnValueOnce(insertChain)

    await saveObservation(
      'ses-1',
      'maestro-suplente',
      'Contenido de prueba',
      { indicador_id: 'ind-1', evaluaciones: [] },
      null,
      null,
      { clase: { id: 'clase-1', maestro_principal_id: 'maestro-titular', maestro_suplente_id: 'maestro-suplente' } },
    )

    expect(isSubstituteAssignmentMock).toHaveBeenCalledWith(expect.anything(), 'maestro-suplente')
  })

  it('does not log substitute content when the maestro is not the assigned substitute', async () => {
    isSubstituteAssignmentMock.mockReturnValue(false)

    const deleteChain = {
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
    }
    const insertChain = {
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { id: 'obs-1' },
        error: null,
      }),
    }

    fromMock
      .mockReturnValueOnce(deleteChain)
      .mockReturnValueOnce(insertChain)

    await saveObservation(
      'ses-1',
      'maestro-otro',
      'Contenido de prueba',
      { indicador_id: 'ind-1', evaluaciones: [] },
      null,
      null,
      {
        clase: {
          id: 'clase-1',
          maestro_principal_id: 'maestro-titular',
          maestro_suplente_id: 'maestro-suplente',
        },
      },
    )

    expect(logSubstituteActivityMock).not.toHaveBeenCalled()
  })
})

// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * JustifModalManager.test.js
 *
 * Bug real que cubre este archivo: al guardar una justificación desde una
 * sesión emergente (sesión sin clase programada, claseId = null) el insert
 * en `justificaciones` fallaba con
 *   'null value in column "clase_id" ... violates not-null constraint'.
 *
 * El fix definitivo relaja la constraint en la base
 * (20260907000000_justificaciones_clase_id_nullable.sql). Aquí se verifica el
 * contrato de la capa de aplicación: el manager reenvía claseId tal cual
 * (incluido null) a guardarJustificacion y completa el flujo de guardado sin
 * error cuando no hay clase asociada.
 */

const { createJustificacionModalMock, capturedHandlers } = vi.hoisted(() => {
  const capturedHandlers = {}
  return {
    capturedHandlers,
    createJustificacionModalMock: vi.fn((_container, handlers) => {
      Object.assign(capturedHandlers, handlers)
      return { open: vi.fn(), close: vi.fn() }
    }),
  }
})

vi.mock('../../JustificacionModal.js', () => ({
  createJustificacionModal: createJustificacionModalMock,
}))

import { createJustifModalManager } from '../JustifModalManager.js'

function buildManager(overrides = {}) {
  const guardarJustificacion = vi
    .fn()
    .mockResolvedValue({ data: { id: 'justif-1' }, error: null })
  const onJustifSaved = vi.fn()
  const onAutoSave = vi.fn().mockResolvedValue(undefined)

  const opts = {
    getSesionId: () => 'sesion-1',
    claseId: null,
    fechaHoy: '2026-09-07',
    maestroId: 'maestro-1',
    supabase: { storage: { from: vi.fn() } },
    guardarJustificacion,
    eliminarJustificacion: vi.fn(),
    onJustifSaved,
    onRenderLista: vi.fn(),
    onUpdateProgress: vi.fn(),
    onAutoSave,
    onAnnounce: vi.fn(),
    ...overrides,
  }

  createJustifModalManager(document.body, opts)
  return { opts, guardarJustificacion, onJustifSaved, onAutoSave }
}

describe('JustifModalManager — onSave', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    document.body.innerHTML = '<button id="pm-justif-save"></button>'
  })

  it('reenvía claseId null (sesión emergente) a guardarJustificacion y completa el guardado', async () => {
    const { guardarJustificacion, onJustifSaved } = buildManager({ claseId: null })

    await capturedHandlers.onSave({
      alumnoId: 'alumno-1',
      motivo: 'Cita médica',
      evidenciaFile: null,
      justificacionId: null,
      existingUrl: null,
      isEdit: false,
    })

    expect(guardarJustificacion).toHaveBeenCalledTimes(1)
    const [payload] = guardarJustificacion.mock.calls[0]
    expect(payload).toMatchObject({
      sesionId: 'sesion-1',
      alumnoId: 'alumno-1',
      claseId: null,
      fecha: '2026-09-07',
      motivo: 'Cita médica',
      creadoPor: 'maestro-1',
    })
    expect(onJustifSaved).toHaveBeenCalledWith('alumno-1', { id: 'justif-1' })
  })

  it('reenvía el claseId real cuando la sesión sí tiene clase programada', async () => {
    const { guardarJustificacion } = buildManager({ claseId: 'clase-99' })

    await capturedHandlers.onSave({
      alumnoId: 'alumno-2',
      motivo: 'Viaje familiar',
      evidenciaFile: null,
      isEdit: false,
    })

    const [payload] = guardarJustificacion.mock.calls[0]
    expect(payload.claseId).toBe('clase-99')
  })
})

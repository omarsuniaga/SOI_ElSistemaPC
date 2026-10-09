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

const { createJustificacionModalMock, capturedHandlers, deleteEvidenciaMock } = vi.hoisted(() => {
  const capturedHandlers = {}
  return {
    capturedHandlers,
    createJustificacionModalMock: vi.fn((_container, handlers) => {
      Object.assign(capturedHandlers, handlers)
      return { open: vi.fn(), close: vi.fn() }
    }),
    deleteEvidenciaMock: vi.fn().mockResolvedValue(undefined),
  }
})

vi.mock('../../JustificacionModal.js', () => ({
  createJustificacionModal: createJustificacionModalMock,
}))

vi.mock('../../../services/justificacionService.js', () => ({
  deleteEvidencia: deleteEvidenciaMock,
}))

import { createJustifModalManager } from '../JustifModalManager.js'

function buildManager(overrides = {}) {
  const guardarJustificacion = vi
    .fn()
    .mockResolvedValue({ data: { id: 'justif-1' }, error: null })
  const actualizarJustificacion = vi
    .fn()
    .mockResolvedValue({ data: { id: 'justif-1' }, error: null })
  const onJustifSaved = vi.fn()
  const onAutoSave = vi.fn().mockResolvedValue(undefined)

  const opts = {
    getSesionId: () => 'sesion-1',
    claseId: null,
    fechaHoy: '2026-09-07',
    maestroId: 'maestro-1',
    guardarJustificacion,
    actualizarJustificacion,
    eliminarJustificacion: vi.fn(),
    onJustifSaved,
    onRenderLista: vi.fn(),
    onUpdateProgress: vi.fn(),
    onAutoSave,
    onAnnounce: vi.fn(),
    ...overrides,
  }

  createJustifModalManager(document.body, opts)
  return { opts, guardarJustificacion, actualizarJustificacion, onJustifSaved, onAutoSave }
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

  it('al editar, delega en actualizarJustificacion (no en guardarJustificacion ni en Supabase directo)', async () => {
    const { guardarJustificacion, actualizarJustificacion, onJustifSaved } = buildManager()

    await capturedHandlers.onSave({
      alumnoId: 'alumno-3',
      motivo: 'Reposo médico',
      evidenciaFile: null,
      evidenciaRemoved: false,
      justificacionId: 'justif-9',
      existingUrl: 'https://test.co/storage/v1/object/public/documentos/justificaciones/old.jpg',
      isEdit: true,
    })

    expect(actualizarJustificacion).toHaveBeenCalledWith({
      justificacionId: 'justif-9',
      motivo: 'Reposo médico',
      evidenciaFile: null,
      evidenciaRemoved: false,
      existingUrl: 'https://test.co/storage/v1/object/public/documentos/justificaciones/old.jpg',
    })
    expect(guardarJustificacion).not.toHaveBeenCalled()
    expect(onJustifSaved).toHaveBeenCalledWith('alumno-3', { id: 'justif-1' })
  })
})

describe('JustifModalManager — onDelete', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    document.body.innerHTML = '<button id="pm-justif-save"></button>'
  })

  it('borra la evidencia del storage (vía deleteEvidencia del servicio) y elimina el registro', async () => {
    const eliminarJustificacion = vi.fn().mockResolvedValue({ error: null })
    const onJustifDeleted = vi.fn()
    buildManager({ eliminarJustificacion, onJustifDeleted })

    await capturedHandlers.onDelete({
      alumnoId: 'alumno-5',
      justificacionId: 'justif-5',
      existingUrl: 'https://test.co/storage/v1/object/public/documentos/justificaciones/old.jpg',
    })

    expect(deleteEvidenciaMock).toHaveBeenCalledWith('https://test.co/storage/v1/object/public/documentos/justificaciones/old.jpg')
    expect(eliminarJustificacion).toHaveBeenCalledWith('justif-5')
    expect(onJustifDeleted).toHaveBeenCalledWith('alumno-5')
  })

  it('no intenta borrar evidencia si no existía', async () => {
    const eliminarJustificacion = vi.fn().mockResolvedValue({ error: null })
    buildManager({ eliminarJustificacion })

    await capturedHandlers.onDelete({ alumnoId: 'alumno-6', justificacionId: 'justif-6', existingUrl: null })

    expect(deleteEvidenciaMock).not.toHaveBeenCalled()
    expect(eliminarJustificacion).toHaveBeenCalledWith('justif-6')
  })
})

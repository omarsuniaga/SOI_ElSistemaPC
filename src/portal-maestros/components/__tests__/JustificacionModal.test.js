// @vitest-environment jsdom
/**
 * JustificacionModal.test.js
 *
 * Cubre dos bugs corregidos en el flujo de evidencia:
 * - Sin validación de tamaño/tipo en el input de archivo (ahora rechaza
 *   >5MB y tipos distintos de pdf/jpeg/png antes de aceptarlo).
 * - Quitar una evidencia existente no viajaba hasta el guardado (ahora
 *   onSave recibe evidenciaRemoved: true cuando corresponde).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createJustificacionModal } from '../JustificacionModal.js'

function freshModal(handlers = {}) {
  document.getElementById('pm-justif-modal')?.remove()
  document.getElementById('pm-justif-styles')?.remove()
  const onSave = vi.fn()
  const onCancel = vi.fn()
  const onDelete = vi.fn()
  const modal = createJustificacionModal(document.body, { onSave, onCancel, onDelete, ...handlers })
  return { modal, onSave, onCancel, onDelete }
}

function makeFile({ name = 'foto.jpg', type = 'image/jpeg', size = 1024 } = {}) {
  return new File([new Uint8Array(size)], name, { type })
}

describe('JustificacionModal — validación de evidencia al seleccionar archivo', () => {
  let alertSpy

  beforeEach(() => {
    alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
  })

  afterEach(() => {
    alertSpy.mockRestore()
  })

  it('rechaza un archivo mayor a 5MB y no lo adjunta', () => {
    const { modal, onSave } = freshModal()
    modal.open({ id: 'a1', nombre_completo: 'Ana Pérez' })

    const fileInput = document.getElementById('pm-justif-file')
    fileInput.onchange({ target: { files: [makeFile({ size: 6 * 1024 * 1024 })] } })

    expect(alertSpy).toHaveBeenCalled()

    document.getElementById('pm-justif-motivo').value = 'Cita médica'
    document.getElementById('pm-justif-save').click()

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ evidenciaFile: null }))
  })

  it('rechaza un tipo MIME no permitido y no lo adjunta', () => {
    const { modal, onSave } = freshModal()
    modal.open({ id: 'a1', nombre_completo: 'Ana Pérez' })

    const fileInput = document.getElementById('pm-justif-file')
    fileInput.onchange({ target: { files: [makeFile({ type: 'application/zip' })] } })

    expect(alertSpy).toHaveBeenCalled()

    document.getElementById('pm-justif-motivo').value = 'Cita médica'
    document.getElementById('pm-justif-save').click()

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ evidenciaFile: null }))
  })

  it('acepta una imagen válida (≤5MB, jpeg/png/pdf)', () => {
    const { modal, onSave } = freshModal()
    modal.open({ id: 'a1', nombre_completo: 'Ana Pérez' })

    const file = makeFile()
    document.getElementById('pm-justif-file').onchange({ target: { files: [file] } })

    expect(alertSpy).not.toHaveBeenCalled()

    document.getElementById('pm-justif-motivo').value = 'Cita médica'
    document.getElementById('pm-justif-save').click()

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ evidenciaFile: file }))
  })
})

describe('JustificacionModal — quitar evidencia existente (bug #3)', () => {
  it('marca evidenciaRemoved=true al quitar una evidencia ya guardada, sin elegir reemplazo', () => {
    const { modal, onSave } = freshModal()
    modal.open(
      { id: 'a2', nombre_completo: 'Luis Gómez' },
      { id: 'j-1', motivo: 'Viejo motivo', evidencia_url: 'https://test.co/old.jpg' },
      'J',
    )

    document.getElementById('pm-justif-remove-file').click()
    document.getElementById('pm-justif-motivo').value = 'Nuevo motivo'
    document.getElementById('pm-justif-save').click()

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({
      evidenciaFile: null,
      evidenciaRemoved: true,
      existingUrl: 'https://test.co/old.jpg',
      isEdit: true,
    }))
  })

  it('no marca evidenciaRemoved cuando no había evidencia previa (crear nuevo)', () => {
    const { modal, onSave } = freshModal()
    modal.open({ id: 'a3', nombre_completo: 'Carla Ruiz' })

    document.getElementById('pm-justif-motivo').value = 'Motivo'
    document.getElementById('pm-justif-save').click()

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ evidenciaRemoved: false }))
  })

  it('elegir un archivo nuevo después de quitar el anterior desmarca evidenciaRemoved', () => {
    const { modal, onSave } = freshModal()
    modal.open(
      { id: 'a4', nombre_completo: 'Pedro Luna' },
      { id: 'j-2', motivo: 'Viejo motivo', evidencia_url: 'https://test.co/old.jpg' },
      'J',
    )

    document.getElementById('pm-justif-remove-file').click()
    const nuevo = makeFile({ name: 'nuevo.jpg' })
    document.getElementById('pm-justif-file').onchange({ target: { files: [nuevo] } })

    document.getElementById('pm-justif-motivo').value = 'Nuevo motivo'
    document.getElementById('pm-justif-save').click()

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({
      evidenciaFile: nuevo,
      evidenciaRemoved: false,
    }))
  })
})

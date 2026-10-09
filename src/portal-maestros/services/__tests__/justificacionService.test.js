/**
 * justificacionService.test.js
 * Verifica que guardarJustificacion envía el payload correcto a Supabase
 * sin incluir columnas fantasma (ausencia_fecha, aprobada_por, razon_rechazo).
 *
 * Regresión: el trigger fn_soi_evento_justificacion() en T9 fallaba con
 * "record 'new' has no field 'ausencia_fecha'" porque la tabla justificaciones
 * tiene la columna 'fecha', no 'ausencia_fecha'.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'

// vi.hoisted garante que existen ANTES del hoisting de vi.mock
const { upsertSpy, updateSpy, fromSpy, storageFromSpy, uploadSpy, removeSpy } = vi.hoisted(() => ({
  upsertSpy: vi.fn(),
  updateSpy: vi.fn(),
  fromSpy: vi.fn(),
  storageFromSpy: vi.fn(),
  uploadSpy: vi.fn(),
  removeSpy: vi.fn(),
}))

vi.mock('../../../lib/supabaseClient.js', () => ({
  supabase: {
    from: (...args) => fromSpy(...args),
    storage: {
      from: (...args) => {
        storageFromSpy(...args)
        return {
          upload: (...uArgs) => uploadSpy(...uArgs),
          getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://test.co/documentos/justificaciones/test.jpg' } }),
          remove: (...rArgs) => removeSpy(...rArgs),
        }
      },
    },
  },
}))

import {
  guardarJustificacion,
  actualizarJustificacion,
  uploadEvidencia,
  deleteEvidencia,
} from '../justificacionService.js'
import { FileTooLargeError, InvalidMimeError } from '../fileUploadService.js'

function makeFile({ name = 'foto.jpg', type = 'image/jpeg', size = 1024 } = {}) {
  const file = new File([new Uint8Array(size)], name, { type })
  return file
}

describe('guardarJustificacion — payload validation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Default: upsert succeeds — chain: from().upsert().select().single()
    fromSpy.mockReturnValue({
      upsert: upsertSpy.mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { id: 'j-1' }, error: null }),
        }),
      }),
    })
  })

  const VALID = {
    sesionId: 'sesion-uuid-1',
    alumnoId: 'alumno-uuid-1',
    claseId: 'clase-uuid-1',
    fecha: '2026-08-19',
    motivo: 'Cita médica controlada',
    creadoPor: 'maestro-uuid-1',
  }

  it('envía los campos correctos a upsert sin ausencia_fecha', async () => {
    await guardarJustificacion(VALID)

    expect(fromSpy).toHaveBeenCalledWith('justificaciones')
    // upsert([payload], opts) → calls[0] = [[payload], opts]
    const [payloadArr, opts] = upsertSpy.mock.calls[0]
    const payload = Array.isArray(payloadArr) ? payloadArr[0] : payloadArr

    expect(payload.sesion_id).toBe('sesion-uuid-1')
    expect(payload.alumno_id).toBe('alumno-uuid-1')
    expect(payload.clase_id).toBe('clase-uuid-1')
    expect(payload.fecha).toBe('2026-08-19')
    expect(payload.motivo).toBe('Cita médica controlada')
    expect(payload.creado_por).toBe('maestro-uuid-1')
    expect(payload.estado).toBe('pendiente')

    // Columnas fantasma — el error original
    expect(payload).not.toHaveProperty('ausencia_fecha')
    expect(payload).not.toHaveProperty('aprobada_por')
    expect(payload).not.toHaveProperty('razon_rechazo')
  })

  it('usa onConflict correcto para idempotencia', async () => {
    await guardarJustificacion(VALID)

    const [, opts] = upsertSpy.mock.calls[0]
    expect(opts.onConflict).toBe('sesion_id,alumno_id')
  })

  it('evidencia_url es null cuando no se sube archivo', async () => {
    await guardarJustificacion(VALID)

    // upsert([payload], opts) → calls[0] = [[payload], opts]
    const [payloadArr, opts] = upsertSpy.mock.calls[0]
    const payload = Array.isArray(payloadArr) ? payloadArr[0] : payloadArr
    expect(payload.evidencia_url).toBeNull()
    expect(payload.evidencia_base64).toBeNull()
  })

  it('retorna error cuando faltan campos requeridos', async () => {
    const result = await guardarJustificacion({ sesionId: 's1' })

    expect(result.error).toBeDefined()
    expect(result.error.message).toContain('Faltan campos requeridos')
    expect(fromSpy).not.toHaveBeenCalled()
  })

  it('retorna error cuando fecha es undefined', async () => {
    const result = await guardarJustificacion({ ...VALID, fecha: undefined })

    expect(result.error).toBeDefined()
    expect(result.error.message).toContain('fecha')
    expect(fromSpy).not.toHaveBeenCalled()
  })

  it('claseId es null cuando no se provee', async () => {
    await guardarJustificacion({ ...VALID, claseId: undefined })

    // upsert([payload], opts) → calls[0] = [[payload], opts]
    const [payloadArr, opts] = upsertSpy.mock.calls[0]
    const payload = Array.isArray(payloadArr) ? payloadArr[0] : payloadArr
    expect(payload.clase_id).toBeNull()
  })

  it('propaga error de Supabase cuando el upsert falla', async () => {
    const dbError = { message: 'record "new" has no field "ausencia_fecha"' }
    fromSpy.mockReturnValue({
      upsert: upsertSpy.mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: dbError }),
        }),
      }),
    })

    const result = await guardarJustificacion(VALID)

    expect(result.error).toEqual(dbError)
  })
})

describe('guardarJustificacion — integration flow', () => {
  it('obtiene registro guardado con campos correctos', async () => {
    const record = { id: 'j-new', motivo: 'Razón familiar', fecha: '2026-08-19' }
    fromSpy.mockReturnValue({
      upsert: upsertSpy.mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: record, error: null }),
        }),
      }),
    })

    const result = await guardarJustificacion({
      sesionId: 'sesion-abc',
      alumnoId: 'alumno-xyz',
      claseId: 'clase-123',
      fecha: '2026-08-19',
      motivo: 'Razón familiar',
      creadoPor: 'maestro-999',
    })

    expect(result.data).toEqual(record)
    expect(result.error).toBeNull()

    // upsert([payload], opts) → calls[0] = [[payload], opts]
    const [payloadArr, opts] = upsertSpy.mock.calls[0]
    const payload = Array.isArray(payloadArr) ? payloadArr[0] : payloadArr
    expect(payload).not.toHaveProperty('ausencia_fecha')
  })
})

describe('uploadEvidencia / deleteEvidencia — bucket y validación', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    uploadSpy.mockResolvedValue({ data: { path: 'justificaciones/abc.jpg' }, error: null })
    removeSpy.mockResolvedValue({ error: null })
  })

  it('sube al bucket "documentos" (regresión: no "documentos-private", que no existe)', async () => {
    await uploadEvidencia(makeFile())
    expect(storageFromSpy).toHaveBeenCalledWith('documentos')
  })

  it('rechaza archivos mayores a 5MB sin llegar a subir', async () => {
    const file = makeFile({ size: 6 * 1024 * 1024 })
    await expect(uploadEvidencia(file)).rejects.toBeInstanceOf(FileTooLargeError)
    expect(uploadSpy).not.toHaveBeenCalled()
  })

  it('rechaza tipos MIME no permitidos sin llegar a subir', async () => {
    const file = makeFile({ type: 'application/zip' })
    await expect(uploadEvidencia(file)).rejects.toBeInstanceOf(InvalidMimeError)
    expect(uploadSpy).not.toHaveBeenCalled()
  })

  it('deleteEvidencia borra del bucket "documentos" usando el path de la URL pública', async () => {
    await deleteEvidencia('https://test.co/storage/v1/object/public/documentos/justificaciones/old.jpg')
    expect(storageFromSpy).toHaveBeenCalledWith('documentos')
    expect(removeSpy).toHaveBeenCalledWith(['justificaciones/old.jpg'])
  })

  it('deleteEvidencia no hace nada si no recibe URL', async () => {
    await deleteEvidencia(null)
    expect(removeSpy).not.toHaveBeenCalled()
  })
})

describe('actualizarJustificacion — edición y borrado de evidencia', () => {
  const EXISTING_URL = 'https://test.co/storage/v1/object/public/documentos/justificaciones/old.jpg'

  beforeEach(() => {
    vi.clearAllMocks()
    uploadSpy.mockResolvedValue({ data: { path: 'justificaciones/test.jpg' }, error: null })
    removeSpy.mockResolvedValue({ error: null })
    fromSpy.mockReturnValue({
      update: updateSpy.mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: { id: 'j-1' }, error: null }),
          }),
        }),
      }),
    })
  })

  it('sin archivo nuevo ni remoción explícita: no toca evidencia_url', async () => {
    await actualizarJustificacion({ justificacionId: 'j-1', motivo: 'x', existingUrl: EXISTING_URL })

    const [payload] = updateSpy.mock.calls[0]
    expect(payload.evidencia_url).toBe(EXISTING_URL)
    expect(uploadSpy).not.toHaveBeenCalled()
    expect(removeSpy).not.toHaveBeenCalled()
  })

  it('evidenciaRemoved=true sin archivo nuevo: borra la evidencia vieja y deja null (bug #3 corregido)', async () => {
    await actualizarJustificacion({ justificacionId: 'j-1', motivo: 'x', evidenciaRemoved: true, existingUrl: EXISTING_URL })

    expect(removeSpy).toHaveBeenCalledWith(['justificaciones/old.jpg'])
    const [payload] = updateSpy.mock.calls[0]
    expect(payload.evidencia_url).toBeNull()
  })

  it('archivo nuevo: sube la nueva evidencia antes de borrar la vieja (orden correcto, bug #5 corregido)', async () => {
    const callOrder = []
    uploadSpy.mockImplementation(async () => {
      callOrder.push('upload')
      return { data: { path: 'justificaciones/new.jpg' }, error: null }
    })
    removeSpy.mockImplementation(async () => {
      callOrder.push('remove')
      return { error: null }
    })

    await actualizarJustificacion({
      justificacionId: 'j-1',
      motivo: 'x',
      evidenciaFile: makeFile({ name: 'new.jpg' }),
      existingUrl: EXISTING_URL,
    })

    expect(callOrder).toEqual(['upload', 'remove'])
    const [payload] = updateSpy.mock.calls[0]
    expect(payload.evidencia_url).not.toBe(EXISTING_URL)
  })

  it('si la subida del archivo nuevo falla, conserva la evidencia anterior sin borrarla', async () => {
    uploadSpy.mockResolvedValue({ data: null, error: { message: 'network down' } })

    await actualizarJustificacion({
      justificacionId: 'j-1',
      motivo: 'x',
      evidenciaFile: makeFile({ name: 'new.jpg' }),
      existingUrl: EXISTING_URL,
    })

    expect(removeSpy).not.toHaveBeenCalled()
    const [payload] = updateSpy.mock.calls[0]
    expect(payload.evidencia_url).toBe(EXISTING_URL)
  })

  it('retorna error cuando falta justificacionId', async () => {
    const result = await actualizarJustificacion({ motivo: 'x' })
    expect(result.error.message).toContain('ID requerido')
    expect(fromSpy).not.toHaveBeenCalled()
  })
})

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
const { upsertSpy, fromSpy } = vi.hoisted(() => ({
  upsertSpy: vi.fn(),
  fromSpy: vi.fn(),
}))

vi.mock('../../../lib/supabaseClient.js', () => ({
  supabase: {
    from: (...args) => fromSpy(...args),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn().mockResolvedValue({ data: { path: 'justif/test.jpg' }, error: null }),
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://test.co/test.jpg' } }),
        remove: vi.fn().mockResolvedValue({ error: null }),
      })),
    },
  },
}))

import { guardarJustificacion } from '../justificacionService.js'

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

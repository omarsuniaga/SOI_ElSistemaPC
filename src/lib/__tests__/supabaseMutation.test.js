import { describe, it, expect, vi } from 'vitest'
import { assertAffected, mutateOne } from '../supabaseMutation.js'

/**
 * Simula el filter builder de PostgREST tras .update()/.delete() + filtros,
 * SIN .select() terminal. El helper le agrega .select() y resuelve la promesa.
 */
function fakeBuilder(resolvedValue) {
  return {
    select: vi.fn().mockResolvedValue(resolvedValue),
  }
}

describe('assertAffected', () => {
  it('agrega .select() al builder y devuelve las filas afectadas', async () => {
    const builder = fakeBuilder({ data: [{ id: 'a1' }, { id: 'a2' }], error: null })

    const rows = await assertAffected(builder, { action: 'actualizar X' })

    expect(builder.select).toHaveBeenCalledOnce()
    expect(rows).toEqual([{ id: 'a1' }, { id: 'a2' }])
  })

  it('normaliza data no-array (objeto único) a array de una fila', async () => {
    const builder = fakeBuilder({ data: { id: 'a1' }, error: null })

    const rows = await assertAffected(builder)

    expect(rows).toEqual([{ id: 'a1' }])
  })

  it('lanza el error de transporte de Supabase tal cual', async () => {
    const builder = fakeBuilder({ data: null, error: { message: 'network down' } })

    await expect(assertAffected(builder)).rejects.toMatchObject({ message: 'network down' })
  })

  it('lanza NO_ROWS_AFFECTED cuando 0 filas matchearon (error null, data vacía)', async () => {
    const builder = fakeBuilder({ data: [], error: null })

    await expect(assertAffected(builder, { action: 'aprobar ausencia' })).rejects.toMatchObject({
      code: 'NO_ROWS_AFFECTED',
    })
  })

  it('el mensaje de NO_ROWS_AFFECTED incluye la acción para diagnóstico', async () => {
    const builder = fakeBuilder({ data: [], error: null })

    await expect(assertAffected(builder, { action: 'aprobar ausencia' })).rejects.toThrow(
      /aprobar ausencia/,
    )
  })

  it('data null con error null también cuenta como 0 filas', async () => {
    const builder = fakeBuilder({ data: null, error: null })

    await expect(assertAffected(builder)).rejects.toMatchObject({ code: 'NO_ROWS_AFFECTED' })
  })

  it('respeta min > 1 (p.ej. borrado en lote esperando N filas)', async () => {
    const builder = fakeBuilder({ data: [{ id: 'a1' }], error: null })

    await expect(assertAffected(builder, { min: 2 })).rejects.toMatchObject({
      code: 'NO_ROWS_AFFECTED',
    })
  })
})

describe('mutateOne', () => {
  it('devuelve la primera (única) fila afectada', async () => {
    const builder = fakeBuilder({ data: [{ id: 'a1', estado: 'aprobada' }], error: null })

    const row = await mutateOne(builder, { action: 'aprobar ausencia' })

    expect(row).toEqual({ id: 'a1', estado: 'aprobada' })
  })

  it('propaga NO_ROWS_AFFECTED cuando no matcheó ninguna fila', async () => {
    const builder = fakeBuilder({ data: [], error: null })

    await expect(mutateOne(builder, { action: 'aprobar ausencia' })).rejects.toMatchObject({
      code: 'NO_ROWS_AFFECTED',
    })
  })
})

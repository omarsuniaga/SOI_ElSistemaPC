/**
 * supabaseMutation.js — guardas para mutaciones Supabase/PostgREST.
 *
 * PostgREST devuelve `error === null` aunque la mutación no haya tocado
 * ninguna fila (id inexistente, fila filtrada por RLS). Sin `.select()` ni
 * chequeo de filas, `.update()` / `.delete()` se convierten en no-ops
 * silenciosos que la UI reporta como éxito (ver LC1 / auditoría lila).
 *
 * Uso: pasar el filter builder DESPUÉS de `.update()/.delete()` y los filtros,
 * pero SIN `.select()` terminal — el helper agrega el `.select()`.
 *
 *   await mutateOne(
 *     supabase.from('ausencias_maestros').update({ estado }).eq('id', id),
 *     { action: 'aprobar ausencia' },
 *   )
 */

/**
 * Ejecuta la mutación forzando representación de vuelta y verifica que
 * afectó al menos `min` filas.
 *
 * @param {{ select: Function }} builder filter builder sin `.select()` terminal
 * @param {{ action?: string, min?: number }} [opts]
 * @returns {Promise<Array<object>>} filas afectadas
 * @throws el error de transporte de Supabase, o un Error con
 *   `code === 'NO_ROWS_AFFECTED'` si no se alcanzó `min`.
 */
export async function assertAffected(builder, { action = 'mutación', min = 1 } = {}) {
  const { data, error } = await builder.select()
  if (error) throw error

  const rows = Array.isArray(data) ? data : data == null ? [] : [data]
  if (rows.length < min) {
    const err = new Error(
      `${action}: no afectó ninguna fila (¿id inexistente o sin permiso?)`,
    )
    err.code = 'NO_ROWS_AFFECTED'
    throw err
  }
  return rows
}

/**
 * Igual que `assertAffected` con `min: 1`, pero devuelve la primera fila.
 *
 * @param {{ select: Function }} builder
 * @param {{ action?: string }} [opts]
 * @returns {Promise<object>}
 */
export async function mutateOne(builder, { action = 'mutación' } = {}) {
  const rows = await assertAffected(builder, { action, min: 1 })
  return rows[0]
}

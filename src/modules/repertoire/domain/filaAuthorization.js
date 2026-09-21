/**
 * Alcance editable del maestro dentro de un montaje.
 *
 * La autorización del motor es por asignación a fila (`montaje_fila_maestros`),
 * no por ser titular de una clase. El cliente refleja esa misma regla para no
 * ofrecer acciones que el servidor va a rechazar; la RLS sigue siendo la que
 * manda.
 */
export function collectEditableFilaIds(assignments, actorId) {
  if (!actorId) return []
  const ids = new Set()
  for (const asignacion of assignments || []) {
    if (asignacion?.maestro_id !== actorId) continue
    if (asignacion.active === false) continue
    if (!asignacion.can_edit_preparation) continue
    if (asignacion.fila_id) ids.add(asignacion.fila_id)
  }
  return [...ids]
}

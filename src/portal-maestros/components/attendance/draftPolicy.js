/**
 * Política de guardado del contenido escrito durante la clase.
 *
 * El editor DSL emite `onChange` también al montarse con el contenido del
 * servidor y cuando otro componente le inyecta texto (IA, estructura, borrador
 * recuperado). Sin estos frenos, abrir una clase dispararía una escritura y un
 * editor vacío crearía una sesión en blanco.
 */

/**
 * @param {Object} params
 * @param {string} params.value - Contenido actual del editor.
 * @param {string} params.lastPersisted - Último contenido que ya se mandó a guardar.
 * @param {boolean} params.hasSesion - Si ya existe la fila de `sesiones_clase`.
 * @param {boolean} [params.isRegistered] - Si la sesión ya fue registrada por el maestro.
 * @returns {boolean} true si corresponde agendar el autosave.
 */
export function shouldQueueDraftSave({
  value = '',
  lastPersisted = '',
  hasSesion = false,
  isRegistered = false,
} = {}) {
  // El autosave escribe siempre `borrador: true`: sobre una sesión registrada
  // la devolvería a borrador sin que el maestro lo haya pedido.
  if (isRegistered) return false
  if (value === lastPersisted) return false
  // Vaciar el editor es un cambio legítimo, pero solo cuando hay algo que
  // actualizar: sin sesión, un editor vacío no debe crear una fila.
  if (!hasSesion && !String(value || '').trim()) return false
  return true
}

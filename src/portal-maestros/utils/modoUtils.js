/**
 * Utilidades para el manejo del modo activo (admin | maestro) en el portal.
 *
 * Un usuario puede tener ambos roles simultáneamente (es_admin && es_maestro).
 * En ese caso, el modo activo se persiste en localStorage y puede cambiarse
 * sin necesidad de hacer logout.
 */

export const PM_MODO_KEY = 'pm-modo'

/**
 * Determina el modo activo para el usuario dado.
 *
 * | es_admin | es_maestro | localStorage  | resultado  |
 * |----------|------------|---------------|------------|
 * | false    | any        | any           | 'maestro'  |
 * | true     | false/nil  | any           | 'admin'    |
 * | true     | true       | 'maestro'     | 'maestro'  |
 * | true     | true       | 'admin'/null  | 'admin'    |
 *
 * @param {{ es_admin?: boolean, es_maestro?: boolean } | null} maestro
 * @returns {'admin' | 'maestro'}
 */
export function getModoActual(maestro) {
  if (!maestro?.es_admin) return 'maestro'
  if (!maestro?.es_maestro) return 'admin'
  return localStorage.getItem(PM_MODO_KEY) || 'admin'
}

/**
 * Guarda el modo activo en localStorage y recarga la página.
 * @param {'admin' | 'maestro'} modo
 */
export function setModo(modo) {
  localStorage.setItem(PM_MODO_KEY, modo)
  window.location.reload()
}

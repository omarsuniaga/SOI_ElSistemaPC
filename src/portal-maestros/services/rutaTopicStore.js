const KEY = 'soi_ruta_tema_pendiente'

/**
 * Store a selected topic so asistenciaView can auto-inject it on next open.
 *
 * @param {{
 *   indicatorId: string,
 *   nombre: string,
 *   nodeNombre: string,
 *   levelNombre: string,
 *   blockNombre: string,
 *   claseId: string,
 * }} tema
 */
export function setRutaTema(tema) {
  sessionStorage.setItem(KEY, JSON.stringify(tema))
}

/**
 * Retrieve and immediately clear the pending topic.
 * Returns null if nothing is stored.
 *
 * @returns {{ indicatorId: string, nombre: string, nodeNombre: string, levelNombre: string, blockNombre: string, claseId: string } | null}
 */
export function consumeRutaTema() {
  const raw = sessionStorage.getItem(KEY)
  if (!raw) return null
  sessionStorage.removeItem(KEY)
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

/**
 * Peek at the pending topic without clearing it.
 * Used by rutaPlayerView to show "topic pending" indicator.
 *
 * @returns {{ indicatorId: string, nombre: string, claseId: string } | null}
 */
export function peekRutaTema() {
  const raw = sessionStorage.getItem(KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

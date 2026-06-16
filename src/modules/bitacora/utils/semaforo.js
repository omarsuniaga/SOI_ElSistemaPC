/**
 * semaforo.js — Pure function for traffic-light color derivation.
 *
 * Extracted here so it can be imported and tested independently of the
 * BitacoraRegistro class. Both this export and BitacoraRegistro.calcularSemaforo
 * delegate to the same logic.
 *
 * Thresholds (provisional — requires product sign-off):
 *   gris:    total_registros === 0
 *   rojo:    mal_count / total > 0.50  (conservative; takes precedence over verde)
 *   verde:   bien_count / total >= 0.70
 *   naranja: all other cases
 *
 * @param {{ bien_count: number, regular_count: number, mal_count: number, total_registros: number }} counts
 * @returns {'verde'|'naranja'|'rojo'|'gris'}
 */
export function calcularSemaforo({ bien_count, mal_count, total_registros }) {
  if (total_registros === 0) return 'gris'
  // rojo takes precedence over verde when both thresholds are met (conservative)
  if (mal_count / total_registros > 0.5) return 'rojo'
  if (bien_count / total_registros >= 0.7) return 'verde'
  return 'naranja'
}

/**
 * Maps a semáforo value to a CSS class token used across components.
 * @param {'verde'|'naranja'|'rojo'|'gris'} semaforo
 * @returns {string}
 */
export function semaforoClass(semaforo) {
  const map = {
    verde: 'semaforo--verde',
    naranja: 'semaforo--naranja',
    rojo: 'semaforo--rojo',
    gris: 'semaforo--gris',
  }
  return map[semaforo] || 'semaforo--gris'
}

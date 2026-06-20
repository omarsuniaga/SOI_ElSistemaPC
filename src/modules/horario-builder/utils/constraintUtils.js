/**
 * constraintUtils.js — Pure utility functions for schedule constraint configuration.
 */

const ALL_DAYS = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo']

/**
 * Builds a jornada config object for all 7 days of the week.
 * Selected days get the provided start/end times; unselected days get 00:00–00:00.
 *
 * @param {string} startTime - 'HH:MM' format
 * @param {string} endTime   - 'HH:MM' format
 * @param {string[]} selectedDays - array of day keys (e.g. ['lunes', 'miércoles'])
 * @returns {{ [day: string]: { inicio: string, fin: string } }}
 */
export function buildJornada(startTime, endTime, selectedDays = []) {
  return Object.fromEntries(
    ALL_DAYS.map(d => [
      d,
      selectedDays.includes(d)
        ? { inicio: startTime, fin: endTime }
        : { inicio: '00:00', fin: '00:00' }
    ])
  )
}

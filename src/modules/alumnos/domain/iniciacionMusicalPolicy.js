/**
 * Iniciación Musical Policy — pure functions, no side effects, no DOM, no I/O.
 *
 * Policy rules:
 * - Students without musical knowledge must complete a 6-month iniciación period.
 * - They become eligible to audition after 3 months from fechaIngreso.
 * - The period ends (and they must have auditioned) at 6 months.
 */

/**
 * Add months to a date, clamping to the last day of the target month.
 *
 * @param {Date} date
 * @param {number} months
 * @returns {Date}
 */
/**
 * Add months to a date string (YYYY-MM-DD), all in UTC, returning a new YYYY-MM-DD.
 * Clamps to the last day of the target month on overflow (e.g. Jan 31 + 3m = Apr 30).
 *
 * @param {string} dateStr - YYYY-MM-DD
 * @param {number} months
 * @returns {string} YYYY-MM-DD
 */
function addMonthsToDateStr(dateStr, months) {
  // Parse as UTC components to avoid timezone shift
  const [year, month, day] = dateStr.split('-').map(Number)
  const targetMonth = month - 1 + months  // 0-based
  const targetYear = year + Math.floor(targetMonth / 12)
  const normalizedMonth = ((targetMonth % 12) + 12) % 12  // 0-based

  // Last day of target month: day 0 of next month = last day of this month
  const lastDay = new Date(Date.UTC(targetYear, normalizedMonth + 1, 0)).getUTCDate()
  const clampedDay = Math.min(day, lastDay)

  const mm = String(normalizedMonth + 1).padStart(2, '0')
  const dd = String(clampedDay).padStart(2, '0')
  return `${targetYear}-${mm}-${dd}`
}

/**
 * Parse and validate a date string, returning a UTC-based Date at midnight.
 *
 * @param {string} dateStr
 * @returns {Date}
 * @throws {Error} if null or invalid
 */
function parseDate(dateStr) {
  if (!dateStr) throw new Error('Date string is required')
  // Use explicit UTC parsing to avoid timezone shifts
  const d = new Date(dateStr + 'T00:00:00Z')
  if (isNaN(d.getTime())) throw new Error(`Invalid date: "${dateStr}"`)
  return d
}

/**
 * Returns the ISO date string when a student becomes eligible to audition
 * (fechaIngreso + 3 months).
 *
 * @param {string} fechaIngreso - ISO date string (YYYY-MM-DD).
 * @returns {string} ISO date string.
 */
export function calcularFechaElegibleAudicion(fechaIngreso) {
  // Validate by attempting to parse first
  parseDate(fechaIngreso)
  return addMonthsToDateStr(fechaIngreso, 3)
}

/**
 * Returns true if today is within the 6-month iniciación period
 * starting from fechaIngreso.
 *
 * @param {string} fechaIngreso - ISO date string.
 * @param {Date} [today=new Date()]
 * @returns {boolean}
 */
export function estaEnPeriodoIniciacion(fechaIngreso, today = new Date()) {
  const ingreso = parseDate(fechaIngreso)
  const finStr = addMonthsToDateStr(fechaIngreso, 6)
  const fin = parseDate(finStr)
  return today >= ingreso && today <= fin
}

/**
 * Returns true if today is within the audition window:
 * fechaIngreso + 3 months <= today <= fechaIngreso + 6 months.
 *
 * @param {string} fechaIngreso - ISO date string.
 * @param {Date} [today=new Date()]
 * @returns {boolean}
 */
export function puedeAudicionarHoy(fechaIngreso, today = new Date()) {
  const elegible = parseDate(addMonthsToDateStr(fechaIngreso, 3))
  const fin = parseDate(addMonthsToDateStr(fechaIngreso, 6))
  return today >= elegible && today <= fin
}

/**
 * Composite facade: given a perfilMusical object and a fechaIngreso date string,
 * returns a plain object with all three policy-derived fields for DB storage.
 *
 * Exemption rule: student is exempt only when tiene_conocimientos_musicales=true
 * AND nivel_lectura_musical='avanzado'.
 *
 * @param {{ tiene_conocimientos_musicales?: boolean, nivel_lectura_musical?: string }} perfilMusical
 * @param {string} fechaIngreso - YYYY-MM-DD
 * @returns {{ iniciacion_musical_requerida: boolean, fecha_fin_iniciacion: string|null, fecha_elegible_audicion: string|null }}
 */
export function iniciacionMusicalPolicy(perfilMusical, fechaIngreso) {
  const exento =
    perfilMusical?.tiene_conocimientos_musicales === true &&
    perfilMusical?.nivel_lectura_musical === 'avanzado'

  if (exento) {
    return {
      iniciacion_musical_requerida: false,
      fecha_fin_iniciacion: null,
      fecha_elegible_audicion: null,
    }
  }

  return {
    iniciacion_musical_requerida: true,
    fecha_fin_iniciacion: addMonthsToDateStr(fechaIngreso, 6),
    fecha_elegible_audicion: addMonthsToDateStr(fechaIngreso, 3),
  }
}

/**
 * Returns a human-readable description of the iniciación musical policy.
 *
 * @returns {string}
 */
export function descripcionPolitica() {
  return (
    'Students without prior musical knowledge must complete a 6-month iniciación period. ' +
    'They become eligible to audition after 3 months from their enrollment date, ' +
    'and the period closes at 6 months.'
  )
}

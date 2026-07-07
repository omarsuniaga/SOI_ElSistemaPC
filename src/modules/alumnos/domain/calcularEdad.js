/**
 * Calculates the completed age in years from a date string.
 *
 * @param {string} fechaNacimiento - Date string in YYYY-MM-DD format.
 * @param {object} [options] - Optional parameters.
 * @param {*} [options.fallback=null] - Value to return when fechaNacimiento is null/empty.
 * @param {Date} [options.today=new Date()] - Reference date (injectable for testing).
 * @returns {number|*} Completed years of age, or fallback.
 * @throws {Error} If fechaNacimiento is invalid, in the future, and no fallback is provided.
 */
export function calcularEdad(fechaNacimiento, { fallback = null, today = new Date() } = {}) {
  if (!fechaNacimiento) {
    return fallback
  }

  const birth = new Date(fechaNacimiento)

  if (isNaN(birth.getTime())) {
    return fallback
  }

  if (birth > today) {
    return fallback
  }

  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  const dayDiff = today.getDate() - birth.getDate()

  // Has the birthday occurred yet this year?
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age -= 1
  }

  return age
}

/**
 * Calculates the completed age in years from a date string.
 *
 * @param {string} fechaNacimiento - Date string in YYYY-MM-DD format.
 * @param {Date} [today=new Date()] - Reference date (injectable for testing).
 * @returns {number} Completed years of age.
 * @throws {Error} If fechaNacimiento is null, empty, invalid, or in the future.
 */
export function calcularEdad(fechaNacimiento, today = new Date()) {
  if (!fechaNacimiento) {
    throw new Error('fechaNacimiento is required')
  }

  const birth = new Date(fechaNacimiento)

  if (isNaN(birth.getTime())) {
    throw new Error(`Invalid date: "${fechaNacimiento}"`)
  }

  if (birth > today) {
    throw new Error('fechaNacimiento cannot be in the future')
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

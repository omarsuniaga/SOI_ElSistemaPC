/**
 * esVigente — Pure function that determines if a permiso row is currently active.
 *
 * Rules:
 *   - Fail-closed: null/undefined row → false
 *   - fecha_inicio > today → not yet active → false
 *   - fecha_fin !== null && fecha_fin < today → expired → false
 *   - fecha_fin === null → permanent → true (if fecha_inicio is satisfied)
 *   - fecha_fin === today → boundary: still valid → true
 *
 * @param {object|null|undefined} permiso - Row with fecha_inicio and fecha_fin fields
 * @param {string} [today] - ISO date string (YYYY-MM-DD). Defaults to current date. Injectable for testing.
 * @returns {boolean}
 */
export function esVigente(permiso, today = new Date().toISOString().slice(0, 10)) {
  if (!permiso) return false

  const { fecha_inicio, fecha_fin } = permiso

  // Not yet active
  if (fecha_inicio && fecha_inicio > today) return false

  // Expired: fecha_fin is set and strictly before today
  if (fecha_fin !== null && fecha_fin !== undefined && fecha_fin < today) return false

  return true
}

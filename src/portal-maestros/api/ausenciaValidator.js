/**
 * Validates an absence request (solicitud de ausencia).
 *
 * Rules:
 *  1. Start date must be at least 48 hours in the future.
 *  2. Start date cannot be in the past (including today).
 *  3. End date cannot be before start date.
 *  4. Medical absences require documentation.
 *
 * @param {{ fechaInicio: string, fechaFin: string, motivo: string, documentacion: string|null }} solicitud
 * @returns {{ valido: boolean, errores: string[] }}
 */
export function validarSolicitud(solicitud) {
  const errores = []
  const ahora = new Date()
  const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate())

  // Parse date strings (YYYY-MM-DD) as local dates to avoid UTC offset issues
  function parseLocalDate(str) {
    const [year, month, day] = str.split('-').map(Number)
    return new Date(year, month - 1, day)
  }

  const inicioDate = parseLocalDate(solicitud.fechaInicio)
  const finDate = parseLocalDate(solicitud.fechaFin)

  if (inicioDate <= hoy) {
    errores.push('La fecha de inicio no puede ser en el pasado')
  } else {
    // Check 48h minimum using calendar day difference:
    // diff in full days between start-of-day today and start-of-day of fechaInicio.
    // fechaFutura(1) = tomorrow = 1 day → < 2 days → fail
    // fechaFutura(2) = day after tomorrow = 2 days → >= 2 days → pass
    const diffDays = Math.round((inicioDate.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays < 2) {
      errores.push('Se requieren al menos 48 horas de anticipación')
    }
  }

  // Rule 3: valid date range
  if (finDate < inicioDate) {
    errores.push('La fecha de fin no puede ser anterior a la fecha de inicio')
  }

  // Rule 4: medical requires documentation
  if (solicitud.motivo === 'medico' && !solicitud.documentacion) {
    errores.push('Las ausencias médicas requieren documentación')
  }

  return {
    valido: errores.length === 0,
    errores,
  }
}

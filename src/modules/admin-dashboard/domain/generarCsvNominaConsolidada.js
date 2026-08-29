/**
 * Generador de archivo CSV/Excel para la Planilla Consolidada de Nómina Docente.
 * Incluye BOM UTF-8 (\uFEFF) para compatibilidad nativa con Microsoft Excel y Google Sheets.
 */

function escapeCsvField(field) {
  if (field == null) return '""'
  const str = String(field)
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes(';')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return `"${str}"`
}

/**
 * Genera el string CSV con la nómina consolidada
 * @param {Array<Object>} maestros - Lista de maestros con métricas de cumplimiento
 * @param {Object} options - { desde, hasta, rangoLabel }
 * @returns {string} Contenido CSV en formato UTF-8
 */
export function generarCsvNominaConsolidada(maestros = [], options = {}) {
  const headers = [
    'N°',
    'Docente / Maestro',
    'Cátedra / Especialidad',
    'Teléfono',
    'Email',
    'Clases Programadas',
    'Clases Registradas',
    'Clases Pendientes (≤7d)',
    'Clases Vencidas (>7d)',
    '% Cumplimiento',
    'Estado para Nómina',
    'Fecha Corte Desde',
    'Fecha Corte Hasta',
  ]

  const rows = maestros.map((m, index) => {
    const nombre = m.maestros?.nombre_completo || m.nombre_completo || '—'
    const especialidad = m.maestros?.especialidad || m.especialidad || '—'
    const telefono = m.maestros?.telefono || m.telefono || '—'
    const email = m.maestros?.email || m.email || '—'
    const programadas = m.totalSesiones ?? 0
    const registradas = m.registradas ?? 0
    const pendientes = m.pendingCount ?? 0
    const vencidas = m.vencidasCount ?? 0
    const porcentaje = programadas > 0 ? `${Math.round((registradas / programadas) * 100)}%` : '100%'

    let estadoSolvencia = 'SOLVENTE'
    if (vencidas > 0) {
      estadoSolvencia = 'BLOQUEADO (VENCIDAS)'
    } else if (pendientes > 0) {
      estadoSolvencia = 'RESTRINGIDO (PENDIENTES)'
    }

    return [
      index + 1,
      nombre,
      especialidad,
      telefono,
      email,
      programadas,
      registradas,
      pendientes,
      vencidas,
      porcentaje,
      estadoSolvencia,
      options.desde || '—',
      options.hasta || '—',
    ].map(escapeCsvField).join(',')
  })

  // BOM UTF-8 para apertura correcta en Excel sin distorsión de caracteres
  const csvContent = '\uFEFF' + [headers.map(escapeCsvField).join(','), ...rows].join('\r\n')
  return csvContent
}

/**
 * Descarga directamente el archivo CSV de la nómina consolidada
 */
export function descargarCsvNominaConsolidada(maestros = [], options = {}) {
  const csvString = generarCsvNominaConsolidada(maestros, options)
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  const hoyStr = new Date().toISOString().split('T')[0]
  link.setAttribute('href', url)
  link.setAttribute('download', `nomina-consolidada-docente-${options.desde || hoyStr}-al-${options.hasta || hoyStr}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

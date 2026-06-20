export function formatDate(dateStr) {
  if (!dateStr) return 'Fecha no definida'
  const date = new Date(dateStr)
  return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })
}

export function escapeHTML(str) {
  if (!str) return ''
  return str.replace(/[&<>]/g, function(m) {
    if (m === '&') return '&amp;'
    if (m === '<') return '&lt;'
    if (m === '>') return '&gt;'
    return m
  })
}

export function formatEstado(estado) {
  const mapa = {
    'planificado': 'Planificado',
    'ejecutado': 'Ejecutado',
    'revisado': 'Revisado',
  }
  return mapa[estado] || estado || 'Sin estado'
}

export function getEstadoClass(estado) {
  switch (estado) {
    case 'planificado': return 'primary'
    case 'ejecutado': return 'success'
    case 'revisado': return 'info'
    default: return 'secondary'
  }
}

export function getEstadoLabel(estado) {
  return formatEstado(estado)
}

export function getEstadoIcon(estado) {
  switch (estado) {
    case 'planificado': return 'bi-calendar-check'
    case 'ejecutado': return 'bi-check-circle'
    case 'revisado': return 'bi-eye'
    default: return 'bi-question-circle'
  }
}

export function getEstadoBadgeClass(estado) {
  return `bg-${getEstadoClass(estado)} bg-opacity-10 text-${getEstadoClass(estado)}`
}

export function getInitials(nombre) {
  if (!nombre) return '?'
  return nombre
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function calcularDuracion(fechaInicio, now) {
  if (!fechaInicio) return ''
  const inicio = new Date(fechaInicio)
  const referencia = now || new Date()
  const diffMs = referencia - inicio
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return 'Futura'
  if (diffDays === 0) return 'Hoy'
  if (diffDays === 1) return 'Hace 1 día'
  if (diffDays < 7) return `Hace ${diffDays} días`
  if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} sem.`
  if (diffDays < 365) return `Hace ${Math.floor(diffDays / 30)} mes(es)`
  return `Hace ${Math.floor(diffDays / 365)} año(s)`
}

export function parseRecursos(recursosArray) {
  if (!recursosArray || !Array.isArray(recursosArray)) return []
  return recursosArray.filter(r => r && r.trim()).map(r => r.trim())
}

export function formatRecursosString(recursosArray) {
  if (!recursosArray || !Array.isArray(recursosArray)) return ''
  return recursosArray.filter(r => r && r.trim()).map(r => r.trim()).join(', ')
}

export function getConsistentColor(id) {
  const colores = ['primary', 'secondary', 'success', 'danger', 'warning', 'info']
  if (!id) return 'primary'
  const code = id.charCodeAt(0) + id.charCodeAt(id.length - 1)
  return colores[code % colores.length]
}

export function formatDate(dateStr) {
  if (!dateStr) return 'Fecha desconocida'
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

export function getTipoLabel(tipo) {
  const mapa = {
    'comportamiento': 'Comportamiento',
    'academico': 'Académico',
    'social': 'Social',
    'disciplina': 'Disciplina',
  }
  return mapa[tipo?.toLowerCase()] || tipo || 'Sin tipo'
}

export function getTipoIcon(tipo) {
  const mapa = {
    'comportamiento': 'bi-emoji-frown',
    'academico': 'bi-book',
    'social': 'bi-people',
    'disciplina': 'bi-shield-exclamation',
  }
  return mapa[tipo?.toLowerCase()] || 'bi-question-circle'
}

export function getTipoBadgeClass(tipo) {
  const mapa = {
    'comportamiento': 'bg-warning',
    'academico': 'bg-info',
    'social': 'bg-success',
    'disciplina': 'bg-danger',
  }
  return mapa[tipo?.toLowerCase()] || 'bg-secondary'
}

export function getPrioridadLabel(prioridad) {
  const mapa = {
    'baja': 'Baja',
    'media': 'Media',
    'alta': 'Alta',
  }
  return mapa[prioridad?.toLowerCase()] || prioridad || 'Sin prioridad'
}

export function getPrioridadColor(prioridad) {
  const mapa = {
    'baja': 'success',
    'media': 'warning',
    'alta': 'danger',
  }
  return mapa[prioridad?.toLowerCase()] || 'secondary'
}

export function getPrioridadIcon(prioridad) {
  const mapa = {
    'baja': 'bi-arrow-down',
    'media': 'bi-dash',
    'alta': 'bi-arrow-up',
  }
  return mapa[prioridad?.toLowerCase()] || 'bi-question-circle'
}

export function getEstadoClass(estado) {
  const mapa = {
    'abierta': 'bg-primary',
    'resuelta': 'bg-success',
    'seguimiento': 'bg-warning',
  }
  return mapa[estado?.toLowerCase()] || 'bg-secondary'
}

export function getEstadoLabel(estado) {
  const mapa = {
    'abierta': 'Abierta',
    'resuelta': 'Resuelta',
    'seguimiento': 'Seguimiento',
  }
  return mapa[estado?.toLowerCase()] || estado || 'Sin estado'
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

export function calcularDiasAbierta(fechaObservacion) {
  if (!fechaObservacion) return 0
  const fecha = new Date(fechaObservacion)
  const hoy = new Date()
  const diffTime = hoy - fecha
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays > 0 ? diffDays : 0
}

export function getConsistentColor(id) {
  const colores = ['primary', 'secondary', 'success', 'danger', 'warning', 'info']
  if (!id) return 'primary'
  const code = id.charCodeAt(0) + id.charCodeAt(id.length - 1)
  return colores[code % colores.length]
}

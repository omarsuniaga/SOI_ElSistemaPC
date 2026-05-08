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

export function formatCalificacion(calif) {
  if (calif === null || calif === undefined) return 'Sin calificar'
  const num = parseFloat(calif)
  if (isNaN(num)) return 'Sin calificar'
  return num.toFixed(2)
}

export function getCalificacionColor(calif) {
  if (calif === null || calif === undefined) return 'secondary'
  const num = parseFloat(calif)
  if (isNaN(num)) return 'secondary'
  if (num < 2.5) return 'danger'
  if (num < 3.5) return 'warning'
  return 'success'
}

export function getCalificacionLabel(calif) {
  if (calif === null || calif === undefined) return 'Sin calificar'
  const num = parseFloat(calif)
  if (isNaN(num)) return 'Sin calificar'
  if (num < 1.0) return 'Deficiente'
  if (num < 2.5) return 'Insuficiente'
  if (num < 3.5) return 'Regular'
  if (num < 4.5) return 'Bueno'
  return 'Excelente'
}

export function getTipoLabel(tipo) {
  const mapa = {
    'parcial': 'Parcial',
    'final': 'Final',
    'continua': 'Continua',
  }
  return mapa[tipo] || tipo || 'No especificado'
}

export function getTipoBadgeClass(tipo) {
  const mapa = {
    'parcial': 'bg-primary',
    'final': 'bg-dark',
    'continua': 'bg-info',
  }
  return mapa[tipo] || 'bg-secondary'
}

export function getEstadoClass(estado) {
  const mapa = {
    'en_progreso': 'text-primary',
    'completado': 'text-success',
    'pendiente': 'text-warning',
  }
  return mapa[estado] || 'text-secondary'
}

export function getEstadoLabel(estado) {
  const mapa = {
    'en_progreso': 'En Progreso',
    'completado': 'Completado',
    'pendiente': 'Pendiente',
  }
  return mapa[estado] || estado || 'No especificado'
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

export function calcularPromedio(arr) {
  if (!arr || arr.length === 0) return null
  const validos = arr
    .map(a => parseFloat(a.calificacion))
    .filter(n => !isNaN(n))
  if (validos.length === 0) return null
  const suma = validos.reduce((acc, n) => acc + n, 0)
  return parseFloat((suma / validos.length).toFixed(2))
}

export function getRiesgo(calificacion) {
  if (calificacion === null || calificacion === undefined) return false
  const num = parseFloat(calificacion)
  if (isNaN(num)) return false
  return num < 2.5
}

export function getConsistentColor(id) {
  const colores = ['primary', 'secondary', 'success', 'danger', 'warning', 'info']
  if (!id) return 'primary'
  const code = id.charCodeAt(0) + id.charCodeAt(id.length - 1)
  return colores[code % colores.length]
}

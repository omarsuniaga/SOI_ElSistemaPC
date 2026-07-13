export { escapeHTML } from '../../../shared/utils/sanitize.js'

export function formatDate(dateStr) {
  if (!dateStr) return 'Fecha desconocida'
  const date = new Date(dateStr)
  return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })
}

export function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

export function formatPhone(phone) {
  if (!phone) return ''
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 10) {
    return `+${cleaned.substring(0, 2)} (${cleaned.substring(2, 5)}) ${cleaned.substring(5, 8)}-${cleaned.substring(8)}`
  }
  return phone
}

export function formatInstrumento(instrumento) {
  const mapa = {
    'violin': 'ViolÃ­n',
    'viola': 'Viola',
    'cello': 'Cello',
    'bajo': 'Bajo',
    'flauta': 'Flauta',
    'oboe': 'Oboe',
    'clarinete': 'Clarinete',
    'fagot': 'Fagot',
    'trompa': 'Trompa',
    'trompeta': 'Trompeta',
    'trombon': 'TrombÃ³n',
    'tuba': 'Tuba',
    'piano': 'Piano',
    'guitarra': 'Guitarra',
    'arpa': 'Arpa',
    'percusion': 'PercusiÃ³n',
    'voz': 'Voz',
    'direccion': 'DirecciÃ³n',
    'solfeo': 'Solfeo',
    'teorÃ­a': 'TeorÃ­a',
  }
  return mapa[instrumento?.toLowerCase()] || instrumento || 'No especificado'
}

export function getStatusColor(isActive) {
  return isActive ? 'success' : 'secondary'
}

export function getStatusLabel(isActive) {
  return isActive ? 'Activo' : 'Inactivo'
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

export function getInstrumentos() {
  return [
    { value: 'violin', label: 'ViolÃ­n' },
    { value: 'viola', label: 'Viola' },
    { value: 'cello', label: 'Cello' },
    { value: 'bajo', label: 'Bajo' },
    { value: 'flauta', label: 'Flauta' },
    { value: 'oboe', label: 'Oboe' },
    { value: 'clarinete', label: 'Clarinete' },
    { value: 'fagot', label: 'Fagot' },
    { value: 'trompa', label: 'Trompa' },
    { value: 'trompeta', label: 'Trompeta' },
    { value: 'trombon', label: 'TrombÃ³n' },
    { value: 'tuba', label: 'Tuba' },
    { value: 'piano', label: 'Piano' },
    { value: 'guitarra', label: 'Guitarra' },
    { value: 'arpa', label: 'Arpa' },
    { value: 'percusion', label: 'PercusiÃ³n' },
    { value: 'voz', label: 'Voz' },
    { value: 'direccion', label: 'DirecciÃ³n' },
    { value: 'solfeo', label: 'Solfeo' },
    { value: 'teorÃ­a', label: 'TeorÃ­a' },
  ]
}

export function getConsistentColor(id) {
  const colores = ['primary', 'secondary', 'success', 'danger', 'warning', 'info']
  if (!id) return 'primary'
  const code = id.charCodeAt(0) + id.charCodeAt(id.length - 1)
  return colores[code % colores.length]
}

export function validarNombre(nombre) {
  if (!nombre || !nombre.trim()) return false
  if (nombre.trim().length < 3) return false
  if (nombre.trim().length > 100) return false
  return true
}

export function validarEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

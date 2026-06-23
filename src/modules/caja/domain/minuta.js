/**
 * Domain: minuta
 * Meeting minutes — no Supabase imports.
 */

export function buildMinuta({
  titulo,
  fecha_reunion,
  participantes,
  puntos_tratados,
  acuerdos,
  responsables,
  visibilidad,
  creado_por,
}) {
  return {
    titulo,
    fecha_reunion,
    participantes: participantes || [],
    puntos_tratados: puntos_tratados || [],
    acuerdos: acuerdos || [],
    responsables: responsables || [],
    visibilidad,
    creado_por,
  }
}

export function canViewMinuta(minuta, userRole) {
  if (minuta.visibilidad === 'todos') return true
  if (minuta.visibilidad === 'admin') return userRole === 'admin'
  if (minuta.visibilidad === 'cajero') return userRole === 'cajero' || userRole === 'admin'
  return false
}

export function validateMinuta(data) {
  const errors = []
  if (!data.titulo || !String(data.titulo).trim()) {
    errors.push('titulo es requerido')
  }
  if (!data.fecha_reunion || !String(data.fecha_reunion).trim()) {
    errors.push('fecha_reunion es requerida')
  }
  if (!data.creado_por || !String(data.creado_por).trim()) {
    errors.push('creado_por es requerido')
  }
  return { valid: errors.length === 0, errors }
}

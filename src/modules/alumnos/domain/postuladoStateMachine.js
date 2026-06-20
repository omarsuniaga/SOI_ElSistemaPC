/**
 * Mapa de transiciones válidas.
 * estado_actual → [estados_permitidos]
 */
export const TRANSICIONES = {
  postulado:      ['contactado', 'descartado'],
  contactado:     ['cita_agendada', 'descartado'],
  cita_agendada:  ['documentos_ok', 'no_show', 'descartado'],
  no_show:        ['reprogramado', 'descartado'],
  reprogramado:   ['cita_agendada', 'descartado'],
  documentos_ok:  ['inscrito', 'en_espera'],
  en_espera:      ['cita_agendada', 'descartado'],
  inscrito:       [],
  descartado:     [],
}

/**
 * Etiquetas legibles por estado.
 */
export const ESTADO_LABELS = {
  postulado:     'Postulado',
  contactado:    'Contactado',
  cita_agendada: 'Cita agendada',
  documentos_ok: 'Documentos OK',
  inscrito:      'Inscrito',
  no_show:       'No show',
  reprogramado:  'Reprogramado',
  en_espera:     'En espera',
  descartado:    'Descartado',
}

/**
 * Colores Bootstrap por estado.
 */
export const ESTADO_COLOR = {
  postulado:     'secondary',
  contactado:    'info',
  cita_agendada: 'primary',
  documentos_ok: 'warning',
  inscrito:      'success',
  no_show:       'danger',
  reprogramado:  'warning',
  en_espera:     'secondary',
  descartado:    'dark',
}

/**
 * Verifica si una transición es válida.
 * @param {string} estadoActual
 * @param {string} estadoNuevo
 * @returns {boolean}
 */
export function puedeTransicionar(estadoActual, estadoNuevo) {
  if (!estadoActual || !estadoNuevo) return false
  const destinosPermitidos = TRANSICIONES[estadoActual]
  if (!destinosPermitidos) return false
  return destinosPermitidos.includes(estadoNuevo)
}

/**
 * Devuelve las acciones disponibles (estados destino válidos) para un estado dado.
 * @param {string} estado
 * @returns {string[]}
 */
export function accionesDisponibles(estado) {
  return TRANSICIONES[estado] ?? []
}

/**
 * Aplica una transición. Retorna el nuevo estado completo del postulante.
 * Lanza Error si la transición no es válida.
 * @param {object} postulante
 * @param {string} nuevoEstado
 * @param {object} [meta] - datos adicionales (fecha_cita, notas_seguimiento, alumno_id)
 * @returns {object} postulante actualizado (sin mutación)
 */
export function aplicarTransicion(postulante, nuevoEstado, meta = {}) {
  if (!postulante) {
    throw new Error('El postulante es requerido para aplicar la transición')
  }

  const estadoActual = postulante.estado || 'postulado'

  if (!puedeTransicionar(estadoActual, nuevoEstado)) {
    throw new Error(
      `Transición inválida: no se puede pasar del estado "${estadoActual}" al estado "${nuevoEstado}"`
    )
  }

  // Clonar para evitar mutación directa (Principio de Inmutabilidad)
  const nuevoPostulante = {
    ...postulante,
    estado: nuevoEstado,
  }

  // Aplicar datos meta si existen
  if (meta.fecha_cita !== undefined) {
    nuevoPostulante.fecha_cita = meta.fecha_cita
  }

  if (meta.notas_seguimiento !== undefined) {
    // Si ya existían notas, las concatenamos con un salto de línea, sino las creamos
    if (nuevoPostulante.notas_seguimiento) {
      nuevoPostulante.notas_seguimiento = `${nuevoPostulante.notas_seguimiento}\n${meta.notas_seguimiento}`.trim()
    } else {
      nuevoPostulante.notas_seguimiento = meta.notas_seguimiento
    }
  }

  if (meta.alumno_id !== undefined) {
    nuevoPostulante.alumno_id = meta.alumno_id
  }

  // Si pasamos a contactado, registramos la fecha de contacto actual
  if (nuevoEstado === 'contactado') {
    nuevoPostulante.fecha_contacto = new Date().toISOString()
  }

  return nuevoPostulante
}

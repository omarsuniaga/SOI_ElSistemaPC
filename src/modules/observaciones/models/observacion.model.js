import {
  OBSERVACION_TIPOS,
  OBSERVACION_TIPO_LABELS,
  normalizeTipo,
} from '../../_shared/evaluacion-constants.js'

/**
 * Modelo de Observacion - Validaciones y lógica de negocio
 */
export class Observacion {
  constructor(data = {}) {
    this.id = data.id || null
    this.alumno_id = data.alumno_id || null
    this.maestro_id = data.maestro_id || null
    this.clase_id = data.clase_id || null
    this.sesion_clase_id = data.sesion_clase_id || null

    // Normalize legacy tipo values at construction; default to 'academica'
    const rawTipo = data.tipo || 'academica'
    const normalized = normalizeTipo(rawTipo)
    this.tipo = normalized !== null ? normalized : rawTipo // keep raw for validate() to reject

    this.titulo = data.titulo || ''
    this.descripcion = data.descripcion || data.observacion || ''
    this.prioridad = data.prioridad || 'media'
    this.estado = data.estado || 'abierta'
    this.fecha_observacion = data.fecha_observacion || data.fecha || null
    this.requiere_seguimiento = data.requiere_seguimiento ?? false
    this.seguimiento_fecha = data.seguimiento_fecha || null
    this.seguimiento_observacion = data.seguimiento_observacion || ''
    this.created_at = data.created_at || null
    this.updated_at = data.updated_at || null
  }

  /**
   * Valida los datos de la observación
   * @returns {string[]} Array de errores (vacío si no hay errores)
   */
  validate() {
    const errores = []

    if (!this.alumno_id) {
      errores.push('El alumno es obligatorio')
    }

    if (!this.titulo || !this.titulo.trim()) {
      errores.push('El título es obligatorio')
    } else if (this.titulo.trim().length < 5) {
      errores.push('El título debe tener mínimo 5 caracteres')
    } else if (this.titulo.trim().length > 100) {
      errores.push('El título no puede exceder 100 caracteres')
    }

    if (!this.descripcion || !this.descripcion.trim()) {
      errores.push('La descripción es obligatoria')
    } else if (this.descripcion.trim().length < 20) {
      errores.push('La descripción debe tener mínimo 20 caracteres')
    } else if (this.descripcion.trim().length > 1000) {
      errores.push('La descripción no puede exceder 1000 caracteres')
    }

    if (!OBSERVACION_TIPOS.includes(this.tipo)) {
      errores.push(`El tipo de observación no es válido. Valores permitidos: ${OBSERVACION_TIPOS.join(', ')}`)
    }

    const prioridadesValidas = Observacion.getPrioridades().map(p => p.value)
    if (!prioridadesValidas.includes(this.prioridad)) {
      errores.push('La prioridad no es válida')
    }

    const estadosValidos = Observacion.getEstados().map(e => e.value)
    if (!estadosValidos.includes(this.estado)) {
      errores.push('El estado no es válido')
    }

    return errores
  }

  /**
   * Returns the canonical tipo list with labels (and optional icons for backwards compat).
   * All consumers of observacion tipos MUST use this method — no inline arrays.
   */
  static getTipos() {
    return OBSERVACION_TIPOS.map(value => ({
      value,
      label: OBSERVACION_TIPO_LABELS[value],
      icon: Observacion._tipoIcons[value] || 'bi-tag',
    }))
  }

  /** Icon mapping — kept separate so getTipos() stays readable */
  static get _tipoIcons() {
    return {
      academica:      'bi-mortarboard',
      conductual:     'bi-person-badge',
      asistencia:     'bi-calendar-check',
      tecnica:        'bi-tools',
      motivacional:   'bi-emoji-smile',
      administrativa: 'bi-clipboard',
      otra:           'bi-three-dots',
    }
  }

  static getPrioridades() {
    return [
      { value: 'baja', label: 'Baja', color: 'text-success' },
      { value: 'media', label: 'Media', color: 'text-warning' },
      { value: 'alta', label: 'Alta', color: 'text-danger' },
    ]
  }

  static getEstados() {
    return [
      { value: 'abierta', label: 'Abierta', color: 'bg-secondary' },
      { value: 'seguimiento', label: 'Seguimiento', color: 'bg-warning text-dark' },
      { value: 'resuelta', label: 'Resuelta', color: 'bg-success' },
    ]
  }

  /**
   * Devuelve los datos como objeto limpio para persistencia en Supabase
   * @returns {object}
   */
  toJSON() {
    const json = {
      alumno_id: this.alumno_id,
      maestro_id: this.maestro_id,
      clase_id: this.clase_id,
      sesion_clase_id: this.sesion_clase_id,
      tipo: this.tipo,
      titulo: this.titulo.trim(),
      descripcion: this.descripcion.trim(),
      observacion: this.descripcion.trim(), // Alias para legacy DB column
      prioridad: this.prioridad,
      estado: this.estado,
      fecha_observacion: this.fecha_observacion,
      requiere_seguimiento: this.requiere_seguimiento,
      seguimiento_fecha: this.seguimiento_fecha,
      seguimiento_observacion: this.seguimiento_observacion.trim() || null,
    }

    if (this.id) json.id = this.id
    return json
  }
}

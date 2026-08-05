/**
 * Modelo de Planificacion - Validaciones y lógica de negocio
 */
export class Planificacion {
  static normalizeEstado(estado) {
    const value = String(estado || '').trim().toLowerCase()

    const aliases = {
      planificado: 'borrador',
      borrador: 'borrador',
      revisada: 'borrador',
      activo: 'activa',
      activa: 'activa',
      publicada: 'activa',
      aprobado: 'activa',
      aprobada: 'activa',
      revisado: 'activa',
      ejecutado: 'cerrada',
      cerrada: 'cerrada',
      archivado: 'archivada',
      archivada: 'archivada',
    }

    return aliases[value] || value
  }

  constructor(data = {}) {
    this.id = data.id || null
    this.clase_id = data.clase_id || null
    this.maestro_id = data.maestro_id || null
    this.fecha_inicio = data.fecha_inicio || data.fecha || null
    this.tema = data.tema || data.titulo || ''
    this.objetivos = data.objetivos || ''
    this.contenido = data.contenido || ''
    this.recursos = Array.isArray(data.recursos) ? data.recursos : []
    this.evaluacion_metodo = data.evaluacion_metodo || ''
    this.observaciones = data.observaciones || ''
    this.notas_dsl = data.notas_dsl || ''
    this.estado = data.estado || 'borrador'
    this.instrumento = data.instrumento || null
    this.class_curriculum_plan_id = data.class_curriculum_plan_id || null
    this.route_version_id = data.route_version_id || null
    this.created_at = data.created_at || null
    this.updated_at = data.updated_at || null

    // Soporte para planificación estructurada (Unidades, Objetivos, Indicadores)
    this.contenidos = Array.isArray(data.contenidos) ? data.contenidos : []
    this.objetivosEstructurados = Array.isArray(data.objetivosEstructurados)
      ? data.objetivosEstructurados
      : (Array.isArray(data.contenidos) && data.contenidos.length > 0 && typeof data.contenidos[0] === 'object'
          ? data.contenidos
          : [])

    // UI Helpers
    this.clase_nombre = data.clase_nombre || null
    this.maestro_nombre = data.maestro_nombre || null
  }

  /**
   * Valida los datos de la planificación
   * @returns {string[]} Array de errores (vacío si no hay errores)
   */
  validate() {
    const errores = []
    const estadoNormalizado = Planificacion.normalizeEstado(this.estado)

    if (!this.tema || !this.tema.trim()) {
      errores.push('El tema es obligatorio')
    } else if (this.tema.trim().length < 3) {
      errores.push('El tema debe tener mínimo 3 caracteres')
    } else if (this.tema.trim().length > 200) {
      errores.push('El tema no puede exceder 200 caracteres')
    }

    if (!this.clase_id) {
      errores.push('La clase es obligatoria')
    }

    if (this.objetivos && this.objetivos.length > 1000) {
      errores.push('Los objetivos no pueden exceder 1000 caracteres')
    }

    if (this.contenido && this.contenido.length > 2000) {
      errores.push('El contenido no puede exceder 2000 caracteres')
    }

    if (this.evaluacion_metodo && this.evaluacion_metodo.length > 500) {
      errores.push('El método de evaluación no puede exceder 500 caracteres')
    }

    if (this.observaciones && this.observaciones.length > 1000) {
      errores.push('Las observaciones no pueden exceder 1000 caracteres')
    }

    if (this.instrumento && this.instrumento.length > 100) {
      errores.push('El instrumento no puede exceder 100 caracteres')
    }

    const estadosValidos = [
      ...Planificacion.getEstados().map((e) => e.value),
      'planificado',
      'revisada',
      'publicada',
      'revisado',
      'aprobado',
      'aprobada',
      'activo',
      'archivado',
    ]
    if (!estadosValidos.includes(String(this.estado).trim().toLowerCase()) && !Planificacion.getEstados().some((e) => e.value === estadoNormalizado)) {
      errores.push('El estado no es válido')
    }

    return errores
  }

  /**
   * Indica si el plan puede ser editado según su estado
   * @returns {boolean}
   */
  canEdit() {
    const estado = Planificacion.normalizeEstado(this.estado)
    return estado === 'borrador' || estado === 'activa'
  }

  /**
   * Indica si el plan puede ser aprobado (marcar como revisado)
   * @returns {boolean}
   */
  canApprove() {
    return Planificacion.normalizeEstado(this.estado) === 'borrador'
  }

  /**
   * Indica si el plan está bloqueado para cualquier cambio
   * @returns {boolean}
   */
  isLocked() {
    const estado = Planificacion.normalizeEstado(this.estado)
    return estado === 'cerrada' || estado === 'archivada'
  }

  static getEstados() {
    return [
      { value: 'borrador', label: 'Borrador', color: 'bg-secondary' },
      { value: 'activa', label: 'Activa', color: 'bg-success' },
      { value: 'cerrada', label: 'Cerrada', color: 'bg-info' },
      { value: 'archivada', label: 'Archivada', color: 'bg-dark' },
    ]
  }

  static getEstadoConfig(estado) {
    const normalized = this.normalizeEstado(estado)
    return (
      this.getEstados().find((e) => e.value === normalized) || {
        value: normalized,
        label: normalized,
        color: 'bg-secondary',
      }
    )
  }

  /**
   * Devuelve los datos como objeto limpio para persistencia en Supabase
   * @returns {object}
   */
  toJSON() {
    const persistedEstado = Planificacion.normalizeEstado(this.estado)
    const json = {
      clase_id: this.clase_id,
      maestro_id: this.maestro_id,
      fecha_inicio: this.fecha_inicio,
      titulo: this.tema.trim(),
      objetivos: this.objetivos.trim() || null,
      contenido: this.contenido.trim() || null,
      recursos: this.recursos,
      evaluacion_metodo: this.evaluacion_metodo.trim() || null,
      observaciones: this.observaciones.trim() || null,
      notas_dsl: this.notas_dsl || null,
      estado: persistedEstado,
      instrumento: this.instrumento?.trim() || null,
      contenidos: this.objetivosEstructurados.length > 0 ? this.objetivosEstructurados : this.contenidos,
    }

    // Columnas opcionales del rediseño curricular: SOLO se incluyen cuando
    // tienen valor. La migración que las agrega a `planificaciones`
    // (20260722000002) quedó ARCHIVADA por bugs de backfill, así que el
    // esquema desplegado aún no las tiene. Enviarlas siempre como null
    // rompía todo insert/update con PGRST204 (columna no existe). Cuando el
    // esquema se migre (20260803000002) y exista valor, se enviarán normal.
    if (this.class_curriculum_plan_id) json.class_curriculum_plan_id = this.class_curriculum_plan_id
    if (this.route_version_id) json.route_version_id = this.route_version_id

    return json
  }
}

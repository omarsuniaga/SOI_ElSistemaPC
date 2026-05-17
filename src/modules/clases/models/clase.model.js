/**
 * Modelo de Clase - Validaciones y lógica de negocio
 */
export class Clase {
  constructor(data = {}) {
    this.id = data.id || null
    this.nombre = data.nombre || ''
    this.maestro_id = data.maestro_id || null
    this.maestro_auxiliar_id = data.maestro_auxiliar_id || null
    this.programa_id = data.programa_id || null
    this.instrumento = data.instrumento || ''
    this.horarios = data.horarios || []
    this.max_alumnos = data.max_alumnos ?? 20
    this.estado = data.estado || 'activa'
    this.notas_pedagogicas = data.notas_pedagogicas || ''
    this.planificacion_id = data.planificacion_id || null
    this.created_at = data.created_at || null
    this.updated_at = data.updated_at || null
  }

  /**
   * Valida los datos de la clase
   * @returns {string[]} Array de errores (vacío si no hay errores)
   */
  validate() {
    const errores = []

    if (!this.nombre || !this.nombre.trim()) {
      errores.push('El nombre es obligatorio')
    } else if (this.nombre.trim().length < 3) {
      errores.push('El nombre debe tener mínimo 3 caracteres')
    } else if (this.nombre.trim().length > 100) {
      errores.push('El nombre no puede exceder 100 caracteres')
    }

    if (!this.maestro_id) {
      errores.push('El maestro titular es obligatorio')
    }

    if (!this.programa_id) {
      errores.push('El programa es obligatorio')
    }

    if (!this.instrumento || !this.instrumento.trim()) {
      errores.push('El instrumento es obligatorio')
    }

    if (!this.horarios || this.horarios.length === 0) {
      errores.push('Debe agregar al menos un horario')
    }

    // Validación de horarios individuales
    for (const h of this.horarios) {
      if (!h.dia) {
        errores.push('El día es obligatorio en todos los horarios')
      }
      if (!h.hora_inicio || !h.hora_fin) {
        errores.push('La hora de inicio y fin son obligatorias en todos los horarios')
      }
      if (h.hora_inicio && h.hora_fin && h.hora_inicio >= h.hora_fin) {
        errores.push('La hora de inicio debe ser menor que la hora de fin')
      }
    }

    // Validación de solapamientos internos (misma clase)
    const schedulesByDay = {}
    this.horarios.forEach(h => {
      if (!h.dia || !h.hora_inicio || !h.hora_fin) return
      const dia = h.dia.toLowerCase().trim()
      if (!schedulesByDay[dia]) schedulesByDay[dia] = []
      schedulesByDay[dia].push(h)
    })

    for (const dia in schedulesByDay) {
      const slots = schedulesByDay[dia].sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio))
      for (let i = 0; i < slots.length - 1; i++) {
        const current = slots[i]
        const next = slots[i + 1]
        if (current.hora_fin > next.hora_inicio) {
          const diaLabel = dia.charAt(0).toUpperCase() + dia.slice(1)
          errores.push(`Existen horarios solapados en la misma clase (${diaLabel})`)
          break
        }
      }
    }

    if (this.max_alumnos !== undefined && this.max_alumnos !== null) {
      if (this.max_alumnos < 1) {
        errores.push('El máximo de alumnos debe ser al menos 1')
      } else if (this.max_alumnos > 100) {
        errores.push('El máximo de alumnos no puede exceder 100')
      }
    }

    if (this.notas_pedagogicas && this.notas_pedagogicas.length > 1000) {
      errores.push('Las notas pedagógicas no pueden exceder 1000 caracteres')
    }

    return errores
  }

  /**
   * Comprueba si la clase está completa
   * @returns {boolean}
   */
  isCompleto() {
    return !!(this.nombre && this.maestro_id && this.programa_id && this.instrumento && this.horarios?.length > 0)
  }

  /**
   * Devuelve los datos como objeto limpio
   * @returns {object}
   */
  toJSON() {
    return {
      id: this.id,
      nombre: this.nombre.trim(),
      maestro_id: this.maestro_id,
      maestro_auxiliar_id: this.maestro_auxiliar_id || null,
      programa_id: this.programa_id,
      instrumento: this.instrumento.trim(),
      max_alumnos: this.max_alumnos,
      estado: this.estado,
      notas_pedagogicas: this.notas_pedagogicas.trim() || null,
      planificacion_id: this.planificacion_id || null,
    }
  }

  static getEstados() {
    return ['activa', 'suspendida', 'finalizada']
  }

  static getDiasSemana() {
    return ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
  }

  static getEstadoLabel(estado) {
    const labels = {
      activa: 'Activa',
      suspendida: 'Suspendida',
      finalizada: 'Finalizada',
    }
    return labels[estado] || estado
  }
}

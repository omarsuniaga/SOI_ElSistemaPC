import { timeToMinutes } from '../utils/clasesUtils.js'

/**
 * Modelo de Clase - Validaciones y lógica de negocio
 */
export class Clase {
  constructor(data = {}) {
    this.id = data.id || null
    this.nombre = data.nombre || ''
    // Mapeo: maestro_id del formulario → maestro_principal_id en BD
    this.maestro_principal_id = data.maestro_principal_id || data.maestro_id || null
    this.maestro_suplente_id = data.maestro_suplente_id || data.maestro_auxiliar_id || null
    this.tiene_suplente = data.tiene_suplente || false
    this.programa_id = data.programa_id || null
    this.instrumento = data.instrumento || ''
    this.horarios = data.horarios || []
    // Mapeo: max_alumnos del formulario → capacidad_maxima en BD
    this.capacidad_maxima = data.capacidad_maxima ?? data.max_alumnos ?? 20
    this.estado = data.estado || 'activa'
    // Mapeo: notas_pedagogicas del formulario → descripcion en BD
    this.descripcion = data.descripcion || data.notas_pedagogicas || ''
    this.tipo_clase = data.tipo_clase || null
    this.nivel_id = data.nivel_id || null
    this.planificacion_id = data.planificacion_id || null
    this.created_at = data.created_at || null
    this.updated_at = data.updated_at || null
  }

  // Getters/Setters para compatibilidad hacia atrás con el código legacy y tests
  get maestro_id() { return this.maestro_principal_id }
  set maestro_id(val) { this.maestro_principal_id = val }

  get maestro_auxiliar_id() { return this.maestro_suplente_id }
  set maestro_auxiliar_id(val) { this.maestro_suplente_id = val }

  get max_alumnos() { return this.capacidad_maxima }
  set max_alumnos(val) { this.capacidad_maxima = val }

  get notas_pedagogicas() { return this.descripcion }
  set notas_pedagogicas(val) { this.descripcion = val }

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

    if (!this.maestro_principal_id) {
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
      if (h.hora_inicio && h.hora_fin) {
        const startMin = timeToMinutes(h.hora_inicio)
        const endMin = timeToMinutes(h.hora_fin)
        if (startMin >= endMin) {
          errores.push('La hora de inicio debe ser menor que la hora de fin')
        }
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
      const slots = schedulesByDay[dia].sort((a, b) => timeToMinutes(a.hora_inicio) - timeToMinutes(b.hora_inicio))
      for (let i = 0; i < slots.length - 1; i++) {
        const current = slots[i]
        const next = slots[i + 1]
        const currentFinMin = timeToMinutes(current.hora_fin)
        const nextInicioMin = timeToMinutes(next.hora_inicio)
        if (currentFinMin > nextInicioMin) {
          const diaLabel = dia.charAt(0).toUpperCase() + dia.slice(1)
          errores.push(`Existen horarios solapados en la misma clase (${diaLabel})`)
          break
        }
      }
    }


    if (this.capacidad_maxima !== undefined && this.capacidad_maxima !== null) {
      if (this.capacidad_maxima < 1) {
        errores.push('El máximo de alumnos debe ser al menos 1')
      } else if (this.capacidad_maxima > 100) {
        errores.push('El máximo de alumnos no puede exceder 100')
      }
    }

    if (this.descripcion && this.descripcion.length > 1000) {
      errores.push('Las notas pedagógicas no pueden exceder 1000 caracteres')
    }

    return errores
  }

  /**
   * Comprueba si la clase está completa
   * @returns {boolean}
   */
  isCompleto() {
    return !!(this.nombre && this.maestro_principal_id && this.programa_id && this.instrumento && this.horarios?.length > 0)
  }

  /**
   * Devuelve los datos como objeto limpio (con nombres de columnas de BD)
   * @returns {object}
   */
  toJSON() {
    return {
      id: this.id,
      nombre: this.nombre.trim(),
      maestro_principal_id: this.maestro_principal_id,
      maestro_suplente_id: this.maestro_suplente_id || null,
      programa_id: this.programa_id,
      instrumento: this.instrumento.trim(),
      capacidad_maxima: this.capacidad_maxima,
      estado: this.estado,
      descripcion: this.descripcion.trim() || null,
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

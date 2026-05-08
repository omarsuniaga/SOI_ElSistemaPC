/**
 * Modelo de Alumno - Validaciones y lógica de negocio
 */
export class Alumno {
  constructor(data = {}) {
    this.id = data.id || null
    this.name = data.name || ''
    this.section = data.section || ''
    this.ensemble_id = data.ensemble_id || null
    this.ensemble_section = data.ensemble_section || ''
    this.atril = data.atril || null
    this.posicion_atril = data.posicion_atril || ''
    this.parent_email = data.parent_email || ''
    this.parent_phone = data.parent_phone || ''
    this.acudiente = data.acudiente || ''
    this.email = data.email || ''
    this.cedula = data.cedula || ''
    this.fecha_nacimiento = data.fecha_nacimiento || null
    this.genero = data.genero || ''
    this.direccion = data.direccion || ''
    this.es_activo = data.es_activo !== undefined ? data.es_activo : true
    this.created_at = data.created_at || null
    this.updated_at = data.updated_at || null
  }

  /**
   * Valida los datos del alumno
   * @returns {string[]} Array de errores (vacío si no hay errores)
   */
  validate() {
    const errores = []

    // Validación de nombre
    if (!this.name || !this.name.trim()) {
      errores.push('El nombre es obligatorio')
    } else if (this.name.trim().length < 3) {
      errores.push('El nombre debe tener mínimo 3 caracteres')
    } else if (this.name.trim().length > 100) {
      errores.push('El nombre no puede exceder 100 caracteres')
    }

    // Validación de email (si existe)
    if (this.email) {
      if (!this.isValidEmail(this.email)) {
        errores.push('El formato del email no es válido')
      } else if (this.email.length > 100) {
        errores.push('El email no puede exceder 100 caracteres')
      }
    }

    // Validación de cédula (si existe)
    if (this.cedula) {
      if (this.cedula.trim().length < 5) {
        errores.push('La cédula debe tener mínimo 5 caracteres')
      } else if (this.cedula.length > 20) {
        errores.push('La cédula no puede exceder 20 caracteres')
      }
    }

    // Validación de fecha de nacimiento
    if (this.fecha_nacimiento) {
      const fecha = new Date(this.fecha_nacimiento)
      const hoy = new Date()
      if (fecha > hoy) {
        errores.push('La fecha de nacimiento no puede ser futura')
      }
      // Validar que no sea menor a 3 años
      const edad = hoy.getFullYear() - fecha.getFullYear()
      if (edad < 3) {
        errores.push('El alumno debe tener mínimo 3 años')
      }
      // Validar que no sea mayor a 100 años
      if (edad > 100) {
        errores.push('Verifica la fecha de nacimiento')
      }
    }

    // Validación de género (si existe)
    if (this.genero) {
      const generosValidos = ['M', 'F', 'O', 'N']
      if (!generosValidos.includes(this.genero.toUpperCase())) {
        errores.push('El género debe ser: M (Masculino), F (Femenino), O (Otro) o N (No binario)')
      }
    }

    // Validación de phone (si existe)
    if (this.parent_phone) {
      if (this.parent_phone.length > 20) {
        errores.push('El teléfono no puede exceder 20 caracteres')
      }
    }

    // Validación de parent_email (si existe)
    if (this.parent_email) {
      if (!this.isValidEmail(this.parent_email)) {
        errores.push('El email del acudiente no es válido')
      }
    }

    // Validación de sección
    if (this.section) {
      if (this.section.length > 100) {
        errores.push('La sección no puede exceder 100 caracteres')
      }
    }

    // Validación de acudiente
    if (this.acudiente) {
      if (this.acudiente.length < 3) {
        errores.push('El nombre del acudiente debe tener mínimo 3 caracteres')
      } else if (this.acudiente.length > 100) {
        errores.push('El nombre del acudiente no puede exceder 100 caracteres')
      }
    }

    // Validación de dirección
    if (this.direccion) {
      if (this.direccion.length > 255) {
        errores.push('La dirección no puede exceder 255 caracteres')
      }
    }

    return errores
  }

  /**
   * Valida el formato de email
   * @param {string} email
   * @returns {boolean}
   */
  isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  }

  /**
   * Comprueba si el alumno está completo (tiene todos los datos requeridos)
   * @returns {boolean}
   */
  isCompleto() {
    return !!(this.name && this.email)
  }

  /**
   * Devuelve los datos como objeto limpio
   * @returns {object}
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name.trim(),
      section: this.section.trim() || null,
      ensemble_id: this.ensemble_id,
      ensemble_section: this.ensemble_section.trim() || null,
      atril: this.atril,
      posicion_atril: this.posicion_atril.trim() || null,
      parent_email: this.parent_email.trim() || null,
      parent_phone: this.parent_phone.trim() || null,
      acudiente: this.acudiente.trim() || null,
      email: this.email.trim() || null,
      cedula: this.cedula.trim() || null,
      fecha_nacimiento: this.fecha_nacimiento || null,
      genero: this.genero ? this.genero.toUpperCase() : null,
      direccion: this.direccion.trim() || null,
      es_activo: this.es_activo,
    }
  }
}

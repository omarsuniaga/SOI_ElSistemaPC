export class Alumno {
  constructor(data = {}) {
    this.id = data.id || null
    this.nombre = data.nombre || ''
    this.ensemble_section = data.ensemble_section || ''
    this.atril = data.atril || null
    this.posicion_atril = data.posicion_atril || ''
    this.parent_email = data.parent_email || ''
    this.parent_phone = data.parent_phone || ''
    this.email = data.email || ''
    this.cedula = data.cedula || ''
    this.fecha_nacimiento = data.fecha_nacimiento || null
    this.genero = data.genero || ''
    this.direccion = data.direccion || ''
    this.is_active = data.is_active !== undefined ? data.is_active : true
    this.created_at = data.created_at || null
    this.updated_at = data.updated_at || null
  }

  validate() {
    const errores = []

    if (!this.nombre || !this.nombre.trim()) {
      errores.push('El nombre es obligatorio')
    } else if (this.nombre.trim().length < 3) {
      errores.push('El nombre debe tener mínimo 3 caracteres')
    } else if (this.nombre.trim().length > 100) {
      errores.push('El nombre no puede exceder 100 caracteres')
    }

    if (this.email) {
      if (!this.isValidEmail(this.email)) {
        errores.push('El formato del email no es válido')
      } else if (this.email.length > 100) {
        errores.push('El email no puede exceder 100 caracteres')
      }
    }

    if (this.cedula) {
      if (this.cedula.trim().length < 5) {
        errores.push('La cédula debe tener mínimo 5 caracteres')
      } else if (this.cedula.length > 20) {
        errores.push('La cédula no puede exceder 20 caracteres')
      }
    }

    if (this.fecha_nacimiento) {
      const fecha = new Date(this.fecha_nacimiento)
      const hoy = new Date()
      if (fecha > hoy) {
        errores.push('La fecha de nacimiento no puede ser futura')
      }
      const edad = hoy.getFullYear() - fecha.getFullYear()
      if (edad < 3) {
        errores.push('El alumno debe tener mínimo 3 años')
      }
      if (edad > 100) {
        errores.push('Verifica la fecha de nacimiento')
      }
    }

    if (this.genero) {
      const generosValidos = ['M', 'F', 'O', 'N']
      if (!generosValidos.includes(this.genero.toUpperCase())) {
        errores.push('El género debe ser: M (Masculino), F (Femenino), O (Otro) o N (No binario)')
      }
    }

    if (this.parent_phone) {
      if (this.parent_phone.length > 20) {
        errores.push('El teléfono no puede exceder 20 caracteres')
      }
    }

    if (this.parent_email) {
      if (!this.isValidEmail(this.parent_email)) {
        errores.push('El email del acudiente no es válido')
      }
    }

    if (this.ensemble_section) {
      if (this.ensemble_section.length > 100) {
        errores.push('La sección no puede exceder 100 caracteres')
      }
    }

    if (this.direccion) {
      if (this.direccion.length > 255) {
        errores.push('La dirección no puede exceder 255 caracteres')
      }
    }

    return errores
  }

  isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  }

  isCompleto() {
    return !!(this.nombre && this.email)
  }

  toJSON() {
    return {
      id: this.id,
      nombre: this.nombre.trim(),
      ensemble_section: this.ensemble_section.trim() || null,
      atril: this.atril,
      posicion_atril: this.posicion_atril.trim() || null,
      parent_email: this.parent_email.trim() || null,
      parent_phone: this.parent_phone.trim() || null,
      email: this.email.trim() || null,
      cedula: this.cedula.trim() || null,
      fecha_nacimiento: this.fecha_nacimiento || null,
      genero: this.genero ? this.genero.toUpperCase() : null,
      direccion: this.direccion.trim() || null,
      is_active: this.is_active,
    }
  }
}

export class Maestro {
  constructor(data = {}) {
    this.id = data.id || null
    this.user_id = data.user_id || null
    this.nombre = data.nombre || ''
    this.email = data.email || ''
    this.telefono = data.telefono || ''
    this.instrumento = data.instrumento || ''
    this.especialidad = data.especialidad || ''
    this.bio = data.bio || ''
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

    if (!this.email || !this.email.trim()) {
      errores.push('El email es obligatorio')
    } else if (!this.isValidEmail(this.email)) {
      errores.push('El formato del email no es válido')
    } else if (this.email.length > 100) {
      errores.push('El email no puede exceder 100 caracteres')
    }

    if (!this.instrumento || !this.instrumento.trim()) {
      errores.push('El instrumento es obligatorio')
    }

    if (this.telefono && this.telefono.length > 20) {
      errores.push('El teléfono no puede exceder 20 caracteres')
    }

    if (this.especialidad && this.especialidad.length > 100) {
      errores.push('La especialidad no puede exceder 100 caracteres')
    }

    if (this.bio && this.bio.length > 500) {
      errores.push('La bio no puede exceder 500 caracteres')
    }

    return errores
  }

  isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  }

  static validarNombre(nombre) {
    if (!nombre || !nombre.trim()) return false
    if (nombre.trim().length < 3) return false
    if (nombre.trim().length > 100) return false
    return true
  }

  static validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  }

  static validarTelefono(telefono) {
    if (!telefono) return true
    return telefono.length <= 20
  }

  static validarInstrumento(instrumento) {
    const instrumentos = this.getInstrumentos()
    return instrumentos.some(i => i.value === instrumento)
  }

  static getInstrumentos() {
    return [
      { value: 'violin', label: 'Violín' },
      { value: 'viola', label: 'Viola' },
      { value: 'cello', label: 'Cello' },
      { value: 'bajo', label: 'Bajo' },
      { value: 'flauta', label: 'Flauta' },
      { value: 'oboe', label: 'Oboe' },
      { value: 'clarinete', label: 'Clarinete' },
      { value: 'fagot', label: 'Fagot' },
      { value: 'trompa', label: 'Trompa' },
      { value: 'trompeta', label: 'Trompeta' },
      { value: 'trombon', label: 'Trombón' },
      { value: 'tuba', label: 'Tuba' },
      { value: 'piano', label: 'Piano' },
      { value: 'guitarra', label: 'Guitarra' },
      { value: 'arpa', label: 'Arpa' },
      { value: 'percusion', label: 'Percusión' },
      { value: 'voz', label: 'Voz' },
      { value: 'direccion', label: 'Dirección' },
      { value: 'solfeo', label: 'Solfeo' },
      { value: 'teoría', label: 'Teoría' },
    ]
  }

  toJSON() {
    return {
      id: this.id,
      user_id: this.user_id,
      nombre: this.nombre.trim(),
      email: this.email.trim().toLowerCase(),
      telefono: this.telefono.trim() || null,
      instrumento: this.instrumento.trim(),
      especialidad: this.especialidad.trim() || null,
      bio: this.bio.trim() || null,
      is_active: this.is_active,
      created_at: this.created_at,
      updated_at: this.updated_at,
    }
  }
}

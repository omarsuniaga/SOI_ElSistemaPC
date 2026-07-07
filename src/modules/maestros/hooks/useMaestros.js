import { obtenerMaestros, obtenerMaestro } from '../api/maestrosApi.js'

export class MaestrosHook {
  constructor() {
    this.maestros = []
    this.maestroActual = null
    this.cargando = false
    this.error = null
    this.listeners = []
  }

  subscribe(callback) {
    this.listeners.push(callback)
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback)
    }
  }

  notifyListeners() {
    this.listeners.forEach(listener => {
      listener({
        maestros: this.maestros,
        maestroActual: this.maestroActual,
        cargando: this.cargando,
        error: this.error,
      })
    })
  }

  async fetchMaestros() {
    this.cargando = true
    this.error = null
    this.notifyListeners()

    try {
      this.maestros = await obtenerMaestros()
      this.cargando = false
      this.notifyListeners()
      return this.maestros
    } catch (err) {
      this.error = err.message
      this.cargando = false
      this.notifyListeners()
      throw err
    }
  }

  async fetchMaestro(id) {
    this.cargando = true
    this.error = null
    this.notifyListeners()

    try {
      this.maestroActual = await obtenerMaestro(id)
      this.cargando = false
      this.notifyListeners()
      return this.maestroActual
    } catch (err) {
      this.error = err.message
      this.cargando = false
      this.notifyListeners()
      throw err
    }
  }

  reset() {
    this.maestros = []
    this.maestroActual = null
    this.cargando = false
    this.error = null
    this.notifyListeners()
  }

  search(searchTerm) {
    if (!searchTerm) return this.maestros

    const term = searchTerm.toLowerCase()
    return this.maestros.filter(m =>
      (m.nombre || '').toLowerCase().includes(term) ||
      (m.email || '').toLowerCase().includes(term) ||
      (m.instrumento || '').toLowerCase().includes(term) ||
      (m.especialidad || '').toLowerCase().includes(term)
    )
  }

  filterByEstado(isActive) {
    return this.maestros.filter(m => m.is_active === isActive)
  }

  filterByInstrumento(instrumento) {
    return this.maestros.filter(m => m.instrumento === instrumento)
  }

  getById(id) {
    return this.maestros.find(m => m.id === id) || null
  }

  getActivos() {
    return this.maestros.filter(m => m.is_active)
  }

  getInactivos() {
    return this.maestros.filter(m => !m.is_active)
  }

  count() {
    return this.maestros.length
  }

  countByInstrumento() {
    return this.maestros.reduce((acc, m) => {
      const instrumento = m.instrumento || 'Sin instrumento'
      acc[instrumento] = (acc[instrumento] || 0) + 1
      return acc
    }, {})
  }
}

let maestrosHookInstance = null

export function useMaestros() {
  if (!maestrosHookInstance) {
    maestrosHookInstance = new MaestrosHook()
  }
  return maestrosHookInstance
}

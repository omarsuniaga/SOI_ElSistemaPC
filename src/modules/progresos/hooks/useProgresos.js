import { obtenerProgresos, obtenerProgreso, obtenerBoletinAlumno, getPromedioAlumno, getPromedioClase } from '../api/progresosApi.js'
import { calcularPromedio } from '../utils/progresosUtils.js'

export class ProgresosHook {
  constructor() {
    this.progresos = []
    this.progresoActual = null
    this.cargando = false
    this.error = null
    this.listeners = []
    this.filtroAlumno = null
    this.filtroClase = null
    this.filtroTipo = null
    this.filtroEstado = null
    this.searchTerm = ''
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
        progresos: this.getFilteredProgresos(),
        progresoActual: this.progresoActual,
        cargando: this.cargando,
        error: this.error,
      })
    })
  }

  async fetchProgresos() {
    this.cargando = true
    this.error = null
    this.notifyListeners()

    try {
      this.progresos = await obtenerProgresos()
      this.cargando = false
      this.notifyListeners()
      return this.progresos
    } catch (err) {
      this.error = err.message
      this.cargando = false
      this.notifyListeners()
      throw err
    }
  }

  async fetchProgreso(id) {
    this.cargando = true
    this.error = null
    this.notifyListeners()

    try {
      this.progresoActual = await obtenerProgreso(id)
      this.cargando = false
      this.notifyListeners()
      return this.progresoActual
    } catch (err) {
      this.error = err.message
      this.cargando = false
      this.notifyListeners()
      throw err
    }
  }

  reset() {
    this.progresos = []
    this.progresoActual = null
    this.cargando = false
    this.error = null
    this.filtroAlumno = null
    this.filtroClase = null
    this.filtroTipo = null
    this.filtroEstado = null
    this.searchTerm = ''
    this.notifyListeners()
  }

  search(term) {
    this.searchTerm = term
    this.notifyListeners()
    return this.getFilteredProgresos()
  }

  filterByAlumno(alumnoId) {
    this.filtroAlumno = alumnoId
    this.notifyListeners()
    return this.getFilteredProgresos()
  }

  filterByClase(claseId) {
    this.filtroClase = claseId
    this.notifyListeners()
    return this.getFilteredProgresos()
  }

  filterByTipo(tipo) {
    this.filtroTipo = tipo
    this.notifyListeners()
    return this.getFilteredProgresos()
  }

  filterByEstado(estado) {
    this.filtroEstado = estado
    this.notifyListeners()
    return this.getFilteredProgresos()
  }

  getById(id) {
    return this.progresos.find(p => p.id === id) || null
  }

  async getBoletin(alumnoId) {
    return await obtenerBoletinAlumno(alumnoId)
  }

  getFilteredProgresos() {
    let result = [...this.progresos]

    if (this.filtroAlumno) {
      result = result.filter(p => p.alumno_id === this.filtroAlumno)
    }

    if (this.filtroClase) {
      result = result.filter(p => p.clase_id === this.filtroClase)
    }

    if (this.filtroTipo) {
      result = result.filter(p => p.tipo_evaluacion === this.filtroTipo)
    }

    if (this.filtroEstado) {
      result = result.filter(p => p.estado === this.filtroEstado)
    }

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase()
      result = result.filter(p =>
        (p.alumno_id || '').toLowerCase().includes(term) ||
        (p.clase_id || '').toLowerCase().includes(term) ||
        (p.observaciones || '').toLowerCase().includes(term) ||
        (p.tipo_evaluacion || '').toLowerCase().includes(term)
      )
    }

    return result
  }

  count() {
    return this.getFilteredProgresos().length
  }

  countByTipo() {
    return this.getFilteredProgresos().reduce((acc, p) => {
      const tipo = p.tipo_evaluacion || 'Sin tipo'
      acc[tipo] = (acc[tipo] || 0) + 1
      return acc
    }, {})
  }

  countByEstado() {
    return this.getFilteredProgresos().reduce((acc, p) => {
      const estado = p.estado || 'Sin estado'
      acc[estado] = (acc[estado] || 0) + 1
      return acc
    }, {})
  }

  getPromedio() {
    return calcularPromedio(this.getFilteredProgresos())
  }

  async getPromedioAlumno(alumnoId) {
    return await getPromedioAlumno(alumnoId)
  }

  async getPromedioClase(claseId) {
    return await getPromedioClase(claseId)
  }
}

let progresosHookInstance = null

export function useProgresos() {
  if (!progresosHookInstance) {
    progresosHookInstance = new ProgresosHook()
  }
  return progresosHookInstance
}

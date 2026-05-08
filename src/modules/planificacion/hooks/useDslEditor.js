import { saveDslContent, loadDslContent, extractTokensFromDsl, summarizeDsl } from '../api/dslApi.js'
import { getAlumnos } from '../../alumnos/api/alumnosApi.js'

export class DslEditorHook {
  constructor(options = {}) {
    this.sesionId = options.sesionId || null
    this.content = ''
    this.parsed = null
    this.cargando = false
    this.error = null
    this.listeners = []
    this.isSaved = true
  }

  subscribe(callback) {
    this.listeners.push(callback)
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback)
    }
  }

  notifyListeners() {
    const state = {
      content: this.content,
      parsed: this.parsed,
      cargando: this.cargando,
      error: this.error,
      isSaved: this.isSaved,
    }
    this.listeners.forEach(listener => listener(state))
  }

  setSesionId(sesionId) {
    this.sesionId = sesionId
  }

  updateContent(newContent) {
    this.content = newContent
    this.parsed = extractTokensFromDsl(newContent)
    this.isSaved = false
    this.notifyListeners()
  }

  async save() {
    if (!this.sesionId) {
      this.error = 'No hay sesión asignada'
      this.notifyListeners()
      return { success: false, message: this.error }
    }

    this.cargando = true
    this.error = null
    this.notifyListeners()

    try {
      const result = await saveDslContent(this.sesionId, this.content)

      if (result.success) {
        this.isSaved = true
      } else {
        this.error = result.message
      }

      this.cargando = false
      this.notifyListeners()
      return result
    } catch (err) {
      this.error = err.message
      this.cargando = false
      this.notifyListeners()
      throw err
    }
  }

  async load() {
    if (!this.sesionId) {
      return null
    }

    this.cargando = true
    this.error = null
    this.notifyListeners()

    try {
      const logs = await loadDslContent(this.sesionId)
      this.cargando = false
      this.notifyListeners()
      return logs
    } catch (err) {
      this.error = err.message
      this.cargando = false
      this.notifyListeners()
      return []
    }
  }

  getSummary() {
    return summarizeDsl(this.content)
  }

  async getAlumnosMention(alumnoIds) {
    const allAlumnos = await getAlumnos()
    const selected = allAlumnos.filter(a => alumnoIds.includes(a.id))
    return selected.map(a => `#${a.nombre_completo}`).join(', ')
  }

  hasUnsavedChanges() {
    return !this.isSaved
  }

  hasAlumnos() {
    return this.parsed && this.parsed.alumnos.length > 0
  }

  hasTareas() {
    return this.parsed && this.parsed.tareas.length > 0
  }

  getCalificacion() {
    return this.parsed ? this.parsed.calificacion : null
  }
}

let globalHookInstance = null

export function createDslEditorHook(options) {
  const hook = new DslEditorHook(options)
  globalHookInstance = hook
  return hook
}

export function getDslEditorHook() {
  if (!globalHookInstance) {
    globalHookInstance = new DslEditorHook()
  }
  return globalHookInstance
}
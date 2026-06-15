import seedData from '../../../assets/data/mocks/bitacora.json'
import { BitacoraRegistro } from '../models/bitacora.model.js'

const STORAGE_KEY = 'bitacora_demo'
const SCHEMA_VERSION = 1

function loadStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && parsed.schemaVersion === SCHEMA_VERSION) {
        return parsed
      }
    }
  } catch {
    // corrupt data — re-seed below
  }
  return seed()
}

function seed() {
  const store = {
    schemaVersion: SCHEMA_VERSION,
    sesiones: [...(seedData.sesiones || [])],
    objetivos: [...(seedData.objetivos || [])],
    semaforos: [...(seedData.semaforos || [])],
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  return store
}

function persist(store) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
}

function delay(ms = 100) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function generateId() {
  return 'bit_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 6)
}

export async function getObjetivosClase(claseId) {
  await delay()
  const store = loadStore()
  return store.objetivos
    .filter(o => o.clase_id === claseId && o.activo !== false)
    .sort((a, b) => a.orden - b.orden)
}

export async function getSemaforoClase(claseId) {
  await delay()
  const store = loadStore()

  const alumnoMap = new Map()

  for (const sesion of store.sesiones) {
    if (sesion.claseId !== claseId) continue
    for (const nota of sesion.notas) {
      const id = nota.alumno_id
      if (!alumnoMap.has(id)) {
        alumnoMap.set(id, { alumno_id: id, bien_count: 0, regular_count: 0, mal_count: 0, total_registros: 0 })
      }
      const entry = alumnoMap.get(id)
      const key = `${nota.nota}_count`
      if (key in entry) entry[key]++
      entry.total_registros++
    }
  }

  return Array.from(alumnoMap.values()).map(entry => ({
    ...entry,
    semaforo: BitacoraRegistro.calcularSemaforo(entry),
  }))
}

export async function registrarSesion(payload) {
  await delay()

  const registro = new BitacoraRegistro(payload)
  const errors = registro.validate()
  if (errors.length > 0) {
    throw new Error(errors.join('. '))
  }

  const store = loadStore()

  const sesion = {
    id: generateId(),
    ...registro.toJSON(),
    created_at: new Date().toISOString(),
  }

  store.sesiones.push(sesion)
  persist(store)

  return sesion
}

export async function getHistorialContenido(claseId, objetivoId) {
  await delay()
  const store = loadStore()
  return store.sesiones.filter(
    s => s.claseId === claseId && s.objetivoId === objetivoId
  )
}

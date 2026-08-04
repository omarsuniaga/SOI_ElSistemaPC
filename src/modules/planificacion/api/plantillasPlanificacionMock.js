/**
 * plantillasPlanificacionMock.js — Mock para plantillas_planificacion en modo Demo.
 * Lee de plantillas-planificacion.json y mantiene cambios en localStorage.
 */

import MOCK_PLANTILLAS from '../../../assets/data/mocks/plantillas-planificacion.json'

const STORAGE_KEY = 'plantillas_planificacion_demo'
const SCHEMA_VERSION = 1

let _data = null

function _ensureStore() {
  if (_data !== null) return

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && parsed.schemaVersion === SCHEMA_VERSION && Array.isArray(parsed.plantillas)) {
        _data = parsed.plantillas
        return
      }
    }
  } catch {
    // Corrupt — fall through to reseed
  }

  _data = (MOCK_PLANTILLAS || []).map((p) => ({ ...p, activo: true }))
  _persist()
}

function _persist() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ schemaVersion: SCHEMA_VERSION, plantillas: _data }),
    )
  } catch {
    // localStorage full — ignore
  }
}

async function _delay() {
  await new Promise((r) => setTimeout(r, 150))
}

/**
 * Obtiene todas las plantillas de planificación activas.
 * @returns {Promise<Array>}
 */
export async function obtenerPlantillasPlanificacion() {
  await _delay()
  _ensureStore()
  return _data.filter((p) => p.activo !== false).map((p) => ({ ...p }))
}

/**
 * Obtiene una plantilla de planificación por ID.
 * @param {string} id
 * @returns {Promise<object>}
 */
export async function obtenerPlantillaPlanificacion(id) {
  await _delay()
  _ensureStore()
  const p = _data.find((p) => p.id === id)
  if (!p) throw new Error('Plantilla de planificación no encontrada')
  return { ...p }
}

/**
 * Crea una nueva plantilla de planificación.
 * @param {{ id: string, nombre: string, objetivos?: string, contenido?: string, recursos?: string, evaluacion_metodo?: string }} plantilla
 * @returns {Promise<object>}
 */
export async function crearPlantillaPlanificacion(plantilla) {
  await _delay()
  _ensureStore()

  const nueva = {
    id: plantilla.id.trim(),
    nombre: plantilla.nombre.trim(),
    objetivos: plantilla.objetivos?.trim() || '',
    contenido: plantilla.contenido?.trim() || '',
    recursos: plantilla.recursos?.trim() || '',
    evaluacion_metodo: plantilla.evaluacion_metodo?.trim() || '',
    activo: true,
    created_at: new Date().toISOString(),
  }

  _data.push(nueva)
  _persist()
  return { ...nueva }
}

/**
 * Actualiza una plantilla de planificación existente.
 * @param {string} id
 * @param {object} cambios
 * @returns {Promise<object>}
 */
export async function actualizarPlantillaPlanificacion(id, cambios) {
  await _delay()
  _ensureStore()

  const idx = _data.findIndex((p) => p.id === id)
  if (idx === -1) throw new Error('Plantilla de planificación no encontrada')

  _data[idx] = { ..._data[idx], ...cambios, updated_at: new Date().toISOString() }
  _persist()
  return { ..._data[idx] }
}

/**
 * Desactiva una plantilla de planificación (soft-delete).
 * @param {string} id
 */
export async function eliminarPlantillaPlanificacion(id) {
  await _delay()
  _ensureStore()

  const idx = _data.findIndex((p) => p.id === id)
  if (idx === -1) throw new Error('Plantilla de planificación no encontrada')

  _data[idx].activo = false
  _persist()
}

/**
 * Guarda el árbol curricular completo en Modo Demo (localStorage).
 * Mismo contrato que la implementación Supabase: devuelve el id de la
 * plantilla y el árbol marcado como persistido. En demo la persistencia es
 * real (localStorage), por lo que `persistido: true` es honesto.
 * @param {{ plantillaId?: string|null, claseId?: string|null, nombre?: string, unidades: Array }} params
 * @returns {Promise<{ plantillaId: string, unidades: Array }>}
 */
export async function guardarArbolCurricular({ plantillaId = null, claseId = null, nombre = 'Plan Curricular Institucional', unidades = [] }) {
  await _delay()
  _ensureStore()

  let targetId = plantillaId
  if (!targetId) {
    const existente = _data.find((p) => p.clase_id && String(p.clase_id) === String(claseId))
    targetId = existente?.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `plan-${Date.now()}`)
  }

  const payload = {
    id: targetId,
    nombre: nombre.trim(),
    objetivos: JSON.stringify(unidades),
    contenido: '',
    recursos: '',
    evaluacion_metodo: '',
    clase_id: claseId || null,
    activo: true,
    updated_at: new Date().toISOString(),
  }

  const idx = _data.findIndex((p) => p.id === targetId)
  if (idx === -1) {
    _data.push({ ...payload, created_at: new Date().toISOString() })
  } else {
    _data[idx] = { ..._data[idx], ...payload }
  }
  _persist()

  const unidadesPersistidas = unidades.map((u) => ({
    ...u,
    persistido: true,
    objetivos: (u.objetivos || []).map((o) => ({
      ...o,
      persistido: true,
      indicadores: (o.indicadores || []).map((ind) => ({
        ...ind,
        persistido: true,
      })),
    })),
  }))

  return {
    plantillaId: targetId,
    unidades: unidadesPersistidas,
  }
}

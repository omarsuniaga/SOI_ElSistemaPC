/**
 * plantillasMock.js — Mock para plantillas_dsl en modo Demo.
 * Lee de plantillas.json y mantiene cambios en localStorage.
 */

import MOCK_PLANTILLAS from '../../../assets/data/mocks/plantillas.json'

const STORAGE_KEY = 'plantillas_dsl_demo'
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

  _data = (MOCK_PLANTILLAS.plantillas || []).map((p) => ({ ...p }))
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
 * Obtiene todas las plantillas activas.
 * @returns {Promise<Array>}
 */
export async function obtenerPlantillas() {
  await _delay()
  _ensureStore()
  return _data.filter((p) => p.activo !== false).map((p) => ({ ...p }))
}

/**
 * Obtiene una plantilla por ID.
 * @param {string} id
 * @returns {Promise<object>}
 */
export async function obtenerPlantilla(id) {
  await _delay()
  _ensureStore()
  const p = _data.find((p) => p.id === id)
  if (!p) throw new Error('Plantilla no encontrada')
  return { ...p }
}

/**
 * Crea una nueva plantilla.
 * @param {{ nombre: string, instrumento?: string, descripcion?: string, contenido: string }} plantilla
 * @returns {Promise<object>}
 */
export async function crearPlantilla(plantilla) {
  await _delay()
  _ensureStore()

  const nueva = {
    id: `tpl_${Date.now()}`,
    nombre: plantilla.nombre.trim(),
    instrumento: plantilla.instrumento?.trim() || 'General',
    descripcion: plantilla.descripcion?.trim() || '',
    contenido: plantilla.contenido.trim(),
    activo: true,
    created_at: new Date().toISOString(),
  }

  _data.push(nueva)
  _persist()
  return { ...nueva }
}

/**
 * Actualiza una plantilla existente.
 * @param {string} id
 * @param {object} cambios
 * @returns {Promise<object>}
 */
export async function actualizarPlantilla(id, cambios) {
  await _delay()
  _ensureStore()

  const idx = _data.findIndex((p) => p.id === id)
  if (idx === -1) throw new Error('Plantilla no encontrada')

  _data[idx] = { ..._data[idx], ...cambios, updated_at: new Date().toISOString() }
  _persist()
  return { ..._data[idx] }
}

/**
 * Desactiva una plantilla (soft-delete).
 * @param {string} id
 */
export async function eliminarPlantilla(id) {
  await _delay()
  _ensureStore()

  const idx = _data.findIndex((p) => p.id === id)
  if (idx === -1) throw new Error('Plantilla no encontrada')

  _data[idx].activo = false
  _persist()
}

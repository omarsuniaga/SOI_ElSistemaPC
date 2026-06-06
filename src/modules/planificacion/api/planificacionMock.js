/**
 * planificacionMock.js — localStorage-backed mock for Demo Mode
 *
 * Seeds from planificaciones.json on first load. All mutations persist
 * to localStorage under the key 'planificaciones_demo'.
 * Schema version is stored alongside data for forward compatibility.
 */

import { Planificacion } from '../models/planificacion.model.js'
import MOCK_PLANIFICACIONES from '../../../assets/data/mocks/planificaciones.json'
import MOCK_CLASES from '../../../assets/data/mocks/clases.json'
import MOCK_MAESTROS from '../../../assets/data/mocks/maestros.json'

const STORAGE_KEY = 'planificaciones_demo'
const SCHEMA_VERSION = 1

// ── In-memory store (lazy-loaded on first API call) ──
let _data = null

/**
 * Lazy-init: loads from localStorage or seeds from static JSON.
 */
function _ensureStore() {
  if (_data !== null) return

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (
        parsed &&
        parsed.schemaVersion === SCHEMA_VERSION &&
        Array.isArray(parsed.planificaciones)
      ) {
        _data = parsed.planificaciones
        return
      }
    }
  } catch {
    // Corrupt JSON — fall through to reseed
  }

  // Seed from static JSON
  _data = (MOCK_PLANIFICACIONES.planificaciones || []).map((p) => ({ ...p }))
  _persist()
}

function _persist() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        schemaVersion: SCHEMA_VERSION,
        planificaciones: _data,
      }),
    )
  } catch (e) {
    console.warn('[planificacionMock] Failed to persist to localStorage:', e.message)
  }
}

function _simulateDelay(ms = 150) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// ── API Functions ───────────────────────────────────────────────

export async function obtenerPlanificaciones(maestroId = null) {
  await _simulateDelay()
  _ensureStore()
  let results = _data
  if (maestroId) {
    results = results.filter((p) => p.maestro_id === maestroId)
  }
  return results
    .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
    .map((p) => new Planificacion(p))
}

export async function obtenerPlanificacion(id) {
  await _simulateDelay()
  _ensureStore()
  const found = _data.find((p) => p.id === id)
  if (!found) throw new Error('Planificación no encontrada')
  return new Planificacion(found)
}

/**
 * Enriched query — joins planificaciones with in-memory mock data
 * for clases (nombre) and maestros (nombre_completo).
 */
export async function obtenerPlanificacionesConDetalles(maestroId = null) {
  await _simulateDelay()
  _ensureStore()

  let results = _data
  if (maestroId) {
    results = results.filter((p) => p.maestro_id === maestroId)
  }

  const clases = MOCK_CLASES?.clases || []
  const maestros = MOCK_MAESTROS || []

  return results
    .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
    .map(
      (p) =>
        new Planificacion({
          ...p,
          clase_nombre: clases.find((c) => c.id === p.clase_id)?.nombre || 'Sin asignar',
          maestro_nombre:
            maestros.find((m) => m.id === p.maestro_id)?.nombre_completo || 'Sin asignar',
        }),
    )
}

export async function crearPlanificacion(planData) {
  await _simulateDelay()
  _ensureStore()

  const model = new Planificacion(planData)
  const errores = model.validate()
  if (errores.length > 0) throw new Error(errores.join('. '))

  const now = new Date().toISOString()
  const record = {
    ...model.toJSON(),
    id: `plan_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    created_at: now,
    updated_at: now,
  }

  _data.push(record)
  _persist()
  return new Planificacion(record)
}

export async function actualizarPlanificacion(id, actualizaciones) {
  await _simulateDelay()
  _ensureStore()

  const idx = _data.findIndex((p) => p.id === id)
  if (idx === -1) throw new Error('Planificación no encontrada')

  const merged = { ..._data[idx], ...actualizaciones }
  const model = new Planificacion(merged)
  const errores = model.validate()
  if (errores.length > 0) throw new Error(errores.join('. '))

  const updated = {
    ..._data[idx],
    ...model.toJSON(),
    id: _data[idx].id,
    created_at: _data[idx].created_at,
    updated_at: new Date().toISOString(),
  }

  _data[idx] = updated
  _persist()
  return new Planificacion(updated)
}

export async function eliminarPlanificacion(id) {
  await _simulateDelay()
  _ensureStore()

  const idx = _data.findIndex((p) => p.id === id)
  if (idx === -1) throw new Error('Planificación no encontrada')

  _data.splice(idx, 1)
  _persist()
}

export async function marcarRevisadasMasivo(ids) {
  await _simulateDelay()
  _ensureStore()

  if (!ids || !ids.length) return []

  const updated = []
  for (const id of ids) {
    const idx = _data.findIndex((p) => p.id === id)
    if (idx !== -1) {
      _data[idx] = {
        ..._data[idx],
        estado: 'revisado',
        updated_at: new Date().toISOString(),
      }
      updated.push(new Planificacion(_data[idx]))
    }
  }

  if (updated.length > 0) _persist()
  return updated
}

export async function marcarRevisada(id) {
  const results = await marcarRevisadasMasivo([id])
  return results[0] || null
}

export async function marcarEjecutada(id) {
  return actualizarPlanificacion(id, { estado: 'ejecutado' })
}

// ── New functions ────────────────────────────────────────────────

export async function obtenerClases() {
  await _simulateDelay()
  const clases = MOCK_CLASES?.clases || []
  return [...clases].sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''))
}

export async function obtenerMaestros() {
  await _simulateDelay()
  return (MOCK_MAESTROS || [])
    .filter((m) => m.estado !== 'inactivo')
    .map((m) => ({
      id: m.id,
      nombre: m.nombre_completo,
    }))
}

export async function obtenerMaestro(id) {
  await _simulateDelay()
  const maestros = MOCK_MAESTROS || []
  const found = maestros.find((m) => m.id === id)
  if (!found) throw new Error('Maestro no encontrado')
  return { ...found }
}

export async function obtenerSesiones(_maestroId, _fechaInicio, _fechaFin) {
  await _simulateDelay()
  // Return empty array for mock — sesiones are managed by sesionesApi.js
  return []
}

/**
 * Mock de cobertura curricular.
 * Cruza MOCK_CLASES con planificaciones en memoria para simular el LEFT JOIN.
 */
export async function obtenerCoberturaCurricular(maestroId = null) {
  await _simulateDelay()
  _ensureStore()

  const clases = MOCK_CLASES?.clases || []
  const maestros = MOCK_MAESTROS || []

  const clasesFiltradas = maestroId
    ? clases.filter((c) => (c.maestro_id || c.maestro_titular_id) === maestroId)
    : clases

  return clasesFiltradas.map((clase) => {
    const plan = _data.find((p) => p.clase_id === clase.id) ?? null
    const maestroId = clase.maestro_id || clase.maestro_titular_id
    const maestro = maestros.find((m) => m.id === maestroId)

    return {
      clase_id: clase.id,
      clase_nombre: clase.nombre || 'Sin nombre',
      instrumento: clase.instrumento || 'General',
      maestro_id: maestroId,
      maestro_nombre: maestro?.nombre_completo || 'Sin asignar',
      tiene_plan: !!plan,
      plan_id: plan?.id ?? null,
      plan_estado: plan?.estado ?? null,
      plan_tema: plan?.tema ?? null,
      plan_updated_at: plan?.updated_at ?? null,
    }
  })
}

/**
 * bitacoraMock.js — localStorage-backed mock for Demo Mode
 *
 * Seeds from bitacora.json on first load. All mutations persist to
 * localStorage under 'bitacora_demo'. Schema version is stored alongside
 * data for forward compatibility.
 *
 * Mirrors planificacionMock.js pattern exactly.
 */

import SEED from '../../../assets/data/mocks/bitacora.json'

const STORAGE_KEY = 'bitacora_demo'
const SCHEMA_VERSION = 1

/** @type {{ sesiones: object[], objetivos: object[], alumnos: object } | null} */
let _data = null

// ── In-memory store (lazy-loaded on first API call) ──────────────

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
        Array.isArray(parsed.sesiones) &&
        Array.isArray(parsed.objetivos)
      ) {
        _data = {
          sesiones: parsed.sesiones,
          objetivos: parsed.objetivos,
          alumnos: parsed.alumnos || {},
        }
        return
      }
    }
  } catch {
    // Corrupt JSON — fall through to reseed
  }

  // Seed from static JSON
  _data = {
    sesiones: (SEED.sesiones || []).map((s) => ({ ...s, notas: s.notas.map((n) => ({ ...n })) })),
    objetivos: (SEED.objetivos || []).map((o) => ({ ...o })),
    alumnos: SEED.alumnos || {},
  }
  _persist()
}

function _persist() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        schemaVersion: SCHEMA_VERSION,
        sesiones: _data.sesiones,
        objetivos: _data.objetivos,
        alumnos: _data.alumnos,
      }),
    )
  } catch (e) {
    console.warn('[bitacoraMock] Failed to persist to localStorage:', e.message)
  }
}

function _simulateDelay(ms = 150) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// ── Validation helpers ────────────────────────────────────────────

const NOTAS_VALIDAS = ['bien', 'regular', 'mal']

/**
 * Validates a registrarSesion payload before any write.
 * @param {object} payload
 * @throws {Error} when validation fails
 */
function _validateSesionPayload({ claseId, objetivoId, fecha, notas }) {
  if (!claseId) throw new Error('claseId es obligatorio')
  if (!objetivoId) throw new Error('objetivoId es obligatorio')

  const today = new Date().toISOString().slice(0, 10)
  if (!fecha || fecha > today) throw new Error('fecha no puede ser una fecha futura')

  if (!Array.isArray(notas) || notas.length === 0) {
    throw new Error('notas debe contener al menos un alumno')
  }

  for (const n of notas) {
    if (!n.alumnoId) throw new Error('alumnoId es obligatorio en cada nota')
    if (!n.nota || !NOTAS_VALIDAS.includes(n.nota)) {
      throw new Error(`nota_cualitativa debe ser uno de: ${NOTAS_VALIDAS.join(', ')}`)
    }
  }
}

// ── API Functions ─────────────────────────────────────────────────

/**
 * Registers a session with per-student notes atomically (in-memory).
 *
 * @param {{ claseId: string, objetivoId: string, fecha: string,
 *   notas: { alumnoId: string, nota: string, observacion?: string }[] }} payload
 * @returns {Promise<{ sessionId: string }>}
 */
export async function registrarSesion({ claseId, objetivoId, fecha, notas }) {
  await _simulateDelay()
  _ensureStore()
  _validateSesionPayload({ claseId, objetivoId, fecha, notas })

  const sessionId = `ses_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`

  const sesion = {
    id: sessionId,
    clase_id: claseId,
    objetivo_id: objetivoId,
    fecha,
    maestro_id: 'maestro-demo',
    notas: notas.map((n) => ({
      alumno_id: n.alumnoId,
      nota_cualitativa: n.nota,
      observacion: n.observacion || null,
    })),
  }

  _data.sesiones.push(sesion)
  _persist()

  return { sessionId }
}

/**
 * Returns aggregated semáforo rows for a clase (mirrors v_semaforo_contenidos).
 *
 * @param {string} claseId
 * @returns {Promise<{alumno_id: string, objetivo_id: string, bien_count: number,
 *   regular_count: number, mal_count: number, total_registros: number}[]>}
 */
export async function getSemaforoPorClase(claseId) {
  await _simulateDelay()
  _ensureStore()

  /** @type {Map<string, {bien: number, regular: number, mal: number}>} */
  const counts = new Map()

  for (const ses of _data.sesiones) {
    if (ses.clase_id !== claseId) continue
    const objId = ses.objetivo_id

    for (const n of ses.notas) {
      const key = `${n.alumno_id}::${objId}`
      if (!counts.has(key)) {
        counts.set(key, { alumno_id: n.alumno_id, objetivo_id: objId, bien: 0, regular: 0, mal: 0 })
      }
      const c = counts.get(key)
      if (n.nota_cualitativa === 'bien') c.bien++
      else if (n.nota_cualitativa === 'regular') c.regular++
      else if (n.nota_cualitativa === 'mal') c.mal++
    }
  }

  return Array.from(counts.values()).map((c) => ({
    alumno_id: c.alumno_id,
    objetivo_id: c.objetivo_id,
    bien_count: c.bien,
    regular_count: c.regular,
    mal_count: c.mal,
    total_registros: c.bien + c.regular + c.mal,
  }))
}

/**
 * Returns all objectives for a clase ordered by orden ASC.
 * Mirrors resolution: clases.ruta_id → rutas_contenido ← ruta_contenido_objetivos.
 * In demo mode, objetivos in the seed JSON carry clase_id directly for simplicity.
 *
 * @param {string} claseId
 * @returns {Promise<{id: string, descripcion: string, orden: number}[]>}
 */
export async function getContenidosDeClase(claseId) {
  await _simulateDelay()
  _ensureStore()

  return _data.objetivos
    .filter((o) => o.clase_id === claseId)
    .sort((a, b) => a.orden - b.orden)
    .map((o) => ({ ...o }))
}

/**
 * Returns alumnos enrolled in a clase.
 * In demo mode the seed JSON carries alumno stubs keyed by clase_id.
 * Falls back to an empty array so the modal gracefully degrades.
 *
 * @param {string} claseId
 * @returns {Promise<{id: string, nombre_completo: string}[]>}
 */
export async function getAlumnosByClase(claseId) {
  await _simulateDelay()
  _ensureStore()

  const alumnosMap = _data.alumnos || {}
  return (alumnosMap[claseId] || []).map((a) => ({ ...a }))
}

/**
 * Returns all session notes for (claseId, objetivoId) ordered by fecha DESC.
 * Each row represents one student note in one session.
 *
 * @param {string} claseId
 * @param {string} objetivoId
 * @returns {Promise<{fecha: string, alumno_id: string, nota_cualitativa: string, observacion: string|null}[]>}
 */
export async function getHistorialContenido(claseId, objetivoId) {
  await _simulateDelay()
  _ensureStore()

  const rows = []

  for (const ses of _data.sesiones) {
    if (ses.clase_id !== claseId || ses.objetivo_id !== objetivoId) continue
    for (const n of ses.notas) {
      rows.push({
        fecha: ses.fecha,
        alumno_id: n.alumno_id,
        nota_cualitativa: n.nota_cualitativa,
        observacion: n.observacion || null,
      })
    }
  }

  // ORDER BY fecha DESC
  return rows.sort((a, b) => (a.fecha < b.fecha ? 1 : a.fecha > b.fecha ? -1 : 0))
}

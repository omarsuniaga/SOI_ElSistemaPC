import MOCK_DATA from '../../../assets/data/mocks/ruta_academica.json'

const STORAGE_KEY = 'ruta_academica_demo'
const SCHEMA_VERSION = 1

let _data = null

function _ensureStore() {
  if (_data !== null) return
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && parsed.schemaVersion === SCHEMA_VERSION) {
        _data = parsed
        return
      }
    }
  } catch {}
  _data = JSON.parse(JSON.stringify(MOCK_DATA))
  _persist()
}

function _persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ..._data, schemaVersion: SCHEMA_VERSION }))
  } catch (e) {
    console.warn('[routeMock] Failed to persist:', e.message)
  }
}

function _delay(ms = 100) {
  return new Promise((r) => setTimeout(r, ms))
}

function _genId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
}

export async function getClasses(maestroId = null) {
  await _delay()
  _ensureStore()
  let results = _data.plan_clases.filter((c) => c.activo)
  if (maestroId) results = results.filter((c) => c.maestro_id === maestroId)
  return [...results]
}

export async function getLevelsByClass(classId) {
  await _delay()
  _ensureStore()
  return _data.plan_niveles
    .filter((l) => l.clase_id === classId)
    .sort((a, b) => a.numero_nivel - b.numero_nivel)
}

export async function getNodesByLevel(levelId) {
  await _delay()
  _ensureStore()
  return _data.plan_temas
    .filter((n) => n.nivel_id === levelId)
    .sort((a, b) => (a.orden_index || 0) - (b.orden_index || 0))
}

export async function getObjectivesByNode(nodeId) {
  await _delay()
  _ensureStore()
  return _data.plan_objetivos
    .filter((o) => o.tema_id === nodeId)
    .sort((a, b) => (a.orden_index || 0) - (b.orden_index || 0))
}

export async function getIndicatorsByObjective(objectiveId) {
  await _delay()
  _ensureStore()
  return _data.plan_indicadores
    .filter((i) => i.objetivo_id === objectiveId)
    .sort((a, b) => (a.orden_index || 0) - (b.orden_index || 0))
}

export async function getFullHierarchy(classId) {
  await _delay(150)
  _ensureStore()
  const levels = _data.plan_niveles
    .filter((l) => l.clase_id === classId)
    .sort((a, b) => a.numero_nivel - b.numero_nivel)
  return levels.map((l) => ({
    ...l,
    plan_temas: _data.plan_temas
      .filter((t) => t.nivel_id === l.id)
      .sort((a, b) => (a.orden_index || 0) - (b.orden_index || 0))
      .map((t) => ({
        ...t,
        plan_objetivos: _data.plan_objetivos
          .filter((o) => o.tema_id === t.id)
          .sort((a, b) => (a.orden_index || 0) - (b.orden_index || 0))
          .map((o) => ({
            ...o,
            plan_indicadores: _data.plan_indicadores
              .filter((i) => i.objetivo_id === o.id)
              .sort((a, b) => (a.orden_index || 0) - (b.orden_index || 0)),
          })),
      })),
  }))
}

export async function updateIndicatorCalificacion(indicatorId, calificacion) {
  await _delay()
  _ensureStore()
  const idx = _data.plan_indicadores.findIndex((i) => i.id === indicatorId)
  if (idx === -1) throw new Error('Indicador no encontrado')
  _data.plan_indicadores[idx] = { ..._data.plan_indicadores[idx], calificacion }
  _persist()
}

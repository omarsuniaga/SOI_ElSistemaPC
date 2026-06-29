import MOCK_WEEKLY_DATA from '../../../assets/data/mocks/acm_weekly_plans.json'

const STORAGE_KEY = 'acm_weekly_plans_demo'
const PROGRESS_STORAGE_KEY = 'student_indicator_progress_demo'
const SCHEMA_VERSION = 1

let _data = null
let _progress = {}

function _ensureStore() {
  if (_data !== null) return
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && parsed.schemaVersion === SCHEMA_VERSION) {
        _data = parsed
      }
    }
  } catch {}
  if (!_data) {
    _data = JSON.parse(JSON.stringify(MOCK_WEEKLY_DATA))
    _persist()
  }

  try {
    const rawProg = localStorage.getItem(PROGRESS_STORAGE_KEY)
    if (rawProg) {
      _progress = JSON.parse(rawProg)
    } else {
      _progress = {}
      _persistProgress()
    }
  } catch {
    _progress = {}
  }
}

function _persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ..._data, schemaVersion: SCHEMA_VERSION }))
  } catch (e) {
    console.warn('[weeklyPlanMock] Failed to persist weekly plans:', e.message)
  }
}

function _persistProgress() {
  try {
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(_progress))
  } catch (e) {
    console.warn('[weeklyPlanMock] Failed to persist progress:', e.message)
  }
}

function _delay(ms = 100) {
  return new Promise((r) => setTimeout(r, ms))
}

export async function obtenerFuentesCurriculares() {
  await _delay()
  _ensureStore()
  return [..._data.curriculum_sources]
}

export async function obtenerPlanSemanalPorNivel(levelId, instrument = 'violín') {
  await _delay()
  _ensureStore()
  const plan = _data.weekly_plans.find(
    (p) => p.level_id === levelId && p.instrument.toLowerCase() === instrument.toLowerCase()
  )
  return plan ? { ...plan } : null
}

export async function obtenerRutasActivas(maestroId = null) {
  await _delay()
  _ensureStore()
  let routes = _data.active_routes
  if (maestroId) {
    routes = routes.filter((r) => r.teacher_id === maestroId)
  }
  return [...routes]
}

export async function obtenerRutaActivaPorGrupo(groupId) {
  await _delay()
  _ensureStore()
  const route = _data.active_routes.find((r) => r.group_id === groupId && r.status === 'active')
  return route ? { ...route } : null
}

export async function crearRutaActiva(routeData) {
  await _delay()
  _ensureStore()
  const newRoute = {
    id: `aroute-${Date.now()}`,
    weekly_plan_id: routeData.weekly_plan_id || 'wplan-violin-n0',
    teacher_id: routeData.teacher_id || 'maestro_001',
    group_id: routeData.group_id,
    level_id: routeData.level_id || 'pnivel_001',
    current_week: 1,
    status: 'active',
    start_date: routeData.start_date || new Date().toISOString().slice(0, 10),
    end_date: routeData.end_date || null
  }
  _data.active_routes.push(newRoute)
  _persist()
  return newRoute
}

export async function actualizarSemanaRutaActiva(routeId, nuevaSemana) {
  await _delay()
  _ensureStore()
  const idx = _data.active_routes.findIndex((r) => r.id === routeId)
  if (idx === -1) throw new Error('Ruta activa no encontrada')
  _data.active_routes[idx].current_week = parseInt(nuevaSemana, 10)
  _data.active_routes[idx].updated_at = new Date().toISOString()
  _persist()
  return { ..._data.active_routes[idx] }
}

export async function registrarProgresoIndicador(studentId, indicatorId, status, observation = '', evidenceUrl = '', sessionId = null) {
  await _delay()
  _ensureStore()
  
  const key = `${studentId}_${indicatorId}`
  _progress[key] = {
    id: _progress[key]?.id || `sprog-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    student_id: studentId,
    indicator_id: indicatorId,
    session_id: sessionId,
    status,
    observation,
    evidence_url: evidenceUrl,
    updated_at: new Date().toISOString()
  }
  
  _persistProgress()
  return { ..._progress[key] }
}

export async function obtenerProgresoGrupo(groupId, levelId = null) {
  await _delay()
  _ensureStore()
  
  // Retorna todas las calificaciones registradas mapeadas
  const list = Object.values(_progress)
  return list.reduce((acc, curr) => {
    acc[`${curr.student_id}_${curr.indicator_id}`] = curr
    return acc
  }, {})
}

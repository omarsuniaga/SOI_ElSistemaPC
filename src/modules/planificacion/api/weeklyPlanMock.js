import MOCK_WEEKLY_DATA from '../../../assets/data/mocks/acm_weekly_plans.json'

const STORAGE_KEY = 'acm_weekly_plans_demo'
const PROGRESS_STORAGE_KEY = 'student_indicator_progress_demo'
const SCHEMA_VERSION = 2

let _data = null
let _progress = {}

function _seedVersionsFromSources(data) {
  if (Array.isArray(data.curriculum_versions) && data.curriculum_versions.length > 0) {
    return data
  }

  const sources = data.curriculum_sources || []
  data.curriculum_versions = sources.map((source, idx) => ({
    id: `version-${source.id}`,
    name: `${source.title} ? v${source.version_label || idx + 1}`,
    description: source.title,
    source_id: source.id,
    weekly_plan_id: (data.weekly_plans || []).find((plan) => plan.source_id === source.id)?.id || null,
    program_id: null,
    status: source.status === 'approved' ? 'approved' : 'draft',
    is_active: source.status === 'active',
    approved_by: null,
    approved_at: source.status === 'active' ? new Date().toISOString() : null,
    source: { ...source },
  }))

  return data
}

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
    _seedVersionsFromSources(_data)
    _persist()
  } else {
    _seedVersionsFromSources(_data)
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

function _clone(value) {
  return JSON.parse(JSON.stringify(value))
}

export async function obtenerFuentesCurriculares() {
  await _delay()
  _ensureStore()
  return [..._data.curriculum_sources]
}

export async function obtenerVersionesCurriculares() {
  await _delay()
  _ensureStore()
  return [..._data.curriculum_versions]
}

export async function obtenerPlanSemanalPorNivel(levelId, instrument = 'viol?n') {
  await _delay()
  _ensureStore()
  const plan = _data.weekly_plans.find(
    (p) => p.level_id === levelId && p.instrument.toLowerCase() === instrument.toLowerCase()
  )
  return plan ? _clone(plan) : null
}

export async function obtenerPlanSemanalPorId(planId) {
  await _delay()
  _ensureStore()
  const plan = _data.weekly_plans.find((p) => p.id === planId)
  return plan ? _clone(plan) : null
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

export async function obtenerGuiaHeredadaPorClase(claseId, maestroId = null) {
  await _delay()
  _ensureStore()
  const routes = await obtenerRutasActivas(maestroId)
  const route = routes.find((r) => String(r.group_id) === String(claseId) && r.status === 'active')
  if (!route) return null
  const plan = route.weekly_plan_id
    ? _data.weekly_plans.find((p) => p.id === route.weekly_plan_id)
    : _data.weekly_plans.find((p) => p.level_id === route.level_id)
  return {
    route: _clone(route),
    plan: plan ? _clone(plan) : null,
    source: plan?.source_id || null,
  }
}

export async function publicarVersionCurricular(versionId) {
  await _delay()
  _ensureStore()
  const idx = _data.curriculum_versions.findIndex((v) => v.id === versionId)
  if (idx === -1) throw new Error('Versi?n curricular no encontrada')

  const timestamp = new Date().toISOString()
  _data.curriculum_versions = _data.curriculum_versions.map((version) => {
    if (version.id === versionId) {
      return {
        ...version,
        status: 'active',
        is_active: true,
        approved_at: timestamp,
        source: version.source ? { ...version.source, status: 'active', related_version_id: version.id } : version.source,
      }
    }
    if (version.status === 'active') {
      return { ...version, is_active: false }
    }
    return version
  })

  _data.curriculum_sources = (_data.curriculum_sources || []).map((source) => {
    const version = _data.curriculum_versions.find((v) => v.source_id === source.id && v.id === versionId)
    if (!version) return source
    return {
      ...source,
      status: 'active',
      related_version_id: version.id,
      updated_at: timestamp,
    }
  })

  _persist()
  return _clone(_data.curriculum_versions.find((v) => v.id === versionId))
}

export async function obtenerRutaActivaPorGrupo(groupId) {
  await _delay()
  _ensureStore()
  const route = _data.active_routes.find((r) => r.group_id === groupId && r.status === 'active')
  return route ? _clone(route) : null
}

export async function crearRutaActiva(routeData) {
  await _delay()
  _ensureStore()
  const newRoute = {
    id: `aroute-${Date.now()}`,
    weekly_plan_id: routeData.weekly_plan_id || routeData.weekly_plan_version_id || 'wplan-violin-n0',
    teacher_id: routeData.teacher_id || 'maestro_001',
    group_id: routeData.group_id,
    level_id: routeData.level_id || 'pnivel_001',
    program_id: routeData.program_id || null,
    area_id: routeData.area_id || null,
    instrument_id: routeData.instrument_id || null,
    module_id: routeData.module_id || null,
    phase_id: routeData.phase_id || null,
    current_week: routeData.current_week || 1,
    status: routeData.status || 'active',
    start_date: routeData.start_date || new Date().toISOString().slice(0, 10),
    end_date: routeData.end_date || null,
  }
  _data.active_routes.push(newRoute)
  _persist()
  return _clone(newRoute)
}

export async function actualizarSemanaRutaActiva(routeId, nuevaSemana) {
  await _delay()
  _ensureStore()
  const idx = _data.active_routes.findIndex((r) => r.id === routeId)
  if (idx === -1) throw new Error('Ruta activa no encontrada')
  _data.active_routes[idx].current_week = parseInt(nuevaSemana, 10)
  _data.active_routes[idx].updated_at = new Date().toISOString()
  _persist()
  return _clone(_data.active_routes[idx])
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
    updated_at: new Date().toISOString(),
  }

  _persistProgress()
  return { ..._progress[key] }
}

export async function obtenerProgresoGrupo(groupId, levelId = null) {
  await _delay()
  _ensureStore()

  const list = Object.values(_progress)
  return list.reduce((acc, curr) => {
    acc[`${curr.student_id}_${curr.indicator_id}`] = curr
    return acc
  }, {})
}

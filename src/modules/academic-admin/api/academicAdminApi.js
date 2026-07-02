import { config } from '../../../core/config/config.js'
import { supabase } from '../../../lib/supabaseClient.js'
import WEEKLY_PLAN_MOCK from '../../../assets/data/mocks/acm_weekly_plans.json'
import CLASES_MOCK from '../../../assets/data/mocks/clases.json'
import MAESTROS_MOCK from '../../../assets/data/mocks/maestros.json'
import {
  obtenerClases,
  obtenerCoberturaCurricular,
  obtenerMaestros,
} from '../../planificacion/api/planificacionAdapter.js'

const WEEKLY_PLAN_STORAGE_KEY = 'acm_weekly_plans_demo'
const WEEKLY_PLAN_SCHEMA_VERSION = 2

function ensureMockWeeklyStore() {
  try {
    const raw = localStorage.getItem(WEEKLY_PLAN_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed?.schemaVersion === WEEKLY_PLAN_SCHEMA_VERSION) return parsed
    }
  } catch {}

  const seeded = {
    ...JSON.parse(JSON.stringify(WEEKLY_PLAN_MOCK)),
    schemaVersion: WEEKLY_PLAN_SCHEMA_VERSION,
  }

  try {
    localStorage.setItem(WEEKLY_PLAN_STORAGE_KEY, JSON.stringify(seeded))
  } catch {}

  return seeded
}

function persistMockWeeklyStore(store) {
  try {
    localStorage.setItem(
      WEEKLY_PLAN_STORAGE_KEY,
      JSON.stringify({ ...store, schemaVersion: WEEKLY_PLAN_SCHEMA_VERSION }),
    )
  } catch {}
}

/**
 * Obtiene todas las rutas acadÃ©micas
 */
export async function getRoutes() {
  const { data, error } = await supabase.from('routes').select('*').order('name')

  if (error) {
    console.error('Error fetching routes:', error.message)
    throw new Error('No se pudieron cargar las rutas')
  }

  return data
}

/**
 * Obtiene las versiones de una ruta especÃ­fica
 */
export async function getRouteVersions(routeId) {
  const { data, error } = await supabase
    .from('route_versions')
    .select('*')
    .eq('route_id', routeId)
    .order('version_number', { ascending: false })

  if (error) {
    console.error('Error fetching route versions:', error.message)
    throw new Error('No se pudieron cargar las versiones de la ruta')
  }

  return data
}

/**
 * Recupera el Ã¡rbol jerÃ¡rquico completo de una versiÃ³n de ruta.
 * Optimizado para cargar Bloques -> Niveles -> Nodos -> Indicadores.
 */
export async function getAcademicTree(routeVersionId) {
  if (!routeVersionId) return []

  try {
    const { data: blocks, error: bErr } = await supabase
      .from('blocks')
      .select('*')
      .eq('route_version_id', routeVersionId)
      .order('order_index')

    if (bErr) throw bErr
    if (!blocks.length) return []

    const blockIds = blocks.map((b) => b.id)

    const { data: levels, error: lErr } = await supabase
      .from('levels')
      .select('*')
      .in('block_id', blockIds)
      .order('order_index')
    if (lErr) throw lErr

    const levelIds = levels.map((l) => l.id)

    const { data: nodes, error: nErr } = await supabase
      .from('nodes')
      .select('*')
      .in('level_id', levelIds)
      .order('order_index')
      .limit(5000)
    if (nErr) throw nErr

    const nodeIds = nodes.map((n) => n.id)

    const { data: indicators, error: iErr } = await supabase
      .from('indicators')
      .select('*')
      .in('node_id', nodeIds)
      .order('order_index')
      .limit(10000)
    if (iErr) throw iErr

    return blocks.map((block) => ({
      ...block,
      type: 'block',
      children: levels
        .filter((l) => l.block_id === block.id)
        .map((level) => ({
          ...level,
          type: 'level',
          children: nodes
            .filter((n) => n.level_id === level.id)
            .map((node) => ({
              ...node,
              type: 'node',
              children: indicators
                .filter((i) => i.node_id === node.id)
                .map((indicator) => ({
                  ...indicator,
                  type: 'indicator',
                })),
            })),
        })),
    }))
  } catch (error) {
    console.error('Error building academic tree:', error.message)
    throw new Error('Error al construir el Ã¡rbol acadÃ©mico')
  }
}

export async function getNodeResources(nodeId) {
  const { data, error } = await supabase
    .from('node_resources')
    .select('*')
    .eq('node_id', nodeId)
    .order('order_index')

  if (error) throw error
  return data
}

export async function saveNodeResource(resource) {
  const { id, ...data } = resource

  if (id) {
    const { data: updated, error } = await supabase
      .from('node_resources')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return updated
  }

  const { data: inserted, error } = await supabase
    .from('node_resources')
    .insert([data])
    .select()
    .single()

  if (error) throw error
  return inserted
}

export async function deleteNodeResource(id) {
  const { error } = await supabase.from('node_resources').delete().eq('id', id)

  if (error) throw error
  return true
}

export async function updateNode(nodeId, updates) {
  const { data, error } = await supabase
    .from('nodes')
    .update(updates)
    .eq('id', nodeId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getInstitutionalRadar() {
  const { data, error } = await supabase
    .from('view_institutional_radar')
    .select('*')
    .order('days_inactive', { ascending: false })

  if (error) {
    console.error('Error fetching institutional radar:', error.message)
    throw new Error('No se pudo cargar el radar institucional')
  }

  return data
}

export async function getNodeHotspots() {
  const { data, error } = await supabase
    .from('view_node_difficulty')
    .select('*')
    .order('failure_percentage', { ascending: false })

  if (error) {
    console.error('Error fetching node hotspots:', error.message)
    throw new Error('No se pudieron cargar los puntos calientes pedagÃ³gicos')
  }

  return data
}

export async function getStagnantStudents() {
  const { data, error } = await supabase
    .from('view_institutional_radar')
    .select('*')
    .eq('health_status', 'stagnant')
    .order('days_inactive', { ascending: false })

  if (error) {
    console.error('Error fetching stagnant students:', error.message)
    throw new Error('No se pudo cargar el reporte de alumnos estancados')
  }

  return data
}

function normalizeRouteName(plan, source) {
  return source?.title || plan?.name || plan?.id || 'Guía ACM'
}

function normalizeRouteType(plan) {
  return plan?.instrument || 'General'
}

async function getMatrixRowsDemo() {
  const store = ensureMockWeeklyStore()
  const clases = CLASES_MOCK?.clases || []
  const maestros = MAESTROS_MOCK || []
  const coverage = await obtenerCoberturaCurricular().catch(() => [])
  const coverageMap = new Map(coverage.map((row) => [String(row.clase_id), row]))

  return clases
    .filter((clase) => clase.estado !== 'inactiva')
    .map((clase) => {
      const activeRoute = (store.active_routes || []).find(
        (route) => String(route.group_id) === String(clase.id) && route.status === 'active',
      )
      const plan = (store.weekly_plans || []).find((item) => item.id === activeRoute?.weekly_plan_id)
      const source = (store.curriculum_sources || []).find((item) => item.id === plan?.source_id)
      const maestro =
        maestros.find(
          (item) =>
            String(item.id) ===
            String(clase.maestro_principal_id || clase.maestro_titular_id || clase.maestro_id),
        ) || null
      const coverageRow = coverageMap.get(String(clase.id))

      return {
        clase_id: clase.id,
        clase_nombre: clase.nombre || 'Sin nombre',
        maestro_id: maestro?.id || clase.maestro_principal_id || clase.maestro_titular_id || null,
        maestro_nombre: maestro?.nombre_completo || maestro?.nombre || 'Sin asignar',
        instrumento: clase.instrumento || 'General',
        ruta_id: activeRoute?.weekly_plan_id || null,
        ruta_nombre: plan ? normalizeRouteName(plan, source) : null,
        ruta_tipo: plan ? normalizeRouteType(plan) : null,
        ruta_estado: activeRoute?.status === 'active' ? 'activa' : activeRoute?.status || null,
        current_week: activeRoute?.current_week || null,
        tiene_plan: !!coverageRow?.tiene_plan,
        plan_estado: coverageRow?.plan_estado || null,
      }
    })
}

async function getMatrixRowsSupabase() {
  const [clases, maestros, coverage, activeRoutes, weeklyPlans, sources] = await Promise.all([
    obtenerClases(),
    obtenerMaestros(),
    obtenerCoberturaCurricular().catch(() => []),
    supabase.from('acm_active_routes').select('*').then(({ data, error }) => {
      if (error) throw error
      return data || []
    }),
    supabase.from('acm_weekly_plans').select('*').then(({ data, error }) => {
      if (error) throw error
      return data || []
    }),
    supabase.from('acm_curriculum_sources').select('*').then(({ data, error }) => {
      if (error) throw error
      return data || []
    }),
  ])

  const maestrosMap = new Map(maestros.map((m) => [String(m.id), m.nombre || m.nombre_completo]))
  const coverageMap = new Map(coverage.map((row) => [String(row.clase_id), row]))

  return (clases || [])
    .filter((clase) => clase.activo !== false && clase.estado !== 'inactiva')
    .map((clase) => {
      const activeRoute = (activeRoutes || []).find(
        (route) => String(route.group_id) === String(clase.id) && route.status === 'active',
      )
      const plan = (weeklyPlans || []).find((item) => item.id === activeRoute?.weekly_plan_id)
      const source = (sources || []).find((item) => item.id === plan?.source_id)
      const maestroId = clase.maestro_principal_id || clase.maestro_id || null
      const coverageRow = coverageMap.get(String(clase.id))

      return {
        clase_id: clase.id,
        clase_nombre: clase.nombre || 'Sin nombre',
        maestro_id: maestroId,
        maestro_nombre: maestrosMap.get(String(maestroId)) || coverageRow?.maestro_nombre || 'Sin asignar',
        instrumento: clase.instrumento || 'General',
        ruta_id: activeRoute?.weekly_plan_id || null,
        ruta_nombre: plan ? normalizeRouteName(plan, source) : null,
        ruta_tipo: plan ? normalizeRouteType(plan) : null,
        ruta_estado: activeRoute?.status === 'active' ? 'activa' : activeRoute?.status || null,
        current_week: activeRoute?.current_week || null,
        tiene_plan: !!coverageRow?.tiene_plan,
        plan_estado: coverageRow?.plan_estado || null,
      }
    })
}

export async function getPlanningAssignmentMatrix() {
  return config.isDemoMode ? getMatrixRowsDemo() : getMatrixRowsSupabase()
}

export async function listAssignableRoutes() {
  if (config.isDemoMode) {
    const store = ensureMockWeeklyStore()
    return (store.weekly_plans || []).map((plan) => {
      const source = (store.curriculum_sources || []).find((item) => item.id === plan.source_id)
      return {
        id: plan.id,
        nombre: normalizeRouteName(plan, source),
        instrumento: plan.instrument || 'General',
        nivel: plan.level_id || 'Sin nivel',
        level_id: plan.level_id || null,
        source_id: plan.source_id || null,
      }
    })
  }

  const [{ data: plans, error: plansError }, { data: sources, error: sourcesError }] = await Promise.all([
    supabase.from('acm_weekly_plans').select('*'),
    supabase.from('acm_curriculum_sources').select('*'),
  ])

  if (plansError) throw plansError
  if (sourcesError) throw sourcesError

  return (plans || []).map((plan) => {
    const source = (sources || []).find((item) => item.id === plan.source_id)
    return {
      id: plan.id,
      nombre: normalizeRouteName(plan, source),
      instrumento: plan.instrument || 'General',
      nivel: plan.level_id || 'Sin nivel',
      level_id: plan.level_id || null,
      source_id: plan.source_id || null,
    }
  })
}

export async function updateClassRouteAssignment(claseId, weeklyPlanId) {
  if (!claseId) throw new Error('Se requiere claseId')

  if (config.isDemoMode) {
    const store = ensureMockWeeklyStore()
    store.active_routes = (store.active_routes || []).map((route) =>
      String(route.group_id) === String(claseId) && route.status === 'active'
        ? { ...route, status: 'inactive', end_date: new Date().toISOString().slice(0, 10) }
        : route,
    )

    if (weeklyPlanId) {
      const clase = (CLASES_MOCK?.clases || []).find((item) => String(item.id) === String(claseId))
      const plan = (store.weekly_plans || []).find((item) => String(item.id) === String(weeklyPlanId))
      store.active_routes.push({
        id: `aroute-${Date.now()}`,
        weekly_plan_id: weeklyPlanId,
        teacher_id: clase?.maestro_principal_id || clase?.maestro_titular_id || clase?.maestro_id || null,
        group_id: claseId,
        level_id: plan?.level_id || clase?.nivel_id || 'pnivel_001',
        current_week: 1,
        status: 'active',
        start_date: new Date().toISOString().slice(0, 10),
        end_date: null,
      })
    }

    persistMockWeeklyStore(store)
    return true
  }

  const [classResponse, routesResponse] = await Promise.all([
    supabase
      .from('clases')
      .select('id, maestro_principal_id, maestro_id, nivel_id, programa_id')
      .eq('id', claseId)
      .single(),
    supabase
      .from('acm_active_routes')
      .select('id')
      .eq('group_id', claseId)
      .eq('status', 'active'),
  ])

  if (classResponse.error) throw classResponse.error
  if (routesResponse.error) throw routesResponse.error

  const clase = classResponse.data
  const activeRoutes = routesResponse.data || []
  const today = new Date().toISOString().slice(0, 10)

  if (activeRoutes.length) {
    const { error: deactivateError } = await supabase
      .from('acm_active_routes')
      .update({ status: 'inactive', end_date: today, updated_at: new Date().toISOString() })
      .in('id', activeRoutes.map((route) => route.id))
    if (deactivateError) throw deactivateError
  }

  if (!weeklyPlanId) return true

  const { data: weeklyPlan, error: planError } = await supabase
    .from('acm_weekly_plans')
    .select('id, level_id')
    .eq('id', weeklyPlanId)
    .single()
  if (planError) throw planError

  const insertPayload = {
    weekly_plan_id: weeklyPlan.id,
    teacher_id: clase.maestro_principal_id || clase.maestro_id || null,
    group_id: claseId,
    level_id: weeklyPlan.level_id || clase.nivel_id || null,
    program_id: clase.programa_id || null,
    current_week: 1,
    status: 'active',
    start_date: today,
    end_date: null,
  }

  const { error: insertError } = await supabase.from('acm_active_routes').insert(insertPayload)
  if (insertError) throw insertError

  return true
}

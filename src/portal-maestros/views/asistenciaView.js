import { supabase } from '../../lib/supabaseClient.js'
import { getMaestroLocal } from '../auth/maestroAuth.js'
import { escHTML } from '../utils/portalUtils.js'
import { announce } from '../utils/a11yUtils.js'
import { enqueue, getQueueCount } from '../services/offlineQueue.js'
import { createSyncQueueBadge } from '../components/SyncQueueBadge.js'

import {
  improveText,
  structureTextToDSL,
} from '../services/groqService.js'
import { createEvaluationDrawer } from '../components/EvaluationDrawer.js'
import { createImproveTextModal } from '../components/improveTextModal.js'
import { createGenerarInformeModal } from '../components/improveTextModal.js'
import { createStructureModal } from '../components/structureModal.js'
import {
  getMisClases,
  getHorariosClases,
  getInscripcionesClases,
  getSalones,
  getRutasMaestro,
  invalidateClasesCache,
} from '../services/maestroDataService.js'
import { AsistenciaTour } from '../components/AsistenciaTour.js'
import { AppToast } from '../../shared/components/AppToast.js'
import { invalidateView as navInvalidateView } from '../services/navigationHooks.js'
import { createStudentProgressPanel } from '../components/studentProgressPanel.js'
import { createSessionSummaryPanel } from '../components/SessionSummaryPanel.js'
import { consumeRutaTema } from '../services/rutaTopicStore.js'
import {
  guardarJustificacion,
  obtenerJustificacion,
  eliminarJustificacion,
} from '../services/justificacionService.js'
import { registrarAsistenciaBulk } from '../../modules/asistencias/api/asistenciasApi.js'
import { createAsyncMutex } from '../../shared/utils/asyncMutex.js'
import { analyzeObservation } from '../services/groqService.js'
import { saveProgressFromAI, linkProgresosToObjetivos } from '../services/progressAggregatorService.js'

/**
 * Wraps an async function with consistent error handling.
 * Logs to console and shows AppToast on failure.
 * Returns null on error instead of throwing.
 */
async function safeAsync(fn, { onError, silent = false } = {}) {
  try {
    return await fn()
  } catch (err) {
    console.error('[safeAsync]', err)
    if (onError) {
      onError(err)
    } else if (!silent) {
      if (typeof AppToast !== 'undefined' && AppToast) {
        AppToast.error('Error inesperado: ' + (err.message || err))
      }
    }
    return null
  }
}
import { createProgressPreviewPanel } from '../components/ProgressPreviewPanel.js'
import { fetchInsights } from '../services/progressInsightService.js'
import { proposeCurriculum } from '../services/groqService.js'
import { createCurriculumProposalPanel } from '../components/CurriculumProposalPanel.js'
import { adoptarPropuesta } from '../../modules/planificacion/api/curriculoApi.js'
import { fetchNotificaciones } from '../services/notificationService.js'
import {
  inferirTipoClase,
  generarReporteTexto,
  abrirEnlaceConLimite,
} from '../utils/asistenciaHelpers.js'
import { createAttendanceHeader } from '../components/attendance/AttendanceHeader.js'
import { createRouteTopicAutoInjector } from '../components/attendance/RouteTopicAutoInjector.js'
import { createPlanificationCard } from '../components/attendance/PlanificationCard.js'
import { createDslSection } from '../components/attendance/DslSection.js'
import { createBulkActions } from '../components/attendance/BulkActions.js'
import { createAutoDraftManager } from '../components/attendance/AutoDraftManager.js'
import { createJustifModalManager } from '../components/attendance/JustifModalManager.js'
import { createStudentList } from '../components/attendance/StudentList.js'
import { createObservationSaveButton } from '../components/attendance/ObservationSaveButton.js'
import {
  generateDailyReport,
  generateMonthlyAttendance,
  generateMonthlyPedagogical,
} from '../services/reportService.js'

/**
 * Vista Asistencia Optimizada (F3+): toma de asistencia con micro-interacciones.
 *
 * Accepts either a DOM element or a string container ID as first argument.
 * When claseId and fecha are provided, loads the class directly via obtenerAsistenciaClase.
 */
/**
 * Renderiza una sesión emergente (sin clase_id) en la vista de asistencia.
 * Carga la sesión por ID, construye un objeto clase sintético desde
 * el campo `actividad`, y extrae los alumnos del campo `asistencia` (jsonb).
 */
async function _renderEmergenteSesion(container, { sesionId, fecha, maestro, router }) {
  try {
    const { data: sesion, error } = await supabase
      .from('sesiones_clase')
      .select('*')
      .eq('id', sesionId)
      .single()

    if (error || !sesion) {
      container.innerHTML = `<p class="pm-empty">Sesión no encontrada.</p>`
      return
    }

    const hoy = new Date()
    const localToday = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`
    const fechaHoy = fecha || sesion.fecha || localToday
    const clase = {
      id: sesionId,
      nombre: sesion.actividad || 'Clase Emergente',
      instrumento: '',
    }

    localStorage.setItem('pm_active_clase_id', sesionId)

    // Extraer IDs del jsonb asistencia
    const asistenciaData = Array.isArray(sesion.asistencia) ? sesion.asistencia : []
    const alumnoIds = asistenciaData.map((a) => a.alumno_id).filter(Boolean)

    let alumnos = []
    if (alumnoIds.length > 0) {
      const { data: alumnosData } = await supabase
        .from('alumnos')
        .select('id, nombre_completo, instrumento_principal')
        .in('id', alumnoIds)
      alumnos = alumnosData || []
    }

    const estado = {}
    const justificaciones = {}
    alumnos.forEach((a) => {
      estado[a.id] = null
    })

    // Restaurar estados guardados en la sesión
    asistenciaData.forEach((item) => {
      if (item.estado && alumnos.some((a) => a.id === item.alumno_id)) {
        estado[item.alumno_id] = item.estado
      }
    })

    const cleanup = _renderVista(container, {
      clase,
      horario: null,
      alumnos,
      estado,
      justificaciones,
      maestro,
      fechaHoy,
      claseId: null,
      sesionId,
      hasConflict: false,
      serverDSL: sesion.contenido || '',
      snapshots: [],
      salonNombre: null,
      rutaId: null,
      sesionExistenteData: sesion,
      router,
    })

    return typeof cleanup === 'function' ? cleanup : undefined
  } catch (err) {
    console.error('[asistenciaView] Error en sesión emergente:', err.message, err.stack)
    container.innerHTML = `<p class="pm-empty" style="color:var(--pm-danger)">Error: ${escHTML(err.message)}</p>`
  }
}

export async function renderAsistenciaView(
  containerOrId,
  { claseId, fecha, sesionId, router } = {},
) {
  // Resolve container: accept both DOM element and string ID
  const container =
    typeof containerOrId === 'string' ? document.getElementById(containerOrId) : containerOrId

  if (!container) {
    console.error('[asistenciaView] Container not found:', containerOrId)
    return
  }

  container.innerHTML = `<div class="pm-loading"><div class="pm-spinner"></div></div>`

  const maestro = getMaestroLocal()
  if (!maestro) {
    container.innerHTML = `<p class="pm-empty">No hay sesión activa.</p>`
    return
  }

  if (!claseId) {
    if (sesionId) {
      return _renderEmergenteSesion(container, { sesionId, fecha, maestro, router })
    }
    container.innerHTML = `<p class="pm-empty">No se indicó la clase.</p>`
    return
  }

  // Persistir clase activa para otros módulos (ej: Planificación)
  localStorage.setItem('pm_active_clase_id', claseId)

  const hoy = new Date()
  const localToday = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`
  const fechaHoy = fecha || localToday

  try {
    const diaHoy = hoy.toLocaleDateString('es-ES', { weekday: 'long' }).toLowerCase()

    // ── Batch 1: datos cacheados (instantáneos si hoyView ya cargó) + sesión en paralelo ──
    const [misClases, todosHorarios, todasInscripciones, sesionRes] = await Promise.all([
      getMisClases(), // cache: 1min
      getHorariosClases([claseId]), // cache: 5min
      getInscripcionesClases([claseId]), // cache: 2min
      // Traer TODAS las sesiones del día para consolidar asistencia.
      // Es posible que existan dos registros: uno registrado (borrador=false, asistencia vacía)
      // y uno borrador (borrador=true, con la asistencia real). Consolidamos ambos.
      supabase
        .from('sesiones_clase')
        .select('*')
        .eq('clase_id', claseId)
        .eq('maestro_id', maestro.id)
        .eq('fecha', fechaHoy)
        .order('borrador', { ascending: true })   // registradas primero
        .order('updated_at', { ascending: false }), // más reciente primero dentro de cada grupo
    ])
    const clase = misClases.find((c) => c.id === claseId)
    if (!clase) {
      container.innerHTML = `<p class="pm-empty" style="color:var(--pm-danger)">Clase no encontrada.</p>`
      return
    }

    const horario = todosHorarios.find((h) => h.dia?.toLowerCase() === diaHoy)

    let alumnos = (todasInscripciones || [])
      .map((i) => i.alumnos)
      .filter(Boolean)
      .sort((a, b) => {
        const cmp1 = (a.instrumento_principal || '').localeCompare(b.instrumento_principal || '')
        if (cmp1 !== 0) return cmp1
        return (a.nombre_completo || '').localeCompare(b.nombre_completo || '')
      })

    // Primary session: prefer registered (borrador=false), fallback to most-recent draft
    const todasSesionesHoy = sesionRes.data || []
    const sesionExistenteData = todasSesionesHoy[0] || null

    // Merge asistencia from ALL sessions of the day — the registered session may have
    // empty asistencia[] while a borrador session holds the actual attendance data.
    const asistenciaMerged = (() => {
      const merged = new Map()
      // Iterate all sessions (drafts after registered, so registered wins on conflict)
      for (const s of [...todasSesionesHoy].reverse()) {
        if (Array.isArray(s.asistencia)) {
          s.asistencia.forEach((item) => {
            if (item?.alumno_id) merged.set(item.alumno_id, item.estado)
          })
        }
      }
      return [...merged.entries()].map(([alumno_id, estado]) => ({ alumno_id, estado }))
    })()
    const selectedEmergentStudentIds = Array.isArray(sesionExistenteData?.asistencia)
      ? sesionExistenteData.asistencia.map((item) => item?.alumno_id).filter(Boolean)
      : []
    if (sesionExistenteData?.tipo === 'emergente' && selectedEmergentStudentIds.length > 0) {
      const selectedSet = new Set(selectedEmergentStudentIds)
      const loadedIds = new Set(alumnos.map((a) => a.id))
      const missingIds = selectedEmergentStudentIds.filter((id) => !loadedIds.has(id))
      if (missingIds.length > 0) {
        try {
          const { data: alumnosExtra } = await supabase
            .from('alumnos')
            .select('id, nombre_completo, instrumento_principal')
            .in('id', missingIds)
          alumnos = alumnos.concat(alumnosExtra || [])
        } catch (_e) {
          console.warn('[asistencia] No se pudieron cargar alumnos extra de clase emergente:', _e)
        }
      }
      alumnos = alumnos.filter((a) => selectedSet.has(a.id))
    }

    const sesionId = sesionExistenteData?.id || null
    const serverUpdatedAt = sesionExistenteData?.updated_at || null
    const serverDSL = sesionExistenteData?.contenido || ''

    // ── Batch 2: snapshots + salón (en paralelo) ──
    const salonIds = clase.salon ? [clase.salon] : []
    const [snapshots, salonesData] = await Promise.all([
      sesionId
        ? supabase
          .from('class_session_content_snapshots')
          .select('*')
          .eq('session_id', sesionId)
          .then((r) => r.data || [])
        : Promise.resolve([]),
      salonIds.length > 0 ? getSalones(salonIds) : Promise.resolve([]), // cache: 1hr
    ])
    const salonNombre = salonesData.length > 0 ? salonesData[0].nombre : null

    // Detectar conflicto
    const localKey = `pm_asistencia_${claseId || sesionId}_${fechaHoy}`
    const localUpdatedAt = localStorage.getItem(`${localKey}_updated`)
    let hasConflict = false
    if (serverUpdatedAt && localUpdatedAt) {
      const serverTs = new Date(serverUpdatedAt).getTime()
      const localTs = new Date(localUpdatedAt).getTime()
      if (serverTs > localTs + 5000) hasConflict = true
    }

    // ── Resolve route_version_id for the class via instrumento ──
    let rutaId = null
    try {
      // clases.instrumento may be "Violín", "Violines", "Violín, Viola", etc.
      // routes.instrument is lowercase "violín"
      // Strategy: normalize clase instrumento, match first word against routes
      const claseRow = misClases?.find((c) => c.id === claseId)
      const instrumento = claseRow?.instrumento
      if (instrumento) {
        const primerInstrumento = instrumento.split(',')[0].trim().toLowerCase()
        const { data: routeData } = await supabase
          .from('routes')
          .select('id, route_versions!inner(id)')
          .ilike('instrument', `%${primerInstrumento}%`)
          .eq('route_versions.status', 'published')
          .limit(1)
          .maybeSingle()
        rutaId = routeData?.route_versions?.[0]?.id || routeData?.route_versions?.id || null
      }
    } catch (_e) {
      console.warn('[asistencia] No se pudo resolver route_version_id:', _e)
    }

    // === Estado local ===
    const estado = {}
    const justificaciones = {}
    alumnos.forEach((a) => {
      estado[a.id] = null
    })

    // Si hay sesión guardada, restaurar estados de asistencia
    // Source 1: JSONB consolidado de TODAS las sesiones del día.
    // La sesión registrada puede tener asistencia=[] mientras el borrador tiene los datos reales.
    let serverAsistencia = asistenciaMerged

    const _DB_TO_UI = { presente: 'P', ausente: 'A', justificado: 'J', tarde: 'T' }

    // Source 2: asistencias table — query by sesion_clase_id first, then clase_id+fecha fallback.
    // This covers: records saved before sesion_clause_id was added, offline saves, and any
    // case where the JSONB field is empty despite having DB records.
    if (serverAsistencia.length === 0) {
      try {
        // 2a: by ALL sesion_ids from today (covers split-session scenario where
        // the registered session has asistencia=[] but a borrador session holds the data)
        let asistenciasDB = null
        const allSesionIds = todasSesionesHoy.map((s) => s.id).filter(Boolean)
        if (allSesionIds.length > 0) {
          const { data } = await supabase
            .from('asistencias')
            .select('alumno_id, estado')
            .in('sesion_clase_id', allSesionIds)
          asistenciasDB = data
        }

        // 2b: fallback by clase_id + fecha (catches records without sesion_clase_id)
        if ((!asistenciasDB || asistenciasDB.length === 0) && claseId && fechaHoy) {
          const { data } = await supabase
            .from('asistencias')
            .select('alumno_id, estado')
            .eq('clase_id', claseId)
            .eq('fecha', fechaHoy)
          asistenciasDB = data
        }

        if (asistenciasDB?.length > 0) {
          serverAsistencia = asistenciasDB.map((a) => ({
            alumno_id: a.alumno_id,
            estado: _DB_TO_UI[a.estado] ?? a.estado,
          }))
        }
      } catch (_e) {
        console.warn('[asistencia] No se pudo restaurar desde tabla asistencias:', _e)
      }
    }


    // Normalize any full DB values back to UI abbreviations (reuse _DB_TO_UI map)
    serverAsistencia.forEach((item) => {
      if (Object.prototype.hasOwnProperty.call(estado, item.alumno_id)) {
        const estadoNorm = _DB_TO_UI[item.estado] ?? item.estado
        estado[item.alumno_id] = estadoNorm
      }
    })

    // Restaurar estados "J" desde justificaciones (fuente de verdad para justificación)
    let justificacionesRegistradas = []
    if (sesionId) {
      try {
        justificacionesRegistradas = await supabase
          .from('justificaciones')
          .select('alumno_id')
          .eq('sesion_id', sesionId)
          .then((r) => r.data || [])
        justificacionesRegistradas.forEach((j) => {
          if (Object.prototype.hasOwnProperty.call(estado, j.alumno_id)) {
            estado[j.alumno_id] = 'J'
          }
        })
      } catch (_e) {
        console.warn('[asistencia] No se pudieron restaurar justificaciones:', _e)
      }
    }

    // === Render ===
    _renderVista(container, {
      clase,
      horario,
      alumnos,
      estado,
      justificaciones,
      maestro,
      fechaHoy,
      claseId,
      sesionId,
      hasConflict,
      serverDSL,
      snapshots,
      salonNombre,
      rutaId,
      sesionExistenteData,
      router,
    })
  } catch (err) {
    console.error('[asistenciaView] Error fatal:', err.message, err.stack)
    container.innerHTML = `<p class="pm-empty" style="color:var(--pm-danger)">Error: ${escHTML(err.message)}</p>`
  }
}

function _renderVista(container, ctx) {
  const {
    clase,
    horario,
    alumnos,
    estado,
    justificaciones,
    maestro,
    fechaHoy,
    claseId,
    snapshots,
    serverDSL,
    hasConflict,
    salonNombre,
    rutaId,
    sesionExistenteData,
    router,
  } = ctx
  let sesionId = ctx.sesionId
  let isSessionRegistered =
    Boolean(ctx.sesionId) &&
    (sesionExistenteData?.borrador === false ||
      sesionExistenteData?.estado === 'registrada' ||
      sesionExistenteData?.estado === 'cerrada')

  const navigateTo = (route) => {
    if (router?.navigate) {
      router.navigate(route)
      return
    }
    window.location.hash = `#/${route}`
  }

  // Cleanup registry — all destroyable sub-components register here
  const _cleanups = []
  const localKey = `pm_asistencia_${claseId || sesionId}_${fechaHoy}`
  let dslContent = serverDSL
  let _saveTimer = null
  const _saveMutex = createAsyncMutex()
  let planificationCard = null
  let _summaryPanel = null

  // Local CSS for badges with high contrast
  if (!document.getElementById('pm-asist-badge-styles')) {
    const badgeStyle = document.createElement('style')
    badgeStyle.id = 'pm-asist-badge-styles'
    badgeStyle.textContent = `
      .pm-badge { 
        display: inline-flex; align-items: center; justify-content: center;
        padding: 0.25rem 0.6rem; border-radius: 20px; font-size: 0.7rem; font-weight: 700; 
        background: var(--pm-primary-light, rgba(59,130,246,0.15)); color: var(--pm-primary, #3b82f6);
        white-space: nowrap; border: 1px solid rgba(59,130,246,0.3);
      }
      .pm-badge-warning { background: rgba(245,158,11,0.15); color: #d97706; border-color: rgba(245,158,11,0.3); }
      .pm-badge-danger { background: rgba(239,68,68,0.15); color: #dc2626; border-color: rgba(239,68,68,0.3); }
      .pm-badge-muted { background: var(--pm-surface-2, #374151); color: #e5e7eb; border-color: rgba(255,255,255,0.2); }
      [data-theme="light"] .pm-badge-muted { background: #e5e7eb; color: #374151; border-color: #d1d5db; }
    `
    document.head.appendChild(badgeStyle)
  }

  container.innerHTML = `
    <style>
      .pm-asist-header { 
        display: flex; align-items: center; gap: 1rem;
        background: linear-gradient(135deg, var(--pm-primary), #1d4ed8); 
        color: white; 
        padding: 1.25rem 1.25rem 2.25rem 1.25rem; 
        border-bottom-left-radius: 28px; 
        border-bottom-right-radius: 28px;
        margin-bottom: 1.5rem;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        position: relative;
        z-index: 10;
        width: 100%;
      }
      .pm-asist-title { margin: 0; font-size: 1.2rem; font-weight: 800; letter-spacing: -0.02em; color: #fff; }
      .pm-asist-subtitle { margin: 4px 0 0; font-size: 0.75rem; opacity: 0.85; font-weight: 500; color: rgba(255, 255, 255, 0.9); }
      .pm-asist-bulk-circles { display: flex; gap: 0.75rem; align-items: center; }
      .pm-bulk-circle {
        width: 34px; height: 34px; border-radius: 50%; border: 2px solid currentColor;
        display: flex; align-items: center; justify-content: center;
        font-weight: 800; font-size: 0.9rem; cursor: pointer; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        background: rgba(255, 255, 255, 0.1);
      }
      .pm-bulk-circle.p { color: #4ade80; border-color: rgba(74, 222, 128, 0.4); }
      .pm-bulk-circle.a { color: #f87171; border-color: rgba(248, 113, 113, 0.4); }
      .pm-bulk-circle:hover { transform: scale(1.1); background: currentColor; color: var(--pm-surface-2); }
      .pm-asist-nombre { cursor: pointer; text-decoration: underline dotted; text-underline-offset: 3px; }
      .pm-asist-nombre:hover { color: var(--pm-primary); }
      .pm-copy-plan-btn {
        display: inline-flex; align-items: center; gap: 0.35rem;
        padding: 0.35rem 0.75rem; border-radius: 20px;
        border: 1px solid var(--pm-border, rgba(255,255,255,0.15));
        background: var(--pm-surface-2, #374151); color: var(--pm-text-muted, #9ca3af);
        font-size: 0.7rem; font-weight: 600; cursor: pointer; transition: all 0.2s;
      }
      .pm-copy-plan-btn:hover { background: var(--pm-primary); color: #fff; border-color: var(--pm-primary); }
      [data-theme="light"] .pm-copy-plan-btn { background: #f3f4f6; color: #6b7280; border-color: #d1d5db; }
      [data-theme="light"] .pm-copy-plan-btn:hover { background: var(--pm-primary); color: #fff; border-color: var(--pm-primary); }
      .pm-route-selector-wrap {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.6rem 1rem;
        background: var(--pm-surface-2, #374151);
        border: 1px solid var(--pm-border, rgba(255,255,255,0.15));
        border-radius: 12px;
        margin: 0 1rem 1rem;
      }
      /* Contenedor de la lista para dar aire lateral */
      .pm-asist-alumnos-container {
        padding: 0 1rem 2rem;
      }
      .pm-route-selector-label {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        font-size: 0.75rem;
        font-weight: 700;
        color: var(--pm-text-muted, #9ca3af);
        white-space: nowrap;
      }
      .pm-route-selector {
        flex: 1;
        padding: 0.35rem 0.75rem;
        border-radius: 20px;
        border: 1px solid var(--pm-border, rgba(255,255,255,0.2));
        background: var(--pm-surface, #2d3748);
        color: var(--pm-text, #e5e7eb);
        font-size: 0.8rem;
        font-weight: 600;
        cursor: pointer;
        appearance: none;
        -webkit-appearance: none;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 16 16'%3E%3Cpath fill='%239ca3af' d='M4 6l4 4 4-4'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 0.75rem center;
        padding-right: 2rem;
      }
      .pm-route-selector:focus {
        outline: none;
        border-color: var(--pm-primary, #007aff);
        box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.2);
      }
      [data-theme="light"] .pm-route-selector-wrap { background: #f9fafb; border-color: #e5e7eb; }
      [data-theme="light"] .pm-route-selector { background: #fff; color: #374151; border-color: #d1d5db; }
      [data-theme="light"] .pm-route-selector-label { color: #6b7280; }

      /* ── Planificacion Card Premium (Glassmorphism) ── */
      .pm-planificacion-card {
        background: rgba(var(--pm-surface-rgb, 30, 41, 59), 0.7);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 20px;
        margin: 1rem;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        overflow: hidden;
      }
      .pm-planificacion-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1.25rem 1.5rem;
        cursor: pointer;
        transition: all 0.3s ease;
      }
      .pm-planificacion-header:hover { background: rgba(255, 255, 255, 0.05); }
      .pm-planificacion-header-left { display: flex; align-items: center; gap: 1rem; }
      .pm-planificacion-icon-box {
        width: 42px; height: 42px; background: linear-gradient(135deg, var(--pm-primary), #60a5fa);
        border-radius: 12px; display: flex; align-items: center; justify-content: center;
        font-size: 1.4rem; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
      }
      .pm-planificacion-info { display: flex; flex-direction: column; }
      .pm-planificacion-label { font-size: 0.65rem; font-weight: 800; color: var(--pm-primary); text-transform: uppercase; letter-spacing: 1px; }
      .pm-planificacion-nombre { font-size: 1.1rem; font-weight: 700; color: #fff; margin-top: 2px; }
      
      .pm-planificacion-actions { display: flex; align-items: center; gap: 0.75rem; }
      .pm-btn-circle {
        width: 36px; height: 36px; border-radius: 50%; background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.1); color: #fff; display: flex;
        align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s;
      }
      .pm-btn-circle:hover { background: var(--pm-primary); border-color: var(--pm-primary); transform: rotate(45deg); }
      
      .pm-planificacion-dropdown {
        padding: 0 1.5rem 1.5rem;
        border-top: 1px solid rgba(255, 255, 255, 0.05);
      }
      .pm-planificacion-tabs-pill {
        display: flex; background: rgba(0, 0, 0, 0.2); padding: 4px;
        border-radius: 30px; margin: 1.5rem 0; border: 1px solid rgba(255, 255, 255, 0.05);
      }
      .pm-plan-tab-pill {
        flex: 1; padding: 0.6rem; border: none; background: none; color: var(--pm-text-muted);
        font-size: 0.8rem; font-weight: 700; cursor: pointer; border-radius: 25px; transition: all 0.3s;
      }
      .pm-plan-tab-pill.active { background: var(--pm-primary); color: #fff; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); }
      
      .pm-plan-list { max-height: 250px; overflow-y: auto; padding-right: 5px; }
      .pm-plan-item {
        display: flex; align-items: center; gap: 0.75rem; padding: 0.85rem 1rem;
        border-radius: 12px; margin-bottom: 0.5rem; background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.05); cursor: pointer; transition: all 0.2s;
      }
      .pm-plan-item:hover { background: rgba(255, 255, 255, 0.08); transform: translateX(5px); }
      .pm-plan-item.active { border-color: var(--pm-primary); background: rgba(59, 130, 246, 0.1); }
      .pm-plan-item-icon { font-size: 1.1rem; }
      .pm-plan-item-name { flex: 1; font-weight: 600; font-size: 0.9rem; }
      [data-theme="light"] .pm-planificacion-card { background: #fff; border-color: #e5e7eb; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
      [data-theme="light"] .pm-planificacion-header:hover { background: #f9fafb; }
      [data-theme="light"] .pm-planificacion-dropdown { background: #f9fafb; }
      [data-theme="light"] .pm-plan-item:hover { background: rgba(0,122,255,0.05); }

      .pm-active-tema-badge {
        font-size: 0.75rem;
        background: rgba(59, 130, 246, 0.15);
        color: var(--pm-primary);
        padding: 3px 10px;
        border-radius: 12px;
        margin-top: 5px;
        display: inline-block;
        font-weight: 600;
        border: 1px solid rgba(59, 130, 246, 0.3);
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .pm-route-tree-dropdown-box {
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px dashed rgba(255, 255, 255, 0.1);
        max-height: 350px;
        overflow-y: auto;
        padding-right: 5px;
      }
      /* Scrollbar minimalista para el árbol */
      .pm-route-tree-dropdown-box::-webkit-scrollbar { width: 4px; }
      .pm-route-tree-dropdown-box::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
      [data-theme="light"] .pm-active-tema-badge {
        background: rgba(0, 122, 255, 0.08);
        border-color: rgba(0, 122, 255, 0.2);
      }
      [data-theme="light"] .pm-route-tree-dropdown-box {
        border-top-color: #e5e7eb;
      }
      /* Estilos del tour movidos a AsistenciaTour.js */
      .pm-asist-actions-fixed {
        position: fixed;
        bottom: 80px; /* Por encima del menú inferior */
        left: 0; right: 0;
        padding: 0.75rem 1rem;
        background: rgba(var(--pm-bg-rgb), 0.8);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        display: flex;
        gap: 0.75rem;
        z-index: 1000;
        border-top: 1px solid rgba(255,255,255,0.05);
        box-shadow: 0 -10px 30px rgba(0,0,0,0.2);
      }
      .pm-asist-btn-obs {
        flex: 1;
        background: var(--pm-surface-2);
        color: var(--pm-text);
        border: 1px solid var(--pm-border);
        padding: 0.75rem;
        border-radius: 12px;
        font-weight: 600;
        font-size: 0.85rem;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        cursor: pointer;
        transition: all 0.2s;
      }
      .pm-asist-btn-save {
        flex: 1.5;
        background: var(--pm-primary);
        color: #fff;
        border: none;
        padding: 0.75rem;
        border-radius: 12px;
        font-weight: 700;
        font-size: 0.9rem;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        cursor: pointer;
        box-shadow: 0 4px 15px rgba(var(--pm-primary-rgb), 0.3);
        transition: all 0.2s;
      }
      .pm-asist-btn-obs:active, .pm-asist-btn-save:active { transform: scale(0.96); }

      /* ═════════════════════════════════════════════════════════════
         MOBILE OPTIMIZATION — max-width: 767px
         ═════════════════════════════════════════════════════════════ */
      @media (max-width: 767px) {
        /* ── Reduce overall padding/margins for compact layout ── */
        .pm-asist-header {
          padding: 1rem 1rem 1.5rem 1rem;
          margin-bottom: 1rem;
        }

        .pm-asist-alumnos-container {
          padding: 0 0.75rem 1.5rem 0.75rem;
        }

        .pm-route-selector-wrap {
          margin: 0 0.75rem 0.75rem 0.75rem;
          padding: 0.5rem 0.75rem;
        }

        /* ── DSL Editor: larger for more writing space ── */
        .pm-dsl-editor-container {
          min-height: 220px;
        }

        .pm-dsl-editable {
          min-height: 220px;
          padding: 0.85rem;
          font-size: 0.9rem;
        }

        .pm-dsl-placeholder {
          font-size: 0.75rem;
          line-height: 1.3;
          opacity: 0.7;
        }

        .pm-dsl-placeholder-title {
          font-size: 0.8rem;
          margin-bottom: 0.3rem;
        }

        .pm-dsl-placeholder-example {
          margin-bottom: 0.3rem;
          gap: 0.25rem;
        }

        .pm-dsl-placeholder-guide {
          font-size: 0.7rem;
        }

        /* ── Toolbar: compact buttons ── */
        .dsl-toolbar {
          flex-wrap: wrap;
          gap: 0.4rem;
          padding: 0.5rem;
        }

        .pm-dsl-tool-btn {
          padding: 0.45rem 0.5rem;
          font-size: 0.75rem;
          flex: 0 1 auto;
          min-width: fit-content;
        }

        .pm-dsl-tool-btn.ai {
          font-size: 0.7rem;
          padding: 0.4rem 0.6rem;
        }

        /* ── Actions bar: adjust for mobile nav ── */
        .pm-asist-actions-fixed {
          bottom: 65px;
          padding: 0.6rem 0.75rem;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .pm-asist-btn-obs,
        .pm-asist-btn-save {
          padding: 0.6rem 0.5rem;
          font-size: 0.8rem;
          border-radius: 8px;
          min-height: 40px;
        }

        .pm-asist-btn-obs i,
        .pm-asist-btn-save i {
          font-size: 1rem;
        }

        /* ── Planificación card: collapse some info ── */
        .pm-planificacion-card {
          margin: 0.75rem;
        }

        .pm-planificacion-header {
          padding: 1rem 1.25rem;
        }

        .pm-planificacion-info {
          min-width: 0;
        }

        .pm-planificacion-nombre {
          font-size: 1rem;
        }

        /* ── Hide non-essential sections to save space ── */
        .pm-route-tree-dropdown-box {
          max-height: 200px;
        }

        /* ── Reduce section margins ── */
        .pm-asist-dsl-section {
          margin-top: 1.25rem !important;
          padding: 0 0.75rem;
        }

        .pm-asist-section-title {
          font-size: 1rem;
          margin-bottom: 0.75rem;
        }

        /* ── Optimize list items spacing ── */
        .pm-asist-item {
          margin-bottom: 0.45rem;
          padding: 0.65rem;
        }

        .pm-asist-nombre {
          font-size: 0.95rem;
        }

        .pm-asist-instrumento {
          font-size: 0.75rem;
        }
      }
    </style>

    <!-- Tour inyectado por AsistenciaTour.js -->

    <div class="pm-asist-root pm-animate-fade-in" style="position:relative; min-height:100vh; padding: 0;">
      <div id="pm-attendance-header"></div>

      <div class="pm-asist-content" style="padding: 0 1rem 160px;">
        <div class="pm-asist-progress-wrap" id="pm-progress-wrap" style="display:none; margin: 1rem 0;">
          <div class="pm-asist-progress-bar">
            <div class="pm-asist-progress-fill" id="pm-progress-fill"></div>
          </div>
          <span class="pm-asist-progress-label" id="pm-progress-label">0/${alumnos.length}</span>
        </div>

        <div id="pm-asist-announce" role="status" aria-live="polite" aria-atomic="true" class="pm-visually-hidden"></div>

        <div id="pm-alumnos-list" class="pm-alumnos-queue"></div>

        <div id="pm-planificacion-card" class="pm-planificacion-card" style="display:none; margin: 1rem 0;">
        <div id="pm-planificacion-header" class="pm-planificacion-header">
          <div class="pm-planificacion-header-left">
            <div class="pm-planificacion-icon-box">🗺️</div>
            <div class="pm-planificacion-info">
              <div class="pm-planificacion-label">Planificación Académica</div>
              <div id="pm-planificacion-nombre" class="pm-planificacion-nombre">Cargando...</div>
              <div id="pm-active-tema-badge" class="pm-active-tema-badge" style="display:none;"></div>
            </div>
          </div>
          <div class="pm-planificacion-actions">
            <button id="btn-manage-planning" class="pm-btn-circle" title="Ajustar Estructura">
              <i class="bi bi-gear-fill"></i>
            </button>
            <i class="bi bi-chevron-down pm-planificacion-toggle-btn"></i>
          </div>
        </div>
        <div id="pm-planificacion-dropdown" class="pm-planificacion-dropdown" style="display:none;">
          <div class="pm-planificacion-tabs-pill">
            <button class="pm-plan-tab-pill active" data-tab="rutas">Mis Rutas</button>
            <button class="pm-plan-tab-pill" data-tab="planificaciones">Biblioteca</button>
          </div>
          <div id="pm-plan-list-rutas" class="pm-plan-list"></div>
          <div id="pm-plan-list-planificaciones" class="pm-plan-list" style="display:none;"></div>
          
          <!-- EL ARBOL AHORA VIVE AQUI DENTRO -->
          <div id="pm-route-tree-container" class="pm-route-tree-dropdown-box"></div>
          <div id="pm-curriculo-proposal-trigger" style="padding:0.5rem 0.75rem 0.75rem;">
            <button class="pm-btn pm-btn-outline" id="btn-proponer-curriculo" style="width:100%;font-size:0.82rem;">
              <i class="bi bi-stars"></i> Proponer plan curricular con IA
            </button>
          </div>
        </div>
      </div>

      <div class="pm-asist-dsl-section" style="margin-top:2rem;">
        <h3 class="pm-asist-section-title"><i class="bi bi-stars"></i> Registro de Clase</h3>
        <div id="pm-dsl-toolbar-container" style="margin-bottom:0.5rem;"></div>
        <div id="pm-dsl-editor-container"></div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-top:0.5rem;">
          <div id="pm-draft-indicator" style="display:none; padding:0.25rem 0.5rem; font-size:0.75rem; color:var(--pm-text-muted);"></div>
          <button class="pm-copy-plan-btn" id="btn-copy-as-plan" title="Copiar este contenido como borrador de planificación">
            <i class="bi bi-clipboard-plus"></i> Copiar como planificación
          </button>
        </div>
      </div>

      <div id="pm-academic-tools" style="margin-top:1.5rem; display:none;"></div>

      <!-- Barra de Acciones Fija (Por encima del menú inferior) -->
      <div class="pm-asist-actions-fixed">
        <button id="btn-guardar-obs" class="pm-asist-btn-obs" style="display:none;">
          <i class="bi bi-chat-left-text"></i> Observación
        </button>
        <button id="btn-guardar" class="pm-asist-btn-save">
          <i class="bi bi-cloud-upload"></i> Guardar sesión
        </button>
      </div>
    </div> <!-- Fin pm-asist-content -->
    </div>

    <!-- Modales... -->
  `

  // ── Attendance Header ──
  const headerContainer = container.querySelector('#pm-attendance-header')
  const headerComp = createAttendanceHeader(headerContainer, {
    clase,
    horario,
    salonNombre,
    fechaHoy,
    totalAlumnos: alumnos.length,
    hasConflict,
    onBack: () => {
      tour.destroy()
      try {
        _justifModal.close()
      } catch (_) { }
      _cleanups.forEach((fn) => {
        try { fn() } catch (_) { }
      })
      navigateTo('hoy')
    },
  })
  _cleanups.push(() => headerComp.destroy())

  // ── Sync queue badge ──
  const badgeContainer = container.querySelector('#pm-sync-badge-container')
  if (badgeContainer) {
    const badge = createSyncQueueBadge()
    badgeContainer.appendChild(badge.el)
  }

  // === Editor DSL & Toolbar Section ===
  const dslSection = createDslSection(container, {
    initialContent: serverDSL,
    claseId,
    onEditorChange: (value) => { dslContent = value },
  })
  const editor = dslSection.getEditor()
  const editorContainer = container.querySelector('#pm-dsl-editor-container')

  // === Generar Informe Modal ===
  const informeModal = createGenerarInformeModal(container, {
    onAceptar: (texto) => {
      editor.setValue(texto)
    },
  })

  // === Structure Modal ===
  const structureModal = createStructureModal(container, {
    onAccept: (dslText) => {
      editor.setValue(dslText)
    },
  })

  // === Progress Preview Panel ===
  const progressPanel = createProgressPreviewPanel(editorContainer.parentNode, {
    onConfirm: async (records) => {
      try {
        const alumnosConId = alumnos.map((a) => ({
          id: a.id,
          nombre: a.nombre_completo || a.nombre || '',
          nombreCorto: (a.nombre_completo || a.nombre || '').split(' ')[0],
        }))
        const { saved, errors } = await saveProgressFromAI({
          sesionId,
          claseId,
          maestroId: maestro.id,
          fechaHoy,
          progressRecords: records,
          alumnos: alumnosConId,
        })
        if (errors.length) console.warn('[Progress] Errores parciales:', errors)
        // Restore the save button and immediately trigger the full session save
        // (which handles attendance, session state update and shows the overlay)
        const btnGuardar = container.querySelector('#btn-guardar')
        if (btnGuardar) {
          btnGuardar.style.removeProperty('display')
          btnGuardar.click()
        }
      } catch (err) {
        container.querySelector('#btn-guardar')?.style.removeProperty('display')
        AppToast.error('Error al guardar progreso: ' + err.message)
      }
    },
    onCancel: () => {
      container.querySelector('#btn-guardar')?.style.removeProperty('display')
    },
  })

  // === Curriculum Proposal Panel ===
  const curricPanel = createCurriculumProposalPanel(
    container.querySelector('#pm-planificacion-dropdown') || container,
    {
      onAdopt: async ({ instrumento, nivel, resumen, pilares }) => {
        try {
          const { curriculo, allObjetivos } = await adoptarPropuesta({
            instrumento,
            nivel,
            descripcion: resumen,
            pilares,
          })
          const { linked } = await linkProgresosToObjetivos({ claseId, objetivos: allObjetivos })
          const msg =
            linked > 0
              ? `Plan creado · ${linked} registro${linked !== 1 ? 's' : ''} vinculado${linked !== 1 ? 's' : ''}`
              : 'Plan curricular creado correctamente.'
          AppToast.success(msg)
        } catch (err) {
          AppToast.error('Error al crear el plan: ' + err.message)
        }
      },
      onCancel: () => { },
    },
  )

  dslSection.initToolbar({
    onImproveClick: async (text) => {
      const informeBtn = container.querySelector('#btn-generar-informe')
      if (informeBtn) informeBtn.disabled = true
      try {
        const improved = await improveText(text)
        informeModal.open({ original: text, improved })
      } catch (err) {
        AppToast.error('Error al generar informe: ' + err.message)
      } finally {
        if (informeBtn) informeBtn.disabled = false
      }
    },
    onStructureClick: async (text) => {
      const structureBtn = container.querySelector('#btn-ia-magic')
      if (structureBtn) structureBtn.disabled = true
      try {
        const indicadorActivo = planificationCard?.getActiveIndicador()
        const alumnosPresentes = alumnos
          .filter((a) => estado[a.id] === 'P')
          .map((p) => p.nombre_completo)
        const dsl = await structureTextToDSL(text, {
          presentes: alumnosPresentes,
          indicadorActivo: indicadorActivo?.nombre || null,
        })
        structureModal.open({ original: text, dsl })
      } catch (err) {
        AppToast.error('Error al estructurar con IA: ' + err.message)
      } finally {
        if (structureBtn) structureBtn.disabled = false
      }
    },
    onAnalyzeClick: async (text) => {
      await safeAsync(
        async () => {
          const alumnosPresentes = alumnos.filter((a) => estado[a.id] && estado[a.id] !== 'A')
          const _buildNombreCorto = (fullName, allNames) => {
            const parts = fullName.trim().split(/\s+/)
            const first = parts[0]
            const hasDuplicate =
              allNames.filter((n) => n.trim().split(/\s+/)[0] === first).length > 1
            return hasDuplicate ? parts.slice(0, 2).join(' ') : first
          }
          const allNombresFull = alumnos.map((a) => a.nombre_completo || a.nombre || '')
          const alumnosMapped = alumnos.map((a) => {
            const nombre = a.nombre_completo || a.nombre || ''
            return { id: a.id, nombre, nombreCorto: _buildNombreCorto(nombre, allNombresFull) }
          })
          const presentesMapped = alumnosPresentes.map((a) => {
            const nombre = a.nombre_completo || a.nombre || ''
            return { id: a.id, nombre, nombreCorto: _buildNombreCorto(nombre, allNombresFull) }
          })
          const contextoGroq = {
            alumnos: alumnosMapped,
            presentes: presentesMapped,
            tipoClase: inferirTipoClase(clase),
            instrumento: clase.instrumento || '',
            sesionesRecientes: (snapshots || [])
              .slice(-2)
              .map((s) => s.contenido || '')
              .filter(Boolean),
            indicadorActivo: planificationCard?.getActiveIndicador()?.nombre || '',
          }
          container.querySelector('#btn-guardar')?.style.setProperty('display', 'none')
          const result = await analyzeObservation(text, contextoGroq)
          if (!result?.progreso?.length) {
            container.querySelector('#btn-guardar')?.style.removeProperty('display')
            if (typeof AppToast !== 'undefined' && AppToast) {
              AppToast.warning('La IA no detectó registros de progreso en este texto.')
            }
            return
          }
          progressPanel.open({ progreso: result.progreso, resumen: result.resumen })
        },
        {
          onError: (err) => {
            container.querySelector('#btn-guardar')?.style.removeProperty('display')
            if (typeof AppToast !== 'undefined' && AppToast) {
              AppToast.error('Error al analizar con IA: ' + err.message)
            }
          },
        },
      )
    },
  })

  // === Planification Card ===
  const toolbar = dslSection.getToolbar()
  planificationCard = createPlanificationCard(container, {
    claseId,
    clase,
    maestro,
    fechaHoy,
    rutaId,
    editor,
    onIndicadorSelect: (ind) => {
      editor.insertText(`[${ind.nombre}] `)
      if (toolbar) toolbar.setContext({ indicadorActivo: ind.nombre })
      const obsBtn = container.querySelector('#btn-guardar-obs')
      if (obsBtn) obsBtn.style.display = ''
    },
    getSessionState: () => ({
      isRegistered: isSessionRegistered,
      hasContent: Boolean(dslContent && dslContent.trim()),
      sessionId: sesionId,
    }),
    getDslContent: () => editor.getValue(),
  })
  _cleanups.push(() => planificationCard.destroy())



  // Wire "Proponer plan curricular" button
  const btnProponerCurriculo = container.querySelector('#btn-proponer-curriculo')
  if (btnProponerCurriculo) {
    btnProponerCurriculo.onclick = async () => {
      btnProponerCurriculo.disabled = true
      btnProponerCurriculo.innerHTML = '<i class="bi bi-hourglass-split"></i> Analizando...'

      try {
        const insights = await fetchInsights(claseId, 12)

        if (insights.registros.length === 0) {
          AppToast.error(
            'No hay registros de progreso suficientes en las últimas 12 semanas para generar una propuesta.',
          )
          return
        }

        const proposal = await proposeCurriculum(insights, {
          instrumento: clase?.instrumento || '',
          nivel: '',
          nombreClase: clase?.nombre || '',
        })

        curricPanel.open({
          pilares: proposal.pilares,
          resumen: proposal.resumen,
          instrumento: clase?.instrumento || '',
          nivel: '',
        })
      } catch (err) {
        AppToast.error('Error al generar propuesta: ' + err.message)
      } finally {
        btnProponerCurriculo.disabled = false
        btnProponerCurriculo.innerHTML =
          '<i class="bi bi-stars"></i> Proponer plan curricular con IA'
      }
    }
  }

  // === Ruta topic auto-injection ===
  const rutaTopicInjector = createRouteTopicAutoInjector(container, { editor, toolbar })
  const rutaTema = consumeRutaTema()
  rutaTopicInjector.inject(rutaTema, claseId)
  _cleanups.push(() => rutaTopicInjector.destroy())

  // === Modal de Justificación ===
  const _justifModal = createJustifModalManager(container, {
    sesionId,
    claseId,
    fechaHoy,
    maestroId: maestro.id,
    supabase,
    guardarJustificacion,
    eliminarJustificacion,
    onJustifDeleted: (alumnoId) => {
      estado[alumnoId] = null
      delete justificaciones[alumnoId]
    },
    onJustifSaved: (alumnoId, savedRecord) => {
      justificaciones[alumnoId] = savedRecord
    },
    onJustifCancelled: (alumnoId, prevEstado) => {
      estado[alumnoId] = prevEstado
    },
    onRenderLista: (alumnoId) => studentList.render(alumnoId),
    onUpdateProgress: () => _updateProgress(),
    onAutoSave: (immediate) => _autoSave(immediate),
    onAnnounce: (msg) => announce(msg),
  })
  _cleanups.push(() => {
    try {
      _justifModal.close()
    } catch { /* ignore */ }
  })

  // === Auto-Draft Manager ===
  const _draftMgr = createAutoDraftManager(container, {
    sesionId,
    maestroId: maestro.id,
    editor,
    sesionExistenteData,
    onDraftRecovered: (content) => {
      dslContent = content
      editor.setValue(content)
    },
  })
  _cleanups.push(() => _draftMgr.destroy())

  // === Academic Content Flow ===
  let activeClassEventId = null
  let activeLevel = null
  let academicPanelInstances = []
  const academicToolsContainer = container.querySelector('#pm-academic-tools')

  // Nota: Eliminamos la carga global de ContentSelectionPanel aquí
  // para evitar el error de studentId requerido.
  // El flujo ahora es 100% contextual al interactuar con un alumno.

  // === Save Observation Button ===
  createObservationSaveButton(container, {
    rutaId,
    sesionId,
    claseId,
    maestro,
    fechaHoy,
    alumnos,
    estado,
    planificationCard,
    editorContainer,
    getEditorValue: () => editor.getValue(),
    setEditorValue: (v) => editor.setValue(v),
    onDslContentClear: () => { dslContent = '' },
    activeClassEventId,
    activeLevel,
    claseNombre: clase?.nombre || 'Clase',
    onAppendModal: (el) => {
      const root = container.querySelector('.pm-asist-root')
      if (root) root.appendChild(el)
    },
  })

  // === Student List ===
  const studentList = createStudentList(container, {
    alumnos,
    estado,
    rutaId,
    canOpenProgressPanel: Boolean(claseId || rutaId),
    sesionId,
    fechaHoy,
    snapshots,
    justificaciones,
    obtenerJustificacion,
    onEstadoChange: (id, newEstado) => {
      estado[id] = newEstado
    },
    onOpenProgressPanel: (alumno) => {
      if (_activeStudentPanel) _activeStudentPanel.destroy()
      _activeStudentPanel = createStudentProgressPanel({
        alumno,
        rutaId,
        sessionId: sesionId,
        claseId,
        fecha: fechaHoy,
        horaInicio: horario?.hora_inicio || null,
        onProgressSaved: async () => {
          if (planificationCard?.refreshTree) {
            await planificationCard.refreshTree()
          }
        },
      })
      _activeStudentPanel.open()
      _cleanups.push(() => { if (_activeStudentPanel) _activeStudentPanel.destroy() })
    },
    onOpenEvaluationDrawer: (student, studentSnapshots) => {
      createEvaluationDrawer(container, {
        student,
        sessionId: sesionId,
        teacherId: maestro.id,
        snapshots: studentSnapshots,
      })
    },
    onOpenJustifModal: (alumno, justifExistente, prevEstado) => {
      _justifModal.open(alumno, justifExistente, prevEstado)
    },
    onAutoSave: (immediate) => _autoSave(immediate),
    onAnnounce: (msg) => announce(msg),
    onUpdateSnapshots: (newSnaps) => { snapshots.push(...newSnaps) },
  })
  _cleanups.push(() => studentList.destroy())
  let _activeStudentPanel = null

  // === Sync & Helpers ===
  function _updateProgress() {
    const total = alumnos.length
    const marcados = Object.values(estado).filter((v) => v !== null).length
    const wrap = container.querySelector('#pm-progress-wrap')
    const fill = container.querySelector('#pm-progress-fill')
    const label = container.querySelector('#pm-progress-label')

    if (marcados === 0) {
      wrap.style.display = 'none'
      return
    }
    wrap.style.display = 'flex'
    fill.style.width = `${(marcados / total) * 100}%`
    label.textContent = `${marcados}/${total}`
  }

  async function _autoSave(immediate = false, skipMutex = false) {
    if (_saveTimer) clearTimeout(_saveTimer)

    const saveFn = async () => {
      const asistencia = alumnos
        .filter((a) => estado[a.id])
        .map((a) => ({
          alumno_id: a.id,
          estado: estado[a.id],
        }))

      const payload = {
        ...(sesionId ? {} : { clase_id: claseId }),
        maestro_id: maestro.id,
        fecha: fechaHoy,
        estado: 'pendiente',
        borrador: true,
        asistencia: asistencia || [],
        contenido: dslContent || '',
      }

      if (navigator.onLine) {
        try {
          if (!sesionId) {
            // Primera vez: INSERT directo para obtener el ID real
            const { data, error } = await supabase
              .from('sesiones_clase')
              .insert([payload])
              .select('id')
              .single()

            if (!error && data) {
              sesionId = data.id
              console.log('[asistencia] Nueva sesión creada:', sesionId)
              localStorage.setItem(`${localKey}_updated`, new Date().toISOString())
              return
            }
            throw error || new Error('No se pudo crear la sesión')
          } else {
            // Sesión existente: UPDATE directo (evita que la cola sobreescriba estado posterior)
            const { error } = await supabase
              .from('sesiones_clase')
              .update({ ...payload, updated_at: new Date().toISOString() })
              .eq('id', sesionId)

            if (!error) {
              localStorage.setItem(`${localKey}_updated`, new Date().toISOString())
              return
            }
            throw error
          }
        } catch (err) {
          console.warn('[asistencia] Fallo operación directa, usando cola offline:', err.message)
        }
      }

      // Fallback: cola offline (cuando offline o si falla la operación directa)
      let op = sesionId ? 'update' : 'insert'
      await enqueue({
        tabla: 'sesiones_clase',
        operacion: op,
        payload: {
          ...(sesionId ? { id: sesionId } : {}),
          ...payload,
        },
      })
      localStorage.setItem(`${localKey}_updated`, new Date().toISOString())
    }

    if (immediate) {
      if (skipMutex) {
        // Caller (button handler) already holds the mutex — run directly to avoid deadlock
        await saveFn()
      } else {
        // Normal autosave: acquire mutex
        await _saveMutex.run(saveFn)
      }
    } else {
      // Schedule with mutex — deferred 2s, then acquire lock before executing
      _saveTimer = setTimeout(() => {
        _saveMutex.run(saveFn).catch((err) => console.error('[asistencia] Autosave error:', err))
      }, 2000)
    }
  }

  // Reportes Institucionales (PDF)
  const actionsContainer = container.querySelector('.pm-asist-actions-fixed')
  if (actionsContainer) {
    const btnReporteD = document.createElement('button')
    btnReporteD.id = 'btn-reporte-dia'
    btnReporteD.className = 'pm-asist-btn-obs'
    btnReporteD.innerHTML = '📄 Reporte'
    btnReporteD.title = 'Genera el Reporte Diario de Asistencia (PDF)'
    btnReporteD.style.flex = '1'
    btnReporteD.style.display = 'none'
    btnReporteD.addEventListener('click', async (e) => {
      e.preventDefault()
      if (!sesionId) return
      btnReporteD.disabled = true
      btnReporteD.innerHTML = '⏳...'
      await generateDailyReport(sesionId)
      btnReporteD.disabled = false
      btnReporteD.innerHTML = '📄 Reporte'
    })
    const btnGuardar = actionsContainer.querySelector('#btn-guardar')
    actionsContainer.insertBefore(btnReporteD, btnGuardar)

    const btnResumenM = document.createElement('button')
    btnResumenM.id = 'btn-resumen-mes'
    btnResumenM.className = 'pm-asist-btn-obs'
    btnResumenM.innerHTML = '📊 Resumen'
    btnResumenM.title = 'Genera el Resumen Mensual de Asistencia (PDF)'
    btnResumenM.style.flex = '1'
    btnResumenM.style.display = 'none'
    const now = new Date()
    btnResumenM.addEventListener('click', async (e) => {
      e.preventDefault()
      if (!claseId) return
      btnResumenM.disabled = true
      btnResumenM.innerHTML = '⏳...'
      await generateMonthlyAttendance(claseId, now.getFullYear(), now.getMonth() + 1)
      btnResumenM.disabled = false
      btnResumenM.innerHTML = '📊 Resumen'
    })
    actionsContainer.insertBefore(btnResumenM, btnGuardar)
  }

  container.querySelector('#btn-guardar').onclick = async () => {
    const btn = container.querySelector('#btn-guardar')
    const originalText = btn.textContent
    btn.textContent = 'Guardando...'
    btn.disabled = true

    // Use mutex to serialize with autosave — prevents lost updates from concurrent saves
    await _saveMutex.run(async () => {
      try {
        // Build attendance array with required fields (sesion_clase_id will be added later once resolved)
        const asistencia = alumnos
          .filter((a) => estado[a.id])
          .map((a) => ({
            ...(claseId ? { clase_id: claseId } : {}),
            alumno_id: a.id,
            fecha: fechaHoy,
            estado: estado[a.id],
            registrado_por: maestro.id,
          }))

        const tieneAsistenciaMarcada = asistencia.length > 0
        const tieneContenido = dslContent && dslContent.trim().length > 0

        // Permitir guardar si hay asistencia marcada O contenido DSL no vacío
        if (!tieneAsistenciaMarcada && !tieneContenido) {
          throw new Error('Debes marcar asistencia o agregar contenido para guardar')
        }

        // 1. Guardar estado actual (asistencia y contenido)
        // skipMutex=true: button handler already holds the mutex, skip to prevent deadlock
        await _autoSave(true, true)

        // 1.1 Si sesionId sigue siendo null (nueva sesión), intentar obtenerla de Supabase
        // ya que _autoSave(true) acaba de encolar/insertar.
        if (!sesionId) {
          const { data: sData } = await supabase
            .from('sesiones_clase')
            .select('id')
            .eq('clase_id', claseId)
            .eq('maestro_id', maestro.id)
            .eq('fecha', fechaHoy)
            .maybeSingle()
          if (sData) sesionId = sData.id
        }

        // 1.5 Registrar asistencias individuales en la tabla asistencias
        // Se saltea para sesiones emergentes (sin clase_id) porque el jsonb
        // `asistencia` en sesiones_clase ya persiste los datos.
        if (tieneAsistenciaMarcada && claseId) {
          try {
            const asistenciaConSesion = asistencia.map((a) => ({
              ...a,
              ...(sesionId && { sesion_clase_id: sesionId }),
            }))
            await registrarAsistenciaBulk(asistenciaConSesion)
            console.log(
              '[asistencia] Registradas asistencias individuales:',
              asistenciaConSesion.length,
            )
          } catch (bulkErr) {
            console.error('[asistencia] Error registrando asistencias en bulk:', bulkErr)
            // Bug #10: si falla (offline/sin sesionId), encolar para sync posterior
            if (!navigator.onLine || !sesionId) {
              console.warn('[asistencia] Encolando asistencias para sync offline...')
              for (const a of asistencia) {
                await enqueue({
                  tabla: 'asistencias',
                  operacion: 'upsert',
                  payload: {
                    clase_id: claseId,
                    alumno_id: a.alumno_id,
                    fecha: fechaHoy,
                    estado: a.estado,
                    registrado_por: maestro.id,
                    ...(sesionId ? { sesion_clase_id: sesionId } : {}),
                  },
                })
              }
            } else {
              throw new Error(
                'No se pudieron registrar las asistencias individuales: ' + bulkErr.message,
              )
            }
          }
        }

        // 2. Si hay sesión existente, marcarla como registrada (borrador = false)
        if (sesionId && (tieneAsistenciaMarcada || tieneContenido)) {
          // Re-build asistencia array to ensure it's synchronized
          const asistenciaActualizada = alumnos
            .filter((a) => estado[a.id])
            .map((a) => ({
              alumno_id: a.id,
              estado: estado[a.id],
            }))

          // Intentar con 'registrada' primero (requiere migración 010)
          let { error } = await supabase
            .from('sesiones_clase')
            .update({
              borrador: false,
              estado: 'registrada',
              asistencia: asistenciaActualizada,
              contenido: dslContent || '',
              updated_at: new Date().toISOString(),
            })
            .eq('id', sesionId)
            .select()

          // Fallback: si el CHECK constraint no acepta 'registrada', usar 'cerrada'
          if (error) {
            console.warn(
              'estado "registrada" no permitido, usando fallback "cerrada":',
              error.message,
            )
            const { error: err2 } = await supabase
              .from('sesiones_clase')
              .update({
                borrador: false,
                estado: 'cerrada',
                asistencia: asistenciaActualizada,
                contenido: dslContent || '',
                updated_at: new Date().toISOString(),
              })
              .eq('id', sesionId)
              .select()

            if (err2) {
              // Último intento: solo borrador sin cambiar estado
              console.warn(
                'Fallback "cerrada" también falló, actualizando solo borrador:',
                err2.message,
              )
              await supabase
                .from('sesiones_clase')
                .update({
                  borrador: false,
                  asistencia: asistenciaActualizada,
                  contenido: dslContent || '',
                  updated_at: new Date().toISOString(),
                })
                .eq('id', sesionId)
            }
          }

          // Invalidar cache y vistas para que se actualicen
          invalidateClasesCache()
          navInvalidateView('hoy')
          navInvalidateView('calendario')
          navInvalidateView('metricas')
          fetchNotificaciones().catch((e) =>
            console.warn('[asistenciaView] Error al actualizar notificaciones:', e),
          )
          isSessionRegistered = true
          if (planificationCard?.refreshTree) {
            await planificationCard.refreshTree()
          }
        }

        // 3. Procesar cierre de sesión y recálculo de progreso
        if (sesionId) {
          const { academicService } =
            await import('../../modules/academic-routes/services/academicService.js')
          const { createAchievementsSummaryModal } =
            await import('../components/AchievementsSummaryModal.js')

          // Ejecutar recálculos (Motor de Reglas)
          const achievements = await academicService.processSessionClosure(sesionId)

          // 4. Mostrar feedback de logros si existen
          if (achievements && achievements.length > 0) {
            btn.textContent = '¡Logros detectados!'
            btn.style.background = 'var(--pm-success)'
            await createAchievementsSummaryModal(container, achievements)
          } else {
            console.warn(
              '[asistencia] processSessionClosure devolvió 0 logros (puede que no haya progresos vinculados a esta sesión aún).',
            )
          }
        } else {
          console.warn('[asistencia] No se pudo obtener sesionId para procesar logros.')
        }

        btn.textContent = '✓ Guardado'
        btn.style.background = 'var(--apple-success)'

        // Mostrar los botones de reporte una vez guardado
        const rBtn = actionsContainer?.querySelector('#btn-reporte-dia')
        if (rBtn) rBtn.style.display = ''
        const mBtn = actionsContainer?.querySelector('#btn-resumen-mes')
        if (mBtn) mBtn.style.display = ''

        // Announce save success
        const presentes = Object.values(estado).filter((v) => v === 'P').length
        const ausentes = Object.values(estado).filter((v) => v === 'A').length
        announce(`Sesión guardada exitosamente. ${presentes} presentes, ${ausentes} ausentes.`)

        // 5. Mostrar pantalla de éxito (overlay sólido sobre todo el contenido)
        const overlay = document.createElement('div')
        overlay.className = 'pm-saved-overlay'
        overlay.innerHTML = `
        <div class="pm-saved-options">
          <div class="pm-saved-header">
            <div class="pm-saved-check-anim">
              <i class="bi bi-check-circle-fill"></i>
            </div>
            <h3>Sesión Guardada</h3>
            <p>¿Qué deseas hacer ahora?</p>
          </div>
          <div class="pm-saved-actions">
            <button class="pm-btn pm-btn-primary" id="btn-resumen-pedagogico">
              <i class="bi bi-bar-chart-steps"></i> Resumen pedagógico
            </button>
            <button class="pm-btn pm-btn-secondary" id="btn-editar-asistencia">
              <i class="bi bi-pencil"></i> Editar Asistencia
            </button>
            <button class="pm-btn pm-btn-primary" id="btn-reporte-dia-overlay">
              <i class="bi bi-file-earmark-pdf"></i> Reporte del día (PDF)
            </button>
            <button class="pm-btn pm-btn-secondary" id="btn-resumen-mes-overlay">
              <i class="bi bi-bar-chart-line"></i> Resumen del mes (PDF)
            </button>
            <button class="pm-btn pm-btn-secondary" id="btn-informe-ped-overlay">
              <i class="bi bi-mortarboard"></i> Informe pedagógico (PDF)
            </button>
            <button class="pm-btn pm-btn-outline" id="btn-compartir-correo">
              <i class="bi bi-envelope"></i> Compartir por Correo
            </button>
            <button class="pm-btn pm-btn-success" id="btn-compartir-whatsapp">
              <i class="bi bi-whatsapp"></i> Compartir por WhatsApp
            </button>
          </div>
          <div class="pm-saved-nav">
            <button class="pm-saved-nav-btn" id="btn-volver-hoy" title="Volver a Hoy">
              <i class="bi bi-arrow-left-circle"></i>
            </button>
            <button class="pm-saved-nav-btn" id="btn-ir-calendario" title="Ir al Calendario">
              <i class="bi bi-calendar3"></i>
            </button>
          </div>
        </div>
      `
        document.body.appendChild(overlay)

        // Attach event listeners
        const resumenPedBtn = overlay.querySelector('#btn-resumen-pedagogico')
        const editarBtn = overlay.querySelector('#btn-editar-asistencia')
        const correoBtn = overlay.querySelector('#btn-compartir-correo')
        const whatsBtn = overlay.querySelector('#btn-compartir-whatsapp')
        const volverHoyBtn = overlay.querySelector('#btn-volver-hoy')
        const calBtn = overlay.querySelector('#btn-ir-calendario')

        if (_summaryPanel) _summaryPanel.destroy()
        _summaryPanel = createSessionSummaryPanel()
        const summaryPanel = _summaryPanel
        if (resumenPedBtn) {
          resumenPedBtn.onclick = () => {
            summaryPanel.open({
              sesionId,
              claseNombre: clase?.nombre || 'Clase',
              fecha: fechaHoy,
              supabase,
            })
          }
        }

        if (editarBtn)
          editarBtn.onclick = () => {
            overlay.remove()
            btn.textContent = 'Guardar sesión'
            btn.style.background = ''
            btn.disabled = false
            btn.style.display = ''
          }

        if (correoBtn)
          correoBtn.onclick = async () => {
            const asistenciaData = alumnos
              .filter((a) => estado[a.id])
              .map((a) => ({
                alumno_id: a.id,
                estado: estado[a.id],
              }))
            const subject = encodeURIComponent(
              `Reporte de Clase - ${clase?.nombre || ''} - ${fechaHoy}`,
            )
            const bodyText = generarReporteTexto(asistenciaData, dslContent, alumnos, clase, fechaHoy)
            abrirEnlaceConLimite(`mailto:?subject=${subject}&body=`, bodyText, 1800)
          }

        if (whatsBtn)
          whatsBtn.onclick = async () => {
            const asistenciaData = alumnos
              .filter((a) => estado[a.id])
              .map((a) => ({
                alumno_id: a.id,
                estado: estado[a.id],
              }))
            const bodyText = generarReporteTexto(asistenciaData, dslContent, alumnos, clase, fechaHoy)
            abrirEnlaceConLimite('https://wa.me/?text=', bodyText, 1600)
          }

        if (volverHoyBtn)
          volverHoyBtn.onclick = () => {
            overlay.remove()
            navigateTo('hoy')
          }

        if (calBtn)
          calBtn.onclick = () => {
            overlay.remove()
            navigateTo('fechas')
          }

        const reporteDiaBtn = overlay.querySelector('#btn-reporte-dia-overlay')
        if (reporteDiaBtn) {
          reporteDiaBtn.onclick = async () => {
            const originalHtml = reporteDiaBtn.innerHTML
            reporteDiaBtn.disabled = true
            reporteDiaBtn.innerHTML = '<i class="bi bi-hourglass-split"></i> Generando…'
            try {
              await generateDailyReport(sesionId)
            } finally {
              reporteDiaBtn.disabled = false
              reporteDiaBtn.innerHTML = originalHtml
            }
          }
        }

        const resumenMesBtn = overlay.querySelector('#btn-resumen-mes-overlay')
        if (resumenMesBtn) {
          // Los reportes mensuales requieren un claseId — no aplican para sesiones emergentes
          if (!claseId) {
            resumenMesBtn.disabled = true
            resumenMesBtn.title = 'No disponible para actividades especiales'
            resumenMesBtn.style.opacity = '0.5'
          } else {
            resumenMesBtn.onclick = async () => {
              const originalHtml = resumenMesBtn.innerHTML
              resumenMesBtn.disabled = true
              resumenMesBtn.innerHTML = '<i class="bi bi-hourglass-split"></i> Generando…'
              try {
                const now = new Date()
                await generateMonthlyAttendance(claseId, now.getFullYear(), now.getMonth() + 1)
              } finally {
                resumenMesBtn.disabled = false
                resumenMesBtn.innerHTML = originalHtml
              }
            }
          }
        }

        const informePedBtn = overlay.querySelector('#btn-informe-ped-overlay')
        if (informePedBtn) {
          // Los informes pedagógicos requieren un claseId — no aplican para sesiones emergentes
          if (!claseId) {
            informePedBtn.disabled = true
            informePedBtn.title = 'No disponible para actividades especiales'
            informePedBtn.style.opacity = '0.5'
          } else {
            informePedBtn.onclick = async () => {
              const originalHtml = informePedBtn.innerHTML
              informePedBtn.disabled = true
              informePedBtn.innerHTML = '<i class="bi bi-hourglass-split"></i> Generando…'
              try {
                const now = new Date()
                await generateMonthlyPedagogical(claseId, now.getFullYear(), now.getMonth() + 1)
              } finally {
                informePedBtn.disabled = false
                informePedBtn.innerHTML = originalHtml
              }
            }
          }
        }
      } catch (err) {
        console.error('Error al guardar sesión:', err)
        btn.textContent = err.message || 'Error al guardar'
        btn.style.background = 'var(--pm-danger)'
        btn.disabled = false
        setTimeout(() => {
          btn.textContent = originalText
          btn.style.background = ''
        }, 3000)
      }
    }) // end _saveMutex.run
  }

  // === Bulk Actions Logic ===
  const _bulkActions = createBulkActions(container, {
    onMarkAll: async (tipo) => {
      alumnos.forEach((a) => { estado[a.id] = tipo })
      studentList.render()
      _updateProgress()
      try { await _autoSave(true) } catch (_e) { console.warn(`[asistencia] autoSave error on bulk ${tipo}:`, _e) }
      announce(`Todos los ${alumnos.length} alumnos marcados como ${tipo === 'P' ? 'presentes' : 'ausentes'}.`)
    },
  })
  _cleanups.push(() => _bulkActions.destroy())
  studentList.render()

  // === TOUR INTERACTIVO (delegado a AsistenciaTour) ===
  const tour = new AsistenciaTour(container)
  tour.mount()

  // Conectar botón de ayuda al tour
  const helpBtn = container.querySelector('#pm-btn-help')
  if (helpBtn) helpBtn.onclick = () => tour.start()

  // RETORNAR CLEANUP PARA EL ROUTER
  return () => {
    console.log('[AsistenciaView] Cleanup ejecutado por el Router')
    tour.destroy()
    try {
      _justifModal.close()
    } catch (_) { }

    // Remover overlay de "Sesión Guardada" si quedó en el DOM
    document.querySelectorAll('.pm-saved-overlay').forEach((el) => el.remove())

    _cleanups.forEach((fn) => {
      try {
        fn()
      } catch (_) { }
    })
  }
}

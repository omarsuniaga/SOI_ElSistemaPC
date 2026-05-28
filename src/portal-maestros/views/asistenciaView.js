import { supabase } from '../../lib/supabaseClient.js'
import { getMaestroLocal } from '../auth/maestroAuth.js'
import { escHTML, formatHora, formatFechaPortal } from '../utils/portalUtils.js'
import { announce } from '../utils/a11yUtils.js'
import { enqueue } from '../services/offlineQueue.js'
import { parseDSL } from '../utils/dslParser.js'
import {
  enrichToDSL,
  transcribeAndStructure,
  improveText,
  structureTextToDSL,
} from '../services/groqService.js'
import { createDslToolbar } from '../components/dslToolbar.js'
import { createDslEditor } from '../components/dslEditor.js'
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
import { openPlanificacionModal } from '../../modules/planificacion/components/planificacionModal.js'
import { RouteConfigAdapter } from '../services/routeConfigAdapter.js'
import { renderRouteConfigurator } from './components/routeConfigurator.js'
import { crearPlanificacion } from '../../modules/planificacion/api/planificacionApi.js'
import { AppModal } from '../../shared/components/AppModal.js'
import { AppToast } from '../../shared/components/AppToast.js'
import { invalidateView as navInvalidateView } from '../services/navigationHooks.js'
import { createRouteTreeBar } from '../components/routeTreeBar.js'
import { createStudentProgressPanel } from '../components/studentProgressPanel.js'
import { createSessionSummaryPanel } from '../components/SessionSummaryPanel.js'
import { resolveDSL, saveEvaluaciones } from '../services/evaluationService.js'
import { processarEvaluacion } from '../services/evaluationService.js'
import {
  createAutoDraft,
  saveDraft,
  loadDraft,
  discardDraft,
  saveObservation,
} from '../services/autoDraftService.js'
import { createContentSelectionPanel } from '../components/ContentSelectionPanel.js'
import { createMethodologyForm } from '../components/MethodologyForm.js'
import { createHomeworkPanel } from '../components/HomeworkPanel.js'
import { createLevelCompletionModal } from '../components/LevelCompletionModal.js'
import { getClassEvent, updateClassEventStatus } from '../services/classEventService.js'
import { consumeRutaTema } from '../services/rutaTopicStore.js'
import { createJustificacionModal } from '../components/JustificacionModal.js'
import {
  guardarJustificacion,
  obtenerJustificacion,
  eliminarJustificacion,
} from '../services/justificacionService.js'
import { promocionarObservacionesAlumnos } from '../services/observationPromotionService.js'
import { registrarAsistenciaBulk } from '../../modules/asistencias/api/asistenciasApi.js'
import { createAsyncMutex } from '../../shared/utils/asyncMutex.js'
import { analyzeObservation } from '../services/groqService.js'
import {
  saveProgressFromAI,
  saveProgressFromDSL,
  linkProgresosToObjetivos,
} from '../services/progressAggregatorService.js'

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
export async function renderAsistenciaView(containerOrId, { claseId, fecha } = {}) {
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
    container.innerHTML = `<p class="pm-empty">No se indicó la clase.</p>`
    return
  }

  // Persistir clase activa para otros módulos (ej: Planificación)
  localStorage.setItem('pm_active_clase_id', claseId)

  const fechaHoy = fecha || new Date().toISOString().split('T')[0]

  try {
    const diaHoy = new Date().toLocaleDateString('es-ES', { weekday: 'long' }).toLowerCase()

    // ── Batch 1: datos cacheados (instantáneos si hoyView ya cargó) + sesión en paralelo ──
    const [misClases, todosHorarios, todasInscripciones, sesionRes] = await Promise.all([
      getMisClases(), // cache: 1min
      getHorariosClases([claseId]), // cache: 5min
      getInscripcionesClases([claseId]), // cache: 2min
      // 🔥 REUTILIZAR BORRADORES: Buscar sesión guardada OR borrador más reciente
      supabase
        .from('sesiones_clase')
        .select('*')
        .eq('clase_id', claseId)
        .eq('maestro_id', maestro.id)
        .eq('fecha', fechaHoy)
        .order('borrador', { ascending: true }) // Priorizar guardadas (false) sobre borradores (true)
        .order('updated_at', { ascending: false }) // Entre borradores, la más reciente
        .limit(1),
    ])
    console.log('[DEBUG] Finished Batch 1')

    const clase = misClases.find((c) => c.id === claseId)
    if (!clase) {
      console.log('[DEBUG] Clase not found in misClases')
      container.innerHTML = `<p class="pm-empty" style="color:var(--pm-danger)">Clase no encontrada.</p>`
      return
    }

    const horario = todosHorarios.find((h) => h.dia?.toLowerCase() === diaHoy)

    const alumnos = (todasInscripciones || [])
      .map((i) => i.alumnos)
      .filter(Boolean)
      .sort((a, b) => {
        const cmp1 = (a.instrumento_principal || '').localeCompare(b.instrumento_principal || '')
        if (cmp1 !== 0) return cmp1
        return (a.nombre_completo || '').localeCompare(b.nombre_completo || '')
      })

    const sesionExistenteData = sesionRes.data?.[0]
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
    console.log('[DEBUG] Finished Batch 2')

    const salonNombre = salonesData.length > 0 ? salonesData[0].nombre : null

    // Detectar conflicto
    const localKey = `pm_asistencia_${claseId}_${fechaHoy}`
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
    // Source 1: JSON field in sesiones_clase (fast, legacy)
    let serverAsistencia = sesionExistenteData?.asistencia || []

    // Source 2: asistencias table (authoritative, fallback if JSON is empty)
    if (serverAsistencia.length === 0 && sesionId) {
      try {
        const { data: asistenciasDB } = await supabase
          .from('asistencias')
          .select('alumno_id, estado')
          .eq('sesion_clase_id', sesionId)
        if (asistenciasDB?.length > 0) {
          console.log('[asistencia] Restaurando desde tabla asistencias:', asistenciasDB.length)
          // Map DB values back to UI codes
          const ESTADO_DB_TO_UI = {
            presente: 'P',
            ausente: 'A',
            justificado: 'J',
            tarde: 'T',
          }
          serverAsistencia = asistenciasDB.map((a) => ({
            alumno_id: a.alumno_id,
            estado: ESTADO_DB_TO_UI[a.estado] ?? a.estado,
          }))
        }
      } catch (_e) {
        console.warn('[asistencia] No se pudo restaurar desde tabla asistencias:', _e)
      }
    }

    // Normalize any full DB values back to UI abbreviations
    const ESTADO_DB_TO_UI = { presente: 'P', ausente: 'A', justificado: 'J', tarde: 'T' }
    serverAsistencia.forEach((item) => {
      if (estado.hasOwnProperty(item.alumno_id)) {
        const estadoNorm = ESTADO_DB_TO_UI[item.estado] ?? item.estado
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
          if (estado.hasOwnProperty(j.alumno_id)) {
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
  } = ctx
  let sesionId = ctx.sesionId

  // Cleanup registry — all destroyable sub-components register here
  const _cleanups = []
  const localKey = `pm_asistencia_${claseId}_${fechaHoy}`
  let dslContent = serverDSL
  let _saveTimer = null
  const _saveMutex = createAsyncMutex()
  let routeTreeBar = null // Mover al scope superior

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
      [data-portal-theme="dark"] .pm-asist-header,
      [data-bs-theme="dark"] .pm-asist-header {
        background: var(--pm-surface-2);
        border-bottom: 1px solid var(--pm-border);
        box-shadow: none;
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
    </style>

    <!-- Tour inyectado por AsistenciaTour.js -->

    <div class="pm-asist-root pm-animate-fade-in" style="position:relative; min-height:100vh; padding: 0;">
      ${
        hasConflict
          ? `
        <div class="pm-conflict-banner">
          <i class="bi bi-exclamation-triangle"></i>
          <span>Sesión modificada externamente. Guardado como revisión.</span>
          <button id="pm-conflict-dismiss">&times;</button>
        </div>
      `
          : ''
      }
      
      <div class="pm-asist-header">
        <button id="pm-asist-back" class="pm-icon-btn"><i class="bi bi-arrow-left"></i></button>
        <div style="flex:1">
          <h2 class="pm-asist-title">${escHTML(clase.nombre)}</h2>
          <p class="pm-asist-subtitle">
            ${salonNombre ? `📍 ${escHTML(salonNombre)} · ` : ''}
            ${horario ? `${formatHora(horario.hora_inicio)} – ${formatHora(horario.hora_fin)} · ` : ''}
            <span style="color:var(--pm-primary); font-weight:700;">${formatFechaPortal(new Date(fechaHoy + 'T12:00:00'))}</span> · 
            ${alumnos.length} alumnos
          </p>
        </div>
        <div style="display:flex;align-items:center;gap:0.75rem;">
          <button id="pm-btn-help" class="pm-help-btn" title="Guía rápida"><i class="bi bi-question-lg"></i></button>
          <div class="pm-asist-bulk-circles">
            <button id="btn-bulk-p" class="pm-bulk-circle p" title="Todos presentes">P</button>
            <button id="btn-bulk-a" class="pm-bulk-circle a" title="Todos ausentes">A</button>
          </div>
        </div>
      </div>

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

  // === Editor DSL ===
  const toolbarContainer = container.querySelector('#pm-dsl-toolbar-container')
  const editorContainer = container.querySelector('#pm-dsl-editor-container')

  // Inicializar timer ANTES de usar onChange

  const editor = createDslEditor(editorContainer, {
    initialContent: serverDSL,
    onChange: (value) => {
      dslContent = value /* save deferred only, no autoSave on typing */
    },
  })

  // Pasar contexto para autocompletado (claseId para cargar alumnos)
  editor.setContext({ claseId: claseId })

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
      onCancel: () => {},
    },
  )

  const toolbar = createDslToolbar(toolbarContainer, {
    onInsert: (text, cursorOffset, triggerAC) => editor.insertText(text, cursorOffset, triggerAC),
    getEditorContent: () => editor.getValue(),
    onLoading: (loading) => {
      // Show/hide loading state if needed
    },
    onIaProposal: async (proposal) => {
      // Implementar modal Apple-style aquí si es necesario
    },
    onImproveClick: async (text) => {
      const informeBtn = toolbarContainer.querySelector('#btn-generar-informe')
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
      const structureBtn = toolbarContainer.querySelector('#btn-ia-magic')
      if (structureBtn) structureBtn.disabled = true

      try {
        const indicadorActivo = routeTreeBar?.getActiveIndicador()
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
          // Build class context — present students exclude absent (estado !== 'A')
          const alumnosPresentes = alumnos.filter((a) => estado[a.id] && estado[a.id] !== 'A')
          // Build nombreCorto that is unique within the roster.
          // Default: first name. If two students share the same first name → use "Nombre Apellido".
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
            tipoClase: _inferirTipoClase(clase),
            instrumento: clase.instrumento || '',
            sesionesRecientes: (snapshots || [])
              .slice(-2)
              .map((s) => s.contenido || '')
              .filter(Boolean),
            indicadorActivo: routeTreeBar?.getActiveIndicador()?.nombre || '',
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

  // === Route Selector + Planificacion Card ===
  let activeRutaId = rutaId
  let activePlanificacionId = null
  let planificacionesCache = []

  const planificacionCard = container.querySelector('#pm-planificacion-card')
  const planDropdown = container.querySelector('#pm-planificacion-dropdown')
  const planNombreEl = container.querySelector('#pm-planificacion-nombre')
  const planDetailEl = container.querySelector('#pm-planificacion-detail')
  const planListRutas = container.querySelector('#pm-plan-list-rutas')
  const planListPlanes = container.querySelector('#pm-plan-list-planificaciones')

  // Toggle card open/close
  const planHeader = container.querySelector('#pm-planificacion-header')
  if (planHeader) {
    planHeader.addEventListener('click', () => {
      const isOpen = planificacionCard.classList.toggle('open')
      planDropdown.style.display = isOpen ? 'block' : 'none'
    })
  }

  // Tab switching (Modernizado con pill)
  container.querySelectorAll('.pm-plan-tab-pill').forEach((tab) => {
    tab.addEventListener('click', () => {
      container.querySelectorAll('.pm-plan-tab-pill').forEach((t) => t.classList.remove('active'))
      tab.classList.add('active')
      const tabName = tab.dataset.tab
      planListRutas.style.display = tabName === 'rutas' ? '' : 'none'
      planListPlanes.style.display = tabName === 'planificaciones' ? '' : 'none'
    })
  })

  // Select a route from the dropdown
  function selectRuta(routeVersionId, routeName, routeInstrumento) {
    activeRutaId = routeVersionId
    activePlanificacionId = null

    if (planNombreEl) planNombreEl.textContent = routeName || 'Ruta sin nombre'

    if (planDetailEl) {
      planDetailEl.style.display = ''
      planDetailEl.innerHTML = `
        <div class="pm-planificacion-detail-title">📍 Instrumento</div>
        <div>${routeInstrumento || 'General'}</div>
      `
    }

    // Highlight selected item
    planListRutas.querySelectorAll('.pm-plan-item').forEach((item) => {
      item.classList.toggle('active', item.dataset.rutaId === routeVersionId)
    })
    planListPlanes
      .querySelectorAll('.pm-plan-item')
      .forEach((item) => item.classList.remove('active'))

    // Refresh tree (NO CERRAR DROPDOWN AQUI)
    if (routeTreeBar) {
      routeTreeBar.destroy()
      routeTreeBar = null
    }
    const treeContainer = container.querySelector('#pm-route-tree-container')
    const temaBadge = container.querySelector('#pm-active-tema-badge')

    if (routeVersionId && treeContainer) {
      treeContainer.innerHTML = ''

      // TRAER TEMAS COMPLETADOS HISTORICAMENTE
      _getCompletedTopics(claseId).then((completedTopics) => {
        routeTreeBar = createRouteTreeBar(treeContainer, {
          claseId,
          rutaId: routeVersionId,
          completedTopics,
          onIndicadorSelect: (ind) => {
            editor.insertText(`[${ind.nombre}] `)
            toolbar.setContext({ indicadorActivo: ind.nombre })

            // Actualizar Badge y cerrar
            if (temaBadge) {
              temaBadge.textContent = ind.nombre
              temaBadge.style.display = 'inline-block'
            }
            planificacionCard.classList.remove('open')
            planDropdown.style.display = 'none'

            const obsBtn = container.querySelector('#btn-guardar-obs')
            if (obsBtn) obsBtn.style.display = ''
          },
        })
        _cleanups.push(() => routeTreeBar.destroy())
      })
    }
  }

  // Select a planification (MODERNIZADO: Minimalista)
  function selectPlanificacion(plan) {
    activePlanificacionId = plan.id
    activeRutaId = null

    // GUARDAR PREFERENCIA POR CLASE
    localStorage.setItem(`pm_default_plan_${claseId}`, plan.id)

    if (planNombreEl) planNombreEl.textContent = plan.nombre || plan.name || 'Sin nombre'

    planListPlanes.querySelectorAll('.pm-plan-item').forEach((item) => {
      item.classList.toggle('active', item.dataset.planId === plan.id)
    })

    // RE-INICIALIZAR EL ÁRBOL DE RUTA DINÁMICAMENTE (NO CERRAR DROPDOWN)
    if (routeTreeBar) {
      routeTreeBar.destroy()
      routeTreeBar = null
    }
    const treeContainer = container.querySelector('#pm-route-tree-container')
    const temaBadge = container.querySelector('#pm-active-tema-badge')

    if (activePlanificacionId && treeContainer) {
      treeContainer.innerHTML = ''

      // TRAER TEMAS COMPLETADOS HISTORICAMENTE
      _getCompletedTopics(claseId).then((completedTopics) => {
        routeTreeBar = createRouteTreeBar(treeContainer, {
          claseId,
          rutaId: activePlanificacionId,
          completedTopics,
          onIndicadorSelect: (ind) => {
            editor.insertText(`[${ind.nombre}] `)
            toolbar.setContext({ indicadorActivo: ind.nombre })

            // Actualizar Badge y cerrar
            if (temaBadge) {
              temaBadge.textContent = ind.nombre
              temaBadge.style.display = 'inline-block'
            }
            planificacionCard.classList.remove('open')
            planDropdown.style.display = 'none'
          },
        })
        _cleanups.push(() => routeTreeBar.destroy())
      })
    }
  }

  // BOTÓN GESTIONAR RUTA (Header)
  const manageBtn = container.querySelector('#btn-manage-planning')
  if (manageBtn) {
    manageBtn.onclick = (e) => {
      e.stopPropagation()
      if (!activePlanificacionId) {
        AppModal.open({
          title: 'Atención',
          body: '<p>Seleccioná una planificación primero para poder gestionarla.</p>',
          confirmText: 'Entendido',
          hideCancel: true,
        })
        return
      }
      AppModal.open({
        title: `Gestionar Estructura: ${planNombreEl.textContent}`,
        size: 'xl',
        body: '<div id="modal-route-config-root"></div>',
        saveText: 'Cerrar y Actualizar',
        onSave: async () => {
          if (routeTreeBar) routeTreeBar.refresh()
          return true
        },
      })
      const modalRoot = document.getElementById('modal-route-config-root')
      if (modalRoot) {
        renderRouteConfigurator(modalRoot, activePlanificacionId)
      }
    }
  }

  // Load planificaciones (Biblioteca y Mis Rutas)
  if (planificacionCard) {
    ;(async () => {
      try {
        const planningClasses = await RouteConfigAdapter.getClasses()

        // 1. "Mis Rutas" son los planes que coinciden con el instrumento de la clase o guardados
        const savedPlanId = localStorage.getItem(`pm_default_plan_${claseId}`)
        const claseInstrumentos = (clase.instrumento || '')
          .toLowerCase()
          .split(',')
          .map((i) => i.trim())

        const misRutas = planningClasses.filter((p) => {
          if (p.id === savedPlanId) return true
          const planInst = (p.nombre || '').toLowerCase()
          return claseInstrumentos.some((ci) => planInst.includes(ci))
        })

        if (planListRutas) {
          planListRutas.innerHTML = misRutas.length
            ? misRutas
                .map(
                  (r) => `
              <div class="pm-plan-item ${r.id === savedPlanId ? 'active' : ''}" data-plan-id="${r.id}">
                <span class="pm-plan-item-icon">📍</span>
                <span class="pm-plan-item-name">${escHTML(r.nombre || 'Ruta sin nombre')}</span>
                ${r.id === savedPlanId ? '<span class="pm-tree-badge">ACTIVA</span>' : ''}
              </div>`,
                )
                .join('')
            : '<div style="padding:0.5rem;font-size:0.8rem;color:var(--pm-text-muted)">No hay planes sugeridos para este instrumento</div>'

          planListRutas.querySelectorAll('.pm-plan-item').forEach((item) => {
            item.addEventListener('click', () => {
              const r = misRutas.find((x) => x.id === item.dataset.planId)
              if (r) selectPlanificacion(r)
            })
          })
        }

        // 2. "Biblioteca" es todo el catálogo
        if (planListPlanes) {
          planListPlanes.innerHTML = planningClasses
            .map(
              (p) => `
            <div class="pm-plan-item" data-plan-id="${p.id}">
              <span class="pm-plan-item-icon">📚</span>
              <span class="pm-plan-item-name">${escHTML(p.nombre || p.name)}</span>
            </div>`,
            )
            .join('')

          planListPlanes.querySelectorAll('.pm-plan-item').forEach((item) => {
            item.addEventListener('click', () => {
              const p = planningClasses.find((x) => x.id === item.dataset.planId)
              if (p) selectPlanificacion(p)
            })
          })
        }

        // Mostrar card
        planificacionCard.style.display = ''

        // AUTO-SELECCIÓN
        const savedMatch = planningClasses.find((c) => c.id === savedPlanId)
        const initialMatch =
          savedMatch || misRutas[0] || (await RouteConfigAdapter.resolveSmartPlan(clase))
        if (initialMatch) selectPlanificacion(initialMatch)
      } catch (err) {
        console.warn('[asistencia] Error cargando planificación unificada:', err)
      }
    })()
  }

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

  // Botón "Copiar como planificación"
  const copyPlanBtn = container.querySelector('#btn-copy-as-plan')
  if (copyPlanBtn) {
    copyPlanBtn.addEventListener('click', async () => {
      const dslContent = editor.getValue()

      // Si el editor está vacío, aún permitimos crear una planificación vacía
      // (el modal mostrará error solo si el usuario intenta guardar sin tema)

      const clases = await getMisClases()

      // Pre-llenar datos iniciales desde la asistencia actual
      const initialData = {
        clase_id: claseId,
        maestro_id: maestro?.id || null,
        maestro_nombre: maestro?.nombre_completo || null,
        contenido: dslContent || '',
        fecha_inicio: fechaHoy,
      }

      openPlanificacionModal('create', null, clases, [], initialData, async (datos) => {
        try {
          await crearPlanificacion({
            ...datos,
            estado: 'planificado',
          })

          // Toast de éxito estilizado
          const toast = document.createElement('div')
          toast.className = 'pm-toast-success'
          toast.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            Planificación creada exitosamente
          `
          document.body.appendChild(toast)
          setTimeout(() => toast.remove(), 3000)
        } catch (err) {
          console.error('[asistencia] Error guardando planificación:', err)
          AppToast.error('Error al guardar la planificación: ' + (err.message || err))
        }
      })
    })
  }

  // === Route Tree Bar (Inicialización diferida movida a selectPlanificacion) ===
  // let routeTreeBar = null (Ya declarado arriba)
  if (rutaId) {
    const treeContainer = container.querySelector('#pm-route-tree-container')
    routeTreeBar = createRouteTreeBar(treeContainer, {
      claseId,
      rutaId,
      onIndicadorSelect: (ind) => {
        // Insert indicator name into editor
        editor.insertText(`[${ind.nombre}] `)
        // Update toolbar context
        toolbar.setContext({ indicadorActivo: ind.nombre })
        // Show the save observation button when an indicator is selected
        const obsBtn = container.querySelector('#btn-guardar-obs')
        if (obsBtn) obsBtn.style.display = ''
      },
    })
    _cleanups.push(() => routeTreeBar.destroy())
  }

  // === Ruta topic auto-injection ===
  console.log('[DEBUG] Reached handoff section')
  const rutaTema = consumeRutaTema()
  if (rutaTema && rutaTema.claseId === claseId) {
    const temaText = `[${rutaTema.nombre}] `
    editor.insertText(temaText)
    toolbar.setContext({ indicadorActivo: rutaTema.nombre })

    const obsBtn = container.querySelector('#btn-guardar-obs')
    if (obsBtn) obsBtn.style.display = ''

    const editorContainer = container.querySelector('#pm-dsl-editor-container')
    if (editorContainer) {
      const banner = document.createElement('div')
      banner.style.cssText = `
        background:#eff6ff;border:1px solid #93c5fd;border-radius:8px;
        padding:8px 12px;margin-bottom:8px;font-size:12px;color:#1d4ed8;
        display:flex;align-items:center;gap:8px;
      `
      banner.innerHTML = `
        <i class="bi bi-diagram-3"></i>
        Tema cargado desde Ruta: <strong>${rutaTema.nombre.replace(/</g, '&lt;')}</strong>
        <button onclick="this.parentElement.remove()" style="
          margin-left:auto;background:none;border:none;cursor:pointer;
          font-size:12px;color:#1d4ed8;
        ">✕</button>
      `
      editorContainer.parentElement.insertBefore(banner, editorContainer)
    }
  }

  // === Modal de Justificación ===
  // Creado aquí para capturar el sesionId MUTABLE (let sesionId) que _autoSave actualiza.
  // Si se creara en renderAsistenciaView, capturaría el const sesionId inicial (posiblemente null).
  const _justifModal = createJustificacionModal(document.body, {
    onDelete: async ({ alumnoId, justificacionId, existingUrl }) => {
      // Eliminar archivo de Storage si existe
      if (existingUrl) {
        const match = existingUrl.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)/)
        if (match)
          supabase.storage
            .from('documentos')
            .remove([match[1]])
            .catch(() => {})
      }
      // Eliminar registro en DB
      if (justificacionId) eliminarJustificacion(justificacionId).catch(console.warn)
      // Limpiar estado local y deseleccionar alumno
      estado[alumnoId] = null
      delete justificaciones[alumnoId]
      renderLista(alumnoId)
      _updateProgress()
      await _autoSave(true)
      announce(`Justificación eliminada.`)
    },
    onSave: async ({ alumnoId, motivo, evidenciaFile, justificacionId, existingUrl, isEdit }) => {
      const saveBtn = document.getElementById('pm-justif-save')
      if (saveBtn) {
        saveBtn.disabled = true
      }
      try {
        let savedRecord = null
        if (isEdit && justificacionId) {
          // Update: reemplazar evidencia solo si hay archivo nuevo
          let urlToSave = existingUrl
          if (evidenciaFile) {
            if (existingUrl) {
              const match = existingUrl.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)/)
              if (match)
                await supabase.storage
                  .from('documentos')
                  .remove([match[1]])
                  .catch(() => {})
            }
            const { data: uploadData } = await supabase.storage
              .from('documentos')
              .upload(
                `justificaciones/${Date.now()}_${Math.random().toString(36).slice(2)}.${evidenciaFile.name.split('.').pop()}`,
                evidenciaFile,
              )
              .catch(() => ({ data: null }))
            if (uploadData) {
              const { data: urlData } = supabase.storage
                .from('documentos')
                .getPublicUrl(uploadData.path)
              urlToSave = urlData.publicUrl
            }
          }
          const { data, error } = await supabase
            .from('justificaciones')
            .update({ motivo, evidencia_url: urlToSave })
            .eq('id', justificacionId)
            .select()
            .single()
          if (error) throw error
          savedRecord = data
        } else {
          // Asegurar que haya sesión antes de guardar
          if (!sesionId) await _autoSave(true, false)
          const result = await guardarJustificacion(
            { sesionId, alumnoId, claseId, fecha: fechaHoy, motivo, creadoPor: maestro.id },
            evidenciaFile,
          )
          if (result.error) throw result.error
          savedRecord = result.data
        }
        // Actualizar en memoria para que la próxima apertura del modal pre-llene el formulario
        if (savedRecord) justificaciones[alumnoId] = savedRecord
        _justifModal.close()
      } catch (err) {
        console.error('[justificacion] Error guardando:', err)
        alert('Error al guardar la justificación: ' + err.message)
      } finally {
        if (saveBtn) {
          saveBtn.disabled = false
        }
      }
    },
    onCancel: (alumnoId, prevEstado) => {
      // Rollback: restaurar estado anterior del alumno
      estado[alumnoId] = prevEstado
      renderLista(alumnoId)
      _updateProgress()
    },
  })
  _cleanups.push(() => {
    try {
      _justifModal.close()
    } catch (_) {}
  })

  // === Auto-Draft ===
  let autoDraft = null
  const draftIndicator = container.querySelector('#pm-draft-indicator')

  if (sesionId) {
    autoDraft = createAutoDraft({
      saveFn: async (content) => {
        if (!sesionId) return
        await saveDraft(sesionId, maestro.id, content)
      },
      debounceMs: 30000,
    })

    autoDraft.onSaved(() => {
      const now = new Date()
      const hh = String(now.getHours()).padStart(2, '0')
      const mm = String(now.getMinutes()).padStart(2, '0')
      draftIndicator.textContent = `Borrador guardado ${hh}:${mm}`
      draftIndicator.style.display = ''
    })

    // Wire editor onChange to autoDraft
    const originalOnChange = editor.getValue // capture ref
    const _origEditorOnInput = editorContainer.querySelector('#pm-dsl-editable')
    if (_origEditorOnInput) {
      const origHandler = _origEditorOnInput.oninput
      _origEditorOnInput.oninput = function (e) {
        if (origHandler) origHandler.call(this, e)
        if (autoDraft) autoDraft.onInput(editor.getValue())
      }
    }

    _cleanups.push(() => autoDraft.destroy())

    // Check for existing draft and offer recovery — ONLY if session is actually a draft
    if (sesionExistenteData?.borrador === true) {
      loadDraft(sesionId, maestro.id)
        .then((draft) => {
          if (draft && draft.contenido_raw && draft.contenido_raw.trim()) {
            const ts = draft.updated_at ? new Date(draft.updated_at).toLocaleString('es-AR') : ''
            const recover = confirm(
              `Hay un borrador guardado${ts ? ` (${ts})` : ''}.\n\n¿Deseas recuperarlo?`,
            )
            if (recover) {
              editor.setValue(draft.contenido_raw)
              dslContent = draft.contenido_raw
            } else {
              discardDraft(draft.id).catch((err) =>
                console.warn('[autoDraft] Error discarding:', err),
              )
            }
          }
        })
        .catch((err) => console.warn('[autoDraft] Error loading draft:', err))
    }
  }

  // === Academic Content Flow ===
  let activeClassEventId = null
  let activeLevel = null
  let academicPanelInstances = []
  const academicToolsContainer = container.querySelector('#pm-academic-tools')

  // Nota: Eliminamos la carga global de ContentSelectionPanel aquí
  // para evitar el error de studentId requerido.
  // El flujo ahora es 100% contextual al interactuar con un alumno.

  // === Save Observation Button ===
  const obsSaveBtn = container.querySelector('#btn-guardar-obs')
  if (obsSaveBtn) {
    // Show button if there is a route
    if (rutaId) obsSaveBtn.style.display = ''

    obsSaveBtn.onclick = async () => {
      const raw = editor.getValue()
      if (!raw || !raw.trim()) {
        AppToast.warning('El editor está vacío. Escribe observaciones antes de guardar.')
        return
      }

      if (!sesionId) {
        AppToast.warning(
          'Primero guarda la sesión (asistencia) para poder registrar observaciones.',
        )
        return
      }

      let indicadorActivo = null
      const textoIndicador = await _resolveActiveIndicador(raw)
      const treeIndicador = routeTreeBar?.getActiveIndicador()

      // PRIORIDAD: 1. Lo que escribió explícitamente [ ] > 2. Lo que seleccionó en el árbol
      indicadorActivo = textoIndicador || treeIndicador

      if (!indicadorActivo) {
        AppToast.warning(
          'Seleccione un indicador en la ruta antes de guardar la observación o escríbalo entre corchetes [Ejemplo].',
        )
        return
      }

      // Sincronizar Badge visual si se auto-resolvió
      const temaBadge = container.querySelector('#pm-active-tema-badge')
      if (temaBadge && indicadorActivo.nombre) {
        temaBadge.textContent = indicadorActivo.nombre
        temaBadge.style.display = 'inline-block'
      }

      obsSaveBtn.disabled = true
      obsSaveBtn.textContent = 'Procesando...'

      try {
        const presentes = alumnos.filter((a) => estado[a.id] === 'P')

        // Bimodal pipeline: detecta natural vs DSL y procesa automáticamente
        const resultado = await processarEvaluacion(
          raw,
          indicadorActivo.id,
          presentes,
          indicadorActivo.nombre,
        )

        if (resultado.error) throw new Error(resultado.error)

        // Si se usó IA, mostrar el DSL generado para confirmación
        if (resultado.modo === 'natural' && resultado.dslGenerado) {
          const confirmar = confirm(
            '📝 Texto convertido a formato estructurado:\n\n' +
              resultado.dslGenerado +
              '\n\n' +
              '¿Guardar la evaluación?',
          )
          if (!confirmar) {
            obsSaveBtn.disabled = false
            obsSaveBtn.textContent = 'Guardar observación'
            return
          }
        }

        // Warn about missing students
        if (resultado.missing.length > 0) {
          const proceed = confirm(
            `Faltan ${resultado.missing.length} alumno(s) sin evaluar:\n${resultado.missing.join(', ')}\n\n¿Guardar de todas formas?`,
          )
          if (!proceed) {
            obsSaveBtn.disabled = false
            obsSaveBtn.textContent = 'Guardar observación'
            return
          }
        }

        // Save evaluations to indicator_attempts
        if (resultado.evaluaciones.length > 0) {
          const { error } = await saveEvaluaciones(
            sesionId,
            indicadorActivo.id,
            resultado.evaluaciones,
            maestro.id,
          )
          if (error) throw error
        }

        // Save observation record — guarda texto original + DSL de IA si corresponde
        const parsed = { indicador_id: indicadorActivo.id, evaluaciones: resultado.evaluaciones }
        await saveObservation(sesionId, maestro.id, raw, parsed, resultado.dslGenerado || null)

        // Auto-save !STATE tokens from DSL if present — fire-and-forget, does not block the save flow
        const _parsedForProgress = parseDSL(raw)
        if (_parsedForProgress.estados && _parsedForProgress.estados.length > 0) {
          const _alumnosConId = alumnos.map((a) => ({
            id: a.id,
            nombre: a.nombre_completo || a.nombre || '',
            nombreCorto: (a.nombre_completo || a.nombre || '').split(' ')[0],
          }))
          saveProgressFromDSL({
            sesionId,
            claseId,
            maestroId: maestro.id,
            fechaHoy,
            dslText: raw,
            alumnos: _alumnosConId,
          })
            .then(({ saved, errors }) => {
              if (errors.length) console.warn('[Progress DSL] Errores:', errors)
              if (saved.length) _showProgressFeedback(saved, editorContainer)
            })
            .catch((err) => console.warn('[Progress DSL] Error:', err.message))
        }

        // Fase C: Pipeline de Promoción — Promover notas individuales a la ficha histórica del alumno
        const promo = await promocionarObservacionesAlumnos(
          sesionId,
          claseId,
          maestro.id,
          resultado.evaluaciones,
          clase.nombre || 'Clase',
        )

        if (!promo.success) {
          console.warn('[Fase C] Fallo parcial en promoción:', promo.error)
          // No bloqueamos el flujo principal pero informamos por consola
        }

        // Refresh route tree semaphore
        if (routeTreeBar) await routeTreeBar.refresh()

        // Clear editor
        editor.setValue('')
        dslContent = ''

        // Toast profesional con feedback extendido
        const toast = document.createElement('div')
        toast.innerHTML = `
          <div style="display:flex; flex-direction:column; align-items:center; gap:4px;">
            <span>✅ Observación guardada exitosamente (${resultado.evaluaciones.length} eval.)</span>
            <span style="font-size:0.85em; opacity:0.9;">Tema detectado: <b>${indicadorActivo.nombre}</b></span>
          </div>
        `
        toast.style.cssText =
          'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:var(--pm-surface, #1e1e1e);color:#fff;padding:12px 24px;border-radius:12px;z-index:10000;font-size:14px;font-weight:600;box-shadow:0 8px 24px rgba(0,0,0,0.3); border: 1px solid var(--apple-success, #22c55e);'
        document.body.appendChild(toast)
        setTimeout(() => toast.remove(), 4500)

        // Update class event status and check level completion
        if (activeClassEventId) {
          try {
            await updateClassEventStatus(activeClassEventId, 'completed')
          } catch (ceErr) {
            console.warn('[asistencia] Error updating class event status:', ceErr)
          }

          if (activeLevel) {
            try {
              const { academicService } =
                await import('../../modules/academic-routes/services/academicService.js')
              const presentes = alumnos.filter((a) => estado[a.id] === 'P')
              for (const student of presentes) {
                // status: 'approved' means level is completed
                const levelResult = await academicService.checkLevelCompletion(
                  student.id,
                  activeLevel,
                )
                if (levelResult && levelResult.status === 'approved') {
                  const modal = createLevelCompletionModal({
                    studentId: student.id,
                    levelId: activeLevel,
                    onConfirm: () => {
                      console.log('[asistencia] Level completion confirmed for', student.id)
                    },
                  })
                  container.querySelector('.pm-asist-root').appendChild(modal.el || modal)
                }
              }
            } catch (lcErr) {
              console.warn('[asistencia] Error checking level completion:', lcErr)
            }
          }
        }

        obsSaveBtn.textContent = '¡Guardado!'
        setTimeout(() => {
          obsSaveBtn.textContent = 'Guardar observación'
          obsSaveBtn.disabled = false
        }, 2000)
      } catch (err) {
        console.error('[asistencia] Error saving observation:', err)
        AppToast.error('Error al guardar: ' + (err.message || err))
        obsSaveBtn.disabled = false
        obsSaveBtn.textContent = 'Guardar observación'
      }
    }
  }

  // === Student Progress Panel tracking ===
  let _activeProgressPanel = null

  // === Render Lista con Animación ===
  const listEl = container.querySelector('#pm-alumnos-list')

  function renderLista(animateId = null) {
    const sorted = _sortAlumnos(alumnos, estado)

    // Si hay un ID para animar, capturamos su posición previa
    let prevRect = null
    if (animateId) {
      const el = listEl.querySelector(`[data-id="${animateId}"]`)
      if (el) prevRect = el.getBoundingClientRect()
    }

    listEl.innerHTML = sorted.map((a) => _renderAlumnoItem(a, estado[a.id])).join('')

    if (animateId && prevRect) {
      const newEl = listEl.querySelector(`[data-id="${animateId}"]`)
      const newRect = newEl.getBoundingClientRect()
      const deltaY = prevRect.top - newRect.top

      newEl.animate(
        [
          { transform: `translateY(${deltaY}px)`, opacity: 0.7 },
          { transform: 'translateY(0)', opacity: 1 },
        ],
        {
          duration: 300,
          easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        },
      )
    }
  }

  function _renderAlumnoItem(a, est) {
    const colorClass = est ? `estado-${est.toLowerCase()}` : ''
    return `
      <div class="pm-asist-item ${colorClass}" data-id="${a.id}">
        <div class="pm-asist-avatar">${a.nombre_completo[0]}</div>
        <div class="pm-asist-info">
          <span class="pm-asist-nombre">${escHTML(a.nombre_completo)}</span>
          <span class="pm-asist-instrumento">${escHTML(a.instrumento_principal || '—')}</span>
        </div>
        <div class="pm-asist-btns">
          <button class="pm-asist-btn ${est === 'P' ? 'active-p' : ''}" data-action="P" data-id="${a.id}">P</button>
          <button class="pm-asist-btn ${est === 'J' ? 'active-j' : ''}" data-action="J" data-id="${a.id}">J</button>
          <button class="pm-asist-btn ${est === 'A' ? 'active-a' : ''}" data-action="A" data-id="${a.id}">A</button>
        </div>
    </div>
    `
  }

  listEl.onclick = async (e) => {
    const btn = e.target.closest('.pm-asist-btn')
    const nameLabel = e.target.closest('.pm-asist-nombre')

    if (nameLabel) {
      const studentId = nameLabel.closest('.pm-asist-item').dataset.id
      const student = alumnos.find((a) => a.id === studentId)

      // If route is available, open progress panel instead of evaluation drawer
      if (rutaId) {
        if (_activeProgressPanel) _activeProgressPanel.destroy()
        _activeProgressPanel = createStudentProgressPanel({
          alumno: student,
          rutaId,
          sessionId: sesionId,
          claseId: claseId,
          fecha: fechaHoy,
          horaInicio: horario?.hora_inicio || null,
        })
        _activeProgressPanel.open()
        _cleanups.push(() => {
          if (_activeProgressPanel) _activeProgressPanel.destroy()
        })
        return
      }

      // Fallback: evaluation drawer when no route
      let studentSnapshots = snapshots.filter((s) => s.student_id === studentId)

      // LAZY SNAPSHOT CREATION: Si el alumno no tiene snapshot, intentar crearlo al vuelo
      if (studentSnapshots.length === 0) {
        try {
          const { academicService } =
            await import('../../modules/academic-routes/services/academicService.js')
          const newSnaps = await academicService.createSnapshotForStudent(
            sesionId,
            studentId,
            fechaHoy,
          )
          if (newSnaps) {
            studentSnapshots = newSnaps
            snapshots.push(...newSnaps)
          } else {
            console.warn(`No se encontró planificación activa para el alumno ${studentId}`)
          }
        } catch (err) {
          console.error('Error creando snapshot on-demand:', err)
        }
      }

      createEvaluationDrawer(container, {
        student,
        sessionId: sesionId,
        teacherId: maestro.id,
        snapshots: studentSnapshots,
      })
      return
    }

    if (!btn) return
    const { id, action } = btn.dataset

    // Haptic feedback
    if (window.navigator.vibrate) window.navigator.vibrate(10)

    // === Interceptor para estado "J" (Justificado): abrir modal de justificación ===
    if (action === 'J') {
      const alumno = alumnos.find((a) => a.id === id)
      if (!alumno) return

      // Si ya está J → abrir modal en modo edición (ver/modificar motivo guardado)
      // Si no está J → marcar J y abrir modal para registrar motivo
      if (estado[id] === 'J') {
        // Modo edición: pre-cargar datos guardados
        let justifExistente = justificaciones[id] || null
        if (!justifExistente && sesionId) {
          justifExistente = await obtenerJustificacion(sesionId, id)
          if (justifExistente) justificaciones[id] = justifExistente
        }
        _justifModal.open(alumno, justifExistente, null)
        announce(`Editando justificación de ${alumno.nombre_completo}.`)
      } else {
        // Marcar J ANTES de abrir modal para que el botón quede visible
        estado[id] = 'J'
        renderLista(id)
        _updateProgress()
        await _autoSave(true)

        // Modo creación: modal vacío (sin datos previos)
        _justifModal.open(alumno, null, null)
        announce(`Justificación marcada para ${alumno.nombre_completo}.`)
      }
      return
    }

    estado[id] = estado[id] === action ? null : action
    renderLista(id)
    _updateProgress()

    // Announce current attendance count
    const presentes = Object.values(estado).filter((v) => v === 'P').length
    const ausentes = Object.values(estado).filter((v) => v === 'A').length
    const justificados = Object.values(estado).filter((v) => v === 'J').length
    announce(
      `Asistencia actualizada. ${presentes} presentes, ${ausentes} ausentes, ${justificados} justificados.`,
    )

    // Guardado inmediato para evitar race conditions al navegar
    await _autoSave(true)
  }

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
        clase_id: claseId,
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
            clase_id: claseId,
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
      if (tieneAsistenciaMarcada) {
        try {
          const asistenciaConSesion = asistencia.map((a) => ({
            ...a,
            ...(sesionId && { sesion_clase_id: sesionId }),
          }))
          await registrarAsistenciaBulk(asistenciaConSesion)
          console.log('[asistencia] Registradas asistencias individuales:', asistenciaConSesion.length)
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

        const summaryPanel = createSessionSummaryPanel()
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
            const bodyText = _generarReporteTexto(asistenciaData, dslContent, alumnos, clase)
            _abrirEnlaceConLimite(`mailto:?subject=${subject}&body=`, bodyText, 1800)
          }

        if (whatsBtn)
          whatsBtn.onclick = async () => {
            const asistenciaData = alumnos
              .filter((a) => estado[a.id])
              .map((a) => ({
                alumno_id: a.id,
                estado: estado[a.id],
              }))
            const bodyText = _generarReporteTexto(asistenciaData, dslContent, alumnos, clase)
            _abrirEnlaceConLimite('https://wa.me/?text=', bodyText, 1600)
          }

        if (volverHoyBtn)
          volverHoyBtn.onclick = () => {
            window.location.hash = '#/hoy'
          }

        if (calBtn)
          calBtn.onclick = () => {
            window.location.hash = '#/calendario'
          }

        const reporteDiaBtn = overlay.querySelector('#btn-reporte-dia-overlay')
        if (reporteDiaBtn)
          reporteDiaBtn.onclick = async () => {
            reporteDiaBtn.disabled = true
            reporteDiaBtn.innerHTML = '<i class="bi bi-hourglass-split"></i> Generando…'
            await generateDailyReport(sesionId)
            reporteDiaBtn.disabled = false
            reporteDiaBtn.innerHTML = '<i class="bi bi-file-earmark-pdf"></i> Reporte del día (PDF)'
          }

        const resumenMesBtn = overlay.querySelector('#btn-resumen-mes-overlay')
        if (resumenMesBtn)
          resumenMesBtn.onclick = async () => {
            resumenMesBtn.disabled = true
            resumenMesBtn.innerHTML = '<i class="bi bi-hourglass-split"></i> Generando…'
            const now = new Date()
            await generateMonthlyAttendance(claseId, now.getFullYear(), now.getMonth() + 1)
            resumenMesBtn.disabled = false
            resumenMesBtn.innerHTML = '<i class="bi bi-bar-chart-line"></i> Resumen del mes (PDF)'
          }

        const informePedBtn = overlay.querySelector('#btn-informe-ped-overlay')
        if (informePedBtn)
          informePedBtn.onclick = async () => {
            informePedBtn.disabled = true
            informePedBtn.innerHTML = '<i class="bi bi-hourglass-split"></i> Generando…'
            const now = new Date()
            await generateMonthlyPedagogical(claseId, now.getFullYear(), now.getMonth() + 1)
            informePedBtn.disabled = false
            informePedBtn.innerHTML = '<i class="bi bi-mortarboard"></i> Informe pedagógico (PDF)'
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

  function _inferirTipoClase(clase) {
    const nombre = (clase?.nombre || '').toLowerCase()
    const instrumento = (clase?.instrumento || '').toLowerCase()
    if (/orquesta|ensamble|ensemble|coro|ensayo/.test(nombre)) return 'ensayo_general'
    if (/teor[ií]a|solfeo|lenguaje\s+musical/.test(nombre)) return 'teoria'
    if (instrumento) return 'instrumento'
    return 'instrumento'
  }

  function _showProgressFeedback(saved, editorContainer) {
    if (!saved || saved.length === 0) return

    // Remove any existing badge
    editorContainer.parentNode
      .querySelectorAll('.pm-progress-feedback')
      .forEach((el) => el.remove())

    const names = [...new Set(saved.slice(0, 3).map((s) => s.contenido || 'progreso'))]
    const label = names.join(' · ') + (saved.length > 3 ? ` y ${saved.length - 3} más` : '')

    const badge = document.createElement('div')
    badge.className = 'pm-progress-feedback'
    badge.innerHTML = `<i class="bi bi-check-circle-fill"></i> <span>${saved.length} registro(s) guardados — ${label}</span>`
    editorContainer.parentNode.insertBefore(badge, editorContainer.nextSibling)

    setTimeout(() => badge.remove(), 4200)
  }

  // === Helper functions (definidas aquí para evitar TDZ con let) ===
  function _resetFooter(container, originalBtn) {
    const footer = container.querySelector('.pm-asist-footer')
    footer.innerHTML = `
      <button class="pm-btn pm-btn-primary" id="btn-guardar" style="width:100%; font-weight:700;">
        Guardar sesión
      </button>
    `
    footer.querySelector('#btn-guardar').onclick = originalBtn.onclick
    container.querySelector('#btn-guardar').style.display = ''
    container.querySelector('#btn-guardar').textContent = 'Guardar sesión'
    container.querySelector('#btn-guardar').style.background = ''
  }

  function _generarReporteTexto(asistencia, contenido, alumnos, clase) {
    if (!clase) return 'No hay datos de clase disponibles.'

    const presentes = (asistencia || []).filter((a) => a.estado === 'P').length
    const ausentes = (asistencia || []).filter((a) => a.estado === 'A').length
    const justificados = (asistencia || []).filter((a) => a.estado === 'J').length

    let texto = `Reporte de Clase - ${clase.nombre || 'Sin nombre'}\n`
    texto += `Fecha: ${fechaHoy || ''}\n`
    texto += `Instrumento: ${clase.instrumento || 'N/A'}\n\n`
    texto += `RESUMEN DE ASISTENCIA\n`
    texto += `Presentes: ${presentes} | Ausentes: ${ausentes} | Justificados: ${justificados}\n\n`

    if (contenido && contenido.trim()) {
      texto += `CONTENIDO DE LA CLASE:\n${contenido}\n\n`
    }

    texto += `DETALLE DE ALUMNOS:\n`
    ;(asistencia || []).forEach((a) => {
      const alum = (alumnos || []).find((al) => al.id === a.alumno_id)
      const nombre = alum?.nombre_completo || 'Alumno'
      const estadoTexto =
        a.estado === 'P' ? 'Presente' : a.estado === 'A' ? 'Ausente' : 'Justificado'
      texto += `- ${nombre}: ${estadoTexto}\n`
    })

    return texto
  }

  function _abrirEnlaceConLimite(url, textoPlano, maxChars = 1800) {
    if (textoPlano.length > maxChars) {
      const descripcion =
        textoPlano.slice(0, maxChars) +
        '…\n\n[Texto truncado — el reporte completo excede el límite de caracteres]'
      AppToast.warn(
        `El texto se truncó (${textoPlano.length} caracteres, máximo ${maxChars}). Usá la opción PDF para ver el reporte completo.`,
      )
      window.open(url + encodeURIComponent(descripcion), '_blank')
    } else {
      window.open(url + encodeURIComponent(textoPlano), '_blank')
    }
  }

  container.querySelector('#pm-asist-back').onclick = () => {
    tour.destroy()
    try {
      _justifModal.close()
    } catch (_) {}
    _cleanups.forEach((fn) => {
      try {
        fn()
      } catch (_) {}
    })
    window.location.hash = '#/hoy'
  }

  // === Bulk Actions Logic ===
  container.querySelector('#btn-bulk-p').onclick = async () => {
    alumnos.forEach((a) => {
      estado[a.id] = 'P'
    })
    renderLista()
    _updateProgress()
    await _autoSave(true)
    announce(`Todos los ${alumnos.length} alumnos marcados como presentes.`)
  }

  container.querySelector('#btn-bulk-a').onclick = async () => {
    alumnos.forEach((a) => {
      estado[a.id] = 'A'
    })
    renderLista()
    _updateProgress()
    await _autoSave(true)
    announce(`Todos los ${alumnos.length} alumnos marcados como ausentes.`)
  }

  renderLista()

  /**
   * Obtiene la lista de nombres de temas ya dados en sesiones anteriores de esta clase.
   * Escanea el contenido DSL buscando el patrón [Nombre del Tema].
   */
  async function _getCompletedTopics(claseId) {
    try {
      const { data: sesiones } = await supabase
        .from('sesiones_clase')
        .select('contenido')
        .eq('clase_id', claseId)
        .not('contenido', 'is', null)

      if (!sesiones) return []

      const topics = new Set()
      // Regex para encontrar [Texto]
      const regex = /\[(.*?)\]/g

      sesiones.forEach((s) => {
        if (!s.contenido) return
        let match
        while ((match = regex.exec(s.contenido)) !== null) {
          if (match[1]) topics.add(match[1].trim())
        }
      })

      return Array.from(topics)
    } catch (err) {
      console.warn('[AsistenciaView] Error calculando progreso histórico:', err)
      return []
    }
  }

  /**
   * Intenta resolver el indicador (tema) activo analizando el texto.
   * Busca el patrón [Texto] y hace un 'fuzzy match' inteligente con la jerarquía.
   */
  async function _resolveActiveIndicador(text) {
    if (!text || !activePlanificacionId) return null

    // Extraer texto entre corchetes
    const match = text.match(/\[(.*?)\]/)
    if (!match || !match[1]) return null

    const rawTema = match[1].trim().toLowerCase()

    // Función para limpiar stop words y extraer keywords
    const getKeywords = (str) => {
      const stopWords = [
        'se',
        'hizo',
        'la',
        'el',
        'los',
        'las',
        'un',
        'una',
        'de',
        'del',
        'en',
        'con',
        'por',
        'para',
        'y',
        'o',
        'tema',
        'indicador',
      ]
      return str
        .toLowerCase()
        .replace(/[^\w\sáéíóúñ]/g, '') // Quitar puntuación
        .split(/\s+/)
        .filter((w) => w.length > 2 && !stopWords.includes(w))
    }

    const targetKeywords = getKeywords(rawTema)
    if (targetKeywords.length === 0) return null

    try {
      const hierarchy = await RouteConfigAdapter.getRouteHierarchy(activePlanificacionId)

      let bestMatch = null
      let maxScore = 0

      // Buscar el mejor match en toda la jerarquía
      for (const nivel of hierarchy) {
        for (const tema of nivel.plan_temas || []) {
          for (const obj of tema.plan_objetivos || []) {
            const objKeywords = getKeywords(obj.nombre)

            // Calcular score: cuántas targetKeywords están en objKeywords
            let score = 0
            for (const tk of targetKeywords) {
              if (objKeywords.some((ok) => ok.includes(tk) || tk.includes(ok))) {
                score++
              }
            }

            // Bonificación por coincidencia exacta de la cadena completa (sin stop words)
            if (obj.nombre.toLowerCase().includes(rawTema)) {
              score += 5
            }

            // Normalizar score por longitud para priorizar matches más específicos
            const finalScore = score / (objKeywords.length || 1)

            if (score > 0 && finalScore > maxScore) {
              maxScore = finalScore
              bestMatch = { id: obj.id, nombre: obj.nombre }
            }
          }
        }
      }

      if (bestMatch) {
        console.log(
          `[asistencia] Indicador auto-resuelto con fuzzy match: '${bestMatch.nombre}' (Score: ${maxScore.toFixed(2)})`,
        )
        return bestMatch
      }
    } catch (err) {
      console.warn('[asistencia] Error en auto-resolución de indicador:', err)
    }

    return null
  }

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
    } catch (_) {}
    _cleanups.forEach((fn) => {
      try {
        fn()
      } catch (_) {}
    })
  }
}

function _sortAlumnos(alumnos, estado) {
  return [...alumnos].sort((a, b) => {
    const aM = estado[a.id] !== null
    const bM = estado[b.id] !== null
    if (!aM && bM) return -1
    if (aM && !bM) return 1
    return 0
  })
}

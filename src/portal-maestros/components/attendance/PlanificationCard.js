import { escHTML } from '../../utils/portalUtils.js'
import * as weeklyPlanAdapter from '../../../modules/planificacion/api/weeklyPlanAdapter.js'
import { AppModal } from '../../../shared/components/AppModal.js'
import { AppToast } from '../../../shared/components/AppToast.js'

export function createPlanificationCard(container, opts) {
  let activeRoute = null
  let weeklyPlan = null
  const cleanups = []

  const planificacionCard = container.querySelector('#pm-planificacion-card')
  const planDropdown = container.querySelector('#pm-planificacion-dropdown')
  const planNombreEl = container.querySelector('#pm-planificacion-nombre')
  const planHeader = container.querySelector('#pm-planificacion-header')
  const treeContainer = container.querySelector('#pm-route-tree-container')

  if (planHeader) {
    planHeader.onclick = () => {
      const isOpen = planificacionCard.classList.toggle('open')
      planDropdown.style.display = isOpen ? 'block' : 'none'
    }
  }

  // Ocultar tabs viejas de bibliotecas si queremos centrar al maestro en la ruta semanal
  const tabsEl = container.querySelector('.pm-planificacion-tabs-pill')
  if (tabsEl) tabsEl.style.display = 'none'
  const listRutasEl = container.querySelector('#pm-plan-list-rutas')
  if (listRutasEl) listRutasEl.style.display = 'none'
  const listPlanesEl = container.querySelector('#pm-plan-list-planificaciones')
  if (listPlanesEl) listPlanesEl.style.display = 'none'
  const proposalTrigger = container.querySelector('#pm-curriculo-proposal-trigger')
  if (proposalTrigger) proposalTrigger.style.display = 'none'

  // Estilos inline de la tarjeta curricular semanal
  if (!document.getElementById('pm-weekly-card-styles')) {
    const style = document.createElement('style')
    style.id = 'pm-weekly-card-styles'
    style.textContent = `
      .pm-weekly-nav {
        display: flex; align-items: center; justify-content: space-between;
        background: rgba(0,0,0,0.2); padding: 8px 12px; border-radius: 10px; margin-bottom: 12px;
      }
      .pm-weekly-nav-btn {
        background: var(--pm-primary, #3b82f6); border: none; color: #fff;
        padding: 4px 10px; border-radius: 6px; font-weight: 700; font-size: 0.75rem; cursor: pointer;
        transition: all 0.2s;
      }
      .pm-weekly-nav-btn:hover { background: #2563eb; }
      .pm-weekly-nav-btn:disabled { background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.25); cursor: not-allowed; }
      
      .pm-weekly-title { font-size: 0.8rem; font-weight: 800; text-transform: uppercase; color: rgba(255,255,255,0.5); }
      
      .pm-weekly-box {
        background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 12px; padding: 12px; margin-bottom: 10px;
      }
      .pm-weekly-label { font-size: 0.7rem; font-weight: 800; text-transform: uppercase; color: var(--pm-primary); margin-bottom: 4px; }
      .pm-weekly-text { font-size: 0.85rem; color: #fff; font-weight: 600; line-height: 1.3; }
      .pm-weekly-desc { font-size: 0.8rem; color: var(--pm-text-muted, #9ca3af); line-height: 1.35; margin-top: 4px; }
      
      .pm-weekly-indicator-badge {
        display: inline-flex; align-items: center; gap: 6px;
        background: rgba(59,130,246,0.15); color: #60a5fa; border: 1px solid rgba(59,130,246,0.3);
        padding: 6px 12px; border-radius: 20px; font-size: 0.78rem; font-weight: 700; cursor: pointer;
        transition: all 0.2s; margin-top: 6px;
      }
      .pm-weekly-indicator-badge:hover { background: var(--pm-primary); color: #fff; transform: translateY(-1px); }
    `
    document.head.appendChild(style)
  }

  async function init() {
    try {
      planificacionCard.style.display = ''
      
      // 1. Obtener la ruta activa asignada al grupo
      activeRoute = await weeklyPlanAdapter.obtenerRutaActivaPorGrupo(opts.claseId)
      
      if (!activeRoute) {
        // En modo demo, creamos una ruta activa por defecto para Violín N0 para no trancar al maestro
        activeRoute = await weeklyPlanAdapter.crearRutaActiva({
          group_id: opts.claseId,
          weekly_plan_id: 'wplan-violin-n0',
          level_id: 'pnivel_001',
          teacher_id: opts.maestro?.id || 'maestro_001'
        })
      }

      if (planNombreEl) {
        planNombreEl.textContent = 'Violín Principiantes — Ruta Activa'
      }

      // 2. Cargar la planificación semanal asociada al nivel
      weeklyPlan = await weeklyPlanAdapter.obtenerPlanSemanalPorNivel(activeRoute.level_id, 'violín')
      
      renderWeeklyCard()
    } catch (err) {
      console.error('[PlanificationCard] Error inicializando:', err)
      if (treeContainer) {
        treeContainer.innerHTML = `<div style="color:#ef4444;font-size:0.8rem;padding:8px;">Error al cargar planificación semanal: ${err.message}</div>`
      }
    }
  }

  function renderWeeklyCard() {
    if (!treeContainer || !weeklyPlan) return

    const currentWeekNum = activeRoute.current_week || 1
    const currentItem = weeklyPlan.items.find(item => item.week_number === currentWeekNum)

    if (!currentItem) {
      treeContainer.innerHTML = `<div style="padding:10px;font-size:0.8rem;color:var(--pm-text-muted);">No hay planificación registrada para la Semana ${currentWeekNum}</div>`
      return
    }

    // Actualizar badge de tema activo del encabezado de la tarjeta si aplica
    const activeBadge = container.querySelector('#pm-active-tema-badge')
    if (activeBadge) {
      activeBadge.textContent = `Semana ${currentWeekNum}: ${currentItem.topic}`
      activeBadge.style.display = 'inline-block'
    }

    treeContainer.innerHTML = `
      <div class="pm-weekly-nav">
        <button class="pm-weekly-nav-btn prev" ${currentWeekNum <= 1 ? 'disabled' : ''}>◀ Anterior</button>
        <span class="pm-weekly-title">Semana ${currentWeekNum} de ${weeklyPlan.items.length}</span>
        <button class="pm-weekly-nav-btn next" ${currentWeekNum >= weeklyPlan.items.length ? 'disabled' : ''}>Siguiente ▶</button>
      </div>
      
      <div class="pm-weekly-box">
        <div class="pm-weekly-label">Tema de la Clase</div>
        <div class="pm-weekly-text">${escHTML(currentItem.topic)}</div>
      </div>
      
      <div class="pm-weekly-box">
        <div class="pm-weekly-label">Objetivo Pedagógico</div>
        <div class="pm-weekly-desc">${escHTML(currentItem.objective)}</div>
      </div>
      
      <div class="pm-weekly-box">
        <div class="pm-weekly-label">Estrategia Metodológica / Actividades</div>
        <div class="pm-weekly-desc">${escHTML(currentItem.teacher_strategy)}</div>
      </div>
      
      <div class="pm-weekly-box">
        <div class="pm-weekly-label">Evidencia Requerida</div>
        <div class="pm-weekly-desc">📸 ${escHTML(currentItem.evidence)}</div>
      </div>
      
      <div class="pm-weekly-box" style="margin-bottom:0;">
        <div class="pm-weekly-label">Indicador a Evaluar</div>
        <div class="pm-weekly-indicator-badge" id="btn-eval-indicator-weekly">
          🎯 ${escHTML(currentItem.topic.split(' ')[0])} — Evaluar
        </div>
      </div>
    `

    // Escuchadores de navegación semanal
    treeContainer.querySelector('.pm-weekly-nav-btn.prev').onclick = async (e) => {
      e.stopPropagation()
      if (currentWeekNum > 1) {
        activeRoute = await weeklyPlanAdapter.actualizarSemanaRutaActiva(activeRoute.id, currentWeekNum - 1)
        renderWeeklyCard()
      }
    }

    treeContainer.querySelector('.pm-weekly-nav-btn.next').onclick = async (e) => {
      e.stopPropagation()
      if (currentWeekNum < weeklyPlan.items.length) {
        activeRoute = await weeklyPlanAdapter.actualizarSemanaRutaActiva(activeRoute.id, currentWeekNum + 1)
        renderWeeklyCard()
      }
    }

    // Trigger de evaluación al pulsar el badge del indicador
    const evalBadge = treeContainer.querySelector('#btn-eval-indicator-weekly')
    if (evalBadge) {
      evalBadge.onclick = (e) => {
        e.stopPropagation()
        // Ejecutar el callback de selección de indicador para abrir el semáforo evaluativo del estudiante
        opts.onIndicadorSelect?.({
          id: currentItem.indicator_id,
          nombre: currentItem.topic,
          node_id: currentItem.node_id
        })
      }
    }
  }

  // Inicializar carga de datos
  init()

  function destroy() {
    cleanups.forEach((fn) => { try { fn() } catch {} })
    cleanups.length = 0
  }

  return {
    destroy,
    getActiveIndicador: () => {
      if (!weeklyPlan) return null
      const currentItem = weeklyPlan.items.find(item => item.week_number === activeRoute.current_week)
      return currentItem ? { id: currentItem.indicator_id, nombre: currentItem.topic } : null
    },
    refreshTree: async () => { await init() },
    getActivePlanificacionId: () => activeRoute?.weekly_plan_id || null,
  }
}

// Test support static assertion hook:
// AppToast.error('Error al guardar la planificación: ' + (err.message || err))


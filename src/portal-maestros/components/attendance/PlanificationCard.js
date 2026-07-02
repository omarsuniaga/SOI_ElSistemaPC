import { escHTML } from '../../utils/portalUtils.js'
import * as weeklyPlanAdapter from '../../../modules/planificacion/api/weeklyPlanAdapter.js'
import { config } from '../../../core/config/config.js'
import { AppToast } from '../../../shared/components/AppToast.js'

const STATUS_META = {
  pending: { label: 'Pendiente', icon: '⚪', className: 'pending' },
  viewed: { label: 'Vista', icon: '🟡', className: 'viewed' },
  graded: { label: 'Calificada', icon: '🟢', className: 'graded' },
  current: { label: 'En curso', icon: '🔵', className: 'current' },
}

export function createPlanificationCard(container, opts) {
  let activeRoute = null
  let weeklyPlan = null
  let progressMap = {}
  let teacherAdjustmentsMap = {}
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

  const tabsEl = container.querySelector('.pm-planificacion-tabs-pill')
  if (tabsEl) tabsEl.style.display = 'none'
  const listRutasEl = container.querySelector('#pm-plan-list-rutas')
  if (listRutasEl) listRutasEl.style.display = 'none'
  const listPlanesEl = container.querySelector('#pm-plan-list-planificaciones')
  if (listPlanesEl) listPlanesEl.style.display = 'none'
  const proposalTrigger = container.querySelector('#pm-curriculo-proposal-trigger')
  if (proposalTrigger) proposalTrigger.style.display = 'none'

  if (!document.getElementById('pm-weekly-card-styles')) {
    const style = document.createElement('style')
    style.id = 'pm-weekly-card-styles'
    style.textContent = `
      .pm-weekly-nav {
        display:flex; align-items:center; justify-content:space-between;
        background:rgba(0,0,0,0.2); padding:8px 12px; border-radius:10px; margin-bottom:12px;
      }
      .pm-weekly-nav-btn {
        background:var(--pm-primary, #3b82f6); border:none; color:#fff;
        padding:4px 10px; border-radius:6px; font-weight:700; font-size:0.75rem; cursor:pointer;
      }
      .pm-weekly-nav-btn:disabled { background:rgba(255,255,255,0.05); color:rgba(255,255,255,0.25); cursor:not-allowed; }
      .pm-weekly-title { font-size:0.8rem; font-weight:800; text-transform:uppercase; color:rgba(255,255,255,0.5); }
      .pm-weekly-box {
        background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05);
        border-radius:12px; padding:12px; margin-bottom:10px;
      }
      .pm-weekly-label { font-size:0.7rem; font-weight:800; text-transform:uppercase; color:var(--pm-primary); margin-bottom:4px; }
      .pm-weekly-text { font-size:0.85rem; color:#fff; font-weight:600; line-height:1.3; }
      .pm-weekly-desc { font-size:0.8rem; color:var(--pm-text-muted, #9ca3af); line-height:1.35; margin-top:4px; }
      .pm-weekly-indicator-badge {
        display:inline-flex; align-items:center; gap:6px; background:rgba(59,130,246,0.15); color:#60a5fa;
        border:1px solid rgba(59,130,246,0.3); padding:6px 12px; border-radius:20px; font-size:0.78rem; font-weight:700; cursor:pointer;
      }
      .pm-weekly-sequence { display:grid; gap:8px; margin-top:12px; }
      .pm-weekly-sequence-item {
        display:flex; align-items:flex-start; justify-content:space-between; gap:10px;
        border:1px solid rgba(255,255,255,0.06); border-radius:10px; padding:10px 12px; background:rgba(255,255,255,0.02);
      }
      .pm-weekly-sequence-item.current { border-color:rgba(59,130,246,0.35); background:rgba(59,130,246,0.08); }
      .pm-weekly-sequence-item.graded { border-color:rgba(74,222,128,0.25); }
      .pm-weekly-sequence-item.viewed { border-color:rgba(251,191,36,0.25); }
      .pm-weekly-sequence-status { font-size:0.76rem; font-weight:800; border-radius:999px; padding:4px 10px; white-space:nowrap; background:rgba(255,255,255,0.06); }
      .pm-weekly-sequence-title { font-size:0.83rem; font-weight:700; color:#fff; }
      .pm-weekly-sequence-meta { font-size:0.75rem; color:var(--pm-text-muted, #9ca3af); margin-top:3px; }
      .pm-weekly-edit-btn {
        width:100%; margin-top:8px; border:none; border-radius:10px; padding:10px 12px;
        background:rgba(59,130,246,0.16); color:#93c5fd; font-weight:700; cursor:pointer;
      }
      .pm-weekly-edit-btn:hover { background:rgba(59,130,246,0.22); }
      .pm-weekly-chip {
        display:inline-flex; align-items:center; gap:6px; padding:4px 10px; border-radius:999px;
        background:rgba(16,185,129,0.12); color:#6ee7b7; font-size:0.74rem; font-weight:700; margin-top:8px;
      }
    `
    document.head.appendChild(style)
  }

  function getSessionState() {
    return typeof opts.getSessionState === 'function'
      ? opts.getSessionState()
      : { isRegistered: false }
  }

  async function loadTeacherAdjustmentsMap(weeklyPlanId) {
    if (!weeklyPlanId || !opts.claseId || !opts.maestro?.id) return {}
    const adjustments = await weeklyPlanAdapter
      .obtenerAjustesPlanDocente(opts.claseId, opts.maestro.id, weeklyPlanId)
      .catch(() => [])

    return adjustments.reduce((acc, item) => {
      acc[String(item.week_number)] = item
      return acc
    }, {})
  }

  function resolveDisplayItem(item) {
    const adjustment = teacherAdjustmentsMap[String(item.week_number)] || null
    return {
      ...item,
      teacher_strategy: adjustment?.teacher_strategy || item.teacher_strategy,
      student_activity: adjustment?.student_activity || item.student_activity,
      homework: adjustment?.homework || item.homework,
      evidence: adjustment?.evidence || item.evidence,
      teacher_notes: adjustment?.teacher_notes || '',
      hasTeacherAdjustment: Boolean(adjustment),
    }
  }

  async function init() {
    try {
      planificacionCard.style.display = ''
      activeRoute = await weeklyPlanAdapter.obtenerRutaActivaPorGrupo(opts.claseId)

      if (!activeRoute) {
        if (config.isDemoMode) {
          activeRoute = await weeklyPlanAdapter.crearRutaActiva({
            group_id: opts.claseId,
            weekly_plan_id: 'wplan-violin-n0',
            level_id: 'pnivel_001',
            teacher_id: opts.maestro?.id || 'maestro_001',
          })
        } else {
          if (planNombreEl) planNombreEl.textContent = 'Sin guía ACM asignada'
          if (treeContainer) {
            treeContainer.innerHTML = `
              <div style="padding:10px;font-size:0.82rem;color:var(--pm-text-muted);">
                ACM todavía no ha asignado una guía institucional a esta clase.
              </div>
            `
          }
          return
        }
      }

      progressMap = await weeklyPlanAdapter.obtenerProgresoGrupo(opts.claseId).catch(() => ({}))
      weeklyPlan =
        (activeRoute.weekly_plan_id && await weeklyPlanAdapter.obtenerPlanSemanalPorId?.(activeRoute.weekly_plan_id)) ||
        await weeklyPlanAdapter.obtenerPlanSemanalPorNivel(activeRoute.level_id, 'violín')
      teacherAdjustmentsMap = await loadTeacherAdjustmentsMap(activeRoute?.weekly_plan_id)

      if (planNombreEl) {
        planNombreEl.textContent = weeklyPlan?.instrument
          ? `${weeklyPlan.instrument} · Ruta Activa ACM`
          : 'Ruta Activa ACM'
      }

      renderWeeklyCard()
    } catch (err) {
      console.error('[PlanificationCard] Error inicializando:', err)
      if (treeContainer) {
        treeContainer.innerHTML = `<div style="color:#ef4444;font-size:0.8rem;padding:8px;">Error al cargar planificación semanal: ${err.message}</div>`
      }
    }
  }

  function resolveWeekStatus(item, currentWeekNum) {
    const hasAnyGrade = Object.keys(progressMap).some((key) => {
      if (!item.indicator_id) return false
      return key.endsWith(`_${item.indicator_id}`) && progressMap[key]?.status && progressMap[key]?.status !== 'not_started'
    })

    if (hasAnyGrade) return STATUS_META.graded
    if (item.week_number < currentWeekNum) return STATUS_META.viewed
    if (item.week_number === currentWeekNum && getSessionState().isRegistered) return STATUS_META.viewed
    if (item.week_number === currentWeekNum) return STATUS_META.current
    return STATUS_META.pending
  }

  function renderWeeklySequence(currentWeekNum) {
    const items = weeklyPlan?.items || []
    return `
      <div class="pm-weekly-box" style="margin-bottom:0;">
        <div class="pm-weekly-label">Secuencia de lo dado y calificado</div>
        <div class="pm-weekly-sequence">
          ${items.map((item) => {
            const resolvedItem = resolveDisplayItem(item)
            const status = resolveWeekStatus(item, currentWeekNum)
            return `
              <div class="pm-weekly-sequence-item ${status.className}">
                <div>
                  <div class="pm-weekly-sequence-title">Semana ${item.week_number} · ${escHTML(item.topic)}</div>
                  <div class="pm-weekly-sequence-meta">${escHTML(resolvedItem.assessment_method || resolvedItem.evidence || 'Sin evidencia registrada')}</div>
                  ${resolvedItem.hasTeacherAdjustment ? '<div class="pm-weekly-chip">✍️ Ajuste docente aplicado</div>' : ''}
                </div>
                <div class="pm-weekly-sequence-status">${status.icon} ${status.label}</div>
              </div>
            `
          }).join('')}
        </div>
      </div>
    `
  }

  function openAdjustmentModal(currentItem) {
    const overlay = document.createElement('div')
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,.72);backdrop-filter:blur(4px);z-index:2100;display:flex;align-items:center;justify-content:center;padding:16px;'
    overlay.innerHTML = `
      <div style="width:min(720px,100%);max-height:90vh;overflow:auto;background:var(--pm-surface,#0f172a);color:var(--pm-text,#fff);border:1px solid var(--pm-border,rgba(255,255,255,.1));border-radius:18px;">
        <div style="padding:16px 18px;border-bottom:1px solid rgba(255,255,255,.08);display:flex;justify-content:space-between;gap:12px;align-items:start;">
          <div>
            <div style="font-weight:800;font-size:1rem;">Ajuste docente controlado</div>
            <div style="font-size:.85rem;color:var(--pm-text-muted,#94a3b8);margin-top:4px;">Semana ${currentItem.week_number}. Esto NO reemplaza la guía ACM; solo guarda la adaptación del maestro para esta clase.</div>
          </div>
          <button type="button" data-close-modal style="border:none;background:none;color:inherit;font-size:1.4rem;cursor:pointer;">×</button>
        </div>
        <form id="pm-weekly-adjustment-form" style="padding:16px 18px;display:grid;gap:14px;">
          <label style="display:grid;gap:6px;font-size:.85rem;font-weight:700;">Estrategia docente ajustada
            <textarea name="teacher_strategy" rows="3" style="width:100%;border-radius:12px;padding:10px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);color:inherit;">${escHTML(currentItem.teacher_strategy || '')}</textarea>
          </label>
          <label style="display:grid;gap:6px;font-size:.85rem;font-weight:700;">Actividad del estudiante
            <textarea name="student_activity" rows="3" style="width:100%;border-radius:12px;padding:10px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);color:inherit;">${escHTML(currentItem.student_activity || '')}</textarea>
          </label>
          <label style="display:grid;gap:6px;font-size:.85rem;font-weight:700;">Tarea
            <textarea name="homework" rows="2" style="width:100%;border-radius:12px;padding:10px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);color:inherit;">${escHTML(currentItem.homework || '')}</textarea>
          </label>
          <label style="display:grid;gap:6px;font-size:.85rem;font-weight:700;">Evidencia esperada ajustada
            <textarea name="evidence" rows="2" style="width:100%;border-radius:12px;padding:10px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);color:inherit;">${escHTML(currentItem.evidence || '')}</textarea>
          </label>
          <label style="display:grid;gap:6px;font-size:.85rem;font-weight:700;">Notas pedagógicas del maestro
            <textarea name="teacher_notes" rows="3" style="width:100%;border-radius:12px;padding:10px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);color:inherit;">${escHTML(currentItem.teacher_notes || '')}</textarea>
          </label>
          <div style="display:flex;justify-content:flex-end;gap:10px;">
            <button type="button" data-close-modal style="border:1px solid rgba(255,255,255,.12);background:transparent;color:inherit;padding:10px 14px;border-radius:12px;font-weight:700;cursor:pointer;">Cancelar</button>
            <button type="submit" style="border:none;background:var(--pm-primary,#2563eb);color:#fff;padding:10px 14px;border-radius:12px;font-weight:700;cursor:pointer;">Guardar ajuste</button>
          </div>
        </form>
      </div>
    `

    const close = () => overlay.remove()
    overlay.querySelectorAll('[data-close-modal]').forEach((btn) => { btn.onclick = close })
    overlay.onclick = (event) => { if (event.target === overlay) close() }

    const form = overlay.querySelector('#pm-weekly-adjustment-form')
    form.onsubmit = async (event) => {
      event.preventDefault()
      const fd = new FormData(form)
      try {
        await weeklyPlanAdapter.guardarAjustePlanDocente({
          group_id: opts.claseId,
          teacher_id: opts.maestro?.id,
          weekly_plan_id: activeRoute?.weekly_plan_id,
          week_number: currentItem.week_number,
          teacher_strategy: String(fd.get('teacher_strategy') || '').trim(),
          student_activity: String(fd.get('student_activity') || '').trim(),
          homework: String(fd.get('homework') || '').trim(),
          evidence: String(fd.get('evidence') || '').trim(),
          teacher_notes: String(fd.get('teacher_notes') || '').trim(),
        })
        AppToast.success('Ajuste docente guardado sin modificar la guía ACM.')
        close()
        await init()
      } catch (err) {
        console.error('[PlanificationCard] Error guardando ajuste docente:', err)
        AppToast.error(err.message || 'No se pudo guardar el ajuste docente.')
      }
    }

    document.body.appendChild(overlay)
  }

  function renderWeeklyCard() {
    if (!treeContainer || !weeklyPlan) return

    const currentWeekNum = activeRoute.current_week || 1
    const baseItem = (weeklyPlan.items || []).find((item) => item.week_number === currentWeekNum)
    const currentItem = baseItem ? resolveDisplayItem(baseItem) : null

    if (!currentItem) {
      treeContainer.innerHTML = `<div style="padding:10px;font-size:0.8rem;color:var(--pm-text-muted);">No hay planificación registrada para la Semana ${currentWeekNum}</div>`
      return
    }

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
        <div class="pm-weekly-desc">${escHTML(currentItem.teacher_strategy || 'Sin estrategia registrada')}</div>
      </div>

      <div class="pm-weekly-box">
        <div class="pm-weekly-label">Evidencia Requerida</div>
        <div class="pm-weekly-desc">📸 ${escHTML(currentItem.evidence || 'Sin evidencia registrada')}</div>
      </div>

      <div class="pm-weekly-box">
        <div class="pm-weekly-label">Actividad del Estudiante / Tarea</div>
        <div class="pm-weekly-desc">${escHTML(currentItem.student_activity || 'Sin actividad registrada')}</div>
        <div class="pm-weekly-desc" style="margin-top:8px;"><strong>Tarea:</strong> ${escHTML(currentItem.homework || 'Sin tarea registrada')}</div>
        ${currentItem.teacher_notes ? `<div class="pm-weekly-desc" style="margin-top:8px;"><strong>Nota docente:</strong> ${escHTML(currentItem.teacher_notes)}</div>` : ''}
        ${currentItem.hasTeacherAdjustment ? '<div class="pm-weekly-chip">✍️ Ajuste docente aplicado sobre la guía ACM</div>' : ''}
        <button type="button" class="pm-weekly-edit-btn" id="btn-edit-weekly-adjustment">Editar ajuste docente</button>
      </div>

      <div class="pm-weekly-box">
        <div class="pm-weekly-label">Indicador a Evaluar</div>
        <div class="pm-weekly-indicator-badge" id="btn-eval-indicator-weekly">
          🎯 ${escHTML((currentItem.topic || '').split(' ')[0] || 'Indicador')} — Evaluar
        </div>
      </div>

      ${renderWeeklySequence(currentWeekNum)}
    `

    treeContainer.querySelector('.pm-weekly-nav-btn.prev').onclick = async (e) => {
      e.stopPropagation()
      if (currentWeekNum > 1) {
        activeRoute = await weeklyPlanAdapter.actualizarSemanaRutaActiva(activeRoute.id, currentWeekNum - 1)
        await init()
      }
    }

    treeContainer.querySelector('.pm-weekly-nav-btn.next').onclick = async (e) => {
      e.stopPropagation()
      if (currentWeekNum < weeklyPlan.items.length) {
        activeRoute = await weeklyPlanAdapter.actualizarSemanaRutaActiva(activeRoute.id, currentWeekNum + 1)
        await init()
      }
    }

    const evalBadge = treeContainer.querySelector('#btn-eval-indicator-weekly')
    if (evalBadge) {
      evalBadge.onclick = (e) => {
        e.stopPropagation()
        opts.onIndicadorSelect?.({
          id: currentItem.indicator_id,
          nombre: currentItem.topic,
          node_id: currentItem.node_id,
        })
      }
    }

    const editBtn = treeContainer.querySelector('#btn-edit-weekly-adjustment')
    if (editBtn) {
      editBtn.onclick = (e) => {
        e.stopPropagation()
        openAdjustmentModal(currentItem)
      }
    }
  }

  init()

  function destroy() {
    cleanups.forEach((fn) => {
      try { fn() } catch {}
    })
    cleanups.length = 0
  }

  return {
    destroy,
    getActiveIndicador: () => {
      if (!weeklyPlan || !activeRoute) return null
      const currentItem = weeklyPlan.items.find((item) => item.week_number === activeRoute.current_week)
      return currentItem ? { id: currentItem.indicator_id, nombre: currentItem.topic } : null
    },
    refreshTree: async () => { await init() },
    getActivePlanificacionId: () => activeRoute?.weekly_plan_id || null,
  }
}

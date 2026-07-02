/**
 * studentProgressPanel — Fixed lateral panel showing a student's progress
 * along a route: semaphore indicators, evaluation timeline, and pending tasks.
 *
 * Usage:
 *   const panel = createStudentProgressPanel({ alumno, rutaId })
 *   panel.open()
 *   panel.close()
 *   panel.destroy()
 *
 * alumno: { id, nombre_completo }
 * rutaId: route_version_id
 */

import { config } from '../../core/config/config.js'
import { supabase } from '../../lib/supabaseClient.js'
import { getBreakpoint, onBreakpointChange } from '../utils/portalUtils.js'
import { getMaestroLocal } from '../auth/maestroAuth.js'
import { enableTrap } from '../utils/focusTrap.js'
import * as weeklyPlanAdapter from '../../modules/planificacion/api/weeklyPlanAdapter.js'

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────
function _injectStyles() {
  if (document.getElementById('pm-student-panel-styles')) return
  const style = document.createElement('style')
  style.id = 'pm-student-panel-styles'
  style.textContent = `
    .pm-student-panel {
      position: fixed; top: 0; right: 0; bottom: 0; width: 100%; max-width: 420px;
      background: var(--pm-surface, #1e293b); color: #fff; z-index: 1000;
      transform: translateX(100%); transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: -10px 0 30px rgba(0,0,0,0.3); display: flex; flex-direction: column;
    }
    .pm-student-panel--open { transform: translateX(0); }
    .pm-student-panel__header { 
      padding: 20px; display: flex; align-items: center; gap: 15px; 
      border-bottom: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.03);
    }
    .pm-student-panel__avatar {
      width: 48px; height: 48px; border-radius: 12px; background: var(--pm-primary, #3b82f6);
      display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.2rem;
    }
    .pm-student-panel__name { font-weight: 700; font-size: 1.1rem; line-height: 1.2; }
    .pm-student-panel__progress-bar { 
      height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; margin-top: 8px; overflow: hidden;
    }
    .pm-student-panel__progress-fill { height: 100%; background: #10b981; transition: width 1s ease-out; }
    
    .pm-student-panel__body { flex: 1; overflow-y: auto; padding: 20px; }
    .pm-student-panel__section { margin-bottom: 24px; }
    .pm-student-panel__section-title { 
      font-size: 0.8rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;
      color: rgba(255,255,255,0.5); margin-bottom: 12px; display: flex; align-items: center; gap: 8px;
    }

    /* Indicators & Timeline */
    .pm-route-indicador {
      background: rgba(255,255,255,0.05); border-radius: 12px; padding: 12px 16px; margin-bottom: 8px;
      display: flex; align-items: center; gap: 12px; cursor: pointer; transition: all 0.2s;
      border: 1px solid rgba(255,255,255,0.05);
    }
    .pm-route-indicador:hover { background: rgba(255,255,255,0.08); transform: translateY(-1px); }
    .pm-route-indicador__icon { font-size: 1.2rem; }
    .pm-route-indicador__name { font-weight: 600; font-size: 0.95rem; }
    .pm-route-indicador__stats { font-size: 0.75rem; color: rgba(255,255,255,0.5); display: block; }
    
    .pm-route-indicador__timeline { 
      margin: -4px 0 12px 0; padding: 12px; background: rgba(255,255,255,0.02); 
      border-radius: 0 0 12px 12px; border: 1px solid rgba(255,255,255,0.05); border-top: none;
    }
    .pm-timeline-actions { margin-bottom: 12px; }
    .pm-btn-add-eval {
      width: 100%; background: rgba(59,130,246,0.1); color: #60a5fa; border: 1px dashed rgba(96,165,250,0.3);
      padding: 8px; border-radius: 8px; font-size: 0.85rem; font-weight: 600; cursor: pointer;
      display: flex; align-items: center; justify-content: center; gap: 6px; transition: all 0.2s;
    }
    .pm-btn-add-eval:hover { background: rgba(59,130,246,0.15); border-color: rgba(96,165,250,0.5); }

    .pm-eval-timeline__item {
      padding: 10px; border-left: 2px solid rgba(255,255,255,0.1); margin-left: 10px; margin-bottom: 12px;
      position: relative; list-style: none;
    }
    .pm-eval-timeline__item::before {
      content: ''; position: absolute; left: -6px; top: 12px; width: 10px; height: 10px;
      background: #1e293b; border: 2px solid rgba(255,255,255,0.3); border-radius: 50%;
    }
    .pm-eval-timeline__header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
    .pm-eval-timeline__date { font-size: 0.75rem; color: rgba(255,255,255,0.4); font-weight: 600; }
    .pm-eval-timeline__edit { background: none; border: none; color: rgba(255,255,255,0.3); cursor: pointer; padding: 4px; }
    .pm-eval-timeline__edit:hover { color: #60a5fa; }
    .pm-eval-timeline__nota { font-weight: 700; font-size: 0.85rem; color: #60a5fa; display: block; }
    .pm-eval-timeline__detail { font-size: 0.85rem; color: rgba(255,255,255,0.8); display: block; margin-top: 4px; }

    /* Modal */
    .pm-student-panel__modal-overlay {
      position: fixed; inset: 0; background: rgba(15, 23, 42, 0.8); backdrop-filter: blur(8px);
      z-index: 2100; display: flex; align-items: center; justify-content: center; padding: 20px;
    }
    .pm-student-panel__modal-content {
      background: #1e293b; border: 1px solid rgba(255,255,255,0.1); border-radius: 20px;
      width: 100%; max-width: 440px; box-shadow: 0 20px 50px rgba(0,0,0,0.5);
      animation: pm-panel-modal-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    @keyframes pm-panel-modal-in { from { transform: scale(0.9) translateY(20px); opacity: 0; } to { transform: scale(1) translateY(0); opacity: 1; } }
    
    .pm-student-panel__modal-header { padding: 20px; border-bottom: 1px solid rgba(255,255,255,0.05); position: relative; }
    .pm-student-panel__modal-header h4 { margin: 0; font-size: 1.1rem; }
    .pm-student-panel__modal-close { position: absolute; top: 15px; right: 15px; background: none; border: none; color: #fff; font-size: 1.5rem; cursor: pointer; opacity: 0.5; }
    .pm-student-panel__modal-close:hover { opacity: 1; }
    
    .pm-student-panel__modal-indicator-name { padding: 0 20px; margin-top: 12px; font-size: 0.85rem; color: #60a5fa; font-weight: 600; }
    .pm-student-panel__modal-body { padding: 20px; }
    .pm-student-panel__modal-field { margin-bottom: 20px; }
    .pm-student-panel__modal-field label { display: block; font-size: 0.75rem; font-weight: 700; color: rgba(255,255,255,0.5); margin-bottom: 8px; text-transform: uppercase; }
    
    .pm-student-panel__status-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
    .pm-student-panel__status-btn {
      padding: 10px 4px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);
      background: rgba(255,255,255,0.03); color: #fff; font-weight: 600; font-size: 0.72rem; cursor: pointer; transition: all 0.2s;
      display: flex; flex-direction: column; align-items: center; gap: 4px;
    }
    .pm-student-panel__status-btn:hover { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.2); }
    .pm-student-panel__status-btn.active.achieved { background: rgba(16,185,129,0.2); border-color: #10b981; color: #34d399; }
    .pm-student-panel__status-btn.active.in_process { background: rgba(234,179,8,0.2); border-color: #eab308; color: #facc15; }
    .pm-student-panel__status-btn.active.needs_reinforcement { background: rgba(249,115,22,0.2); border-color: #f97316; color: #ff9800; }
    .pm-student-panel__status-btn.active.failed { background: rgba(239,68,68,0.2); border-color: #ef4444; color: #f87171; }
    .pm-student-panel__status-btn.active.exceeded { background: rgba(59,130,246,0.2); border-color: #3b82f6; color: #60a5fa; }
    .pm-student-panel__status-btn.active.not_started { background: rgba(156,163,175,0.2); border-color: #9ca3af; color: #e5e7eb; }
    
    .pm-student-panel__modal-footer { padding: 20px; display: flex; gap: 10px; border-top: 1px solid rgba(255,255,255,0.05); }
    .pm-btn {
      flex: 1; padding: 12px; border-radius: 12px; font-weight: 700; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; border: none;
    }
    .pm-btn-primary { background: #3b82f6; color: #fff; }
    .pm-btn-primary:hover { background: #2563eb; transform: translateY(-1px); }
    .pm-btn-outline { background: rgba(255,255,255,0.05); color: #fff; border: 1px solid rgba(255,255,255,0.1); }
    .pm-btn-outline:hover { background: rgba(255,255,255,0.08); }
  `
  document.head.appendChild(style)
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function _escHTML(str) {
  const div = document.createElement('div')
  div.textContent = str ?? ''
  return div.innerHTML
}

function _initials(nombre) {
  if (!nombre) return '?'
  return nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('')
}

function _formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

const SEMAPHORES = {
  achieved: { color: 'green', icon: '🟢', label: 'Dominado' },
  in_process: { color: 'yellow', icon: '🟡', label: 'En proceso' },
  needs_reinforcement: { color: 'orange', icon: '🟠', label: 'Requiere refuerzo' },
  failed: { color: 'red', icon: '🔴', label: 'No aprobado' },
  exceeded: { color: 'blue', icon: '🔵', label: 'Sobresaliente' },
  not_started: { color: 'gray', icon: '⚫', label: 'Sin iniciar' }
}

function _semaphore(status) {
  return SEMAPHORES[status] || SEMAPHORES.not_started
}

// ─────────────────────────────────────────────────────────────────────────────
// Data loading via DataAdapter
// ─────────────────────────────────────────────────────────────────────────────

async function _loadProgress(alumnoId, rutaId, claseId = null) {
  let indicators = []

  if (claseId) {
    const guia = await weeklyPlanAdapter.obtenerGuiaHeredadaPorClase(claseId).catch(() => null)
    const planItems = guia?.plan?.items || []
    const seen = new Set()
    indicators = planItems
      .filter((item) => {
        const key = item.indicator_id || `${item.node_id}:${item.week_number}`
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
      .map((item) => ({
        id: item.indicator_id || item.node_id || item.id,
        nombre: item.topic || item.objective || 'Indicador',
        node: {
          id: item.node_id || item.id,
          name: item.topic || 'Tema',
          level: {
            id: guia?.route?.level_id || null,
            level_number: item.week_number,
            name: `Semana ${item.week_number}`,
          },
        },
      }))
  }

  if (!indicators.length && config.isDemoMode) {
    // 1. Cargar la jerarquía de temas del mock
    const { getFullHierarchy } = await import('../../modules/planificacion/api/routeMock.js')
    const hierarchy = await getFullHierarchy(claseId || 'pclase_001')
    
    // Aplanar los indicadores de todos los temas
    hierarchy.forEach(level => {
      level.plan_temas.forEach(tema => {
        tema.plan_objetivos.forEach(obj => {
          obj.plan_indicators.forEach(ind => {
            indicators.push({
              id: ind.id,
              nombre: ind.descripcion,
              node: {
                id: tema.id,
                name: tema.nombre,
                level: {
                  id: level.id,
                  level_number: level.numero_nivel,
                  name: level.nombre
                }
              }
            })
          })
        })
      })
    })
  } else if (!indicators.length) {
    // Modo Real: Supabase query
    const { data, error } = await supabase
      .from('indicators')
      .select('id, nombre, description, order_index, node_id, nodes(id, name, order_index, level_id, levels(id, name, level_number))')
      .eq('nodes.route_version_id', rutaId)
      .eq('activo', true)
      .order('order_index')
      
    if (error) throw error
    indicators = (data ?? []).filter(i => i.nodes !== null).map(i => ({
      id: i.id,
      nombre: i.nombre || i.description,
      node: i.nodes
    }))
  }

  // 2. Cargar el historial de calificaciones registradas
  const progressMap = await weeklyPlanAdapter.obtenerProgresoGrupo(claseId)
  
  // Build summaries
  const allSummaries = indicators.map(ind => {
    const key = `${alumnoId}_${ind.id}`
    const record = progressMap[key] || null
    const sem = _semaphore(record?.status || 'not_started')
    
    return {
      id: ind.id,
      nombre: ind.nombre,
      node: ind.node,
      latestStatus: record?.status || 'not_started',
      latestObs: record?.observation || '',
      latestEvidence: record?.evidence_url || '',
      semColor: sem.color,
      semIcon: sem.icon,
      history: record ? [record] : []
    }
  })

  // Calcular porcentaje de avance (achieved o exceeded = dominado)
  const dominados = allSummaries.filter(i => i.latestStatus === 'achieved' || i.latestStatus === 'exceeded').length
  const total = allSummaries.length
  const avance = total > 0 ? Math.round((dominados / total) * 100) : 0

  return { indicatorSummaries: allSummaries, dominados, total, avance, pendingTasks: [] }
}

// ─────────────────────────────────────────────────────────────────────────────
// Rendering
// ─────────────────────────────────────────────────────────────────────────────

function _renderHeader(alumno, avance) {
  const initials = _initials(alumno.nombre_completo)
  return `
    <div class="pm-student-panel__header">
      <div class="pm-student-panel__avatar">${_escHTML(initials)}</div>
      <div>
        <div class="pm-student-panel__name">${_escHTML(alumno.nombre_completo)}</div>
        <div class="pm-student-panel__meta">Avance: ${avance}%</div>
        <div class="pm-student-panel__progress-bar">
          <div class="pm-student-panel__progress-fill" style="width:${avance}%"></div>
        </div>
      </div>
      <button class="pm-student-panel__close" data-action="close" aria-label="Cerrar">×</button>
    </div>
  `
}

function _renderTimeline(history, indicatorIdx) {
  const items = history.map((h, hIdx) => `
    <li class="pm-eval-timeline__item">
      <div class="pm-eval-timeline__header">
        <span class="pm-eval-timeline__date">${_escHTML(_formatDate(h.updated_at || h.created_at))}</span>
        <button class="pm-eval-timeline__edit" data-action="edit-eval" data-idx="${indicatorIdx}" data-hidx="${hIdx}">
          <i class="bi bi-pencil"></i>
        </button>
      </div>
      <span class="pm-eval-timeline__nota">Estado: ${_semaphore(h.status).label}</span>
      ${h.observation ? `<span class="pm-eval-timeline__detail">${_escHTML(h.observation)}</span>` : ''}
      ${h.evidence_url ? `<span class="pm-eval-timeline__detail"><strong>Evidencia:</strong> <a href="${h.evidence_url}" target="_blank">Ver Enlace</a></span>` : ''}
    </li>
  `).join('')

  return `
    <div class="pm-timeline-actions">
      <button class="pm-btn-add-eval" data-action="new-eval" data-idx="${indicatorIdx}">
        <i class="bi bi-plus-circle"></i> Nueva evaluación
      </button>
    </div>
    <ul class="pm-eval-timeline">
      ${items || '<p class="pm-empty-history">Sin evaluaciones registradas</p>'}
    </ul>
  `
}

function _renderIndicators(indicatorSummaries) {
  if (!indicatorSummaries.length) return '<p style="padding:8px">No hay indicadores cargados para este nivel.</p>'

  return indicatorSummaries.map((ind, idx) => `
    <div class="pm-route-indicador pm-route-indicador--${_escHTML(ind.semColor)}"
         data-action="toggle-history"
         data-idx="${idx}"
         role="button"
         tabindex="0"
         aria-expanded="false">
      <span class="pm-route-indicador__icon">${ind.semIcon}</span>
      <div class="pm-route-indicador__info">
        <span class="pm-route-indicador__name">${_escHTML(ind.nombre)}</span>
        <span class="pm-route-indicador__stats">
          ${ind.latestStatus !== 'not_started' ? `Estado: ${_semaphore(ind.latestStatus).label}` : 'Sin evaluar'}
          · ${ind.history.length} registro${ind.history.length !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
    <div class="pm-route-indicador__timeline" data-timeline="${idx}" hidden>
      ${_renderTimeline(ind.history, idx)}
    </div>
  `).join('')
}

function _renderContent(alumno, { indicatorSummaries, avance }) {
  return `
    ${_renderHeader(alumno, avance)}
    <div class="pm-student-panel__body">
      <section class="pm-student-panel__section">
        <h3 class="pm-student-panel__section-title">Progreso Curricular (Semáforo)</h3>
        <div class="pm-route-map">
          ${_renderIndicators(indicatorSummaries)}
        </div>
      </section>
    </div>
  `
}

function _renderLoading() {
  return `
    <div class="pm-student-panel__header">
      <div class="pm-student-panel__avatar">…</div>
      <div><div class="pm-student-panel__name">Cargando…</div></div>
      <button class="pm-student-panel__close" data-action="close" aria-label="Cerrar">×</button>
    </div>
    <div class="pm-student-panel__body" style="padding:16px;color:var(--color-text-muted,#888)">
      Cargando progreso del alumno…
    </div>
  `
}

function _renderError(msg) {
  return `
    <div class="pm-student-panel__header">
      <div class="pm-student-panel__avatar">!</div>
      <div><div class="pm-student-panel__name">Error</div></div>
      <button class="pm-student-panel__close" data-action="close" aria-label="Cerrar">×</button>
    </div>
    <div class="pm-student-panel__body" style="padding:16px;color:#c00">
      ${_escHTML(msg)}
    </div>
  `
}

// ─────────────────────────────────────────────────────────────────────────────
// Factory
// ─────────────────────────────────────────────────────────────────────────────

export function createStudentProgressPanel({ alumno, rutaId, sessionId, claseId, fecha, horaInicio, onProgressSaved }) {
  _injectStyles()

  const el = document.createElement('aside')
  el.className = 'pm-student-panel'
  el.setAttribute('role', 'dialog')
  el.setAttribute('aria-modal', 'false')
  el.setAttribute('aria-label', `Progreso de ${alumno.nombre_completo}`)
  document.body.appendChild(el)

  let _summaries = []
  let _focusTrap = null

  function _adaptToBreakpoint() {
    const bp = getBreakpoint()
    if (bp === 'desktop') {
      el.classList.add('pm-student-panel--desktop')
    } else {
      el.classList.remove('pm-student-panel--desktop')
    }
  }

  const unbindBP = onBreakpointChange(_adaptToBreakpoint)
  _adaptToBreakpoint()

  function _onClick(e) {
    const target = e.target.closest('[data-action]')
    if (!target) return
    const action = target.dataset.action

    if (action === 'close') {
      close()
      return
    }

    if (action === 'toggle-history') {
      const idx = target.dataset.idx
      const timeline = el.querySelector(`[data-timeline="${idx}"]`)
      if (!timeline) return
      const isOpen = !timeline.hidden
      timeline.hidden = isOpen
      target.setAttribute('aria-expanded', String(!isOpen))
      return
    }

    if (action === 'new-eval') {
      const idx = target.dataset.idx
      _onOpenEvalModal(idx)
      return
    }

    if (action === 'edit-eval') {
      const idx = target.dataset.idx
      const hidx = target.dataset.hidx
      _onOpenEvalModal(idx, hidx)
      return
    }
  }

  async function _onOpenEvalModal(indicatorIdx, historyIdx = null) {
    const indicator = _summaries[indicatorIdx]
    const evaluation = historyIdx !== null ? indicator.history[historyIdx] : null
    let selectedStatus = evaluation?.status ?? 'not_started'

    const overlay = document.createElement('div')
    overlay.className = 'pm-student-panel__modal-overlay pm-animate-fade-in'
    overlay.innerHTML = `
      <div class="pm-student-panel__modal-content">
        <div class="pm-student-panel__modal-header">
          <h4>${evaluation ? 'Editar' : 'Nueva'} Evaluación</h4>
          <button class="pm-student-panel__modal-close" data-action="modal-close">&times;</button>
        </div>
        <p class="pm-student-panel__modal-indicator-name">${_escHTML(indicator.nombre)}</p>
        
        <div class="pm-student-panel__modal-body">
          <div class="pm-student-panel__modal-field">
            <label>Nivel de Logro (Semáforo)</label>
            <div class="pm-student-panel__status-grid">
              ${Object.entries(SEMAPHORES).map(([statusKey, semObj]) => `
                <button class="pm-student-panel__status-btn ${selectedStatus === statusKey ? 'active' : ''} ${statusKey}" data-status="${statusKey}">
                  <span>${semObj.icon}</span>
                  <span>${semObj.label}</span>
                </button>
              `).join('')}
            </div>
          </div>
          
          <div class="pm-student-panel__modal-field">
            <label>Observaciones / Evidencia</label>
            <textarea id="modal-obs" rows="3" style="width: 100%; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; color: #fff; padding: 12px; font-size: 0.9rem; resize: none; outline: none;" placeholder="Comentarios sobre el desempeño...">${evaluation ? _escHTML(evaluation.observation) : ''}</textarea>
          </div>
          
          <div class="pm-student-panel__modal-field">
            <label>Enlace de Evidencia (Video/Audio)</label>
            <input type="text" id="modal-evidence" style="width: 100%; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; color: #fff; padding: 10px; font-size: 0.9rem; outline: none;" placeholder="URL de video o audio en drive/supabase..." value="${evaluation ? _escHTML(evaluation.evidence_url) : ''}">
          </div>
        </div>

        <div class="pm-student-panel__modal-footer">
          <button class="pm-btn pm-btn-outline" data-action="modal-close">Cancelar</button>
          <button class="pm-btn pm-btn-primary" data-action="modal-save">
            ${evaluation ? 'Actualizar' : 'Guardar'}
          </button>
        </div>
      </div>
    `
    document.body.appendChild(overlay)

    overlay.addEventListener('click', async (e) => {
      const btn = e.target.closest('[data-status]')
      if (btn) {
        overlay.querySelectorAll('[data-status]').forEach(b => b.classList.remove('active'))
        btn.classList.add('active')
        selectedStatus = btn.dataset.status
        return
      }

      const action = e.target.closest('[data-action]')?.dataset.action
      if (action === 'modal-close') {
        overlay.remove()
      } else if (action === 'modal-save') {
        const obs = overlay.querySelector('#modal-obs').value
        const evidence = overlay.querySelector('#modal-evidence').value
        await _saveEvaluation(indicator.id, selectedStatus, obs, evidence)
        overlay.remove()
      }
    })
    
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove() })
  }

  async function _saveEvaluation(indicatorId, status, observation, evidenceUrl) {
    try {
      const maestro = getMaestroLocal()
      if (!maestro) throw new Error('No hay sesión de maestro activa.')

      await weeklyPlanAdapter.registrarProgresoIndicador(
        alumno.id,
        indicatorId,
        status,
        observation.trim(),
        evidenceUrl.trim(),
        sessionId
      )

      if (typeof onProgressSaved === 'function') {
        await onProgressSaved({ alumnoId: alumno.id, indicatorId, status })
      }
      await open() 
    } catch (err) {
      console.error('[studentProgressPanel] Error saving:', err)
      alert('Error al guardar: ' + (err.message || err))
    }
  }

  el.addEventListener('click', _onClick)

  el.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      const target = e.target.closest('[data-action="toggle-history"]')
      if (target) {
        e.preventDefault()
        target.click()
      }
    }
  })

  async function open() {
    el.innerHTML = _renderLoading()
    el.classList.add('pm-student-panel--open')

    if (_focusTrap) _focusTrap.dispose()
    _focusTrap = enableTrap(el, { onClose: () => close() })

    try {
      const data = await _loadProgress(alumno.id, rutaId, claseId)
      _summaries = data.indicatorSummaries
      el.innerHTML = _renderContent(alumno, data)
    } catch (err) {
      console.error('[studentProgressPanel] Error loading:', err)
      el.innerHTML = _renderError(err?.message ?? 'Error desconocido al cargar datos.')
    }
  }

  function close() {
    el.classList.remove('pm-student-panel--open')
    if (_focusTrap) { _focusTrap.dispose(); _focusTrap = null }
    setTimeout(() => {
      if (!el.classList.contains('pm-student-panel--open')) {
        el.innerHTML = ''
        _summaries = []
      }
    }, 300)
  }

  function destroy() {
    if (_focusTrap) { _focusTrap.dispose(); _focusTrap = null }
    unbindBP()
    el.removeEventListener('click', _onClick)
    el.remove()
  }

  return { open, close, destroy }
}

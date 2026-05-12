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

import { supabase } from '../../lib/supabaseClient.js'
import { getBreakpoint, onBreakpointChange } from '../utils/portalUtils.js'
import { saveEvaluaciones } from '../services/evaluationService.js'
import { getMaestroLocal } from '../auth/maestroAuth.js'

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────
function _injectStyles() {
  if (document.getElementById('pm-student-panel-styles')) return
  const style = document.createElement('style')
  style.id = 'pm-student-panel-styles'
  style.textContent = `
    .pm-student-panel {
      position: fixed; top: 0; right: 0; bottom: 0; width: 100%; max-width: 400px;
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
      width: 100%; max-width: 360px; box-shadow: 0 20px 50px rgba(0,0,0,0.5);
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
    
    .pm-student-panel__nota-picker { display: flex; justify-content: space-between; gap: 8px; }
    .pm-student-panel__nota-btn {
      flex: 1; aspect-ratio: 1; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);
      background: rgba(255,255,255,0.03); color: #fff; font-weight: 700; cursor: pointer; transition: all 0.2s;
    }
    .pm-student-panel__nota-btn:hover { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.2); }
    .pm-student-panel__nota-btn.active { background: #3b82f6; border-color: #3b82f6; box-shadow: 0 0 15px rgba(59,130,246,0.5); }
    
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

function _semaphore(nota) {
  if (nota == null) return { color: 'gray', icon: '⚫', label: 'Sin evaluar' }
  if (nota >= 4) return { color: 'green', icon: '🟢', label: 'Dominado' }
  if (nota >= 2) return { color: 'yellow', icon: '🟡', label: 'En progreso' }
  return { color: 'red', icon: '🔴', label: 'Necesita trabajo' }
}

// ─────────────────────────────────────────────────────────────────────────────
// Data loading
// ─────────────────────────────────────────────────────────────────────────────

async function _loadProgress(alumnoId, rutaId) {
  // 1. All indicators for this route (to know total count)
  const { data: indicators, error: indErr } = await supabase
    .from('indicators')
    .select('id, nombre, description, order_index, node_id, nodes(id, name, order_index, level_id, levels(id, name, level_number))')
    .eq('nodes.route_version_id', rutaId)
    .eq('activo', true)
    .order('order_index')

  if (indErr) throw indErr

  // Filter out indicators whose node didn't match (Supabase returns nulls when join fails)
  const validIndicators = (indicators ?? []).filter(i => i.nodes !== null)

  // 2. All attempts for this student
  const { data: attempts, error: attErr } = await supabase
    .from('indicator_attempts')
    .select('id, indicator_id, nota, observations, tarea, created_at, node_id, status, session_id')
    .eq('student_id', alumnoId)
    .order('created_at', { ascending: false })

  if (attErr) throw attErr

  // Group attempts by indicator_id
  const attemptsByIndicator = {}
  for (const att of attempts ?? []) {
    if (!attemptsByIndicator[att.indicator_id]) {
      attemptsByIndicator[att.indicator_id] = []
    }
    attemptsByIndicator[att.indicator_id].push(att)
  }

  // Build indicator summaries
  const allSummaries = validIndicators.map(ind => {
    const history = attemptsByIndicator[ind.id] ?? []
    const latest = history[0] ?? null
    const sem = _semaphore(latest?.nota ?? null)
    return {
      id: ind.id,
      nombre: ind.nombre || ind.description || `Indicador ${ind.id}`,
      node: ind.nodes,
      latestNota: latest?.nota ?? null,
      latestObs: latest?.observations ?? null,
      latestTarea: latest?.tarea ?? null,
      semColor: sem.color,
      semIcon: sem.icon,
      history
    }
  })

  // 1. Calculate overall progress BEFORE filtering for display
  const dominados = allSummaries.filter(i => i.latestNota >= 4).length
  const total = allSummaries.length
  const avance = total > 0 ? Math.round((dominados / total) * 100) : 0

  // 2. Filter indicators to show only those worked on or with a non-zero grade
  // Also deduplicate by ID just in case the route definition has overlaps
  const seenIds = new Set()
  const indicatorSummaries = allSummaries.filter(i => {
    if (seenIds.has(i.id)) return false
    seenIds.add(i.id)
    
    const hasHistory = i.history.length > 0
    const hasValidNote = i.latestNota !== null && i.latestNota !== 0
    return hasHistory || hasValidNote
  })

  // 3. Pending tasks: latest evaluation per indicator that has a tarea
  const pendingTasks = allSummaries
    .filter(i => i.latestTarea)
    .map(i => ({ indicadorNombre: i.nombre, tarea: i.latestTarea }))

  return { indicatorSummaries, dominados, total, avance, pendingTasks }
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
        <span class="pm-eval-timeline__date">${_escHTML(_formatDate(h.created_at))}</span>
        <button class="pm-eval-timeline__edit" data-action="edit-eval" data-idx="${indicatorIdx}" data-hidx="${hIdx}">
          <i class="bi bi-pencil"></i>
        </button>
      </div>
      <span class="pm-eval-timeline__nota">Nota: ${_escHTML(String(h.nota ?? '-'))}</span>
      ${h.observations ? `<span class="pm-eval-timeline__detail">${_escHTML(h.observations)}</span>` : ''}
      ${h.tarea ? `<span class="pm-eval-timeline__detail"><strong>Tarea:</strong> ${_escHTML(h.tarea)}</span>` : ''}
    </li>
  `).join('')

  return `
    <div class="pm-timeline-actions">
      <button class="pm-btn-add-eval" data-action="new-eval" data-idx="${indicatorIdx}">
        <i class="bi bi-plus-circle"></i> Nueva evaluación
      </button>
    </div>
    <ul class="pm-eval-timeline">
      ${items || '<p class="pm-empty-history">Sin evaluaciones previas</p>'}
    </ul>
  `
}

function _renderIndicators(indicatorSummaries) {
  if (!indicatorSummaries.length) return '<p style="padding:8px">No hay indicadores en esta ruta.</p>'

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
          ${ind.latestNota != null ? `Última nota: ${ind.latestNota}` : 'Sin evaluar'}
          · ${ind.history.length} eval${ind.history.length !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
    <div class="pm-route-indicador__timeline" data-timeline="${idx}" hidden>
      ${_renderTimeline(ind.history, idx)}
    </div>
  `).join('')
}

function _renderPendingTasks(pendingTasks) {
  if (!pendingTasks.length) return ''
  return `
    <section class="pm-student-panel__section">
      <h3 class="pm-student-panel__section-title">Tareas pendientes</h3>
      <ul class="pm-pending-tasks">
        ${pendingTasks.map(t => `
          <li class="pm-pending-tasks__item">
            <strong>${_escHTML(t.indicadorNombre)}:</strong> ${_escHTML(t.tarea)}
          </li>
        `).join('')}
      </ul>
    </section>
  `
}

function _renderContent(alumno, { indicatorSummaries, avance, pendingTasks }) {
  return `
    ${_renderHeader(alumno, avance)}
    <div class="pm-student-panel__body">
      ${_renderPendingTasks(pendingTasks)}
      <section class="pm-student-panel__section">
        <h3 class="pm-student-panel__section-title">Ruta de aprendizaje</h3>
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
      Cargando datos del alumno…
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

export function createStudentProgressPanel({ alumno, rutaId, sessionId, claseId, fecha, horaInicio }) {
  _injectStyles()

  // Create DOM element
  const el = document.createElement('aside')
  el.className = 'pm-student-panel'
  el.setAttribute('role', 'dialog')
  el.setAttribute('aria-modal', 'false')
  el.setAttribute('aria-label', `Progreso de ${alumno.nombre_completo}`)
  document.body.appendChild(el)

  // Keep reference to loaded summaries for event delegation
  let _summaries = []

  // ── Event delegation ──────────────────────────────────────────────────────
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

  /**
   * Modal logic for adding/editing evaluations
   */
  async function _onOpenEvalModal(indicatorIdx, historyIdx = null) {
    const indicator = _summaries[indicatorIdx]
    const evaluation = historyIdx !== null ? indicator.history[historyIdx] : null
    let selectedNota = evaluation?.nota ?? null

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
            <label>Nota del indicador</label>
            <div class="pm-student-panel__nota-picker">
              ${[0, 1, 2, 3, 4, 5].map(n => `
                <button class="pm-student-panel__nota-btn ${selectedNota === n ? 'active' : ''}" data-nota="${n}">${n}</button>
              `).join('')}
            </div>
          </div>
          
          <div class="pm-student-panel__modal-field">
            <label>Observaciones / Comentarios</label>
            <textarea id="modal-obs" rows="4" style="width: 100%; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; color: #fff; padding: 12px; font-size: 0.9rem; resize: none; outline: none;" placeholder="Escribe aquí las observaciones...">${evaluation ? _escHTML(evaluation.observations) : ''}</textarea>
          </div>
        </div>

        <div class="pm-student-panel__modal-footer">
          <button class="pm-btn pm-btn-outline" data-action="modal-close">Cancelar</button>
          <button class="pm-btn pm-btn-primary" data-action="modal-save">
            ${evaluation ? 'Actualizar' : 'Guardar Evaluación'}
          </button>
        </div>
      </div>
    `
    document.body.appendChild(overlay)

    // Modal internal listeners
    overlay.addEventListener('click', async (e) => {
      const btn = e.target.closest('[data-nota]')
      if (btn) {
        overlay.querySelectorAll('[data-nota]').forEach(b => b.classList.remove('active'))
        btn.classList.add('active')
        selectedNota = parseInt(btn.dataset.nota)
        return
      }

      const action = e.target.closest('[data-action]')?.dataset.action
      if (action === 'modal-close') {
        overlay.remove()
      } else if (action === 'modal-save') {
        const observations = overlay.querySelector('#modal-obs').value
        await _saveEvaluation(indicator.id, selectedNota, observations, evaluation?.id)
        overlay.remove()
      }
    })
    
    // Backdrop click close
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove() })
  }

  async function _saveEvaluation(indicatorId, nota, observations, attemptId = null) {
    try {
      const maestro = getMaestroLocal();
      if (!maestro) throw new Error('No hay sesión de maestro activa.');

      console.log('[studentProgressPanel] Saving via RPC...', { 
        claseId, fecha, horaInicio, indicatorId, studentId: alumno.id, nota 
      })

      // Llamamos al RPC atómico que asegura la sesión y guarda la evaluación en un solo paso
      const { data: newSessionId, error } = await supabase.rpc('ensure_session_and_save_evaluation', {
        p_clase_id: claseId,
        p_maestro_id: maestro.id,
        p_fecha: fecha,
        p_hora_inicio: horaInicio,
        p_indicator_id: indicatorId,
        p_student_id: alumno.id,
        p_nota: nota,
        p_observations: (observations || '').trim()
      });

      if (error) throw error;

      console.log('[studentProgressPanel] Save successful. Session ID:', newSessionId)
      await open() 
    } catch (err) {
      console.error('[studentProgressPanel] Error during RPC save flow:', err)
      alert('Error al guardar la evaluación: ' + (err.message || 'Error de base de datos'))
    }
  }

  el.addEventListener('click', _onClick)

  // Keyboard accessibility for toggle-history buttons
  el.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      const target = e.target.closest('[data-action="toggle-history"]')
      if (target) {
        e.preventDefault()
        target.click()
      }
    }
  })

  // ── Public API ────────────────────────────────────────────────────────────
  async function open() {
    el.innerHTML = _renderLoading()
    el.classList.add('pm-student-panel--open')

    try {
      const data = await _loadProgress(alumno.id, rutaId)
      _summaries = data.indicatorSummaries
      el.innerHTML = _renderContent(alumno, data)
    } catch (err) {
      console.error('[studentProgressPanel] Error loading progress:', err)
      el.innerHTML = _renderError(err?.message ?? 'Error desconocido al cargar datos.')
    }
  }

  function close() {
    el.classList.remove('pm-student-panel--open')
    // Clear content after CSS transition (300ms)
    setTimeout(() => {
      if (!el.classList.contains('pm-student-panel--open')) {
        el.innerHTML = ''
        _summaries = []
      }
    }, 300)
  }

  function destroy() {
    unbindBP()
    el.removeEventListener('click', _onClick)
    el.remove()
  }

  return { open, close, destroy }
}

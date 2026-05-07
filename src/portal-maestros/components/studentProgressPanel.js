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
  if (nota >= 4)    return { color: 'green',  icon: '🟢', label: 'Dominado' }
  if (nota >= 2)    return { color: 'yellow', icon: '🟡', label: 'En progreso' }
  return              { color: 'red',    icon: '🔴', label: 'Necesita trabajo' }
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
  const indicatorSummaries = validIndicators.map(ind => {
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

  const dominados = indicatorSummaries.filter(i => i.latestNota >= 4).length
  const total = indicatorSummaries.length
  const avance = total > 0 ? Math.round((dominados / total) * 100) : 0

  // Pending tasks: latest evaluation per indicator that has a tarea
  const pendingTasks = indicatorSummaries
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

function _renderTimeline(history) {
  if (!history.length) return '<p style="padding:8px;color:var(--color-text-muted,#888)">Sin evaluaciones previas</p>'
  return `
    <ul class="pm-eval-timeline">
      ${history.map(h => `
        <li class="pm-eval-timeline__item">
          <span class="pm-eval-timeline__date">${_escHTML(_formatDate(h.created_at))}</span>
          <span class="pm-eval-timeline__nota">Nota: ${_escHTML(String(h.nota ?? '-'))}</span>
          ${h.observations ? `<span class="pm-eval-timeline__detail">${_escHTML(h.observations)}</span>` : ''}
          ${h.tarea ? `<span class="pm-eval-timeline__detail"><strong>Tarea:</strong> ${_escHTML(h.tarea)}</span>` : ''}
        </li>
      `).join('')}
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
      ${_renderTimeline(ind.history)}
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
      <section class="pm-student-panel__section">
        <h3 class="pm-student-panel__section-title">Ruta de aprendizaje</h3>
        <div class="pm-route-map">
          ${_renderIndicators(indicatorSummaries)}
        </div>
      </section>
      ${_renderPendingTasks(pendingTasks)}
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

export function createStudentProgressPanel({ alumno, rutaId }) {
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
    el.removeEventListener('click', _onClick)
    el.remove()
  }

  return { open, close, destroy }
}

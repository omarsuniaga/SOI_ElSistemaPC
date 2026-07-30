import { escHTML } from '../../utils/portalUtils.js'
import { AppToast } from '../../../shared/components/AppToast.js'
import * as weeklyPlanAdapter from '../../../modules/planificacion/api/weeklyPlanAdapter.js'

/**
 * Grade panel modal — displays indicators and lets the teacher
 * mark them as achieved/pending for present students.
 * Attendance-gated: only shows students marked as present (P).
 *
 * @param {HTMLElement} container
 * @param {Object} opts
 * @param {Array} opts.alumnos - full student list [{id, nombre_completo, instrumento_principal}]
 * @param {Object} opts.estado - attendance map { [alumnoId]: 'P'|'A'|'J'|'T'|null }
 * @param {Object} opts.currentItem - current weekly plan item { indicator_id, node_id, topic, week_number }
 * @param {string} opts.rutaId - active route_version ID
 * @param {string} opts.sesionId - current session ID (can be null)
 * @param {Function} opts.onGraded - callback() after grades saved, to refresh parent
 * @returns {{ destroy: Function, open: Function }}
 */
export function createGradePanel(container, opts) {
  let overlay = null
  let isSaving = false

  _injectStyles()

  function open(currentItemOverride) {
    if (overlay) return
    const currentItem = currentItemOverride || opts.currentItem

    const presentStudents = (opts.alumnos || []).filter(
      (a) => opts.estado[a.id] === 'P'
    )

    if (presentStudents.length === 0) {
      AppToast.warning('No hay alumnos presentes para calificar.')
      return
    }

    const topic = currentItem?.topic || 'Indicador'
    const indicatorId = currentItem?.indicator_id || null

    overlay = document.createElement('div')
    overlay.className = 'pm-grade-overlay'
    overlay.innerHTML = `
      <div class="pm-grade-modal">
        <div class="pm-grade-header">
          <div>
            <div class="pm-grade-title">Calificar indicador: ${escHTML(topic)}</div>
            <div class="pm-grade-subtitle">${presentStudents.length} alumno${presentStudents.length !== 1 ? 's' : ''} presente${presentStudents.length !== 1 ? 's' : ''}</div>
          </div>
          <button class="pm-grade-close" aria-label="Cerrar">&times;</button>
        </div>

        <div class="pm-grade-body">
          ${presentStudents.map((student) => `
            <div class="pm-grade-row" data-student-id="${escHTML(student.id)}">
              <div class="pm-grade-student-info">
                <div class="pm-grade-student-name">${escHTML(student.nombre_completo)}</div>
                <div class="pm-grade-student-instrument">${escHTML(student.instrumento_principal || '')}</div>
              </div>
              <select class="pm-grade-select" data-student-id="${escHTML(student.id)}">
                <option value="achieved">Logrado</option>
                <option value="pending" selected>Pendiente</option>
              </select>
              <textarea
                class="pm-grade-observation"
                data-student-id="${escHTML(student.id)}"
                placeholder="Observaciones (opcional)"
                rows="2"
              ></textarea>
            </div>
          `).join('')}
        </div>

        <div class="pm-grade-footer">
          <button class="pm-grade-btn-cancel">Cancelar</button>
          <button class="pm-grade-btn-save">Guardar calificaciones</button>
        </div>
      </div>
    `

    container.appendChild(overlay)

    overlay.querySelector('.pm-grade-close').addEventListener('click', close)
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close()
    })
    overlay.querySelector('.pm-grade-btn-cancel').addEventListener('click', close)
    overlay.querySelector('.pm-grade-btn-save').addEventListener('click', () =>
      handleSave(presentStudents, indicatorId)
    )

    requestAnimationFrame(() => {
      requestAnimationFrame(() => overlay.classList.add('pm-grade-overlay--visible'))
    })
  }

  async function handleSave(presentStudents, indicatorId) {
    if (isSaving) return
    if (!indicatorId) {
      AppToast.warning('No se identificó el indicador a calificar.')
      return
    }

    const saveBtn = overlay?.querySelector('.pm-grade-btn-save')
    if (saveBtn) {
      saveBtn.disabled = true
      saveBtn.textContent = 'Guardando...'
    }
    isSaving = true

    const errors = []

    for (const student of presentStudents) {
      const select = overlay.querySelector(
        `.pm-grade-select[data-student-id="${student.id}"]`
      )
      const textarea = overlay.querySelector(
        `.pm-grade-observation[data-student-id="${student.id}"]`
      )

      const status = select?.value || 'pending'
      const observation = textarea?.value?.trim() || ''

      try {
        await weeklyPlanAdapter.registrarProgresoIndicador(
          student.id,
          indicatorId,
          status,
          observation,
          '',
          opts.sesionId || null
        )
      } catch (err) {
        console.error('[GradePanel] Error saving grade for', student.id, err)
        errors.push(student.nombre_completo)
      }
    }

    isSaving = false

    if (errors.length > 0) {
      AppToast.error(
        `Error al calificar: ${errors.join(', ')}. Intente de nuevo.`
      )
      if (saveBtn) {
        saveBtn.disabled = false
        saveBtn.textContent = 'Guardar calificaciones'
      }
      return
    }

    AppToast.success('Calificaciones guardadas correctamente.')
    close()
    if (typeof opts.onGraded === 'function') opts.onGraded()
  }

  function close() {
    if (!overlay) return
    overlay.classList.remove('pm-grade-overlay--visible')
    setTimeout(() => {
      if (overlay && overlay.parentNode) overlay.remove()
      overlay = null
    }, 300)
  }

  function destroy() {
    if (overlay && overlay.parentNode) overlay.remove()
    overlay = null
    isSaving = false
  }

  return { destroy, open }
}

function _injectStyles() {
  if (document.getElementById('pm-grade-panel-styles')) return

  const style = document.createElement('style')
  style.id = 'pm-grade-panel-styles'
  style.textContent = `
    .pm-grade-overlay {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.72);
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      z-index: 2100;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      opacity: 0;
      transition: opacity 0.25s ease;
    }

    .pm-grade-overlay--visible {
      opacity: 1;
    }

    .pm-grade-modal {
      width: min(640px, 100%);
      max-height: 90vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      background: var(--pm-surface, #0f172a);
      color: var(--pm-text, #fff);
      border: 1px solid var(--pm-border, rgba(255, 255, 255, 0.1));
      border-radius: 18px;
      box-shadow: 0 24px 48px rgba(0, 0, 0, 0.25);
    }

    .pm-grade-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;
      padding: 16px 18px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    .pm-grade-title {
      font-weight: 800;
      font-size: 1rem;
    }

    .pm-grade-subtitle {
      font-size: 0.8rem;
      color: var(--pm-text-muted, #94a3b8);
      margin-top: 4px;
    }

    .pm-grade-close {
      border: none;
      background: none;
      color: inherit;
      font-size: 1.4rem;
      cursor: pointer;
      line-height: 1;
      padding: 0;
      flex-shrink: 0;
    }

    .pm-grade-body {
      overflow-y: auto;
      padding: 14px 18px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      flex: 1;
    }

    .pm-grade-row {
      display: grid;
      grid-template-columns: 1fr auto;
      grid-template-rows: auto auto;
      gap: 8px;
      padding: 12px;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 12px;
    }

    .pm-grade-student-info {
      grid-column: 1 / -1;
      display: flex;
      align-items: baseline;
      gap: 8px;
      min-width: 0;
    }

    .pm-grade-student-name {
      font-weight: 700;
      font-size: 0.9rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .pm-grade-student-instrument {
      font-size: 0.75rem;
      color: var(--pm-text-muted, #94a3b8);
      white-space: nowrap;
    }

    .pm-grade-select {
      justify-self: end;
      padding: 4px 24px 4px 8px;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      background: var(--pm-surface, #1e293b);
      color: var(--pm-text, #fff);
      font-size: 0.78rem;
      font-weight: 700;
      cursor: pointer;
      appearance: none;
      -webkit-appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 16 16'%3E%3Cpath fill='%239ca3af' d='M4 6l4 4 4-4'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 6px center;
    }

    .pm-grade-observation {
      grid-column: 1 / -1;
      width: 100%;
      border-radius: 8px;
      padding: 8px;
      border: 1px solid rgba(255, 255, 255, 0.06);
      background: rgba(255, 255, 255, 0.02);
      color: inherit;
      font-size: 0.8rem;
      resize: vertical;
      font-family: inherit;
    }

    .pm-grade-observation::placeholder {
      color: var(--pm-text-muted, #64748b);
    }

    .pm-grade-observation:focus {
      outline: none;
      border-color: var(--pm-primary, #3b82f6);
    }

    .pm-grade-footer {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      padding: 14px 18px;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
    }

    .pm-grade-btn-cancel {
      border: 1px solid rgba(255, 255, 255, 0.12);
      background: transparent;
      color: inherit;
      padding: 10px 14px;
      border-radius: 12px;
      font-weight: 700;
      font-size: 0.85rem;
      cursor: pointer;
    }

    .pm-grade-btn-save {
      border: none;
      background: var(--pm-primary, #3b82f6);
      color: #fff;
      padding: 10px 14px;
      border-radius: 12px;
      font-weight: 700;
      font-size: 0.85rem;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }

    .pm-grade-btn-save:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      box-shadow: none;
    }

    /* ── Light theme ── */
    [data-theme="light"] .pm-grade-overlay {
      background: rgba(0, 0, 0, 0.4);
    }

    [data-theme="light"] .pm-grade-modal {
      background: #fff;
      color: #1e293b;
      border-color: #e5e7eb;
    }

    [data-theme="light"] .pm-grade-header {
      border-bottom-color: #e5e7eb;
    }

    [data-theme="light"] .pm-grade-subtitle {
      color: #6b7280;
    }

    [data-theme="light"] .pm-grade-row {
      background: #f9fafb;
      border-color: #e5e7eb;
    }

    [data-theme="light"] .pm-grade-student-instrument {
      color: #6b7280;
    }

    [data-theme="light"] .pm-grade-select {
      background-color: #fff;
      color: #1e293b;
      border-color: #d1d5db;
    }

    [data-theme="light"] .pm-grade-observation {
      background: #fff;
      border-color: #d1d5db;
      color: #1e293b;
    }

    [data-theme="light"] .pm-grade-observation::placeholder {
      color: #9ca3af;
    }

    [data-theme="light"] .pm-grade-footer {
      border-top-color: #e5e7eb;
    }

    [data-theme="light"] .pm-grade-btn-cancel {
      border-color: #d1d5db;
      color: #374151;
    }
  `
  document.head.appendChild(style)
}

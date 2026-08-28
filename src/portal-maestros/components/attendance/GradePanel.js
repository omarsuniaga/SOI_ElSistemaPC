import { escHTML } from '../../utils/portalUtils.js'
import { AppToast } from '../../../shared/components/AppToast.js'
import * as weeklyPlanAdapter from '../../../modules/planificacion/api/weeklyPlanAdapter.js'
import { supabase } from '../../../lib/supabaseClient.js'
import { checkPrerequisiteSatisfied, getDirectPrerequisite } from '../../services/maestroRouteService.js'

const STAR_LABELS = {
  1: 'Inicial',
  2: 'En proceso',
  3: 'Aceptable',
  4: 'Logrado',
  5: 'Sobresaliente',
}

/**
 * Grade panel modal — displays indicators and lets the teacher
 * evaluate present students with 1 to 5 interactive stars (⭐).
 * Includes 1-Tap Fast grading (Todos 5★) and prerequisite debt tracking.
 *
 * @param {HTMLElement} container
 * @param {Object} opts
 * @param {Array} opts.alumnos - full student list [{id, nombre_completo, instrumento_principal}]
 * @param {Object} opts.estado - attendance map { [alumnoId]: 'P'|'A'|'J'|'T'|null }
 * @param {Object} opts.currentItem - current weekly plan item { indicator_id, node_id, topic, week_number }
 * @param {string} opts.rutaId - active route_version ID
 * @param {string} opts.claseId - active class ID
 * @param {string} opts.sesionId - current session ID (can be null)
 * @param {Function} opts.onGraded - callback() after grades saved, to refresh parent
 * @returns {{ destroy: Function, open: Function }}
 */
export function createGradePanel(container, opts) {
  let overlay = null
  let isSaving = false
  const studentGrades = new Map() // studentId -> { rating: number (1-5), observation: string }
  const studentDebts = new Map() // studentId -> { prereqId, prereqNombre, isSatisfied }

  _injectStyles()

  async function open(currentItemOverride) {
    if (overlay) return
    const currentItem = currentItemOverride || opts.currentItem

    const presentStudents = (opts.alumnos || []).filter(
      (a) => opts.estado[a.id] === 'P'
    )

    if (presentStudents.length === 0) {
      AppToast.warning('No hay alumnos presentes para calificar.')
      return
    }

    const topic = currentItem?.topic || currentItem?.nombre || 'Indicador'
    const indicatorId = currentItem?.indicator_id || currentItem?.id || null
    const claseId = opts.claseId || currentItem?.clase_id || null

    // Check direct prerequisite for this indicator
    let prereqInfo = null
    if (indicatorId) {
      try {
        prereqInfo = await getDirectPrerequisite(indicatorId)
      } catch (_e) {
        console.warn('[GradePanel] Could not check prerequisite:', _e)
      }
    }

    // Initialize ratings (default 5 stars) and check debts per student
    studentGrades.clear()
    studentDebts.clear()

    await Promise.all(
      presentStudents.map(async (student) => {
        studentGrades.set(student.id, { rating: 5, observation: '' })
        if (prereqInfo && claseId) {
          try {
            const isSatisfied = await checkPrerequisiteSatisfied(prereqInfo.id, student.id, claseId)
            studentDebts.set(student.id, {
              prereqId: prereqInfo.id,
              prereqNombre: prereqInfo.nombre,
              isSatisfied,
            })
          } catch (_err) {
            studentDebts.set(student.id, {
              prereqId: prereqInfo.id,
              prereqNombre: prereqInfo.nombre,
              isSatisfied: true,
            })
          }
        }
      })
    )

    overlay = document.createElement('div')
    overlay.className = 'pm-grade-overlay'
    overlay.innerHTML = `
      <div class="pm-grade-modal">
        <div class="pm-grade-header">
          <div class="pm-grade-header-info">
            <div class="pm-grade-title"><i class="bi bi-star-fill text-warning"></i> Calificar: ${escHTML(topic)}</div>
            <div class="pm-grade-subtitle">${presentStudents.length} alumno${presentStudents.length !== 1 ? 's' : ''} presente${presentStudents.length !== 1 ? 's' : ''}</div>
          </div>
          <div class="pm-grade-header-actions">
            <button type="button" class="pm-btn-quick-5star" id="btn-quick-all-5star" title="Asignar 5 estrellas a todos los presentes">
              <i class="bi bi-lightning-charge-fill"></i> Todos 5★
            </button>
            <button class="pm-grade-close" aria-label="Cerrar">&times;</button>
          </div>
        </div>

        <div class="pm-grade-body">
          ${presentStudents.map((student) => {
            const debt = studentDebts.get(student.id)
            const hasDebt = debt && !debt.isSatisfied
            const currentRating = studentGrades.get(student.id)?.rating || 5

            return `
              <div class="pm-grade-row ${hasDebt ? 'has-debt' : ''}" data-student-id="${escHTML(student.id)}">
                <div class="pm-grade-student-info">
                  <div class="pm-grade-avatar">${escHTML(student.nombre_completo?.[0] || 'A')}</div>
                  <div class="pm-grade-details">
                    <div class="pm-grade-student-name">${escHTML(student.nombre_completo)}</div>
                    <div class="pm-grade-student-instrument">${escHTML(student.instrumento_principal || '—')}</div>
                  </div>
                  ${
                    hasDebt
                      ? `<div class="pm-grade-debt-badge" title="Requiere solventar el indicador previo: ${escHTML(debt.prereqNombre)}">
                           <i class="bi bi-lock-fill"></i> Deuda: ${escHTML(debt.prereqNombre)}
                         </div>`
                      : ''
                  }
                </div>

                <div class="pm-grade-rating-container">
                  <div class="pm-grade-stars" data-student-id="${escHTML(student.id)}">
                    ${[1, 2, 3, 4, 5]
                      .map(
                        (star) => `
                      <button type="button" class="pm-star-btn ${star <= currentRating ? 'active' : ''}" data-star="${star}" aria-label="${star} estrellas">
                        ★
                      </button>
                    `
                      )
                      .join('')}
                  </div>
                  <span class="pm-star-label" id="label-star-${escHTML(student.id)}">${STAR_LABELS[currentRating]} (${currentRating}★)</span>
                </div>

                <div class="pm-grade-obs-wrapper">
                  <input
                    type="text"
                    class="pm-grade-observation"
                    data-student-id="${escHTML(student.id)}"
                    placeholder="Observación o nota cualitativa (opcional)"
                    value=""
                  />
                </div>
              </div>
            `
          }).join('')}
        </div>

        <div class="pm-grade-footer">
          <button class="pm-grade-btn-cancel">Cancelar</button>
          <button class="pm-grade-btn-save">
            <i class="bi bi-check2-circle"></i> Guardar calificaciones
          </button>
        </div>
      </div>
    `

    container.appendChild(overlay)

    // Event listeners
    overlay.querySelector('.pm-grade-close').addEventListener('click', close)
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close()
    })
    overlay.querySelector('.pm-grade-btn-cancel').addEventListener('click', close)
    overlay.querySelector('.pm-grade-btn-save').addEventListener('click', () =>
      handleSave(presentStudents, indicatorId, claseId)
    )

    // 1-Tap All 5 Stars button
    overlay.querySelector('#btn-quick-all-5star').addEventListener('click', () => {
      presentStudents.forEach((student) => {
        setStudentRating(student.id, 5)
      })
      AppToast.info('Se asignaron 5 estrellas a todos los alumnos.')
    })

    // Star clicks
    overlay.querySelectorAll('.pm-star-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const star = parseInt(btn.dataset.star, 10)
        const row = btn.closest('.pm-grade-row')
        const studentId = row?.dataset.studentId
        if (studentId && star >= 1 && star <= 5) {
          setStudentRating(studentId, star)
        }
      })
    })

    // Observation input listener
    overlay.querySelectorAll('.pm-grade-observation').forEach((input) => {
      input.addEventListener('input', () => {
        const studentId = input.dataset.studentId
        const current = studentGrades.get(studentId) || { rating: 5, observation: '' }
        current.observation = input.value
        studentGrades.set(studentId, current)
      })
    })

    requestAnimationFrame(() => {
      requestAnimationFrame(() => overlay.classList.add('pm-grade-overlay--visible'))
    })
  }

  function setStudentRating(studentId, rating) {
    const current = studentGrades.get(studentId) || { rating: 5, observation: '' }
    current.rating = rating
    studentGrades.set(studentId, current)

    // Update UI stars
    const starsContainer = overlay?.querySelector(`.pm-grade-stars[data-student-id="${studentId}"]`)
    if (starsContainer) {
      starsContainer.querySelectorAll('.pm-star-btn').forEach((btn) => {
        const starVal = parseInt(btn.dataset.star, 10)
        btn.classList.toggle('active', starVal <= rating)
      })
    }

    // Update text label
    const label = overlay?.querySelector(`#label-star-${studentId}`)
    if (label) {
      label.textContent = `${STAR_LABELS[rating] || ''} (${rating}★)`
    }
  }

  async function handleSave(presentStudents, indicatorId, claseId) {
    if (isSaving) return
    if (!indicatorId) {
      AppToast.warning('No se identificó el indicador a calificar.')
      return
    }

    const saveBtn = overlay?.querySelector('.pm-grade-btn-save')
    if (saveBtn) {
      saveBtn.disabled = true
      saveBtn.innerHTML = `<span class="spinner-border spinner-border-sm" role="status"></span> Guardando...`
    }
    isSaving = true

    const errors = []

    for (const student of presentStudents) {
      const grade = studentGrades.get(student.id) || { rating: 5, observation: '' }
      const rating = grade.rating || 5
      const observation = grade.observation?.trim() || ''
      const status = rating >= 3 ? 'achieved' : 'pending'

      try {
        // 1. Guardar en weeklyPlanAdapter / indicator_attempts
        await weeklyPlanAdapter.registrarProgresoIndicador(
          student.id,
          indicatorId,
          status,
          observation,
          '',
          opts.sesionId || null
        )

        // 2. Guardar en tabla evaluacion_indicador con nota (1-5) y recovery_status
        const evalPayload = {
          alumno_id: student.id,
          indicator_id: indicatorId,
          maestro_indicador_id: indicatorId,
          clase_id: claseId,
          sesion_id: opts.sesionId || null,
          nota: rating,
          observaciones: observation || null,
          recovery_status: rating >= 3 ? 'recuperado' : 'pendiente',
          updated_at: new Date().toISOString(),
        }

        try {
          await supabase
            .from('evaluacion_indicador')
            .upsert(evalPayload, { onConflict: 'alumno_id,indicator_id,clase_id' })
        } catch (_dbErr) {
          console.warn('[GradePanel] evaluacion_indicador save notice:', _dbErr)
        }
      } catch (err) {
        console.error('[GradePanel] Error saving grade for', student.id, err)
        errors.push(student.nombre_completo)
      }
    }

    isSaving = false

    if (errors.length > 0) {
      AppToast.error(`Error al calificar: ${errors.join(', ')}. Intente de nuevo.`)
      if (saveBtn) {
        saveBtn.disabled = false
        saveBtn.innerHTML = `<i class="bi bi-check2-circle"></i> Guardar calificaciones`
      }
      return
    }

    AppToast.success('Calificaciones con estrellas guardadas correctamente.')
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
      background: rgba(15, 23, 42, 0.78);
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
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
      width: min(680px, 100%);
      max-height: 90vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      background: var(--pm-surface, #0f172a);
      color: var(--pm-text, #fff);
      border: 1px solid var(--pm-border, rgba(255, 255, 255, 0.12));
      border-radius: 20px;
      box-shadow: 0 24px 60px rgba(0, 0, 0, 0.4);
    }

    .pm-grade-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      padding: 18px 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      background: rgba(255, 255, 255, 0.02);
    }

    .pm-grade-header-info {
      flex: 1;
      min-width: 0;
    }

    .pm-grade-title {
      font-weight: 800;
      font-size: 1.05rem;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .pm-grade-subtitle {
      font-size: 0.82rem;
      color: var(--pm-text-muted, #94a3b8);
      margin-top: 3px;
    }

    .pm-grade-header-actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .pm-btn-quick-5star {
      background: rgba(245, 158, 11, 0.18);
      color: #fbbf24;
      border: 1px solid rgba(245, 158, 11, 0.35);
      border-radius: 12px;
      padding: 6px 14px;
      font-weight: 800;
      font-size: 0.82rem;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .pm-btn-quick-5star:hover {
      background: rgba(245, 158, 11, 0.28);
      transform: translateY(-1px);
    }

    .pm-grade-close {
      border: none;
      background: none;
      color: inherit;
      font-size: 1.4rem;
      cursor: pointer;
      line-height: 1;
      padding: 4px;
      border-radius: 8px;
    }

    .pm-grade-body {
      overflow-y: auto;
      padding: 16px 20px;
      display: flex;
      flex-direction: column;
      gap: 14px;
      flex: 1;
    }

    .pm-grade-row {
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding: 14px 16px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.07);
      border-radius: 14px;
      transition: border-color 0.2s ease;
    }

    .pm-grade-row.has-debt {
      border-left: 4px solid #f59e0b;
      background: rgba(245, 158, 11, 0.04);
    }

    .pm-grade-student-info {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .pm-grade-avatar {
      width: 34px;
      height: 34px;
      border-radius: 10px;
      background: var(--pm-primary, #3b82f6);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 0.9rem;
      flex-shrink: 0;
    }

    .pm-grade-details {
      flex: 1;
      min-width: 140px;
    }

    .pm-grade-student-name {
      font-weight: 700;
      font-size: 0.92rem;
      color: var(--pm-text, #fff);
    }

    .pm-grade-student-instrument {
      font-size: 0.75rem;
      color: var(--pm-text-muted, #94a3b8);
    }

    .pm-grade-debt-badge {
      background: rgba(239, 68, 68, 0.16);
      color: #f87171;
      border: 1px solid rgba(239, 68, 68, 0.3);
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 0.72rem;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      margin-left: auto;
    }

    .pm-grade-rating-container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 4px 0;
    }

    .pm-grade-stars {
      display: inline-flex;
      gap: 6px;
    }

    .pm-star-btn {
      background: transparent;
      border: none;
      font-size: 1.6rem;
      color: rgba(255, 255, 255, 0.2);
      cursor: pointer;
      padding: 0 4px;
      line-height: 1;
      transition: all 0.15s ease;
    }

    .pm-star-btn:hover {
      transform: scale(1.18);
      color: #fde047;
    }

    .pm-star-btn.active {
      color: #eab308;
      text-shadow: 0 0 10px rgba(234, 179, 8, 0.5);
    }

    .pm-star-label {
      font-size: 0.82rem;
      font-weight: 700;
      color: #e2e8f0;
      min-width: 120px;
      text-align: right;
    }

    .pm-grade-obs-wrapper {
      width: 100%;
    }

    .pm-grade-observation {
      width: 100%;
      border-radius: 10px;
      padding: 8px 12px;
      border: 1px solid rgba(255, 255, 255, 0.08);
      background: rgba(255, 255, 255, 0.03);
      color: inherit;
      font-size: 0.82rem;
      font-family: inherit;
    }

    .pm-grade-observation:focus {
      outline: none;
      border-color: var(--pm-primary, #3b82f6);
      background: rgba(59, 130, 246, 0.05);
    }

    .pm-grade-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 16px 20px;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      background: rgba(255, 255, 255, 0.02);
    }

    .pm-grade-btn-cancel {
      border: 1px solid rgba(255, 255, 255, 0.15);
      background: transparent;
      color: inherit;
      padding: 10px 18px;
      border-radius: 12px;
      font-weight: 700;
      font-size: 0.88rem;
      cursor: pointer;
    }

    .pm-grade-btn-save {
      border: none;
      background: var(--pm-primary, #3b82f6);
      color: #fff;
      padding: 10px 20px;
      border-radius: 12px;
      font-weight: 800;
      font-size: 0.88rem;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 4px 14px rgba(59, 130, 246, 0.35);
      transition: all 0.2s ease;
    }

    .pm-grade-btn-save:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 6px 18px rgba(59, 130, 246, 0.45);
    }

    .pm-grade-btn-save:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    /* ── Light theme ── */
    [data-theme="light"] .pm-grade-overlay {
      background: rgba(15, 23, 42, 0.45);
    }

    [data-theme="light"] .pm-grade-modal {
      background: #ffffff;
      color: #1e293b;
      border-color: #e2e8f0;
    }

    [data-theme="light"] .pm-grade-header,
    [data-theme="light"] .pm-grade-footer {
      background: #f8fafc;
      border-color: #e2e8f0;
    }

    [data-theme="light"] .pm-grade-row {
      background: #ffffff;
      border-color: #e2e8f0;
    }

    [data-theme="light"] .pm-grade-student-name {
      color: #0f172a;
    }

    [data-theme="light"] .pm-star-btn {
      color: #cbd5e1;
    }

    [data-theme="light"] .pm-star-btn.active {
      color: #eab308;
    }

    [data-theme="light"] .pm-star-label {
      color: #334155;
    }

    [data-theme="light"] .pm-grade-observation {
      background: #f8fafc;
      border-color: #cbd5e1;
      color: #0f172a;
    }
  `
  document.head.appendChild(style)
}

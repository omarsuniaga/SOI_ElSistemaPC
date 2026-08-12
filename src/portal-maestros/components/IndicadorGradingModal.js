/**
 * IndicadorGradingModal - Modal de "Calificaciones" para un indicador del mapa de rutas
 * Tres secciones: Presentes (estrellas), Con Deudas Académicas (ausentes/justificados
 * + recuperación), Observaciones (texto libre — el botón "Analizar" con IA se conecta
 * en un PR posterior, ver openspec/changes/teacher-portal-ai-grading/design.md).
 */

import { AppToast } from '../../shared/components/AppToast.js'
import { escHTML } from '../utils/portalUtils.js'
import { getAlumnos } from '../services/catalogService.js'
import {
  getAttendanceForClass,
  getIndicadorEvaluations,
  saveIndicadorNota,
  updateRecoveryStatus,
} from '../services/maestroDataService.js'
import { checkPrerequisiteSatisfied, getDirectPrerequisite } from '../services/maestroRouteService.js'

/**
 * @param {Object} opts
 * @param {string} opts.claseId
 * @param {string} opts.fecha - 'YYYY-MM-DD', fecha de la sesión que se está calificando
 * @param {string} opts.indicadorId
 * @param {string} opts.indicadorNombre
 * @param {string} [opts.breadcrumb] - Ej. "Unidad 1 > Objetivo 2"
 * @param {string} opts.maestroId - id local del maestro (tabla maestros)
 * @param {string} opts.evaluadoPor - auth.uid() del maestro (maestro.user_id)
 * @param {() => void} [opts.onSaved]
 */
export async function openIndicadorGradingModal({
  claseId,
  fecha,
  indicadorId,
  indicadorNombre,
  breadcrumb = '',
  evaluadoPor,
  onSaved,
} = {}) {
  if (!claseId || !fecha || !indicadorId) {
    AppToast.error('Faltan datos para abrir la calificación del indicador')
    return
  }

  const backdrop = document.createElement('div')
  backdrop.className = 'igm-backdrop'
  backdrop.innerHTML = `
    <div class="igm-modal" role="dialog" aria-modal="true" aria-label="Calificaciones">
      <div class="igm-header">
        <div>
          ${breadcrumb ? `<div class="igm-breadcrumb">${escHTML(breadcrumb)}</div>` : ''}
          <h3>${escHTML(indicadorNombre || 'Indicador')}</h3>
        </div>
        <button class="igm-close" aria-label="Cerrar"><i class="bi bi-x-lg"></i></button>
      </div>
      <div class="igm-body">
        <div class="igm-loading"><div class="spinner-border spinner-border-sm"></div> Cargando…</div>
      </div>
      <div class="igm-footer">
        <button class="igm-btn igm-btn-primary" id="igm-completar" disabled>
          <i class="bi bi-check2-all"></i> Marcar como completamente evaluado
        </button>
      </div>
    </div>
  `
  document.body.appendChild(backdrop)

  const closeModal = () => backdrop.remove()
  backdrop.querySelector('.igm-close').addEventListener('click', closeModal)
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeModal()
  })

  const body = backdrop.querySelector('.igm-body')

  // Estado en memoria: alumno_id -> { nota, recovery_status, recovery_notes, recovery_grade }
  const state = new Map()

  try {
    const [alumnos, attendance, evaluaciones, prerequisito] = await Promise.all([
      getAlumnos(claseId),
      getAttendanceForClass(claseId, fecha),
      getIndicadorEvaluations(indicadorId, claseId),
      getDirectPrerequisite(indicadorId),
    ])

    evaluaciones.forEach((ev) => state.set(ev.alumno_id, ev))

    const presentesIds = new Set(attendance.presentes)
    const ausentesIds = new Set(attendance.ausentes)
    const alumnosMap = Object.fromEntries(alumnos.map((a) => [a.id, a]))

    if (presentesIds.size === 0 && ausentesIds.size === 0) {
      body.innerHTML = `
        <div class="igm-empty">
          <i class="bi bi-clipboard-x"></i>
          <p>No hay asistencia registrada para el ${escHTML(fecha)}.</p>
          <p class="igm-empty-sub">Pasa asistencia primero para poder calificar este indicador.</p>
        </div>
      `
      return
    }

    // Prerrequisitos: solo para presentes (a los ausentes no se les califica todavía)
    let prereqSatisfaction = {}
    if (prerequisito) {
      const entries = await Promise.all(
        [...presentesIds].map(async (alumnoId) => [
          alumnoId,
          await checkPrerequisiteSatisfied(prerequisito.id, alumnoId, claseId),
        ])
      )
      prereqSatisfaction = Object.fromEntries(entries)
    }

    function _renderPresente(alumnoId) {
      const alumno = alumnosMap[alumnoId]
      if (!alumno) return ''
      const ev = state.get(alumnoId) || {}
      const nota = ev.nota || 0
      const warn = prerequisito && !prereqSatisfaction[alumnoId]
      const reviewFlag = !!ev.review_flag

      return `
        <div class="igm-alumno-row" data-alumno-id="${alumnoId}">
          <div class="igm-alumno-info">
            <span class="igm-alumno-nombre">${escHTML(alumno.nombre)}</span>
            ${warn ? `<span class="igm-warn-badge" title="Prerrequisito no satisfecho"><i class="bi bi-exclamation-triangle-fill"></i> Requiere "${escHTML(prerequisito.nombre)}"</span>` : ''}
            ${reviewFlag ? `<span class="igm-review-badge" title="Recalificado el prerrequisito, revisa esta nota"><i class="bi bi-arrow-repeat"></i> Revisar</span>` : ''}
          </div>
          <div class="igm-stars" data-alumno-id="${alumnoId}">
            ${[1, 2, 3, 4, 5]
              .map(
                (n) =>
                  `<button class="igm-star ${n <= nota ? 'igm-star-filled' : ''}" data-value="${n}" aria-label="${n} estrellas"><i class="bi bi-star-fill"></i></button>`
              )
              .join('')}
          </div>
        </div>
      `
    }

    function _renderAusente(alumnoId) {
      const alumno = alumnosMap[alumnoId]
      if (!alumno) return ''
      const ev = state.get(alumnoId) || {}
      const resuelto = ev.recovery_status === 'recuperado' || ev.recovery_status === 'no_recuperable'

      if (resuelto) {
        const label = ev.recovery_status === 'recuperado' ? 'Recuperado' : 'No recuperable'
        const cls = ev.recovery_status === 'recuperado' ? 'igm-recuperado' : 'igm-no-recuperable'
        return `
          <div class="igm-alumno-row" data-alumno-id="${alumnoId}">
            <div class="igm-alumno-info">
              <span class="igm-alumno-nombre">${escHTML(alumno.nombre)}</span>
            </div>
            <span class="igm-deuda-resuelta ${cls}"><i class="bi bi-check-circle-fill"></i> ${label}</span>
          </div>
        `
      }

      return `
        <div class="igm-alumno-row igm-alumno-row-deuda" data-alumno-id="${alumnoId}">
          <div class="igm-alumno-info">
            <span class="igm-alumno-nombre">${escHTML(alumno.nombre)}</span>
          </div>
          <button class="igm-btn-deuda" data-alumno-id="${alumnoId}">
            Con Deudas Académicas
          </button>
        </div>
        <div class="igm-recovery-form" data-alumno-id="${alumnoId}" hidden>
          <select class="igm-recovery-select" data-alumno-id="${alumnoId}">
            <option value="recuperado">Recuperado</option>
            <option value="no_recuperable">No Recuperable</option>
          </select>
          <textarea class="igm-recovery-notes" data-alumno-id="${alumnoId}" placeholder="Nota (opcional)"></textarea>
          <div class="igm-recovery-actions">
            <button class="igm-btn igm-btn-ghost igm-recovery-cancel" data-alumno-id="${alumnoId}">Cancelar</button>
            <button class="igm-btn igm-btn-primary igm-recovery-confirm" data-alumno-id="${alumnoId}">Registrar</button>
          </div>
        </div>
      `
    }

    body.innerHTML = `
      <div class="igm-section">
        <h4 class="igm-section-title"><i class="bi bi-people-fill"></i> Presentes</h4>
        <div class="igm-alumno-list" id="igm-presentes">
          ${[...presentesIds].map(_renderPresente).join('') || '<p class="igm-empty-inline">Sin alumnos presentes</p>'}
        </div>
      </div>

      <div class="igm-section">
        <h4 class="igm-section-title"><i class="bi bi-exclamation-circle-fill"></i> Con Deudas Académicas</h4>
        <div class="igm-alumno-list" id="igm-ausentes">
          ${[...ausentesIds].map(_renderAusente).join('') || '<p class="igm-empty-inline">Nadie ausente esta sesión</p>'}
        </div>
      </div>

      <div class="igm-section">
        <h4 class="igm-section-title"><i class="bi bi-chat-left-text-fill"></i> Observaciones</h4>
        <textarea class="igm-observaciones" placeholder="Escribe cómo fue la clase…" maxlength="1000"></textarea>
        <button class="igm-btn igm-btn-secondary igm-analizar" disabled title="Disponible en un próximo PR">
          <i class="bi bi-magic"></i> Analizar (próximamente)
        </button>
      </div>
    `

    function _refreshCompletarBtn() {
      const todosPresentesCalificados = [...presentesIds].every((id) => (state.get(id) || {}).nota)
      const todosAusentesResueltos = [...ausentesIds].every((id) => {
        const s = (state.get(id) || {}).recovery_status
        return s === 'recuperado' || s === 'no_recuperable'
      })
      const btn = backdrop.querySelector('#igm-completar')
      const completo = todosPresentesCalificados && todosAusentesResueltos
      btn.disabled = !completo
      btn.classList.toggle('igm-btn-success', completo)
      if (completo) {
        btn.innerHTML = '<i class="bi bi-check2-all"></i> Indicador completamente evaluado'
      }
    }

    function _bindStars() {
      body.querySelectorAll('.igm-stars').forEach((starsEl) => {
        const alumnoId = starsEl.dataset.alumnoId
        starsEl.querySelectorAll('.igm-star').forEach((starBtn) => {
          starBtn.addEventListener('click', async () => {
            const value = Number(starBtn.dataset.value)
            starsEl.querySelectorAll('.igm-star').forEach((s) => {
              s.classList.toggle('igm-star-filled', Number(s.dataset.value) <= value)
            })
            try {
              const saved = await saveIndicadorNota({
                alumnoId,
                indicadorId,
                claseId,
                nota: value,
                evaluadoPor,
              })
              state.set(alumnoId, { ...(state.get(alumnoId) || {}), ...saved, nota: value })
              _refreshCompletarBtn()
            } catch (err) {
              AppToast.error(`No se pudo guardar: ${err.message}`)
            }
          })
        })
      })
    }

    function _bindDeudaButtons() {
      body.querySelectorAll('.igm-btn-deuda').forEach((btn) => {
        btn.addEventListener('click', () => {
          const alumnoId = btn.dataset.alumnoId
          const form = body.querySelector(`.igm-recovery-form[data-alumno-id="${alumnoId}"]`)
          if (form) form.hidden = !form.hidden
        })
      })

      body.querySelectorAll('.igm-recovery-cancel').forEach((btn) => {
        btn.addEventListener('click', () => {
          const form = body.querySelector(`.igm-recovery-form[data-alumno-id="${btn.dataset.alumnoId}"]`)
          if (form) form.hidden = true
        })
      })

      body.querySelectorAll('.igm-recovery-confirm').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const alumnoId = btn.dataset.alumnoId
          const select = body.querySelector(`.igm-recovery-select[data-alumno-id="${alumnoId}"]`)
          const notesEl = body.querySelector(`.igm-recovery-notes[data-alumno-id="${alumnoId}"]`)
          const status = select.value
          const notes = notesEl.value.trim()

          btn.disabled = true
          try {
            const saved = await updateRecoveryStatus(alumnoId, indicadorId, claseId, status, notes, null, evaluadoPor)
            state.set(alumnoId, { ...(state.get(alumnoId) || {}), ...saved, recovery_status: status })

            const row = body.querySelector(`.igm-alumno-row-deuda[data-alumno-id="${alumnoId}"]`)
            const form = body.querySelector(`.igm-recovery-form[data-alumno-id="${alumnoId}"]`)
            if (row) row.outerHTML = _renderAusente(alumnoId)
            if (form) form.remove()
            AppToast.success('Recuperación registrada')
            _refreshCompletarBtn()
          } catch (err) {
            AppToast.error(`No se pudo registrar la recuperación: ${err.message}`)
            btn.disabled = false
          }
        })
      })
    }

    _bindStars()
    _bindDeudaButtons()
    _refreshCompletarBtn()

    backdrop.querySelector('#igm-completar').addEventListener('click', () => {
      AppToast.success('Indicador marcado como completamente evaluado')
      closeModal()
      onSaved?.()
    })
  } catch (err) {
    console.error('[IndicadorGradingModal] error:', err)
    body.innerHTML = `<p class="igm-empty-inline" style="color:var(--pm-danger,#ef4444)">Error al cargar: ${escHTML(err.message)}</p>`
  }
}

// ─── Estilos ──────────────────────────────────────────────────
if (!document.getElementById('igm-styles')) {
  const s = document.createElement('style')
  s.id = 'igm-styles'
  s.textContent = `
    .igm-backdrop {
      position: fixed; inset: 0; background: rgba(15,23,42,0.55);
      display: flex; align-items: center; justify-content: center;
      z-index: 9500; padding: 1rem;
    }
    .igm-modal {
      background: var(--pm-surface, #fff);
      border-radius: 16px; width: min(640px, 100%); max-height: 90vh;
      display: flex; flex-direction: column; box-shadow: 0 24px 64px rgba(0,0,0,0.25);
    }
    .igm-header {
      display: flex; align-items: flex-start; justify-content: space-between;
      padding: 1rem 1.25rem; border-bottom: 1px solid var(--pm-border, #e5e7eb);
    }
    .igm-header h3 { margin: 0.15rem 0 0; font-size: 1.05rem; font-weight: 700; }
    .igm-breadcrumb { font-size: 0.75rem; color: var(--pm-text-muted); font-weight: 600; }
    .igm-close { background: none; border: none; font-size: 1.1rem; cursor: pointer; color: var(--pm-text-muted); }
    .igm-body { padding: 1rem 1.25rem; overflow-y: auto; flex: 1; }
    .igm-footer { padding: 0.85rem 1.25rem; border-top: 1px solid var(--pm-border, #e5e7eb); }
    .igm-loading { display: flex; align-items: center; gap: 0.5rem; justify-content: center; padding: 2rem 0; color: var(--pm-text-muted); }
    .igm-empty { text-align: center; padding: 2rem 1rem; color: var(--pm-text-muted); }
    .igm-empty i { font-size: 2rem; margin-bottom: 0.5rem; display: block; }
    .igm-empty-sub { font-size: 0.82rem; }
    .igm-empty-inline { color: var(--pm-text-muted); font-size: 0.85rem; padding: 0.5rem 0; }

    .igm-section { margin-bottom: 1.25rem; }
    .igm-section-title {
      font-size: 0.85rem; font-weight: 700; margin: 0 0 0.5rem;
      display: flex; align-items: center; gap: 0.4rem; color: var(--pm-text);
    }
    .igm-alumno-list { display: flex; flex-direction: column; gap: 0.4rem; }
    .igm-alumno-row {
      display: flex; align-items: center; justify-content: space-between;
      gap: 0.5rem; padding: 0.5rem 0.65rem; border: 1px solid var(--pm-border, #e5e7eb);
      border-radius: 10px; background: var(--pm-surface-2, #fafafa); flex-wrap: wrap;
    }
    .igm-alumno-info { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
    .igm-alumno-nombre { font-size: 0.86rem; font-weight: 600; }
    .igm-warn-badge, .igm-review-badge {
      font-size: 0.68rem; font-weight: 600; padding: 0.1rem 0.4rem; border-radius: 6px;
    }
    .igm-warn-badge { background: rgba(245,158,11,0.12); color: #d97706; }
    .igm-review-badge { background: rgba(139,92,246,0.12); color: #7c3aed; }

    .igm-stars { display: flex; gap: 0.15rem; }
    .igm-star { background: none; border: none; cursor: pointer; color: #d1d5db; font-size: 1.1rem; padding: 0.1rem; }
    .igm-star-filled { color: #f59e0b; }

    .igm-btn-deuda {
      background: rgba(239,68,68,0.08); color: var(--pm-danger, #ef4444);
      border: 1px solid rgba(239,68,68,0.25); border-radius: 8px;
      padding: 0.35rem 0.6rem; font-size: 0.78rem; font-weight: 700; cursor: pointer;
    }
    .igm-deuda-resuelta { font-size: 0.78rem; font-weight: 700; display: flex; align-items: center; gap: 0.3rem; }
    .igm-recuperado { color: #059669; }
    .igm-no-recuperable { color: var(--pm-text-muted); }

    .igm-recovery-form {
      display: flex; flex-direction: column; gap: 0.4rem;
      padding: 0.6rem; margin: -0.2rem 0 0.4rem; border: 1px dashed var(--pm-border, #d1d5db);
      border-radius: 10px; background: var(--pm-surface, #fff);
    }
    .igm-recovery-select, .igm-recovery-notes {
      width: 100%; padding: 0.4rem 0.55rem; border-radius: 8px;
      border: 1px solid var(--pm-border, #d1d5db); font-size: 0.82rem;
    }
    .igm-recovery-notes { min-height: 50px; resize: vertical; }
    .igm-recovery-actions { display: flex; justify-content: flex-end; gap: 0.4rem; }

    .igm-observaciones {
      width: 100%; min-height: 80px; padding: 0.55rem 0.7rem; border-radius: 10px;
      border: 1px solid var(--pm-border, #d1d5db); font-size: 0.85rem; resize: vertical; margin-bottom: 0.5rem;
    }

    .igm-btn {
      border-radius: 8px; padding: 0.45rem 0.8rem; font-size: 0.82rem; font-weight: 600;
      cursor: pointer; border: 1px solid transparent; display: inline-flex; align-items: center; gap: 0.35rem;
    }
    .igm-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .igm-btn-primary { background: var(--pm-primary, #3b82f6); color: #fff; width: 100%; justify-content: center; }
    .igm-btn-success { background: #059669 !important; }
    .igm-btn-secondary { background: var(--pm-surface-2, #f3f4f6); color: var(--pm-text, #111827); border-color: var(--pm-border, #d1d5db); }
    .igm-btn-ghost { background: none; color: var(--pm-text-muted); }
  `
  document.head.appendChild(s)
}

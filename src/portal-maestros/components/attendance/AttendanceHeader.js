import { escHTML, formatHora, formatFechaPortal } from '../../utils/portalUtils.js'

/**
 * createAttendanceHeader
 * Renderiza la cabecera de la vista de asistencia.
 *
 * @param {HTMLElement} container
 * @param {{
 *   clase: { nombre: string },
 *   horario: { hora_inicio: string, hora_fin: string } | null,
 *   salonNombre: string | null,
 *   fechaHoy: string,
 *   totalAlumnos: number,
 *   counts?: { P: number, J: number, A: number },
 *   hasConflict: boolean,
 *   onBack: () => void,
 * }} opts
 */
export function createAttendanceHeader(container, opts) {
  const { clase, horario, salonNombre, fechaHoy, totalAlumnos, counts = { P: 0, J: 0, A: 0 }, hasConflict, onBack } = opts
  const _listeners = []

  function _on(el, event, handler) {
    el.addEventListener(event, handler)
    _listeners.push(() => el.removeEventListener(event, handler))
  }

  container.innerHTML = `
    ${hasConflict
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
      <div class="pm-asist-header-row1">
        <button id="pm-asist-back" class="pm-icon-btn"><i class="bi bi-arrow-left"></i></button>
        <div class="pm-asist-header-titles">
          <h2 class="pm-asist-title">${escHTML(clase.nombre)}</h2>
          <p class="pm-asist-subtitle">
            ${salonNombre ? `📍 ${escHTML(salonNombre)} · ` : ''}
            ${horario ? `${formatHora(horario.hora_inicio)} – ${formatHora(horario.hora_fin)} · ` : ''}
            <span class="pm-asist-subtitle-fecha">${formatFechaPortal(new Date(fechaHoy + 'T12:00:00'))}</span> ·
            <span id="pm-header-total-alumnos">${totalAlumnos} alumnos</span>
          </p>
        </div>
      </div>
      <div class="pm-asist-header-row2">
        <div class="pm-asist-header-row2-left">
          <div id="pm-sync-badge-container"></div>
          <div id="pm-asist-counts-badge" class="pm-asist-counts-badge" title="Resumen de asistencia">
            <span class="pm-count-item count-p"><strong class="pm-count-tag">P:</strong><span class="pm-count-num" id="pm-count-p">${counts.P ?? 0}</span></span>
            <span class="pm-count-sep">|</span>
            <span class="pm-count-item count-j"><strong class="pm-count-tag">J:</strong><span class="pm-count-num" id="pm-count-j">${counts.J ?? 0}</span></span>
            <span class="pm-count-sep">|</span>
            <span class="pm-count-item count-a"><strong class="pm-count-tag">A:</strong><span class="pm-count-num" id="pm-count-a">${counts.A ?? 0}</span></span>
          </div>
          <button id="pm-btn-help" class="pm-help-btn" title="Guía rápida"><i class="bi bi-question-lg"></i></button>
        </div>
        <div class="pm-asist-bulk-circles">
          <button id="btn-bulk-p" class="pm-bulk-circle p" title="Marcar todos presentes">P</button>
          <button id="btn-bulk-a" class="pm-bulk-circle a" title="Marcar todos ausentes">A</button>
          <button id="btn-bulk-clear" class="pm-bulk-circle clear" title="Desmarcar a todos los alumnos"><i class="bi bi-arrow-counterclockwise"></i></button>
        </div>
      </div>
    </div>
  `

  const backBtn = container.querySelector('#pm-asist-back')
  if (backBtn) _on(backBtn, 'click', onBack)

  function updateCounts(newCounts = {}) {
    const elP = container.querySelector('#pm-count-p')
    const elJ = container.querySelector('#pm-count-j')
    const elA = container.querySelector('#pm-count-a')
    if (elP) elP.textContent = String(newCounts.P ?? 0)
    if (elJ) elJ.textContent = String(newCounts.J ?? 0)
    if (elA) elA.textContent = String(newCounts.A ?? 0)
  }

  return {
    updateCounts,
    destroy() {
      _listeners.forEach((fn) => { try { fn() } catch { /* ignore */ } })
      _listeners.length = 0
    },
  }
}

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
 *   hasConflict: boolean,
 *   onBack: () => void,
 * }} opts
 */
export function createAttendanceHeader(container, opts) {
  const { clase, horario, salonNombre, fechaHoy, totalAlumnos, hasConflict, onBack } = opts
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
      <button id="pm-asist-back" class="pm-icon-btn"><i class="bi bi-arrow-left"></i></button>
      <div style="flex:1">
        <h2 class="pm-asist-title">${escHTML(clase.nombre)}</h2>
        <p class="pm-asist-subtitle">
          ${salonNombre ? `📍 ${escHTML(salonNombre)} · ` : ''}
          ${horario ? `${formatHora(horario.hora_inicio)} – ${formatHora(horario.hora_fin)} · ` : ''}
          <span style="color:var(--pm-primary); font-weight:700;">${formatFechaPortal(new Date(fechaHoy + 'T12:00:00'))}</span> · 
          ${totalAlumnos} alumnos
        </p>
      </div>
      <div style="display:flex;align-items:center;gap:0.75rem;">
        <div id="pm-sync-badge-container"></div>
        <button id="pm-btn-help" class="pm-help-btn" title="Guía rápida"><i class="bi bi-question-lg"></i></button>
        <div class="pm-asist-bulk-circles">
          <button id="btn-bulk-p" class="pm-bulk-circle p" title="Todos presentes">P</button>
          <button id="btn-bulk-a" class="pm-bulk-circle a" title="Todos ausentes">A</button>
        </div>
      </div>
    </div>
  `

  const backBtn = container.querySelector('#pm-asist-back')
  if (backBtn) _on(backBtn, 'click', onBack)

  return {
    destroy() {
      _listeners.forEach((fn) => { try { fn() } catch { /* ignore */ } })
      _listeners.length = 0
    },
  }
}

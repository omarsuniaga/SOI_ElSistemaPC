/**
 * calificacionIndicadorPanel.js — Panel de calificación 1-5 por indicador (Modo Sesión)
 *
 * Tarea 3.4 (openspec/changes/mapa-gamificado-planificacion): lista los
 * alumnos PRESENTES de la sesión actual — no todos los de la clase, solo los
 * que asistencia marcó presentes hoy (resueltos por el container,
 * `MapaClaseView.js` Tarea 3.2, vía `obtenerAsistenciaDelDia`) — y permite
 * calificar 1-5 por indicador usando `evaluacionClaseService.js` (Tarea
 * 2.4, ya existe).
 *
 * REQ-05: una nota >= 3 es "superado" — se refleja en un badge visual
 * inmediato al elegir la nota (usa `esNotaSuperada`, la misma regla que la
 * vista `vw_clase_objetivo_estrellas`/`domain/EstrellasObjetivo.js`).
 *
 * Patrón visual: mismo overlay/estilo que evaluacionClaseModal.js /
 * objetivoEditorModal.js.
 */

import { registrarEvaluacion, esNotaSuperada } from '../services/evaluacionClaseService.js'

const NOTAS = [1, 2, 3, 4, 5]

/**
 * @param {object} options
 * @param {string} options.claseId
 * @param {string} options.claseIndicadorId - id de clase_mapa_indicadores (REQ-14)
 * @param {string} [options.indicadorDescripcion]
 * @param {Array<{id: string, nombre: string}>} [options.presentes] - alumnos presentes hoy (REQ-05)
 * @param {string} [options.fecha]
 * @param {string|null} [options.evaluadoPor]
 * @param {function} [options.onGuardado] - callback tras guardar, recibe { guardados, total }
 * @param {function} [options.onClosed]
 */
export function renderCalificacionIndicadorPanel({
  claseId,
  claseIndicadorId,
  indicadorDescripcion = '',
  presentes = [],
  fecha = null,
  evaluadoPor = null,
  onGuardado = null,
  onClosed = null,
}) {
  document.querySelectorAll('.calificacion-indicador-overlay').forEach((el) => el.remove())

  const notasPorAlumno = new Map()

  const overlay = document.createElement('div')
  overlay.className = 'calificacion-indicador-overlay'
  overlay.innerHTML = _buildHTML({ indicadorDescripcion, presentes, fecha })
  document.body.appendChild(overlay)

  if (!document.getElementById('calificacion-indicador-styles')) {
    const style = document.createElement('style')
    style.id = 'calificacion-indicador-styles'
    style.textContent = _getStyles()
    document.head.appendChild(style)
  }

  const close = () => {
    overlay.remove()
    onClosed?.()
  }

  overlay.querySelector('.calificacion-panel-close-x')?.addEventListener('click', close)
  overlay.querySelector('.calificacion-panel-backdrop')?.addEventListener('click', close)
  overlay.querySelector('.calificacion-panel-cancelar-btn')?.addEventListener('click', close)

  overlay.querySelectorAll('.calificacion-alumno-row').forEach((row) => {
    const alumnoId = row.dataset.alumnoId

    row.querySelectorAll('.btn-nota').forEach((btn) => {
      btn.addEventListener('click', () => {
        const nota = Number(btn.dataset.nota)
        notasPorAlumno.set(alumnoId, nota)

        row.querySelectorAll('.btn-nota').forEach((b) => b.classList.toggle('selected', b === btn))

        const badgeSlot = row.querySelector('.calificacion-badge-slot')
        if (badgeSlot) {
          badgeSlot.innerHTML = esNotaSuperada(nota)
            ? '<span class="calificacion-superado-badge">Superado</span>'
            : ''
        }
      })
    })
  })

  overlay.querySelector('.calificacion-panel-guardar-btn')?.addEventListener('click', async () => {
    const btn = overlay.querySelector('.calificacion-panel-guardar-btn')
    btn.disabled = true
    btn.textContent = 'Guardando...'

    let guardados = 0
    for (const [alumnoId, nota] of notasPorAlumno.entries()) {
      try {
        await registrarEvaluacion({
          alumno_id: alumnoId,
          clase_indicador_id: claseIndicadorId,
          clase_id: claseId,
          nota,
          evaluado_por: evaluadoPor,
        })
        guardados++
      } catch (err) {
        console.error('[calificacionIndicadorPanel] Error guardando evaluación:', alumnoId, err)
      }
    }

    onGuardado?.({ guardados, total: notasPorAlumno.size })
    close()
  })
}

function _buildHTML({ indicadorDescripcion, presentes, fecha }) {
  const rows = presentes
    .map(
      (a) => `
      <div class="calificacion-alumno-row" data-alumno-id="${a.id}">
        <div class="calificacion-alumno-info">
          <span class="calificacion-alumno-nombre">${esc(a.nombre)}</span>
          <span class="calificacion-badge-slot"></span>
        </div>
        <div class="calificacion-notas-btns">
          ${NOTAS.map((n) => `<button type="button" class="btn btn-sm btn-outline-primary btn-nota" data-nota="${n}">${n}</button>`).join('')}
        </div>
      </div>
    `,
    )
    .join('')

  return `
    <div class="calificacion-panel-backdrop"></div>
    <div class="calificacion-panel-dialog">
      <div class="calificacion-panel-header">
        <div>
          <h5 class="calificacion-panel-title">Calificar Indicador</h5>
          <p class="calificacion-panel-subtitle">${esc(indicadorDescripcion)}${fecha ? ` — ${esc(fecha)}` : ''}</p>
        </div>
        <button class="calificacion-panel-close-x" aria-label="Cerrar">&times;</button>
      </div>
      <div class="calificacion-panel-body">
        ${
          presentes.length === 0
            ? '<div class="text-muted text-center py-3">No hay alumnos presentes registrados para hoy.</div>'
            : rows
        }
      </div>
      <div class="calificacion-panel-footer">
        <button class="btn btn-outline-secondary calificacion-panel-cancelar-btn">Cancelar</button>
        <button class="btn btn-primary calificacion-panel-guardar-btn" ${presentes.length === 0 ? 'disabled' : ''}>Guardar</button>
      </div>
    </div>
  `
}

function esc(str) {
  if (!str) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function _getStyles() {
  return `
    .calificacion-indicador-overlay {
      position: fixed; inset: 0; z-index: 10002;
      display: flex; align-items: center; justify-content: center; padding: 1rem;
    }
    .calificacion-panel-backdrop {
      position: absolute; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px);
    }
    .calificacion-panel-dialog {
      position: relative; background: var(--bs-body-bg, #fff); border-radius: 12px;
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); width: 100%; max-width: 560px;
      max-height: 85vh; display: flex; flex-direction: column; overflow: hidden;
    }
    .calificacion-panel-header {
      display: flex; align-items: flex-start; justify-content: space-between;
      padding: 1rem 1.25rem; border-bottom: 1px solid var(--bs-border-color, #dee2e6);
    }
    .calificacion-panel-title { font-size: 1.05rem; font-weight: 700; margin: 0; }
    .calificacion-panel-subtitle { font-size: 0.78rem; color: var(--bs-secondary-color, #6c757d); margin: 0.15rem 0 0; }
    .calificacion-panel-close-x {
      width: 32px; height: 32px; border: none; background: var(--bs-tertiary-bg, #f8f9fa);
      border-radius: 8px; cursor: pointer; font-size: 1.2rem;
    }
    .calificacion-panel-body { flex: 1; overflow-y: auto; padding: 1rem 1.25rem; }
    .calificacion-alumno-row {
      display: flex; align-items: center; justify-content: space-between; gap: 0.75rem;
      padding: 0.5rem 0; border-bottom: 1px solid var(--bs-border-color, #eee);
    }
    .calificacion-alumno-info { display: flex; align-items: center; gap: 0.5rem; }
    .calificacion-alumno-nombre { font-weight: 600; font-size: 0.9rem; }
    .calificacion-superado-badge {
      background: #d1fae5; color: #065f46; border-radius: 6px; padding: 0.1rem 0.4rem;
      font-size: 0.7rem; font-weight: 700;
    }
    .calificacion-notas-btns { display: flex; gap: 0.25rem; }
    .btn-nota.selected { background: var(--bs-primary, #0d6efd); color: #fff; }
    .calificacion-panel-footer {
      display: flex; justify-content: flex-end; gap: 0.5rem;
      padding: 0.75rem 1.25rem; border-top: 1px solid var(--bs-border-color, #dee2e6);
    }
  `
}

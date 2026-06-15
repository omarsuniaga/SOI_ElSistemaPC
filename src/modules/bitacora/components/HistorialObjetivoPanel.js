import * as bitacoraAdapter from '../api/bitacoraAdapter.js'
import { ModalManager } from '../../../shared/components/modal.js'

function escapeHTML(str) {
  if (!str) return ''
  return String(str).replace(/[&<>"']/g, (m) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m])
  )
}

function formatDateShort(dateStr) {
  if (!dateStr) return '-'
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}

function getNotaBadge(nota) {
  const map = {
    bien: { class: 'bg-success', label: 'Bien', icon: 'bi-check-circle' },
    regular: { class: 'bg-warning text-dark', label: 'Regular', icon: 'bi-exclamation-circle' },
    mal: { class: 'bg-danger', label: 'Mal', icon: 'bi-x-circle' },
  }
  const cfg = map[nota] || { class: 'bg-secondary', label: nota || '-', icon: 'bi-question' }
  return `<span class="badge ${cfg.class}"><i class="bi ${cfg.icon} me-1"></i>${cfg.label}</span>`
}

/**
 * Extract per-student notas from a historial session entry.
 * Handles both:
 *   - Mock format: { fecha, notas: [{ alumno_id, nota }] }
 *   - Supabase format: { fecha, indicator_session_students: [{ alumno_id, nota_cualitativa }] }
 */
function extractNotas(sesion) {
  if (Array.isArray(sesion.notas)) {
    return sesion.notas
  }
  if (Array.isArray(sesion.indicator_session_students)) {
    return sesion.indicator_session_students.map((s) => ({
      alumno_id: s.alumno_id || s.student_id,
      nota: s.nota_cualitativa || s.nota,
    }))
  }
  return []
}

/**
 * Opens a modal panel showing the history of content sessions for a specific objetivo.
 *
 * @param {Object} opts
 * @param {string} opts.claseId
 * @param {string} opts.objetivoId
 * @param {string} [opts.objetivoTitulo]
 * @param {Array}  [opts.alumnos]  — optional, used for column headers
 */
export async function openHistorialObjetivoModal(opts = {}) {
  const { claseId, objetivoId, objetivoTitulo = 'Historial', alumnos = [] } = opts

  const loadingBody = `
    <div class="d-flex justify-content-center align-items-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando historial...</span>
      </div>
    </div>`

  const modal = ModalManager.createModal({
    id: 'modalHistorialObjetivo',
    title: `<i class="bi bi-clock-history me-1"></i>${escapeHTML(objetivoTitulo)}`,
    body: loadingBody,
    size: 'modal-lg',
  })

  try {
    const sesiones = await bitacoraAdapter.getHistorialContenido(claseId, objetivoId)

    if (!sesiones || sesiones.length === 0) {
      modal.element.querySelector('.modal-body').innerHTML = `
        <div class="text-center py-4">
          <i class="bi bi-inbox d-block mb-3" style="font-size:2.5rem;opacity:.3"></i>
          <p class="text-muted mb-0">No hay sesiones registradas para este objetivo.</p>
        </div>`
      return
    }

    const alumnoIds = [
      ...new Set(sesiones.flatMap((s) => extractNotas(s).map((n) => n.alumno_id))),
    ]

    const alumnoMap = {}
    for (const a of alumnos) {
      alumnoMap[a.id] = a
    }

    modal.element.querySelector('.modal-body').innerHTML = `
      <div class="table-responsive">
        <table class="table table-sm table-bordered mb-0">
          <thead class="table-light">
            <tr>
              <th style="min-width:110px">Fecha</th>
              ${alumnoIds.map((aid) => {
                const name = alumnoMap[aid]
                  ? (alumnoMap[aid].nombre_completo || alumnoMap[aid].nombre || alumnoMap[aid].name || aid)
                  : aid
                return `<th class="text-center small">${escapeHTML(name)}</th>`
              }).join('')}
            </tr>
          </thead>
          <tbody>
            ${sesiones.map((sesion) => {
              const notasMap = {}
              for (const n of extractNotas(sesion)) {
                notasMap[n.alumno_id] = n.nota
              }
              return `
                <tr>
                  <td class="align-middle small text-muted">${formatDateShort(sesion.fecha)}</td>
                  ${alumnoIds.map((aid) => `
                    <td class="text-center align-middle">
                      ${notasMap[aid] ? getNotaBadge(notasMap[aid]) : '<span class="text-muted small">-</span>'}
                    </td>
                  `).join('')}
                </tr>`
            }).join('')}
          </tbody>
        </table>
      </div>
      <div class="small text-muted mt-2 text-end">
        ${sesiones.length} sesión(es) registrada(s)
      </div>`
  } catch (error) {
    console.error('[HistorialObjetivoPanel]', error)
    modal.element.querySelector('.modal-body').innerHTML = `
      <div class="alert alert-danger d-flex align-items-start gap-2 mb-0" role="alert">
        <i class="bi bi-exclamation-triangle fs-4 mt-1"></i>
        <div>
          <h6 class="alert-heading mb-1">Error al cargar historial</h6>
          <p class="mb-0 small">${escapeHTML(error.message)}</p>
        </div>
      </div>`
  }
}

import { AppModal } from '../../../shared/components/AppModal.js'
import { escapeHTML } from '../utils/clasesUtils.js'

/**
 * Abre un modal de resolución de conflictos para el usuario al crear/editar una clase.
 *
 * Una sola acción, que resuelve lo que se puede resolver sin ambigüedad y
 * señala el resto:
 *
 *  - Salón: se libera el salón en conflicto de la clase existente — es un
 *    recurso físico, no hay decisión pedagógica que tomar ahí. La clase
 *    nueva pasa a usarlo.
 *  - Maestro y alumnos: NO se mutan. Desasignar un maestro o desinscribir
 *    un alumno es una decisión pedagógica, y el solape de alumnos muchas
 *    veces es intencional (ensayos generales que se superponen con clases
 *    individuales).
 *
 * En todos los casos la clase existente queda marcada como pendiente de
 * revisión, con el detalle exacto de qué se resolvió solo y qué falta
 * decidir — así el solape no pasa inadvertido.
 *
 * @param {Object} options
 * @param {Array} options.conflictos Lista de objetos de conflicto { tipo, clase_nombre, detalle, horario }
 * @param {Function} options.onConfirm Callback al confirmar guardar y resolver los conflictos
 */
export function openClaseConflictModal({ conflictos = [], onConfirm }) {
  const tieneSalon = conflictos.some(c => c.tipo === 'salón')
  const tieneOtros = conflictos.some(c => c.tipo !== 'salón')

  const explicacion = []
  if (tieneSalon) {
    explicacion.push('el salón en conflicto se libera de la clase existente para que lo use esta clase nueva')
  }
  if (tieneOtros) {
    explicacion.push('los conflictos de maestro o alumnos NO se tocan automáticamente — quedan para que los decidas vos')
  }

  const bodyHtml = `
    <div class="alert alert-warning mb-3 d-flex align-items-center gap-2">
      <i class="bi bi-exclamation-triangle-fill fs-4 flex-shrink-0"></i>
      <div>
        <strong class="d-block">Se detectaron solapes con clases existentes</strong>
        <span class="small text-muted">La nueva clase choca en horario, salón o alumnos con otras clases programadas.</span>
      </div>
    </div>

    <div class="list-group mb-3">
      ${conflictos.map(c => `
        <div class="list-group-item list-group-item-warning d-flex align-items-start gap-2 p-3">
          <i class="bi ${c.tipo === 'maestro' ? 'bi-person-workspace text-danger' : c.tipo === 'salón' ? 'bi-building-exclamation text-danger' : 'bi-people-fill text-warning'} fs-5 flex-shrink-0 mt-1"></i>
          <div class="flex-grow-1">
            <div class="fw-bold text-dark">${escapeHTML(c.clase_nombre || 'Clase en conflicto')}</div>
            <div class="small text-secondary mt-1">${escapeHTML(c.detalle)}</div>
            ${c.horario ? `<div class="badge text-bg-dark mt-1"><i class="bi bi-clock me-1"></i>${escapeHTML(c.horario)}</div>` : ''}
            ${c.tipo === 'salón'
              ? '<div class="small text-success mt-1"><i class="bi bi-check-circle me-1"></i>Se libera automáticamente</div>'
              : '<div class="small text-danger mt-1"><i class="bi bi-hand-index-thumb me-1"></i>Requiere tu decisión — queda marcada</div>'}
          </div>
        </div>
      `).join('')}
    </div>

    <div class="p-3 bg-body-tertiary rounded border small text-muted">
      Si continuás, esta clase se guarda y ${explicacion.join('; ')}.
      ${conflictos.length === 1 ? 'La clase de arriba queda' : 'Las clases de arriba quedan'}
      marcada${conflictos.length === 1 ? '' : 's'} como <strong>pendiente de revisión</strong>.
    </div>
  `

  AppModal.open({
    title: '⚠️ Conflicto de Clases Detectado',
    size: 'md',
    hideSave: true,
    cancelText: 'Cancelar',
    body: bodyHtml,
  })

  // Insert the custom action button inside the modal footer.
  requestAnimationFrame(() => {
    const footer = document.querySelector('.app-modal-footer')
    if (!footer) return

    footer.querySelectorAll('.conflict-action-btn').forEach(btn => btn.remove())

    const btnConfirm = document.createElement('button')
    btnConfirm.className = 'btn btn-warning btn-sm conflict-action-btn'
    btnConfirm.innerHTML = tieneSalon
      ? '<i class="bi bi-door-open me-1"></i>Guardar y liberar salón'
      : '<i class="bi bi-flag-fill me-1"></i>Guardar y marcar para revisión'
    btnConfirm.onclick = async () => {
      AppModal.close()
      if (onConfirm) await onConfirm()
    }

    footer.appendChild(btnConfirm)
  })
}

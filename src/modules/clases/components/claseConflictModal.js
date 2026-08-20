import { escapeHTML } from '../utils/clasesUtils.js'

/**
 * Abre un modal de resolución de conflictos para el usuario al crear/editar una clase.
 *
 * El usuario decide qué lado tiene prioridad. La clase no prioritaria queda
 * marcada para modificación posterior; el sistema no reasigna recursos.
 *
 * @param {Object} options
 * @param {Array} options.conflictos Lista de objetos de conflicto { tipo, clase_nombre, detalle, horario }
 * @param {Function} options.onConfirm Callback con prioridad: nueva | existentes
 * @param {Function} options.onCancel Callback al cancelar el guardado
 */
export function openClaseConflictModal({ conflictos = [], onConfirm, onCancel }) {

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
            <div class="small text-danger mt-1"><i class="bi bi-hand-index-thumb me-1"></i>La clase no prioritaria quedará marcada para modificación</div>
          </div>
        </div>
      `).join('')}
    </div>

    <div class="p-3 bg-body-tertiary rounded border small text-muted">
      Elegí qué lado tiene prioridad. El otro quedará marcado como <strong>pendiente de modificación</strong>, sin cambios automáticos de salón, maestro o alumnos.
    </div>
  `

  // AppModal is a singleton used by the class editor. This dialog must not
  // replace it, or the retry after confirmation would lose the form fields.
  document.getElementById('clase-conflict-dialog')?.remove()

  const dialog = document.createElement('div')
  dialog.id = 'clase-conflict-dialog'
  dialog.className = 'position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3'
  dialog.style.cssText = 'z-index: 1060; background: rgba(0, 0, 0, .45);'
  dialog.innerHTML = `
    <section class="bg-body rounded shadow-lg border" role="dialog" aria-modal="true" aria-labelledby="clase-conflict-title" style="width: min(560px, 100%); max-height: 90vh; overflow: auto;">
      <header class="px-3 py-2 border-bottom d-flex align-items-center justify-content-between">
        <h2 id="clase-conflict-title" class="h6 mb-0">⚠️ Conflicto de Clases Detectado</h2>
        <button type="button" class="btn-close" aria-label="Cerrar" data-conflict-cancel></button>
      </header>
      <div class="p-3">${bodyHtml}</div>
      <footer class="px-3 py-2 border-top d-flex justify-content-end gap-2">
        <button type="button" class="btn btn-outline-secondary btn-sm" data-conflict-cancel>Cancelar</button>
        <button type="button" class="btn btn-outline-warning btn-sm" data-conflict-confirm="existentes">
          Priorizar existentes
        </button>
        <button type="button" class="btn btn-warning btn-sm" data-conflict-confirm="nueva">
          Priorizar esta clase
        </button>
      </footer>
    </section>
  `

  const close = () => dialog.remove()
  const cancel = () => {
    close()
    if (onCancel) onCancel()
  }
  dialog.querySelectorAll('[data-conflict-cancel]').forEach((button) => {
    button.addEventListener('click', cancel)
  })
  dialog.querySelectorAll('[data-conflict-confirm]').forEach((button) => {
    button.addEventListener('click', async () => {
      close()
      if (onConfirm) await onConfirm(button.dataset.conflictConfirm)
    })
  })
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) cancel()
  })
  document.body.appendChild(dialog)
}

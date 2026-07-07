import { AppModal } from '../../../shared/components/AppModal.js'
import { formatDate, escapeHTML, getTipoLabel, getTipoIcon, getPrioridadColor, getPrioridadIcon } from '../utils/observacionesUtils.js'

export function openSeguimientoModal(observacion, _container, onSubmit) {
  const hoy = new Date().toISOString().split('T')[0]

  const body = `
    <div class="card border-0 bg-body-secondary p-3 mb-3 rounded">
      <div class="small d-flex flex-column gap-1">
        <div><strong>Título:</strong> ${escapeHTML(observacion.titulo)}</div>
        <div>
          <strong>Tipo:</strong>
          <span class="badge bg-${getPrioridadColor(observacion.tipo)} ms-1">
            <i class="bi ${getTipoIcon(observacion.tipo)}"></i> ${getTipoLabel(observacion.tipo)}
          </span>
        </div>
        <div>
          <strong>Prioridad:</strong>
          <span class="badge bg-${getPrioridadColor(observacion.prioridad)} ms-1">
            <i class="bi ${getPrioridadIcon(observacion.prioridad)}"></i>
            ${observacion.prioridad?.charAt(0).toUpperCase() + observacion.prioridad?.slice(1)}
          </span>
        </div>
        <div><strong>Descripción:</strong> ${escapeHTML(observacion.descripcion)}</div>
      </div>
    </div>

    <form novalidate>
      <div class="mb-3">
        <label class="form-label form-label-sm">Fecha de Seguimiento</label>
        <input type="date" class="form-control form-control-sm" id="seg-fecha" value="${hoy}">
      </div>
      <div class="mb-0">
        <label class="form-label form-label-sm">Observación de Seguimiento *</label>
        <textarea class="form-control form-control-sm" id="seg-observacion" rows="4" maxlength="500"
          placeholder="Describe el seguimiento realizado..."></textarea>
        <div class="form-text"><span id="seg-count">0</span>/500</div>
      </div>
    </form>
  `

  AppModal.open({
    title:    'Agregar Seguimiento',
    body,
    size:     'lg',
    saveText: 'Agregar Seguimiento',
    onSave:   async (bodyEl) => {
      const fecha      = bodyEl.querySelector('#seg-fecha')?.value
      const observacion= bodyEl.querySelector('#seg-observacion')?.value.trim()

      if (!observacion) { alert('La observación de seguimiento es obligatoria'); return false }

      if (onSubmit) await onSubmit(fecha, observacion)
    },
  })

  requestAnimationFrame(() => {
    const ta = document.getElementById('seg-observacion')
    const ct = document.getElementById('seg-count')
    if (ta && ct) {
      ta.addEventListener('input', () => {
        if (ta.value.length > 500) ta.value = ta.value.slice(0, 500)
        ct.textContent = ta.value.length
      })
    }
  })
}

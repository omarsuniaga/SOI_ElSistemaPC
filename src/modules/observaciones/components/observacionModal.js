import { AppModal } from '../../../shared/components/AppModal.js'
import { Observacion } from '../models/observacion.model.js'

export function openObservacionModal(mode, data = {}, options = {}) {
  const isEdit       = mode === 'edit'
  const obs          = isEdit ? new Observacion(data) : new Observacion()
  const tipos        = Observacion.getTipos()
  const prioridades  = Observacion.getPrioridades()
  const estados      = Observacion.getEstados()
  const alumnosList  = options.alumnos  || []
  const maestrosList = options.maestros || []

  const body = `
    <form id="formObservacion" novalidate>
      <div class="row g-2">
        <div class="col-md-6">
          <label class="form-label form-label-sm">Alumno *</label>
          <select class="form-select form-select-sm" id="obs-alumno_id" required>
            <option value="">Seleccionar alumno...</option>
            ${alumnosList.map(a => `<option value="${a.id}" ${obs.alumno_id === a.id ? 'selected' : ''}>${esc(a.name || a.nombre || 'Alumno')}</option>`).join('')}
          </select>
        </div>
        <div class="col-md-6">
          <label class="form-label form-label-sm">Maestro</label>
          <select class="form-select form-select-sm" id="obs-maestro_id">
            <option value="">Seleccionar maestro...</option>
            ${maestrosList.map(m => `<option value="${m.id}" ${obs.maestro_id === m.id ? 'selected' : ''}>${esc(m.nombre || m.name || 'Maestro')}</option>`).join('')}
          </select>
        </div>

        <div class="col-md-6">
          <label class="form-label form-label-sm">Tipo *</label>
          <select class="form-select form-select-sm" id="obs-tipo" required>
            ${tipos.map(t => `<option value="${t.value}" ${obs.tipo === t.value ? 'selected' : ''}>${t.label}</option>`).join('')}
          </select>
        </div>
        <div class="col-md-6">
          <label class="form-label form-label-sm">Prioridad</label>
          <select class="form-select form-select-sm" id="obs-prioridad">
            ${prioridades.map(p => `<option value="${p.value}" ${obs.prioridad === p.value ? 'selected' : ''}>${p.label}</option>`).join('')}
          </select>
        </div>

        <div class="col-md-6">
          <label class="form-label form-label-sm">Fecha</label>
          <input type="date" class="form-control form-control-sm" id="obs-fecha" value="${obs.fecha_observacion || ''}">
        </div>
        <div class="col-md-6">
          <label class="form-label form-label-sm">Estado</label>
          <select class="form-select form-select-sm" id="obs-estado">
            ${estados.map(e => `<option value="${e.value}" ${obs.estado === e.value ? 'selected' : ''}>${e.label}</option>`).join('')}
          </select>
        </div>

        <div class="col-12">
          <label class="form-label form-label-sm">Título *</label>
          <input type="text" class="form-control form-control-sm" id="obs-titulo" maxlength="100"
            placeholder="Título de la observación" autocomplete="off"
            value="${esc(obs.titulo || '')}">
          <div class="form-text"><span id="obs-titulo-count">${(obs.titulo || '').length}</span>/100</div>
        </div>

        <div class="col-12">
          <label class="form-label form-label-sm">Descripción *</label>
          <textarea class="form-control form-control-sm" id="obs-descripcion" maxlength="1000" rows="4"
            placeholder="Descripción detallada...">${esc(obs.descripcion || '')}</textarea>
          <div class="form-text"><span id="obs-desc-count">${(obs.descripcion || '').length}</span>/1000</div>
        </div>
      </div>
    </form>
  `

  AppModal.open({
    title:    isEdit ? 'Editar Observación' : 'Nueva Observación',
    body,
    size:     'lg',
    saveText: isEdit ? 'Guardar cambios' : 'Guardar',
    onSave:   async (bodyEl) => {
      const titulo     = bodyEl.querySelector('#obs-titulo')?.value.trim()
      const descripcion= bodyEl.querySelector('#obs-descripcion')?.value.trim()
      const alumnoId   = bodyEl.querySelector('#obs-alumno_id')?.value

      if (!titulo || titulo.length < 5) { alert('El título debe tener al menos 5 caracteres'); return false }
      if (!descripcion || descripcion.length < 20) { alert('La descripción debe tener al menos 20 caracteres'); return false }
      if (!alumnoId) { alert('El alumno es obligatorio'); return false }

      const payload = {
        titulo,
        descripcion,
        alumno_id:         alumnoId,
        maestro_id:        bodyEl.querySelector('#obs-maestro_id')?.value || null,
        tipo:              bodyEl.querySelector('#obs-tipo')?.value,
        prioridad:         bodyEl.querySelector('#obs-prioridad')?.value,
        estado:            bodyEl.querySelector('#obs-estado')?.value,
        fecha_observacion: bodyEl.querySelector('#obs-fecha')?.value || null,
      }

      if (options.onSubmit) await options.onSubmit(payload)
    },
  })

  requestAnimationFrame(() => {
    _counter('obs-titulo',      'obs-titulo-count')
    _counter('obs-descripcion', 'obs-desc-count')
  })
}

function _counter(inputId, countId) {
  const el = document.getElementById(inputId)
  const ct = document.getElementById(countId)
  if (!el || !ct) return
  el.addEventListener('input', () => { ct.textContent = el.value.length })
}

function esc(str) {
  if (!str) return ''
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
}

import { router } from '../../../core/router/router.js'
import { AppModal } from '../../../shared/components/AppModal.js'
import {
  listSeguimientoRules, createSeguimientoRule, updateSeguimientoRule,
  toggleSeguimientoRule, seedDefaultSeguimientoRules,
} from '../services/seguimientoRulesService.js'

const state = { container: null, rules: [] }

export async function renderSeguimientoRulesView(container) {
  if (!container) return
  state.container = container
  container.innerHTML = `<div class="page-container d-flex align-items-center justify-content-center" style="min-height:300px;"><div class="spinner-border text-primary"></div></div>`
  await _load()
}

async function _load() {
  try {
    state.rules = await listSeguimientoRules({})
    _render()
  } catch (err) {
    const safeMsg = String(err?.message || '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]))
    state.container.innerHTML = `<div class="page-container"><div class="alert alert-warning">Error: ${safeMsg}</div></div>`
  }
}

function _render() {
  state.container.innerHTML = `
    <div class="page-container">
      <div class="d-flex align-items-center gap-3 mb-4">
        <div class="brand-badge bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center" style="width:42px;height:42px;">
          <i class="bi bi-sliders fs-4"></i>
        </div>
        <div>
          <h1 class="page-title mb-0">Reglas de seguimiento</h1>
          <p class="text-muted small mb-0">${state.rules.length} regla(s) configurada(s)</p>
        </div>
        <div class="ms-auto d-flex gap-2">
          <button class="btn btn-sm btn-outline-secondary" id="btn-back">
            <i class="bi bi-arrow-left me-1"></i>Volver
          </button>
          <button class="btn btn-sm btn-outline-primary" id="btn-seed">
            <i class="bi bi-arrow-clockwise me-1"></i>Restaurar reglas por defecto
          </button>
          <button class="btn btn-sm btn-primary" id="btn-new-rule">
            <i class="bi bi-plus-lg me-1"></i>Nueva regla
          </button>
        </div>
      </div>

      ${state.rules.length === 0 ? `
        <div class="text-center py-5 text-muted">
          <i class="bi bi-sliders fs-1 d-block mb-2 opacity-40"></i>
          <p>No hay reglas configuradas.</p>
        </div>` : state.rules.map(_renderRule).join('')}
    </div>`

  _attachEvents()
}

function _renderRule(r) {
  return `
    <div class="card border-0 shadow-sm mb-2">
      <div class="card-body py-2 px-3">
        <div class="d-flex justify-content-between align-items-start gap-2">
          <div class="flex-grow-1 overflow-hidden">
            <div class="fw-semibold small">${r.nombre}</div>
            <div class="text-muted" style="font-size:0.72rem;">
              <span class="me-2">${r.tipo}</span>
              ${r.descripcion ? `<span class="me-2">· ${r.descripcion}</span>` : ''}
            </div>
            <details class="mt-2" style="font-size:0.72rem;">
              <summary class="text-muted">Ver configuración</summary>
              <pre class="mt-1 mb-0 small text-muted bg-light p-2 rounded">${JSON.stringify(r.config, null, 2)}</pre>
            </details>
          </div>
          <div class="d-flex align-items-center gap-2 flex-shrink-0">
            <span class="badge ${r.activo ? 'bg-success-subtle text-success-emphasis' : 'bg-secondary-subtle text-secondary-emphasis'}">${r.activo ? 'Activa' : 'Inactiva'}</span>
            <button class="btn btn-sm btn-outline-primary btn-edit-rule" data-id="${r.id}" title="Editar"><i class="bi bi-pencil"></i></button>
            <button class="btn btn-sm btn-outline-secondary btn-toggle-rule" data-id="${r.id}" data-activo="${r.activo}" title="${r.activo ? 'Desactivar' : 'Activar'}">
              <i class="bi ${r.activo ? 'bi-pause' : 'bi-play'}"></i>
            </button>
          </div>
        </div>
      </div>
    </div>`
}

function _attachEvents() {
  const c = state.container
  c.querySelector('#btn-back')?.addEventListener('click', () => router.navigate('pedagogico-seguimiento-institucional'))
  c.querySelector('#btn-new-rule')?.addEventListener('click', () => _openRuleModal(null))
  c.querySelector('#btn-seed')?.addEventListener('click', async () => {
    if (!confirm('¿Restaurar las reglas por defecto que falten?')) return
    const { inserted } = await seedDefaultSeguimientoRules()
    alert(`${inserted} regla(s) restaurada(s).`)
    await _load()
  })

  c.querySelectorAll('.btn-edit-rule').forEach(btn => {
    btn.addEventListener('click', () => {
      const rule = state.rules.find(r => r.id === btn.dataset.id)
      if (rule) _openRuleModal(rule)
    })
  })

  c.querySelectorAll('.btn-toggle-rule').forEach(btn => {
    btn.addEventListener('click', async () => {
      const activo = btn.dataset.activo === 'true'
      await toggleSeguimientoRule(btn.dataset.id, !activo)
      await _load()
    })
  })
}

function _openRuleModal(rule) {
  const isEdit = !!rule
  AppModal.open({
    title:    isEdit ? 'Editar regla' : 'Nueva regla',
    size:     'lg',
    saveText: isEdit ? 'Guardar' : 'Crear',
    body: `
      <div class="row g-2 small">
        <div class="col-md-8">
          <label class="form-label fw-semibold">Nombre *</label>
          <input type="text" class="form-control form-control-sm" id="rm-nombre" value="${rule?.nombre || ''}" required maxlength="160">
        </div>
        <div class="col-md-4">
          <label class="form-label fw-semibold">Prioridad</label>
          <input type="number" class="form-control form-control-sm" id="rm-prioridad" value="${rule?.prioridad ?? 1}" min="1">
        </div>
        <div class="col-12">
          <label class="form-label fw-semibold">Tipo *</label>
          <select class="form-select form-select-sm" id="rm-tipo" ${isEdit ? 'disabled' : ''}>
            <option value="asistencia_irregular"             ${rule?.tipo === 'asistencia_irregular'             ? 'selected' : ''}>Asistencia irregular</option>
            <option value="tardanzas_recurrentes"            ${rule?.tipo === 'tardanzas_recurrentes'            ? 'selected' : ''}>Tardanzas recurrentes</option>
            <option value="observacion_requiere_seguimiento" ${rule?.tipo === 'observacion_requiere_seguimiento' ? 'selected' : ''}>Observación requiere seguimiento</option>
            <option value="justificaciones_pendientes"       ${rule?.tipo === 'justificaciones_pendientes'       ? 'selected' : ''}>Justificaciones pendientes</option>
            <option value="conducta"                         ${rule?.tipo === 'conducta'                         ? 'selected' : ''}>Conducta</option>
            <option value="bajo_compromiso"                  ${rule?.tipo === 'bajo_compromiso'                  ? 'selected' : ''}>Bajo compromiso</option>
            <option value="instrumento_en_riesgo"            ${rule?.tipo === 'instrumento_en_riesgo'            ? 'selected' : ''}>Instrumento en riesgo</option>
            <option value="caso_manual"                      ${rule?.tipo === 'caso_manual'                      ? 'selected' : ''}>Caso manual</option>
          </select>
        </div>
        <div class="col-12">
          <label class="form-label fw-semibold">Descripción</label>
          <textarea class="form-control form-control-sm" id="rm-descripcion" rows="2">${rule?.descripcion || ''}</textarea>
        </div>
        <div class="col-12">
          <label class="form-label fw-semibold">Configuración (JSON)</label>
          <textarea class="form-control form-control-sm font-monospace" id="rm-config" rows="6" style="font-size:0.75rem;">${JSON.stringify(rule?.config || {}, null, 2)}</textarea>
        </div>
        <div class="col-12">
          <div class="form-check">
            <input type="checkbox" class="form-check-input" id="rm-activo" ${rule?.activo !== false ? 'checked' : ''}>
            <label class="form-check-label fw-semibold" for="rm-activo">Activa</label>
          </div>
        </div>
      </div>`,
    onSave: async () => {
      const nombre      = document.querySelector('#rm-nombre')?.value?.trim()
      const tipo        = document.querySelector('#rm-tipo')?.value
      const descripcion = document.querySelector('#rm-descripcion')?.value?.trim() || null
      const prioridad   = parseInt(document.querySelector('#rm-prioridad')?.value) || 1
      const activo      = document.querySelector('#rm-activo')?.checked
      const configStr   = document.querySelector('#rm-config')?.value || '{}'

      if (!nombre || !tipo) { alert('Completá nombre y tipo.'); return false }

      let config
      try { config = JSON.parse(configStr) } catch { alert('JSON de configuración inválido.'); return false }

      try {
        if (isEdit) {
          await updateSeguimientoRule(rule.id, { nombre, descripcion, prioridad, activo, config })
        } else {
          await createSeguimientoRule({ nombre, tipo, descripcion, prioridad, activo, config })
        }
        await _load()
        return true
      } catch (err) { alert(`Error: ${err.message}`); return false }
    },
  })
}

/**
 * CurriculumProposalPanel.js
 *
 * Shows AI-proposed curriculum (pilares + objetivos) for teacher review and editing
 * before adopting as a real curriculum record.
 *
 * Usage:
 *   const panel = createCurriculumProposalPanel(container, { onAdopt, onCancel })
 *   panel.open({ pilares, resumen, instrumento, nivel })
 *   panel.close()
 */

const TIPO_COLORS = {
  tecnica:        { color: '#0d6efd', bg: '#0d6efd15' },
  repertorio:     { color: '#198754', bg: '#19875415' },
  teoria:         { color: '#fd7e14', bg: '#fd7e1415' },
  interpretacion: { color: '#6f42c1', bg: '#6f42c115' },
  otro:           { color: '#6c757d', bg: '#6c757d15' },
}

const PRIORIDAD_LABELS = {
  alta:          { label: 'Foco',       color: '#dc3545' },
  media:         { label: 'Secundario', color: '#fd7e14' },
  consolidacion: { label: 'Consolidar', color: '#198754' },
}

/** Escapes HTML special chars to prevent XSS in innerHTML. */
function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * @param {HTMLElement} container
 * @param {object} opts
 * @param {function} opts.onAdopt  - called with { instrumento, nivel, resumen, pilares }
 * @param {function} [opts.onCancel]
 */
export function createCurriculumProposalPanel(container, { onAdopt, onCancel }) {
  let _pilares = []
  let _resumen = ''
  let _panelEl = null

  function _renderObjetivo(obj, pilarIdx, objIdx) {
    const prioInfo = PRIORIDAD_LABELS[obj.prioridad] ?? PRIORIDAD_LABELS.media
    return `
      <div class="cpp-objetivo-row" data-pilar="${pilarIdx}" data-obj="${objIdx}">
        <span
          class="cpp-objetivo-text"
          data-pilar="${pilarIdx}"
          data-obj="${objIdx}"
          title="Click para editar"
        >${esc(obj.descripcion)}</span>
        <span class="cpp-prioridad-badge" style="color:${prioInfo.color}">${prioInfo.label}</span>
        <button class="cpp-remove-obj" data-pilar="${pilarIdx}" data-obj="${objIdx}" title="Quitar objetivo">✕</button>
      </div>
    `
  }

  function _renderPilar(pilar, pilarIdx) {
    const tipoInfo = TIPO_COLORS[pilar.tipo] ?? TIPO_COLORS.otro
    const objetivosHtml = (pilar.objetivos || [])
      .map((obj, objIdx) => _renderObjetivo(obj, pilarIdx, objIdx))
      .join('')

    return `
      <div class="cpp-pilar" data-pilar="${pilarIdx}" style="border-left:3px solid ${tipoInfo.color};background:${tipoInfo.bg}">
        <div class="cpp-pilar-header">
          <span
            class="cpp-pilar-title"
            data-pilar="${pilarIdx}"
            title="Click para editar nombre"
          >${esc(pilar.nombre)}</span>
          <button class="cpp-remove-pilar" data-pilar="${pilarIdx}" title="Quitar pilar">✕</button>
        </div>
        <div class="cpp-objetivos">
          ${objetivosHtml || '<div class="cpp-no-obj">Sin objetivos</div>'}
        </div>
      </div>
    `
  }

  function _getInstrumento() {
    return _panelEl?.querySelector('#cpp-instrumento')?.value?.trim() || ''
  }

  function _getNivel() {
    return _panelEl?.querySelector('#cpp-nivel')?.value?.trim() || ''
  }

  function _canAdopt() {
    if (!_getInstrumento()) return false
    if (_pilares.length === 0) return false
    return _pilares.every(p => (p.objetivos || []).length > 0)
  }

  function _render(instrumento, nivel) {
    if (!_panelEl) return

    const hasPilares = _pilares.length > 0

    _panelEl.innerHTML = `
      <div class="cpp-header">
        <span class="cpp-icon">✨</span>
        <div class="cpp-header-text">
          <strong>Propuesta curricular generada por IA</strong>
          ${_resumen ? `<div class="cpp-resumen">${esc(_resumen)}</div>` : ''}
        </div>
      </div>
      <div class="cpp-pilares">
        ${hasPilares
          ? _pilares.map((p, i) => _renderPilar(p, i)).join('')
          : '<div class="cpp-empty">La IA no detectó suficientes datos para generar una propuesta.</div>'
        }
      </div>
      <div class="cpp-footer">
        <div class="cpp-fields">
          <label class="cpp-field-label">Instrumento
            <input type="text" id="cpp-instrumento" class="cpp-input" value="${esc(instrumento)}" placeholder="ej. Violín" />
          </label>
          <label class="cpp-field-label">Nivel
            <input type="text" id="cpp-nivel" class="cpp-input" value="${esc(nivel)}" placeholder="ej. Básico" />
          </label>
        </div>
        <div class="cpp-actions">
          <button class="pm-btn pm-btn-outline" id="cpp-cancel">Cancelar</button>
          <button class="pm-btn pm-btn-primary" id="cpp-adopt" ${!_canAdopt() ? 'disabled' : ''}>
            ✓ Adoptar plan (${_pilares.length} pilares)
          </button>
        </div>
      </div>
    `

    // Wire pilar title click → inline edit
    _panelEl.querySelectorAll('.cpp-pilar-title').forEach(span => {
      span.onclick = () => {
        const pi = parseInt(span.dataset.pilar)
        const input = document.createElement('input')
        input.type = 'text'
        input.className = 'cpp-input cpp-inline-input'
        input.value = _pilares[pi].nombre
        span.replaceWith(input)
        input.focus()
        const save = () => {
          _pilares[pi].nombre = input.value.trim() || _pilares[pi].nombre
          _render(_getInstrumento(), _getNivel())
        }
        input.onblur = save
        input.onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); save() } }
      }
    })

    // Wire objetivo text click → inline edit
    _panelEl.querySelectorAll('.cpp-objetivo-text').forEach(span => {
      span.onclick = () => {
        const pi = parseInt(span.dataset.pilar)
        const oi = parseInt(span.dataset.obj)
        const input = document.createElement('input')
        input.type = 'text'
        input.className = 'cpp-input cpp-inline-input'
        input.value = _pilares[pi].objetivos[oi].descripcion
        span.replaceWith(input)
        input.focus()
        const save = () => {
          _pilares[pi].objetivos[oi].descripcion = input.value.trim() || _pilares[pi].objetivos[oi].descripcion
          _render(_getInstrumento(), _getNivel())
        }
        input.onblur = save
        input.onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); save() } }
      }
    })

    // Wire remove objetivo buttons
    _panelEl.querySelectorAll('.cpp-remove-obj').forEach(btn => {
      btn.onclick = () => {
        const pi = parseInt(btn.dataset.pilar)
        const oi = parseInt(btn.dataset.obj)
        _pilares[pi].objetivos.splice(oi, 1)
        _render(_getInstrumento(), _getNivel())
      }
    })

    // Wire remove pilar buttons
    _panelEl.querySelectorAll('.cpp-remove-pilar').forEach(btn => {
      btn.onclick = () => {
        const pi = parseInt(btn.dataset.pilar)
        _pilares.splice(pi, 1)
        _render(_getInstrumento(), _getNivel())
      }
    })

    // Re-validate adopt button on field input
    const instrInput = _panelEl.querySelector('#cpp-instrumento')
    const adoptBtn = _panelEl.querySelector('#cpp-adopt')
    if (instrInput && adoptBtn) {
      instrInput.oninput = () => {
        adoptBtn.disabled = !_canAdopt()
      }
    }

    // Wire adopt button
    if (adoptBtn) {
      adoptBtn.onclick = () => {
        const finalInstrumento = _getInstrumento()
        const finalNivel = _getNivel()
        if (!finalInstrumento) {
          instrInput?.focus()
          return
        }
        onAdopt({
          instrumento: finalInstrumento,
          nivel: finalNivel,
          resumen: _resumen,
          pilares: _pilares,
        })
        close()
      }
    }

    // Wire cancel button
    const cancelBtn = _panelEl.querySelector('#cpp-cancel')
    if (cancelBtn) {
      cancelBtn.onclick = () => {
        if (onCancel) onCancel()
        close()
      }
    }
  }

  function open({ pilares = [], resumen = '', instrumento = '', nivel = '' }) {
    // Deep-copy pilares so edits don't mutate the original
    _pilares = pilares.map(p => ({
      ...p,
      objetivos: (p.objetivos || []).map(o => ({ ...o })),
    }))
    _resumen = resumen

    if (!_panelEl) {
      _panelEl = document.createElement('div')
      _panelEl.className = 'cpp-panel'
      container.appendChild(_panelEl)
    }

    _panelEl.style.display = 'block'
    _render(instrumento, nivel)

    setTimeout(() => _panelEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50)
  }

  function close() {
    if (_panelEl) {
      _panelEl.style.display = 'none'
      _panelEl.innerHTML = ''
    }
  }

  return { open, close }
}

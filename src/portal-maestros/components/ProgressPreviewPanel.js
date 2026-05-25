/**
 * ProgressPreviewPanel.js
 *
 * Shows AI-extracted progress records for teacher confirmation before saving.
 * Teachers can remove individual records or change their state.
 *
 * Usage:
 *   const panel = createProgressPreviewPanel(container, { onConfirm, onCancel })
 *   panel.open({ progreso: [...], resumen: '...' })
 *   panel.close()
 */

const ESTADO_LABELS = {
  LOGRADO:     { label: 'Logrado',      color: 'var(--pm-success, #198754)',  bg: '#19875418' },
  EN_PROGRESO: { label: 'En Progreso',  color: 'var(--pm-primary, #0d6efd)',  bg: '#0d6efd18' },
  INICIADO:    { label: 'Iniciado',     color: 'var(--pm-muted,   #6c757d)',  bg: '#6c757d18' },
}

const ESTADOS_CYCLE = ['LOGRADO', 'EN_PROGRESO', 'INICIADO']

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
 * @param {HTMLElement} container — element to append the panel into
 * @param {object} opts
 * @param {function} opts.onConfirm — called with final records array
 * @param {function} [opts.onCancel]
 */
export function createProgressPreviewPanel(container, { onConfirm, onCancel }) {
  let _records = []
  let _panelEl = null

  function _renderRecord(rec, idx) {
    const alumnosStr = esc((rec.alumnos || []).join(', '))
    const estadoInfo = ESTADO_LABELS[rec.estado] ?? ESTADO_LABELS.EN_PROGRESO
    const notaStr = rec.nota ? `· ${esc(rec.nota)}/5` : ''
    const tareaStr = rec.tarea ? `<div class="ppp-tarea">📝 ${esc(rec.tarea)}</div>` : ''

    return `
      <div class="ppp-card" data-idx="${idx}">
        <div class="ppp-card-header">
          <span class="ppp-alumnos">${alumnosStr}</span>
          <button class="ppp-remove" data-idx="${idx}" title="Quitar este registro">✕</button>
        </div>
        <div class="ppp-card-body">
          <span class="ppp-contenido">${esc(rec.contenido) || '—'}</span>
          <span class="ppp-sep">·</span>
          <button
            class="ppp-estado-btn"
            data-idx="${idx}"
            style="color:${estadoInfo.color};background:${estadoInfo.bg};border-color:${estadoInfo.color}"
            title="Click para cambiar estado"
          >${estadoInfo.label}${notaStr}</button>
        </div>
        ${rec.observacion ? `<div class="ppp-obs">${esc(rec.observacion)}</div>` : ''}
        ${tareaStr}
      </div>
    `
  }

  function _render(resumen) {
    if (!_panelEl) return
    const hasRecords = _records.length > 0

    _panelEl.innerHTML = `
      <div class="ppp-header">
        <span class="ppp-icon">🎯</span>
        <div class="ppp-header-text">
          <strong>La IA detectó estos avances</strong>
          ${resumen ? `<div class="ppp-resumen">${esc(resumen)}</div>` : ''}
        </div>
      </div>
      <div class="ppp-cards">
        ${hasRecords
          ? _records.map((r, i) => _renderRecord(r, i)).join('')
          : '<div class="ppp-empty">No se detectaron registros de progreso en este texto.</div>'
        }
      </div>
      <div class="ppp-footer">
        <button class="pm-btn pm-btn-outline ppp-btn-cancel" id="ppp-cancel">Cancelar</button>
        <button class="pm-btn pm-btn-primary ppp-btn-confirm" id="ppp-confirm" ${!hasRecords ? 'disabled' : ''}>
          ✓ Confirmar y guardar (${_records.length})
        </button>
      </div>
    `

    // Wire remove buttons
    _panelEl.querySelectorAll('.ppp-remove').forEach(btn => {
      btn.onclick = () => {
        const idx = parseInt(btn.dataset.idx)
        _records.splice(idx, 1)
        _render(resumen)
      }
    })

    // Wire estado cycle buttons
    _panelEl.querySelectorAll('.ppp-estado-btn').forEach(btn => {
      btn.onclick = () => {
        const idx = parseInt(btn.dataset.idx)
        const current = _records[idx].estado
        const nextIdx = (ESTADOS_CYCLE.indexOf(current) + 1) % ESTADOS_CYCLE.length
        _records[idx].estado = ESTADOS_CYCLE[nextIdx]
        _render(resumen)
      }
    })

    // Wire confirm
    _panelEl.querySelector('#ppp-confirm').onclick = () => {
      onConfirm([..._records])
      close()
    }

    // Wire cancel
    _panelEl.querySelector('#ppp-cancel').onclick = () => {
      if (onCancel) onCancel()
      close()
    }
  }

  function open({ progreso = [], resumen = '' }) {
    _records = progreso.map(r => ({ ...r }))  // shallow copy so edits don't mutate original

    if (!_panelEl) {
      _panelEl = document.createElement('div')
      _panelEl.className = 'pm-progress-preview'
      container.appendChild(_panelEl)
    }

    _panelEl.style.display = 'block'
    _render(resumen)

    // Scroll panel into view — use 'start' so it always becomes visible even if below viewport
    setTimeout(() => _panelEl.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80)
  }

  function close() {
    if (_panelEl) {
      _panelEl.style.display = 'none'
      _panelEl.innerHTML = ''
    }
  }

  return { open, close }
}

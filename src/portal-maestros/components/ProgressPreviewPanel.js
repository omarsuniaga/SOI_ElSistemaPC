/**
 * ProgressPreviewPanel.js
 *
 * Shows AI-extracted progress records for teacher confirmation before saving.
 * Teachers can remove individual records or change their state.
 * Records with alerta:true are rendered with a red warning style.
 */

const ESTADO_LABELS = {
  LOGRADO:     { label: 'Logrado',     color: 'var(--pm-success, #198754)', bg: '#19875418' },
  EN_PROGRESO: { label: 'En Progreso', color: 'var(--pm-primary, #0d6efd)', bg: '#0d6efd18' },
  INICIADO:    { label: 'Iniciado',    color: 'var(--pm-muted,   #6c757d)', bg: '#6c757d18' },
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
 * @param {HTMLElement} container
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
    const notaStr    = rec.nota ? ` · ${esc(rec.nota)}/5` : ''
    const tareaStr   = rec.tarea ? `<div class="ppp-tarea">📝 ${esc(rec.tarea)}</div>` : ''
    const isAlerta   = !!rec.alerta

    if (isAlerta) {
      // ── Alert card — behavioral/disciplinary issue ──────────────────────────
      return `
        <div class="ppp-card ppp-card--alerta" data-idx="${idx}">
          <div class="ppp-card-header">
            <span class="ppp-alerta-badge">⚠️ Atención requerida</span>
            <button class="ppp-remove" data-idx="${idx}" title="Quitar este registro">✕</button>
          </div>
          <div class="ppp-alerta-alumno">${alumnosStr}</div>
          <div class="ppp-card-body">
            <span class="ppp-contenido ppp-contenido--alerta">${esc(rec.contenido) || 'Comportamiento'}</span>
          </div>
          ${rec.observacion ? `<div class="ppp-obs ppp-obs--alerta">${esc(rec.observacion)}</div>` : ''}
          ${tareaStr}
        </div>
      `
    }

    // ── Normal progress card ─────────────────────────────────────────────────
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
    const hasRecords  = _records.length > 0
    const alertCount  = _records.filter(r => r.alerta).length
    const alertBanner = alertCount > 0
      ? `<div class="ppp-alert-banner">⚠️ ${alertCount} registro${alertCount > 1 ? 's' : ''} de conducta detectado${alertCount > 1 ? 's' : ''} — revisá antes de guardar</div>`
      : ''

    _panelEl.innerHTML = `
      <div class="ppp-header">
        <span class="ppp-icon">🎯</span>
        <div class="ppp-header-text">
          <strong>La IA detectó estos avances</strong>
          ${resumen ? `<div class="ppp-resumen">${esc(resumen)}</div>` : ''}
        </div>
      </div>
      ${alertBanner}
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

    _injectStyles()

    // Wire remove buttons
    _panelEl.querySelectorAll('.ppp-remove').forEach(btn => {
      btn.onclick = () => {
        _records.splice(parseInt(btn.dataset.idx), 1)
        _render(resumen)
      }
    })

    // Wire estado cycle buttons (only on normal cards)
    _panelEl.querySelectorAll('.ppp-estado-btn').forEach(btn => {
      btn.onclick = () => {
        const idx     = parseInt(btn.dataset.idx)
        const current = _records[idx].estado
        const nextIdx = (ESTADOS_CYCLE.indexOf(current) + 1) % ESTADOS_CYCLE.length
        _records[idx].estado = ESTADOS_CYCLE[nextIdx]
        _render(resumen)
      }
    })

    _panelEl.querySelector('#ppp-confirm').onclick = () => { onConfirm([..._records]); close() }
    _panelEl.querySelector('#ppp-cancel').onclick  = () => { if (onCancel) onCancel(); close() }
  }

  function open({ progreso = [], resumen = '' }) {
    _records = progreso.map(r => ({ ...r }))

    if (!_panelEl) {
      _panelEl = document.createElement('div')
      _panelEl.className = 'pm-progress-preview'
      container.appendChild(_panelEl)
    }

    _panelEl.style.display = 'block'
    _render(resumen)

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

function _injectStyles() {
  if (document.getElementById('ppp-alert-styles')) return
  const style = document.createElement('style')
  style.id = 'ppp-alert-styles'
  style.textContent = `
    /* ── Alert banner ────────────────────────────────────────── */
    .ppp-alert-banner {
      margin: 0 0 0.5rem 0;
      padding: 0.5rem 0.75rem;
      background: #fff3cd;
      border: 1px solid #ffc107;
      border-radius: 6px;
      color: #856404;
      font-size: 0.82rem;
      font-weight: 600;
    }

    /* ── Alert card ──────────────────────────────────────────── */
    .ppp-card--alerta {
      border: 1.5px solid #dc3545 !important;
      background: #fff5f5 !important;
    }
    .dark .ppp-card--alerta,
    [data-theme="dark"] .ppp-card--alerta {
      background: #2a1215 !important;
      border-color: #f87171 !important;
    }

    .ppp-alerta-badge {
      font-size: 0.75rem;
      font-weight: 700;
      color: #dc3545;
      letter-spacing: 0.02em;
      text-transform: uppercase;
    }

    .ppp-alerta-alumno {
      font-size: 0.82rem;
      font-weight: 600;
      color: #dc3545;
      margin: 0.15rem 0 0.25rem 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .ppp-contenido--alerta {
      color: #dc3545 !important;
      font-weight: 700;
    }

    .ppp-obs--alerta {
      color: #b91c1c;
      font-style: italic;
      font-size: 0.8rem;
      margin-top: 0.2rem;
    }
  `
  document.head.appendChild(style)
}

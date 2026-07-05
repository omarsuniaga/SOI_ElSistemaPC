/**
 * ProgressPreviewPanel.js
 *
 * Shows AI-extracted progress records for teacher confirmation before saving.
 * Teachers can remove individual records or change their state.
 * Records with alerta:true are rendered with a red warning style.
 */

import { detectContradictions } from '../utils/observationParser.js'

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

const ALERT_TYPE_LABELS = {
  CONDUCTA:          { label: 'conducta',           icon: '🚨' },
  ATENCION:          { label: 'atención',            icon: '🔔' },
  RIESGO_PEDAGOGICO: { label: 'riesgo pedagógico',  icon: '📉' },
}

/**
 * Builds a human-readable summary line for the alert banner.
 * Groups alerts by type and lists them: "1 riesgo pedagógico · 1 atención".
 */
function _buildAlertBannerText(alertRecords) {
  const counts = {}
  for (const r of alertRecords) {
    const key = r.alertaTipo ?? r.alertDetails?.type ?? 'CONDUCTA'
    counts[key] = (counts[key] ?? 0) + 1
  }

  const parts = Object.entries(counts).map(([tipo, n]) => {
    const info = ALERT_TYPE_LABELS[tipo] ?? { label: tipo.toLowerCase(), icon: '⚠️' }
    return `${info.icon} ${n} ${info.label}${n > 1 ? 's' : ''}`
  })

  return `${parts.join(' · ')} — revisá antes de guardar`
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

  /** Returns the scope chip HTML based on the record's scope field. */
  function _scopeChip(rec) {
    const scope   = rec.scope || (rec.es_colectivo ? 'grupo' : 'individual')
    const alumnos = rec.alumnos || []

    if (rec.requires_confirmation) {
      return `<span class="ppp-scope-chip ppp-scope--unknown">❓ Subgrupo sin identificar</span>`
    }
    switch (scope) {
      case 'grupo':
      case 'all':
        return `<span class="ppp-scope-chip ppp-scope--all">👥 Todos los presentes</span>`
      case 'grupo_excluyendo':
      case 'group_excluding':
        return `<span class="ppp-scope-chip ppp-scope--excluding">👥 Resto del grupo</span>`
      case 'subgrupo_indeterminado':
      case 'subgroup_unknown':
        return `<span class="ppp-scope-chip ppp-scope--unknown">❓ Subgrupo sin identificar</span>`
      case 'individual':
      default:
        if (!alumnos.length) return ''
        return alumnos.length === 1
          ? `<span class="ppp-scope-chip ppp-scope--individual">👤 ${esc(alumnos[0])}</span>`
          : `<span class="ppp-scope-chip ppp-scope--individual">👤 ${esc(alumnos.join(', '))}</span>`
    }
  }

  function _renderRecord(rec, idx) {
    const estadoInfo = ESTADO_LABELS[rec.estado] ?? ESTADO_LABELS.EN_PROGRESO
    const notaStr    = rec.nota ? ` · ${esc(rec.nota)}/5` : ''
    const tareaStr   = rec.tarea ? `<div class="ppp-tarea">📝 ${esc(rec.tarea)}</div>` : ''
    const isAlerta   = !!rec.alerta
    const scopeChip  = _scopeChip(rec)

    if (isAlerta) {
      // ── Alert card ──────────────────────────────────────────────────────────
      const alertLabel = ALERT_TYPE_LABELS[rec.alertaTipo] ?? { label: 'Alerta pedagógica', icon: '⚠️' }
      return `
        <div class="ppp-card ppp-card--alerta" data-idx="${idx}">
          <div class="ppp-card-header">
            <span class="ppp-alerta-badge">${alertLabel.icon} ${esc(alertLabel.label === 'conducta' ? 'Conducta' : alertLabel.label === 'atención' ? 'Atención pedagógica' : 'Riesgo pedagógico')}</span>
            <button class="ppp-remove" data-idx="${idx}" title="Quitar este registro">✕</button>
          </div>
          ${scopeChip ? `<div class="ppp-scope-row">${scopeChip}</div>` : ''}
          <div class="ppp-card-body">
            <span class="ppp-contenido ppp-contenido--alerta">${esc(rec.contenido) || '—'}</span>
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
          ${scopeChip || `<span class="ppp-alumnos">${esc((rec.alumnos || []).join(', '))}</span>`}
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
    const alertRecords = _records.filter(r => r.alerta)
    const alertCount   = alertRecords.length
    const alertBanner  = alertCount > 0
      ? `<div class="ppp-alert-banner">⚠️ ${_buildAlertBannerText(alertRecords)}</div>`
      : ''

    const contradictions = detectContradictions(_records)
    const contradictionBanner = contradictions.length > 0 ? `
      <div class="ppp-clarification-banner">
        <div class="ppp-clarification-title">✏️ El texto puede ser más específico</div>
        <div class="ppp-clarification-body">
          ${contradictions.map(c => `<div class="ppp-clarification-item">• ${esc(c.reason)}</div>`).join('')}
        </div>
        <div class="ppp-clarification-hint">Podés guardar igual o editar el texto arriba para separar mejor las ideas.</div>
      </div>
    ` : ''

    _panelEl.innerHTML = `
      <div class="ppp-header">
        <span class="ppp-icon">🎯</span>
        <div class="ppp-header-text">
          <strong>La IA detectó estos avances</strong>
          ${resumen ? `<div class="ppp-resumen">${esc(resumen)}</div>` : ''}
        </div>
      </div>
      ${alertBanner}
      ${contradictionBanner}
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

    /* ── Clarification banner ────────────────────────────────── */
    .ppp-clarification-banner {
      margin: 0 0 0.5rem 0;
      padding: 0.6rem 0.75rem;
      background: #f0f4ff;
      border: 1px solid #93c5fd;
      border-radius: 6px;
      font-size: 0.82rem;
    }
    .dark .ppp-clarification-banner,
    [data-theme="dark"] .ppp-clarification-banner {
      background: #1e2a3a;
      border-color: #3b82f6;
    }
    .ppp-clarification-title {
      font-weight: 700;
      color: #1d4ed8;
      margin-bottom: 0.25rem;
    }
    .ppp-clarification-item {
      color: #1e40af;
      margin: 0.1rem 0;
    }
    .dark .ppp-clarification-item,
    [data-theme="dark"] .ppp-clarification-item {
      color: #93c5fd;
    }
    .ppp-clarification-hint {
      color: #6b7280;
      margin-top: 0.35rem;
      font-style: italic;
    }

    /* ── Scope chips ─────────────────────────────────────────── */
    .ppp-scope-row {
      margin: 0.1rem 0 0.2rem 0;
    }
    .ppp-scope-chip {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.1rem 0.5rem;
      border-radius: 99px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100%;
    }
    .ppp-scope--all {
      background: #e0f2fe;
      color: #0369a1;
    }
    .dark .ppp-scope--all,
    [data-theme="dark"] .ppp-scope--all {
      background: #0c3554;
      color: #7dd3fc;
    }
    .ppp-scope--individual {
      background: #f0fdf4;
      color: #15803d;
    }
    .dark .ppp-scope--individual,
    [data-theme="dark"] .ppp-scope--individual {
      background: #052e16;
      color: #86efac;
    }
    .ppp-scope--excluding {
      background: #fef9c3;
      color: #854d0e;
    }
    .dark .ppp-scope--excluding,
    [data-theme="dark"] .ppp-scope--excluding {
      background: #3a2900;
      color: #fde047;
    }
    .ppp-scope--unknown {
      background: #faf5ff;
      color: #7c3aed;
      border: 1px dashed #c4b5fd;
    }
    .dark .ppp-scope--unknown,
    [data-theme="dark"] .ppp-scope--unknown {
      background: #1e1030;
      color: #c4b5fd;
    }
  `
  document.head.appendChild(style)
}

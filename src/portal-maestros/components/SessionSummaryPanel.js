/**
 * SessionSummaryPanel.js (v2 — grouped)
 *
 * Shows progress records for a saved session grouped by contenido_dsl.
 * Reads from `progresos` table, fetches alumno names from `alumnos`.
 *
 * Usage:
 *   const panel = createSessionSummaryPanel()
 *   panel.open({ sesionId, claseNombre, fecha, supabase })
 *   panel.close()
 *
 * Changes in v2:
 *   - Records grouped by normalized contenido_dsl (trim + lowercase)
 *   - Group shows combined alumnos, single observaciones/tarea
 *   - Estado 'mixto' when group has differing estados
 *   - Same public API as v1: open({ sesionId, claseNombre, fecha, supabase })
 */

// ── Estado badge display config ─────────────────────────────────────────────

const ESTADO_BADGES = {
  LOGRADO: { label: 'LOGRADO', cls: 'ssp-estado-logrado' },
  EN_PROGRESO: { label: 'EN_PROGRESO', cls: 'ssp-estado-en-progreso' },
  INICIADO: { label: 'INICIADO', cls: 'ssp-estado-iniciado' },
  MIXTO: { label: 'MIXTO', cls: 'ssp-estado-mixto' },
}

const ESTADO_CHIPS = {
  LOGRADO: 'ssp-chip-logrado',
  EN_PROGRESO: 'ssp-chip-en-progreso',
  INICIADO: 'ssp-chip-iniciado',
}

// For WhatsApp text display
const ESTADO_LABELS = {
  LOGRADO: 'LOGRADO',
  EN_PROGRESO: 'EN_PROGRESO',
  INICIADO: 'INICIADO',
  MIXTO: 'MIXTO',
}

// ── Helpers ─────────────────────────────────────────────────────────────────

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
 * Normalizes contenido_dsl for grouping: trim + lowercase.
 */
function normalizeKey(str) {
  return (str || '').trim().toLowerCase()
}

/**
 * Groups progress records by normalized contenido_dsl.
 *
 * @param {Array} records  — raw records from DB with alumno_nombre resolved
 * @returns {Array<{contenido, estado, alumnos, observaciones, tarea}>}
 */
function groupRecords(records) {
  const map = new Map()

  for (const rec of records) {
    const key = normalizeKey(rec.contenido_dsl)
    if (!key) continue // skip empty content

    if (!map.has(key)) {
      map.set(key, {
        contenido: rec.contenido_dsl,
        estado: rec.estado_cualitativo,
        alumnos: [
          {
            id: rec.alumno_id,
            nombre: rec.alumno_nombre || 'Alumno',
            estado: rec.estado_cualitativo,
          },
        ],
        observaciones: rec.observaciones || null,
        tarea: rec.tarea || null,
      })
    } else {
      const group = map.get(key)

      // Add alumno with individual estado
      group.alumnos.push({
        id: rec.alumno_id,
        nombre: rec.alumno_nombre || 'Alumno',
        estado: rec.estado_cualitativo,
      })

      // Detect mixto estado
      if (group.estado !== 'MIXTO' && group.estado !== rec.estado_cualitativo) {
        group.estado = 'MIXTO'
      }

      // Take first non-empty observaciones / tarea
      if (!group.observaciones && rec.observaciones) {
        group.observaciones = rec.observaciones
      }
      if (!group.tarea && rec.tarea) {
        group.tarea = rec.tarea
      }
    }
  }

  return Array.from(map.values())
}

// ── Factory ─────────────────────────────────────────────────────────────────

export function createSessionSummaryPanel() {
  let _panelEl = null
  let _groups = []
  let _supabase = null

  // ── WhatsApp text builder ───────────────────────────────────────────────

  function _buildWhatsAppText(claseNombre, fecha) {
    const fechaFmt = (() => {
      try {
        const [y, m, d] = fecha.split('-')
        return `${d}/${m}/${y}`
      } catch {
        return fecha
      }
    })()

    const lines = [`📚 Clase ${claseNombre} — ${fechaFmt}`]

    for (const group of _groups) {
      const estadoLabel = ESTADO_LABELS[group.estado] || group.estado
      const alumnoList =
        group.estado === 'MIXTO'
          ? group.alumnos
              .map((a) => {
                const indLabel = ESTADO_LABELS[a.estado] || a.estado
                return `${a.nombre} (${indLabel})`
              })
              .join(', ')
          : group.alumnos.map((a) => a.nombre).join(', ')

      lines.push('')
      lines.push(`🔹 ${group.contenido} — ${estadoLabel}`)
      lines.push(`   Alumnos: ${alumnoList}`)

      if (group.tarea) {
        lines.push(`   📝 Tarea: ${group.tarea}`)
      }
    }

    lines.push('', '🎯 El Sistema PC')
    return lines.join('\n')
  }

  // ── Render helpers ──────────────────────────────────────────────────────

  function _renderGroup(group, idx) {
    const badgeInfo = ESTADO_BADGES[group.estado] || ESTADO_BADGES.EN_PROGRESO
    const alumnosCount = group.alumnos.length
    const isMixed = group.estado === 'MIXTO'

    const alumnosHtml = group.alumnos
      .map((a) => {
        const chipCls = isMixed
          ? `ssp-alumno-chip ${ESTADO_CHIPS[a.estado] || ''}`
          : 'ssp-alumno-chip'
        return `<span class="${chipCls}">${esc(a.nombre)}</span>`
      })
      .join('')

    const obsHtml = group.observaciones
      ? `<div class="ssp-group-obs">${esc(group.observaciones)}</div>`
      : ''

    const tareaHtml = group.tarea
      ? `<div class="ssp-group-tarea">📝 Tarea: ${esc(group.tarea)}</div>`
      : ''

    return `
      <div class="ssp-group">
        <div class="ssp-group-header">
          <span class="ssp-group-contenido">${esc(group.contenido)}</span>
          <span class="ssp-group-count">${alumnosCount} alumno${alumnosCount !== 1 ? 's' : ''}</span>
          <span class="ssp-estado-badge ${badgeInfo.cls}">${badgeInfo.label}</span>
        </div>
        <div class="ssp-group-alumnos">${alumnosHtml}</div>
        ${obsHtml}
        ${tareaHtml}
      </div>
    `
  }

  function _render(claseNombre, fecha) {
    if (!_panelEl) return

    const hasGroups = _groups.length > 0

    _panelEl.innerHTML = `
      <div class="ssp-backdrop"></div>
      <div class="ssp-dialog" role="dialog" aria-modal="true" aria-label="Resumen pedagógico">
        <div class="ssp-header">
          <span class="ssp-icon">📊</span>
          <div>
            <strong>Resumen Pedagógico</strong>
            <div class="ssp-subtitle">${esc(claseNombre)} · ${esc(fecha)}</div>
          </div>
        </div>

        ${
          !hasGroups
            ? `
          <div class="ssp-empty">
            No hay registros de progreso para esta sesión.<br>
            Usá el botón 🎯 <strong>Analizar</strong> en el editor para generarlos.
          </div>
        `
            : `
          <div class="ssp-section-title">✅ Grupos de progreso (${_groups.length})</div>
          <div class="ssp-body">
            ${_groups.map((g) => _renderGroup(g)).join('')}
          </div>
        `
        }

        <div class="ssp-footer">
          <button class="pm-btn pm-btn-success ssp-btn-wa" id="ssp-whatsapp">
            <i class="bi bi-whatsapp"></i> Compartir WhatsApp
          </button>
          <button class="pm-btn pm-btn-outline ssp-btn-close" id="ssp-close">✕ Cerrar</button>
        </div>
      </div>
    `

    _injectStyles()

    // Wire WhatsApp
    _panelEl.querySelector('#ssp-whatsapp').onclick = () => {
      const text = _buildWhatsAppText(claseNombre, fecha)
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
    }

    // Wire close
    _panelEl.querySelector('#ssp-close').onclick = close
    _panelEl.querySelector('.ssp-backdrop').onclick = close
  }

  // ── Public API ──────────────────────────────────────────────────────────

  async function open({ sesionId, claseNombre, fecha, supabase }) {
    _supabase = supabase

    // Mount panel element
    if (!_panelEl) {
      _panelEl = document.createElement('div')
      _panelEl.className = 'ssp-wrapper'
      document.body.appendChild(_panelEl)
    }
    _panelEl.style.display = 'flex'

    // Show loading state
    _panelEl.innerHTML = `
      <div class="ssp-backdrop"></div>
      <div class="ssp-dialog">
        <div class="ssp-header">
          <span class="ssp-icon">📊</span>
          <div><strong>Resumen Pedagógico</strong><div class="ssp-subtitle">${esc(claseNombre)}</div></div>
        </div>
        <div class="ssp-loading">Cargando registros...</div>
      </div>
    `
    _injectStyles()
    _panelEl.querySelector('.ssp-backdrop').onclick = close

    // Fetch progresos
    const { data, error } = await supabase
      .from('progresos')
      .select('id, alumno_id, contenido_dsl, estado_cualitativo, observaciones, indicadores')
      .eq('sesion_clase_id', sesionId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('[SessionSummaryPanel] Error cargando progresos:', error)
      _groups = []
      _render(claseNombre, fecha)
      return
    }

    // Normalize records — extract tarea from indicadores jsonb
    const raw = data || []
    const records = raw.map((r) => ({
      id: r.id,
      alumno_id: r.alumno_id,
      contenido_dsl: r.contenido_dsl,
      estado_cualitativo: r.estado_cualitativo || 'EN_PROGRESO',
      observaciones: r.observaciones,
      tarea: r.indicadores?.tarea || null,
    }))

    // Fetch alumno names in batch
    const alumnoIds = [...new Set(records.map((r) => r.alumno_id).filter(Boolean))]
    if (alumnoIds.length > 0) {
      const { data: alumnos } = await supabase
        .from('alumnos')
        .select('id, nombre_completo')
        .in('id', alumnoIds)

      const nombreMap = new Map((alumnos || []).map((a) => [a.id, a.nombre_completo]))
      records.forEach((r) => {
        r.alumno_nombre = nombreMap.get(r.alumno_id) || 'Alumno'
      })
    }

    // Group records by normalized contenido_dsl
    _groups = groupRecords(records)
    _render(claseNombre, fecha)
  }

  function close() {
    if (_panelEl) {
      _panelEl.style.display = 'none'
      _panelEl.innerHTML = ''
    }
    _groups = []
    _supabase = null
  }

  return { open, close }
}

// ── Injected styles (grouped layout) ────────────────────────────────────────

function _injectStyles() {
  if (document.getElementById('ssp-styles')) return

  const style = document.createElement('style')
  style.id = 'ssp-styles'
  style.textContent = `
    /* ── Wrapper & backdrop ────────────────────────── */
    .ssp-wrapper {
      position: fixed;
      inset: 0;
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }
    .ssp-backdrop {
      position: absolute;
      inset: 0;
      background: rgba(0,0,0,0.55);
      backdrop-filter: blur(2px);
    }

    /* ── Dialog ────────────────────────────────────── */
    .ssp-dialog {
      position: relative;
      z-index: 1;
      background: var(--pm-surface, #fff);
      border-radius: var(--pm-radius, 12px);
      box-shadow: 0 8px 40px rgba(0,0,0,0.22);
      width: 100%;
      max-width: 480px;
      max-height: 85vh;
      overflow-y: auto;
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    /* ── Header ────────────────────────────────────── */
    .ssp-header {
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }
    .ssp-icon { font-size: 1.5rem; }
    .ssp-subtitle {
      font-size: 0.78rem;
      color: var(--pm-text-muted, #6c757d);
      margin-top: 0.1rem;
    }

    /* ── Section title ─────────────────────────────── */
    .ssp-section-title {
      font-size: 0.78rem;
      font-weight: 700;
      color: var(--pm-text-muted, #6c757d);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-top: 0.25rem;
    }

    /* ── Body (group container) ────────────────────── */
    .ssp-body {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    /* ── Group card ────────────────────────────────── */
    .ssp-group {
      background: var(--pm-surface-2, #f8f9fa);
      border: 1px solid var(--pm-border, #dee2e6);
      border-radius: var(--pm-radius-sm, 8px);
      padding: 0.7rem 0.8rem;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    .ssp-group-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    .ssp-group-contenido {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--pm-text, #212529);
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .ssp-group-count {
      font-size: 0.72rem;
      color: var(--pm-text-muted, #6c757d);
      white-space: nowrap;
    }

    /* ── Estado badges ─────────────────────────────── */
    .ssp-estado-badge {
      font-size: 0.68rem;
      font-weight: 700;
      padding: 0.15rem 0.5rem;
      border-radius: 99px;
      color: #fff;
      white-space: nowrap;
      flex-shrink: 0;
    }
    .ssp-estado-logrado      { background: #198754; }
    .ssp-estado-en-progreso  { background: #0d6efd; }
    .ssp-estado-iniciado     { background: #6c757d; }
    .ssp-estado-mixto        { background: #fd7e14; }

    /* ── Alumno chips ──────────────────────────────── */
    .ssp-group-alumnos {
      display: flex;
      flex-wrap: wrap;
      gap: 0.3rem;
    }
    .ssp-alumno-chip {
      font-size: 0.75rem;
      padding: 0.15rem 0.5rem;
      border-radius: 99px;
      background: var(--pm-surface, #fff);
      border: 1.5px solid var(--pm-border, #dee2e6);
      color: var(--pm-text, #212529);
    }
    .ssp-chip-logrado      { border-color: #198754; background: #19875412; }
    .ssp-chip-en-progreso  { border-color: #0d6efd; background: #0d6efd12; }
    .ssp-chip-iniciado     { border-color: #6c757d; background: #6c757d12; }

    /* ── Group observaciones / tarea ───────────────── */
    .ssp-group-obs {
      font-size: 0.78rem;
      color: var(--pm-text-muted, #6c757d);
      font-style: italic;
      margin-top: 0.1rem;
    }
    .ssp-group-tarea {
      font-size: 0.78rem;
      color: var(--pm-text-muted, #6c757d);
    }

    /* ── Empty & loading ───────────────────────────── */
    .ssp-empty {
      text-align: center;
      color: var(--pm-text-muted, #6c757d);
      font-size: 0.85rem;
      padding: 1rem 0;
      line-height: 1.6;
    }
    .ssp-loading {
      text-align: center;
      color: var(--pm-text-muted, #6c757d);
      font-size: 0.85rem;
      padding: 1.5rem 0;
    }

    /* ── Footer ────────────────────────────────────── */
    .ssp-footer {
      display: flex;
      gap: 0.5rem;
      justify-content: flex-end;
      margin-top: 0.25rem;
      padding-top: 0.75rem;
      border-top: 1px solid var(--pm-border, #dee2e6);
    }

    .ssp-footer .pm-btn {
      width: auto;
      padding: 0.5rem 1rem;
      font-size: 0.85rem;
    }
    .pm-btn-success {
      background: var(--pm-success, #25D366);
      color: #fff;
    }
    .pm-btn-success:hover {
      opacity: 0.9;
    }
    .pm-btn-outline {
      background: transparent;
      border: 1.5px solid var(--pm-border, #dee2e6);
      color: var(--pm-text, #212529);
    }
    .pm-btn-outline:hover {
      background: var(--pm-surface-2, #f8f9fa);
    }
    .ssp-btn-wa { flex: 1; }
    .ssp-btn-close { flex-shrink: 0; }
  `
  document.head.appendChild(style)
}

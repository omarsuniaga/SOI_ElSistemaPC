/**
 * reportTemplates.js
 *
 * Shared HTML building blocks for institutional PDF reports.
 * All functions return HTML strings. Dynamic values MUST pass through esc().
 *
 * Usage:
 *   import { header, footer, metricChips, attendanceCell,
 *            progressBar, obsBlock, contentChips, esc, REPORT_CSS } from './reportTemplates.js'
 */

export const REPORT_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Inter, Arial, sans-serif; color: #1a1d29; background: #fff; }

  :root {
    --navy: #1e3a5f;
    --teal: #0e7490;
    --teal2: #ecfeff;
    --gold: #d4af37;
    --ok: #1f6e3e;    --ok2: #e7f5ec;
    --bad: #a31b1b;   --bad2: #fde8e8;
    --warn: #a35c00;  --warn2: #fef6e8;
    --info: #0e7490;  --info2: #ecfeff;
    --ink: #1a1d29;   --ink2: #3d4152; --ink3: #6b7085;
    --border: #d5d8e3;
  }

  /* --- Page layout --- */
  .page {
    width: 216mm;
    min-height: 279mm;
    padding: 10mm 12mm 14mm;
    position: relative;
    page-break-after: always;
  }
  .page.land {
    width: 279mm;
    min-height: 216mm;
    padding: 8mm 10mm 12mm;
  }
  @media print {
    body { margin: 0; }
    .page { page-break-after: always; }
  }

  /* --- Header --- */
  .rpt-header { margin-bottom: 6mm; }
  .rpt-header-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 3px solid var(--teal);
    padding-bottom: 4px;
    margin-bottom: 4px;
  }
  .rpt-logo-area { display: flex; align-items: center; gap: 8px; }
  .rpt-esp-circle {
    width: 38px; height: 38px;
    background: linear-gradient(135deg, var(--navy), #2c5282);
    border-radius: 50%;
    border: 2px solid var(--teal);
    display: flex; align-items: center; justify-content: center;
    color: #fff; font-weight: 800; font-size: 9pt;
    flex-shrink: 0;
  }
  .rpt-logo-img { height: 38px; width: auto; object-fit: contain; }
  .rpt-inst-name strong { display: block; font-size: 9.5pt; color: var(--navy); text-transform: uppercase; letter-spacing: 0.4px; }
  .rpt-inst-name span   { font-size: 7pt; color: var(--ink3); }
  .rpt-doc-tag {
    background: var(--teal); color: #fff;
    font-size: 7pt; font-weight: 700;
    padding: 3px 10px; border-radius: 2px;
    text-transform: uppercase; letter-spacing: 0.6px;
    white-space: nowrap;
  }
  .rpt-header-bar {
    background: var(--teal2);
    border-left: 3px solid var(--teal);
    border-radius: 3px;
    padding: 3px 8px;
    display: flex; flex-wrap: wrap; gap: 14px;
    font-size: 7pt; color: var(--ink2);
  }
  .rpt-header-bar strong { color: var(--navy); }

  /* --- Footer --- */
  .rpt-footer {
    position: absolute; bottom: 8mm; left: 12mm; right: 12mm;
    border-top: 1px solid var(--border);
    padding-top: 4px;
    font-size: 6.5pt; color: var(--ink3);
  }
  .rpt-footer-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
  .rpt-sigs { display: flex; gap: 30mm; margin-top: 10mm; }
  .rpt-sig-line { text-align: center; }
  .rpt-sig-line .line { width: 50mm; border-bottom: 1px solid var(--ink3); margin-bottom: 3px; }

  /* --- Metric chips --- */
  .rpt-chips { display: flex; gap: 6px; margin-bottom: 5mm; flex-wrap: wrap; }
  .rpt-chip {
    border: 1px solid var(--border); border-radius: 5px;
    padding: 5px 10px; text-align: center; min-width: 48px;
  }
  .rpt-chip .chip-val { font-size: 14pt; font-weight: 800; display: block; }
  .rpt-chip .chip-lbl { font-size: 6pt; text-transform: uppercase; color: var(--ink3); display: block; }
  .chip-ok  { border-color: var(--ok);   }  .chip-ok  .chip-val { color: var(--ok);   }
  .chip-bad { border-color: var(--bad);  }  .chip-bad .chip-val { color: var(--bad);  }
  .chip-warn{ border-color: var(--warn); }  .chip-warn .chip-val{ color: var(--warn); }
  .chip-info{ border-color: var(--teal); }  .chip-info .chip-val{ color: var(--teal); }
  .chip-navy{ border-color: var(--navy); }  .chip-navy .chip-val{ color: var(--navy); }

  /* --- Attendance table --- */
  .rpt-table { width: 100%; border-collapse: collapse; font-size: 7.5pt; margin-bottom: 5mm; }
  .rpt-table th { background: var(--navy); color: #fff; padding: 3px 5px; text-align: left; font-weight: 700; }
  .rpt-table td { padding: 3px 5px; border-bottom: 1px solid var(--border); }
  .rpt-table tr:nth-child(even) td { background: #f8f9fc; }
  .att-cell {
    display: inline-block; padding: 1px 6px; border-radius: 3px;
    font-weight: 700; font-size: 7pt; text-align: center; min-width: 22px;
  }
  .att-P  { background: var(--ok2);   color: var(--ok);   }
  .att-A  { background: var(--bad2);  color: var(--bad);  }
  .att-J  { background: var(--warn2); color: var(--warn); }

  /* --- Content chips --- */
  .rpt-content-chips { display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 4mm; }
  .content-chip {
    background: var(--teal2); color: var(--navy);
    border: 1px solid var(--teal); border-radius: 3px;
    font-size: 6.5pt; padding: 2px 7px;
  }

  /* --- Obs blocks --- */
  .rpt-obs { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; margin-bottom: 4mm; }
  .obs-block { border-radius: 4px; padding: 5px 8px; font-size: 7.5pt; }
  .obs-pos  { background: var(--ok2);   border-left: 3px solid var(--ok);   }
  .obs-neg  { background: var(--bad2);  border-left: 3px solid var(--bad);  }
  .obs-warn { background: var(--warn2); border-left: 3px solid var(--warn); }
  .obs-info { background: var(--teal2); border-left: 3px solid var(--teal); }
  .obs-block .obs-label { font-weight: 700; font-size: 6.5pt; text-transform: uppercase; margin-bottom: 2px; display: block; }

  /* --- Progress bars --- */
  .prog-row { margin-bottom: 3px; }
  .prog-label { font-size: 6.5pt; color: var(--ink2); display: flex; justify-content: space-between; margin-bottom: 2px; }
  .prog-bar-outer { height: 5px; background: var(--border); border-radius: 3px; }
  .prog-bar-inner { height: 100%; border-radius: 3px; }
  .prog-LOGRADO    .prog-bar-inner { background: var(--ok);   width: 100%; }
  .prog-EN_PROGRESO .prog-bar-inner { background: var(--teal); }
  .prog-INICIADO   .prog-bar-inner { background: #9ca3af; }

  /* --- Profile cards (Doc 3 Pág 2) --- */
  .profile-grid { display: grid; gap: 4mm; }
  .profile-grid.cols-3 { grid-template-columns: repeat(3, 1fr); }
  .profile-grid.cols-4 { grid-template-columns: repeat(4, 1fr); }
  .profile-card { border: 1px solid var(--border); border-radius: 5px; overflow: hidden; font-size: 7pt; }
  .pc-head { background: var(--navy); color: #fff; padding: 4px 7px; display: flex; align-items: center; gap: 5px; }
  .pc-avatar { width: 22px; height: 22px; border-radius: 50%; background: var(--teal); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 7pt; flex-shrink: 0; }
  .pc-name { font-weight: 700; font-size: 7.5pt; }
  .pc-badge { display: inline-block; padding: 1px 5px; border-radius: 2px; font-size: 6pt; font-weight: 700; color: #fff; margin-top: 2px; }
  .badge-destacado  { background: var(--teal); }
  .badge-mejora     { background: #1d4ed8; }
  .badge-estable    { background: #6c757d; }
  .badge-riesgo     { background: var(--bad); }
  .pc-section { padding: 4px 7px; border-bottom: 1px solid var(--border); }
  .pc-section-title { font-size: 6pt; font-weight: 700; text-transform: uppercase; color: var(--ink3); margin-bottom: 2px; }
  .pc-row { display: flex; justify-content: space-between; margin-bottom: 1px; }
  .pc-just-item::before { content: '• '; }

  /* --- Session grid (Doc 3 Pág 1) --- */
  .session-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 7pt; margin-bottom: 4mm; }
  .session-card { border: 1px solid var(--border); border-radius: 3px; padding: 4px 6px; }
  .session-card .sc-top { font-weight: 700; color: var(--navy); margin-bottom: 2px; }
  .session-card .sc-att { display: flex; gap: 6px; }

  /* --- Comparativa bars (Doc 2 Pág 2 + Doc 3 Pág 3) --- */
  .comp-row { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; font-size: 7.5pt; }
  .comp-label { width: 70px; color: var(--ink2); }
  .comp-bar-wrap { flex: 1; height: 8px; background: var(--border); border-radius: 4px; overflow: hidden; }
  .comp-bar { height: 100%; border-radius: 4px; }
  .comp-bar.bar-ok  { background: var(--ok); }
  .comp-bar.bar-bad { background: var(--bad); }
  .comp-bar.bar-warn{ background: var(--warn); }
  .comp-delta { font-size: 7pt; font-weight: 700; width: 36px; }
  .delta-up   { color: var(--ok); }
  .delta-down { color: var(--bad); }

  /* --- Section titles --- */
  .rpt-section-title {
    font-size: 8pt; font-weight: 700; text-transform: uppercase;
    color: var(--navy); letter-spacing: 0.4px;
    border-bottom: 1px solid var(--teal); padding-bottom: 2px; margin-bottom: 4px;
  }

  /* --- Recommendations (Doc 3 Pág 3) --- */
  .reco-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; margin-bottom: 4mm; }
  .reco-card { background: var(--teal2); border: 1px solid var(--teal); border-radius: 4px; padding: 6px 8px; font-size: 7pt; }
  .reco-card .reco-title { font-weight: 700; color: var(--navy); margin-bottom: 3px; font-size: 7pt; text-transform: uppercase; }

  /* --- Nota dirección --- */
  .nota-dir { background: #fffbeb; border: 1px solid var(--gold); border-radius: 4px; padding: 6px 10px; font-size: 7.5pt; margin-bottom: 4mm; }
  .nota-dir .nota-title { font-weight: 700; color: var(--navy); margin-bottom: 3px; font-size: 7pt; text-transform: uppercase; }
`

/**
 * Escape HTML special characters.
 * MUST be used for every dynamic value inserted into innerHTML.
 */
export function esc(str) {
  if (str == null) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

import { LOGO_BASE64 } from './reportAssets.js'

/**
 * Compact header (style C).
 * @param {Object} data
 * @param {string} data.docTag  — e.g. "REPORTE DIARIO · MAYO 2026"
 * @param {string} data.clase   — class name
 * @param {string} data.docente — teacher name
 * @param {string} data.periodo — e.g. "15 mayo 2026" or "Mayo 2026"
 * @param {string[]} [data.extraItems] — additional label:value pairs
 */
export function header(data) {
  const logoEl = LOGO_BASE64
    ? `<img src="${LOGO_BASE64}" class="rpt-logo-img" alt="El Sistema Punta Cana">`
    : `<div class="rpt-esp-circle">ESP</div>`

  const extraHtml = (data.extraItems || [])
    .map(item => `<span><strong>${esc(item.label)}:</strong> ${esc(item.value)}</span>`)
    .join('')

  return `
    <header class="rpt-header">
      <div class="rpt-header-top">
        <div class="rpt-logo-area">
          ${logoEl}
          <div class="rpt-inst-name">
            <strong>El Sistema Punta Cana</strong>
            <span>República Dominicana · Departamento Académico</span>
          </div>
        </div>
        <div class="rpt-doc-tag">${esc(data.docTag)}</div>
      </div>
      <div class="rpt-header-bar">
        <span><strong>Clase:</strong> ${esc(data.clase)}</span>
        <span><strong>Docente:</strong> ${esc(data.docente)}</span>
        <span><strong>Período:</strong> ${esc(data.periodo)}</span>
        ${extraHtml}
      </div>
    </header>
  `
}

/**
 * Footer with departmental route + signature lines.
 * @param {number} pageNum  — current page (1-based)
 * @param {number} total    — total pages
 * @param {string} dateStr  — formatted date string
 */
export function footer(pageNum, total, dateStr) {
  return `
    <footer class="rpt-footer">
      <div class="rpt-footer-row">
        <span>Generado por SOI · Docente → Coord. Académica → Coord. Administrativa → Dirección Ejecutiva</span>
        <span>Pág ${pageNum}/${total} · ${esc(dateStr)}</span>
      </div>
      <div class="rpt-sigs">
        <div class="rpt-sig-line"><div class="line"></div><span>Firma Docente</span></div>
        <div class="rpt-sig-line"><div class="line"></div><span>Coordinación Académica</span></div>
        <div class="rpt-sig-line"><div class="line"></div><span>Dirección Ejecutiva</span></div>
      </div>
    </footer>
  `
}

/**
 * Row of KPI chips.
 * @param {Array<{label, value, type}>} metrics
 *   type: 'ok' | 'bad' | 'warn' | 'info' | 'navy'
 */
export function metricChips(metrics) {
  const chips = metrics.map(m => `
    <div class="rpt-chip chip-${esc(m.type)}">
      <span class="chip-val">${esc(String(m.value))}</span>
      <span class="chip-lbl">${esc(m.label)}</span>
    </div>
  `).join('')
  return `<div class="rpt-chips">${chips}</div>`
}

/**
 * Single attendance cell badge.
 * @param {'P'|'A'|'J'} code
 */
export function attendanceCell(code) {
  const labels = { P: 'P', A: 'A', J: 'J' }
  const label = labels[code] ?? esc(code)
  return `<span class="att-cell att-${esc(code)}">${label}</span>`
}

/**
 * Progress bar for a curriculum objective.
 * @param {string} estado  — 'LOGRADO' | 'EN_PROGRESO' | 'INICIADO'
 * @param {string} label   — objective name
 * @param {number} pct     — 0–100 fill percentage (ignored for LOGRADO)
 */
export function progressBar(estado, label, pct = 60) {
  const fillPct = estado === 'LOGRADO' ? 100 : pct
  const estadoLabel = { LOGRADO: 'Logrado', EN_PROGRESO: 'En progreso', INICIADO: 'Iniciado' }[estado] ?? estado
  return `
    <div class="prog-row prog-${esc(estado)}">
      <div class="prog-label">
        <span>${esc(label)}</span>
        <span>${esc(estadoLabel)}</span>
      </div>
      <div class="prog-bar-outer">
        <div class="prog-bar-inner" style="width:${fillPct}%"></div>
      </div>
    </div>
  `
}

/**
 * Observation block.
 * @param {'pos'|'neg'|'warn'|'info'} type
 * @param {string} label — section label
 * @param {string} text  — observation text
 */
export function obsBlock(type, label, text) {
  const icons = { pos: '✅', neg: '⛔', warn: '⚠️', info: '📋' }
  const icon = icons[type] ?? ''
  return `
    <div class="obs-block obs-${esc(type)}">
      <span class="obs-label">${icon} ${esc(label)}</span>
      <span>${esc(text)}</span>
    </div>
  `
}

/**
 * Row of content chips from DSL tokens.
 * @param {string[]} items — content labels
 */
export function contentChips(items) {
  if (!items || items.length === 0) return ''
  const chips = items.map(c => `<span class="content-chip">${esc(c)}</span>`).join('')
  return `<div class="rpt-content-chips">${chips}</div>`
}

/**
 * Open an HTML string in a new window and trigger print dialog.
 * @param {string} html — full HTML document string
 */
export function openReport(html) {
  const win = window.open('', '_blank')
  if (!win) {
    return false // popup blocked
  }
  win.document.open()
  win.document.write(html)
  win.document.close()
  // Short delay so fonts can load before print dialog opens
  setTimeout(() => win.print(), 600)
  return true
}

/**
 * Wrap page content in a complete HTML document.
 * @param {string} pagesHtml — one or more <div class="page"> blocks
 * @param {boolean} landscape — whether to use @page landscape
 */
export function wrapDocument(pagesHtml, landscape = false) {
  const pageRule = landscape
    ? '@page { size: letter landscape; margin: 0; }'
    : '@page { size: letter portrait; margin: 0; }'

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Informe El Sistema Punta Cana</title>
  <style>
    ${pageRule}
    ${REPORT_CSS}
  </style>
</head>
<body>
  ${pagesHtml}
</body>
</html>`
}

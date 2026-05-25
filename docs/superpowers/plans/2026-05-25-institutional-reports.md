# Institutional Reports — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generate three print-ready institutional HTML documents (saved as PDF via `window.print()`) from live Supabase data: Daily Attendance Report, Monthly Attendance Summary, and Monthly Pedagogical Report.

**Architecture:** Three generator functions in `reportService.js` query Supabase, build HTML strings using shared helpers from `reportTemplates.js` (CSS + building blocks), open a new browser window, and call `window.print()`. No external PDF library. Logo is base64-embedded in `reportAssets.js` for offline-safe printing.

**Tech Stack:** Vanilla JS ES Modules, Supabase JS v2, Groq via `groq-proxy` Edge Function, `window.print()`, no bundler, no TypeScript.

---

## ⚠️ CRITICAL CONTEXT — READ BEFORE WRITING ANY CODE

### Project rules
- **Vanilla JS ES Modules only.** No TypeScript, no bundler, no npm packages.
- **Supabase JS v2** already imported via `import { supabase } from '../../lib/supabaseClient.js'`
- **Factory function pattern:** exported functions are plain `async function`, not classes.
- **XSS prevention:** every dynamic string inserted into innerHTML MUST pass through `esc()`.
- **`AppToast`** is available at `import { AppToast } from '../../shared/components/AppToast.js'`
- **Attendance states:** ONLY `P` (Presente), `A` (Ausente), `J` (Justificado). No `T`, no `L`.
- **Groq proxy:** all AI calls go through `groqService.js` → `groq-proxy` Edge Function. Never call Groq API directly from new files.
- **Groq language:** Spanish neutro (no voseo, no slang).

### File paths (project root = `sistema-academico-pwa/`)
- New files go under `src/portal-maestros/services/`
- Views to modify: `src/portal-maestros/views/asistenciaView.js` and `src/portal-maestros/views/reportesView.js`
- Groq service to extend: `src/portal-maestros/services/groqService.js`
- Logo PNG (if available): `src/portal-maestros/assets/logo-esp.png`

### No tests for HTML string functions
HTML-building helpers in `reportTemplates.js` are pure string functions — test them visually by generating the report in the browser. Unit tests apply only to data-aggregation logic (stat calculations).

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `src/portal-maestros/services/reportTemplates.js` | **Create** | CSS string + shared HTML building block functions |
| `src/portal-maestros/services/reportAssets.js` | **Create** | `LOGO_BASE64` constant (text fallback until PNG is converted) |
| `src/portal-maestros/services/reportService.js` | **Create** | Three async generator functions + Supabase queries |
| `src/portal-maestros/services/groqService.js` | **Modify** | Add `generateMonthlyPatterns()` function |
| `src/portal-maestros/views/asistenciaView.js` | **Modify** | Add "📄 Reporte del día" + "📊 Resumen del mes" buttons |
| `src/portal-maestros/views/reportesView.js` | **Modify** | Add "🎓 Informe pedagógico" button |
| `src/portal-maestros/services/__tests__/reportService.test.js` | **Create** | Unit tests for stat aggregation helpers |

---

## Task 1: `reportAssets.js` — Logo base64 placeholder

**Files:**
- Create: `src/portal-maestros/services/reportAssets.js`

- [ ] **Step 1: Create the file with a text-fallback constant**

  The real base64 string will be generated later from the PNG. For now use an empty string — the template will render the ESP circle fallback when LOGO_BASE64 is empty.

  ```js
  /**
   * reportAssets.js
   *
   * Logo base64 for institutional reports.
   * Replace the empty string with the actual base64 data URI when the PNG is ready:
   *   node -e "const fs=require('fs');console.log('data:image/png;base64,'+fs.readFileSync('src/portal-maestros/assets/logo-esp.png').toString('base64'))"
   */
  export const LOGO_BASE64 = ''
  ```

- [ ] **Step 2: Commit**

  ```bash
  git add src/portal-maestros/services/reportAssets.js
  git commit -m "feat(reports): add reportAssets placeholder for logo base64"
  ```

---

## Task 2: `reportTemplates.js` — CSS + shared HTML helpers

**Files:**
- Create: `src/portal-maestros/services/reportTemplates.js`

- [ ] **Step 1: Write the CSS string constant**

  ```js
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
  ```

- [ ] **Step 2: Write the `esc()` XSS helper**

  ```js
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
  ```

- [ ] **Step 3: Write `header()`, `footer()`, `metricChips()`**

  ```js
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
  ```

- [ ] **Step 4: Write `attendanceCell()`, `progressBar()`, `obsBlock()`, `contentChips()`**

  ```js
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
  ```

- [ ] **Step 5: Write the `openReport()` helper**

  ```js
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
  ```

- [ ] **Step 6: Commit**

  ```bash
  git add src/portal-maestros/services/reportTemplates.js
  git commit -m "feat(reports): add reportTemplates with CSS and shared HTML helpers"
  ```

---

## Task 3: Groq — `generateMonthlyPatterns()` function

**Files:**
- Modify: `src/portal-maestros/services/groqService.js`

- [ ] **Step 1: Understand the existing groqService pattern**

  Read `src/portal-maestros/services/groqService.js`. The internal `proxyChat(messages, temperature)` function already exists. The new function follows the same pattern as existing exported functions in that file.

- [ ] **Step 2: Add the exported function at the bottom of the file**

  ```js
  /**
   * Analyze monthly session + progress data and generate institutional narrative.
   *
   * @param {Array} sesiones  — array of sesiones_clase rows
   * @param {Array} progresos — array of progresos rows with alumno names
   * @param {Object} context  — { clase: string, docente: string, mes: string, totalAlumnos: number }
   * @returns {Promise<{
   *   patrones: { positivos: string[], atencion: string[] },
   *   recomendaciones: { academico: string, logistica: string, talentos: string, refuerzo: string },
   *   notaDireccion: string
   * }>}
   */
  export async function generateMonthlyPatterns(sesiones, progresos, context) {
    const sesionesResumen = sesiones.map(s => {
      const att = s.asistencia || []
      const P = att.filter(a => a.estado === 'P').length
      const A = att.filter(a => a.estado === 'A').length
      const J = att.filter(a => a.estado === 'J').length
      return `Sesión ${s.numero_sesion} (${s.fecha}): ${P} presentes, ${A} ausentes, ${J} justificados`
    }).join('\n')

    const progresosResumen = progresos.map(p =>
      `${p.alumnos?.nombre_completo ?? 'Alumno'} — ${p.objetivo_descripcion ?? p.contenido_dsl ?? ''}: ${p.tipo}`
    ).join('\n')

    const prompt = `Eres el asistente pedagógico del Departamento Académico de El Sistema Punta Cana.
Analiza los datos del mes de ${context.mes} para la clase "${context.clase}" (docente: ${context.docente}, ${context.totalAlumnos} alumnos).

DATOS DE ASISTENCIA:
${sesionesResumen}

DATOS DE PROGRESO:
${progresosResumen}

Devuelve un JSON con esta estructura exacta (sin texto adicional, solo el JSON):
{
  "patrones": {
    "positivos": ["máximo 3 patrones positivos detectados"],
    "atencion": ["máximo 3 situaciones que requieren atención"]
  },
  "recomendaciones": {
    "academico": "recomendación académica en 2 oraciones",
    "logistica": "recomendación logística/administrativa en 2 oraciones",
    "talentos": "recomendación sobre talentos o alumnos destacados en 2 oraciones",
    "refuerzo": "recomendación sobre alumnos que necesitan refuerzo en 2 oraciones"
  },
  "notaDireccion": "nota ejecutiva de 3-4 oraciones para el director, destacando lo más relevante del mes"
}
Usa español neutro, tono formal-institucional, sin voseo.`

    try {
      const raw = await proxyChat([{ role: 'user', content: prompt }], 0.3)
      // Strip potential markdown code fences
      const jsonStr = raw.replace(/^```json?\s*/i, '').replace(/\s*```$/i, '').trim()
      return JSON.parse(jsonStr)
    } catch (err) {
      console.error('[groqService] generateMonthlyPatterns failed:', err)
      return {
        patrones: { positivos: [], atencion: [] },
        recomendaciones: { academico: '', logistica: '', talentos: '', refuerzo: '' },
        notaDireccion: ''
      }
    }
  }
  ```

- [ ] **Step 3: Commit**

  ```bash
  git add src/portal-maestros/services/groqService.js
  git commit -m "feat(reports): add generateMonthlyPatterns to groqService"
  ```

---

## Task 4: `reportService.js` — Data helpers + Doc 1 (Daily Attendance)

**Files:**
- Create: `src/portal-maestros/services/reportService.js`
- Create: `src/portal-maestros/services/__tests__/reportService.test.js`

- [ ] **Step 1: Write failing tests for stat aggregation helpers**

  ```js
  // src/portal-maestros/services/__tests__/reportService.test.js
  import { describe, it, expect } from 'vitest'
  import { calcAttendanceStats, buildAlumnoAttMap } from '../reportService.js'

  describe('calcAttendanceStats', () => {
    it('counts P, A, J from a session asistencia array', () => {
      const att = [
        { alumno_id: '1', estado: 'P' },
        { alumno_id: '2', estado: 'A' },
        { alumno_id: '3', estado: 'J' },
        { alumno_id: '4', estado: 'P' },
      ]
      expect(calcAttendanceStats(att)).toEqual({ P: 2, A: 1, J: 1, total: 4 })
    })

    it('returns zeros for empty array', () => {
      expect(calcAttendanceStats([])).toEqual({ P: 0, A: 0, J: 0, total: 0 })
    })
  })

  describe('buildAlumnoAttMap', () => {
    it('builds a map of alumnoId → estado per sesion', () => {
      const sesiones = [
        { id: 's1', asistencia: [{ alumno_id: 'a1', estado: 'P' }, { alumno_id: 'a2', estado: 'A' }] },
        { id: 's2', asistencia: [{ alumno_id: 'a1', estado: 'J' }, { alumno_id: 'a2', estado: 'P' }] },
      ]
      const result = buildAlumnoAttMap(sesiones)
      expect(result['a1']['s1']).toBe('P')
      expect(result['a1']['s2']).toBe('J')
      expect(result['a2']['s1']).toBe('A')
      expect(result['a2']['s2']).toBe('P')
    })
  })
  ```

- [ ] **Step 2: Run tests — expect failure (functions not exported yet)**

  ```bash
  cd src/portal-maestros && npx vitest run services/__tests__/reportService.test.js
  ```
  Expected: FAIL with "Cannot find module" or similar.

- [ ] **Step 3: Write `reportService.js` with helpers + Doc 1**

  ```js
  /**
   * reportService.js
   *
   * Three institutional PDF generator functions.
   * Each function queries Supabase, builds HTML via reportTemplates, opens a new window, prints.
   *
   * Exports:
   *   generateDailyReport(sesionId)
   *   generateMonthlyAttendance(claseId, year, month)
   *   generateMonthlyPedagogical(claseId, year, month)
   *
   * Also exports stat helpers for testing:
   *   calcAttendanceStats(asistenciaArray) → { P, A, J, total }
   *   buildAlumnoAttMap(sesiones) → { [alumnoId]: { [sesionId]: estado } }
   */

  import { supabase } from '../../lib/supabaseClient.js'
  import { AppToast } from '../../shared/components/AppToast.js'
  import { generateMonthlyPatterns } from './groqService.js'
  import {
    header, footer, metricChips, attendanceCell, progressBar,
    obsBlock, contentChips, openReport, wrapDocument, esc
  } from './reportTemplates.js'

  // ---------------------------------------------------------------------------
  // Stat helpers (exported for tests)
  // ---------------------------------------------------------------------------

  export function calcAttendanceStats(asistenciaArr) {
    const arr = asistenciaArr || []
    const P = arr.filter(a => a.estado === 'P').length
    const A = arr.filter(a => a.estado === 'A').length
    const J = arr.filter(a => a.estado === 'J').length
    return { P, A, J, total: arr.length }
  }

  export function buildAlumnoAttMap(sesiones) {
    const map = {}
    for (const ses of sesiones) {
      for (const att of ses.asistencia || []) {
        if (!map[att.alumno_id]) map[att.alumno_id] = {}
        map[att.alumno_id][ses.id] = att.estado
      }
    }
    return map
  }

  // ---------------------------------------------------------------------------
  // Date helpers
  // ---------------------------------------------------------------------------

  function formatDate(dateStr) {
    if (!dateStr) return ''
    const d = new Date(dateStr + 'T00:00:00')
    return d.toLocaleDateString('es-DO', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  function monthName(month) {
    const names = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                   'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
    return names[month - 1] ?? ''
  }

  function lastDayOfMonth(year, month) {
    return new Date(year, month, 0).getDate()
  }

  function padMM(n) { return String(n).padStart(2, '0') }

  // ---------------------------------------------------------------------------
  // Doc 1 — Daily Attendance Report
  // ---------------------------------------------------------------------------

  /**
   * Generate and print Daily Attendance Report for a single session.
   * @param {string} sesionId — UUID of the sesiones_clase row
   */
  export async function generateDailyReport(sesionId) {
    try {
      // 1. Fetch session data in parallel
      const [sesionRes, obsRes] = await Promise.all([
        supabase
          .from('sesiones_clase')
          .select(`id, fecha, numero_sesion, tipo_sesion, asistencia,
                   clases ( id, nombre, instrumento, maestros ( nombre_completo ) )`)
          .eq('id', sesionId)
          .single(),
        supabase
          .from('observaciones_sesion')
          .select('contenido_ia_dsl, contenido_dsl')
          .eq('sesion_clase_id', sesionId)
          .maybeSingle()
      ])

      if (sesionRes.error) throw sesionRes.error
      const sesion = sesionRes.data
      const obs = obsRes.data

      // Fetch alumnos of the class
      const { data: alumnos, error: alumnosErr } = await supabase
        .from('alumnos')
        .select('id, nombre_completo, nombre_corto')
        .eq('clase_id', sesion.clases.id)
        .order('nombre_completo')
      if (alumnosErr) throw alumnosErr

      if (!alumnos || alumnos.length === 0) {
        AppToast.error('No hay alumnos registrados para esta clase.')
        return
      }

      // 2. Compute stats
      const att = sesion.asistencia || []
      const stats = calcAttendanceStats(att)
      const attByAlumno = {}
      att.forEach(a => { attByAlumno[a.alumno_id] = a })

      const landscape = alumnos.length > 20

      // Parse DSL content chips
      const dslRaw = obs?.contenido_ia_dsl || obs?.contenido_dsl || ''
      const contentItems = dslRaw
        .split(/[\n,]/)
        .map(s => s.replace(/^\s*[\-\*\d\.]+\s*/, '').trim())
        .filter(s => s.length > 2 && s.length < 60)
        .slice(0, 12)

      // Parse obs blocks
      const obsLines = dslRaw.split('\n').filter(l => l.trim())
      const obsParsed = []
      for (const line of obsLines) {
        if (/destacad|excelente|logr/i.test(line)) obsParsed.push({ type: 'pos', label: 'Destacado', text: line.replace(/^[\-\*]\s*/, '') })
        else if (/alerta|ausencia|riesgo|falt/i.test(line)) obsParsed.push({ type: 'neg', label: 'Alerta', text: line.replace(/^[\-\*]\s*/, '') })
        else if (/novedad|nota|aviso/i.test(line)) obsParsed.push({ type: 'info', label: 'Novedad', text: line.replace(/^[\-\*]\s*/, '') })
      }
      const obsBlocks = obsParsed.slice(0, 4)
        .map(o => obsBlock(o.type, o.label, o.text))
        .join('')

      // 3. Build HTML
      const docTag = `REPORTE DIARIO · ${formatDate(sesion.fecha)}`
      const clase = sesion.clases.nombre
      const docente = sesion.clases.maestros?.nombre_completo ?? 'Docente'
      const periodo = `Sesión #${sesion.numero_sesion} · ${formatDate(sesion.fecha)}`

      const headerHtml = header({ docTag, clase, docente, periodo })

      const chips = metricChips([
        { label: 'Presentes',    value: stats.P, type: 'ok'   },
        { label: 'Ausentes',     value: stats.A, type: 'bad'  },
        { label: 'Justificados', value: stats.J, type: 'warn' },
        { label: 'Total',        value: alumnos.length, type: 'navy' },
      ])

      const tableRows = alumnos.map((al, i) => {
        const a = attByAlumno[al.id]
        const estado = a?.estado ?? '—'
        const cell = ['P','A','J'].includes(estado) ? attendanceCell(estado) : esc(estado)
        const obs_ = esc(a?.observacion || '')
        return `<tr>
          <td>${i + 1}</td>
          <td>${esc(al.nombre_completo)}</td>
          <td style="text-align:center">${cell}</td>
          <td style="font-size:6.5pt;color:#6b7085">${obs_}</td>
        </tr>`
      }).join('')

      const table = `
        <p class="rpt-section-title">Registro de asistencia</p>
        <table class="rpt-table">
          <thead><tr><th>#</th><th>Alumno</th><th>Estado</th><th>Observación</th></tr></thead>
          <tbody>${tableRows}</tbody>
        </table>
      `

      const contentSection = contentItems.length > 0
        ? `<p class="rpt-section-title">Contenido de la sesión</p>${contentChips(contentItems)}`
        : ''

      const obsSection = obsBlocks
        ? `<p class="rpt-section-title">Observaciones</p><div class="rpt-obs">${obsBlocks}</div>`
        : ''

      const footerHtml = footer(1, 1, formatDate(sesion.fecha))

      const pageClass = landscape ? 'page land' : 'page'
      const pageHtml = `
        <div class="${pageClass}">
          ${headerHtml}
          ${chips}
          ${table}
          ${contentSection}
          ${obsSection}
          ${footerHtml}
        </div>
      `

      const html = wrapDocument(pageHtml, landscape)

      // 4. Open and print
      const opened = openReport(html)
      if (!opened) {
        AppToast.warn('El navegador bloqueó la ventana emergente. Permite las ventanas emergentes para este sitio e intenta de nuevo.')
      }

    } catch (err) {
      console.error('[reportService] generateDailyReport:', err)
      AppToast.error('Error al generar el reporte: ' + err.message)
    }
  }
  ```

- [ ] **Step 4: Run tests — expect pass**

  ```bash
  cd src/portal-maestros && npx vitest run services/__tests__/reportService.test.js
  ```
  Expected: PASS (2 test suites, 3 tests).

- [ ] **Step 5: Commit**

  ```bash
  git add src/portal-maestros/services/reportService.js src/portal-maestros/services/__tests__/reportService.test.js
  git commit -m "feat(reports): add reportService with stat helpers and generateDailyReport"
  ```

---

## Task 5: Doc 2 — Monthly Attendance Summary

**Files:**
- Modify: `src/portal-maestros/services/reportService.js` (append function)

- [ ] **Step 1: Add `generateMonthlyAttendance()` to `reportService.js`**

  Append after `generateDailyReport`:

  ```js
  // ---------------------------------------------------------------------------
  // Doc 2 — Monthly Attendance Summary
  // ---------------------------------------------------------------------------

  /**
   * Generate and print Monthly Attendance Summary.
   * @param {string} claseId — UUID of the class
   * @param {number} year    — e.g. 2026
   * @param {number} month   — 1–12
   */
  export async function generateMonthlyAttendance(claseId, year, month) {
    try {
      const mm = padMM(month)
      const lastDay = lastDayOfMonth(year, month)
      const rangeStart = `${year}-${mm}-01`
      const rangeEnd   = `${year}-${mm}-${lastDay}`

      // Previous month
      const prevMonth = month === 1 ? 12 : month - 1
      const prevYear  = month === 1 ? year - 1 : year
      const prevMM    = padMM(prevMonth)
      const prevLastDay = lastDayOfMonth(prevYear, prevMonth)
      const prevStart = `${prevYear}-${prevMM}-01`
      const prevEnd   = `${prevYear}-${prevMM}-${prevLastDay}`

      // Parallel fetch
      const [sesionesRes, justRes, prevSesRes, claseRes, alumnosRes] = await Promise.all([
        supabase.from('sesiones_clase')
          .select('id, fecha, numero_sesion, asistencia')
          .eq('clase_id', claseId)
          .gte('fecha', rangeStart).lte('fecha', rangeEnd)
          .order('fecha'),
        supabase.from('justificaciones')
          .select('alumno_id, fecha, tipo, motivo, alumnos(nombre_completo)')
          .eq('clase_id', claseId)
          .gte('fecha', rangeStart).lte('fecha', rangeEnd),
        supabase.from('sesiones_clase')
          .select('id, asistencia')
          .eq('clase_id', claseId)
          .gte('fecha', prevStart).lte('fecha', prevEnd),
        supabase.from('clases')
          .select('nombre, instrumento, maestros(nombre_completo)')
          .eq('id', claseId)
          .single(),
        supabase.from('alumnos')
          .select('id, nombre_completo, nombre_corto')
          .eq('clase_id', claseId)
          .order('nombre_completo')
      ])

      for (const res of [sesionesRes, claseRes, alumnosRes]) {
        if (res.error) throw res.error
      }

      const sesiones = sesionesRes.data || []
      const justificaciones = justRes.data || []
      const prevSesiones = prevSesRes.data || []
      const clase = claseRes.data
      const alumnos = alumnosRes.data || []

      if (sesiones.length === 0) {
        AppToast.error('No hay sesiones registradas para este período.')
        return
      }

      const landscape = alumnos.length > 18 || sesiones.length > 16

      // Aggregate totals
      let totalP = 0, totalA = 0, totalJ = 0
      sesiones.forEach(s => {
        const st = calcAttendanceStats(s.asistencia)
        totalP += st.P; totalA += st.A; totalJ += st.J
      })
      const grandTotal = totalP + totalA + totalJ

      // Previous month totals
      let prevP = 0, prevA = 0, prevJ = 0
      prevSesiones.forEach(s => {
        const st = calcAttendanceStats(s.asistencia)
        prevP += st.P; prevA += st.A; prevJ += st.J
      })
      const prevTotal = prevP + prevA + prevJ

      const pct = (n, tot) => tot > 0 ? Math.round((n / tot) * 100) : 0
      const delta = (cur, prev, tot, ptot) => {
        const c = pct(cur, tot), p = pct(prev, ptot)
        const d = c - p
        const sign = d > 0 ? '+' : ''
        return { cur: c, prev: p, diff: d, label: `${sign}${d}%`, cls: d >= 0 ? 'delta-up' : 'delta-down' }
      }

      const dP = delta(totalP, prevP, grandTotal, prevTotal)
      const dA = delta(totalA, prevA, grandTotal, prevTotal)
      const dJ = delta(totalJ, prevJ, grandTotal, prevTotal)

      // Build per-alumno row data
      const attMap = buildAlumnoAttMap(sesiones)

      // Build page 1: header + summary chips + attendance table
      const docTag = `RESUMEN MENSUAL · ${monthName(month).toUpperCase()} ${year}`
      const headerData = {
        docTag,
        clase: clase.nombre,
        docente: clase.maestros?.nombre_completo ?? 'Docente',
        periodo: `${monthName(month)} ${year}`,
        extraItems: [{ label: 'Sesiones', value: sesiones.length }, { label: 'Alumnos', value: alumnos.length }]
      }

      const chips = metricChips([
        { label: 'Presentes',    value: `${totalP} (${pct(totalP, grandTotal)}%)`, type: 'ok' },
        { label: 'Ausentes',     value: `${totalA} (${pct(totalA, grandTotal)}%)`, type: 'bad' },
        { label: 'Justificados', value: `${totalJ} (${pct(totalJ, grandTotal)}%)`, type: 'warn' },
        { label: 'Sesiones',     value: sesiones.length, type: 'navy' },
      ])

      // Table header: #, Alumno, S1..SN, P, A, J
      const thSessions = sesiones.map((s, i) =>
        `<th style="text-align:center;font-size:6pt">S${s.numero_sesion}</th>`
      ).join('')

      const tableRows = alumnos.map((al, i) => {
        const alumAtt = attMap[al.id] || {}
        let aP = 0, aA = 0, aJ = 0
        const cells = sesiones.map(s => {
          const est = alumAtt[s.id] ?? '—'
          if (est === 'P') aP++; if (est === 'A') aA++; if (est === 'J') aJ++
          return `<td style="text-align:center">${['P','A','J'].includes(est) ? attendanceCell(est) : esc(est)}</td>`
        }).join('')

        return `<tr>
          <td>${i + 1}</td>
          <td>${esc(al.nombre_corto || al.nombre_completo)}</td>
          ${cells}
          <td style="text-align:center;font-weight:700;color:var(--ok)">${aP}</td>
          <td style="text-align:center;font-weight:700;color:var(--bad)">${aA}</td>
          <td style="text-align:center;font-weight:700;color:var(--warn)">${aJ}</td>
        </tr>`
      }).join('')

      const totalRow = `<tr style="background:#f0f4ff;font-weight:700">
        <td colspan="2">TOTALES</td>
        ${sesiones.map(() => '<td></td>').join('')}
        <td style="text-align:center;color:var(--ok)">${totalP}</td>
        <td style="text-align:center;color:var(--bad)">${totalA}</td>
        <td style="text-align:center;color:var(--warn)">${totalJ}</td>
      </tr>`

      const attTable = `
        <p class="rpt-section-title">Asistencia diaria por alumno</p>
        <table class="rpt-table" style="font-size:6.5pt">
          <thead><tr>
            <th>#</th><th>Alumno</th>
            ${thSessions}
            <th style="text-align:center;background:var(--ok)">P</th>
            <th style="text-align:center;background:var(--bad)">A</th>
            <th style="text-align:center;background:var(--warn)">J</th>
          </tr></thead>
          <tbody>${tableRows}${totalRow}</tbody>
        </table>
      `

      const page1 = `
        <div class="${landscape ? 'page land' : 'page'}">
          ${header(headerData)}
          ${chips}
          ${attTable}
          ${footer(1, justificaciones.length > 0 ? 2 : 1, `${monthName(month)} ${year}`)}
        </div>
      `

      // Page 2 (only if there are justifications)
      let page2 = ''
      if (justificaciones.length > 0 || prevTotal > 0) {
        const justRows = justificaciones.map((j, i) => `<tr>
          <td>${i + 1}</td>
          <td>${esc(j.alumnos?.nombre_completo ?? '')}</td>
          <td>${esc(formatDate(j.fecha))}</td>
          <td>${esc(j.tipo ?? 'Justificado')}</td>
          <td>${esc(j.motivo ?? '')}</td>
        </tr>`).join('')

        const justTable = justRows ? `
          <p class="rpt-section-title">Justificaciones detalladas</p>
          <table class="rpt-table">
            <thead><tr><th>#</th><th>Alumno</th><th>Fecha</th><th>Tipo</th><th>Motivo</th></tr></thead>
            <tbody>${justRows}</tbody>
          </table>
        ` : ''

        const compSection = prevTotal > 0 ? `
          <p class="rpt-section-title" style="margin-top:4mm">Comparativa vs ${monthName(prevMonth)} ${prevYear}</p>
          <div style="max-width:260mm">
            ${compBar('Presentes', dP, 'bar-ok')}
            ${compBar('Ausentes',  dA, 'bar-bad')}
            ${compBar('Justif.',   dJ, 'bar-warn')}
          </div>
        ` : ''

        const totalPages = 2
        page2 = `
          <div class="${landscape ? 'page land' : 'page'}">
            ${header(headerData)}
            ${justTable}
            ${compSection}
            ${footer(2, totalPages, `${monthName(month)} ${year}`)}
          </div>
        `
      }

      const html = wrapDocument(page1 + page2, landscape)
      const opened = openReport(html)
      if (!opened) {
        AppToast.warn('El navegador bloqueó la ventana emergente. Permite las ventanas emergentes e intenta de nuevo.')
      }

    } catch (err) {
      console.error('[reportService] generateMonthlyAttendance:', err)
      AppToast.error('Error al generar el resumen: ' + err.message)
    }
  }

  /** Internal helper — comparative bar row HTML */
  function compBar(label, d, barClass) {
    return `
      <div class="comp-row">
        <span class="comp-label">${esc(label)}</span>
        <div style="flex:1;display:flex;gap:4px;align-items:center">
          <div class="comp-bar-wrap" style="max-width:100px">
            <div class="comp-bar ${esc(barClass)}" style="width:${d.prev}%"></div>
          </div>
          <span style="font-size:6.5pt;color:var(--ink3);width:28px">${d.prev}%</span>
          <span style="font-size:7pt;color:var(--ink3)">→</span>
          <div class="comp-bar-wrap" style="max-width:100px">
            <div class="comp-bar ${esc(barClass)}" style="width:${d.cur}%"></div>
          </div>
          <span style="font-size:6.5pt;color:var(--ink3);width:28px">${d.cur}%</span>
        </div>
        <span class="comp-delta ${esc(d.cls)}">${esc(d.label)}</span>
      </div>
    `
  }
  ```

- [ ] **Step 2: Commit**

  ```bash
  git add src/portal-maestros/services/reportService.js
  git commit -m "feat(reports): add generateMonthlyAttendance (Doc 2)"
  ```

---

## Task 6: Doc 3 — Monthly Pedagogical Report

**Files:**
- Modify: `src/portal-maestros/services/reportService.js` (append function)

- [ ] **Step 1: Add `generateMonthlyPedagogical()` to `reportService.js`**

  Append after `generateMonthlyAttendance` and the `compBar` helper:

  ```js
  // ---------------------------------------------------------------------------
  // Doc 3 — Monthly Pedagogical Report (always landscape, always 3 pages)
  // ---------------------------------------------------------------------------

  /**
   * Generate and print Monthly Pedagogical Report.
   * @param {string} claseId — UUID of the class
   * @param {number} year    — e.g. 2026
   * @param {number} month   — 1–12
   */
  export async function generateMonthlyPedagogical(claseId, year, month) {
    try {
      const mm = padMM(month)
      const lastDay = lastDayOfMonth(year, month)
      const rangeStart = `${year}-${mm}-01`
      const rangeEnd   = `${year}-${mm}-${lastDay}`

      const prevMonth   = month === 1 ? 12 : month - 1
      const prevYear    = month === 1 ? year - 1 : year
      const prevMM      = padMM(prevMonth)
      const prevLastDay = lastDayOfMonth(prevYear, prevMonth)
      const prevStart   = `${prevYear}-${prevMM}-01`
      const prevEnd     = `${prevYear}-${prevMM}-${prevLastDay}`

      // Parallel data fetch
      const [
        sesRes, obsRes, progRes, claseRes, alumnosRes,
        prevSesRes, justRes
      ] = await Promise.all([
        supabase.from('sesiones_clase')
          .select('id, fecha, numero_sesion, tipo_sesion, asistencia')
          .eq('clase_id', claseId).gte('fecha', rangeStart).lte('fecha', rangeEnd).order('fecha'),
        supabase.from('observaciones_sesion')
          .select('sesion_clase_id, contenido_ia_dsl, contenido_dsl')
          .in('sesion_clase_id',
            // will be filtered after sesiones are loaded — fetch broad and filter
            (await supabase.from('sesiones_clase').select('id').eq('clase_id', claseId)
              .gte('fecha', rangeStart).lte('fecha', rangeEnd)).data?.map(s => s.id) || []
          ),
        supabase.from('progresos')
          .select(`id, alumno_id, objetivo_id, tipo, contenido_dsl, created_at,
                   alumnos(nombre_completo, nombre_corto),
                   curriculo_objetivos(descripcion, categoria)`)
          .eq('clase_id', claseId).gte('created_at', rangeStart).lte('created_at', rangeEnd),
        supabase.from('clases')
          .select('nombre, instrumento, maestros(nombre_completo)')
          .eq('id', claseId).single(),
        supabase.from('alumnos')
          .select('id, nombre_completo, nombre_corto')
          .eq('clase_id', claseId).order('nombre_completo'),
        supabase.from('sesiones_clase')
          .select('id, asistencia')
          .eq('clase_id', claseId).gte('fecha', prevStart).lte('fecha', prevEnd),
        supabase.from('justificaciones')
          .select('alumno_id, fecha, tipo, motivo')
          .eq('clase_id', claseId).gte('fecha', rangeStart).lte('fecha', rangeEnd)
      ])

      if (sesRes.error) throw sesRes.error
      if (claseRes.error) throw claseRes.error

      const sesiones    = sesRes.data || []
      const obsData     = obsRes.data || []
      const progresos   = progRes.data || []
      const clase       = claseRes.data
      const alumnos     = alumnosRes.data || []
      const prevSesiones= prevSesRes.data || []
      const justificaciones = justRes.data || []

      if (sesiones.length === 0) {
        AppToast.error('No hay sesiones registradas para este período.')
        return
      }

      const obsMap = {}
      obsData.forEach(o => { obsMap[o.sesion_clase_id] = o })

      // Aggregate totals
      let totalP = 0, totalA = 0, totalJ = 0
      sesiones.forEach(s => {
        const st = calcAttendanceStats(s.asistencia); totalP += st.P; totalA += st.A; totalJ += st.J
      })
      const grandTotal = totalP + totalA + totalJ
      const pct = (n, tot) => tot > 0 ? Math.round((n / tot) * 100) : 0

      let prevP = 0, prevA = 0, prevJ = 0
      prevSesiones.forEach(s => {
        const st = calcAttendanceStats(s.asistencia); prevP += st.P; prevA += st.A; prevJ += st.J
      })
      const prevTotal = prevP + prevA + prevJ

      // Collect unique content items across all sessions
      const contentSet = new Set()
      sesiones.forEach(s => {
        const obs = obsMap[s.id]
        if (!obs) return
        const raw = obs.contenido_ia_dsl || obs.contenido_dsl || ''
        raw.split(/[\n,]/).forEach(item => {
          const clean = item.replace(/^\s*[\-\*\d\.]+\s*/, '').trim()
          if (clean.length > 2 && clean.length < 60) contentSet.add(clean)
        })
      })
      const allContentItems = [...contentSet].slice(0, 16)

      // Collect obs blocks across sessions
      const allObs = []
      sesiones.forEach(s => {
        const obs = obsMap[s.id]
        if (!obs) return
        const raw = obs.contenido_ia_dsl || obs.contenido_dsl || ''
        raw.split('\n').forEach(line => {
          if (/destacad|excelente/i.test(line)) allObs.push({ type: 'pos', label: 'Destacado Académico', text: line.replace(/^[\-\*]\s*/, '') })
          else if (/alerta|ausencia|riesgo/i.test(line)) allObs.push({ type: 'neg', label: 'Alerta Asistencia', text: line.replace(/^[\-\*]\s*/, '') })
          else if (/novedad|administrativ/i.test(line)) allObs.push({ type: 'info', label: 'Novedad Administrativa', text: line.replace(/^[\-\*]\s*/, '') })
          else if (/nota|pedagóg/i.test(line)) allObs.push({ type: 'warn', label: 'Nota Pedagógica', text: line.replace(/^[\-\*]\s*/, '') })
        })
      })
      const topObs = allObs.slice(0, 4)
      while (topObs.length < 4) topObs.push({ type: 'info', label: 'Nota', text: '—' })

      // Session grid cards
      const sessionCards = sesiones.map(s => {
        const st = calcAttendanceStats(s.asistencia)
        const obs = obsMap[s.id]
        const rawContent = obs?.contenido_ia_dsl || obs?.contenido_dsl || ''
        const firstContent = rawContent.split(/[\n,]/)[0]?.replace(/^[\-\*\d\.]+\s*/, '').trim() || 'Sin contenido registrado'
        return `
          <div class="session-card">
            <div class="sc-top">S${s.numero_sesion} · ${esc(formatDate(s.fecha))}</div>
            <div style="font-size:6pt;color:var(--ink3);margin-bottom:2px">${esc(firstContent.slice(0, 45))}</div>
            <div class="sc-att">
              <span class="att-cell att-P">P:${st.P}</span>
              <span class="att-cell att-A">A:${st.A}</span>
              <span class="att-cell att-J">J:${st.J}</span>
            </div>
          </div>
        `
      }).join('')

      const docTag = `INFORME PEDAGÓGICO · ${monthName(month).toUpperCase()} ${year}`
      const headerData = {
        docTag,
        clase: clase.nombre,
        docente: clase.maestros?.nombre_completo ?? 'Docente',
        periodo: `${monthName(month)} ${year}`,
        extraItems: [{ label: 'Sesiones', value: sesiones.length }, { label: 'Alumnos', value: alumnos.length }]
      }

      // ---- PAGE 1 ----
      const p1 = `
        <div class="page land">
          ${header(headerData)}
          ${metricChips([
            { label: 'Sesiones',   value: sesiones.length,                  type: 'navy' },
            { label: '% Asistencia', value: pct(totalP, grandTotal) + '%',  type: 'ok'   },
            { label: 'Presentes',  value: totalP,                           type: 'ok'   },
            { label: 'Ausentes',   value: totalA,                           type: 'bad'  },
            { label: 'Justif.',    value: totalJ,                           type: 'warn' },
            { label: 'Contenidos', value: allContentItems.length,           type: 'info' },
          ])}
          <p class="rpt-section-title">Contenidos trabajados</p>
          ${contentChips(allContentItems)}
          <p class="rpt-section-title">Observaciones institucionales</p>
          <div class="rpt-obs">
            ${topObs.map(o => obsBlock(o.type, o.label, o.text)).join('')}
          </div>
          <p class="rpt-section-title">Cronograma de sesiones</p>
          <div class="session-grid">${sessionCards}</div>
          ${footer(1, 3, `${monthName(month)} ${year}`)}
        </div>
      `

      // ---- PAGE 2 — Individual profiles ----
      const cols = alumnos.length > 12 ? 'cols-4' : 'cols-3'
      const attMap = buildAlumnoAttMap(sesiones)

      // Group justifications by alumno
      const justByAlumno = {}
      justificaciones.forEach(j => {
        if (!justByAlumno[j.alumno_id]) justByAlumno[j.alumno_id] = []
        justByAlumno[j.alumno_id].push(j)
      })

      // Group progresos by alumno
      const progByAlumno = {}
      progresos.forEach(p => {
        if (!progByAlumno[p.alumno_id]) progByAlumno[p.alumno_id] = []
        progByAlumno[p.alumno_id].push(p)
      })

      const profileCards = alumnos.map(al => {
        const alumAtt = attMap[al.id] || {}
        let aP = 0, aA = 0, aJ = 0
        sesiones.forEach(s => {
          const est = alumAtt[s.id]
          if (est === 'P') aP++; if (est === 'A') aA++; if (est === 'J') aJ++
        })
        const total = sesiones.length

        // Badge
        const attPct = pct(aP, total)
        let badge, badgeClass
        if (attPct >= 90 && (progByAlumno[al.id]?.some(p => p.tipo === 'LOGRADO'))) {
          badge = 'Destacado'; badgeClass = 'badge-destacado'
        } else if (attPct < 60) {
          badge = 'En Riesgo'; badgeClass = 'badge-riesgo'
        } else if (attPct >= 75) {
          badge = 'Estable'; badgeClass = 'badge-estable'
        } else {
          badge = 'En Mejora'; badgeClass = 'badge-mejora'
        }

        // Initials
        const names = al.nombre_completo.split(' ')
        const initials = esc((names[0]?.[0] ?? '') + (names[2]?.[0] ?? names[1]?.[0] ?? ''))

        // Justifications section
        const justs = justByAlumno[al.id] || []
        const justSection = justs.length > 0 ? `
          <div class="pc-section">
            <div class="pc-section-title">Justificaciones</div>
            ${justs.slice(0, 4).map(j =>
              `<div class="pc-just-item" style="font-size:6pt">${esc(j.motivo || j.tipo)} — ${esc(formatDate(j.fecha))}</div>`
            ).join('')}
          </div>
        ` : ''

        // Progress section
        const progs = progByAlumno[al.id] || []
        const progSection = progs.length > 0 ? `
          <div class="pc-section">
            <div class="pc-section-title">Progreso</div>
            ${progs.slice(0, 3).map(p => {
              const label = p.curriculo_objetivos?.descripcion || p.contenido_dsl || 'Objetivo'
              const pctVal = p.tipo === 'LOGRADO' ? 100 : p.tipo === 'EN_PROGRESO' ? 60 : 30
              return progressBar(p.tipo, label.slice(0, 28), pctVal)
            }).join('')}
          </div>
        ` : `<div class="pc-section" style="color:var(--ink3);font-size:6pt">Sin registros de progreso este mes</div>`

        return `
          <div class="profile-card">
            <div class="pc-head">
              <div class="pc-avatar">${initials}</div>
              <div>
                <div class="pc-name">${esc(al.nombre_corto || al.nombre_completo)}</div>
                <span class="pc-badge ${badgeClass}">${esc(badge)}</span>
              </div>
            </div>
            <div class="pc-section">
              <div class="pc-section-title">Asistencia</div>
              <div class="pc-row"><span>Presentes:</span><span><strong>${aP}</strong> de ${total}</span></div>
              <div class="pc-row"><span>Ausentes:</span><span><strong>${aA}</strong></span></div>
              <div class="pc-row"><span>Justificados:</span><span><strong>${aJ}</strong></span></div>
            </div>
            ${justSection}
            ${progSection}
          </div>
        `
      }).join('')

      const p2 = `
        <div class="page land">
          ${header(headerData)}
          <p class="rpt-section-title">Perfiles individuales</p>
          <div class="profile-grid ${cols}">${profileCards}</div>
          ${footer(2, 3, `${monthName(month)} ${year}`)}
        </div>
      `

      // ---- PAGE 3 — Comparativa + Groq patterns + Recommendations ----
      // Fetch Groq analysis (graceful fallback if unavailable)
      const groqContext = {
        clase: clase.nombre,
        docente: clase.maestros?.nombre_completo ?? 'Docente',
        mes: `${monthName(month)} ${year}`,
        totalAlumnos: alumnos.length
      }
      const groqData = await generateMonthlyPatterns(sesiones, progresos, groqContext)

      const dP = (() => {
        const c = pct(totalP, grandTotal), p = pct(prevP, prevTotal || 1)
        const d = c - p
        return { cur: c, prev: p, diff: d, label: `${d > 0 ? '+' : ''}${d}%`, cls: d >= 0 ? 'delta-up' : 'delta-down' }
      })()
      const dA = (() => {
        const c = pct(totalA, grandTotal), p = pct(prevA, prevTotal || 1)
        const d = c - p
        return { cur: c, prev: p, diff: d, label: `${d > 0 ? '+' : ''}${d}%`, cls: d < 0 ? 'delta-up' : 'delta-down' }
      })()

      const prevContentCount = prevSesiones.length * 2 // approximate
      const curContentCount  = allContentItems.length

      const comparativa = `
        <div style="display:grid;grid-template-columns:60% 40%;gap:6mm">
          <div>
            <p class="rpt-section-title">Comparativa estadística</p>
            ${compBar('Presentes', dP, 'bar-ok')}
            ${compBar('Ausentes',  dA, 'bar-bad')}
            <div style="margin-top:4px">
              <table class="rpt-table" style="font-size:7pt">
                <thead><tr>
                  <th>Indicador</th>
                  <th>${monthName(prevMonth)} ${prevYear}</th>
                  <th>${monthName(month)} ${year}</th>
                  <th>Δ</th>
                </tr></thead>
                <tbody>
                  <tr><td>Contenidos cubiertos</td><td>${prevContentCount}</td><td>${curContentCount}</td>
                      <td class="${curContentCount >= prevContentCount ? 'delta-up' : 'delta-down'}" style="font-weight:700">
                        ${curContentCount >= prevContentCount ? '+' : ''}${curContentCount - prevContentCount}
                      </td></tr>
                  <tr><td>Logros individuales</td>
                      <td>${prevSesiones.length > 0 ? '—' : '0'}</td>
                      <td>${progresos.filter(p => p.tipo === 'LOGRADO').length}</td>
                      <td class="delta-up" style="font-weight:700">${progresos.filter(p => p.tipo === 'LOGRADO').length}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div>
            <p class="rpt-section-title">Patrones detectados</p>
            ${groqData.patrones.positivos.length > 0 ? `
              <div style="margin-bottom:4px">
                <div style="font-size:6.5pt;font-weight:700;color:var(--ok);margin-bottom:2px">✅ Positivos</div>
                ${groqData.patrones.positivos.map(p => `<div style="font-size:7pt;margin-bottom:2px">• ${esc(p)}</div>`).join('')}
              </div>
            ` : ''}
            ${groqData.patrones.atencion.length > 0 ? `
              <div>
                <div style="font-size:6.5pt;font-weight:700;color:var(--warn);margin-bottom:2px">⚠️ Atención requerida</div>
                ${groqData.patrones.atencion.map(p => `<div style="font-size:7pt;margin-bottom:2px">• ${esc(p)}</div>`).join('')}
              </div>
            ` : ''}
            ${(!groqData.patrones.positivos.length && !groqData.patrones.atencion.length)
              ? `<div style="font-size:7pt;color:var(--ink3)">(Análisis no disponible)</div>`
              : ''}
          </div>
        </div>
      `

      const recos = groqData.recomendaciones
      const recosHtml = `
        <p class="rpt-section-title" style="margin-top:4mm">Recomendaciones institucionales</p>
        <div class="reco-grid">
          <div class="reco-card">
            <div class="reco-title">📚 Académico</div>
            <div>${esc(recos.academico || '(Sin datos suficientes)')}</div>
          </div>
          <div class="reco-card">
            <div class="reco-title">📋 Logística</div>
            <div>${esc(recos.logistica || '(Sin datos suficientes)')}</div>
          </div>
          <div class="reco-card">
            <div class="reco-title">⭐ Talentos</div>
            <div>${esc(recos.talentos || '(Sin datos suficientes)')}</div>
          </div>
          <div class="reco-card">
            <div class="reco-title">🎯 Refuerzo</div>
            <div>${esc(recos.refuerzo || '(Sin datos suficientes)')}</div>
          </div>
        </div>
      `

      const notaDir = groqData.notaDireccion ? `
        <div class="nota-dir">
          <div class="nota-title">📝 Nota para Dirección Ejecutiva</div>
          <div>${esc(groqData.notaDireccion)}</div>
        </div>
      ` : ''

      const p3 = `
        <div class="page land">
          ${header(headerData)}
          ${comparativa}
          ${recosHtml}
          ${notaDir}
          ${footer(3, 3, `${monthName(month)} ${year}`)}
        </div>
      `

      const html = wrapDocument(p1 + p2 + p3, true)
      const opened = openReport(html)
      if (!opened) {
        AppToast.warn('El navegador bloqueó la ventana emergente. Permite las ventanas emergentes e intenta de nuevo.')
      }

    } catch (err) {
      console.error('[reportService] generateMonthlyPedagogical:', err)
      AppToast.error('Error al generar el informe pedagógico: ' + err.message)
    }
  }
  ```

- [ ] **Step 2: Commit**

  ```bash
  git add src/portal-maestros/services/reportService.js
  git commit -m "feat(reports): add generateMonthlyPedagogical (Doc 3, 3-page landscape)"
  ```

---

## Task 7: Wire buttons in `asistenciaView.js`

**Files:**
- Modify: `src/portal-maestros/views/asistenciaView.js`

> **Read the file first.** Find where `sesionId` is available (around line 119–127) and where buttons are rendered in the toolbar/footer area. Also look for the existing "Informe" or "Reporte" buttons if any.

- [ ] **Step 1: Add the import at the top of `asistenciaView.js`**

  After the existing imports block (look for the last `import` line), add:

  ```js
  import { generateDailyReport, generateMonthlyAttendance } from '../services/reportService.js'
  ```

- [ ] **Step 2: Find the actions section in the view and add the two report buttons**

  Locate where the view's action buttons are rendered (search for existing button elements in the render/init function). Add the two report buttons in a logical location — after the session close area or in an "acciones" toolbar:

  ```js
  // Inside the function where action buttons are built:
  // sesionId and claseId must be in scope at this point

  // "📄 Reporte del día" — only if a sesionId exists (session saved)
  if (sesionId) {
    const btnReporteD = document.createElement('button')
    btnReporteD.className = 'btn btn-secondary btn-sm'
    btnReporteD.innerHTML = '📄 Reporte del día'
    btnReporteD.title = 'Genera el Reporte Diario de Asistencia (PDF)'
    btnReporteD.addEventListener('click', async () => {
      btnReporteD.disabled = true
      btnReporteD.innerHTML = '⏳ Generando...'
      await generateDailyReport(sesionId)
      btnReporteD.disabled = false
      btnReporteD.innerHTML = '📄 Reporte del día'
    })
    // Append to existing actions container — adjust selector to match the actual container
    actionsContainer.appendChild(btnReporteD)
  }

  // "📊 Resumen del mes" — available when claseId is known
  if (claseId) {
    const btnResumenM = document.createElement('button')
    btnResumenM.className = 'btn btn-secondary btn-sm'
    btnResumenM.innerHTML = '📊 Resumen del mes'
    btnResumenM.title = 'Genera el Resumen Mensual de Asistencia (PDF)'
    const now = new Date()
    btnResumenM.addEventListener('click', async () => {
      btnResumenM.disabled = true
      btnResumenM.innerHTML = '⏳ Generando...'
      await generateMonthlyAttendance(claseId, now.getFullYear(), now.getMonth() + 1)
      btnResumenM.disabled = false
      btnResumenM.innerHTML = '📊 Resumen del mes'
    })
    actionsContainer.appendChild(btnResumenM)
  }
  ```

  > **Note for executor:** The exact variable names (`sesionId`, `claseId`, `actionsContainer`) must match what is used in `asistenciaView.js`. Read the file to confirm variable names and the correct place to inject these buttons. The code pattern above is the template — adapt it to fit the existing code style.

- [ ] **Step 3: Commit**

  ```bash
  git add src/portal-maestros/views/asistenciaView.js
  git commit -m "feat(reports): wire Reporte del día and Resumen del mes buttons in asistenciaView"
  ```

---

## Task 8: Wire button in `reportesView.js`

**Files:**
- Modify: `src/portal-maestros/views/reportesView.js`

> **Read the file first.** Find where `claseId` is resolved (or inherited from router state) and where the existing informe button is rendered (around line 718 based on grep — it already shows `AppToast.error('Error al generar informe')`).

- [ ] **Step 1: Add import to `reportesView.js`**

  ```js
  import { generateMonthlyPedagogical } from '../services/reportService.js'
  ```

- [ ] **Step 2: Find the existing informe button and replace or extend its click handler**

  Look for the existing "informe" button (line ~718). Add or replace with:

  ```js
  // Locate the existing informe button or add a new one in the reports section
  const btnInformePed = document.createElement('button')
  btnInformePed.className = 'btn btn-primary'
  btnInformePed.innerHTML = '🎓 Informe pedagógico'
  btnInformePed.title = 'Genera el Informe Mensual Pedagógico (3 páginas, PDF)'

  const now = new Date()
  btnInformePed.addEventListener('click', async () => {
    btnInformePed.disabled = true
    btnInformePed.innerHTML = '⏳ Generando informe...'
    await generateMonthlyPedagogical(claseId, now.getFullYear(), now.getMonth() + 1)
    btnInformePed.disabled = false
    btnInformePed.innerHTML = '🎓 Informe pedagógico'
  })
  // Append to the appropriate container
  reportsContainer.appendChild(btnInformePed)
  ```

  > **Note for executor:** Adapt variable names and container references to match the actual `reportesView.js` code. Read the file before editing.

- [ ] **Step 3: Commit**

  ```bash
  git add src/portal-maestros/views/reportesView.js
  git commit -m "feat(reports): wire Informe pedagógico button in reportesView"
  ```

---

## Task 9: Manual smoke test checklist

No automated test covers end-to-end PDF rendering. The executor should verify each document manually:

- [ ] **Doc 1 — Daily Attendance Report**
  1. Open the portal as a teacher, navigate to a class with a saved session.
  2. Click "📄 Reporte del día".
  3. Verify: new window opens, print dialog appears.
  4. Verify in the print preview: compact header with ESP circle (or logo), 3 metric chips, attendance table with P/A/J cells, content chips, footer with departmental route.
  5. Verify: no "T" or "L" state cells appear anywhere.

- [ ] **Doc 2 — Monthly Attendance Summary**
  1. Click "📊 Resumen del mes".
  2. Verify: new window opens with print dialog.
  3. Verify in the print preview: header, 4 metric chips, alumno × sessions table with colored cells, footer.
  4. If justifications exist: verify page 2 shows detail table and comparison bars.
  5. Test with a class >18 alumnos: verify landscape orientation.

- [ ] **Doc 3 — Monthly Pedagogical Report**
  1. Navigate to `reportesView`, click "🎓 Informe pedagógico".
  2. Verify: new window opens (may take a moment — Groq call).
  3. Verify: 3 pages landscape.
  4. Page 1: 6 chips, content chips, 2×2 obs grid, session cards.
  5. Page 2: profile cards grid (3 or 4 columns), badges, attendance counts, progress bars.
  6. Page 3: comparison section, patterns, 4 recommendation cards, nota dirección.
  7. Groq failure simulation: disconnect network, generate again. Verify "(Análisis no disponible)" appears gracefully.

- [ ] **Popup blocked test**
  1. Block popups for the site in browser settings.
  2. Click any report button.
  3. Verify: AppToast.warn appears with popup instruction message.

- [ ] **Commit smoke test results (no code change needed — just note pass/fail)**

---

## Self-Review Notes

**Spec coverage check:**
- ✅ Doc 1 layout: header + chips + attendance table + content chips + obs blocks + footer
- ✅ Doc 2 layout: header + 4 metrics + daily table + justifications + comparativa
- ✅ Doc 3: 3 pages landscape, 6 chips (p1), profile cards with counts+justifications+progress (p2), comparativa+patterns+recs+notaDir (p3)
- ✅ P/A/J only — no T, no L
- ✅ Auto-landscape triggers from spec implemented
- ✅ Logo base64 path — placeholder with fallback
- ✅ Groq graceful fallback returns empty arrays/strings
- ✅ Popup blocked → AppToast.warn
- ✅ No sessions → AppToast.error
- ✅ `esc()` wraps all dynamic values
- ✅ Badge colors: Destacado=teal, Mejora=blue, Estable=gray, Riesgo=red
- ✅ Departmental route in footer of all 3 docs

**Type consistency check:**
- `calcAttendanceStats(arr)` → `{ P, A, J, total }` — used consistently
- `buildAlumnoAttMap(sesiones)` → `{ [alumnoId]: { [sesionId]: estado } }` — used consistently
- `openReport(html)` → `boolean` — checked at call sites
- `generateMonthlyPatterns()` returns `{ patrones, recomendaciones, notaDireccion }` — destructured consistently

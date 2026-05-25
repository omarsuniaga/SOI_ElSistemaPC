# Institutional Reports — Design Spec

**Date:** 2026-05-25
**Feature:** Three institutional PDF documents for El Sistema Punta Cana

---

## Goal

Generate three print-ready HTML documents (saved as PDF via `window.print()`) from live Supabase data:

1. **Daily Attendance Report** — closed per session, 1 page
2. **Monthly Attendance Summary** — administrative, 1–2 pages
3. **Monthly Pedagogical Report** — high-value, 3 pages for Dirección

---

## Design Decisions (approved)

| Decision | Value |
|----------|-------|
| Page format | Letter 216×279mm (carta) |
| Orientation | Portrait base; auto-landscape when data requires it |
| Header style | Compact (C) — ESP circle + title + integrated data bar |
| Color palette | Navy `#1e3a5f` + Teal `#0e7490`; Green/Red for states |
| Logo | Base64-encoded PNG embedded in HTML (no external dependency) |
| Departmental route | Docente → Coord. Académica → Coord. Administrativa → Dirección Ejecutiva |

---

## Architecture

```
reportService.js                  ← one service, three generator functions
  generateDailyReport(sesionId)
  generateMonthlyAttendance(claseId, year, month)
  generateMonthlyPedagogical(claseId, year, month)

Each function:
  1. Queries Supabase for required data
  2. Calls groqService for AI sections (Doc 3 only)
  3. Builds HTML string using shared template helpers
  4. Opens in new tab → teacher prints / saves as PDF

reportTemplates.js                ← shared HTML building blocks
  header(data)                    ← compact cabecera C style
  footer(pageNum, total)          ← ruta departamental + firma lines
  metricChips(metrics)            ← 4–6 KPI chips
  attendanceCell(code)            ← P/A/J/T/L colored cell
  progressBar(estado, pct)        ← LOGRADO/EN_PROGRESO/INICIADO bar
  obsBlock(type, label, text)     ← pos/neg/neu/inf observation block
  esc(str)                        ← XSS helper for all dynamic text
```

### Logo embedding

The logo PNG (`plantilla_reporte_clase_mensual_soi.html` uses it externally).
`reportService.js` imports `LOGO_BASE64` from `reportAssets.js` — a one-time
conversion of the logo PNG to a base64 data URI. This ensures the PDF works
offline and prints correctly without path resolution issues.

**Logo file to convert:** User provides PNG — store as `src/portal-maestros/assets/logo-esp.png`
and the build step (or a one-time script) generates `reportAssets.js`.

For the initial implementation, use the text fallback (ESP circle) if the base64 asset
is not yet available — the header gracefully degrades.

---

## File Map

| File | Status | Responsibility |
|------|--------|----------------|
| `src/portal-maestros/services/reportService.js` | **Create** | Three generator functions + Supabase queries |
| `src/portal-maestros/services/reportTemplates.js` | **Create** | Shared HTML building blocks + CSS string |
| `src/portal-maestros/assets/logo-esp.png` | **Create** | Logo PNG (copy from user-provided file) |
| `src/portal-maestros/services/reportAssets.js` | **Create** | `export const LOGO_BASE64 = 'data:image/png;base64,...'` |
| `src/portal-maestros/views/asistenciaView.js` | **Modify** | Add "📄 Reporte del día" + "📊 Resumen del mes" buttons |
| `src/portal-maestros/views/reportesView.js` | **Modify** | Add "🎓 Informe pedagógico" button (already exists) |

---

## 1. Shared CSS & Template Helpers (`reportTemplates.js`)

### CSS variables
```css
--navy: #1e3a5f;
--teal: #0e7490;
--teal2: #ecfeff;
--gold: #d4af37;
--ok: #1f6e3e; --ok2: #e7f5ec;
--bad: #a31b1b; --bad2: #fde8e8;
--warn: #a35c00; --warn2: #fef6e8;
--info: #0e7490; --info2: #ecfeff;
--ink: #1a1d29; --ink2: #3d4152; --ink3: #6b7085;
--border: #d5d8e3;
```

### Page dimensions
```css
/* Portrait */
.page { width: 216mm; min-height: 279mm; padding: 10mm 12mm 14mm; }
/* Landscape */
.page.land { width: 279mm; min-height: 216mm; padding: 8mm 10mm 12mm; }
```

### Compact header (style C)
```html
<header class="rpt-header">
  <div class="rpt-header-top">
    <div class="rpt-logo-area">
      <div class="rpt-esp-circle">ESP</div>  <!-- or <img> with base64 -->
      <div class="rpt-inst-name">
        <strong>El Sistema Punta Cana</strong>
        <span>República Dominicana · Departamento Académico</span>
      </div>
    </div>
    <div class="rpt-doc-tag">{DOCUMENT TYPE} {MONTH YEAR}</div>
  </div>
  <div class="rpt-header-bar">
    <!-- data items: Grupo · Docente · Período · [extra fields] -->
  </div>
</header>
```

### Footer with departmental route
```html
<footer class="rpt-footer">
  <div class="rpt-route">
    Generado por SOI &nbsp;·&nbsp;
    Docente → Coord. Académica → Coord. Administrativa → Dirección Ejecutiva
  </div>
  <div class="rpt-meta">Pág {N} / {TOTAL} &nbsp;·&nbsp; {DATE}</div>
  <div class="rpt-sigs">
    <div class="rpt-sig-line"><div class="line"></div><span>Firma Docente</span></div>
    <div class="rpt-sig-line"><div class="line"></div><span>Firma Dirección</span></div>
  </div>
</footer>
```

---

## 2. Doc 1 — Daily Attendance Report

### Trigger
Button "📄 Reporte del día" inside `asistenciaView.js`, visible only when a session
is active (sesionId exists and session is closed/saved).

### Data query
```js
// sesiones_clase row with asistencia JSON
const { data: sesion } = await supabase
  .from('sesiones_clase')
  .select(`
    id, fecha, numero_sesion, tipo_sesion,
    clases ( nombre, instrumento, maestros ( nombre_completo ) ),
    asistencia
  `)
  .eq('id', sesionId)
  .single()

// observaciones for this session
const { data: obs } = await supabase
  .from('observaciones_sesion')
  .select('contenido_ia_dsl, contenido_dsl')
  .eq('sesion_clase_id', sesionId)
  .single()

// alumnos of the class (ordered)
const { data: alumnos } = await supabase
  .from('alumnos')
  .select('id, nombre_completo, nombre_corto')
  .eq('clase_id', sesion.clases.id)
  .order('nombre_completo')
```

### Layout (1 page portrait, auto-landscape if >20 alumnos)
```
┌─ CABECERA COMPACTA ──────────────────────────────────────────────────┐
│ ESP  El Sistema Punta Cana · Dpto. Académico    [REPORTE DIARIO]     │
│ Clase: Violín Intermedio B · Docente: Vargas · Ses. #5 · 15/05/2026 │
└──────────────────────────────────────────────────────────────────────┘
┌─ MÉTRICAS (4 chips) ─────────────────────────────────────────────────┐
│  ✓ 11 Presentes   ✗ 1 Ausente   📋 0 Justificados                    │
└──────────────────────────────────────────────────────────────────────┘
┌─ REGISTRO DE ASISTENCIA ─────────────────────────────────────────────┐
│  #   Alumno                     Estado   Observación                 │
│  1   García Torres, Isabella    [P]                                  │
│  2   Domínguez Cruz, Santiago   [A]      Sin comunicación previa     │
│  ...                                                                 │
└──────────────────────────────────────────────────────────────────────┘
┌─ CONTENIDO DE LA SESIÓN ─────────────────────────────────────────────┐
│  [Arco Parabólico]  [Sol Mayor 2 oct]  {Practicar escala diario}     │
└──────────────────────────────────────────────────────────────────────┘
┌─ OBSERVACIONES ──────────────────────────────────────────────────────┐
│  ✅ Destacado: Isabella ejecutó Sol Mayor con 4.8/5                  │
│  ⚠️  Alerta: Santiago 3ra ausencia consecutiva                       │
└──────────────────────────────────────────────────────────────────────┘
┌─ PIE ────────────────────────────────────────────────────────────────┐
│  Ruta · Pág 1/1 · Fecha · Firma Docente                              │
└──────────────────────────────────────────────────────────────────────┘
```

### Attendance state colors
- P (Presente) → `#e7f5ec` / `#1f6e3e`
- A (Ausente) → `#fde8e8` / `#a31b1b`
- J (Justificado — includes medical licenses, family permits, institutional events) → `#fef6e8` / `#a35c00`

**Note:** Only 3 states: P · A · J. T (Tardanza) and L (Licencia) are not recorded
in `asistenciaView.js` and therefore do not exist in the data. Do not render them.

---

## 3. Doc 2 — Monthly Attendance Summary

### Trigger
Button "📊 Resumen del mes" in `asistenciaView.js`. Parameters: `claseId` + current month/year.

### Data query
```js
// All sessions of the class in the month
const { data: sesiones } = await supabase
  .from('sesiones_clase')
  .select('id, fecha, numero_sesion, asistencia')
  .eq('clase_id', claseId)
  .gte('fecha', `${year}-${mm}-01`)
  .lte('fecha', `${year}-${mm}-${lastDay}`)
  .order('fecha')

// Justifications
const { data: justificaciones } = await supabase
  .from('justificaciones')
  .select('alumno_id, fecha, tipo, motivo, alumnos(nombre_completo)')
  .eq('clase_id', claseId)
  .gte('fecha', `${year}-${mm}-01`)
  .lte('fecha', `${year}-${mm}-${lastDay}`)

// Previous month sessions (for comparison)
const { data: prevSesiones } = await supabase
  .from('sesiones_clase')
  .select('id, fecha, asistencia')
  .eq('clase_id', claseId)
  .gte('fecha', prevMonthStart)
  .lte('fecha', prevMonthEnd)
```

### Layout
**Portrait if ≤18 alumnos AND ≤16 sesiones. Landscape otherwise.**

```
PÁG 1
┌─ CABECERA ───────────────────────────────────────────────────────────┐
│ ESP · El Sistema Punta Cana   Clase · Docente · Período · Días háb. │
└──────────────────────────────────────────────────────────────────────┘
┌─ RESUMEN (4 métricas grandes) ───────────────────────────────────────┐
│  142 Presentes (89%)   9 Ausentes (6%)   5 Justificados (3%)        │
└──────────────────────────────────────────────────────────────────────┘
┌─ TABLA DIARIA: Alumno × Sesiones del mes ────────────────────────────┐
│  #   Alumno              S1  S2  S3 ... S8   P   A   J              │
│  1   García, Isabella    P   P   P  ... P   8   0   0               │
│  2   Domínguez, Santiago A   A   A  ... P   5   3   0               │
│  ...                                                                 │
│  TOTALES                                 89  4   5                  │
└──────────────────────────────────────────────────────────────────────┘
┌─ PIE PÁG 1 ──────────────────────────────────────────────────────────┘

PÁG 2 (si hace falta)
┌─ CABECERA ───────────────────────────────────────────────────────────┐
┌─ JUSTIFICACIONES DETALLADAS ─────────────────────────────────────────┐
│  #   Alumno               Fecha    Tipo         Motivo               │
│  1   Fernández, Emiliano  14/05    Justificado  Consulta médica      │
└──────────────────────────────────────────────────────────────────────┘
┌─ COMPARATIVA vs MES ANTERIOR ────────────────────────────────────────┐
│  Presentes: ████████ 82% → ████████████ 89%  ↑ +7%                  │
│  Ausentes:  ████ 14%     → ██ 5%             ↓ -9%                  │
└──────────────────────────────────────────────────────────────────────┘
┌─ PIE PÁG 2 ──────────────────────────────────────────────────────────┘
```

**Auto-landscape trigger:** `if (alumnos.length > 18 || sesiones.length > 16) useLandscape()`

**Attendance states in all documents: P · A · J (3 states only — no T, no L)**

---

## 4. Doc 3 — Monthly Pedagogical Report

### Trigger
Button "🎓 Informe pedagógico" in `reportesView.js`. Always landscape, always 3 pages.

### Data queries
```js
// Page 1 data
sesiones (with asistencia + observaciones_sesion)
progresos (contenido_dsl, tipo — distinct list for "contenidos trabajados")

// Page 2 data
alumnos (with their progresos for the month)
curriculo_objetivos (linked via progresos.objetivo_id)

// Page 3 data (AI-generated sections)
groqService.generateMonthlyPatterns(sesiones, progresos, context)
→ returns { patrones: { positivos[], atencion[] }, recomendaciones: { academico, logistica, talentos, refuerzo }, notaDireccion }
```

### Page 1 layout (landscape)
```
┌─ CABECERA COMPACTA ──────────────────────────────────────────────────┐
┌─ MÉTRICAS (6 chips) ─────────────────────────────────────────────────┐
│  8 Sesiones   89% Presentes   4 Ausencias   14 Contenidos   23 Obs  │
└──────────────────────────────────────────────────────────────────────┘
┌─ CONTENIDOS TRABAJADOS ──────────────────────────────────────────────┐
│  [Arco Parabólico tc] [Sol Mayor es] [Allegretto ob] [Compás 3/4 th]│
└──────────────────────────────────────────────────────────────────────┘
┌─ OBSERVACIONES INSTITUCIONALES (2×2 grid) ───────────────────────────┐
│  ✅ Destacado Académico   ⛔ Alerta Asistencia                       │
│  📋 Novedad Administrativa  📝 Nota Pedagógica                       │
└──────────────────────────────────────────────────────────────────────┘
┌─ CRONOGRAMA DE SESIONES (2-col grid) ────────────────────────────────┐
│  [S1 02/05 | Contenidos | P:11 A:1 J:0 | Normal]                    │
│  [S2 06/05 | Contenidos | P:10 A:1 J:1 | Normal]  ...               │
└──────────────────────────────────────────────────────────────────────┘
```

### Page 2 layout (landscape, 3-col grid → 4-col if >12 alumnos)
```
┌─ CABECERA ───────────────────────────────────────────────────────────┐
┌─ PERFILES INDIVIDUALES (3 columnas) ─────────────────────────────────┐
│ ┌────────────────────────┐ ┌────────────────────────┐ ┌──────────────┐
│ │ IG  Isabella G. Torres │ │ SD  Santiago D. Cruz   │ │ ...          │
│ │     [Destacada]        │ │     [En Riesgo]        │ │              │
│ ├────────────────────────┤ ├────────────────────────┤ │              │
│ │ ASISTENCIA             │ │ ASISTENCIA             │ │              │
│ │ Presentes:    8 de 8   │ │ Presentes:    5 de 8   │ │              │
│ │ Ausentes:     0        │ │ Ausentes:     3        │ │              │
│ │ Justificados: 0        │ │ Justificados: 0        │ │              │
│ ├────────────────────────┤ ├────────────────────────┤ │              │
│ │ (sin justificaciones)  │ │ JUSTIFICACIONES        │ │              │
│ │                        │ │ • Transporte — 02/05   │ │              │
│ │                        │ │ • Transporte — 06/05   │ │              │
│ │                        │ │ • Sin aviso   — 08/05  │ │              │
│ ├────────────────────────┤ ├────────────────────────┤ │              │
│ │ PROGRESO               │ │ PROGRESO               │ │              │
│ │ ▓▓▓ LOGRADO Sol Mayor  │ │ ▓▓░ INICIADO Allegretto│ │              │
│ │ ▓▓░ EN PROG. Allegretto│ │ ▓░░ INICIADO Compás 3/4│ │              │
│ ├────────────────────────┤ ├────────────────────────┤ │              │
│ │ Liderazgo notable en   │ │ ⚠️ Requiere refuerzo   │ │              │
│ │ ensayos grupales.      │ │ de contenidos perdidos.│ │              │
│ └────────────────────────┘ └────────────────────────┘ └──────────────┘
└──────────────────────────────────────────────────────────────────────┘
```

**Card rules:**
- Justificaciones section only renders if alumno has J records — omitted otherwise
- If alumno has 0 progreso records → show "Sin registros de progreso este mes"
- Badge color: Destacado=teal, En Mejora=blue, Estable=gray, En Riesgo=red

**Badge colors:**
- Destacado → teal `#0e7490`
- En Mejora → `#1d4ed8`
- Estable → `#6c757d`
- En Riesgo → `#a31b1b`

**Progress bar states:**
- LOGRADO → green fill 100%
- EN_PROGRESO → teal fill variable %
- INICIADO → gray fill variable %

### Page 3 layout (landscape)
```
┌─ CABECERA ───────────────────────────────────────────────────────────┐
┌── 60% ─────────────────────────────┬── 40% ──────────────────────────┐
│ COMPARATIVA ESTADÍSTICA            │ PATRONES DETECTADOS (Groq)      │
│ Presentes: prev ░░ cur ████ +7%   │ ✅ Positivos:                   │
│ Ausentes:  prev ██ cur ░ -9%      │   • Mejora colectiva afinación  │
│                                   │   • Mayor individualización     │
│ PROGRESO PEDAGÓGICO (tabla)       │ ⚠️ Atención Requerida:          │
│ Contenidos | Abr | May | Δ        │   • Santiago: 3 ausencias       │
│ Cubiertos  |  12 |  14 | +2 ✓    │   • Emiliano estancado vibrato  │
│ Logros ind.|   8 |  15 | +7 ✓    │                                  │
└────────────────────────────────────┴─────────────────────────────────┘
┌─ RECOMENDACIONES INSTITUCIONALES (4 bloques) ────────────────────────┐
│  📢 Académico   📢 Logística   📢 Talentos   📢 Refuerzo             │
└──────────────────────────────────────────────────────────────────────┘
┌─ NOTA PARA DIRECCIÓN EJECUTIVA (Groq) ───────────────────────────────┐
│  Texto generado por IA basado en el análisis del mes                 │
└──────────────────────────────────────────────────────────────────────┘
┌─ PIE PÁG 3/3 · Firmas Docente + Dirección ───────────────────────────┘
```

### Groq prompt for Doc 3 (Spanish neutro)
New function in `groqService.js`: `generateMonthlyPatterns(sesiones, progresos, context)`
- Temperature: 0.3
- Returns: `{ patrones: { positivos[], atencion[] }, recomendaciones: { academico, logistica, talentos, refuerzo }, notaDireccion }`

---

## 5. Error States

| Condition | Behavior |
|-----------|----------|
| No sessions in period | AppToast.error "No hay sesiones registradas para este período" |
| No alumnos data | Show empty state in table with placeholder row |
| Groq unavailable (Doc 3) | Render report without AI sections; show "(Análisis no disponible)" |
| Print popup blocked | AppToast.warn with instruction to allow popups |

---

## 6. Generation Flow (all 3 docs)

```js
// 1. Button click → show loading state
// 2. Query Supabase (parallel where possible)
// 3. Build HTML string via reportTemplates
// 4. Open new window
// 5. Write HTML to window.document
// 6. window.print() after short delay (fonts load)
// 7. Close loading state
```

No server-side rendering. No external PDF library. Pure `window.print()` → browser PDF dialog.

---

## Out of Scope

- Email delivery of reports
- Report history / storage in DB
- Custom date range picker (uses current month by default)
- Multi-class batch generation
- Watermark on unsigned documents

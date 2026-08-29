/**
 * generarReporteHistoricoPagos.js
 *
 * Reporte "Histórico para pagos" por maestro. 100% ADITIVO — no modifica
 * comportamiento existente. Genera:
 *   - construirHtmlHistoricoPagos(data)  → string HTML completo (puro)
 *   - abrirReporteHistoricoPagos(data)   → visor en pestaña nueva + descarga .html
 *   - descargarPdfHistoricoPagos(data)   → PDF real vía jsPDF
 *   - resumirCumplimiento(fechas)        → totales/compliance (puro)
 *   - enumerarFechasEsperadas(horarios, desde, hasta) → fallback si el RPC no
 *     devuelve nada (mapea nombre de día en español -> weekday)
 *
 * El módulo se mantiene autocontenido (copia la lógica mínima de
 * wrapDocument/downloadReport en vez de acoplarse a portal-maestros).
 */

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const EMPTY = '—'
const BRAND_PRIMARY = [14, 116, 144]
const BRAND_NAVY = [30, 58, 95]

/* ------------------------------------------------------------------ helpers */

export function esc(str) {
  if (str == null) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function stripAccents(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
}

const DIA_A_WEEKDAY = {
  domingo: 0,
  lunes: 1,
  martes: 2,
  miercoles: 3,
  jueves: 4,
  viernes: 5,
  sabado: 6,
}

export function diaNombreAWeekday(dia) {
  const key = stripAccents(dia)
  return key in DIA_A_WEEKDAY ? DIA_A_WEEKDAY[key] : null
}

const WEEKDAY_A_DIA = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']

export function parseFechaLocal(value) {
  const raw = String(value ?? '').slice(0, 10)
  const [y, m, d] = raw.split('-').map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d)
}

function toISODate(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function nombreDia(fecha) {
  const date = parseFechaLocal(fecha)
  return date ? WEEKDAY_A_DIA[date.getDay()] : EMPTY
}

export function formatHora(time) {
  if (!time) return EMPTY
  return String(time).slice(0, 5)
}

export function formatFecha(fecha) {
  const date = parseFechaLocal(fecha)
  if (!date) return EMPTY
  return date
    .toLocaleDateString('es-DO', { day: '2-digit', month: 'short', year: 'numeric' })
    .replace(' de ', ' ')
}

function titleCase(value) {
  const v = String(value ?? '').trim()
  return v ? v.charAt(0).toUpperCase() + v.slice(1) : EMPTY
}

/* ---------------------------------------------------------- estado mapping */

const ESTADO_LABELS = {
  registrada: 'registrada',
  vencida: 'SIN REGISTRO',
  cubierta_emergente: 'cubierta emergente',
  futura: 'futura',
  pendiente: 'pendiente',
}

export function etiquetaEstado(estado) {
  return ESTADO_LABELS[stripAccents(estado).replace(/\s+/g, '_')] ?? String(estado ?? EMPTY)
}

/* ----------------------------------------------- enumerarFechasEsperadas */

/**
 * Enumera todas las fechas en el rango [desde, hasta] cuyo día de la semana
 * coincide con alguno de los horarios semanales. Solo se usa como fallback si
 * el RPC fn_estado_asistencia_maestro no devuelve filas.
 * NOTA: no descuenta periodo_excepciones (días no lectivos); el RPC sí.
 */
export function enumerarFechasEsperadas(horarios, desde, hasta) {
  const inicio = parseFechaLocal(desde)
  const fin = parseFechaLocal(hasta)
  if (!inicio || !fin || inicio > fin) return []

  const weekdays = new Map()
  for (const h of horarios || []) {
    const wd = diaNombreAWeekday(h.dia)
    if (wd == null) continue
    if (!weekdays.has(wd)) weekdays.set(wd, [])
    weekdays.get(wd).push(h)
  }
  if (weekdays.size === 0) return []

  const out = []
  const cursor = new Date(inicio.getTime())
  while (cursor <= fin) {
    const wd = cursor.getDay()
    if (weekdays.has(wd)) {
      for (const h of weekdays.get(wd)) {
        out.push({
          fecha: toISODate(cursor),
          dia: WEEKDAY_A_DIA[wd],
          clase_nombre: h.clase || h.clase_nombre || EMPTY,
          hora_inicio: h.hora_inicio || null,
          hora_fin: h.hora_fin || null,
          estado: 'pendiente',
          estadoLabel: 'pendiente',
          dias_atraso: 0,
          asistencia: { P: 0, A: 0, J: 0 },
          tema: '',
          observaciones: '',
          sesion_id: null,
        })
      }
    }
    cursor.setDate(cursor.getDate() + 1)
  }
  return out
}

/* ------------------------------------------------- resumirCumplimiento */

/**
 * @param {Array<{estado:string}>} fechas
 * @returns {{esperadas:number, registradas:number, sinRegistro:number,
 *            pendientes:number, futuras:number, cubiertas:number,
 *            pctCumplimiento:number}}
 */
export function resumirCumplimiento(fechas) {
  const list = Array.isArray(fechas) ? fechas : []
  let registradas = 0
  let sinRegistro = 0
  let pendientes = 0
  let futuras = 0
  let cubiertas = 0

  for (const f of list) {
    const key = stripAccents(f.estado).replace(/\s+/g, '_')
    if (key === 'registrada') registradas += 1
    else if (key === 'vencida' || key === 'sin_registro') sinRegistro += 1
    else if (key === 'cubierta_emergente') cubiertas += 1
    else if (key === 'futura') futuras += 1
    else pendientes += 1
  }

  const evaluables = registradas + cubiertas + sinRegistro
  const pctCumplimiento =
    evaluables > 0 ? Math.round(((registradas + cubiertas) / evaluables) * 1000) / 10 : 0

  return {
    esperadas: list.length,
    registradas,
    sinRegistro,
    pendientes,
    futuras,
    cubiertas,
    pctCumplimiento,
  }
}

/* ----------------------------------------------------------- HTML report */

const REPORT_CSS = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; color: #1a1d29; background: #fff; padding: 18px 22px; font-size: 12px; }
  h1 { font-size: 17px; color: #1e3a5f; }
  h2 { font-size: 13px; color: #0e7490; text-transform: uppercase; letter-spacing: .4px; border-bottom: 2px solid #0e7490; padding-bottom: 3px; margin: 18px 0 8px; }
  .brand { display:flex; align-items:center; gap:10px; border-bottom: 3px solid #0e7490; padding-bottom: 8px; }
  .brand .esp { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg,#1e3a5f,#2c5282); color:#fff; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:10px; }
  .meta { margin: 8px 0 4px; color:#3d4152; font-size: 11px; }
  .meta strong { color:#1e3a5f; }
  table { width: 100%; border-collapse: collapse; font-size: 10.5px; margin-bottom: 6px; }
  th { background:#1e3a5f; color:#fff; text-align:left; padding: 4px 6px; }
  td { padding: 4px 6px; border-bottom: 1px solid #d5d8e3; vertical-align: top; }
  tr:nth-child(even) td { background:#f8f9fc; }
  .chips { display:flex; flex-wrap:wrap; gap:6px; margin: 8px 0; }
  .chip { border:1px solid #d5d8e3; border-radius:5px; padding:5px 10px; text-align:center; min-width:60px; }
  .chip b { display:block; font-size:15px; }
  .est-registrada { color:#1f6e3e; font-weight:700; }
  .est-sinregistro { color:#a31b1b; font-weight:700; }
  .est-cubierta { color:#0e7490; font-weight:700; }
  .est-futura, .est-pendiente { color:#6b7085; }
  .sesion { border:1px solid #d5d8e3; border-left:3px solid #0e7490; border-radius:4px; padding:6px 9px; margin-bottom:6px; font-size:10.5px; white-space:pre-wrap; }
  .sesion .sh { font-weight:700; color:#1e3a5f; margin-bottom:3px; }
  .muted { color:#6b7085; }
  @media print { body { padding: 0; } h2 { page-break-after: avoid; } tr { page-break-inside: avoid; } }
`

function estadoClass(label) {
  const k = stripAccents(label).replace(/\s+/g, '')
  if (k === 'registrada') return 'est-registrada'
  if (k === 'sinregistro') return 'est-sinregistro'
  if (k === 'cubiertaemergente') return 'est-cubierta'
  if (k === 'futura') return 'est-futura'
  return 'est-pendiente'
}

/**
 * Documento HTML completo (puro, sin efectos secundarios).
 * @param {Object} data — salida de obtenerHistoricoPagos()
 * @returns {string}
 */
export function construirHtmlHistoricoPagos(data) {
  const d = data || {}
  const m = d.maestro || {}
  const rango = d.rango || {}
  const fechas = Array.isArray(d.fechas) ? d.fechas : []
  const resumen = d.resumen || resumirCumplimiento(fechas)
  const generadoEn = d.generadoEn || new Date().toISOString()

  const horarioRows =
    (d.horario || [])
      .map(
        (h) => `<tr>
          <td>${esc(titleCase(h.dia))}</td>
          <td>${esc(formatHora(h.hora_inicio))}</td>
          <td>${esc(formatHora(h.hora_fin))}</td>
          <td>${esc(h.clase || EMPTY)}</td>
          <td>${esc(h.salon || EMPTY)}</td>
        </tr>`,
      )
      .join('') || `<tr><td colspan="5" class="muted">Sin horario semanal registrado</td></tr>`

  const fechaRows =
    fechas
      .map((f) => {
        const label = f.estadoLabel || etiquetaEstado(f.estado)
        const a = f.asistencia || {}
        return `<tr>
          <td>${esc(formatFecha(f.fecha))}</td>
          <td>${esc(titleCase(f.dia || nombreDia(f.fecha)))}</td>
          <td class="${estadoClass(label)}">${esc(label)}</td>
          <td>${f.dias_atraso ? esc(f.dias_atraso) : ''}</td>
          <td>P:${esc(a.P ?? 0)} A:${esc(a.A ?? 0)} J:${esc(a.J ?? 0)}</td>
          <td>${esc(f.tema || '')}</td>
          <td>${esc(f.observaciones || '')}</td>
        </tr>`
      })
      .join('') || `<tr><td colspan="7" class="muted">Sin fechas esperadas en el rango</td></tr>`

  const sesionesHtml =
    (d.sesiones || [])
      .map((s) => {
        const a = s.asistencia || {}
        const partes = [
          s.tema_principal ? `Tema: ${s.tema_principal}` : '',
          s.contenido ? `\nContenido:\n${s.contenido}` : '',
          s.observaciones_generales ? `\nObservaciones:\n${s.observaciones_generales}` : '',
          s.observaciones_raw ? `\nObservaciones (bitácora):\n${s.observaciones_raw}` : '',
        ]
          .filter(Boolean)
          .join('\n')
        return `<div class="sesion"><div class="sh">${esc(formatFecha(s.fecha))} · ${esc(
          s.clase_nombre || EMPTY,
        )} · P:${esc(a.P ?? 0)} A:${esc(a.A ?? 0)} J:${esc(a.J ?? 0)}</div>${esc(
          partes || 'Sin contenido registrado',
        )}</div>`
      })
      .join('') || `<p class="muted">Sin sesiones registradas con contenido en el rango.</p>`

  const justRows =
    (d.justificaciones || [])
      .map(
        (j) => `<tr>
          <td>${esc(j.alumno || EMPTY)}</td>
          <td>${esc(formatFecha(j.fecha))}</td>
          <td>${esc(j.motivo || EMPTY)}</td>
          <td>${esc(j.categoria || EMPTY)}</td>
          <td>${esc(j.estado || EMPTY)}</td>
          <td>${
            j.evidencia_url
              ? `<a href="${esc(j.evidencia_url)}">ver evidencia</a>`
              : '<span class="muted">—</span>'
          }</td>
        </tr>`,
      )
      .join('') ||
    `<tr><td colspan="6" class="muted">Sin justificaciones de alumnos en el rango.</td></tr>`

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Histórico para pagos — ${esc(m.nombre_completo || 'Maestro')}</title>
<style>${REPORT_CSS}</style>
</head>
<body>
  <div class="brand">
    <div class="esp">ESP</div>
    <div>
      <h1>Histórico para pagos</h1>
      <div class="muted">El Sistema Punta Cana · República Dominicana · Departamento Académico</div>
    </div>
  </div>

  <div class="meta"><strong>Maestro:</strong> ${esc(m.nombre_completo || EMPTY)}</div>
  <div class="meta"><strong>Especialidad:</strong> ${esc(m.especialidad || EMPTY)} &nbsp;·&nbsp;
    <strong>Correo:</strong> ${esc(m.correo || EMPTY)} &nbsp;·&nbsp;
    <strong>Tlf:</strong> ${esc(m.tlf || EMPTY)}</div>
  <div class="meta"><strong>Rango:</strong> ${esc(formatFecha(rango.desde))} — ${esc(
    formatFecha(rango.hasta),
  )}${rango.periodoNombre ? ` (${esc(rango.periodoNombre)})` : ''}</div>
  <div class="meta muted">Generado: ${esc(new Date(generadoEn).toLocaleString('es-DO'))}</div>

  <h2>Horario semanal</h2>
  <table>
    <thead><tr><th>Día</th><th>Hora inicio</th><th>Hora fin</th><th>Clase</th><th>Salón</th></tr></thead>
    <tbody>${horarioRows}</tbody>
  </table>

  <h2>Cumplimiento — resumen</h2>
  <div class="chips">
    <div class="chip"><b>${esc(resumen.esperadas)}</b>Sesiones esperadas</div>
    <div class="chip"><b>${esc(resumen.registradas)}</b>Registradas</div>
    <div class="chip"><b>${esc(resumen.cubiertas)}</b>Cubiertas emerg.</div>
    <div class="chip"><b>${esc(resumen.sinRegistro)}</b>Sin registro</div>
    <div class="chip"><b>${esc(resumen.pendientes)}</b>Pendientes</div>
    <div class="chip"><b>${esc(resumen.futuras)}</b>Futuras</div>
    <div class="chip"><b>${esc(resumen.pctCumplimiento)}%</b>Cumplimiento</div>
  </div>

  <h2>Sesiones esperadas — detalle</h2>
  <table>
    <thead><tr><th>Fecha</th><th>Día</th><th>Estado</th><th>Días atraso</th><th>Asistencia (P/A/J)</th><th>Tema / contenido</th><th>Observaciones</th></tr></thead>
    <tbody>${fechaRows}</tbody>
  </table>

  <h2>Contenido y observaciones de sesiones</h2>
  ${sesionesHtml}

  <h2>Justificaciones de inasistencia de alumnos</h2>
  <table>
    <thead><tr><th>Alumno</th><th>Fecha</th><th>Motivo</th><th>Categoría</th><th>Estado</th><th>Evidencia</th></tr></thead>
    <tbody>${justRows}</tbody>
  </table>
</body>
</html>`
}

/* ------------------------------------------------------- descarga / visor */

function safeSlug(value, fallback = 'maestro') {
  return (
    String(value ?? '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 40) || fallback
  )
}

function baseFilename(data) {
  const m = (data && data.maestro) || {}
  const desde = (data && data.rango && data.rango.desde) || ''
  const hasta = (data && data.rango && data.rango.hasta) || ''
  return `historico-pagos-${safeSlug(m.nombre_completo)}-${desde}_${hasta}`
}

/**
 * Abre el reporte HTML en una pestaña nueva y descarga una copia .html.
 * Si el popup está bloqueado, solo descarga.
 */
export function abrirReporteHistoricoPagos(data) {
  const html = construirHtmlHistoricoPagos(data)
  const filename = `${baseFilename(data)}.html`

  if (typeof window !== 'undefined') {
    try {
      const win = window.open('', '_blank')
      if (win) {
        win.document.open()
        win.document.write(html)
        win.document.close()
        win.focus()
      }
    } catch {
      /* popup bloqueado — se descarga igualmente abajo */
    }
  }

  if (typeof document !== 'undefined' && document.body) {
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  return html
}

/* ------------------------------------------------------------------- PDF */

function drawPdfHeader(doc, maestro, rango) {
  const width = doc.internal.pageSize.getWidth()
  doc.setFillColor(...BRAND_NAVY)
  doc.rect(0, 0, width, 22, 'F')
  doc.setFillColor(...BRAND_PRIMARY)
  doc.rect(0, 22, width, 2, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.text('El Sistema Punta Cana', 14, 9)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text('Histórico para pagos por maestro', 14, 15)
  doc.setFontSize(7)
  doc.text(
    `${maestro.nombre_completo || ''}  ·  ${formatFecha(rango.desde)} — ${formatFecha(rango.hasta)}`,
    14,
    20,
  )
  doc.setTextColor(30, 30, 30)
}

/**
 * Genera y descarga un PDF real del reporte.
 */
export function descargarPdfHistoricoPagos(data) {
  const d = data || {}
  const m = d.maestro || {}
  const rango = d.rango || {}
  const fechas = Array.isArray(d.fechas) ? d.fechas : []
  const resumen = d.resumen || resumirCumplimiento(fechas)

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'letter' })
  drawPdfHeader(doc, m, rango)

  autoTable(doc, {
    startY: 28,
    margin: { left: 14, right: 14 },
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 1.6, valign: 'top' },
    columnStyles: {
      0: { fontStyle: 'bold', fillColor: [240, 245, 255], cellWidth: 32 },
      2: { fontStyle: 'bold', fillColor: [240, 245, 255], cellWidth: 32 },
    },
    body: [
      ['Maestro', m.nombre_completo || EMPTY, 'Especialidad', m.especialidad || EMPTY],
      ['Correo', m.correo || EMPTY, 'Teléfono', m.tlf || EMPTY],
      [
        'Rango',
        `${formatFecha(rango.desde)} — ${formatFecha(rango.hasta)}`,
        'Período',
        rango.periodoNombre || EMPTY,
      ],
      ['Generado', new Date(d.generadoEn || Date.now()).toLocaleString('es-DO'), '', ''],
    ],
  })

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('HORARIO SEMANAL', 14, doc.lastAutoTable.finalY + 7)
  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 10,
    margin: { left: 14, right: 14 },
    theme: 'striped',
    head: [['Día', 'Hora inicio', 'Hora fin', 'Clase', 'Salón']],
    headStyles: { fillColor: BRAND_NAVY, textColor: 255, fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    body:
      (d.horario || []).map((h) => [
        titleCase(h.dia),
        formatHora(h.hora_inicio),
        formatHora(h.hora_fin),
        h.clase || EMPTY,
        h.salon || EMPTY,
      ]).length
        ? (d.horario || []).map((h) => [
            titleCase(h.dia),
            formatHora(h.hora_inicio),
            formatHora(h.hora_fin),
            h.clase || EMPTY,
            h.salon || EMPTY,
          ])
        : [[EMPTY, EMPTY, EMPTY, 'Sin horario', EMPTY]],
  })

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text(
    `CUMPLIMIENTO: ${resumen.registradas + resumen.cubiertas}/${resumen.esperadas} registradas · ` +
      `${resumen.sinRegistro} sin registro · ${resumen.pctCumplimiento}%`,
    14,
    doc.lastAutoTable.finalY + 7,
  )

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 10,
    margin: { left: 14, right: 14 },
    theme: 'striped',
    head: [['Fecha', 'Día', 'Estado', 'Atraso', 'P/A/J', 'Tema / contenido', 'Observaciones']],
    headStyles: { fillColor: BRAND_NAVY, textColor: 255, fontSize: 8 },
    bodyStyles: { fontSize: 7.5, cellPadding: 1.4 },
    columnStyles: { 5: { cellWidth: 70 }, 6: { cellWidth: 60 } },
    body: fechas.length
      ? fechas.map((f) => {
          const a = f.asistencia || {}
          return [
            formatFecha(f.fecha),
            titleCase(f.dia || nombreDia(f.fecha)),
            f.estadoLabel || etiquetaEstado(f.estado),
            f.dias_atraso ? String(f.dias_atraso) : '',
            `P:${a.P ?? 0} A:${a.A ?? 0} J:${a.J ?? 0}`,
            f.tema || '',
            f.observaciones || '',
          ]
        })
      : [[EMPTY, EMPTY, 'Sin fechas esperadas', '', '', '', '']],
  })

  doc.addPage()
  drawPdfHeader(doc, m, rango)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('CONTENIDO Y OBSERVACIONES DE SESIONES', 14, 30)
  autoTable(doc, {
    startY: 33,
    margin: { left: 14, right: 14 },
    theme: 'grid',
    head: [['Fecha', 'Clase', 'P/A/J', 'Tema', 'Contenido', 'Observaciones']],
    headStyles: { fillColor: BRAND_NAVY, textColor: 255, fontSize: 8 },
    bodyStyles: { fontSize: 7.5, cellPadding: 1.4 },
    columnStyles: { 3: { cellWidth: 40 }, 4: { cellWidth: 90 }, 5: { cellWidth: 70 } },
    body: (d.sesiones || []).length
      ? (d.sesiones || []).map((s) => {
          const a = s.asistencia || {}
          return [
            formatFecha(s.fecha),
            s.clase_nombre || EMPTY,
            `P:${a.P ?? 0} A:${a.A ?? 0} J:${a.J ?? 0}`,
            s.tema_principal || '',
            s.contenido || s.contenido_dsl || '',
            [s.observaciones_generales, s.observaciones_raw].filter(Boolean).join('\n') || '',
          ]
        })
      : [[EMPTY, EMPTY, '', '', 'Sin sesiones registradas', '']],
  })

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('JUSTIFICACIONES DE INASISTENCIA DE ALUMNOS', 14, doc.lastAutoTable.finalY + 7)
  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 10,
    margin: { left: 14, right: 14 },
    theme: 'striped',
    head: [['Alumno', 'Fecha', 'Motivo', 'Categoría', 'Estado', 'Evidencia']],
    headStyles: { fillColor: BRAND_NAVY, textColor: 255, fontSize: 8 },
    bodyStyles: { fontSize: 7.5 },
    body: (d.justificaciones || []).length
      ? (d.justificaciones || []).map((j) => [
          j.alumno || EMPTY,
          formatFecha(j.fecha),
          j.motivo || EMPTY,
          j.categoria || EMPTY,
          j.estado || EMPTY,
          j.evidencia_url || EMPTY,
        ])
      : [[EMPTY, EMPTY, 'Sin justificaciones en el rango', EMPTY, EMPTY, EMPTY]],
  })

  const total = doc.internal.getNumberOfPages()
  for (let p = 1; p <= total; p++) {
    doc.setPage(p)
    const h = doc.internal.pageSize.getHeight()
    const w = doc.internal.pageSize.getWidth()
    doc.setFillColor(...BRAND_NAVY)
    doc.rect(0, h - 7, w, 7, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(6.5)
    doc.text(`El Sistema Punta Cana — Histórico para pagos`, 10, h - 2.5)
    doc.text(`Página ${p} de ${total}`, w - 10, h - 2.5, { align: 'right' })
  }

  doc.save(`${baseFilename(data)}.pdf`)
}

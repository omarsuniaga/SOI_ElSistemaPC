/**
 * classHealthPdfService.js — Informe mensual de Salud de las Clases (ADM).
 *
 * Renderiza el resultado de buildClassHealthData. El timeline llega ya filtrado
 * por cátedra, clase, maestro y búsqueda, pero completo por período: el PDF
 * recorta el mes visible y compara contra el mes anterior.
 */

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { buildClassHealthData } from './classHealthService.js'

const COLOR = {
  primario: [37, 99, 235],
  tinta: [15, 23, 42],
  grafito: [51, 65, 85],
  humo: [100, 116, 139],
  borde: [226, 232, 240],
  fondo: [248, 250, 252],
  peligro: [220, 38, 38],
}

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

const SIN_REGISTROS = 'Sin registros en el mes'
const SIN_DATOS = 'Sin datos'
const NO_FILTER_VALUES = new Set(['todas', 'todos'])

function fmtPct(value) {
  return value === null || value === undefined ? '—' : `${value}%`
}

function fmtDelta(value) {
  if (value === null || value === undefined) return SIN_DATOS
  return `${value > 0 ? '+' : ''}${value} pts`
}

function esValorFiltro(value) {
  if (value == null || String(value).trim() === '') return false
  return !NO_FILTER_VALUES.has(String(value).trim().toLowerCase())
}

function labelFiltro(value, fallback) {
  return esValorFiltro(value) ? String(value) : fallback
}

function hayFiltrosActivos(filters = {}) {
  return esValorFiltro(filters.catedra)
    || esValorFiltro(filters.clase)
    || esValorFiltro(filters.maestro)
    || Boolean(String(filters.busqueda || '').trim())
}

function asegurarEspacio(doc, y, requerido = 30) {
  const limite = doc.internal.pageSize.getHeight() - 18
  if (y + requerido <= limite) return y
  doc.addPage()
  return 16
}

function aplicarPie(doc) {
  const total = doc.internal.getNumberOfPages()
  const w = doc.internal.pageSize.getWidth()
  const h = doc.internal.pageSize.getHeight()

  for (let i = 1; i <= total; i++) {
    doc.setPage(i)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...COLOR.humo)
    doc.text('Sistema Operativo Institucional · Salud de las Clases ADM', 14, h - 8)
    doc.text(`Página ${i} de ${total}`, w - 14, h - 8, { align: 'right' })
  }
}

function tituloSeccion(doc, texto, y) {
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...COLOR.tinta)
  doc.text(texto, 14, y)
  return y + 4
}

function filasSinRegistros(columnas) {
  return [[SIN_REGISTROS, ...Array(columnas - 1).fill('—')]]
}

const METODOLOGIA = [
  ['Asistencia', 'Tasa = (presentes + tardanzas) / (presentes + tardanzas + justificadas + ausentes). Las tardanzas cuentan como asistencia. Si la sesión no tiene registro por alumno, se usan los contadores de la sesión.'],
  ['Comparativo', 'Variación en puntos porcentuales frente al mes anterior de la misma clase. "Sin datos" indica que la clase no tuvo sesiones en el mes anterior.'],
  ['Puntuación', '0 a 100 = 0,5 × % asistencia + 0,3 × % cobertura de contenido + 0,2 × % variedad de contenido. Una clase sin convocatorias en el mes no recibe puntuación.'],
  ['Cobertura', 'Sesiones con contenido registrado / total de sesiones del mes.'],
  ['Variedad', 'Contenidos distintos / sesiones con contenido. Un contenido idéntico a una sesión anterior de la misma clase cuenta como repetido.'],
  ['Niveles', 'Saludable: 80 o más. En observación: de 60 a 79. Requiere atención: menos de 60.'],
  ['Temas', 'Términos de 4 o más letras, sin palabras vacías, que aparecen en 2 o más sesiones del mes. Atención % = sesiones con el tema / sesiones con contenido. Las fechas listadas son la evidencia.'],
  ['Alcance', 'El informe evalúa clases, no alumnos individuales.'],
]

/**
 * @returns {Promise<object>} The data used to render the report (same as buildClassHealthData).
 */
export async function downloadClassHealthPdf({
  timeline = [],
  year,
  monthIndex,
  periodName = 'Período Académico',
  filters = {},
  generatedAt = new Date(),
} = {}) {
  const data = buildClassHealthData(timeline, { year, monthIndex })
  const { summary, classes } = data
  const mesNombre = MESES[Number(monthIndex)] || 'Mes'
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const w = doc.internal.pageSize.getWidth()

  doc.setFillColor(...COLOR.primario)
  doc.rect(0, 0, w, 5, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.setTextColor(...COLOR.tinta)
  doc.text('Informe de Salud de las Clases', 14, 17)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...COLOR.humo)
  doc.text(`${mesNombre} ${year} · ${periodName}`, 14, 23)
  doc.text(
    `Generado: ${new Date(generatedAt).toLocaleDateString('es-DO', {
      day: '2-digit', month: 'long', year: 'numeric',
    })}`,
    w - 14,
    23,
    { align: 'right' },
  )

  autoTable(doc, {
    startY: 28,
    body: [[
      { content: 'Filtros aplicados', styles: { fontStyle: 'bold', fillColor: COLOR.fondo } },
      `Cátedra: ${labelFiltro(filters.catedra, 'Todas')} · Clase: ${labelFiltro(filters.clase, 'Todas')} · Maestro: ${labelFiltro(filters.maestro, 'Todos')} · Búsqueda: ${String(filters.busqueda || '').trim() ? `"${String(filters.busqueda).trim()}"` : 'Sin búsqueda'}`,
    ]],
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2.3, textColor: COLOR.grafito },
    columnStyles: { 0: { cellWidth: 35 } },
    margin: { left: 14, right: 14 },
  })

  let y = doc.lastAutoTable.finalY + 7
  y = tituloSeccion(doc, '1. Resumen General', y)

  autoTable(doc, {
    startY: y,
    body: [
      ['Clases con sesiones', String(summary.classCount), 'Sesiones registradas', String(summary.sessions)],
      ['Tasa de asistencia', fmtPct(summary.attendanceRatePct), 'Tasa mes anterior (mismas clases)', fmtPct(summary.previousAttendanceRatePct)],
      ['Variación de asistencia', fmtDelta(summary.attendanceDeltaPts), 'Puntuación promedio', summary.averageHealthScore == null ? '—' : String(summary.averageHealthScore)],
      [
        'Saludable', String(summary.levelCounts['Saludable']),
        'En observación / Requiere atención',
        `${summary.levelCounts['En observación']} / ${summary.levelCounts['Requiere atención']}`,
      ],
    ],
    theme: 'grid',
    styles: { fontSize: 8.5, cellPadding: 2.5, textColor: COLOR.grafito },
    columnStyles: {
      0: { fontStyle: 'bold', fillColor: COLOR.fondo },
      2: { fontStyle: 'bold', fillColor: COLOR.fondo },
    },
    margin: { left: 14, right: 14 },
  })

  y = doc.lastAutoTable.finalY + 8
  y = asegurarEspacio(doc, y, 45)
  y = tituloSeccion(doc, '2. Comparativo de Asistencia por Clase', y)

  autoTable(doc, {
    startY: y,
    head: [['Clase', 'Maestro', 'Ses.', 'P/T/J/A', '% mes', '% mes ant.', 'Variación']],
    body: classes.length
      ? classes.map((c) => [
        c.className,
        c.teacher,
        String(c.sessions),
        `${c.attended - c.late}/${c.late}/${c.justified}/${c.absent}`,
        fmtPct(c.attendanceRatePct),
        c.previous ? fmtPct(c.previous.attendanceRatePct) : SIN_DATOS,
        fmtDelta(c.attendanceDeltaPts),
      ])
      : filasSinRegistros(7),
    theme: 'striped',
    headStyles: { fillColor: COLOR.primario, textColor: [255, 255, 255], fontSize: 7.5 },
    styles: { fontSize: 7.5, cellPadding: 1.8 },
    columnStyles: {
      2: { halign: 'center' }, 3: { halign: 'center' },
      4: { halign: 'center', fontStyle: 'bold' }, 5: { halign: 'center' },
      6: { halign: 'center' },
    },
    margin: { left: 14, right: 14 },
  })

  y = doc.lastAutoTable.finalY + 8
  y = asegurarEspacio(doc, y, 50)
  y = tituloSeccion(doc, '3. Salud por Clase', y)

  autoTable(doc, {
    startY: y,
    head: [['Clase', 'Puntuación', 'Nivel', 'Cobertura contenido', 'Sesiones repetidas']],
    body: classes.length
      ? classes.map((c) => [
        c.className,
        c.healthScore == null ? '—' : String(c.healthScore),
        c.healthLevel || '—',
        fmtPct(c.content.coveragePct),
        String(c.content.repeatedContentSessions),
      ])
      : filasSinRegistros(5),
    theme: 'striped',
    headStyles: { fillColor: COLOR.primario, textColor: [255, 255, 255], fontSize: 7.5 },
    styles: { fontSize: 7.5, cellPadding: 1.8 },
    columnStyles: {
      1: { halign: 'center', fontStyle: 'bold' },
      3: { halign: 'center' }, 4: { halign: 'center' },
    },
    margin: { left: 14, right: 14 },
  })

  y = doc.lastAutoTable.finalY + 8
  y = tituloSeccion(doc, '4. Contenido Trabajado por Clase', y)

  if (classes.length === 0) {
    autoTable(doc, {
      startY: y,
      head: [['Tema', 'Sesiones', 'Atención %', 'Fechas']],
      body: filasSinRegistros(4),
      theme: 'striped',
      headStyles: { fillColor: COLOR.primario, textColor: [255, 255, 255], fontSize: 7.5 },
      styles: { fontSize: 7.5, cellPadding: 1.8 },
      margin: { left: 14, right: 14 },
    })
    y = doc.lastAutoTable.finalY + 8
  }

  for (const c of classes) {
    y = asegurarEspacio(doc, y, 30)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(...COLOR.tinta)
    doc.text(`${c.className} · ${c.teacher}`, 14, y)
    y += 3

    let body
    if (c.content.sessionsWithContent === 0) {
      body = [['Sin contenido registrado', '—', '—', '—']]
    } else if (c.content.topics.length === 0) {
      body = [['Sin temas repetidos en el mes', '—', '—', '—']]
    } else {
      body = c.content.topics.map((t) => [
        t.label,
        String(t.sessions),
        fmtPct(t.attentionPct),
        t.dates.join(', '),
      ])
    }

    autoTable(doc, {
      startY: y,
      head: [['Tema', 'Sesiones', 'Atención %', 'Fechas']],
      body,
      theme: 'striped',
      headStyles: { fillColor: COLOR.primario, textColor: [255, 255, 255], fontSize: 7.5 },
      styles: { fontSize: 7.5, cellPadding: 1.8 },
      columnStyles: {
        1: { halign: 'center' }, 2: { halign: 'center', fontStyle: 'bold' },
      },
      margin: { left: 14, right: 14 },
    })

    y = doc.lastAutoTable.finalY + 6
  }

  y = asegurarEspacio(doc, y, 60)
  y = tituloSeccion(doc, '5. Metodología', y)

  autoTable(doc, {
    startY: y,
    body: METODOLOGIA.map(([etiqueta, texto]) => [
      { content: etiqueta, styles: { fontStyle: 'bold', fillColor: COLOR.fondo } },
      texto,
    ]),
    theme: 'grid',
    styles: { fontSize: 7.5, cellPadding: 2, textColor: COLOR.grafito },
    columnStyles: { 0: { cellWidth: 30 } },
    margin: { left: 14, right: 14 },
  })

  aplicarPie(doc)

  const sufijo = hayFiltrosActivos(filters) ? '_Filtrado' : ''
  doc.save(`Salud_Clases_${year}-${String(Number(monthIndex) + 1).padStart(2, '0')}${sufijo}.pdf`)

  return data
}

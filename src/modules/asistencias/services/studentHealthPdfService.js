/**
 * studentHealthPdfService.js — Informe mensual de Salud de los Estudiantes (ADM).
 *
 * Renderiza el resultado de buildStudentHealthData. Las recomendaciones son
 * insumos para que una persona decida; el informe no etiqueta alumnos ni envía
 * comunicaciones a las familias.
 */

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { buildStudentHealthData } from './studentHealthService.js'
import { getStudentProgressBatch } from '../../progresos/api/progresosApi.js'
import { THRESHOLDS } from '../../progresos/services/riskRules.js'

const COLOR = {
  primario: [37, 99, 235],
  tinta: [15, 23, 42],
  grafito: [51, 65, 85],
  humo: [100, 116, 139],
  borde: [226, 232, 240],
  fondo: [248, 250, 252],
}

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

const SIN_REGISTROS = 'Sin registros en el mes'
const SIN_DATOS = 'Sin datos'
const SIN_SEÑALES = 'Sin señales en el período'
const SIN_RECOMENDACIONES = 'Sin recomendaciones en el período'
const SIN_CONTENIDO_MES = 'Sin contenido recibido en el mes'
const NO_FILTER_VALUES = new Set(['todas', 'todos'])
const MAX_CONTENT_CHARS = 160

const TIPO_RECOMENDACION = {
  guardian_meeting: 'Reunión con la persona encargada',
  plan_review: 'Revisión del plan de estudio',
  preventive_followup: 'Seguimiento preventivo',
}

const ESTADO_LABEL = { ausente: 'Ausente', justificado: 'Justificado' }

function fmtPct(value) {
  return value === null || value === undefined ? '—' : `${value}%`
}

function fmtTendencia(value) {
  if (value === null || value === undefined) return SIN_DATOS
  return `${value > 0 ? '+' : ''}${value} pts`
}

function fechaCorta(iso) {
  const [year, month, day] = String(iso).split('-')
  return `${day}/${month}/${year}`
}

function truncar(text) {
  const value = String(text ?? '')
  return value.length > MAX_CONTENT_CHARS ? `${value.slice(0, MAX_CONTENT_CHARS - 3)}...` : value
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
    doc.text('Sistema Operativo Institucional · Salud de los Estudiantes ADM', 14, h - 8)
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

function filasSinRegistros(columnas, texto = SIN_REGISTROS) {
  return [[texto, ...Array(columnas - 1).fill('—')]]
}

function progresoLinea(student, progressAvailable) {
  const p = student.progress
  if (p) {
    return `Evaluaciones: ${p.gradesCount} con promedio ${p.gradesAverage ?? '—'} · Indicadores: ${p.indicatorAttempts} intentos, ${p.indicatorPassRatePct ?? '—'}% aprobados`
  }
  return progressAvailable ? 'Sin evaluaciones registradas' : 'Evaluaciones no disponibles'
}

const METODOLOGIA = [
  ['Asistencia', 'Tasa = (presentes + tardanzas) / convocatorias. Las tardanzas cuentan como asistencia. Las ausencias se separan en justificadas (J) e injustificadas (I).'],
  ['Tendencia y proyección', 'Pendiente por mínimos cuadrados de la tasa mensual, en puntos por mes, con 3 meses o más con convocatorias. La proyección es el valor ajustado del mes siguiente, limitado entre 0% y 100%. Sin 3 meses, se muestra "Sin datos".'],
  ['Contenido', 'Solo cuentan las sesiones con contenido registrado. Recibido: el alumno asistió. No recibido: el alumno estuvo ausente o justificado. Exposición = sesiones recibidas / sesiones con contenido del período.'],
  ['Umbrales', `Asistencia de referencia ${Math.round(THRESHOLDS.attendance_min_rate * 100)}%. Aprobación de indicadores ${Math.round(THRESHOLDS.indicator_min_pass_rate * 100)}%.`],
  ['Reglas', 'Reunión: 3 o más ausencias injustificadas en el período, o asistencia del mes bajo el umbral con 2 o más convocatorias. Revisión del plan: asistencia del período de 80% o más, con 4 o más intentos de indicadores bajo el umbral. Las calificaciones se muestran como referencia y no activan ninguna regla, porque la escala en uso no está confirmada. Seguimiento preventivo: tendencia de -10 puntos o menos por mes y proyección bajo el umbral, sin reunión.'],
  ['Alcance', 'El informe evalúa la asistencia y el contenido recibido por alumno. No envía comunicaciones a las personas encargadas.'],
  ['Decisión', 'Las recomendaciones no son decisiones. El sistema no sanciona, no etiqueta ni diagnostica a ningún alumno. La persona nombrada en cada recomendación decide.'],
]

function firstDateOf(timeline) {
  const fechas = timeline.map((dia) => dia?.fecha).filter((f) => typeof f === 'string').sort()
  return fechas[0] ?? null
}

function lastDayOf(year, monthIndex) {
  return new Date(Date.UTC(Number(year), Number(monthIndex) + 1, 0)).toISOString().slice(0, 10)
}

/** Default progress source: the existing batch aggregate, keyed by student id. */
export function defaultLoadProgress({ studentIds, periodId, from, to }) {
  return getStudentProgressBatch(studentIds, { periodoId: periodId, from, to })
}

/** Fail-soft: any failure leaves progress null and the report still renders. */
async function cargarProgreso({ data, timeline, year, monthIndex, periodId, loadProgress }) {
  const studentIds = data.students.map((s) => s.studentId)
  if (studentIds.length === 0) return { progressByStudent: null, progressAvailable: true }

  try {
    const progressByStudent = await loadProgress({
      studentIds,
      periodId,
      from: firstDateOf(timeline),
      to: lastDayOf(year, monthIndex),
    })
    return { progressByStudent, progressAvailable: true }
  } catch (err) {
    console.error('[studentHealthPdfService] Error al cargar evaluaciones:', err)
    return { progressByStudent: null, progressAvailable: false }
  }
}

function renderRecomendaciones(doc, students, y) {
  const recs = students.flatMap((s) => s.recommendations.map((rec) => ({ student: s, rec })))
  if (recs.length === 0) {
    autoTable(doc, {
      startY: y,
      body: filasSinRegistros(1, SIN_RECOMENDACIONES),
      theme: 'striped',
      styles: { fontSize: 8, cellPadding: 2 },
      margin: { left: 14, right: 14 },
    })
    return doc.lastAutoTable.finalY + 8
  }

  for (const { student, rec } of recs) {
    y = asegurarEspacio(doc, y, 60)
    autoTable(doc, {
      startY: y,
      body: [
        ['Alumno', student.studentName],
        ['Recomendación', TIPO_RECOMENDACION[rec.type] || rec.type],
        ['Qué ocurrió', rec.what],
        ['Evidencia', rec.evidence],
        ['Por qué importa', rec.why],
        ['Acción sugerida', rec.action],
        ['Quién decide', rec.decides],
        ['Cuándo revisar', fechaCorta(rec.reviewBy)],
      ].map(([etiqueta, texto]) => [
        { content: etiqueta, styles: { fontStyle: 'bold', fillColor: COLOR.fondo } },
        texto,
      ]),
      theme: 'grid',
      styles: { fontSize: 7.5, cellPadding: 1.8, textColor: COLOR.grafito },
      columnStyles: { 0: { cellWidth: 35 } },
      margin: { left: 14, right: 14 },
    })
    y = doc.lastAutoTable.finalY + 6
  }
  return y + 2
}

function renderDetalle(doc, students, progressAvailable, y) {
  for (const student of students) {
    y = asegurarEspacio(doc, y, 40)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(...COLOR.tinta)
    doc.text(student.studentName, 14, y)
    y += 4

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...COLOR.grafito)
    doc.text(`Clases: ${student.classes.join(', ') || '—'}`, 14, y)
    y += 4
    doc.text(progresoLinea(student, progressAvailable), 14, y)
    y += 3

    const recibido = student.content.received.map((c) => [
      fechaCorta(c.date), c.className, truncar(c.text),
    ])
    autoTable(doc, {
      startY: y,
      head: [['Fecha', 'Clase', 'Contenido']],
      body: recibido.length ? recibido : filasSinRegistros(3, SIN_CONTENIDO_MES),
      theme: 'striped',
      headStyles: { fillColor: COLOR.primario, textColor: [255, 255, 255], fontSize: 7.5 },
      styles: { fontSize: 7.5, cellPadding: 1.8 },
      margin: { left: 14, right: 14 },
    })
    y = doc.lastAutoTable.finalY + 4

    if (student.content.notReceived.length > 0) {
      autoTable(doc, {
        startY: y,
        head: [['Fecha', 'Clase', 'Estado', 'Contenido']],
        body: student.content.notReceived.map((c) => [
          fechaCorta(c.date), c.className, ESTADO_LABEL[c.status] || c.status, truncar(c.text),
        ]),
        theme: 'striped',
        headStyles: { fillColor: COLOR.primario, textColor: [255, 255, 255], fontSize: 7.5 },
        styles: { fontSize: 7.5, cellPadding: 1.8 },
        margin: { left: 14, right: 14 },
      })
      y = doc.lastAutoTable.finalY + 4
    }

    if (student.recommendations.length === 0) {
      autoTable(doc, {
        startY: y,
        body: filasSinRegistros(1, SIN_SEÑALES),
        theme: 'striped',
        styles: { fontSize: 7.5, cellPadding: 1.8 },
        margin: { left: 14, right: 14 },
      })
      y = doc.lastAutoTable.finalY + 4
    }
    y += 4
  }
  return y
}

/**
 * @returns {Promise<object>} The data rendered in the report (buildStudentHealthData output,
 *   plus `summary.progressAvailable`).
 */
export async function downloadStudentHealthPdf({
  timeline = [],
  year,
  monthIndex,
  periodId = null,
  periodName = 'Período Académico',
  filters = {},
  generatedAt = new Date(),
  loadProgress = defaultLoadProgress,
} = {}) {
  const preliminary = buildStudentHealthData(timeline, { year, monthIndex, generatedAt })
  const { progressByStudent, progressAvailable } = await cargarProgreso({
    data: preliminary, timeline, year, monthIndex, periodId, loadProgress,
  })
  const data = buildStudentHealthData(timeline, {
    year, monthIndex, progressByStudent, generatedAt,
  })
  data.summary.progressAvailable = progressAvailable

  const { summary, students } = data
  const mesNombre = MESES[Number(monthIndex)] || 'Mes'
  const totalRecs = Object.values(summary.recommendationCounts).reduce((a, b) => a + b, 0)

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const w = doc.internal.pageSize.getWidth()

  doc.setFillColor(...COLOR.primario)
  doc.rect(0, 0, w, 5, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.setTextColor(...COLOR.tinta)
  doc.text('Informe de Salud de los Estudiantes', 14, 17)

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
      ['Alumnos con registros', String(summary.studentCount), 'Recomendaciones emitidas', String(totalRecs)],
      ['Asistencia del período', fmtPct(summary.period.attendanceRatePct), 'Asistencia del mes', fmtPct(summary.month.attendanceRatePct)],
      ['Ausencias injustificadas (período)', String(summary.period.unjustified), 'Ausencias injustificadas (mes)', String(summary.month.unjustified)],
      ['Alumnos con recomendaciones', String(summary.studentsWithRecommendations), 'Evaluaciones cargadas', progressAvailable ? 'Sí' : 'No'],
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
  y = tituloSeccion(doc, '2. Estudiantes', y)

  autoTable(doc, {
    startY: y,
    head: [['Alumno', 'Instrumento', 'Aus. período J/I', 'Aus. mes J/I', '% período', '% mes', 'Tendencia', 'Proyección', 'Contenido recibido n/m']],
    body: students.length
      ? students.map((s) => [
        s.studentName,
        s.instrument || '—',
        `${s.period.justified}/${s.period.unjustified}`,
        `${s.month.justified}/${s.month.unjustified}`,
        fmtPct(s.period.attendanceRatePct),
        fmtPct(s.month.attendanceRatePct),
        fmtTendencia(s.trendPtsPerMonth),
        fmtPct(s.projectedNextMonthRatePct),
        `${s.content.period.received}/${s.content.period.delivered}`,
      ])
      : filasSinRegistros(9),
    theme: 'striped',
    headStyles: { fillColor: COLOR.primario, textColor: [255, 255, 255], fontSize: 7 },
    styles: { fontSize: 7.5, cellPadding: 1.6 },
    columnStyles: {
      2: { halign: 'center' }, 3: { halign: 'center' }, 4: { halign: 'center', fontStyle: 'bold' },
      5: { halign: 'center', fontStyle: 'bold' }, 6: { halign: 'center' }, 7: { halign: 'center' },
      8: { halign: 'center' },
    },
    margin: { left: 14, right: 14 },
  })

  y = doc.lastAutoTable.finalY + 8
  y = asegurarEspacio(doc, y, 40)
  y = tituloSeccion(doc, '3. Recomendaciones para decisión', y)
  if (!progressAvailable) {
    y = asegurarEspacio(doc, y, 8)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...COLOR.humo)
    doc.text('No se pudieron cargar las evaluaciones; las recomendaciones basadas en progreso no se evaluaron.', 14, y)
    y += 5
  }
  y = renderRecomendaciones(doc, students, y)

  y = asegurarEspacio(doc, y, 40)
  y = tituloSeccion(doc, '4. Detalle por Estudiante', y + 2)
  y = renderDetalle(doc, students, progressAvailable, y)

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
  doc.save(`Salud_Estudiantes_${year}-${String(Number(monthIndex) + 1).padStart(2, '0')}${sufijo}.pdf`)

  return data
}

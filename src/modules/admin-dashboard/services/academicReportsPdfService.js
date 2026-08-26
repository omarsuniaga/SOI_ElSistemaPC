/**
 * academicReportsPdfService.js — Generador PDF para Reportes Académicos del Portal ADM (SOI).
 * Utiliza jsPDF + jspdf-autotable con estética institucional ejecutiva.
 */

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const COLOR = {
  primario: [79, 70, 229],   // Indigo 600
  secundario: [124, 58, 237], // Violet 600
  tinta: [15, 23, 42],       // Slate 900
  grafito: [51, 65, 85],     // Slate 700
  humo: [100, 116, 139],     // Slate 500
  borde: [226, 232, 240],    // Slate 200
  fondo: [248, 250, 252],    // Slate 50
  exito: [16, 185, 129],     // Emerald 500
  alerta: [245, 158, 11],    // Amber 500
  peligro: [239, 68, 68],    // Rose 500
}

const MESES = [
  '', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

/**
 * Agrega el encabezado institucional y pie de página en cada página del PDF.
 */
function aplicarDecoracionPagina(doc, titulo, subtitulo) {
  const totalPaginas = doc.internal.getNumberOfPages()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  for (let i = 1; i <= totalPaginas; i++) {
    doc.setPage(i)

    // Barra superior de acento
    doc.setFillColor(...COLOR.primario)
    doc.rect(0, 0, pageWidth, 4, 'F')

    // Header en primera página
    if (i === 1) {
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(16)
      doc.setTextColor(...COLOR.tinta)
      doc.text(titulo, 14, 16)

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(...COLOR.humo)
      doc.text(subtitulo, 14, 22)

      doc.setDrawColor(...COLOR.borde)
      doc.setLineWidth(0.5)
      doc.line(14, 26, pageWidth - 14, 26)
    }

    // Pie de página en todas
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...COLOR.humo)
    doc.text('Sistema Operativo Institucional · Portal Administración (ADM)', 14, pageHeight - 8)
    doc.text(`Página ${i} de ${totalPaginas}`, pageWidth - 14, pageHeight - 8, { align: 'right' })
  }
}

/**
 * Genera y descarga el PDF del Resumen Académico Mensual.
 */
export async function descargarPdfResumenMensual(data, mes, anio) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const mesNombre = MESES[Number(mes)] || `Mes ${mes}`
  const titulo = `Resumen Académico Mensual — ${mesNombre} ${anio}`
  const subtitulo = `Generado el ${new Date().toLocaleDateString('es-DO', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`

  const resumen = data?.resumen_general || {}
  const efectividad = data?.efectividad_clases || {}
  const patron = data?.patron_semanal || {}
  const riesgo = Array.isArray(data?.alumnos_en_riesgo) ? data.alumnos_en_riesgo : []
  const docentes = Array.isArray(data?.cumplimiento_docente) ? data.cumplimiento_docente : []

  let y = 32

  // 1. Tarjetas de Resumen KPI
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...COLOR.tinta)
  doc.text('1. Indicadores Clave del Mes', 14, y)
  y += 5

  const kpis = [
    [
      { content: 'Tasa de Asistencia Global', styles: { fontStyle: 'bold' } },
      `${resumen.tasa_asistencia_pct ?? 0}% (${resumen.presentes ?? 0} P / ${resumen.tardes ?? 0} T / ${resumen.ausentes ?? 0} A)`,
    ],
    [
      { content: 'Ratio de Justificación Formal', styles: { fontStyle: 'bold' } },
      `${resumen.ratio_justificacion_pct ?? 0}% (${resumen.justificados ?? 0} justificados)`,
    ],
    [
      { content: 'Efectividad de Clases Programadas', styles: { fontStyle: 'bold' } },
      `${efectividad.tasa_efectividad_pct ?? 0}% (${efectividad.dictadas ?? 0} dictadas / ${efectividad.total_programadas ?? 0} prog.)`,
    ],
    [
      { content: 'Día Pico vs. Día Valle', styles: { fontStyle: 'bold' } },
      `Pico: ${patron.dia_pico_asistencia || 'N/A'}  |  Valle: ${patron.dia_valle_asistencia || 'N/A'}`,
    ],
    [
      { content: 'Alumnos en Zona Roja (≥2 faltas)', styles: { fontStyle: 'bold', textColor: COLOR.peligro } },
      `${riesgo.length} alumnos requieren intervención`,
    ],
  ]

  autoTable(doc, {
    startY: y,
    body: kpis,
    theme: 'grid',
    styles: { fontSize: 8.5, cellPadding: 2.5, textColor: COLOR.grafito },
    columnStyles: { 0: { cellWidth: 70, fillColor: COLOR.fondo } },
    margin: { left: 14, right: 14 },
  })

  y = doc.lastAutoTable.finalY + 8

  // 2. Alumnos en Riesgo
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...COLOR.tinta)
  doc.text('2. Alerta Temprana: Alumnos en Riesgo (≥2 Inasistencias)', 14, y)
  y += 4

  if (riesgo.length === 0) {
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(9)
    doc.setTextColor(...COLOR.humo)
    doc.text('No hay alumnos con 2 o más inasistencias en este mes.', 14, y + 4)
    y += 10
  } else {
    const riesgoRows = riesgo.map((r) => [
      r.nombre_completo || '—',
      r.instrumento_principal || '—',
      r.representante_nombre || '—',
      r.representante_tlf || '—',
      String(r.total_inasistencias || 0),
      String(r.ausencias_injustificadas || 0),
    ])

    autoTable(doc, {
      startY: y,
      head: [['Estudiante', 'Cátedra / Instrumento', 'Representante', 'Contacto', 'Total Faltas', 'Injustificadas']],
      body: riesgoRows,
      theme: 'striped',
      headStyles: { fillColor: COLOR.peligro, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
      styles: { fontSize: 8, cellPadding: 2 },
      columnStyles: {
        4: { halign: 'center', fontStyle: 'bold' },
        5: { halign: 'center', textColor: COLOR.peligro, fontStyle: 'bold' },
      },
      margin: { left: 14, right: 14 },
    })

    y = doc.lastAutoTable.finalY + 8
  }

  // 3. Cumplimiento Docente
  if (y > 230) {
    doc.addPage()
    y = 20
  }

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...COLOR.tinta)
  doc.text('3. Cumplimiento y Registro Docente', 14, y)
  y += 4

  const docenteRows = docentes.map((d) => [
    d.maestro_nombre || '—',
    d.especialidad || '—',
    String(d.total_sesiones || 0),
    String(d.sesiones_cerradas || 0),
    String(d.sesiones_pendientes || 0),
    `${d.cumplimiento_pct ?? 0}%`,
    String(d.sesiones_con_observaciones || 0),
  ])

  autoTable(doc, {
    startY: y,
    head: [['Maestro', 'Especialidad', 'Total Sesiones', 'Cerradas', 'Pendientes', '% Cumplimiento', 'Observaciones']],
    body: docenteRows.length > 0 ? docenteRows : [['Sin registros docentes', '—', '—', '—', '—', '—', '—']],
    theme: 'striped',
    headStyles: { fillColor: COLOR.primario, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
    styles: { fontSize: 8, cellPadding: 2 },
    columnStyles: {
      2: { halign: 'center' },
      3: { halign: 'center' },
      4: { halign: 'center' },
      5: { halign: 'center', fontStyle: 'bold' },
      6: { halign: 'center' },
    },
    margin: { left: 14, right: 14 },
  })

  aplicarDecoracionPagina(doc, titulo, subtitulo)
  doc.save(`Resumen_Academico_Mensual_${mesNombre}_${anio}.pdf`)
}

/**
 * Genera y descarga el PDF del Informe Académico Semestral.
 */
export async function descargarPdfInformeSemestral(data) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const periodo = data?.periodo || {}
  const periodoNombre = periodo.nombre || 'Período Académico Actual'
  const titulo = `Informe Académico Semestral — ${periodoNombre}`
  const subtitulo = `Balance y Evaluación de Fin de Ciclo · Generado el ${new Date().toLocaleDateString('es-DO', { day: '2-digit', month: 'long', year: 'numeric' })}`

  const evolucion = Array.isArray(data?.evolucion_mensual) ? data.evolucion_mensual : []
  const honor = Array.isArray(data?.cuadro_honor) ? data.cuadro_honor : []
  const ausencias = Array.isArray(data?.ranking_ausencias) ? data.ranking_ausencias : []
  const retencion = Array.isArray(data?.retencion_por_catedra) ? data.retencion_por_catedra : []
  const destacados = Array.isArray(data?.alumnos_destacados) ? data.alumnos_destacados : []
  const docentes = Array.isArray(data?.evaluacion_docente) ? data.evaluacion_docente : []

  let y = 32

  // 1. Evolución Mensual
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...COLOR.tinta)
  doc.text('1. Evolución Longitudinal de Asistencia', 14, y)
  y += 4

  const evolucionRows = evolucion.map((m) => [
    m.mes_nombre || `Mes ${m.mes}`,
    String(m.total_registros || 0),
    String(m.presentes_total || 0),
    String(m.ausentes_total || 0),
    `${m.tasa_asistencia_pct ?? 0}%`,
  ])

  autoTable(doc, {
    startY: y,
    head: [['Mes', 'Total Convocatorias', 'Asistencias', 'Inasistencias', 'Tasa Asistencia']],
    body: evolucionRows.length > 0 ? evolucionRows : [['Sin datos', '—', '—', '—', '—']],
    theme: 'grid',
    headStyles: { fillColor: COLOR.primario, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
    styles: { fontSize: 8, cellPadding: 2 },
    columnStyles: {
      1: { halign: 'center' },
      2: { halign: 'center' },
      3: { halign: 'center' },
      4: { halign: 'center', fontStyle: 'bold' },
    },
    margin: { left: 14, right: 14 },
  })

  y = doc.lastAutoTable.finalY + 8

  // 2. Cuadro de Honor
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...COLOR.tinta)
  doc.text('2. Cuadro de Honor (Asistencia Sobresaliente ≥95%)', 14, y)
  y += 4

  const honorRows = honor.map((h) => [
    h.nombre_completo || '—',
    h.instrumento_principal || '—',
    `Nivel ${h.nivel_actual || 1}`,
    String(h.total_clases || 0),
    String(h.asistencias || 0),
    `${h.porcentaje_asistencia ?? 0}%`,
  ])

  autoTable(doc, {
    startY: y,
    head: [['Estudiante', 'Cátedra', 'Nivel', 'Clases', 'Asistencias', '% Asistencia']],
    body: honorRows.length > 0 ? honorRows : [['Sin estudiantes con ≥95%', '—', '—', '—', '—', '—']],
    theme: 'striped',
    headStyles: { fillColor: COLOR.exito, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
    styles: { fontSize: 8, cellPadding: 2 },
    columnStyles: {
      3: { halign: 'center' },
      4: { halign: 'center' },
      5: { halign: 'center', fontStyle: 'bold', textColor: COLOR.exito },
    },
    margin: { left: 14, right: 14 },
  })

  y = doc.lastAutoTable.finalY + 8

  // Nueva Página para Retención y Alumnos Destacados
  doc.addPage()
  y = 20

  // 3. Retención por Cátedra
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...COLOR.tinta)
  doc.text('3. Retención de Matrícula por Cátedra / Instrumento', 14, y)
  y += 4

  const retencionRows = retencion.map((r) => [
    r.instrumento || '—',
    String(r.total_matriculados || 0),
    String(r.activos_cierre || 0),
    String(r.retirados || 0),
    `${r.tasa_retencion_pct ?? 0}%`,
  ])

  autoTable(doc, {
    startY: y,
    head: [['Cátedra / Instrumento', 'Matrícula Inicial', 'Activos al Cierre', 'Bajas', '% Retención']],
    body: retencionRows.length > 0 ? retencionRows : [['Sin datos de retención', '—', '—', '—', '—']],
    theme: 'grid',
    headStyles: { fillColor: COLOR.secundario, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
    styles: { fontSize: 8, cellPadding: 2 },
    columnStyles: {
      1: { halign: 'center' },
      2: { halign: 'center' },
      3: { halign: 'center' },
      4: { halign: 'center', fontStyle: 'bold' },
    },
    margin: { left: 14, right: 14 },
  })

  y = doc.lastAutoTable.finalY + 8

  // 4. Alumnos Destacados (Merit Score)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...COLOR.tinta)
  doc.text('4. Estudiantes Destacados (Merit Score Curricular)', 14, y)
  y += 4

  const destacadosRows = destacados.map((a) => [
    a.nombre_completo || '—',
    a.instrumento_principal || '—',
    `${a.pct_asistencia ?? 0}%`,
    String(a.total_logros || 0),
    String(a.indicadores_aprobados || 0),
    `${a.merit_score ?? 0} pts`,
  ])

  autoTable(doc, {
    startY: y,
    head: [['Estudiante', 'Cátedra', '% Asistencia', 'Logros', 'Indicadores', 'Merit Score']],
    body: destacadosRows.length > 0 ? destacadosRows : [['Sin datos de mérito', '—', '—', '—', '—', '—']],
    theme: 'striped',
    headStyles: { fillColor: COLOR.primario, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
    styles: { fontSize: 8, cellPadding: 2 },
    columnStyles: {
      2: { halign: 'center' },
      3: { halign: 'center' },
      4: { halign: 'center' },
      5: { halign: 'center', fontStyle: 'bold', textColor: COLOR.primario },
    },
    margin: { left: 14, right: 14 },
  })

  y = doc.lastAutoTable.finalY + 8

  // 5. Evaluación Docente
  if (y > 200) {
    doc.addPage()
    y = 20
  }

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...COLOR.tinta)
  doc.text('5. Evaluación Consolidada del Cuerpo Docente', 14, y)
  y += 4

  const docenteRows = docentes.map((d) => [
    d.maestro_nombre || '—',
    d.especialidad || '—',
    String(d.total_sesiones_semestre || 0),
    String(d.sesiones_cumplidas || 0),
    String(d.observaciones_cargadas || 0),
    `${d.solvencia_registro_pct ?? 0}%`,
    `${d.score_docente_global ?? 0} pts`,
  ])

  autoTable(doc, {
    startY: y,
    head: [['Docente', 'Especialidad', 'Total Sesiones', 'Cumplidas', 'Observaciones', '% Solvencia', 'Score Global']],
    body: docenteRows.length > 0 ? docenteRows : [['Sin registros', '—', '—', '—', '—', '—', '—']],
    theme: 'striped',
    headStyles: { fillColor: COLOR.tinta, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
    styles: { fontSize: 8, cellPadding: 2 },
    columnStyles: {
      2: { halign: 'center' },
      3: { halign: 'center' },
      4: { halign: 'center' },
      5: { halign: 'center' },
      6: { halign: 'center', fontStyle: 'bold' },
    },
    margin: { left: 14, right: 14 },
  })

  aplicarDecoracionPagina(doc, titulo, subtitulo)
  doc.save(`Informe_Academico_Semestral_${periodoNombre.replace(/\s+/g, '_')}.pdf`)
}

/**
 * Genera y descarga el PDF de Seguimiento de Tareas Institucionales.
 */
export async function descargarPdfSeguimientoTareas(tareas, departamento = 'ADM') {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const titulo = `Seguimiento de Tareas Institucionales — Depto. ${departamento}`
  const subtitulo = `Bandeja de Tareas · Generado el ${new Date().toLocaleDateString('es-DO', { day: '2-digit', month: 'long', year: 'numeric' })}`

  const rows = tareas.map((t) => [
    t.codigo || '—',
    t.titulo || 'Sin título',
    t.responsable_nombre || t.asignado_a || '—',
    t.prioridad ? t.prioridad.toUpperCase() : 'NORMAL',
    t.estado ? t.estado.replace(/_/g, ' ').toUpperCase() : 'PENDIENTE',
    t.fecha_limite ? String(t.fecha_limite).slice(0, 10) : '—',
  ])

  autoTable(doc, {
    startY: 32,
    head: [['Código', 'Título de Tarea', 'Responsable', 'Prioridad', 'Estado', 'Fecha Límite']],
    body: rows.length > 0 ? rows : [['—', 'Sin tareas registradas', '—', '—', '—', '—']],
    theme: 'striped',
    headStyles: { fillColor: COLOR.primario, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
    styles: { fontSize: 8, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 60 },
      3: { halign: 'center' },
      4: { halign: 'center', fontStyle: 'bold' },
      5: { halign: 'center' },
    },
    margin: { left: 14, right: 14 },
  })

  aplicarDecoracionPagina(doc, titulo, subtitulo)
  doc.save(`Seguimiento_Tareas_${departamento}_${new Date().toISOString().slice(0, 10)}.pdf`)
}

/**
 * Genera y descarga el PDF de Análisis Pedagógico y Curricular de Contenido.
 */
export async function descargarPdfAnalisisContenido(data, periodoTipo = 'mes', periodoLabel = '') {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const tipoTitulo = periodoTipo === 'semana' ? 'Semanal' : periodoTipo === 'semestre' ? 'Semestral' : 'Mensual'
  const titulo = `Análisis Pedagógico y Contenido Curricular (${tipoTitulo})`
  const subtitulo = `Período: ${periodoLabel || 'Corte Operativo'} · Generado el ${new Date().toLocaleDateString('es-DO', { day: '2-digit', month: 'long', year: 'numeric' })}`

  const resumen = data?.resumen || {}
  const foco = Array.isArray(data?.focoTecnico) ? data.focoTecnico : []
  const catedras = Array.isArray(data?.catedrasResumen) ? data.catedrasResumen : []
  const concierto = Array.isArray(data?.repertorioConcierto) ? data.repertorioConcierto : []
  const retos = Array.isArray(data?.retosPedagogicos) ? data.retosPedagogicos : []

  let y = 32

  // 1. Resumen Ejecutivo
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...COLOR.tinta)
  doc.text('1. Balance General de Actividad Pedagógica', 14, y)
  y += 5

  const kpis = [
    [
      { content: 'Sesiones Analizadas', styles: { fontStyle: 'bold' } },
      `${resumen.totalSesionesAnalizadas || 0} clases ejecutadas`,
    ],
    [
      { content: 'Contenidos & Entradas de Bitácora', styles: { fontStyle: 'bold' } },
      `${resumen.totalContenidosRegistrados || 0} registros curriculares`,
    ],
    [
      { content: 'Obras y Estudios en Práctica Activa', styles: { fontStyle: 'bold' } },
      `${resumen.obrasEnProgreso || 0} temas/piezas trabajadas`,
    ],
    [
      { content: 'Repertorio Dominado para Audición/Concierto', styles: { fontStyle: 'bold', textColor: COLOR.exito } },
      `${resumen.obrasDominadasConcierto || 0} obras consolidadas`,
    ],
    [
      { content: 'Puntos Críticos para Refuerzo', styles: { fontStyle: 'bold', textColor: COLOR.alerta } },
      `${resumen.puntosRefuerzoPendientes || 0} aspectos pedagógicos marcados`,
    ],
  ]

  autoTable(doc, {
    startY: y,
    body: kpis,
    theme: 'grid',
    styles: { fontSize: 8.5, cellPadding: 2.5, textColor: COLOR.grafito },
    columnStyles: { 0: { cellWidth: 75, fillColor: COLOR.fondo } },
    margin: { left: 14, right: 14 },
  })

  y = doc.lastAutoTable.finalY + 8

  // 2. Foco Técnico y Metodológico
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...COLOR.tinta)
  doc.text('2. Distribución del Foco Técnico & Metodológico', 14, y)
  y += 4

  const focoRows = foco.map((f) => [
    f.area || '—',
    String(f.cantidad || 0),
    `${f.porcentaje || 0}%`,
  ])

  autoTable(doc, {
    startY: y,
    head: [['Área de Trabajo Pedagógico', 'Frecuencia de Abordaje', '% del Tiempo de Clase']],
    body: focoRows.length > 0 ? focoRows : [['Sin datos', '0', '0%']],
    theme: 'striped',
    headStyles: { fillColor: COLOR.primario, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
    styles: { fontSize: 8, cellPadding: 2 },
    columnStyles: {
      1: { halign: 'center' },
      2: { halign: 'center', fontStyle: 'bold' },
    },
    margin: { left: 14, right: 14 },
  })

  y = doc.lastAutoTable.finalY + 8

  // 3. Síntesis por Cátedra
  if (y > 220) {
    doc.addPage()
    y = 20
  }

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...COLOR.tinta)
  doc.text('3. Síntesis y Nivel de Maduración por Cátedra', 14, y)
  y += 4

  const catedraRows = catedras.map((c) => [
    c.catedra || '—',
    String(c.totalSesiones || 0),
    `${c.tasaDominioPct ?? 0}%`,
    c.temasPrincipales && c.temasPrincipales.length ? c.temasPrincipales.join('; ') : 'En progreso general',
  ])

  autoTable(doc, {
    startY: y,
    head: [['Cátedra / Instrumento', 'Sesiones', '% Maduración', 'Temas & Obras Principales']],
    body: catedraRows.length > 0 ? catedraRows : [['Sin datos de cátedra', '—', '—', '—']],
    theme: 'grid',
    headStyles: { fillColor: COLOR.secundario, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
    styles: { fontSize: 8, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 35 },
      1: { halign: 'center', cellWidth: 20 },
      2: { halign: 'center', fontStyle: 'bold', cellWidth: 25 },
      3: { cellWidth: 'auto' },
    },
    margin: { left: 14, right: 14 },
  })

  y = doc.lastAutoTable.finalY + 8

  // 4. Obras Listas para Concierto
  if (y > 220) {
    doc.addPage()
    y = 20
  }

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...COLOR.tinta)
  doc.text('4. Repertorio Dominado (Apto para Conciertos / Audiciones)', 14, y)
  y += 4

  const conciertoRows = concierto.map((c) => [
    c.fecha || '—',
    c.instrumento || '—',
    c.claseNombre || '—',
    c.tema || '—',
    c.nivelLogro ? c.nivelLogro.toUpperCase() : 'DOMINADO',
  ])

  autoTable(doc, {
    startY: y,
    head: [['Fecha', 'Cátedra', 'Clase', 'Obra / Pieza Consolidada', 'Nivel']],
    body: conciertoRows.length > 0 ? conciertoRows : [['—', '—', '—', 'Sin obras marcadas en nivel dominado en este período', '—']],
    theme: 'striped',
    headStyles: { fillColor: COLOR.exito, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
    styles: { fontSize: 8, cellPadding: 2 },
    columnStyles: {
      4: { halign: 'center', fontStyle: 'bold', textColor: COLOR.exito },
    },
    margin: { left: 14, right: 14 },
  })

  aplicarDecoracionPagina(doc, titulo, subtitulo)
  doc.save(`Analisis_Pedagogico_Contenido_${tipoTitulo}_${new Date().toISOString().slice(0, 10)}.pdf`)
}


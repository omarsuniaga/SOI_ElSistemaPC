import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const BRAND_PRIMARY = [0, 86, 179]
const BRAND_ACCENT = [255, 193, 7]
const BRAND_DARK = [30, 30, 30]
const EMPTY = '—'

function clean(value, fallback = EMPTY) {
  const text = value == null ? '' : String(value).trim()
  return text || fallback
}

function formatDate(rawDate) {
  if (!rawDate) return EMPTY
  try {
    const value = String(rawDate).slice(0, 10)
    const [year, month, day] = value.split('-').map(Number)
    const date = year && month && day ? new Date(year, month - 1, day) : new Date(rawDate)
    return date.toLocaleDateString('es-DO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return EMPTY
  }
}

function drawHeader(doc, title, subtitle) {
  const width = doc.internal.pageSize.getWidth()
  doc.setFillColor(...BRAND_PRIMARY)
  doc.rect(0, 0, width, 26, 'F')
  doc.setFillColor(...BRAND_ACCENT)
  doc.rect(0, 26, width, 2, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.text('El Sistema Punta Cana', 14, 10)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9.5)
  doc.text(title, 14, 17.5)
  doc.setFontSize(7.5)
  doc.text(subtitle, 14, 23.5)
}

function drawFooter(doc, pageNumber, totalPages) {
  const width = doc.internal.pageSize.getWidth()
  const height = doc.internal.pageSize.getHeight()
  doc.setDrawColor(220, 224, 230)
  doc.setLineWidth(0.3)
  doc.line(14, height - 12, width - 14, height - 12)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(120, 120, 120)
  doc.text('SOI — Sistema Operativo Institucional · Planilla Oficial de Cierre y Nómina Docente', 14, height - 7)
  const pageText = `Página ${pageNumber} de ${totalPages}`
  doc.text(pageText, width - 14 - doc.getTextWidth(pageText), height - 7)
}

/**
 * Genera el documento PDF consolidado de nómina docente
 * @param {Array<Object>} maestros - Lista de maestros con métricas de cumplimiento
 * @param {Object} options - { desde, hasta, rangoLabel }
 * @returns {jsPDF} Instancia de jsPDF
 */
export function generarPdfNominaConsolidada(maestros = [], options = {}) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

  const desdeFormatted = formatDate(options.desde)
  const hastaFormatted = formatDate(options.hasta)
  const periodoLabel = options.rangoLabel || `Período: ${desdeFormatted} al ${hastaFormatted}`
  const emisionFecha = new Date().toLocaleString('es-DO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  drawHeader(
    doc,
    'Planilla Consolidada de Validación y Cierre de Nómina Docente',
    `${periodoLabel} · Emitido: ${emisionFecha}`
  )

  // Métricas de Cabecera (KPIs)
  const totalDocentes = maestros.length
  const solventes = maestros.filter(m => m.estado === 'solvente').length
  const conPendientes = maestros.filter(m => m.estado === 'pendiente').length
  const conVencidas = maestros.filter(m => m.estado === 'vencida').length
  const totalSesionesProg = maestros.reduce((acc, m) => acc + (m.totalSesiones || 0), 0)
  const totalSesionesReg = maestros.reduce((acc, m) => acc + (m.registradas || 0), 0)
  const cumplimientoGlobal = totalSesionesProg > 0 ? Math.round((totalSesionesReg / totalSesionesProg) * 100) : 0

  const kpis = [
    ['Docentes Evaluados', String(totalDocentes)],
    ['Solventes para Pago', `${solventes} (${totalDocentes > 0 ? Math.round((solventes / totalDocentes) * 100) : 0}%)`],
    ['Con Pendientes (≤7d)', String(conPendientes)],
    ['Con Vencidas (>7d)', String(conVencidas)],
    ['Total Clases Registradas', `${totalSesionesReg} / ${totalSesionesProg}`],
    ['Cumplimiento Global', `${cumplimientoGlobal}%`],
  ]

  autoTable(doc, {
    startY: 32,
    head: [['MÉTRICA DE CONTROL', 'VALOR CONSOLIDADO', 'MÉTRICA DE CONTROL', 'VALOR CONSOLIDADO', 'MÉTRICA DE CONTROL', 'VALOR CONSOLIDADO']],
    body: [
      [kpis[0][0], kpis[0][1], kpis[1][0], kpis[1][1], kpis[2][0], kpis[2][1]],
      [kpis[3][0], kpis[3][1], kpis[4][0], kpis[4][1], kpis[5][0], kpis[5][1]],
    ],
    theme: 'grid',
    styles: {
      fontSize: 7.5,
      cellPadding: 2,
      textColor: BRAND_DARK,
    },
    headStyles: {
      fillColor: [240, 243, 246],
      textColor: [60, 70, 80],
      fontStyle: 'bold',
      fontSize: 7,
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 42 },
      1: { cellWidth: 50 },
      2: { fontStyle: 'bold', cellWidth: 42 },
      3: { cellWidth: 50 },
      4: { fontStyle: 'bold', cellWidth: 42 },
      5: { cellWidth: 42 },
    },
    margin: { left: 14, right: 14 },
  })

  // Tabla Principal de Maestros
  const bodyRows = maestros.map((m, index) => {
    const nombre = clean(m.maestros?.nombre_completo || m.nombre_completo)
    const especialidad = clean(m.maestros?.especialidad || m.especialidad)
    const programadas = m.totalSesiones ?? 0
    const registradas = m.registradas ?? 0
    const pendientes = m.pendingCount ?? 0
    const vencidas = m.vencidasCount ?? 0
    const porcentaje = programadas > 0 ? `${Math.round((registradas / programadas) * 100)}%` : '100%'

    let estadoSolvencia = 'SOLVENTE'
    if (vencidas > 0) {
      estadoSolvencia = 'BLOQUEADO (VENCIDAS)'
    } else if (pendientes > 0) {
      estadoSolvencia = 'RESTRINGIDO (PENDIENTES)'
    }

    return [
      String(index + 1),
      nombre,
      especialidad,
      String(programadas),
      String(registradas),
      String(pendientes),
      String(vencidas),
      porcentaje,
      estadoSolvencia,
    ]
  })

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 4,
    head: [['#', 'DOCENTE / MAESTRO', 'CÁTEDRA / ESPECIALIDAD', 'PROG.', 'REG.', 'PEND.', 'VENC.', '% CUMP.', 'ESTADO PARA NÓMINA']],
    body: bodyRows,
    theme: 'striped',
    styles: {
      fontSize: 7.5,
      cellPadding: 2.2,
      textColor: BRAND_DARK,
      valign: 'middle',
    },
    headStyles: {
      fillColor: BRAND_PRIMARY,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.5,
      halign: 'center',
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 8 },
      1: { fontStyle: 'bold', cellWidth: 62 },
      2: { cellWidth: 44 },
      3: { halign: 'center', cellWidth: 16 },
      4: { halign: 'center', cellWidth: 16 },
      5: { halign: 'center', cellWidth: 16 },
      6: { halign: 'center', cellWidth: 16 },
      7: { halign: 'center', cellWidth: 20, fontStyle: 'bold' },
      8: { halign: 'center', cellWidth: 70, fontStyle: 'bold' },
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 8) {
        const val = String(data.cell.raw)
        if (val.includes('SOLVENTE')) {
          data.cell.styles.textColor = [16, 185, 129] // Green
        } else if (val.includes('RESTRINGIDO')) {
          data.cell.styles.textColor = [217, 119, 6] // Amber
        } else if (val.includes('BLOQUEADO')) {
          data.cell.styles.textColor = [220, 38, 38] // Red
        }
      }
    },
    margin: { left: 14, right: 14 },
  })

  // Bloque de firmas
  const finalY = doc.lastAutoTable.finalY + 12
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  if (finalY < pageHeight - 35) {
    const colWidth = (pageWidth - 28 - 20) / 3
    const signY = finalY + 14

    // Firma 1: Administración
    doc.setDrawColor(180, 180, 180)
    doc.line(14, signY, 14 + colWidth, signY)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(80, 80, 80)
    doc.text('Elaborado por: Administración Académica', 14 + colWidth / 2, signY + 4, { align: 'center' })

    // Firma 2: Coordinación
    doc.line(14 + colWidth + 10, signY, 14 + colWidth * 2 + 10, signY)
    doc.text('Validado por: Coordinación Docente', 14 + colWidth + 10 + colWidth / 2, signY + 4, { align: 'center' })

    // Firma 3: Dirección / Finanzas
    doc.line(14 + colWidth * 2 + 20, signY, pageWidth - 14, signY)
    doc.text('Aprobado por: Dirección / Finanzas', 14 + colWidth * 2 + 20 + colWidth / 2, signY + 4, { align: 'center' })
  }

  // Footer con paginación
  const totalPages = doc.internal.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    drawFooter(doc, i, totalPages)
  }

  return doc
}

/**
 * Descarga directamente el archivo PDF de la nómina consolidada
 */
export function descargarPdfNominaConsolidada(maestros = [], options = {}) {
  const doc = generarPdfNominaConsolidada(maestros, options)
  const hoyStr = new Date().toISOString().split('T')[0]
  const filename = `nomina-consolidada-docente-${options.desde || hoyStr}-al-${options.hasta || hoyStr}.pdf`
  doc.save(filename)
}

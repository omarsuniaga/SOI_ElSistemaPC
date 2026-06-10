/**
 * perfilPdfExport — Exporta el Perfil de Conocimiento del Alumno a PDF institucional.
 *
 * Dependencias: jspdf, jspdf-autotable
 * Uso:
 *   import { exportPerfilPDF } from './perfilPdfExport.js'
 *   const doc = await exportPerfilPDF(alumno, perfilResult, summary, historial?)
 *   doc.save('perfil-conocimiento-alumno.pdf')
 */

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// ─── Paleta institucional ────────────────────────────────────────────────────
const C = {
  azul: [20, 60, 130],
  azulClaro: [220, 232, 250],
  dorado: [198, 160, 20],
  grisOscuro: [40, 40, 40],
  grisClaro: [245, 245, 248],
  grisMedio: [100, 100, 100],
  verde: [20, 120, 60],
  rojo: [180, 20, 20],
  naranja: [200, 120, 20],
}

const DIMENSION_COLORS = {
  habilidad: [20, 120, 60],
  repertorio: [20, 60, 130],
  tecnica: [40, 150, 180],
  problema: [180, 20, 20],
  objetivo: [200, 120, 20],
}

const MADUREZ_LABEL = ['', 'Inicial', 'En desarrollo', 'Logrado', 'Avanzado', 'Destacado']

/**
 * Generate a complete Perfil de Conocimiento PDF.
 *
 * @param {object} alumno — { nombre_completo, instrumento_principal, nivel_actual }
 * @param {{ data: Array, grouped: object }} perfilResult — from getPerfil()
 * @param {{ total: number, confirmados: number, propuestos: number, dimensiones: string[] }} summary — from getPerfilSummary()
 * @param {Array} [historial] — optional, from getPerfilHistorial()
 * @returns {jsPDF}
 */
export async function exportPerfilPDF(alumno, perfilResult, summary, historial) {
  const doc = new jsPDF({ unit: 'mm', format: 'letter' })
  const pageW = doc.internal.pageSize.getWidth()
  const margin = 18
  const contentW = pageW - margin * 2
  let y = margin

  // ─── Helper: add text with optional max width, returns new y ──────────────
  function _text(text, x, yPos, options = {}) {
    const { size = 10, color = C.grisOscuro, bold = false, maxW } = options
    doc.setFontSize(size)
    doc.setTextColor(...color)
    if (bold) doc.setFont('Helvetica', 'bold')
    else doc.setFont('Helvetica', 'normal')
    if (maxW) {
      const lines = doc.splitTextToSize(String(text), maxW)
      doc.text(lines, x, yPos)
      return yPos + lines.length * size * 0.35
    }
    doc.text(String(text), x, yPos)
    return yPos + size * 0.4
  }

  function _line(yPos) {
    doc.setDrawColor(...C.grisClaro)
    doc.line(margin, yPos, pageW - margin, yPos)
  }

  function _sectionTitle(text, yPos) {
    doc.setFontSize(11)
    doc.setFont('Helvetica', 'bold')
    doc.setTextColor(...C.azul)
    doc.text(text, margin, yPos)
    return yPos + 5
  }

  // ══════════════════════════════════════════════════════════════════════════
  // HEADER
  // ══════════════════════════════════════════════════════════════════════════

  // Top bar
  doc.setFillColor(...C.azul)
  doc.rect(0, 0, pageW, 8, 'F')
  doc.setFontSize(7)
  doc.setTextColor(255, 255, 255)
  doc.setFont('Helvetica', 'normal')
  doc.text('El Sistema Punta Cana — Perfil de Conocimiento del Alumno', margin, 5.5)

  y = 16

  // Title
  doc.setFontSize(16)
  doc.setFont('Helvetica', 'bold')
  doc.setTextColor(...C.azul)
  doc.text('Perfil de Conocimiento', margin, y)
  y += 8

  // Student info block
  doc.setFillColor(...C.grisClaro)
  doc.roundedRect(margin, y, contentW, 22, 2, 2, 'F')
  y += 6

  const leftCol = margin + 4
  const rightCol = margin + contentW / 2 + 4

  y = _text(`Alumno: ${alumno?.nombre_completo || '—'}`, leftCol, y, { bold: true, size: 10 })
  y = _text(`Instrumento: ${alumno?.instrumento_principal || '—'}`, leftCol, y, {
    size: 9,
    color: C.grisMedio,
  })
  y = _text(`Nivel: ${alumno?.nivel_actual || '—'}`, leftCol, y, { size: 9, color: C.grisMedio })

  // Summary on the right
  let ry = y - 16 // align with the first line of left col
  ry = _text(`Total aserciones: ${summary.total}`, rightCol, ry, { size: 9 })
  ry = _text(
    `Confirmadas: ${summary.confirmados} · Propuestas: ${summary.propuestos}`,
    rightCol,
    ry,
    { size: 9, color: C.grisMedio },
  )
  ry = _text(`Dimensiones: ${summary.dimensiones.length}`, rightCol, ry, {
    size: 9,
    color: C.grisMedio,
  })

  y = Math.max(y, ry) + 4

  // ══════════════════════════════════════════════════════════════════════════
  // DIMENSION TABLES
  // ══════════════════════════════════════════════════════════════════════════

  const grouped = perfilResult.grouped || {}
  const dimensions = Object.keys(grouped).sort()

  for (const dim of dimensions) {
    const items = grouped[dim]
    if (!items?.length) continue

    const dimColor = DIMENSION_COLORS[dim] || C.azul
    const label = dim.charAt(0).toUpperCase() + dim.slice(1)

    // Check if we need a new page
    if (y > 230) {
      doc.addPage()
      y = margin
    }

    // Dimension header bar
    doc.setFillColor(...dimColor)
    doc.rect(margin, y, contentW, 6, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(9)
    doc.setFont('Helvetica', 'bold')
    doc.text(label, margin + 3, y + 4.2)
    y += 8

    // Table
    const rows = items.map((a) => [
      a.item || '—',
      MADUREZ_LABEL[a.madurez] || `Nivel ${a.madurez}`,
      a.estado === 'confirmado'
        ? '✓ Confirmado'
        : a.estado === 'propuesto'
          ? '? Propuesto'
          : a.estado,
      a.confianza != null ? `${Math.round(a.confianza * 100)}%` : '—',
      a.evidencia_texto || '—',
    ])

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      tableWidth: contentW,
      head: [['Item / Conocimiento', 'Madurez', 'Estado', 'Confianza', 'Evidencia']],
      body: rows,
      theme: 'plain',
      styles: { fontSize: 7.5, cellPadding: 1.5 },
      headStyles: {
        fillColor: [...dimColor],
        textColor: [255, 255, 255],
        fontSize: 7.5,
        fontStyle: 'bold',
        halign: 'center',
      },
      columnStyles: {
        0: { cellWidth: contentW * 0.3 },
        1: { cellWidth: contentW * 0.14, halign: 'center' },
        2: { cellWidth: contentW * 0.14, halign: 'center' },
        3: { cellWidth: contentW * 0.1, halign: 'center' },
        4: { cellWidth: contentW * 0.32 },
      },
      tableLineColor: [220, 220, 220],
      tableLineWidth: 0.2,
    })

    y = doc.lastAutoTable.finalY + 6
  }

  // ══════════════════════════════════════════════════════════════════════════
  // HISTORIAL (optional)
  // ══════════════════════════════════════════════════════════════════════════

  if (historial?.length) {
    if (y > 200) {
      doc.addPage()
      y = margin
    }

    y = _sectionTitle('Trayectoria de Madurez (historial)', y)
    y += 1

    const histRows = historial.map((h) => [
      new Date(h.created_at).toLocaleDateString('es-DO'),
      MADUREZ_LABEL[h.madurez_anterior] || `${h.madurez_anterior}`,
      MADUREZ_LABEL[h.madurez_nueva] || `${h.madurez_nueva}`,
      h.cambio_origen || '—',
      h.nota || '—',
    ])

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      tableWidth: contentW,
      head: [['Fecha', 'Anterior', 'Nuevo', 'Origen', 'Nota']],
      body: histRows,
      theme: 'plain',
      styles: { fontSize: 7.5, cellPadding: 1.5 },
      headStyles: {
        fillColor: [...C.grisOscuro],
        textColor: [255, 255, 255],
        fontSize: 7.5,
        fontStyle: 'bold',
        halign: 'center',
      },
      columnStyles: {
        0: { cellWidth: contentW * 0.18, halign: 'center' },
        1: { cellWidth: contentW * 0.16, halign: 'center' },
        2: { cellWidth: contentW * 0.16, halign: 'center' },
        3: { cellWidth: contentW * 0.2 },
        4: { cellWidth: contentW * 0.3 },
      },
      tableLineColor: [220, 220, 220],
      tableLineWidth: 0.2,
    })

    y = doc.lastAutoTable.finalY + 6
  }

  // ══════════════════════════════════════════════════════════════════════════
  // FOOTER
  // ══════════════════════════════════════════════════════════════════════════

  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(7)
    doc.setTextColor(...C.grisMedio)
    doc.setFont('Helvetica', 'normal')
    doc.text(
      `Generado el ${new Date().toLocaleDateString('es-DO')} · El Sistema Punta Cana · Página ${i} de ${pageCount}`,
      margin,
      doc.internal.pageSize.getHeight() - 10,
    )
  }

  return doc
}

/**
 * caseDossierPdfGenerator.js — Generador de Actas y Dossiers Oficiales de Cierre de Expedientes SOI
 *
 * Compila un documento PDF formal, foliado e institucional con el resumen
 * ejecutivo del caso, las tareas departamentales ejecutadas, evidencias y rúbrica directiva.
 */

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const COLORS = {
  azulInstitucional: [20, 50, 110],
  azulSecundario: [40, 80, 150],
  dorado: [198, 150, 30],
  blanco: [255, 255, 255],
  grisOscuro: [35, 35, 35],
  grisMedio: [100, 100, 100],
  grisFondo: [248, 249, 250],
  verdeExito: [25, 135, 84],
  rojoAlerta: [220, 53, 69],
  naranjaAviso: [255, 140, 0],
}

const DEPARTAMENTOS = {
  DIR: 'Dirección General',
  ACM: 'Académica',
  ADM: 'Administración',
  FIN: 'Financiero',
  LOG: 'Logística',
  COM: 'Comunicaciones',
  TECNICO: 'Técnico',
  LUT: 'Lutería',
  OPR: 'Operaciones',
}

/**
 * Genera y descarga el Acta Oficial del Expediente SOI en formato PDF.
 * @param {Object} caseDetail - Objeto con { contract, tasks, metrics, correlation_id, closure_summary, ... }
 * @param {Object} [options] - Opciones adicionales (ej. autoDownload: true)
 * @returns {jsPDF} Instancia del documento generado
 */
export function generateCaseDossierPdf(caseDetail = {}, options = { autoDownload: true }) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4', // 210 x 297 mm
  })

  const W = 210
  const M = 15
  const contract = caseDetail.contract || {}
  const tasks = Array.isArray(caseDetail.tasks) ? caseDetail.tasks : []
  const metrics = caseDetail.metrics || { total: tasks.length, completadas: tasks.filter((t) => t.estado === 'completada').length }
  const correlationId = caseDetail.correlation_id || tasks[0]?.correlation_id || 'EXP-SIN-ID'
  const processCode = contract.process_code || tasks[0]?.process_code || 'SOI-PROC'
  const processName = contract.process_name || tasks[0]?.titulo || 'Procedimiento Institucional'
  const ownerDept = DEPARTAMENTOS[contract.department_owner || tasks[0]?.departamento] || contract.department_owner || 'Dirección'
  const closureSummary = caseDetail.closure_summary || 'Procedimiento ejecutado y verificado conforme a los estándares normativos del SOI.'
  const fechaHoy = new Date().toLocaleDateString('es-DO', { day: '2-digit', month: 'long', year: 'numeric' })
  const horaHoy = new Date().toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' })

  // ─── 1. ENCABEZADO INSTITUCIONAL ──────────────────────────────────────────
  doc.setFillColor(...COLORS.azulInstitucional)
  doc.rect(0, 0, W, 30, 'F')
  doc.setFillColor(...COLORS.dorado)
  doc.rect(0, 30, W, 2, 'F')

  doc.setTextColor(...COLORS.blanco)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text('EL SISTEMA PUNTA CANA', M, 12)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(210, 225, 250)
  doc.text('Sistema Operativo Institucional (SOI) · Gobernanza y Process Backbone', M, 18)
  doc.text('Documento Oficial de Auditoría y Trazabilidad Operativa', M, 23)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...COLORS.dorado)
  doc.text('ACTA DE EXPEDIENTE', W - M, 12, { align: 'right' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...COLORS.blanco)
  doc.text(`Foliado: ${correlationId}`, W - M, 18, { align: 'right' })
  doc.text(`Emisión: ${fechaHoy}`, W - M, 23, { align: 'right' })

  let cursorY = 40

  // ─── 2. CARÁTULA DEL EXPEDIENTE ───────────────────────────────────────────
  doc.setTextColor(...COLORS.azulInstitucional)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('1. Datos del Procedimiento Institucional', M, cursorY)
  cursorY += 4

  const infoGrid = [
    [
      { text: 'Código de Proceso:', bold: true }, { text: processCode },
      { text: 'Departamento Rector:', bold: true }, { text: ownerDept },
    ],
    [
      { text: 'Nombre del Procedimiento:', bold: true }, { text: processName },
      { text: 'Nivel de Prioridad:', bold: true }, { text: (tasks[0]?.prioridad || 'Media').toUpperCase() },
    ],
    [
      { text: 'Documento Canónico:', bold: true }, { text: contract.canonical_doc_path || 'Manual de Operaciones SOI' },
      { text: 'Total Tareas Auditadas:', bold: true }, { text: `${metrics.completadas || tasks.length} / ${metrics.total || tasks.length} completadas` },
    ],
  ]

  autoTable(doc, {
    startY: cursorY,
    margin: { left: M, right: M },
    body: infoGrid.map((row) => [
      row[0].text, row[1].text, row[2].text, row[3].text,
    ]),
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2, textColor: COLORS.grisOscuro },
    columnStyles: {
      0: { fontStyle: 'bold', fillColor: COLORS.grisFondo, width: 35 },
      1: { width: 55 },
      2: { fontStyle: 'bold', fillColor: COLORS.grisFondo, width: 40 },
      3: { width: 50 },
    },
  })

  cursorY = doc.lastAutoTable.finalY + 8

  // ─── 3. AUDITORÍA INICIAL / DIAGNÓSTICO (Si existe) ──────────────────────
  const auditSummary = tasks[0]?.metadata?.audit_summary || tasks[0]?.descripcion || null
  if (auditSummary) {
    doc.setTextColor(...COLORS.azulInstitucional)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.text('2. Diagnóstico y Hallazgos de Auditoría Inicial', M, cursorY)
    cursorY += 4

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    doc.setTextColor(...COLORS.grisOscuro)
    const splitSummary = doc.splitTextToSize(auditSummary, W - (M * 2))
    doc.text(splitSummary, M, cursorY)
    cursorY += (splitSummary.length * 4) + 6
  }

  // ─── 4. MATRIZ DE TAREAS Y EJECUCIÓN INTERDEPARTAMENTAL ──────────────────
  doc.setTextColor(...COLORS.azulInstitucional)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text('3. Matriz de Ejecución y Tareas Interdepartamentales', M, cursorY)
  cursorY += 4

  const tasksTableData = tasks.map((t, idx) => {
    const dept = DEPARTAMENTOS[t.departamento] || t.departamento
    const estatus = (t.estado || 'pendiente').toUpperCase()
    const vencimiento = t.fecha_vencimiento ? t.fecha_vencimiento.slice(0, 10) : 'Sin límite'
    const checklistSummary = Array.isArray(t.checklist) && t.checklist.length > 0
      ? ` (${t.checklist.filter((i) => i.completado).length}/${t.checklist.length} items)`
      : ''
    return [
      idx + 1,
      t.titulo + checklistSummary,
      dept,
      estatus,
      t.updated_by_nombre || t.asignado_a || 'Equipo Departamental',
      vencimiento,
    ]
  })

  autoTable(doc, {
    startY: cursorY,
    margin: { left: M, right: M },
    head: [['#', 'Tarea / Compromiso', 'Depto', 'Estatus', 'Responsable', 'Vencimiento']],
    body: tasksTableData.length > 0 ? tasksTableData : [['—', 'Sin tareas registradas', '—', '—', '—', '—']],
    theme: 'striped',
    headStyles: {
      fillColor: COLORS.azulInstitucional,
      textColor: COLORS.blanco,
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'left',
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 2.5,
      textColor: COLORS.grisOscuro,
      valign: 'middle',
    },
    columnStyles: {
      0: { halign: 'center', width: 8 },
      1: { width: 70 },
      2: { width: 30 },
      3: { halign: 'center', width: 22, fontStyle: 'bold' },
      4: { width: 30 },
      5: { halign: 'center', width: 20 },
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 3) {
        const val = String(data.cell.raw).toUpperCase()
        if (val.includes('COMPLETADA')) data.cell.styles.textColor = COLORS.verdeExito
        if (val.includes('BLOQUEADA') || val.includes('CRITICA')) data.cell.styles.textColor = COLORS.rojoAlerta
        if (val.includes('OBSERVADA')) data.cell.styles.textColor = COLORS.naranjaAviso
      }
    },
  })

  cursorY = doc.lastAutoTable.finalY + 8

  // Salto de página si queda poco espacio para la rúbrica y cierre
  if (cursorY > 215) {
    doc.addPage()
    cursorY = 25
  }

  // ─── 5. CUERPO DE EVIDENCIAS Y CRITERIOS DE CIERRE ────────────────────────
  doc.setTextColor(...COLORS.azulInstitucional)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text('4. Evidencias Consignadas y Criterios de Validación', M, cursorY)
  cursorY += 4

  const requiredEv = Array.isArray(contract.required_evidence) && contract.required_evidence.length > 0
    ? contract.required_evidence.map((e) => `• ${e.label || e.type || e}`).join('\n')
    : '• Verificación de listas de asistencia y planes de trabajo docentes.\n• Registro de novedades en bitácora institucional.'

  const splitEv = doc.splitTextToSize(requiredEv, W - (M * 2))
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...COLORS.grisOscuro)
  doc.text(splitEv, M, cursorY)
  cursorY += (splitEv.length * 3.8) + 6

  // ─── 6. DICTAMEN DE CIERRE Y FIRMAS DIGITALES ─────────────────────────────
  doc.setTextColor(...COLORS.azulInstitucional)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text('5. Dictamen de Cierre y Rúbrica Institucional', M, cursorY)
  cursorY += 4

  doc.setFillColor(...COLORS.grisFondo)
  doc.roundedRect(M, cursorY, W - (M * 2), 16, 2, 2, 'F')
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(8)
  doc.setTextColor(...COLORS.grisOscuro)
  const splitClosure = doc.splitTextToSize(`"Resolución: ${closureSummary}"`, W - (M * 2) - 6)
  doc.text(splitClosure, M + 3, cursorY + 5)

  cursorY += 24

  // Cuadros de Firmas
  const colWidth = (W - (M * 2) - 10) / 3
  const firmaY = cursorY + 12

  // Firma 1: Dirección
  doc.setDrawColor(...COLORS.grisMedio)
  doc.line(M, firmaY, M + colWidth, firmaY)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(...COLORS.azulInstitucional)
  doc.text('DIRECCIÓN GENERAL', M + (colWidth / 2), firmaY + 4, { align: 'center' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6.5)
  doc.setTextColor(...COLORS.grisMedio)
  doc.text('Aprobación y Cierre de Expediente', M + (colWidth / 2), firmaY + 7.5, { align: 'center' })

  // Firma 2: Departamento Rector
  const f2X = M + colWidth + 5
  doc.line(f2X, firmaY, f2X + colWidth, firmaY)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(...COLORS.azulInstitucional)
  doc.text(ownerDept.toUpperCase(), f2X + (colWidth / 2), firmaY + 4, { align: 'center' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6.5)
  doc.setTextColor(...COLORS.grisMedio)
  doc.text('Responsable de Ejecución', f2X + (colWidth / 2), firmaY + 7.5, { align: 'center' })

  // Firma 3: Auditor Hermes SOI
  const f3X = f2X + colWidth + 5
  doc.line(f3X, firmaY, f3X + colWidth, firmaY)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(...COLORS.azulInstitucional)
  doc.text('HERMES SOI BACKBONE', f3X + (colWidth / 2), firmaY + 4, { align: 'center' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6.5)
  doc.setTextColor(...COLORS.grisMedio)
  doc.text('Verificación de Integridad Digital', f3X + (colWidth / 2), firmaY + 7.5, { align: 'center' })

  // ─── 7. PIE DE PÁGINA ─────────────────────────────────────────────────────
  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setDrawColor(...COLORS.dorado)
    doc.setLineWidth(0.5)
    doc.line(M, 285, W - M, 285)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(...COLORS.grisMedio)
    doc.text(`Expediente SOI #${correlationId} · Generado el ${fechaHoy} a las ${horaHoy}`, M, 290)
    doc.text(`Página ${i} de ${pageCount}`, W - M, 290, { align: 'right' })
  }

  // Descarga automática si está habilitada
  if (options.autoDownload) {
    const filename = `Acta_Expediente_${processCode.toLowerCase()}_${correlationId.slice(0, 8)}.pdf`
    doc.save(filename)
  }

  return doc
}

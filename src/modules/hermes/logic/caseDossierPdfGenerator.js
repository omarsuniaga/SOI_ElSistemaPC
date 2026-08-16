/**
 * caseDossierPdfGenerator.js — Acta de Cierre (Case Dossier) en PDF para un
 * caso/evento institucional de HERMES: contrato del proceso, resumen de
 * cierre y el detalle de tareas ejecutadas.
 *
 * Mismo membrete institucional y patrón (jsPDF + jspdf-autotable) que
 * src/modules/clases/domain/generarPdfClase.js.
 */
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const C = {
  azul: [20, 60, 130],
  azulClaro: [220, 232, 250],
  dorado: [198, 160, 20],
  blanco: [255, 255, 255],
  grisOscuro: [40, 40, 40],
  grisMedio: [100, 100, 100],
  grisClaro: [245, 245, 248],
}

const W = 215.9
const H = 279.4
const M = 14

function now() {
  return new Date().toLocaleDateString('es-DO', { day: '2-digit', month: 'long', year: 'numeric' })
}

function p(val, fb = '—') {
  const s = String(val ?? '').trim()
  return s || fb
}

function slug(str) {
  return String(str || 'caso')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function header(doc, subtitulo = '') {
  doc.setFillColor(...C.azul)
  doc.rect(0, 0, W, 32, 'F')
  doc.setFillColor(...C.dorado)
  doc.rect(0, 32, W, 2.5, 'F')
  doc.setFillColor(...C.dorado)
  doc.rect(0, 0, 4, 34.5, 'F')
  doc.setTextColor(...C.blanco)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(15)
  doc.text('EL SISTEMA PUNTA CANA', M + 2, 13)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(200, 215, 240)
  doc.text('Tocamos Corazones, Cambiamos Vidas · Punta Cana', M + 2, 20)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...C.dorado)
  doc.text('ACTA DE CIERRE · HERMES', W - M, 13, { align: 'right' })
  if (subtitulo) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(190, 205, 230)
    doc.text(subtitulo, W - M, 20, { align: 'right' })
  }
  doc.setTextColor(...C.grisOscuro)
}

function footer(doc, page) {
  doc.setFillColor(...C.azul)
  doc.rect(0, H - 8, W, 8, 'F')
  doc.setFillColor(...C.dorado)
  doc.rect(0, H - 8, 4, 8, 'F')
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6.5)
  doc.setTextColor(...C.blanco)
  doc.text('El Sistema Punta Cana · Punta Cana, Rep. Dominicana', M + 2, H - 4.5)
  doc.text(`Pág. ${page}`, W - M, H - 4.5, { align: 'right' })
}

const ESTADO_LABEL = {
  completada: 'Completada',
  cancelada: 'Cancelada',
  bloqueada: 'Bloqueada',
  en_progreso: 'En progreso',
  observada: 'Observada',
  pendiente: 'Pendiente',
}

/**
 * @param {object} params
 * @param {Array<{titulo, departamento, estado, prioridad, fecha_vencimiento}>} params.tasks
 * @param {string} params.correlation_id
 * @param {{process_code: string, process_name: string, department_owner: string}} params.contract
 * @param {string} params.closure_summary
 */
export function generateCaseDossierPdf({ tasks = [], correlation_id = '', contract = {}, closure_summary = '' }) {
  const doc = new jsPDF({ unit: 'mm', format: 'letter' })
  const nowDate = now()

  header(doc, `Generado: ${nowDate}`)

  doc.setFillColor(...C.azulClaro)
  doc.roundedRect(M, 42, W - M * 2, 26, 2, 2, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(...C.azul)
  doc.text(p(contract.process_name), M + 4, 49)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...C.grisMedio)
  doc.text(`Proceso: ${p(contract.process_code)}  ·  Departamento: ${p(contract.department_owner)}  ·  ID: ${p(correlation_id)}`, M + 4, 57)

  let y = 74
  if (closure_summary) {
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(8.5)
    doc.setTextColor(...C.grisOscuro)
    const lines = doc.splitTextToSize(closure_summary, W - M * 2)
    doc.text(lines, M, y)
    y += lines.length * 4.5 + 4
  }

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.setTextColor(...C.grisOscuro)
  doc.text(`Tareas del caso: ${tasks.length}`, M, y)
  y += 5

  if (tasks.length > 0) {
    const rows = tasks.map((t) => [
      p(t.departamento),
      p(t.titulo),
      p(t.prioridad),
      ESTADO_LABEL[t.estado] || p(t.estado),
      t.fecha_vencimiento ? String(t.fecha_vencimiento).slice(0, 10) : '—',
    ])
    autoTable(doc, {
      startY: y,
      margin: { top: 44, left: M, right: M },
      theme: 'grid',
      head: [['Depto.', 'Tarea', 'Prioridad', 'Estado', 'Vencimiento']],
      headStyles: { fillColor: C.azul, textColor: C.blanco, fontStyle: 'bold', fontSize: 7.5 },
      styles: { fontSize: 7, cellPadding: { top: 1.5, bottom: 1.5, left: 2, right: 2 }, overflow: 'linebreak' },
      alternateRowStyles: { fillColor: C.grisClaro },
      body: rows,
      didDrawPage: (data) => {
        header(doc, p(contract.process_name))
        footer(doc, data.pageNumber)
      },
    })
  }

  footer(doc, 1)
  doc.save(`acta-cierre-${slug(correlation_id || contract.process_code)}-${new Date().toISOString().slice(0, 10)}.pdf`)
}

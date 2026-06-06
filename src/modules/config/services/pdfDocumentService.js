import jsPDF from 'jspdf'

const C = {
  azul:      [20,  60, 130],
  dorado:    [198, 160,  20],
  blanco:    [255, 255, 255],
  grisOscuro:[40,   40,  40],
  grisMedio: [100, 100, 100],
  grisClaro: [245, 245, 248],
}
const W = 215.9
const H = 279.4
const M = 14
const TW = W - M * 2

function _header(doc, titulo) {
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
  doc.text('Programa de Formación Musical · República Dominicana', M + 2, 20)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...C.dorado)
  doc.text(titulo, W - M, 13, { align: 'right' })
  doc.setTextColor(...C.grisOscuro)
  return 42
}

function _footerAllPages(doc) {
  const total = doc.internal.getNumberOfPages()
  for (let i = 1; i <= total; i++) {
    doc.setPage(i)
    doc.setFillColor(...C.azul)
    doc.rect(0, H - 12, W, 12, 'F')
    doc.setFillColor(...C.dorado)
    doc.rect(0, H - 12, 4, 12, 'F')
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(6.5)
    doc.setTextColor(...C.blanco)
    doc.text('El Sistema Punta Cana · Punta Cana, Rep. Dominicana', M + 2, H - 4.5)
    doc.text(`Pág. ${i} / ${total}`, W - M, H - 4.5, { align: 'right' })
  }
}

export function generateInstitutionalPdf({ title, content, metadata = {} }) {
  const doc    = new jsPDF({ unit: 'mm', format: 'letter' })
  let y        = _header(doc, title)
  const maxY   = H - 18

  if (metadata.alumnoNombre) {
    doc.setFillColor(...C.grisClaro)
    doc.rect(M, y, TW, 7, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(...C.grisOscuro)
    doc.text(`Alumno/a: ${metadata.alumnoNombre}`, M + 3, y + 4.8)
    if (metadata.tipo) {
      doc.text(`Tipo: ${metadata.tipo}`, W - M - 3, y + 4.8, { align: 'right' })
    }
    y += 10
  }

  y += 4

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(...C.grisOscuro)

  const paragraphs = content.split('\n')
  for (const para of paragraphs) {
    if (y > maxY) {
      doc.addPage()
      y = _header(doc, title) + 4
    }
    if (para.trim() === '') { y += 5; continue }
    const lines   = doc.splitTextToSize(para, TW)
    const blockH  = lines.length * 5.5
    if (y + blockH > maxY) {
      doc.addPage()
      y = _header(doc, title) + 4
    }
    doc.text(lines, M, y)
    y += blockH + 2
  }

  _footerAllPages(doc)
  return doc
}

export function downloadPdf(doc, filename) {
  doc.save(filename)
}

export function getPdfBlob(doc) {
  return doc.output('blob')
}

export function buildDocumentFilename({ tipo, alumnoNombre, fecha }) {
  const slug    = (alumnoNombre || 'alumno')
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, 30)
  const tipoSlug = (tipo || 'documento').replace(/_/g, '-')
  const dateStr  = (fecha || new Date().toISOString().slice(0, 10))
  return `${tipoSlug}-${slug}-${dateStr}.pdf`
}

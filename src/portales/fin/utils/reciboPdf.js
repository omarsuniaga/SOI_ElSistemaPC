import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const C = {
  verde:      [5,  150, 105],
  verdeClaro: [209, 250, 229],
  grisOscuro: [30,  41,  59],
  grisMedio:  [100, 116, 139],
  grisClaro:  [248, 250, 252],
  blanco:     [255, 255, 255],
}

function reciboPadded(num) {
  return String(num).padStart(6, '0')
}

export function generarReciboCobro({ alumno, meses, monto, metodo, cajero, numero }) {
  const doc = new jsPDF({ unit: 'mm', format: 'a5', orientation: 'portrait' })
  const W = 148
  const fecha = new Date().toLocaleDateString('es-DO', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

  // ── Header band ─────────────────────────────────────────────────────────────
  doc.setFillColor(...C.verde)
  doc.rect(0, 0, W, 28, 'F')

  doc.setTextColor(...C.blanco)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('El Sistema Punta Cana', 10, 11)

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('Recibo de Pago de Mensualidad', 10, 17)
  doc.text(`N° ${reciboPadded(numero)}`, 10, 23)
  doc.text(fecha, W - 10, 23, { align: 'right' })

  // ── Student info ─────────────────────────────────────────────────────────────
  doc.setTextColor(...C.grisOscuro)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('Alumno', 10, 36)
  doc.setFont('helvetica', 'normal')
  doc.text(alumno.nombre_completo, 10, 42)

  // ── Payment table ─────────────────────────────────────────────────────────────
  const rows = meses.map(m => [
    m.label,
    'Mensualidad',
    `RD$ ${(600).toLocaleString('es-DO')}`,
  ])

  autoTable(doc, {
    startY: 48,
    head: [['Período', 'Concepto', 'Monto']],
    body: rows,
    foot: [['', 'TOTAL', `RD$ ${monto.toLocaleString('es-DO')}`]],
    headStyles: { fillColor: C.verde, textColor: C.blanco, fontSize: 9, fontStyle: 'bold' },
    bodyStyles: { fontSize: 9, textColor: C.grisOscuro },
    footStyles: {
      fillColor: C.verdeClaro, textColor: C.grisOscuro,
      fontSize: 9, fontStyle: 'bold',
    },
    alternateRowStyles: { fillColor: C.grisClaro },
    margin: { left: 10, right: 10 },
    columnStyles: { 2: { halign: 'right' } },
  })

  const afterTable = doc.lastAutoTable.finalY + 8

  // ── Payment method + cashier ─────────────────────────────────────────────────
  doc.setFontSize(8.5)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...C.grisMedio)
  doc.text('Método de pago:', 10, afterTable)
  doc.text('Atendido por:', 10, afterTable + 5)

  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...C.grisOscuro)
  doc.text(metodo, 45, afterTable)
  doc.text(cajero, 45, afterTable + 5)

  // ── Footer ───────────────────────────────────────────────────────────────────
  doc.setFillColor(...C.verde)
  doc.rect(0, 200, W, 10, 'F')
  doc.setTextColor(...C.blanco)
  doc.setFontSize(7)
  doc.text('Este documento es un comprobante oficial de pago. Consérvelo para sus registros.', W / 2, 206, { align: 'center' })

  const nombre = alumno.nombre_completo.replace(/\s+/g, '-').toLowerCase()
  doc.save(`recibo-${nombre}-${reciboPadded(numero)}.pdf`)
}

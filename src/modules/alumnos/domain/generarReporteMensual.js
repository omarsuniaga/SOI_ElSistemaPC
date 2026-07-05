/**
 * Generador de reporte mensual de inscripciones — El Sistema Punta Cana
 */

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const BRAND_PRIMARY = [0, 86, 179]
const BRAND_ACCENT  = [255, 193, 7]
const BRAND_DARK    = [30, 30, 30]

const MESES = [
  '', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

function pad(val, fallback = '—') {
  const s = String(val ?? '').trim()
  return s || fallback
}

function edad(fechaStr) {
  if (!fechaStr) return '—'
  try {
    const [y, m, d] = fechaStr.split('-').map(Number)
    const hoy = new Date()
    let age = hoy.getFullYear() - y
    if (hoy.getMonth() + 1 < m || (hoy.getMonth() + 1 === m && hoy.getDate() < d)) age--
    return String(age)
  } catch { return '—' }
}

function interesLabel(val) {
  return { cantar: 'Cantar', instrumento: 'Instrumento', ambas: 'Ambas' }[val] ?? pad(val)
}

function drawHeader(doc, title, subtitle) {
  const W = doc.internal.pageSize.getWidth()
  doc.setFillColor(...BRAND_PRIMARY)
  doc.rect(0, 0, W, 26, 'F')
  doc.setFillColor(...BRAND_ACCENT)
  doc.rect(0, 26, W, 2, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('El Sistema Punta Cana', 14, 10)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(title, 14, 18)
  doc.setFontSize(7.5)
  doc.text(subtitle, 14, 24)
  doc.setTextColor(...BRAND_DARK)
}

function drawFooter(doc, page, total) {
  const W = doc.internal.pageSize.getWidth()
  const H = doc.internal.pageSize.getHeight()
  doc.setFillColor(...BRAND_PRIMARY)
  doc.rect(0, H - 8, W, 8, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(6.5)
  const fecha = new Date().toLocaleDateString('es-DO', { day: '2-digit', month: 'long', year: 'numeric' })
  doc.text(`El Sistema Punta Cana — Generado: ${fecha}`, 10, H - 3)
  doc.text(`Página ${page} de ${total}`, W - 10, H - 3, { align: 'right' })
}

/**
 * Genera el PDF del reporte mensual de inscripciones.
 *
 * @param {object[]} alumnos  - lista de alumnos del mes
 * @param {number}   year
 * @param {number}   month    - 1-based
 * @returns {jsPDF}
 */
export function generarReporteMensual(alumnos, year, month) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'letter' })
  const W = doc.internal.pageSize.getWidth()
  const mesLabel = `${MESES[month]} ${year}`
  const generadoEn = new Date().toLocaleDateString('es-DO', { day: '2-digit', month: 'long', year: 'numeric' })

  // ── Portada / resumen ──────────────────────────────────────────────────
  drawHeader(doc,
    `REPORTE DE INSCRIPCIONES — ${mesLabel.toUpperCase()}`,
    `Generado: ${generadoEn} · Total inscritos: ${alumnos.length}`
  )

  // Cuadro de estadísticas rápidas
  const totalConConocimientos  = alumnos.filter(a => a.tiene_conocimientos_musicales === true).length
  const totalSinConocimientos  = alumnos.filter(a => a.tiene_conocimientos_musicales === false || a.requiere_iniciacion_musical).length
  const totalSubsidio          = alumnos.filter(a => a.beneficiario_subsidio_estado === true).length
  const totalMonoparental      = alumnos.filter(a => a.familia_monoparental === true).length
  const totalAutorizaFotos     = alumnos.filter(a => a.autoriza_fotos_redes === true).length

  autoTable(doc, {
    startY: 36,
    margin: { left: 10, right: 10 },
    theme: 'grid',
    head: [['Total inscritos', 'Con conocimientos', 'Requieren iniciación', 'Beneficiarios subsidio', 'Fam. monoparental', 'Autorizan fotos']],
    body: [[
      alumnos.length,
      totalConConocimientos,
      totalSinConocimientos,
      totalSubsidio,
      totalMonoparental,
      totalAutorizaFotos,
    ]],
    headStyles: { fillColor: BRAND_PRIMARY, textColor: 255, fontStyle: 'bold', fontSize: 8, halign: 'center' },
    bodyStyles: { halign: 'center', fontSize: 11, fontStyle: 'bold' },
  })

  // ── Tabla principal ────────────────────────────────────────────────────
  const tableStartY = doc.lastAutoTable.finalY + 6

  const rows = alumnos.map((a, i) => [
    i + 1,
    pad(a.nombre_completo),
    edad(a.fecha_nacimiento),
    pad(a.nacionalidad),
    pad(a.municipio_residencia),
    pad(a.representante_nombre) + '\n' + pad(a.representante_tlf),
    interesLabel(a.interes_musical),
    pad(a.instrumento_interes),
    a.requiere_iniciacion_musical ? 'Sí' : 'No',
    a.acepta_pago_600 ? 'Sí' : 'No',
  ])

  autoTable(doc, {
    startY: tableStartY,
    margin: { left: 10, right: 10 },
    theme: 'striped',
    head: [['#', 'Nombre completo', 'Edad', 'Nac.', 'Municipio', 'Representante / Tlf', 'Interés', 'Instrumento', 'Iniciación', 'Pagó 600']],
    body: rows,
    headStyles: { fillColor: BRAND_PRIMARY, textColor: 255, fontStyle: 'bold', fontSize: 7.5 },
    bodyStyles: { fontSize: 7, cellPadding: 1.5 },
    alternateRowStyles: { fillColor: [240, 245, 255] },
    columnStyles: {
      0:  { cellWidth: 7,  halign: 'center' },
      1:  { cellWidth: 42 },
      2:  { cellWidth: 10, halign: 'center' },
      3:  { cellWidth: 14 },
      4:  { cellWidth: 20 },
      5:  { cellWidth: 42 },
      6:  { cellWidth: 16 },
      7:  { cellWidth: 22 },
      8:  { cellWidth: 15, halign: 'center' },
      9:  { cellWidth: 14, halign: 'center' },
    },
    didDrawPage: (data) => {
      const totalPages = doc.internal.getNumberOfPages()
      drawFooter(doc, data.pageNumber, totalPages)
    },
  })

  // ── Segunda tabla: datos socioculturales (nueva página) ───────────────
  if (alumnos.length > 0) {
    doc.addPage()
    drawHeader(doc,
      `PERFIL SOCIOCULTURAL — ${mesLabel.toUpperCase()}`,
      `Información motivacional y social de los alumnos inscritos`
    )

    const rowsSocial = alumnos.map((a, i) => [
      i + 1,
      pad(a.nombre_completo),
      pad(a.centro_estudios),
      pad(a.grado_nivel),
      a.padres_en_vida === 'ambos' ? 'Ambos' : a.padres_en_vida === 'solo_madre' ? 'Solo madre' : a.padres_en_vida === 'solo_padre' ? 'Solo padre' : a.padres_en_vida === 'ninguno' ? 'Ninguno' : '—',
      a.familia_monoparental ? 'Sí' : 'No',
      a.beneficiario_subsidio_estado ? 'Sí' : 'No',
      pad(a.por_que_unirse).slice(0, 80) + (pad(a.por_que_unirse).length > 80 ? '…' : ''),
      pad(a.musico_favorito),
    ])

    autoTable(doc, {
      startY: 36,
      margin: { left: 10, right: 10 },
      theme: 'striped',
      head: [['#', 'Nombre', 'Colegio', 'Grado', 'Padres en vida', 'Monopar.', 'Subsidio', '¿Por qué se unió?', 'Músico favorito']],
      body: rowsSocial,
      headStyles: { fillColor: BRAND_PRIMARY, textColor: 255, fontStyle: 'bold', fontSize: 7.5 },
      bodyStyles: { fontSize: 7, cellPadding: 1.5 },
      alternateRowStyles: { fillColor: [240, 245, 255] },
      columnStyles: {
        0: { cellWidth: 7, halign: 'center' },
        1: { cellWidth: 38 },
        2: { cellWidth: 38 },
        3: { cellWidth: 16 },
        4: { cellWidth: 20 },
        5: { cellWidth: 14, halign: 'center' },
        6: { cellWidth: 14, halign: 'center' },
        7: { cellWidth: 55 },
        8: { cellWidth: 28 },
      },
      didDrawPage: (data) => {
        const totalPages = doc.internal.getNumberOfPages()
        drawFooter(doc, data.pageNumber, totalPages)
      },
    })
  }

  // Fix footer page count now that all pages are known
  const totalPages = doc.internal.getNumberOfPages()
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p)
    drawFooter(doc, p, totalPages)
  }

  return doc
}

/**
 * Descarga el reporte mensual como PDF.
 */
export function descargarReporteMensual(alumnos, year, month) {
  const MESES_SHORT = ['', 'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
  const doc = generarReporteMensual(alumnos, year, month)
  doc.save(`reporte-inscripciones-${MESES_SHORT[month]}-${year}.pdf`)
}

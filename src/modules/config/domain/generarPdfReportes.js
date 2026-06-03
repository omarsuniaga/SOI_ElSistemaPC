import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const C = {
  azul:      [20,  60, 130],
  dorado:    [198, 160,  20],
  blanco:    [255, 255, 255],
  grisOscuro:[40,   40,  40],
  grisMedio: [100, 100, 100],
  grisClaro: [245, 245, 248],
  azulClaro: [220, 232, 250],
}
const W_L = 279.4  // landscape width
const H_L = 215.9  // landscape height
const M   = 14

function _now() {
  return new Date().toLocaleDateString('es-DO', { day: '2-digit', month: 'long', year: 'numeric' })
}
function _p(val, fb = '—') { const s = String(val ?? '').trim(); return s || fb }
function _fecha(f) {
  if (!f) return '—'
  try { const [y, mo, d] = f.split('-'); return `${d}/${mo}/${y}` } catch { return f }
}

function _header(doc, titulo, subtitulo = '') {
  const w = doc.internal.pageSize.getWidth()
  doc.setFillColor(...C.azul)
  doc.rect(0, 0, w, 32, 'F')
  doc.setFillColor(...C.dorado)
  doc.rect(0, 32, w, 2.5, 'F')
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
  doc.text(titulo, w - M, 13, { align: 'right' })
  if (subtitulo) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(190, 205, 230)
    doc.text(subtitulo, w - M, 20, { align: 'right' })
  }
  doc.setTextColor(...C.grisOscuro)
  return 42
}

function _footerAllPages(doc) {
  const total = doc.internal.getNumberOfPages()
  const h = doc.internal.pageSize.getHeight()
  const w = doc.internal.pageSize.getWidth()
  for (let i = 1; i <= total; i++) {
    doc.setPage(i)
    doc.setFillColor(...C.azul)
    doc.rect(0, h - 12, w, 12, 'F')
    doc.setFillColor(...C.dorado)
    doc.rect(0, h - 12, 4, 12, 'F')
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(6.5)
    doc.setTextColor(...C.blanco)
    doc.text('El Sistema Punta Cana · Punta Cana, Rep. Dominicana', M + 2, h - 4.5)
    doc.text(`Pág. ${i} / ${total}`, w - M, h - 4.5, { align: 'right' })
  }
}

// ── Report 1: Lista de alumnos activos ───────────────────────────────────────

/**
 * @param {object[]} alumnos  — already filtered by caller (active-only, optional instrument filter)
 * @param {string}   subtitulo
 * @returns {jsPDF}
 */
export function generarListaAlumnos(alumnos, subtitulo = '') {
  const doc = new jsPDF({ unit: 'mm', format: 'letter', orientation: 'landscape' })
  const sub = subtitulo || _now()
  let y = _header(doc, 'LISTA DE ALUMNOS ACTIVOS', sub)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(...C.grisMedio)
  doc.text(`Total: ${alumnos.length} alumno(s)   ·   Generado: ${_now()}`, M, y)
  y += 6

  autoTable(doc, {
    startY: y,
    margin: { left: M, right: M },
    theme: 'grid',
    head: [['#', 'Nombre', 'Instrumento', 'Nivel', 'Representante', 'Teléfono', 'Correo', 'Inscrito']],
    headStyles: { fillColor: C.azul, textColor: C.blanco, fontStyle: 'bold', fontSize: 7.5 },
    styles: { fontSize: 7, cellPadding: { top: 1.5, bottom: 1.5, left: 2, right: 2 }, overflow: 'linebreak' },
    alternateRowStyles: { fillColor: C.grisClaro },
    columnStyles: {
      0: { cellWidth: 8 },
      6: { cellWidth: 45 },
    },
    body: alumnos.map((a, i) => [
      i + 1,
      _p(a.nombre_completo),
      _p(a.instrumento_principal),
      _p(a.nivel_actual),
      _p(a.representante_nombre),
      _p(a.representante_tlf),
      _p(a.correo_representante),
      _fecha(a.created_at),
    ]),
    didDrawPage: () => _header(doc, 'LISTA DE ALUMNOS ACTIVOS', sub),
  })

  _footerAllPages(doc)
  return doc
}

export function descargarListaAlumnos(alumnos, subtitulo) {
  const doc = generarListaAlumnos(alumnos, subtitulo)
  const now = new Date().toISOString().slice(0, 10)
  doc.save(`lista-alumnos-${now}.pdf`)
}

// ── Report 2: Alumnos inscritos por rango de fecha ───────────────────────────

/**
 * @param {object[]} alumnos  — already filtered by date range by caller
 * @param {string}   desde    — ISO date "YYYY-MM-DD"
 * @param {string}   hasta    — ISO date "YYYY-MM-DD"
 * @returns {jsPDF}
 */
export function generarAlumnosInscritos(alumnos, desde, hasta) {
  const doc   = new jsPDF({ unit: 'mm', format: 'letter', orientation: 'landscape' })
  const rango = `${_fecha(desde)} — ${_fecha(hasta)}`
  let y = _header(doc, 'ALUMNOS INSCRITOS', rango)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(...C.grisMedio)
  doc.text(`Total: ${alumnos.length} alumno(s) en el período   ·   Generado: ${_now()}`, M, y)
  y += 6

  autoTable(doc, {
    startY: y,
    margin: { left: M, right: M },
    theme: 'grid',
    head: [['#', 'Nombre', 'Instrumento', 'Representante', 'Teléfono', 'Correo', 'Fecha inscripción']],
    headStyles: { fillColor: C.azul, textColor: C.blanco, fontStyle: 'bold', fontSize: 7.5 },
    styles: { fontSize: 7, cellPadding: { top: 1.5, bottom: 1.5, left: 2, right: 2 }, overflow: 'linebreak' },
    alternateRowStyles: { fillColor: C.grisClaro },
    columnStyles: {
      0: { cellWidth: 8 },
      5: { cellWidth: 45 },
    },
    body: alumnos.map((a, i) => [
      i + 1,
      _p(a.nombre_completo),
      _p(a.instrumento_principal),
      _p(a.representante_nombre),
      _p(a.representante_tlf),
      _p(a.correo_representante),
      _fecha(a.created_at),
    ]),
    didDrawPage: () => _header(doc, 'ALUMNOS INSCRITOS', rango),
  })

  _footerAllPages(doc)
  return doc
}

export function descargarAlumnosInscritos(alumnos, desde, hasta) {
  const doc = generarAlumnosInscritos(alumnos, desde, hasta)
  doc.save(`inscritos-${desde}-a-${hasta}.pdf`)
}

// ── Report 3: Directorio de maestros ─────────────────────────────────────────

/**
 * @param {object[]} maestros — each with { nombre, instrumento, email, telefono, bio, clases? }
 * @returns {jsPDF}
 */
export function generarListaMaestros(maestros) {
  const doc = new jsPDF({ unit: 'mm', format: 'letter', orientation: 'landscape' })
  let y = _header(doc, 'DIRECTORIO DE MAESTROS', _now())

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(...C.grisMedio)
  doc.text(`Total: ${maestros.length} maestro(s)   ·   Generado: ${_now()}`, M, y)
  y += 6

  autoTable(doc, {
    startY: y,
    margin: { left: M, right: M },
    theme: 'grid',
    head: [['#', 'Nombre', 'Especialidad', 'Correo', 'Teléfono', 'Clases asignadas', 'Reseña']],
    headStyles: { fillColor: C.azul, textColor: C.blanco, fontStyle: 'bold', fontSize: 7.5 },
    styles: { fontSize: 7, cellPadding: { top: 1.5, bottom: 1.5, left: 2, right: 2 }, overflow: 'linebreak' },
    alternateRowStyles: { fillColor: C.grisClaro },
    columnStyles: {
      0: { cellWidth: 8 },
      5: { cellWidth: 50 },
      6: { cellWidth: 55 },
    },
    body: maestros.map((m, i) => {
      const clases = Array.isArray(m.clases) && m.clases.length
        ? m.clases.map(c => c.nombre ?? c).join('\n')
        : '—'
      return [
        i + 1,
        _p(m.nombre),
        _p(m.instrumento),
        _p(m.email),
        _p(m.telefono),
        clases,
        _p(m.bio),
      ]
    }),
    didDrawPage: () => _header(doc, 'DIRECTORIO DE MAESTROS', _now()),
  })

  _footerAllPages(doc)
  return doc
}

export function descargarListaMaestros(maestros) {
  const doc = generarListaMaestros(maestros)
  const now = new Date().toISOString().slice(0, 10)
  doc.save(`maestros-${now}.pdf`)
}

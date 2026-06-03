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
const W = 215.9
const H = 279.4
const M = 14

function _now() {
  return new Date().toLocaleDateString('es-DO', { day: '2-digit', month: 'long', year: 'numeric' })
}
function _p(val, fb = '—') { const s = String(val ?? '').trim(); return s || fb }
function _fecha(f) {
  if (!f) return '—'
  try { const [y, mo, d] = f.split('-'); return `${d}/${mo}/${y}` } catch { return f }
}
function _edad(f) {
  if (!f) return '—'
  try {
    const [y, mo, d] = f.split('-').map(Number)
    const hoy = new Date()
    let e = hoy.getFullYear() - y
    if (hoy.getMonth() + 1 < mo || (hoy.getMonth() + 1 === mo && hoy.getDate() < d)) e--
    return `${e} años`
  } catch { return '—' }
}

function _header(doc, titulo, subtitulo = '') {
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
  if (subtitulo) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(190, 205, 230)
    doc.text(subtitulo, W - M, 20, { align: 'right' })
  }
  doc.setTextColor(...C.grisOscuro)
  return 38
}

function _footer(doc, pageNum) {
  doc.setFillColor(...C.azul)
  doc.rect(0, H - 12, W, 12, 'F')
  doc.setFillColor(...C.dorado)
  doc.rect(0, H - 12, 4, 12, 'F')
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6.5)
  doc.setTextColor(...C.blanco)
  doc.text('El Sistema Punta Cana · Punta Cana, Rep. Dominicana', M + 2, H - 4.5)
  doc.text(`Pág. ${pageNum}`, W - M, H - 4.5, { align: 'right' })
}

function _sectionBar(doc, label, y, color = C.azul) {
  doc.setFillColor(...color)
  doc.rect(M, y, W - M * 2, 6.5, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...C.blanco)
  doc.text(label, M + 3, y + 4.4)
  doc.setTextColor(...C.grisOscuro)
  return y + 7.5
}

function _tabla(doc, body, y, labelW = 52) {
  autoTable(doc, {
    startY: y,
    margin: { left: M, right: M },
    theme: 'grid',
    styles: {
      fontSize: 7.5,
      cellPadding: { top: 1.2, bottom: 1.2, left: 2.5, right: 2.5 },
      lineColor: [210, 215, 225],
      lineWidth: 0.2,
      textColor: C.grisOscuro,
      font: 'helvetica',
    },
    alternateRowStyles: { fillColor: C.grisClaro },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: labelW, fillColor: C.azulClaro, textColor: C.azul },
    },
    body,
  })
  return doc.lastAutoTable.finalY + 2.5
}

function _check(doc, y, needed, pageRef, titulo, nombre) {
  if (y + needed > H - 22) {
    _footer(doc, pageRef.n)
    pageRef.n++
    doc.addPage()
    return _header(doc, titulo, `Continuación · ${nombre}`)
  }
  return y
}

function _appendFicha(doc, alumno, pageRef) {
  const titulo = 'FICHA TÉCNICA DEL ALUMNO'
  const nombre = _p(alumno.nombre_completo)
  const now    = _now()

  doc.addPage()
  pageRef.n++
  let y = _header(doc, titulo, `Generado: ${now}`)

  // Watermark
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(55)
  doc.setTextColor(235, 240, 252)
  doc.text('USO INTERNO', W / 2, H / 2, { align: 'center', angle: 45 })
  doc.setTextColor(...C.grisOscuro)

  // Name block
  doc.setFillColor(...C.azulClaro)
  doc.roundedRect(M, y, W - M * 2, 18, 2, 2, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(...C.azul)
  doc.text(nombre, M + 4, y + 7)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(...C.grisMedio)
  const meta = [
    `Edad: ${_edad(alumno.fecha_nacimiento)}`,
    `F. Nac.: ${_fecha(alumno.fecha_nacimiento)}`,
    `Instrumento: ${_p(alumno.instrumento_principal)}`,
    `Nivel: ${_p(alumno.nivel_actual)}`,
  ].join('    ·    ')
  doc.text(meta, M + 4, y + 14)
  doc.setTextColor(...C.grisOscuro)
  y += 22

  // Personal
  y = _check(doc, y, 30, pageRef, titulo, nombre)
  y = _sectionBar(doc, 'DATOS PERSONALES', y)
  y = _tabla(doc, [
    ['Nombre completo',  _p(alumno.nombre_completo)],
    ['Fecha nacimiento', _fecha(alumno.fecha_nacimiento)],
    ['Edad',            _edad(alumno.fecha_nacimiento)],
    ['Género',          _p(alumno.genero)],
    ['Nacionalidad',    _p(alumno.nacionalidad)],
    ['Municipio',       _p(alumno.municipio_residencia)],
    ['Dirección',       _p(alumno.sector_calle_numero)],
    ['Tel. alumno',     _p(alumno.tlf_alumno)],
    ['Cómo se enteró',  _p(alumno.como_se_entero)],
  ], y)

  // Representative
  y = _check(doc, y, 30, pageRef, titulo, nombre)
  y = _sectionBar(doc, 'REPRESENTANTE', y)
  y = _tabla(doc, [
    ['Nombre',      _p(alumno.representante_nombre)],
    ['Parentesco',  _p(alumno.representante_parentesco)],
    ['Cédula',      _p(alumno.representante_cedula)],
    ['Teléfono',    _p(alumno.representante_tlf)],
    ['Correo',      _p(alumno.correo_representante)],
    ['Madre',       _p(alumno.madre_nombre)],
    ['Tel. madre',  _p(alumno.madre_tlf_whatsapp)],
    ['Padre',       _p(alumno.padre_nombre)],
    ['Tel. padre',  _p(alumno.padre_tlf_whatsapp)],
  ], y)

  // Musical
  y = _check(doc, y, 25, pageRef, titulo, nombre)
  y = _sectionBar(doc, 'DATOS MUSICALES', y)
  y = _tabla(doc, [
    ['Instrumento',            _p(alumno.instrumento_principal)],
    ['Nivel actual',           _p(alumno.nivel_actual)],
    ['Interés musical',        _p(alumno.interes_musical)],
    ['Instrumento de interés', _p(alumno.instrumento_interes)],
    ['Conocimientos previos',  alumno.tiene_conocimientos_musicales ? 'Sí' : 'No'],
    ['Nivel lectura musical',  _p(alumno.nivel_lectura_musical)],
  ], y)

  // Academic
  y = _check(doc, y, 20, pageRef, titulo, nombre)
  y = _sectionBar(doc, 'DATOS ACADÉMICOS', y)
  y = _tabla(doc, [
    ['Centro de estudios', _p(alumno.centro_estudios)],
    ['Grado/Nivel',        _p(alumno.grado_nivel)],
    ['Sabe leer',          alumno.sabe_leer ? 'Sí' : 'No'],
    ['Sabe escribir',      alumno.sabe_escribir ? 'Sí' : 'No'],
  ], y)

  // Health
  y = _check(doc, y, 20, pageRef, titulo, nombre)
  y = _sectionBar(doc, 'SALUD', y)
  y = _tabla(doc, [
    ['Alergias',          alumno.tiene_alergias ? _p(alumno.alergias_descripcion) : 'No'],
    ['Cond. transmisible', alumno.tiene_condicion_transmisible ? _p(alumno.condicion_transmisible_descripcion) : 'No'],
    ['Alerg. medicamento', alumno.alergia_medicamento ? _p(alumno.alergia_medicamento_descripcion) : 'No'],
    ['Conducta',           _p(alumno.problemas_conducta)],
  ], y)

  _footer(doc, pageRef.n)
}

/**
 * Generates a single multi-page PDF:
 * - Page 1: cover with index table of all alumnos
 * - Pages 2+: one ficha técnica per alumno
 *
 * @param {object[]} alumnos
 * @param {string}   titulo
 * @returns {jsPDF}
 */
export function generarFichasLote(alumnos, titulo = 'Fichas Técnicas — Lote') {
  if (!alumnos || alumnos.length === 0) {
    throw new Error('No hay alumnos para generar el lote')
  }

  const doc     = new jsPDF({ unit: 'mm', format: 'letter' })
  const pageRef = { n: 1 }
  const now     = _now()

  // Cover page
  let y = _header(doc, titulo, `Generado: ${now}`)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...C.azul)
  doc.text(`Total de alumnos: ${alumnos.length}`, M, y + 8)
  y += 16

  autoTable(doc, {
    startY: y,
    margin: { left: M, right: M },
    theme: 'grid',
    head: [['#', 'Nombre', 'Instrumento', 'Nivel', 'Representante']],
    headStyles: { fillColor: C.azul, textColor: C.blanco, fontStyle: 'bold', fontSize: 8 },
    styles: { fontSize: 7.5, cellPadding: { top: 1.5, bottom: 1.5, left: 2.5, right: 2.5 } },
    alternateRowStyles: { fillColor: C.grisClaro },
    body: alumnos.map((a, i) => [
      i + 1,
      _p(a.nombre_completo),
      _p(a.instrumento_principal),
      _p(a.nivel_actual),
      _p(a.representante_nombre),
    ]),
  })

  _footer(doc, 1)

  // One ficha per alumno
  alumnos.forEach(alumno => _appendFicha(doc, alumno, pageRef))

  return doc
}

export function descargarFichasLote(alumnos, titulo) {
  const doc = generarFichasLote(alumnos, titulo)
  const now = new Date().toISOString().slice(0, 10)
  doc.save(`fichas-lote-${now}.pdf`)
}

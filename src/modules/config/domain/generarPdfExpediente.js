import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const C = {
  azul:      [20,  60, 130],
  azulMedio: [40,  90, 170],
  azulClaro: [220, 232, 250],
  dorado:    [198, 160,  20],
  blanco:    [255, 255, 255],
  grisOscuro:[40,   40,  40],
  grisMedio: [100, 100, 100],
  grisClaro: [245, 245, 248],
  verde:     [20,  120,  60],
  rojo:      [180,  20,  20],
  naranja:   [200, 100,  20],
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
  try { const parts = f.slice(0, 10).split('-'); return `${parts[2]}/${parts[1]}/${parts[0]}` } catch { return f }
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

function _footerAllPages(doc) {
  const total = doc.internal.getNumberOfPages()
  for (let i = 1; i <= total; i++) {
    doc.setPage(i)
    _footer(doc, i)
  }
}

function _sectionDivider(doc, label, y, color = C.azul) {
  doc.setFillColor(...color)
  doc.rect(M, y, W - M * 2, 7, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.setTextColor(...C.blanco)
  doc.text(label, M + 3, y + 4.8)
  doc.setTextColor(...C.grisOscuro)
  return y + 9
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
  return doc.lastAutoTable.finalY + 3
}

function _check(doc, y, needed, pageRef, titulo, nombre) {
  if (y + needed > H - 22) {
    _footer(doc, pageRef.n)
    pageRef.n++
    doc.addPage()
    return _header(doc, titulo, `Expediente: ${nombre}`)
  }
  return y
}

// ─── Section renderers ────────────────────────────────────────────────────────

function _renderFicha(doc, alumno, y, pageRef, titulo) {
  const nombre = _p(alumno.nombre_completo)

  y = _check(doc, y, 10, pageRef, titulo, nombre)
  y = _sectionDivider(doc, '1. DATOS PERSONALES', y, C.azul)

  // Name card
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
    `Instrumento: ${_p(alumno.instrumento_principal)}`,
    `Nivel: ${_p(alumno.nivel_actual)}`,
  ].filter(Boolean).join('    ·    ')
  doc.text(meta, M + 4, y + 14)
  doc.setTextColor(...C.grisOscuro)
  y += 22

  y = _tabla(doc, [
    ['Nombre completo',  _p(alumno.nombre_completo)],
    ['Fecha nacimiento', _fecha(alumno.fecha_nacimiento)],
    ['Edad',            _edad(alumno.fecha_nacimiento)],
    ['Género',          _p(alumno.genero)],
    ['Nacionalidad',    _p(alumno.nacionalidad)],
    ['Municipio',       _p(alumno.municipio_residencia)],
    ['Dirección',       _p(alumno.sector_calle_numero ?? alumno.direccion)],
    ['Tel. alumno',     _p(alumno.tlf_alumno)],
    ['Centro estudios', _p(alumno.centro_estudios)],
    ['Grado/Nivel',     _p(alumno.grado_nivel)],
  ], y)

  y = _check(doc, y, 25, pageRef, titulo, nombre)
  y = _sectionDivider(doc, '2. REPRESENTANTE', y, C.azulMedio)
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

  y = _check(doc, y, 20, pageRef, titulo, nombre)
  y = _sectionDivider(doc, '3. MUSICAL', y, C.azulMedio)
  y = _tabla(doc, [
    ['Instrumento',            _p(alumno.instrumento_principal)],
    ['Nivel actual',           _p(alumno.nivel_actual)],
    ['Interés musical',        _p(alumno.interes_musical)],
    ['Conocimientos previos',  alumno.tiene_conocimientos_musicales ? 'Sí' : 'No'],
    ['Nivel lectura musical',  _p(alumno.nivel_lectura_musical)],
  ], y)

  return y
}

function _renderAsistencias(doc, asistencias, alumno, y, pageRef, titulo, secNum) {
  const nombre = _p(alumno.nombre_completo)
  y = _check(doc, y, 15, pageRef, titulo, nombre)
  y = _sectionDivider(doc, `${secNum}. HISTORIAL DE ASISTENCIAS`, y, C.verde)

  if (!asistencias || asistencias.length === 0) {
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(8)
    doc.setTextColor(...C.grisMedio)
    doc.text('Sin registros de asistencia.', M, y + 5)
    return y + 10
  }

  // Summary stats
  const presentes  = asistencias.filter(a => a.estado === 'presente' || a.asistio === true).length
  const ausentes   = asistencias.filter(a => a.estado === 'ausente'  || a.asistio === false).length
  const justif     = asistencias.filter(a => a.estado === 'justificado').length
  const total      = asistencias.length
  const pct        = total > 0 ? Math.round((presentes / total) * 100) : 0

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...C.grisOscuro)
  doc.text(
    `Total: ${total} registros  ·  Presentes: ${presentes} (${pct}%)  ·  Ausentes: ${ausentes}  ·  Justificados: ${justif}`,
    M, y + 5
  )
  y += 9

  autoTable(doc, {
    startY: y,
    margin: { left: M, right: M },
    theme: 'grid',
    head: [['Fecha', 'Estado', 'Clase', 'Observaciones']],
    headStyles: { fillColor: C.verde, textColor: C.blanco, fontStyle: 'bold', fontSize: 7.5 },
    styles: { fontSize: 7, cellPadding: { top: 1.5, bottom: 1.5, left: 2, right: 2 }, overflow: 'linebreak' },
    alternateRowStyles: { fillColor: C.grisClaro },
    columnStyles: { 0: { cellWidth: 22 }, 1: { cellWidth: 22 }, 3: { cellWidth: 70 } },
    body: asistencias.map(a => {
      const estado = a.estado ?? (a.asistio ? 'presente' : 'ausente')
      return [
        _fecha(a.fecha),
        estado.charAt(0).toUpperCase() + estado.slice(1),
        _p(a.clase_id),
        _p(a.observaciones ?? a.justificacion_texto),
      ]
    }),
  })
  return doc.lastAutoTable.finalY + 4
}

function _renderProgresos(doc, progresos, alumno, y, pageRef, titulo, secNum) {
  const nombre = _p(alumno.nombre_completo)
  y = _check(doc, y, 15, pageRef, titulo, nombre)
  y = _sectionDivider(doc, `${secNum}. PROGRESOS Y CALIFICACIONES`, y, C.azulMedio)

  if (!progresos || progresos.length === 0) {
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(8)
    doc.setTextColor(...C.grisMedio)
    doc.text('Sin registros de progresos.', M, y + 5)
    return y + 10
  }

  const califs = progresos.filter(p => p.calificacion != null).map(p => Number(p.calificacion))
  const promedio = califs.length > 0
    ? (califs.reduce((a, b) => a + b, 0) / califs.length).toFixed(1)
    : '—'

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...C.grisOscuro)
  doc.text(`Total: ${progresos.length} evaluaciones  ·  Promedio: ${promedio}`, M, y + 5)
  y += 9

  autoTable(doc, {
    startY: y,
    margin: { left: M, right: M },
    theme: 'grid',
    head: [['Fecha', 'Tipo', 'Calificación', 'Estado cualitativo', 'Observaciones']],
    headStyles: { fillColor: C.azulMedio, textColor: C.blanco, fontStyle: 'bold', fontSize: 7.5 },
    styles: { fontSize: 7, cellPadding: { top: 1.5, bottom: 1.5, left: 2, right: 2 }, overflow: 'linebreak' },
    alternateRowStyles: { fillColor: C.grisClaro },
    columnStyles: { 0: { cellWidth: 22 }, 1: { cellWidth: 25 }, 2: { cellWidth: 22 }, 4: { cellWidth: 65 } },
    body: progresos.map(p => [
      _fecha(p.fecha_evaluacion ?? p.fecha),
      _p(p.evaluacion_tipo),
      p.calificacion != null ? String(p.calificacion) : '—',
      _p(p.estado_cualitativo),
      _p(p.observaciones),
    ]),
  })
  return doc.lastAutoTable.finalY + 4
}

function _renderObservaciones(doc, observaciones, alumno, y, pageRef, titulo, secNum) {
  const nombre = _p(alumno.nombre_completo)
  y = _check(doc, y, 15, pageRef, titulo, nombre)
  y = _sectionDivider(doc, `${secNum}. HISTORIAL DE OBSERVACIONES`, y, C.naranja)

  if (!observaciones || observaciones.length === 0) {
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(8)
    doc.setTextColor(...C.grisMedio)
    doc.text('Sin observaciones registradas.', M, y + 5)
    return y + 10
  }

  autoTable(doc, {
    startY: y,
    margin: { left: M, right: M },
    theme: 'grid',
    head: [['Fecha', 'Tipo', 'Estado', 'Descripción']],
    headStyles: { fillColor: C.naranja, textColor: C.blanco, fontStyle: 'bold', fontSize: 7.5 },
    styles: { fontSize: 7, cellPadding: { top: 1.5, bottom: 1.5, left: 2, right: 2 }, overflow: 'linebreak' },
    alternateRowStyles: { fillColor: C.grisClaro },
    columnStyles: { 0: { cellWidth: 22 }, 1: { cellWidth: 25 }, 2: { cellWidth: 20 } },
    body: observaciones.map(o => [
      _fecha(o.created_at ?? o.fecha),
      _p(o.tipo),
      _p(o.estado),
      _p(o.descripcion ?? o.texto ?? o.observacion),
    ]),
  })
  return doc.lastAutoTable.finalY + 4
}

function _renderIndicadores(doc, indicadores, alumno, y, pageRef, titulo, secNum) {
  const nombre = _p(alumno.nombre_completo)
  y = _check(doc, y, 15, pageRef, titulo, nombre)
  y = _sectionDivider(doc, `${secNum}. INDICADORES DOMINADOS`, y, C.azul)

  const dominados = (indicadores ?? []).filter(i => i.passed === true)

  if (dominados.length === 0) {
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(8)
    doc.setTextColor(...C.grisMedio)
    doc.text('Sin indicadores dominados registrados.', M, y + 5)
    return y + 10
  }

  autoTable(doc, {
    startY: y,
    margin: { left: M, right: M },
    theme: 'grid',
    head: [['Fecha', 'Indicador', 'Clase']],
    headStyles: { fillColor: C.azul, textColor: C.blanco, fontStyle: 'bold', fontSize: 7.5 },
    styles: { fontSize: 7, cellPadding: { top: 1.5, bottom: 1.5, left: 2, right: 2 }, overflow: 'linebreak' },
    alternateRowStyles: { fillColor: C.grisClaro },
    columnStyles: { 0: { cellWidth: 22 } },
    body: dominados.map(i => [
      _fecha(i.fecha),
      _p(i.indicador_id ?? i.indicador ?? i.nombre),
      _p(i.clase_id),
    ]),
  })
  return doc.lastAutoTable.finalY + 4
}

// ════════════════════════════════════════════════════════════════════════════
// MAIN EXPORT
// ════════════════════════════════════════════════════════════════════════════

/**
 * Generates a full expediente PDF for one alumno.
 *
 * @param {object} alumno         — full alumno record
 * @param {object} secciones      — { ficha, asistencias, progresos, observaciones, indicadores }
 * @param {object} datos          — { asistencias[], progresos[], observaciones[], indicadores[] }
 * @returns {jsPDF}
 */
export function generarExpedienteAlumno(alumno, secciones = {}, datos = {}) {
  const doc     = new jsPDF({ unit: 'mm', format: 'letter' })
  const pageRef = { n: 1 }
  const nombre  = _p(alumno.nombre_completo)
  const titulo  = 'EXPEDIENTE DEL ALUMNO'
  const now     = _now()

  let y = _header(doc, titulo, `Generado: ${now}`)

  // Watermark
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(55)
  doc.setTextColor(235, 240, 252)
  doc.text('CONFIDENCIAL', W / 2, H / 2, { align: 'center', angle: 45 })
  doc.setTextColor(...C.grisOscuro)

  // Index of sections included
  const seccionesIncluidas = []
  let secNum = 1
  if (secciones.ficha)          seccionesIncluidas.push('Datos personales y representante')
  if (secciones.asistencias)    seccionesIncluidas.push('Historial de asistencias')
  if (secciones.progresos)      seccionesIncluidas.push('Progresos y calificaciones')
  if (secciones.observaciones)  seccionesIncluidas.push('Historial de observaciones')
  if (secciones.indicadores)    seccionesIncluidas.push('Indicadores dominados')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...C.grisMedio)
  doc.text(`Contenido: ${seccionesIncluidas.join('  ·  ')}`, M, y + 5)
  y += 12

  if (secciones.ficha) {
    y = _renderFicha(doc, alumno, y, pageRef, titulo)
    secNum++
  }

  if (secciones.asistencias) {
    y = _check(doc, y, 20, pageRef, titulo, nombre)
    y = _renderAsistencias(doc, datos.asistencias, alumno, y, pageRef, titulo, secNum)
    secNum++
  }

  if (secciones.progresos) {
    y = _check(doc, y, 20, pageRef, titulo, nombre)
    y = _renderProgresos(doc, datos.progresos, alumno, y, pageRef, titulo, secNum)
    secNum++
  }

  if (secciones.observaciones) {
    y = _check(doc, y, 20, pageRef, titulo, nombre)
    y = _renderObservaciones(doc, datos.observaciones, alumno, y, pageRef, titulo, secNum)
    secNum++
  }

  if (secciones.indicadores) {
    y = _check(doc, y, 20, pageRef, titulo, nombre)
    y = _renderIndicadores(doc, datos.indicadores, alumno, y, pageRef, titulo, secNum)
  }

  _footerAllPages(doc)
  return doc
}

export function descargarExpedienteAlumno(alumno, secciones, datos) {
  const doc    = generarExpedienteAlumno(alumno, secciones, datos)
  const nombre = _p(alumno.nombre_completo).toLowerCase().replace(/\s+/g, '-')
  const now    = new Date().toISOString().slice(0, 10)
  doc.save(`expediente-${nombre}-${now}.pdf`)
}

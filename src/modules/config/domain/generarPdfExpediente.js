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
  verdeClaro:[220, 245, 230],
  rojo:      [180,  20,  20],
  naranja:   [180,  90,  20],
  morado:    [90,   40, 140],
  moradoClaro:[240, 230, 250],
}
const W = 215.9
const H = 279.4
const M = 14

// ─── Utilidades ──────────────────────────────────────────────────────────────

function _now() {
  return new Date().toLocaleDateString('es-DO', { day: '2-digit', month: 'long', year: 'numeric' })
}
function _p(val, fb = '—') { const s = String(val ?? '').trim(); return s || fb }
function _fecha(f) {
  if (!f) return '—'
  try { const parts = (f + '').slice(0, 10).split('-'); return `${parts[2]}/${parts[1]}/${parts[0]}` } catch { return f }
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

/**
 * Lightweight DSL parser — extracts contenido[] entries from DSL text.
 * Tokens: [contenido libre], (sugerencia), {tarea}, #alumno, $medida, calificacion X/Y
 */
function _parseDslContenido(text) {
  if (!text || typeof text !== 'string') return []
  const matches = []
  const re = /\[([^\]]+)\]/g
  let m
  while ((m = re.exec(text)) !== null) {
    const v = m[1].trim()
    if (v) matches.push(v)
  }
  return matches
}

function _parseDslSugerencias(text) {
  if (!text || typeof text !== 'string') return []
  const matches = []
  const re = /\(([^)]+)\)/g
  let m
  while ((m = re.exec(text)) !== null) {
    const v = m[1].trim()
    if (v) matches.push(v)
  }
  return matches
}

function _parseDslCalificacion(text) {
  if (!text) return null
  const m = text.match(/\b(\d+(?:\.\d+)?)\s*\/\s*(\d+)\b/)
  return m ? `${m[1]}/${m[2]}` : null
}

// ─── Primitivas de dibujo ────────────────────────────────────────────────────

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

function _emptyNote(doc, msg, y) {
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(8)
  doc.setTextColor(...C.grisMedio)
  doc.text(msg, M, y + 5)
  doc.setTextColor(...C.grisOscuro)
  return y + 10
}

function _check(doc, y, needed, pageRef, titulo, nombre) {
  if (y + needed > H - 22) {
    doc.setFillColor(...C.azul)
    doc.rect(0, H - 12, W, 12, 'F')
    doc.setFillColor(...C.dorado)
    doc.rect(0, H - 12, 4, 12, 'F')
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(6.5)
    doc.setTextColor(...C.blanco)
    doc.text('El Sistema Punta Cana · Punta Cana, Rep. Dominicana', M + 2, H - 4.5)
    doc.text(`Pág. ${pageRef.n}`, W - M, H - 4.5, { align: 'right' })
    pageRef.n++
    doc.addPage()
    return _header(doc, titulo, `Expediente: ${nombre}`)
  }
  return y
}

// ─── Section renderers ────────────────────────────────────────────────────────

function _renderFicha(doc, alumno, y, pageRef, titulo) {
  const nombre = _p(alumno.nombre_completo) !== '—' ? _p(alumno.nombre_completo) : _p(alumno.nombre)

  y = _check(doc, y, 10, pageRef, titulo, nombre)
  y = _sectionDivider(doc, '1. DATOS PERSONALES Y REPRESENTANTE', y, C.azul)

  doc.setFillColor(...C.azulClaro)
  doc.roundedRect(M, y, W - M * 2, 18, 2, 2, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(...C.azul)
  doc.text(nombre, M + 4, y + 7)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(...C.grisMedio)
  const instr = _p(alumno.instrumento_principal) !== '—' ? _p(alumno.instrumento_principal) : _p(alumno.instrumento)
  const meta  = [`Edad: ${_edad(alumno.fecha_nacimiento)}`, `Instrumento: ${instr}`, `Nivel: ${_p(alumno.nivel_actual)}`].join('    ·    ')
  doc.text(meta, M + 4, y + 14)
  doc.setTextColor(...C.grisOscuro)
  y += 22

  y = _tabla(doc, [
    ['Nombre completo',  nombre],
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
  y = _tabla(doc, [
    ['Representante', _p(alumno.representante_nombre)],
    ['Parentesco',    _p(alumno.representante_parentesco)],
    ['Cédula',        _p(alumno.representante_cedula)],
    ['Teléfono',      _p(alumno.representante_tlf)],
    ['Correo',        _p(alumno.correo_representante)],
    ['Madre',         _p(alumno.madre_nombre)],
    ['Tel. madre',    _p(alumno.madre_tlf_whatsapp)],
    ['Padre',         _p(alumno.padre_nombre)],
    ['Tel. padre',    _p(alumno.padre_tlf_whatsapp)],
  ], y)

  return y
}

function _renderAsistencias(doc, asistencias, alumno, y, pageRef, titulo, secNum) {
  const nombre = _p(alumno.nombre_completo) !== '—' ? _p(alumno.nombre_completo) : _p(alumno.nombre)
  y = _check(doc, y, 15, pageRef, titulo, nombre)
  y = _sectionDivider(doc, `${secNum}. HISTORIAL DE ASISTENCIAS`, y, C.verde)

  if (!asistencias || asistencias.length === 0) {
    return _emptyNote(doc, 'Sin registros de asistencia.', y)
  }

  // Stats
  const presentes = asistencias.filter(a => (a.estado ?? (a.asistio ? 'presente' : 'ausente')) === 'presente').length
  const ausentes  = asistencias.filter(a => (a.estado ?? (a.asistio ? 'presente' : 'ausente')) === 'ausente').length
  const justif    = asistencias.filter(a => a.estado === 'justificado').length
  const total     = asistencias.length
  const pct       = total > 0 ? Math.round((presentes / total) * 100) : 0

  doc.setFillColor(...C.verdeClaro)
  doc.rect(M, y, W - M * 2, 10, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...C.verde)
  doc.text(
    `Total: ${total} clases  ·  Presentes: ${presentes} (${pct}%)  ·  Ausentes: ${ausentes}  ·  Justificados: ${justif}`,
    M + 3, y + 6.5
  )
  doc.setTextColor(...C.grisOscuro)
  y += 13

  autoTable(doc, {
    startY: y,
    margin: { left: M, right: M },
    theme: 'grid',
    head: [['Fecha', 'Estado', 'Qué trabajaron en clase', 'Observación del alumno']],
    headStyles: { fillColor: C.verde, textColor: C.blanco, fontStyle: 'bold', fontSize: 7.5 },
    styles: { fontSize: 7, cellPadding: { top: 1.8, bottom: 1.8, left: 2.5, right: 2.5 }, overflow: 'linebreak' },
    alternateRowStyles: { fillColor: C.grisClaro },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 22 },
      2: { cellWidth: 88 },
    },
    body: asistencias.map(a => {
      const estado = a.estado ?? (a.asistio ? 'presente' : 'ausente')

      // Extract session content from joined sesiones_clase
      const sesion = a.sesion ?? a.sesiones_clase ?? null
      let contenido = '—'
      if (sesion) {
        const tema = _p(sesion.tema_principal)
        const dslItems = _parseDslContenido(sesion.contenido_dsl ?? sesion.contenido ?? '')
        if (dslItems.length > 0) {
          contenido = dslItems.join('\n')
        } else if (tema !== '—') {
          contenido = tema
        } else if (sesion.contenido) {
          contenido = sesion.contenido.slice(0, 120)
        }
      }

      return [
        _fecha(a.fecha),
        estado.charAt(0).toUpperCase() + estado.slice(1),
        contenido,
        _p(a.observaciones ?? a.justificacion_texto),
      ]
    }),
  })
  return doc.lastAutoTable.finalY + 4
}

function _renderProgresos(doc, progresos, alumno, y, pageRef, titulo, secNum) {
  const nombre = _p(alumno.nombre_completo) !== '—' ? _p(alumno.nombre_completo) : _p(alumno.nombre)
  y = _check(doc, y, 15, pageRef, titulo, nombre)
  y = _sectionDivider(doc, `${secNum}. PROGRESOS Y PARTICIPACIÓN`, y, C.azulMedio)

  if (!progresos || progresos.length === 0) {
    return _emptyNote(doc, 'Sin registros de progresos.', y)
  }

  const califs  = progresos.filter(p => p.calificacion != null).map(p => Number(p.calificacion))
  const promedio = califs.length > 0
    ? (califs.reduce((a, b) => a + b, 0) / califs.length).toFixed(1)
    : '—'

  doc.setFillColor(...C.azulClaro)
  doc.rect(M, y, W - M * 2, 10, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...C.azul)
  doc.text(`Total: ${progresos.length} evaluaciones  ·  Promedio: ${promedio}`, M + 3, y + 6.5)
  doc.setTextColor(...C.grisOscuro)
  y += 13

  autoTable(doc, {
    startY: y,
    margin: { left: M, right: M },
    theme: 'grid',
    head: [['Fecha', 'Tipo', 'Qué se evaluó', 'Participación', 'Calif.', 'Observaciones']],
    headStyles: { fillColor: C.azulMedio, textColor: C.blanco, fontStyle: 'bold', fontSize: 7.5 },
    styles: { fontSize: 7, cellPadding: { top: 1.8, bottom: 1.8, left: 2.5, right: 2.5 }, overflow: 'linebreak' },
    alternateRowStyles: { fillColor: C.grisClaro },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 22 },
      2: { cellWidth: 65 },
      4: { cellWidth: 12 },
    },
    body: progresos.map(p => {
      const dslItems = _parseDslContenido(p.contenido_dsl ?? '')
      const queEvaluo = dslItems.length > 0 ? dslItems.join('\n') : _p(p.contenido_dsl)
      const calif = _parseDslCalificacion(p.contenido_dsl) ?? (p.calificacion != null ? String(p.calificacion) : '—')
      return [
        _fecha(p.fecha_evaluacion ?? p.fecha),
        _p(p.evaluacion_tipo),
        queEvaluo,
        _p(p.estado_cualitativo),
        calif,
        _p(p.observaciones),
      ]
    }),
  })
  return doc.lastAutoTable.finalY + 4
}

function _renderObservaciones(doc, observaciones, alumno, y, pageRef, titulo, secNum) {
  const nombre = _p(alumno.nombre_completo) !== '—' ? _p(alumno.nombre_completo) : _p(alumno.nombre)
  y = _check(doc, y, 15, pageRef, titulo, nombre)
  y = _sectionDivider(doc, `${secNum}. HISTORIAL DE OBSERVACIONES`, y, C.naranja)

  if (!observaciones || observaciones.length === 0) {
    return _emptyNote(doc, 'Sin observaciones registradas.', y)
  }

  autoTable(doc, {
    startY: y,
    margin: { left: M, right: M },
    theme: 'grid',
    head: [['Fecha', 'Tipo', 'Estado', 'Descripción / Seguimiento']],
    headStyles: { fillColor: C.naranja, textColor: C.blanco, fontStyle: 'bold', fontSize: 7.5 },
    styles: { fontSize: 7, cellPadding: { top: 1.8, bottom: 1.8, left: 2.5, right: 2.5 }, overflow: 'linebreak' },
    alternateRowStyles: { fillColor: C.grisClaro },
    columnStyles: { 0: { cellWidth: 20 }, 1: { cellWidth: 25 }, 2: { cellWidth: 20 } },
    body: observaciones.map(o => [
      _fecha(o.created_at ?? o.fecha),
      _p(o.tipo),
      _p(o.estado),
      _p(o.descripcion ?? o.texto ?? o.observacion),
    ]),
  })
  return doc.lastAutoTable.finalY + 4
}

/**
 * Renders the dominio section: groups indicator_attempts by node category.
 * Groups: anything with "TÉCNICA" | "ARCO" | "MANO" → Técnicas
 *         anything with "ESCALA" | "ARPEGIO" → Escalas
 *         anything with "OBRA" | "REPERTORIO" | "ESTUDIO" → Repertorio
 *         rest → Otros
 *
 * @param {object[]} indicadores — each with { indicador: { description, nodo: { name } } }
 */
function _renderDominio(doc, indicadores, alumno, y, pageRef, titulo, secNum) {
  const nombre = _p(alumno.nombre_completo) !== '—' ? _p(alumno.nombre_completo) : _p(alumno.nombre)
  y = _check(doc, y, 15, pageRef, titulo, nombre)
  y = _sectionDivider(doc, `${secNum}. DOMINIO: ESCALAS, OBRAS Y TÉCNICAS`, y, C.morado)

  const items = (indicadores ?? [])

  if (items.length === 0) {
    return _emptyNote(doc, 'Sin indicadores registrados.', y)
  }

  // Group by node category
  const grupos = { 'Técnicas':  [], 'Escalas y Arpegios': [], 'Repertorio / Obras': [], 'Otros': [] }

  items.forEach(i => {
    const nodeName = (i.indicador?.nodo?.name ?? i.nodo?.name ?? i.node_name ?? '').toUpperCase()
    const desc     = _p(i.indicador?.description ?? i.description ?? i.indicador_id)
    const fecha    = _fecha(i.covered_date ?? i.fecha ?? i.created_at)
    const nota     = i.nota != null ? `${i.nota}/5` : (i.result ? _p(i.result) : '—')
    const entry    = [desc, nota, fecha]

    if (/TÉCNICA|ARCO|MANO|DEDO|POSTURA|AFINAC|SONIDO/.test(nodeName)) {
      grupos['Técnicas'].push(entry)
    } else if (/ESCALA|ARPEGIO|PATRÓN/.test(nodeName)) {
      grupos['Escalas y Arpegios'].push(entry)
    } else if (/OBRA|REPERTORIO|ESTUDIO|PIEZA/.test(nodeName)) {
      grupos['Repertorio / Obras'].push(entry)
    } else {
      grupos['Otros'].push(entry)
    }
  })

  const gruposConDatos = Object.entries(grupos).filter(([, rows]) => rows.length > 0)

  if (gruposConDatos.length === 0) {
    return _emptyNote(doc, 'Sin indicadores dominados registrados.', y)
  }

  for (const [titulo_grupo, rows] of gruposConDatos) {
    y = _check(doc, y, 18, pageRef, titulo, nombre)

    doc.setFillColor(...C.moradoClaro)
    doc.rect(M, y, W - M * 2, 6, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7.5)
    doc.setTextColor(...C.morado)
    doc.text(`${titulo_grupo} (${rows.length})`, M + 3, y + 4.2)
    doc.setTextColor(...C.grisOscuro)
    y += 7

    autoTable(doc, {
      startY: y,
      margin: { left: M, right: M },
      theme: 'grid',
      head: [['Descripción', 'Nota', 'Fecha']],
      headStyles: { fillColor: C.morado, textColor: C.blanco, fontStyle: 'bold', fontSize: 7 },
      styles: { fontSize: 7, cellPadding: { top: 1.5, bottom: 1.5, left: 2.5, right: 2.5 }, overflow: 'linebreak' },
      alternateRowStyles: { fillColor: C.grisClaro },
      columnStyles: { 1: { cellWidth: 18 }, 2: { cellWidth: 22 } },
      body: rows,
    })
    y = doc.lastAutoTable.finalY + 4
  }

  return y
}

// ════════════════════════════════════════════════════════════════════════════
// MAIN EXPORT
// ════════════════════════════════════════════════════════════════════════════

/**
 * Generates a comprehensive PDF expediente for one alumno.
 *
 * @param {object} alumno         — full alumno record
 * @param {object} secciones      — { ficha, asistencias, progresos, observaciones, dominio }
 * @param {object} datos          — { asistencias[], progresos[], observaciones[], indicadores[] }
 * @returns {jsPDF}
 */
export function generarExpedienteAlumno(alumno, secciones = {}, datos = {}) {
  const doc     = new jsPDF({ unit: 'mm', format: 'letter' })
  const pageRef = { n: 1 }
  const nombre  = _p(alumno.nombre_completo) !== '—' ? _p(alumno.nombre_completo) : _p(alumno.nombre)
  const titulo  = 'EXPEDIENTE DEL ALUMNO'
  const now     = _now()

  let y = _header(doc, titulo, `Generado: ${now}`)

  // Watermark
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(55)
  doc.setTextColor(235, 240, 252)
  doc.text('CONFIDENCIAL', W / 2, H / 2, { align: 'center', angle: 45 })
  doc.setTextColor(...C.grisOscuro)

  // Cover info
  const incluidas = [
    secciones.ficha        && 'Datos personales',
    secciones.asistencias  && 'Asistencias',
    secciones.progresos    && 'Progresos y participación',
    secciones.observaciones&& 'Observaciones',
    secciones.dominio      && 'Dominio: escalas, obras y técnicas',
  ].filter(Boolean)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...C.grisMedio)
  doc.text(`Contenido: ${incluidas.join('  ·  ')}`, M, y + 5)
  y += 12

  let secNum = 1

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
  if (secciones.dominio) {
    y = _check(doc, y, 20, pageRef, titulo, nombre)
    y = _renderDominio(doc, datos.indicadores, alumno, y, pageRef, titulo, secNum)
  }

  _footerAllPages(doc)
  return doc
}

export function descargarExpedienteAlumno(alumno, secciones, datos) {
  const doc    = generarExpedienteAlumno(alumno, secciones, datos)
  const nombre = (_p(alumno.nombre_completo) !== '—' ? _p(alumno.nombre_completo) : _p(alumno.nombre))
    .toLowerCase().replace(/\s+/g, '-')
  const now    = new Date().toISOString().slice(0, 10)
  doc.save(`expediente-${nombre}-${now}.pdf`)
}

/**
 * Generador de PDFs de inscripción — El Sistema Punta Cana
 *
 * Genera dos documentos:
 *   1. Ficha del alumno (carpeta interna del programa)
 *   2. Constancia de inscripción (para el alumno y representante)
 */

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const BRAND = {
  nombre: 'El Sistema Punta Cana',
  color_primary: [0, 86, 179],     // azul
  color_accent: [255, 193, 7],     // amarillo dorado
  color_dark: [30, 30, 30],
  color_light: [240, 245, 255],
}

function padStr(val, fallback = '—') {
  const s = String(val ?? '').trim()
  return s || fallback
}

function formatFecha(fechaStr) {
  if (!fechaStr) return '—'
  try {
    const [y, m, d] = fechaStr.split('-')
    return `${d}/${m}/${y}`
  } catch {
    return fechaStr
  }
}

function calcEdad(fechaStr) {
  if (!fechaStr) return '—'
  try {
    const [y, m, d] = fechaStr.split('-').map(Number)
    const hoy = new Date()
    let edad = hoy.getFullYear() - y
    if (hoy.getMonth() + 1 < m || (hoy.getMonth() + 1 === m && hoy.getDate() < d)) edad--
    return `${edad} años`
  } catch {
    return '—'
  }
}

function si_no(val) {
  if (val === true) return 'Sí'
  if (val === false) return 'No'
  return '—'
}

function conductaLabel(val) {
  const map = { no: 'No presenta problemas', pocas_veces: 'Pocas veces', si: 'Sí', violento: 'Conducta violenta' }
  return map[val] ?? padStr(val)
}

function interesLabel(val) {
  const map = { cantar: 'Cantar', instrumento: 'Instrumento', ambas: 'Ambas' }
  return map[val] ?? padStr(val)
}

function municipioLabel(val) {
  const map = {
    punta_cana: 'Punta Cana', bavaro: 'Bávaro', veron: 'Verón', friusa: 'Friusa',
    el_cortecito: 'El Cortecito', los_corales: 'Los Corales', otro: 'Otro',
  }
  return map[val] ?? padStr(val)
}

// ── Helpers de dibujo ──────────────────────────────────────────────────────

function drawHeader(doc, titulo, subtitulo = '') {
  const W = doc.internal.pageSize.getWidth()

  // Franja azul superior
  doc.setFillColor(...BRAND.color_primary)
  doc.rect(0, 0, W, 28, 'F')

  // Nombre del programa
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text(BRAND.nombre, 14, 11)

  // Título del documento
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text(titulo, 14, 20)

  if (subtitulo) {
    doc.setFontSize(8)
    doc.text(subtitulo, 14, 26)
  }

  // Franja dorada decorativa
  doc.setFillColor(...BRAND.color_accent)
  doc.rect(0, 28, W, 2, 'F')

  doc.setTextColor(...BRAND.color_dark)
  return 38 // y start
}

function drawSectionTitle(doc, label, y) {
  const W = doc.internal.pageSize.getWidth()
  doc.setFillColor(...BRAND.color_light)
  doc.rect(10, y - 4, W - 20, 7, 'F')
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...BRAND.color_primary)
  doc.text(label.toUpperCase(), 14, y + 1)
  doc.setTextColor(...BRAND.color_dark)
  doc.setFont('helvetica', 'normal')
  return y + 8
}

function drawFooter(doc) {
  const W = doc.internal.pageSize.getWidth()
  const H = doc.internal.pageSize.getHeight()
  const fecha = new Date().toLocaleDateString('es-DO', { day: '2-digit', month: 'long', year: 'numeric' })
  doc.setFillColor(...BRAND.color_primary)
  doc.rect(0, H - 10, W, 10, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.text(`${BRAND.nombre} — Documento generado el ${fecha}`, 14, H - 3.5)
  doc.text('Punta Cana, República Dominicana', W - 14, H - 3.5, { align: 'right' })
}

// ── FICHA DEL ALUMNO ──────────────────────────────────────────────────────

/**
 * Genera la ficha completa del alumno para la carpeta interna.
 * @param {object} alumno
 * @returns {jsPDF}
 */
export function generarFichaAlumno(alumno) {
  const doc = new jsPDF({ unit: 'mm', format: 'letter' })
  const W = doc.internal.pageSize.getWidth()
  const fecha = new Date().toLocaleDateString('es-DO', { day: '2-digit', month: 'long', year: 'numeric' })

  let y = drawHeader(doc, 'FICHA DE INSCRIPCIÓN DEL ALUMNO', `Fecha de inscripción: ${fecha}`)

  // ── Datos personales ──────────────────────────────────────────────────
  y = drawSectionTitle(doc, '1. Datos del Alumno', y)
  autoTable(doc, {
    startY: y,
    margin: { left: 10, right: 10 },
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 1.5 },
    headStyles: { fillColor: BRAND.color_primary, textColor: 255, fontStyle: 'bold', fontSize: 7.5 },
    body: [
      ['Nombre completo', padStr(alumno.nombre_completo), 'Fecha de nacimiento', formatFecha(alumno.fecha_nacimiento)],
      ['Edad', calcEdad(alumno.fecha_nacimiento), 'Nacionalidad', padStr(alumno.nacionalidad)],
      ['Sabe leer', si_no(alumno.sabe_leer), 'Sabe escribir', si_no(alumno.sabe_escribir)],
      ['Tiene pasaporte', si_no(alumno.tiene_pasaporte), 'Municipio', municipioLabel(alumno.municipio_residencia)],
      ['Cómo se enteró', padStr(alumno.como_se_entero), 'Sector / Calle', padStr(alumno.sector_calle_numero)],
    ],
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 38 }, 2: { fontStyle: 'bold', cellWidth: 38 } },
  })
  y = doc.lastAutoTable.finalY + 4

  if (alumno.direccion) {
    autoTable(doc, {
      startY: y, margin: { left: 10, right: 10 }, theme: 'grid',
      styles: { fontSize: 8, cellPadding: 1.5 },
      body: [['Dirección', padStr(alumno.direccion)], ['Enlace Maps', padStr(alumno.ubicacion_maps_url)]],
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 38 } },
    })
    y = doc.lastAutoTable.finalY + 4
  }

  // ── Madre ─────────────────────────────────────────────────────────────
  y = drawSectionTitle(doc, '2. Datos de la Madre', y)
  autoTable(doc, {
    startY: y, margin: { left: 10, right: 10 }, theme: 'grid',
    styles: { fontSize: 8, cellPadding: 1.5 },
    body: [
      ['Nombre completo', padStr(alumno.madre_nombre), 'Cédula / Pasaporte', padStr(alumno.madre_cedula)],
      ['WhatsApp', padStr(alumno.madre_tlf_whatsapp), '', ''],
    ],
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 38 }, 2: { fontStyle: 'bold', cellWidth: 38 } },
  })
  y = doc.lastAutoTable.finalY + 4

  // ── Padre ─────────────────────────────────────────────────────────────
  y = drawSectionTitle(doc, '3. Datos del Padre', y)
  autoTable(doc, {
    startY: y, margin: { left: 10, right: 10 }, theme: 'grid',
    styles: { fontSize: 8, cellPadding: 1.5 },
    body: [
      ['Nombre completo', padStr(alumno.padre_nombre), 'Cédula / Pasaporte', padStr(alumno.padre_cedula)],
      ['WhatsApp', padStr(alumno.padre_tlf_whatsapp), '', ''],
    ],
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 38 }, 2: { fontStyle: 'bold', cellWidth: 38 } },
  })
  y = doc.lastAutoTable.finalY + 4

  // ── Representante y contactos ─────────────────────────────────────────
  y = drawSectionTitle(doc, '4. Representante y Contactos', y)
  autoTable(doc, {
    startY: y, margin: { left: 10, right: 10 }, theme: 'grid',
    styles: { fontSize: 8, cellPadding: 1.5 },
    body: [
      ['Representante', padStr(alumno.representante_nombre), 'Parentesco', padStr(alumno.representante_parentesco)],
      ['Cédula', padStr(alumno.representante_cedula), 'Teléfono', padStr(alumno.representante_tlf)],
      ['Otro responsable', padStr(alumno.otro_responsable_nombre), 'Cédula', padStr(alumno.otro_responsable_cedula)],
      ['Tlf otro resp.', padStr(alumno.otro_responsable_tlf), 'Fam. monoparental', si_no(alumno.familia_monoparental)],
      ['Emergencia #1', padStr(alumno.contacto_emergencia_nombre), 'Tlf', padStr(alumno.contacto_emergencia_telefono)],
      ['Emergencia #2', padStr(alumno.contacto_emergencia_2_nombre), 'Tlf', padStr(alumno.contacto_emergencia_2_telefono)],
    ],
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 38 }, 2: { fontStyle: 'bold', cellWidth: 38 } },
  })
  y = doc.lastAutoTable.finalY + 4

  // ── Nueva página si falta espacio ─────────────────────────────────────
  const H = doc.internal.pageSize.getHeight()
  if (y > H - 80) {
    drawFooter(doc)
    doc.addPage()
    y = drawHeader(doc, 'FICHA DE INSCRIPCIÓN DEL ALUMNO (cont.)', `Alumno: ${padStr(alumno.nombre_completo)}`)
  }

  // ── Situación social ──────────────────────────────────────────────────
  y = drawSectionTitle(doc, '5. Situación Social', y)
  autoTable(doc, {
    startY: y, margin: { left: 10, right: 10 }, theme: 'grid',
    styles: { fontSize: 8, cellPadding: 1.5 },
    body: [
      ['Beneficiario subsidio', si_no(alumno.beneficiario_subsidio_estado), 'Tipo subsidio', padStr(alumno.subsidio_descripcion)],
      ['Apoyo al programa', { content: padStr(alumno.apoyo_actividades), colSpan: 3 }],
    ],
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 38 }, 2: { fontStyle: 'bold', cellWidth: 38 } },
  })
  y = doc.lastAutoTable.finalY + 4

  // ── Perfil musical ────────────────────────────────────────────────────
  y = drawSectionTitle(doc, '6. Perfil Musical', y)
  autoTable(doc, {
    startY: y, margin: { left: 10, right: 10 }, theme: 'grid',
    styles: { fontSize: 8, cellPadding: 1.5 },
    body: [
      ['Conocimientos musicales', si_no(alumno.tiene_conocimientos_musicales), 'Instrumento previo', padStr(alumno.instrumento_previo)],
      ['Nivel lectura musical', padStr(alumno.nivel_lectura_musical), 'Interés', interesLabel(alumno.interes_musical)],
      ['Instrumento de interés', padStr(alumno.instrumento_interes), 'Requiere iniciación', si_no(alumno.requiere_iniciacion_musical)],
      ['Músico favorito', padStr(alumno.musico_favorito), 'Cómo prefiere aprender', padStr(alumno.preferencia_aprendizaje_musical)],
    ],
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 38 }, 2: { fontStyle: 'bold', cellWidth: 38 } },
  })
  y = doc.lastAutoTable.finalY + 4

  // Motivación (texto largo)
  if (alumno.por_que_unirse || alumno.sentimiento_musica_clasica || alumno.aspiracion_instrumento) {
    autoTable(doc, {
      startY: y, margin: { left: 10, right: 10 }, theme: 'grid',
      styles: { fontSize: 8, cellPadding: 1.5 },
      body: [
        ['Por qué quiere unirse', { content: padStr(alumno.por_que_unirse), colSpan: 3 }],
        ['Sentimiento música clásica', { content: padStr(alumno.sentimiento_musica_clasica), colSpan: 3 }],
        ['Sentimiento al aprender', { content: padStr(alumno.sentimiento_aprender_instrumento), colSpan: 3 }],
        ['Aspiración', { content: padStr(alumno.aspiracion_instrumento), colSpan: 3 }],
      ],
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 45 } },
    })
    y = doc.lastAutoTable.finalY + 4
  }

  // ── Salud ─────────────────────────────────────────────────────────────
  y = drawSectionTitle(doc, '7. Salud y Conducta', y)
  autoTable(doc, {
    startY: y, margin: { left: 10, right: 10 }, theme: 'grid',
    styles: { fontSize: 8, cellPadding: 1.5 },
    body: [
      ['Tiene alergias', si_no(alumno.tiene_alergias), 'Descripción', padStr(alumno.alergias_descripcion)],
      ['Cond. transmisible', si_no(alumno.tiene_condicion_transmisible), 'Cuál', padStr(alumno.condicion_transmisible_desc)],
      ['Alergia medicamento', si_no(alumno.tiene_alergia_medicamento), 'Cuál', padStr(alumno.alergia_medicamento_desc)],
      ['Impedimento social', si_no(alumno.impedimento_social), 'Conducta', conductaLabel(alumno.problemas_conducta)],
    ],
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 38 }, 2: { fontStyle: 'bold', cellWidth: 38 } },
  })
  y = doc.lastAutoTable.finalY + 4

  // ── Educación ─────────────────────────────────────────────────────────
  y = drawSectionTitle(doc, '8. Datos Escolares', y)
  autoTable(doc, {
    startY: y, margin: { left: 10, right: 10 }, theme: 'grid',
    styles: { fontSize: 8, cellPadding: 1.5 },
    body: [
      ['Centro de estudios', padStr(alumno.centro_estudios), 'Grado / Nivel', padStr(alumno.grado_nivel)],
      ['Padres en vida', padStr(alumno.padres_en_vida === 'ambos' ? 'Ambos' : alumno.padres_en_vida === 'solo_madre' ? 'Solo madre' : alumno.padres_en_vida === 'solo_padre' ? 'Solo padre' : alumno.padres_en_vida === 'ninguno' ? 'Ninguno' : '—'), '', ''],
    ],
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 38 }, 2: { fontStyle: 'bold', cellWidth: 38 } },
  })
  y = doc.lastAutoTable.finalY + 4

  // ── Compromisos ───────────────────────────────────────────────────────
  y = drawSectionTitle(doc, '9. Compromisos y Autorizaciones', y)
  autoTable(doc, {
    startY: y, margin: { left: 10, right: 10 }, theme: 'grid',
    styles: { fontSize: 8, cellPadding: 1.5 },
    body: [
      ['Acepta beca RD$4,500', si_no(alumno.acepta_beca_4500), 'Fecha', formatFecha(alumno.fecha_aceptacion_beca?.slice(0, 10))],
      ['Acepta pago RD$600/mes', si_no(alumno.acepta_pago_600), 'Fecha', formatFecha(alumno.fecha_aceptacion_pago?.slice(0, 10))],
      ['Autoriza fotos/redes', si_no(alumno.autoriza_fotos_redes), '', ''],
    ],
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 38 }, 2: { fontStyle: 'bold', cellWidth: 38 } },
  })
  y = doc.lastAutoTable.finalY + 10

  // ── Firma ─────────────────────────────────────────────────────────────
  if (y < H - 40) {
    doc.setDrawColor(100, 100, 100)
    doc.setLineWidth(0.3)
    doc.line(14, y + 20, 90, y + 20)
    doc.line(W / 2 + 10, y + 20, W - 14, y + 20)
    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'normal')
    doc.text('Firma del Representante', 14, y + 25)
    doc.text('Firma del Director — El Sistema PC', W / 2 + 10, y + 25)
    doc.text(`Cédula: ${padStr(alumno.representante_cedula)}`, 14, y + 29)
  }

  drawFooter(doc)
  return doc
}

// ── CONSTANCIA DE INSCRIPCIÓN ─────────────────────────────────────────────

/**
 * Genera la constancia de inscripción para el alumno y representante.
 * @param {object} alumno
 * @returns {jsPDF}
 */
export function generarConstanciaInscripcion(alumno) {
  const doc = new jsPDF({ unit: 'mm', format: 'letter' })
  const W = doc.internal.pageSize.getWidth()
  const H = doc.internal.pageSize.getHeight()
  const fecha = new Date().toLocaleDateString('es-DO', { day: '2-digit', month: 'long', year: 'numeric' })

  drawHeader(doc, 'CONSTANCIA DE INSCRIPCIÓN', fecha)

  let y = 48

  // Cuerpo del documento
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...BRAND.color_primary)
  doc.text('A QUIEN PUEDA INTERESAR:', 14, y)
  y += 10

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(...BRAND.color_dark)

  const cuerpo = [
    `Por medio de la presente, ${BRAND.nombre} hace constar que:`,
    '',
    `El alumno/a ${padStr(alumno.nombre_completo).toUpperCase()}, de ${calcEdad(alumno.fecha_nacimiento)},`,
    `nacido/a el ${formatFecha(alumno.fecha_nacimiento)}, de nacionalidad ${padStr(alumno.nacionalidad)},`,
    `ha sido debidamente inscrito/a en el programa de formación musical de`,
    `${BRAND.nombre} a partir del día ${fecha}.`,
    '',
    `El alumno/a recibirá clases de ${interesLabel(alumno.interes_musical).toLowerCase()} y${alumno.requiere_iniciacion_musical
      ? ' participará en el programa de iniciación musical durante los primeros 6 meses,'
      : ' ha demostrado conocimientos musicales previos,'}`,
    `siendo su instrumento de interés: ${padStr(alumno.instrumento_interes)}.`,
    '',
    `El representante, ${padStr(alumno.representante_nombre)} (${padStr(alumno.representante_parentesco)}),`,
    `cédula ${padStr(alumno.representante_cedula)}, ha aceptado los términos del programa,`,
    `incluyendo el aporte mensual de RD$600, consciente de que el alumno/a recibe una`,
    `beca valorada en RD$4,500 que se mantendrá siempre que demuestre rendimiento,`,
    `interés y asistencia notable.`,
  ]

  cuerpo.forEach(linea => {
    doc.text(linea, 14, y)
    y += 6
  })

  y += 6

  // Lista de materiales
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('Al presentar esta constancia en caja, el alumno/a recibirá:', 14, y)
  y += 7

  doc.setFont('helvetica', 'normal')
  const items = [
    '✓  Tarjeta de pagos mensuales',
    '✓  Horario de clases asignado',
    '✓  Lista de útiles: lápiz, cuaderno pentagramado, borrador',
    '✓  T-Shirt oficial de El Sistema Punta Cana',
  ]
  items.forEach(item => {
    doc.text(item, 20, y)
    y += 6
  })

  doc.setFont('helvetica', 'bold')
  doc.setTextColor(180, 0, 0)
  doc.text('* Realizar pago de RD$600 en caja al momento de recibir los materiales.', 14, y)
  y += 14

  // Firmas
  doc.setTextColor(...BRAND.color_dark)
  doc.setDrawColor(100, 100, 100)
  doc.setLineWidth(0.3)
  doc.line(14, y, 90, y)
  doc.line(W / 2 + 10, y, W - 14, y)
  y += 5
  doc.setFontSize(8.5)
  doc.setFont('helvetica', 'bold')
  doc.text('Firma y sello — El Sistema Punta Cana', 14, y)
  doc.text('Firma del Representante', W / 2 + 10, y)
  y += 4
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.text('Director del Programa', 14, y)
  doc.text(`${padStr(alumno.representante_nombre)}`, W / 2 + 10, y)

  // Número de constancia (por ID del alumno o timestamp)
  const constanciaId = (alumno.id ?? Date.now()).toString().slice(-8).toUpperCase()
  doc.setFontSize(7)
  doc.setTextColor(150, 150, 150)
  doc.text(`Constancia N° ${constanciaId}`, W - 14, H - 14, { align: 'right' })

  drawFooter(doc)
  return doc
}

/**
 * Descarga la ficha del alumno como PDF.
 * @param {object} alumno
 */
export function descargarFichaAlumno(alumno) {
  const doc = generarFichaAlumno(alumno)
  const nombre = (alumno.nombre_completo ?? 'alumno').toLowerCase().replace(/\s+/g, '-')
  doc.save(`ficha-${nombre}.pdf`)
}

/**
 * Descarga la constancia de inscripción como PDF.
 * @param {object} alumno
 */
export function descargarConstancia(alumno) {
  const doc = generarConstanciaInscripcion(alumno)
  const nombre = (alumno.nombre_completo ?? 'alumno').toLowerCase().replace(/\s+/g, '-')
  doc.save(`constancia-inscripcion-${nombre}.pdf`)
}

/**
 * Generador de PDFs de inscripción — El Sistema Punta Cana
 *
 * Doc 1: Ficha técnica del alumno  (uso interno / carpeta física / Drive)
 * Doc 2: Constancia de inscripción (entrega al representante)
 */

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { getDocumentosInstitucionales } from '../../config/api/configApi.js'

// ─── Paleta institucional ────────────────────────────────────────────────────

const C = {
  azul:       [20,  60, 130],   // azul institucional
  azulMedio:  [40,  90, 170],
  azulClaro:  [220, 232, 250],
  dorado:     [198, 160,  20],
  doradoClaro:[255, 245, 200],
  blanco:     [255, 255, 255],
  grisOscuro: [40,   40,  40],
  grisMedio:  [100, 100, 100],
  grisClaro:  [245, 245, 248],
  rojo:       [180,  20,  20],
  verde:      [20,  120,  60],
}

// ─── Datos de demo ───────────────────────────────────────────────────────────

export const ALUMNO_DEMO = {
  id: 'demo-0001-uuid',
  nombre_completo: 'María Gabriela Rodríguez Pérez',
  fecha_nacimiento: '2013-06-15',
  genero: 'F',
  nacionalidad: 'Dominicana',
  tiene_pasaporte: false,
  sabe_leer: true,
  sabe_escribir: true,
  tlf_alumno: '8091234567',
  como_se_entero: 'Redes sociales',
  municipio_residencia: 'bavaro',
  sector_calle_numero: 'Bávaro, Calle Los Corales #12',
  direccion: 'Sector Los Corales, Bávaro, La Altagracia',
  ubicacion_maps_url: 'https://maps.google.com',

  madre_nombre: 'Carmen Pérez de Rodríguez',
  madre_cedula: '001-1234567-8',
  madre_tlf_whatsapp: '8097654321',

  padre_nombre: 'José Rafael Rodríguez',
  padre_cedula: '001-9876543-2',
  padre_tlf_whatsapp: '8299876543',

  representante_nombre: 'Carmen Pérez de Rodríguez',
  representante_parentesco: 'Madre',
  representante_cedula: '001-1234567-8',
  representante_tlf: '8097654321',
  correo_representante: 'carmen.perez@email.com',
  otro_responsable_nombre: 'José Rafael Rodríguez',
  otro_responsable_cedula: '001-9876543-2',
  otro_responsable_tlf: '8299876543',
  contacto_emergencia_nombre: 'Luisa Martínez',
  contacto_emergencia_telefono: '8091112222',
  beneficiario_subsidio_estado: false,
  subsidio_descripcion: null,
  apoyo_actividades: 'Disponible para apoyo en actividades los fines de semana',

  instrumento_principal: 'Violín',
  nivel_actual: 'Iniciación',
  tiene_conocimientos_musicales: false,
  instrumento_previo: null,
  nivel_lectura_musical: 'Ninguno',
  interes_musical: 'instrumento',
  instrumento_interes: 'Violín',
  sentimiento_musica_clasica: 'Me emociona mucho y me parece muy bonita',
  sentimiento_aprender_instrumento: 'Estoy muy emocionada y quiero aprender rápido',
  aspiracion_instrumento: 'Llegar a tocar en una orquesta',
  musico_favorito: 'Beethoven',
  preferencia_aprendizaje_musical: 'Visual y auditiva',
  por_que_unirse: 'Siempre soñé con tocar un instrumento y El Sistema me da esa oportunidad',

  alergias_descripcion: null,
  condicion_transmisible_desc: null,
  alergia_medicamento_desc: null,
  problemas_conducta: 'no',
  tiene_alergias: false,
  tiene_condicion_transmisible: false,
  tiene_alergia_medicamento: false,

  centro_estudios: 'Colegio San Juan Bosco',
  grado_nivel: '5to de Primaria',
  padres_en_vida: 'ambos',

  autoriza_fotos_redes: true,
  acepta_beca_4500: true,
  acepta_pago_600: true,
  fecha_aceptacion_compromisos: new Date().toISOString(),
  requiere_iniciacion_musical: true,
  familia_monoparental: false,
}

// ─── Utilidades ──────────────────────────────────────────────────────────────

function p(val, fallback = '—') {
  const s = String(val ?? '').trim()
  return s || fallback
}
function fecha(f) {
  if (!f) return '—'
  try { const [y, m, d] = f.split('-'); return `${d}/${m}/${y}` } catch { return f }
}
function edad(f) {
  if (!f) return '—'
  try {
    const [y, m, d] = f.split('-').map(Number)
    const hoy = new Date()
    let e = hoy.getFullYear() - y
    if (hoy.getMonth() + 1 < m || (hoy.getMonth() + 1 === m && hoy.getDate() < d)) e--
    return `${e} años`
  } catch { return '—' }
}
function sn(val) {
  if (val === true  || val === 'true'  || val === 't') return 'Sí'
  if (val === false || val === 'false' || val === 'f') return 'No'
  return '—'
}
function municipio(val) {
  const m = { punta_cana: 'Punta Cana', bavaro: 'Bávaro', veron: 'Verón',
    friusa: 'Friusa', el_cortecito: 'El Cortecito', los_corales: 'Los Corales', otro: 'Otro' }
  return m[val] ?? p(val)
}
function interes(val) {
  const i = { cantar: 'Cantar', instrumento: 'Instrumento', ambas: 'Ambas' }
  return i[val] ?? p(val)
}
function padresEnVida(val) {
  const v = { ambos: 'Ambos', solo_madre: 'Solo madre', solo_padre: 'Solo padre', ninguno: 'Ninguno' }
  return v[val] ?? p(val)
}
function conducta(val) {
  const c = { no: 'Sin problemas', pocas_veces: 'Pocas veces', si: 'Sí presenta', violento: 'Conducta violenta' }
  return c[val] ?? p(val)
}
function serial(alumno) {
  const y = new Date().getFullYear()
  const b = alumno.id ? alumno.id.replace(/-/g, '').slice(-8).toUpperCase() : Date.now().toString(36).toUpperCase().slice(-8)
  return `SOI-PC-${y}-${b}`
}
function nowLong() {
  return new Date().toLocaleDateString('es-DO', { day: '2-digit', month: 'long', year: 'numeric' })
}

// ─── Primitivas de dibujo ────────────────────────────────────────────────────

const W_LETTER = 215.9
const H_LETTER = 279.4
const MARGIN   = 14

function header(doc, titulo, subtitulo = '') {
  // Banda azul principal
  doc.setFillColor(...C.azul)
  doc.rect(0, 0, W_LETTER, 32, 'F')

  // Banda dorada decorativa
  doc.setFillColor(...C.dorado)
  doc.rect(0, 32, W_LETTER, 2.5, 'F')

  // Franja lateral izquierda
  doc.setFillColor(...C.dorado)
  doc.rect(0, 0, 4, 34.5, 'F')

  // Nombre institución
  doc.setTextColor(...C.blanco)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(15)
  doc.text('EL SISTEMA PUNTA CANA', MARGIN + 2, 13)

  // Subtítulo institución
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(200, 215, 240)
  doc.text('Programa de Formación Musical · República Dominicana', MARGIN + 2, 20)

  // Título del documento (derecha)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...C.dorado)
  doc.text(titulo, W_LETTER - MARGIN, 13, { align: 'right' })

  if (subtitulo) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(190, 205, 230)
    doc.text(subtitulo, W_LETTER - MARGIN, 20, { align: 'right' })
  }

  // Reset color
  doc.setTextColor(...C.grisOscuro)
  return 44
}

function footer(doc, pageNum = 1) {
  doc.setFillColor(...C.azul)
  doc.rect(0, H_LETTER - 12, W_LETTER, 12, 'F')
  doc.setFillColor(...C.dorado)
  doc.rect(0, H_LETTER - 12, 4, 12, 'F')

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6.5)
  doc.setTextColor(...C.blanco)
  doc.text('El Sistema Punta Cana · Punta Cana, Rep. Dominicana', MARGIN + 2, H_LETTER - 4.5)
  doc.text(`Pág. ${pageNum}`, W_LETTER - MARGIN, H_LETTER - 4.5, { align: 'right' })
}

function sectionBar(doc, label, y, color = C.azul) {
  doc.setFillColor(...color)
  doc.rect(MARGIN, y, W_LETTER - MARGIN * 2, 6.5, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...C.blanco)
  doc.text(label, MARGIN + 3, y + 4.4)
  doc.setTextColor(...C.grisOscuro)
  return y + 9
}

function tabla(doc, body, y, opts = {}) {
  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: { top: 1.8, bottom: 1.8, left: 3, right: 3 },
      lineColor: [210, 215, 225],
      lineWidth: 0.2,
      textColor: C.grisOscuro,
      font: 'helvetica',
    },
    alternateRowStyles: { fillColor: C.grisClaro },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: opts.labelW ?? 42, fillColor: C.azulClaro, textColor: C.azul },
      2: { fontStyle: 'bold', cellWidth: opts.labelW ?? 42, fillColor: C.azulClaro, textColor: C.azul },
    },
    body,
    ...opts.extra,
  })
  return doc.lastAutoTable.finalY + 4
}

function tablaSimple(doc, body, y, opts = {}) {
  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: { top: 1.8, bottom: 1.8, left: 3, right: 3 },
      lineColor: [210, 215, 225],
      lineWidth: 0.2,
      textColor: C.grisOscuro,
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: opts.labelW ?? 52, fillColor: C.azulClaro, textColor: C.azul },
    },
    body,
    ...opts.extra,
  })
  return doc.lastAutoTable.finalY + 4
}

function newPage(doc, titulo, alumnoNombre, pageNum) {
  footer(doc, pageNum - 1)
  doc.addPage()
  return header(doc, titulo, `Continuación · ${alumnoNombre}`)
}

function checkSpace(doc, y, needed, titulo, nombre, pageRef) {
  if (y + needed > H_LETTER - 20) {
    pageRef.n++
    return newPage(doc, titulo, nombre, pageRef.n)
  }
  return y
}

// ════════════════════════════════════════════════════════════════════════════
// FICHA TÉCNICA DEL ALUMNO
// ════════════════════════════════════════════════════════════════════════════

export function generarFichaAlumno(alumno) {
  const doc  = new jsPDF({ unit: 'mm', format: 'letter' })
  const page = { n: 1 }
  const DOC_TITLE = 'FICHA TÉCNICA DEL ALUMNO'
  const now  = nowLong()

  let y = header(doc, DOC_TITLE, `Generado: ${now}`)

  // Watermark sutil
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(55)
  doc.setTextColor(235, 240, 252)
  doc.text('USO INTERNO', W_LETTER / 2, H_LETTER / 2 + 20, { align: 'center', angle: 45 })
  doc.setTextColor(...C.grisOscuro)

  // ── Encabezado alumno ────────────────────────────────────────────────────
  doc.setFillColor(...C.azulClaro)
  doc.roundedRect(MARGIN, y, W_LETTER - MARGIN * 2, 22, 2, 2, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(...C.azul)
  doc.text(p(alumno.nombre_completo), MARGIN + 4, y + 8)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(...C.grisMedio)
  const meta = [
    `Edad: ${edad(alumno.fecha_nacimiento)}`,
    `F. Nac.: ${fecha(alumno.fecha_nacimiento)}`,
    `Instrumento: ${p(alumno.instrumento_principal)}`,
    `Nivel: ${p(alumno.nivel_actual)}`,
  ].join('    ·    ')
  doc.text(meta, MARGIN + 4, y + 16)
  doc.setTextColor(...C.grisOscuro)
  y += 26

  // ── 1. Datos personales ──────────────────────────────────────────────────
  y = sectionBar(doc, '1 · DATOS PERSONALES', y)
  y = tabla(doc, [
    ['Nombre completo',   p(alumno.nombre_completo),      'Fecha de nacimiento', fecha(alumno.fecha_nacimiento)],
    ['Edad',             edad(alumno.fecha_nacimiento),   'Nacionalidad',        p(alumno.nacionalidad)],
    ['Género',           p(alumno.genero),                'Tiene pasaporte',     sn(alumno.tiene_pasaporte)],
    ['Sabe leer',        sn(alumno.sabe_leer),            'Sabe escribir',       sn(alumno.sabe_escribir)],
    ['Cómo se enteró',   p(alumno.como_se_entero),        'Municipio',           municipio(alumno.municipio_residencia)],
    ['Sector / Calle',   p(alumno.sector_calle_numero),   'Teléfono',            p(alumno.tlf_alumno)],
  ], y)
  y = tablaSimple(doc, [
    ['Dirección completa', p(alumno.direccion)],
    ['Enlace Google Maps', p(alumno.ubicacion_maps_url)],
  ], y)

  // ── 2. Madre ─────────────────────────────────────────────────────────────
  y = checkSpace(doc, y, 40, DOC_TITLE, alumno.nombre_completo, page)
  y = sectionBar(doc, '2 · DATOS DE LA MADRE', y)
  y = tabla(doc, [
    ['Nombre completo', p(alumno.madre_nombre), 'Cédula / Pasaporte', p(alumno.madre_cedula)],
    ['WhatsApp',        p(alumno.madre_tlf_whatsapp), '', ''],
  ], y)

  // ── 3. Padre ─────────────────────────────────────────────────────────────
  y = sectionBar(doc, '3 · DATOS DEL PADRE', y)
  y = tabla(doc, [
    ['Nombre completo', p(alumno.padre_nombre), 'Cédula / Pasaporte', p(alumno.padre_cedula)],
    ['WhatsApp',        p(alumno.padre_tlf_whatsapp), '', ''],
  ], y)

  // ── 4. Representante ─────────────────────────────────────────────────────
  y = checkSpace(doc, y, 60, DOC_TITLE, alumno.nombre_completo, page)
  y = sectionBar(doc, '4 · REPRESENTANTE Y CONTACTOS', y)
  y = tabla(doc, [
    ['Representante',    p(alumno.representante_nombre),      'Parentesco',    p(alumno.representante_parentesco)],
    ['Cédula',           p(alumno.representante_cedula),      'Teléfono',      p(alumno.representante_tlf)],
    ['Correo',           p(alumno.correo_representante),      'Fam. monoparen.', sn(alumno.familia_monoparental)],
    ['Otro responsable', p(alumno.otro_responsable_nombre),   'Cédula',        p(alumno.otro_responsable_cedula)],
    ['Tlf otro resp.',   p(alumno.otro_responsable_tlf),      '', ''],
    ['Emergencia 1',     p(alumno.contacto_emergencia_nombre), 'Tlf',          p(alumno.contacto_emergencia_telefono)],
    ['Emergencia 2',     p(alumno.contacto_emergencia_2_nombre), 'Tlf',        p(alumno.contacto_emergencia_2_telefono)],
  ], y)

  // ── 5. Situación social ───────────────────────────────────────────────────
  y = sectionBar(doc, '5 · SITUACIÓN SOCIAL', y)
  y = tabla(doc, [
    ['Beneficiario subsidio', sn(alumno.beneficiario_subsidio_estado), 'Descripción', p(alumno.subsidio_descripcion)],
    ['Apoyo actividades', { content: p(alumno.apoyo_actividades), colSpan: 3 }],
  ], y, { extra: { columnStyles: { 0: { fontStyle: 'bold', cellWidth: 42, fillColor: C.azulClaro, textColor: C.azul }, 2: { fontStyle: 'bold', cellWidth: 42, fillColor: C.azulClaro, textColor: C.azul } } } })

  // ── 6. Perfil musical ─────────────────────────────────────────────────────
  y = checkSpace(doc, y, 70, DOC_TITLE, alumno.nombre_completo, page)
  y = sectionBar(doc, '6 · PERFIL MUSICAL', y, C.dorado)
  doc.setFillColor(...C.doradoClaro)
  y = tabla(doc, [
    ['Conocimientos musicales', sn(alumno.tiene_conocimientos_musicales), 'Instrumento previo',  p(alumno.instrumento_previo)],
    ['Nivel lectura musical',   p(alumno.nivel_lectura_musical),          'Interés',             interes(alumno.interes_musical)],
    ['Instrumento de interés',  p(alumno.instrumento_interes),            'Requiere iniciación', sn(alumno.requiere_iniciacion_musical)],
    ['Músico favorito',         p(alumno.musico_favorito),                'Pref. aprendizaje',   p(alumno.preferencia_aprendizaje_musical)],
  ], y)
  y = tablaSimple(doc, [
    ['Por qué quiere unirse',        p(alumno.por_que_unirse)],
    ['Sentimiento música clásica',   p(alumno.sentimiento_musica_clasica)],
    ['Sentimiento al aprender',      p(alumno.sentimiento_aprender_instrumento)],
    ['Aspiración con instrumento',   p(alumno.aspiracion_instrumento)],
  ], y, { labelW: 55 })

  // ── 7. Salud y conducta ───────────────────────────────────────────────────
  y = checkSpace(doc, y, 50, DOC_TITLE, alumno.nombre_completo, page)
  y = sectionBar(doc, '7 · SALUD Y CONDUCTA', y, C.rojo)
  y = tabla(doc, [
    ['Tiene alergias',       sn(alumno.tiene_alergias),             'Cuáles',   p(alumno.alergias_descripcion)],
    ['Cond. transmisible',   sn(alumno.tiene_condicion_transmisible),'Cuál',    p(alumno.condicion_transmisible_desc)],
    ['Alergia medicamento',  sn(alumno.tiene_alergia_medicamento),  'Cuál',     p(alumno.alergia_medicamento_desc)],
    ['Impedimento social',   sn(alumno.impedimento_social),         'Conducta', conducta(alumno.problemas_conducta)],
  ], y)

  // ── 8. Datos escolares ────────────────────────────────────────────────────
  y = sectionBar(doc, '8 · DATOS ESCOLARES', y)
  y = tabla(doc, [
    ['Centro de estudios', p(alumno.centro_estudios), 'Grado / Nivel', p(alumno.grado_nivel)],
    ['Padres en vida',     padresEnVida(alumno.padres_en_vida), '', ''],
  ], y)

  // ── 9. Compromisos ────────────────────────────────────────────────────────
  y = checkSpace(doc, y, 55, DOC_TITLE, alumno.nombre_completo, page)
  y = sectionBar(doc, '9 · COMPROMISOS Y AUTORIZACIONES', y, C.verde)
  y = tabla(doc, [
    ['Acepta beca RD$4,500',  sn(alumno.acepta_beca_4500),  'Acepta pago RD$600/mes', sn(alumno.acepta_pago_600)],
    ['Autoriza fotos/redes',  sn(alumno.autoriza_fotos_redes), 'Fecha compromisos',  fecha(alumno.fecha_aceptacion_compromisos?.slice(0,10))],
  ], y)

  // ── Firmas ────────────────────────────────────────────────────────────────
  y = checkSpace(doc, y, 45, DOC_TITLE, alumno.nombre_completo, page)
  y += 8
  doc.setDrawColor(...C.grisMedio)
  doc.setLineWidth(0.3)

  // Firma representante (izq)
  doc.line(MARGIN, y + 18, MARGIN + 78, y + 18)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(...C.grisOscuro)
  doc.text('Firma del Representante', MARGIN, y + 23)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(...C.grisMedio)
  doc.text(p(alumno.representante_nombre), MARGIN, y + 27)
  doc.text(`C.I.: ${p(alumno.representante_cedula)}`, MARGIN, y + 31)

  // Firma director (der)
  const xDir = W_LETTER / 2 + 8
  doc.setDrawColor(...C.grisMedio)
  doc.line(xDir, y + 18, W_LETTER - MARGIN, y + 18)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(...C.grisOscuro)
  doc.text('Encargado Administrativo', xDir, y + 23)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(...C.grisMedio)
  doc.text('El Sistema Punta Cana', xDir, y + 27)
  doc.text(`Fecha: ${nowLong()}`, xDir, y + 31)

  footer(doc, page.n)
  return doc
}

// ════════════════════════════════════════════════════════════════════════════
// CONSTANCIA DE INSCRIPCIÓN
// ════════════════════════════════════════════════════════════════════════════

export function generarConstanciaInscripcion(alumno, docs = {}) {
  const doc  = new jsPDF({ unit: 'mm', format: 'letter' })
  const ser  = serial(alumno)
  const now  = nowLong()

  let y = header(doc, 'CONSTANCIA DE INSCRIPCIÓN', `Serie: ${ser}`)

  // Sello "ORIGINAL" (esquina sup derecha)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...C.dorado)
  doc.setDrawColor(...C.dorado)
  doc.setLineWidth(0.6)
  doc.roundedRect(W_LETTER - MARGIN - 26, 5, 26, 10, 1, 1, 'S')
  doc.text('ORIGINAL', W_LETTER - MARGIN - 13, 11.5, { align: 'center' })
  doc.setTextColor(...C.grisOscuro)
  doc.setLineWidth(0.2)

  // ── Ciudad y fecha ────────────────────────────────────────────────────────
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9.5)
  doc.setTextColor(...C.grisMedio)
  doc.text(`Punta Cana, ${now}`, W_LETTER - MARGIN, y, { align: 'right' })
  y += 8

  // ── A QUIEN PUEDA INTERESAR ───────────────────────────────────────────────
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10.5)
  doc.setTextColor(...C.azul)
  doc.text('A QUIEN PUEDA INTERESAR:', MARGIN, y)
  y += 10

  // ── Cuerpo de la carta ────────────────────────────────────────────────────
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(...C.grisOscuro)

  const nombreAlumno = p(alumno.nombre_completo).toUpperCase()
  const rep          = p(alumno.representante_nombre)
  const repPar       = p(alumno.representante_parentesco)

  const parrafos = [
    `Por medio de la presente, El Sistema Punta Cana hace constar que:`,
    '',
    `El/La estudiante ${nombreAlumno}, de ${edad(alumno.fecha_nacimiento)},` +
    ` nacido/a el ${fecha(alumno.fecha_nacimiento)}, de nacionalidad ${p(alumno.nacionalidad)},` +
    ` ha sido debidamente inscrito/a en el Programa de Formación Musical de` +
    ` El Sistema Punta Cana, a partir del día ${now}.`,
    '',
    alumno.requiere_iniciacion_musical
      ? `El/La estudiante participará en el programa de iniciación musical, con interés en ` +
        `${interes(alumno.interes_musical).toLowerCase()} — instrumento asignado: ${p(alumno.instrumento_interes)}.`
      : `El/La estudiante cuenta con conocimientos musicales previos, con interés en ` +
        `${interes(alumno.interes_musical).toLowerCase()} — instrumento: ${p(alumno.instrumento_interes)}.`,
    '',
    `El representante, ${rep} (${repPar}), ha aceptado los términos del programa,` +
    ` incluyendo el aporte mensual de RD$600, con pleno conocimiento de que el/la estudiante` +
    ` recibe una beca valorada en RD$4,500 mensuales, la cual se mantendrá mientras` +
    ` demuestre rendimiento, interés y asistencia notable.`,
  ]

  parrafos.forEach(linea => {
    if (!linea) { y += 4; return }
    const lines = doc.splitTextToSize(linea, W_LETTER - MARGIN * 2)
    doc.text(lines, MARGIN, y)
    y += lines.length * 5.8
  })

  y += 6

  // ── Caja: Al presentar esta constancia ───────────────────────────────────
  const boxH = 60
  doc.setFillColor(...C.azulClaro)
  doc.setDrawColor(...C.azulMedio)
  doc.setLineWidth(0.5)
  doc.roundedRect(MARGIN, y, W_LETTER - MARGIN * 2, boxH, 3, 3, 'FD')

  // Título caja
  doc.setFillColor(...C.azul)
  doc.roundedRect(MARGIN, y, W_LETTER - MARGIN * 2, 9, 3, 3, 'F')
  doc.rect(MARGIN, y + 5, W_LETTER - MARGIN * 2, 4, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...C.blanco)
  doc.text('AL PRESENTAR ESTA CONSTANCIA EN CAJA RECIBIRÁ:', MARGIN + 4, y + 6.5)
  y += 13

  // Items
  const items = [
    ['bi-credit-card',  '✓  Tarjeta de pagos mensuales'],
    ['bi-calendar',     '✓  Horario de clases asignado'],
    ['bi-pencil',       '✓  Lista de útiles: lápiz HB, cuaderno pentagramado, borrador'],
    ['bi-shirt',        '✓  T-Shirt oficial de El Sistema Punta Cana'],
  ]
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9.5)
  doc.setTextColor(...C.azul)
  items.forEach(([, label]) => {
    doc.text(label, MARGIN + 5, y)
    y += 7
  })

  y += 1
  doc.setFillColor(...C.rojo)
  doc.roundedRect(MARGIN + 3, y, W_LETTER - MARGIN * 2 - 6, 8, 1.5, 1.5, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.setTextColor(...C.blanco)
  doc.text('PAGO OBLIGATORIO: RD$600 en caja al retirar los materiales', MARGIN + (W_LETTER - MARGIN * 2) / 2, y + 5.2, { align: 'center' })
  y += 16

  // ── Recursos institucionales ──────────────────────────────────────────────
  const links = [
    docs.horario    && { icon: '📅', label: 'Consultar horario de clases:',    url: docs.horario },
    docs.reglamento && { icon: '📋', label: 'Reglamento / Manual de convivencia:', url: docs.reglamento },
    docs.bienvenida && { icon: '⭐', label: 'Manual de bienvenida al programa:', url: docs.bienvenida },
  ].filter(Boolean)

  if (links.length > 0) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(...C.azul)
    doc.text('Recursos digitales para el representante:', MARGIN, y)
    y += 6

    links.forEach(({ icon, label, url }) => {
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8.5)
      doc.setTextColor(...C.grisOscuro)
      doc.text(`${icon}  ${label}`, MARGIN + 2, y)
      y += 5
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(...C.azulMedio)
      const urlLines = doc.splitTextToSize(url, W_LETTER - MARGIN * 2 - 10)
      doc.textWithLink(urlLines[0], MARGIN + 6, y, { url })
      y += 7
    })
    y += 2
  } else {
    // Placeholder cuando no hay links configurados
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(8)
    doc.setTextColor(...C.grisMedio)
    doc.text('Los recursos digitales serán comunicados por el coordinador del programa.', MARGIN, y)
    y += 8
  }

  // ── Firmas ────────────────────────────────────────────────────────────────
  if (y > H_LETTER - 55) {
    footer(doc, 1)
    doc.addPage()
    y = header(doc, 'CONSTANCIA DE INSCRIPCIÓN (cont.)', `Serie: ${ser}`)
  }

  y += 6
  doc.setDrawColor(...C.grisMedio)
  doc.setLineWidth(0.3)
  doc.setTextColor(...C.grisOscuro)

  // Firma director
  doc.line(MARGIN, y + 20, MARGIN + 80, y + 20)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.text('Encargado Administrativo', MARGIN, y + 25)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(...C.grisMedio)
  doc.text('El Sistema Punta Cana', MARGIN, y + 29)
  doc.text(now, MARGIN, y + 33)

  // Firma representante
  const xRep = W_LETTER / 2 + 6
  doc.setTextColor(...C.grisOscuro)
  doc.line(xRep, y + 20, W_LETTER - MARGIN, y + 20)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.text('Firma del Representante', xRep, y + 25)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(...C.grisMedio)
  doc.text(p(alumno.representante_nombre), xRep, y + 29)
  doc.text(`C.I.: ${p(alumno.representante_cedula)}`, xRep, y + 33)

  // Serial al pie (antes del footer)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6.5)
  doc.setTextColor(170, 170, 170)
  doc.text(`Serie: ${ser}`, W_LETTER - MARGIN, H_LETTER - 15, { align: 'right' })

  footer(doc, 1)
  return doc
}

// ─── Descargas ───────────────────────────────────────────────────────────────

export function descargarFichaAlumno(alumno) {
  const doc    = generarFichaAlumno(alumno)
  const nombre = (alumno.nombre_completo ?? 'alumno').toLowerCase().replace(/\s+/g, '-')
  doc.save(`ficha-${nombre}.pdf`)
}

export async function descargarConstancia(alumno) {
  let docs = {}
  try { docs = await getDocumentosInstitucionales() } catch { /* genera sin links */ }
  const doc    = generarConstanciaInscripcion(alumno, docs)
  const nombre = (alumno.nombre_completo ?? 'alumno').toLowerCase().replace(/\s+/g, '-')
  doc.save(`constancia-${nombre}.pdf`)
}

export function descargarFichaDemo() {
  descargarFichaAlumno(ALUMNO_DEMO)
}

export async function descargarConstanciaDemo() {
  await descargarConstancia(ALUMNO_DEMO)
}

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const C = {
  azul:       [20,  60, 130],
  azulClaro:  [220, 232, 250],
  azulMedio:  [40,  90, 170],
  dorado:     [198, 160,  20],
  blanco:     [255, 255, 255],
  grisOscuro: [40,   40,  40],
  grisMedio:  [100, 100, 100],
  grisClaro:  [245, 245, 248],
}

const W = 215.9
const H = 279.4
const M = 14

function now() {
  return new Date().toLocaleDateString('es-DO', {
    day: '2-digit', month: 'long', year: 'numeric',
  })
}

function p(val, fb = '—') {
  const s = String(val ?? '').trim()
  return s || fb
}

function header(doc, titulo, subtitulo = '') {
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
  return 42
}

function footer(doc, page) {
  doc.setFillColor(...C.azul)
  doc.rect(0, H - 12, W, 12, 'F')
  doc.setFillColor(...C.dorado)
  doc.rect(0, H - 12, 4, 12, 'F')
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6.5)
  doc.setTextColor(...C.blanco)
  doc.text('El Sistema Punta Cana · Punta Cana, Rep. Dominicana', M + 2, H - 4.5)
  doc.text(`Pág. ${page}`, W - M, H - 4.5, { align: 'right' })
}

const DIAS = {
  lunes: 'Lunes', martes: 'Martes', miércoles: 'Miércoles',
  jueves: 'Jueves', viernes: 'Viernes', sábado: 'Sábado', domingo: 'Domingo',
}

export function buildClasePdfFilename(nombre, dateStr) {
  const slug = nombre.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  return `clase-${slug}-${dateStr}.pdf`
}

export function buildClasePdfRows(inscripciones) {
  return inscripciones.map((ins, i) => {
    const a = ins.alumno || {}
    const fecha = ins.fecha_inscripcion
      ? new Date(ins.fecha_inscripcion + 'T12:00:00')
          .toLocaleDateString('es-DO', { day: 'numeric', month: 'short', year: 'numeric' })
          .replace(' de ', ' ')
      : '—'
    const horario = ins.hora_inicio && ins.hora_fin
      ? `${ins.hora_inicio.slice(0, 5)} - ${ins.hora_fin.slice(0, 5)}`
      : '—'
    return [
      i + 1,
      p(a.nombre_completo),
      p(a.documento_identidad),
      p(a.instrumento_principal),
      p(a.telefono),
      fecha,
      horario,
    ]
  })
}

export function formatClaseHorariosForPdf(horarios, salones = []) {
  if (!Array.isArray(horarios) || horarios.length === 0) return 'Sin horario'
  return horarios.map(h => {
    const dia = DIAS[h.dia] || h.dia
    const ini = (h.hora_inicio || '').slice(0, 5)
    const fin = (h.hora_fin || '').slice(0, 5)
    const salon = salones.find(s => s.id === h.salon_id)
    return `${dia} ${ini} - ${fin} · ${salon ? salon.nombre : 'Sin salón'}`
  }).join('\n')
}

export function resolveClasePdfMetadata(clase, context) {
  const { maestros = [], programas = [], salones = [] } = context
  const maestroPrincipal = maestros.find(m => m.id === clase.maestro_principal_id)
  const maestroSuplente = maestros.find(m => m.id === clase.maestro_suplente_id)
  const programa = programas.find(p => p.id === clase.programa_id)
  return {
    maestroPrincipal: maestroPrincipal
      ? (maestroPrincipal.nombre_completo || maestroPrincipal.nombre)
      : '—',
    maestroSuplente: maestroSuplente
      ? (maestroSuplente.nombre_completo || maestroSuplente.nombre)
      : '—',
    programa: programa ? programa.nombre : '—',
    capacidad: clase.capacidad_maxima || '—',
  }
}

function renderClaseHeader(doc, clase, context) {
  const meta = resolveClasePdfMetadata(clase, context)
  const horarios = formatClaseHorariosForPdf(clase.horarios, context.salones)

  doc.setFillColor(...C.azulClaro)
  doc.roundedRect(M, 42, W - M * 2, 24, 2, 2, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(...C.azul)
  doc.text(p(clase.nombre), M + 4, 49)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...C.grisMedio)
  const line1 = `Maestro: ${meta.maestroPrincipal}  ·  Suplente: ${meta.maestroSuplente}  ·  Programa: ${meta.programa}  ·  Capacidad: ${meta.capacidad}`
  doc.text(line1, M + 4, 57)
  doc.setFontSize(7.5)
  doc.text(`Horarios: ${horarios.split('\n')[0]}`, M + 4, 63)
  if (horarios.includes('\n')) {
    doc.text(`         ${horarios.split('\n')[1]}`, M + 4, 69)
    return 72
  }
  return 66
}

export function descargarPdfClase(clase, inscritos, context) {
  const doc = new jsPDF({ unit: 'mm', format: 'letter' })
  const nowDate = now()
  const filename = buildClasePdfFilename(clase.nombre, new Date().toISOString().slice(0, 10))

  header(doc, 'FICHA DE CLASE', `Generado: ${nowDate}`)
  let y = renderClaseHeader(doc, clase, context)

  if (clase.descripcion) {
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(8)
    doc.setTextColor(...C.grisMedio)
    const lines = doc.splitTextToSize(clase.descripcion, W - M * 2)
    y += 2
    doc.text(lines, M, y)
    y += lines.length * 4 + 2
  }

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.setTextColor(...C.grisOscuro)
  doc.text(`Alumnos inscritos: ${inscritos.length}`, M, y)
  y += 5

  if (inscritos.length > 0) {
    const rows = buildClasePdfRows(inscritos)
    autoTable(doc, {
      startY: y,
      margin: { left: M, right: M },
      theme: 'grid',
      head: [['#', 'Nombre', 'Cédula', 'Instrumento', 'Teléfono', 'Inscrito', 'Horario']],
      headStyles: { fillColor: C.azul, textColor: C.blanco, fontStyle: 'bold', fontSize: 7.5 },
      styles: { fontSize: 7, cellPadding: { top: 1.5, bottom: 1.5, left: 2, right: 2 }, overflow: 'linebreak' },
      alternateRowStyles: { fillColor: C.grisClaro },
      body: rows,
      didDrawPage: (data) => {
        header(doc, 'FICHA DE CLASE', `Continuación · ${clase.nombre}`)
        footer(doc, data.pageNumber)
      },
    })
  }

  footer(doc, 1)
  doc.save(filename)
}

export function descargarPdfListadoAlumnosPorClases(report, context) {
  const doc = new jsPDF({ unit: 'mm', format: 'letter', orientation: 'landscape' })
  const nowDate = now()
  const WL = 279.4
  const HL = 215.9

  function lHeader(titulo, sub = '') {
    doc.setFillColor(...C.azul)
    doc.rect(0, 0, WL, 32, 'F')
    doc.setFillColor(...C.dorado)
    doc.rect(0, 32, WL, 2.5, 'F')
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
    doc.text(titulo, WL - M, 13, { align: 'right' })
    if (sub) {
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7.5)
      doc.setTextColor(190, 205, 230)
      doc.text(sub, WL - M, 20, { align: 'right' })
    }
    doc.setTextColor(...C.grisOscuro)
  }

  function lFooter(page) {
    doc.setFillColor(...C.azul)
    doc.rect(0, HL - 12, WL, 12, 'F')
    doc.setFillColor(...C.dorado)
    doc.rect(0, HL - 12, 4, 12, 'F')
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(6.5)
    doc.setTextColor(...C.blanco)
    doc.text('El Sistema Punta Cana · Punta Cana, Rep. Dominicana', M + 2, HL - 4.5)
    doc.text(`Pág. ${page}`, WL - M, HL - 4.5, { align: 'right' })
  }

  lHeader('LISTADO DE ALUMNOS POR CLASE', nowDate)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...C.grisMedio)
  doc.text(`Total clases: ${report.length}  ·  Generado: ${nowDate}`, M, 38)
  let y = 44

  report.forEach(({ clase, inscritos }, idx) => {
    const meta = resolveClasePdfMetadata(clase, context)

    if (y > HL - 35) {
      lFooter(doc.internal.getNumberOfPages())
      doc.addPage()
      lHeader('LISTADO DE ALUMNOS POR CLASE', `Continuación`)
      y = 38
    }

    doc.setFillColor(...C.azulClaro)
    doc.rect(M, y, WL - M * 2, 10, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(...C.azul)
    doc.text(`${idx + 1}. ${p(clase.nombre)}  (${meta.maestroPrincipal})`, M + 3, y + 6.5)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(...C.grisMedio)
    doc.text(`Alumnos: ${inscritos.length}`, WL - M - 3, y + 6.5, { align: 'right' })
    y += 12

    if (inscritos.length > 0) {
      const rows = buildClasePdfRows(inscritos)
      autoTable(doc, {
        startY: y,
        margin: { left: M, right: M },
        theme: 'grid',
        head: [['#', 'Nombre', 'Cédula', 'Instrumento', 'Teléfono', 'Inscrito', 'Horario']],
        headStyles: { fillColor: C.azul, textColor: C.blanco, fontStyle: 'bold', fontSize: 7 },
        styles: { fontSize: 6.5, cellPadding: { top: 1.2, bottom: 1.2, left: 1.5, right: 1.5 }, overflow: 'linebreak' },
        alternateRowStyles: { fillColor: C.grisClaro },
        columnStyles: {
          0: { cellWidth: 8 },
          1: { cellWidth: 55 },
        },
        body: rows,
        didDrawPage: (data) => {
          lHeader('LISTADO DE ALUMNOS POR CLASE', `Continuación`)
          lFooter(data.pageNumber)
        },
      })
      y = doc.lastAutoTable.finalY + 8
    } else {
      doc.setFont('helvetica', 'italic')
      doc.setFontSize(7.5)
      doc.setTextColor(...C.grisMedio)
      doc.text('(Sin alumnos inscritos)', M + 5, y + 4)
      y += 12
    }
  })

  const totalPages = doc.internal.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    lFooter(i)
  }

  const nowSlug = new Date().toISOString().slice(0, 10)
  doc.save(`listado-alumnos-por-clase-${nowSlug}.pdf`)
}

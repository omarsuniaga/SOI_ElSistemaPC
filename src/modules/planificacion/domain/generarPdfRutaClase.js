/**
 * generarPdfRutaClase.js — Exportación a PDF de la Ruta de Contenido de una
 * clase (Unidad → Objetivo → Indicador), para formalización académica.
 *
 * Mismo membrete institucional y patrón (jsPDF + jspdf-autotable) que
 * src/modules/clases/domain/generarPdfClase.js — se replica en vez de
 * importar desde `modules/clases` para no acoplar `planificacion` a un
 * módulo ajeno por un detalle puramente visual.
 *
 * No lee la base de datos: recibe la estructura ya resuelta por el caller
 * (MapaClaseView.js/DisenadorCurricularView.js), que ya conoce niveles,
 * objetivos, estrellas/avance e indicadores por clase.
 */
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const C = {
  azul: [20, 60, 130],
  azulClaro: [220, 232, 250],
  dorado: [198, 160, 20],
  blanco: [255, 255, 255],
  grisOscuro: [40, 40, 40],
  grisMedio: [100, 100, 100],
  grisClaro: [245, 245, 248],
  verde: [16, 185, 129],
}

const W = 215.9
const H = 279.4
const M = 14

function now() {
  return new Date().toLocaleDateString('es-DO', { day: '2-digit', month: 'long', year: 'numeric' })
}

function p(val, fb = '—') {
  const s = String(val ?? '').trim()
  return s || fb
}

function header(doc, subtitulo = '') {
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
  doc.text('Tocamos Corazones, Cambiamos Vidas · Punta Cana', M + 2, 20)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...C.dorado)
  doc.text('RUTA DE CONTENIDO DIDÁCTICO', W - M, 13, { align: 'right' })
  if (subtitulo) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(190, 205, 230)
    doc.text(subtitulo, W - M, 20, { align: 'right' })
  }
  doc.setTextColor(...C.grisOscuro)
}

function footer(doc, page) {
  doc.setFillColor(...C.azul)
  doc.rect(0, H - 8, W, 8, 'F')
  doc.setFillColor(...C.dorado)
  doc.rect(0, H - 8, 4, 8, 'F')
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6.5)
  doc.setTextColor(...C.blanco)
  doc.text('El Sistema Punta Cana · Punta Cana, Rep. Dominicana', M + 2, H - 4.5)
  doc.text(`Pág. ${page}`, W - M, H - 4.5, { align: 'right' })
}

export function buildRutaClasePdfFilename(claseNombre, dateStr) {
  const slug = String(claseNombre || 'clase')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return `ruta-contenido-${slug}-${dateStr}.pdf`
}

/**
 * Arma la jerarquía Unidad → Objetivo → Indicador a partir de arrays planos
 * (mismo criterio de agrupación que MapaClaseView._buildNodos: level_id →
 * nombre del nivel del catálogo, en el orden en que aparece `niveles`).
 *
 * @param {Array<{id, nombre}>} niveles
 * @param {Array<{id, nombre, level_id}>} objetivos
 * @param {Array<{id, objetivo_id, descripcion}>} indicadores
 * @param {Map<string, {estrellas, pctAvance}>} [estrellasMap] - keyed por objetivo.id
 * @returns {Array<{unidadNombre: string, objetivos: Array}>}
 */
export function buildRutaClasePdfEstructura(niveles = [], objetivos = [], indicadores = [], estrellasMap = new Map()) {
  const nivelById = new Map(niveles.map((n) => [n.id, n.nombre]))
  const indicadoresPorObjetivo = new Map()
  for (const ind of indicadores) {
    if (!indicadoresPorObjetivo.has(ind.objetivo_id)) indicadoresPorObjetivo.set(ind.objetivo_id, [])
    indicadoresPorObjetivo.get(ind.objetivo_id).push(ind)
  }

  const objetivosOrdenados = [...objetivos].sort((a, b) => {
    const idxA = niveles.findIndex((n) => n.id === a.level_id)
    const idxB = niveles.findIndex((n) => n.id === b.level_id)
    const rankA = idxA === -1 ? Number.MAX_SAFE_INTEGER : idxA
    const rankB = idxB === -1 ? Number.MAX_SAFE_INTEGER : idxB
    if (rankA !== rankB) return rankA - rankB
    return (a.order_index ?? 0) - (b.order_index ?? 0)
  })

  const unidades = new Map()
  for (const o of objetivosOrdenados) {
    const unidadNombre = nivelById.get(o.level_id) || 'Sin unidad'
    if (!unidades.has(unidadNombre)) unidades.set(unidadNombre, [])
    const est = estrellasMap.get(o.id)
    unidades.get(unidadNombre).push({
      nombre: o.nombre,
      estrellas: est?.estrellas ?? null,
      pctAvance: est?.pctAvance ?? null,
      indicadores: (indicadoresPorObjetivo.get(o.id) || []).map((i) => i.descripcion),
    })
  }

  return [...unidades.entries()].map(([unidadNombre, objs]) => ({ unidadNombre, objetivos: objs }))
}

/**
 * @param {object} params
 * @param {string} params.claseNombre
 * @param {string} [params.maestroNombre]
 * @param {Array<{unidadNombre: string, objetivos: Array<{nombre, estrellas, pctAvance, indicadores: string[]}>}>} params.unidades
 */
export function descargarPdfRutaClase({ claseNombre, maestroNombre = '', unidades = [] }) {
  const doc = new jsPDF({ unit: 'mm', format: 'letter' })
  const nowDate = now()
  const filename = buildRutaClasePdfFilename(claseNombre, new Date().toISOString().slice(0, 10))

  header(doc, `Generado: ${nowDate}`)

  doc.setFillColor(...C.azulClaro)
  doc.roundedRect(M, 42, W - M * 2, 18, 2, 2, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(...C.azul)
  doc.text(p(claseNombre), M + 4, 49)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...C.grisMedio)
  doc.text(`Maestro: ${p(maestroNombre)}  ·  Generado: ${nowDate}`, M + 4, 56)

  let y = 66

  if (unidades.length === 0) {
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(9)
    doc.setTextColor(...C.grisMedio)
    doc.text('Esta clase todavía no tiene objetivos en su ruta de contenido.', M, y)
    footer(doc, 1)
    doc.save(filename)
    return
  }

  const rows = []
  unidades.forEach((unidad, uIdx) => {
    unidad.objetivos.forEach((obj, oIdx) => {
      const idJerarquico = `${uIdx + 1}.${oIdx + 1}`
      const avance = obj.pctAvance != null ? `${obj.pctAvance}%` : '—'
      const estrellas = obj.estrellas != null ? '★'.repeat(obj.estrellas) + '☆'.repeat(3 - obj.estrellas) : '—'
      const indicadoresTexto = obj.indicadores.length > 0 ? obj.indicadores.map((d, i) => `${idJerarquico}.${i + 1} ${d}`).join('\n') : '(sin indicadores)'
      rows.push([oIdx === 0 ? unidad.unidadNombre : '', idJerarquico, p(obj.nombre), indicadoresTexto, estrellas, avance])
    })
  })

  autoTable(doc, {
    startY: y,
    margin: { top: 44, left: M, right: M },
    theme: 'grid',
    head: [['Unidad', '#', 'Objetivo', 'Indicadores', 'Estrellas', 'Avance']],
    headStyles: { fillColor: C.azul, textColor: C.blanco, fontStyle: 'bold', fontSize: 7.5 },
    styles: { fontSize: 7, cellPadding: { top: 1.5, bottom: 1.5, left: 2, right: 2 }, overflow: 'linebreak', valign: 'top' },
    alternateRowStyles: { fillColor: C.grisClaro },
    columnStyles: {
      0: { cellWidth: 24, fontStyle: 'bold' },
      1: { cellWidth: 10 },
      2: { cellWidth: 38 },
      3: { cellWidth: 78 },
      4: { cellWidth: 18, textColor: [217, 119, 6] },
      5: { cellWidth: 16 },
    },
    body: rows,
    didDrawPage: (data) => {
      header(doc, `${claseNombre}`)
      footer(doc, data.pageNumber)
    },
  })

  footer(doc, 1)
  doc.save(filename)
}

/**
 * generarPdfRutaMaestro.js — Exportación a PDF de la Ruta Personal de un
 * maestro (Unidad → Objetivo → Indicador), para formalización académica.
 *
 * Mismo membrete institucional y patrón (jsPDF + jspdf-autotable) que
 * src/modules/planificacion/domain/generarPdfRutaClase.js (Sistema A) — se
 * replica en vez de importar desde `modules/planificacion` para no acoplar
 * `portal-maestros` a un módulo ajeno por un detalle puramente visual.
 *
 * A diferencia de Sistema A, `maestro_unidades` ya es una fila real (no hace
 * falta agrupar objetivos por level_id de un catálogo), y la nota se muestra
 * por indicador (promedio de las evaluaciones registradas), no por objetivo:
 * `maestro_routes` no tiene una vista de estrellas agregadas por objetivo
 * como `vw_clase_objetivo_estrellas` de Sistema A.
 *
 * No lee la base de datos: recibe la jerarquía ya resuelta por el caller
 * (TeacherRouteBuilder.js, vía getTeacherRoutes) y el mapa de promedios ya
 * calculado (vía getPromediosPorIndicador).
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
  doc.text('RUTA PERSONAL DEL MAESTRO', W - M, 13, { align: 'right' })
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

export function buildRutaMaestroPdfFilename(claseNombre, dateStr) {
  const slug = String(claseNombre || 'ruta')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return `ruta-maestro-${slug}-${dateStr}.pdf`
}

/**
 * Arma la jerarquía Unidad → Objetivo → Indicador a partir del árbol ya
 * anidado que devuelve `getTeacherRoutes` (sin necesidad de agrupar por
 * level_id como en Sistema A: cada unidad ya es una fila real).
 *
 * @param {Array<{nombre, objetivos: Array<{nombre, indicadores: Array<{id, nombre}>}>}>} unidades
 * @param {Map<string, {promedio: number|null, evaluados: number}>} [notasPorIndicador] - keyed por indicador.id
 * @returns {Array<{unidadNombre: string, objetivos: Array<{nombre: string, indicadores: Array<{nombre: string, nota: number|null, evaluados: number}>}>}>}
 */
export function buildRutaMaestroPdfEstructura(unidades = [], notasPorIndicador = new Map()) {
  return unidades.map((unidad) => ({
    unidadNombre: unidad.nombre,
    objetivos: (unidad.objetivos || []).map((objetivo) => ({
      nombre: objetivo.nombre,
      indicadores: (objetivo.indicadores || []).map((indicador) => {
        const agregado = notasPorIndicador.get(indicador.id)
        return {
          nombre: indicador.nombre,
          nota: agregado?.promedio ?? null,
          evaluados: agregado?.evaluados ?? 0,
        }
      }),
    })),
  }))
}

/**
 * @param {object} params
 * @param {string} params.claseNombre
 * @param {string} [params.maestroNombre]
 * @param {Array<{unidadNombre: string, objetivos: Array<{nombre, indicadores: Array<{nombre, nota, evaluados}>}>}>} params.unidades
 */
export function descargarPdfRutaMaestro({ claseNombre, maestroNombre = '', unidades = [] }) {
  const doc = new jsPDF({ unit: 'mm', format: 'letter' })
  const nowDate = now()
  const filename = buildRutaMaestroPdfFilename(claseNombre, new Date().toISOString().slice(0, 10))

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

  const y = 66

  if (unidades.length === 0) {
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(9)
    doc.setTextColor(...C.grisMedio)
    doc.text('Esta ruta todavía no tiene unidades.', M, y)
    footer(doc, 1)
    doc.save(filename)
    return
  }

  const rows = []
  unidades.forEach((unidad, uIdx) => {
    const objetivos = unidad.objetivos || []
    objetivos.forEach((obj, oIdx) => {
      const idJerarquico = `${uIdx + 1}.${oIdx + 1}`
      const indicadores = obj.indicadores || []
      if (indicadores.length === 0) {
        rows.push([oIdx === 0 ? unidad.unidadNombre : '', idJerarquico, p(obj.nombre), '(sin indicadores)', '—'])
        return
      }
      indicadores.forEach((ind, iIdx) => {
        const nota = ind.nota != null ? `${ind.nota.toFixed(1)} (n=${ind.evaluados})` : '—'
        rows.push([
          oIdx === 0 && iIdx === 0 ? unidad.unidadNombre : '',
          iIdx === 0 ? idJerarquico : '',
          iIdx === 0 ? p(obj.nombre) : '',
          p(ind.nombre),
          nota,
        ])
      })
    })
  })

  autoTable(doc, {
    startY: y,
    margin: { top: 44, left: M, right: M },
    theme: 'grid',
    head: [['Unidad', '#', 'Objetivo', 'Indicador', 'Nota promedio']],
    headStyles: { fillColor: C.azul, textColor: C.blanco, fontStyle: 'bold', fontSize: 7.5 },
    styles: { fontSize: 7, cellPadding: { top: 1.5, bottom: 1.5, left: 2, right: 2 }, overflow: 'linebreak', valign: 'top' },
    alternateRowStyles: { fillColor: C.grisClaro },
    columnStyles: {
      0: { cellWidth: 24, fontStyle: 'bold' },
      1: { cellWidth: 10 },
      2: { cellWidth: 38 },
      3: { cellWidth: 78 },
      4: { cellWidth: 24, textColor: [217, 119, 6] },
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

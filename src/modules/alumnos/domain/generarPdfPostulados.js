/**
 * Generador de PDF de listado de postulados por rango de fechas — El Sistema Punta Cana
 */

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { ESTADO_LABELS } from './postuladoStateMachine.js'

const BRAND_PRIMARY = [0, 86, 179]
const BRAND_ACCENT = [255, 193, 7]
const BRAND_DARK = [30, 30, 30]

/**
 * Determina el mejor nombre disponible para mostrar un postulante.
 */
function resolverNombre(p) {
  const candidatos = [p.nombre_completo, p.madre_nombre, p.padre_nombre, p.representante_nombre]
  const valido = candidatos.map((v) => (v ?? '').trim()).find((v) => v.length > 0)
  return valido ?? 'Sin nombre registrado'
}

/**
 * Concatena padres / representante para la columna de padres.
 */
function resolverPadres(p) {
  const partes = []
  if (p.madre_nombre && p.madre_nombre.trim()) {
    partes.push(`Madre: ${p.madre_nombre.trim()}`)
  }
  if (p.padre_nombre && p.padre_nombre.trim()) {
    partes.push(`Padre: ${p.padre_nombre.trim()}`)
  }
  if (p.representante_nombre && p.representante_nombre.trim()) {
    partes.push(`Rep: ${p.representante_nombre.trim()}`)
  }
  return partes.length > 0 ? partes.join('\n') : '—'
}

/**
 * Recolecta los teléfonos disponibles de un postulante.
 */
function resolverTelefonosStr(p) {
  const partes = []
  if (p.telefono_alumno && p.telefono_alumno.trim()) {
    partes.push(`Al: ${p.telefono_alumno.trim()}`)
  }
  if (p.madre_tlf_whatsapp && p.madre_tlf_whatsapp.trim()) {
    partes.push(`Ma: ${p.madre_tlf_whatsapp.trim()}`)
  }
  if (p.padre_tlf_whatsapp && p.padre_tlf_whatsapp.trim()) {
    partes.push(`Pa: ${p.padre_tlf_whatsapp.trim()}`)
  }
  return partes.length > 0 ? partes.join('\n') : '—'
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
  const fecha = new Date().toLocaleDateString('es-DO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
  doc.text(`El Sistema Punta Cana — Generado: ${fecha}`, 10, H - 3)
  doc.text(`Página ${page} de ${total}`, W - 10, H - 3, { align: 'right' })
}

function formatearFecha(rawDate) {
  if (!rawDate) return '—'
  try {
    return new Date(rawDate).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return '—'
  }
}

/**
 * Genera el PDF del listado de postulados por rango de fechas.
 *
 * @param {object[]} postulantes - lista de postulantes (ya ordenada desc por fecha)
 * @param {string}   desde - fecha ISO inicio (ej. '2026-01-01')
 * @param {string}   hasta - fecha ISO fin (ej. '2026-06-30')
 * @returns {jsPDF}
 */
export function generarPdfPostulados(postulantes, desde, hasta) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'letter' })
  const rangoLabel = `${formatearFecha(desde)} — ${formatearFecha(hasta)}`

  const generadoEn = new Date().toLocaleDateString('es-DO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  drawHeader(
    doc,
    'LISTADO DE POSTULADOS',
    `Rango: ${rangoLabel} · Generado: ${generadoEn} · Total: ${postulantes.length}`,
  )

  const rows = postulantes.map((p, i) => [
    i + 1,
    resolverNombre(p),
    resolverPadres(p),
    resolverTelefonosStr(p),
    p.correo || '—',
    formatearFecha(p.fecha_postulacion || p.created_at),
    ESTADO_LABELS[p.estado || 'postulado'] || p.estado || '—',
  ])

  autoTable(doc, {
    startY: 36,
    margin: { left: 8, right: 8 },
    theme: 'striped',
    head: [
      [
        '#',
        'Nombre del interesado',
        'Padres / Representante',
        'Teléfonos',
        'Correo',
        'Fecha',
        'Estado',
      ],
    ],
    body: rows,
    headStyles: { fillColor: BRAND_PRIMARY, textColor: 255, fontStyle: 'bold', fontSize: 7.5 },
    bodyStyles: { fontSize: 7, cellPadding: 1.5 },
    alternateRowStyles: { fillColor: [240, 245, 255] },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 48 },
      2: { cellWidth: 48 },
      3: { cellWidth: 40 },
      4: { cellWidth: 50 },
      5: { cellWidth: 22, halign: 'center' },
      6: { cellWidth: 20, halign: 'center' },
    },
    didDrawPage: (data) => {
      const totalPages = doc.internal.getNumberOfPages()
      drawFooter(doc, data.pageNumber, totalPages)
    },
  })

  // Fix footer page count now that all pages are known
  const totalPages = doc.internal.getNumberOfPages()
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p)
    drawFooter(doc, p, totalPages)
  }

  return doc
}

/**
 * Descarga el PDF del listado de postulados.
 */
export function descargarPdfPostulados(postulantes, desde, hasta) {
  const doc = generarPdfPostulados(postulantes, desde, hasta)
  doc.save(`postulados-${desde}-${hasta}.pdf`)
}

// Report generator for Asistencias — supports xlsx, pdf, md
// Uses dynamic imports to avoid bundling large libs upfront

// ─── PERÍODO COMPLETO ─────────────────────────────────────────────────────────

export async function generarReporte({ grupos, resumen, fmt, nombre = 'reporte-asistencias' }) {
  switch (fmt) {
    case 'xlsx': return _periodoXLSX(grupos, resumen, nombre)
    case 'pdf':  return _periodoPDF(grupos, resumen, nombre)
    case 'md':   return _periodoMD(grupos, resumen, nombre)
    default:     throw new Error(`Formato desconocido: ${fmt}`)
  }
}

// ─── SESIÓN INDIVIDUAL ────────────────────────────────────────────────────────

export async function generarReporteSesion({ sesion, asistencias, observaciones, fmt }) {
  const nombre = `sesion-${sesion.fecha}-${sesion.claseNombre?.replace(/\s+/g, '-') ?? 'clase'}`
  switch (fmt) {
    case 'xlsx': return _sesionXLSX(sesion, asistencias, observaciones, nombre)
    case 'pdf':  return _sesionPDF(sesion, asistencias, observaciones, nombre)
    case 'md':   return _sesionMD(sesion, asistencias, observaciones, nombre)
    default:     throw new Error(`Formato desconocido: ${fmt}`)
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXCEL (SheetJS / xlsx)
// ═══════════════════════════════════════════════════════════════════════════════

async function _periodoXLSX(grupos, resumen, nombre) {
  const XLSX = await _loadXLSX()

  const wb = XLSX.utils.book_new()

  // Sheet 1: Resumen
  const resumenRows = [
    ['Reporte de Asistencias'],
    [],
    ['Total sesiones',    resumen.totalSesiones],
    ['Total registros',   resumen.totalRegistros],
    ['Presentes',         resumen.totalPresentes],
    ['Ausentes',          resumen.totalAusentes],
    ['Justificados',      resumen.totalJustificados],
    ['% Asistencia',      resumen.totalRegistros
      ? (resumen.totalPresentes / resumen.totalRegistros * 100).toFixed(1) + '%'
      : '—'],
  ]
  const wsResumen = XLSX.utils.aoa_to_sheet(resumenRows)
  XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen')

  // Sheet 2: Detalle por alumno
  const detalleRows = [['Fecha', 'Clase', 'Maestro', 'Alumno', 'Estado', 'Justificación']]
  for (const { fecha, sesiones } of grupos) {
    for (const s of sesiones) {
      if (s.alumnos?.length) {
        for (const a of s.alumnos) {
          detalleRows.push([fecha, s.claseNombre, s.maestroNombre, a.alumnoNombre, a.estado, a.justificacionTexto ?? ''])
        }
      } else {
        detalleRows.push([fecha, s.claseNombre, s.maestroNombre, '—', '—', ''])
      }
    }
  }
  const wsDetalle = XLSX.utils.aoa_to_sheet(detalleRows)
  XLSX.utils.book_append_sheet(wb, wsDetalle, 'Detalle')

  XLSX.writeFile(wb, `${nombre}.xlsx`)
}

async function _sesionXLSX(sesion, asistencias, observaciones, nombre) {
  const XLSX = await _loadXLSX()
  const wb = XLSX.utils.book_new()

  // Asistencias
  const rows = [
    [`Sesión: ${sesion.claseNombre} — ${sesion.fecha}`],
    [`Maestro: ${sesion.maestroNombre}   Hora: ${sesion.horaInicio?.slice(0,5)} – ${sesion.horaFin?.slice(0,5)}`],
    sesion.temaPrincipal ? [`Tema: ${sesion.temaPrincipal}`] : [],
    [],
    ['Alumno', 'Estado', 'Observación'],
    ...asistencias.map(a => [a.alumnoNombre, a.estado, a.justificacionTexto ?? '']),
  ].filter(r => r.length)

  const wsA = XLSX.utils.aoa_to_sheet(rows)
  XLSX.utils.book_append_sheet(wb, wsA, 'Asistencias')

  // Observaciones
  if (observaciones.length) {
    const obsRows = [
      ['Alumno', 'Tipo', 'Título', 'Descripción', 'Prioridad'],
      ...observaciones.map(o => [o.alumnoNombre, o.tipo ?? '', o.titulo ?? '', o.descripcion ?? '', o.prioridad ?? '']),
    ]
    const wsO = XLSX.utils.aoa_to_sheet(obsRows)
    XLSX.utils.book_append_sheet(wb, wsO, 'Observaciones')
  }

  XLSX.writeFile(wb, `${nombre}.xlsx`)
}

// ═══════════════════════════════════════════════════════════════════════════════
// PDF (jsPDF + autoTable)
// ═══════════════════════════════════════════════════════════════════════════════

async function _periodoPDF(grupos, resumen, nombre) {
  const { jsPDF } = await _loadJsPDF()
  const autoTable  = (await import('jspdf-autotable')).default

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  doc.setFontSize(14)
  doc.text('Reporte de Asistencias', 14, 18)
  doc.setFontSize(9)
  doc.text(`Generado: ${new Date().toLocaleDateString('es-AR')}`, 14, 24)

  // Resumen table
  autoTable(doc, {
    startY: 30,
    head: [['Indicador', 'Valor']],
    body: [
      ['Sesiones',     resumen.totalSesiones],
      ['Presentes',    resumen.totalPresentes],
      ['Ausentes',     resumen.totalAusentes],
      ['Justificados', resumen.totalJustificados],
      ['% Asistencia', resumen.totalRegistros
        ? (resumen.totalPresentes / resumen.totalRegistros * 100).toFixed(1) + '%'
        : '—'],
    ],
    theme: 'striped',
    styles: { fontSize: 8 },
    headStyles: { fillColor: [79, 70, 229] },
  })

  // Detalle
  const body = []
  for (const { fecha, sesiones } of grupos) {
    for (const s of sesiones) {
      if (s.alumnos?.length) {
        for (const a of s.alumnos) {
          body.push([fecha, s.claseNombre, a.alumnoNombre, _estadoLabel(a.estado)])
        }
      } else {
        body.push([fecha, s.claseNombre, '—', '—'])
      }
    }
  }

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 8,
    head: [['Fecha', 'Clase', 'Alumno', 'Estado']],
    body,
    theme: 'grid',
    styles: { fontSize: 7 },
    headStyles: { fillColor: [79, 70, 229] },
    columnStyles: { 3: { halign: 'center' } },
  })

  doc.save(`${nombre}.pdf`)
}

async function _sesionPDF(sesion, asistencias, observaciones, nombre) {
  const { jsPDF } = await _loadJsPDF()
  const autoTable  = (await import('jspdf-autotable')).default

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  doc.setFontSize(13)
  doc.text(`${sesion.claseNombre} — ${sesion.fecha}`, 14, 18)
  doc.setFontSize(8)
  doc.text(`Maestro: ${sesion.maestroNombre}   |   ${sesion.horaInicio?.slice(0,5)} – ${sesion.horaFin?.slice(0,5)}`, 14, 24)
  if (sesion.temaPrincipal) doc.text(`Tema: ${sesion.temaPrincipal}`, 14, 29)

  autoTable(doc, {
    startY: sesion.temaPrincipal ? 34 : 30,
    head: [['Alumno', 'Estado', 'Observación']],
    body: asistencias.map(a => [a.alumnoNombre, _estadoLabel(a.estado), a.justificacionTexto ?? '']),
    theme: 'striped',
    styles: { fontSize: 8 },
    headStyles: { fillColor: [79, 70, 229] },
  })

  if (observaciones.length) {
    doc.setFontSize(11)
    doc.text('Observaciones de clase', 14, doc.lastAutoTable.finalY + 10)
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 14,
      head: [['Alumno', 'Tipo', 'Título', 'Prioridad']],
      body: observaciones.map(o => [o.alumnoNombre, o.tipo ?? '', o.titulo ?? o.descripcion ?? '', o.prioridad ?? '']),
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [245, 158, 11] },
    })
  }

  doc.save(`${nombre}.pdf`)
}

// ═══════════════════════════════════════════════════════════════════════════════
// MARKDOWN
// ═══════════════════════════════════════════════════════════════════════════════

async function _periodoMD(grupos, resumen, nombre) {
  let md = `# Reporte de Asistencias\n\n`
  md += `Generado: ${new Date().toLocaleDateString('es-AR')}\n\n`
  md += `## Resumen\n\n`
  md += `| Indicador | Valor |\n|---|---|\n`
  md += `| Sesiones | ${resumen.totalSesiones} |\n`
  md += `| Presentes | ${resumen.totalPresentes} |\n`
  md += `| Ausentes | ${resumen.totalAusentes} |\n`
  md += `| Justificados | ${resumen.totalJustificados} |\n`
  const pct = resumen.totalRegistros ? (resumen.totalPresentes / resumen.totalRegistros * 100).toFixed(1) + '%' : '—'
  md += `| % Asistencia | ${pct} |\n\n`
  md += `## Detalle por sesión\n\n`

  for (const { fecha, sesiones } of grupos) {
    md += `### ${fecha}\n\n`
    for (const s of sesiones) {
      md += `#### ${s.claseNombre} (${s.horaInicio?.slice(0,5)} – ${s.horaFin?.slice(0,5)})\n`
      md += `Maestro: ${s.maestroNombre}\n\n`
      if (s.alumnos?.length) {
        md += `| Alumno | Estado |\n|---|---|\n`
        for (const a of s.alumnos) {
          md += `| ${a.alumnoNombre} | ${_estadoLabel(a.estado)} |\n`
        }
        md += '\n'
      }
    }
  }

  _downloadText(md, `${nombre}.md`, 'text/markdown')
}

async function _sesionMD(sesion, asistencias, observaciones, nombre) {
  let md = `# ${sesion.claseNombre} — ${sesion.fecha}\n\n`
  md += `**Maestro:** ${sesion.maestroNombre}  \n`
  md += `**Hora:** ${sesion.horaInicio?.slice(0,5)} – ${sesion.horaFin?.slice(0,5)}\n`
  if (sesion.temaPrincipal) md += `**Tema:** ${sesion.temaPrincipal}\n`
  md += `\n## Asistencias\n\n`
  md += `| Alumno | Estado |\n|---|---|\n`
  for (const a of asistencias) {
    md += `| ${a.alumnoNombre} | ${_estadoLabel(a.estado)} |\n`
  }
  if (observaciones.length) {
    md += `\n## Observaciones de clase\n\n`
    for (const o of observaciones) {
      md += `- **${o.alumnoNombre}** [${o.tipo ?? ''}] ${o.titulo ?? o.descripcion ?? ''}\n`
    }
  }
  _downloadText(md, `${nombre}.md`, 'text/markdown')
}

// ─── LOADERS ─────────────────────────────────────────────────────────────────

async function _loadXLSX() {
  const mod = await import('xlsx')
  return mod.default ?? mod
}

async function _loadJsPDF() {
  const mod = await import('jspdf')
  return mod
}

// ─── UTILS ───────────────────────────────────────────────────────────────────

function _estadoLabel(estado) {
  return { presente: 'Presente', ausente: 'Ausente', justificado: 'Justificado' }[estado] ?? estado ?? '—'
}

function _downloadText(content, filename, mime) {
  const blob = new Blob([content], { type: mime })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 5000)
}

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import {
  obtenerReporteCierre,
  clasificarDocente,
  fmtPct,
  ESTADO,
  VEREDICTO,
} from '../api/reporteCierreApi.js'

/**
 * Informe Ejecutivo de Cierre de Semestre — generación PDF.
 *
 * Consume el payload de `fn_reporte_cierre_semestre`. La versión anterior calculaba
 * en el cliente y arrastraba dos defectos que este archivo NO reintroduce:
 *
 *   · Leía `s.clase_id` sin haberlo pedido en el `select`, de modo que `!undefined`
 *     era siempre verdadero y TODAS las sesiones se contaban como emergentes.
 *   · Escribía `cobertura || 100`, convirtiendo un 0 % real en un 100 % ficticio.
 *
 * Regla de este documento: si un dato no existe, se imprime "Sin datos" y el motivo.
 * Este PDF se firma y se archiva; un número inventado aquí sobrevive años.
 */

const COLOR = {
  tinta:    [15, 23, 42],
  grafito:  [30, 41, 59],
  humo:     [100, 116, 139],
  borde:    [226, 232, 240],
  papel:    [248, 250, 252],
  exito:    [16, 185, 129],
  info:     [59, 130, 246],
  alerta:   [245, 158, 11],
  peligro:  [239, 68, 68],
  neutro:   [148, 163, 184],
}

const SIN_DATOS = 'Sin datos'

/** Reexportado para compatibilidad con el resto del módulo. */
export { clasificarDocente }

/** Formatea un valor que puede faltar, sin inventar un sustituto numérico. */
function val(v, sufijo = '') {
  if (v === null || v === undefined || v === '') return SIN_DATOS
  return `${v}${sufijo}`
}

/**
 * Genera el informe PDF.
 *
 * @param {string|object} periodoIdOReporte  ID del período, o un reporte ya
 *        obtenido (permite que la vista reutilice el que está mostrando en
 *        pantalla y evite una segunda consulta).
 * @returns {Promise<jsPDF>}
 */
export async function generarInformePdfCierreSemestre(periodoIdOReporte) {
  const r = typeof periodoIdOReporte === 'string'
    ? await obtenerReporteCierre(periodoIdOReporte)
    : periodoIdOReporte

  if (!r || !r.periodo) throw new Error('El informe no contiene datos del período')

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' })
  const ancho = doc.internal.pageSize.getWidth()
  let y = 0

  y = seccionEncabezado(doc, r, ancho)
  y = seccionResumen(doc, r, y)
  y = seccionDocentes(doc, r, y)
  y = seccionClases(doc, r)
  y = seccionPromocion(doc, r, y)
  y = seccionInstrumentos(doc, r, y)
  y = seccionBrechas(doc, r, y)
  seccionFirmas(doc, y)
  pieDePagina(doc, r, ancho)

  return doc
}

// ─────────────────────────────────────────────────────────────────────────────
function seccionEncabezado(doc, r, ancho) {
  const p = r.periodo

  doc.setFillColor(...COLOR.tinta)
  doc.rect(0, 0, ancho, 30, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(15).setFont('helvetica', 'bold')
  doc.text('SISTEMA OPERATIVO INSTITUCIONAL (SOI)', 14, 12)

  doc.setFontSize(10).setFont('helvetica', 'normal')
  doc.text(`INFORME EJECUTIVO DE CIERRE — ${String(p.nombre ?? '').toUpperCase()}`, 14, 19)

  doc.setFontSize(7.5)
  doc.text(`Vigencia: ${val(p.fecha_inicio)} al ${val(p.fecha_fin)}`, 14, 25)

  const emitido = new Date().toLocaleDateString('es-ES', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
  doc.text(`Emitido: ${emitido}`, ancho - 14, 25, { align: 'right' })

  let y = 38

  // Un período activo y cerrado a la vez es una contradicción de estado. Si el
  // documento va a firmarse como acta, quien lo firma debe verlo en la portada.
  if (p.activo && p.cerrado) {
    doc.setFillColor(254, 243, 199)
    doc.setDrawColor(...COLOR.alerta)
    doc.roundedRect(14, y, ancho - 28, 14, 2, 2, 'FD')
    doc.setTextColor(...COLOR.grafito).setFontSize(8).setFont('helvetica', 'bold')
    doc.text('ADVERTENCIA: estado inconsistente del período', 18, y + 5.5)
    doc.setFont('helvetica', 'normal').setFontSize(7.5)
    doc.text('El período figura simultáneamente como activo y cerrado. Verifique el estado antes de usar este informe como acta.', 18, y + 10.5)
    y += 20
  }

  return y
}

// ─────────────────────────────────────────────────────────────────────────────
function tarjetaKpi(doc, x, y, w, h, etiqueta, valor, sub, color) {
  doc.setFillColor(...COLOR.papel)
  doc.setDrawColor(...COLOR.borde)
  doc.roundedRect(x, y, w, h, 2, 2, 'FD')

  doc.setFillColor(...color)
  doc.rect(x, y, 2.5, h, 'F')

  doc.setFontSize(7).setFont('helvetica', 'bold').setTextColor(...COLOR.humo)
  doc.text(String(etiqueta).toUpperCase(), x + 6, y + 6)

  const esSinDatos = valor === SIN_DATOS
  doc.setFontSize(esSinDatos ? 9 : 13).setFont('helvetica', 'bold')
  doc.setTextColor(...(esSinDatos ? COLOR.neutro : COLOR.tinta))
  doc.text(String(valor), x + 6, y + 13)

  doc.setFontSize(6.8).setFont('helvetica', 'normal').setTextColor(...COLOR.humo)
  doc.text(String(sub ?? ''), x + 6, y + 18)
}

function titulo(doc, texto, y) {
  doc.setFontSize(11.5).setFont('helvetica', 'bold').setTextColor(...COLOR.grafito)
  doc.text(texto, 14, y)
  return y + 5
}

// ─────────────────────────────────────────────────────────────────────────────
function seccionResumen(doc, r, y) {
  const s = r.resumen ?? {}
  const a = r.asistencia ?? {}

  y = titulo(doc, '1. Resumen ejecutivo', y)
  y += 2

  const w = 44, h = 22
  tarjetaKpi(doc, 14,  y, w, h, 'Cumplim. registro', fmtPct(s.pct_cumplimiento_registro, SIN_DATOS),
    `${s.sesiones_registradas ?? 0}/${s.sesiones_periodo ?? 0} sesiones`, COLOR.info)
  tarjetaKpi(doc, 62,  y, w, h, 'Asistencia', fmtPct(a.tasa_global, SIN_DATOS),
    `${a.presentes ?? 0} P / ${a.ausentes ?? 0} A / ${a.justificados ?? 0} J`, COLOR.exito)
  tarjetaKpi(doc, 110, y, w, h, 'Registro puntual', fmtPct(a.pct_registro_puntual, SIN_DATOS),
    `${a.marcas_tardias ?? 0} fuera de plazo`, COLOR.alerta)
  tarjetaKpi(doc, 158, y, w, h, 'Matrícula activa', val(s.alumnos_activos),
    `${s.clases_activas ?? 0} clases · ${s.maestros_activos ?? 0} docentes`, COLOR.tinta)

  y += h + 7

  doc.setFontSize(8).setFont('helvetica', 'normal').setTextColor(...COLOR.grafito)
  doc.text(`Sesiones en borrador: ${s.sesiones_borrador ?? 0}     ·     Pendientes: ${s.sesiones_pendientes ?? 0}     ·     Sin clase vinculada: ${s.sesiones_sin_clase ?? 0}`, 14, y)

  return y + 8
}

// ─────────────────────────────────────────────────────────────────────────────
function seccionDocentes(doc, r, y) {
  y = titulo(doc, '2. Desempeño docente', y)

  doc.setFontSize(7.5).setFont('helvetica', 'italic').setTextColor(...COLOR.humo)
  doc.text('Atribución por docente titular de la clase. Los docentes sin actividad registrada no se clasifican.', 14, y)
  y += 4

  const evaluables = r.docentesEvaluables ?? []

  if (evaluables.length === 0) {
    doc.setFontSize(8.5).setFont('helvetica', 'normal').setTextColor(...COLOR.humo)
    doc.text('Ningún docente registró sesiones en este período.', 18, y + 4)
    return y + 12
  }

  autoTable(doc, {
    startY: y,
    head: [['Docente', 'Clases', 'Sesiones', 'Registr.', 'Borrador', 'Marcas', '% Cumpl.', '% Puntual.', 'Clasificación']],
    body: evaluables.map(d => [
      d.nombre ?? '—',
      d.clases_a_cargo ?? 0,
      d.sesiones ?? 0,
      d.registradas ?? 0,
      d.borradores ?? 0,
      d.marcas_registradas ?? 0,
      fmtPct(d.pct_cumplimiento, SIN_DATOS),
      fmtPct(d.pct_puntualidad, SIN_DATOS),
      clasificarDocente(d.pct_puntualidad, d.estado_evaluacion).badge,
    ]),
    theme: 'striped',
    headStyles: { fillColor: COLOR.grafito, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7.5 },
    bodyStyles: { fontSize: 7.5 },
    columnStyles: {
      0: { cellWidth: 42 },
      1: { halign: 'center' }, 2: { halign: 'center' }, 3: { halign: 'center' },
      4: { halign: 'center' }, 5: { halign: 'center' },
      6: { halign: 'center' }, 7: { halign: 'center', fontStyle: 'bold' },
      8: { halign: 'center', fontStyle: 'bold' },
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 8) {
        const mapa = {
          Eficiente: COLOR.exito, Aceptable: COLOR.info,
          Regular: COLOR.alerta, Insolvente: COLOR.peligro,
        }
        const c = mapa[String(data.cell.raw)]
        if (c) data.cell.styles.textColor = c
      }
    },
  })

  y = doc.lastAutoTable.finalY + 5

  const noEvaluados = (r.docentes ?? []).filter(d => d.estado_evaluacion !== ESTADO.EVALUABLE)
  if (noEvaluados.length > 0) {
    doc.setFontSize(7.5).setFont('helvetica', 'normal').setTextColor(...COLOR.humo)
    const nombres = noEvaluados.map(d => d.nombre).filter(Boolean).join(', ')
    const lineas = doc.splitTextToSize(
      `Sin clasificar (${noEvaluados.length}): ${nombres}. La ausencia de registros no equivale a incumplimiento.`,
      doc.internal.pageSize.getWidth() - 32)
    doc.text(lineas, 18, y)
    y += lineas.length * 3.6 + 4
  }

  return y
}

// ─────────────────────────────────────────────────────────────────────────────
function seccionClases(doc, r) {
  doc.addPage()
  let y = titulo(doc, '3. Detalle por clase', 20)

  autoTable(doc, {
    startY: y,
    head: [['Clase', 'Docente', 'Inscritos', 'Sesiones', 'Marcas', 'Asistencia', 'Alerta']],
    body: (r.clases ?? []).map(c => [
      c.nombre ?? '—',
      c.maestro ?? '—',
      c.inscritos ?? 0,
      c.sesiones ?? 0,
      c.marcas ?? 0,
      fmtPct(c.tasa_asistencia, SIN_DATOS),
      c.alerta_reconciliacion ?? '',
    ]),
    theme: 'striped',
    headStyles: { fillColor: COLOR.grafito, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7.5 },
    bodyStyles: { fontSize: 7.5 },
    columnStyles: {
      0: { cellWidth: 44 }, 1: { cellWidth: 34 },
      2: { halign: 'center' }, 3: { halign: 'center' }, 4: { halign: 'center' },
      5: { halign: 'center', fontStyle: 'bold' }, 6: { fontSize: 6.5 },
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 6 && data.cell.raw) {
        data.cell.styles.textColor = COLOR.peligro
      }
    },
  })

  y = doc.lastAutoTable.finalY + 5

  const conAlerta = (r.clasesConAlerta ?? []).length
  if (conAlerta > 0) {
    doc.setFontSize(7.5).setFont('helvetica', 'bold').setTextColor(...COLOR.peligro)
    const lineas = doc.splitTextToSize(
      `${conAlerta} clase(s) presentan marcas de asistencia que no reconcilian con la matrícula registrada. ` +
      'Sus tasas de asistencia no son confiables hasta corregir el vínculo alumno–clase.',
      doc.internal.pageSize.getWidth() - 32)
    doc.text(lineas, 18, y)
    y += lineas.length * 3.6 + 4
  }

  return y
}

// ─────────────────────────────────────────────────────────────────────────────
function seccionPromocion(doc, r, y) {
  if (y > 200) { doc.addPage(); y = 20 }

  y = titulo(doc, '4. Promoción y repitencia', y)

  const params = r.meta?.parametros ?? {}
  const ancho = doc.internal.pageSize.getWidth()

  // La escala de calificación es el supuesto más frágil de todo el informe.
  // Va destacado, antes de cualquier cifra, y no como nota al pie.
  doc.setFillColor(254, 226, 226)
  doc.setDrawColor(...COLOR.peligro)
  doc.roundedRect(14, y, ancho - 28, 17, 2, 2, 'FD')
  doc.setFontSize(8).setFont('helvetica', 'bold').setTextColor(...COLOR.grafito)
  doc.text('LA ESCALA DE CALIFICACIÓN REQUIERE VALIDACIÓN INSTITUCIONAL', 18, y + 5.5)
  doc.setFont('helvetica', 'normal').setFontSize(7.2)
  const aviso = doc.splitTextToSize(
    `Se normalizó sobre escala ${params.escala_calificacion ?? '?'} con umbral de aprobación del ${params.umbral_nota_pct ?? '?'} % ` +
    `y asistencia mínima del ${params.umbral_asistencia_pct ?? '?'} %. Los criterios almacenados asumen escala 0-10. ` +
    'Estos veredictos NO constituyen una decisión de promoción hasta confirmar la escala.',
    ancho - 36)
  doc.text(aviso, 18, y + 10)
  y += 23

  const t = r.promocionTotales ?? {}
  const w = 44, h = 20
  tarjetaKpi(doc, 14,  y, w, h, 'Promueven',      val(t.PROMUEVE ?? 0),     'cumplen ambos criterios', COLOR.exito)
  tarjetaKpi(doc, 62,  y, w, h, 'No promueven',   val(t.NO_PROMUEVE ?? 0),  'requieren revisión',      COLOR.peligro)
  tarjetaKpi(doc, 110, y, w, h, 'Sin evaluación', val((t.SIN_EVALUACION ?? 0) + (t.SIN_ASISTENCIA ?? 0)), 'evidencia incompleta', COLOR.alerta)
  tarjetaKpi(doc, 158, y, w, h, 'Sin datos',      val(t.SIN_DATOS ?? 0),    'sin evidencia alguna',    COLOR.neutro)
  y += h + 6

  doc.setFontSize(7.5).setFont('helvetica', 'italic').setTextColor(...COLOR.humo)
  doc.text(`Solo ${(r.promocionEvaluada ?? []).length} alumnos tienen evidencia suficiente para un veredicto. Al resto no se le asigna aprobación por omisión.`, 14, y)
  y += 6

  const noPromueven = (r.promocion ?? []).filter(p => p.veredicto === VEREDICTO.NO_PROMUEVE)
  if (noPromueven.length > 0) {
    autoTable(doc, {
      startY: y,
      head: [['Alumno', 'Instrumento', 'Promedio', '% Nota', '% Asistencia', 'Motivo']],
      body: noPromueven.map(p => [
        p.nombre ?? '—',
        p.instrumento ?? '—',
        p.promedio ?? SIN_DATOS,
        fmtPct(p.pct_nota, SIN_DATOS),
        fmtPct(p.pct_asistencia, SIN_DATOS),
        p.motivo ?? '',
      ]),
      theme: 'striped',
      headStyles: { fillColor: [185, 28, 28], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7.5 },
      bodyStyles: { fontSize: 7 },
      columnStyles: {
        0: { cellWidth: 44 }, 1: { cellWidth: 26 },
        2: { halign: 'center' }, 3: { halign: 'center' }, 4: { halign: 'center' },
        5: { fontSize: 6.5 },
      },
    })
    y = doc.lastAutoTable.finalY + 6
  }

  return y
}

// ─────────────────────────────────────────────────────────────────────────────
function seccionInstrumentos(doc, r, y) {
  if (y > 215) { doc.addPage(); y = 20 }

  y = titulo(doc, '5. Patrimonio instrumental', y)
  y += 2

  const i = r.instrumentos ?? {}
  const w = 44, h = 20
  tarjetaKpi(doc, 14,  y, w, h, 'Inventario activo', val(i.total_activos), 'instrumentos', COLOR.info)
  tarjetaKpi(doc, 62,  y, w, h, 'Requieren mant.',   val(i.requieren_mantenimiento), `${i.en_reparacion ?? 0} en reparación`, COLOR.alerta)
  tarjetaKpi(doc, 110, y, w, h, 'En comodato',       val(i.comodatos_activos), `${i.alumnos_con_instrumento ?? 0} alumnos`, COLOR.exito)
  tarjetaKpi(doc, 158, y, w, h, 'Dados de baja',     val(i.dados_de_baja), 'fuera de servicio', COLOR.peligro)
  y += h + 6

  doc.setFontSize(8).setFont('helvetica', 'normal').setTextColor(...COLOR.grafito)
  doc.text(`Comodatos vencidos: ${i.comodatos_vencidos ?? 0}     ·     Sin contrato firmado: ${i.comodatos_sin_contrato ?? 0}`, 14, y)
  y += 6

  const hist = i.historial_reparaciones ?? {}
  if (hist.estado === ESTADO.SIN_DATOS) {
    doc.setFontSize(7.5).setFont('helvetica', 'italic').setTextColor(...COLOR.humo)
    const lineas = doc.splitTextToSize(`Historial de reparaciones: ${hist.motivo ?? SIN_DATOS}`, doc.internal.pageSize.getWidth() - 32)
    doc.text(lineas, 18, y)
    y += lineas.length * 3.6 + 4
  }

  return y
}

// ─────────────────────────────────────────────────────────────────────────────
function seccionBrechas(doc, r, y) {
  if (y > 190) { doc.addPage(); y = 20 }

  y = titulo(doc, '6. Brechas de datos y advertencias', y)

  doc.setFontSize(7.5).setFont('helvetica', 'italic').setTextColor(...COLOR.humo)
  doc.text('Lo que este informe no puede afirmar, y por qué. Un hueco silenciado se lee como un cero.', 14, y)
  y += 4

  const filas = [
    ...(r.brechas ?? []).map(b => [b.dimension ?? '—', b.estado ?? '—', b.motivo ?? '']),
    ...Object.entries(r.indicadores ?? {})
      .filter(([k, v]) => k !== 'meta' && k !== '_error' && v && v.estado)
      .map(([k, v]) => [etiquetaIndicador(k), v.estado, v.motivo ?? '']),
  ]

  autoTable(doc, {
    startY: y,
    head: [['Dimensión', 'Estado', 'Motivo']],
    body: filas,
    theme: 'grid',
    headStyles: { fillColor: [71, 85, 105], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7.5 },
    bodyStyles: { fontSize: 6.8, valign: 'top' },
    columnStyles: {
      0: { cellWidth: 42, fontStyle: 'bold' },
      1: { cellWidth: 26, halign: 'center', fontStyle: 'bold' },
      2: { cellWidth: 'auto' },
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 1) {
        const mapa = {
          SIN_DATOS: COLOR.neutro, PARCIAL: COLOR.alerta,
          REQUIERE_VALIDACION: COLOR.peligro, EVALUABLE: COLOR.exito,
          CORREGIDA_EN_LECTURA: COLOR.info,
        }
        const c = mapa[String(data.cell.raw)]
        if (c) data.cell.styles.textColor = c
      }
    },
  })

  return doc.lastAutoTable.finalY + 10
}

function etiquetaIndicador(clave) {
  return {
    retencion: 'Retención estudiantil',
    avance_pedagogico: 'Avance pedagógico',
    contingencias: 'Contingencias y suplencias',
    justificaciones: 'Justificaciones por causal',
    asistencia_docente: 'Asistencia del personal docente',
  }[clave] ?? clave
}

// ─────────────────────────────────────────────────────────────────────────────
function seccionFirmas(doc, y) {
  if (y > 240) { doc.addPage(); y = 40 }

  doc.setDrawColor(...COLOR.neutro)
  doc.line(14, y, 85, y)
  doc.line(115, y, 190, y)

  doc.setFontSize(8).setFont('helvetica', 'bold').setTextColor(...COLOR.grafito)
  doc.text('Coordinación ACM', 14, y + 4)
  doc.text('Dirección Institucional', 115, y + 4)
}

function pieDePagina(doc, r, ancho) {
  const total = doc.internal.getNumberOfPages()
  const alto = doc.internal.pageSize.getHeight()

  for (let i = 1; i <= total; i++) {
    doc.setPage(i)
    doc.setFontSize(6.5).setFont('helvetica', 'normal').setTextColor(...COLOR.humo)
    doc.text(
      `SOI · Informe de cierre · ${r.periodo?.nombre ?? ''} · generado ${new Date(r.meta?.generado_en ?? Date.now()).toLocaleDateString('es-ES')}`,
      14, alto - 8)
    doc.text(`Página ${i} de ${total}`, ancho - 14, alto - 8, { align: 'right' })
  }
}

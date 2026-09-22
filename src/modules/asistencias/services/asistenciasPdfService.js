/**
 * asistenciasPdfService.js — Informe Mensual de Control de Asistencia (ADM).
 *
 * El PDF consume el mismo timeline filtrado que utiliza la vista de Control
 * de Asistencia. No consulta un reporte paralelo: pantalla y exportación
 * comparten una única fuente de verdad.
 */

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const COLOR = {
  primario: [37, 99, 235],
  tinta: [15, 23, 42],
  grafito: [51, 65, 85],
  humo: [100, 116, 139],
  borde: [226, 232, 240],
  fondo: [248, 250, 252],
  exito: [22, 163, 74],
  alerta: [217, 119, 6],
  peligro: [220, 38, 38],
}

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

function pct(n, d) {
  return d > 0 ? Math.round((n / d) * 1000) / 10 : 0
}

export function filtrarTimelinePorMes(timeline = [], anio, mesIndex) {
  const prefijo = `${anio}-${String(Number(mesIndex) + 1).padStart(2, '0')}-`
  return (Array.isArray(timeline) ? timeline : []).filter((dia) =>
    typeof dia?.fecha === 'string' && dia.fecha.startsWith(prefijo),
  )
}

export function construirDatosInformeAsistencias(timeline = []) {
  const dias = Array.isArray(timeline) ? timeline : []
  const porClase = new Map()
  const porAlumno = new Map()

  let totalSesiones = 0
  let presentes = 0
  let justificados = 0
  let ausentes = 0

  const resumenPorDia = dias
    .map((dia) => {
      let dSesiones = 0
      let dPresentes = 0
      let dJustificados = 0
      let dAusentes = 0

      for (const clase of dia.clases || []) {
        dSesiones++
        totalSesiones++

        const p = Number(clase.presentes || 0)
        const j = Number(clase.justificados || 0)
        const a = Number(clase.ausentes || 0)
        dPresentes += p
        dJustificados += j
        dAusentes += a
        presentes += p
        justificados += j
        ausentes += a

        const claseKey = clase.clase_id || [
          clase.clase_nombre || 'Clase',
          clase.maestro_nombre || 'Sin asignar',
          clase.instrumento || 'General',
        ].join('|')

        if (!porClase.has(claseKey)) {
          porClase.set(claseKey, {
            claseId: clase.clase_id || null,
            clase: clase.clase_nombre || 'Clase',
            maestro: clase.maestro_nombre || 'Sin asignar',
            catedra: clase.instrumento || 'General',
            sesiones: 0,
            presentes: 0,
            justificados: 0,
            ausentes: 0,
          })
        }

        const agg = porClase.get(claseKey)
        agg.sesiones++
        agg.presentes += p
        agg.justificados += j
        agg.ausentes += a

        for (const asistencia of clase.asistencias || []) {
          const estado = String(asistencia.estado || '').toLowerCase()
          if (estado !== 'ausente' && estado !== 'justificado') continue

          const alumnoKey = asistencia.alumno_id || asistencia.alumnoId || asistencia.alumno_nombre
          if (!alumnoKey) continue

          if (!porAlumno.has(alumnoKey)) {
            porAlumno.set(alumnoKey, {
              alumnoId: asistencia.alumno_id || asistencia.alumnoId || null,
              alumno: asistencia.alumno_nombre || asistencia.alumnoNombre || 'Alumno',
              instrumento: asistencia.instrumento || clase.instrumento || '—',
              ausencias: 0,
              justificadas: 0,
              injustificadas: 0,
              clases: new Set(),
              fechas: new Set(),
            })
          }

          const item = porAlumno.get(alumnoKey)
          item.ausencias++
          if (estado === 'justificado') item.justificadas++
          else item.injustificadas++
          item.clases.add(clase.clase_nombre || 'Clase')
          if (dia.fecha) item.fechas.add(dia.fecha)
        }
      }

      const convocatorias = dPresentes + dJustificados + dAusentes
      return {
        fecha: dia.fecha,
        sesiones: dSesiones,
        presentes: dPresentes,
        justificados: dJustificados,
        ausentes: dAusentes,
        convocatorias,
        tasaAsistenciaPct: pct(dPresentes, convocatorias),
      }
    })
    .sort((a, b) => String(a.fecha).localeCompare(String(b.fecha)))

  const convocatorias = presentes + justificados + ausentes

  const resumenPorClase = [...porClase.values()]
    .map((c) => {
      const total = c.presentes + c.justificados + c.ausentes
      return {
        ...c,
        convocatorias: total,
        tasaAsistenciaPct: pct(c.presentes, total),
      }
    })
    .sort((a, b) => a.clase.localeCompare(b.clase, 'es'))

  const incidencias = [...porAlumno.values()]
    .filter((a) => a.ausencias >= 2)
    .map((a) => ({
      ...a,
      clases: [...a.clases].sort((x, y) => x.localeCompare(y, 'es')),
      fechas: [...a.fechas].sort(),
    }))
    .sort((a, b) =>
      b.ausencias - a.ausencias ||
      b.injustificadas - a.injustificadas ||
      a.alumno.localeCompare(b.alumno, 'es'),
    )

  return {
    resumen: {
      totalSesiones,
      convocatorias,
      presentes,
      justificados,
      ausentes,
      tasaAsistenciaPct: pct(presentes, convocatorias),
      tasaJustificadaPct: pct(justificados, convocatorias),
      tasaInjustificadaPct: pct(ausentes, convocatorias),
    },
    resumenPorDia,
    resumenPorClase,
    incidencias,
  }
}

function aplicarPie(doc) {
  const total = doc.internal.getNumberOfPages()
  const w = doc.internal.pageSize.getWidth()
  const h = doc.internal.pageSize.getHeight()

  for (let i = 1; i <= total; i++) {
    doc.setPage(i)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...COLOR.humo)
    doc.text('Sistema Operativo Institucional · Control de Asistencia ADM', 14, h - 8)
    doc.text(`Página ${i} de ${total}`, w - 14, h - 8, { align: 'right' })
  }
}

function asegurarEspacio(doc, y, requerido = 30) {
  const limite = doc.internal.pageSize.getHeight() - 18
  if (y + requerido <= limite) return y
  doc.addPage()
  return 16
}

function labelFiltro(value, fallback) {
  if (value == null || value === '' || value === 'todas' || value === 'todos') return fallback
  return String(value)
}

export async function descargarPdfControlAsistencias({
  timeline = [],
  anio,
  mesIndex,
  periodoNombre = 'Período Académico',
  filtros = {},
  fechaGeneracion = new Date(),
} = {}) {
  const datos = construirDatosInformeAsistencias(timeline)
  const mesNombre = MESES[Number(mesIndex)] || 'Mes'
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const w = doc.internal.pageSize.getWidth()

  doc.setFillColor(...COLOR.primario)
  doc.rect(0, 0, w, 5, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.setTextColor(...COLOR.tinta)
  doc.text('Informe Mensual de Control de Asistencia', 14, 17)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...COLOR.humo)
  doc.text(`${mesNombre} ${anio} · ${periodoNombre}`, 14, 23)
  doc.text(
    `Generado: ${new Date(fechaGeneracion).toLocaleDateString('es-DO', {
      day: '2-digit', month: 'long', year: 'numeric',
    })}`,
    w - 14,
    23,
    { align: 'right' },
  )

  autoTable(doc, {
    startY: 28,
    body: [[
      { content: 'Filtros aplicados', styles: { fontStyle: 'bold', fillColor: COLOR.fondo } },
      `Cátedra: ${labelFiltro(filtros.catedra, 'Todas')} · Clase: ${labelFiltro(filtros.clase, 'Todas')} · Maestro: ${labelFiltro(filtros.maestro, 'Todos')} · Búsqueda: ${filtros.busqueda ? `"${filtros.busqueda}"` : 'Sin búsqueda'}`,
    ]],
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2.3, textColor: COLOR.grafito },
    columnStyles: { 0: { cellWidth: 35 } },
    margin: { left: 14, right: 14 },
  })

  let y = doc.lastAutoTable.finalY + 7

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...COLOR.tinta)
  doc.text('1. Resumen General', 14, y)
  y += 4

  const r = datos.resumen
  autoTable(doc, {
    startY: y,
    body: [
      ['Sesiones registradas', String(r.totalSesiones), 'Convocatorias de alumnos', String(r.convocatorias)],
      ['Presentes', String(r.presentes), 'Tasa real de asistencia', `${r.tasaAsistenciaPct}%`],
      ['Ausencias justificadas', String(r.justificados), 'Peso sobre convocatorias', `${r.tasaJustificadaPct}%`],
      ['Ausencias injustificadas', String(r.ausentes), 'Peso sobre convocatorias', `${r.tasaInjustificadaPct}%`],
    ],
    theme: 'grid',
    styles: { fontSize: 8.5, cellPadding: 2.5, textColor: COLOR.grafito },
    columnStyles: {
      0: { fontStyle: 'bold', fillColor: COLOR.fondo },
      2: { fontStyle: 'bold', fillColor: COLOR.fondo },
    },
    margin: { left: 14, right: 14 },
  })

  y = doc.lastAutoTable.finalY + 8
  y = asegurarEspacio(doc, y, 45)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...COLOR.tinta)
  doc.text('2. Resumen por Día', 14, y)
  y += 4

  const diaRows = datos.resumenPorDia.map((d) => [
    d.fecha || '—',
    String(d.sesiones),
    String(d.convocatorias),
    String(d.presentes),
    String(d.justificados),
    String(d.ausentes),
    `${d.tasaAsistenciaPct}%`,
  ])

  autoTable(doc, {
    startY: y,
    head: [['Fecha', 'Sesiones', 'Convoc.', 'P', 'J', 'A', '% Asistencia']],
    body: diaRows.length ? diaRows : [['Sin registros en el mes', '—', '—', '—', '—', '—', '—']],
    theme: 'striped',
    headStyles: { fillColor: COLOR.primario, textColor: [255, 255, 255], fontSize: 8 },
    styles: { fontSize: 8, cellPadding: 2 },
    columnStyles: {
      1: { halign: 'center' }, 2: { halign: 'center' }, 3: { halign: 'center' },
      4: { halign: 'center' }, 5: { halign: 'center' }, 6: { halign: 'center', fontStyle: 'bold' },
    },
    margin: { left: 14, right: 14 },
  })

  y = doc.lastAutoTable.finalY + 8
  y = asegurarEspacio(doc, y, 55)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...COLOR.tinta)
  doc.text('3. Consolidado por Clase y Docente', 14, y)
  y += 4

  const claseRows = datos.resumenPorClase.map((c) => [
    c.clase,
    c.maestro,
    c.catedra,
    String(c.sesiones),
    String(c.convocatorias),
    `${c.presentes}/${c.justificados}/${c.ausentes}`,
    `${c.tasaAsistenciaPct}%`,
  ])

  autoTable(doc, {
    startY: y,
    head: [['Clase', 'Maestro', 'Cátedra', 'Ses.', 'Conv.', 'P/J/A', '%']],
    body: claseRows.length ? claseRows : [['Sin clases', '—', '—', '—', '—', '—', '—']],
    theme: 'striped',
    headStyles: { fillColor: COLOR.primario, textColor: [255, 255, 255], fontSize: 7.5 },
    styles: { fontSize: 7.5, cellPadding: 1.8 },
    columnStyles: {
      3: { halign: 'center' }, 4: { halign: 'center' },
      5: { halign: 'center' }, 6: { halign: 'center', fontStyle: 'bold' },
    },
    margin: { left: 14, right: 14 },
  })

  y = doc.lastAutoTable.finalY + 8
  y = asegurarEspacio(doc, y, 50)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...COLOR.tinta)
  doc.text('4. Incidencias Relevantes (2 o más ausencias en el mes)', 14, y)
  y += 4

  const incidenciaRows = datos.incidencias.map((a) => [
    a.alumno,
    a.instrumento || '—',
    String(a.ausencias),
    String(a.justificadas),
    String(a.injustificadas),
    a.clases.join(', ') || '—',
  ])

  autoTable(doc, {
    startY: y,
    head: [['Alumno', 'Instrumento', 'Ausencias', 'Justif.', 'Injustif.', 'Clases']],
    body: incidenciaRows.length
      ? incidenciaRows
      : [['Sin alumnos con 2 o más ausencias', '—', '—', '—', '—', '—']],
    theme: 'striped',
    headStyles: { fillColor: COLOR.peligro, textColor: [255, 255, 255], fontSize: 7.5 },
    styles: { fontSize: 7.5, cellPadding: 1.8 },
    columnStyles: {
      2: { halign: 'center', fontStyle: 'bold' },
      3: { halign: 'center' },
      4: { halign: 'center', textColor: COLOR.peligro, fontStyle: 'bold' },
    },
    margin: { left: 14, right: 14 },
  })

  aplicarPie(doc)

  const filtrosActivos = [
    filtros.catedra && filtros.catedra !== 'todas' ? 'filtrado' : '',
    filtros.clase && filtros.clase !== 'todas' ? 'filtrado' : '',
    filtros.maestro && filtros.maestro !== 'todos' ? 'filtrado' : '',
    filtros.busqueda ? 'filtrado' : '',
  ].some(Boolean)

  const sufijo = filtrosActivos ? '_Filtrado' : ''
  doc.save(`Control_Asistencia_${anio}-${String(Number(mesIndex) + 1).padStart(2, '0')}${sufijo}.pdf`)

  return datos
}

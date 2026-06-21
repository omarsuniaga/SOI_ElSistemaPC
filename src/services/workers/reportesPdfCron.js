import cron from 'node-cron'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { sendWhatsAppGroupDocument } from '../../lib/hermesClient.js'

const ADMIN_JID = process.env.HERMES_ADMIN_JID

function getPeriodoSemanal() {
  const hoy = new Date()
  const lunes = new Date(hoy)
  lunes.setDate(hoy.getDate() - ((hoy.getDay() + 6) % 7))
  return {
    desde: lunes.toISOString().split('T')[0],
    hasta: hoy.toISOString().split('T')[0],
    label: `${lunes.toLocaleDateString('es-DO', { day: 'numeric', month: 'long' })} – ${hoy.toLocaleDateString('es-DO', { day: 'numeric', month: 'long', year: 'numeric' })}`,
  }
}

async function generarReporteSemanal(supabase) {
  const periodo = getPeriodoSemanal()

  const [
    { count: totalAlumnos },
    { count: totalClases },
    { data: asistencias },
    { data: sesiones },
    { data: bitacorasData },
    { data: alertasData },
  ] = await Promise.all([
    supabase.from('alumnos').select('*', { count: 'exact', head: true }).eq('activo', true),
    supabase.from('clases').select('*', { count: 'exact', head: true }).eq('estado', 'activa'),
    supabase
      .from('asistencias')
      .select('estado')
      .gte('fecha', `${periodo.desde}T00:00:00`)
      .lte('fecha', `${periodo.hasta}T23:59:59`),
    supabase
      .from('sesiones_clase')
      .select('id, clase_id')
      .gte('fecha', `${periodo.desde}T00:00:00`)
      .lte('fecha', `${periodo.hasta}T23:59:59`),
    supabase
      .from('indicator_sessions')
      .select('clase_id')
      .gte('fecha', `${periodo.desde}T00:00:00`)
      .lte('fecha', `${periodo.hasta}T23:59:59`),
    supabase
      .from('student_case_alerts')
      .select('nivel_riesgo, estado')
      .gte('detectada_en', `${periodo.desde}T00:00:00`),
  ])

  const totalPresentes = asistencias?.filter((a) => ['presente', 'P'].includes(a.estado)).length ?? 0
  const totalAusentes = asistencias?.filter((a) => ['ausente', 'A'].includes(a.estado)).length ?? 0
  const totalRegistros = asistencias?.length ?? 0
  const tasaAsistencia =
    totalRegistros > 0 ? `${((totalPresentes / totalRegistros) * 100).toFixed(1)}%` : 'N/A'

  const clasesConBitacora = new Set(bitacorasData?.map((b) => b.clase_id) ?? []).size
  const totalSesiones = sesiones?.length ?? 0
  const coberturaBitacora =
    totalSesiones > 0 ? `${((clasesConBitacora / totalSesiones) * 100).toFixed(1)}%` : 'N/A'

  const alertasCriticas = alertasData?.filter((a) => a.nivel_riesgo === 'critico').length ?? 0
  const alertasAltas = alertasData?.filter((a) => a.nivel_riesgo === 'alto').length ?? 0
  const alertasPendientes = alertasData?.filter((a) => a.estado === 'pendiente').length ?? 0

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' })

  // Header
  doc.setFillColor(0, 86, 179)
  doc.rect(0, 0, 216, 28, 'F')
  doc.setFillColor(255, 193, 7)
  doc.rect(0, 28, 216, 3, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(15)
  doc.setFont(undefined, 'bold')
  doc.text('El Sistema Punta Cana', 108, 12, { align: 'center' })
  doc.setFontSize(10)
  doc.setFont(undefined, 'normal')
  doc.text(`Reporte Semanal • ${periodo.label}`, 108, 21, { align: 'center' })

  // KPIs
  doc.setTextColor(30, 30, 30)
  doc.setFontSize(12)
  doc.setFont(undefined, 'bold')
  doc.text('Resumen Operativo', 14, 44)

  autoTable(doc, {
    startY: 48,
    head: [['Indicador', 'Valor']],
    body: [
      ['Alumnos activos', String(totalAlumnos ?? 0)],
      ['Clases activas', String(totalClases ?? 0)],
      ['Sesiones realizadas', String(totalSesiones)],
      ['Tasa de asistencia', tasaAsistencia],
      ['  · Presentes', String(totalPresentes)],
      ['  · Ausentes', String(totalAusentes)],
      ['Cobertura de bitácoras', coberturaBitacora],
    ],
    styles: { fontSize: 10 },
    headStyles: { fillColor: [0, 86, 179] },
    alternateRowStyles: { fillColor: [240, 246, 255] },
    columnStyles: { 0: { fontStyle: 'bold' }, 1: { halign: 'right' } },
  })

  const afterKpis = doc.lastAutoTable?.finalY ?? 130
  doc.setFont(undefined, 'bold')
  doc.setFontSize(12)
  doc.text('Alertas Pedagógicas', 14, afterKpis + 12)

  autoTable(doc, {
    startY: afterKpis + 16,
    head: [['Tipo', 'Cantidad']],
    body: [
      ['Riesgo crítico 🚨', String(alertasCriticas)],
      ['Riesgo alto 🔴', String(alertasAltas)],
      ['Pendientes de revisión', String(alertasPendientes)],
    ],
    styles: { fontSize: 10 },
    headStyles: { fillColor: [185, 28, 28] },
    alternateRowStyles: { fillColor: [255, 245, 245] },
    columnStyles: { 0: { fontStyle: 'bold' }, 1: { halign: 'right' } },
  })

  doc.setFontSize(8)
  doc.setTextColor(150, 150, 150)
  doc.text(
    `Generado automáticamente el ${new Date().toLocaleString('es-DO')} · Sistema Académico SOI`,
    108,
    270,
    { align: 'center' }
  )

  const pdfBuffer = Buffer.from(doc.output('arraybuffer'))
  const filename = `reporte-semanal-${periodo.desde}.pdf`

  return {
    pdfBuffer,
    filename,
    periodo,
    stats: { totalAlumnos, totalClases, tasaAsistencia, alertasCriticas, alertasAltas },
  }
}

export function registerReportesPdfCron(supabase, logger = console) {
  cron.schedule('0 8 * * 5', async () => {
    if (!ADMIN_JID) {
      logger.warn('[ReportesPDF] HERMES_ADMIN_JID not set — skipping')
      return
    }
    try {
      const { pdfBuffer, filename, periodo, stats } = await generarReporteSemanal(supabase)

      const caption =
        `📄 *Reporte Semanal — ${periodo.label}*\n\n` +
        `• Alumnos activos: ${stats.totalAlumnos}\n` +
        `• Clases activas: ${stats.totalClases}\n` +
        `• Asistencia: ${stats.tasaAsistencia}\n` +
        `• Alertas críticas: ${stats.alertasCriticas} | Altas: ${stats.alertasAltas}`

      const res = await sendWhatsAppGroupDocument(ADMIN_JID, caption, pdfBuffer, filename)
      logger.info(`[ReportesPDF] sent=${res.sent} filename=${filename}`)
    } catch (err) {
      logger.error('[ReportesPDF] cron failed:', err)
    }
  })
  logger.info('[ReportesPDF] Cron registered (0 8 * * 5 UTC — viernes)')
}

import { AppModal } from '../../../shared/components/AppModal.js'
import { AppToast } from '../../../shared/components/AppToast.js'
import { escapeHTML } from '../utils/clasesUtils.js'
import { getReporteConsolidado, getPeriodos, getClassRoster, getDetalleSesion } from '../../asistencias/api/asistenciasApi.js'
import { buildClassHistory, buildStudentClassHistory, defaultClassHistoryRange } from '../../asistencias/services/classHistoryService.js'
import { downloadClassHistoryPdf } from '../../asistencias/services/classHistoryPdfService.js'
import { generateClassNarratives } from '../../asistencias/services/classHealthNarrativeService.js'
import { config } from '../../../core/config/config.js'

export async function openClassHistoryModal(classInfo) {
  const toast = AppToast.progress('Cargando historial de clase…')
  try {
    const [{ timelineByDate }, periods, roster] = await Promise.all([
      getReporteConsolidado({ claseId: classInfo.id, fullHistory: true }), getPeriodos(), getClassRoster(classInfo.id),
    ])
    const timeline = timelineByDate || []
    const initialRange = defaultClassHistoryRange()
    let report = buildClassHistory(timeline, classInfo.id, initialRange)
    const details = {}
    const ids = [...new Set(buildClassHistory(timeline, classInfo.id).entries.map(e => e.id).filter(Boolean))]
    for (let i = 0; i < ids.length; i += 5) {
      await Promise.all(ids.slice(i, i + 5).map(async id => {
        try { details[id] = await getDetalleSesion(id) } catch { details[id] = null }
      }))
    }
    const enrich = value => {
      const students = new Map(value.students.map(s => [s.id, { ...s, current: false }]))
      for (const student of roster) students.set(student.id, { ...student, current: true })
      value.studentHistories = [...students.values()].map(student => buildStudentClassHistory(value, student, details))
      value.detailsIncomplete = ids.some(id => !details[id])
      return value
    }
    enrich(report)
    let generation = 0
    const draw = body => {
      body.querySelector('[data-history-results]').innerHTML = `
        <p>Primera clase registrada: <strong>${escapeHTML(report.firstRecorded || 'Sin registros')}</strong> · ${report.entries.length} clases registradas · ${report.students.length} alumnos únicos con registros.</p>
        <p class="text-muted small">El historial refleja registros disponibles. No acredita la fecha real de inicio, incorporaciones ni retiros. Un mes sin registros no equivale a ausencias.</p>
        <div class="table-responsive"><table class="table table-sm"><caption>Evolución mensual del rango seleccionado</caption>
        <thead><tr><th>Mes</th><th>Clases</th><th>Asistencia</th><th>Justificadas</th><th>Ausencias</th><th>Contenido registrado</th></tr></thead>
        <tbody>${report.months.map(({ key, data: d }) => `<tr><td>${key}</td><td>${d?.sessions ?? 'Sin registros'}</td><td>${d?.attendanceRatePct == null ? 'Sin datos' : d.attendanceRatePct + '%'}</td><td>${d?.justified ?? '—'}</td><td>${d?.absent ?? '—'}</td><td>${d ? d.content.sessionsWithContent + '/' + d.sessions : '—'}</td></tr>`).join('')}</tbody></table></div>
        ${report.mode === 'ai' ? `<h3 class="h6">Análisis mensual generado por IA</h3><p class="small text-muted">Ayuda de lectura basada en las observaciones; verificar con los registros originales.</p>${report.months.map(m => `<section class="border rounded p-2 mb-2"><h4 class="h6">${m.key}</h4><p>${escapeHTML(m.narrative || (m.data?.content.sessionsWithContent ? 'Resumen por IA no disponible' : 'Sin contenido registrado para analizar'))}</p></section>`).join('')}` : ''}
        <h3 class="h6">Alumnos de la clase y seguimiento individual</h3>
        <p class="small text-muted">Nómina actual y alumnos con registros en el rango. Los contenidos son grupales salvo observación individual explícita. Ausencia no demuestra deuda ni falta de dominio.</p>
        ${report.detailsIncomplete ? '<p role="status">No se pudieron cargar algunas observaciones individuales. El informe está incompleto en ese apartado.</p>' : ''}
        ${(report.studentHistories || []).map(student => `<details class="border rounded p-2 mb-2"><summary>${escapeHTML(student.name)} · ${student.current ? 'Nómina actual' : 'Con registros históricos'}</summary>${student.records.length ? student.records.map(r => `<article class="border-top mt-2 pt-2"><strong>${escapeHTML(r.date)} · ${escapeHTML(r.state || 'Sin estado')}</strong><p>${escapeHTML(r.participation)}</p><p style="white-space:pre-wrap">Contenido grupal: ${escapeHTML(r.content || 'Sin contenido registrado')}</p><p style="white-space:pre-wrap">Observaciones individuales del maestro: ${escapeHTML(r.notes.join('\n') || 'Sin observación individual registrada')}</p><small>Registro: ${escapeHTML(r.sessionId || 'Sin identificador')}</small></article>`).join('') : '<p>Sin evidencia individual en el rango seleccionado.</p>'}</details>`).join('')}
        <h3 class="h6">Contenido en bruto y evidencia de asistencia</h3>
        ${report.entries.length ? report.entries.map(e => `<details class="border rounded p-2 mb-2"><summary>${escapeHTML(e.date)} · ${escapeHTML(e.teacher)}</summary><p class="mt-2" style="white-space:pre-wrap">${escapeHTML(e.content || 'Sin contenido registrado')}</p><ul>${e.attendance.map(a => `<li>${escapeHTML(a.alumno_nombre || a.alumnoNombre || a.alumno_id || 'Alumno')}: ${escapeHTML(a.estado || 'Sin estado')}</li>`).join('')}</ul><small>Registro: ${escapeHTML(e.id || 'Sin identificador')}</small></details>`).join('') : '<p>Sin registros en el rango seleccionado.</p>'}`
    }
    AppModal.open({ title: `Informe de clase · ${classInfo.nombre || 'Clase'}`, size: 'xl', hideSave: true, cancelText: 'Cerrar',
      body: `<p><strong>Maestro actual:</strong> ${escapeHTML(classInfo.maestro_nombre || classInfo.maestroNombre || 'Sin asignar')}</p>
      <div class="d-flex flex-wrap gap-2 align-items-end mb-3">
      <label>Período académico<select class="form-select" data-history-period><option value="">Todo el historial disponible</option>${(periods || []).map(p => `<option value="${escapeHTML(p.id)}">${escapeHTML(p.nombre)}</option>`).join('')}</select></label>
      <label>Desde<input type="date" class="form-control" value="${initialRange.from}" data-history-from></label><label>Hasta<input type="date" class="form-control" value="${initialRange.to}" data-history-to></label>
      <label>Contenido<select class="form-select" data-history-mode><option value="raw">Contenido en bruto</option><option value="ai">Análisis por IA y evidencia</option></select></label>
      <button class="btn btn-primary" data-history-filter>Visualizar informe</button><button class="btn btn-outline-primary" data-history-export>Descargar PDF de esta vista</button></div><p class="small text-muted">Los filtros se aplican al pulsar Visualizar informe. El PDF reproduce el último informe visualizado.</p><p data-history-status role="status" aria-live="polite">Informe inicial: últimos tres meses (${initialRange.from} a ${initialRange.to}). Puedes cambiar las fechas.</p><div data-history-results tabindex="-1"></div>`,
      onShow: body => {
        draw(body)
        body.querySelector('[data-history-export]').onclick = () => downloadClassHistoryPdf(report, classInfo)
        body.querySelector('[data-history-filter]').onclick = async () => {
          const period = (periods || []).find(p => p.id === body.querySelector('[data-history-period]').value)
          let from = body.querySelector('[data-history-from]').value
          let to = body.querySelector('[data-history-to]').value
          if (period?.fecha_inicio && (!from || from < period.fecha_inicio)) from = period.fecha_inicio
          if (period?.fecha_fin && (!to || to > period.fecha_fin)) to = period.fecha_fin
          if (from && to && from > to) return AppToast.error('El rango no coincide con el período o la fecha inicial es posterior a la final.')
          const next = buildClassHistory(timeline, classInfo.id, { from, to })
          next.mode = body.querySelector('[data-history-mode]').value
          next.periodName = period?.nombre || 'Todo el historial disponible'
          const request = ++generation
          const button = body.querySelector('[data-history-filter]')
          button.disabled = true
          button.textContent = next.mode === 'ai' ? 'Generando análisis…' : 'Actualizando…'
          const status = body.querySelector('[data-history-status]')
          status.textContent = next.mode === 'ai' ? 'Generando resumen por IA. Puede tardar unos segundos…' : 'Aplicando filtros…'
          body.querySelector('[data-history-export]').disabled = true
          try {
            if (next.mode === 'ai') {
              if (config.isDemoMode) AppToast.info('En modo Demo se muestra la evidencia sin consultar IA.')
              else {
                for (const month of next.months) {
                  if (!month.data?.content.sessionsWithContent) continue
                  const result = await generateClassNarratives([month.data], { monthLabel: month.key })
                  month.narrative = result.narratives[0]
                }
              }
            }
            if (request !== generation || !body.isConnected) return
            report = enrich(next)
            draw(body)
            status.textContent = `Informe actualizado · ${next.periodName} · ${from || 'Primer registro'} a ${to || 'Último registro'} · ${next.entries.length} clases · ${next.mode === 'ai' ? 'Análisis por IA y evidencia' : 'Contenido en bruto'}.`
            const results = body.querySelector('[data-history-results]')
            results.focus({ preventScroll: true })
            results.scrollIntoView?.({ behavior: 'smooth', block: 'start' })
          } catch { AppToast.error('No se pudo generar el análisis. El historial anterior sigue disponible.') }
          finally { button.disabled = false; button.textContent = 'Visualizar informe'; body.querySelector('[data-history-export]').disabled = false }
        }
      },
    })
    toast.success('Historial de clase cargado.')
  } catch { toast.error('No se pudo cargar el historial de la clase. Intenta nuevamente.') }
}

import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { obtenerAlumno } from '../api/alumnosApi.js'
import { cargarHistorialIndividual } from '../api/historialIndividual.js'
import { summarizeStudentHistory, historyGradeLabel } from '../../../portal-maestros/domain/studentClassHistory.js'
import { createAiService } from '../../../portal-maestros/services/aiService.js'
import { escapeHTML } from '../utils/alumnosUtils.js'
import { router } from '../../../core/router/router.js'

const statusLabels = { P: 'Presente', T: 'Tardanza', A: 'Ausente', J: 'Justificada' }
function nota(n) {
  return [n.topic, n.text, n.state, historyGradeLabel(n.grade, n.scale), n.task].filter(Boolean).join(' · ')
}

export function filasHistorial({ entries, individual }) {
  return entries.map(e => [
    e.date, e.className, statusLabels[e.status],
    e.participated || e.recovery ? [e.content || 'Contenido sin registrar', e.recovery && `Recuperado el ${e.recovery.date}`].filter(Boolean).join('\n') : 'Sin participación registrada',
    [e.attendanceNote, ...e.notes.map(nota), e.rating != null && `Valoración: ${e.rating}/5`].filter(Boolean).join('\n'),
  ]).concat(individual.map(o => [o.date || '—', 'Registro individual', '—', '', o.text]))
    .sort((a, b) => b[0].localeCompare(a[0]))
}

function resumen(entries) {
  const s = summarizeStudentHistory(entries)
  return s.total ? `Asistencia: ${s.percent}% (${s.participated} de ${s.total} sesiones registradas). Presentes: ${s.P}. Tardanzas: ${s.T}. Ausencias: ${s.A}. Justificadas: ${s.J}.` : 'Sin sesiones con asistencia registrada.'
}

export async function renderHistorialPdfAlumno(container, { id }) {
  container.innerHTML = '<p class="p-4" role="status">Reuniendo el historial académico…</p>'
  try {
    const [student, history] = await Promise.all([obtenerAlumno(id), cargarHistorialIndividual(id)])
    const name = student.nombre_completo || student.nombre
    const summary = resumen(history.entries)
    const rows = filasHistorial(history)
    const head = ['Fecha', 'Clase', 'Asistencia', 'Contenido recibido', 'Progreso y observaciones']
    container.innerHTML = `<section class="container py-3">
      <button class="btn btn-link" data-back>Volver al directorio</button>
      <h1 class="h4">Historial académico · ${escapeHTML(name)}</h1><p>${escapeHTML(summary)}</p>
      <details class="mb-3"><summary>Ver registros (${rows.length})</summary><div class="table-responsive">
      <table class="table table-sm"><thead><tr>${head.map(x => `<th>${x}</th>`).join('')}</tr></thead>
      <tbody>${rows.map(row => `<tr>${row.map(x => `<td>${escapeHTML(x)}</td>`).join('')}</tr>`).join('')}</tbody></table></div></details>
      <button data-ai class="btn btn-outline-primary" ${rows.length ? '' : 'disabled'}>Analizar registros con IA</button>
      <label class="form-label mt-3 d-block">Síntesis para el PDF · revisa o edita antes de descargar
        <textarea class="form-control mt-2" rows="5"></textarea></label>
      <p role="status" aria-live="polite"></p><button data-download class="btn btn-primary">Descargar historial en PDF</button></section>`
    const ai = container.querySelector('[data-ai]')
    const draft = container.querySelector('textarea')
    const feedback = container.querySelector('[role="status"]')
    const download = container.querySelector('[data-download]')
    container.querySelector('[data-back]').onclick = () => router.navigate('alumnos')
    ai.onclick = async () => {
      ai.disabled = download.disabled = draft.readOnly = true
      feedback.textContent = 'Analizando asistencia, contenidos y progreso…'
      try {
        const service = await createAiService()
        const evidence = rows.map(row => row.join(' | '))
        draft.value = await service.sintetizarHistorial(summary, evidence)
        feedback.textContent = 'Revisa la síntesis y compárala con los registros antes de descargar.'
      } catch {
        feedback.textContent = 'No se pudo completar el análisis. Puedes reintentar o redactar la síntesis y descargar los registros.'
      } finally { ai.disabled = download.disabled = draft.readOnly = false }
    }
    download.onclick = () => {
      const doc = new jsPDF()
      doc.setFontSize(15)
      doc.text('El Sistema Punta Cana · Historial académico', 14, 18)
      autoTable(doc, { startY: 24, body: [[name], [summary], ...(draft.value.trim() ? [[draft.value.trim()]] : [])], theme: 'plain' })
      autoTable(doc, { startY: doc.lastAutoTable.finalY + 5, head: [head], body: rows, styles: { fontSize: 8 } })
      doc.save(`historial-${name}.pdf`)
    }
  } catch (error) {
    container.innerHTML = `<p class="alert alert-danger">No se pudo cargar el historial. ${escapeHTML(error.message)}</p><button class="btn btn-outline-primary">Reintentar</button>`
    container.querySelector('button').onclick = () => renderHistorialPdfAlumno(container, { id })
  }
}

import { escHTML as esc } from '../utils/portalUtils.js'
import { historyGradeLabel, summarizeStudentHistory } from '../domain/studentClassHistory.js'
import { observationSignatureLabel } from '../services/observationSignature.js'
import './studentClassHistory.css'

const LABELS = { P: 'Presente', T: 'Tardanza', A: 'No asistió', J: 'Justificado — no asistió' }
const dateLabel = date => new Date(`${date.slice(0, 10)}T12:00:00`).toLocaleDateString('es-DO', { day: '2-digit', month: 'short', year: 'numeric' })

/** A single student's evidence. Filtering never changes the stored attendance or assessments. */
export function mountStudentClassHistory(root, { entries: initialEntries, studentId, maestro, adapter, from = null }) {
  let entries = initialEntries
  let visible = 25
  const filters = { classId: '', status: '', from: '', to: '' }
  let message = ''
  let busy = false
  const filtered = () => entries.filter(e => (!filters.classId || e.classId === filters.classId)
    && (!filters.status || e.status === filters.status) && (!filters.from || e.date >= filters.from) && (!filters.to || e.date <= filters.to))

  function render() {
    const selected = filtered()
    const summary = summarizeStudentHistory(selected)
    const classes = [...new Map(entries.map(e => [e.classId, e.className])).entries()]
    root.innerHTML = `<div class="pm-history">
      <h3 class="pm-zen-section-title">📖 Historial de Clases</h3>
      <p>Contenido de la clase y seguimiento individual. Presente y tardanza cuentan como participación.</p>
      <div class="pm-history-filters">
        <label>Clase<select data-filter="classId"><option value="">Todas las clases</option>${classes.map(([id, name]) => `<option value="${esc(id)}" ${filters.classId === id ? 'selected' : ''}>${esc(name)}</option>`).join('')}</select></label>
        <label>Asistencia<select data-filter="status"><option value="">Todos los estados</option>${Object.entries(LABELS).map(([id, name]) => `<option value="${id}" ${filters.status === id ? 'selected' : ''}>${name}</option>`).join('')}</select></label>
        <label>Desde<input type="date" data-filter="from" value="${esc(filters.from)}" ${from ? `min="${esc(from)}"` : ''}></label>
        <label>Hasta<input type="date" data-filter="to" value="${esc(filters.to)}"></label>
      </div>
      <p class="pm-history-summary" aria-live="polite">${summary.total} sesiones · ${summary.P} presentes · ${summary.T} tardanzas · ${summary.A} ausencias · ${summary.J} justificadas${summary.percent == null ? '' : ` · ${summary.percent}% de participación`}</p>
      <p role="status">${esc(message)}</p>
      ${filters.from && filters.to && filters.from > filters.to ? '<p role="alert">La fecha inicial debe ser anterior a la final.</p>' : ''}
      <div class="pm-zen-bitacora">${selected.slice(0, visible).map(entry => {
        const candidates = entries.filter(e => e.participated && e.classId === entry.classId && e.date > entry.date)
        return `<article class="pm-zen-bitacora-item pm-glass pm-history-card" data-session="${esc(entry.id)}">
          <div class="pm-zen-bitacora-header"><strong>${esc(entry.className)}</strong><time datetime="${esc(entry.date)}">${dateLabel(entry.date)}</time></div>
          <p><span class="pm-history-state">${LABELS[entry.status]}</span>${entry.instrument ? ` · ${esc(entry.instrument)}` : ''}</p>
          <h4>${entry.participated ? 'Contenido trabajado' : 'Contenido impartido al grupo'}</h4>
          <p class="pm-zen-bitacora-contenido">${esc(entry.content || 'Contenido no registrado')}</p>
          ${entry.warning ? `<p role="note">${esc(entry.warning)}</p>` : ''}
          ${entry.attendanceNote ? `<p>Asistencia: ${esc(entry.attendanceNote)}</p>` : ''}
          ${entry.rating != null ? `<p>Valoración de asistencia: ${esc(historyGradeLabel(entry.rating, 5))}</p>` : ''}
          ${entry.participated ? `<h4>Seguimiento individual</h4>${entry.notes.length ? entry.notes.map(note => `<div class="pm-history-note">
            ${note.topic ? `<strong>${esc(note.topic)}</strong>` : ''}
            ${note.grade != null ? `<p>Calificación: ${esc(historyGradeLabel(note.grade, note.scale))}</p>` : ''}
            ${note.text ? `<p>${esc(note.text)}</p>` : ''}${note.task ? `<p><strong>Tarea:</strong> ${esc(note.task)}</p>` : ''}
            <small>${esc(observationSignatureLabel(note.author))}</small>
            <details><summary>Origen del registro</summary>${note.sources.map(s => `<p>${esc(s.table)} · ${esc(s.id || 'identificador no disponible')}</p>`).join('')}</details>
          </div>`).join('') : '<p>Sin evaluación individual registrada para esta sesión.</p>'}` : `<p>El alumno no recibió esta clase; el contenido no cuenta como aprendizaje evaluado.</p>
            ${entry.recovery ? `<p>Recuperó este contenido el ${dateLabel(entry.recovery.date)}. Confirmación: ${esc(observationSignatureLabel(entry.recovery.author))}</p>` : `<p>Pendiente de recuperar.</p>${candidates.length ? `<details><summary>Confirmar recuperación</summary><p>Confirma únicamente si verificaste que el alumno recuperó el contenido en la sesión seleccionada.</p>
              <label>Clase posterior asistida<select data-recovery-for="${esc(entry.id)}">${candidates.map(c => `<option value="${esc(c.id)}">${dateLabel(c.date)} · ${esc(c.content || 'Sin contenido registrado')}</option>`).join('')}</select></label>
              <button type="button" class="pm-btn pm-btn-secondary" data-confirm="${esc(entry.id)}" ${busy ? 'disabled' : ''}>Confirmar recuperación verificada</button></details>` : '<p>No hay una sesión posterior asistida en el rango consultado. Amplía el rango superior para buscar otras fechas.</p>'}`}`}
          <details><summary>Evidencia de la clase</summary><p>${esc(entry.source.table)} · ${esc(entry.id)}</p></details>
        </article>`
      }).join('') || '<p class="pm-empty">No hay sesiones registradas para estos filtros.</p>'}</div>
      ${selected.length > visible ? '<button type="button" class="pm-btn pm-btn-secondary" data-more>Mostrar 25 más</button>' : ''}
      <p>Mostrando ${Math.min(selected.length, visible)} de ${selected.length} sesiones del rango consultado. Los totales incluyen todo el resultado.</p>
    </div>`
    root.querySelectorAll('[data-filter]').forEach(input => input.addEventListener('change', () => {
      filters[input.dataset.filter] = input.value; visible = 25; render()
    }))
    root.querySelector('[data-more]')?.addEventListener('click', () => { visible += 25; render() })
    root.querySelectorAll('[data-confirm]').forEach(button => button.addEventListener('click', async () => {
      const originalId = button.dataset.confirm
      const recoveryId = [...root.querySelectorAll('[data-recovery-for]')].find(s => s.dataset.recoveryFor === originalId)?.value
      busy = true; button.disabled = true
      try {
        await adapter.confirmRecovery({ studentId, maestro, originalId, recoveryId })
        message = 'Recuperación confirmada. La asistencia original se conserva.'
        const result = await adapter.load(studentId, maestro.id, { from })
        entries = result.entries
      } catch (error) { message = `No se pudo completar la confirmación: ${error.message}. Puedes reintentar.` }
      finally { busy = false; render() }
    }))
  }
  render()
}

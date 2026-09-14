import '../styles/sectional.css'
import { aggregateSectionalPreparation } from '../../modules/repertoire/domain/sectionalAggregation.js'
import { createSectionalDemoAdapter } from '../../modules/repertoire/demo/sectionalDemoAdapter.js'

const labels = { SIN_EVALUAR: 'Sin evaluar', SIN_ESTUDIAR: 'Sin estudiar', CON_DIFICULTAD: 'Con dificultad', DOMINADO: 'Dominado', CONSOLIDADO: 'Consolidado' }
const colors = { SIN_EVALUAR: '#adb5bd', SIN_ESTUDIAR: '#dc3545', CON_DIFICULTAD: '#fd7e14', DOMINADO: '#ffc107', CONSOLIDADO: '#198754' }

export async function renderSeccionalView(container, { adapter = createSectionalDemoAdapter() } = {}) {
  const evidence = await adapter.listEvidence()
  const authorizedSections = [...new Set(evidence.map((row) => row.sectionId))].filter((id) => adapter.authorizedSectionIds.includes(id))
  let sectionId = authorizedSections[0]
  let activeFila = null
  let filter = 'all'
  const render = () => {
    const scoped = evidence.filter((row) => row.sectionId === sectionId && (!activeFila || row.filaId === activeFila))
    const rows = aggregateSectionalPreparation({ evidence: scoped, authorizationScope: { sectionIds: adapter.authorizedSectionIds } })
    const cells = rows.map((row) => { const segments = Object.entries(row.distribution.percentages).filter(([, percentage]) => percentage); let cursor = 0; const gradient = segments.map(([state, percentage]) => { const end = cursor + percentage; const part = `${colors[state]} ${cursor}% ${end}%`; cursor = end; return part }).join(', '); const summary = Object.entries(row.distribution.counts).filter(([, count]) => count).map(([state, count]) => `${count} ${labels[state].toLowerCase()}`).join(', '); const hidden = filter === 'critical' ? row.criticalFilaCount === 0 && row.criticalStudentExceptions === 0 : filter === 'exception' ? row.criticalStudentExceptions === 0 : filter !== 'all' && !row.distribution.counts[filter]; return `<button class="sectional-cell ${hidden ? 'hidden' : ''}" style="--sectional-gradient: linear-gradient(90deg, ${gradient})" data-measure-id="${row.measureId}" aria-label="Compás ${row.measureId} — ${summary}${row.criticalFilaCount ? `, ${row.criticalFilaCount} fila sin estudiar` : ''}${row.criticalStudentExceptions ? `, ${row.criticalStudentExceptions} alumno crítico` : ''}"></button>` }).join('')
    const first = rows[0]
    const alerts = first ? `${first.criticalFilaCount ? `<span class="sectional-alert">⚠ ${first.criticalFilaCount} fila Sin estudiar</span>` : ''}${first.criticalStudentExceptions ? `<span class="sectional-alert">⚠ ${first.criticalStudentExceptions} alumno crítico</span>` : ''}` : ''
    const filas = [...new Map(scoped.map((row) => [row.filaId, row.filaName])).entries()]
    container.innerHTML = `<section class="sectional-view"><header><span class="repertoire-eyebrow">ANÁLISIS DERIVADO</span><h1>Seccional · ${sectionId}</h1><label>Sección <select class="sectional-section-select">${authorizedSections.map((id) => `<option ${id === sectionId ? 'selected' : ''}>${id}</option>`).join('')}</select></label><nav class="sectional-tabs" aria-label="Filas de la sección"><button type="button" class="btn btn-sm ${!activeFila ? 'btn-primary' : 'btn-outline-secondary'} sectional-tab" data-fila="">GENERAL</button>${filas.map(([id, name]) => `<button type="button" class="btn btn-sm ${id === activeFila ? 'btn-primary' : 'btn-outline-secondary'} sectional-tab" data-fila="${id}">${name}</button>`).join('')}</nav><label class="sectional-filter">Filtrar <select class="sectional-filter-select"><option value="all">Todos</option><option value="critical">Filas críticas</option><option value="exception">Excepciones individuales</option>${Object.entries(labels).map(([key, value]) => `<option value="${key}">${value}</option>`).join('')}</select></label></header><div class="sectional-alerts">${alerts}</div><div class="sectional-grid" role="grid">${cells}</div><p class="sectional-legend">Cada fila aporta el mismo peso musical. Los descansos se excluyen del denominador.</p><div class="sectional-detail" role="status" aria-live="polite">Selecciona un compás para ver el detalle de filas.</div></section>`
    container.querySelector('.sectional-section-select').addEventListener('change', (event) => { sectionId = event.target.value; activeFila = null; render() })
    container.querySelector('.sectional-filter-select').value = filter
    container.querySelector('.sectional-filter-select').addEventListener('change', (event) => { filter = event.target.value; render() })
    container.querySelectorAll('.sectional-tab').forEach((tab) => tab.addEventListener('click', () => { activeFila = tab.dataset.fila || null; render() }))
    container.querySelectorAll('.sectional-cell').forEach((cell) => cell.addEventListener('click', () => { const row = rows.find((item) => item.measureId === cell.dataset.measureId); container.querySelector('.sectional-detail').innerHTML = `<strong>Compás ${row.measureId}</strong><br>${row.filas.map((fila) => `${fila.nombre}: ${fila.applicability === 'TOCA' ? labels[fila.states[0]?.state] : fila.applicability} · ${fila.source === 'EXPLICIT_COLLECTIVE' ? 'Evaluación colectiva' : fila.source === 'DERIVED_FROM_STUDENTS' ? 'Derivado de alumnos' : 'Sin evaluar'}${adapter.editableFilaIds.includes(fila.filaId) ? ' · Editable' : ' · Solo lectura'}${fila.individualCount ? ` · ${fila.individualCount} alumnos` : ''}`).join('<br>')}${activeFila && adapter.editableFilaIds.includes(activeFila) ? `<br><button type="button" class="btn btn-sm btn-link sectional-open-fila">Abrir fila</button>` : ''}`; container.querySelector('.sectional-open-fila')?.addEventListener('click', () => { window.location.hash = `#/repertorio?fila=${activeFila}&compas=${row.measureId}` }) }))
  }
  render()
  return { mode: 'demo', sectionId, rowCount: evidence.length }
}

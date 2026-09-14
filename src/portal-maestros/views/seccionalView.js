import '../styles/sectional.css'
import { aggregateSectionalPreparation } from '../../modules/repertoire/domain/sectionalAggregation.js'
import { createSectionalDemoAdapter } from '../../modules/repertoire/demo/sectionalDemoAdapter.js'

const labels = { SIN_EVALUAR: 'Sin evaluar', SIN_ESTUDIAR: 'Sin estudiar', CON_DIFICULTAD: 'Con dificultad', DOMINADO: 'Dominado', CONSOLIDADO: 'Consolidado' }
const colors = { SIN_EVALUAR: '#adb5bd', SIN_ESTUDIAR: '#dc3545', CON_DIFICULTAD: '#fd7e14', DOMINADO: '#ffc107', CONSOLIDADO: '#198754' }

export async function renderSeccionalView(container, { adapter = createSectionalDemoAdapter() } = {}) {
  const evidence = await adapter.listEvidence()
  const sections = [...new Set(evidence.map((row) => row.sectionId).filter((id) => adapter.authorizedSectionIds.includes(id)))]
  const sectionId = sections[0]
  const rows = aggregateSectionalPreparation({ evidence: evidence.filter((row) => row.sectionId === sectionId), authorizationScope: { sectionIds: adapter.authorizedSectionIds } })
  const cells = rows.map((row) => { const segments = Object.entries(row.distribution.percentages).filter(([, percentage]) => percentage); let cursor = 0; const gradient = segments.map(([state, percentage]) => { const end = cursor + percentage; const part = `${colors[state]} ${cursor}% ${end}%`; cursor = end; return part }).join(', '); const summary = Object.entries(row.distribution.counts).filter(([, count]) => count).map(([state, count]) => `${count} ${labels[state].toLowerCase()}`).join(', '); return `<button class="sectional-cell" style="--sectional-gradient: linear-gradient(90deg, ${gradient})" data-measure-id="${row.measureId}" aria-label="Compás ${row.measureId} — ${summary}"></button>` }).join('')
  container.innerHTML = `<section class="sectional-view"><header><span class="repertoire-eyebrow">ANÁLISIS DERIVADO</span><h1>Seccional · ${sectionId}</h1><nav class="sectional-tabs" aria-label="Filas de la sección">${['GENERAL', ...new Set(evidence.map((row) => row.filaName))].map((tab) => `<button type="button" class="btn btn-sm btn-outline-secondary">${tab}</button>`).join('')}</nav></header><div class="sectional-grid" role="grid">${cells}</div><p class="sectional-legend">Cada fila aporta el mismo peso musical. Los descansos se excluyen del denominador.</p><div class="sectional-detail" role="status" aria-live="polite">Selecciona un compás para ver el detalle de filas.</div></section>`
  container.querySelectorAll('.sectional-cell').forEach((cell) => cell.addEventListener('click', () => { const row = rows.find((item) => item.measureId === cell.dataset.measureId); container.querySelector('.sectional-detail').textContent = `Compás ${row.measureId}: ${row.filas.map((fila) => `${fila.nombre}: ${fila.applicability === 'TOCA' ? labels[fila.states[0]] : fila.applicability}`).join(' · ')}` }))
  return { mode: 'demo', sectionId, rowCount: rows.length }
}

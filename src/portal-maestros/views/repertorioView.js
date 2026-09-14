import '../styles/repertoire.css'
import { getMaestroLocal } from '../../portal-maestros/auth/maestroAuth.js'
import { daysRemaining, ESTADOS_PREPARACION } from '../../modules/repertoire/domain/repertoireFoundation.js'
import { createRepertoireDemoAdapter } from '../../modules/repertoire/demo/repertoireDemoAdapter.js'

const STATE_LABELS = { SIN_EVALUAR: 'Sin evaluar', SIN_ESTUDIAR: 'Sin estudiar', CON_DIFICULTAD: 'Con dificultad', DOMINADO: 'Dominado', CONSOLIDADO: 'Consolidado' }
const STATE_ICONS = { SIN_EVALUAR: '○', SIN_ESTUDIAR: '🔴', CON_DIFICULTAD: '🟠', DOMINADO: '🟡', CONSOLIDADO: '🟢' }

export function cyclePreparationState(state) {
  return ESTADOS_PREPARACION[(ESTADOS_PREPARACION.indexOf(state) + 1) % ESTADOS_PREPARACION.length]
}

export function measureAriaLabel(measure) {
  return `Compás ${measure.numero_visible} — ${STATE_LABELS[measure.estado_preparacion] || STATE_LABELS.SIN_EVALUAR}`
}

function cardMarkup(montaje) {
  const days = daysRemaining(montaje.evento?.fecha)
  const fila = montaje.filas?.[0]
  return `<article class="repertoire-card" data-montaje-id="${montaje.id}">
    <div class="repertoire-card__heading"><div><span class="repertoire-eyebrow">${montaje.estado.replaceAll('_', ' ')}</span><h2>${montaje.obra.titulo}</h2><p>${montaje.obra.compositor || ''} · ${montaje.version.nombre}</p></div><strong class="repertoire-priority">P${montaje.prioridad}</strong></div>
    <div class="repertoire-card__meta"><span><i class="bi bi-music-note-list"></i> ${fila?.nombre || 'Fila pendiente'}</span><span><i class="bi bi-calendar-event"></i> ${montaje.evento?.nombre || 'Sin evento'}</span><span><i class="bi bi-hourglass-split"></i> ${days == null ? 'Fecha pendiente' : days >= 0 ? `Faltan ${days} días` : `Venció hace ${Math.abs(days)} días`}</span></div>
    <button class="btn btn-primary repertoire-open" data-montaje-id="${montaje.id}">Abrir mapa <i class="bi bi-arrow-right"></i></button>
  </article>`
}

function mapMarkup(montaje, selected, selectionMode) {
  const selectionLabel = selectionMode ? (selected.size ? `${selected.size} compases seleccionados` : 'Selecciona compases') : 'Selección múltiple'
  return `<section class="repertoire-map" aria-label="Mapa de preparación de ${montaje.obra.titulo}">
    <div class="repertoire-map__header"><div><button class="btn btn-link repertoire-back">← Mis obras</button><h1>${montaje.obra.titulo}</h1><p>${montaje.filas[0]?.nombre} · ${montaje.evento?.nombre} · ${montaje.evento?.fecha}</p></div><span class="repertoire-mode-badge">DEMO · persistencia local</span></div>
    <div class="repertoire-map__toolbar"><button class="btn btn-outline-secondary repertoire-multi" aria-pressed="${selectionMode}">${selectionLabel}</button><select class="form-select repertoire-bulk" aria-label="Estado para selección múltiple" ${selected.size ? '' : 'disabled'}>${ESTADOS_PREPARACION.map((state) => `<option value="${state}">${STATE_LABELS[state]}</option>`).join('')}</select><button class="btn btn-primary repertoire-apply" ${selected.size ? '' : 'disabled'}>Aplicar estado</button></div>
    <div class="repertoire-grid" role="grid">${montaje.compases.map((measure) => `<button class="repertoire-measure state-${measure.estado_preparacion.toLowerCase()} ${measure.aplicabilidad !== 'TOCA' ? 'is-not-applicable' : ''} ${selected.has(measure.id) ? 'is-selected' : ''}" role="gridcell" data-measure-id="${measure.id}" aria-label="${measureAriaLabel(measure)}" title="Clic: ${measureAriaLabel(measure)} · Shift+clic: seleccionar">${STATE_ICONS[measure.estado_preparacion]}</button>`).join('')}</div>
    <p class="repertoire-legend">Los compases no aplicables se muestran en neutro y no cuentan para el porcentaje de preparación.</p>
  </section>`
}

export async function renderRepertoireView(container, { adapter = createRepertoireDemoAdapter() } = {}) {
  container.innerHTML = '<div class="repertoire-loading" role="status">Cargando repertorio…</div>'
  const montajes = await adapter.listMontajes()
  let active = null
  let selected = new Set()
  let selectionMode = false

  const render = () => {
    container.innerHTML = active ? mapMarkup(active, selected, selectionMode) : `<div class="repertoire-view"><div class="repertoire-view__intro"><span class="repertoire-eyebrow">ACM · PREPARACIÓN ORQUESTAL</span><h1>Mis obras</h1><p>Montajes asignados para preparar con tu fila.</p></div>${montajes.length ? montajes.map(cardMarkup).join('') : '<div class="repertoire-empty">No tienes montajes asignados todavía.</div>'}</div>`
    if (active) bindMap()
    else container.querySelectorAll('.repertoire-open').forEach((button) => button.addEventListener('click', () => { active = montajes.find((item) => item.id === button.dataset.montajeId); render() }))
  }

  const bindMap = () => {
    container.querySelector('.repertoire-back')?.addEventListener('click', () => { active = null; selected = new Set(); selectionMode = false; render() })
    container.querySelector('.repertoire-multi')?.addEventListener('click', () => { selectionMode = !selectionMode; if (!selectionMode) selected = new Set(); render() })
    container.querySelectorAll('.repertoire-measure').forEach((button) => button.addEventListener('click', async (event) => {
      const measure = active.compases.find((item) => item.id === button.dataset.measureId)
      if (event.shiftKey || selectionMode) { selected.has(measure.id) ? selected.delete(measure.id) : selected.add(measure.id); render(); return }
      const previous = measure.estado_preparacion
      measure.estado_preparacion = cyclePreparationState(previous)
      render()
      try { await adapter.updateMeasureState(measure.id, measure.estado_preparacion) } catch (error) { measure.estado_preparacion = previous; render(); throw error }
    }))
    container.querySelector('.repertoire-apply')?.addEventListener('click', async () => {
      const state = container.querySelector('.repertoire-bulk').value
      const previous = new Map([...selected].map((id) => [id, active.compases.find((item) => item.id === id).estado_preparacion]))
      for (const id of selected) active.compases.find((item) => item.id === id).estado_preparacion = state
      selected = new Set(); selectionMode = false; render()
      try { await Promise.all([...previous.keys()].map((id) => adapter.updateMeasureState(id, state))) } catch (error) { previous.forEach((value, id) => { active.compases.find((item) => item.id === id).estado_preparacion = value }); render(); throw error }
    })
  }

  render()
  return { mode: 'demo', maestroId: getMaestroLocal()?.id || null }
}

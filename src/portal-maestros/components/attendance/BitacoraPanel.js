import { escHTML } from '../../utils/portalUtils.js'
import { lessonName } from '../../utils/lessonReview.js'
import { parseBitacora } from '../../../shared/utils/bitacoraParser.js'

/** Panel de solo lectura: muestra lo que se registrará. Nunca escribe datos. */
const TYPE_LABELS = { contenido: 'Contenido', refuerzo: 'A reforzar', tarea: 'Tarea', desempeno: 'Desempeño' }
const STYLE_ID = 'pm-bitacora-panel-style'
const STYLE = `
  .pm-bitacora-panel { margin-top:1rem; padding:1rem; border:1px solid var(--pm-border); border-radius:12px; background:var(--pm-surface); color:var(--pm-text); }
  .pm-bitacora-panel[hidden] { display:none; }
  .pm-bitacora-panel h3 { font-size:1rem; margin:0 0 .3rem; }
  .pm-bp-coverage { font-size:.85rem; color:var(--pm-text-muted); margin:0 0 .4rem; }
  .pm-bp-group { margin-top:.6rem; }
  .pm-bp-group h4 { font-size:.9rem; margin:0 0 .3rem; color:var(--pm-primary,#6366f1); overflow-wrap:anywhere; }
  .pm-bp-group ul { list-style:none; margin:0; padding:0; }
  .pm-bp-group li { padding:.4rem .5rem; margin-bottom:.3rem; border-left:3px solid var(--pm-border); overflow-wrap:anywhere; }
  .pm-bp-type { display:inline-block; margin-right:.4rem; font-size:.75rem; font-weight:600; color:var(--pm-text-muted); }
  .pm-bp-unassigned li { color:var(--pm-text-muted); }
  .pm-bp-warn { font-size:.85rem; color:var(--pm-danger,#dc3545); margin:.4rem 0 0; }
`

function ensureStyle() {
  if (document.getElementById(STYLE_ID)) return
  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = STYLE
  document.head.appendChild(style)
}

function recipientLabel(registro, names) {
  if (registro.alcance === 'grupo') return 'Todos los presentes'
  return registro.alumnoIds.map(id => names.get(id) ?? '').join(' y ')
}

function renderGroups(result, names) {
  const groups = new Map()
  for (const registro of result.registros) {
    const label = recipientLabel(registro, names)
    if (!groups.has(label)) groups.set(label, [])
    groups.get(label).push(registro)
  }
  return [...groups].map(([label, items]) => `
    <section class="pm-bp-group">
      <h4>${escHTML(label)}</h4>
      <ul>${items.map(r => `<li><span class="pm-bp-type">${escHTML(TYPE_LABELS[r.tipo])}</span>${escHTML(r.texto)}</li>`).join('')}</ul>
    </section>`).join('')
}

function renderUnassigned(result) {
  if (!result.sinAsignar.length) return ''
  return `
    <section class="pm-bp-group pm-bp-unassigned">
      <h4>Sin asignar</h4>
      <ul>${result.sinAsignar.map(s => `<li>${escHTML(s.texto)}</li>`).join('')}</ul>
    </section>`
}

function renderWarnings(result) {
  return result.avisos.map(aviso => aviso.tipo === 'ausente'
    ? `<p class="pm-bp-warn">${escHTML(aviso.nombre)} no está presente</p>`
    : `<p class="pm-bp-warn">Nombre repetido en la lista: ${escHTML(aviso.nombre)}; usa el chip para elegir</p>`
  ).join('')
}

export function createBitacoraPanel(container, { getAlumnos, getEstado }) {
  ensureStyle()
  const element = document.createElement('section')
  element.className = 'pm-bitacora-panel'
  element.setAttribute('aria-label', 'Lo que se registrará')
  element.hidden = true
  element.innerHTML = `
    <h3>Lo que se registrará</h3>
    <p class="pm-bp-coverage" role="status" aria-live="polite"></p>
    <div class="pm-bp-body"></div>`
  const coverage = element.querySelector('.pm-bp-coverage')
  const body = element.querySelector('.pm-bp-body')
  container.appendChild(element)
  let destroyed = false

  function update(text) {
    if (destroyed) return
    const value = String(text ?? '')
    if (!value.trim()) {
      element.hidden = true
      coverage.textContent = ''
      body.innerHTML = ''
      return
    }
    const roster = getAlumnos() || []
    const result = parseBitacora(value, { roster, attendance: getEstado() || {} })
    const names = new Map(roster.map(a => [a.id, lessonName(a)]))
    element.hidden = false
    coverage.textContent = `${result.cobertura.conRegistro}/${result.cobertura.presentes} presentes con registro`
    body.innerHTML = renderGroups(result, names) + renderUnassigned(result) + renderWarnings(result)
  }

  function destroy() {
    if (destroyed) return
    destroyed = true
    element.remove()
  }

  return { update, destroy }
}

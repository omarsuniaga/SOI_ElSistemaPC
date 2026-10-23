import { getInitiationAdapter } from './api.js'
import { DEFAULT_RUBRIC, STATUS_LABELS, escapeText as esc, evaluateScores } from './domain.js'
import './view.css'

export async function mountInitiation(container, adapter = getInitiationAdapter()) {
  const controller = new AbortController()
  const { signal } = controller
  let context, campaigns = [], selectedCampaign, selectedCandidate, sourceStudents = [], payload, destroyed = false
  const on = (selector, type, handler) => container.querySelector(selector)?.addEventListener(type, handler, { signal })
  const options = (rows, selected = '') => rows.map(r => `<option value="${esc(r.id)}" ${r.id === selected ? 'selected' : ''}>${esc(r.nombre)}</option>`).join('')
  const alert = message => { const root = container.querySelector('#ia-message'); if (root) { root.setAttribute('role', 'alert'); root.textContent = message } }
  async function run(button, action) {
    button.disabled = true
    try { await action() } catch (error) { alert(error.message) } finally { if (button.isConnected) button.disabled = false }
  }
  function shell() {
    container.innerHTML = `<main class="ia"><header><div><h1>Audiciones de Iniciación</h1><p class="ia-muted">Evaluar, acompañar y decidir cada avance.</p></div><a href="/index.html">Volver al SOI</a></header>
      <div id="ia-message" aria-live="polite" role="status"></div>
      ${context.user.canManage ? `<details class="ia-panel"><summary>Nueva convocatoria</summary><form id="ia-create">
        <label>Nombre<input name="nombre" required minlength="3" maxlength="160"></label>
        <label>Clase de Iniciación<select name="clase_origen_id" required><option value="">Seleccionar</option>${options(context.clases.filter(c => c.es_clase_iniciacion))}</select></label>
        <div class="ia-row"><label>Ingreso de cohorte desde<input name="cohorte_desde" type="date" required></label><label>Ingreso de cohorte hasta<input name="cohorte_hasta" type="date" required></label></div>
        <label>Fecha de audición<input name="fecha_audicion" type="date" required></label>
        <label>Jurados (selección múltiple)<select name="jurados" multiple required>${context.jurados.map(j => `<option value="${esc(j.id)}" ${j.id === context.user.id ? 'selected' : ''}>${esc(j.nombre)}</option>`).join('')}</select></label>
        <label>Mínimo de valoraciones completas<input name="min_jurados" type="number" min="1" value="1" required></label>
        <p class="ia-muted">Rúbrica inicial de seis criterios, escala 1–4. Se conserva con esta convocatoria.</p><button>Crear convocatoria</button></form></details>` : ''}
      <label>Convocatoria<select id="ia-campaign"><option value="">Seleccionar convocatoria</option>${options(campaigns, selectedCampaign?.id)}</select></label>
      <div class="ia-grid"><aside id="ia-candidates"></aside><section id="ia-detail"><p>Seleccione una convocatoria para comenzar.</p></section></div></main>`
    on('#ia-create', 'submit', event => {
      event.preventDefault(); const f = event.currentTarget
      run(f.querySelector('button'), async () => {
        const data = Object.fromEntries(new FormData(f)); data.jurados = [...f.elements.jurados.selectedOptions].map(o => o.value); data.min_jurados = Number(data.min_jurados); data.rubrica = structuredClone(DEFAULT_RUBRIC)
        selectedCampaign = await adapter.createCampaign(data)
        campaigns = await adapter.listCampaigns(); shell(); await loadCampaign(selectedCampaign.id)
      })
    })
    on('#ia-campaign', 'change', e => run(e.currentTarget, () => loadCampaign(e.target.value)))
  }
  async function loadCampaign(id) {
    selectedCampaign = campaigns.find(c => c.id === id)
    if (!selectedCampaign) { container.querySelector('#ia-candidates').innerHTML = ''; container.querySelector('#ia-detail').innerHTML = '<p>Seleccione una convocatoria.</p>'; return }
    const campaignId = selectedCampaign.id
    container.querySelector('#ia-campaign').value = campaignId
    const nextPayload = await adapter.getCampaign(campaignId)
    const students = context.user.canManage ? await adapter.listSourceStudents(selectedCampaign.clase_origen_id) : []
    if (destroyed || selectedCampaign?.id !== campaignId) return
    payload = nextPayload; sourceStudents = students
    selectedCandidate = payload.candidates.find(a => a.id === selectedCandidate?.id) || payload.candidates[0]
    renderCandidates(); renderDetail()
  }
  function renderCandidates() {
    container.querySelector('#ia-candidates').innerHTML = `<div class="ia-panel"><h2>Candidatos (${payload.candidates.length})</h2>
      ${payload.candidates.map(a => `<button class="ia-candidate" data-candidate="${esc(a.id)}" aria-pressed="${a.id === selectedCandidate?.id}">${esc(a.alumno_nombre)}<br><span class="ia-badge">${esc(STATUS_LABELS[a.estado])}</span></button>`).join('') || '<p>No hay candidatos incorporados.</p>'}
      ${context.user.canManage ? `<form id="ia-add"><label>Alumno de la clase de origen<select name="alumno_id" required><option value="">Seleccionar</option>${sourceStudents.filter(s => !payload.candidates.some(a => a.alumno_id === s.id)).map(s => `<option value="${esc(s.id)}">${esc(s.nombre_completo)}</option>`).join('')}</select></label>
      <label>Justificación de excepción (si corresponde)<textarea name="motivo_excepcion" placeholder="Ingreso sin fecha, otra cohorte o menos de tres meses"></textarea></label><button>Incorporar candidato</button></form>` : ''}</div>`
    container.querySelectorAll('[data-candidate]').forEach(button => button.addEventListener('click', () => { selectedCandidate = payload.candidates.find(a => a.id === button.dataset.candidate); renderCandidates(); renderDetail() }, { signal }))
    on('#ia-add', 'submit', event => {
      event.preventDefault(); const form = event.currentTarget
      run(form.querySelector('button'), async () => {
        selectedCandidate = await adapter.addCandidate({ ...Object.fromEntries(new FormData(form)), convocatoria_id: selectedCampaign.id })
        await loadCampaign(selectedCampaign.id)
      })
    })
  }
  function renderDetail() {
    const root = container.querySelector('#ia-detail'), a = selectedCandidate
    if (!a) { root.innerHTML = '<div class="ia-panel">Incorpore un candidato para comenzar.</div>'; return }
    const own = payload.evaluations.find(v => v.candidato_id === a.id && v.ronda === a.ronda && v.jurado_id === context.user.id)
    const all = payload.evaluations.filter(v => v.candidato_id === a.id)
    const mayEvaluate = ['pendiente', 'invitado'].includes(a.estado) && (selectedCampaign.jurados.includes(context.user.id) || (a.estado === 'invitado' && context.clases.find(c => c.id === a.clase_destino_id)?.puede_evaluar_revision))
    root.innerHTML = `<div class="ia-panel"><h2>${esc(a.alumno_nombre)}</h2><span class="ia-badge">${esc(STATUS_LABELS[a.estado])}</span>
      <p class="ia-muted">${a.ronda === 0 ? 'Evaluación inicial' : `Revisión · ronda ${a.ronda}`}${a.revision_fecha ? ` · fecha ${esc(a.revision_fecha)}` : ''}</p>
      ${a.objetivos ? `<p><strong>Objetivos:</strong> ${esc(a.objetivos)}</p>` : ''}
      ${mayEvaluate ? `<form id="ia-score"><h3>Mi valoración</h3><p class="ia-muted">1 Inicial · 2 En desarrollo · 3 Logrado · 4 Consolidado</p>
        ${selectedCampaign.rubrica.map(c => `<label>${esc(c.label)}${c.required ? ' · obligatorio para decidir' : ''}<select data-score="${esc(c.key)}"><option value="">No observado</option>${[1, 2, 3, 4].map(n => `<option value="${n}" ${own?.notas[c.key] === n ? 'selected' : ''}>${n}</option>`).join('')}</select></label>`).join('')}
        <p id="ia-summary" aria-live="polite"></p><label>Observación de la valoración<textarea name="observacion">${esc(own?.observacion || '')}</textarea></label>
        <label>Clase sugerida<select name="clase_propuesta_id"><option value="">Sin propuesta</option>${options(context.clases.filter(c => c.id !== selectedCampaign.clase_origen_id), own?.clase_propuesta_id)}</select></label><button>Guardar mi valoración</button></form>` : '<p class="ia-muted">La valoración corresponde al jurado asignado o al maestro receptor de la revisión.</p>'}</div>
      ${context.user.canManage ? `<div class="ia-panel"><h3>Evidencias registradas</h3><table><thead><tr><th>Ronda</th><th>Evaluador</th><th>Resultado</th></tr></thead><tbody>${all.map(v => { const s = evaluateScores(selectedCampaign.rubrica, v.notas); return `<tr><td>${v.ronda}</td><td>${esc(context.jurados.find(j => j.id === v.jurado_id)?.nombre || 'Evaluador')}</td><td>${s.average?.toFixed(2) || '—'} / 4 · ${s.observed}/${s.total} observados · ${s.complete ? 'Completa' : 'Incompleta'}<br>${esc(v.observacion)}</td></tr>` }).join('') || '<tr><td colspan="3">Aún no hay valoraciones.</td></tr>'}</tbody></table></div>` : ''}
      ${context.user.canManage && ['pendiente', 'invitado'].includes(a.estado) ? `<div class="ia-panel"><form id="ia-decision"><h3>Decisión de coordinación</h3>
        <label>Decisión<select name="accion">${a.estado === 'pendiente' ? '<option value="invitar">Invitar a otra clase</option>' : '<option value="confirmar">Confirmar como fijo</option><option value="prorrogar">Prorrogar invitación</option>'}<option value="continuar">Continuar Iniciación</option></select></label>
        <label>Clase de destino<select name="clase_destino_id"><option value="">Seleccionar para invitar</option>${options(context.clases.filter(c => c.id !== selectedCampaign.clase_origen_id), a.clase_destino_id)}</select></label>
        <label>Fecha de revisión (invitación o prórroga)<input name="revision_fecha" type="date" value="${esc(a.revision_fecha || '')}"></label>
        <label>Objetivos de la invitación<textarea name="objetivos">${esc(a.objetivos || '')}</textarea></label>
        <details><summary>Turno rotativo o acuerdo de horario</summary><label>Día<select name="dia"><option value="">Horario general</option>${['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'].map(d => `<option>${d}</option>`).join('')}</select></label><div class="ia-row"><label>Desde<input name="hora_inicio" type="time"></label><label>Hasta<input name="hora_fin" type="time"></label></div><label>Justificación de solapamiento<textarea name="motivo_solapamiento"></textarea></label></details>
        <label>Observación de la decisión<textarea name="observacion" required></textarea></label><p class="ia-muted">Se conserva Iniciación. Ningún promedio ni vencimiento decide por el equipo.</p><button>Registrar decisión</button></form></div>` : ''}
      <div class="ia-panel"><h3>Historial</h3>${payload.decisions.filter(d => d.candidato_id === a.id).map(d => `<p><strong>${esc(d.accion)}</strong> · ${esc(String(d.creado_at).slice(0, 10))}<br>${esc(d.observacion)}</p>`).join('') || '<p>Sin decisiones registradas.</p>'}</div>`
    const scoreValues = () => Object.fromEntries([...root.querySelectorAll('[data-score]')].map(el => [el.dataset.score, el.value ? Number(el.value) : null]))
    const summary = () => { const el = root.querySelector('#ia-summary'); if (!el) return; const s = evaluateScores(selectedCampaign.rubrica, scoreValues()); el.textContent = `${s.average?.toFixed(2) || '—'} / 4 · ${s.observed}/${s.total} observados · ${s.complete ? 'Valoración completa' : 'Falta evidencia para decidir'}` }
    root.querySelectorAll('[data-score]').forEach(el => el.addEventListener('change', summary, { signal })); summary()
    on('#ia-score', 'submit', event => {
      event.preventDefault(); const form = event.currentTarget
      run(form.querySelector('button'), async () => { await adapter.saveEvaluation({ ...Object.fromEntries(new FormData(form)), candidato_id: a.id, ronda: a.ronda, notas: scoreValues() }); await loadCampaign(selectedCampaign.id) })
    })
    on('#ia-decision', 'submit', event => {
      event.preventDefault(); const form = event.currentTarget, data = Object.fromEntries(new FormData(form)); const { accion, ...datos } = data
      run(form.querySelector('button'), async () => { await adapter.decide({ candidato_id: a.id, version: a.version, accion, datos }); await loadCampaign(selectedCampaign.id) })
    })
  }
  container.innerHTML = '<main class="ia"><p role="status">Cargando audiciones de Iniciación…</p></main>'
  try { context = await adapter.getContext(); campaigns = await adapter.listCampaigns(); if (!destroyed) { shell(); if (campaigns[0]) await loadCampaign(campaigns[0].id) } }
  catch (error) { if (!destroyed) container.innerHTML = `<main class="ia"><h1>Audiciones de Iniciación</h1><p role="alert">${esc(error.message)}</p><a href="/index.html">Volver al SOI</a></main>` }
  return { destroy() { destroyed = true; controller.abort(); container.innerHTML = '' } }
}

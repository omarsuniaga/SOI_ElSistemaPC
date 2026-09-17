import '../styles/repertoire.css'
import { getMaestroLocal } from '../../portal-maestros/auth/maestroAuth.js'
import { ESTADOS_PREPARACION } from '../../modules/repertoire/domain/repertoireFoundation.js'
import { effectivePreparationState } from '../../modules/repertoire/domain/studentPreparation.js'
import { getRepertoireAdapter, RepertoireUnavailableError } from '../../modules/repertoire/api/repertoireRuntime.js'
import { DEFAULT_MEASURES_PER_ROW, MEASURES_PER_ROW_OPTIONS, readMeasuresPerRow, writeMeasuresPerRow } from '../../modules/repertoire/domain/gridSemantics.js'
import { montageSubtitle, montageEventLabel, montageDeadline } from '../../modules/repertoire/domain/montagePresentation.js'

// Modo del adaptador activo ('demo' | 'real'). Se fija al montar la vista y lo
// lee el encabezado del mapa para decidir si muestra el sello DEMO.
let _modoAdaptador = 'real'

/** El aviso de guardado no puede decir "Demo" cuando el dato se fue a la base. */
function mensajeGuardado() {
  return _modoAdaptador === 'demo'
    ? { label: 'Guardado local (Demo)', className: 'is-saved' }
    : { label: 'Guardado', className: 'is-saved' }
}

const STATE_LABELS = { SIN_EVALUAR: 'Sin evaluar', SIN_ESTUDIAR: 'Sin estudiar', CON_DIFICULTAD: 'Con dificultad', DOMINADO: 'Dominado', CONSOLIDADO: 'Consolidado' }
const APPLICABILITY_LABELS = { TOCA: 'Toca', SILENCIO: 'Silencio', TACET: 'Tacet', NO_APLICA: 'No aplica', DESCONOCIDO: 'Desconocido' }

export function cyclePreparationState(state) {
  return ESTADOS_PREPARACION[(ESTADOS_PREPARACION.indexOf(state) + 1) % ESTADOS_PREPARACION.length]
}

export function measureAriaLabel(measure) {
  if (measure.aplicabilidad !== 'TOCA') return `Compás ${measure.numero_visible} — ${APPLICABILITY_LABELS[measure.aplicabilidad] || 'Aplicabilidad desconocida'}`
  return `Compás ${measure.numero_visible} — ${STATE_LABELS[measure.estado_preparacion] || STATE_LABELS.SIN_EVALUAR}`
}

function cardMarkup(montaje) {
  const plazo = montageDeadline(montaje)
  const subtitulo = montageSubtitle(montaje)
  const fila = montaje.filas?.[0]
  return `<article class="repertoire-card" data-montaje-id="${montaje.id}">
    <div class="repertoire-card__heading"><div><span class="repertoire-eyebrow">${montaje.estado.replaceAll('_', ' ')}</span><h2>${montaje.obra.titulo}</h2>${subtitulo ? `<p>${subtitulo}</p>` : ''}</div><strong class="repertoire-priority">P${montaje.prioridad}</strong></div>
    <div class="repertoire-card__meta"><span><i class="bi bi-music-note-list"></i> ${fila?.nombre || 'Fila pendiente'}</span><span><i class="bi bi-calendar-event"></i> ${montageEventLabel(montaje)}</span><span${plazo.days != null && plazo.days < 0 ? ' class="repertoire-meta--overdue"' : ''}><i class="bi bi-hourglass-split"></i> ${plazo.label}</span></div>
    <button class="btn btn-primary repertoire-open" data-montaje-id="${montaje.id}">Abrir mapa <i class="bi bi-arrow-right"></i></button>
  </article>`
}

function gridMarkup(montaje, selected, activeStudent, activeStudentId, groups, passages, measuresPerRow) {
  const marks = montaje.rehearsalMarks || montaje.marcas_ensayo || []
  const cells = montaje.compases.map((measure) => {
    const state = effectivePreparationState({ collectiveState: measure.estado_preparacion, individualState: activeStudent?.overrides?.[measure.id], applicability: measure.aplicabilidad })
    const displayMeasure = { ...measure, estado_preparacion: state || measure.estado_preparacion }
    const linked = groups.find((group) => group.measureIds?.includes(measure.id))
    const passageMatches = passages.filter((passage) => passage.measureIds?.includes(measure.id))
    const marker = marks.find((item) => item.measureId === measure.id || String(item.measureNumber ?? item.numero_visible) === String(measure.numero_visible))
    const passageLabel = passageMatches.map((passage) => passage.name).filter(Boolean).join(', ')
    const label = `${measureAriaLabel(displayMeasure)}${passageLabel ? ` — ${passageLabel}` : ''}${marker ? ` — Letra ${marker.label} comienza en compás ${measure.numero_visible}` : ''}${linked ? ` — vinculado a ${linked.nombre}` : ''}`
    return { measure, displayMeasure, linked, passageMatches, marker, label }
  })
  const rows = []
  for (let index = 0; index < cells.length; index += measuresPerRow) {
    const row = cells.slice(index, index + measuresPerRow)
    const mark = row.find((cell) => cell.marker)?.marker
    rows.push(`<div class="repertoire-grid__row" role="row">${mark ? `<div class="repertoire-rehearsal-mark" role="note" aria-label="Letra ${mark.label} comienza en compás ${row.find((cell) => cell.marker).measure.numero_visible}"><strong>${mark.label}</strong>${mark.description ? ` <small>${mark.description}</small>` : ''}</div>` : ''}${row.map(({ measure, displayMeasure, linked, passageMatches, label }) => `<button class="repertoire-measure state-${displayMeasure.estado_preparacion.toLowerCase()} ${measure.aplicabilidad !== 'TOCA' ? 'is-not-applicable' : ''} ${activeStudent?.overrides?.[measure.id] ? 'has-individual-override' : ''} ${linked ? 'is-linked' : ''} ${passageMatches.length ? 'has-passage' : ''} ${selected.has(measure.id) ? 'is-selected' : ''}" role="gridcell" data-measure-id="${measure.id}" data-passage-ids="${passageMatches.map((passage) => passage.id).join(',')}" aria-label="${label}" title="Clic: ${label} · Shift+clic: seleccionar"><span class="measure-number">${measure.numero_visible}</span>${linked ? '<span class="measure-link" aria-hidden="true">↗</span>' : ''}</button>`).join('')}</div>`)
  }
  return rows.join('')
}

function mapMarkup(montaje, selected, selectionMode, pickerMeasure, canEditApplicability, syncMessage, activeStudentId, passages = [], groups = [], action = null, linkedScope = null, measuresPerRow = DEFAULT_MEASURES_PER_ROW, historyEvents = [], trajectoryVisible = false, trajectoryTargets = [], canEditTargets = false, priorityVisible = false, priorityCandidates = []) {
  const selectionLabel = selectionMode ? (selected.size ? `${selected.size} compases seleccionados` : 'Selecciona compases') : 'Selección múltiple'
  const activeStudent = montaje.alumnos?.find((student) => student.id === activeStudentId)
  const linked = groups.find((group) => group.measureIds?.includes(pickerMeasure?.id))
  const pickerOverride = activeStudent?.overrides?.[pickerMeasure?.id]
  const picker = pickerMeasure ? `<div class="repertoire-picker" role="dialog" aria-label="Estado de ${measureAriaLabel(pickerMeasure)}"><strong>${measureAriaLabel(pickerMeasure)}</strong><div class="repertoire-picker__states">${ESTADOS_PREPARACION.map((state) => `<button type="button" class="btn btn-sm btn-outline-secondary repertoire-pick-state" data-state="${state}">${STATE_LABELS[state]}</button>`).join('')}</div><button type="button" class="btn btn-sm btn-link repertoire-history">Ver historial</button>${historyEvents.length ? `<ol class="repertoire-history-list">${historyEvents.map((event) => `<li><time>${event.createdAt || event.created_at}</time> · ${STATE_LABELS[event.newState || event.new_state] || event.source || 'Evento'}</li>`).join('')}</ol>` : ''}${linked ? `<small>Vinculado a ${linked.nombre}</small><button type="button" class="btn btn-sm btn-outline-secondary repertoire-linked-all">Aplicar a todos los vinculados</button><button type="button" class="btn btn-sm btn-link repertoire-unlink">Desvincular este compás</button>` : ''}${activeStudent && pickerOverride ? '<button type="button" class="btn btn-sm btn-link repertoire-clear-override">Usar estado de la fila</button>' : ''}${canEditApplicability ? `<div class="repertoire-picker__applicability"><label for="repertoire-applicability">Aplicabilidad</label><select id="repertoire-applicability" class="form-select repertoire-applicability">${['TOCA', 'SILENCIO', 'TACET', 'NO_APLICA', 'DESCONOCIDO'].map((value) => `<option value="${value}" ${pickerMeasure.aplicabilidad === value ? 'selected' : ''}>${value}</option>`).join('')}</select></div>` : '<small>Aplicabilidad: solo lectura</small>'}</div>` : ''
  const selectedActions = selectionMode && selected.size ? '<button type="button" class="btn btn-sm btn-outline-secondary repertoire-create-passage">Crear pasaje</button><button type="button" class="btn btn-sm btn-outline-secondary repertoire-create-group">Vincular compases</button><button type="button" class="btn btn-sm btn-outline-secondary repertoire-unlink-selected">Desvincular seleccionados</button>' : ''
  const scopeDialog = linkedScope ? `<div class="repertoire-scope-dialog" role="dialog" aria-modal="true" aria-label="Actualizar compases vinculados"><strong>Actualizar:</strong><button type="button" class="btn btn-primary repertoire-linked-scope" data-scope="one">Solo este compás</button><button type="button" class="btn btn-primary repertoire-linked-scope" data-scope="all">Todos los vinculados</button><button type="button" class="btn btn-link repertoire-linked-scope" data-scope="cancel">Cancelar</button></div>` : ''
  const editPassage = action?.startsWith('edit-passage:') ? passages.find((item) => item.id === action.split(':')[1]) : null
  const form = action ? `<form class="repertoire-action-form" data-action="${action}"><h2>${editPassage ? 'Editar pasaje' : action === 'passage' ? 'Crear pasaje' : 'Vincular compases'}</h2>${action === 'group' ? '<input name="name" class="form-control" placeholder="Nombre del grupo" required>' : `<input name="name" class="form-control" placeholder="Nombre" value="${editPassage?.name || ''}" required><textarea name="description" class="form-control" placeholder="Descripción (opcional)">${editPassage?.description || ''}</textarea><textarea name="notes" class="form-control" placeholder="Notas (opcional)">${editPassage?.notes || ''}</textarea><select name="difficulty" class="form-select"><option value="">Dificultad</option>${[1, 2, 3, 4, 5].map((value) => `<option value="${value}" ${editPassage?.difficulty === value ? 'selected' : ''}>${value}</option>`).join('')}</select><input name="focus" class="form-control" placeholder="Focus: RITMO, ARTICULACION" value="${editPassage?.focusTags?.join(', ') || ''}">`}<button class="btn btn-primary" type="submit">Guardar</button><button class="btn btn-link repertoire-cancel-action" type="button">Cancelar</button></form>` : ''
  const activePassages = passages.filter((item) => !item.archived_at)
  const passageList = activePassages.length ? `<section class="repertoire-passages"><h2>Pasajes</h2>${activePassages.map((item) => `<div class="repertoire-passage-row"><button type="button" class="repertoire-passage" data-passage-id="${item.id}">${item.name} · cc. ${item.measureIds.join(', ')}</button><button type="button" class="btn btn-sm btn-link repertoire-edit-passage" data-passage-id="${item.id}">Editar</button><button type="button" class="btn btn-sm btn-link repertoire-archive-passage" data-passage-id="${item.id}">Archivar</button></div>`).join('')}</section>` : ''
  const groupList = groups.length ? `<section class="repertoire-passages"><h2>Grupos vinculados</h2>${groups.map((group) => `<div class="repertoire-passage-row"><span>${group.nombre} · ${group.measureIds.join(', ')}</span><button type="button" class="btn btn-sm btn-link repertoire-rename-group" data-group-id="${group.id}">Renombrar</button><button type="button" class="btn btn-sm btn-link repertoire-break-group" data-group-id="${group.id}">Romper grupo</button></div>`).join('')}</section>` : ''
  return `<section class="repertoire-map" aria-label="Mapa de preparación de ${montaje.obra.titulo}">
    <div class="repertoire-map__header"><div><button class="btn btn-link repertoire-back">← Mis obras</button><h1>${montaje.obra.titulo}</h1><p>${[montaje.filas[0]?.nombre, montageEventLabel(montaje), montageDeadline(montaje).label].filter(Boolean).join(' · ')}</p></div>${_modoAdaptador === 'demo' ? '<span class="repertoire-mode-badge">DEMO · persistencia local</span>' : ''}</div>
    <div class="repertoire-map__toolbar"><button class="btn btn-outline-secondary repertoire-multi" aria-pressed="${selectionMode}">${selectionLabel}</button>${selectedActions}<button class="btn btn-outline-secondary repertoire-trajectory">Trayectoria</button><button class="btn btn-outline-secondary repertoire-priorities">Prioridades</button><label class="repertoire-layout-setting">Compases por línea <select class="form-select repertoire-measures-per-row" aria-label="Compases por línea">${[...new Set([...MEASURES_PER_ROW_OPTIONS, measuresPerRow])].sort((a, b) => a - b).map((value) => `<option value="${value}" ${value === measuresPerRow ? 'selected' : ''}>${value}</option>`).join('')}</select></label><select class="form-select repertoire-bulk" aria-label="Estado para selección múltiple" ${selected.size ? '' : 'disabled'}>${ESTADOS_PREPARACION.map((state) => `<option value="${state}">${STATE_LABELS[state]}</option>`).join('')}</select><button class="btn btn-primary repertoire-apply" ${selected.size ? '' : 'disabled'}>Aplicar estado</button><span class="repertoire-sync ${syncMessage.className}" role="status" aria-live="polite">${syncMessage.label}</span></div>
    ${picker}${scopeDialog}
    ${form}${passageList}${groupList}
    ${trajectoryVisible ? `<section class="repertoire-trajectory-panel" aria-label="Trayectoria de preparación"><h2>Trayectoria</h2>${trajectoryTargets.length ? trajectoryTargets.map((target) => `<article><strong>${target.notas || target.alcance || 'Objetivo'}</strong><div>Estado: ${target.estado_objetivo || '—'} · Umbral: ${target.umbral_porcentaje ?? '—'}% · Fecha: ${target.fecha_objetivo || '—'}</div></article>`).join('') : '<p>No hay objetivos explícitos para este montaje.</p>'}${canEditTargets ? '<form class="repertoire-target-form"><input name="notes" placeholder="Nombre del objetivo" required><select name="targetState"><option value="">Estado</option><option>CON_DIFICULTAD</option><option>DOMINADO</option><option>CONSOLIDADO</option></select><input name="targetDate" type="date" required><input name="thresholdPercent" type="number" min="0" max="100" placeholder="Umbral %"><input name="targetTempo" type="number" min="1" placeholder="Tempo BPM"><button type="submit" class="btn btn-primary">Crear objetivo</button></form>' : ''}</section>` : ''}
    ${priorityVisible ? `<section class="repertoire-trajectory-panel" aria-label="Prioridades de ensayo"><h2>Prioridades de ensayo</h2>${priorityCandidates.length ? priorityCandidates.map((candidate, index) => `<article><strong>${index + 1}. ${candidate.label}</strong><div>${candidate.urgency} · ${(candidate.reasons || []).join(' · ')}</div><small>${candidate.why || ''}</small></article>`).join('') : '<p>No hay prioridades calculadas para este alcance.</p>'}</section>` : ''}
    <div class="repertoire-grid" role="grid" style="--measures-per-row: ${measuresPerRow}">${gridMarkup(montaje, selected, activeStudent, activeStudentId, groups, activePassages, measuresPerRow)}</div>
    <section class="repertoire-students" aria-label="Preparación individual"><h2>Detalle por alumno</h2><p>El estado colectivo de la fila no reemplaza estos estados individuales.</p><div class="repertoire-student-list"><button type="button" class="btn btn-sm ${activeStudentId === null ? 'btn-primary' : 'btn-outline-secondary'} repertoire-student" data-student-id="">Fila colectiva</button>${(montaje.alumnos || []).map((student) => `<button type="button" class="btn btn-sm ${student.id === activeStudentId ? 'btn-primary' : 'btn-outline-secondary'} repertoire-student" data-student-id="${student.id}">${student.nombre}${STATE_LABELS[student.estado_preparacion] ? `: ${STATE_LABELS[student.estado_preparacion]}` : ''}</button>`).join('')}</div></section>
    <p class="repertoire-legend">Los compases no aplicables se muestran en neutro y no cuentan para el porcentaje de preparación.</p>
  </section>`
}

export async function renderRepertoireView(container, { adapter } = {}) {
  container.innerHTML = '<div class="repertoire-loading" role="status">Cargando repertorio…</div>'
  try {
    adapter ||= getRepertoireAdapter({ actorContext: { maestroId: getMaestroLocal()?.id || null } })
  } catch (error) {
    const message = error instanceof RepertoireUnavailableError ? error.message : 'No se pudo cargar el módulo de Repertorio.'
    container.innerHTML = `<div class="repertoire-error" role="alert">${message}</div>`
    return { mode: 'unavailable' }
  }
  let montajes
  try { montajes = await adapter.listMontajes() } catch { container.innerHTML = '<div class="repertoire-error" role="alert">No se pudo cargar el módulo de Repertorio.</div>'; return { mode: 'unavailable' } }
  let active = null
  let selected = new Set()
  let selectionMode = false
  let anchorIndex = null
  let pickerMeasure = null
  let pressTimer = null
  let longPressTriggered = false
  let syncMessage = { label: 'Listo', className: 'is-saved' }
  let activeStudentId = active?.alumnos?.[0]?.id || null
  const passages = []
  let groups = []
  let action = null
  let linkedScope = null
  let measuresPerRow = readMeasuresPerRow({ montajeId: active?.id || '' })
  let historyEvents = []
  let trajectoryVisible = false
  let trajectoryTargets = []
  let priorityVisible = false
  let priorityCandidates = []
  // Se consulta en cada render: el adaptador real aprende sus filas editables
  // al listar los montajes, después de construirse.
  const puedeEditarAplicabilidad = () => adapter.canEditApplicability === true
  _modoAdaptador = adapter.mode === 'demo' ? 'demo' : 'real'

  const render = () => {
    container.innerHTML = active ? mapMarkup(active, selected, selectionMode, pickerMeasure, puedeEditarAplicabilidad(), syncMessage, activeStudentId, passages, groups, action, linkedScope, measuresPerRow, historyEvents, trajectoryVisible, trajectoryTargets, adapter.canEditTargets === true, priorityVisible, priorityCandidates) : `<div class="repertoire-view"><div class="repertoire-view__intro"><span class="repertoire-eyebrow">ACM · PREPARACIÓN ORQUESTAL</span><h1>Mis obras</h1><p>Montajes asignados para preparar con tu fila.</p></div>${montajes.length ? montajes.map(cardMarkup).join('') : '<div class="repertoire-empty">No tienes montajes asignados todavía.</div>'}</div>`
    if (active) bindMap()
    else container.querySelectorAll('.repertoire-open').forEach((button) => button.addEventListener('click', () => { active = montajes.find((item) => item.id === button.dataset.montajeId); measuresPerRow = readMeasuresPerRow({ montajeId: active.id, versionId: active.version?.id || active.version?.nombre || '', filaId: active.filas?.[0]?.id || '' }); activeStudentId = null; render() }))
  }

  const bindMap = () => {
    container.querySelector('.repertoire-trajectory')?.addEventListener('click', async () => { trajectoryTargets = await adapter.listTargets?.(active.id) || []; trajectoryVisible = true; render() })
    container.querySelector('.repertoire-priorities')?.addEventListener('click', async () => { priorityCandidates = await adapter.listPriorityCandidates?.(active.id) || []; priorityVisible = true; render() })
    container.querySelector('.repertoire-target-form')?.addEventListener('submit', async (event) => { event.preventDefault(); const form = new FormData(event.currentTarget); await adapter.createTarget?.({ montaje_id: active.id, alcance: 'montage', estado_objetivo: form.get('targetState') || null, fecha_objetivo: form.get('targetDate'), umbral_porcentaje: form.get('thresholdPercent') ? Number(form.get('thresholdPercent')) : null, tempo_objetivo: form.get('targetTempo') ? Number(form.get('targetTempo')) : null, notas: form.get('notes'), created_by: adapter.currentMaestroId || null }); trajectoryTargets = await adapter.listTargets?.(active.id) || []; render() })
    container.querySelector('.repertoire-measures-per-row')?.addEventListener('change', (event) => { measuresPerRow = writeMeasuresPerRow({ montajeId: active.id, versionId: active.version?.id || active.version?.nombre || '', filaId: active.filas?.[0]?.id || '' }, event.target.value); render() })
    container.querySelectorAll('.repertoire-student').forEach((button) => button.addEventListener('click', () => { activeStudentId = button.dataset.studentId || null; pickerMeasure = null; render() }))
    container.querySelector('.repertoire-create-passage')?.addEventListener('click', () => { action = 'passage'; render() })
    container.querySelector('.repertoire-create-group')?.addEventListener('click', () => { action = 'group'; render() })
    container.querySelector('.repertoire-unlink-selected')?.addEventListener('click', async () => { for (const group of groups) { const ids = [...selected].filter((id) => group.measureIds.includes(id)); if (ids.length) { await adapter.removeLinkedMeasures(group.id, ids); group.measureIds = group.measureIds.filter((id) => !ids.includes(id)) } } selected = new Set(); selectionMode = false; render() })
    container.querySelector('.repertoire-cancel-action')?.addEventListener('click', () => { action = null; render() })
    container.querySelectorAll('.repertoire-edit-passage').forEach((button) => button.addEventListener('click', () => { action = `edit-passage:${button.dataset.passageId}`; render() }))
    container.querySelectorAll('.repertoire-archive-passage').forEach((button) => button.addEventListener('click', async () => { if (!confirm('¿Archivar pasaje?')) return; syncMessage = { label: 'Guardando…', className: 'is-pending' }; render(); try { await adapter.archivePassage(button.dataset.passageId); passages.find((item) => item.id === button.dataset.passageId).archived_at = new Date().toISOString(); syncMessage = mensajeGuardado() } catch { syncMessage = { label: 'No se pudo archivar', className: 'is-error' } } render() }))
    container.querySelectorAll('.repertoire-rename-group').forEach((button) => button.addEventListener('click', async () => { const group = groups.find((item) => item.id === button.dataset.groupId); const name = window.prompt('Nuevo nombre', group.nombre); if (!name?.trim()) return; await adapter.renameLinkedGroup(group.id, name.trim()); group.nombre = name.trim(); render() }))
    container.querySelectorAll('.repertoire-break-group').forEach((button) => button.addEventListener('click', async () => { if (!confirm('¿Romper grupo vinculado?')) return; const group = groups.find((item) => item.id === button.dataset.groupId); await adapter.breakLinkedGroup(group.id); groups = groups.filter((item) => item.id !== group.id); render() }))
    container.querySelector('.repertoire-action-form')?.addEventListener('submit', async (event) => {
      event.preventDefault()
      const form = new FormData(event.currentTarget)
      syncMessage = { label: 'Guardando…', className: 'is-pending' }
      render()
      try {
        if (action === 'passage' || action?.startsWith('edit-passage:')) {
          const existing = action?.startsWith('edit-passage:') ? passages.find((item) => item.id === action.split(':')[1]) : null
          const payload = { name: form.get('name'), description: form.get('description'), notes: form.get('notes'), difficulty: form.get('difficulty') ? Number(form.get('difficulty')) : null, focusTags: String(form.get('focus') || '').split(',').map((tag) => tag.trim()).filter(Boolean), measureIds: selected.size ? [...selected] : existing?.measureIds || [] }
          if (action === 'passage') passages.push(await adapter.createPassage(payload))
          else Object.assign(passages.find((item) => item.id === action.split(':')[1]), await adapter.updatePassage(action.split(':')[1], payload))
        } else {
          const group = await adapter.createLinkedGroup({ nombre: form.get('name') })
          await adapter.addLinkedMeasures([...selected].map((montaje_compas_id) => ({ grupo_id: group.id, montaje_compas_id })))
          groups.push({ ...group, measureIds: [...selected] })
        }
        selected = new Set(); selectionMode = false; action = null; syncMessage = mensajeGuardado()
      } catch { syncMessage = { label: 'No se pudo guardar; se conservó la selección', className: 'is-error' } }
      render()
    })
    container.querySelectorAll('.repertoire-passage').forEach((button) => button.addEventListener('click', () => { const passage = passages.find((item) => item.id === button.dataset.passageId); selected = new Set(passage.measureIds); selectionMode = true; render(); container.querySelector('.repertoire-grid')?.scrollIntoView({ block: 'nearest' }) }))
    container.querySelector('.repertoire-back')?.addEventListener('click', () => { active = null; selected = new Set(); selectionMode = false; render() })
    container.querySelector('.repertoire-multi')?.addEventListener('click', () => { selectionMode = !selectionMode; anchorIndex = null; if (!selectionMode) selected = new Set(); render() })
    container.querySelector('.repertoire-picker')?.addEventListener('click', async (event) => {
      if (event.target.closest('.repertoire-history') && pickerMeasure) { historyEvents = await adapter.historyByMeasure?.(active.id, pickerMeasure.id) || []; render(); return }
      const stateButton = event.target.closest('.repertoire-pick-state')
      if (stateButton && pickerMeasure) await saveState(pickerMeasure, stateButton.dataset.state)
      if (event.target.closest('.repertoire-clear-override') && pickerMeasure && activeStudentId) await saveState(pickerMeasure, null)
      if (event.target.closest('.repertoire-linked-all') && pickerMeasure) await updateLinked(pickerMeasure, pickerMeasure.estado_preparacion)
      if (event.target.closest('.repertoire-unlink') && pickerMeasure) { const group = groups.find((item) => item.measureIds?.includes(pickerMeasure.id)); if (group) { await adapter.removeLinkedMeasure(group.id, pickerMeasure.id); group.measureIds = group.measureIds.filter((id) => id !== pickerMeasure.id); pickerMeasure = null; render() } }
    })
    container.querySelectorAll('.repertoire-linked-scope').forEach((button) => button.addEventListener('click', async () => { if (button.dataset.scope === 'cancel') { linkedScope = null; render(); return } const request = linkedScope; linkedScope = null; if (button.dataset.scope === 'all') await updateLinked(request.measure, request.state); else await saveState(request.measure, request.state) }))
    container.querySelector('.repertoire-applicability')?.addEventListener('change', async (event) => {
      if (!pickerMeasure || !puedeEditarAplicabilidad()) return
      const previous = pickerMeasure.aplicabilidad
      pickerMeasure.aplicabilidad = event.target.value
      syncMessage = { label: 'Guardando…', className: 'is-pending' }
      render()
      try { await adapter.updateMeasureApplicability(pickerMeasure.id, pickerMeasure.aplicabilidad, { filaId: active.filas?.[0]?.id, montageId: active.id }); syncMessage = mensajeGuardado(); pickerMeasure = null } catch { pickerMeasure.aplicabilidad = previous; syncMessage = { label: 'No se pudo guardar; se revirtió', className: 'is-error' } }
      render()
    })
    container.querySelectorAll('.repertoire-measure').forEach((button) => button.addEventListener('click', async (event) => {
      const measure = active.compases.find((item) => item.id === button.dataset.measureId)
      if (longPressTriggered) { longPressTriggered = false; return }
      const index = active.compases.indexOf(measure)
      if (event.shiftKey && anchorIndex !== null) {
        const [from, to] = [anchorIndex, index].sort((a, b) => a - b)
        selected = new Set(active.compases.slice(from, to + 1).map((item) => item.id))
        selectionMode = true
        render()
        return
      }
      if (selectionMode) { selected.has(measure.id) ? selected.delete(measure.id) : selected.add(measure.id); anchorIndex = index; render(); return }
      anchorIndex = index; historyEvents = []
      const linked = groups.find((group) => group.measureIds?.includes(measure.id))
      const nextState = cyclePreparationState(measure.estado_preparacion)
      if (linked && activeStudentId === null) { linkedScope = { measure, state: nextState }; render(); return }
      await saveState(measure, nextState)
    }))
    container.querySelectorAll('.repertoire-measure').forEach((button) => {
      button.addEventListener('contextmenu', (event) => { event.preventDefault(); historyEvents = []; pickerMeasure = active.compases.find((item) => item.id === button.dataset.measureId); render() })
      button.addEventListener('pointerdown', () => { pressTimer = setTimeout(() => { pickerMeasure = active.compases.find((item) => item.id === button.dataset.measureId); longPressTriggered = true; render() }, 550) })
      button.addEventListener('pointerup', () => clearTimeout(pressTimer))
      button.addEventListener('pointerleave', () => clearTimeout(pressTimer))
    })
    container.querySelector('.repertoire-picker')?.addEventListener('keydown', (event) => { if (event.key === 'Escape') { pickerMeasure = null; render() } })
    container.querySelector('.repertoire-apply')?.addEventListener('click', async () => {
      const state = container.querySelector('.repertoire-bulk').value
      const previous = new Map([...selected].map((id) => [id, active.compases.find((item) => item.id === id).estado_preparacion]))
      for (const id of selected) active.compases.find((item) => item.id === id).estado_preparacion = state
      selected = new Set(); selectionMode = false; syncMessage = { label: 'Guardando…', className: 'is-pending' }; render()
      try { await Promise.all([...previous.keys()].map((id) => adapter.updateMeasureState(id, state, { filaId: active.filas?.[0]?.id, montageId: active.id }))); syncMessage = mensajeGuardado() } catch { previous.forEach((value, id) => { active.compases.find((item) => item.id === id).estado_preparacion = value }); syncMessage = { label: 'No se pudo guardar; se revirtió', className: 'is-error' }; render(); return }
      render()
    })
  }

  async function saveState(measure, state) {
    const student = active?.alumnos?.find((item) => item.id === activeStudentId)
    const previous = student ? (student.overrides?.[measure.id] || null) : measure.estado_preparacion
    if (student) {
      student.overrides ||= {}
      if (state === null) delete student.overrides[measure.id]
      else student.overrides[measure.id] = state
    } else measure.estado_preparacion = state
    syncMessage = { label: 'Guardando…', className: 'is-pending' }
    pickerMeasure = null
    render()
    try {
      if (student) await adapter.updateStudentState(activeStudentId, measure.id, state)
      else await adapter.updateMeasureState(measure.id, state, { filaId: active.filas?.[0]?.id, montageId: active.id })
      syncMessage = mensajeGuardado()
    } catch {
      if (student) { if (previous === null) delete student.overrides[measure.id]; else student.overrides[measure.id] = previous }
      else measure.estado_preparacion = previous
      syncMessage = { label: 'No se pudo guardar; se revirtió', className: 'is-error' }
    }
    render()
  }

  async function updateLinked(measure, state = measure.estado_preparacion) {
    const group = groups.find((item) => item.measureIds?.includes(measure.id))
    if (!group) return
    const previous = new Map(group.measureIds.map((id) => [id, active.compases.find((item) => item.id === id).estado_preparacion]))
    group.measureIds.forEach((id) => { active.compases.find((item) => item.id === id).estado_preparacion = state })
    syncMessage = { label: 'Guardando…', className: 'is-pending' }; pickerMeasure = null; render()
    try { await adapter.updateLinkedGroupState(group.id, state); syncMessage = mensajeGuardado() } catch { previous.forEach((value, id) => { active.compases.find((item) => item.id === id).estado_preparacion = value }); syncMessage = { label: 'No se pudo guardar; se revirtió', className: 'is-error' } }
    render()
  }

  render()
  return { mode: 'demo', maestroId: getMaestroLocal()?.id || null }
}

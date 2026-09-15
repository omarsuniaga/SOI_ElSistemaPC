import '../styles/repertoire.css'
import { getMaestroLocal } from '../../portal-maestros/auth/maestroAuth.js'
import { daysRemaining, ESTADOS_PREPARACION } from '../../modules/repertoire/domain/repertoireFoundation.js'
import { effectivePreparationState } from '../../modules/repertoire/domain/studentPreparation.js'
import { getRepertoireAdapter, RepertoireUnavailableError } from '../../modules/repertoire/api/repertoireRuntime.js'
import { DEFAULT_MEASURES_PER_ROW, MEASURES_PER_ROW_OPTIONS, readMeasuresPerRow, writeMeasuresPerRow } from '../../modules/repertoire/domain/gridSemantics.js'
import { renderSegmentedControl, renderHorizontalFilaTabs, renderBottomSheet, renderConfirmDialog, renderContextMenu, renderEmptyState, renderSkeleton, renderDerivedPresentation, renderStateBadge, bindRepertoireOverlay } from '../components/repertoirePrimitives.js'

const STATE_LABELS = { SIN_EVALUAR: 'Sin evaluar', SIN_ESTUDIAR: 'Sin estudiar', CON_DIFICULTAD: 'Con dificultad', DOMINADO: 'Dominado', CONSOLIDADO: 'Consolidado' }
const APPLICABILITY_LABELS = { TOCA: 'Toca', SILENCIO: 'Silencio', TACET: 'Tacet', NO_APLICA: 'No aplica', DESCONOCIDO: 'Desconocido' }

export function cyclePreparationState(state) {
  return ESTADOS_PREPARACION[(ESTADOS_PREPARACION.indexOf(state) + 1) % ESTADOS_PREPARACION.length]
}

export function measureAriaLabel(measure) {
  if (measure.aplicabilidad !== 'TOCA') return `Compás ${measure.numero_visible} — ${APPLICABILITY_LABELS[measure.aplicabilidad] || 'Aplicabilidad desconocida'}`
  return `Compás ${measure.numero_visible} — ${STATE_LABELS[measure.estado_preparacion] || STATE_LABELS.SIN_EVALUAR}`
}

const html = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]))

function cardMarkup(montaje, { onMenu = false } = {}) {
  const days = daysRemaining(montaje.evento?.fecha)
  const filas = [...new Map((montaje.filas || []).map((fila) => [fila.id, fila.nombre || fila.name])).values()]
  const obra = montaje.obra || {}
  const title = html(obra.titulo || 'Obra sin título')
  return `<article class="repertoire-card" data-montaje-id="${html(montaje.id)}" tabindex="0">
    <div class="repertoire-card__heading"><div><span class="repertoire-eyebrow">${html((montaje.estado || 'SIN ESTADO').replaceAll('_', ' '))}</span><h2>${title}</h2><p>${html(obra.compositor || 'Compositor pendiente')} · ${html(montaje.version?.nombre || 'Versión pendiente')}</p></div>${onMenu ? '<button type="button" class="pm-icon-button repertoire-card-menu" aria-label="Acciones de la obra" data-montaje-id="' + html(montaje.id) + '">⋮</button>' : ''}</div>
    <div class="repertoire-card__meta"><span>Filas: ${html(filas.length ? filas.join(', ') : 'Pendientes')}</span><span>Creación: ${html(montaje.created_at || '—')}</span><span>Estreno: ${html(montaje.evento?.fecha || '—')}</span><span>${days == null ? 'Fecha pendiente' : days >= 0 ? `Faltan ${days} días` : `Venció hace ${Math.abs(days)} días`}</span></div>
  </article>`
}

function workMarkup(work, { onMenu = false } = {}) {
  const versions = work.obra_versiones || []
  const montageId = work.montaje_id || work.montage_id || ''
  return `<article class="repertoire-card repertoire-work-card ${montageId ? 'is-openable' : ''}" ${montageId ? `data-montaje-id="${html(montageId)}" tabindex="0"` : ''}><div class="repertoire-card__heading"><div><span class="repertoire-eyebrow">PEDAGÓGICA · MIS OBRAS</span><h2>${html(work.titulo || 'Obra sin título')}</h2><p>${html(work.compositor || 'Compositor pendiente')}${work.arreglista ? ` · ${html(work.arreglista)}` : ''}</p></div>${onMenu ? `<button type="button" class="pm-icon-button repertoire-work-menu" aria-label="Acciones de la obra" data-work-id="${html(work.id)}" data-montaje-id="${html(montageId)}">⋮</button>` : ''}</div><div class="repertoire-card__meta"><span>${versions.length ? `${versions.length} versión${versions.length === 1 ? '' : 'es'}` : 'Versión pendiente'}</span><span>Creada por ti</span><span>Filas: ${html(work.filas_count ?? '—')}</span><span>Fecha: ${html(work.created_at || '—')}</span></div>${montageId ? '<span class="repertoire-card__hint">Abrir detalle →</span>' : ''}</article>`
}

export function repertoireHomeMarkup({ montajes = [], obras = [], teachingScopes = [], canCreate = false, activeTab = 'mine', search = '', filters = {}, filterOptions = {}, loading = false, error = null, action = null }) {
  const query = html(search)
  const tabOptions = [{ value: 'mine', label: `Mis obras${obras.length ? ` (${obras.length})` : ''}` }, { value: 'official', label: `Oficiales${montajes.length ? ` (${montajes.length})` : ''}` }]
  const source = activeTab === 'mine' ? obras : montajes
  const matches = source.filter((item) => { const obra = item.obra || item; const haystack = `${obra.titulo || ''} ${obra.compositor || ''}`.toLocaleLowerCase(); return haystack.includes(search.toLocaleLowerCase()) && (!filters.status || item.estado === filters.status) })
  const scopeOptions = teachingScopes.length ? teachingScopes.map((scope) => `<label class="repertoire-scope-option"><input type="checkbox" name="scope" value="${html(scope.id)}"><span><strong>${html(scope.name)}</strong><small>${html(scope.instrument || 'Instrumento pendiente')} · ${(scope.students || []).length} alumnos activos</small></span></label>`).join('') : '<p class="repertoire-form-hint">No hay clases activas asignadas a tu cuenta.</p>'
  const form = action === 'new-work' ? `<form class="repertoire-action-form repertoire-work-form" data-action="new-work"><h2>Nueva obra pedagógica</h2><fieldset><legend>Datos de obra</legend><input name="title" class="form-control" placeholder="Título" required><input name="composer" class="form-control" placeholder="Compositor"><input name="arranger" class="form-control" placeholder="Arreglista (opcional)"><input name="version" class="form-control" placeholder="Versión / edición (opcional)"><textarea name="description" class="form-control" placeholder="Notas pedagógicas (opcional)"></textarea></fieldset><fieldset><legend>Estructura canónica</legend><label>Número de compases<input name="measures" class="form-control" type="number" min="1" required placeholder="Ej. 120"></label></fieldset><fieldset><legend>Grupos de trabajo</legend><div class="repertoire-scope-options">${scopeOptions}</div></fieldset><button class="btn btn-primary" type="submit">Crear preparación</button><button class="btn btn-link repertoire-cancel-home" type="button">Cancelar</button></form>` : ''
  const cards = loading ? renderSkeleton({ lines: 4, className: 'repertoire-home__skeleton' }) : error ? `<div class="repertoire-error" role="alert"><p>No se pudo cargar el repertorio.</p><button type="button" class="btn btn-primary repertoire-retry">Reintentar</button></div>` : matches.length ? matches.map((item) => activeTab === 'mine' ? workMarkup(item, { onMenu: true }) : cardMarkup(item, { onMenu: true })).join('') : renderEmptyState({ title: search || filters.status ? 'No hay coincidencias' : activeTab === 'mine' ? 'Tu repertorio está vacío' : 'No hay obras oficiales', message: search || filters.status ? 'Prueba con otra búsqueda o filtro.' : 'Cuando existan datos asignados aparecerán aquí.', action: canCreate && activeTab === 'mine' ? '<button type="button" class="pm-button pm-button--primary repertoire-new-work">Crear obra</button>' : '' })
  const statuses = filterOptions.statuses?.map((status) => `<option value="${html(status)}" ${filters.status === status ? 'selected' : ''}>${html(status.replaceAll('_', ' '))}</option>`).join('') || ''
  const filtersSheet = renderBottomSheet({ id: 'repertoire-filters', title: 'Filtros', open: Boolean(filters.open), body: `<label class="repertoire-filter-field">Estado<select class="form-select repertoire-filter-status"><option value="">Todos</option>${statuses}</select></label>`, actions: '<button type="button" class="pm-button pm-button--primary repertoire-apply-filters">Aplicar filtros</button>' })
  const menu = renderContextMenu({ id: 'repertoire-card-menu', items: [{ id: 'edit', label: 'Editar' }, { id: 'delete', label: 'Eliminar', danger: true, disabled: true }] })
  const dialog = renderConfirmDialog({ id: 'repertoire-delete-dialog', title: 'Eliminar obra', message: 'No existe una operación segura de borrado para este adaptador. La acción permanecerá bloqueada.', confirmLabel: 'Eliminar', danger: true })
  return `<section class="repertoire-view repertoire-home" aria-labelledby="repertoire-home-title"><header class="repertoire-home__header"><div class="repertoire-view__intro"><span class="repertoire-eyebrow">PORTAL MAESTROS</span><h1 id="repertoire-home-title">Repertorio</h1><p>Mis obras y repertorio oficial asignado</p></div><button type="button" class="btn btn-primary repertoire-new-work" ${canCreate ? '' : 'disabled'}>+ Crear obra</button></header>${form}${renderSegmentedControl({ id: 'repertoire-home-tabs', label: 'Tipo de repertorio', value: activeTab, options: tabOptions, className: 'repertoire-home-tabs' })}<div class="repertoire-home__toolbar"><label class="repertoire-search"><span class="visually-hidden">Buscar obras</span><input class="form-control repertoire-search-input" value="${query}" placeholder="Buscar por título o compositor" type="search"></label><button type="button" class="pm-button pm-button--secondary repertoire-open-filters" aria-expanded="${Boolean(filters.open)}">☷ Filtros</button></div>${filtersSheet}<section class="repertoire-home__section" aria-live="polite"><div class="repertoire-section-heading"><h2>${activeTab === 'mine' ? 'Mis obras' : 'Obras oficiales'}</h2><span>${matches.length} resultado${matches.length === 1 ? '' : 's'}</span></div><div class="repertoire-card-list">${cards}</div></section>${menu}${dialog}</section>`
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

function mapMarkup(montaje, selected, selectionMode, pickerMeasure, canEditApplicability, syncMessage, activeStudentId, passages = [], groups = [], action = null, linkedScope = null, measuresPerRow = DEFAULT_MEASURES_PER_ROW, historyEvents = [], trajectoryVisible = false, trajectoryTargets = [], canEditTargets = false, priorityVisible = false, priorityCandidates = [], mode = 'real', detailMode = 'fila') {
  const selectionLabel = selectionMode ? (selected.size ? `${selected.size} compases seleccionados` : 'Selecciona compases') : 'Selección múltiple'
  const activeStudent = montaje.alumnos?.find((student) => student.id === activeStudentId)
  const activeFilaId = montaje.activeFilaId || montaje.filas?.[0]?.id || null
  const activeFila = montaje.filas?.find((fila) => fila.id === activeFilaId) || montaje.filas?.[0] || {}
  const filaStudents = (montaje.alumnos || []).filter((student) => !student.montaje_fila_id || student.montaje_fila_id === activeFilaId)
  const derivedStates = filaStudents.map((student) => student.estado_preparacion).filter(Boolean)
  const derivedSummary = derivedStates.length ? derivedStates.reduce((counts, state) => ({ ...counts, [state]: (counts[state] || 0) + 1 }), {}) : {}
  if (!(montaje.filas || []).length) return `<section class="repertoire-map" aria-label="Mapa de preparación"><header class="repertoire-work-header"><button type="button" class="btn btn-link repertoire-back" aria-label="Volver al repertorio">← Repertorio</button><div><span class="repertoire-eyebrow">PORTAL MAESTROS</span><h1>${html(montaje.obra?.titulo || 'Obra sin título')}</h1><p>${html(montaje.obra?.compositor || 'Compositor pendiente')}</p></div></header>${renderEmptyState({ title: 'Sin filas asignadas', message: 'No hay filas autorizadas para esta obra.' })}</section>`
  const linked = groups.find((group) => group.measureIds?.includes(pickerMeasure?.id))
  const pickerOverride = activeStudent?.overrides?.[pickerMeasure?.id]
  const studentIndex = activeStudent ? filaStudents.findIndex((student) => student.id === activeStudent.id) : -1
  const studentLabel = activeStudent?.nombre || activeStudent?.nombre_completo || 'Seleccionar alumno'
  const picker = pickerMeasure ? `<div class="repertoire-picker" role="dialog" aria-label="Estado de ${measureAriaLabel(pickerMeasure)}"><strong>${measureAriaLabel(pickerMeasure)}</strong><div class="repertoire-picker__states">${ESTADOS_PREPARACION.map((state) => `<button type="button" class="btn btn-sm btn-outline-secondary repertoire-pick-state" data-state="${state}">${STATE_LABELS[state]}</button>`).join('')}</div><button type="button" class="btn btn-sm btn-link repertoire-history">Ver historial</button>${historyEvents.length ? `<ol class="repertoire-history-list">${historyEvents.map((event) => `<li><time>${event.createdAt || event.created_at}</time> · ${STATE_LABELS[event.newState || event.new_state] || event.source || 'Evento'}</li>`).join('')}</ol>` : ''}${linked ? `<small>Vinculado a ${linked.nombre}</small><button type="button" class="btn btn-sm btn-outline-secondary repertoire-linked-all">Aplicar a todos los vinculados</button><button type="button" class="btn btn-sm btn-link repertoire-unlink">Desvincular este compás</button>` : ''}${activeStudent && pickerOverride ? '<button type="button" class="btn btn-sm btn-link repertoire-clear-override">Usar estado de la fila</button>' : ''}${canEditApplicability ? `<div class="repertoire-picker__applicability"><label for="repertoire-applicability">Aplicabilidad</label><select id="repertoire-applicability" class="form-select repertoire-applicability">${['TOCA', 'SILENCIO', 'TACET', 'NO_APLICA', 'DESCONOCIDO'].map((value) => `<option value="${value}" ${pickerMeasure.aplicabilidad === value ? 'selected' : ''}>${value}</option>`).join('')}</select></div>` : '<small>Aplicabilidad: solo lectura</small>'}</div>` : ''
  const selectedActions = selectionMode && selected.size ? '<button type="button" class="btn btn-sm btn-outline-secondary repertoire-create-passage">Crear pasaje</button><button type="button" class="btn btn-sm btn-outline-secondary repertoire-create-group">Vincular compases</button><button type="button" class="btn btn-sm btn-outline-secondary repertoire-unlink-selected">Desvincular seleccionados</button>' : ''
  const scopeDialog = linkedScope ? `<div class="repertoire-scope-dialog" role="dialog" aria-modal="true" aria-label="Actualizar compases vinculados"><strong>Actualizar:</strong><button type="button" class="btn btn-primary repertoire-linked-scope" data-scope="one">Solo este compás</button><button type="button" class="btn btn-primary repertoire-linked-scope" data-scope="all">Todos los vinculados</button><button type="button" class="btn btn-link repertoire-linked-scope" data-scope="cancel">Cancelar</button></div>` : ''
  const editPassage = action?.startsWith('edit-passage:') ? passages.find((item) => item.id === action.split(':')[1]) : null
  const form = action ? `<form class="repertoire-action-form" data-action="${action}"><h2>${editPassage ? 'Editar pasaje' : action === 'passage' ? 'Crear pasaje' : 'Vincular compases'}</h2>${action === 'group' ? '<input name="name" class="form-control" placeholder="Nombre del grupo" required>' : `<input name="name" class="form-control" placeholder="Nombre" value="${editPassage?.name || ''}" required><textarea name="description" class="form-control" placeholder="Descripción (opcional)">${editPassage?.description || ''}</textarea><textarea name="notes" class="form-control" placeholder="Notas (opcional)">${editPassage?.notes || ''}</textarea><select name="difficulty" class="form-select"><option value="">Dificultad</option>${[1, 2, 3, 4, 5].map((value) => `<option value="${value}" ${editPassage?.difficulty === value ? 'selected' : ''}>${value}</option>`).join('')}</select><input name="focus" class="form-control" placeholder="Focus: RITMO, ARTICULACION" value="${editPassage?.focusTags?.join(', ') || ''}">`}<button class="btn btn-primary" type="submit">Guardar</button><button class="btn btn-link repertoire-cancel-action" type="button">Cancelar</button></form>` : ''
  const activePassages = passages.filter((item) => !item.archived_at)
  const passageList = activePassages.length ? `<section class="repertoire-passages"><h2>Pasajes</h2>${activePassages.map((item) => `<div class="repertoire-passage-row"><button type="button" class="repertoire-passage" data-passage-id="${item.id}">${item.name} · cc. ${item.measureIds.join(', ')}</button><button type="button" class="btn btn-sm btn-link repertoire-edit-passage" data-passage-id="${item.id}">Editar</button><button type="button" class="btn btn-sm btn-link repertoire-archive-passage" data-passage-id="${item.id}">Archivar</button></div>`).join('')}</section>` : ''
  const groupList = groups.length ? `<section class="repertoire-passages"><h2>Grupos vinculados</h2>${groups.map((group) => `<div class="repertoire-passage-row"><span>${group.nombre} · ${group.measureIds.join(', ')}</span><button type="button" class="btn btn-sm btn-link repertoire-rename-group" data-group-id="${group.id}">Renombrar</button><button type="button" class="btn btn-sm btn-link repertoire-break-group" data-group-id="${group.id}">Romper grupo</button></div>`).join('')}</section>` : ''
  return `<section class="repertoire-map" data-repertoire-mode="${html(mode)}" aria-label="Mapa de preparación de ${montaje.obra.titulo}">
    <header class="repertoire-work-header"><button type="button" class="btn btn-link repertoire-back" aria-label="Volver al repertorio">← Repertorio</button><div><span class="repertoire-eyebrow">PORTAL MAESTROS</span><h1>${montaje.obra.titulo}</h1><p>${montaje.obra.compositor || 'Compositor pendiente'}</p></div><span class="repertoire-mode-badge">${html(montaje.estado || 'Asignada')}</span></header>
    <details class="repertoire-work-context"><summary>Contexto de la obra</summary><div class="repertoire-work-context__body"><p>${html(montaje.obra.resena || montaje.obra.descripcion || 'No hay reseña registrada.')}</p><div class="repertoire-context-meta"><span>Estreno: ${html(montaje.evento?.fecha || '—')}</span><span>Versión: ${html(montaje.version?.nombre || '—')}</span></div>${montaje.obra.url_youtube || montaje.obra.youtube_url ? `<a href="${html(montaje.obra.url_youtube || montaje.obra.youtube_url)}" target="_blank" rel="noreferrer">Escuchar referencia</a>` : ''}<button type="button" class="btn btn-outline-secondary repertoire-investigate">✦ Investigar obra</button></div></details>
    ${renderHorizontalFilaTabs({ filas: montaje.filas || [], activeId: activeFilaId, label: 'Filas de la obra' })}
    <div class="repertoire-scope-switch">${renderSegmentedControl({ id: 'repertoire-detail-mode', label: 'Alcance de evaluación', value: detailMode, options: [{ value: 'fila', label: 'Fila' }, { value: 'alumnos', label: 'Alumnos' }] })}</div>
    ${detailMode === 'alumnos' ? `<section class="repertoire-student-selector" aria-label="Selector de alumno"><button type="button" class="btn btn-outline-secondary repertoire-student-prev" ${studentIndex <= 0 ? 'disabled' : ''} aria-label="Alumno anterior">‹ Anterior</button><button type="button" class="btn btn-outline-secondary repertoire-student-picker" aria-label="Seleccionar alumno">${html(studentLabel)}⌄</button><button type="button" class="btn btn-outline-secondary repertoire-student-next" ${studentIndex < 0 || studentIndex >= filaStudents.length - 1 ? 'disabled' : ''} aria-label="Alumno siguiente">Siguiente ›</button>${filaStudents.length ? renderBottomSheet({ id: 'repertoire-student-sheet', title: 'Seleccionar alumno', open: false, body: filaStudents.map((student) => `<button type="button" class="btn btn-sm repertoire-student" data-student-id="${html(student.id)}">${html(student.nombre || student.nombre_completo || student.id)}</button>`).join('') }) : renderEmptyState({ title: 'Sin alumnos asignados', message: 'No hay alumnos asignados a esta fila.' })}</section>` : ''}
    <div class="repertoire-map__toolbar"><button class="btn btn-outline-secondary repertoire-multi" aria-pressed="${selectionMode}">${selectionLabel}</button>${selectedActions}<button class="btn btn-outline-secondary repertoire-trajectory">Trayectoria</button><button class="btn btn-outline-secondary repertoire-priorities">Prioridades</button><label class="repertoire-layout-setting">Compases por línea <select class="form-select repertoire-measures-per-row" aria-label="Compases por línea">${[...new Set([...MEASURES_PER_ROW_OPTIONS, measuresPerRow])].sort((a, b) => a - b).map((value) => `<option value="${value}" ${value === measuresPerRow ? 'selected' : ''}>${value}</option>`).join('')}</select></label><select class="form-select repertoire-bulk" aria-label="Estado para selección múltiple" ${selected.size ? '' : 'disabled'}>${ESTADOS_PREPARACION.map((state) => `<option value="${state}">${STATE_LABELS[state]}</option>`).join('')}</select><button class="btn btn-primary repertoire-apply" ${selected.size ? '' : 'disabled'}>Aplicar estado</button><span class="repertoire-sync ${syncMessage.className}" role="status" aria-live="polite">${syncMessage.label}</span></div>
    ${picker}${scopeDialog}
    ${form}${passageList}${groupList}
    ${trajectoryVisible ? `<section class="repertoire-trajectory-panel" aria-label="Trayectoria de preparación"><h2>Trayectoria</h2>${trajectoryTargets.length ? trajectoryTargets.map((target) => `<article><strong>${target.notas || target.alcance || 'Objetivo'}</strong><div>Estado: ${target.estado_objetivo || '—'} · Umbral: ${target.umbral_porcentaje ?? '—'}% · Fecha: ${target.fecha_objetivo || '—'}</div></article>`).join('') : '<p>No hay objetivos explícitos para este montaje.</p>'}${canEditTargets ? '<form class="repertoire-target-form"><input name="notes" placeholder="Nombre del objetivo" required><select name="targetState"><option value="">Estado</option><option>CON_DIFICULTAD</option><option>DOMINADO</option><option>CONSOLIDADO</option></select><input name="targetDate" type="date" required><input name="thresholdPercent" type="number" min="0" max="100" placeholder="Umbral %"><input name="targetTempo" type="number" min="1" placeholder="Tempo BPM"><button type="submit" class="btn btn-primary">Crear objetivo</button></form>' : ''}</section>` : ''}
    ${priorityVisible ? `<section class="repertoire-trajectory-panel" aria-label="Prioridades de ensayo"><h2>Prioridades de ensayo</h2>${priorityCandidates.length ? priorityCandidates.map((candidate, index) => `<article><strong>${index + 1}. ${candidate.label}</strong><div>${candidate.urgency} · ${(candidate.reasons || []).join(' · ')}</div><small>${candidate.why || ''}</small></article>`).join('') : '<p>No hay prioridades calculadas para este alcance.</p>'}</section>` : ''}
    <div class="repertoire-grid" role="grid" aria-label="Compases de ${html(activeFila.nombre || 'la fila')}" style="--measures-per-row: ${measuresPerRow}">${gridMarkup(montaje, selected, activeStudent, activeStudentId, groups, activePassages, measuresPerRow)}</div>
    ${detailMode === 'fila' ? `<section class="repertoire-fila-summary" aria-label="Resumen de fila"><h2>Fila: ${html(activeFila.nombre || 'Pendiente')}</h2><div class="repertoire-fila-summary__columns"><div><strong>Evaluación colectiva del profesor</strong>${renderStateBadge(montaje.compases?.[0]?.estado_preparacion || 'SIN_EVALUAR')}<small>Solo lectura hasta actualizar el backend de fila.</small></div><div><strong>Evidencia derivada de alumnos</strong>${derivedStates.length ? Object.entries(derivedSummary).map(([state, count]) => `<span>${count} ${STATE_LABELS[state]}</span>`).join(' · ') : '<span>Sin evidencia registrada</span>'}<small>${derivedStates.length ? `Derivado de ${derivedStates.length} alumnos` : 'La evidencia individual permanece independiente.'}</small></div></div></section>` : `<section class="repertoire-student-evidence" aria-label="Evaluación individual"><h2>Evaluación individual · ${html(studentLabel)}</h2>${activeStudent ? renderDerivedPresentation({ collectiveState: activeStudent.estado_preparacion, individualState: activeStudent.overrides?.[montaje.compases?.[0]?.id], label: 'Estado efectivo' }) : renderEmptyState({ title: 'Selecciona un alumno', message: 'No hay alumno seleccionado para esta fila.' })}</section>`}
    <section class="repertoire-students" aria-label="Preparación individual"><h2>Alumnos de ${html(activeFila.nombre || 'la fila')}</h2><p>La evaluación colectiva y la evidencia individual permanecen separadas.</p><div class="repertoire-student-list">${filaStudents.map((student) => `<button type="button" class="btn btn-sm ${student.id === activeStudentId ? 'btn-primary' : 'btn-outline-secondary'} repertoire-student" data-student-id="${html(student.id)}">${html(student.nombre || student.nombre_completo || student.id)}: ${STATE_LABELS[student.estado_preparacion] || 'Sin evaluar'}</button>`).join('') || renderEmptyState({ title: 'Sin alumnos asignados', message: 'No hay alumnos asignados a esta fila.' })}</div></section>
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
  let montajes = []
  let homeLoading = true
  let homeError = null
  try { montajes = await adapter.listMontajes() } catch (error) { homeError = error }
  let active = null
  let obras = []
  try { obras = await adapter.listObras?.() || [] } catch { obras = [] }
  let teachingScopes = []
  try { teachingScopes = await adapter.listTeacherTeachingScopes?.() || [] } catch { teachingScopes = [] }
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
  let detailMode = 'fila'
  let measuresPerRow = readMeasuresPerRow({ montajeId: active?.id || '' })
  let historyEvents = []
  let trajectoryVisible = false
  let trajectoryTargets = []
  let priorityVisible = false
  let priorityCandidates = []
  const canEditApplicability = adapter.canEditApplicability === true
  const canCreate = typeof adapter.createObra === 'function' || typeof adapter.createPedagogicalWork === 'function'
  const savedLabel = adapter.mode === 'real' ? 'Guardado en Supabase' : 'Guardado local (Demo)'
  const setActiveFila = (filaId) => {
    if (!active) return
    active.canonicalCompases ||= active.compases
    active.activeFilaId = filaId || active.filas?.[0]?.id || null
    const fila = active.filas?.find((item) => item.id === active.activeFilaId)
    if (!fila?.compases?.length) { active.compases = active.canonicalCompases; return }
    const states = new Map(fila.compases.map((item) => [item.montaje_compas_id, item]))
    active.compases = active.canonicalCompases.map((measure) => {
      const filaState = states.get(measure.id)
      return filaState ? { ...measure, estado_preparacion: filaState.estado_colectivo || 'SIN_EVALUAR', aplicabilidad: filaState.aplicabilidad || measure.aplicabilidad } : measure
    })
  }

  let unbindHomeOverlay = () => {}
  const render = () => {
    unbindHomeOverlay()
    unbindHomeOverlay = () => {}
    container.innerHTML = active ? mapMarkup(active, selected, selectionMode, pickerMeasure, canEditApplicability, syncMessage, activeStudentId, passages, groups, action, linkedScope, measuresPerRow, historyEvents, trajectoryVisible, trajectoryTargets, adapter.canEditTargets === true, priorityVisible, priorityCandidates, adapter.mode, detailMode) : repertoireHomeMarkup({ montajes, obras, teachingScopes, canCreate, activeTab: homeTab, search: homeSearch, filters: homeFilters, filterOptions: homeFilterOptions, loading: homeLoading, error: homeTab === 'official' ? homeError : null, action: homeAction })
    if (active) bindMap()
    else bindHome()
  }

  let homeTab = obras.length ? 'mine' : montajes.length ? 'official' : 'mine'
  let homeSearch = ''
  const homeFilters = { status: '', open: false }
  let homeMenuId = null
  let homeAction = null
  const homeFilterOptions = { statuses: [...new Set(montajes.map((item) => item.estado).filter(Boolean))] }
  homeLoading = false
  const bindHome = () => {
    const openMontaje = (id) => { const item = montajes.find((entry) => entry.id === id) || obras.find((entry) => (entry.montaje_id || entry.montage_id) === id); if (!item) return; active = item.montaje || item; setActiveFila(active.filas?.[0]?.id); measuresPerRow = readMeasuresPerRow({ montajeId: active.id, versionId: active.version?.id || active.version?.nombre || '', filaId: active.filas?.[0]?.id || '' }); activeStudentId = null; render() }
    container.querySelectorAll('.pm-segment').forEach((button) => button.addEventListener('click', () => { homeTab = button.dataset.value; render() }))
    container.querySelector('.repertoire-search-input')?.addEventListener('change', (event) => { homeSearch = event.target.value; render() })
    container.querySelector('.repertoire-open-filters')?.addEventListener('click', () => { homeFilters.open = true; render() })
    container.querySelector('.repertoire-apply-filters')?.addEventListener('click', () => { homeFilters.status = container.querySelector('.repertoire-filter-status')?.value || ''; homeFilters.open = false; render() })
    container.querySelectorAll('[data-sheet-close="repertoire-filters"]').forEach((button) => button.addEventListener('click', () => { homeFilters.open = false; render() }))
    container.querySelector('.repertoire-retry')?.addEventListener('click', async () => { homeLoading = true; homeError = null; render(); try { montajes = await adapter.listMontajes(); homeFilterOptions.statuses = [...new Set(montajes.map((item) => item.estado).filter(Boolean))] } catch (error) { homeError = error } finally { homeLoading = false; render() } })
    container.querySelectorAll('.repertoire-card-menu, .repertoire-work-menu').forEach((button) => button.addEventListener('click', (event) => { event.stopPropagation(); homeMenuId = button.dataset.montajeId || button.dataset.workId || button.closest('[data-montaje-id]')?.dataset.montajeId || null; const menu = container.querySelector('#repertoire-card-menu'); if (menu) { menu.hidden = false; menu.style.insetInlineEnd = '1rem'; menu.style.insetBlockStart = `${event.clientY || 80}px` } }))
    container.querySelectorAll('.repertoire-card[data-montaje-id]').forEach((card) => {
      const navigate = (event) => { if (event.target.closest('button')) return; openMontaje(card.dataset.montajeId) }
      card.addEventListener('click', navigate)
      card.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); navigate(event) } })
    })
    container.querySelectorAll('.repertoire-new-work').forEach((button) => button.addEventListener('click', () => { if (!canCreate) return; homeAction = 'new-work'; render() }))
    container.querySelector('.repertoire-cancel-home')?.addEventListener('click', () => { homeAction = null; render() })
    container.querySelector('.repertoire-work-form')?.addEventListener('submit', async (event) => {
      event.preventDefault()
      const form = new FormData(event.currentTarget)
      const scopeIds = form.getAll('scope')
      if (typeof adapter.createPedagogicalWork === 'function') await adapter.createPedagogicalWork({ title: String(form.get('title') || '').trim(), composer: String(form.get('composer') || '').trim(), arranger: String(form.get('arranger') || '').trim(), version: String(form.get('version') || '').trim(), measures: Number(form.get('measures')), notes: String(form.get('description') || '').trim(), scopeIds, scopes: teachingScopes.filter((scope) => scopeIds.includes(scope.id)) })
      else { const obra = await adapter.createObra({ titulo: String(form.get('title') || '').trim(), compositor: String(form.get('composer') || '').trim() || null, arreglista: String(form.get('arranger') || '').trim() || null, resena: String(form.get('description') || '').trim() || null }); if (String(form.get('version') || '').trim()) await adapter.createVersion({ obra_id: obra.id, nombre: String(form.get('version')).trim(), numero_compases: form.get('measures') ? Number(form.get('measures')) : null }) }
      obras = await adapter.listObras?.() || obras
      montajes = await adapter.listMontajes?.() || montajes
      homeAction = null
      render()
    })
    unbindHomeOverlay = bindRepertoireOverlay(container, { onAction: (actionId) => { if (actionId === 'edit') container.dispatchEvent(new CustomEvent('repertoire:edit-work-requested', { detail: { id: homeMenuId }, bubbles: true })) }, onClose: () => { homeMenuId = null } })
  }

  const bindMap = () => {
    container.querySelectorAll('.repertoire-fila-tab, .pm-fila-tab').forEach((button) => button.addEventListener('click', () => { setActiveFila(button.dataset.filaId); activeStudentId = null; pickerMeasure = null; render() }))
    container.querySelectorAll('#repertoire-detail-mode .pm-segment').forEach((button) => button.addEventListener('click', () => { detailMode = button.dataset.value; if (detailMode === 'alumnos') activeStudentId ||= filaStudentsForActive()[0]?.id || null; pickerMeasure = null; render() }))
    container.querySelector('.repertoire-investigate')?.addEventListener('click', () => { syncMessage = { label: 'Investigación asistida no disponible en esta vista', className: 'is-saved' }; render() })
    container.querySelector('.repertoire-student-picker')?.addEventListener('click', () => { const sheet = container.querySelector('#repertoire-student-sheet'); if (sheet) { sheet.hidden = false; sheet.classList.add('is-open') } })
    container.querySelector('.repertoire-student-prev')?.addEventListener('click', () => { const students = filaStudentsForActive(); const index = students.findIndex((student) => student.id === activeStudentId); if (index > 0) { activeStudentId = students[index - 1].id; render() } })
    container.querySelector('.repertoire-student-next')?.addEventListener('click', () => { const students = filaStudentsForActive(); const index = students.findIndex((student) => student.id === activeStudentId); if (index >= 0 && index < students.length - 1) { activeStudentId = students[index + 1].id; render() } })
    container.querySelector('.repertoire-trajectory')?.addEventListener('click', async () => { trajectoryTargets = await adapter.listTargets?.(active.id) || []; trajectoryVisible = true; render() })
    container.querySelector('.repertoire-priorities')?.addEventListener('click', async () => { priorityCandidates = await adapter.listPriorityCandidates?.(active.id) || []; priorityVisible = true; render() })
    container.querySelector('.repertoire-target-form')?.addEventListener('submit', async (event) => { event.preventDefault(); const form = new FormData(event.currentTarget); await adapter.createTarget?.({ montaje_id: active.id, alcance: 'montage', estado_objetivo: form.get('targetState') || null, fecha_objetivo: form.get('targetDate'), umbral_porcentaje: form.get('thresholdPercent') ? Number(form.get('thresholdPercent')) : null, tempo_objetivo: form.get('targetTempo') ? Number(form.get('targetTempo')) : null, notas: form.get('notes'), created_by: adapter.currentMaestroId || null }); trajectoryTargets = await adapter.listTargets?.(active.id) || []; render() })
    container.querySelector('.repertoire-measures-per-row')?.addEventListener('change', (event) => { measuresPerRow = writeMeasuresPerRow({ montajeId: active.id, versionId: active.version?.id || active.version?.nombre || '', filaId: active.activeFilaId || active.filas?.[0]?.id || '' }, event.target.value); render() })
    container.querySelectorAll('.repertoire-student').forEach((button) => button.addEventListener('click', () => { activeStudentId = button.dataset.studentId || null; pickerMeasure = null; render() }))
    container.querySelector('.repertoire-create-passage')?.addEventListener('click', () => { action = 'passage'; render() })
    container.querySelector('.repertoire-create-group')?.addEventListener('click', () => { action = 'group'; render() })
    container.querySelector('.repertoire-unlink-selected')?.addEventListener('click', async () => { for (const group of groups) { const ids = [...selected].filter((id) => group.measureIds.includes(id)); if (ids.length) { await adapter.removeLinkedMeasures(group.id, ids); group.measureIds = group.measureIds.filter((id) => !ids.includes(id)) } } selected = new Set(); selectionMode = false; render() })
    container.querySelector('.repertoire-cancel-action')?.addEventListener('click', () => { action = null; render() })
    container.querySelectorAll('.repertoire-edit-passage').forEach((button) => button.addEventListener('click', () => { action = `edit-passage:${button.dataset.passageId}`; render() }))
    container.querySelectorAll('.repertoire-archive-passage').forEach((button) => button.addEventListener('click', async () => { if (!confirm('¿Archivar pasaje?')) return; syncMessage = { label: 'Guardando…', className: 'is-pending' }; render(); try { await adapter.archivePassage(button.dataset.passageId); passages.find((item) => item.id === button.dataset.passageId).archived_at = new Date().toISOString(); syncMessage = { label: savedLabel, className: 'is-saved' } } catch { syncMessage = { label: 'No se pudo archivar', className: 'is-error' } } render() }))
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
        selected = new Set(); selectionMode = false; action = null; syncMessage = { label: savedLabel, className: 'is-saved' }
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
      if (!pickerMeasure || !canEditApplicability) return
      const previous = pickerMeasure.aplicabilidad
      pickerMeasure.aplicabilidad = event.target.value
      syncMessage = { label: 'Guardando…', className: 'is-pending' }
      render()
      try { if (adapter.mode === 'real' && !(adapter.supportsFilaPreparation && active.activeFilaId)) throw new Error('Actualización de backend requerida'); await adapter.updateMeasureApplicability(pickerMeasure.id, pickerMeasure.aplicabilidad, { montageId: active.id, filaId: active.activeFilaId }); syncMessage = { label: savedLabel, className: 'is-saved' }; pickerMeasure = null } catch (error) { pickerMeasure.aplicabilidad = previous; syncMessage = { label: error.message === 'Actualización de backend requerida' ? error.message : 'No se pudo guardar; se revirtió', className: 'is-error' } }
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
      try { if (adapter.mode === 'real' && !(adapter.supportsFilaPreparation && active.activeFilaId)) throw new Error('Actualización de backend requerida'); await Promise.all([...previous.keys()].map((id) => adapter.supportsFilaPreparation && adapter.updateRowPreparation ? adapter.updateRowPreparation(id, state, { montageId: active.id, filaId: active.activeFilaId }) : adapter.updateMeasureState(id, state))); syncMessage = { label: savedLabel, className: 'is-saved' } } catch (error) { previous.forEach((value, id) => { active.compases.find((item) => item.id === id).estado_preparacion = value }); syncMessage = { label: error.message === 'Actualización de backend requerida' ? error.message : 'No se pudo guardar; se revirtió', className: 'is-error' }; render(); return }
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
      else if (adapter.supportsFilaPreparation && adapter.updateRowPreparation && active.activeFilaId) await adapter.updateRowPreparation(measure.id, state, { montageId: active.id, filaId: active.activeFilaId })
      else if (adapter.mode === 'real') throw new Error('Actualización de backend requerida')
      else await adapter.updateMeasureState(measure.id, state)
      syncMessage = { label: savedLabel, className: 'is-saved' }
    } catch (error) {
      if (student) { if (previous === null) delete student.overrides[measure.id]; else student.overrides[measure.id] = previous }
      else measure.estado_preparacion = previous
      syncMessage = { label: error.message === 'Actualización de backend requerida' ? error.message : 'No se pudo guardar; se revirtió', className: 'is-error' }
    }
    render()
  }

  async function updateLinked(measure, state = measure.estado_preparacion) {
    const group = groups.find((item) => item.measureIds?.includes(measure.id))
    if (!group) return
    const previous = new Map(group.measureIds.map((id) => [id, active.compases.find((item) => item.id === id).estado_preparacion]))
    group.measureIds.forEach((id) => { active.compases.find((item) => item.id === id).estado_preparacion = state })
    syncMessage = { label: 'Guardando…', className: 'is-pending' }; pickerMeasure = null; render()
    try {
      if (adapter.supportsFilaPreparation && adapter.updateRowPreparation && active.activeFilaId) await Promise.all(group.measureIds.map((id) => adapter.updateRowPreparation(id, state, { montageId: active.id, filaId: active.activeFilaId })))
      else if (adapter.mode === 'real') throw new Error('Actualización de backend requerida')
      else await adapter.updateLinkedGroupState(group.id, state)
      syncMessage = { label: savedLabel, className: 'is-saved' }
    } catch (error) { previous.forEach((value, id) => { active.compases.find((item) => item.id === id).estado_preparacion = value }); syncMessage = { label: error.message === 'Actualización de backend requerida' ? error.message : 'No se pudo guardar; se revirtió', className: 'is-error' } }
    render()
  }

  function filaStudentsForActive() {
    const filaId = active?.activeFilaId || active?.filas?.[0]?.id
    return (active?.alumnos || []).filter((student) => !student.montaje_fila_id || student.montaje_fila_id === filaId)
  }

  render()
  return { mode: adapter.mode, maestroId: getMaestroLocal()?.id || null }
}

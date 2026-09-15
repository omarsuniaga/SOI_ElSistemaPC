/**
 * Repertoire UI primitives.
 *
 * These helpers deliberately render semantic HTML instead of owning domain
 * state. Views provide ids, labels and callbacks; the existing adapter and
 * domain modules remain the source of truth.
 */

const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[char]))

const token = (value) => escapeHtml(String(value ?? '').replace(/[^a-zA-Z0-9_-]/g, '-'))

export function renderSegmentedControl({ id, label, options = [], value, className = '' } = {}) {
  const controlId = token(id || 'repertoire-segmented-control')
  return `<div class="pm-repertoire-segmented ${escapeHtml(className)}" id="${controlId}" role="group" aria-label="${escapeHtml(label || '')}">${options.map((option) => `<button type="button" class="pm-segment ${option.value === value ? 'is-active' : ''}" data-value="${token(option.value)}" aria-pressed="${option.value === value}">${escapeHtml(option.label)}</button>`).join('')}</div>`
}

export function renderHorizontalFilaTabs({ filas = [], activeId, label = 'Filas' } = {}) {
  return `<div class="pm-fila-tabs" role="tablist" aria-label="${escapeHtml(label)}">${filas.map((fila) => {
    const active = String(fila.id) === String(activeId)
    return `<button type="button" class="pm-fila-tab ${active ? 'is-active' : ''}" role="tab" aria-selected="${active}" tabindex="${active ? '0' : '-1'}" data-fila-id="${token(fila.id)}">${escapeHtml(fila.name || fila.nombre || fila.id)}</button>`
  }).join('')}</div>`
}

export function renderBottomSheet({ id, title, body = '', actions = '', open = false, labelledBy, className = '' } = {}) {
  const sheetId = token(id || 'repertoire-bottom-sheet')
  const titleId = token(labelledBy || `${sheetId}-title`)
  return `<section class="pm-sheet ${escapeHtml(className)} ${open ? 'is-open' : ''}" id="${sheetId}" role="dialog" aria-modal="true" aria-labelledby="${titleId}" ${open ? '' : 'hidden'}><div class="pm-sheet__scrim" data-sheet-close="${sheetId}" aria-hidden="true"></div><div class="pm-sheet__panel" tabindex="-1"><div class="pm-sheet__handle" aria-hidden="true"></div><header class="pm-sheet__header"><h2 id="${titleId}">${escapeHtml(title)}</h2><button type="button" class="pm-icon-button" data-sheet-close="${sheetId}" aria-label="Cerrar">×</button></header><div class="pm-sheet__body">${body}</div>${actions ? `<footer class="pm-sheet__actions">${actions}</footer>` : ''}</div></section>`
}

export function renderResponsiveDrawer(props = {}) {
  return renderBottomSheet({ ...props, className: `${props.className || ''} pm-responsive-drawer` })
}

export function renderActionSheet({ selectedCount = 0, actions = [], ...props } = {}) {
  const actionMarkup = actions.map((action) => `<button type="button" class="pm-sheet-action ${action.danger ? 'is-danger' : ''}" data-action="${token(action.id)}" ${action.disabled ? 'disabled' : ''}>${escapeHtml(action.label)}</button>`).join('')
  return renderBottomSheet({ ...props, title: props.title || `${selectedCount} compases seleccionados`, body: props.body || '', actions: actionMarkup })
}

export function renderConfirmDialog({ id, title, message, confirmLabel = 'Confirmar', cancelLabel = 'Cancelar', danger = false } = {}) {
  const dialogId = token(id || 'repertoire-confirm-dialog')
  return `<div class="pm-dialog" id="${dialogId}" role="alertdialog" aria-modal="true" aria-labelledby="${dialogId}-title" aria-describedby="${dialogId}-message" hidden><div class="pm-dialog__scrim" data-dialog-close="${dialogId}"></div><div class="pm-dialog__panel" tabindex="-1"><h2 id="${dialogId}-title">${escapeHtml(title)}</h2><p id="${dialogId}-message">${escapeHtml(message)}</p><div class="pm-dialog__actions"><button type="button" class="pm-button pm-button--secondary" data-dialog-close="${dialogId}">${escapeHtml(cancelLabel)}</button><button type="button" class="pm-button ${danger ? 'pm-button--danger' : 'pm-button--primary'}" data-dialog-confirm="${dialogId}">${escapeHtml(confirmLabel)}</button></div></div></div>`
}

export function renderContextMenu({ id, items = [] } = {}) {
  const menuId = token(id || 'repertoire-context-menu')
  return `<div class="pm-context-menu" id="${menuId}" role="menu" hidden>${items.map((item) => `<button type="button" role="menuitem" data-context-action="${token(item.id)}" class="pm-context-menu__item ${item.danger ? 'is-danger' : ''}" ${item.disabled ? 'disabled' : ''}>${escapeHtml(item.label)}</button>`).join('')}</div>`
}

export function renderMeasureCell({ measure, state, applicability = 'TOCA', selected = false, linked = false, derived = false } = {}) {
  const number = measure?.numero_visible ?? measure?.number ?? measure?.id
  const label = applicability === 'TOCA' ? `Compás ${number} — ${state || 'Sin evaluar'}` : `Compás ${number} — ${applicability}`
  return `<button type="button" class="pm-measure-cell state-${token(state || 'SIN_EVALUAR').toLowerCase()} ${applicability !== 'TOCA' ? 'is-not-applicable' : ''} ${selected ? 'is-selected' : ''} ${linked ? 'is-linked' : ''} ${derived ? 'is-derived' : ''}" data-measure-id="${token(measure?.id ?? number)}" role="gridcell" aria-label="${escapeHtml(label)}" aria-pressed="${selected}"><span class="pm-measure-cell__number">${escapeHtml(number)}</span>${linked ? '<span class="pm-measure-cell__link" aria-hidden="true">↗</span>' : ''}</button>`
}

export function renderMeasureGridShell({ measures = [], measuresPerRow = 8, label = 'Compases', renderCell = renderMeasureCell } = {}) {
  const rows = []
  for (let index = 0; index < measures.length; index += measuresPerRow) {
    rows.push(`<div class="pm-measure-grid__row" role="row">${measures.slice(index, index + measuresPerRow).map(renderCell).join('')}</div>`)
  }
  return `<section class="pm-measure-grid-shell" aria-label="${escapeHtml(label)}"><div class="pm-measure-grid" role="grid" style="--measures-per-row:${Math.max(1, Number(measuresPerRow) || 1)}">${rows.join('')}</div></section>`
}

export function renderStateBadge(state, { derived = false } = {}) {
  return `<span class="pm-status-badge pm-status-badge--${token(state || 'SIN_EVALUAR').toLowerCase()} ${derived ? 'is-derived' : ''}">${escapeHtml(state || 'SIN_EVALUAR')}${derived ? ' · derivado' : ''}</span>`
}

export function renderApplicabilityBadge(applicability = 'TOCA') {
  return `<span class="pm-applicability-badge pm-applicability-badge--${token(applicability).toLowerCase()}">${escapeHtml(applicability)}</span>`
}

export function renderDerivedPresentation({ collectiveState, individualState, label = 'Estado efectivo' } = {}) {
  const effective = individualState || collectiveState || 'SIN_EVALUAR'
  return `<div class="pm-derived-presentation"><span class="pm-derived-presentation__label">${escapeHtml(label)}</span>${renderStateBadge(effective, { derived: Boolean(individualState || collectiveState) })}${individualState ? `<small>Override individual · fila: ${escapeHtml(collectiveState || 'SIN_EVALUAR')}</small>` : '<small>Estado colectivo de la fila</small>'}</div>`
}

export function renderSaveStatus(status = 'idle') {
  const labels = { idle: 'Sin cambios', saving: 'Guardando…', saved: 'Guardado', offline: 'Sin conexión', pending: 'Pendiente de sincronizar', 'pending-sync': 'Pendiente de sincronizar', error: 'No se pudo guardar' }
  return `<span class="pm-save-status pm-save-status--${token(status)}" role="status" aria-live="polite">${labels[status] || escapeHtml(status)}</span>`
}

export function renderEmptyState({ title = 'Sin datos', message = '', action = '' } = {}) {
  return `<div class="pm-empty-state" role="status"><div class="pm-empty-state__icon" aria-hidden="true">♪</div><h2>${escapeHtml(title)}</h2>${message ? `<p>${escapeHtml(message)}</p>` : ''}${action}</div>`
}

export function renderSkeleton({ lines = 3, className = '' } = {}) {
  return `<div class="pm-skeleton-card ${escapeHtml(className)}" aria-hidden="true">${Array.from({ length: lines }, (_, index) => `<span class="pm-skeleton-line ${index === 0 ? 'is-title' : ''}"></span>`).join('')}</div>`
}

export function bindRepertoireOverlay(root, { onConfirm, onAction, onClose } = {}) {
  if (!root) return () => {}
  const close = (id) => { const element = root.querySelector(`#${CSS.escape(id)}`); if (element) { element.hidden = true; element.classList.remove('is-open') } onClose?.(id) }
  const handleClick = (event) => {
    const target = event.target.closest('[data-dialog-close], [data-sheet-close], [data-dialog-confirm], [data-context-action], [data-action]')
    if (!target) return
    if (target.dataset.dialogClose || target.dataset.sheetClose) close(target.dataset.dialogClose || target.dataset.sheetClose)
    if (target.dataset.dialogConfirm) onConfirm?.(target.dataset.dialogConfirm)
    if (target.dataset.contextAction || target.dataset.action) onAction?.(target.dataset.contextAction || target.dataset.action, target)
  }
  root.addEventListener('click', handleClick)
  return () => root.removeEventListener('click', handleClick)
}

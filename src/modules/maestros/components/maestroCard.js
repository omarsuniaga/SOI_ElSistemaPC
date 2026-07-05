import { escapeHTML, getInitials, formatDate, getStatusLabel, getStatusColor, formatInstrumento } from '../utils/maestrosUtils.js'

export function createMaestroCard(maestro, showActions = true, onEdit = null, onDelete = null) {
  const card = document.createElement('div')
  card.className = 'card h-100 shadow-sm'
  card.innerHTML = `
    <div class="card-body">
      <div class="d-flex justify-content-between align-items-start mb-2">
        <div class="d-flex gap-2 align-items-start flex-grow-1">
          <div class="avatar bg-body-secondary rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style="width: 40px; height: 40px;">
            <strong class="small">${getInitials(maestro.nombre)}</strong>
          </div>
          <div class="flex-grow-1">
            <h6 class="card-title mb-1" title="${escapeHTML(maestro.nombre)}">
              ${escapeHTML(maestro.nombre)}
            </h6>
            ${maestro.instrumento ? `<small class="text-muted d-block"><i class="bi bi-music-note"></i> ${formatInstrumento(maestro.instrumento)}</small>` : ''}
          </div>
        </div>
        <span class="badge bg-${getStatusColor(maestro.is_active)} flex-shrink-0">${getStatusLabel(maestro.is_active)}</span>
      </div>

      <hr class="my-2">

      <div class="small text-muted">
        ${maestro.email ? `<div class="mb-1"><i class="bi bi-envelope"></i> ${escapeHTML(maestro.email)}</div>` : ''}
        ${maestro.telefono ? `<div class="mb-1"><i class="bi bi-telephone"></i> ${escapeHTML(maestro.telefono)}</div>` : ''}
        ${maestro.especialidad ? `<div class="mb-1"><i class="bi bi-star"></i> ${escapeHTML(maestro.especialidad)}</div>` : ''}
      </div>

      <hr class="my-2">

      <div class="d-flex justify-content-between align-items-center">
        <small class="text-muted">
          <i class="bi bi-clock"></i> ${formatDate(maestro.created_at)}
        </small>
        ${showActions ? `
          <div class="btn-group btn-group-sm">
            ${onEdit ? `<button class="btn btn-outline-primary edit-btn" data-id="${maestro.id}" title="Editar"><i class="bi bi-pencil"></i></button>` : ''}
            ${onDelete ? `<button class="btn btn-outline-danger delete-btn" data-id="${maestro.id}" title="Eliminar"><i class="bi bi-trash"></i></button>` : ''}
          </div>
        ` : ''}
      </div>
    </div>
  `

  if (showActions && onEdit) {
    const editBtn = card.querySelector('.edit-btn')
    if (editBtn) {
      editBtn.addEventListener('click', () => onEdit(maestro.id))
    }
  }

  if (showActions && onDelete) {
    const deleteBtn = card.querySelector('.delete-btn')
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => onDelete(maestro.id))
    }
  }

  return card
}

export function createMaestroListItem(maestro) {
  const li = document.createElement('li')
  li.className = 'list-group-item'
  li.innerHTML = `
    <div class="d-flex justify-content-between align-items-start">
      <div>
        <h6 class="mb-1">${escapeHTML(maestro.nombre)}</h6>
        <p class="mb-1 small text-muted">
          ${maestro.instrumento ? `<span class="badge bg-body-tertiary text-body me-2 border">${formatInstrumento(maestro.instrumento)}</span>` : ''}
          ${maestro.especialidad ? `<span class="badge bg-body-tertiary text-body border">${escapeHTML(maestro.especialidad)}</span>` : ''}
        </p>
        ${maestro.email ? `<small class="text-muted"><a href="mailto:${escapeHTML(maestro.email)}">${escapeHTML(maestro.email)}</a></small>` : ''}
      </div>
      <span class="badge bg-${getStatusColor(maestro.is_active)}">${getStatusLabel(maestro.is_active)}</span>
    </div>
  `

  return li
}

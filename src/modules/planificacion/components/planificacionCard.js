import { escapeHTML, getInitials, formatDate, formatEstado, getEstadoBadgeClass, getEstadoIcon, parseRecursos, formatRecursosString } from '../utils/planificacionUtils.js'

export function createPlanificacionCard(plan, showActions = true, onEdit = null, onDelete = null, onEjecutar = null, onRevisar = null) {
  const card = document.createElement('div')
  card.className = 'card h-100 shadow-sm'
  card.innerHTML = `
    <div class="card-body">
      <div class="d-flex justify-content-between align-items-start mb-2">
        <div class="d-flex gap-2 align-items-start flex-grow-1">
          <div class="avatar bg-body-secondary rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style="width: 40px; height: 40px;">
            <strong class="small">${getInitials(plan.tema)}</strong>
          </div>
          <div class="flex-grow-1">
            <h6 class="card-title mb-1" title="${escapeHTML(plan.tema)}">
              ${escapeHTML(plan.tema)}
            </h6>
            ${plan.fecha_inicio ? `<small class="text-muted d-block"><i class="bi bi-calendar3"></i> ${formatDate(plan.fecha_inicio)}</small>` : ''}
          </div>
        </div>
        <span class="badge ${getEstadoBadgeClass(plan.estado)} flex-shrink-0">
          <i class="bi ${getEstadoIcon(plan.estado)}"></i> ${formatEstado(plan.estado)}
        </span>
      </div>

      ${plan.objetivos ? `<p class="card-text small text-muted mb-2">${escapeHTML(plan.objetivos.substring(0, 100))}${plan.objetivos.length > 100 ? '...' : ''}</p>` : ''}

      ${plan.clase_id ? `<div class="mb-2"><small class="text-muted"><i class="bi bi-collection"></i> Clase: ${escapeHTML(plan.clase_id)}</small></div>` : ''}

      ${plan.maestro_id ? `<div class="mb-2"><small class="text-muted"><i class="bi bi-person"></i> Maestro: ${escapeHTML(plan.maestro_id)}</small></div>` : ''}

      ${plan.recursos && plan.recursos.length > 0 ? `
        <div class="mb-2">
          <small class="text-muted"><i class="bi bi-folder2"></i> ${escapeHTML(formatRecursosString(plan.recursos).substring(0, 60))}${formatRecursosString(plan.recursos).length > 60 ? '...' : ''}</small>
        </div>
      ` : ''}

      <hr class="my-2">

      <div class="d-flex justify-content-between align-items-center">
        <small class="text-muted">
          <i class="bi bi-clock"></i> ${formatDate(plan.created_at)}
        </small>
        ${showActions ? `
          <div class="btn-group btn-group-sm">
            ${onEjecutar && plan.estado === 'planificado' ? `<button class="btn btn-outline-success ejecutar-btn" data-id="${plan.id}" title="Marcar ejecutada"><i class="bi bi-check-lg"></i></button>` : ''}
            ${onRevisar && plan.estado === 'ejecutado' ? `<button class="btn btn-outline-info revisar-btn" data-id="${plan.id}" title="Marcar revisada"><i class="bi bi-eye"></i></button>` : ''}
            ${onEdit ? `<button class="btn btn-outline-primary edit-btn" data-id="${plan.id}" title="Editar"><i class="bi bi-pencil"></i></button>` : ''}
            ${onDelete ? `<button class="btn btn-outline-danger delete-btn" data-id="${plan.id}" title="Eliminar"><i class="bi bi-trash"></i></button>` : ''}
          </div>
        ` : ''}
      </div>
    </div>
  `

  if (showActions) {
    if (onEdit) {
      const editBtn = card.querySelector('.edit-btn')
      if (editBtn) editBtn.addEventListener('click', () => onEdit(plan.id))
    }

    if (onDelete) {
      const deleteBtn = card.querySelector('.delete-btn')
      if (deleteBtn) deleteBtn.addEventListener('click', () => onDelete(plan.id))
    }

    if (onEjecutar) {
      const ejecutarBtn = card.querySelector('.ejecutar-btn')
      if (ejecutarBtn) ejecutarBtn.addEventListener('click', () => onEjecutar(plan.id))
    }

    if (onRevisar) {
      const revisarBtn = card.querySelector('.revisar-btn')
      if (revisarBtn) revisarBtn.addEventListener('click', () => onRevisar(plan.id))
    }
  }

  return card
}

export function createPlanificacionListItem(plan) {
  const li = document.createElement('li')
  li.className = 'list-group-item'
  li.innerHTML = `
    <div class="d-flex justify-content-between align-items-start">
      <div>
        <h6 class="mb-1">${escapeHTML(plan.tema)}</h6>
        <p class="mb-1 small text-muted">
          <span class="badge ${getEstadoBadgeClass(plan.estado)} me-1">
            <i class="bi ${getEstadoIcon(plan.estado)}"></i> ${formatEstado(plan.estado)}
          </span>
          ${plan.fecha_inicio ? `<span class="text-muted"><i class="bi bi-calendar3"></i> ${formatDate(plan.fecha_inicio)}</span>` : ''}
        </p>
        ${plan.objetivos ? `<small class="text-muted">${escapeHTML(plan.objetivos.substring(0, 80))}${plan.objetivos.length > 80 ? '...' : ''}</small>` : ''}
      </div>
    </div>
  `

  return li
}

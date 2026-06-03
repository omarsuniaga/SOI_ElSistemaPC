import {
  escapeHTML,
  getInitials,
  formatDate,
  getTipoLabel,
  getTipoIcon,
  getTipoBadgeClass,
  getPrioridadColor,
  getPrioridadIcon,
  getPrioridadLabel,
  getEstadoClass,
  getEstadoLabel,
} from '../utils/observacionesUtils.js'

export function createObservacionCard(obs, showActions = true, onEdit = null, onDelete = null) {
  const card = document.createElement('div')
  card.className = 'card h-100 shadow-sm'
  card.innerHTML = `
    <div class="card-body">
      <div class="d-flex justify-content-between align-items-start mb-2">
        <div class="d-flex gap-2 align-items-start flex-grow-1">
          <div class="avatar bg-body-secondary rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style="width: 40px; height: 40px;">
            <strong class="small">${getInitials(obs.titulo)}</strong>
          </div>
          <div class="flex-grow-1">
            <h6 class="card-title mb-1" title="${escapeHTML(obs.titulo)}">
              ${escapeHTML(obs.titulo)}
            </h6>
            <small class="text-muted d-block"><i class="bi ${getTipoIcon(obs.tipo)}"></i> ${getTipoLabel(obs.tipo)}</small>
          </div>
        </div>
        <span class="badge ${getEstadoClass(obs.estado)} flex-shrink-0">${getEstadoLabel(obs.estado)}</span>
      </div>

      <hr class="my-2">

      <div class="small text-muted">
        <div class="mb-1"><i class="bi bi-person"></i> ${escapeHTML(obs.nombre_alumno || 'Alumno no asignado')}</div>
        <div class="mb-1"><span class="badge bg-${getPrioridadColor(obs.prioridad)}"><i class="bi ${getPrioridadIcon(obs.prioridad)}"></i> ${getPrioridadColor(obs.prioridad) === 'danger' ? 'Alta' : getPrioridadColor(obs.prioridad) === 'warning' ? 'Media' : 'Baja'}</span></div>
        <div class="mb-1 text-truncate" style="max-width: 250px;" title="${escapeHTML(obs.descripcion)}">${escapeHTML(obs.descripcion)}</div>
      </div>

      <hr class="my-2">

      <div class="d-flex justify-content-between align-items-center">
        <small class="text-muted">
          <i class="bi bi-clock"></i> ${formatDate(obs.fecha_observacion || obs.created_at)}
        </small>
        ${
          showActions
            ? `
          <div class="btn-group btn-group-sm">
            ${onEdit ? `<button class="btn btn-outline-primary edit-btn" data-id="${obs.id}" title="Editar"><i class="bi bi-pencil"></i></button>` : ''}
            ${onDelete ? `<button class="btn btn-outline-danger delete-btn" data-id="${obs.id}" title="Eliminar"><i class="bi bi-trash"></i></button>` : ''}
          </div>
        `
            : ''
        }
      </div>
    </div>
  `

  if (showActions && onEdit) {
    const editBtn = card.querySelector('.edit-btn')
    if (editBtn) {
      editBtn.addEventListener('click', () => onEdit(obs.id))
    }
  }

  if (showActions && onDelete) {
    const deleteBtn = card.querySelector('.delete-btn')
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => onDelete(obs.id))
    }
  }

  return card
}

export function createObservacionListItem(obs) {
  const li = document.createElement('li')
  li.className = 'list-group-item'
  li.innerHTML = `
    <div class="d-flex justify-content-between align-items-start">
      <div>
        <h6 class="mb-1">${escapeHTML(obs.titulo)}</h6>
        <p class="mb-1 small text-muted">
          <span class="badge ${getTipoBadgeClass(obs.tipo)} me-2"><i class="bi ${getTipoIcon(obs.tipo)}"></i> ${getTipoLabel(obs.tipo)}</span>
          <span class="badge bg-${getPrioridadColor(obs.prioridad)}">${getPrioridadLabel(obs.prioridad)}</span>
          <span class="ms-2"><i class="bi bi-person"></i> ${escapeHTML(obs.nombre_alumno || '-')}</span>
        </p>
        <small class="text-muted">${formatDate(obs.fecha_observacion || obs.created_at)}</small>
      </div>
      <span class="badge ${getEstadoClass(obs.estado)}">${getEstadoLabel(obs.estado)}</span>
    </div>
  `

  return li
}

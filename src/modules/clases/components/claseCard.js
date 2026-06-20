/**
 * Componente: Tarjeta de Clase
 * Reutilizable para mostrar información resumida de una clase
 */

import { escapeHTML, getInitials, formatDate, formatHora, getEstadoBadgeClass, getEstadoLabel, getInstrumentoIcon, calcularDuracion, getConsistentColor } from '../utils/clasesUtils.js'

function formatHorarios(horarios) {
  if (!horarios || horarios.length === 0) return '-'
  return horarios.map(h => {
    const diaCorto = h.dia.charAt(0).toUpperCase() + h.dia.slice(1, 3)
    return `${diaCorto} ${formatHora(h.hora_inicio)}-${formatHora(h.hora_fin)}`
  }).join(', ')
}

export function createClaseCard(clase, showActions = true, onEdit = null, onDelete = null, onView = null) {
  const horarios = clase.horarios || []
  const horariosDisplay = formatHorarios(horarios)

  const card = document.createElement('div')
  card.className = 'card h-100 shadow-sm'
  card.innerHTML = `
    <div class="card-body">
      <div class="d-flex justify-content-between align-items-start mb-2">
        <div class="d-flex gap-2 align-items-start flex-grow-1">
          <div class="avatar bg-body-secondary rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style="width: 40px; height: 40px;">
            <i class="bi ${getInstrumentoIcon(clase.instrumento)}"></i>
          </div>
          <div class="flex-grow-1">
            <h6 class="card-title mb-1" title="${escapeHTML(clase.nombre)}">
              ${escapeHTML(clase.nombre)}
            </h6>
            <small class="text-muted d-block"><i class="bi bi-music-note"></i> ${escapeHTML(clase.instrumento)}</small>
          </div>
        </div>
        <span class="badge bg-${getEstadoBadgeClass(clase.estado)} flex-shrink-0">${getEstadoLabel(clase.estado)}</span>
      </div>

      <hr class="my-2">

      <div class="small text-muted">
        ${clase.maestro_principal_id ? `<div class="mb-1"><i class="bi bi-person-badge"></i> Principal: ${clase.maestro_principal_id.slice(0, 8)}...</div>` : ''}
        ${clase.maestro_suplente_id ? `<div class="mb-1"><i class="bi bi-person-dash"></i> Suplente: ${clase.maestro_suplente_id.slice(0, 8)}...</div>` : ''}
        <div class="mb-1"><i class="bi bi-calendar-week"></i> ${horariosDisplay}</div>
        <div class="mb-1"><i class="bi bi-people"></i> Max: ${clase.max_alumnos || 20} alumnos</div>
      </div>

      <hr class="my-2">

      <div class="d-flex justify-content-between align-items-center">
        <small class="text-muted">
          <i class="bi bi-clock"></i> ${formatDate(clase.created_at)}
        </small>
        ${showActions ? `
          <div class="btn-group btn-group-sm">
            ${onView ? `<button class="btn btn-outline-info view-btn" data-id="${clase.id}" title="Ver detalles"><i class="bi bi-eye"></i></button>` : ''}
            ${onEdit ? `<button class="btn btn-outline-primary edit-btn" data-id="${clase.id}" title="Editar"><i class="bi bi-pencil"></i></button>` : ''}
            ${onDelete ? `<button class="btn btn-outline-danger delete-btn" data-id="${clase.id}" title="Eliminar"><i class="bi bi-trash"></i></button>` : ''}
          </div>
        ` : ''}
      </div>
    </div>
  `

  if (showActions && onView) {
    const viewBtn = card.querySelector('.view-btn')
    if (viewBtn) {
      viewBtn.addEventListener('click', () => onView(clase.id))
    }
  }

  if (showActions && onEdit) {
    const editBtn = card.querySelector('.edit-btn')
    if (editBtn) {
      editBtn.addEventListener('click', () => onEdit(clase.id))
    }
  }

  if (showActions && onDelete) {
    const deleteBtn = card.querySelector('.delete-btn')
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => onDelete(clase.id))
    }
  }

  return card
}

export function createClaseListItem(clase) {
  const horarios = clase.horarios || []
  const horariosDisplay = formatHorarios(horarios)

  const li = document.createElement('li')
  li.className = 'list-group-item'
  li.innerHTML = `
    <div class="d-flex justify-content-between align-items-start">
      <div>
        <h6 class="mb-1">${escapeHTML(clase.nombre)}</h6>
        <p class="mb-1 small text-muted">
          <span class="badge bg-body-tertiary text-body me-2 border">${escapeHTML(clase.instrumento)}</span>
        </p>
        <small class="text-muted">
          <i class="bi bi-clock"></i> ${horariosDisplay}
        </small>
      </div>
      <span class="badge bg-${getEstadoBadgeClass(clase.estado)}">${getEstadoLabel(clase.estado)}</span>
    </div>
  `

  return li
}

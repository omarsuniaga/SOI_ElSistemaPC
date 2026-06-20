/**
 * Componente: Tarjeta de Alumno
 * Reutilizable para mostrar información resumida de un alumno
 */

import { escapeHTML, getInitials, formatDate, getEstadoClass, getEstadoLabel } from '../utils/alumnosUtils.js'
import { calcularEdad } from '../domain/calcularEdad.js'

export function createAlumnoCard(alumno, showActions = true, onEdit = null, onDelete = null) {
  const edad = calcularEdad(alumno.fecha_nacimiento)

  const card = document.createElement('div')
  card.className = 'card h-100 shadow-sm'
  card.innerHTML = `
    <div class="card-body">
      <div class="d-flex justify-content-between align-items-start mb-2">
        <div class="d-flex gap-2 align-items-start flex-grow-1">
          <div class="avatar bg-body-secondary rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style="width: 40px; height: 40px;">
            <strong class="small">${getInitials(alumno.nombre)}</strong>
          </div>
          <div class="flex-grow-1">
            <h6 class="card-title mb-1" title="${escapeHTML(alumno.nombre)}">
              ${escapeHTML(alumno.nombre)}
            </h6>
            ${alumno.instrumento_principal ? `<small class="text-muted d-block"><i class="bi bi-music-note"></i> ${escapeHTML(alumno.instrumento_principal)}</small>` : ''}
          </div>
        </div>
        <span class="badge ${getEstadoClass(alumno.is_active)} flex-shrink-0">${getEstadoLabel(alumno.is_active)}</span>
      </div>

      <hr class="my-2">

      <div class="small text-muted">
        ${alumno.email ? `<div class="mb-1"><i class="bi bi-envelope"></i> ${escapeHTML(alumno.email)}</div>` : ''}
        ${alumno.cedula ? `<div class="mb-1"><i class="bi bi-card-text"></i> ${escapeHTML(alumno.cedula)}</div>` : ''}
        ${edad ? `<div class="mb-1"><i class="bi bi-calendar"></i> ${edad} años</div>` : ''}
        ${alumno.familiar_nombre ? `<div><i class="bi bi-person-check"></i> ${escapeHTML(alumno.familiar_nombre)}</div>` : ''}
      </div>

      <hr class="my-2">

      <div class="d-flex justify-content-between align-items-center">
        <small class="text-muted">
          <i class="bi bi-clock"></i> ${formatDate(alumno.created_at)}
        </small>
        ${showActions ? `
          <div class="btn-group btn-group-sm">
            ${onEdit ? `<button class="btn btn-outline-primary edit-btn" data-id="${alumno.id}" title="Editar"><i class="bi bi-pencil"></i></button>` : ''}
            ${onDelete ? `<button class="btn btn-outline-danger delete-btn" data-id="${alumno.id}" title="Eliminar"><i class="bi bi-trash"></i></button>` : ''}
          </div>
        ` : ''}
      </div>
    </div>
  `

  if (showActions && onEdit) {
    const editBtn = card.querySelector('.edit-btn')
    if (editBtn) {
      editBtn.addEventListener('click', () => onEdit(alumno.id))
    }
  }

  if (showActions && onDelete) {
    const deleteBtn = card.querySelector('.delete-btn')
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => onDelete(alumno.id))
    }
  }

  return card
}

export function createAlumnoListItem(alumno) {
  const edad = calcularEdad(alumno.fecha_nacimiento)

  const li = document.createElement('li')
  li.className = 'list-group-item'
  li.innerHTML = `
    <div class="d-flex justify-content-between align-items-start">
      <div>
        <h6 class="mb-1">${escapeHTML(alumno.nombre)}</h6>
        <p class="mb-1 small text-muted">
          ${alumno.cedula ? `<span class="badge bg-body-tertiary text-body me-2 border">${escapeHTML(alumno.cedula)}</span>` : ''}
          ${edad ? `<span class="badge bg-body-tertiary text-body border">${edad} años</span>` : ''}
        </p>
        ${alumno.email ? `<small class="text-muted"><a href="mailto:${escapeHTML(alumno.email)}">${escapeHTML(alumno.email)}</a></small>` : ''}
      </div>
      <span class="badge ${getEstadoClass(alumno.is_active)}">${getEstadoLabel(alumno.is_active)}</span>
    </div>
  `

  return li
}

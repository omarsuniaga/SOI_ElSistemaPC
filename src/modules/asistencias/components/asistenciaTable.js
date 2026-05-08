/**
 * Componente: Tabla de Asistencias
 */

import { escapeHTML, getInitials, getEstadoClass, getEstadoLabel, getEstadoIcon } from '../utils/asistenciasUtils.js'

/**
 * Renderiza las filas de la tabla de asistencias
 * @param {Array} asistencias
 * @param {Function} onEdit
 * @param {Function} onDelete
 * @param {Function} onJustify
 * @returns {string}
 */
export function renderAsistenciaTable(asistencias, onEdit, onDelete, onJustify) {
  if (!asistencias || !asistencias.length) {
    return '<tr><td colspan="7" class="text-center text-muted py-4">No hay asistencias registradas</td></tr>'
  }

  return asistencias.map(a => renderAsistenciaRow(a, onEdit, onDelete, onJustify)).join('')
}

/**
 * Renderiza una fila individual de asistencia
 * @param {Object} asistencia
 * @param {Function} onEdit
 * @param {Function} onDelete
 * @param {Function} onJustify
 * @returns {string}
 */
export function renderAsistenciaRow(asistencia, onEdit, onDelete, onJustify) {
  const studentName = asistencia.students?.name || 'Sin alumno'
  const claseName = asistencia.clases?.nombre || 'Sin clase'
  const estadoClass = getEstadoClass(asistencia.estado)
  const estadoLabel = getEstadoLabel(asistencia.estado)
  const estadoIcon = getEstadoIcon(asistencia.estado)

  return `
    <tr data-id="${asistencia.id}">
      <td>
        <small>${formatDateShort(asistencia.fecha)}</small>
      </td>
      <td>
        <small>${escapeHTML(claseName)}</small>
      </td>
      <td>
        <div class="d-flex align-items-center gap-2">
          <div class="avatar bg-light rounded-circle d-flex align-items-center justify-content-center" style="width: 28px; height: 28px;">
            <small class="fw-bold">${getInitials(studentName)}</small>
          </div>
          <small>${escapeHTML(studentName)}</small>
        </div>
      </td>
      <td>
        <span class="badge ${estadoClass}">
          <i class="bi ${estadoIcon}"></i> ${estadoLabel}
        </span>
        ${asistencia.justificacion_texto ? '<i class="bi bi-paperclip text-warning ms-1" title="Justificado"></i>' : ''}
      </td>
      <td>
        <small class="text-muted">${asistencia.justificacion_texto ? truncate(asistencia.justificacion_texto, 30) : '-'}</small>
      </td>
      <td class="text-end">
        <div class="btn-group btn-group-sm">
          <button class="btn btn-outline-info" data-action="view" data-id="${asistencia.id}" title="Ver detalles">
            <i class="bi bi-eye"></i>
          </button>
          <button class="btn btn-outline-primary" data-action="edit" data-id="${asistencia.id}" title="Editar">
            <i class="bi bi-pencil-square"></i>
          </button>
          ${asistencia.estado === 'A' ? `
            <button class="btn btn-outline-warning" data-action="justify" data-id="${asistencia.id}" title="Justificar ausencia">
              <i class="bi bi-file-earmark-text"></i>
            </button>
          ` : ''}
          <button class="btn btn-outline-danger" data-action="delete" data-id="${asistencia.id}" title="Eliminar">
            <i class="bi bi-trash3"></i>
          </button>
        </div>
      </td>
    </tr>
  `
}

function formatDateShort(dateStr) {
  if (!dateStr) return '-'
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}

function truncate(str, len) {
  if (!str) return ''
  return str.length > len ? str.substring(0, len) + '...' : str
}

import { escapeHTML, getInitials, formatDate, formatCalificacion, getCalificacionColor, getCalificacionLabel, getTipoLabel, getTipoBadgeClass, getEstadoClass, getEstadoLabel } from '../utils/progresosUtils.js'

export function renderProgresosTable(progresos, alumnos = [], clases = []) {
  if (!progresos.length) {
    return `
      <table class="table table-hover">
        <thead class="table-light">
          <tr>
            <th>Fecha</th>
            <th>Alumno</th>
            <th>Clase</th>
            <th>Tipo</th>
            <th>Calificacion</th>
            <th>Estado</th>
            <th class="text-end">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colspan="7" class="text-center text-muted py-4">No hay progresos registrados</td>
          </tr>
        </tbody>
      </table>
    `
  }

  const rows = progresos.map(p => renderProgresoRow(p, alumnos, clases)).join('')

  return `
    <table class="table table-hover" id="progresosTable">
      <thead class="table-light">
        <tr>
          <th>Fecha</th>
          <th>Alumno</th>
          <th>Clase</th>
          <th>Tipo</th>
          <th>Calificacion</th>
          <th>Estado</th>
          <th class="text-end">Acciones</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `
}

export function renderProgresoRow(progreso, alumnos = [], clases = []) {
  const alumno = alumnos.find(a => a.id === progreso.alumno_id)
  const clase = clases.find(c => c.id === progreso.clase_id)
  const alumnoName = alumno ? (alumno.name || alumno.nombre || 'Sin nombre') : 'Sin alumno'
  const claseName = clase ? (clase.nombre || 'Sin nombre') : 'Sin clase'

  return `
    <tr data-id="${progreso.id}">
      <td><small>${progreso.fecha_evaluacion ? formatDate(progreso.fecha_evaluacion) : '-'}</small></td>
      <td>
        <div class="d-flex align-items-center gap-2">
          <div class="avatar bg-light rounded-circle d-flex align-items-center justify-content-center" style="width: 28px; height: 28px;">
            <small class="fw-bold" style="font-size: 0.65rem;">${getInitials(alumnoName)}</small>
          </div>
          <small>${escapeHTML(alumnoName)}</small>
        </div>
      </td>
      <td><small>${escapeHTML(claseName)}</small></td>
      <td><span class="badge ${getTipoBadgeClass(progreso.tipo_evaluacion)}">${getTipoLabel(progreso.tipo_evaluacion)}</span></td>
      <td>
        <span class="badge bg-${getCalificacionColor(progreso.calificacion)}">
          ${formatCalificacion(progreso.calificacion)}
        </span>
        <div class="small text-muted">${getCalificacionLabel(progreso.calificacion)}</div>
      </td>
      <td><span class="${getEstadoClass(progreso.estado)} small">${getEstadoLabel(progreso.estado)}</span></td>
      <td class="text-end">
        <button class="btn btn-sm btn-outline-info" data-action="view" data-id="${progreso.id}" title="Ver detalles">
          <i class="bi bi-eye"></i>
        </button>
        <button class="btn btn-sm btn-outline-primary" data-action="edit" data-id="${progreso.id}" title="Editar">
          <i class="bi bi-pencil-square"></i>
        </button>
        <button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${progreso.id}" title="Eliminar">
          <i class="bi bi-trash3"></i>
        </button>
      </td>
    </tr>
  `
}

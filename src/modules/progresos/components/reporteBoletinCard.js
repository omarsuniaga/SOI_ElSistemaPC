import { escapeHTML, getInitials, formatCalificacion, getCalificacionColor, getCalificacionLabel, getTipoLabel, getTipoBadgeClass, calcularPromedio, getRiesgo } from '../utils/progresosUtils.js'

export function renderBoletinCard(alumno, progresos) {
  const promedio = calcularPromedio(progresos)
  const enRiesgo = promedio !== null && getRiesgo(promedio)
  const nombre = alumno.name || alumno.nombre || 'Sin nombre'
  const seccion = alumno.section || 'Sin seccion'

  const evaluationsHTML = progresos.length
    ? progresos.map(p => `
        <div class="d-flex justify-content-between align-items-center py-2 ${p !== progresos[progresos.length - 1] ? 'border-bottom' : ''}">
          <div>
            <span class="badge ${getTipoBadgeClass(p.tipo_evaluacion)} me-2">${getTipoLabel(p.tipo_evaluacion)}</span>
            <small class="text-muted">${p.fecha_evaluacion ? new Date(p.fecha_evaluacion).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }) : 'Sin fecha'}</small>
          </div>
          <div class="text-end">
            <span class="badge bg-${getCalificacionColor(p.calificacion)} fs-6">${formatCalificacion(p.calificacion)}</span>
            <div class="small text-muted">${getCalificacionLabel(p.calificacion)}</div>
          </div>
        </div>
      `).join('')
    : '<p class="text-muted text-center py-3 mb-0">Sin evaluaciones registradas</p>'

  return `
    <div class="card border-0 shadow-sm mb-3">
      <div class="card-header ${enRiesgo ? 'bg-danger' : 'bg-primary'} text-white">
        <div class="d-flex align-items-center gap-3">
          <div class="avatar bg-white bg-opacity-25 rounded-circle d-flex align-items-center justify-content-center" style="width: 48px; height: 48px;">
            <strong class="fs-5">${getInitials(nombre)}</strong>
          </div>
          <div class="flex-grow-1">
            <h5 class="mb-0">${escapeHTML(nombre)}</h5>
            <small>${escapeHTML(seccion)}</small>
          </div>
          ${enRiesgo
            ? '<span class="badge bg-white text-danger"><i class="bi bi-exclamation-triangle"></i> En Riesgo</span>'
            : '<span class="badge bg-white text-success"><i class="bi bi-check-circle"></i> OK</span>'
          }
        </div>
      </div>
      <div class="card-body">
        <div class="row mb-3">
          <div class="col-4 text-center">
            <div class="fs-4 fw-bold text-primary">${progresos.length}</div>
            <small class="text-muted">Evaluaciones</small>
          </div>
          <div class="col-4 text-center">
            <div class="fs-4 fw-bold ${promedio !== null ? 'text-' + getCalificacionColor(promedio) : 'text-muted'}">
              ${promedio !== null ? formatCalificacion(promedio) : 'N/A'}
            </div>
            <small class="text-muted">Promedio</small>
          </div>
          <div class="col-4 text-center">
            <div class="fs-4 fw-bold ${enRiesgo ? 'text-danger' : 'text-success'}">
              ${enRiesgo ? '<i class="bi bi-exclamation-triangle-fill"></i>' : '<i class="bi bi-check-circle-fill"></i>'}
            </div>
            <small class="text-muted">Estado</small>
          </div>
        </div>

        <h6 class="fw-bold mb-2">Evaluaciones</h6>
        ${evaluationsHTML}
      </div>
    </div>
  `
}

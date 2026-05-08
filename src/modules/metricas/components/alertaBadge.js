const COLOR_MAP = {
  rojo: 'danger',
  naranja: 'warning',
  amarillo: 'info',
}

const ICON_MAP = {
  ausencias_consecutivas: '🚨',
  obs_alta_sin_seguimiento: '⚠️',
  caida_calificacion: '📉',
  sin_evaluacion: '📋',
  obs_media_sin_seguimiento: '🔔',
}

const TIPO_LABEL = {
  ausencias_consecutivas: 'Ausencias Consecutivas',
  obs_alta_sin_seguimiento: 'Observación Alta Sin Seguimiento',
  caida_calificacion: 'Caída de Calificación',
  sin_evaluacion: 'Sin Evaluación',
  obs_media_sin_seguimiento: 'Observación Media Sin Seguimiento',
}

function escapeHtml(str) {
  if (str == null) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export function createAlertaBadge(color) {
  const bsClass = COLOR_MAP[color] || 'secondary'
  return `<span class="badge bg-${bsClass}">${escapeHtml(color)}</span>`
}

export function createAlertaIcon(tipo) {
  return ICON_MAP[tipo] || '⚠️'
}

export function createAlertaRow(alerta) {
  const {
    tipo_alerta,
    color,
    alumno_id,
    alumno_nombre,
    instrumento_principal,
    maestro_nombre,
    descripcion,
    valor_numerico,
    fecha_referencia,
  } = alerta

  const icon = createAlertaIcon(tipo_alerta)
  const badge = createAlertaBadge(color)
  const tipoLabel = TIPO_LABEL[tipo_alerta] || escapeHtml(tipo_alerta)

  const diasValor = valor_numerico != null ? `${valor_numerico} días` : '-'
  const fecha = fecha_referencia ? new Date(fecha_referencia).toLocaleDateString('es-DO') : '-'
  const maestro = maestro_nombre ? escapeHtml(maestro_nombre) : '-'

  return `
    <tr class="alerta-row" data-alumno-id="${escapeHtml(alumno_id)}" style="cursor: pointer;">
      <td class="align-middle">
        <span class="me-2">${icon}</span>
        <span class="fw-semibold">${tipoLabel}</span>
        <span class="ms-2">${badge}</span>
      </td>
      <td class="align-middle">${escapeHtml(alumno_nombre) || '-'}</td>
      <td class="align-middle">${escapeHtml(instrumento_principal) || '-'}</td>
      <td class="align-middle">${maestro}</td>
      <td class="align-middle text-truncate" style="max-width: 200px;" title="${escapeHtml(descripcion)}">
        ${escapeHtml(descripcion) || '-'}
      </td>
      <td class="align-middle">${diasValor}</td>
      <td class="align-middle">${fecha}</td>
    </tr>
  `
}
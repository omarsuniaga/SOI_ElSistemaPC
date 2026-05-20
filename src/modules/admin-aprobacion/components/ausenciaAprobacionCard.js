function escHTML(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatDateRange(ausencia) {
  if (ausencia.fecha_inicio === ausencia.fecha_fin) return ausencia.fecha_inicio;
  return `${ausencia.fecha_inicio} al ${ausencia.fecha_fin}`;
}

function getTeacherName(ausencia) {
  return ausencia.maestros?.nombre_completo || ausencia.maestro_nombre || 'Maestro no especificado';
}

function getCoverageSummary(ausencia) {
  if (ausencia.clase_emergente?.fecha) {
    return `Reprogramada para ${ausencia.clase_emergente.fecha}${ausencia.clase_emergente.hora ? ` a las ${ausencia.clase_emergente.hora}` : ''}`;
  }
  if (ausencia.maestro_suplente_id || ausencia.suplente_nombre) {
    return `Suplente: ${ausencia.suplente_nombre || ausencia.maestro_suplente_id}`;
  }
  return 'Pendiente de coordinación';
}

export function createAusenciaAprobacionCard(ausencia, { onApprove = () => {}, onReject = () => {} } = {}) {
  const card = document.createElement('article');
  card.className = 'ausencia-approval-card';
  card.dataset.ausenciaCard = ausencia.id;

  const affectedCount = Array.isArray(ausencia.clases_afectadas) ? ausencia.clases_afectadas.length : 0;

  card.innerHTML = `
    <div class="ausencia-card-header">
      <div>
        <h3>${escHTML(getTeacherName(ausencia))}</h3>
        <p>${escHTML(formatDateRange(ausencia))}</p>
      </div>
      <span class="badge bg-warning text-dark">${escHTML(ausencia.estado || 'pendiente')}</span>
    </div>

    <dl class="ausencia-card-details">
      <div><dt>Tipo</dt><dd>${escHTML(ausencia.tipo_ausencia)}</dd></div>
      <div><dt>Urgencia</dt><dd>${escHTML(ausencia.urgencia)}</dd></div>
      <div><dt>Clases afectadas</dt><dd>Clases afectadas: ${affectedCount}</dd></div>
      <div><dt>Cobertura</dt><dd>${escHTML(getCoverageSummary(ausencia))}</dd></div>
    </dl>

    <p class="ausencia-card-motivo">${escHTML(ausencia.motivo || 'Sin motivo especificado')}</p>

    <label class="form-label">
      Notas de decisión
      <textarea class="form-control" data-decision-notes rows="2" placeholder="Agregá una nota para historial"></textarea>
    </label>

    <div class="ausencia-card-actions">
      <button type="button" class="btn btn-success btn-sm" data-action="approve">
        <i class="bi bi-check-circle"></i> Aprobar
      </button>
      <button type="button" class="btn btn-danger btn-sm" data-action="reject">
        <i class="bi bi-x-circle"></i> Rechazar
      </button>
    </div>
  `;

  const getNotes = () => card.querySelector('[data-decision-notes]')?.value?.trim() || '';
  card.querySelector('[data-action="approve"]').addEventListener('click', () => onApprove(ausencia.id, getNotes()));
  card.querySelector('[data-action="reject"]').addEventListener('click', () => onReject(ausencia.id, getNotes()));

  return card;
}

import { salonesUtils } from '../utils/salonesUtils.js';

export function createSalonListItem(salon, onEdit, onDelete) {
  const tr = document.createElement('tr');
  const eqHtml = (salon.equipamiento || []).map(eq => `<span class="badge bg-info text-dark me-1">${eq}</span>`).join('');
  
  tr.innerHTML = `
    <td><strong>${salonesUtils.escapeHTML(salon.codigo_salon || '-')}</strong></td>
    <td>${salonesUtils.escapeHTML(salon.nombre)}</td>
    <td>${salonesUtils.formatCapacidad(salon.capacidad)}</td>
    <td>
      ${salonesUtils.escapeHTML(salon.ubicacion)}<br>
      <small class="text-muted"><i class="bi bi-building"></i> ${salonesUtils.getPisoLabel(salon.piso)}</small>
    </td>
    <td><span class="badge bg-${salonesUtils.getCondicionColor(salon.condicion_fisica)}">${salonesUtils.getCondicionLabel(salon.condicion_fisica)}</span></td>
    <td>${eqHtml || '<span class="text-muted">-</span>'}</td>
    <td><span class="badge bg-${salonesUtils.getStatusColor(salon.is_active)}">${salonesUtils.getStatusLabel(salon.is_active)}</span></td>
    <td>
      <div class="btn-group btn-group-sm">
        <button class="btn btn-outline-primary btn-edit" title="Editar"><i class="bi bi-pencil"></i></button>
        <button class="btn btn-outline-danger btn-delete" title="Inactivar"><i class="bi bi-trash"></i></button>
      </div>
    </td>
  `;

  tr.querySelector('.btn-edit').addEventListener('click', () => onEdit(salon));
  tr.querySelector('.btn-delete').addEventListener('click', () => onDelete(salon));

  return tr;
}

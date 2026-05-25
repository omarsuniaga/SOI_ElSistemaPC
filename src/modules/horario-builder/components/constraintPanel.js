import { PERIODOS } from '../models/scheduleConstraints.model.js';

/**
 * Constraint Panel component.
 * Allows configuring the engine variables (period, default class duration, gap)
 * and lists the pending (unscheduled) classes.
 */
export function createConstraintPanel({
  classes = [],
  config = {}
}) {
  const pendingClasses = classes.filter(c => !c.horarios || c.horarios.length === 0);

  const pendingListHtml = pendingClasses.length > 0
    ? pendingClasses.map(cl => `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; border: 1px dashed var(--hb-border); border-radius: 8px; margin-bottom: 6px; background: var(--hb-gray-100); font-size: 0.8rem;">
          <div style="min-width: 0; flex: 1; padding-right: 8px;">
            <div style="font-weight: 650; text-overflow: ellipsis; overflow: hidden; white-space: nowrap; color: var(--hb-text);">${cl.nombre}</div>
            <div style="font-size: 0.7rem; color: var(--hb-text-muted);">🎻 Especialidad: ${cl.instrumento}</div>
          </div>
          <span class="badge bg-secondary-subtle text-secondary" style="font-size: 0.65rem; border-radius: 6px; font-weight: 600; padding: 4px 6px;">
            👤 ${cl.total_alumnos} alum.
          </span>
        </div>
      `).join('')
    : `
      <div style="text-align: center; padding: 1.5rem; border: 1px dashed var(--hb-border); border-radius: 12px; background: var(--hb-success-light); color: var(--hb-success); font-size: 0.85rem; font-weight: 650;">
        <i class="bi bi-check-circle-fill" style="font-size: 1.2rem; display: block; margin-bottom: 4px;"></i>
        ¡Todas las clases ya tienen horarios!
      </div>
    `;

  return `
    <div class="hb-card" style="padding: 1.25rem;">
      <h3 class="hb-card-title">
        <i class="bi bi-sliders"></i>
        <span>Configuración del Motor</span>
      </h3>
      
      <div class="hb-form-group">
        <label for="hb-input-periodo">Período Académico</label>
        <select id="hb-input-periodo" class="hb-form-control">
          ${PERIODOS.map(p => `<option value="${p.id}" ${config.periodo === p.id ? 'selected' : ''}>${p.nombre}</option>`).join('')}
        </select>
      </div>

      <div class="hb-form-group">
        <label for="hb-input-duracion">Duración de Clases</label>
        <select id="hb-input-duracion" class="hb-form-control">
          <option value="45" ${config.duracionBloque === 45 ? 'selected' : ''}>45 minutos</option>
          <option value="60" ${config.duracionBloque === 60 || !config.duracionBloque ? 'selected' : ''}>60 minutos</option>
          <option value="90" ${config.duracionBloque === 90 ? 'selected' : ''}>90 minutos</option>
        </select>
      </div>

      <div class="hb-form-group" style="margin-bottom: 1.5rem;">
        <label for="hb-input-gap">Gap entre Clases (Descanso)</label>
        <select id="hb-input-gap" class="hb-form-control">
          <option value="0" ${config.gapMinimo === 0 ? 'selected' : ''}>Sin descanso (0m)</option>
          <option value="15" ${config.gapMinimo === 15 || !config.gapMinimo ? 'selected' : ''}>15 minutos</option>
          <option value="30" ${config.gapMinimo === 30 ? 'selected' : ''}>30 minutos</option>
        </select>
      </div>

      <h4 style="font-size: 0.85rem; font-weight: 700; color: var(--hb-text-muted); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">
        Clases Sin Horario Asignado (${pendingClasses.length})
      </h4>
      
      <div class="hb-pending-classes-list" style="max-height: 200px; overflow-y: auto; margin-bottom: 1.5rem; padding-right: 4px;">
        ${pendingListHtml}
      </div>

      <button id="hb-btn-generate" class="hb-btn hb-btn-primary" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px; font-size: 0.95rem; border-radius: 12px; box-shadow: 0 4px 14px rgba(99, 102, 241, 0.3);">
        <i class="bi bi-cpu-fill" style="font-size: 1.1rem;"></i>
        <span>Optimizar Horario</span>
      </button>
    </div>
  `;
}
